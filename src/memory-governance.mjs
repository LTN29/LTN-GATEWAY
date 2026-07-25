import { randomUUID } from "node:crypto";
import {
  chmod,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile
} from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { config } from "./config.mjs";
import { sha256, jsonLog, redactSecrets } from "./utils.mjs";
import { syncMemoryFile, resolveSharePointMemoryPath } from "./onedrive.mjs";

export const VALID_SCOPES = new Set(["NONE", "USER", "TEAM", "COMPANY"]);
export const VALID_CATEGORIES = new Set([
  "profile",
  "preference",
  "workflow",
  "policy",
  "product",
  "decision",
  "troubleshooting",
  "template",
  "responsibility",
  "other"
]);
export const VALID_DURABILITY = new Set(["temporary", "medium_term", "long_term"]);
export const VALID_SENSITIVITY = new Set(["none", "pii", "secret", "financial", "health", "hr", "other"]);
export const VALID_SOURCE_TYPES = new Set([
  "explicit_user_statement",
  "inferred_from_context",
  "assistant_generated"
]);
export const VALID_ACTIONS = new Set(["upsert", "remove", "ignore"]);

function nowIso() {
  return new Date().toISOString();
}

function timestampId() {
  return nowIso().replace(/[:.]/g, "-");
}

function memoryRoot() {
  return config.memoryDir;
}

export function safeMemoryRelativePath(file) {
  const root = memoryRoot();
  const target = resolve(file);
  const rel = relative(root, target);
  if (!rel || rel.startsWith("..")) {
    throw new Error("Memory path nằm ngoài MEMORY_DIR");
  }
  return rel.replaceAll("\\", "/");
}

export function memoryPathFromRelative(relativePath) {
  const root = memoryRoot();
  const target = resolve(root, relativePath.replace(/^memory[\\/]/, ""));
  const rel = relative(root, target);
  if (!rel || rel.startsWith("..")) {
    throw new Error("Memory path traversal");
  }
  return target;
}

export function redactSensitiveContent(value) {
  let text = redactSecrets(String(value || ""));
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]");
  text = text.replace(/\b(?:\+?84|0)(?:\d[\s.-]?){8,10}\b/g, "[REDACTED_PHONE]");
  text = text.replace(/\b\d{9,12}\b/g, "[REDACTED_ID]");
  text = text.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, "[REDACTED_CARD]");
  text = text.replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]");
  return text;
}

export function detectSensitivity(value) {
  const text = String(value || "");
  if (/\bsk-[A-Za-z0-9_-]{12,}\b|Bearer\s+[A-Za-z0-9._~+/=-]{12,}|PRIVATE KEY|password|api[_ -]?key|token|OTP/i.test(text)) {
    return "secret";
  }
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text) || /\b(?:\+?84|0)(?:\d[\s.-]?){8,10}\b/.test(text)) {
    return "pii";
  }
  if (/lương|kỷ luật|đánh giá nhân sự|nhân sự/i.test(text)) return "hr";
  if (/sức khỏe|bệnh|y tế/i.test(text)) return "health";
  if (/ngân hàng|số tài khoản|thẻ tín dụng/i.test(text)) return "financial";
  return "none";
}

function safeKey(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{1,120}$/.test(key)) {
    throw new Error("normalizedKey không hợp lệ");
  }
  return key;
}

