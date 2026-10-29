#!/usr/bin/env node
// SIMI auto-update: keeps local skills and tools in sync with the Gateway.
// Runs on a schedule; downloads only changed files listed in the Gateway
// manifest, verifies SHA-256, and replaces each file atomically.
import { createHash } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
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

export async function runAutoUpdate() {
  const status = { checkedAt: new Date().toISOString(), gateway: gatewayRoot, updated: [], failed: [] };
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
    for (const file of manifest.files) {
      const path = safeTarget(codexHome, file?.target);
      if (!path || !/^[a-f0-9]{64}$/.test(String(file.sha256)) || !String(file.url || "").startsWith("/install/")) {
        status.failed.push({ target: file?.target, error: "rejected manifest entry" });
        continue;
      }
      // Never install new skills/tools the user removed or never had, except core tools.
      const isSkill = file.target.startsWith("skills/");
      if (isSkill && !existsSync(dirname(path))) continue;
      if (localHash(path) === file.sha256) continue;
      try {
        const body = await fetchBuffer(`${gatewayRoot}${file.url}`, 60_000);
        if (sha256(body) !== file.sha256) throw new Error("checksum mismatch");
        mkdirSync(dirname(path), { recursive: true });
        const temporary = `${path}.${process.pid}.update`;
        writeFileSync(temporary, body, { mode: 0o700 });
        renameSync(temporary, path);
        status.updated.push(file.target);
      } catch (error) {
        status.failed.push({ target: file.target, error: error.message });
      }
    }
    const localVersion = Number(readFileSafe(versionPath) || 0);
    status.installerVersion = { local: localVersion, server: Number(manifest.installerVersion || 0) };
    if (typeof manifest.releaseNote === "string") status.releaseNote = manifest.releaseNote.slice(0, 200);
    status.fullUpdateRequired = Number(manifest.installerVersion || 0) > localVersion;
  } catch (error) {
    status.error = error.message;
  } finally {
    try { unlinkSync(lockPath); } catch {}
  }
  writeStatus(status);
  return status;
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

function readStatus() {
  try { return JSON.parse(readFileSync(statusPath, "utf8")); } catch { return null; }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const previous = readStatus();
  const status = await runAutoUpdate();
  if (status.fullUpdateRequired && !args.includes("--files-only")) {
    status.fullUpdate = runFullUpdate(previous);
    writeStatus(status);
  }
  const notification = notificationFor(status);
  if (notification && !args.includes("--no-notify")) {
    status.notified = sendDesktopNotification(notification);
    writeStatus(status);
  }
  process.stdout.write(`${JSON.stringify(status)}\n`);
  process.exitCode = status.error ? 1 : 0;
}
