import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const installerUrl = new URL(
  "../scripts/install-codex-windows.ps1",
  import.meta.url
);

test("Windows installer remains Combo-first and does not embed model IDs or API keys", async () => {
  const script = await readFile(installerUrl, "utf8");

  assert.match(script, /\/codex\/config/);
  assert.match(script, /\/models/);
  assert.match(script, /owned_by/);
  assert.match(script, /env_key = "LTN_TEAM_API_KEY"/);
  assert.doesNotMatch(script, /combo\/ltn-code-(?:auto|fast|default|power)/);
  const configBlock = script.match(
    /\$configContent = @"([\s\S]*?)"@/
  )?.[1];
  assert.ok(configBlock);
  assert.doesNotMatch(configBlock, /TeamApiKey/);
});

test("Windows installer supports idempotent repair, key rotation and uninstall cleanup", async () => {
  const script = await readFile(installerUrl, "utf8");

  assert.match(script, /Update-CodexConfig/);
  assert.match(script, /\[switch\]\$Uninstall/);
  assert.match(
    script,
    /SetEnvironmentVariable\("LTN_TEAM_API_KEY", \$null, "User"\)/
  );
  assert.match(script, /codex-fast\.cmd/);
  assert.match(script, /codex-power\.cmd/);
});