export function validateMemoryCandidate(raw, principal) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("candidate phải là object");
  }
  const scope = String(raw.scope || "NONE").trim().toUpperCase();
  if (!VALID_SCOPES.has(scope)) throw new Error("scope không hợp lệ");
  const category = String(raw.category || "other").trim().toLowerCase();
  if (!VALID_CATEGORIES.has(category)) throw new Error("category không hợp lệ");
  const summary = redactSensitiveContent(String(raw.summary || "").trim());
  const confidence = Number(raw.confidence);
  const sensitivity = detectSensitivity(raw.summary) !== "none"
    ? detectSensitivity(raw.summary)
    : String(raw.sensitivity || "none").trim().toLowerCase();
  const candidate = {
    scope,
    category,
    summary,
    normalizedKey: scope === "NONE" ? "" : safeKey(raw.normalizedKey),
    targetUserId: raw.targetUserId ? String(raw.targetUserId).trim() : null,
    targetTeamId: raw.targetTeamId ? String(raw.targetTeamId).trim().toUpperCase() : null,
    durability: String(raw.durability || "temporary").trim().toLowerCase(),
    confidence,
    sensitivity,
    sourceType: String(raw.sourceType || "inferred_from_context").trim(),
    action: String(raw.action || "ignore").trim().toLowerCase(),
    reason: redactSensitiveContent(String(raw.reason || "").trim()).slice(0, 500)
  };
  if (!VALID_DURABILITY.has(candidate.durability)) throw new Error("durability không hợp lệ");
  if (!VALID_SENSITIVITY.has(candidate.sensitivity)) throw new Error("sensitivity không hợp lệ");
  if (!VALID_SOURCE_TYPES.has(candidate.sourceType)) throw new Error("sourceType không hợp lệ");
  if (!VALID_ACTIONS.has(candidate.action)) throw new Error("action không hợp lệ");
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new Error("confidence không hợp lệ");
  }
  if (scope !== "NONE" && !candidate.summary) throw new Error("summary rỗng");
  if (scope === "USER" && principal?.principalType === "user") {
    candidate.targetUserId = principal.userId;
    candidate.targetTeamId = principal.teamId;
  }
  if (scope === "TEAM") {
    candidate.targetUserId = null;
    candidate.targetTeamId = principal?.teamId || candidate.targetTeamId;
  }
  if (scope === "COMPANY") {
    candidate.targetUserId = null;
    candidate.targetTeamId = null;
  }
  return candidate;
}

function sectionFor(candidate) {
  if (candidate.scope === "USER") {
    return {
      profile: "Vai trò và phạm vi",
      responsibility: "Vai trò và phạm vi",
      preference: "Phong cách đầu ra",
      workflow: "Quy trình cá nhân",
      template: "Mẫu yêu cầu hiệu quả",
      policy: "Quy tắc riêng",
      product: "Quy tắc riêng",
      decision: "Quy tắc riêng",
      troubleshooting: "Quy trình cá nhân",
      other: "Quy tắc riêng"
    }[candidate.category];
  }
  if (candidate.scope === "TEAM") {
    return {
      profile: "Trách nhiệm",
      responsibility: "Trách nhiệm",
      workflow: "Quy trình",
      policy: "Chính sách nội bộ",
      product: "Sản phẩm và nghiệp vụ",
      template: "Mẫu nội dung",
      decision: "Quyết định đang áp dụng",
      troubleshooting: "Sản phẩm và nghiệp vụ",
      preference: "Mẫu nội dung",
      other: "Sản phẩm và nghiệp vụ"
    }[candidate.category];
  }
  return {
    profile: "Thương hiệu",
    responsibility: "Quy trình liên phòng ban",
    workflow: "Quy trình liên phòng ban",
    policy: "Chính sách chung",
    product: "Sản phẩm",
    template: "Quy trình liên phòng ban",
    decision: "Quyết định chính thức",
    troubleshooting: "Bảo hành",
    preference: "Thương hiệu",
    other: "Chính sách chung"
  }[candidate.category];
}

function defaultMemoryContent(scope, title = "") {
  if (scope === "USER") {
    return `# Hồ sơ công việc

## Vai trò và phạm vi

## Phong cách đầu ra

## Quy trình cá nhân

## Mẫu yêu cầu hiệu quả

## Quy tắc riêng

## Metadata
- Last updated:
- Version: 1
`;
  }
  if (scope === "TEAM") {
    return `# Kiến thức bộ phận ${title}

## Trách nhiệm

## Quy trình

## Chính sách nội bộ

## Sản phẩm và nghiệp vụ

## Mẫu nội dung

## Quyết định đang áp dụng
`;
  }
  return `# Kiến thức công ty

## Thương hiệu

## Sản phẩm

## Chính sách chung

## Bảo hành

## Quy trình liên phòng ban

## Quyết định chính thức
`;
}

