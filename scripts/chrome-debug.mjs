import { closeSync, mkdirSync, openSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { browserLaunchArgs, findBrowserExecutable, isHeadlessBrowserSession, resolveBrowserProfile, resolveDesktopEnv } from "./browser-cdp.mjs";

const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");
const port = Number(process.env.LTN_CHROME_DEBUG_PORT || 9222);
const logPath = process.env.LTN_CHROME_DEBUG_LOG_PATH || join(codexHome, "logs", "simi-browser.log");
const url = String(process.argv[2] || "").trim();

const browser = findBrowserExecutable();
if (!browser) {
  process.stderr.write("ltn-chrome-debug: Chrome, Edge, Brave or Chromium was not found. Install Google Chrome, or set LTN_CHROME_BIN to the browser executable.\n");
  process.exit(1);
}
const chrome = browser.path;
const profile = resolveBrowserProfile({ browser });
const headless = isHeadlessBrowserSession();
const args = browserLaunchArgs({ port, profile, url });

mkdirSync(dirname(logPath), { recursive: true, mode: 0o700 });
mkdirSync(profile, { recursive: true, mode: 0o700 });
const logFd = openSync(logPath, "a", 0o600);
const child = spawn(chrome, args, {
  detached: true,
  windowsHide: false,
  stdio: ["ignore", "ignore", logFd],
  env: resolveDesktopEnv()
});
closeSync(logFd);
let chromeExit = "";
child.once("error", (error) => { chromeExit = error.message || String(error); });
child.once("exit", (code, signal) => {
  chromeExit = `Chrome exited${code === null ? "" : ` with code ${code}`}${signal ? ` (${signal})` : ""}.`;
});

async function waitForCdp() {
  const deadline = Date.now() + 10_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`, {
        signal: AbortSignal.timeout(700),
        redirect: "manual"
      });
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(
    `Chrome could not open CDP on port ${port}${lastError?.cause?.code ? ` (${lastError.cause.code})` : ""}. ` +
    (chromeExit ? chromeExit + " " : "") +
    `Profile: ${profile}. Check whether this profile is already open without remote debugging; do not delete it.`
  );
}

try {
  await waitForCdp();
  child.unref();
  process.stdout.write([
    `Chrome CDP đã khởi động tại http://127.0.0.1:${port}`,
    `Profile: ${profile}`,
    `Browser: ${chrome}${browser.kind === "snap" ? " (snap)" : ""}`,
    ...(headless ? ["No desktop session (DISPLAY/WAYLAND_DISPLAY) found: running headless. Sign-in windows cannot be shown; many shops block headless browsers."] : []),
    "Đăng nhập một lần trong profile này; các lần sau sẽ giữ session.",
    "Đọc tab: ltn-browser-page --cdp"
  ].join("\n") + "\n");
} catch (error) {
  child.kill();
  process.stderr.write(`ltn-chrome-debug: ${error?.message || String(error)}. Startup log: ${logPath}\n`);
  process.exitCode = 1;
}
