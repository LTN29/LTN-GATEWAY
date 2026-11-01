// Trò chơi 2 người trong Sảnh (hiện có bida 8 bi). Gateway chỉ làm trọng tài lượt đi:
// mời → đồng ý → giao bàn trống → nhận từng cú đánh của đúng người tới lượt → phát cho cả Sảnh (để người xem và cảnh 3D cùng thấy).
// Vật lý bi chạy trong app: người đánh tính xong gửi kèm kết quả (vị trí bi, lượt sau, ai thắng); máy khác chạy lại cú đánh đó để xem
// rồi khớp đúng kết quả. Không lưu xuống đĩa – khởi động lại Gateway là ván đang chơi kết thúc.
import { randomUUID } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const GAME_KINDS = { pool: { name: "bida", tables: 2 } };
const INVITE_MS = 30_000;
const turnMs = () => Math.max(200, Number(process.env.LOBBY_GAME_TURN_MS || 90_000));
const BALLS = 16;
const TABLE_W = 1000, TABLE_H = 500; // đơn vị bàn trong app (dài x rộng)

const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });
const num = (v, lo, hi) => { const n = Number(v); if (!Number.isFinite(n)) throw httpError(400, "Số liệu cú đánh không hợp lệ"); return Math.max(lo, Math.min(hi, n)); };
const text = (v, n) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n);

// trạng thái bàn do app gửi lên: 16 bi [x, y, đã rơi lỗ], nhóm bi của từng người, được đặt bi trắng (1 = sau vạch đầu bàn, 2 = cả bàn), đã giao bóng chưa
function cleanState(s, players) {
  if (!s || typeof s !== "object" || !Array.isArray(s.balls) || s.balls.length !== BALLS) throw httpError(400, "Trạng thái bàn không hợp lệ");
  const balls = s.balls.map((b) => {
    if (!Array.isArray(b) || b.length < 3) throw httpError(400, "Trạng thái bi không hợp lệ");
    return [Math.round(num(b[0], 0, TABLE_W) * 100) / 100, Math.round(num(b[1], 0, TABLE_H) * 100) / 100, b[2] ? 1 : 0];
  });
  const groups = {};
  for (const id of players) { const g = s.groups && s.groups[id]; groups[id] = g === "solid" || g === "stripe" ? g : null; }
  return { balls, groups, ballInHand: s.ballInHand === 1 || s.ballInHand === 2 ? s.ballInHand : 0, broke: !!s.broke };
}

function cleanShot(s) {
  if (!s || typeof s !== "object") throw httpError(400, "Thiếu cú đánh");
  const dx = Number(s.dx), dy = Number(s.dy);
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.abs(Math.hypot(dx, dy) - 1) > 0.01) throw httpError(400, "Hướng đánh không hợp lệ");
  const out = { dx: Number(s.dx), dy: Number(s.dy), power: num(s.power, 0.02, 1) };
  if (s.cue) out.cue = { x: num(s.cue.x, 0, TABLE_W), y: num(s.cue.y, 0, TABLE_H) };
  return out;
}

export class LobbyGames {
  // sendTo(id, event, data) · broadcast(event, data) · nameOf(id) · canPlay(id) → true khi người đó đang online và không ẩn
  constructor({ sendTo, broadcast, nameOf, canPlay, now = () => Date.now(), random = Math.random }) {
    Object.assign(this, { sendTo, broadcast, nameOf, canPlay, now, random });
    this.invites = new Map(); // id -> { id, kind, from, to, exp }
    this.games = new Map();   // id -> ván đang chơi
    this.stats = {};          // id -> { name, w, l } bảng xếp hạng bida (lưu games-stats.json)
    this.dir = null; this.saveT = null;
  }

