// Phát hành app Văn Phòng AI qua Gateway: máy nhân viên tự kiểm tra /install/vanphong/latest.json,
// tải đúng file cho máy mình rồi cài lại. Admin đăng bản mới bằng scripts/publish-vanphong.mjs.
// latest.json và file cài công khai (app tự cập nhật không có cookie); file chỉ được phục vụ khi có trong latest.json.
// Trang tải (/install/vanphong) mở cho mọi người xem; bấm tải (link "bản mới nhất") mới hỏi email – chỉ email trong danh sách
// admin bật ở tab Quản trị của app mới tải được.
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { downloadAccess, gateEnabled, isEmail, normEmail } from "./download-access.mjs";

export const RELEASE_PREFIX = "/install/vanphong";
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;

export const releaseDir = () => resolve(process.env.VANPHONG_RELEASE_DIR || "./data/releases/vanphong");

export function isReleasePath(pathname) {
  return pathname === RELEASE_PREFIX || pathname === RELEASE_PREFIX + "/" || pathname.startsWith(RELEASE_PREFIX + "/");
}

async function readManifest() {
  try {
    const j = JSON.parse(await readFile(join(releaseDir(), "latest.json"), "utf8"));
    return j && typeof j.version === "string" && j.files && typeof j.files === "object" ? j : null;
  } catch {
    return null;
  }
}

// phiên bản đang phát hành (Sảnh dùng để báo ngay cho app khi admin đăng bản mới)
export async function releaseInfo() {
  const m = await readManifest();
  return m ? { version: m.version, notes: String(m.notes || "").slice(0, 600) } : null;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// trang tải (thư mục site/vanphong trong repo): ai cũng xem được; hộp nhập email hiện khi bấm tải
const SITE = fileURLToPath(new URL("../site/vanphong/", import.meta.url));
const SITE_TYPES = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".svg": "image/svg+xml" };
const SITE_FILE = /^(?:shots\/)?[a-z0-9][a-z0-9._-]{0,60}\.(?:png|webp|jpg|mp4|svg)$/;
const tplCache = new Map();
async function tpl(name) {
  if (!tplCache.has(name) || process.env.NODE_ENV === "development") tplCache.set(name, await readFile(join(SITE, name), "utf8"));
  return tplCache.get(name);
}
// dữ liệu cho trang: email đang vào, phiên bản, tên + dung lượng file từng hệ điều hành (từ latest.json)
const jsonForScript = (v) => JSON.stringify(v).replace(/</g, "\\u003c");
async function sitePage(m, email) {
  const files = {};
  if (m) for (const [k, f] of Object.entries(m.files)) if (f && FILE_NAME.test(f.name || "")) files[k] = { name: f.name, size: Number(f.size) || 0 };
  const ver = m ? m.version : "";
  return (await tpl("index.html")).replaceAll("@@VER@@", esc(ver || "mới nhất")).replace("@@DATA@@", jsonForScript({ email: email || "", version: ver, date: m ? String(m.date || "").slice(0, 10) : "", files }));
}

function sendHtml(req, res, html, extra = {}) {
  const body = Buffer.from(html);
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": body.length, "cache-control": "no-store", "x-content-type-options": "nosniff", "x-frame-options": "DENY", "referrer-policy": "same-origin", ...extra });
  res.end(req.method === "HEAD" ? undefined : body);
}

