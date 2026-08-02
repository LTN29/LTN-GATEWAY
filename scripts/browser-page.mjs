import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { readCdpPages } from "./browser-cdp.mjs";

const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");
const bridgeHost = process.env.LTN_BROWSER_BRIDGE_HOST || "127.0.0.1";
const bridgePort = Number(process.env.LTN_BROWSER_BRIDGE_PORT || 20130);
const bridgeBase = `http://${bridgeHost}:${bridgePort}`;
const bridgePath = process.env.LTN_BROWSER_BRIDGE_PATH || join(codexHome, "browser-bridge.mjs");
const tokenPath = process.env.LTN_BROWSER_BRIDGE_TOKEN_PATH ||
  join(codexHome, "credentials", "ltn-browser-bridge-token");
const timeoutMs = Math.max(10_000, Number(process.env.LTN_BROWSER_CAPTURE_TIMEOUT_MS || 60_000));
const cdpHost = process.env.LTN_CHROME_DEBUG_HOST || "127.0.0.1";
const cdpPort = Number(process.env.LTN_CHROME_DEBUG_PORT || 9222);
const chromeDebugPath = process.env.LTN_CHROME_DEBUG_PATH || join(codexHome, "chrome-debug.mjs");

function readFileValue(path) {
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return "";
  }
}

function resolveToken() {
  return String(process.env.LTN_BROWSER_BRIDGE_TOKEN || "").trim() || readFileValue(tokenPath);
}

function headers(token) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}

async function readResponse(response) {
  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }
  return { raw, payload };
}

function errorFromResponse(response, body, fallback) {
  const message = body?.payload?.error?.message || body?.payload?.message || body?.raw;
  return new Error(message ? String(message) : `${fallback}: HTTP ${response.status}`);
}

function describeFetchError(error) {
  const code = error?.cause?.code || error?.code || "";
  const detail = code ? ` (${code})` : "";
  return `${error?.message || String(error)}${detail}`;
}

async function checkBridge(token, signal) {
  let response;
  try {
    response = await fetch(`${bridgeBase}/health`, {
      headers: headers(token),
      signal,
      redirect: "manual"
    });
  } catch (error) {
    throw new Error(`Không kết nối được Browser Bridge tại ${bridgeBase}: ${describeFetchError(error)}`);
  }
  const body = await readResponse(response);
  if (!response.ok || body?.payload?.ok !== true) {
    throw errorFromResponse(response, body, "Browser bridge chưa sẵn sàng");
  }
  return true;
}

function startBridge(token) {
  if (!existsSync(bridgePath)) {
    throw new Error(`Không tìm thấy browser bridge tại ${bridgePath}. Hãy chạy Repair.`);
  }

  const nodeBin = process.env.LTN_BROWSER_NODE_PATH || process.execPath;
  const child = spawn(nodeBin, [bridgePath], {
    detached: true,
    windowsHide: true,
    stdio: "ignore",
    env: {
      ...process.env,
      LTN_BROWSER_BRIDGE_TOKEN: token
    }
  });
  child.unref();
}

async function ensureBridge(token) {
  try {
    await checkBridge(token, AbortSignal.timeout(1_000));
    return;
  } catch {
    startBridge(token);
  }

  const deadline = Date.now() + 5_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      await checkBridge(token, AbortSignal.timeout(700));
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error(
    `Không thể khởi động/kết nối Browser Bridge tại ${bridgeBase}: ${lastError?.message || "không rõ nguyên nhân"}`
  );
}

async function capture(token) {
  let response;
  try {
    response = await fetch(`${bridgeBase}/v1/bridge/capture`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ timeout_ms: timeoutMs }),
      signal: AbortSignal.timeout(timeoutMs + 5_000),
      redirect: "manual"
    });
  } catch (error) {
    throw new Error(`Không gửi được yêu cầu đọc tab tới Browser Bridge: ${describeFetchError(error)}`);
  }
  const body = await readResponse(response);
  if (!response.ok) {
    throw errorFromResponse(response, body, "Browser bridge không đọc được tab");
  }
  return body.payload;
}

async function checkCdp(signal) {
  const response = await fetch(`http://${cdpHost}:${cdpPort}/json/version`, {
    signal,
    redirect: "manual"
  });
  if (!response.ok) throw new Error(`Chrome CDP tráº£ HTTP ${response.status}.`);
  return true;
}

function startChromeDebug(targetUrl) {
  if (!existsSync(chromeDebugPath)) {
    throw new Error(`KhÃ´ng tÃ¬m tháº¥y Chrome CDP client táº¡i ${chromeDebugPath}. HÃ£y cháº¡y Repair.`);
  }

  const nodeBin = process.env.LTN_BROWSER_NODE_PATH || process.execPath;
  const childArgs = targetUrl ? [chromeDebugPath, targetUrl] : [chromeDebugPath];
  const child = spawn(nodeBin, childArgs, {
    detached: true,
    windowsHide: true,
    stdio: "ignore",
    env: process.env
  });
  child.unref();
}

async function ensureChromeDebug(targetUrl) {
  try {
    await checkCdp(AbortSignal.timeout(1_000));
    return;
  } catch {
    startChromeDebug(targetUrl);
  }

  const deadline = Date.now() + 12_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      await checkCdp(AbortSignal.timeout(700));
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error(
    `KhÃ´ng thá»ƒ tá»± khá»Ÿi Ä‘á»™ng/káº¿t ná»‘i Chrome CDP táº¡i ${cdpHost}:${cdpPort}: ${lastError?.message || "khÃ´ng rÃµ nguyÃªn nhÃ¢n"}`
  );
}

async function main() {
  const cliArgs = process.argv.slice(2);
  const args = new Set(cliArgs);
  const browserMode = String(process.env.LTN_BROWSER_MODE || "").toLowerCase();
  const useLegacyBridge = args.has("--bridge") || browserMode === "bridge";
  if (!useLegacyBridge) {
    const targetUrls = [
      process.env.LTN_CHROME_TARGET_URL || "",
      ...cliArgs.filter((value) => /^https?:\/\//i.test(value))
    ].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index);
    await ensureChromeDebug(targetUrls[0] || "");
    const pages = await readCdpPages({
      host: cdpHost,
      port: cdpPort,
      targetUrls,
      timeoutMs: Math.min(timeoutMs, 15_000)
    });
    const result = pages.length === 1
      ? { object: "browser.page", data: pages[0] }
      : { object: "browser.pages", data: { pages } };
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  const token = resolveToken();
  if (!token) throw new Error("Thiếu Browser Bridge token. Hãy chạy Repair.");
  await ensureBridge(token);
  const payload = await capture(token);
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

main().catch((error) => {
  process.stderr.write(`ltn-browser-page: ${error?.message || String(error)}\n`);
  process.exitCode = 1;
});