  async init(dir) {
    if (this.dir === dir) return;
    this.dir = dir;
    try { const d = JSON.parse(await readFile(join(dir, "games-stats.json"), "utf8")); if (d && typeof d.stats === "object") this.stats = d.stats; } catch (e) { if (e.code !== "ENOENT") throw e; }
  }
  saveLater() {
    if (!this.dir) return;
    clearTimeout(this.saveT);
    this.saveT = setTimeout(async () => {
      try { const p = join(this.dir, "games-stats.json"); const tmp = `${p}.${process.pid}.tmp`; await writeFile(tmp, JSON.stringify({ stats: this.stats })); await rename(tmp, p); } catch { /* lần sau lưu lại */ }
    }, 1000);
    this.saveT.unref?.();
  }
  // ván có đánh thật (≥ 2 cú hoặc thắng bằng bi 8) mới tính – mời rồi bỏ ngay không tính
  record(g) {
    if (!g.winner || (g.seq < 2 && g.reason !== "win")) return;
    for (const id of g.players) {
      const s = this.stats[id] || (this.stats[id] = { name: g.names[id], w: 0, l: 0 });
      s.name = g.names[id] || s.name;
      if (id === g.winner) s.w++; else s.l++;
    }
    this.saveLater();
  }
  top(n = 10) {
    return Object.entries(this.stats).map(([id, s]) => ({ id, name: s.name, w: s.w, l: s.l }))
      .sort((a, b) => b.w - a.w || (b.w / Math.max(1, b.w + b.l)) - (a.w / Math.max(1, a.w + a.l)) || a.l - b.l).slice(0, n);
  }
  statOf(id) { const s = this.stats[id]; return s ? { w: s.w, l: s.l } : { w: 0, l: 0 }; }

  gameOf(memberId) { for (const g of this.games.values()) if (g.players.includes(memberId)) return g; return null; }

  // gửi cho app: ai đang chơi bàn nào, tới lượt ai, trạng thái bàn
  publicGame(g) {
    return { id: g.id, kind: g.kind, table: g.table, players: g.players, names: g.names, turn: g.turn, seq: g.seq, state: g.state, status: g.status, winner: g.winner || null, reason: g.reason || null, startedAt: g.startedAt, turnAt: g.turnAt, turnMs: turnMs() };
  }
  list() { return [...this.games.values()].filter((g) => g.status === "playing").map((g) => this.publicGame(g)); }

  sweep() {
    const now = this.now();
    for (const [id, inv] of this.invites) if (inv.exp < now) { this.invites.delete(id); this.sendTo(inv.from, "game", { type: "expired", id, to: inv.to, toName: this.nameOf(inv.to) }); }
  }

  invite(from, to, kind = "pool") {
    this.sweep();
    if (!GAME_KINDS[kind]) throw httpError(400, "Trò chơi không hợp lệ");
    if (from === to) throw httpError(400, "Không tự mời mình được 😄");
    if (!this.canPlay(to)) throw httpError(404, "Người này không còn trong Sảnh", "not_found_error");
    if (this.gameOf(from)) throw httpError(409, "Bạn đang chơi dở một ván – xong ván đó đã nhé", "conflict_error");
    if (this.gameOf(to)) throw httpError(409, `${this.nameOf(to)} đang chơi một ván khác`, "conflict_error");
    if ([...this.invites.values()].some((i) => i.from === from)) throw httpError(409, "Đang chờ người được mời trả lời", "conflict_error");
    if (this.freeTable(kind) < 0) throw httpError(409, "Cả 2 bàn bida đều đang có người chơi – đợi chút nhé", "conflict_error");
    const inv = { id: randomUUID(), kind, from, to, exp: this.now() + INVITE_MS };
    this.invites.set(inv.id, inv);
    this.sendTo(to, "game", { type: "invite", id: inv.id, kind, from, fromName: this.nameOf(from), exp: inv.exp });
    return { ok: true, id: inv.id, exp: inv.exp };
  }

  cancel(by, id) {
    const inv = this.invites.get(String(id));
    if (!inv || inv.from !== by) return { ok: true };
    this.invites.delete(inv.id);
    this.sendTo(inv.to, "game", { type: "cancelled", id: inv.id, from: by });
    return { ok: true };
  }

  freeTable(kind) {
    const used = new Set([...this.games.values()].filter((g) => g.kind === kind && g.status === "playing").map((g) => g.table));
    for (let t = 0; t < GAME_KINDS[kind].tables; t++) if (!used.has(t)) return t;
    return -1;
  }

