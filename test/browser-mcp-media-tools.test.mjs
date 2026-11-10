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
    assert.equal(gen[0].body.quality, "high", "mặc định chất lượng cao như giao diện gốc");
    assert.match(r.reply, /1–2 câu/);
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

test("image_generate: model đầu chậm → sau vài giây chạy model kế tiếp song song, lấy ảnh xong trước; sửa ảnh hỏi khả năng các model cùng lúc", async () => {
  let infoInFlight = 0; let maxInFlight = 0;
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: [{ id: "cx/gpt-image-2" }, { id: "gg/gemini-3-pro-image" }] });
    if (url.startsWith("/v1/models/info")) { infoInFlight += 1; maxInFlight = Math.max(maxInFlight, infoInFlight); return setTimeout(() => { infoInFlight -= 1; send(200, { capabilities: ["generate", "edit"] }); }, 200); }
    if (url === "/v1/images/generations") {
      if (body.model === "cx/gpt-image-2") return setTimeout(() => send(200, { data: [{ b64_json: PNG.toString("base64") }] }), 4000);
      return setTimeout(() => send(200, { data: [{ b64_json: PNG.toString("base64") }] }), 300);
    }
    send(404, {});
  }, "cx/gpt-6.1-sol", { LTN_IMAGE_HEDGE_MS: "500" });
  try {
    const src = join(t.home, "goc.png"); writeFileSync(src, PNG);
    const t0 = Date.now();
    const r = JSON.parse(t.text(await t.call("image_generate", { prompt: "Sharpen the logo", mode: "edit", source_path: src, output_path: join(t.home, "out", "net.png") })));
    assert.equal(r.ok, true);
    assert.equal(r.model, "gg/gemini-3-pro-image", "model nhanh hơn thắng");
    assert.ok(Date.now() - t0 < 3000, "không chờ model chậm 4 giây");
    assert.equal(maxInFlight, 2, "hỏi khả năng sửa ảnh của 2 model cùng lúc");
  } finally { t.stop(); }
});

test("image_retouch: làm rõ chữ mờ ngay trên máy, giữ nguyên phần còn lại của ảnh", async () => {
  const py = (() => { for (const c of ["python3", "python"]) { try { execFileSync(c, ["-c", "import PIL"]); return c; } catch {} } return null; })();
  if (!py) return;
  const t = await start((_e, send) => send(404, {}), "cc/claude-sonnet-5-5", { LTN_PYTHON_PATH: execFileSync(py, ["-c", "import sys; print(sys.executable)"]).toString().trim(), LTN_IMAGE_RETOUCH_PATH: join(import.meta.dirname, "..", "scripts", "image-retouch.py") });
  try {
    const src = join(t.home, "den.png");
    execFileSync(py, ["-c", `from PIL import Image, ImageDraw, ImageFilter
im = Image.new("RGB", (400, 200), (236, 236, 232))
d = ImageDraw.Draw(im); d.rectangle((10, 150, 60, 190), fill=(200, 30, 30))
d.text((170, 80), "UNIQ", fill=(120, 120, 120))
im = im.filter(ImageFilter.GaussianBlur(3)); im.save(${JSON.stringify(src)})`]);
    const info = JSON.parse(t.text(await t.call("image_retouch", { source_path: src, inspect: true })));
    assert.deepEqual([info.width, info.height], [400, 200]);
    const out = join(t.home, "outputs", "den-net.png");
    const r = JSON.parse(t.text(await t.call("image_retouch", { source_path: src, output_path: out, ops: [
      { op: "erase", box: [0.35, 0.33, 0.65, 0.55] },
      { op: "text", text: "UNIQ", box: [0.38, 0.35, 0.62, 0.53], color: "#5a5a5a", font: "bold" },
      { op: "sharpen", amount: 120, box: [0.3, 0.3, 0.7, 0.6] }
    ] })));
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.deepEqual(r.applied, ["erase", "text", "sharpen"]);
    assert.ok(r.seconds < 10);
    const px = JSON.parse(execFileSync(py, ["-c", `import json; from PIL import Image
a = Image.open(${JSON.stringify(src)}).convert("RGB"); b = Image.open(${JSON.stringify(out)}).convert("RGB")
dark = sum(1 for x in range(150, 250) for y in range(70, 110) if sum(b.getpixel((x, y))) < 400)
print(json.dumps({"corner_same": a.getpixel((30, 170)) == b.getpixel((30, 170)), "dark": dark}))`]).toString());
    assert.equal(px.corner_same, true, "phần ngoài vùng sửa giữ nguyên");
    if (process.env.KEEP_RETOUCH) execFileSync("cp", [src, out, process.env.KEEP_RETOUCH]);
    assert.ok(px.dark > 150, "chữ mới rõ nét");
    assert.match(t.text(await t.call("image_retouch", { source_path: src, output_path: src, ops: [{ op: "sharpen" }] })), /Không ghi đè ảnh gốc/);
  } finally { t.stop(); }
});

