import { chmod, copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { config } from "../../config.mjs";
import {
  backupMemoryFile,
  enqueueSyncOutbox,
  memoryPathFromRelative,
  redactSensitiveContent,
  writeMemoryAudit,
  writeMemoryFileWithGovernance
} from "../../memory-governance.mjs";
import { resolveSharePointMemoryPath, syncMemoryFile } from "../../onedrive.mjs";
import { redactSecrets, sha256 } from "../../utils.mjs";

async function sleep(ms) {
  await new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function chmodPrivate(path) {
  if (process.platform !== "win32") await chmod(path, 0o600);
}

async function withAdminFileLock(lockPath, fn) {
  const started = Date.now();
  const timeoutMs = 5000;
  const staleMs = 120000;
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
      if (Date.now() - started > timeoutMs) {
        throw Object.assign(new Error("Không thể khóa file admin."), { statusCode: 409, code: "LOCK_TIMEOUT" });
      }
      await sleep(50);
    }
  }
}

async function readJsonl(path) {
  try {
    return (await readFile(path, "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function writeQueue(items) {
  await mkdir(dirname(config.memoryReviewQueueFile), { recursive: true });
  try {
    await copyFile(config.memoryReviewQueueFile, `${config.memoryReviewQueueFile}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const tmp = `${config.memoryReviewQueueFile}.${process.pid}.${Date.now()}.admin.tmp`;
  await writeFile(tmp, items.map((item) => JSON.stringify(item)).join("\n") + "\n", "utf8");
  await chmodPrivate(tmp);
  await rename(tmp, config.memoryReviewQueueFile);
  await chmodPrivate(config.memoryReviewQueueFile);
}

function relativeTargetFile(item) {
  return String(item.targetFile || "").replace(/^memory[\\/]/, "");
}

function candidateFromRecord(item, summaryOverride = "") {
  return {
    id: item.id,
    scope: item.scope,
    category: item.category,
    normalizedKey: item.normalizedKey,
    summary: summaryOverride ? redactSecrets(summaryOverride) : item.summary,
    targetUserId: item.sourceUserId || null,
    targetTeamId: item.sourceTeamId || null,
    durability: item.durability,
    confidence: item.confidence,
    sensitivity: item.sensitivity,
    sourceType: item.sourceType,
    action: "upsert",
    reason: item.reason || ""
  };
}

export async function listReviewCandidates({ scope = "", teamId = "", status = "pending", page = 1, pageSize = 20 } = {}) {
  const items = (await readJsonl(config.memoryReviewQueueFile)).filter((item) => {
    if (scope && item.scope !== scope) return false;
    if (teamId && item.sourceTeamId !== teamId) return false;
    if (status && item.status !== status) return false;
    return true;
  });
  const size = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * size;
  return { items: items.slice(offset, offset + size), total: items.length, page: currentPage, pageSize: size };
}

export async function getReviewCandidate(id) {
  const item = (await readJsonl(config.memoryReviewQueueFile)).find((candidate) => candidate.id === id);
  if (!item) throw Object.assign(new Error("Không tìm thấy candidate."), { statusCode: 404, code: "CANDIDATE_NOT_FOUND" });
  let currentValue = null;
  try {
    const content = await readFile(memoryPathFromRelative(relativeTargetFile(item)), "utf8");
    const escapedKey = item.normalizedKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    currentValue = content.match(new RegExp(`<!-- ltn:key=${escapedKey} -->\\n- (.*)`, "m"))?.[1] || null;
  } catch {}
  return { ...item, currentValue };
}

export async function approveReviewCandidate(id, { note = "", summary = "" } = {}, admin = null) {
  return withAdminFileLock(`${config.memoryReviewQueueFile}.lock`, async () => {
    const items = await readJsonl(config.memoryReviewQueueFile);
    const item = items.find((candidate) => candidate.id === id);
    if (!item) throw Object.assign(new Error("Không tìm thấy candidate."), { statusCode: 404, code: "CANDIDATE_NOT_FOUND" });
    if (item.status !== "pending") throw Object.assign(new Error("Candidate đã được xử lý."), { statusCode: 409, code: "CANDIDATE_ALREADY_PROCESSED" });
    if (item.sensitivity !== "none") throw Object.assign(new Error("Candidate nhạy cảm không thể approve."), { statusCode: 400, code: "SENSITIVE_CANDIDATE" });
    const editedSummary = summary ? redactSensitiveContent(String(summary).trim()).slice(0, 2000) : "";
    if (summary && editedSummary !== String(summary).trim()) {
      throw Object.assign(new Error("Summary chỉnh sửa chứa nội dung nhạy cảm."), { statusCode: 400, code: "SENSITIVE_SUMMARY" });
    }
    await writeMemoryFileWithGovernance({
      targetRelativeFile: relativeTargetFile(item),
      candidate: candidateFromRecord(item, editedSummary),
      actor: admin?.email || "local-admin",
      auditAction: "admin_approve"
    });
    item.status = "approved";
    item.updatedAt = new Date().toISOString();
    item.approvedAt = item.updatedAt;
    item.decision = { actor: admin?.email || "local-admin", note: redactSecrets(note || ""), result: "approved" };
    await writeQueue(items);
    return item;
  });
}

export async function rejectReviewCandidate(id, { note = "" } = {}, admin = null) {
  return withAdminFileLock(`${config.memoryReviewQueueFile}.lock`, async () => {
    const items = await readJsonl(config.memoryReviewQueueFile);
    const item = items.find((candidate) => candidate.id === id);
    if (!item) throw Object.assign(new Error("Không tìm thấy candidate."), { statusCode: 404, code: "CANDIDATE_NOT_FOUND" });
    if (!["pending", "blocked_sensitive"].includes(item.status)) throw Object.assign(new Error("Candidate đã được xử lý."), { statusCode: 409, code: "CANDIDATE_ALREADY_PROCESSED" });
    item.status = "rejected";
    item.updatedAt = new Date().toISOString();
    item.rejectedAt = item.updatedAt;
    item.decision = { actor: admin?.email || "local-admin", note: redactSecrets(note || ""), result: "rejected" };
    await writeMemoryAudit({
      action: "admin_reject",
      scope: item.scope,
      userId: item.sourceUserId || null,
      teamId: item.sourceTeamId || null,
      targetFile: relativeTargetFile(item),
      normalizedKey: item.normalizedKey,
      candidateId: item.id,
      oldValueHash: null,
      newValueHash: null,
      actor: admin?.email || "local-admin",
      result: "success",
      errorCode: null
    });
    await writeQueue(items);
    return item;
  });
}

function encodeFileId(relativeFile) {
  return Buffer.from(relativeFile.replaceAll("\\", "/"), "utf8").toString("base64url");
}

function decodeFileId(fileId) {
  const relativeFile = Buffer.from(String(fileId || ""), "base64url").toString("utf8");
  if (!/^[A-Za-z0-9._/-]+\.md$/.test(relativeFile)) {
    throw Object.assign(new Error("fileId không hợp lệ."), { statusCode: 400, code: "INVALID_FILE_ID" });
  }
  memoryPathFromRelative(relativeFile);
  return relativeFile;
}

function backupKeyForFile(relativeFile) {
  return relativeFile.replaceAll("\\", "/").replace(/[^a-zA-Z0-9._-]+/g, "__");
}

async function fileMeta(relativeFile, extra = {}) {
  const path = memoryPathFromRelative(relativeFile);
  const info = await stat(path).catch(() => null);
  const backupDir = resolve(config.memoryBackupDir, backupKeyForFile(relativeFile));
  const versions = (await readdir(backupDir).catch(() => [])).filter((name) => name.endsWith(".md"));
  const derivedScope = relativeFile === "COMPANY.md" ? "COMPANY" : relativeFile.startsWith("users/") ? "USER" : "TEAM";
  return {
    id: encodeFileId(relativeFile),
    fileId: encodeFileId(relativeFile),
    relativeFile,
    path: `memory/${relativeFile}`,
    scope: derivedScope,
    teamId: derivedScope === "TEAM" ? relativeFile.replace(/\.md$/, "") : derivedScope === "USER" ? relativeFile.split("/").at(1) : null,
    userId: derivedScope === "USER" ? relativeFile.split("/").at(-1)?.replace(/\.md$/, "") : null,
    size: info?.size || 0,
    updatedAt: info?.mtime?.toISOString?.() || null,
    versionCount: versions.length,
    ...extra
  };
}

export async function listMemoryFiles({ includeUsers = false } = {}) {
  const queue = await readJsonl(config.memoryReviewQueueFile);
  const files = [await fileMeta("COMPANY.md", { scope: "COMPANY", label: "COMPANY.md" })];
  const teamIds = [...new Set(queue.map((item) => item.sourceTeamId).filter(Boolean))].sort();
  for (const teamId of teamIds) {
    files.push(await fileMeta(`${teamId}.md`, { scope: "TEAM", teamId, label: `${teamId}.md` }));
  }
  if (includeUsers) {
    async function walk(dir, prefix = "") {
      for (const name of await readdir(dir).catch(() => [])) {
        const full = resolve(dir, name);
        const info = await stat(full).catch(() => null);
        if (!info) continue;
        if (info.isDirectory()) await walk(full, `${prefix}${name}/`);
        else if (name.endsWith(".md") && `${prefix}${name}`.startsWith("users/")) {
          files.push(await fileMeta(`${prefix}${name}`, { scope: "USER", label: `${prefix}${name}` }));
        }
      }
    }
    await walk(config.memoryDir);
  }
  return { items: files };
}

export async function getMemoryFile(fileId) {
  const relativeFile = decodeFileId(fileId);
  const meta = await fileMeta(relativeFile);
  const content = await readFile(memoryPathFromRelative(relativeFile), "utf8").catch((error) => {
    if (error?.code === "ENOENT") return "";
    throw error;
  });
  return { ...meta, content: redactSecrets(content), contentHash: sha256(content) };
}

export async function listMemoryVersions(fileId) {
  const relativeFile = decodeFileId(fileId);
  const backupDir = resolve(config.memoryBackupDir, backupKeyForFile(relativeFile));
  const items = (await readdir(backupDir).catch(() => []))
    .filter((name) => name.endsWith(".md"))
    .sort()
    .reverse()
    .map((name) => ({ versionId: name.replace(/\.md$/, ""), fileId }));
  return { items };
}

export async function getMemoryVersion(fileId, versionId) {
  const relativeFile = decodeFileId(fileId);
  if (!/^[0-9T:-]+Z$/.test(String(versionId || ""))) {
    throw Object.assign(new Error("versionId không hợp lệ."), { statusCode: 400, code: "INVALID_VERSION_ID" });
  }
  const backupPath = resolve(config.memoryBackupDir, backupKeyForFile(relativeFile), `${versionId}.md`);
  const content = await readFile(backupPath, "utf8").catch((error) => {
    if (error?.code === "ENOENT") throw Object.assign(new Error("Không tìm thấy version."), { statusCode: 404, code: "VERSION_NOT_FOUND" });
    throw error;
  });
  return { fileId, versionId, content: redactSecrets(content), contentHash: sha256(content) };
}

export async function rollbackMemoryFile(fileId, versionId, admin = null) {
  const relativeFile = decodeFileId(fileId);
  const version = await getMemoryVersion(fileId, versionId);
  const targetPath = memoryPathFromRelative(relativeFile);
  const content = await readFile(resolve(config.memoryBackupDir, backupKeyForFile(relativeFile), `${versionId}.md`), "utf8");
  return withAdminFileLock(`${targetPath}.lock`, async () => {
    const existing = await readFile(targetPath, "utf8").catch((error) => {
      if (error?.code === "ENOENT") return "";
      throw error;
    });
    await backupMemoryFile(targetPath, relativeFile);
    const tmp = `${targetPath}.${process.pid}.${Date.now()}.rollback.tmp`;
    await writeFile(tmp, content, "utf8");
    await chmodPrivate(tmp);
    await rename(tmp, targetPath);
    await chmodPrivate(targetPath);
    await writeMemoryAudit({
      action: "admin_rollback",
      scope: relativeFile === "COMPANY.md" ? "COMPANY" : relativeFile.startsWith("users/") ? "USER" : "TEAM",
      userId: relativeFile.startsWith("users/") ? relativeFile.split("/").at(-1)?.replace(/\.md$/, "") : null,
      teamId: relativeFile.startsWith("users/") ? relativeFile.split("/").at(1) : relativeFile === "COMPANY.md" ? null : relativeFile.replace(/\.md$/, ""),
      targetFile: relativeFile,
      normalizedKey: null,
      candidateId: null,
      oldValueHash: existing ? sha256(existing) : null,
      newValueHash: version.contentHash,
      actor: admin?.email || "local-admin",
      result: "success",
      errorCode: null
    });
    try {
      await syncMemoryFile(relativeFile, content);
    } catch (error) {
      await enqueueSyncOutbox({
        localPath: relativeFile,
        remotePath: resolveSharePointMemoryPath(relativeFile),
        contentHash: sha256(content),
        action: "rollback",
        lastErrorCode: String(error?.message || error).slice(0, 200)
      });
    }
    return { fileId, relativeFile, restoredVersionId: versionId, contentHash: sha256(content) };
  });
}

export async function readMemoryAudit({ limit = 100 } = {}) {
  return (await readJsonl(config.memoryAuditFile)).slice(-Math.min(500, Number(limit) || 100)).reverse();
}
