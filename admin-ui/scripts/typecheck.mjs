import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function files(dir) {
  const out = [];
  for (const name of await readdir(dir).catch(() => [])) {
    const path = resolve(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) out.push(...await files(path));
    else if (/\.(js|ts|tsx|css|html)$/.test(name)) out.push(path);
  }
  return out;
}

for (const file of await files(resolve(root, "src"))) {
  const text = await readFile(file, "utf8");
  if (text.includes("localStorage.setItem") || text.includes("sessionStorage.setItem")) {
    throw new Error(`Secret storage guard failed: ${file}`);
  }
}
console.log("admin-ui static checks completed");
