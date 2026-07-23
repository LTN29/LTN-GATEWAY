import http from "node:http";
import { Readable } from "node:stream";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { config, loadTeams } from "./config.mjs";
import { authenticateTeam } from "./auth.mjs";
import {
  loadMemoryContext,
  injectMemory
} from "./memory.mjs";
import { upstreamFetch } from "./upstream.mjs";
import { scheduleMemoryExtraction } from "./extractor.mjs";
import {
  parseModelRequest,
  injectResponsesMemory,
  responseInputMessages
} from "./model-routing.mjs";
import {
  assistantTextFromJson,
  assistantTextFromSse,
  responsesJsonSucceeded,
  responsesSseCompleted
} from "./response-parser.mjs";
import {
  sendJson,
  openAiError,
  readBody,
  setCors,
  handleOptions
} from "./http.mjs";
import {
  getBearerToken,
  jsonLog,
  requestId as makeRequestId
} from "./utils.mjs";

const codexInstallerPath = fileURLToPath(
  new URL("../scripts/install-codex-windows.ps1", import.meta.url)
);

function copyHeaders(upstream, res) {
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

  setCors(res);
}

function clientAbortSignal(req, res) {
  const controller = new AbortController();
  req.once("aborted", () => controller.abort());
  res.once("close", () => {
    if (!res.writableFinished) controller.abort();
  });
  return controller.signal;
}

async function pipeAndCapture(upstream, res) {
  if (!upstream.body) {
    res.end();
    return Buffer.alloc(0);
  }

  const reader = upstream.body.getReader();
  const captured = [];
  let capturedBytes = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = Buffer.from(value);
    res.write(chunk);

    if (capturedBytes < config.maxCaptureBytes) {
      const remaining = config.maxCaptureBytes - capturedBytes;
      const part = chunk.length <= remaining ? chunk : chunk.subarray(0, remaining);
      captured.push(part);
      capturedBytes += part.length;
    }
  }

  res.end();
  return Buffer.concat(captured);
}

async function proxyModels(req, res, rawKey, team, id) {
  const upstream = await upstreamFetch("/v1/models", {
    rawKey,
    requestId: id
  });

  copyHeaders(upstream, res);
  res.statusCode = upstream.status;

  if (!upstream.body) {
    res.end();
  } else {
    Readable.fromWeb(upstream.body).pipe(res);
  }

  jsonLog("models_completed", {
    requestId: id,
    team: team.code,
    status: upstream.status
  });
}

async function serveCodexInstaller(res) {
  const body = await readFile(codexInstallerPath);
  res.writeHead(200, {
    "content-type": "text/plain; charset=utf-8",
    "content-length": body.length,
    "cache-control": "public, max-age=60, must-revalidate",
    "x-content-type-options": "nosniff"
  });
  res.end(body);
}

async function proxyResponses(req, res, rawKey, team, id) {
  const signal = clientAbortSignal(req, res);
  const raw = await readBody(req);
  let payload;

  try {
    payload = parseModelRequest(raw);
  } catch (error) {
    sendJson(
      res,
      error.statusCode || 400,
      openAiError(error.message, error.type || "invalid_request_error")
    );
    return;
  }

  const originalMessages = responseInputMessages(payload.input);
  const { systemContent } = await loadMemoryContext(team);
  const upstreamPayload = injectResponsesMemory(payload, systemContent);

  // The model value is intentionally forwarded unchanged. In particular,
  // combo/... is resolved exclusively by 9Router.
  jsonLog("responses_started", {
    requestId: id,
    team: team.code,
    model: payload.model
  });

  const startedAt = Date.now();
  const upstream = await upstreamFetch("/v1/responses", {
    method: "POST",
    rawKey,
    requestId: id,
    accept: req.headers.accept || "*/*",
    signal,
    body: JSON.stringify(upstreamPayload)
  });

  copyHeaders(upstream, res);
  res.statusCode = upstream.status;
  const captured = await pipeAndCapture(upstream, res);

  if (upstream.ok) {
    let assistantText = "";
    let completed = false;
    try {
      if (payload.stream) {
        const rawSse = captured.toString("utf8");
        completed = responsesSseCompleted(rawSse);
        assistantText = assistantTextFromSse(rawSse);
      } else {
        const responsePayload = JSON.parse(captured.toString("utf8"));
        completed = responsesJsonSucceeded(responsePayload);
        assistantText = assistantTextFromJson(responsePayload);
      }
    } catch {
      assistantText = "";
    }

    if (completed) {
      scheduleMemoryExtraction({
        team,
        rawKey,
        originalMessages,
        assistantText,
        requestId: id
      });
    }
  }

  jsonLog("responses_completed", {
    requestId: id,
    team: team.code,
    model: payload.model,
    status: upstream.status,
    latencyMs: Date.now() - startedAt
  });
}

