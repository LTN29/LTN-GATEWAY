// Quản trị Sảnh: ai là admin (LOBBY_ADMINS trong .env, theo mã tài khoản – không theo tên hiển thị), phân quyền theo
// mặc định / team / từng người, cấm chat, mời ra khỏi Sảnh, khoá màn chiếu, thông báo ghim, chọn tài khoản làm NPC
// và nhật ký mọi thao tác của admin. Gateway kiểm tra quyền ở mọi route – app chỉ ẩn / hiện nút cho dễ nhìn.
import { appendFile, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

// các quyền bật / tắt được; admin luôn có tất cả
export const PERMS = {
  image: { label: "Gửi ảnh", def: true },
  everyone: { label: "Tag @mọi người", def: false },
  cinema: { label: "Thêm video màn chiếu", def: true },
  dm: { label: "Nhắn riêng", def: true }
};

const ID = /^[a-z]:[A-Za-z0-9_.:@-]{1,120}$/;
const TEAM = /^[A-Za-z0-9_.-]{1,64}$/;

// LOBBY_ADMINS=u:it-ltn,u:abc  (viết "it-ltn" cũng được – hiểu là tài khoản cá nhân u:it-ltn)
export function adminIds() {
  return new Set(String(process.env.LOBBY_ADMINS || "").split(/[\s,;]+/).filter(Boolean).map((s) => (s.includes(":") ? s : `u:${s}`)));
}

export const isAdmin = (ident) => !!ident && !ident.shared && adminIds().has(ident.id);

const blank = () => ({ perms: { default: {}, teams: {}, users: {} }, mutes: {}, kicks: {}, cinemaLocked: false, pinned: null, npc: null });

export class LobbySettings {
  constructor() { this.dir = null; this.s = blank(); }

  async init(dir) {
    if (this.dir === dir) return;
    this.dir = dir;
    try { this.s = { ...blank(), ...JSON.parse(await readFile(join(dir, "settings.json"), "utf8")) }; } catch (e) { if (e.code !== "ENOENT") throw e; this.s = blank(); }
    for (const k of ["default", "teams", "users"]) if (!this.s.perms[k] || typeof this.s.perms[k] !== "object") this.s.perms[k] = {};
  }

  async save() {
    const p = join(this.dir, "settings.json"); const tmp = `${p}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(this.s, null, 1)); await rename(tmp, p);
  }

  // quyền thực tế = mặc định → ghi đè theo team → ghi đè theo người
  permsFor(ident) {
    const out = {};
    for (const [k, v] of Object.entries(PERMS)) out[k] = v.def;
    if (isAdmin(ident)) { for (const k of Object.keys(out)) out[k] = true; return out; }
    for (const layer of [this.s.perms.default, this.s.perms.teams[ident.teamId], this.s.perms.users[ident.id]]) {
      if (layer) for (const k of Object.keys(PERMS)) if (typeof layer[k] === "boolean") out[k] = layer[k];
    }
    return out;
  }

  // scope: default | team | user; value true / false / null (= theo cấp trên)
  setPerms(scope, key, patch) {
    let layer;
    if (scope === "default") layer = this.s.perms.default;
    else if (scope === "team") { if (!TEAM.test(String(key))) throw bad("Mã team không hợp lệ"); layer = this.s.perms.teams[key] ||= {}; }
    else if (scope === "user") { if (!ID.test(String(key))) throw bad("Mã người không hợp lệ"); layer = this.s.perms.users[key] ||= {}; }
    else throw bad("scope phải là default | team | user");
    for (const [k, v] of Object.entries(patch || {})) {
      if (!PERMS[k]) continue;
      if (v === null && scope !== "default") delete layer[k];
      else if (typeof v === "boolean") layer[k] = v;
    }
    if (scope === "team" && !Object.keys(layer).length) delete this.s.perms.teams[key];
    if (scope === "user" && !Object.keys(layer).length) delete this.s.perms.users[key];
  }

  until(kind, id) {
    const t = this.s[kind][id];
    if (!t) return 0;
    if (t <= Date.now()) { delete this.s[kind][id]; return 0; }
    return t;
  }

  async audit(by, action, detail = {}) {
    const line = JSON.stringify({ ts: Date.now(), by: by.id, byName: by.name, action, ...detail }) + "\n";
    await appendFile(join(this.dir, "admin-audit.jsonl"), line, "utf8");
  }

  async auditTail(n = 100) {
    try {
      const lines = (await readFile(join(this.dir, "admin-audit.jsonl"), "utf8")).split("\n").filter(Boolean).slice(-n);
      return lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).reverse();
    } catch (e) { if (e.code === "ENOENT") return []; throw e; }
  }
}

const bad = (message) => Object.assign(new Error(message), { statusCode: 400, type: "invalid_request_error" });
export const hhmm = (t) => new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: process.env.LOBBY_TIMEZONE || "Asia/Ho_Chi_Minh" });
