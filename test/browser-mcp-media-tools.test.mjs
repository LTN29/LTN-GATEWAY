// Ảnh đẹp hơn + chép lời audio: image_generate chọn model ảnh theo chất lượng (không rơi vào bản rút gọn / miễn phí),
// audio_transcribe gửi file qua Gateway (multipart) 1 lần, file dài tự cắt bằng ffmpeg, lỗi định dạng thì báo rõ.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(4000, 7)]);

async function start(handler, chatModel, extraEnv = {}) {
  const seen = [];
  const gateway = http.createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks);
    const type = String(req.headers["content-type"] || "");
    const body = type.includes("json") && raw.length ? JSON.parse(raw) : null;
    const entry = { url: req.url, type, body, raw }; seen.push(entry);
    const send = (status, payload) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(payload)); };
    handler(entry, send);
  });
  await new Promise((resolve) => gateway.listen(0, "127.0.0.1", resolve));
  const home = mkdtempSync(join(tmpdir(), "simi-media-"));
  writeFileSync(join(home, "config.toml"), `model = "${chatModel}"\n`);
  const mcp = spawn(process.execPath, [join(import.meta.dirname, "..", "scripts", "browser-mcp.mjs")], {
    env: { ...process.env, CODEX_HOME: home, LTN_GATEWAY_BASE_URL: `http://127.0.0.1:${gateway.address().port}/v1`, LTN_TEAM_API_KEY: "k-media", LTN_CLIENT_ID: "client-media-1", TMPDIR: home, TEMP: home, TMP: home, ...extraEnv },
    stdio: ["pipe", "pipe", "inherit"]
  });
  let buf = ""; const waiting = new Map(); let seq = 0;
  mcp.stdout.on("data", (chunk) => {
    buf += chunk; let i;
    while ((i = buf.indexOf("\n")) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1); try { const m = JSON.parse(line); waiting.get(m.id)?.(m.result); } catch {} }
  });
  const rpc = (method, params) => new Promise((resolve) => { const id = ++seq; waiting.set(id, resolve); mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); });
  const call = (name, args) => rpc("tools/call", { name, arguments: args });
  const text = (r) => r.content.map((p) => p.text || "").join("\n");
  return { seen, home, call, text, rpc, stop: () => { mcp.kill(); gateway.close(); } };
}

test("image_generate: chọn model ảnh tốt nhất trước, gpt-image xin chất lượng cao", async () => {
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: ["pf/flux-schnell", "cx/gpt-image-1-mini", "gg/gemini-2.5-flash-image", "cx/gpt-image-2", "free/sdxl-turbo"].map((id) => ({ id })) });
    if (url === "/v1/images/generations") return send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    send(404, {});
  }, "cx/gpt-6.1-sol");
  try {
    const r = JSON.parse(t.text(await t.call("image_generate", { prompt: "A cozy Vietnamese coffee shop, warm light, sign \"Cà phê Sữa\"", output_path: join(t.home, "out", "cafe.png") })));
    assert.equal(r.ok, true);
    const gen = t.seen.filter((s) => s.url === "/v1/images/generations");
    assert.equal(gen[0].body.model, "cx/gpt-image-2", "model ảnh mạnh nhất trước, không phải bản mini / schnell");
    assert.equal(gen[0].body.quality, "high");
  } finally { t.stop(); }
});

test("audio_transcribe: gửi file multipart, ưu tiên model tốt, lưu bản chép lời; định dạng lạ không có ffmpeg thì báo rõ", async () => {
  const t = await start(({ url, type, raw }, send) => {
    if (url === "/v1/models/stt") return send(200, { data: [{ id: "groq/whisper-large-v3-turbo" }, { id: "cx/gpt-4o-transcribe" }] });
    if (url === "/v1/audio/transcriptions") {
      assert.match(type, /^multipart\/form-data; boundary=/);
      const body = raw.toString("latin1");
      if (/name="language"/.test(body) && /cx\/gpt-4o-transcribe/.test(body) && /name="response_format"\r\n\r\njson/.test(body) === false) return send(400, { error: { message: "bad format" } });
      return send(200, { text: "Xin chào, đây là biên bản họp." });
    }
    send(404, {});
  }, "cc/claude-sonnet-5-5", { PATH: "/nonexistent" });
  try {
    const mp3 = join(t.home, "hop.mp3"); writeFileSync(mp3, Buffer.alloc(5000, 1));
    const out = join(t.home, "outputs", "bien-ban");
    const r = await t.call("audio_transcribe", { path: mp3, output_path: out });
    assert.ok(!r.isError, t.text(r));
    assert.match(t.text(r), /Xin chào, đây là biên bản họp\./);
    assert.equal(readFileSync(out + ".txt", "utf8"), "Xin chào, đây là biên bản họp.");
    const up = t.seen.find((s) => s.url === "/v1/audio/transcriptions").raw.toString("latin1");
    assert.match(up, /name="model"\r\n\r\ncx\/gpt-4o-transcribe/, "model chép lời tốt trước bản turbo");
    assert.match(up, /name="language"\r\n\r\nvi/);
    assert.match(up, /filename="hop\.mp3"/);

    const amr = join(t.home, "ghi-am.amr"); writeFileSync(amr, Buffer.alloc(5000, 1));
    const bad = JSON.parse(t.text(await t.call("audio_transcribe", { path: amr })));
    assert.equal(bad.ok, false);
    assert.match(bad.error, /cần ffmpeg/);
  } finally { t.stop(); }
});

test("audio_transcribe: file dài hơn giới hạn → cắt bằng ffmpeg rồi ghép lời", { skip: (() => { try { execFileSync("ffmpeg", ["-version"]); return false; } catch { return "không có ffmpeg"; } })() }, async () => {
  const t = await start(({ url }, send) => {
    if (url === "/v1/models/stt") return send(200, { data: [{ id: "cx/gpt-4o-transcribe" }] });
    if (url === "/v1/audio/transcriptions") return send(200, { text: "đoạn" });
    send(404, {});
  }, "cc/claude-sonnet-5-5");
  try {
    const wav = join(t.home, "dai.wav");
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=1900", "-ac", "1", "-ar", "8000", wav]);
    const r = await t.call("audio_transcribe", { path: wav, language: "auto" });
    assert.match(t.text(r), /3 đoạn 15 phút/);
    assert.equal(t.seen.filter((s) => s.url === "/v1/audio/transcriptions").length, 3);
    assert.ok(!t.seen.some((s) => /name="language"/.test(s.raw.toString("latin1"))), "auto → không gửi language");
  } finally { t.stop(); }
});
