import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = await mkdtemp(join(tmpdir(), "ltn-perf-"));
await mkdir(join(dir, "memory", "users", "SALES"), { recursive: true });
await mkdir(join(dir, "data"), { recursive: true });
process.env.MEMORY_DIR = join(dir, "memory");
process.env.MEMORY_REVIEW_QUEUE_FILE = join(dir, "data", "queue.jsonl");
process.env.MEMORY_AUDIT_FILE = join(dir, "data", "audit.jsonl");
process.env.MEMORY_BACKUP_DIR = join(dir, "data", "backups");
process.env.MAX_CONTEXT_CHARS = "2000";
process.env.ONEDRIVE_MODE = "off";

const { budgetResponsesPayload } = await import("../src/request-budget.mjs");
const { applyReasoningPolicy } = await import("../src/reasoning-policy.mjs");
const { config } = await import("../src/config.mjs");
const { fitMemory, loadMemoryContext, memoryForConversation, memorySignature } = await import("../src/memory.mjs");
const { rateLimitPauseMs } = await import("../src/extractor.mjs");
const { processValidatedCandidate, upsertQueueRecord } = await import("../src/memory-governance.mjs");

const image = (id) => ({ type: "input_image", image_url: `data:image/jpeg;base64,${id}` });
const user = { principalType: "user", userId: "u1", teamId: "SALES", displayName: "U1", memoryFile: "users/SALES/u1.md", memoryMode: "full", team: { code: "SALES", memoryFile: "SALES.md", displayName: "Sales" } };

test("all 10 images the user just attached reach the model; old/tool images stay limited", () => {
  const input = [
    { type: "message", role: "user", content: [image("old1"), image("old2")] },
    { type: "message", role: "user", content: Array.from({ length: 10 }, (_, i) => image(`new${i}`)) }
  ];
  const { payload, stats } = budgetResponsesPayload({ model: "m", input });
  assert.equal(payload.input[1].content.filter((p) => p.type === "input_image").length, 10);
  assert.equal(stats.omittedImages, 2);
});

test("tool screenshots never raise the current-image allowance and the internal marker is stripped", () => {
  const input = [
    { type: "message", role: "user", content: [{ type: "input_text", text: "mở trang" }] },
    ...Array.from({ length: 8 }, (_, i) => ({ type: "function_call_output", call_id: `c${i}`, output: [image(`shot${i}`)] }))
  ];
  const { payload, stats } = budgetResponsesPayload({ model: "m", input });
  const kept = payload.input.flatMap((item) => Array.isArray(item.content) ? item.content : []).filter((p) => p.type === "input_image");
  assert.equal(kept.length, config.responsesMaxImages);
  assert.equal(stats.hoistedImages, 8);
  assert.equal(payload.input.some((item) => "_ltnHoistedToolImages" in item), false);
});

test("REASONING_DEFAULT_EFFORT: medium by default, auto sends no effort, explicit requests keep the cap", () => {
  const before = config.reasoningDefaultEffort;
  try {
    assert.equal(applyReasoningPolicy({ model: "cx/gpt-6.1-sol" }, user).reasoning.effort, "medium");
    config.reasoningDefaultEffort = "low";
    assert.equal(applyReasoningPolicy({ model: "cx/gpt-6.1-sol" }, user).reasoning.effort, "low");
    config.reasoningDefaultEffort = "auto";
    const auto = applyReasoningPolicy({ model: "cc/claude-opus-5-5" }, user);
    assert.equal(auto.reasoning, undefined);
    assert.equal(auto.reasoning_effort, undefined);
    assert.equal(auto.output_config, undefined);
    assert.deepEqual(auto.thinking, { type: "adaptive" });
    assert.equal(applyReasoningPolicy({ model: "cx/gpt", reasoning: { effort: "xhigh" } }, user).reasoning.effort, "medium");
  } finally {
    config.reasoningDefaultEffort = before;
  }
});

