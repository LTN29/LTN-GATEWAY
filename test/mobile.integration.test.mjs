import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));

// đọc sự kiện SSE từ fetch stream
function sse(url, headers) {
  const ctrl = new AbortController();
  const events = [];
  const waiters = [];
  const ready = fetch(url, { headers, signal: ctrl.signal }).then(async (res) => {
    if (res.status !== 200) { events.push({ event: "http", data: { status: res.status, body: await res.text() } }); flush(); return res; }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    (async () => {
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const block = buf.slice(0, i); buf = buf.slice(i + 2);
            const ev = /^event: (.+)$/m.exec(block); const data = /^data: (.+)$/m.exec(block);
            if (ev && data) { events.push({ event: ev[1], data: JSON.parse(data[1]) }); flush(); }
          }
        }
      } catch { /* đóng */ }
    })();
    return res;
  });
  function flush() {
    for (const w of [...waiters]) {
      const hit = events.find((e) => e.event === w.event && w.pred(e.data) && !w.seen.has(e));
      if (hit) { w.seen.add(hit); waiters.splice(waiters.indexOf(w), 1); clearTimeout(w.timer); w.resolve(hit.data); }
    }
  }
  return {
    ready, events,
    next(event, pred = () => true, ms = 3000) {
      return new Promise((resolve, reject) => {
        const w = { event, pred, resolve, seen: new Set() };
        w.timer = setTimeout(() => { waiters.splice(waiters.indexOf(w), 1); reject(new Error(`Không nhận được sự kiện ${event}`)); }, ms);
        waiters.push(w); flush();
      });
    },
    close() { ctrl.abort(); }
  };
}