// Ảnh theo model chat đang chọn: GPT → gpt-image, Gemini → Gemini, Muse → Muse; không tự rơi vào Muse
const IMG_IDS = ["muse2api/muse-image-chat", "gg/gemini-3-pro-image", "cx/gpt-image-2", "pf/flux-2-pro"];
async function firstImageModel(chat, { fail = [], appModel = null } = {}) {
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: IMG_IDS.map((id) => ({ id })) });
    if (url === "/v1/images/generations") return fail.includes(body.model) ? send(500, { error: { message: "upstream lỗi" } }) : send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    send(404, {});
  }, chat);
  if (appModel) writeFileSync(join(t.home, "ltn-chat-model.json"), JSON.stringify({ model: appModel, at: Date.now() }));
  try {
    const r = JSON.parse(t.text(await t.call("image_generate", { prompt: "A cute baby dragon", output_path: join(t.home, "out", "rong.png") })));
    return { r, tried: t.seen.filter((s) => s.url === "/v1/images/generations").map((s) => s.body.model) };
  } finally { t.stop(); }
}

test("image_generate theo model chat: GPT → gpt-image, Gemini → Gemini; Muse chỉ khi gọi đích danh (skill Muse)", async () => {
  assert.equal((await firstImageModel("cx/gpt-6.1-sol")).r.model, "cx/gpt-image-2");
  assert.equal((await firstImageModel("ag/gemini-3-pro")).r.model, "gg/gemini-3-pro-image");
  assert.ok(!/muse/.test((await firstImageModel("muse2api/muse-spark-1.3")).r.model), "chat bằng Muse cũng không tự vẽ bằng Muse");
  assert.equal((await firstImageModel("SIMI-GPT")).r.model, "cx/gpt-image-2", "Combo tên GPT cũng tính là GPT");
});

test("image_generate: đang chat GPT mà gpt-image lỗi thì dự phòng model khác, KHÔNG tự chuyển sang Muse", async () => {
  const { r, tried } = await firstImageModel("cx/gpt-6.1-sol", { fail: ["cx/gpt-image-2"] });
  assert.equal(r.ok !== false, true);
  assert.ok(!tried.some((m) => /muse/i.test(m)), "không thử Muse: " + tried.join(", "));
  const claude = await firstImageModel("cc/claude-opus-5-5", { fail: ["cx/gpt-image-2", "gg/gemini-3-pro-image", "pf/flux-2-pro"] });
  assert.ok(!claude.tried.some((m) => /muse/i.test(m)), "Claude cũng không tự dùng Muse");
});

test("image_generate: gọi đích danh model Muse thì mới dùng Muse", async () => {
  const t = await start(({ url }, send) => {
    if (url === "/v1/models/image") return send(200, { data: IMG_IDS.map((id) => ({ id })) });
    if (url === "/v1/images/generations") return send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    send(404, {});
  }, "cx/gpt-6.1-sol");
  try {
    const r = JSON.parse(t.text(await t.call("image_generate", { prompt: "dragon", model: "muse2api/muse-image-chat", output_path: join(t.home, "out", "m.png") })));
    assert.equal(r.model, "muse2api/muse-image-chat");
  } finally { t.stop(); }
});

