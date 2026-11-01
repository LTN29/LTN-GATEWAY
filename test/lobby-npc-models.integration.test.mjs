// Trợ lý SIMI khi Gateway bật chọn model theo Combo (CODEX_MODEL_SELECTION=combo_members): gửi "auto" sẽ bị từ chối,
// nên Gateway tự hỏi /v1/models bằng key NPC rồi chọn model nhanh trong Combo. Lỗi trả 503 kèm lý do (không phải 502).
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));

test("Trợ lý chọn đúng model trong Combo khi bật combo_members", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-npc-models-"));
  const seen = [];
  const up = http.createServer(async (req, res) => {
    let raw = ""; for await (const c of req) raw += c;
    const body = raw ? JSON.parse(raw) : {};
    seen.push({ url: req.url, body });
    if (req.url === "/api/combos") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ combos: [{ name: "SIMI-GPT", models: ["cx/gpt-5", "cx/gpt-5-mini"] }, { name: "SIMI-FREE", models: ["gc/gemini-2.5-flash"] }] })); }
    if (req.url === "/v1/models") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ object: "list", data: ["SIMI-GPT", "SIMI-FREE", "cx/gpt-5", "cx/gpt-5-mini", "gc/gemini-2.5-flash"].map((id) => ({ id, owned_by: id.startsWith("SIMI") ? "combo" : "x" })) })); }
    if (req.url === "/v1/responses") {
      if (body.stream !== true) { res.writeHead(400, { "content-type": "application/json" }); return res.end(JSON.stringify({ detail: "Stream must be set to true" })); }
      res.writeHead(200, { "content-type": "text/event-stream" });
      return res.end(`event: response.output_text.delta\ndata: ${JSON.stringify({ type: "response.output_text.delta", delta: `Model ${body.model} trả lời.` })}\n\n`);
    }
    res.writeHead(404); res.end("{}");
  });
  const upPort = await listen(up);
  const keys = { ltn: "key-ltn", ngoc: "key-ngoc", bot: "key-bot-secret" };
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
    CODEX_COMBO_PREMIUM: "SIMI-GPT", CODEX_COMBO_FREE: "SIMI-FREE", CODEX_DEFAULT_POLICY: "limited_daily", CODEX_DEFAULT_PREMIUM_LIMIT: "50",
    CODEX_USAGE_FILE: join(root, "codex-usage.json"), CODEX_USAGE_TIMEZONE: "Asia/Ho_Chi_Minh"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?npcmodels=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const post = (k, path, body) => fetch(`${base}/${path}`, { method: "POST", headers: { authorization: `Bearer ${keys[k]}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  try {
    await (await fetch(`${base}/members`, { headers: { authorization: `Bearer ${keys.ngoc}` } })).json();
    assert.equal((await post("ltn", "admin", { action: "npc", id: "u:simi-bot" })).status, 200);
    const r = await post("ngoc", "npc/ask", { question: "Chào?" });
    const j = await r.json();
    assert.equal(r.status, 200, JSON.stringify(j));
    const call = seen.filter((x) => x.url === "/v1/responses").at(-1);
    assert.ok(["cx/gpt-5-mini", "gc/gemini-2.5-flash"].includes(call.body.model), `chọn model nhanh trong Combo (đã chọn ${call.body.model})`);
    assert.match(j.answer, /trả lời/);
  } finally {
    await new Promise((r) => server.close(r)); up.close();
  }
});
