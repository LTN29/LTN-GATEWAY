import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function freshGovernance(root) {
  process.env.MEMORY_DIR = join(root, "memory");
  process.env.MEMORY_REVIEW_QUEUE_FILE = join(root, "memory-review-queue.jsonl");
  process.env.MEMORY_AUDIT_FILE = join(root, "memory-audit.jsonl");
  process.env.MEMORY_SYNC_OUTBOX_FILE = join(root, "memory-sync-outbox.jsonl");
  process.env.MEMORY_BACKUP_DIR = join(root, "memory-backups");
  process.env.MEMORY_BACKUP_LIMIT = "3";
  process.env.ONEDRIVE_MODE = "local";
  process.env.ONEDRIVE_LOCAL_DIR = join(root, "sharepoint");
  process.env.USER_MEMORY_AUTO_UPDATE_MIN_CONFIDENCE = "0.9";
  const { config } = await import("../src/config.mjs");
  config.memoryReviewQueueFile = join(root, "memory-review-queue.jsonl");
  config.memoryAuditFile = join(root, "memory-audit.jsonl");
  config.memorySyncOutboxFile = join(root, "memory-sync-outbox.jsonl");
  config.memoryBackupDir = join(root, "memory-backups");
  config.memoryBackupLimit = 3;
  config.userMemoryEnabled = true;
  config.userMemoryAutoUpdate = true;
  config.userMemoryAutoUpdateMinConfidence = 0.9;
  config.teamMemoryEnabled = true;
  config.teamMemoryAutoUpdate = true;
  config.companyMemoryEnabled = true;
  config.companyMemoryAutoUpdate = true;
  config.memoryExtractionMinConfidence = 0.8;
  config.oneDrive.mode = "local";
  config.oneDrive.localDir = join(root, "sharepoint");
  return import(`../src/memory-governance.mjs?test=${Date.now()}-${Math.random()}`);
}

function principal(memoryFile = "users/SALES/sales-ngoc.md") {
  return {
    principalType: "user",
    userId: "sales-ngoc",
    teamId: "SALES",
    memoryFile,
    team: { code: "SALES", memoryFile: "SALES.md" }
  };
}

function candidate(overrides = {}) {
  return {
    scope: "USER",
    category: "preference",
    summary: "User prefers short customer-ready answers.",
    normalizedKey: "output-style.short-customer-message",
    targetUserId: "sales-ngoc",
    targetTeamId: "SALES",
    durability: "long_term",
    confidence: 0.96,
    sensitivity: "none",
    sourceType: "explicit_user_statement",
    action: "upsert",
    reason: "explicit preference",
    ...overrides
  };
}

test("governance validates IDs, redacts sensitive content, and blocks path traversal", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-memory-governance-"));
  const governance = await freshGovernance(root);

  assert.equal(governance.redactSensitiveContent("email a@example.com phone 0901234567 sk-secretsecretsecret"), "email [REDACTED_EMAIL] phone [REDACTED_PHONE] [REDACTED]");
  assert.equal(governance.detectSensitivity("password=abc"), "secret");
  assert.throws(() => governance.memoryPathFromRelative("../outside.md"), /traversal/);

  const valid = governance.validateMemoryCandidate(candidate({ targetUserId: "other-user" }), principal());
  assert.equal(valid.targetUserId, "sales-ngoc");
  assert.equal(valid.normalizedKey, "output-style.short-customer-message");
});

test("USER high confidence auto-updates with backup, audit and SharePoint mapping", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-memory-governance-"));
  const governance = await freshGovernance(root);
  await mkdir(join(root, "memory", "users", "SALES"), { recursive: true });
  await writeFile(join(root, "memory", "users", "SALES", "sales-ngoc.md"), "# Hồ sơ công việc\n\n## Phong cách đầu ra\n", "utf8");

  const result = await governance.processValidatedCandidate(
    governance.validateMemoryCandidate(candidate(), principal()),
    principal()
  );

  assert.equal(result.action, "user_auto_update");
  assert.match(await readFile(join(root, "memory", "users", "SALES", "sales-ngoc.md"), "utf8"), /short customer-ready/);
  assert.match(await readFile(join(root, "memory-audit.jsonl"), "utf8"), /user_auto_update/);
  assert.match(await readFile(join(root, "sharepoint", "users", "SALES", "sales-ngoc.md"), "utf8"), /short customer-ready/);
});