test("image_generate: lấy model người dùng ĐANG chọn trong app (không theo config.toml / AI tự điền)", async () => {
  const { r } = await firstImageModel("cx/gpt-6.1-sol", { appModel: "ag/gemini-3-pro" });
  assert.equal(r.model, "gg/gemini-3-pro-image");
});

test("image_generate: lỗi 5xx / mất kết nối không đánh dấu model hỏng; model bị đánh dấu vẫn được thử sau cùng", async () => {
  let fail = true;
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: [{ id: "cx/gpt-image-2" }, { id: "gg/gemini-3-pro-image" }] });
    if (url === "/v1/images/generations") return fail ? send(502, { error: { message: "upstream connection error" } }) : send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    send(404, {});
  }, "cx/gpt-6.1-sol");
  try {
    const first = JSON.parse(t.text(await t.call("image_generate", { prompt: "rồng con dễ thương", output_path: join(t.home, "o", "a.png") })));
    assert.equal(first.ok, false);
    assert.match(first.errors[0].error, /upstream connection error/, "trả đúng câu lỗi cho AI báo lại");
    const badFile = join(t.home, "simi-image-bad.json");
    assert.ok(!existsSync(badFile) || !JSON.parse(readFileSync(badFile, "utf8"))["cx/gpt-image-2"], "502 không bị nhớ là model hỏng");
    writeFileSync(badFile, JSON.stringify({ "cx/gpt-image-2": Math.floor(Date.now() / 1000), "gg/gemini-3-pro-image": Math.floor(Date.now() / 1000) }));
    fail = false; t.seen.length = 0;
    const second = JSON.parse(t.text(await t.call("image_generate", { prompt: "rồng con dễ thương", output_path: join(t.home, "o", "b.png") })));
    assert.equal(second.ok, true, "mọi model đều bị đánh dấu thì vẫn thử, không báo hết model");
    assert.equal(t.seen.find((s) => s.url === "/v1/images/generations").body.model, "cx/gpt-image-2");
  } finally { t.stop(); }
});

// PNG thật 300x200 (ngang) / WebP tối thiểu: chỉ cần phần đầu file đúng chuẩn
function pngOf(width, height) {
  const head = Buffer.alloc(24); Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(head);
  head.writeUInt32BE(13, 8); head.write("IHDR", 12, "latin1"); head.writeUInt32BE(width, 16); head.writeUInt32BE(height, 20);
  return Buffer.concat([head, Buffer.alloc(4000, 7)]);
}
function webpOf(width, height) {
  const head = Buffer.alloc(30); head.write("RIFF", 0, "latin1"); head.write("WEBP", 8, "latin1"); head.write("VP8X", 12, "latin1");
  head.writeUIntLE(width - 1, 24, 3); head.writeUIntLE(height - 1, 27, 3);
  return Buffer.concat([head, Buffer.alloc(4000, 7)]);
}

test("image_generate sửa ảnh: giữ tỉ lệ ảnh gốc, xin giữ chi tiết (input_fidelity); provider không nhận tham số thì bỏ tham số gọi lại; lưu đúng đuôi file", async () => {
  let calls = 0;
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: [{ id: "cx/gpt-image-2" }] });
    if (url.startsWith("/v1/models/info")) return send(200, { capabilities: ["generate", "edit"] });
    if (url === "/v1/images/generations") {
      calls += 1;
      if (body.input_fidelity) return send(400, { error: { message: "Unknown parameter: 'input_fidelity'." } });
      return send(200, { data: [{ b64_json: webpOf(1536, 1024).toString("base64") }] });
    }
    send(404, {});
  }, "cx/gpt-6.1-sol");
  try {
    const src = join(t.home, "banner.png"); writeFileSync(src, pngOf(300, 200));
    const r = JSON.parse(t.text(await t.call("image_generate", { prompt: "Remove the watermark, keep everything else", mode: "edit", source_path: src, output_path: join(t.home, "out", "banner-sach.png") })));
    assert.equal(r.ok, true, JSON.stringify(r));
    const gen = t.seen.filter((s) => s.url === "/v1/images/generations");
    assert.equal(calls, 2, "bị từ chối tham số → gọi lại 1 lần, không báo model hỏng");
    assert.equal(gen[0].body.size, "1536x1024", "ảnh gốc ngang → ảnh sửa cũng ngang");
    assert.equal(gen[0].body.input_fidelity, "high");
    assert.equal(gen[1].body.input_fidelity, undefined);
    assert.equal(gen[1].body.quality, undefined);
    assert.equal(gen[1].body.size, "1536x1024");
    assert.match(r.path, /banner-sach\.webp$/, "model trả WebP → lưu .webp");
    assert.deepEqual([r.width, r.height], [1536, 1024]);
    assert.ok(existsSync(r.path));
  } finally { t.stop(); }
});