  answer(by, id, accept) {
    this.sweep();
    const inv = this.invites.get(String(id));
    if (!inv || inv.to !== by) throw httpError(404, "Lời mời đã hết hạn", "not_found_error");
    this.invites.delete(inv.id);
    if (!accept) { this.sendTo(inv.from, "game", { type: "declined", id: inv.id, by, byName: this.nameOf(by) }); return { ok: true }; }
    if (!this.canPlay(inv.from)) throw httpError(404, "Người mời đã rời Sảnh", "not_found_error");
    if (this.gameOf(inv.from) || this.gameOf(by)) throw httpError(409, "Một trong hai người đang chơi ván khác", "conflict_error");
    const table = this.freeTable(inv.kind);
    if (table < 0) throw httpError(409, "Cả 2 bàn đều đang có người chơi – mời lại sau nhé", "conflict_error");
    const players = [inv.from, by];
    const now = this.now();
    const g = {
      id: randomUUID(), kind: inv.kind, table, players, names: Object.fromEntries(players.map((p) => [p, this.nameOf(p)])),
      turn: players[this.random() < 0.5 ? 0 : 1], seq: 0, state: null, status: "playing", startedAt: now, turnAt: now, timer: null
    };
    this.games.set(g.id, g);
    this.arm(g);
    this.broadcast("game", { type: "start", game: this.publicGame(g) });
    return { ok: true, game: this.publicGame(g) };
  }

  // hết giờ một lượt → người kia thắng
  arm(g) {
    clearTimeout(g.timer);
    g.timer = setTimeout(() => { if (g.status === "playing") this.finish(g, g.players.find((p) => p !== g.turn), "timeout"); }, turnMs());
    g.timer.unref?.();
  }

  shot(by, body) {
    const g = this.games.get(String(body.id || ""));
    if (!g || g.status !== "playing") throw httpError(404, "Ván này đã kết thúc", "not_found_error");
    if (!g.players.includes(by)) throw httpError(403, "Bạn không chơi ván này", "permission_error");
    if (g.turn !== by) throw httpError(409, "Chưa tới lượt bạn", "conflict_error");
    if (Number(body.seq) !== g.seq) throw httpError(409, "Bàn vừa thay đổi – tải lại ván", "conflict_error");
    const shot = cleanShot(body.shot);
    const r = body.result || {};
    const state = cleanState(r.state, g.players);
    const next = g.players.includes(r.turn) ? r.turn : g.players.find((p) => p !== by);
    const winner = r.winner && g.players.includes(r.winner) ? r.winner : null;
    g.seq++; g.state = state; g.turn = next; g.turnAt = this.now();
    const ev = { type: "shot", id: g.id, seq: g.seq, by, shot, state, turn: next, foul: !!r.foul, msg: text(r.msg, 140) };
    if (winner) { this.broadcast("game", ev); this.finish(g, winner, "win"); return { ok: true, seq: g.seq }; }
    this.arm(g);
    this.broadcast("game", { ...ev, turnAt: g.turnAt });
    return { ok: true, seq: g.seq };
  }

  finish(g, winner, reason) {
    if (g.status !== "playing") return;
    clearTimeout(g.timer);
    g.status = "over"; g.winner = winner || null; g.reason = reason;
    this.record(g);
    this.broadcast("game", { type: "over", id: g.id, winner: g.winner, winnerName: g.winner ? g.names[g.winner] : "", reason, game: this.publicGame(g), stats: Object.fromEntries(g.players.map((p) => [p, this.statOf(p)])) });
    this.games.delete(g.id);
  }

  resign(by, id) {
    const g = this.games.get(String(id || "")) || this.gameOf(by);
    if (!g || !g.players.includes(by)) return { ok: true };
    this.finish(g, g.players.find((p) => p !== by), "resign");
    return { ok: true };
  }

  // người chơi rời Sảnh hẳn → người kia thắng; lời mời của họ bị huỷ
  memberLeft(id) {
    for (const [k, inv] of this.invites) if (inv.from === id || inv.to === id) { this.invites.delete(k); this.sendTo(inv.from === id ? inv.to : inv.from, "game", { type: "cancelled", id: k, from: id }); }
    const g = this.gameOf(id);
    if (g) this.finish(g, g.players.find((p) => p !== id), "left");
  }

  stop() { for (const g of this.games.values()) clearTimeout(g.timer); clearTimeout(this.saveT); }
}
