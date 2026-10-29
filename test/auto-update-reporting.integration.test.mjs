import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const CLIENT = "0b9d8c1e-3f2a-4b5c-9d8e-7f6a5b4c3d2e";

test("devices report their SIMI bundle and admins see who is behind", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-update-report-"));
  const memoryDir = join(root, "memory");
  await mkdir(memoryDir, { recursive: true });
  await writeFile(join(memoryDir, "COMPANY.md"), "# COMPANY\n");
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  const devicesFile = join(root, "device-updates.json");
  await writeFile(teamsFile, JSON.stringify({ teams: [
    { code: "SALES", displayName: "Kinh doanh", keyHash: hash("legacy-sales"), memoryFile: "SALES.md", enabled: true },
    { code: "IT", displayName: "IT", keyHash: hash("legacy-it"), memoryFile: "IT.md", enabled: true }
  ] }));
  await writeFile(usersFile, JSON.stringify({ version: 1, users: {
    "sales-ngoc": { displayName: "Ngọc", teamId: "SALES", keyHash: hash("key-ngoc"), enabled: true, aiPolicy: { mode: "inherit" } },
    "it-nam": { displayName: "Nam", teamId: "IT", keyHash: hash("key-nam"), enabled: true, aiPolicy: { mode: "inherit" } }
  } }));
  Object.assign(process.env, {
    TEAMS_FILE: teamsFile,
    LTN_USERS_CONFIG_FILE: usersFile,
    MEMORY_DIR: memoryDir,
    MEMORY_UPDATE_ENABLED: "false",
    DEVICE_UPDATES_FILE: devicesFile,
    UPSTREAM_BASE_URL: "http://127.0.0.1:9",
    LTN_LEGACY_TEAM_KEYS_ENABLED: "true"
  });
  delete process.env.SIMI_AUTO_UPDATE_ENABLED;

  const server = await import(`../src/server.mjs?updates=${Date.now()}`);
  const gateway = server.createGatewayServer();
  const base = `http://127.0.0.1:${await listen(gateway)}`;
  const report = (key, body, clientId = CLIENT) => fetch(`${base}/v1/simi/update-report`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "x-ltn-client-id": clientId, "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });

  try {
    const manifest = await (await fetch(`${base}/install/manifest.json`)).json();
    assert.match(manifest.bundleVersion, /^[a-f0-9]{16}$/);
    assert.ok(manifest.files.length > 0);
    assert.equal(manifest.paused, undefined);

    process.env.SIMI_AUTO_UPDATE_ENABLED = "false";
    const paused = await (await fetch(`${base}/install/manifest.json`)).json();
    assert.equal(paused.paused, true);
    assert.deepEqual(paused.files, []);
    delete process.env.SIMI_AUTO_UPDATE_ENABLED;

    assert.equal((await report("", { bundleVersion: manifest.bundleVersion })).status, 401);
    assert.equal((await report("key-ngoc", {}, "not-a-uuid")).status, 400);
    assert.equal((await report("key-ngoc", "{oops")).status, 400);
    assert.equal((await report("key-ngoc", { bundleVersion: "NOT HEX" })).status, 400);

    const ok = await report("key-ngoc", {
      bundleVersion: manifest.bundleVersion,
      installerVersion: manifest.installerVersion,
      platform: "win32",
      checkedAt: "2026-10-29T08:00:00.000Z",
      updated: ["browser-mcp.mjs"],
      failed: [{ target: "tools/pdf-extract.py", error: "HTTP 500 token sk-abcdefghijklmnopqrstuvwxyz123456" }]
    });
    assert.equal(ok.status, 200);
    await report("key-nam", { bundleVersion: "0000000000000000", installerVersion: 2, platform: "darwin", failed: [{ target: "x.mjs", error: "boom" }] });

    const stored = JSON.parse(await readFile(devicesFile, "utf8"));
    const records = Object.values(stored.devices);
    const ngoc = records.find((item) => item.userId === "sales-ngoc");
    assert.equal(ngoc.clientIdHashPrefix, hash(CLIENT).slice(0, 12));
    assert.equal(JSON.stringify(stored).includes(CLIENT), false, "raw client ID is never stored");
    assert.equal(JSON.stringify(stored).includes("sk-abcdefghijklmnopqrstuvwxyz123456"), false, "secrets in errors are redacted");
    const nam = records.find((item) => item.userId === "it-nam");
    assert.equal(nam.minimal, true, "IT accounts keep only version state");
    assert.equal(nam.failed, undefined);

    const { updateDevices } = await import("../src/admin/services/admin-updates-service.mjs");
    const all = await updateDevices({}, { manifest, now: Date.now() });
    assert.equal(all.summary.total, 2);
    assert.equal(all.summary.failing, 1, "the SALES device reported a failed file");
    assert.equal(all.summary.outdated, 1, "the IT device runs an older bundle");
    const scoped = await updateDevices({ teamIds: ["SALES"] }, { manifest, now: Date.now() });
    assert.deepEqual(scoped.items.map((item) => item.userId), ["sales-ngoc"], "team managers only see their teams");
    const later = await updateDevices({}, { manifest, now: Date.now() + 25 * 60 * 60 * 1000 });
    assert.equal(later.summary.stale, 2, "devices silent for more than 24h are flagged");
  } finally {
    gateway.close();
  }
});