test("image_generate: quality medium khi cần bản nháp nhanh; ảnh gốc dọc → khổ dọc; ảnh gốc lạ thì để model tự chọn khổ", async () => {
  const t = await start(({ url }, send) => {
    if (url === "/v1/models/image") return send(200, { data: [{ id: "cx/gpt-image-2" }] });
    if (url.startsWith("/v1/models/info")) return send(200, { capabilities: ["generate", "edit"] });
    if (url === "/v1/images/generations") return send(200, { data: [{ b64_json: pngOf(1024, 1536).toString("base64") }] });
    send(404, {});
  }, "cx/gpt-6.1-sol");
  try {
    const doc = join(t.home, "doc.png"); writeFileSync(doc, pngOf(1080, 1920));
    const la = join(t.home, "la.png"); writeFileSync(la, Buffer.alloc(3000, 1));
    await t.call("image_generate", { prompt: "Brighten", mode: "edit", source_path: doc, quality: "medium", output_path: join(t.home, "out", "a.png") });
    await t.call("image_generate", { prompt: "Brighten", mode: "edit", source_path: la, output_path: join(t.home, "out", "b.png") });
    const gen = t.seen.filter((s) => s.url === "/v1/images/generations");
    assert.equal(gen[0].body.size, "1024x1536");
    assert.equal(gen[0].body.quality, "medium");
    assert.equal(gen[1].body.size, undefined);
  } finally { t.stop(); }
});

test("image_generate xin Gateway giữ kết nối (không bị cắt sau 100 giây); lỗi gói trong __ltn_status vẫn đọc đúng; ảnh gốc quá lớn được thu nhỏ trước khi gửi", async () => {
  const py = (() => { for (const c of ["python3", "python"]) { try { execFileSync(c, ["-c", "import PIL"]); return c; } catch {} } return null; })();
  let n = 0;
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: [{ id: "cx/gpt-image-2" }, { id: "gg/gemini-3-pro-image" }] });
    if (url.startsWith("/v1/models/info")) return send(200, { capabilities: ["generate", "edit"] });
    if (url === "/v1/images/generations") {
      n += 1;
      // Gateway ở chế độ giữ kết nối: luôn 200, lỗi upstream nằm trong __ltn_status
      if (body.model === "cx/gpt-image-2") return send(200, { __ltn_status: 500, __ltn_body: JSON.stringify({ error: { message: "upstream overloaded" } }) });
      return send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    }
    send(404, {});
  }, "cx/gpt-6.1-sol", py ? { LTN_PYTHON_PATH: execFileSync(py, ["-c", "import sys; print(sys.executable)"]).toString().trim(), LTN_IMAGE_RETOUCH_PATH: join(import.meta.dirname, "..", "scripts", "image-retouch.py") } : {});
  try {
    const src = join(t.home, "anh-dien-thoai.jpg");
    if (py) execFileSync(py, ["-c", `from PIL import Image
import os
im = Image.frombytes("RGB", (4000, 3000), os.urandom(4000 * 3000 * 3)); im.save(${JSON.stringify(src)}, quality=90)`]);
    else writeFileSync(src, pngOf(300, 200));
    const r = JSON.parse(t.text(await t.call("image_generate", { prompt: "Change the background", mode: "edit", source_path: src, output_path: join(t.home, "out", "nen-moi.png") })));
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.model, "gg/gemini-3-pro-image", "model đầu lỗi (gói trong __ltn_status) → dùng model dự phòng");
    const gen = t.seen.filter((s) => s.url === "/v1/images/generations");
    assert.ok(gen.length >= 2 && n >= 2);
    if (py) {
      const sent = Buffer.from(gen[0].body.image.split(",")[1], "base64");
      assert.ok(sent.length < readFileSync(src).length / 2, "ảnh gửi đi nhỏ hơn hẳn ảnh gốc");
      assert.match(gen[0].body.image, /^data:image\/jpeg/);
      assert.equal(gen[0].body.size, "1536x1024");
    }
  } finally { t.stop(); }
});