export function upsertCandidateIntoMarkdown(existing, candidate) {
  const section = sectionFor(candidate);
  const keyComment = `<!-- ltn:key=${candidate.normalizedKey} -->`;
  const line = `${keyComment}\n- ${candidate.summary}`;
  let text = existing && existing.trim() ? existing : defaultMemoryContent(candidate.scope);
  const escapedKey = candidate.normalizedKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blockRe = new RegExp(`<!-- ltn:key=${escapedKey} -->\\n- .*`, "m");
  if (candidate.action === "remove") {
    return text.replace(blockRe, "").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }
  if (blockRe.test(text)) {
    const current = text.match(blockRe)?.[0] || "";
    if (current === line) return { markdown: text.endsWith("\n") ? text : `${text}\n`, changed: false };
    text = text.replace(blockRe, line);
    return { markdown: text.trim() + "\n", changed: true };
  }
  const heading = `## ${section}`;
  if (!text.includes(heading)) {
    text = `${text.trim()}\n\n${heading}\n`;
  }
  const index = text.indexOf(heading);
  const next = text.indexOf("\n## ", index + heading.length);
  const insertAt = next === -1 ? text.length : next;
  const before = text.slice(0, insertAt).trimEnd();
  const after = text.slice(insertAt).trimStart();
  const markdown = `${before}\n${line}\n${after ? `\n${after}` : ""}`.trim() + "\n";
  return { markdown, changed: true };
}

async function chmodPrivate(path) {
  if (process.platform !== "win32") await chmod(path, 0o600);
}

