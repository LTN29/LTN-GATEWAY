#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "../src/config.mjs";

const apply = process.argv.includes("--apply");
if (!apply && !process.argv.includes("--dry-run")) {
  console.log(`Usage:
  node scripts/migrate-memory-format.mjs --dry-run
  node scripts/migrate-memory-format.mjs --apply`);
  process.exit(0);
}

async function files(dir = config.memoryDir, prefix = "") {
  const out = [];
  for (const name of await readdir(dir).catch(() => [])) {
    const path = resolve(dir, name);
    const fs = await import("node:fs/promises");
    const info = await fs.stat(path);
    if (info.isDirectory()) out.push(...await files(path, `${prefix}${name}/`));
    else if (name.endsWith(".md")) out.push(`${prefix}${name}`);
  }
  return out;
}

let count = 0;
for (const file of await files()) {
  const content = await readFile(resolve(config.memoryDir, file), "utf8");
  const keyed = (content.match(/<!-- ltn:key=/g) || []).length;
  const hasHeadings = /^## /m.test(content);
  console.log(`${apply ? "checked" : "dry-run"}\tmemory/${file}\tkeyed=${keyed}\theadings=${hasHeadings}`);
  count += 1;
}

console.log(`Migration ${apply ? "apply" : "dry-run"} completed. Files checked: ${count}. Existing content was not rewritten.`);
