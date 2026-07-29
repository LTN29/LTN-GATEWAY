import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

test("Admin Phase 2 exposes pilot-critical backend endpoints", async () => {
  const router = await readFile("src/admin/admin-router.mjs", "utf8");
  for (const marker of [
    "/admin/api/v1/usage/users",
    "/admin/api/v1/usage/teams",
    "/admin/api/v1/usage/devices",
    "/admin/api/v1/usage/export",
    "/admin/api/v1/memory/files",
    "/versions",
    "/rollback",
    "/admin/api/v1/audit",
    "visibleTeamIds",
    "MEMORY_ROLLBACK"
  ]) {
    assert.match(router, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("Admin Phase 2 UI uses real pages and keeps one-time key in memory only", async () => {
  const source = await readFile("admin-ui/src/app/main.js", "utf8");
  for (const marker of [
    "pageDashboard",
    "pageUsers",
    "pageImport",
    "pageUsage",
    "pageReview",
    "pageMemoryFiles",
    "pageSync",
    "pageSystem",
    "pageAudit",
    "createUserModalHtml",
    "editUserModalHtml",
    "save-edit-user",
    "create-user-from-form",
    "fill-import-template",
    "oneTimeKey",
    "Không lưu API key"
  ]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(source, /localStorage\.setItem|sessionStorage\.setItem|console\.log\(.*apiKey/i);
});

test("Admin build emits real app assets instead of placeholder-only bundle", async () => {
  const build = await readFile("admin-ui/scripts/build.mjs", "utf8");
  assert.match(build, /admin\.\$\{jsHash\}\.js/);
  assert.match(build, /admin\.\$\{cssHash\}\.css/);
  assert.doesNotMatch(build, /admin-placeholder/);
});

test("Admin built bundle is valid JavaScript", async () => {
  execFileSync(process.execPath, ["admin-ui/scripts/build.mjs"], { stdio: "pipe" });
  const html = await readFile("admin-ui/dist/index.html", "utf8");
  const match = html.match(/\/admin\/assets\/(admin\.[a-f0-9]{12}\.js)/);
  assert.ok(match, "hashed admin JS asset should be referenced by index.html");
  execFileSync(process.execPath, ["--check", `admin-ui/dist/assets/${match[1]}`], { stdio: "pipe" });
});
