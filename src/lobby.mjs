// Sảnh online cho app Văn Phòng AI: ai đang online, đang làm gì với AI, nhân vật tự chọn, nhắn tin với nhau.
// Danh tính luôn lấy từ API key đã xác thực (users.json) – không tin tên do client tự gửi.
// Nội dung hỏi AI không bao giờ đi qua đây; tin nhắn giữa người với người không đưa vào memory.
import { mkdir, readFile, writeFile, appendFile, rename } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { sendJson, openAiError, readBody } from "./http.mjs";
import { jsonLog } from "./utils.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLOR = /^#[0-9a-f]{6}$/i;
const WORD = /^[a-z][a-z0-9-]{0,23}$/;
const SEAT = /^[a-z0-9-]{1,16}$/;
const ACTIVITIES = new Set(["idle", "chat", "work", "image", "video", "web", "doc", "away"]);
const AVATAR_COLORS = ["hair", "skin", "shirt", "pants", "shoes", "accent"];
const AVATAR_WORDS = ["hairStyle", "outfit", "accessory", "face"];
const HISTORY_IN_MEMORY = 200;
const PING_MS = 25_000;
const LEAVE_GRACE_MS = 8_000;

export const lobbyConfig = {
  get enabled() { return process.env.LOBBY_ENABLED !== "false"; },
  get dataDir() { return resolve(process.env.LOBBY_DATA_DIR || "./data/lobby"); },
  get retentionDays() { return Math.max(1, Number(process.env.LOBBY_RETENTION_DAYS || 30)); },
  get maxChars() { return Math.max(100, Number(process.env.LOBBY_MAX_MESSAGE_CHARS || 2000)); }
};

const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });

// ---------------- danh tính ----------------
export function lobbyIdentity(principal, headers) {
  if (principal.role === "PUBLIC_CHATBOT_SERVICE" || principal.memoryMode === "none") {
    throw httpError(403, "Tài khoản dịch vụ không dùng Sảnh", "permission_error");
  }
  const team = { teamId: principal.teamId, teamName: principal.team?.displayName || principal.teamId };
  if (principal.principalType === "user") {
    return { id: `u:${principal.userId}`, fixedName: principal.displayName, role: principal.role || "", shared: false, ...team };
  }
  // key chung của cả team (chế độ cũ): phân biệt từng máy bằng X-LTN-Client-ID
  const cid = String(headers["x-ltn-client-id"] || "").trim().toLowerCase();
  if (!UUID.test(cid)) throw httpError(400, "Key chung của team cần header X-LTN-Client-ID (UUID) để vào Sảnh");
  return { id: `t:${principal.teamId}:${cid.slice(0, 8)}`, fixedName: null, role: "", shared: true, ...team };
}

// ---------------- lưu trữ ----------------
class LobbyStore {
  constructor() {
    this.dir = null;
    this.profiles = {};
    this.index = { rooms: {} };
    this.rooms = new Map(); // room -> [message] (gần nhất)
    this.saveTimer = null;
  }

  async init() {
    const dir = lobbyConfig.dataDir;
    if (this.dir === dir) return;
    this.dir = dir;
    this.rooms.clear();
    await mkdir(join(dir, "rooms"), { recursive: true });
    this.profiles = await readJson(join(dir, "profiles.json"), {});
    this.index = await readJson(join(dir, "index.json"), { rooms: {} });
  }

  scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.flush().catch((e) => jsonLog("lobby_save_failed", { error: e.message })), 300);
    this.saveTimer.unref?.();
  }

  async flush() {
    clearTimeout(this.saveTimer);
    await writeJsonAtomic(join(this.dir, "profiles.json"), this.profiles);
    await writeJsonAtomic(join(this.dir, "index.json"), this.index);
  }

  roomFile(room) { return join(this.dir, "rooms", createHash("sha1").update(room).digest("hex") + ".jsonl"); }

  // nạp lịch sử 1 phòng, bỏ tin quá hạn lưu (ghi lại file nếu có tin bị bỏ)
  async history(room) {
    if (this.rooms.has(room)) return this.rooms.get(room);
    const cutoff = Date.now() - lobbyConfig.retentionDays * 86_400_000;
    let lines = [];
    try { lines = (await readFile(this.roomFile(room), "utf8")).split("\n").filter(Boolean); } catch (e) { if (e.code !== "ENOENT") throw e; }
    const all = [];
    for (const l of lines) { try { all.push(JSON.parse(l)); } catch { /* dòng hỏng */ } }
    const kept = all.filter((m) => m.ts >= cutoff);
    if (kept.length !== all.length) await writeFileAtomic(this.roomFile(room), kept.map((m) => JSON.stringify(m) + "\n").join(""));
    const recent = kept.slice(-HISTORY_IN_MEMORY);
    this.rooms.set(room, recent);
    return recent;
  }

  async append(msg) {
    const list = await this.history(msg.room);
    list.push(msg);
    if (list.length > HISTORY_IN_MEMORY) list.splice(0, list.length - HISTORY_IN_MEMORY);
    await appendFile(this.roomFile(msg.room), JSON.stringify(msg) + "\n", "utf8");
    this.index.rooms[msg.room] = { ts: msg.ts, from: msg.from, name: msg.name, preview: msg.text.slice(0, 80) };
    this.scheduleSave();
  }
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, "utf8")); } catch (e) { if (e.code === "ENOENT") return fallback; throw e; }
}
async function writeFileAtomic(path, text) {
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, text, "utf8");
  await rename(tmp, path);
}
const writeJsonAtomic = (path, data) => writeFileAtomic(path, JSON.stringify(data, null, 1));

// ---------------- kiểm tra dữ liệu ----------------
function cleanAvatar(a) {
  if (!a || typeof a !== "object") return undefined;
  const out = {};
  for (const k of AVATAR_COLORS) if (typeof a[k] === "string" && COLOR.test(a[k])) out[k] = a[k].toLowerCase();
  for (const k of AVATAR_WORDS) if (typeof a[k] === "string" && WORD.test(a[k])) out[k] = a[k];
  return out;
}
const cleanText = (s, max) => String(s ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);

function cleanStatus(s) {
  if (!s || typeof s !== "object") return null;
  return {
    activity: ACTIVITIES.has(s.activity) ? s.activity : "idle",
    text: cleanText(s.text, 80),
    model: cleanText(s.model, 60)
  };
}

const dmRoom = (a, b) => `dm:${[a, b].sort().join("~")}`;

// ---------------- Sảnh ----------------
class Lobby {
  constructor() {
    this.store = new LobbyStore();
    this.members = new Map(); // id -> { ident, status, pos, conns:Set, leaveTimer, bucket }
  }

  profileOf(ident) {
    const p = this.store.profiles[ident.id] || {};
    return {
      name: ident.fixedName || p.nickname || `${ident.teamName} #${ident.id.slice(-4)}`,
      avatar: p.avatar || {},
      hidden: !!p.hidden
    };
  }

  publicMember(id) {
    const m = this.members.get(id);
    const snap = this.store.profiles[id]?.ident;
    const ident = m ? m.ident : snap && { ...snap, id };
    if (!ident) return null;
    const prof = this.profileOf(ident);
    const online = !!(m && m.conns.size && !prof.hidden);
    return {
      id, name: prof.name, teamId: ident.teamId, teamName: ident.teamName, role: ident.role, shared: ident.shared,
      avatar: prof.avatar, online,
      status: online ? m.status : null,
      pos: online ? m.pos : null
    };
  }

  canAccess(ident, room) {
    if (room === "all") return true;
    if (room.startsWith("team:")) return room === `team:${ident.teamId}`;
    if (room.startsWith("dm:")) return room.slice(3).split("~").includes(ident.id);
    return false;
  }

  roomsFor(ident) {
    const rooms = [
      { id: "all", name: "Cả công ty", kind: "all" },
      { id: `team:${ident.teamId}`, name: `Team ${ident.teamName}`, kind: "team" }
    ];
    for (const [room, last] of Object.entries(this.store.index.rooms)) {
      if (!room.startsWith("dm:") || !this.canAccess(ident, room)) continue;
      const other = room.slice(3).split("~").find((x) => x !== ident.id) || ident.id;
      const pm = this.publicMember(other);
      rooms.push({ id: room, name: pm ? pm.name : "Đồng nghiệp", kind: "dm", with: other, last });
    }
    for (const r of rooms) if (!r.last) r.last = this.store.index.rooms[r.id] || null;
    return rooms;
  }

