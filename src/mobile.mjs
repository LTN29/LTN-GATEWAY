// Sảnh trên điện thoại (PWA ở /m): đăng nhập bằng cách quét mã QR từ app Văn Phòng AI trên máy tính.
//
//  1. App máy tính (đã có key) gọi POST /v1/mobile/pair → mã ghép dùng 1 lần, hết hạn sau 5 phút → hiện QR <gateway>/m#pair=<mã>
//  2. Điện thoại mở link → POST /v1/mobile/claim {code} → nhận token phiên "vpm_…" (lưu trong trình duyệt điện thoại)
//  3. Điện thoại gọi /v1/lobby/* với token đó; danh tính = đúng người trên máy tính. Token CHỈ dùng được cho Sảnh,
//     không gọi được AI. Lưu mã băm của token + mã băm key máy tính: đổi / khoá key là phiên điện thoại tự hết hiệu lực.
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, createHash } from "node:crypto";
import { sendJson, openAiError, readBody } from "./http.mjs";
import { sha256, jsonLog } from "./utils.mjs";
import { authenticateKeyHash } from "./auth.mjs";

export const MOBILE_PREFIX = "/m";
export const TOKEN_PREFIX = "vpm_";
const PAIR_MS = () => Math.max(10_000, Number(process.env.MOBILE_PAIR_SECONDS || 300) * 1000);
const SESSION_DAYS = () => Math.max(1, Number(process.env.MOBILE_SESSION_DAYS || 60));
const MAX_SESSIONS = 5; // mỗi người tối đa 5 điện thoại / trình duyệt; ghép thêm thì bỏ phiên cũ nhất
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE = /^[A-Za-z0-9_-]{20,64}$/;
const SITE_DIR = fileURLToPath(new URL("../site/mobile/", import.meta.url));
const SITE_FILES = new Map([
  ["/m", "index.html"], ["/m/", "index.html"], ["/m/index.html", "index.html"],
  ["/m/manifest.webmanifest", "manifest.webmanifest"], ["/m/sw.js", "sw.js"],
  ["/m/icon-192.png", "icon-192.png"], ["/m/icon-512.png", "icon-512.png"], ["/m/apple-touch-icon.png", "apple-touch-icon.png"]
]);
// Sảnh 3D (dựng từ app bằng build/mobile-lobby.js): /m/sanh3d/sanh3d.js, sanh3d.css, npc-guides.js, brand/*.png|jpg
const SANH3D = /^\/m\/sanh3d\/((?:sanh3d\.(?:js|css))|npc-guides\.js|brand\/[a-z0-9-]{1,40}\.(?:png|jpg))$/;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg" };

const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });
const b64 = (n) => randomBytes(n).toString("base64url");
const who = (p) => `${p.principalType}:${p.principalId}`;
// chủ của phiên điện thoại: tài khoản riêng → tài khoản; key chung của team → team + mã máy tính đã ghép
const ownerOf = (w, clientId) => `${w}|${clientId || ""}`;

export const mobileConfig = {
  get file() { return resolve(process.env.MOBILE_SESSIONS_FILE || "./data/mobile/sessions.json"); }
};

class MobileSessions {
  constructor() { this.file = null; this.sessions = []; this.pairs = new Map(); this.saveTimer = null; }

  async init() {
    const f = mobileConfig.file;
    if (this.file === f) return;
    this.file = f;
    try { this.sessions = JSON.parse(await readFile(f, "utf8")).sessions || []; } catch { this.sessions = []; }
  }

  async save() {
    await mkdir(dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify({ version: 1, sessions: this.sessions }));
    await rename(tmp, this.file);
  }
  saveSoon() { clearTimeout(this.saveTimer); this.saveTimer = setTimeout(() => this.save().catch(() => {}), 5000); this.saveTimer.unref?.(); }

  // máy tính xin mã ghép (principal đã xác thực bằng key thật)
  pair(principal, rawKey, clientId) {
    if (principal.mobile) throw httpError(403, "Mã QR chỉ tạo được từ app trên máy tính", "permission_error");
    const now = Date.now();
    for (const [c, p] of this.pairs) if (p.expiresAt < now) this.pairs.delete(c);
    const code = b64(24);
    const expiresAt = now + PAIR_MS();
    this.pairs.set(code, { keyHash: sha256(rawKey), who: who(principal), clientId: UUID.test(clientId || "") ? clientId.toLowerCase() : null, name: principal.displayName || "", expiresAt });
    return { code, expiresAt };
  }

