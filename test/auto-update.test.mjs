import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
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

function manifestFor(files, extra = {}) {
  return { object: "simi.auto_update.manifest", installerVersion: 3, bundleVersion: "abcdef0123456789", ...extra, files };
}

async function withHome(setup, run) {
  const home = await mkdtemp(join(tmpdir(), "simi-auto-update-"));
  await mkdir(join(home, "skills", "simi-trinh-duyet"), { recursive: true });
  await mkdir(join(home, "tools"), { recursive: true });
  await writeFile(join(home, "skills", "simi-trinh-duyet", "SKILL.md"), "old skill");
  await writeFile(join(home, "tools", "pdf-extract.py"), "same");
  await writeFile(join(home, "browser-mcp.mjs"), "old mcp");
  await writeFile(join(home, "ltn-installer-version"), "3");
  const { server, url } = await serve(setup);
  try {
    process.env.CODEX_HOME = home;
    process.env.LTN_GATEWAY_BASE_URL = `${url}/v1`;
    const mod = await import(`../scripts/auto-update.mjs?case=${Date.now()}-${Math.random()}`);
    await run(mod, home, url);
  } finally {
    server.close();
    delete process.env.CODEX_HOME;
    delete process.env.LTN_GATEWAY_BASE_URL;
    await rm(home, { recursive: true, force: true });
  }
}

const goodFiles = [
  { url: "/install/skills/simi-trinh-duyet/SKILL.md", target: "skills/simi-trinh-duyet/SKILL.md", sha256: sha("new skill") },
  { url: "/install/tools/browser-mcp.mjs", target: "browser-mcp.mjs", sha256: sha("new mcp") },
  { url: "/install/tools/pdf-extract.py", target: "tools/pdf-extract.py", sha256: sha("same") },
  { url: "/install/skills/not-installed/SKILL.md", target: "skills/not-installed/SKILL.md", sha256: sha("skip me") },
  { url: "/install/tools/browser-mcp.mjs", target: "../escape.mjs", sha256: sha("new mcp") },
  { url: "/install/tools/browser-mcp.mjs", target: "config.toml", sha256: sha("new mcp") }
];
const routes = {
  "/install/skills/simi-trinh-duyet/SKILL.md": "new skill",
  "/install/tools/browser-mcp.mjs": "new mcp",
  "/install/tools/pdf-extract.py": "same",
  "/install/tools/bad.mjs": "tampered",
  "/install/skills/not-installed/SKILL.md": "skip me"
};

test("auto-update swaps changed files together, keeps .prev backups and never writes outside CODEX_HOME", async () => {
  await withHome({ ...routes, "/install/manifest.json": JSON.stringify(manifestFor(goodFiles, { releaseNote: "Sửa lỗi đọc Shopee." })) },
    async ({ runAutoUpdate }, home) => {
      const status = await runAutoUpdate();
      assert.equal(status.error, undefined);
      assert.deepEqual(status.updated.sort(), ["browser-mcp.mjs", "skills/simi-trinh-duyet/SKILL.md"]);
      assert.equal(await readFile(join(home, "browser-mcp.mjs"), "utf8"), "new mcp");
      assert.equal(await readFile(join(home, "browser-mcp.mjs.prev"), "utf8"), "old mcp", "previous version is kept");
      assert.equal(existsSync(join(home, "skills", "not-installed")), false, "skills the user does not have are not added");
      assert.equal(existsSync(join(home, "..", "escape.mjs")), false);
      assert.equal(existsSync(join(home, "config.toml")), false, "config.toml is never written by auto-update");
      assert.equal(status.rejected.length, 2, "malformed entries are reported but do not block the batch");
      assert.equal(status.syncedBundle, "abcdef0123456789");
      assert.equal(status.fullUpdateRequired, false);
      assert.equal(existsSync(join(home, "auto-update.lock")), false, "lock is released");
      const saved = JSON.parse(await readFile(join(home, "logs", "auto-update.json"), "utf8"));
      assert.equal(saved.updated.length, 2);
      const second = await runAutoUpdate();
      assert.deepEqual(second.updated, [], "a second run downloads nothing");
      assert.equal(second.syncedBundle, "abcdef0123456789");
    });
});

test("one bad checksum leaves every file untouched and no temporary files behind", async () => {
  const files = [...goodFiles, { url: "/install/tools/bad.mjs", target: "tools/bad.mjs", sha256: sha("expected") }];
  await withHome({ ...routes, "/install/manifest.json": JSON.stringify(manifestFor(files)) },
    async ({ runAutoUpdate }, home) => {
      const status = await runAutoUpdate();
      assert.deepEqual(status.updated, []);
      assert.equal(status.batchAborted, true);
      assert.ok(status.failed.some((item) => item.target === "tools/bad.mjs" && /checksum/.test(item.error)));
      assert.equal(await readFile(join(home, "browser-mcp.mjs"), "utf8"), "old mcp");
      assert.equal(await readFile(join(home, "skills", "simi-trinh-duyet", "SKILL.md"), "utf8"), "old skill");
      assert.equal(existsSync(join(home, "tools", "bad.mjs")), false);
      const leftovers = (await readdir(home, { recursive: true })).filter((name) => name.endsWith(".update"));
      assert.deepEqual(leftovers, []);
      assert.equal(status.syncedBundle, null, "a failed batch is not reported as synced");
    });
});

