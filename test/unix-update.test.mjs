import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const bash = process.platform === "win32" && existsSync("C:/Program Files/Git/bin/bash.exe")
  ? "C:/Program Files/Git/bin/bash.exe" : "bash";
const available = spawnSync(bash, ["--version"], { stdio: "ignore" }).status === 0;
const installer = fileURLToPath(new URL("../scripts/install-codex-unix.sh", import.meta.url)).replaceAll("\\", "/");

function run(script, root, env = {}) {
  return spawnSync(bash, ["-c", '. "$TEST_INSTALLER"; MODE=--update; ' + script], {
    encoding: "utf8",
    env: { ...process.env, TEST_INSTALLER: installer, CODEX_HOME: root.replaceAll("\\", "/"),
      LTN_CODEX_SOURCE_ONLY: "1", LTN_TEAM_API_KEY: "", NINEROUTER_KEY: "", ...env }
  });
}

test("Unix Update reuses saved environment key without prompting or printing it", { skip: !available }, async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-update-"));
  const result = run('read_team_key; test "$TEAM_API_KEY" = "$EXPECTED_KEY"', root,
    { LTN_TEAM_API_KEY: "saved-update-test-key", EXPECTED_KEY: "saved-update-test-key" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Update: dung API key da luu/);
  assert.doesNotMatch(result.stdout + result.stderr, /saved-update-test-key/);
});

test("Unix Update reads a saved helper in a path with spaces or the Linux credential file", { skip: !available }, async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn update helper "));
  await mkdir(join(root, "bin"));
  await writeFile(join(root, "bin", "ltn-codex-token"), '#!/usr/bin/env bash\nprintf helper-test-key', "utf8");
  let result = run('chmod 700 "$HELPER_PATH"; read_team_key; test "$TEAM_API_KEY" = "helper-test-key"', root);
  assert.equal(result.status, 0, result.stderr);
  await mkdir(join(root, "credentials"));
  await writeFile(join(root, "credentials", "ltn-team-key"), "file-test-key", "utf8");
  result = run('HELPER_PATH="$CODEX_HOME/missing-helper"; read_team_key; test "$TEAM_API_KEY" = "file-test-key"', root);
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout + result.stderr, /file-test-key|helper-test-key/);
});

test("Unix Update stops without saved credentials instead of reading a fresh key", { skip: !available }, async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-update-empty-"));
  const result = run("read_team_key", root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /khong tim thay API key da luu/);
});
