// Trợ lý SIMI: admin chọn model (theo thứ tự ưu tiên); model lỗi (vd Gemini 403 "reset after 2m") → tự chuyển model kế tiếp,
// model lỗi tạm nghỉ để câu sau hỏi model khác ngay; admin xem được model nào trả lời / model nào đang lỗi.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));

test("Trợ lý: model admin chọn lỗi thì tự chuyển model khác, ghi lại model đã trả lời", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-npc-fallback-"));
  const calls = [];
  const up = http.createServer(async (req, res) => {
    let raw = ""; for await (const c of req) raw += c;
    const body = raw ? JSON.parse(raw) : {};
    if (req.url === "/api/combos") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ combos: [{ name: "SIMI-MIX", models: ["ag/gemini-3.1-pro-low", "cx/gpt-5-mini", "cc/claude-haiku-5"] }, { name: "SIMI-FREE", models: ["cx/gpt-5-mini"] }] })); }
    if (req.url === "/v1/models") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ object: "list", data: ["SIMI-MIX", "ag/gemini-3.1-pro-low", "cx/gpt-5-mini", "cc/claude-haiku-5"].map((id) => ({ id })) })); }
    if (req.url === "/v1/responses") {
      calls.push(body.model);
      res.writeHead(200, { "content-type": "text/event-stream" });
      if (/gemini/.test(body.model)) return res.end(`event: error\ndata: ${JSON.stringify({ type: "error", error: { message: `[antigravity/gemini-3.1-pro-low] [403]: HTTP 403 (reset after 2m)` } })}\n\n`);
      return res.end(`event: response.output_text.delta\ndata: ${JSON.stringify({ type: "response.output_text.delta", delta: `Chào bạn, ${body.model} đây.` })}\n\n`);
    }
    res.writeHead(404); res.end("{}");
  });
  const upPort = await listen(up);
  const keys = { ltn: "key-ltn-fb", ngoc: "key-ngoc-fb", bot: "key-bot-fb" };
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "IT", displayName: "IT", keyHash: hash("x"), enabled: true, memoryFile: "IT.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {
    "it-ltn": { displayName: "LTN", teamId: "IT", keyHash: hash(keys.ltn), enabled: true },
    "it-ngoc": { displayName: "Ngọc", teamId: "IT", keyHash: hash(keys.ngoc), enabled: true },
    "simi-bot": { displayName: "ChatBot", teamId: "IT", role: "PUBLIC_CHATBOT_SERVICE", memoryMode: "none", keyHash: hash(keys.bot), enabled: true }
  } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: `http://127.0.0.1:${upPort}`,
    LOBBY_ADMINS: "it-ltn", LOBBY_NPC_KEYS: keys.bot, CODEX_MODEL_SELECTION: "combo_members",
    CODEX_COMBO_PREMIUM: "SIMI-MIX", CODEX_COMBO_FREE: "SIMI-FREE", CODEX_DEFAULT_POLICY: "limited_daily", CODEX_DEFAULT_PREMIUM_LIMIT: "50",
    CODEX_USAGE_FILE: join(root, "codex-usage.json"), CODEX_USAGE_TIMEZONE: "Asia/Ho_Chi_Minh"
  });
  delete process.env.LOBBY_NPC_MODEL;
  const { createGatewayServer } = await import(`../src/server.mjs?npcfallback=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const post = (k, path, body) => fetch(`${base}/${path}`, { method: "POST", headers: { authorization: `Bearer ${keys[k]}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const get = (k, path) => fetch(`${base}/${path}`, { headers: { authorization: `Bearer ${keys[k]}` } });
  try {
    await (await get("ngoc", "members")).json();
    assert.equal((await post("ltn", "admin", { action: "npc", id: "u:simi-bot" })).status, 200);
    // admin xem model tài khoản Trợ lý được dùng
    const list = await (await get("ltn", "admin/npc-models")).json();
    assert.deepEqual([...list.models].sort(), ["ag/gemini-3.1-pro-low", "cc/claude-haiku-5", "cx/gpt-5-mini"]);
    assert.equal(list.mode, "combo_members", "chế độ chọn model trong Combo → chọn model có tác dụng");
    assert.equal((await get("ngoc", "admin/npc-models")).status, 403, "người thường không xem được");
    // admin ưu tiên Gemini rồi Claude
    assert.equal((await post("ltn", "admin", { action: "npc-models", models: ["ag/gemini-3.1-pro-low", "cc/claude-haiku-5"] })).status, 200);
    let r = await post("ngoc", "npc/ask", { question: "Chào?" });
    let j = await r.json();
    assert.equal(r.status, 200, JSON.stringify(j));
    assert.deepEqual(calls, ["ag/gemini-3.1-pro-low", "cc/claude-haiku-5"], "Gemini lỗi → chuyển sang model kế tiếp admin chọn");
    assert.equal(j.model, "cc/claude-haiku-5");
    // câu sau: Gemini đang tạm nghỉ (reset after 2m) → hỏi Claude ngay, không chờ Gemini lỗi lại
    calls.length = 0;
    j = await (await post("ngoc", "npc/ask", { question: "Thêm câu nữa?" })).json();
    assert.deepEqual(calls, ["cc/claude-haiku-5"]);
    const st = await (await get("ltn", "admin/npc-models")).json();
    assert.ok(st.health["ag/gemini-3.1-pro-low"].cooling > Date.now() + 60_000, "Gemini tạm nghỉ ~2 phút");
    assert.equal(st.health["cc/claude-haiku-5"].ok, true);
    assert.deepEqual(st.selected, ["ag/gemini-3.1-pro-low", "cc/claude-haiku-5"]);
    const admin = await (await get("ltn", "admin")).json();
    assert.equal(admin.npcLog[0].model, "cc/claude-haiku-5", "nhật ký ghi model đã trả lời");
    // đổi lại đúng tài khoản cũ: giữ danh sách model
    await post("ltn", "admin", { action: "npc", id: "u:simi-bot" });
    assert.deepEqual((await (await get("ltn", "admin/npc-models")).json()).selected, ["ag/gemini-3.1-pro-low", "cc/claude-haiku-5"]);
  } finally {
    await new Promise((res) => server.close(res)); up.close();
  }
});