  // điện thoại đổi mã ghép lấy token phiên (mã dùng 1 lần)
  async claim(code, device) {
    await this.init();
    const p = CODE.test(String(code || "")) && this.pairs.get(code);
    if (!p || p.expiresAt < Date.now()) { if (p) this.pairs.delete(code); throw httpError(400, "Mã QR đã hết hạn hoặc đã dùng – tạo mã mới trên máy tính nhé"); }
    this.pairs.delete(code);
    const principal = await authenticateKeyHash(p.keyHash);
    if (!principal || !principal.enabled || !principal.team?.enabled) throw httpError(403, "Tài khoản trên máy tính không còn hiệu lực", "permission_error");
    if (principal.principalType === "team" && !p.clientId) throw httpError(400, "App trên máy tính chưa có mã máy (X-LTN-Client-ID) – cập nhật app rồi tạo lại mã QR");
    const token = TOKEN_PREFIX + b64(32);
    const now = Date.now();
    const s = { id: b64(9), tokenHash: sha256(token), keyHash: p.keyHash, who: p.who, clientId: p.clientId, device: String(device || "Điện thoại").replace(/[^\p{L}\p{N} ._()/-]/gu, "").slice(0, 60) || "Điện thoại", createdAt: now, lastUsedAt: now };
    const mine = this.sessions.filter((x) => ownerOf(x.who, x.clientId) === ownerOf(s.who, s.clientId)).sort((a, b) => a.lastUsedAt - b.lastUsedAt);
    const drop = new Set(mine.slice(0, Math.max(0, mine.length - MAX_SESSIONS + 1)).map((x) => x.id));
    this.sessions = this.sessions.filter((x) => !drop.has(x.id)).concat(s);
    await this.save();
    jsonLog("mobile_paired", { who: s.who, session: s.id });
    return { token, name: principal.displayName || p.name || "", expiresAt: now + SESSION_DAYS() * 86400_000 };
  }

  // token "vpm_…" → principal của người đã ghép (gắn cờ mobile, chỉ dùng cho Sảnh)
  async authenticate(token) {
    await this.init();
    const h = sha256(token);
    const s = this.sessions.find((x) => x.tokenHash === h);
    if (!s) return null;
    const now = Date.now();
    if (now - s.lastUsedAt > SESSION_DAYS() * 86400_000) { this.sessions = this.sessions.filter((x) => x !== s); this.saveSoon(); return null; }
    const principal = await authenticateKeyHash(s.keyHash);
    if (!principal || who(principal) !== s.who) return null; // key máy tính đã đổi / bị xoá
    if (now - s.lastUsedAt > 3600_000) { s.lastUsedAt = now; this.saveSoon(); }
    return { ...principal, mobile: { sessionId: s.id, clientId: s.clientId } };
  }

  // máy tính xem / đăng xuất từ xa các điện thoại đã ghép (đúng chủ: cùng tài khoản, hoặc cùng mã máy nếu key chung)
  list(principal, clientId) {
    const owner = ownerOf(who(principal), principal.principalType === "team" ? String(clientId || "").toLowerCase() : null);
    return this.sessions.filter((x) => ownerOf(x.who, principal.principalType === "team" ? x.clientId : null) === owner)
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
      .map((x) => ({ id: x.id, device: x.device, createdAt: x.createdAt, lastUsedAt: x.lastUsedAt }));
  }
  async revoke(principal, clientId, id) {
    const mine = new Set(this.list(principal, clientId).map((x) => x.id));
    if (!mine.has(String(id || ""))) throw httpError(404, "Không tìm thấy điện thoại này", "not_found_error");
    this.sessions = this.sessions.filter((x) => x.id !== id);
    await this.save();
    jsonLog("mobile_revoked", { who: who(principal), session: id });
    return { ok: true };
  }

  async logout(principal) {
    await this.init();
    const id = principal.mobile && principal.mobile.sessionId;
    this.sessions = this.sessions.filter((x) => x.id !== id);
    await this.save();
    return { ok: true };
  }
}

