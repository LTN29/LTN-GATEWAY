#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "../src/config.mjs";

async function readJsonl(file) {
  try {
    return (await readFile(file, "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function latestMemoryFiles(dir = config.memoryDir, prefix = "") {
  const results = [];
  for (const name of await readdir(dir).catch(() => [])) {
    const path = resolve(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) {
      results.push(...await latestMemoryFiles(path, `${prefix}${name}/`));
    } else if (name.endsWith(".md")) {
      results.push({ file: `${prefix}${name}`, mtime: info.mtime.toISOString() });
    }
  }
  return results.sort((a, b) => b.mtime.localeCompare(a.mtime)).slice(0, 10);
}

const today = new Date().toISOString().slice(0, 10);
const audit = await readJsonl(config.memoryAuditFile);
const queue = await readJsonl(config.memoryReviewQueueFile);
const outbox = await readJsonl(config.memorySyncOutboxFile);

console.log("Memory status");
console.log(`USER updates today: ${audit.filter((item) => item.timestamp?.startsWith(today) && item.action === "user_auto_update").length}`);
console.log(`TEAM pending: ${queue.filter((item) => item.status === "pending" && item.scope === "TEAM").length}`);
console.log(`COMPANY pending: ${queue.filter((item) => item.status === "pending" && item.scope === "COMPANY").length}`);
console.log(`Sensitive blocked: ${queue.filter((item) => item.status === "blocked_sensitive").length}`);
console.log(`Conflicts: ${queue.filter((item) => String(item.reason || "").includes("conflict")).length}`);
console.log(`Sync pending: ${outbox.filter((item) => item.status === "pending").length}`);
console.log(`Sync failed: ${outbox.filter((item) => item.status === "failed").length}`);
console.log("Recently changed memory files:");
for (const item of await latestMemoryFiles()) {
  console.log(`- memory/${item.file}\t${item.mtime}`);
}