  // gửi sự kiện SSE; filter(identOfReceiver) quyết định ai nhận
  broadcast(event, data, filter = () => true) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const m of this.members.values()) {
      if (!m.conns.size || !filter(m.ident)) continue;
      for (const res of m.conns) res.write(payload);
    }
  }

  broadcastMember(id) {
    const pm = this.publicMember(id);
    if (!pm) return;
    this.broadcast(pm.online ? "member" : "leave", pm.online ? pm : { id }, (ident) => ident.id !== id);
  }

  touch(ident) {
    let m = this.members.get(ident.id);
    if (!m) {
      m = { ident, status: { activity: "idle", text: "", model: "" }, pos: spawnPoint(ident.id), conns: new Set(), leaveTimer: null, bucket: { t: Date.now(), n: 0 }, msgBucket: { t: Date.now(), n: 0 } };
      this.members.set(ident.id, m);
    }
    m.ident = ident;
    // ghi lại thông tin hiển thị để người offline vẫn có tên trong danh sách nhắn riêng
    const p = this.store.profiles[ident.id] || (this.store.profiles[ident.id] = {});
    const snap = { teamId: ident.teamId, teamName: ident.teamName, role: ident.role, shared: ident.shared, fixedName: ident.fixedName };
    if (JSON.stringify(p.ident) !== JSON.stringify(snap)) { p.ident = snap; this.store.scheduleSave(); }
    return m;
  }

  // giới hạn tốc độ đơn giản (cửa sổ trượt 1 giây / 10 giây)
  allow(m, kind) {
    const b = kind === "msg" ? m.msgBucket : m.bucket;
    const win = kind === "msg" ? 10_000 : 1_000;
    const max = kind === "msg" ? 8 : 12;
    if (Date.now() - b.t > win) { b.t = Date.now(); b.n = 0; }
    return ++b.n <= max;
  }

  // ---------- các route ----------
  async stream(req, res, ident) {
    const m = this.touch(ident);
    clearTimeout(m.leaveTimer);
    const wasOnline = m.conns.size > 0;
    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no"
    });
    // đệm 2KB để proxy (Cloudflare…) đẩy dữ liệu đi ngay
    res.write(`:${" ".repeat(2048)}\n\n`);
    m.conns.add(res);
    const others = [...this.members.keys()].filter((id) => id !== ident.id).map((id) => this.publicMember(id)).filter((x) => x && x.online);
    res.write(`event: hello\ndata: ${JSON.stringify({ me: { ...this.publicMember(ident.id), hidden: this.profileOf(ident).hidden, online: true }, members: others, rooms: this.roomsFor(ident), retentionDays: lobbyConfig.retentionDays })}\n\n`);
    if (!wasOnline) { this.broadcastMember(ident.id); jsonLog("lobby_join", { member: ident.id }); }
    const ping = setInterval(() => res.write(": ping\n\n"), PING_MS);
    ping.unref?.();
    const close = () => {
      clearInterval(ping);
      if (!m.conns.delete(res)) return;
      if (m.conns.size) return;
      m.leaveTimer = setTimeout(() => {
        if (m.conns.size) return;
        this.broadcast("leave", { id: ident.id }, (x) => x.id !== ident.id);
        jsonLog("lobby_leave", { member: ident.id });
      }, LEAVE_GRACE_MS);
      m.leaveTimer.unref?.();
    };
    req.on("close", close);
    res.on("close", close);
  }

  async state(ident, body) {
    const m = this.touch(ident);
    if (!this.allow(m, "state")) throw httpError(429, "Gửi quá nhanh, chậm lại một chút", "rate_limit_error");
    const hidden = this.profileOf(ident).hidden;
    const status = cleanStatus(body.status);
    if (status) { m.status = status; if (!hidden) this.broadcastMember(ident.id); }
    if (body.pos && Number.isFinite(body.pos.x) && Number.isFinite(body.pos.z)) {
      // seat: mã chỗ ngồi trong Sảnh (ghế quầy bar, bàn ăn, sofa…) – để người khác thấy mình đang ngồi
      const seat = typeof body.pos.seat === "string" && SEAT.test(body.pos.seat) ? body.pos.seat : null;
      m.pos = { x: clamp(body.pos.x, -20, 20), z: clamp(body.pos.z, -20, 20), seat };
      if (!hidden) this.broadcast("move", { id: ident.id, ...m.pos }, (x) => x.id !== ident.id);
    }
    if (typeof body.emote === "string" && body.emote.trim()) {
      const emoji = cleanText(body.emote, 8);
      if (!hidden) this.broadcast("emote", { id: ident.id, emote: emoji }, (x) => x.id !== ident.id);
    }
    return { ok: true };
  }

  async profile(ident, body) {
    this.touch(ident);
    const p = this.store.profiles[ident.id];
    if (body.nickname !== undefined && !ident.fixedName) p.nickname = cleanText(body.nickname, 32) || undefined;
    if (body.avatar !== undefined) p.avatar = cleanAvatar(body.avatar) || {};
    if (body.hidden !== undefined) {
      const was = !!p.hidden; p.hidden = !!body.hidden;
      if (was !== p.hidden) this.broadcast(p.hidden ? "leave" : "member", p.hidden ? { id: ident.id } : this.publicMember(ident.id), (x) => x.id !== ident.id);
    }
    p.updatedAt = Date.now();
    await this.store.flush();
    if (!p.hidden) this.broadcastMember(ident.id);
    return { me: { ...this.publicMember(ident.id), hidden: !!p.hidden } };
  }

  async messages(ident, url) {
    const room = url.searchParams.get("room") || "all";
    if (!this.canAccess(ident, room)) throw httpError(403, "Không có quyền xem phòng này", "permission_error");
    const limit = clamp(Number(url.searchParams.get("limit") || 50), 1, HISTORY_IN_MEMORY);
    const before = Number(url.searchParams.get("before") || 0);
    const list = (await this.store.history(room)).filter((x) => !before || x.ts < before);
    return { room, data: list.slice(-limit) };
  }

  async send(ident, body) {
    const m = this.touch(ident);
    if (!this.allow(m, "msg")) throw httpError(429, "Bạn nhắn hơi nhanh, đợi vài giây nhé", "rate_limit_error");
    let room = String(body.room || "all");
    if (body.to) {
      const to = String(body.to);
      if (to === ident.id || !(this.members.has(to) || this.store.profiles[to]?.ident)) throw httpError(404, "Không tìm thấy đồng nghiệp này", "not_found_error");
      room = dmRoom(ident.id, to);
    }
    if (!this.canAccess(ident, room)) throw httpError(403, "Không có quyền nhắn vào phòng này", "permission_error");
    const text = cleanText(body.text, lobbyConfig.maxChars);
    if (!text) throw httpError(400, "Tin nhắn đang trống");
    const msg = { id: randomUUID(), room, from: ident.id, name: this.profileOf(ident).name, teamId: ident.teamId, text, ts: Date.now() };
    await this.store.append(msg);
    this.broadcast("message", msg, (x) => this.canAccess(x, room));
    jsonLog("lobby_message", { member: ident.id, roomKind: room.split(":")[0], chars: text.length });
    return { message: msg };
  }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));