let store = null;
export const mobileSessions = () => (store || (store = new MobileSessions()));
export const isMobileToken = (raw) => typeof raw === "string" && raw.startsWith(TOKEN_PREFIX);
export const isMobileApiPath = (pathname) => ["/v1/mobile/pair", "/v1/mobile/claim", "/v1/mobile/logout", "/v1/mobile/sessions", "/v1/mobile/revoke"].includes(pathname);
export const isMobileSitePath = (pathname) => SITE_FILES.has(pathname) || SANH3D.test(pathname);

// địa chỉ công khai của Gateway (đi qua Cloudflare / proxy) để in vào mã QR
export function publicOrigin(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/+$/, "");
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() || (req.socket.encrypted ? "https" : "http");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim().replace(/[^A-Za-z0-9.:[\]-]/g, "");
  return `${proto}://${host}`;
}

// POST /v1/mobile/claim (không cần key) – các route còn lại cần principal đã xác thực
export async function handleMobileClaim(req, res) {
  const raw = await readBody(req, 4096);
  let body = {};
  try { body = raw.length ? JSON.parse(raw.toString("utf8")) : {}; } catch { throw httpError(400, "JSON không hợp lệ"); }
  return sendJson(res, 200, await mobileSessions().claim(body.code, body.device));
}

export async function handleMobileApi(req, res, principal, pathname, rawKey) {
  const S = mobileSessions();
  await S.init();
  if (req.method === "POST" && pathname === "/v1/mobile/pair") {
    const { code, expiresAt } = S.pair(principal, rawKey, String(req.headers["x-ltn-client-id"] || "").trim());
    return sendJson(res, 200, { code, expiresAt, url: `${publicOrigin(req)}${MOBILE_PREFIX}#pair=${code}` });
  }
  const cid = String(req.headers["x-ltn-client-id"] || "").trim();
  if (pathname === "/v1/mobile/sessions" || pathname === "/v1/mobile/revoke") {
    if (principal.mobile) throw httpError(403, "Chỉ quản lý được từ app trên máy tính", "permission_error");
    if (req.method === "GET" && pathname === "/v1/mobile/sessions") return sendJson(res, 200, { data: S.list(principal, cid) });
    if (req.method === "POST" && pathname === "/v1/mobile/revoke") {
      const raw = await readBody(req, 4096); let body = {};
      try { body = raw.length ? JSON.parse(raw.toString("utf8")) : {}; } catch { throw httpError(400, "JSON không hợp lệ"); }
      return sendJson(res, 200, await S.revoke(principal, cid, body.id));
    }
  }
  if (req.method === "POST" && pathname === "/v1/mobile/logout") {
    if (!principal.mobile) throw httpError(400, "Chỉ dùng trên điện thoại");
    return sendJson(res, 200, await S.logout(principal));
  }
  throw httpError(404, "Không tìm thấy route", "not_found_error");
}

// trang PWA tĩnh
export async function serveMobileSite(req, res, pathname) {
  const m3 = SANH3D.exec(pathname);
  const name = SITE_FILES.get(pathname) || (m3 && `sanh3d/${m3[1]}`);
  const file = join(SITE_DIR, name);
  let info;
  try { info = await stat(file); } catch { sendJson(res, 404, openAiError("Không tìm thấy trang", "not_found_error")); return; }
  const type = TYPES[extname(name)] || "application/octet-stream";
  const etag = `"${createHash("sha1").update(`${info.size}-${info.mtimeMs}`).digest("hex").slice(0, 16)}"`;
  const headers = {
    "content-type": type, etag, "x-content-type-options": "nosniff",
    // html + service worker luôn kiểm tra bản mới; ảnh icon cache lâu
    "cache-control": /\.(png|jpg)$/.test(name) ? "public, max-age=604800" : "no-cache",
    "referrer-policy": "no-referrer"
  };
  if (name === "sw.js") headers["service-worker-allowed"] = "/m";
  if (name === "index.html") headers["content-security-policy"] = "default-src 'self'; img-src 'self' blob: data: https://i.ytimg.com; frame-src https://www.youtube.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
  if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers); res.end(); return; }
  res.writeHead(200, { ...headers, "content-length": info.size });
  if (req.method === "HEAD") { res.end(); return; }
  createReadStream(file).pipe(res);
}
