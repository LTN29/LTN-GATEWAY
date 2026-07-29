import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(resolve(dist, "assets"), { recursive: true });
const source = await readFile(resolve(root, "src/app/main.js"), "utf8");
const styles = await readFile(resolve(root, "src/app/styles.css"), "utf8");
const js = source.replace('import "./styles.css";', "");
const jsHash = createHash("sha256").update(js).digest("hex").slice(0, 12);
const cssHash = createHash("sha256").update(styles).digest("hex").slice(0, 12);
const jsFile = `admin.${jsHash}.js`;
const cssFile = `admin.${cssHash}.css`;
const jsPath = resolve(dist, "assets", jsFile);
await writeFile(jsPath, js, "utf8");
execFileSync(process.execPath, ["--check", jsPath], { stdio: "pipe" });
await writeFile(resolve(dist, "assets", cssFile), styles, "utf8");
const html = (await readFile(resolve(root, "index.html"), "utf8"))
  .replace('<script type="module" src="/src/app/main.js"></script>', `<link rel="stylesheet" href="/admin/assets/${cssFile}" /><script type="module" src="/admin/assets/${jsFile}"></script>`);
await writeFile(resolve(dist, "index.html"), html, "utf8");
console.log(`admin-ui build completed: ${jsFile}, ${cssFile}`);
