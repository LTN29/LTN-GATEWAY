import {
  chmod,
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { config } from "./config.mjs";
import { jsonLog, redactSecrets } from "./utils.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emptyStore() {
  return {
    version: 1,
    codex_daily_usage: {}
  };
}

// Mỗi request Codex = 1 lần giữ chỗ + 1 lần xác nhận. Trước đây mỗi lần là: khoá file → đọc + parse cả file (vài trăm KB –
// 1 MB khi đủ người × 30 ngày) → ghi lại cả file, nối đuôi nhau cho mọi người dùng → giờ cao điểm request phải xếp hàng
// hàng giây trước khi được gửi đi. Giờ: (1) gộp các giao dịch đang chờ vào 1 lần khoá + 1 lần ghi, (2) giữ bản đã đọc
// trong bộ nhớ, chỉ đọc lại khi file bị nơi khác sửa (khác thời điểm sửa / kích thước), (3) ghi JSON gọn (không thụt lề).
const pendingTransactions = [];
let draining = false;
let cached = null; // { path, mtimeMs, size, store }
const BATCH_MAX = 64;

async function readStore(path) {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed.codex_daily_usage || typeof parsed.codex_daily_usage !== "object") {
      const backupPath = `${path}.corrupt-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}`;
      try {
        await copyFile(path, backupPath);
      } catch (backupError) {
        jsonLog("codex_usage_corrupt_backup_failed", {
          error: redactSecrets(backupError?.message || String(backupError))
        });
      }
      jsonLog("codex_usage_corrupt", {
        backupPath,
        error: "Usage store schema không hợp lệ"
      });
      const wrapped = new Error(
        `Usage store Codex sai schema. Đã backup tại ${backupPath}; không reset usage tự động.`
      );
      wrapped.code = "CODEX_USAGE_INVALID_SCHEMA";
      throw wrapped;
    }
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return emptyStore();
    if (error instanceof SyntaxError) {
      const backupPath = `${path}.corrupt-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}`;
      try {
        await copyFile(path, backupPath);
      } catch (backupError) {
        jsonLog("codex_usage_corrupt_backup_failed", {
          error: redactSecrets(backupError?.message || String(backupError))
        });
      }
      jsonLog("codex_usage_corrupt", {
        backupPath,
        error: redactSecrets(error.message)
      });
      const wrapped = new Error(
        `Usage store Codex bị hỏng JSON. Đã backup tại ${backupPath}; không reset usage tự động.`
      );
      wrapped.cause = error;
      throw wrapped;
    }
    throw error;
  }
}

async function loadStore(path) {
  try {
    const info = await stat(path);
    if (cached && cached.path === path && cached.mtimeMs === info.mtimeMs && cached.size === info.size) {
      return cached.store;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  cached = null;
  return readStore(path);
}

async function saveStore(path, store) {
  cached = null;
  await writeStore(path, store);
  try {
    const info = await stat(path);
    cached = { path, mtimeMs: info.mtimeMs, size: info.size, store };
  } catch {
    cached = null;
  }
}

async function writeStore(path, store) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(store) + "\n", "utf8");
  if (process.platform !== "win32") {
    await chmod(tmp, 0o600);
    await rename(tmp, path);
    await chmod(path, 0o600);
    return;
  }

  // Windows: đổi tên (thay file cũ) nhanh hơn chép cả file; bị chặn tạm (phần mềm diệt virus đang đọc…) thì chép như cũ
  try {
    await rename(tmp, path);
    return;
  } catch (error) {
    if (!["EPERM", "EBUSY", "EACCES"].includes(error?.code)) throw error;
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await copyFile(tmp, path);
      await rm(tmp, { force: true });
      return;
    } catch (error) {
      if (!["EPERM", "EBUSY", "EACCES"].includes(error?.code) || attempt === 4) {
        throw error;
      }
      await sleep(50 * (attempt + 1));
    }
  }
}

function reservationExpired(reservation, nowMs) {
  const expiresMs = Date.parse(reservation?.expires_at || "");
  return !Number.isFinite(expiresMs) || expiresMs <= nowMs;
}

function normalizeRecord(record, nowMs) {
  const reservations = Array.isArray(record.reservations)
    ? record.reservations.filter((reservation) =>
        !reservationExpired(reservation, nowMs)
      )
    : [];

  record.reservations = reservations;
  record.reserved_request_count = reservations.length;
  return record;
}

async function recoverStaleLock(lockPath) {
  try {
    const info = await stat(lockPath);
    const ageMs = Date.now() - info.mtimeMs;
    if (ageMs <= config.codexUsageLockStaleMs) return false;
    await rm(lockPath, { recursive: true, force: true });
    jsonLog("codex_usage_stale_lock_recovered", {
      ageMs: Math.round(ageMs)
    });
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return true;
    throw error;
  }
}

