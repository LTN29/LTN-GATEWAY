#!/usr/bin/env node
// Đăng bản mới của app Văn Phòng AI lên Gateway để máy nhân viên tự cập nhật.
//
//   node --env-file=.env scripts/publish-vanphong.mjs <thư-mục-chứa-file-build> [--notes "Có gì mới"] [--notes-file CHANGELOG.md] [--keep 2] [--force]
//
// Thư mục chứa các file build, hoặc thư mục có các thư mục con windows/ mac/ linux/ (một phần cũng được):
//   VanPhongAI-<ver>-Setup.exe            → win-setup      (Windows, bản cài – tự cập nhật êm nhất)
//   VanPhongAI-<ver>-portable.exe         → win-portable   (Windows, bản chạy ngay)
//   VanPhongAI-<ver>-mac-arm64.zip        → mac-arm64
//   VanPhongAI-<ver>-linux-amd64.deb      → linux-deb
//   VanPhongAI-<ver>-linux-x86_64.AppImage → linux-appimage
// Thường không cần chạy tay: đặt VANPHONG_GITHUB_REPO + VANPHONG_GITHUB_TOKEN thì Gateway tự lấy bản mới từ GitHub Release.
import { readFile } from "node:fs/promises";
import { publishFolder } from "../src/app-release-publish.mjs";

const args = process.argv.slice(2);
const src = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
if (!src) {
  console.error('Cách dùng: node scripts/publish-vanphong.mjs <thư-mục-build> [--notes "Có gì mới"] [--notes-file file.md] [--keep 2] [--force]');
  process.exit(1);
}
try {
  let notes = opt("--notes") || "";
  if (opt("--notes-file")) notes = await readFile(opt("--notes-file"), "utf8");
  const r = await publishFolder(src, { notes, keep: Number(opt("--keep") || 2), force: args.includes("--force"), log: console.log });
  console.log(`\nĐã đăng Văn Phòng AI ${r.version} (${Object.keys(r.files).length} file) vào ${r.out}`);
  console.log("Máy đang mở Sảnh nhận thông báo trong khoảng 30 giây; máy khác tự kiểm tra mỗi giờ và khi mở app.");
  console.log("Trang tải cho máy mới: <Gateway>/install/vanphong");
} catch (e) {
  console.error("Lỗi: " + (e.message || e));
  process.exit(1);
}