test("a paused manifest changes nothing and does not ask for the full installer", async () => {
  await withHome({ ...routes, "/install/manifest.json": JSON.stringify(manifestFor([], { paused: true, installerVersion: 9 })) },
    async ({ runAutoUpdate }, home) => {
      const status = await runAutoUpdate();
      assert.equal(status.paused, true);
      assert.equal(status.fullUpdateRequired, false);
      assert.equal(await readFile(join(home, "browser-mcp.mjs"), "utf8"), "old mcp");
    });
});

test("holdLock keeps the lock for the full installer step", async () => {
  await withHome({ "/install/manifest.json": JSON.stringify(manifestFor([])) },
    async ({ runAutoUpdate }, home) => {
      const status = await runAutoUpdate({ holdLock: true });
      assert.equal(status.lockHeld, true);
      assert.equal(existsSync(join(home, "auto-update.lock")), true);
      const second = await runAutoUpdate();
      assert.equal(second.skipped, "Another update is running.");
    });
});

test("the update report carries versions only and authenticates with the stored key", async () => {
  const received = [];
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      received.push({ url: req.url, headers: req.headers, body: JSON.parse(raw) });
      res.writeHead(200, { "content-type": "application/json" }).end("{\"ok\":true}");
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const home = await mkdtemp(join(tmpdir(), "simi-auto-update-"));
  try {
    await writeFile(join(home, "ltn-client-id"), "0b9d8c1e-3f2a-4b5c-9d8e-7f6a5b4c3d2e");
    await writeFile(join(home, "ltn-installer-version"), "3");
    process.env.CODEX_HOME = home;
    process.env.LTN_GATEWAY_BASE_URL = `http://127.0.0.1:${server.address().port}/v1`;
    process.env.LTN_TEAM_API_KEY = "sk-test-report";
    const { sendUpdateReport } = await import(`../scripts/auto-update.mjs?case=report-${Date.now()}`);
    const result = await sendUpdateReport({ checkedAt: "2026-10-29T08:00:00.000Z", syncedBundle: "abcdef0123456789", updated: ["browser-mcp.mjs"], failed: [] });
    assert.deepEqual(result, { reported: true });
    assert.equal(received[0].url, "/v1/simi/update-report");
    assert.equal(received[0].headers.authorization, "Bearer sk-test-report");
    assert.equal(received[0].headers["x-ltn-client-id"], "0b9d8c1e-3f2a-4b5c-9d8e-7f6a5b4c3d2e");
    assert.equal(received[0].body.bundleVersion, "abcdef0123456789");
    assert.equal(received[0].body.installerVersion, 3);
    assert.equal(JSON.stringify(received[0].body).includes("sk-test-report"), false, "the key is never in the body");
  } finally {
    server.close();
    delete process.env.CODEX_HOME;
    delete process.env.LTN_GATEWAY_BASE_URL;
    delete process.env.LTN_TEAM_API_KEY;
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

test("a venv whose base Python is gone asks for the full installer, a healthy one does not", { skip: process.platform === "win32" && "uses a POSIX shell stub" }, async () => {
  const home = await mkdtemp(join(tmpdir(), "simi-auto-update-"));
  try {
    const { pythonRuntimeHealthy } = await import(`../scripts/auto-update.mjs?case=venv-${Date.now()}`);
    assert.equal(pythonRuntimeHealthy(home), true, "no runtime installed: nothing to repair");
    await mkdir(join(home, "pdf-runtime", "bin"), { recursive: true });
    const python = join(home, "pdf-runtime", "bin", "python");
    await writeFile(python, "#!/bin/sh\necho 'No Python at /old/Python311/python' >&2\nexit 103\n", { mode: 0o755 });
    assert.equal(pythonRuntimeHealthy(home), false);
    await writeFile(python, "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    assert.equal(pythonRuntimeHealthy(home), true);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});

test("Windows-style installs report with the client ID from the environment", async () => {
  const received = [];
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => { received.push(req.headers); res.writeHead(200).end("{}"); });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const home = await mkdtemp(join(tmpdir(), "simi-auto-update-"));
  try {
    process.env.CODEX_HOME = home;
    process.env.LTN_GATEWAY_BASE_URL = `http://127.0.0.1:${server.address().port}`;
    process.env.LTN_TEAM_API_KEY = "sk-env-key";
    process.env.LTN_CLIENT_ID = "0B9D8C1E-3F2A-4B5C-9D8E-7F6A5B4C3D2E";
    const { sendUpdateReport } = await import(`../scripts/auto-update.mjs?case=envid-${Date.now()}`);
    assert.deepEqual(await sendUpdateReport({ checkedAt: new Date().toISOString(), updated: [], failed: [] }), { reported: true });
    assert.equal(received[0]["x-ltn-client-id"], "0b9d8c1e-3f2a-4b5c-9d8e-7f6a5b4c3d2e");
  } finally {
    server.close();
    for (const name of ["CODEX_HOME", "LTN_GATEWAY_BASE_URL", "LTN_TEAM_API_KEY", "LTN_CLIENT_ID"]) delete process.env[name];
    await rm(home, { recursive: true, force: true });
  }
});
