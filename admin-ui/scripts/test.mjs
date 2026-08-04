import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(resolve(root, "src/app/main.js"), "utf8");
if (!source.includes("x-ltn-csrf-token")) throw new Error("CSRF header missing");
if (source.includes('id="editUserId" value="${escapeHtml(user.userId)}" disabled')) {
  throw new Error("Admin must be able to edit the employee ID");
}
if (!source.includes("const updatedUserId = updatedUser.userId")) {
  throw new Error("Follow-up user actions must use the renamed employee ID");
}
if (!source.includes('location.pathname === "/admin/"') || !source.includes('history.replaceState(null, "", `/admin${location.search}${location.hash}`)')) {
  throw new Error("Admin trailing-slash canonicalization missing");
}
if (source.includes("localStorage.setItem") || source.includes("sessionStorage.setItem")) {
  throw new Error("Do not persist secrets in browser storage");
}
if (source.includes("Cập nhật key") || source.includes("action.startsWith(\"rotate:\")")) {
  throw new Error("Legacy key-only edit action must not remain in the Admin UI");
}
for (const route of [
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
  "editUserModalHtml",
  "save-edit-user",
  "create-user-from-form",
  "rollback:",
  "retry-all-sync",
  "Cloudflare Access"
]) {
  if (!source.includes(marker)) throw new Error(`UI marker missing: ${marker}`);
}
for (const errorUiMarker of [
  "function errorGuidance",
  "function errorLogList",
  "Nguyên nhân có thể",
  "Đề xuất xử lý"
]) {
  if (!source.includes(errorUiMarker)) throw new Error(`Error log guidance missing: ${errorUiMarker}`);
}
for (const removedMarker of [
  "/admin/users/import",
  "Import CSV",
  "pageImport",
  "fill-import-template",
  "validate-import",
  "commit-import"
]) {
  if (source.includes(removedMarker)) throw new Error(`Removed CSV import UI remains: ${removedMarker}`);
}
for (const paginationMarker of ["function pagination", 'params.set("pageSize", "20")', 'pagination(data, "/admin/audit")', 'pagination(data, "/admin/memory/review")', "Duyệt trang này"]) {
  if (!source.includes(paginationMarker)) throw new Error(`Audit pagination marker missing: ${paginationMarker}`);
}
console.log("admin-ui tests completed");