async function handleChat(req, res, rawKey, team, id) {
  const signal = clientAbortSignal(req, res);
  const raw = await readBody(req);
  let payload;

  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    sendJson(res, 400, openAiError("JSON không hợp lệ", "invalid_request_error"));
    return;
  }

  if (!Array.isArray(payload.messages)) {
    sendJson(
      res,
      400,
      openAiError("messages phải là một mảng", "invalid_request_error")
    );
    return;
  }

  const originalMessages = structuredClone(payload.messages);
  const { companyMemory, teamMemory } = await loadMemoryContext(team);

  payload.messages = injectMemory(
    payload.messages,
    team,
    companyMemory,
    teamMemory
  );

  jsonLog("chat_started", {
    requestId: id,
    team: team.code,
    model: payload.model || null,
    stream: Boolean(payload.stream)
  });

  const startedAt = Date.now();
  const upstream = await upstreamFetch("/v1/chat/completions", {
    method: "POST",
    rawKey,
    requestId: id,
    accept: req.headers.accept || "*/*",
    signal,
    body: JSON.stringify(payload)
  });

  copyHeaders(upstream, res);
  res.statusCode = upstream.status;

  const captured = await pipeAndCapture(upstream, res);

  let assistantText = "";
  if (upstream.ok) {
    try {
      if (payload.stream) {
        assistantText = assistantTextFromSse(captured.toString("utf8"));
      } else {
        assistantText = assistantTextFromJson(
          JSON.parse(captured.toString("utf8"))
        );
      }
    } catch {
      assistantText = "";
    }

    scheduleMemoryExtraction({
      team,
      rawKey,
      originalMessages,
      assistantText,
      requestId: id
    });
  }

  jsonLog("chat_completed", {
    requestId: id,
    team: team.code,
    status: upstream.status,
    latencyMs: Date.now() - startedAt
  });
}

function isAdmin(req) {
  if (!config.adminToken) return false;
  return getBearerToken(req.headers) === config.adminToken;
}

export function createGatewayServer() {
  return http.createServer(async (req, res) => {
  const id = makeRequestId(req.headers["x-request-id"]);
  res.setHeader("x-request-id", id);

  if (req.method === "OPTIONS") {
    handleOptions(res);
    return;
  }

  if (req.method === "GET" && req.url === "/install/codex.ps1") {
    try {
      await serveCodexInstaller(res);
    } catch (error) {
      jsonLog("installer_download_failed", {
        error: error?.message || String(error)
      });
      sendJson(
        res,
        500,
        openAiError("Không thể tải Codex installer", "gateway_error")
      );
    }
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    let teams = 0;
    try {
      teams = (await loadTeams()).byCode.size;
    } catch {
      teams = 0;
    }

    sendJson(res, 200, {
      status: "ok",
      service: "ltn-gateway",
      version: "1.0.0",
      teams,
      memoryUpdateEnabled: config.memoryUpdateEnabled,
      oneDriveMode: config.oneDrive.mode,
      upstream: config.upstreamBaseUrl
    });
    return;
  }

  if (req.method === "GET" && req.url === "/internal/teams") {
    if (!isAdmin(req)) {
      sendJson(res, 401, openAiError("Không có quyền", "authentication_error"));
      return;
    }

    const teams = await loadTeams({ force: true });
    sendJson(res, 200, {
      data: [...teams.byCode.values()].map((team) => ({
        code: team.code,
        displayName: team.displayName,
        memoryFile: team.memoryFile,
        enabled: team.enabled
      }))
    });
    return;
  }

  const supported =
    (req.method === "GET" && req.url === "/v1/models") ||
    (req.method === "GET" && req.url === "/v1/codex/config") ||
    (req.method === "POST" && req.url === "/v1/chat/completions") ||
    (req.method === "POST" && req.url === "/v1/responses");

  if (!supported) {
    sendJson(res, 404, openAiError("Không tìm thấy route", "not_found_error"));
    return;
  }

  try {
    const rawKey = getBearerToken(req.headers);

    if (!rawKey) {
      sendJson(
        res,
        401,
        openAiError("Thiếu Bearer API key", "authentication_error")
      );
      return;
    }

    const team = await authenticateTeam(rawKey);

    if (!team) {
      sendJson(
        res,
        401,
        openAiError(
          "API key chưa được đăng ký với team",
          "authentication_error"
        )
      );
      return;
    }

    if (!team.enabled) {
      sendJson(
        res,
        403,
        openAiError("Team đã bị vô hiệu hóa", "permission_error")
      );
      return;
    }

    if (req.method === "GET" && req.url === "/v1/codex/config") {
      sendJson(res, 200, { combos: config.codexCombos });
      return;
    }

    if (req.method === "GET") {
      await proxyModels(req, res, rawKey, team, id);
      return;
    }

    if (req.url === "/v1/responses") {
      await proxyResponses(req, res, rawKey, team, id);
      return;
    }

    await handleChat(req, res, rawKey, team, id);
  } catch (error) {
    jsonLog("request_failed", {
      requestId: id,
      error: error?.message || String(error)
    });

    if (!res.headersSent) {
      sendJson(
        res,
        error?.statusCode || 502,
        openAiError(error?.message || "Gateway xử lý thất bại")
      );
    } else {
      res.destroy(error);
    }
  }
  });
}

function isMainModule() {
  return Boolean(
    process.argv[1] &&
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  );
}

if (isMainModule()) {
  const server = createGatewayServer();
  server.listen(config.port, config.host, () => {
    jsonLog("server_started", {
      host: config.host,
      port: config.port,
      upstream: config.upstreamBaseUrl,
      teamsFile: config.teamsFile,
      memoryDir: config.memoryDir,
      oneDriveMode: config.oneDrive.mode
    });
  });
}
