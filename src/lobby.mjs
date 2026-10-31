// Sảnh online cho app Văn Phòng AI: ai đang online, đang làm gì với AI, nhân vật tự chọn, nhắn tin với nhau.
// Danh tính luôn lấy từ API key đã xác thực (users.json) – không tin tên do client tự gửi.
// Nội dung hỏi AI không bao giờ đi qua đây; tin nhắn giữa người với người không đưa vào memory.
import { mkdir, readFile, writeFile, appendFile, rename } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { sendJson, openAiError, readBody } from "./http.mjs";
import { jsonLog } from "./utils.mjs";
import { releaseInfo } from "./app-release.mjs";
import { Cinema } from "./lobby-cinema.mjs";
import { LobbyFiles } from "./lobby-files.mjs";
import { LobbySettings, PERMS, isAdmin, hhmm } from "./lobby-admin.mjs";
import { LobbyCat } from "./lobby-cat.mjs";
import { NpcStore, npcCandidates, askNpc, cleanGuides, npcConfig } from "./lobby-npc.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLOR = /^#[0-9a-f]{6}$/i;
const WORD = /^[a-z][a-z0-9-]{0,23}$/;
const SEAT = /^[a-z0-9-]{1,16}$/;
const MEMBER_ID = /^[a-z]:[A-Za-z0-9_.:@-]{1,120}$/;
const MAX_IMAGES = 4;
const MAX_MENTIONS = 20;
const EVERYONE_PER_HOUR = 3;
// tính năng Gateway có – app mới dựa vào đây để hiện nút (Gateway cũ thì ẩn, không lỗi)
const FEATURES = ["images", "mentions", "reply", "delete", "admin", "cat", "interact", "dance", "npc"];
// tương tác giữa 2 nhân vật; ôm + mời nhảy cần người kia đồng ý
const INTERACTIONS = { highfive: false, cheers: false, coffee: false, hug: true, dance: true };
const DANCES = new Set(["groove", "disco", "robot", "shuffle", "spin", "hands"]);
const ASK_MS = 30_000;
const ACTIVITIES = new Set(["idle", "chat", "work", "image", "video", "web", "doc", "away"]);
const AVATAR_COLORS = ["hair", "skin", "shirt", "pants", "shoes", "accent"];
const AVATAR_WORDS = ["hairStyle", "outfit", "accessory", "face"];
const HISTORY_IN_MEMORY = 200;
const PING_MS = 25_000;
const LEAVE_GRACE_MS = 8_000;
// cứ chừng này lại gửi danh sách ai đang online để app tự đối chiếu (sửa lệch khi mạng làm rơi sự kiện vào / rời)
const ROSTER_MS = () => Math.max(100, Number(process.env.LOBBY_ROSTER_MS || 30_000));
const RELEASE_CHECK_MS = () => Math.max(100, Number(process.env.LOBBY_RELEASE_CHECK_MS || 30_000));

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
    this.index.rooms[msg.room] = { ts: msg.ts, from: msg.from, name: msg.name, preview: preview(msg) };
    this.scheduleSave();
  }

  // xoá 1 tin (người gửi thu hồi / admin xoá) – ghi lại cả file phòng
  async remove(room, id) {
    const list = await this.history(room);
    const i = list.findIndex((m) => m.id === id);
    let msg = i >= 0 ? list[i] : null;
    if (i >= 0) list.splice(i, 1);
    let lines = [];
    try { lines = (await readFile(this.roomFile(room), "utf8")).split("\n").filter(Boolean); } catch (e) { if (e.code !== "ENOENT") throw e; }
    const kept = [];
    for (const l of lines) { let m; try { m = JSON.parse(l); } catch { continue; } if (m.id === id) { msg = msg || m; continue; } kept.push(m); }
    if (!msg) return null;
    await writeFileAtomic(this.roomFile(room), kept.map((m) => JSON.stringify(m) + "\n").join(""));
    const last = kept[kept.length - 1];
    if (last) this.index.rooms[room] = { ts: last.ts, from: last.from, name: last.name, preview: preview(last) };
    else delete this.index.rooms[room];
    this.scheduleSave();
    return msg;
  }
}

