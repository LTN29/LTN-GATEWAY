import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(resolve(root, "src/app/main.js"), "utf8");
if (!source.includes("x-ltn-csrf-token")) throw new Error("CSRF header missing");
if (source.includes("localStorage.setItem") || source.includes("sessionStorage.setItem")) {
  throw new Error("Do not persist secrets in browser storage");
}
for (const route of [
  "/admin/users/import",
  "/admin/usage",
  "/admin/memory/review",
  "/admin/memory/files",
  "/admin/sync",
  "/admin/system",
  "/admin/audit"
]) {
  if (!source.includes(route)) throw new Error(`Admin route missing: ${route}`);
}
for (const marker of [
  "oneTimeKey",
  "createUserModalHtml",
  "create-user-from-form",
  "fill-import-template",
  "validate-import",
  "commit-import",
  "rollback:",
  "retry-all-sync",
  "Cloudflare Access"
]) {
  if (!source.includes(marker)) throw new Error(`UI marker missing: ${marker}`);
}
console.log("admin-ui tests completed");