const clientIp = (req) => String(req.headers["cf-connecting-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket?.remoteAddress || "?").trim();

async function readBody(req, max = 2048) {
  let n = 0; const chunks = [];
  for await (const c of req) { n += c.length; if (n > max) throw Object.assign(new Error("too_large"), { statusCode: 413 }); chunks.push(c); }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJsonSmall(res, status, obj, extra = {}) {
  const body = Buffer.from(JSON.stringify(obj));
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": body.length, "cache-control": "no-store", ...extra });
  res.end(body);
}

export async function handleRelease(req, res, pathname) {
  const sub = pathname.slice(RELEASE_PREFIX.length).replace(/^\/+/, "");
  const gate = gateEnabled();
  if (gate || sub === "login" || sub === "logout") await downloadAccess.init();
  // email chỉ dùng để biết ai đang tải (hiện trên trang) khi cổng đang bật

  // đăng nhập / đăng xuất trang tải
  if (sub === "login" || sub === "logout") {
    if (req.method !== "POST") { res.writeHead(405, { allow: "POST" }); res.end(); return; }
    if (sub === "logout") { sendJsonSmall(res, 200, { ok: true }, { "set-cookie": downloadAccess.cookie(req, "", 0) }); return; }
    const ip = clientIp(req);
    if (downloadAccess.limited(ip)) { sendJsonSmall(res, 429, { error: "too_many_tries" }); return; }
    let email = "";
    try { email = normEmail(JSON.parse(await readBody(req)).email); } catch { /* sai định dạng */ }
    if (!isEmail(email) || !downloadAccess.allowed(email)) { downloadAccess.fail(ip); sendJsonSmall(res, 403, { error: "not_allowed" }); return; }
    sendJsonSmall(res, 200, { ok: true }, { "set-cookie": downloadAccess.cookie(req, downloadAccess.sign(email), 86400 * Math.max(1, Math.min(365, Number(process.env.VANPHONG_DOWNLOAD_COOKIE_DAYS) || 30))) });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" });
    res.end();
    return;
  }
  const who = gate ? downloadAccess.who(req) : "";
  const m = await readManifest();
  if (!sub) return sendHtml(req, res, await sitePage(m, who));
  // ảnh, video của trang tải (công khai như trang)
  if (sub.startsWith("site/")) {
    const name = sub.slice(5);
    if (!SITE_FILE.test(name)) { res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); res.end("Không tìm thấy file"); return; }
    const file = join(SITE, ...name.split("/"));
    if (!file.startsWith(SITE.endsWith(sep) ? SITE : SITE + sep)) { res.writeHead(404); res.end(); return; }
    return sendFile(req, res, file, { "content-type": SITE_TYPES[extname(name)] || "application/octet-stream", "cache-control": "public, max-age=3600" });
  }
  if (sub === "latest.json") {
    if (!m) {
      res.writeHead(404, { "content-type": "application/json; charset=utf-8", "cache-control": "no-cache" });
      res.end(JSON.stringify({ error: "no_release" }));
      return;
    }
    const body = Buffer.from(JSON.stringify(m));
    res.writeHead(200, { "content-type": "application/json; charset=utf-8", "content-length": body.length, "cache-control": "no-cache", "x-content-type-options": "nosniff" });
    res.end(req.method === "HEAD" ? undefined : body);
    return;
  }
  // link cố định "bản mới nhất" cho trang tải: /install/vanphong/latest/win-setup → chuyển tới file của bản đang phát hành
  const alias = /^latest\/([a-z0-9-]{1,30})$/.exec(sub);
  if (alias) {
    // chưa nhập email (hoặc email đã bị tắt) → về phần Tải về của trang, bấm tải sẽ hỏi email
    if (gate && !who) { res.writeHead(302, { location: `${RELEASE_PREFIX}#tai-ve`, "cache-control": "no-store" }); res.end(); return; }
    const f = m && m.files[alias[1]];
    if (!f || !FILE_NAME.test(f.name || "")) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Chưa có bản cho hệ điều hành này");
      return;
    }
    res.writeHead(302, { location: `${RELEASE_PREFIX}/${encodeURIComponent(f.name)}`, "cache-control": "no-cache" });
    res.end();
    return;
  }
  let name = "";
  try { name = decodeURIComponent(sub); } catch { /* sai mã hóa */ }
  const listed = m && Object.values(m.files).some((f) => f && f.name === name);
  if (!FILE_NAME.test(name) || !listed) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Không tìm thấy file");
    return;
  }
  return sendFile(req, res, join(releaseDir(), name), {
    "content-type": "application/octet-stream",
    "content-disposition": `attachment; filename="${name}"`,
    "cache-control": "public, max-age=3600"
  });
}

// gửi file có hỗ trợ tải tiếp (Range) cho mạng chập chờn và để video tua được
async function sendFile(req, res, file, base) {
  let info;
  try { info = await stat(file); } catch { info = null; }
  if (!info || !info.isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Không tìm thấy file");
    return;
  }
  const headers = { ...base, "accept-ranges": "bytes", "x-content-type-options": "nosniff" };
  const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || "");
  let start = 0;
  let end = info.size - 1;
  if (range) {
    start = Number(range[1]);
    end = range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
    if (start > end || start >= info.size) {
      res.writeHead(416, { "content-range": `bytes */${info.size}` });
      res.end();
      return;
    }
    res.writeHead(206, { ...headers, "content-range": `bytes ${start}-${end}/${info.size}`, "content-length": end - start + 1 });
  } else {
    res.writeHead(200, { ...headers, "content-length": info.size });
  }
  if (req.method === "HEAD") { res.end(); return; }
  const stream = createReadStream(file, { start, end });
  stream.on("error", () => res.destroy());
  res.on("close", () => stream.destroy());
  stream.pipe(res);
}
