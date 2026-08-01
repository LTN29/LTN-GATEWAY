import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");
const port = Number(process.env.LTN_CHROME_DEBUG_PORT || 9222);
const profile = process.env.LTN_CHROME_DEBUG_USER_DATA_DIR || join(codexHome, "chrome-profile");
const url = String(process.argv[2] || "").trim();

function findChrome() {
  const candidates = process.platform === "win32"
    ? [
        join(process.env.PROGRAMFILES || "", "Google", "Chrome", "Application", "chrome.exe"),
        join(process.env["PROGRAMFILES(X86)"] || "", "Google", "Chrome", "Application", "chrome.exe"),
        join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
      ]
    : process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          join(homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        ]
      : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];

  for (const candidate of candidates) {
    if (candidate && (candidate.includes("\\") || candidate.includes("/") ? existsSync(candidate) : spawnSync(candidate, ["--version"], { stdio: "ignore" }).status === 0)) {
      return candidate;
    }
  }
  throw new Error("Không tìm thấy Google Chrome. Đặt LTN_CHROME_BIN tới file Chrome nếu cần.");
}

const chrome = process.env.LTN_CHROME_BIN || findChrome();
const args = [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check"
];
if (url) args.push(url);

const child = spawn(chrome, args, {
  detached: true,
  windowsHide: true,
  stdio: "ignore",
  env: process.env
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
    `Chrome không mở được CDP tại cổng ${port}${lastError?.cause?.code ? ` (${lastError.cause.code})` : ""}.`
  );
}

try {
  await waitForCdp();
  child.unref();
  process.stdout.write([
    `Chrome CDP đã khởi động tại http://127.0.0.1:${port}`,
    `Profile: ${profile}`,
    "Đăng nhập một lần trong profile này; các lần sau sẽ giữ session.",
    "Đọc tab: ltn-browser-page --cdp"
  ].join("\n") + "\n");
} catch (error) {
  child.kill();
  process.stderr.write(`ltn-chrome-debug: ${error?.message || String(error)}\n`);
  process.exitCode = 1;
}
