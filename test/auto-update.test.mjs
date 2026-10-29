import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sha = (text) => createHash("sha256").update(text).digest("hex");

async function serve(routes) {
  const server = http.createServer((req, res) => {
    const body = routes[req.url];
    if (body === undefined) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "content-type": "application/octet-stream" });
    res.end(body);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

test("auto-update refreshes only changed files, verifies checksums and never writes outside CODEX_HOME", async () => {
  const home = await mkdtemp(join(tmpdir(), "simi-auto-update-"));
  await mkdir(join(home, "skills", "simi-trinh-duyet"), { recursive: true });
  await mkdir(join(home, "tools"), { recursive: true });
  await writeFile(join(home, "skills", "simi-trinh-duyet", "SKILL.md"), "old skill");
  await writeFile(join(home, "tools", "pdf-extract.py"), "same");
  await writeFile(join(home, "ltn-installer-version"), "3");

  const files = {
    "/install/skills/simi-trinh-duyet/SKILL.md": "new skill",
    "/install/tools/browser-mcp.mjs": "new mcp",
    "/install/tools/pdf-extract.py": "same",
    "/install/tools/bad.mjs": "tampered",
    "/install/skills/not-installed/SKILL.md": "skip me"
  };
  const manifest = {
    object: "simi.auto_update.manifest",
    installerVersion: 3,
    releaseNote: "Sửa lỗi đọc Shopee.",
    files: [
      { url: "/install/skills/simi-trinh-duyet/SKILL.md", target: "skills/simi-trinh-duyet/SKILL.md", sha256: sha("new skill") },
      { url: "/install/tools/browser-mcp.mjs", target: "browser-mcp.mjs", sha256: sha("new mcp") },
      { url: "/install/tools/pdf-extract.py", target: "tools/pdf-extract.py", sha256: sha("same") },
      { url: "/install/tools/bad.mjs", target: "tools/bad.mjs", sha256: sha("expected") },
      { url: "/install/skills/not-installed/SKILL.md", target: "skills/not-installed/SKILL.md", sha256: sha("skip me") },
      { url: "/install/tools/browser-mcp.mjs", target: "../escape.mjs", sha256: sha("new mcp") },
      { url: "/install/tools/browser-mcp.mjs", target: "config.toml", sha256: sha("new mcp") }
    ]
  };
  const { server, url } = await serve({ ...files, "/install/manifest.json": JSON.stringify(manifest) });
  try {
    process.env.CODEX_HOME = home;
    process.env.LTN_GATEWAY_BASE_URL = `${url}/v1`;
    const { runAutoUpdate } = await import(`../scripts/auto-update.mjs?case=${Date.now()}`);
    const status = await runAutoUpdate();

    assert.equal(status.error, undefined);
    assert.deepEqual(status.updated.sort(), ["browser-mcp.mjs", "skills/simi-trinh-duyet/SKILL.md"]);
    assert.equal(await readFile(join(home, "skills", "simi-trinh-duyet", "SKILL.md"), "utf8"), "new skill");
    assert.equal(await readFile(join(home, "browser-mcp.mjs"), "utf8"), "new mcp");
    assert.equal(existsSync(join(home, "tools", "bad.mjs")), false, "checksum mismatch is not installed");
    assert.ok(status.failed.some((item) => item.target === "tools/bad.mjs" && /checksum/.test(item.error)));
    assert.equal(existsSync(join(home, "skills", "not-installed")), false, "skills the user does not have are not added");
    assert.equal(existsSync(join(home, "..", "escape.mjs")), false);
    assert.equal(existsSync(join(home, "config.toml")), false, "config.toml is never written by auto-update");
    assert.equal(status.fullUpdateRequired, false);
    assert.equal(existsSync(join(home, "auto-update.lock")), false, "lock is released");
    const saved = JSON.parse(await readFile(join(home, "logs", "auto-update.json"), "utf8"));
    assert.equal(saved.updated.length, 2);

    const second = await runAutoUpdate();
    assert.deepEqual(second.updated, [], "a second run downloads nothing");
  } finally {
    server.close();
    delete process.env.CODEX_HOME;
    delete process.env.LTN_GATEWAY_BASE_URL;
    await rm(home, { recursive: true, force: true });
  }
});

test("auto-update flags when the server needs the full installer", async () => {
  const home = await mkdtemp(join(tmpdir(), "simi-auto-update-"));
  await writeFile(join(home, "ltn-installer-version"), "1");
  const { server, url } = await serve({
    "/install/manifest.json": JSON.stringify({ object: "simi.auto_update.manifest", installerVersion: 2, files: [] })
  });
  try {
    process.env.CODEX_HOME = home;
    process.env.LTN_GATEWAY_BASE_URL = url;
    const { runAutoUpdate } = await import(`../scripts/auto-update.mjs?case=full-${Date.now()}`);
    const status = await runAutoUpdate();
    assert.equal(status.fullUpdateRequired, true);
    assert.deepEqual(status.installerVersion, { local: 1, server: 2 });
  } finally {
    server.close();
    delete process.env.CODEX_HOME;
    delete process.env.LTN_GATEWAY_BASE_URL;
    await rm(home, { recursive: true, force: true });
  }
});

test("auto-update refuses plain HTTP gateways other than localhost", async () => {
  const home = await mkdtemp(join(tmpdir(), "simi-auto-update-"));
  try {
    process.env.CODEX_HOME = home;
    process.env.LTN_GATEWAY_BASE_URL = "http://ai.simi.vn/v1";
    const { runAutoUpdate } = await import(`../scripts/auto-update.mjs?case=http-${Date.now()}`);
    const status = await runAutoUpdate();
    assert.match(status.error, /HTTPS/);
  } finally {
    delete process.env.CODEX_HOME;
    delete process.env.LTN_GATEWAY_BASE_URL;
    await rm(home, { recursive: true, force: true });
  }
});

test("installers schedule auto-update per user on every OS and remove it on uninstall", async () => {
  const win = await readFile(new URL("../scripts/install-codex-windows.ps1", import.meta.url), "utf8");
  assert.match(win, /Install-SimiAutoUpdate -CodexHome \$codexHome -GatewayBaseUrl \$GatewayBaseUrl/);
  assert.match(win, /Register-ScheduledTask -TaskName "SIMI Auto Update"/);
  assert.match(win, /-RunLevel Limited/);
  assert.match(win, /Unregister-ScheduledTask -TaskName "SIMI Auto Update"/);
  const unix = await readFile(new URL("../scripts/install-codex-unix.sh", import.meta.url), "utf8");
  assert.match(unix, /  install_local_tools\n  install_simi_auto_update\n/);
  assert.match(unix, /vn\.simi\.auto-update/);
  assert.match(unix, /simi-auto-update\.timer/);
  assert.match(unix, /# simi-auto-update/);
  assert.match(unix, /remove_managed_config\n  remove_simi_auto_update\n/);
  const server = await readFile(new URL("../src/server.mjs", import.meta.url), "utf8");
  assert.match(server, /pathname === "\/install\/manifest\.json"/);
  assert.match(server, /"cache-control": "no-store"/);
});

test("desktop notification tells the user exactly what to do", async () => {
  const { notificationFor } = await import(`../scripts/auto-update.mjs?case=notify-${Date.now()}`);
  assert.equal(notificationFor({ updated: [] }), null, "no notification when nothing changed");
  const skillOnly = notificationFor({ updated: ["skills/simi/SKILL.md"] });
  assert.equal(skillOnly.needsRestart, false);
  assert.match(skillOnly.message, /Mở đoạn chat mới/);
  const tool = notificationFor({ updated: ["skills/simi/SKILL.md", "browser-mcp.mjs"], releaseNote: "Sửa lỗi đọc Shopee." });
  assert.equal(tool.needsRestart, true);
  assert.equal(tool.message, "Sửa lỗi đọc Shopee. Thoát hẳn Codex rồi mở lại để dùng bản mới.");
  assert.equal(notificationFor({ updated: [], fullUpdate: { exitCode: 0 } }).needsRestart, true);
  assert.equal(notificationFor({ updated: [], fullUpdate: { exitCode: 1 } }), null, "a failed full update is not announced");
  const source = await readFile(new URL("../scripts/auto-update.mjs", import.meta.url), "utf8");
  assert.match(source, /ToastNotificationManager/);
  assert.match(source, /display notification \(item 2 of argv\)/);
  assert.match(source, /notify-send/);
});

test("the Gateway offers Claude Sonnet as default when the Combo has it", async () => {
  const { preferredDefaultModel } = await import("../src/combo-model-access.mjs");
  assert.equal(preferredDefaultModel([{ id: "cc/claude-opus-5-5" }, { id: "cc/claude-sonnet-5-5" }, { id: "cx/gpt-6.1-sol" }]), "cc/claude-sonnet-5-5");
  assert.equal(preferredDefaultModel([{ id: "cc/claude-opus-5-5" }, { id: "cx/gpt-6.1-sol" }]), "cc/claude-opus-5-5", "falls back to the first Combo model");
  assert.equal(preferredDefaultModel([{ id: "a" }, { id: "x/gpt-6" }], "gpt"), "x/gpt-6", "pattern can be changed by the admin");
  assert.equal(preferredDefaultModel([]), null);
  const server = await readFile(new URL("../src/server.mjs", import.meta.url), "utf8");
  assert.match(server, /"combo_members", preferredDefaultModel\(catalog\.data\)/);
  assert.match(server, /clientConfig\.defaultModel = preferredDefaultModel\(catalog\.data\)/);
});

test("installers keep a model the user picked and only apply the default otherwise", async () => {
  const win = await readFile(new URL("../scripts/install-codex-windows.ps1", import.meta.url), "utf8");
  assert.match(win, /ltn-default-model/);
  assert.match(win, /\$currentModel -ne \$lastDefault -and \(\$catalogSlugs -contains \$currentModel\)/);
  const unix = await readFile(new URL("../scripts/install-codex-unix.sh", import.meta.url), "utf8");
  assert.match(unix, /ltn-default-model/);
  assert.match(unix, /Giu model nguoi dung da chon/);
});
