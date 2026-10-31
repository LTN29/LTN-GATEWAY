// Tự lấy bản app Văn Phòng AI mới từ GitHub Release và đăng lên Gateway – admin không phải chép file lên server.
// Repo app (LTN29/SIMI_VANPHONGAI) có GitHub Actions build Windows / macOS / Ubuntu mỗi khi đẩy nhãn v<phiên bản>
// và tạo Release kèm file cài. Gateway hỏi Release mới nhất mỗi vài phút; có bản mới hơn thì tải về, kiểm SHA-256,
// đăng (latest.json) → Sảnh báo ngay cho app đang mở, app tự tải sẵn và hiện "Cập nhật ngay".
import { createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { compareVersions, currentRelease, kindOf, publishFolder, releaseOut, sha256File } from "./app-release-publish.mjs";
import { jsonLog } from "./utils.mjs";

export const syncConfig = {
  get repo() { return (process.env.VANPHONG_GITHUB_REPO || "").trim(); },
  get token() { return (process.env.VANPHONG_GITHUB_TOKEN || "").trim(); },
  get api() { return (process.env.VANPHONG_GITHUB_API || "https://api.github.com").replace(/\/+$/, ""); },
  get minutes() { return Math.max(1, Number(process.env.VANPHONG_GITHUB_POLL_MINUTES || 5)); }
};

const headers = (accept = "application/vnd.github+json") => ({
  accept, "x-github-api-version": "2022-11-28", "user-agent": "ltn-gateway-vanphong-sync",
  ...(syncConfig.token ? { authorization: `Bearer ${syncConfig.token}` } : {})
});

async function getJson(url) {
  const r = await fetch(url, { headers: headers() });
  if (r.status === 404) return null;
  if (r.status === 401 || r.status === 403) throw new Error(`GitHub từ chối (${r.status}) – kiểm tra VANPHONG_GITHUB_TOKEN có quyền đọc repo ${syncConfig.repo}`);
  if (!r.ok) throw new Error(`GitHub trả lỗi ${r.status}`);
  return r.json();
}

let running = null;
// 1 lượt: trả về { status: "published" | "up-to-date" | "no-release" | "disabled", version }
export function syncOnce(opts = {}) {
  if (!running) running = doSync(opts).finally(() => { running = null; });
  return running;
}

async function doSync({ log = () => {} } = {}) {
  if (!syncConfig.repo) return { status: "disabled" };
  const rel = await getJson(`${syncConfig.api}/repos/${syncConfig.repo}/releases/latest`);
  if (!rel || !rel.tag_name) return { status: "no-release" };
  const version = String(rel.tag_name).replace(/^v/i, "");
  const cur = await currentRelease();
  if (cur && compareVersions(version, cur.version) <= 0) return { status: "up-to-date", version: cur.version };

  const assets = (rel.assets || []).filter((a) => { const k = kindOf(a.name); return k && k.version === version; });
  if (!assets.length) throw new Error(`Release ${rel.tag_name} chưa có file cài VanPhongAI-${version}-… (GitHub Actions có thể còn đang build)`);
  const dir = join(releaseOut(), ".incoming", version);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  try {
    for (const a of assets) {
      log(`  tải ${a.name} (${Math.round((a.size || 0) / 1048576)} MB)…`);
      // file của repo riêng tư: tải qua API (GitHub chuyển hướng sang link có chữ ký, không gửi kèm token)
      const r = await fetch(`${syncConfig.api}/repos/${syncConfig.repo}/releases/assets/${a.id}`, { headers: headers("application/octet-stream"), redirect: "follow" });
      if (!r.ok || !r.body) throw new Error(`Không tải được ${a.name} (mã ${r.status})`);
      const file = join(dir, a.name);
      await pipeline(Readable.fromWeb(r.body), createWriteStream(file));
      const want = String(a.digest || "").replace(/^sha256:/i, "").toLowerCase();
      if (want && (await sha256File(file)) !== want) throw new Error(`${a.name} tải về không khớp SHA-256 của GitHub – đã huỷ, lượt sau tải lại`);
    }
    const notes = String(rel.body || "").trim();
    await writeFile(join(dir, ".notes"), notes);
    const res = await publishFolder(dir, { notes, log });
    jsonLog("vanphong_release_synced", { version: res.version, files: Object.keys(res.files).length, tag: rel.tag_name });
    return { status: "published", version: res.version, files: Object.keys(res.files) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// chạy nền trong Gateway: lượt đầu sau 20 giây, rồi mỗi VANPHONG_GITHUB_POLL_MINUTES phút
export function startReleaseSync() {
  if (!syncConfig.repo) return null;
  const tick = () => syncOnce().catch((e) => jsonLog("vanphong_release_sync_failed", { error: e.message }));
  const first = setTimeout(tick, 20_000); first.unref?.();
  const every = setInterval(tick, syncConfig.minutes * 60_000); every.unref?.();
  jsonLog("vanphong_release_sync_started", { repo: syncConfig.repo, minutes: syncConfig.minutes });
  return { stop: () => { clearTimeout(first); clearInterval(every); } };
}
