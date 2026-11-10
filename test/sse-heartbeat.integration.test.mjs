// Model im lặng lâu giữa các sự kiện SSE (suy nghĩ lâu, ngữ cảnh lớn) → Gateway gửi ": keepalive" để Cloudflare / proxy
// không cắt kết nối (Codex báo "stream disconnected before completion"); chỉ chèn giữa 2 sự kiện, không làm hỏng dữ liệu.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("SSE im lặng lâu → Gateway gửi keepalive giữa các sự kiện, câu trả lời vẫn nguyên vẹn", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-sse-hb-"));
  const up = http.createServer(async (req, res) => {
    let raw = ""; for await (const c of req) raw += c;
    if (req.url === "/v1/models") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ data: [{ id: "SIMI-GPT", owned_by: "combo" }, { id: "SIMI-FREE", owned_by: "combo" }] })); }
    if (req.url === "/v1/responses") {
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.write('data: {"type":"response.created","response":{"id":"r1","status":"in_progress"}}\n\n');
      await sleep(400);
      // sự kiện bị chia làm 2 gói, im lặng ở giữa → không được chèn keepalive vào giữa sự kiện
      res.write('data: {"type":"response.output_text.delta",');
      await sleep(400);
      res.write('"delta":"Xin chào"}\n\n');
      await sleep(400);
      return res.end('data: {"type":"response.completed","response":{"id":"r1","status":"completed"}}\n\n');
    }
    res.writeHead(404); res.end("{}");
  });
  const upPort = await listen(up);
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "IT", displayName: "IT", keyHash: hash("x"), enabled: true, memoryFile: "IT.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: { "it-a": { displayName: "A", teamId: "IT", keyHash: hash("key-a"), enabled: true, memoryMode: "none" } } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: `http://127.0.0.1:${upPort}`,
    CODEX_COMBO_PREMIUM: "SIMI-GPT", CODEX_COMBO_FREE: "SIMI-FREE", CODEX_DEFAULT_POLICY: "premium_always",
    CODEX_USAGE_FILE: join(root, "usage.json"), CODEX_USAGE_TIMEZONE: "Asia/Ho_Chi_Minh", SSE_HEARTBEAT_MS: "250"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?ssehb=${Date.now()}`);
  const server = createGatewayServer();
  const port = await listen(server);
  try {
    const r = await fetch(`http://127.0.0.1:${port}/v1/responses`, {
      method: "POST",
      headers: { authorization: "Bearer key-a", "content-type": "application/json", accept: "text/event-stream", "x-ltn-client-id": "11111111-2222-4333-8444-555555555555" },
      body: JSON.stringify({ model: "SIMI-GPT", input: "hi", stream: true })
    });
    assert.equal(r.status, 200);
    const body = await r.text();
    assert.ok((body.match(/^: keepalive$/gm) || []).length >= 2, "có keepalive khi im lặng:\n" + body);
    assert.match(body, /data: \{"type":"response\.output_text\.delta","delta":"Xin chào"\}\n\n/, "sự kiện bị chia gói vẫn nguyên vẹn (không chèn keepalive vào giữa)");
    for (const block of body.split("\n\n").filter(Boolean)) assert.ok(block === ": keepalive" || block.startsWith("data: {"), "khối SSE hợp lệ: " + block);
    assert.match(body, /response\.completed/);
  } finally {
    await new Promise((res) => server.close(res)); up.close();
  }
});
