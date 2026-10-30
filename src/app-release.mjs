// Phát hành app Văn Phòng AI qua Gateway: máy nhân viên tự kiểm tra /install/vanphong/latest.json,
// tải đúng file cho máy mình rồi cài lại. Admin đăng bản mới bằng scripts/publish-vanphong.mjs.
// Công khai như các bộ cài khác (không chứa secret); file chỉ được phục vụ khi có trong latest.json.
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

export const RELEASE_PREFIX = "/install/vanphong";
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;
const KIND_LABEL = {
  "win-setup": "Windows – bản cài (khuyên dùng, tự cập nhật)",
  "win-portable": "Windows – bản chạy ngay (không cần cài)",
  "mac-arm64": "macOS – Mac chip Apple (M1–M4)",
  "mac-x64": "macOS – Mac Intel",
  "linux-deb": "Ubuntu / Debian (.deb)",
  "linux-appimage": "Linux (AppImage)"
};

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

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function page(m) {
  const rows = m ? Object.entries(m.files).filter(([, f]) => f && FILE_NAME.test(f.name || "")).map(([k, f]) =>
    `<li><a href="${RELEASE_PREFIX}/${encodeURIComponent(f.name)}">${esc(KIND_LABEL[k] || k)}</a><small>${esc(f.name)} · ${Math.round((f.size || 0) / 1048576)} MB</small></li>`).join("") : "";
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Văn Phòng AI – tải về</title><style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f2f7fe;color:#15294a;margin:0;padding:32px 16px}
main{max-width:640px;margin:auto;background:#fff;border-radius:18px;padding:24px 28px;box-shadow:0 10px 30px rgba(20,60,120,.12)}
h1{margin:0 0 4px;color:#0a78f0}ul{list-style:none;padding:0}li{margin:10px 0;padding:12px 14px;border:1.5px solid #dce8f8;border-radius:12px}
a{font-weight:800;color:#0a78f0;text-decoration:none}small{display:block;color:#5d7091;margin-top:2px}code{background:#eaf2fd;padding:2px 6px;border-radius:6px}
</style></head><body><main><h1>Văn Phòng AI</h1>
${m ? `<p>Bản mới nhất: <b>${esc(m.version)}</b>${m.date ? ` · ${esc(String(m.date).slice(0, 10))}` : ""}</p><ul>${rows}</ul>
<p><small>Đã cài rồi thì không cần tải lại: app tự báo "Bản mới" và cập nhật bằng 1 nút. Ubuntu: <code>sudo apt install ./VanPhongAI-…-linux-amd64.deb</code></small></p>`
    : "<p>Chưa có bản phát hành nào.</p>"}
</main></body></html>`;
}

export async function handleRelease(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" });
    res.end();
    return;
  }
  const m = await readManifest();
  const sub = pathname.slice(RELEASE_PREFIX.length).replace(/^\/+/, "");
  if (!sub) {
    const body = Buffer.from(page(m));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": body.length, "cache-control": "no-cache", "x-content-type-options": "nosniff" });
    res.end(req.method === "HEAD" ? undefined : body);
    return;
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
  let name = "";
  try { name = decodeURIComponent(sub); } catch { /* sai mã hóa */ }
  const listed = m && Object.values(m.files).some((f) => f && f.name === name);
  if (!FILE_NAME.test(name) || !listed) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Không tìm thấy file");
    return;
  }
  const file = join(releaseDir(), name);
  let info;
  try { info = await stat(file); } catch { info = null; }
  if (!info || !info.isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Không tìm thấy file");
    return;
  }
  const headers = {
    "content-type": "application/octet-stream",
    "content-disposition": `attachment; filename="${name}"`,
    "cache-control": "public, max-age=3600",
    "accept-ranges": "bytes",
    "x-content-type-options": "nosniff"
  };
  // hỗ trợ tải tiếp (Range) cho mạng chập chờn
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
