import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile, readdir, readFile, appendFile } from "node:fs/promises";
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

test("Sảnh: online, trạng thái, nhân vật, nhắn tin theo phòng và quyền truy cập", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-"));
  const keys = { ngoc: "key-ngoc", an: "key-an", bao: "key-bao", bot: "key-bot", legacy: "key-legacy-team" };
  await writeFile(join(root, "teams.json"), JSON.stringify({
    teams: [
      { code: "SALES", displayName: "Sales", keyHash: hash(keys.legacy), enabled: true, memoryFile: "SALES.md" },
      { code: "IT", displayName: "IT", keyHash: hash("unused-it"), enabled: true, memoryFile: "IT.md" }
    ]
  }));
  await writeFile(join(root, "users.json"), JSON.stringify({
    version: 1,
    users: {
      "sales-ngoc": { displayName: "Ngọc", teamId: "SALES", role: "Tư vấn", keyHash: hash(keys.ngoc), enabled: true },
      "sales-an": { displayName: "An", teamId: "SALES", keyHash: hash(keys.an), enabled: true },
      "it-bao": { displayName: "Bảo", teamId: "IT", keyHash: hash(keys.bao), enabled: true },
      "sales-bot": { displayName: "Bot", teamId: "SALES", role: "PUBLIC_CHATBOT_SERVICE", memoryMode: "none", keyHash: hash(keys.bot), enabled: true }
    }
  }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LTN_LEGACY_TEAM_KEYS_ENABLED: "true", LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: "http://127.0.0.1:9"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?lobby=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const auth = (k, extra = {}) => ({ authorization: `Bearer ${keys[k] || k}`, ...extra });
  const post = (k, path, body, extra) => fetch(`${base}/${path}`, { method: "POST", headers: { ...auth(k, extra), "content-type": "application/json" }, body: JSON.stringify(body) });

  const streams = [];
  try {
    assert.equal((await fetch(`${base}/members`)).status, 401, "cần API key");
    assert.equal((await fetch(`${base}/members`, { headers: auth("bot") })).status, 403, "tài khoản dịch vụ không vào Sảnh");

    const ngoc = sse(`${base}/stream`, auth("ngoc")); streams.push(ngoc);
    const hello = await ngoc.next("hello");
    assert.equal(hello.me.name, "Ngọc");
    assert.equal(hello.me.teamName, "Sales");
    assert.deepEqual(hello.rooms.map((r) => r.id), ["all"], "chỉ có phòng chung cả công ty (đã bỏ phòng team)");
    assert.deepEqual(hello.cinema.queue, [], "lời chào kèm trạng thái màn hình chiếu");

    const bao = sse(`${base}/stream`, auth("bao")); streams.push(bao);
    const helloBao = await bao.next("hello");
    assert.ok(helloBao.members.some((m) => m.name === "Ngọc" && m.online), "người vào sau thấy người đang online");
    const joined = await ngoc.next("member", (d) => d.id === "u:it-bao");
    assert.equal(joined.name, "Bảo");

    // tên lấy từ users.json, không đổi được bằng nickname
    const prof = await (await post("bao", "profile", { nickname: "Giả mạo", avatar: { hair: "#ff0000", hairStyle: "spiky", shirt: "#0A78F0", evil: "x", skin: "red" } })).json();
    assert.equal(prof.me.name, "Bảo");
    assert.deepEqual(prof.me.avatar, { hair: "#ff0000", shirt: "#0a78f0", hairStyle: "spiky" });
    const changed = await ngoc.next("member", (d) => d.id === "u:it-bao" && d.avatar.hairStyle === "spiky");
    assert.equal(changed.avatar.hair, "#ff0000");

    // trạng thái + di chuyển + biểu cảm
    await post("bao", "state", { status: { activity: "image", text: "Đang tạo ảnh", model: "muse-image" }, pos: { x: 99, z: 1.5 }, emote: "🎉" });
    assert.equal((await ngoc.next("member", (d) => d.id === "u:it-bao" && d.status?.activity === "image")).status.text, "Đang tạo ảnh");
    assert.deepEqual(await ngoc.next("move", (d) => d.id === "u:it-bao"), { id: "u:it-bao", x: 20, z: 1.5, seat: null });
    assert.equal((await ngoc.next("emote")).emote, "🎉");
    // ngồi ghế: mã ghế hợp lệ được phát kèm, mã lạ bị bỏ
    await post("bao", "state", { pos: { x: 1, z: -7.2, seat: "b3" } });
    assert.equal((await ngoc.next("move", (d) => d.seat === "b3")).x, 1);
    await post("bao", "state", { pos: { x: 1, z: -7.2, seat: "<script>" } });
    assert.equal((await ngoc.next("move", (d) => d.id === "u:it-bao" && d.seat === null && d.z === -7.2)).seat, null);

    // phòng chung: ai cũng nhận
    const sent = await (await post("ngoc", "messages", { room: "all", text: "Chào cả nhà 👋" })).json();
    assert.equal(sent.message.name, "Ngọc");
    assert.equal((await bao.next("message", (d) => d.room === "all")).text, "Chào cả nhà 👋");

    // phòng team đã bỏ: không ai đọc / gửi được, kể cả người trong team
    assert.equal((await post("ngoc", "messages", { room: "team:SALES", text: "x" })).status, 403);
    assert.equal((await fetch(`${base}/messages?room=team:SALES`, { headers: auth("ngoc") })).status, 403);

    // màn hình chiếu YouTube: thêm link → cả quán nhận, link sai bị từ chối, hàng chờ theo lượt
    assert.equal((await post("ngoc", "cinema", { action: "add", url: "https://example.com/video" })).status, 400);
    const added = await (await post("ngoc", "cinema", { action: "add", url: "https://youtu.be/dQw4w9WgXcQ" })).json();
    assert.equal(added.playing, true);
    const showing = await bao.next("cinema", (d) => d.current && d.current.videoId === "dQw4w9WgXcQ");
    assert.equal(showing.current.byName, "Ngọc");
    assert.ok(showing.current.startedAt > showing.now - 5000, "kèm mốc giờ bắt đầu để các máy chiếu đồng bộ");
    await post("ngoc", "cinema", { action: "add", url: "https://www.youtube.com/watch?v=aaaaaaaaaaa" });
    await post("bao", "cinema", { action: "add", url: "https://www.youtube.com/shorts/bbbbbbbbbbb" });
    const q = await (await fetch(`${base}/cinema`, { headers: auth("an") })).json();
    assert.deepEqual(q.queue.map((x) => x.videoId), ["bbbbbbbbbbb", "aaaaaaaaaaa"], "Bảo chưa có lượt nào nên được xếp trước video thứ 2 của Ngọc");
    assert.equal((await post("bao", "cinema", { action: "remove", id: q.queue[1].id })).status, 403, "không gỡ được video của người khác");
    await post("ngoc", "cinema", { action: "skip" });
    assert.equal((await bao.next("cinema", (d) => d.current && d.current.videoId === "bbbbbbbbbbb")).current.byName, "Bảo", "người thêm bỏ qua → chiếu video kế tiếp");

    // nhắn riêng
    const dm = await (await post("bao", "messages", { to: "u:sales-ngoc", text: "Ngọc ơi, gửi mình file nhé" })).json();
    assert.equal(dm.message.room, "dm:u:it-bao~u:sales-ngoc");
    assert.equal((await ngoc.next("message", (d) => d.room.startsWith("dm:"))).text, "Ngọc ơi, gửi mình file nhé");
    const an = await (await fetch(`${base}/messages?room=${encodeURIComponent(dm.message.room)}`, { headers: auth("an") }));
    assert.equal(an.status, 403, "người ngoài không đọc được tin nhắn riêng");
    const rooms = (await (await fetch(`${base}/members`, { headers: auth("ngoc") })).json()).rooms;
    assert.ok(rooms.some((r) => r.kind === "dm" && r.name === "Bảo"), "danh sách phòng có cuộc nhắn riêng");

    // lịch sử + giới hạn
    const hist = await (await fetch(`${base}/messages?room=all`, { headers: auth("bao") })).json();
    assert.equal(hist.data.at(-1).text, "Chào cả nhà 👋");
    assert.equal((await post("ngoc", "messages", { room: "all", text: "   " })).status, 400);
    let limited = 0;
    for (let i = 0; i < 12; i++) if ((await post("an", "messages", { room: "all", text: "spam " + i })).status === 429) limited++;
    assert.ok(limited > 0, "giới hạn tốc độ nhắn tin");

    // ẩn trạng thái: người khác thấy như đã rời Sảnh
    await post("bao", "profile", { hidden: true });
    await ngoc.next("leave", (d) => d.id === "u:it-bao");
    const list = (await (await fetch(`${base}/members`, { headers: auth("ngoc") })).json()).members;
    assert.ok(!list.some((m) => m.id === "u:it-bao"));

    // key chung của team cần client id, đặt được tên riêng
    assert.equal((await fetch(`${base}/members`, { headers: auth("legacy") })).status, 400);
    const cid = { "x-ltn-client-id": "11111111-2222-3333-4444-555555555555" };
    const lp = await (await post("legacy", "profile", { nickname: "Hà (máy quầy)" }, cid)).json();
    assert.equal(lp.me.name, "Hà (máy quầy)");
    assert.equal(lp.me.shared, true);

    // nội dung tin nhắn không ghi ra log, file lưu trên đĩa
    const files = await readdir(join(root, "lobby", "rooms"));
    assert.ok(files.length >= 2, "phòng chung + nhắn riêng"); // không còn phòng team
  } finally {
    streams.forEach((s) => s.close());
    await new Promise((r) => server.close(r));
  }
});

test("Sảnh: tin nhắn quá hạn lưu bị dọn khi nạp lại", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-ret-"));
  process.env.LOBBY_DATA_DIR = join(root, "lobby");
  process.env.LOBBY_RETENTION_DAYS = "30";
  const { getLobby } = await import(`../src/lobby.mjs?ret=${Date.now()}`);
  const L = getLobby();
  await L.store.init();
  const file = L.store.roomFile("all");
  const old = { id: "a", room: "all", from: "u:x", name: "X", text: "cũ", ts: Date.now() - 40 * 86_400_000 };
  const fresh = { id: "b", room: "all", from: "u:x", name: "X", text: "mới", ts: Date.now() };
  await appendFile(file, JSON.stringify(old) + "\n" + JSON.stringify(fresh) + "\n");
  const list = await L.store.history("all");
  assert.deepEqual(list.map((m) => m.text), ["mới"]);
  assert.ok(!(await readFile(file, "utf8")).includes("cũ"), "đã xóa khỏi file");
  delete process.env.LOBBY_RETENTION_DAYS;
});