// mỗi người có chỗ đứng mặc định riêng (ổn định theo id) ở khoảng trống trước quầy SIMI BAR CHILL
function spawnPoint(id) {
  const h = createHash("sha1").update(id).digest();
  return { x: Math.round(((h[0] / 255) * 10 - 7) * 10) / 10, z: Math.round(((h[1] / 255) * 8 - 6.5) * 10) / 10, seat: null };
}

let lobby = null;
export function getLobby() { return lobby || (lobby = new Lobby()); }

export function isLobbyPath(pathname) { return pathname.startsWith("/v1/lobby/"); }

export async function handleLobby(req, res, principal, url) {
  if (!lobbyConfig.enabled) { sendJson(res, 404, openAiError("Sảnh đang tắt", "not_found_error")); return; }
  const L = getLobby();
  await L.store.init();
  const ident = lobbyIdentity(principal, req.headers);
  const route = `${req.method} ${url.pathname}`;
  const json = async () => {
    const raw = await readBody(req, 64 * 1024);
    if (!raw.length) return {};
    try { return JSON.parse(raw.toString("utf8")); } catch { throw httpError(400, "JSON không hợp lệ"); }
  };
  switch (route) {
    case "GET /v1/lobby/stream": return L.stream(req, res, ident);
    case "GET /v1/lobby/members": {
      L.touch(ident);
      const members = [...L.members.keys()].map((id) => L.publicMember(id)).filter((x) => x && x.online && x.id !== ident.id);
      return sendJson(res, 200, { me: L.publicMember(ident.id), members, rooms: L.roomsFor(ident) });
    }
    case "GET /v1/lobby/messages": return sendJson(res, 200, await L.messages(ident, url));
    case "POST /v1/lobby/messages": return sendJson(res, 201, await L.send(ident, await json()));
    case "POST /v1/lobby/state": return sendJson(res, 200, await L.state(ident, await json()));
    case "POST /v1/lobby/profile": return sendJson(res, 200, await L.profile(ident, await json()));
    default: sendJson(res, 404, openAiError("Không tìm thấy route Sảnh", "not_found_error"));
  }
}