test("tài khoản gpt-image lỗi (như 'gpt-5.5 is not supported'): bỏ qua model cùng tài khoản, để CHÍNH model chat GPT tự tạo ảnh như ChatGPT gốc", async () => {
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: ["cx/gpt-image-2.5", "cx/gpt-image-2.5-flare", "cx/gpt-image-2.5-sunburst", "gg/gemini-3-pro-image"].map((id) => ({ id })) });
    if (url.startsWith("/v1/models/info")) return send(200, { capabilities: ["generate", "edit"] });
    if (url === "/v1/images/generations") {
      if (body.model.startsWith("cx/")) return send(400, { error: { message: "The 'gpt-5.5' model is not supported when using Codex with a ChatGPT account." } });
      return send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    }
    if (url === "/v1/responses") {
      assert.equal(body.model, "cx/gpt-6.1-sol");
      assert.deepEqual(body.tools, [{ type: "image_generation" }], "công cụ để trống tham số như ChatGPT gốc");
      assert.match(body.input[0].content[0].image_url, /^data:image\/png;base64,/);
      return send(200, { output: [{ type: "image_generation_call", status: "completed", result: pngOf(1024, 1024).toString("base64") }] });
    }
    send(404, {});
  }, "cx/gpt-6.1-sol");
  try {
    const src = join(t.home, "den.png"); writeFileSync(src, pngOf(800, 800));
    const r = JSON.parse(t.text(await t.call("image_generate", { prompt: "Keep the lamp exactly, replace the background with a bright study desk", mode: "edit", source_path: src, output_path: join(t.home, "out", "den-nen-moi.png") })));
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.match(r.model, /gpt-6\.1-sol/);
    const gen = t.seen.filter((s) => s.url === "/v1/images/generations").map((s) => s.body.model);
    assert.deepEqual(gen, ["cx/gpt-image-2.5"], "model thứ 2 cùng tài khoản không bị gọi nữa, không rơi sang Gemini");
  } finally { t.stop(); }
});

test("chat GPT nhưng model chat chưa tự tạo ảnh được → dùng model ảnh hãng khác thay vì báo lỗi", async () => {
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: ["cx/gpt-image-2.5", "gg/gemini-3-pro-image"].map((id) => ({ id })) });
    if (url === "/v1/images/generations") {
      if (body.model.startsWith("cx/")) return send(400, { error: { message: "account not supported" } });
      return send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    }
    if (url === "/v1/responses") return send(200, { output: [{ type: "message", content: [{ type: "output_text", text: "I cannot create images." }] }] });
    send(404, {});
  }, "cx/gpt-6.1-sol");
  try {
    const r = JSON.parse(t.text(await t.call("image_generate", { prompt: "A lamp on a desk", output_path: join(t.home, "out", "den.png") })));
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.model, "gg/gemini-3-pro-image");
  } finally { t.stop(); }
});

