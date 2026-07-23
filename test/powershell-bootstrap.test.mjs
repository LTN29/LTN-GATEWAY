import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const bootstrap = await readFile(
  new URL("../scripts/install-codex-bootstrap.ps1", import.meta.url),
  "utf8"
);

function findCommand(command) {
  const result = spawnSync(
    process.platform === "win32" ? "where.exe" : "which",
    [command],
    { encoding: "utf8" }
  );
  if (result.status !== 0) return null;
  return result.stdout.split(/\r?\n/).find(Boolean)?.trim() || null;
}

function encodedCommand(source) {
  return Buffer.from(source, "utf16le").toString("base64");
}

async function runBootstrapRuntime(shell) {
  const root = await mkdtemp(join(tmpdir(), "ltn-bootstrap-test-"));
  const resultPath = join(root, "result.txt");
  const bootstrapBase64 = Buffer.from(bootstrap, "utf8").toString("base64");
  const harness = `
$ErrorActionPreference = "Stop"
$env:TEMP = ${JSON.stringify(root)}
$env:LTN_BOOTSTRAP_RESULT = ${JSON.stringify(resultPath)}
$script:DownloadedPath = $null
$script:DownloadCalls = 0
function Invoke-WebRequest {
  [CmdletBinding()]
  param(
    [switch]$UseBasicParsing,
    [string]$Uri,
    [string]$OutFile,
    [int]$MaximumRedirection
  )
  $script:DownloadCalls += 1
  if ($Uri -ne "https://ai.simi.vn/install/codex-full.ps1") { throw "wrong URL" }
  if ($MaximumRedirection -ne 0) { throw "redirects must be disabled" }
  $script:DownloadedPath = $OutFile
  [IO.File]::WriteAllText(
    $OutFile,
    '[IO.File]::WriteAllText($env:LTN_BOOTSTRAP_RESULT, "success")',
    [Text.UTF8Encoding]::new($false)
  )
}
$bootstrap = [Text.Encoding]::UTF8.GetString(
  [Convert]::FromBase64String("${bootstrapBase64}")
)
Invoke-Expression $bootstrap
if ($script:DownloadCalls -ne 1) { throw "unexpected download count" }
if (-not (Test-Path -LiteralPath $env:LTN_BOOTSTRAP_RESULT)) { throw "full installer did not run" }
if (Test-Path -LiteralPath $script:DownloadedPath) { throw "temp file remained after success" }

Remove-Item Function:Invoke-WebRequest
$script:DownloadedPath = $null
function Invoke-WebRequest {
  [CmdletBinding()]
  param(
    [switch]$UseBasicParsing,
    [string]$Uri,
    [string]$OutFile,
    [int]$MaximumRedirection
  )
  $script:DownloadedPath = $OutFile
  [IO.File]::WriteAllText($OutFile, "partial download")
  throw "redirect to https://evil.example/codex.ps1 blocked"
}
$failed = $false
try {
  Invoke-Expression $bootstrap
} catch {
  $failed = $_.Exception.Message -match "redirect.*blocked"
}
if (-not $failed) { throw "redirect failure was not propagated" }
if (Test-Path -LiteralPath $script:DownloadedPath) { throw "temp file remained after failure" }

Remove-Item Function:Invoke-WebRequest
$script:DownloadCalls = 0
function Invoke-WebRequest {
  $script:DownloadCalls += 1
  throw "download must not run"
}
$invalidBootstrap = $bootstrap.Replace(
  "https://ai.simi.vn/install/codex-full.ps1",
  "http://ai.simi.vn/install/codex-full.ps1"
)
$invalidStopped = $false
try {
  Invoke-Expression $invalidBootstrap
} catch {
  $invalidStopped = $_.Exception.Message -match "HTTPS"
}
if (-not $invalidStopped) { throw "non-HTTPS URL was not rejected" }
if ($script:DownloadCalls -ne 0) { throw "invalid URL reached downloader" }
Write-Output "bootstrap-runtime-ok"
`;

  return spawnSync(shell, [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-EncodedCommand",
    encodedCommand(harness)
  ], {
    encoding: "utf8",
    env: {
      ...process.env,
      LTN_TEST_API_KEY: "test-key-must-not-appear"
    }
  });
}

const windowsPowerShell = findCommand("powershell.exe");
const powerShell7 = findCommand("pwsh.exe");

test("bootstrap executes and cleans up on Windows PowerShell 5.1", {
  skip: !windowsPowerShell
}, async (t) => {
  const result = await runBootstrapRuntime(windowsPowerShell);
  if (result.error?.code === "EPERM") {
    t.skip("Environment blocks Node child-process spawn; run this test directly on Windows.");
    return;
  }
  assert.equal(
    result.status,
    0,
    result.error?.message || result.stderr || result.stdout
  );
  assert.match(result.stdout, /bootstrap-runtime-ok/);
  assert.doesNotMatch(
    `${result.stdout}\n${result.stderr}`,
    /test-key-must-not-appear/
  );
});

test("bootstrap executes and cleans up on PowerShell 7", {
  skip: !powerShell7
}, async (t) => {
  const result = await runBootstrapRuntime(powerShell7);
  if (result.error?.code === "EPERM") {
    t.skip("Environment blocks Node child-process spawn; run this test directly on Windows.");
    return;
  }
  assert.equal(
    result.status,
    0,
    result.error?.message || result.stderr || result.stdout
  );
  assert.match(result.stdout, /bootstrap-runtime-ok/);
  assert.doesNotMatch(
    `${result.stdout}\n${result.stderr}`,
    /test-key-must-not-appear/
  );
});