const preview = (m) => (m.text ? m.text.slice(0, 80) : m.images && m.images.length ? "📷 Ảnh" : "");

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
    this.app = null;          // bản app Văn Phòng AI đang phát hành { version, notes }
    this.files = new LobbyFiles();       // ảnh gửi trong chat
    this.settings = new LobbySettings(); // phân quyền, cấm chat, thông báo ghim…
    this.today = { day: "", messages: 0, images: 0 };
    this.cat = new LobbyCat({ broadcast: (ev, data) => this.broadcast(ev, data) });
    this.asks = new Map(); // id -> { id, from, to, kind, style, exp } lời mời đang chờ trả lời
    this.npcStore = new NpcStore(); // hướng dẫn admin sửa thêm cho NPC
    this.watchRelease();
    this.rosterTimer = setInterval(() => this.sendRoster(), ROSTER_MS());
    this.rosterTimer.unref?.();
    // màn hình chiếu YouTube chung của cả quán
    this.cinema = new Cinema({
      broadcast: (ev, data) => this.broadcast(ev, ev === "cinema" ? { ...data, locked: !!this.settings.s.cinemaLocked } : data),
      onlineCount: () => [...this.members.values()].filter((m) => m.conns.size && !this.profileOf(m.ident).hidden).length
    });
  }

  // admin đăng bản app mới (scripts/publish-vanphong.mjs ghi latest.json) → báo ngay cho mọi app đang online
  watchRelease() {
    let first = true; // lần đọc đầu chỉ ghi nhận bản hiện có, không báo
    const tick = async () => {
      const r = await releaseInfo().catch(() => null);
      const changed = !first && r && r.version !== (this.app && this.app.version);
      first = false;
      this.app = r;
      if (changed) { this.broadcast("app-release", r); jsonLog("lobby_app_release", { version: r.version }); }
    };
    this.releaseReady = tick();
    this.releaseTimer = setInterval(tick, RELEASE_CHECK_MS());
    this.releaseTimer.unref?.();
  }

  async init() {
    await this.store.init();
    await this.files.init(lobbyConfig.dataDir);
    await this.settings.init(lobbyConfig.dataDir);
    await this.npcStore.init(lobbyConfig.dataDir);
  }

  // NPC đang dùng tài khoản nào (tên + nhân vật + đã có key để hỏi AI chưa)
  async npcPublic() {
    const n = this.settings.s.npc;
    if (!n) return null;
    const c = (await npcCandidates()).find((x) => x.id === n.id);
    return { id: n.id, name: c ? c.name : "Trợ lý SIMI", avatar: this.store.profiles[n.id]?.avatar || null, ready: !!(c && c.ready) };
  }

  count(kind, n = 1) {
    const day = new Date().toISOString().slice(0, 10);
    if (this.today.day !== day) this.today = { day, messages: 0, images: 0 };
    this.today[kind] += n;
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
      admin: isAdmin(ident) || undefined, avatar: prof.avatar, online,
      status: online ? m.status : null,
      pos: online ? m.pos : null,
      dance: online && m.dance ? m.dance : undefined
    };
  }

  canAccess(ident, room) {
    if (room === "all") return true;
    if (room.startsWith("dm:")) return room.slice(3).split("~").includes(ident.id);
    return false;
  }

  roomsFor(ident) {
    // chỉ có phòng chung cả công ty + nhắn riêng (đã bỏ phòng team)
    const rooms = [{ id: "all", name: "Cả công ty", kind: "all" }];
    for (const [room, last] of Object.entries(this.store.index.rooms)) {
      if (!room.startsWith("dm:") || !this.canAccess(ident, room)) continue;
      const other = room.slice(3).split("~").find((x) => x !== ident.id) || ident.id;
      const pm = this.publicMember(other);
      rooms.push({ id: room, name: pm ? pm.name : "Đồng nghiệp", kind: "dm", with: other, last });
    }
    for (const r of rooms) if (!r.last) r.last = this.store.index.rooms[r.id] || null;
    return rooms;
  }

  // những người đang online mà người khác được thấy (không tính người đang ẩn)
  onlineIds() {
    return [...this.members.keys()].filter((id) => { const pm = this.publicMember(id); return pm && pm.online; });
  }

  sendRoster() {
    if (![...this.members.values()].some((m) => m.conns.size)) return;
    this.broadcast("roster", { ids: this.onlineIds(), at: Date.now() });
  }

  // 1 tài khoản mở app trên mấy máy (mỗi máy 1 X-LTN-Client-ID) – các máy đó là cùng 1 người nên không thấy nhau trong Sảnh
  devices(m) { return new Set([...m.conns].map((r) => r.lobbyDevice)).size; }
  tellDevices(m, before) {
    const n = this.devices(m);
    if (n === before) return;
    const payload = `event: me\ndata: ${JSON.stringify({ devices: n })}\n\n`;
    for (const r of m.conns) r.write(payload);
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
    const b = kind === "msg" ? m.msgBucket : kind === "upload" ? (m.upBucket ||= { t: Date.now(), n: 0 }) : m.bucket;
    const win = kind === "state" ? 1_000 : 10_000;
    // ảnh tách riêng khỏi tin nhắn: gửi 4 ảnh 1 lúc không ăn vào lượt nhắn
    const max = kind === "msg" ? Number(process.env.LOBBY_MSG_PER_10S || 8) : kind === "upload" ? 16 : 12;
    if (Date.now() - b.t > win) { b.t = Date.now(); b.n = 0; }
    return ++b.n <= max;
  }

  // phần riêng của từng người: quyền, đang bị cấm chat tới lúc nào, thông báo ghim
  personal(ident) {
    return { perms: this.settings.permsFor(ident), admin: isAdmin(ident), mutedUntil: this.settings.until("mutes", ident.id) || null, pinned: this.settings.s.pinned };
  }

  // gửi lại phần riêng cho từng người đang online (admin vừa đổi quyền / cấm chat…)
  pushPersonal(filter = () => true) {
    for (const m of this.members.values()) {
      if (!m.conns.size || !filter(m.ident)) continue;
      const payload = `event: personal\ndata: ${JSON.stringify(this.personal(m.ident))}\n\n`;
      for (const r of m.conns) r.write(payload);
    }
  }

  cinemaState() { return { ...this.cinema.state(), locked: !!this.settings.s.cinemaLocked }; }

  knownIdent(id) {
    const m = this.members.get(id);
    if (m) return m.ident;
    const snap = this.store.profiles[id]?.ident;
    return snap ? { ...snap, id } : null;
  }

  checkMuted(ident) {
    const t = this.settings.until("mutes", ident.id);
    if (t) throw httpError(403, `Admin đã tạm khoá chat của bạn tới ${hhmm(t)}`, "permission_error");
  }

  need(ident, perm) {
    if (!this.settings.permsFor(ident)[perm]) throw httpError(403, `Admin chưa mở quyền "${PERMS[perm].label}" cho bạn`, "permission_error");
  }

  // ---------- các route ----------
  async stream(req, res, ident) {
    await this.releaseReady;
    const npcInfo = await this.npcPublic().catch(() => null); // tính trước khi nhận sự kiện để "hello" luôn đến đầu tiên
    const kicked = this.settings.until("kicks", ident.id);
    if (kicked) throw httpError(403, `Admin đã mời bạn ra khỏi Sảnh tới ${hhmm(kicked)}`, "permission_error");
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
    const devBefore = this.devices(m);
    const cid = String(req.headers["x-ltn-client-id"] || "").trim().toLowerCase();
    res.lobbyDevice = UUID.test(cid) ? cid : createHash("sha1").update(`${req.socket.remoteAddress}|${req.headers["user-agent"] || ""}`).digest("hex").slice(0, 16);
    // phiên bản app + hệ điều hành của máy (cho admin xem bao nhiêu máy đã lên bản mới)
    res.appVersion = cleanText(req.headers["x-vanphong-version"], 20).replace(/[^0-9a-z.+-]/gi, "");
    res.appOs = cleanText(req.headers["x-vanphong-os"], 24).replace(/[^0-9a-z._-]/gi, "");
    res.connectedAt = Date.now();
    m.conns.add(res);
    const others = [...this.members.keys()].filter((id) => id !== ident.id).map((id) => this.publicMember(id)).filter((x) => x && x.online);
    res.write(`event: hello\ndata: ${JSON.stringify({ me: { ...this.publicMember(ident.id), hidden: this.profileOf(ident).hidden, online: true, devices: this.devices(m) }, members: others, rooms: this.roomsFor(ident), retentionDays: lobbyConfig.retentionDays, app: this.app ? { version: this.app.version } : null, cinema: this.cinemaState(), cat: this.cat.state, npc: npcInfo, features: FEATURES, ...this.personal(ident) })}\n\n`);
    if (!wasOnline) { this.broadcastMember(ident.id); jsonLog("lobby_join", { member: ident.id }); }
    else this.tellDevices(m, devBefore);
    const ping = setInterval(() => res.write(": ping\n\n"), PING_MS);
    ping.unref?.();
    const close = () => {
      clearInterval(ping);
      const devBefore = this.devices(m);
      if (!m.conns.delete(res)) return;
      if (m.conns.size) { this.tellDevices(m, devBefore); return; }
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
    // nhảy liên tục tới khi tự dừng / đi chỗ khác (null = dừng)
    if (body.dance !== undefined) {
      const d = body.dance === null ? null : String(body.dance);
      if (d !== null && !DANCES.has(d)) throw httpError(400, "Điệu nhảy không hợp lệ");
      if (d !== m.dance) { m.dance = d; if (!hidden) this.broadcast("dance", { id: ident.id, style: d }, (x) => x.id !== ident.id); }
    }
    if (body.pos && m.dance && body.dance === undefined) { m.dance = null; if (!hidden) this.broadcast("dance", { id: ident.id, style: null }, (x) => x.id !== ident.id); }
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

  async cinemaAction(ident, body) {
    const m = this.touch(ident);
    const action = String(body.action || "");
    if (action === "add") {
      if (!this.allow(m, "msg")) throw httpError(429, "Bạn thao tác hơi nhanh, đợi vài giây nhé", "rate_limit_error");
      this.checkMuted(ident);
      this.need(ident, "cinema");
      if (this.settings.s.cinemaLocked && !isAdmin(ident)) throw httpError(403, "Admin đang khoá màn chiếu – tạm thời chưa thêm video được", "permission_error");
      return this.cinema.add(ident, this.profileOf(ident).name, body.url);
    }
    if (action === "skip") {
      if (isAdmin(ident) && this.cinema.current) { this.cinema.next("skip_admin"); return { skipped: true }; }
      return this.cinema.skip(ident);
    }
    if (action === "remove") return this.cinema.remove(ident, String(body.id || ""));
    if (action === "duration") return this.cinema.duration(String(body.videoId || ""), body.seconds);
    throw httpError(400, "action phải là add | skip | remove | duration");
  }

  async send(ident, body) {
    const m = this.touch(ident);
    if (!this.allow(m, "msg")) throw httpError(429, "Bạn nhắn hơi nhanh, đợi vài giây nhé", "rate_limit_error");
    this.checkMuted(ident);
    const room = this.targetRoom(ident, body);
    const text = cleanText(body.text, lobbyConfig.maxChars);
    const imageIds = Array.isArray(body.images) ? body.images.map(String).slice(0, MAX_IMAGES + 1) : [];
    if (imageIds.length > MAX_IMAGES) throw httpError(400, `Mỗi tin gửi tối đa ${MAX_IMAGES} ảnh`);
    if (!text && !imageIds.length) throw httpError(400, "Tin nhắn đang trống");
    if (imageIds.length) this.need(ident, "image");
    const msg = { id: randomUUID(), room, from: ident.id, name: this.profileOf(ident).name, teamId: ident.teamId, text, ts: Date.now() };
    // @tag: chỉ nhận người có thật; @mọi người chỉ ở phòng chung, cần quyền, giới hạn số lần mỗi giờ
    const mentions = [];
    for (const raw of Array.isArray(body.mentions) ? body.mentions.slice(0, MAX_MENTIONS) : []) {
      const id = String(raw);
      if (id === "all") {
        if (room !== "all") continue;
        this.need(ident, "everyone");
        const now = Date.now(); m.everyone = (m.everyone || []).filter((t) => now - t < 3600_000);
        if (m.everyone.length >= EVERYONE_PER_HOUR && !isAdmin(ident)) throw httpError(429, `@mọi người chỉ dùng được ${EVERYONE_PER_HOUR} lần mỗi giờ`, "rate_limit_error");
        m.everyone.push(now);
      } else if (!MEMBER_ID.test(id) || !this.knownIdent(id) || !this.canAccess(this.knownIdent(id), room)) continue;
      if (!mentions.includes(id)) mentions.push(id);
    }
    if (mentions.length) {
      msg.mentions = mentions;
      // tên lúc tag – app tô màu đúng "@Tên" kể cả khi người đó đang offline
      msg.mentionNames = Object.fromEntries(mentions.map((id) => [id, id === "all" ? "mọi người" : this.profileOf(this.knownIdent(id)).name]));
    }
    // trả lời 1 tin: lưu kèm trích đoạn để hiện được cả khi tin gốc đã trôi khỏi lịch sử đang tải
    if (body.replyTo) {
      const orig = (await this.store.history(room)).find((x) => x.id === String(body.replyTo));
      if (orig) msg.reply = { id: orig.id, from: orig.from, name: orig.name, text: orig.text.slice(0, 140), image: !!(orig.images && orig.images.length) };
    }
    if (imageIds.length) msg.images = await this.files.attach(imageIds, { by: ident.id, room, msgId: msg.id });
    await this.store.append(msg);
    this.count("messages"); if (msg.images) this.count("images", msg.images.length);
    this.broadcast("message", msg, (x) => this.canAccess(x, room));
    jsonLog("lobby_message", { member: ident.id, roomKind: room.split(":")[0], chars: text.length, images: imageIds.length, mentions: mentions.length });
    return { message: msg };
  }

  // phòng nhận tin: { room } hoặc { to: id người nhận } (nhắn riêng)
  targetRoom(ident, body) {
    let room = String(body.room || "all");
    if (body.to) {
      const to = String(body.to);
      const other = to !== ident.id && this.knownIdent(to);
      if (!other) throw httpError(404, "Không tìm thấy đồng nghiệp này", "not_found_error");
      room = dmRoom(ident.id, to);
      if (!isAdmin(other)) this.need(ident, "dm"); // vẫn nhắn được cho admin để hỏi / báo lỗi
    }
    if (!this.canAccess(ident, room)) throw httpError(403, "Không có quyền nhắn vào phòng này", "permission_error");
    return room;
  }

  // người gửi thu hồi tin của mình; admin xoá được tin trong phòng chung (không đọc / xoá tin nhắn riêng của người khác)
  async deleteMessage(ident, body) {
    const room = String(body.room || "");
    const id = String(body.id || "");
    if (!this.canAccess(ident, room)) throw httpError(403, "Không có quyền ở phòng này", "permission_error");
    const msg = (await this.store.history(room)).find((x) => x.id === id);
    if (!msg) throw httpError(404, "Tin nhắn không còn", "not_found_error");
    const own = msg.from === ident.id;
    if (!own && !isAdmin(ident)) throw httpError(403, "Chỉ người gửi hoặc admin mới xoá được tin này", "permission_error");
    await this.store.remove(room, id);
    for (const img of msg.images || []) await this.files.remove(img.id);
    this.broadcast("message-delete", { room, id }, (x) => this.canAccess(x, room));
    if (!own) await this.settings.audit({ id: ident.id, name: this.profileOf(ident).name }, "delete-message", { target: msg.from, targetName: msg.name, room, text: msg.text.slice(0, 120), images: (msg.images || []).length });
    return { ok: true };
  }

  async upload(req, ident, url) {
    const m = this.touch(ident);
    if (!this.allow(m, "upload")) throw httpError(429, "Bạn gửi ảnh hơi nhanh, đợi vài giây nhé", "rate_limit_error");
    this.checkMuted(ident);
    this.need(ident, "image");
    const room = this.targetRoom(ident, { room: url.searchParams.get("room"), to: url.searchParams.get("to") });
    const body = await readBody(req, Math.ceil(this.filesMax() + 300 * 1024));
    const f = await this.files.put({ by: ident.id, room, body, thumbBytes: url.searchParams.get("thumbBytes"), w: url.searchParams.get("w"), h: url.searchParams.get("h") });
    return { id: f.id, w: f.w, h: f.h, type: f.type, size: f.size };
  }

  filesMax() { return Number(process.env.LOBBY_IMAGE_MAX_MB || 5) * 1048576; }

  async file(res, ident, url) {
    const f = this.files.get(url.searchParams.get("id"));
    // chưa gắn vào tin nào: chỉ người tải lên xem được (ảnh xem trước trước khi gửi)
    if (!f || !this.canAccess(ident, f.room) || (!f.msg && f.by !== ident.id)) throw httpError(404, "Ảnh không còn hoặc bạn không có quyền xem", "not_found_error");
    return this.files.send(res, f, url.searchParams.get("thumb") === "1");
  }

  // ---------- mèo + tương tác giữa các nhân vật ----------
  catAction(ident, body) {
    const m = this.touch(ident);
    if (!this.allow(m, "msg")) throw httpError(429, "Từ từ thôi, mèo chóng mặt mất 😹", "rate_limit_error");
    if (this.profileOf(ident).hidden) throw httpError(403, "Đang ẩn thì không chơi với mèo được – bấm Hiện lại trước nhé", "permission_error");
    return this.cat.act(String(body.action || ""), { id: ident.id, name: this.profileOf(ident).name }, m.pos);
  }

  async npcAsk(ident, body, selfUrl) {
    const m = this.touch(ident);
    const n = this.settings.s.npc;
    if (!n) throw httpError(503, "Admin chưa chọn tài khoản cho Trợ lý – tạm thời chỉ xem được hướng dẫn", "service_unavailable");
    const question = cleanText(body.question, 1500);
    if (!question) throw httpError(400, "Câu hỏi đang trống");
    const now = Date.now(); m.npcAsks = (m.npcAsks || []).filter((t) => now - t < 3600_000);
    if (m.npcAsks.length >= npcConfig.perHour) throw httpError(429, `Mỗi người hỏi Trợ lý tối đa ${npcConfig.perHour} câu mỗi giờ – nghỉ chút rồi hỏi tiếp nhé`, "rate_limit_error");
    m.npcAsks.push(now);
    // hướng dẫn admin đã sửa thì dùng bản đó; chưa sửa thì dùng bản app gửi kèm (bản có sẵn trong app)
    const custom = this.npcStore.data.guides;
    const guideText = custom ? custom.map((g) => `## ${g.title}\n${g.steps.map((s2, i) => `${i + 1}. ${s2.text}`).join("\n")}`).join("\n\n") : cleanText(body.guide, 24_000);
    const answer = await askNpc({ npcId: n.id, question, history: body.history, guideText, notes: this.npcStore.data.notes, askerName: this.profileOf(ident).name, selfUrl });
    jsonLog("lobby_npc_ask", { member: ident.id, chars: question.length });
    return { answer };
  }

  // { to, kind[, style] } mời / làm ngay · { id, accept } trả lời lời mời
  async interact(ident, body) {
    const m = this.touch(ident);
    const now = Date.now();
    for (const [id, a] of this.asks) if (a.exp < now) this.asks.delete(id);
    if (body.id) {
      const ask = this.asks.get(String(body.id));
      if (!ask || ask.to !== ident.id) throw httpError(404, "Lời mời đã hết hạn", "not_found_error");
      this.asks.delete(ask.id);
      const from = this.members.get(ask.from);
      if (!body.accept) { this.sendTo(ask.from, "interact", { id: ask.id, state: "declined", kind: ask.kind, by: ident.id, byName: this.profileOf(ident).name }); return { ok: true }; }
      if (!from || !from.conns.size) throw httpError(404, "Người mời đã rời Sảnh", "not_found_error");
      return this.goInteract(ask.from, ident.id, ask.kind, ask.style);
    }
    if (!this.allow(m, "msg")) throw httpError(429, "Từ từ thôi 😄", "rate_limit_error");
    const kind = String(body.kind || "");
    if (!(kind in INTERACTIONS)) throw httpError(400, "kind phải là highfive | cheers | coffee | hug | dance");
    const to = String(body.to || "");
    const other = this.members.get(to);
    if (to === ident.id || !other || !other.conns.size || this.profileOf(other.ident).hidden) throw httpError(404, "Người này không còn trong Sảnh", "not_found_error");
    if (this.profileOf(ident).hidden) throw httpError(403, "Đang ẩn thì không tương tác được – bấm Hiện lại trước nhé", "permission_error");
    const style = kind === "dance" ? (DANCES.has(String(body.style)) ? String(body.style) : "groove") : undefined;
    if (!INTERACTIONS[kind]) return this.goInteract(ident.id, to, kind, style);
    if ([...this.asks.values()].some((a) => a.from === ident.id && a.to === to)) throw httpError(409, "Đang chờ người ấy trả lời lời mời trước", "conflict_error");
    const ask = { id: randomUUID(), from: ident.id, to, kind, style, exp: now + ASK_MS };
    this.asks.set(ask.id, ask);
    this.sendTo(to, "interact", { id: ask.id, state: "ask", kind, style, from: ident.id, fromName: this.profileOf(ident).name, exp: ask.exp });
    return { ok: true, asked: true, id: ask.id };
  }

  // phát cho cả Sảnh: a đi tới chỗ b rồi cả hai cùng diễn
  goInteract(a, b, kind, style) {
    const ma = this.members.get(a); const mb = this.members.get(b);
    if (ma && mb && mb.pos) ma.pos = { x: clamp(mb.pos.x + 0.7, -20, 20), z: clamp(mb.pos.z + 0.3, -20, 20), seat: null };
    if (kind === "dance") { for (const x of [ma, mb]) if (x) x.dance = style; }
    const ev = { state: "go", kind, style, a, b, aName: ma ? this.profileOf(ma.ident).name : "", bName: mb ? this.profileOf(mb.ident).name : "", at: Date.now() };
    this.broadcast("interact", ev);
    jsonLog("lobby_interact", { kind, a, b });
    return { ok: true, ...ev };
  }

  sendTo(id, event, data) {
    const m = this.members.get(id); if (!m) return;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const r of m.conns) r.write(payload);
  }

  // ---------- quản trị ----------
  async adminOverview() {
    const online = [];
    const versions = {};
    for (const [id, m] of this.members) {
      if (!m.conns.size) continue;
      const prof = this.profileOf(m.ident);
      const devs = new Map();
      for (const r of m.conns) devs.set(r.lobbyDevice, { version: r.appVersion || "", os: r.appOs || "", since: r.connectedAt });
      for (const d of devs.values()) { const v = d.version || "?"; versions[v] = (versions[v] || 0) + 1; }
      online.push({ id, name: prof.name, teamId: m.ident.teamId, teamName: m.ident.teamName, hidden: prof.hidden, admin: isAdmin(m.ident), shared: m.ident.shared, devices: [...devs.values()], mutedUntil: this.settings.until("mutes", id) || null });
    }
    const people = new Map();
    for (const [id, p] of Object.entries(this.store.profiles)) if (p.ident) people.set(id, { id, name: p.ident.fixedName || p.nickname || id, teamId: p.ident.teamId, teamName: p.ident.teamName, shared: !!p.ident.shared });
    for (const o of online) people.set(o.id, { id: o.id, name: o.name, teamId: o.teamId, teamName: o.teamName, shared: !!o.shared });
    const teams = new Map();
    for (const p of people.values()) teams.set(p.teamId, p.teamName || p.teamId);
    const s = this.settings.s;
    const mutes = Object.keys(s.mutes).filter((id) => this.settings.until("mutes", id)).map((id) => ({ id, name: people.get(id)?.name || id, until: s.mutes[id] }));
    const kicks = Object.keys(s.kicks).filter((id) => this.settings.until("kicks", id)).map((id) => ({ id, name: people.get(id)?.name || id, until: s.kicks[id] }));
    return {
      online, versions, latest: this.app ? this.app.version : null, today: this.today, files: this.files.stats(),
      people: [...people.values()].sort((a, b) => a.name.localeCompare(b.name, "vi")),
      teams: [...teams.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => String(a.name).localeCompare(String(b.name), "vi")),
      permsDef: Object.fromEntries(Object.entries(PERMS).map(([k, v]) => [k, v])),
      perms: s.perms, mutes, kicks, cinemaLocked: !!s.cinemaLocked, pinned: s.pinned, npc: s.npc,
      npcCandidates: await npcCandidates().catch(() => []), npcGuides: this.npcStore.data.guides, npcNotes: this.npcStore.data.notes, npcKeysHint: "LOBBY_NPC_KEYS",
      cinema: this.cinemaState()
    };
  }

  async adminAction(ident, body) {
    const me = { id: ident.id, name: this.profileOf(ident).name };
    const action = String(body.action || "");
    const target = () => {
      const id = String(body.id || "");
      const t = this.knownIdent(id);
      if (!t) throw httpError(404, "Không tìm thấy người này", "not_found_error");
      if (isAdmin(t)) throw httpError(400, "Không áp dụng cho admin");
      return { id, name: this.profileOf(t).name };
    };
    const minutes = () => Math.max(0, Math.min(7 * 24 * 60, Math.round(Number(body.minutes) || 0)));
    let result = { ok: true };
    if (action === "mute") {
      const t = target(); const min = minutes();
      if (min) this.settings.s.mutes[t.id] = Date.now() + min * 60_000; else delete this.settings.s.mutes[t.id];
      await this.settings.save();
      this.pushPersonal((x) => x.id === t.id);
      await this.settings.audit(me, min ? "mute" : "unmute", { target: t.id, targetName: t.name, minutes: min || undefined });
    } else if (action === "kick") {
      const t = target(); const min = Math.max(1, minutes() || 10);
      this.settings.s.kicks[t.id] = Date.now() + min * 60_000;
      await this.settings.save();
      const m = this.members.get(t.id);
      if (m) for (const r of [...m.conns]) { r.write(`event: kicked\ndata: ${JSON.stringify({ until: this.settings.s.kicks[t.id] })}\n\n`); r.end(); }
      await this.settings.audit(me, "kick", { target: t.id, targetName: t.name, minutes: min });
    } else if (action === "unkick") {
      const t = target(); delete this.settings.s.kicks[t.id]; await this.settings.save();
      await this.settings.audit(me, "unkick", { target: t.id, targetName: t.name });
    } else if (action === "perms") {
      const scope = String(body.scope || "");
      this.settings.setPerms(scope, body.key, body.perms);
      await this.settings.save();
      this.pushPersonal();
      await this.settings.audit(me, "perms", { scope, key: body.key || undefined, perms: body.perms });
    } else if (action === "cinema") {
      const op = String(body.op || "");
      if (op === "skip") { if (this.cinema.current) this.cinema.next("skip_admin"); }
      else if (op === "clear") { this.cinema.queue = []; this.cinema.emit(); }
      else if (op === "lock" || op === "unlock") { this.settings.s.cinemaLocked = op === "lock"; await this.settings.save(); }
      else throw httpError(400, "op phải là skip | clear | lock | unlock");
      if (op === "lock" || op === "unlock") this.cinema.emit();
      await this.settings.audit(me, "cinema-" + op);
    } else if (action === "announce") {
      const text = cleanText(body.text, 300);
      if (!text) throw httpError(400, "Thông báo đang trống");
      const note = { id: randomUUID(), text, by: me.name, ts: Date.now() };
      if (body.pin) { this.settings.s.pinned = note; await this.settings.save(); this.pushPersonal(); }
      this.broadcast("announce", { ...note, popup: body.popup !== false });
      await this.settings.audit(me, "announce", { text, pin: !!body.pin });
    } else if (action === "unpin") {
      this.settings.s.pinned = null; await this.settings.save(); this.pushPersonal();
      await this.settings.audit(me, "unpin");
    } else if (action === "npc") {
      const id = body.id ? String(body.id) : null;
      if (id && !MEMBER_ID.test(id)) throw httpError(400, "Mã tài khoản không hợp lệ");
      if (id && !(await npcCandidates()).some((c) => c.id === id)) throw httpError(404, "Không tìm thấy tài khoản này trong users.json", "not_found_error");
      this.settings.s.npc = id ? { id, by: me.name, ts: Date.now() } : null;
      await this.settings.save();
      this.broadcast("npc", { npc: await this.npcPublic() });
      await this.settings.audit(me, "npc", { target: id });
    } else if (action === "npc-guides") {
      const patch = {};
      if (body.guides !== undefined) patch.guides = cleanGuides(body.guides);
      if (body.notes !== undefined) patch.notes = cleanText(body.notes, 4000);
      await this.npcStore.save(patch);
      this.broadcast("npc-guides", { updatedAt: this.npcStore.data.updatedAt });
      await this.settings.audit(me, "npc-guides", { guides: patch.guides === undefined ? undefined : patch.guides === null ? "mặc định" : patch.guides.length, notes: patch.notes !== undefined || undefined });
    } else throw httpError(400, "action không hợp lệ");
    return result;
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
  await L.init();
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
      return sendJson(res, 200, { me: L.publicMember(ident.id), members, rooms: L.roomsFor(ident), features: FEATURES, cinema: L.cinemaState(), cat: L.cat.state, npc: await L.npcPublic().catch(() => null), ...L.personal(ident) });
    }
    case "GET /v1/lobby/messages": return sendJson(res, 200, await L.messages(ident, url));
    case "POST /v1/lobby/messages": return sendJson(res, 201, await L.send(ident, await json()));
    case "POST /v1/lobby/messages/delete": return sendJson(res, 200, await L.deleteMessage(ident, await json()));
    case "POST /v1/lobby/upload": return sendJson(res, 201, await L.upload(req, ident, url));
    case "GET /v1/lobby/file": return L.file(res, ident, url);
    case "GET /v1/lobby/admin":
      if (!isAdmin(ident)) throw httpError(403, "Chỉ admin mới xem được trang quản trị", "permission_error");
      return sendJson(res, 200, { ...(await L.adminOverview()), audit: await L.settings.auditTail(150) });
    case "POST /v1/lobby/admin":
      if (!isAdmin(ident)) throw httpError(403, "Chỉ admin mới làm được thao tác này", "permission_error");
      return sendJson(res, 200, await L.adminAction(ident, await json()));
    case "POST /v1/lobby/state": return sendJson(res, 200, await L.state(ident, await json()));
    case "POST /v1/lobby/profile": return sendJson(res, 200, await L.profile(ident, await json()));
    case "GET /v1/lobby/cinema": L.touch(ident); return sendJson(res, 200, L.cinemaState());
    case "POST /v1/lobby/cat": return sendJson(res, 200, await L.catAction(ident, await json()));
    case "POST /v1/lobby/interact": return sendJson(res, 200, await L.interact(ident, await json()));
    case "GET /v1/lobby/npc": L.touch(ident); return sendJson(res, 200, { npc: await L.npcPublic(), guides: L.npcStore.data.guides, updatedAt: L.npcStore.data.updatedAt });
    case "POST /v1/lobby/npc/ask": {
      const local = String(req.socket.localAddress || "127.0.0.1").replace(/^::ffff:/, "");
      const host = local === "::" || local === "0.0.0.0" || local === "::1" ? "127.0.0.1" : local.includes(":") ? `[${local}]` : local;
      return sendJson(res, 200, await L.npcAsk(ident, await json(), `http://${host}:${req.socket.localPort}`));
    }
    case "POST /v1/lobby/cinema": return sendJson(res, 200, await L.cinemaAction(ident, await json()));
    default: sendJson(res, 404, openAiError("Không tìm thấy route Sảnh", "not_found_error"));
  }
}
