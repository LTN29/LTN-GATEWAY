#!/usr/bin/env node
// Đăng bản mới của app Văn Phòng AI lên Gateway để máy nhân viên tự cập nhật.
//
//   node scripts/publish-vanphong.mjs <thư-mục-chứa-file-build> [--notes "Có gì mới"] [--notes-file CHANGELOG.md]
//
// Thư mục chứa các file build, hoặc thư mục có các thư mục con windows/ mac/ linux/ (một phần cũng được):
//   VanPhongAI-<ver>-Setup.exe            → win-setup      (Windows, bản cài – tự cập nhật êm nhất)
//   VanPhongAI-<ver>-portable.exe         → win-portable   (Windows, bản chạy ngay)
//   VanPhongAI-<ver>-mac-arm64.zip        → mac-arm64
//   VanPhongAI-<ver>-mac-x64.zip          → mac-x64
//   VanPhongAI-<ver>-linux-amd64.deb      → linux-deb
//   VanPhongAI-<ver>-linux-x86_64.AppImage → linux-appimage
// Script chép file vào VANPHONG_RELEASE_DIR (mặc định ./data/releases/vanphong), tính SHA-256,
// rồi ghi latest.json sau cùng (máy nhân viên chỉ thấy bản mới khi mọi file đã sẵn sàng).
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const PATTERNS = [
  ["win-setup", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-Setup\.exe$/],
  ["win-portable", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-portable\.exe$/],
  ["mac-arm64", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-mac-arm64\.zip$/],
  ["mac-x64", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-mac-x64\.zip$/],
  ["linux-deb", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-linux-amd64\.deb$/],
  ["linux-appimage", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-linux-x86_64\.AppImage$/]
];

function usage(msg) {
  if (msg) console.error("Lỗi: " + msg);
  console.error('Cách dùng: node scripts/publish-vanphong.mjs <thư-mục-build> [--notes "Có gì mới"] [--notes-file file.md] [--keep 2]');
  process.exit(1);
}

const sha256 = (file) => new Promise((ok, fail) => {
  const h = createHash("sha256");
  createReadStream(file).on("data", (d) => h.update(d)).on("error", fail).on("end", () => ok(h.digest("hex")));
});

const cmp = (a, b) => {
  const pa = a.split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  const pb = b.split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
};

async function main() {
  const args = process.argv.slice(2);
  const src = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
  if (!src) usage();
  const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
  let notes = opt("--notes") || "";
  if (opt("--notes-file")) notes = await readFile(opt("--notes-file"), "utf8");
  const keep = Math.max(1, Number(opt("--keep") || 2));

  const dir = resolve(src);
  const found = {};
  let version = "";
  // tìm trong thư mục và các thư mục con 1 cấp (ví dụ windows/, mac/, linux/ của thư mục app)
  const entries = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isFile()) entries.push(join(dir, e.name));
    else if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
      for (const f of await readdir(join(dir, e.name), { withFileTypes: true })) if (f.isFile()) entries.push(join(dir, e.name, f.name));
    }
  }
  for (const file of entries) {
    const name = basename(file);
    for (const [kind, re] of PATTERNS) {
      const m = re.exec(name);
      if (!m) continue;
      if (version && m[1] !== version) usage(`thư mục có nhiều phiên bản khác nhau (${version} và ${m[1]}) – chỉ để file của 1 bản`);
      version = m[1];
      found[kind] = file;
    }
  }
  if (!version) usage("không thấy file VanPhongAI-<phiên bản>-... nào trong " + dir);

  const out = resolve(process.env.VANPHONG_RELEASE_DIR || "./data/releases/vanphong");
  await mkdir(out, { recursive: true });
  let prev = null;
  try { prev = JSON.parse(await readFile(join(out, "latest.json"), "utf8")); } catch { /* lần đầu */ }
  if (prev && cmp(version, prev.version) < 0 && !args.includes("--force")) usage(`đang có bản ${prev.version} mới hơn ${version} (thêm --force nếu muốn quay về bản cũ)`);

  const files = {};
  for (const [kind, file] of Object.entries(found)) {
    const name = basename(file);
    const target = join(out, name);
    process.stdout.write(`  ${kind.padEnd(15)} ${name} … `);
    await copyFile(file, target + ".tmp");
    await rename(target + ".tmp", target);
    const info = await stat(target);
    files[kind] = { name, size: info.size, sha256: await sha256(target) };
    console.log(`${Math.round(info.size / 1048576)} MB ✓`);
  }

  const manifest = { app: "vanphong-ai", version, date: new Date().toISOString(), notes: notes.trim(), files };
  await writeFile(join(out, "latest.json.tmp"), JSON.stringify(manifest, null, 2));
  await rename(join(out, "latest.json.tmp"), join(out, "latest.json"));

  // giữ lại file của vài bản gần nhất (máy đang tải dở vẫn tải xong), xóa bản cũ hơn
  const versions = new Set();
  for (const name of await readdir(out)) for (const [, re] of PATTERNS) { const m = re.exec(name); if (m) versions.add(m[1]); }
  const old = [...versions].sort(cmp).reverse().slice(keep);
  for (const name of await readdir(out)) for (const [, re] of PATTERNS) { const m = re.exec(name); if (m && old.includes(m[1])) await rm(join(out, name), { force: true }); }

  console.log(`\nĐã đăng Văn Phòng AI ${version} (${Object.keys(files).length} file) vào ${out}`);
  console.log("Máy nhân viên sẽ thấy nút \"Bản mới\" trong vòng vài giờ (hoặc ngay khi bấm Cài đặt → Kiểm tra bản mới).");
  console.log("Trang tải cho máy mới: <Gateway>/install/vanphong");
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
