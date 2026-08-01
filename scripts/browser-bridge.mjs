import http from "node:http";
import { execFile } from "node:child_process";
import { timingSafeEqual, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const host = process.env.LTN_BROWSER_BRIDGE_HOST || "127.0.0.1";
const port = Number(process.env.LTN_BROWSER_BRIDGE_PORT || 20130);
const bridgeToken = String(process.env.LTN_BROWSER_BRIDGE_TOKEN || "").trim();
const clientIdPath = process.env.LTN_CLIENT_ID_PATH ||
  join(process.env.CODEX_HOME || join(homedir(), ".codex"), "ltn-client-id");
const clientId = String(process.env.LTN_CLIENT_ID || "").trim() || readClientIdFile();
const maxChars = Math.max(10_000, Number(process.env.BROWSER_PAGE_MAX_CHARS || 300_000));
const gatewayBase = normalizeGatewayBase(
  process.env.LTN_GATEWAY_BASE_URL || process.env.NINEROUTER_URL || "https://ai.simi.vn/v1"
);
const helperPath = process.env.LTN_CODEX_TOKEN_HELPER ||
  join(process.env.CODEX_HOME || join(homedir(), ".codex"), "bin", "ltn-codex-token");

let pending = null;

function readClientIdFile() {
  try {
    return readFileSync(clientIdPath, "utf8").trim();
  } catch {
    return "";
  }
}

function normalizeGatewayBase(value) {
  const base = String(value || "").replace(/\/+$/, "");
  return /\/v1$/.test(base) ? base : `${base}/v1`;
}

function sameSecret(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

function authorized(req) {
  const header = String(req.headers.authorization || "");
  const token = header.replace(/^Bearer\s+/i, "").trim() ||
    String(req.headers["x-ltn-browser-bridge"] || "").trim();
  return Boolean(bridgeToken) && sameSecret(token, bridgeToken);
}

function json(res, status, payload) {
  const body = Buffer.from(JSON.stringify(payload));
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": body.length,
    "access-control-allow-origin": "*",
    "cache-control": "no-store"
  });
  res.end(body);
}

function text(res, status, value) {
  res.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store"
  });
  res.end(value);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxChars * 4) throw new Error("Browser page payload quá lớn.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Browser bridge payload không phải JSON hợp lệ.");
  }
}

async function resolveApiKey() {
  const direct = String(process.env.LTN_TEAM_API_KEY || process.env.NINEROUTER_KEY || "").trim();
  if (direct) return direct;
  try {
    const result = await execFileAsync(helperPath, [], {
      timeout: 5_000,
      windowsHide: true,
      maxBuffer: 16_384
    });
    return String(result.stdout || "").trim();
  } catch {
    return "";
  }
}

async function forwardToGateway(page) {
  const apiKey = await resolveApiKey();
  if (!apiKey) throw new Error("Không tìm thấy API key Gateway cho browser bridge.");
  if (!clientId) throw new Error("Thiếu LTN_CLIENT_ID cho browser bridge.");

  const response = await fetch(`${gatewayBase}/browser/page`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "x-ltn-client-id": clientId
    },
    body: JSON.stringify(page),
    redirect: "manual"
  });
  if (!response.ok) {
    throw new Error(`Gateway nhận browser page thất bại: HTTP ${response.status}.`);
  }
}

function finishPending(error, page) {
  if (!pending) return;
  const current = pending;
  pending = null;
  clearTimeout(current.timer);
  if (error) current.reject(error);
  else current.resolve(page);
}

function validatePage(payload) {
  const url = String(payload?.url || "").trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("Tab hiện tại không phải trang HTTP/HTTPS.");
  const textValue = String(payload?.text || "").trim();
  if (!textValue) throw new Error("Tab hiện tại không có nội dung hiển thị.");
  if (textValue.length > maxChars) throw new Error(`Nội dung tab vượt quá ${maxChars} ký tự.`);
  return {
    url,
    title: String(payload?.title || "").trim().slice(0, 500),
    text: textValue,
    selectedText: String(payload?.selectedText || "").trim().slice(0, 20_000),
    capturedAt: String(payload?.capturedAt || new Date().toISOString()).slice(0, 64)
  };
}

if (!bridgeToken) {
  console.error("Thiếu LTN_BROWSER_BRIDGE_TOKEN.");
  process.exitCode = 1;
} else {
  const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "authorization,content-type,x-ltn-browser-bridge"
      });
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      json(res, 200, { ok: true, service: "ltn-browser-bridge" });
      return;
    }

    if (!authorized(req)) {
      json(res, 401, { error: { message: "Browser bridge token không hợp lệ." } });
      return;
    }

    try {
      if (req.method === "GET" && req.url === "/v1/bridge/poll") {
        json(res, 200, {
          pending: pending ? { requestId: pending.requestId } : null
        });
        return;
      }

      if (req.method === "POST" && req.url === "/v1/bridge/capture") {
        if (pending) {
          json(res, 409, { error: { message: "Đang có một yêu cầu đọc tab khác." } });
          return;
        }
        const requestId = randomUUID();
        const timeoutMs = 60_000;
        const page = await new Promise((resolve, reject) => {
          const timer = setTimeout(
            () => finishPending(new Error("Chrome Extension không gửi snapshot trong thời gian cho phép.")),
            timeoutMs
          );
          pending = { requestId, resolve, reject, timer };
        });
        json(res, 200, { object: "browser.page", data: page });
        return;
      }

      if (req.method === "POST" && req.url === "/v1/bridge/page") {
        const payload = await readJson(req);
        if (!pending || String(payload?.requestId || "") !== pending.requestId) {
          json(res, 409, { error: { message: "Không có yêu cầu đọc tab đang chờ." } });
          return;
        }
        const page = validatePage(payload);
        await forwardToGateway(page);
        finishPending(null, page);
        json(res, 202, { ok: true });
        return;
      }

      json(res, 404, { error: { message: "Không tìm thấy browser bridge route." } });
    } catch (error) {
      if (pending && req.url === "/v1/bridge/page") finishPending(error);
      json(res, 502, { error: { message: error?.message || "Browser bridge thất bại." } });
    }
  });

  server.listen(port, host, () => {
    process.stdout.write(`LTN browser bridge listening on http://${host}:${port}\n`);
    process.stdout.write(`Gateway browser endpoint: ${gatewayBase}/browser/page\n`);
  });
}