export async function appendJsonlAtomic(path, record) {
  await mkdir(dirname(path), { recursive: true });
  let existing = "";
  try {
    existing = await readFile(path, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, existing + JSON.stringify(record) + "\n", "utf8");
  await chmodPrivate(tmp);
  await rename(tmp, path);
  await chmodPrivate(path);
}

async function withFileLock(lockPath, fn) {
  const started = Date.now();
  const timeoutMs = 5000;
  const staleMs = 120000;
  while (true) {
    try {
      await mkdir(lockPath, { recursive: false });
      await writeFile(
        resolve(lockPath, "owner.json"),
        JSON.stringify({ pid: process.pid, createdAtMs: Date.now() }),
        "utf8"
      );
      try {
        return await fn();
      } finally {
        await rm(lockPath, { recursive: true, force: true });
      }
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      try {
        const info = await readFile(resolve(lockPath, "owner.json"), "utf8");
        const owner = JSON.parse(info);
        if (Date.now() - Number(owner.createdAtMs || 0) > staleMs) {
          await rm(lockPath, { recursive: true, force: true });
          continue;
        }
      } catch {
        await rm(lockPath, { recursive: true, force: true });
        continue;
      }
      if (Date.now() - started > timeoutMs) {
        throw new Error("Memory lock timeout");
      }
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
    }
  }
}

export async function writeMemoryAudit(record) {
  await appendJsonlAtomic(config.memoryAuditFile, {
    id: randomUUID(),
    timestamp: nowIso(),
    ...record
  });
}

function backupKeyForFile(relativeFile) {
  return relativeFile.replaceAll("\\", "/").replace(/[^a-zA-Z0-9._-]+/g, "__");
}

export async function backupMemoryFile(targetPath, relativeFile) {
  const version = timestampId();
  const backupDir = resolve(config.memoryBackupDir, backupKeyForFile(relativeFile));
  await mkdir(backupDir, { recursive: true });
  const backupPath = resolve(backupDir, `${version}.md`);
  try {
    await copyFile(targetPath, backupPath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await writeFile(backupPath, "", "utf8");
  }
  await chmodPrivate(backupPath);
  try {
    const limit = Math.max(1, Number(config.memoryBackupLimit || 20));
    const files = (await readdir(backupDir))
      .filter((name) => name.endsWith(".md"))
      .sort();
    const removeCount = Math.max(0, files.length - limit);
    for (const oldFile of files.slice(0, removeCount)) {
      await rm(resolve(backupDir, oldFile), { force: true });
    }
  } catch {}
  return { version, backupPath };
}

export async function writeMemoryFileWithGovernance({
  targetRelativeFile,
  candidate,
  actor = "system",
  auditAction = "user_auto_update"
}) {
  const targetPath = memoryPathFromRelative(targetRelativeFile);
  await mkdir(dirname(targetPath), { recursive: true });
  let existing = "";
  try {
    existing = await readFile(targetPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    existing = defaultMemoryContent(candidate.scope);
  }
  const { markdown, changed } = upsertCandidateIntoMarkdown(existing, candidate);
  if (!changed) {
    jsonLog("user_memory_no_change", {
      scope: candidate.scope,
      normalizedKey: candidate.normalizedKey
    });
    return { changed: false };
  }
  await backupMemoryFile(targetPath, targetRelativeFile);
  const tmp = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, markdown, "utf8");
  await chmodPrivate(tmp);
  await rename(tmp, targetPath);
  await chmodPrivate(targetPath);
  await writeMemoryAudit({
    action: auditAction,
    scope: candidate.scope,
    userId: candidate.targetUserId || null,
    teamId: candidate.targetTeamId || null,
    targetFile: targetRelativeFile,
    normalizedKey: candidate.normalizedKey,
    candidateId: candidate.id || null,
    oldValueHash: existing ? sha256(existing) : null,
    newValueHash: sha256(markdown),
    actor,
    result: "success",
    errorCode: null
  });
  try {
    await syncMemoryFile(targetRelativeFile, markdown);
  } catch (error) {
    await enqueueSyncOutbox({
      localPath: targetRelativeFile,
      remotePath: resolveSharePointMemoryPath(targetRelativeFile),
      contentHash: sha256(markdown),
      action: "upsert",
      lastErrorCode: String(error?.message || error).slice(0, 200)
    });
  }
  return { changed: true };
}

export function targetRelativeFileForCandidate(candidate, principal) {
  if (candidate.scope === "COMPANY") return "COMPANY.md";
  if (candidate.scope === "TEAM") return principal.team.memoryFile;
  if (candidate.scope === "USER" && principal?.principalType === "user") return principal.memoryFile;
  if (candidate.scope === "USER") throw new Error("USER memory requires a user principal");
  return "";
}

function keyedLine(markdown, normalizedKey) {
  const escapedKey = normalizedKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return markdown.match(new RegExp(`<!-- ltn:key=${escapedKey} -->\\n- (.*)`, "m"))?.[1] || null;
}

async function detectUserConflict(candidate, principal) {
  const files = ["COMPANY.md", principal?.team?.memoryFile].filter(Boolean);
  for (const file of files) {
    try {
      const content = await readFile(memoryPathFromRelative(file), "utf8");
      const existing = keyedLine(content, candidate.normalizedKey);
      if (existing && existing.trim() !== candidate.summary.trim()) {
        return { file, existingHash: sha256(existing), priority: file === "COMPANY.md" ? "COMPANY" : "TEAM" };
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return null;
}

export async function enqueueReviewCandidate(candidate, principal, reason = null) {
  if (!config.memoryReviewQueueEnabled) return null;
  const targetRelativeFile = targetRelativeFileForCandidate(candidate, principal);
  const record = {
    id: randomUUID(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    sourceUserId: principal?.userId || null,
    sourceTeamId: principal?.teamId || null,
    scope: candidate.scope,
    category: candidate.category,
    normalizedKey: candidate.normalizedKey,
    summary: candidate.sensitivity === "none" ? candidate.summary : "[BLOCKED_SENSITIVE]",
    targetFile: `memory/${targetRelativeFile}`,
    confidence: candidate.confidence,
    status: candidate.sensitivity === "none" ? "pending" : "blocked_sensitive",
    sensitivity: candidate.sensitivity,
    durability: candidate.durability,
    sourceType: candidate.sourceType,
    decision: null,
    sourceCount: 1,
    reason: reason || candidate.reason || null
  };
  await upsertQueueRecord(record);
  jsonLog("memory_candidate_queued", {
    candidateId: record.id,
    userId: record.sourceUserId,
    teamId: record.sourceTeamId,
    scope: record.scope,
    category: record.category,
    normalizedKey: record.normalizedKey
  });
  return record;
}

async function readQueue() {
  try {
    return (await readFile(config.memoryReviewQueueFile, "utf8"))
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    const backup = `${config.memoryReviewQueueFile}.corrupt-${timestampId()}`;
    try { await copyFile(config.memoryReviewQueueFile, backup); } catch {}
    jsonLog("memory_review_queue_corrupt", {
      file: config.memoryReviewQueueFile,
      backup,
      error: redactSecrets(error?.message || String(error))
    });
    throw error;
  }
}

async function writeQueue(items) {
  await mkdir(dirname(config.memoryReviewQueueFile), { recursive: true });
  try {
    await copyFile(
      config.memoryReviewQueueFile,
      `${config.memoryReviewQueueFile}.backup-${timestampId()}`
    );
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const tmp = `${config.memoryReviewQueueFile}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, items.map((item) => JSON.stringify(item)).join("\n") + "\n", "utf8");
  await chmodPrivate(tmp);
  await rename(tmp, config.memoryReviewQueueFile);
  await chmodPrivate(config.memoryReviewQueueFile);
}

export async function upsertQueueRecord(record) {
  return withFileLock(`${config.memoryReviewQueueFile}.lock`, async () => {
    const items = await readQueue();
    const existing = items.find((item) =>
      item.status === "pending" &&
      item.normalizedKey === record.normalizedKey &&
      item.targetFile === record.targetFile
    );
    if (existing) {
      existing.updatedAt = nowIso();
      existing.confidence = Math.max(Number(existing.confidence || 0), record.confidence);
      existing.sourceCount = Number(existing.sourceCount || 1) + 1;
      await writeQueue(items);
      jsonLog("memory_candidate_deduplicated", {
        candidateId: existing.id,
        normalizedKey: existing.normalizedKey
      });
      return existing;
    }
    items.push(record);
    await writeQueue(items);
    return record;
  });
}

export async function enqueueSyncOutbox(record) {
  const now = nowIso();
  await appendJsonlAtomic(config.memorySyncOutboxFile, {
    id: randomUUID(),
    localPath: record.localPath,
    remotePath: record.remotePath,
    contentHash: record.contentHash,
    action: record.action || "upsert",
    status: "pending",
    attempts: 0,
    nextAttemptAt: now,
    lastErrorCode: redactSecrets(record.lastErrorCode || ""),
    createdAt: now,
    updatedAt: now
  });
  jsonLog("memory_sharepoint_sync_queued", {
    localPath: record.localPath,
    remotePath: record.remotePath
  });
}

export async function processValidatedCandidate(candidate, principal) {
  if (candidate.scope === "NONE" || candidate.action === "ignore") return { action: "none" };
  if (candidate.sensitivity !== "none") {
    jsonLog("memory_candidate_rejected_sensitive", {
      userId: principal?.userId,
      teamId: principal?.teamId,
      scope: candidate.scope,
      normalizedKey: candidate.normalizedKey
    });
    await enqueueReviewCandidate(candidate, principal, "sensitive_blocked");
    return { action: "blocked" };
  }
  if (candidate.confidence < config.memoryExtractionMinConfidence) {
    jsonLog("memory_candidate_rejected_low_confidence", {
      scope: candidate.scope,
      normalizedKey: candidate.normalizedKey
    });
    return { action: "low_confidence" };
  }
  if (candidate.scope === "USER") {
    if (principal?.principalType !== "user") {
      jsonLog("memory_candidate_rejected_invalid", {
        scope: candidate.scope,
        normalizedKey: candidate.normalizedKey,
        error: "USER candidate requires user principal"
      });
      return { action: "invalid_target" };
    }
    const conflict = await detectUserConflict(candidate, principal);
    if (conflict) {
      jsonLog("memory_conflict_detected", {
        userId: principal.userId,
        teamId: principal.teamId,
        normalizedKey: candidate.normalizedKey,
        conflictFile: conflict.file,
        priority: conflict.priority
      });
      await enqueueReviewCandidate(candidate, principal, `conflict_with_${conflict.priority.toLowerCase()}`);
      return { action: "conflict_queued" };
    }
    if (
      config.userMemoryEnabled &&
      config.userMemoryAutoUpdate &&
      candidate.confidence >= config.userMemoryAutoUpdateMinConfidence &&
      candidate.durability === "long_term" &&
      candidate.sourceType === "explicit_user_statement" &&
      candidate.targetUserId === principal.userId
    ) {
      jsonLog("user_memory_update_started", {
        userId: principal.userId,
        normalizedKey: candidate.normalizedKey
      });
      await writeMemoryFileWithGovernance({
        targetRelativeFile: principal.memoryFile,
        candidate,
        actor: "system",
        auditAction: candidate.action === "remove" ? "user_auto_remove" : "user_auto_update"
      });
      jsonLog("user_memory_updated", {
        userId: principal.userId,
        normalizedKey: candidate.normalizedKey
      });
      return { action: "user_auto_update" };
    }
    await enqueueReviewCandidate(candidate, principal, "user_not_auto_eligible");
    return { action: "queued" };
  }
  if (candidate.scope === "TEAM" || candidate.scope === "COMPANY") {
    await enqueueReviewCandidate(candidate, principal);
    return { action: "queued" };
  }
  return { action: "none" };
}
