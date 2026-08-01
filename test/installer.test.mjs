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
const browserBridgeUrl = new URL(
  "../scripts/browser-bridge.mjs",
  import.meta.url
);

test("Windows installer remains Combo-first and does not embed model IDs or API keys", async () => {
  const script = await readFile(installerUrl, "utf8");

  assert.match(script, /\/codex\/config/);
  assert.match(script, /\/models/);
  assert.match(script, /owned_by/);
  assert.match(script, /env_key = "LTN_TEAM_API_KEY"/);
  assert.match(script, /env_http_headers = \{ "X-LTN-Client-ID" = "LTN_CLIENT_ID" \}/);
  assert.match(script, /function Install-Managed9RouterSkills/);
  assert.match(script, /install\/skills\/\$skillName\/SKILL\.md/);
  assert.match(script, /NINEROUTER_URL/);
  assert.match(script, /NINEROUTER_KEY/);
  assert.doesNotMatch(script, /combo\/ltn-code-(?:auto|fast|default|power)/);
  assert.doesNotMatch(script, /\^combo\//);
  assert.doesNotMatch(script, /combo\/\$|combo\/\$\{|combo\/\$comboId/);
  const configBlock = script.match(
    /\$configContent = @"([\s\S]*?)"@/
  )?.[1];
  assert.ok(configBlock);
  assert.doesNotMatch(configBlock, /TeamApiKey/);
  assert.doesNotMatch(configBlock, /clientId|\$clientId/);
});

test("Windows installer supports idempotent repair, key rotation and uninstall cleanup", async () => {
  const script = await readFile(installerUrl, "utf8");

  assert.match(script, /Update-CodexConfig/);
  assert.match(script, /\[switch\]\$Uninstall/);
  assert.match(script, /function Read-InstallerMode/);
  assert.match(script, /Chọn chế độ:/);
  assert.match(script, /1\. Install\/Update/);
  assert.match(script, /2\. Repair/);
  assert.match(script, /3\. Status/);
  assert.match(script, /4\. Uninstall/);
  assert.match(script, /Nhập 1-4/);
  assert.match(script, /function Show-InstallerStatus/);
  assert.match(script, /function Invoke-LtnUninstall/);
  assert.match(script, /\$Mode -eq "status"/);
  assert.match(script, /\$Mode -eq "uninstall"/);
  assert.match(
    script,
    /SetEnvironmentVariable\("LTN_TEAM_API_KEY", \$null, "User"\)/
  );
  assert.match(
    script,
    /SetEnvironmentVariable\("LTN_CLIENT_ID", \$null, "User"\)/
  );
  assert.match(script, /Get-OrCreateClientId/);
  assert.match(script, /name = "SIMI Gateway"/);
  assert.match(script, /NewGuid\(\)/);
  assert.match(script, /codex-fast\.cmd/);
  assert.match(script, /codex-power\.cmd/);
  assert.match(script, /9router-web-fetch/);
  assert.match(script, /9router-browser/);
  assert.match(script, /9router-pdf/);
  assert.match(script, /Install-BrowserBridge/);
  assert.match(script, /Install-LocalTools/);
  assert.match(script, /install\/tools\/\$asset/);
  assert.match(script, /browser-bridge\.mjs/);
  assert.match(script, /9Router skills:/);
});

test("Windows installer status and uninstall modes do not prompt for API key", async () => {
  const script = await readFile(installerUrl, "utf8");
  const promptIndex = script.indexOf("$TeamApiKey = Read-TeamApiKey");
  const statusIndex = script.indexOf('$Mode -eq "status"');
  const uninstallIndex = script.indexOf('$Mode -eq "uninstall"');

  assert.ok(statusIndex > 0);
  assert.ok(uninstallIndex > 0);
  assert.ok(promptIndex > 0);
  assert.ok(statusIndex < promptIndex);
  assert.ok(uninstallIndex < promptIndex);
  assert.match(script, /Get-Clipboard -Raw -ErrorAction Stop/);
  assert.match(script, /\$Mode -in @\("auto", "profiles"\)/);
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
  assert.match(script, /& \$powerShellExecutable/);
  assert.match(script, /-ExecutionPolicy Bypass/);
  assert.match(script, /-File \$tempInstaller/);
  assert.doesNotMatch(script, /^\s*& \$tempInstaller\s*$/m);
  assert.match(script, /finally/);
  assert.match(script, /Remove-Item -LiteralPath \$tempInstaller/);
  assert.doesNotMatch(script, /TeamApiKey|LTN_TEAM_API_KEY/);
});

test("browser bridge reuses the installer-managed client ID without logging page text", async () => {
  const script = await readFile(browserBridgeUrl, "utf8");

  assert.match(script, /LTN_CLIENT_ID_PATH/);
  assert.match(script, /ltn-client-id/);
  assert.doesNotMatch(script, /console\.log\(.*page/);
});
