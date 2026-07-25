import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
await mkdir(dist, { recursive: true });
await mkdir(resolve(dist, "assets"), { recursive: true });
const source = await readFile(resolve(root, "src/app/main.tsx"), "utf8");
const styles = await readFile(resolve(root, "src/app/styles.css"), "utf8");
const js = source.replace('import "./styles.css";', "");
await writeFile(resolve(dist, "assets", "admin.js"), js, "utf8");
await writeFile(resolve(dist, "assets", "admin.css"), styles, "utf8");
const html = (await readFile(resolve(root, "index.html"), "utf8"))
  .replace('<script type="module" src="/src/app/main.tsx"></script>', '<link rel="stylesheet" href="/admin/assets/admin.css" /><script type="module" src="/admin/assets/admin.js"></script>');
await writeFile(resolve(dist, "index.html"), html, "utf8");
console.log("admin-ui build completed");
