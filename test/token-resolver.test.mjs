import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const installer = fileURLToPath(new URL("../scripts/install-codex-unix.sh", import.meta.url));
const hasBash = spawnSync("bash", ["--version"], { stdio: "ignore" }).status === 0;

async function makeHelper(root) {
  const helper = join(root, "ltn-codex-token");
  const command = `LTN_CODEX_SOURCE_ONLY=1 source '${installer.replaceAll("'", "'\\''")}'; HELPER_PATH='${helper.replaceAll("'", "'\\''")}'; write_macos_helper`;
  const result = spawnSync("bash", ["-c", command], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return helper;
}

function run(helper, env = {}) {
  return spawnSync("bash", [helper], {
    encoding: "utf8",
    env: { ...process.env, LTN_TEAM_API_KEY: "", NINEROUTER_KEY: "", ...env }
  });
}

test("token resolver follows environment priority without logging tokens", { skip: !hasBash }, async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-token-resolver-"));
  const helper = await makeHelper(root);
  const result = run(helper, {
    LTN_TEAM_API_KEY: "team-env-secret",
    NINEROUTER_KEY: "legacy-env-secret",
    LTN_SECURITY_COMMAND: join(root, "does-not-exist")
  });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "team-env-secret");
  assert.equal(result.stderr, "");
});

test("token resolver supports a Keychain item whose account is not simi", { skip: !hasBash }, async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-token-keychain-"));
  const helper = await makeHelper(root);
  const security = join(root, "security");
  await writeFile(security, `#!/usr/bin/env bash\ncase " $* " in *" -a "*) exit 9;; esac\n[ "$*" = 'find-generic-password -s LTN Codex Team Key -w' ] || exit 8\nprintf '%s' 'keychain-other-account-secret'\n`);
  await chmod(security, 0o700);
  const result = run(helper, { LTN_SECURITY_COMMAND: security });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "keychain-other-account-secret");
  assert.doesNotMatch(await readFile(helper, "utf8"), /-a\s+["']?simi/i);
});

test("token resolver fails clearly without exposing a token", { skip: !hasBash }, async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-token-missing-"));
  const helper = await makeHelper(root);
  const result = run(helper, { LTN_SECURITY_COMMAND: join(root, "missing-security") });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Khong tim thay LTN team token/);
  assert.equal(result.stdout, "");
});
