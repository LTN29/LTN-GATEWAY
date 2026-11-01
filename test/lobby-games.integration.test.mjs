import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LobbyGames } from "../src/lobby-games.mjs";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const rack = () => Array.from({ length: 16 }, (_, i) => [250 + i, 250, 0]);

function sse(url, headers) {
  const ctrl = new AbortController();
  const events = []; const waiters = [];
  const ready = fetch(url, { headers, signal: ctrl.signal }).then(async (res) => {
    const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = "";
    (async () => {
      try {
        for (;;) {
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true }); let i;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const block = buf.slice(0, i); buf = buf.slice(i + 2);
            const ev = /^event: (.+)$/m.exec(block); const data = /^data: (.+)$/m.exec(block);
            if (ev && data) { events.push({ event: ev[1], data: JSON.parse(data[1]) }); flush(); }
          }
        }
      } catch { /* đóng */ }
    })();
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

test("Bida: trọng tài lượt đi (không cần mạng)", () => {
  const sent = []; const cast = [];
  const online = new Set(["a", "b", "c", "d", "e"]);
  const G = new LobbyGames({ sendTo: (id, ev, d) => sent.push({ ...d, to: id }), broadcast: (ev, d) => cast.push(d), nameOf: (id) => id.toUpperCase(), canPlay: (id) => online.has(id), random: () => 0.1 });
  assert.throws(() => G.invite("a", "a"), /tự mời/);
  assert.throws(() => G.invite("a", "zz"), /không còn trong Sảnh/);
  const inv = G.invite("a", "b");
  assert.equal(sent.at(-1).type, "invite"); assert.equal(sent.at(-1).to, "b");
  assert.throws(() => G.invite("a", "c"), /Đang chờ/);
  assert.throws(() => G.answer("c", inv.id, true), /hết hạn/, "người khác không trả lời thay được");
  const { game } = G.answer("b", inv.id, true);
  assert.equal(cast.at(-1).type, "start"); assert.equal(game.table, 0); assert.equal(game.turn, "a", "random() < .5 → người mời đánh trước");
  assert.throws(() => G.invite("c", "a"), /đang chơi/);
  const g2 = G.answer("d", G.invite("c", "d").id, true).game;
  assert.equal(g2.table, 1, "ván thứ hai sang bàn số 2");
  assert.throws(() => G.invite("e", "a"), /đang chơi|Cả 2 bàn/);

  const state = { balls: rack(), groups: { a: "solid", b: "stripe" } };
  assert.throws(() => G.shot("b", { id: game.id, seq: 0, shot: { dx: 1, dy: 0, power: 0.5 }, result: { state } }), /Chưa tới lượt/);
  assert.throws(() => G.shot("a", { id: game.id, seq: 3, shot: { dx: 1, dy: 0, power: 0.5 }, result: { state } }), /tải lại/);
  assert.throws(() => G.shot("a", { id: game.id, seq: 0, shot: { dx: 2, dy: 0, power: 0.5 }, result: { state } }), /Hướng đánh/);
  assert.throws(() => G.shot("a", { id: game.id, seq: 0, shot: { dx: 1, dy: 0, power: 0.5 }, result: { state: { balls: [] } } }), /Trạng thái/);
  G.shot("a", { id: game.id, seq: 0, shot: { dx: 0.6, dy: 0.8, power: 0.7, cue: { x: 200, y: 250 } }, result: { state, turn: "a", msg: "Vào bi 3" } });
  const ev = cast.at(-1);
  assert.equal(ev.type, "shot"); assert.equal(ev.seq, 1); assert.equal(ev.turn, "a", "vào bi thì đánh tiếp"); assert.equal(ev.state.groups.a, "solid");
  G.shot("a", { id: game.id, seq: 1, shot: { dx: 1, dy: 0, power: 0.3 }, result: { state, turn: "b", foul: true } });
  assert.equal(cast.at(-1).turn, "b"); assert.equal(cast.at(-1).foul, true);
  G.shot("b", { id: game.id, seq: 2, shot: { dx: -1, dy: 0, power: 0.4 }, result: { state, winner: "b" } });
  assert.equal(cast.at(-1).type, "over"); assert.equal(cast.at(-1).winner, "b"); assert.equal(cast.at(-1).reason, "win");
  assert.equal(G.list().length, 1, "ván xong thì trả bàn");

  G.resign("c", g2.id);
  assert.equal(cast.at(-1).winner, "d"); assert.equal(cast.at(-1).reason, "resign");
  assert.deepEqual(G.statOf("b"), { w: 1, l: 0 }, "ván đánh thật (3 cú) được tính vào bảng xếp hạng");
  assert.deepEqual(G.statOf("c"), { w: 0, l: 0 }, "mời rồi bỏ ngay (chưa đánh cú nào) không tính");
  assert.equal(G.top(5)[0].name, "B");
  const inv3 = G.invite("e", "a");
  G.answer("a", inv3.id, false);
  assert.equal(sent.at(-1).type, "declined"); assert.equal(sent.at(-1).to, "e");
  const g4 = G.answer("b", G.invite("a", "b").id, true).game;
  G.memberLeft("b");
  assert.equal(cast.at(-1).type, "over"); assert.equal(cast.at(-1).winner, "a"); assert.equal(cast.at(-1).reason, "left");
  assert.equal(G.list().length, 0); assert.ok(g4.id);
  G.stop();
});

