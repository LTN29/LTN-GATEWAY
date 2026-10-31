#!/usr/bin/env node
// SIMI auto-update: keeps local skills and tools in sync with the Gateway.
// Runs on a schedule; downloads only changed files listed in the Gateway
// manifest, verifies SHA-256, and replaces each file atomically.
import { createHash } from "node:crypto";
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const codexHome = resolve(option("--codex-home") || process.env.CODEX_HOME || join(homedir(), ".codex"));
const gatewayRoot = String(option("--gateway") || process.env.LTN_GATEWAY_BASE_URL || process.env.NINEROUTER_URL || "https://ai.simi.vn")
  .replace(/\/+$/, "").replace(/\/v1$/, "");
const statusPath = join(codexHome, "logs", "auto-update.json");
const lockPath = join(codexHome, "auto-update.lock");
const versionPath = join(codexHome, "ltn-installer-version");

function allowedGateway(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") return true;
    return parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

// Only these locations under CODEX_HOME may be written.
export function safeTarget(home, target) {
  if (typeof target !== "string" || !target || target.includes("\0")) return null;
  if (!/^(?:[\w.-]+\.(?:mjs|py)|tools\/[\w.-]+\.(?:mjs|py)|skills\/[\w-]+\/SKILL\.md)$/.test(target)) return null;
  const full = resolve(home, ...target.split("/"));
  return full.startsWith(home + sep) ? full : null;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function localHash(path) {
  try { return sha256(readFileSync(path)); } catch { return null; }
}

function acquireLock() {
  mkdirSync(codexHome, { recursive: true });
  try {
    closeSync(openSync(lockPath, "wx"));
    return true;
  } catch {
    // A crashed run leaves a stale lock; take it over after 30 minutes.
    try {
      if (Date.now() - statSync(lockPath).mtimeMs > 30 * 60_000) {
        unlinkSync(lockPath);
        closeSync(openSync(lockPath, "wx"));
        return true;
      }
    } catch {}
    return false;
  }
}

async function fetchBuffer(url, timeoutMs) {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function writeStatus(status) {
  try {
    mkdirSync(dirname(statusPath), { recursive: true });
    writeFileSync(statusPath, JSON.stringify(status, null, 2));
  } catch {}
}

function releaseLock() {
  try { unlinkSync(lockPath); } catch {}
}

function removeQuietly(path) {
  try { unlinkSync(path); } catch {}
}

// Downloads every changed file first, then swaps them in together. A failed
// download or checksum leaves ALL current files untouched, so tools that import
// each other (browser-mcp.mjs -> browser-cdp.mjs) never end up half-updated.
async function applyFiles(manifest, status) {
  const pending = [];
  for (const file of manifest.files) {
    const path = safeTarget(codexHome, file?.target);
    if (!path || !/^[a-f0-9]{64}$/.test(String(file.sha256)) || !String(file.url || "").startsWith("/install/")) {
      // A malformed entry can never install; report it without blocking the rest.
      status.rejected.push({ target: file?.target, error: "rejected manifest entry" });
      continue;
    }
    // Never install skills the user removed or never had; core tools are always kept current.
    if (file.target.startsWith("skills/") && !existsSync(dirname(path))) continue;
    if (localHash(path) === file.sha256) continue;
    pending.push({ file, path, temporary: `${path}.${process.pid}.update` });
  }

  const staged = [];
  for (const item of pending) {
    try {
      const body = await fetchBuffer(`${gatewayRoot}${item.file.url}`, 60_000);
      if (sha256(body) !== item.file.sha256) throw new Error("checksum mismatch");
      mkdirSync(dirname(item.path), { recursive: true });
      writeFileSync(item.temporary, body, { mode: 0o700 });
      staged.push(item);
    } catch (error) {
      removeQuietly(item.temporary);
      status.failed.push({ target: item.file.target, error: error.message });
    }
  }
  if (status.failed.length) {
    for (const item of staged) removeQuietly(item.temporary);
    status.batchAborted = pending.length > 0;
    return false;
  }

  const committed = [];
  try {
    for (const item of staged) {
      const backup = `${item.path}.prev`;
      const hadOriginal = existsSync(item.path);
      if (hadOriginal) copyFileSync(item.path, backup);
      renameSync(item.temporary, item.path);
      committed.push({ ...item, backup, hadOriginal });
    }
  } catch (error) {
    // Put back what was already swapped, newest first.
    for (const item of committed.reverse()) {
      try {
        if (item.hadOriginal) renameSync(item.backup, item.path);
        else removeQuietly(item.path);
      } catch {}
    }
    for (const item of staged) removeQuietly(item.temporary);
    status.failed.push({ target: "(commit)", error: error.message });
    status.batchAborted = true;
    return false;
  }
  status.updated.push(...staged.map((item) => item.file.target));
  return true;
}

// holdLock keeps the lock so the caller can run the full installer under it.
export async function runAutoUpdate({ holdLock = false } = {}) {
  const previous = readStatus();
  const status = {
    checkedAt: new Date().toISOString(),
    gateway: gatewayRoot,
    updated: [],
    failed: [],
    rejected: [],
    syncedBundle: previous?.syncedBundle || null
  };
  if (!allowedGateway(gatewayRoot)) {
    status.error = "Gateway URL must use HTTPS.";
    writeStatus(status);
    return status;
  }
  if (!acquireLock()) {
    status.skipped = "Another update is running.";
    return status;
  }
  try {
    const manifest = JSON.parse((await fetchBuffer(`${gatewayRoot}/install/manifest.json`, 15_000)).toString("utf8"));
    if (manifest?.object !== "simi.auto_update.manifest" || !Array.isArray(manifest.files)) {
      throw new Error("Invalid update manifest.");
    }
    status.serverBundle = typeof manifest.bundleVersion === "string" ? manifest.bundleVersion : null;
    if (manifest.paused) {
      status.paused = true;
    } else {
      const ok = await applyFiles(manifest, status);
      if (ok && status.serverBundle) status.syncedBundle = status.serverBundle;
    }
    const localVersion = Number(readFileSafe(versionPath) || 0);
    status.installerVersion = { local: localVersion, server: Number(manifest.installerVersion || 0) };
    if (typeof manifest.releaseNote === "string") status.releaseNote = manifest.releaseNote.slice(0, 200);
    // A venv whose base Python was removed/upgraded cannot start; the full
    // installer rebuilds it, so treat it like an installer upgrade.
    status.runtimeBroken = !pythonRuntimeHealthy();
    status.fullUpdateRequired = !manifest.paused &&
      (Number(manifest.installerVersion || 0) > localVersion || status.runtimeBroken);
  } catch (error) {
    status.error = error.message;
  } finally {
    if (!holdLock) releaseLock();
  }
  writeStatus(status);
  if (holdLock) status.lockHeld = true;
  return status;
}

export function pythonRuntimeHealthy(home = codexHome) {
  const python = process.platform === "win32"
    ? join(home, "pdf-runtime", "Scripts", "python.exe")
    : join(home, "pdf-runtime", "bin", "python");
  if (!existsSync(python)) return true; // never installed: nothing to repair here
  try {
    return spawnSync(python, ["-c", "import sys"], { stdio: "ignore", timeout: 15_000, windowsHide: true }).status === 0;
  } catch {
    return false;
  }
}

function readUserEnvironment(name) {
  const fromEnv = String(process.env[name] || "").trim();
  if (fromEnv || process.platform !== "win32") return fromEnv;
  // A scheduled task may start before Explorer refreshes the environment block.
  try {
    const result = spawnSync("reg", ["query", "HKCU\\Environment", "/v", name],
      { encoding: "utf8", timeout: 5_000, windowsHide: true });
    const match = new RegExp(`${name}\\s+REG_(?:EXPAND_)?SZ\\s+(\\S+)`).exec(result.stdout || "");
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

function readClientId() {
  // macOS/Linux installers keep it in a file; Windows keeps it in the User environment.
  const value = readFileSafe(join(codexHome, "ltn-client-id")) || readUserEnvironment("LTN_CLIENT_ID");
  return /^[0-9a-f-]{36}$/i.test(value) ? value.toLowerCase() : "";
}

function readApiKey() {
  // The Windows installer stores the key as a User environment variable.
  if (process.platform === "win32") return readUserEnvironment("LTN_TEAM_API_KEY");
  const fromEnv = String(process.env.LTN_TEAM_API_KEY || "").trim();
  if (fromEnv) return fromEnv;
  try {
    // macOS (Keychain) and Linux (Secret Service or 600 file) go through the installer's helper.
    const helper = join(codexHome, "bin", "ltn-codex-token");
    if (!existsSync(helper)) return "";
    const result = spawnSync(helper, [], { encoding: "utf8", timeout: 5_000 });
    return result.status === 0 ? String(result.stdout || "").trim() : "";
  } catch {
    return "";
  }
}

// Tells the Gateway which bundle this device runs. Contains no file contents,
// prompts or keys; the API key is only used as the Authorization header.
export async function sendUpdateReport(status) {
  const apiKey = readApiKey();
  const clientId = readClientId();
  if (!apiKey || !clientId) return { reported: false, reason: !apiKey ? "no api key" : "no client id" };
  const body = {
    bundleVersion: status.syncedBundle || null,
    installerVersion: Number(readFileSafe(versionPath) || 0),
    platform: process.platform,
    checkedAt: status.checkedAt,
    updated: status.updated,
    failed: status.failed,
    fullUpdate: status.fullUpdate
      ? { attemptedAt: status.fullUpdate.attemptedAt, exitCode: status.fullUpdate.exitCode ?? null, error: status.fullUpdate.error || null }
      : null,
    error: status.error || null
  };
  try {
    const response = await fetch(`${gatewayRoot}/v1/simi/update-report`, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
      headers: { authorization: `Bearer ${apiKey}`, "x-ltn-client-id": clientId, "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    return response.ok ? { reported: true } : { reported: false, reason: `HTTP ${response.status}` };
  } catch (error) {
    return { reported: false, reason: error.message };
  }
}

function readFileSafe(path) {
  try { return readFileSync(path, "utf8").trim(); } catch { return ""; }
}

// Runs the official installer in non-interactive Update mode, at most once a day.
function runFullUpdate(previous) {
  const last = Date.parse(previous?.fullUpdate?.attemptedAt || "");
  if (Number.isFinite(last) && Date.now() - last < 24 * 60 * 60_000) {
    return { ...previous.fullUpdate, skipped: "retry after 24h" };
  }
  const result = { attemptedAt: new Date().toISOString() };
  const windows = process.platform === "win32";
  const script = join(tmpdir(), `ltn-auto-update-${process.pid}${windows ? ".ps1" : ".sh"}`);
  try {
    const url = `${gatewayRoot}/install/${windows ? "codex-full.ps1" : "codex-full.sh"}`;
    const download = spawnSync(process.execPath, ["-e",
      "fetch(process.argv[1],{redirect:'error'}).then(async r=>{if(!r.ok)throw new Error('HTTP '+r.status);require('fs').writeFileSync(process.argv[2],Buffer.from(await r.arrayBuffer()))}).catch(e=>{console.error(e.message);process.exit(1)})",
      url, script], { encoding: "utf8", timeout: 120_000 });
    if (download.status !== 0) throw new Error(download.stderr.trim() || "installer download failed");
    const run = windows
      ? spawnSync("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", script, "-Mode", "update"],
        { encoding: "utf8", timeout: 20 * 60_000, windowsHide: true })
      : spawnSync("bash", [script, "--update"], { encoding: "utf8", timeout: 20 * 60_000 });
    result.exitCode = run.status;
    result.output = String(run.stdout || "").split(/\r?\n/).filter(Boolean).slice(-15);
    if (run.status !== 0) result.error = String(run.stderr || "").trim().slice(-2000) || `installer exited ${run.status}`;
  } catch (error) {
    result.error = error.message;
  } finally {
    try { unlinkSync(script); } catch {}
  }
  return result;
}

// Decide what the user must do for the new files to take effect.
export function notificationFor(status) {
  const updated = Array.isArray(status?.updated) ? status.updated : [];
  const fullUpdated = status?.fullUpdate && status.fullUpdate.exitCode === 0 && !status.fullUpdate.skipped;
  if (!updated.length && !fullUpdated) return null;
  const needsRestart = fullUpdated || updated.some((target) => !target.startsWith("skills/"));
  const action = needsRestart
    ? "Thoát hẳn Codex rồi mở lại để dùng bản mới."
    : "Mở đoạn chat mới để dùng bản mới.";
  const note = String(status?.releaseNote || "").trim();
  return { title: "SIMI đã cập nhật", message: note ? `${note} ${action}` : action, needsRestart };
}

function sendDesktopNotification({ title, message }) {
  try {
    if (process.platform === "win32") {
      const script = [
        "$ErrorActionPreference='Stop'",
        "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null",
        "$template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)",
        "$texts = $template.GetElementsByTagName('text')",
        "$texts.Item(0).AppendChild($template.CreateTextNode($env:SIMI_NOTIFY_TITLE)) > $null",
        "$texts.Item(1).AppendChild($template.CreateTextNode($env:SIMI_NOTIFY_MESSAGE)) > $null",
        "$toast = [Windows.UI.Notifications.ToastNotification]::new($template)",
        "[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe').Show($toast)"
      ].join("; ");
      return spawnSync("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script], {
        windowsHide: true, timeout: 20_000,
        env: { ...process.env, SIMI_NOTIFY_TITLE: title, SIMI_NOTIFY_MESSAGE: message }
      }).status === 0;
    }
    if (process.platform === "darwin") {
      // Text is passed through argv, never interpolated into AppleScript source.
      return spawnSync("osascript", ["-e", "on run argv", "-e", "display notification (item 2 of argv) with title (item 1 of argv)", "-e", "end run", title, message],
        { timeout: 20_000 }).status === 0;
    }
    const env = { ...process.env };
    const uid = typeof process.getuid === "function" ? process.getuid() : null;
    if (!env.DBUS_SESSION_BUS_ADDRESS && uid !== null && existsSync(`/run/user/${uid}/bus`)) {
      env.DBUS_SESSION_BUS_ADDRESS = `unix:path=/run/user/${uid}/bus`;
    }
    return spawnSync("notify-send", ["--app-name=SIMI", "--icon=software-update-available", title, message],
      { env, timeout: 20_000 }).status === 0;
  } catch {
    return false;
  }
}

// Windows: tác vụ hẹn giờ cũ chạy thẳng node.exe (chương trình console) → Windows bật cửa sổ đen vài giây mỗi lần.
// Đổi sang wscript.exe (không có cửa sổ) chạy node ở chế độ ẩn; máy không còn VBScript thì dùng conhost --headless.
export const HIDDEN_TASK_PS1 = String.raw`$ErrorActionPreference = 'Stop'
$name = 'SIMI Auto Update'
$t = Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
if (-not $t) { 'none'; exit 0 }
$a = @($t.Actions)[0]
if ($a.Execute -match '(?i)(wscript|conhost)(\.exe)?"?$') { 'hidden'; exit 0 }
$cmd = '"' + $a.Execute.Trim('"') + '" ' + [string]$a.Arguments
$codexHome = if ([string]$a.Arguments -match '--codex-home\s+"([^"]+)"') { $Matches[1] } else { Join-Path $env:USERPROFILE '.codex' }
if (Test-Path -LiteralPath (Join-Path $env:WINDIR 'System32\vbscript.dll')) {
  $vbs = Join-Path $codexHome 'auto-update-hidden.vbs'
  $body = "' SIMI Auto Update - chay an, khong bat cua so" + "${"`"}r${"`"}n" + 'CreateObject("WScript.Shell").Run "' + $cmd.Replace('"', '""') + '", 0, True' + "${"`"}r${"`"}n"
  [IO.File]::WriteAllText($vbs, $body, [Text.Encoding]::Unicode)
  $new = New-ScheduledTaskAction -Execute (Join-Path $env:WINDIR 'System32\wscript.exe') -Argument ('//B //Nologo "' + $vbs + '"')
} else {
  $new = New-ScheduledTaskAction -Execute (Join-Path $env:WINDIR 'System32\conhost.exe') -Argument ('--headless ' + $cmd)
}
Set-ScheduledTask -TaskName $name -Action $new | Out-Null
'migrated'
`;

export function hideScheduledTask() {
  if (process.platform !== "win32") return "skip";
  const file = join(tmpdir(), `simi-hide-task-${process.pid}.ps1`);
  try {
    // có BOM để PowerShell 5.1 đọc đúng UTF-8
    writeFileSync(file, "\uFEFF" + HIDDEN_TASK_PS1, "utf8");
    const r = spawnSync("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", file],
      { encoding: "utf8", timeout: 60_000, windowsHide: true });
    return String(r.stdout || "").trim().split(/\r?\n/).pop() || `exit ${r.status}`;
  } catch (error) {
    return `error: ${error.message}`;
  } finally {
    try { unlinkSync(file); } catch {}
  }
}

function readStatus() {
  try { return JSON.parse(readFileSync(statusPath, "utf8")); } catch { return null; }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const previous = readStatus();
  const status = await runAutoUpdate({ holdLock: true });
  try {
    if (status.lockHeld && status.fullUpdateRequired && !args.includes("--files-only")) {
      status.fullUpdate = runFullUpdate(previous);
      writeStatus(status);
    }
  } finally {
    if (status.lockHeld) releaseLock();
    delete status.lockHeld;
  }
  if (!status.skipped && !args.includes("--no-report")) {
    const report = await sendUpdateReport(status);
    status.reported = report.reported;
    if (!report.reported) status.reportError = report.reason;
    writeStatus(status);
  }
  const notification = notificationFor(status);
  if (notification && !args.includes("--no-notify")) {
    status.notified = sendDesktopNotification(notification);
    writeStatus(status);
  }
  if (process.platform === "win32" && !args.includes("--no-hide-task")) {
    status.taskWindow = hideScheduledTask();
    writeStatus(status);
  }
  process.stdout.write(`${JSON.stringify(status)}\n`);
  process.exitCode = status.error ? 1 : 0;
}
