import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile, readFile, readdir } from "node:fs/promises";
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

// ảnh nhỏ thật (PNG 1x1, GIF 1x1) + file giả mạo đuôi ảnh
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

test("Sảnh: gửi ảnh, @tag, trả lời, thu hồi, quyền admin", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-chat-"));
  const keys = { ltn: "key-ltn", ngoc: "key-ngoc", an: "key-an", bao: "key-bao" };
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [
    { code: "SALES", displayName: "Sales", keyHash: hash("unused-s"), enabled: true, memoryFile: "SALES.md" },
    { code: "IT", displayName: "IT", keyHash: hash("unused-it"), enabled: true, memoryFile: "IT.md" }
  ] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {
    "it-ltn": { displayName: "LTN", teamId: "IT", keyHash: hash(keys.ltn), enabled: true },
    "sales-ngoc": { displayName: "Ngọc", teamId: "SALES", keyHash: hash(keys.ngoc), enabled: true },
    "sales-an": { displayName: "An", teamId: "SALES", keyHash: hash(keys.an), enabled: true },
    "it-bao": { displayName: "Bảo", teamId: "IT", keyHash: hash(keys.bao), enabled: true }
  } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: "http://127.0.0.1:9",
    LOBBY_ADMINS: "it-ltn", LOBBY_IMAGE_MAX_MB: "1", LOBBY_MSG_PER_10S: "100"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?lobbychat=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const auth = (k, extra = {}) => ({ authorization: `Bearer ${keys[k]}`, ...extra });
  const post = (k, path, body) => fetch(`${base}/${path}`, { method: "POST", headers: { ...auth(k), "content-type": "application/json" }, body: JSON.stringify(body) });
  const upload = (k, qs, buf, thumb = Buffer.alloc(0)) => fetch(`${base}/upload?${new URLSearchParams({ thumbBytes: String(thumb.length), w: "1", h: "1", ...qs })}`, { method: "POST", headers: { ...auth(k), "content-type": "application/octet-stream" }, body: Buffer.concat([thumb, buf]) });
  const streams = [];
  try {
    const ltn = sse(`${base}/stream`, auth("ltn", { "x-vanphong-version": "0.9.13", "x-vanphong-os": "win32-x64" })); streams.push(ltn);
    const hl = await ltn.next("hello");
    assert.equal(hl.admin, true, "LTN là admin (theo mã tài khoản trong LOBBY_ADMINS)");
    assert.ok(hl.features.includes("images") && hl.features.includes("admin"), "báo các tính năng Gateway có");
    assert.equal(hl.perms.everyone, true);
    const ngoc = sse(`${base}/stream`, auth("ngoc", { "x-vanphong-version": "0.9.12", "x-vanphong-os": "darwin-arm64" })); streams.push(ngoc);
    const hn = await ngoc.next("hello");
    assert.equal(hn.admin, false);
    assert.equal(hn.perms.everyone, false, "@mọi người mặc định chỉ admin");
    assert.ok(hn.members.find((m) => m.id === "u:it-ltn").admin, "mọi người thấy huy hiệu admin");
    const an = sse(`${base}/stream`, auth("an")); streams.push(an);
    await an.next("hello");

    // ---- ảnh ----
    assert.equal((await upload("ngoc", { room: "all" }, Buffer.from("<svg onload=alert(1)>xxxxxxxx"))).status, 400, "chỉ nhận ảnh thật");
    assert.equal((await upload("ngoc", { room: "all" }, Buffer.concat([PNG, Buffer.alloc(1.2 * 1048576)]))).status, 413, "quá giới hạn dung lượng");
    const up = await (await upload("ngoc", { room: "all" }, PNG, GIF)).json();
    assert.equal(up.type, "image/png");
    // chưa gửi: chỉ người tải lên xem được
    assert.equal((await fetch(`${base}/file?id=${up.id}`, { headers: auth("an") })).status, 404);
    assert.equal((await fetch(`${base}/file?id=${up.id}`, { headers: auth("ngoc") })).status, 200);
    const sent = await (await post("ngoc", "messages", { room: "all", text: "", images: [up.id] })).json();
    assert.equal(sent.message.images[0].id, up.id);
    const got = await an.next("message", (d) => d.images);
    assert.equal(got.images[0].w, 1);
    const full = await fetch(`${base}/file?id=${up.id}`, { headers: auth("an") });
    assert.equal(full.headers.get("content-type"), "image/png");
    assert.deepEqual(Buffer.from(await full.arrayBuffer()), PNG);
    const th = await fetch(`${base}/file?id=${up.id}&thumb=1`, { headers: auth("an") });
    assert.equal(th.headers.get("content-type"), "image/gif", "ảnh thu nhỏ");
    assert.equal((await post("ngoc", "messages", { room: "all", images: [up.id] })).status, 400, "ảnh đã gửi không gắn lại vào tin khác");
    assert.equal((await post("an", "messages", { room: "all", images: [up.id] })).status, 400, "không dùng ảnh của người khác");
    // ảnh trong tin nhắn riêng: người ngoài không xem được
    const dmUp = await (await upload("ngoc", { to: "u:sales-an" }, PNG)).json();
    await post("ngoc", "messages", { to: "u:sales-an", images: [dmUp.id], text: "ảnh riêng" });
    assert.equal((await fetch(`${base}/file?id=${dmUp.id}`, { headers: auth("an") })).status, 200);
    assert.equal((await fetch(`${base}/file?id=${dmUp.id}`, { headers: auth("bao") })).status, 404);
    assert.equal((await fetch(`${base}/file?id=${dmUp.id}`, { headers: auth("ltn") })).status, 404, "admin cũng không xem ảnh trong tin nhắn riêng của người khác");

    // ---- @tag + trả lời ----
    const m1 = await (await post("an", "messages", { room: "all", text: "@Ngọc @Ai đó xem giúp", mentions: ["u:sales-ngoc", "u:khong-co", "<x>"] })).json();
    assert.deepEqual(m1.message.mentions, ["u:sales-ngoc"], "chỉ giữ người có thật");
    assert.deepEqual(m1.message.mentionNames, { "u:sales-ngoc": "Ngọc" });
    assert.equal((await post("an", "messages", { room: "all", text: "@mọi người", mentions: ["all"] })).status, 403, "@mọi người cần quyền");
    const all = await (await post("ltn", "messages", { room: "all", text: "@mọi người họp 3h", mentions: ["all"] })).json();
    assert.deepEqual(all.message.mentions, ["all"]);
    const dmMention = await (await post("ngoc", "messages", { to: "u:sales-an", text: "@Bảo", mentions: ["u:it-bao"] })).json();
    assert.equal(dmMention.message.mentions, undefined, "không tag người ngoài cuộc trò chuyện riêng");
    const rep = await (await post("ngoc", "messages", { room: "all", text: "Ok để mình xem", replyTo: m1.message.id, mentions: ["u:sales-an"] })).json();
    assert.equal(rep.message.reply.name, "An");
    assert.match(rep.message.reply.text, /xem giúp/);

    // ---- thu hồi / xoá ----
    assert.equal((await post("an", "messages/delete", { room: "all", id: rep.message.id })).status, 403, "không xoá tin người khác");
    assert.equal((await post("ngoc", "messages/delete", { room: "all", id: rep.message.id })).status, 200, "tự thu hồi tin của mình");
    assert.equal((await an.next("message-delete", (d) => d.id === rep.message.id)).room, "all");
    assert.equal((await post("ltn", "messages/delete", { room: "all", id: sent.message.id })).status, 200, "admin xoá tin trong phòng chung");
    assert.equal((await fetch(`${base}/file?id=${up.id}`, { headers: auth("an") })).status, 404, "xoá tin thì xoá luôn ảnh");
    const hist = await (await fetch(`${base}/messages?room=all`, { headers: auth("bao") })).json();
    assert.ok(!hist.data.some((x) => x.id === sent.message.id || x.id === rep.message.id), "tin đã xoá không còn trong lịch sử");
    assert.equal((await post("ltn", "messages/delete", { room: dmMention.message.room, id: dmMention.message.id })).status, 403, "admin không đụng tin nhắn riêng của người khác");

    // ---- admin ----
    assert.equal((await fetch(`${base}/admin`, { headers: auth("ngoc") })).status, 403);
    assert.equal((await post("ngoc", "admin", { action: "mute", id: "u:sales-an", minutes: 5 })).status, 403, "người thường không gọi được API quản trị");
    const ov = await (await fetch(`${base}/admin`, { headers: auth("ltn") })).json();
    assert.equal(ov.versions["0.9.13"], 1); assert.equal(ov.versions["0.9.12"], 1);
    assert.equal(ov.online.find((o) => o.id === "u:sales-ngoc").devices[0].os, "darwin-arm64");
    assert.ok(ov.today.images >= 2 && ov.today.messages >= 3);
    assert.ok(ov.teams.some((t) => t.id === "SALES"));
    assert.ok(ov.audit.some((a) => a.action === "delete-message" && a.targetName === "Ngọc"), "nhật ký ghi lại việc admin xoá tin");

    // cấm chat
    assert.equal((await post("ltn", "admin", { action: "mute", id: "u:it-ltn", minutes: 5 })).status, 400, "không cấm admin");
    await post("ltn", "admin", { action: "mute", id: "u:sales-an", minutes: 15 });
    assert.ok((await an.next("personal", (d) => d.mutedUntil)).mutedUntil > Date.now());
    const muted = await post("an", "messages", { room: "all", text: "alo" });
    assert.equal(muted.status, 403); assert.match((await muted.json()).error.message, /khoá chat/);
    await post("ltn", "admin", { action: "mute", id: "u:sales-an", minutes: 0 });
    assert.equal((await post("an", "messages", { room: "all", text: "đã mở" })).status, 201);

    // phân quyền: tắt gửi ảnh cho team Sales, riêng Ngọc vẫn được
    await post("ltn", "admin", { action: "perms", scope: "team", key: "SALES", perms: { image: false } });
    assert.equal((await an.next("personal", (d) => d.perms.image === false)).perms.image, false);
    assert.equal((await upload("an", { room: "all" }, PNG)).status, 403);
    await post("ltn", "admin", { action: "perms", scope: "user", key: "u:sales-ngoc", perms: { image: true } });
    assert.equal((await upload("ngoc", { room: "all" }, PNG)).status, 201);
    await post("ltn", "admin", { action: "perms", scope: "team", key: "SALES", perms: { image: null } });
    assert.equal((await upload("an", { room: "all" }, PNG)).status, 201, "về lại mặc định");
    // tắt nhắn riêng: vẫn nhắn được cho admin
    await post("ltn", "admin", { action: "perms", scope: "default", perms: { dm: false } });
    assert.equal((await post("an", "messages", { to: "u:sales-ngoc", text: "hi" })).status, 403);
    assert.equal((await post("an", "messages", { to: "u:it-ltn", text: "báo lỗi" })).status, 201);
    await post("ltn", "admin", { action: "perms", scope: "default", perms: { dm: true } });

    // màn chiếu: khoá
    await post("ltn", "admin", { action: "cinema", op: "lock" });
    assert.equal((await ngoc.next("cinema", (d) => d.locked)).locked, true);
    assert.equal((await post("ngoc", "cinema", { action: "add", url: "https://youtu.be/dQw4w9WgXcQ" })).status, 403);
    assert.equal((await post("ltn", "cinema", { action: "add", url: "https://youtu.be/dQw4w9WgXcQ" })).status, 200, "admin vẫn thêm được");
    await post("ltn", "admin", { action: "cinema", op: "unlock" });

    // thông báo ghim
    await post("ltn", "admin", { action: "announce", text: "Chiều nay 3h họp toàn công ty", pin: true });
    assert.equal((await ngoc.next("announce")).text, "Chiều nay 3h họp toàn công ty");
    const bao = sse(`${base}/stream`, auth("bao")); streams.push(bao);
    assert.equal((await bao.next("hello")).pinned.text, "Chiều nay 3h họp toàn công ty", "người vào sau vẫn thấy thông báo ghim");

    // mời ra khỏi Sảnh
    await post("ltn", "admin", { action: "kick", id: "u:it-bao", minutes: 10 });
    await bao.next("kicked");
    await ltn.next("leave", (d) => d.id === "u:it-bao", 12000);
    const again = await fetch(`${base}/stream`, { headers: auth("bao") });
    assert.equal(again.status, 403); assert.match((await again.json()).error.message, /mời bạn ra khỏi Sảnh/);
    await post("ltn", "admin", { action: "unkick", id: "u:it-bao" });

    // NPC
    await post("ltn", "admin", { action: "npc", id: "u:it-bao" });
    assert.equal((await ngoc.next("npc")).npc.id, "u:it-bao");

    const audit = (await readFile(join(root, "lobby", "admin-audit.jsonl"), "utf8")).trim().split("\n").map((l) => JSON.parse(l).action);
    for (const a of ["mute", "unmute", "perms", "cinema-lock", "announce", "kick", "npc"]) assert.ok(audit.includes(a), `nhật ký có ${a}`);
    assert.ok((await readdir(join(root, "lobby", "files"))).some((f) => f.endsWith(".bin")));
  } finally {
    streams.forEach((s) => s.close());
    await new Promise((r) => server.close(r));
  }
});