test("9Router: gpt-image qua tài khoản ChatGPT tạo ảnh mới không gửi size (đi đường Images gốc, không lệ thuộc model chat nền); sửa ảnh gửi được ảnh tham chiếu", async () => {
  const t = await start(({ url }, send) => {
    if (url === "/v1/models/image") return send(200, { data: [{ id: "cx/gpt-image-2.5" }] });
    if (url.startsWith("/v1/models/info")) return send(200, { capabilities: ["text2img", "edit", "multiImage"] });
    if (url === "/v1/images/generations") return send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    send(404, {});
  }, "cx/gpt-6.1-sol");
  try {
    await t.call("image_generate", { prompt: "A poster of a desk lamp", size: "1024x1536", output_path: join(t.home, "out", "poster.png") });
    const src = join(t.home, "phong.png"); writeFileSync(src, pngOf(900, 600));
    const sp = join(t.home, "xe.png"); writeFileSync(sp, pngOf(500, 500));
    await t.call("image_generate", { prompt: "Put the bike from image1 into the room", mode: "edit", source_path: src, ref_paths: [sp], output_path: join(t.home, "out", "ghep.png") });
    const gen = t.seen.filter((s) => s.url === "/v1/images/generations");
    assert.equal(gen[0].body.size, undefined);
    assert.match(gen[0].body.prompt, /Output aspect ratio: portrait 2:3/);
    assert.equal(gen[1].body.size, "1536x1024");
    assert.equal(gen[1].body.images.length, 1);
    assert.equal(gen[1].body.host_model, "gpt-6.1-sol", "báo 9Router dùng chính model chat đang chọn làm model nền");
    assert.match(gen[1].body.image, /^data:image\/png/);
  } finally { t.stop(); }
});

test("sửa ảnh: gpt-image 2.6 đi trước 2.5; mọi model ảnh GPT báo \"Complexity 'medium' is not supported\" → chuyển ngay sang model chat tự vẽ / hãng khác và nhớ lại, lần sau không gửi thử nữa (tránh 9Router khoá model 30 giây)", async () => {
  let fail = false;
  const t = await start(({ url, body }, send) => {
    if (url === "/v1/models/image") return send(200, { data: ["cx/gpt-image-2.5", "cx/gpt-image-2.6-flare", "gg/gemini-3-pro-image"].map((id) => ({ id })) });
    if (url.startsWith("/v1/models/info")) return send(200, { capabilities: ["text2img", "edit"] });
    if (url === "/v1/images/generations") {
      if (fail && body.model.startsWith("cx/") && body.image) return send(502, { error: { message: "[codex/x] Complexity 'medium' is not supported for this image model. (reset after 30s)" } });
      return send(200, { data: [{ b64_json: PNG.toString("base64") }] });
    }
    send(404, {});
  }, "SIMI-GPT", { TMPDIR: mkdtempSync(join(tmpdir(), "simi-edit-broken-")) });
  try {
    const src = join(t.home, "den.png"); writeFileSync(src, pngOf(800, 800));
    const edit = async (name) => JSON.parse(t.text(await t.call("image_generate", { prompt: "Replace the background", mode: "edit", source_path: src, output_path: join(t.home, "out", name) })));
    const models = () => t.seen.filter((s) => s.url === "/v1/images/generations").map((s) => s.body.model);
    assert.equal((await edit("a.png")).model, "cx/gpt-image-2.6-flare", "2.6 được thử trước");
    fail = true; t.seen.length = 0;
    const b = await edit("b.png");
    assert.equal(b.model, "gg/gemini-3-pro-image");
    assert.deepEqual(models(), ["cx/gpt-image-2.6-flare", "gg/gemini-3-pro-image"], "1 model GPT báo complexity → không thử model GPT thứ 2");
    t.seen.length = 0;
    assert.equal((await edit("c.png")).model, "gg/gemini-3-pro-image");
    assert.deepEqual(models(), ["gg/gemini-3-pro-image"], "lần sau đi thẳng hãng khác");
    t.seen.length = 0;
    const g = JSON.parse(t.text(await t.call("image_generate", { prompt: "A lamp", output_path: join(t.home, "out", "moi.png") })));
    assert.match(g.model, /^cx\/gpt-image/, "tạo ảnh mới vẫn dùng gpt-image");
  } finally { t.stop(); }
});
