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

test("Sảnh: mèo chung, tương tác giữa nhân vật, nhảy đồng bộ", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-play-"));
  const keys = { ngoc: "key-ngoc", an: "key-an", bao: "key-bao" };
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "SALES", displayName: "Sales", keyHash: hash("x"), enabled: true, memoryFile: "SALES.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {
    "s-ngoc": { displayName: "Ngọc", teamId: "SALES", keyHash: hash(keys.ngoc), enabled: true },
    "s-an": { displayName: "An", teamId: "SALES", keyHash: hash(keys.an), enabled: true },
    "s-bao": { displayName: "Bảo", teamId: "SALES", keyHash: hash(keys.bao), enabled: true }
  } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: "http://127.0.0.1:9", LOBBY_MSG_PER_10S: "100"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?lobbyplay=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const auth = (k) => ({ authorization: `Bearer ${keys[k]}` });
  const post = (k, path, body) => fetch(`${base}/${path}`, { method: "POST", headers: { ...auth(k), "content-type": "application/json" }, body: JSON.stringify(body) });
  const streams = [];
  try {
    const ngoc = sse(`${base}/stream`, auth("ngoc")); streams.push(ngoc);
    const h = await ngoc.next("hello");
    assert.ok(h.features.includes("cat") && h.features.includes("interact") && h.features.includes("dance"));
    assert.ok(h.cat && h.cat.target, "lời chào kèm vị trí mèo để mọi máy thấy cùng một con mèo");
    const an = sse(`${base}/stream`, auth("an")); streams.push(an); await an.next("hello");
    await post("ngoc", "state", { pos: { x: 3, z: 2 } });

    // mèo
    assert.equal((await post("ngoc", "cat", { action: "bay" })).status, 400);
    assert.equal((await post("ngoc", "cat", { action: "feed" })).status, 200);
    const c = await an.next("cat", (d) => d.act === "feed");
    assert.equal(c.byName, "Ngọc"); assert.equal(c.then, "feed");
    assert.ok(Math.abs(c.target.x - 3.55) < 0.01, "mèo chạy tới cạnh người cho ăn");
    await post("an", "cat", { action: "call" });
    assert.equal((await ngoc.next("cat", (d) => d.act === "call")).mode, "follow");

    // tương tác làm ngay
    const hf = await (await post("ngoc", "interact", { to: "u:s-an", kind: "highfive" })).json();
    assert.equal(hf.state, "go");
    assert.equal((await an.next("interact", (d) => d.kind === "highfive")).a, "u:s-ngoc");
    // mời nhảy: cần đồng ý
    const ask = await (await post("ngoc", "interact", { to: "u:s-an", kind: "dance", style: "disco" })).json();
    assert.equal(ask.asked, true);
    assert.equal((await post("ngoc", "interact", { to: "u:s-an", kind: "dance" })).status, 409, "không mời dồn dập");
    const inv = await an.next("interact", (d) => d.state === "ask");
    assert.equal(inv.fromName, "Ngọc"); assert.equal(inv.style, "disco");
    assert.equal((await post("ngoc", "interact", { id: inv.id, accept: true })).status, 404, "người mời không tự đồng ý thay được");
    await post("an", "interact", { id: inv.id, accept: true });
    const go = await ngoc.next("interact", (d) => d.state === "go" && d.kind === "dance");
    assert.equal(go.style, "disco"); assert.equal(go.b, "u:s-an");
    // ôm bị từ chối
    await post("ngoc", "interact", { to: "u:s-an", kind: "hug" });
    const inv2 = await an.next("interact", (d) => d.state === "ask" && d.kind === "hug");
    await post("an", "interact", { id: inv2.id, accept: false });
    assert.equal((await ngoc.next("interact", (d) => d.state === "declined")).byName, "An");
    // người vào sau thấy ai đang nhảy
    const bao = sse(`${base}/stream`, auth("bao")); streams.push(bao);
    const hb = await bao.next("hello");
    assert.equal(hb.members.find((x) => x.id === "u:s-an").dance, "disco");

    // nhảy liên tục
    assert.equal((await post("bao", "state", { dance: "moonwalk" })).status, 400);
    await post("bao", "state", { dance: "robot" });
    assert.equal((await ngoc.next("dance", (d) => d.id === "u:s-bao")).style, "robot");
    await post("bao", "state", { pos: { x: 1, z: 1 } });
    assert.equal((await ngoc.next("dance", (d) => d.id === "u:s-bao" && d.style === null)).style, null, "đi chỗ khác là dừng nhảy");
    // đang ẩn thì không tương tác
    await post("bao", "profile", { hidden: true });
    assert.equal((await post("ngoc", "interact", { to: "u:s-bao", kind: "highfive" })).status, 404);
  } finally {
    streams.forEach((s) => s.close());
    await new Promise((r) => server.close(r));
  }
});
