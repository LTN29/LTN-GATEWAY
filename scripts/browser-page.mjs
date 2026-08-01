import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");
const bridgeHost = process.env.LTN_BROWSER_BRIDGE_HOST || "127.0.0.1";
const bridgePort = Number(process.env.LTN_BROWSER_BRIDGE_PORT || 20130);
const bridgeBase = `http://${bridgeHost}:${bridgePort}`;
const bridgePath = process.env.LTN_BROWSER_BRIDGE_PATH || join(codexHome, "browser-bridge.mjs");
const tokenPath = process.env.LTN_BROWSER_BRIDGE_TOKEN_PATH ||
  join(codexHome, "credentials", "ltn-browser-bridge-token");
const timeoutMs = Math.max(10_000, Number(process.env.LTN_BROWSER_CAPTURE_TIMEOUT_MS || 60_000));

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

async function checkBridge(token, signal) {
  const response = await fetch(`${bridgeBase}/health`, {
    headers: headers(token),
    signal,
    redirect: "manual"
  });
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
  throw lastError || new Error("Không thể khởi động browser bridge.");
}

async function capture(token) {
  const response = await fetch(`${bridgeBase}/v1/bridge/capture`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ timeout_ms: timeoutMs }),
    signal: AbortSignal.timeout(timeoutMs + 5_000),
    redirect: "manual"
  });
  const body = await readResponse(response);
  if (!response.ok) {
    throw errorFromResponse(response, body, "Browser bridge không đọc được tab");
  }
  return body.payload;
}

async function main() {
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
