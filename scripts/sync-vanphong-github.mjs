#!/usr/bin/env node
// Lấy ngay bản app Văn Phòng AI mới nhất từ GitHub Release và đăng lên Gateway (không cần đợi lượt tự động).
//   node --env-file=.env scripts/sync-vanphong-github.mjs
// Cần VANPHONG_GITHUB_REPO (vd LTN29/SIMI_VANPHONGAI) và VANPHONG_GITHUB_TOKEN (token chỉ đọc repo đó) trong .env.
import { syncConfig, syncOnce } from "../src/app-release-sync.mjs";

if (!syncConfig.repo) { console.error("Chưa đặt VANPHONG_GITHUB_REPO trong .env"); process.exit(1); }
try {
  const r = await syncOnce({ log: console.log });
  const msg = { published: `Đã đăng Văn Phòng AI ${r.version} từ GitHub (${(r.files || []).join(", ")})`, "up-to-date": `Gateway đã có bản mới nhất (${r.version})`, "no-release": "Repo chưa có Release nào" }[r.status] || r.status;
  console.log(msg);
} catch (e) { console.error("Lỗi: " + e.message); process.exit(1); }