async function withStoreFileLock(task) {
  const lockPath = `${config.codexUsageFile}.lock`;
  const deadline = Date.now() + config.codexUsageLockTimeoutMs;
  await mkdir(dirname(config.codexUsageFile), { recursive: true });

  while (true) {
    try {
      await mkdir(lockPath, { recursive: false });
      await writeFile(
        `${lockPath}/owner.json`,
        JSON.stringify({
          pid: process.pid,
          created_at: new Date().toISOString()
        }) + "\n",
        "utf8"
      );
      break;
    } catch (error) {
      if (error?.code === "EEXIST" && await recoverStaleLock(lockPath)) {
        continue;
      }
      if (error?.code !== "EEXIST" || Date.now() > deadline) {
        throw new Error("Không thể khóa usage store Codex");
      }
      await sleep(25);
    }
  }

  try {
    const store = await loadStore(config.codexUsageFile);
    const result = await task(store);
    await saveStore(config.codexUsageFile, store);
    return result;
  } catch (error) {
    cached = null;
    throw error;
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

// gộp nhóm: giao dịch nào tới trong lúc đang ghi thì chờ, rồi cả nhóm chạy chung 1 lần khoá + 1 lần ghi.
// Lời hứa của từng giao dịch chỉ xong SAU khi file đã ghi (giữ nguyên đảm bảo cũ).
function withStoreLock(task) {
  return new Promise((resolve, reject) => {
    pendingTransactions.push({ task, resolve, reject });
    drainTransactions();
  });
}

async function drainTransactions() {
  if (draining) return;
  draining = true;
  try {
    // chờ hết lượt sự kiện hiện tại để gom các request tới cùng lúc vào chung 1 nhóm
    await new Promise((resolve) => setImmediate(resolve));
    while (pendingTransactions.length) {
      const batch = pendingTransactions.splice(0, BATCH_MAX);
      const results = [];
      try {
        await withStoreFileLock(async (store) => {
          for (const transaction of batch) {
            try {
              results.push({ ok: true, value: await transaction.task(store) });
            } catch (error) {
              results.push({ ok: false, error });
            }
          }
        });
        batch.forEach((transaction, index) => {
          const result = results[index];
          if (result.ok) transaction.resolve(result.value);
          else transaction.reject(result.error);
        });
      } catch (error) {
        batch.forEach((transaction) => transaction.reject(error));
      }
    }
  } finally {
    draining = false;
  }
}

function recordKey({ teamCode, usageDate, usageScope, clientIdHash, principalType, userId }) {
  if (principalType === "user") {
    return `${teamCode}|user|${userId}|${usageDate}`;
  }
  if (usageScope === "team") {
    return `${teamCode}|team|${usageDate}`;
  }
  return `${teamCode}|client|${clientIdHash}|${usageDate}`;
}

function normalizedClientIdHash(clientIdHash, usageScope, principalType) {
  if (usageScope === "team") return "";
  if (principalType === "user" && !clientIdHash) return "";
  const value = String(clientIdHash || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(value)) {
    throw new Error("clientIdHash phải là SHA-256 hex và không được là client ID thô");
  }
  return value;
}

function cleanupOldRecords(store, today) {
  const retentionMs = config.codexUsageRetentionDays * 24 * 60 * 60 * 1000;
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const nowMs = Date.now();
  if (!Number.isFinite(todayMs)) return;

  for (const [key, record] of Object.entries(store.codex_daily_usage)) {
    normalizeRecord(record, nowMs);
    const dateMs = Date.parse(`${record.usage_date}T00:00:00Z`);
    if (Number.isFinite(dateMs) && todayMs - dateMs > retentionMs) {
      delete store.codex_daily_usage[key];
    }
  }
}

export async function reserveDailyUsageSlot({
  teamCode,
  principalType = "team",
  userId = null,
  clientIdHash,
  usageDate,
  usageScope,
  premiumLimit
}) {
  return withStoreLock(async (store) => {
    cleanupOldRecords(store, usageDate);
    const safeClientIdHash = normalizedClientIdHash(clientIdHash, usageScope, principalType);
    const safeUserId = userId ? String(userId).trim() : null;
    if (principalType === "user" && !/^[a-z0-9][a-z0-9._-]{1,63}$/.test(safeUserId || "")) {
      throw new Error("userId không hợp lệ cho usage store");
    }
    const key = recordKey({
      teamCode,
      clientIdHash: safeClientIdHash,
      usageDate,
      usageScope,
      principalType,
      userId: safeUserId
    });
    const record = store.codex_daily_usage[key] || {
      team_code: teamCode,
      principal_type: principalType,
      user_id: safeUserId,
      client_id_hash: safeClientIdHash,
      usage_scope: usageScope,
      usage_date: usageDate,
      successful_request_count: 0,
      reserved_request_count: 0,
      reservations: [],
      updated_at: new Date().toISOString()
    };
    normalizeRecord(record, Date.now());

    const requestNumber =
      Number(record.successful_request_count || 0) +
      record.reservations.length +
      1;

    const reservationId = randomUUID();
    record.reservations.push({
      id: reservationId,
      expires_at: new Date(
        Date.now() + config.codexUsageReservationTtlMs
      ).toISOString()
    });
    record.reserved_request_count = record.reservations.length;
    record.updated_at = new Date().toISOString();
    store.codex_daily_usage[key] = record;

    return {
      key,
      reservationId,
      requestNumber,
      routeTier: requestNumber <= premiumLimit ? "premium" : "free"
    };
  });
}

export async function confirmDailyUsageSlot(key, reservationId) {
  if (!key) return;
  await withStoreLock(async (store) => {
    const record = store.codex_daily_usage[key];
    if (!record) return;
    normalizeRecord(record, Date.now());
    const reservationIndex = record.reservations.findIndex(
      (reservation) => reservation.id === reservationId
    );
    if (reservationIndex === -1) return;
    record.reservations.splice(reservationIndex, 1);
    record.reserved_request_count = record.reservations.length;
    record.successful_request_count =
      Number(record.successful_request_count || 0) + 1;
    record.updated_at = new Date().toISOString();
  });
}

export async function releaseDailyUsageSlot(key, reservationId) {
  if (!key) return;
  await withStoreLock(async (store) => {
    const record = store.codex_daily_usage[key];
    if (!record) return;
    normalizeRecord(record, Date.now());
    record.reservations = record.reservations.filter(
      (reservation) => reservation.id !== reservationId
    );
    record.reserved_request_count = record.reservations.length;
    record.updated_at = new Date().toISOString();
  });
}
