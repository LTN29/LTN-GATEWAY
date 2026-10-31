// Đăng 1 bản app Văn Phòng AI vào thư mục phát hành của Gateway (dùng chung cho scripts/publish-vanphong.mjs
// và việc tự lấy bản mới từ GitHub Release). Chép file → tính SHA-256 → ghi latest.json sau cùng.
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

export const PATTERNS = [
  ["win-setup", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-Setup\.exe$/],
  ["win-portable", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-portable\.exe$/],
  ["mac-arm64", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-mac-arm64\.zip$/],
  ["mac-x64", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-mac-x64\.zip$/],
  ["linux-deb", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-linux-amd64\.deb$/],
  ["linux-appimage", /^VanPhongAI-(\d+\.\d+\.\d+(?:-[\w.]+)?)-linux-x86_64\.AppImage$/]
];

export const releaseOut = () => resolve(process.env.VANPHONG_RELEASE_DIR || "./data/releases/vanphong");

export const sha256File = (file) => new Promise((ok, fail) => {
  const h = createHash("sha256");
  createReadStream(file).on("data", (d) => h.update(d)).on("error", fail).on("end", () => ok(h.digest("hex")));
});

// "0.10.2" > "0.9.9"
export function compareVersions(a, b) {
  const pa = String(a).split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  const pb = String(b).split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
}

export function kindOf(name) {
  for (const [kind, re] of PATTERNS) { const m = re.exec(name); if (m) return { kind, version: m[1] }; }
  return null;
}

export async function currentRelease() {
  try { return JSON.parse(await readFile(join(releaseOut(), "latest.json"), "utf8")); } catch { return null; }
}

// tìm file build trong thư mục (và thư mục con 1 cấp: windows/ mac/ linux/)
export async function findBuilds(dir) {
  const entries = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isFile()) entries.push(join(dir, e.name));
    else if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
      for (const f of await readdir(join(dir, e.name), { withFileTypes: true })) if (f.isFile()) entries.push(join(dir, e.name, f.name));
    }
  }
  const found = {}; let version = "";
  for (const file of entries) {
    const k = kindOf(basename(file)); if (!k) continue;
    if (version && k.version !== version) throw new Error(`thư mục có nhiều phiên bản khác nhau (${version} và ${k.version}) – chỉ để file của 1 bản`);
    version = k.version; found[k.kind] = file;
  }
  if (!version) throw new Error("không thấy file VanPhongAI-<phiên bản>-... nào trong " + dir);
  return { version, found };
}

export async function publishFolder(src, { notes = "", keep = 2, force = false, log = () => {} } = {}) {
  const { version, found } = await findBuilds(resolve(src));
  const out = releaseOut();
  await mkdir(out, { recursive: true });
  const prev = await currentRelease();
  if (prev && compareVersions(version, prev.version) < 0 && !force) throw new Error(`đang có bản ${prev.version} mới hơn ${version} (thêm --force nếu muốn quay về bản cũ)`);

  const files = {};
  for (const [kind, file] of Object.entries(found)) {
    const name = basename(file);
    const target = join(out, name);
    await copyFile(file, target + ".tmp");
    await rename(target + ".tmp", target);
    const info = await stat(target);
    files[kind] = { name, size: info.size, sha256: await sha256File(target) };
    log(`  ${kind.padEnd(15)} ${name} … ${Math.round(info.size / 1048576)} MB ✓`);
  }

  const manifest = { app: "vanphong-ai", version, date: new Date().toISOString(), notes: String(notes || "").trim(), files };
  await writeFile(join(out, "latest.json.tmp"), JSON.stringify(manifest, null, 2));
  await rename(join(out, "latest.json.tmp"), join(out, "latest.json"));

  // giữ file của vài bản gần nhất (máy đang tải dở vẫn tải xong), xoá bản cũ hơn
  const versions = new Set();
  for (const name of await readdir(out)) { const k = kindOf(name); if (k) versions.add(k.version); }
  const old = [...versions].sort(compareVersions).reverse().slice(Math.max(1, keep));
  for (const name of await readdir(out)) { const k = kindOf(name); if (k && old.includes(k.version)) await rm(join(out, name), { force: true }); }
  return { version, files, out };
}
