// Tạo / sửa ảnh chất lượng cao mất hơn 100 giây mà không trả byte nào → Cloudflare cắt (524) dù model vẫn đang vẽ.
// Client gửi X-LTN-Keepalive: 1 → Gateway trả 200 ngay, gửi khoảng trắng giữ kết nối, xong mới gửi JSON;
// lỗi upstream gói trong __ltn_status. Client không gửi header thì hành vi y như cũ.
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

test("ảnh: giữ kết nối bằng khoảng trắng, JSON kết quả nguyên vẹn; lỗi upstream gói trong __ltn_status; không header thì như cũ", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-img-ka-"));
  const up = http.createServer(async (req, res) => {
    let raw = ""; for await (const c of req) raw += c;
    if (req.url === "/v1/models") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ data: [{ id: "SIMI-GPT", owned_by: "combo" }] })); }
    if (req.url === "/v1/images/generations") {
      const body = JSON.parse(raw);
      await sleep(900);
      if (body.model === "hong") { res.writeHead(400, { "content-type": "application/json" }); return res.end(JSON.stringify({ error: { message: "Unknown parameter: 'input_fidelity'." } })); }
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ data: [{ b64_json: "QUJD" }] }));
    }
    res.writeHead(404); res.end("{}");
  });
  const upPort = await listen(up);
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "IT", displayName: "IT", keyHash: hash("x"), enabled: true, memoryFile: "IT.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: { "it-a": { displayName: "A", teamId: "IT", keyHash: hash("key-a"), enabled: true, memoryMode: "none" } } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: `http://127.0.0.1:${upPort}`,
    CODEX_COMBO_PREMIUM: "SIMI-GPT", CODEX_COMBO_FREE: "SIMI-GPT", CODEX_DEFAULT_POLICY: "premium_always",
    CODEX_USAGE_FILE: join(root, "usage.json"), CODEX_USAGE_TIMEZONE: "Asia/Ho_Chi_Minh", CAPABILITY_KEEPALIVE_MS: "200"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?imgka=${Date.now()}`);
  const server = createGatewayServer();
  const port = await listen(server);
  const post = (model, keep) => fetch(`http://127.0.0.1:${port}/v1/images/generations`, {
    method: "POST",
    headers: { authorization: "Bearer key-a", "content-type": "application/json", "x-ltn-client-id": "11111111-2222-4333-8444-555555555555", ...(keep ? { "x-ltn-keepalive": "1" } : {}) },
    body: JSON.stringify({ model, prompt: "a cat" })
  });
  try {
    const t0 = Date.now();
    const ok = await post("cx/gpt-image-2", true);
    assert.equal(ok.status, 200);
    assert.ok(Date.now() - t0 < 600, "trả header ngay, không chờ model vẽ xong");
    const text = await ok.text();
    assert.match(text, /^ {3,}\{/, "có khoảng trắng giữ kết nối trước JSON");
    assert.deepEqual(JSON.parse(text), { data: [{ b64_json: "QUJD" }] });

    const bad = await post("hong", true);
    assert.equal(bad.status, 200);
    const wrapped = JSON.parse(await bad.text());
    assert.equal(wrapped.__ltn_status, 400);
    assert.match(JSON.parse(wrapped.__ltn_body).error.message, /input_fidelity/);

    const plain = await post("hong", false);
    assert.equal(plain.status, 400, "không xin giữ kết nối → mã lỗi như cũ");
    const fine = await post("cx/gpt-image-2", false);
    assert.equal((await fine.text()).trim(), JSON.stringify({ data: [{ b64_json: "QUJD" }] }));
  } finally {
    await new Promise((res) => server.close(res)); up.close();
  }
});
