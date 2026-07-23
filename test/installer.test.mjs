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
  assert.doesNotMatch(script, /\^combo\//);
  assert.doesNotMatch(script, /combo\/\$|combo\/\$\{|combo\/\$comboId/);
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

test("Windows installer validates Combo ID syntax without assuming a combo prefix", async () => {
  const script = await readFile(installerUrl, "utf8");

  assert.match(script, /function Confirm-ComboIdSyntax/);
  assert.match(script, /\$ComboId\.Trim\(\)/);
  assert.match(script, /Length -gt 200/);
  assert.match(script, /\[\\r\\n\]/);
  assert.match(script, /\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F/);
  assert.doesNotMatch(script, /notmatch '\^combo\//);

  for (const validId of [
    "SIMI-AI",
    "simi-ai",
    "combo/simi-ai",
    "company.default",
    "LTN_CODE_POWER"
  ]) {
    assert.equal(validId.trim(), validId);
  }
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
