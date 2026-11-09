// Công cụ Gateway gốc của simi_browser: tìm web, đọc web, tạo / sửa ảnh – mỗi việc 1 lần gọi, chạy ngoài sandbox Codex,
// tự chọn model qua discovery, tự dự phòng khi model đầu lỗi, không lộ key.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(4000, 7)]);

test("web_search, web_fetch, image_generate gọi Gateway 1 lần, có dự phòng", async () => {
  const seen = [];
  const gateway = http.createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const json = body ? JSON.parse(body) : null;
    seen.push({ url: req.url, auth: req.headers.authorization, client: req.headers["x-ltn-client-id"], body: json });
    const send = (status, payload) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(payload)); };
    if (req.url === "/v1/models/web") return send(200, { data: [{ id: "tavily/search", kind: "webSearch" }, { id: "search-combo", kind: "webSearch" }, { id: "jina/fetch", kind: "webFetch" }] });
    if (req.url === "/v1/search") {
      if (json.model === "search-combo") return send(502, { error: { message: "provider down" } });
      return send(200, { results: [{ title: "Giá vàng hôm nay", url: "https://vd.vn/vang", snippet: "Giá vàng tăng 2%", published_at: "2026-11-04" }] });
    }
    if (req.url === "/v1/web/fetch") return send(200, { title: "Bài viết", url: json.url, content: { format: "markdown", text: "# Tiêu đề\nNội dung bài viết tiếng Việt." } });
    if (req.url === "/v1/models/image") return send(200, { data: [{ id: "cx/gpt-image-2" }, { id: "gg/gemini-3-pro-image" }] });
    if (req.url.startsWith("/v1/models/info")) return send(200, { capabilities: ["generate", "edit"] });
    if (req.url === "/v1/images/generations") {
      if (json.model === "gg/gemini-3-pro-image") return send(500, { error: { message: "upstream error" } });
      return send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    }
    send(404, {});
  });
  await new Promise((resolve) => gateway.listen(0, "127.0.0.1", resolve));
  const home = mkdtempSync(join(tmpdir(), "simi-gw-tools-"));
  writeFileSync(join(home, "config.toml"), 'model = "ag/gemini-3-pro"\n');
  const mcp = spawn(process.execPath, [join(import.meta.dirname, "..", "scripts", "browser-mcp.mjs")], {
    env: { ...process.env, CODEX_HOME: home, LTN_GATEWAY_BASE_URL: `http://127.0.0.1:${gateway.address().port}/v1`, LTN_TEAM_API_KEY: "k-test-secret", LTN_CLIENT_ID: "client-abc-123", TMPDIR: home, TEMP: home, TMP: home },
    stdio: ["pipe", "pipe", "inherit"]
  });
  let buf = ""; const waiting = new Map(); let seq = 0;
  mcp.stdout.on("data", (chunk) => {
    buf += chunk; let index;
    while ((index = buf.indexOf("\n")) >= 0) { const line = buf.slice(0, index); buf = buf.slice(index + 1); try { const msg = JSON.parse(line); waiting.get(msg.id)?.(msg.result); } catch {} }
  });
  const rpc = (method, params) => new Promise((resolve) => { const id = ++seq; waiting.set(id, resolve); mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); });
  const call = (name, args) => rpc("tools/call", { name, arguments: args });
  const text = (result) => result.content.map((part) => part.text || "").join("\n");
  try {
    const { tools } = await rpc("tools/list", {});
    assert.ok(["web_search", "web_fetch", "image_generate"].every((name) => tools.some((tool) => tool.name === name)));

    const found = await call("web_search", { query: "giá vàng hôm nay" });
    assert.ok(!found.isError, text(found));
    assert.match(text(found), /Giá vàng hôm nay[\s\S]*https:\/\/vd\.vn\/vang[\s\S]*Giá vàng tăng 2%/);
    assert.deepEqual(seen.filter((s) => s.url === "/v1/search").map((s) => s.body.model), ["search-combo", "tavily/search"], "combo trước, lỗi thì tự chuyển");

    const page = await call("web_fetch", { url: "https://vd.vn/bai" });
    assert.match(text(page), /Nội dung bài viết tiếng Việt/);

    const out = join(home, "outputs", "banner.png");
    const made = await call("image_generate", { prompt: "Banner Tết", output_path: out });
    const result = JSON.parse(text(made));
    assert.equal(result.ok, true, text(made));
    assert.equal(result.model, "cx/gpt-image-2", "model Gemini lỗi → tự chuyển sang model kế tiếp");
    assert.ok(existsSync(result.path) && readFileSync(result.path).length === PNG.length);
    assert.deepEqual(seen.filter((s) => s.url === "/v1/images/generations").map((s) => s.body.model), ["gg/gemini-3-pro-image", "cx/gpt-image-2"], "chat Gemini → Gemini image trước");
    const again = JSON.parse(text(await call("image_generate", { prompt: "Banner Tết", output_path: out })));
    assert.notEqual(again.path, result.path, "không ghi đè ảnh cũ");

    assert.ok(seen.every((s) => s.auth === "Bearer k-test-secret" && s.client === "client-abc-123"), "gửi đúng key + client ID");
    assert.ok(!JSON.stringify([found, page, made]).includes("k-test-secret"), "không lộ key trong kết quả");
  } finally {
    mcp.kill(); gateway.close();
  }
});
