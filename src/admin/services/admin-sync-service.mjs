import { chmod, copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { config } from "../../config.mjs";
import { memoryPathFromRelative } from "../../memory-governance.mjs";
import { syncMemoryFile } from "../../onedrive.mjs";
import { redactSecrets, sha256 } from "../../utils.mjs";

async function sleep(ms) {
  await new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function chmodPrivate(path) {
  if (process.platform !== "win32") await chmod(path, 0o600);
}

async function withOutboxLock(fn) {
  const lockPath = `${config.memorySyncOutboxFile}.lock`;
  const started = Date.now();
  const timeoutMs = 5000;
  const staleMs = 120000;
  await mkdir(dirname(config.memorySyncOutboxFile), { recursive: true });
  while (true) {
    try {
      await mkdir(lockPath, { recursive: false });
      await writeFile(resolve(lockPath, "owner.json"), JSON.stringify({ pid: process.pid, createdAtMs: Date.now() }), "utf8");
      try {
        return await fn();
      } finally {
        await rm(lockPath, { recursive: true, force: true });
      }
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      try {
        const owner = JSON.parse(await readFile(resolve(lockPath, "owner.json"), "utf8"));
        if (Date.now() - Number(owner.createdAtMs || 0) > staleMs) {
          await rm(lockPath, { recursive: true, force: true });
          continue;
        }
      } catch {
        await rm(lockPath, { recursive: true, force: true });
        continue;
      }
      if (Date.now() - started > timeoutMs) throw Object.assign(new Error("Không thể khóa sync outbox."), { statusCode: 409, code: "LOCK_TIMEOUT" });
      await sleep(50);
    }
  }
}

async function readOutbox() {
  try {
    return (await readFile(config.memorySyncOutboxFile, "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function writeOutbox(items) {
  await mkdir(dirname(config.memorySyncOutboxFile), { recursive: true });
  try {
    await copyFile(config.memorySyncOutboxFile, `${config.memorySyncOutboxFile}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const tmp = `${config.memorySyncOutboxFile}.${process.pid}.${Date.now()}.admin.tmp`;
  await writeFile(tmp, items.map((item) => JSON.stringify(item)).join("\n") + "\n", "utf8");
  await chmodPrivate(tmp);
  await rename(tmp, config.memorySyncOutboxFile);
  await chmodPrivate(config.memorySyncOutboxFile);
}

export async function listSyncOutbox({ status = "" } = {}) {
  return (await readOutbox()).filter((item) => !status || item.status === status);
}

async function retryExistingItem(items, item) {
  const localPath = String(item.localPath || "").replace(/^memory[\\/]/, "");
  item.attempts = Number(item.attempts || 0) + 1;
  item.updatedAt = new Date().toISOString();
  try {
    const content = await readFile(memoryPathFromRelative(localPath), "utf8");
    await syncMemoryFile(localPath, content);
    item.status = "synced";
    item.contentHash = sha256(content);
    item.lastErrorCode = null;
  } catch (error) {
    item.status = item.attempts >= 5 ? "failed" : "pending";
    item.lastErrorCode = redactSecrets(error?.message || String(error)).slice(0, 200);
    item.nextAttemptAt = new Date(Date.now() + Math.min(3600000, item.attempts * 60000)).toISOString();
  }
  await writeOutbox(items);
  return item;
}

export async function retrySyncItem(id) {
  return withOutboxLock(async () => {
    const items = await readOutbox();
    const item = items.find((entry) => entry.id === id);
    if (!item) throw Object.assign(new Error("Không tìm thấy sync item."), { statusCode: 404, code: "SYNC_ITEM_NOT_FOUND" });
    return retryExistingItem(items, item);
  });
}

export async function retryAllSync({ max = 20 } = {}) {
  const results = [];
  const limit = Math.max(1, Math.min(100, Number(max) || 20));
  await withOutboxLock(async () => {
    const items = await readOutbox();
    const targets = items.filter((item) => ["pending", "failed"].includes(item.status)).slice(0, limit);
    for (const item of targets) {
      results.push(await retryExistingItem(items, item));
    }
  });
  return { processed: results.length, results };
}
