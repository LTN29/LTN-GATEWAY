import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { config } from "../config.mjs";
import { redactSecrets } from "../utils.mjs";
import { sha256 } from "./admin-validation.mjs";

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function chmodPrivate(path) {
  if (process.platform !== "win32") await chmod(path, 0o600);
}

async function withAuditLock(fn) {
  const lockPath = `${config.adminAuditFile}.lock`;
  const deadline = Date.now() + 5000;
  await mkdir(dirname(config.adminAuditFile), { recursive: true });
  while (true) {
    try {
      await mkdir(lockPath, { recursive: false });
      break;
    } catch (error) {
      if (error?.code !== "EEXIST" || Date.now() > deadline) {
        throw new Error("Không thể khóa admin audit.");
      }
      await sleep(25);
    }
  }
  try {
    return await fn();
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

export function ipHash(req) {
  const ip = req.headers["cf-connecting-ip"] || req.socket?.remoteAddress || "";
  return ip ? sha256(ip) : null;
}

export async function writeAdminAudit({
  admin,
  action,
  targetType,
  targetId,
  teamId = null,
  result = "success",
  metadata = {},
  requestId,
  req = null
}) {
  const safeMetadata = JSON.parse(redactSecrets(JSON.stringify(metadata || {})));
  const record = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    adminEmail: admin?.email || null,
    adminRoles: admin?.roles || [],
    action,
    targetType,
    targetId,
    teamId,
    result,
    metadata: safeMetadata,
    requestId,
    ipHash: req ? ipHash(req) : null
  };
  await withAuditLock(async () => {
    let existing = "";
    try {
      existing = await readFile(config.adminAuditFile, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    const tmp = `${config.adminAuditFile}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, existing + JSON.stringify(record) + "\n", "utf8");
    await chmodPrivate(tmp);
    await rename(tmp, config.adminAuditFile);
    await chmodPrivate(config.adminAuditFile);
  });
  return record;
}

function parseDate(value) {
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? ms : null;
}

function safeAuditRecord(record) {
  return JSON.parse(redactSecrets(JSON.stringify({
    id: record.id,
    timestamp: record.timestamp,
    adminEmail: record.adminEmail,
    adminRoles: Array.isArray(record.adminRoles) ? record.adminRoles : [],
    action: record.action,
    targetType: record.targetType,
    targetId: record.targetId,
    teamId: record.teamId || null,
    result: record.result,
    metadata: record.metadata || {},
    requestId: record.requestId,
    ipHashPrefix: record.ipHash ? String(record.ipHash).slice(0, 12) : null
  })));
}

async function readAuditRecords() {
  try {
    return (await readFile(config.adminAuditFile, "utf8"))
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .map(safeAuditRecord);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

export async function listAdminAudit({
  admin: adminEmail = "",
  action = "",
  targetType = "",
  targetId = "",
  teamId = "",
  result = "",
  dateFrom = "",
  dateTo = "",
  page = 1,
  pageSize = 50
} = {}, viewer = null) {
  const fromMs = parseDate(dateFrom);
  const toMs = parseDate(dateTo);
  const viewerTeamScope = viewer?.roles?.includes("TEAM_MANAGER") &&
    !viewer.roles.includes("SUPER_ADMIN") &&
    !viewer.roles.includes("IT_ADMIN") &&
    !viewer.roles.includes("AUDITOR") &&
    !viewer.roles.includes("MANAGEMENT")
    ? new Set(viewer.teamIds || [])
    : null;
  let items = await readAuditRecords();
  items = items.filter((item) => {
    const ts = parseDate(item.timestamp);
    if (fromMs && (!ts || ts < fromMs)) return false;
    if (toMs && (!ts || ts > toMs)) return false;
    if (adminEmail && !String(item.adminEmail || "").toLowerCase().includes(String(adminEmail).toLowerCase())) return false;
    if (action && item.action !== action) return false;
    if (targetType && item.targetType !== targetType) return false;
    if (targetId && !String(item.targetId || "").includes(String(targetId))) return false;
    if (teamId && item.teamId !== String(teamId).toUpperCase()) return false;
    if (result && item.result !== result) return false;
    if (viewerTeamScope && item.teamId && !viewerTeamScope.has(String(item.teamId).toUpperCase())) return false;
    return true;
  });
  items.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  const limit = Math.min(100, Math.max(1, Number(pageSize) || 50));
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * limit;
  return { items: items.slice(offset, offset + limit), total: items.length, page: currentPage, pageSize: limit };
}

export async function getAdminAudit(id, viewer = null) {
  const item = (await listAdminAudit({ pageSize: 100 }, viewer)).items.find((record) => record.id === id) ||
    (await readAuditRecords()).find((record) => record.id === id);
  if (!item) {
    throw Object.assign(new Error("Không tìm thấy audit record."), { statusCode: 404, code: "AUDIT_NOT_FOUND" });
  }
  return item;
}