test("fitMemory drops the OLDEST entries per section, keeps headings and the newest entries", () => {
  const entries = (prefix, n) => Array.from({ length: n }, (_, i) => `<!-- ltn:key=${prefix}-${i} -->\n- ${prefix} mục số ${i} ${"x".repeat(60)}`).join("\n");
  const text = `# Hồ sơ\n\n## Quy tắc\n${entries("rule", 3)}\n\n## Ngữ cảnh gần đây\n${entries("ctx", 40)}\n`;
  const out = fitMemory(text, 1500);
  assert.ok(out.length <= 1500);
  assert.match(out, /## Quy tắc/);
  assert.match(out, /rule mục số 0/);           // phần ngắn không bị mất
  assert.match(out, /ctx mục số 39/);           // mục mới nhất còn
  assert.doesNotMatch(out, /ctx mục số 0 /);    // mục cũ nhất bị bỏ
  assert.match(out, /Đã lược bớt \d+ mục cũ/);
  assert.equal(out.split("\n").filter((l) => l.startsWith("<!-- ltn:key=")).length,
    out.split("\n").filter((l) => /^- (rule|ctx) mục/.test(l)).length); // không cắt ngang mục
  assert.equal(fitMemory("ngắn", 100), "ngắn");
});

test("loadMemoryContext keeps the newest user entries even when the file is far over budget", async () => {
  const lines = Array.from({ length: 200 }, (_, i) => `<!-- ltn:key=k${i} -->\n- ghi chú ${i} ${"y".repeat(40)}`).join("\n");
  await writeFile(join(dir, "memory", "users", "SALES", "u1.md"), `# Hồ sơ công việc\n\n## Ghi chú\n${lines}\n`);
  const ctx = await loadMemoryContext(user.team, user);
  assert.match(ctx.userMemory, /ghi chú 199 /);
  assert.ok(ctx.systemContent.length < 4000);
});

test("conversation snapshot refreshes when real memory changes, not when only recent context changes", async () => {
  const userFile = join(dir, "memory", "users", "SALES", "u1.md");
  await writeFile(userFile, "# Hồ sơ\n\n## Quy tắc\n<!-- ltn:key=a -->\n- dùng bảng\n\n## Ngữ cảnh gần đây\n<!-- ltn:key=recent-work-context -->\n- việc 1\n");
  const first = await memoryForConversation(user.team, user, "conversation-key-1");
  await new Promise((r) => setTimeout(r, 20));
  await writeFile(userFile, "# Hồ sơ\n\n## Quy tắc\n<!-- ltn:key=a -->\n- dùng bảng\n\n## Ngữ cảnh gần đây\n<!-- ltn:key=recent-work-context -->\n- việc 2 khác hẳn\n");
  assert.equal(await memoryForConversation(user.team, user, "conversation-key-1"), first); // giữ cache prompt
  await new Promise((r) => setTimeout(r, 20));
  await writeFile(userFile, "# Hồ sơ\n\n## Quy tắc\n<!-- ltn:key=a -->\n- dùng gạch đầu dòng\n");
  const refreshed = await memoryForConversation(user.team, user, "conversation-key-1");
  assert.notEqual(refreshed, first);
  assert.match(refreshed.systemContent, /gạch đầu dòng/);
  assert.equal(memorySignature("a", "b", "<!-- ltn:key=recent-work-context -->\n- x\n"), memorySignature("a", "b", "<!-- ltn:key=recent-work-context -->\n- y\n"));
});

test("rate-limited extractor pauses for the reset window, other errors do not", () => {
  assert.equal(rateLimitPauseMs(429, "HTTP 429 (reset after 1m 18s)"), 78_000);
  assert.equal(rateLimitPauseMs(503, "[antigravity/x] [429]: HTTP 429 (reset after 2m)"), 120_000);
  assert.equal(rateLimitPauseMs(429, "slow down"), 120_000);
  assert.equal(rateLimitPauseMs(429, "reset after 5s"), 30_000);
  assert.equal(rateLimitPauseMs(429, "reset after 3h"), 1_800_000);
  assert.equal(rateLimitPauseMs(400, "Model is unavailable"), 0);
});

test("recent-work-context is user-only: no team conflict, never written to team memory", async () => {
  await writeFile(join(dir, "memory", "SALES.md"), "# Sales\n\n## Ngữ cảnh gần đây\n<!-- ltn:key=recent-work-context -->\n- việc của người khác\n");
  const base = { category: "context", normalizedKey: "recent-work-context", summary: "Yêu cầu công việc gần đây: báo giá", targetUserId: "u1", targetTeamId: "SALES", durability: "medium_term", confidence: 1, sensitivity: "none", sourceType: "explicit_user_statement", action: "upsert", reason: "t" };
  assert.equal((await processValidatedCandidate({ ...base, scope: "USER" }, user)).action, "user_auto_update");
  assert.equal((await processValidatedCandidate({ ...base, scope: "TEAM" }, user)).action, "invalid_target");
});

test("review queue is backed up at most once per interval", async () => {
  const rec = (key) => ({ id: key, status: "pending", normalizedKey: key, targetFile: "memory/x.md", confidence: 0.5, sourceCount: 1 });
  for (let i = 0; i < 6; i += 1) await upsertQueueRecord(rec(`k${i % 2}`));
  const backups = (await readdir(join(dir, "data"))).filter((f) => f.startsWith("queue.jsonl.backup-"));
  assert.ok(backups.length <= 1, `got ${backups.length} backups`);
});
