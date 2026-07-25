#!/usr/bin/env node
import { copyFile, mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { config } from "../src/config.mjs";
import {
  backupMemoryFile,
  memoryPathFromRelative,
  writeMemoryAudit
} from "../src/memory-governance.mjs";
import { syncMemoryFile } from "../src/onedrive.mjs";
import { redactSecrets, sha256 } from "../src/utils.mjs";

const args = process.argv.slice(2);
function opt(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] || "" : "";
}
function usage() {
  console.log(`Usage:
  node scripts/memory-rollback.mjs --file memory/users/SALES/sales-ngoc.md --list
  node scripts/memory-rollback.mjs --file memory/users/SALES/sales-ngoc.md --version VERSION_ID`);
}
function backupKeyForFile(relativeFile) {
  return relativeFile.replaceAll("\\", "/").replace(/^memory\//, "").replace(/[^a-zA-Z0-9._-]+/g, "__");
}

if (args.includes("--help") || args.length === 0) {
  usage();
  process.exit(0);
}

const fileArg = opt("file");
if (!fileArg) throw new Error("Missing --file");
const relativeFile = fileArg.replaceAll("\\", "/").replace(/^memory\//, "");
const target = memoryPathFromRelative(relativeFile);
const backupDir = resolve(config.memoryBackupDir, backupKeyForFile(relativeFile));

let versions = [];
try {
  versions = (await readdir(backupDir))
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3))
    .sort();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

if (args.includes("--list")) {
  for (const version of versions) console.log(version);
  process.exit(0);
}

const version = opt("version");
if (!version || !/^[0-9TZ-]+$/.test(version)) throw new Error("Missing or invalid --version");
if (!versions.includes(version)) throw new Error("Backup version not found");

const backupPath = resolve(backupDir, `${version}.md`);
const oldContent = await readFile(target, "utf8").catch(() => "");
const newContent = await readFile(backupPath, "utf8");

await backupMemoryFile(target, relativeFile);
await mkdir(dirname(target), { recursive: true });
const tmp = `${target}.${process.pid}.rollback.tmp`;
await writeFile(tmp, newContent, "utf8");
await rename(tmp, target);

let result = "success";
let errorCode = null;
try {
  await syncMemoryFile(relativeFile, newContent);
} catch (error) {
  result = "failed";
  errorCode = redactSecrets(error?.message || String(error)).slice(0, 200);
}

await writeMemoryAudit({
  action: "rollback",
  scope: relativeFile === "COMPANY.md" ? "COMPANY" : relativeFile.startsWith("users/") ? "USER" : "TEAM",
  userId: null,
  teamId: null,
  targetFile: relativeFile,
  normalizedKey: null,
  candidateId: null,
  oldValueHash: oldContent ? sha256(oldContent) : null,
  newValueHash: sha256(newContent),
  actor: "local-admin",
  result,
  errorCode
});

console.log(`Rolled back memory/${relativeFile} to ${version}`);
if (errorCode) console.log(`SharePoint sync pending/manual check needed: ${errorCode}`);
