import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const installerUrl = new URL(
  "../scripts/install-codex-windows.ps1",
  import.meta.url
);
const bootstrapUrl = new URL(
  "../scripts/install-codex-bootstrap.ps1",
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

test("public bootstrap is pipeline-safe and cleans its fixed HTTPS download", async () => {
  const script = await readFile(bootstrapUrl, "utf8");

  assert.doesNotMatch(script, /\[CmdletBinding\(\)\]/);
  assert.doesNotMatch(script, /^\s*param\s*\(/m);
  assert.match(
    script,
    /\[Uri\]"https:\/\/ai\.simi\.vn\/install\/codex-full\.ps1"/
  );
  assert.match(script, /Scheme -ne "https"/);
  assert.match(script, /Host -ne "ai\.simi\.vn"/);
  assert.match(script, /MaximumRedirection 0/);
  assert.match(script, /Join-Path \$env:TEMP/);
  assert.match(script, /& \$tempInstaller/);
  assert.match(script, /finally/);
  assert.match(script, /Remove-Item -LiteralPath \$tempInstaller/);
  assert.doesNotMatch(script, /TeamApiKey|LTN_TEAM_API_KEY/);
});