// Sảnh trên điện thoại: máy tính tạo mã QR → điện thoại đổi lấy phiên → cùng 1 người trong Sảnh, chỉ dùng được Sảnh
test("Sảnh điện thoại: ghép bằng QR, cùng danh tính, Sảnh + Chat AI bằng key mã hoá, đăng xuất / đổi key là hết phiên", async () => {
  // 9Router giả: ghi lại key + mã máy nhận được, trả danh sách model / câu trả lời SSE
  const seen = [];
  const up = createServer((req, res) => {
    let body = ""; req.on("data", (c) => { body += c; });
    req.on("end", () => {
      seen.push({ path: req.url, auth: req.headers.authorization, cid: req.headers["x-ltn-client-id"] || "", body });
      if (req.url.startsWith("/v1/models")) { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ object: "list", data: [{ id: "cx/gpt-5.5", object: "model" }] })); }
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end('event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"Chào từ AI"}\n\nevent: response.completed\ndata: {"type":"response.completed","response":{"status":"completed","output":[{"type":"message","content":[{"type":"output_text","text":"Chào từ AI"}]}]}}\n\n');
    });
  });
  const upUrl = `http://127.0.0.1:${await listen(up)}`;
  const root = await mkdtemp(join(tmpdir(), "ltn-mobile-"));
  const keys = { ltn: "key-ltn", ngoc: "key-ngoc", team: "key-team-it" };
  const CID = "0b5c9a8e-1111-4222-8333-944455556666";
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [
    { code: "IT", displayName: "IT", keyHash: hash(keys.team), enabled: true, memoryFile: "IT.md", aiPolicy: { mode: "premium_always", premiumCombo: "SIMI-GPT" } },
    { code: "SALES", displayName: "Sales", keyHash: hash("unused"), enabled: true, memoryFile: "SALES.md" }
  ] }));
  const users = { version: 1, users: {
    "it-ltn": { displayName: "LTN", teamId: "IT", keyHash: hash(keys.ltn), enabled: true },
    "sales-ngoc": { displayName: "Ngọc", teamId: "SALES", keyHash: hash(keys.ngoc), enabled: true }
  } };
  await writeFile(join(root, "users.json"), JSON.stringify(users));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: upUrl,
    MOBILE_SESSIONS_FILE: join(root, "mobile", "sessions.json"), LOBBY_MSG_PER_10S: "100", LTN_LEGACY_TEAM_KEYS_ENABLED: "true"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?mobile=${Date.now()}`);
  const server = createGatewayServer();
  const origin = `http://127.0.0.1:${await listen(server)}`;
  const base = `${origin}/v1/lobby`;
  const bearer = (t, extra = {}) => ({ authorization: `Bearer ${t}`, ...extra });
  const pair = (key, extra = {}) => fetch(`${origin}/v1/mobile/pair`, { method: "POST", headers: bearer(key, extra) });
  const claim = (code) => fetch(`${origin}/v1/mobile/claim`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, device: "iPhone <script>" }) });
  const streams = [];
  try {
    // ---- trang PWA ----
    const page = await fetch(`${origin}/m`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get("content-security-policy"), /default-src 'self'/);
    assert.match(await page.text(), /Sảnh Văn Phòng AI/);
    assert.equal((await fetch(`${origin}/m/manifest.webmanifest`)).headers.get("content-type"), "application/manifest+json; charset=utf-8");
    assert.equal((await fetch(`${origin}/m/sw.js`)).headers.get("service-worker-allowed"), "/m");
    assert.equal((await fetch(`${origin}/m/icon-512.png`)).status, 200);
    const apk = await fetch(`${origin}/m/VanPhongAI.apk`);
    assert.equal(apk.status, 200, "tải app Android");
    assert.equal(apk.headers.get("content-type"), "application/vnd.android.package-archive");
    assert.equal((await apk.arrayBuffer()).byteLength > 10000, true);
    assert.match(await (await fetch(`${origin}/m/ai.js`)).text(), /VPMAI/, "tab Chat AI");
    assert.match(await (await fetch(`${origin}/m/sanh3d/fortune.js`)).text(), /VPFortune/, "ống xin quẻ của Sảnh");
    assert.match((await (await fetch(`${origin}/m/sanh3d/version.json`)).json()).source, /^[0-9a-f]{16}$/, "dấu phiên bản Sảnh điện thoại");
    assert.equal((await fetch(`${origin}/m/../package.json`)).status, 404);
    const js3d = await fetch(`${origin}/m/sanh3d/sanh3d.js`);
    assert.equal(js3d.status, 200); assert.match(js3d.headers.get("content-type"), /javascript/);
    assert.equal((await fetch(`${origin}/m/sanh3d/brand/uniq.png`)).headers.get("content-type"), "image/png");
    assert.equal((await fetch(`${origin}/m/sanh3d/../../src/mobile.mjs`)).status, 404);
    assert.equal((await fetch(`${origin}/m/sanh3d/brand/x.svg`)).status, 404);

    // ---- ghép: tài khoản riêng ----
    assert.equal((await fetch(`${origin}/v1/mobile/pair`, { method: "POST" })).status, 401, "tạo mã QR cần key máy tính");
    const p1 = await (await pair(keys.ltn, { "x-forwarded-proto": "https", "x-forwarded-host": "ai.simi.vn" })).json();
    assert.match(p1.url, /^https:\/\/ai\.simi\.vn\/m#pair=[A-Za-z0-9_-]{20,}$/);
    assert.equal((await claim("sai-ma-qr-khong-ton-tai-123")).status, 400);
    const c1 = await (await claim(p1.code)).json();
    assert.match(c1.token, /^vpm_/);
    assert.equal(c1.name, "LTN");
    assert.equal((await claim(p1.code)).status, 400, "mã QR chỉ dùng 1 lần");
    const saved = await readFile(join(root, "mobile", "sessions.json"), "utf8");
    assert.ok(!saved.includes(c1.token) && !saved.includes(keys.ltn), "chỉ lưu mã băm, không lưu token / key");
    assert.ok(!saved.includes("<script>"), "tên thiết bị đã làm sạch");

    // điện thoại = đúng người trên máy tính, chỉ dùng được Sảnh
    const phone = { "x-ltn-client-id": "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", "x-vanphong-os": "mobile-ios" };
    const desk = sse(`${base}/stream`, bearer(keys.ltn, { "x-vanphong-os": "win32-x64" })); streams.push(desk);
    await desk.next("hello");
    const mob = sse(`${base}/stream`, bearer(c1.token, phone)); streams.push(mob);
    const hm = await mob.next("hello");
    assert.equal(hm.me.id, "u:it-ltn");
    assert.equal(hm.me.devices, 2, "máy tính + điện thoại");
    // Chat AI trên điện thoại: Gateway gọi 9Router bằng key THẬT (giải mã từ phiên), điện thoại chỉ có token vpm_
    assert.equal(c1.ai, true, "phiên mới có Chat AI");
    const models = await fetch(`${origin}/v1/models`, { headers: bearer(c1.token) });
    assert.equal(models.status, 200, "điện thoại xem được danh sách model");
    assert.equal(seen.at(-1).auth, `Bearer ${keys.ltn}`, "9Router nhận đúng key máy tính");
    const chat = await fetch(`${origin}/v1/responses`, { method: "POST", headers: bearer(c1.token, { "content-type": "application/json", accept: "text/event-stream" }), body: JSON.stringify({ model: "cx/gpt-5.5", stream: true, input: [{ role: "user", content: [{ type: "input_text", text: "Xin chào" }] }] }) });
    assert.equal(chat.status, 200);
    assert.match(await chat.text(), /Chào từ AI/);
    assert.equal(seen.at(-1).auth, `Bearer ${keys.ltn}`);
    assert.equal((await fetch(`${origin}/v1/embeddings`, { method: "POST", headers: bearer(c1.token, { "content-type": "application/json" }), body: "{}" })).status, 403, "ngoài Chat AI thì vẫn chặn");
    assert.equal((await fetch(`${origin}/v1/codex/installer-config`, { headers: bearer(c1.token) })).status, 403, "không lấy được cấu hình cài đặt (có key)");
    const saved2 = await readFile(join(root, "mobile", "sessions.json"), "utf8");
    assert.ok(!saved2.includes(keys.ltn) && /"keyEnc":"v1\./.test(saved2), "key lưu dạng mã hoá");
    assert.ok((await readFile(join(root, "mobile", "mobile-key.secret"), "utf8")).trim().length === 64, "khoá mã hoá tự tạo 1 lần");
    // phiên ghép lúc tắt Chat AI (hoặc trước khi có tính năng) → báo ghép lại
    process.env.MOBILE_AI = "0";
    const old = await (await claim((await (await pair(keys.ltn)).json()).code)).json();
    delete process.env.MOBILE_AI;
    assert.equal(old.ai, false);
    const r403 = await fetch(`${origin}/v1/models`, { headers: bearer(old.token) });
    assert.equal(r403.status, 403);
    assert.match((await r403.json()).error.message, /ghép lại điện thoại/);
    await fetch(`${origin}/v1/mobile/logout`, { method: "POST", headers: bearer(old.token) });
    assert.equal((await pair(c1.token)).status, 403, "điện thoại không tự tạo mã QR mới");

    // nhắn từ điện thoại → máy tính người khác nhận, máy tính của chính mình cũng thấy
    const ngoc = sse(`${base}/stream`, bearer(keys.ngoc)); streams.push(ngoc);
    await ngoc.next("hello");
    const sent = await (await fetch(`${base}/messages`, { method: "POST", headers: bearer(c1.token, { ...phone, "content-type": "application/json" }), body: JSON.stringify({ to: "u:sales-ngoc", text: "Chào Ngọc từ điện thoại" }) })).json();
    assert.equal(sent.message.from, "u:it-ltn");
    assert.equal((await ngoc.next("message", (d) => d.id === sent.message.id)).text, "Chào Ngọc từ điện thoại");
    await desk.next("message", (d) => d.id === sent.message.id);
    const hist = await (await fetch(`${base}/messages?room=${encodeURIComponent(sent.message.room)}`, { headers: bearer(c1.token, phone) })).json();
    assert.equal(hist.data.length, 1);

    // ---- key chung của team: điện thoại vào đúng danh tính của máy đã ghép ----
    assert.equal((await claim((await (await pair(keys.team)).json()).code)).status, 400, "key chung cần mã máy");
    const pt = await (await pair(keys.team, { "x-ltn-client-id": CID })).json();
    const ct = await (await claim(pt.code)).json();
    const tdesk = await (await fetch(`${base}/members`, { headers: bearer(keys.team, { "x-ltn-client-id": CID }) })).json();
    const tmob = await (await fetch(`${base}/members`, { headers: bearer(ct.token, { "x-ltn-client-id": "99999999-8888-4777-8666-555555555555" }) })).json();
    assert.equal(tmob.me.id, tdesk.me.id);
    assert.equal(tmob.me.id, "t:IT:0b5c9a8e");
    await fetch(`${origin}/v1/models`, { headers: bearer(ct.token) });
    assert.equal(seen.at(-1).auth, `Bearer ${keys.team}`, "key chung: dùng key team");

    // ---- mã ngắn gõ tay (app trên màn hình chính của iPhone không nhận đăng nhập từ Safari) ----
    const ps = await (await pair(keys.ltn)).json();
    assert.match(ps.short, /^[A-HJ-KM-NP-Z2-9]{4}-[A-HJ-KM-NP-Z2-9]{4}$/, "8 ký tự dễ đọc, không có 0/O/1/I/L");
    const cs = await (await claim(` ${ps.short.toLowerCase().replace("-", " ")} `)).json();
    assert.match(cs.token, /^vpm_/, "gõ chữ thường, có cách cũng nhận");
    assert.equal((await claim(ps.short)).status, 400, "mã ngắn chỉ dùng 1 lần");
    assert.equal((await claim(ps.code)).status, 400, "dùng mã ngắn rồi thì link QR cũng hết");
    await fetch(`${origin}/v1/mobile/logout`, { method: "POST", headers: bearer(cs.token) });

    // ---- máy tính xem + đăng xuất điện thoại từ xa ----
    const list1 = await (await fetch(`${origin}/v1/mobile/sessions`, { headers: bearer(keys.ltn) })).json();
    assert.equal(list1.data.length, 1);
    assert.equal(list1.data[0].device, "iPhone script");
    assert.equal((await fetch(`${origin}/v1/mobile/sessions`, { headers: bearer(c1.token) })).status, 403, "điện thoại không tự quản lý phiên");
    assert.equal((await fetch(`${origin}/v1/mobile/sessions`, { headers: bearer(keys.ngoc) }).then((r) => r.json())).data.length, 0, "người khác không thấy điện thoại của mình");
    assert.equal((await fetch(`${origin}/v1/mobile/revoke`, { method: "POST", headers: bearer(keys.ngoc, { "content-type": "application/json" }), body: JSON.stringify({ id: list1.data[0].id }) })).status, 404, "không đăng xuất được điện thoại của người khác");
    const p3 = await (await pair(keys.ltn)).json(); const c3 = await (await claim(p3.code)).json();
    const list2 = await (await fetch(`${origin}/v1/mobile/sessions`, { headers: bearer(keys.ltn) })).json();
    assert.equal(list2.data.length, 2);
    assert.equal((await fetch(`${origin}/v1/mobile/revoke`, { method: "POST", headers: bearer(keys.ltn, { "content-type": "application/json" }), body: JSON.stringify({ id: list2.data[0].id }) })).status, 200);
    assert.equal((await fetch(`${base}/members`, { headers: bearer(c3.token) })).status, 401, "điện thoại vừa bị đăng xuất từ xa");
    assert.equal((await fetch(`${base}/members`, { headers: bearer(c1.token, phone) })).status, 200, "điện thoại còn lại vẫn dùng được");
    // key chung của team: mỗi máy tính chỉ thấy điện thoại mình ghép
    assert.equal((await fetch(`${origin}/v1/mobile/sessions`, { headers: bearer(keys.team, { "x-ltn-client-id": CID }) }).then((r) => r.json())).data.length, 1);
    assert.equal((await fetch(`${origin}/v1/mobile/sessions`, { headers: bearer(keys.team, { "x-ltn-client-id": "99999999-8888-4777-8666-555555555555" }) }).then((r) => r.json())).data.length, 0);

    // ---- đăng xuất ----
    assert.equal((await fetch(`${origin}/v1/mobile/logout`, { method: "POST", headers: bearer(ct.token) })).status, 200);
    assert.equal((await fetch(`${base}/members`, { headers: bearer(ct.token) })).status, 401);

    // ---- đoán mã: gõ sai 10 lần thì tạm khoá ----
    const good = await (await pair(keys.ngoc)).json();
    for (let i = 0; i < 10; i++) await claim("ZZZZ-ZZZZ");
    assert.equal((await claim(good.short)).status, 429, "sai quá nhiều lần → khoá 10 phút, kể cả mã đúng");

    // ---- đổi key máy tính → phiên điện thoại cũ hết hiệu lực ----
    users.users["it-ltn"].keyHash = hash("key-ltn-moi");
    await writeFile(join(root, "users.json"), JSON.stringify(users));
    await new Promise((r) => setTimeout(r, 10_200)); // users.json được đọc lại sau 10 giây
    assert.equal((await fetch(`${base}/members`, { headers: bearer(c1.token, phone) })).status, 401);
  } finally {
    for (const s of streams) s.close();
    server.close(); up.close();
  }
});
