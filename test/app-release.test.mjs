import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));

test("Phát hành Văn Phòng AI: publish, trang tải, latest.json, tải file (Range), chặn file lạ", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-release-"));
  const build = join(root, "dist");
  const rel = join(root, "rel");
  spawnSync("mkdir", ["-p", build]);
  const setup = Buffer.from("fake-setup-" + "x".repeat(5000));
  await writeFile(join(build, "VanPhongAI-0.9.0-Setup.exe"), setup);
  spawnSync("mkdir", ["-p", join(build, "linux")]);
  await writeFile(join(build, "linux", "VanPhongAI-0.9.0-linux-amd64.deb"), Buffer.from("fake-deb"));
  await writeFile(join(build, "khac.txt"), "bỏ qua");
  const script = fileURLToPath(new URL("../scripts/publish-vanphong.mjs", import.meta.url));
  const r = spawnSync(process.execPath, [script, build, "--notes", "- Computer Use\n- Tự cập nhật"], { env: { ...process.env, VANPHONG_RELEASE_DIR: rel }, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const manifest = JSON.parse(await readFile(join(rel, "latest.json"), "utf8"));
  assert.equal(manifest.version, "0.9.0");
  assert.equal(manifest.files["win-setup"].sha256, createHash("sha256").update(setup).digest("hex"));
  assert.ok(manifest.files["linux-deb"]);
  assert.ok(!JSON.stringify(manifest).includes("khac.txt"));
  // bản cũ hơn bị từ chối
  await writeFile(join(build, "VanPhongAI-0.9.0-Setup.exe"), setup);
  const old = join(root, "old"); spawnSync("mkdir", ["-p", old]);
  await writeFile(join(old, "VanPhongAI-0.8.0-Setup.exe"), "x");
  assert.notEqual(spawnSync(process.execPath, [script, old], { env: { ...process.env, VANPHONG_RELEASE_DIR: rel }, encoding: "utf8" }).status, 0);

  process.env.VANPHONG_RELEASE_DIR = rel;
  const { createGatewayServer } = await import(`../src/server.mjs?release=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/install/vanphong`;
  try {
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /0\.9\.0[\s\S]*Setup\.exe/);
    const latest = await (await fetch(base + "/latest.json")).json();
    assert.equal(latest.files["win-setup"].name, "VanPhongAI-0.9.0-Setup.exe");
    const file = await fetch(base + "/VanPhongAI-0.9.0-Setup.exe");
    assert.equal(file.status, 200);
    assert.equal(Buffer.from(await file.arrayBuffer()).equals(setup), true);
    const part = await fetch(base + "/VanPhongAI-0.9.0-Setup.exe", { headers: { range: "bytes=5-9" } });
    assert.equal(part.status, 206);
    assert.equal(await part.text(), "setup");
    assert.equal((await fetch(base + "/latest.json.tmp")).status, 404);
    assert.equal((await fetch(base + "/..%2F..%2Fpackage.json")).status, 404);
    assert.equal((await fetch(base + "/VanPhongAI-0.8.0-Setup.exe")).status, 404, "file không có trong latest.json");
    assert.equal((await fetch(base + "/latest.json", { method: "POST" })).status, 405);
  } finally {
    await new Promise((r) => server.close(r));
    delete process.env.VANPHONG_RELEASE_DIR;
  }
});