test("USER recent work context auto-updates local memory and SharePoint", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-memory-governance-"));
  const governance = await freshGovernance(root);
  await mkdir(join(root, "memory", "users", "SALES"), { recursive: true });
  await writeFile(join(root, "memory", "users", "SALES", "sales-ngoc.md"), "# Hồ sơ công việc\n", "utf8");

  const result = await governance.processValidatedCandidate(
    governance.validateMemoryCandidate(candidate({
      category: "context",
      summary: "Đang tìm cách lưu trữ và truy vấn nhanh tập dữ liệu khoảng một triệu dòng.",
      normalizedKey: "recent-work-context",
      durability: "medium_term",
      confidence: 0.85,
      sourceType: "inferred_from_context",
      reason: "substantive current work"
    }), principal()),
    principal()
  );

  assert.equal(result.action, "user_auto_update");
  assert.match(await readFile(join(root, "memory", "users", "SALES", "sales-ngoc.md"), "utf8"), /Ngữ cảnh gần đây/);
  assert.match(await readFile(join(root, "sharepoint", "users", "SALES", "sales-ngoc.md"), "utf8"), /một triệu dòng/);
});

test("TEAM and COMPANY work knowledge auto-updates local memory and SharePoint", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-memory-governance-"));
  const governance = await freshGovernance(root);
  const teamCandidate = governance.validateMemoryCandidate(candidate({
    scope: "TEAM",
    category: "policy",
    normalizedKey: "dealer-quote.manager-approval",
    summary: "Dealer quotations require Sales manager approval.",
    targetUserId: null,
    targetTeamId: "SALES"
  }), principal());

  const teamResult = await governance.processValidatedCandidate(teamCandidate, principal());
  assert.equal(teamResult.action, "team_auto_update");
  assert.match(await readFile(join(root, "memory", "SALES.md"), "utf8"), /manager approval/);
  assert.match(await readFile(join(root, "sharepoint", "teams", "SALES.md"), "utf8"), /manager approval/);

  const companyCandidate = governance.validateMemoryCandidate(candidate({
    scope: "COMPANY",
    category: "policy",
    normalizedKey: "warranty.vacuum-motor-24m",
    summary: "Vacuum motor warranty is 24 months company-wide.",
    targetUserId: null,
    targetTeamId: null
  }), principal());
  const companyResult = await governance.processValidatedCandidate(companyCandidate, principal());
  assert.equal(companyResult.action, "company_auto_update");
  assert.match(await readFile(join(root, "memory", "COMPANY.md"), "utf8"), /24 months/);
  assert.match(await readFile(join(root, "sharepoint", "COMPANY.md"), "utf8"), /24 months/);
});

test("sensitive candidates are not auto-written and queue only blocked metadata", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-memory-governance-"));
  const governance = await freshGovernance(root);
  await governance.processValidatedCandidate(
    governance.validateMemoryCandidate(candidate({
      summary: "Remember API key sk-secretsecretsecret for me.",
      normalizedKey: "secret.api-key"
    }), principal()),
    principal()
  );

  const queue = await readFile(join(root, "memory-review-queue.jsonl"), "utf8");
  assert.match(queue, /blocked_sensitive/);
  assert.match(queue, /\[BLOCKED_SENSITIVE\]/);
  assert.doesNotMatch(queue, /sk-secret/);
});

test("SharePoint resolver maps memory files and rejects unknown paths", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-memory-governance-"));
  await freshGovernance(root);
  const { resolveSharePointMemoryPath } = await import(`../src/onedrive.mjs?test=${Date.now()}-${Math.random()}`);

  assert.equal(resolveSharePointMemoryPath("COMPANY.md"), "COMPANY.md");
  assert.equal(resolveSharePointMemoryPath("SALES.md"), "teams/SALES.md");
  assert.equal(resolveSharePointMemoryPath("users/SALES/sales-ngoc.md"), "users/SALES/sales-ngoc.md");
  assert.throws(() => resolveSharePointMemoryPath("users/SALES/Ngoc.md"), /not allowed/);
  assert.throws(() => resolveSharePointMemoryPath("../outside.md"), /traversal/);
});