test("Bida qua HTTP + SSE: mời, đánh, hết giờ lượt", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-games-"));
  const keys = { ngoc: "key-ngoc", an: "key-an", bao: "key-bao" };
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "SALES", displayName: "Sales", keyHash: hash("x"), enabled: true, memoryFile: "SALES.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {
    "s-ngoc": { displayName: "Ngọc", teamId: "SALES", keyHash: hash(keys.ngoc), enabled: true },
    "s-an": { displayName: "An", teamId: "SALES", keyHash: hash(keys.an), enabled: true },
    "s-bao": { displayName: "Bảo", teamId: "SALES", keyHash: hash(keys.bao), enabled: true }
  } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: "http://127.0.0.1:9", LOBBY_MSG_PER_10S: "100", LOBBY_GAME_TURN_MS: "700"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?lobbygames=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const auth = (k) => ({ authorization: `Bearer ${keys[k]}` });
  const post = (k, body) => fetch(`${base}/game`, { method: "POST", headers: { ...auth(k), "content-type": "application/json" }, body: JSON.stringify(body) });
  const streams = [];
  try {
    const ngoc = sse(`${base}/stream`, auth("ngoc")); streams.push(ngoc);
    const h = await ngoc.next("hello");
    assert.ok(h.features.includes("games")); assert.deepEqual(h.games, []);
    assert.ok(h.me.pos.x >= 8 && h.me.pos.x <= 16 && h.me.pos.z >= 13, "vào Sảnh đứng ở sân trước quầy lễ tân");
    const an = sse(`${base}/stream`, auth("an")); streams.push(an); await an.next("hello");
    const bao = sse(`${base}/stream`, auth("bao")); streams.push(bao); await bao.next("hello");

    const r = await post("ngoc", { action: "invite", to: "u:s-an" });
    assert.equal(r.status, 200);
    const inv = await an.next("game", (d) => d.type === "invite");
    assert.equal(inv.fromName, "Ngọc");
    assert.equal((await post("bao", { action: "answer", id: inv.id, accept: true })).status, 404, "người khác không nhận lời thay");
    assert.equal((await post("an", { action: "answer", id: inv.id, accept: true })).status, 200);
    const start = await bao.next("game", (d) => d.type === "start");
    assert.deepEqual(start.game.players, ["u:s-ngoc", "u:s-an"]);
    assert.equal(start.game.table, 0);
    const list = await (await fetch(`${base}/games`, { headers: auth("bao") })).json();
    assert.equal(list.games.length, 1, "người đến sau thấy bàn đang có người chơi");
    const mem = await (await fetch(`${base}/members`, { headers: auth("bao") })).json();
    assert.equal(mem.games.length, 1);

    const turnKey = start.game.turn === "u:s-ngoc" ? "ngoc" : "an";
    const other = turnKey === "ngoc" ? "an" : "ngoc";
    assert.equal((await post(other, { action: "shot", id: start.game.id, seq: 0, shot: { dx: 1, dy: 0, power: 0.5 }, result: { state: { balls: rack() } } })).status, 409);
    const s = await post(turnKey, { action: "shot", id: start.game.id, seq: 0, shot: { dx: 1, dy: 0, power: 0.5 }, result: { state: { balls: rack() }, turn: start.game.players.find((p) => p !== start.game.turn) } });
    assert.equal(s.status, 200);
    const shot = await bao.next("game", (d) => d.type === "shot");
    assert.equal(shot.seq, 1); assert.equal(shot.state.balls.length, 16);
    // người tới lượt không đánh → hết giờ, người kia thắng
    const over = await bao.next("game", (d) => d.type === "over", 4000);
    assert.equal(over.reason, "timeout");
    assert.equal(over.winner, start.game.turn, "người vừa đánh thắng vì đối thủ hết giờ");
    assert.ok(over.stats && Object.keys(over.stats).length === 2, "kết quả kèm thành tích của 2 người");
  } finally {
    for (const s of streams) s.close();
    server.close();
  }
});
