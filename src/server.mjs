import http from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { Readable } from "node:stream";

const PORT = Number(process.env.PORT || 20129);
const UPSTREAM_BASE_URL = String(
  process.env.UPSTREAM_BASE_URL || "http://127.0.0.1:20128"
).replace(/\/+$/, "");
const TEAMS_FILE = resolve(process.env.TEAMS_FILE || "./config/teams.json");
const MEMORY_DIR = resolve(process.env.MEMORY_DIR || "./memory");
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 2_000_000);
const MAX_CONTEXT_CHARS = Number(process.env.MAX_CONTEXT_CHARS || 30_000);
const CORS_ALLOW_ORIGIN = process.env.CORS_ALLOW_ORIGIN || "*";

let teamsCache = { loadedAt: 0, byHash: new Map() };

function log(event, data = {}) {
  process.stdout.write(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...data
  }) + "\n");
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = Buffer.from(JSON.stringify(payload));
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": body.length,
    "access-control-allow-origin": CORS_ALLOW_ORIGIN,
    ...extraHeaders
  });
  res.end(body);
}

function openAiError(message, type = "gateway_error", code = null) {
  return { error: { message, type, param: null, code } };
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function getBearerToken(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

async function readRequestBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("Request body is too large");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function loadTeams() {
  const raw = await readFile(TEAMS_FILE, "utf8");
  const config = JSON.parse(raw);
  if (!Array.isArray(config.teams) || config.teams.length === 0) {
    throw new Error("config/teams.json must contain a non-empty teams array");
  }

  const byHash = new Map();
  for (const item of config.teams) {
    const code = String(item.code || "").trim().toUpperCase();
    const keyHash = String(item.keyHash || "").trim().toLowerCase();
    const memoryFile = basename(String(item.memoryFile || `${code}.md`));

    if (!code || !/^[A-Z0-9_-]+$/.test(code)) {
      throw new Error(`Invalid team code: ${item.code}`);
    }
    if (!/^[a-f0-9]{64}$/.test(keyHash)) {
      throw new Error(`Invalid SHA-256 keyHash for team ${code}`);
    }
    if (byHash.has(keyHash)) {
      throw new Error(`Duplicate keyHash configured for team ${code}`);
    }
    byHash.set(keyHash, { code, keyHash, memoryFile });
  }

  teamsCache = { loadedAt: Date.now(), byHash };
  return byHash;
}

async function getTeamForToken(token) {
  if (!teamsCache.byHash.size || Date.now() - teamsCache.loadedAt > 10_000) {
    await loadTeams();
  }
  return teamsCache.byHash.get(sha256(token)) || null;
}

async function loadTeamMemory(team) {
  const path = resolve(MEMORY_DIR, team.memoryFile);
  if (!path.startsWith(MEMORY_DIR)) {
    throw new Error("Invalid memory file path");
  }
  try {
    const content = await readFile(path, "utf8");
    return content.slice(0, MAX_CONTEXT_CHARS);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return `# ${team.code} TEAM CONTEXT\n\nChưa có ngữ cảnh được lưu.`;
    }
    throw error;
  }
}

function injectMemory(messages, team, memory) {
  return [{
    role: "system",
    content: [
      `Bạn đang hỗ trợ team ${team.code} của công ty LTN.`,
      "Dùng ngữ cảnh nội bộ bên dưới để trả lời nhất quán.",
      "Không được tiết lộ API key, token, mật khẩu hoặc thông tin bí mật.",
      "Nếu ngữ cảnh mâu thuẫn với yêu cầu mới nhất của người dùng, ưu tiên yêu cầu mới nhất.",
      "",
      "<team_context>",
      memory,
      "</team_context>"
    ].join("\n")
  }, ...messages];
}

function copyUpstreamHeaders(upstream, res) {
  const blocked = new Set([
    "content-length",
    "connection",
    "keep-alive",
    "transfer-encoding",
    "content-encoding"
  ]);
  for (const [name, value] of upstream.headers.entries()) {
    if (!blocked.has(name.toLowerCase())) {
      res.setHeader(name, value);
    }
  }
  res.setHeader("access-control-allow-origin", CORS_ALLOW_ORIGIN);
}

async function proxyRequest({ req, res, path, bodyBuffer, team, requestId }) {
  const startedAt = Date.now();
  const upstream = await fetch(`${UPSTREAM_BASE_URL}${path}`, {
    method: req.method,
    headers: {
      "authorization": req.headers.authorization,
      "content-type": req.headers["content-type"] || "application/json",
      "accept": req.headers.accept || "*/*",
      "x-ltn-team": team.code,
      "x-request-id": requestId
    },
    body: bodyBuffer?.length ? bodyBuffer : undefined,
    redirect: "manual"
  });

  copyUpstreamHeaders(upstream, res);
  res.statusCode = upstream.status;

  if (!upstream.body) {
    res.end();
  } else {
    Readable.fromWeb(upstream.body).pipe(res);
  }

  log("proxy_completed", {
    requestId,
    team: team.code,
    path,
    upstreamStatus: upstream.status,
    latencyMs: Date.now() - startedAt
  });
}

const server = http.createServer(async (req, res) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  res.setHeader("x-request-id", requestId);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": CORS_ALLOW_ORIGIN,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "authorization,content-type,x-request-id",
      "access-control-max-age": "86400"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "ltn-memory-gateway",
      upstream: UPSTREAM_BASE_URL
    });
    return;
  }

  const supported =
    (req.method === "POST" && req.url === "/v1/chat/completions") ||
    (req.method === "GET" && req.url === "/v1/models");

  if (!supported) {
    sendJson(res, 404, openAiError("Route not found", "not_found_error"));
    return;
  }

  try {
    const token = getBearerToken(req);
    if (!token) {
      sendJson(res, 401, openAiError("Missing Bearer API key", "authentication_error"));
      return;
    }

    const team = await getTeamForToken(token);
    if (!team) {
      sendJson(res, 401, openAiError("API key is not registered with a team", "authentication_error"));
      return;
    }

    if (req.method === "GET" && req.url === "/v1/models") {
      await proxyRequest({ req, res, path: "/v1/models", bodyBuffer: null, team, requestId });
      return;
    }

    const rawBody = await readRequestBody(req);
    let payload;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      sendJson(res, 400, openAiError("Invalid JSON body", "invalid_request_error"));
      return;
    }

    if (!Array.isArray(payload.messages)) {
      sendJson(res, 400, openAiError("messages must be an array", "invalid_request_error"));
      return;
    }

    const memory = await loadTeamMemory(team);
    payload.messages = injectMemory(payload.messages, team, memory);
    const bodyBuffer = Buffer.from(JSON.stringify(payload));

    log("chat_request", {
      requestId,
      team: team.code,
      model: payload.model || null,
      stream: Boolean(payload.stream)
    });

    await proxyRequest({
      req,
      res,
      path: "/v1/chat/completions",
      bodyBuffer,
      team,
      requestId
    });
  } catch (error) {
    log("request_failed", {
      requestId,
      error: error?.message || String(error)
    });

    if (!res.headersSent) {
      sendJson(res, error?.statusCode || 502, openAiError(error?.message || "Gateway request failed"));
    } else {
      res.destroy(error);
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  log("server_started", {
    port: PORT,
    upstream: UPSTREAM_BASE_URL,
    teamsFile: TEAMS_FILE,
    memoryDir: MEMORY_DIR
  });
});
