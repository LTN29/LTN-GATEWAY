import http from "node:http";
import { Readable } from "node:stream";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { config, loadTeams } from "./config.mjs";
import { authenticatePrincipal } from "./auth.mjs";
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
  codexConfigForPrincipal,
  selectCodexRoute
} from "./codex-routing.mjs";
import { recordUserAnalytics } from "./user-analytics-store.mjs";
import { isOutsideControlPrincipal } from "./principal-control.mjs";
import {
  browserPageScope,
  getBrowserPage,
  storeBrowserPage
} from "./browser-page-store.mjs";
import { handleAdminApi, handleAdminStatic } from "./admin/admin-router.mjs";
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
  requestId as makeRequestId,
  redactSecrets
} from "./utils.mjs";

const codexBootstrapPath = fileURLToPath(
  new URL("../scripts/install-codex-bootstrap.ps1", import.meta.url)
);
const codexFullInstallerPath = fileURLToPath(
  new URL("../scripts/install-codex-windows.ps1", import.meta.url)
);
const codexUnixBootstrapPath = fileURLToPath(
  new URL("../scripts/install-codex-unix-bootstrap.sh", import.meta.url)
);
const codexUnixFullInstallerPath = fileURLToPath(
  new URL("../scripts/install-codex-unix.sh", import.meta.url)
);
const browserBridgeScriptPath = fileURLToPath(
  new URL("../scripts/browser-bridge.mjs", import.meta.url)
);
const browserExtensionRoot = fileURLToPath(
  new URL("../browser-extension/", import.meta.url)
);
const localToolPaths = new Map([
  [
    "/install/tools/browser-page.mjs",
    fileURLToPath(new URL("../scripts/browser-page.mjs", import.meta.url))
  ],
  [
    "/install/tools/9router-client.mjs",
    fileURLToPath(new URL("../scripts/9router-client.mjs", import.meta.url))
  ],
  [
    "/install/tools/pdf-extract.py",
    fileURLToPath(new URL("../scripts/pdf-extract.py", import.meta.url))
  ]
]);

function upstreamErrorDetail(captured, requestId, endpoint, status) {
  let code = "UPSTREAM_ERROR";
  let message = `Yêu cầu thất bại với HTTP ${status}.`;
  try {
    const payload = JSON.parse(captured.toString("utf8"));
    const error = payload?.error;
    if (typeof error === "string") message = error;
    else if (error && typeof error === "object") {
      code = error.code || error.type || code;
      message = error.message || message;
    } else if (payload?.message) {
      message = payload.message;
    }
  } catch {
    // Do not persist raw non-JSON upstream bodies because they may contain user data.
  }
  return {
    code: redactSecrets(String(code)),
    message: redactSecrets(String(message)),
    requestId,
    endpoint
  };
}
const managedSkillNames = [
  "9router",
  "9router-chat",
  "9router-image",
  "9router-video",
  "9router-tts",
  "9router-stt",
  "9router-embeddings",
  "9router-web-search",
  "9router-web-fetch",
  "9router-browser",
  "9router-pdf"
];
const managedSkillPaths = new Map(managedSkillNames.map((name) => [
  `/install/skills/${name}/SKILL.md`,
  fileURLToPath(new URL(`../vendor/9router-skills/${name}/SKILL.md`, import.meta.url))
]));

const capabilityPostPaths = new Set([
  "/v1/messages",
  "/v1/images/generations",
  "/v1/images/edits",
  "/v1/audio/speech",
  "/v1/audio/transcriptions",
  "/v1/embeddings",
  "/v1/search",
  "/v1/web/fetch",
  "/v1/videos/generations",
  "/v1/videos/edits",
  "/v1/videos/extensions"
]);

function isCapabilityGetPath(pathname) {
  return /^\/v1\/models\/(?:image|tts|embedding|web|stt|image-to-text)$/.test(pathname) ||
    pathname === "/v1/models/info" ||
    pathname === "/v1/audio/voices" ||
    /^\/v1\/videos\/[^/]+$/.test(pathname);
}

function browserClientId(req) {
  const value = String(req.headers["x-ltn-client-id"] || "").trim();
  if (!/^[A-Za-z0-9._:-]{8,100}$/.test(value)) {
    const error = new Error("X-LTN-Client-ID không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }
  return value;
}

function parseBrowserPage(raw) {
  let payload;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    const error = new Error("Browser page payload không phải JSON hợp lệ.");
    error.statusCode = 400;
    throw error;
  }

  const url = String(payload?.url || "").trim();
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    const error = new Error("Browser page URL không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    const error = new Error("Browser page chỉ chấp nhận HTTP/HTTPS.");
    error.statusCode = 400;
    throw error;
  }

  const text = String(payload?.text || "").trim();
  if (!text) {
    const error = new Error("Browser page không có nội dung hiển thị.");
    error.statusCode = 400;
    throw error;
  }
  if (text.length > config.browserPageMaxChars) {
    const error = new Error(
      `Browser page vượt quá giới hạn ${config.browserPageMaxChars} ký tự.`
    );
    error.statusCode = 413;
    throw error;
  }

  return {
    url,
    title: String(payload?.title || "").trim().slice(0, 500),
    text,
    selectedText: String(payload?.selectedText || "").trim().slice(0, 20_000),
    capturedAt: String(payload?.capturedAt || new Date().toISOString()).slice(0, 64),
    source: "chrome-extension"
  };
}

async function handleBrowserPage(req, res, principal, id) {
  const clientId = browserClientId(req);
  const scope = browserPageScope(principal, clientId);

  if (req.method === "GET") {
    const page = getBrowserPage(scope);
    if (!page) {
      sendJson(
        res,
        404,
        openAiError("Chưa có snapshot tab Chrome mới.", "not_found_error")
      );
      return;
    }
    sendJson(res, 200, { object: "browser.page", data: page });
    return;
  }

  const page = parseBrowserPage(await readBody(req, config.browserPageMaxChars * 4));
  const { expiresAt } = storeBrowserPage(scope, page, config.browserPageTtlMs);
  jsonLog("browser_page_received", {
    requestId: id,
    principalType: principal.principalType,
    principalId: principal.principalId,
    clientId,
    source: page.source,
    textChars: page.text.length,
    expiresAt
  });
  sendJson(res, 202, {
    object: "browser.page.received",
    data: { url: page.url, title: page.title, textChars: page.text.length, expiresAt }
  });
}

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

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: config.codexUsageTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function usageFromResponsePayload(payload) {
  return payload?.usage || payload?.response?.usage || null;
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

async function proxyModels(req, res, rawKey, principal, id) {
  const team = principal.team;
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

async function proxyCapability(req, res, rawKey, principal, id, upstreamPath) {
  const startedAt = Date.now();
  const signal = clientAbortSignal(req, res);
  const body = req.method === "GET"
    ? undefined
    : await readBody(req, config.maxCapabilityBodyBytes);
  const connectionId = String(req.headers["x-connection-id"] || "").trim();
  if (connectionId.length > 256 || /[\r\n]/.test(connectionId)) {
    const error = new Error("X-Connection-ID không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }

  const upstream = await upstreamFetch(upstreamPath, {
    method: req.method,
    rawKey,
    requestId: id,
    accept: req.headers.accept || "*/*",
    contentType: req.method === "GET"
      ? null
      : String(req.headers["content-type"] || "application/json"),
    extraHeaders: connectionId ? { "x-connection-id": connectionId } : {},
    signal,
    body
  });

  copyHeaders(upstream, res);
  res.statusCode = upstream.status;
  const captured = await pipeAndCapture(upstream, res);
  let responseUsage = null;
  if ((upstream.headers.get("content-type") || "").includes("application/json") && captured.length) {
    try {
      responseUsage = usageFromResponsePayload(JSON.parse(captured.toString("utf8")));
    } catch {
      responseUsage = null;
    }
  }

  if (!isOutsideControlPrincipal(principal)) {
    const latencyMs = Date.now() - startedAt;
    await recordUserAnalytics({
      date: localDate(),
      principal,
      routeTier: "capability",
      selectedCombo: "",
      status: upstream.status,
      latencyMs,
      usage: responseUsage,
      clientIdHashPrefix: "",
      errorDetail: upstream.ok ? null : upstreamErrorDetail(captured, id, upstreamPath.split("?")[0], upstream.status)
    });
  }

  jsonLog("capability_completed", {
    requestId: id,
    team: principal.team.code,
    principalType: principal.principalType,
    userId: principal.userId,
    path: upstreamPath.split("?")[0],
    status: upstream.status,
    latencyMs: Date.now() - startedAt
  });
}

function assertInstallerComboId(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    const error = new Error(`Thiếu Combo ID ${name}.`);
    error.statusCode = 503;
    throw error;
  }
  if (value.length > 200 || /[\r\n]/.test(value)) {
    const error = new Error(`Combo ID ${name} không hợp lệ.`);
    error.statusCode = 503;
    throw error;
  }
}

async function installerConfigForPrincipal(rawKey, principal, id) {
  const codexConfig = codexConfigForPrincipal(principal);
  const mode = codexConfig.routing?.mode || "";
  const premium = codexConfig.combos?.premium || "";
  const free = codexConfig.combos?.free || "";
  const test = codexConfig.combos?.test || "";
  const required = mode === "premium_always"
    ? [["combos.premium", premium]]
    : mode === "free_only"
      ? [["combos.free", free]]
      : mode === "test_only"
        ? [["combos.test", test]]
        : [["combos.premium", premium], ["combos.free", free]];

  for (const [name, comboId] of required) {
    assertInstallerComboId(comboId, name);
  }

  const upstream = await upstreamFetch("/v1/models", {
    rawKey,
    requestId: id
  });
  if (!upstream.ok) {
    const error = new Error(`Không xác minh được Combo qua /v1/models: HTTP ${upstream.status}.`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await upstream.json();
  const models = Array.isArray(payload?.data) ? payload.data : [];
  for (const [, comboId] of required) {
    const matches = models.filter((item) => item?.id === comboId);
    if (matches.length === 0) {
      const error = new Error(`Thiếu Combo trên 9Router: ${comboId}`);
      error.statusCode = 503;
      throw error;
    }
    if (matches.some((item) => item.owned_by != null && item.owned_by !== "combo")) {
      const error = new Error(`Model '${comboId}' tồn tại nhưng owned_by không phải combo.`);
      error.statusCode = 503;
      throw error;
    }
  }

  return ["LTN_CODEX_INSTALLER_V2", mode, premium, free, test, ""].join("\n");
}

async function serveInstallerFile(res, path, contentType = "text/plain; charset=utf-8") {
  const body = await readFile(path);
  res.writeHead(200, {
    "content-type": contentType,
    "content-length": body.length,
    "cache-control": "public, max-age=60, must-revalidate",
    "x-content-type-options": "nosniff"
  });
  res.end(body);
}

async function proxyResponses(req, res, rawKey, principal, id) {
  const team = principal.team;
  const signal = clientAbortSignal(req, res);
  const raw = await readBody(req);
  let payload;
  let route = null;
  let shouldReleaseRoute = false;

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
  const outsideControl = isOutsideControlPrincipal(principal);
  const memoryDisabled = outsideControl || principal.memoryMode === "none";
  const { systemContent } = memoryDisabled
    ? { systemContent: "" }
    : await loadMemoryContext(team, principal);
  const upstreamPayload = memoryDisabled
    ? payload
    : injectResponsesMemory(payload, systemContent);
  route = await selectCodexRoute({
    team,
    principal,
    headers: req.headers
  });
  shouldReleaseRoute = true;
  upstreamPayload.model = route.selectedCombo;

  jsonLog("codex_route_selected", {
    requestId: id,
    team: team.code,
    principalType: principal.principalType,
    userId: principal.userId,
    routeTier: route.routeTier,
    requestNumber: route.requestNumber,
    limit: route.limit,
    selectedCombo: route.selectedCombo,
    clientIdHashPrefix: route.clientIdHashPrefix
  });

  jsonLog("responses_started", {
    requestId: id,
    team: team.code,
    model: route.selectedCombo
  });

  const startedAt = Date.now();
  try {
    const upstream = await upstreamFetch("/v1/responses", {
      method: "POST",
      rawKey,
      requestId: id,
      accept: req.headers.accept || "*/*",
      signal,
      body: JSON.stringify(upstreamPayload)
    });

    copyHeaders(upstream, res);
    res.setHeader("X-LTN-Route-Tier", route.routeTier);
    if (route.premiumRemaining !== null) {
      res.setHeader("X-LTN-Premium-Remaining", String(route.premiumRemaining));
    }
    res.statusCode = upstream.status;
    const captured = await pipeAndCapture(upstream, res);
    let responseUsage = null;

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
          responseUsage = usageFromResponsePayload(responsePayload);
          completed = responsesJsonSucceeded(responsePayload);
          assistantText = assistantTextFromJson(responsePayload);
        }
      } catch {
        assistantText = "";
      }

      if (completed) {
        await route.confirm();
        shouldReleaseRoute = false;
        if (!outsideControl && principal.memoryMode === "full") scheduleMemoryExtraction({
          team,
          principal,
          rawKey,
          originalMessages,
          assistantText,
          requestId: id
        });
      }
    }

    if (!outsideControl) {
      const latencyMs = Date.now() - startedAt;
      await recordUserAnalytics({
        date: localDate(),
        principal,
        routeTier: route.routeTier,
        selectedCombo: route.selectedCombo,
        status: upstream.status,
        latencyMs,
        usage: responseUsage,
        clientIdHashPrefix: route.clientIdHashPrefix,
        errorDetail: upstream.ok ? null : upstreamErrorDetail(captured, id, "/v1/responses", upstream.status)
      });
    }

    jsonLog("responses_completed", {
      requestId: id,
      team: team.code,
      principalType: principal.principalType,
      userId: principal.userId,
      model: route.selectedCombo,
      status: upstream.status,
      latencyMs: Date.now() - startedAt
    });
  } finally {
    if (shouldReleaseRoute) {
      await route.release();
    }
  }
}

async function handleChat(req, res, rawKey, principal, id) {
  const team = principal.team;
  const outsideControl = isOutsideControlPrincipal(principal);
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

  // injectMemory creates a new array and does not mutate the original messages.
  // Keep the original reference instead of cloning potentially large prompts.
  const originalMessages = payload.messages;
  if (!outsideControl && principal.memoryMode !== "none") {
    const { companyMemory, teamMemory, userMemory } = await loadMemoryContext(team, principal);
    payload.messages = injectMemory(
      payload.messages,
      team,
      companyMemory,
      teamMemory,
      userMemory,
      principal
    );
  }

  jsonLog("chat_started", {
    requestId: id,
    team: team.code,
    principalType: principal.principalType,
    userId: principal.userId,
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

    if (!outsideControl && principal.memoryMode === "full") scheduleMemoryExtraction({
      team,
      principal,
      rawKey,
      originalMessages,
      assistantText,
      requestId: id
    });
  }

  jsonLog("chat_completed", {
    requestId: id,
    team: team.code,
    principalType: principal.principalType,
    userId: principal.userId,
    status: upstream.status,
    latencyMs: Date.now() - startedAt
  });
}

function isAdmin(req) {
  if (!config.adminToken) return false;
  return getBearerToken(req.headers) === config.adminToken;
}

function isConfiguredAdminHost(req) {
  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  return config.adminAllowedHosts.includes(host);
}

export function createGatewayServer() {
  return http.createServer(async (req, res) => {
  const id = makeRequestId(req.headers["x-request-id"]);
  const parsedUrl = new URL(req.url || "/", "http://gateway.local");
  const pathname = parsedUrl.pathname;
  const hasQuery = Boolean(parsedUrl.search);
  res.setHeader("x-request-id", id);

  if (req.url?.startsWith("/admin/api/v1/")) {
    await handleAdminApi(req, res);
    return;
  }

  if (config.adminUiEnabled && pathname === "/" && isConfiguredAdminHost(req)) {
    res.writeHead(302, {
      location: `/admin${parsedUrl.search}`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    });
    res.end();
    return;
  }

  if (config.adminUiEnabled && pathname === "/admin/" && isConfiguredAdminHost(req)) {
    res.writeHead(308, {
      location: `/admin${parsedUrl.search}`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    });
    res.end();
    return;
  }

  if (await handleAdminStatic(req, res)) {
    return;
  }

  if (req.method === "OPTIONS") {
    handleOptions(res);
    return;
  }

  if (req.method === "GET" && pathname === "/install/codex.ps1" && !hasQuery) {
    try {
      await serveInstallerFile(res, codexBootstrapPath);
    } catch (error) {
      jsonLog("installer_download_failed", {
        route: "bootstrap",
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

  if (req.method === "GET" && pathname === "/install/codex-full.ps1" && !hasQuery) {
    try {
      await serveInstallerFile(res, codexFullInstallerPath);
    } catch (error) {
      jsonLog("installer_download_failed", {
        route: "full",
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

  if (req.method === "GET" && pathname === "/install/codex.sh" && !hasQuery) {
    try {
      await serveInstallerFile(
        res,
        codexUnixBootstrapPath,
        "text/x-shellscript; charset=utf-8"
      );
    } catch (error) {
      jsonLog("installer_download_failed", {
        route: "unix-bootstrap",
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

  if (req.method === "GET" && pathname === "/install/codex-full.sh" && !hasQuery) {
    try {
      await serveInstallerFile(
        res,
        codexUnixFullInstallerPath,
        "text/x-shellscript; charset=utf-8"
      );
    } catch (error) {
      jsonLog("installer_download_failed", {
        route: "unix-full",
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

  if (req.method === "GET" && pathname === "/install/browser-bridge.mjs" && !hasQuery) {
    try {
      await serveInstallerFile(
        res,
        browserBridgeScriptPath,
        "text/javascript; charset=utf-8"
      );
    } catch (error) {
      jsonLog("browser_bridge_download_failed", {
        error: error?.message || String(error)
      });
      sendJson(res, 500, openAiError("Không thể tải browser bridge", "gateway_error"));
    }
    return;
  }

  if (req.method === "GET" && !hasQuery && localToolPaths.has(pathname)) {
    const toolPath = localToolPaths.get(pathname);
    const contentType = pathname.endsWith(".py")
      ? "text/x-python; charset=utf-8"
      : "text/javascript; charset=utf-8";
    try {
      await serveInstallerFile(res, toolPath, contentType);
    } catch (error) {
      jsonLog("local_tool_download_failed", {
        path: pathname,
        error: error?.message || String(error)
      });
      sendJson(res, 404, openAiError("Không tìm thấy local tool", "not_found_error"));
    }
    return;
  }

  if (
    req.method === "GET" &&
    pathname.startsWith("/install/browser-extension/") &&
    !hasQuery
  ) {
    const assetName = pathname.slice("/install/browser-extension/".length);
    if (!/^[A-Za-z0-9._-]+$/.test(assetName)) {
      sendJson(res, 404, openAiError("Không tìm thấy browser extension asset", "not_found_error"));
      return;
    }
    try {
      const assetPath = resolve(browserExtensionRoot, assetName);
      const normalizedRoot = browserExtensionRoot.endsWith("\\") || browserExtensionRoot.endsWith("/")
        ? browserExtensionRoot
        : `${browserExtensionRoot}${process.platform === "win32" ? "\\" : "/"}`;
      if (!assetPath.startsWith(normalizedRoot)) {
        sendJson(res, 404, openAiError("Không tìm thấy browser extension asset", "not_found_error"));
        return;
      }
      const contentType = assetName.endsWith(".json")
        ? "application/json; charset=utf-8"
        : assetName.endsWith(".html")
          ? "text/html; charset=utf-8"
          : "text/javascript; charset=utf-8";
      await serveInstallerFile(res, assetPath, contentType);
    } catch (error) {
      jsonLog("browser_extension_download_failed", {
        assetName,
        error: error?.message || String(error)
      });
      sendJson(res, 404, openAiError("Không tìm thấy browser extension asset", "not_found_error"));
    }
    return;
  }

  if (req.method === "GET" && !hasQuery && managedSkillPaths.has(pathname)) {
    try {
      await serveInstallerFile(
        res,
        managedSkillPaths.get(pathname),
        "text/markdown; charset=utf-8"
      );
    } catch (error) {
      jsonLog("installer_skill_download_failed", {
        path: pathname,
        error: error?.message || String(error)
      });
      sendJson(
        res,
        500,
        openAiError("Không thể tải Codex skill", "gateway_error")
      );
    }
    return;
  }

  if (req.method === "GET" && pathname === "/health") {
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

  if (req.method === "GET" && pathname === "/internal/teams") {
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
    (req.method === "GET" && pathname === "/v1/models") ||
    (req.method === "GET" && isCapabilityGetPath(pathname)) ||
    (req.method === "GET" && pathname === "/v1/codex/config") ||
    (req.method === "GET" && pathname === "/v1/codex/installer-config") ||
    (req.method === "GET" && pathname === "/v1/browser/page") ||
    (req.method === "POST" && pathname === "/v1/chat/completions") ||
    (req.method === "POST" && pathname === "/v1/responses") ||
    (req.method === "POST" && pathname === "/v1/browser/page") ||
    (req.method === "POST" && capabilityPostPaths.has(pathname));

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

    const principal = await authenticatePrincipal(rawKey);

    if (!principal) {
      sendJson(
        res,
        401,
        openAiError(
          "API key ch?a ???c ??ng k?",
          "authentication_error"
        )
      );
      return;
    }

    if (!principal.enabled) {
      sendJson(
        res,
        403,
        openAiError("Principal ?? b? v? hi?u h?a", "permission_error")
      );
      return;
    }

    if (!principal.team?.enabled) {
      sendJson(
        res,
        403,
        openAiError("Team ?? b? v? hi?u h?a", "permission_error")
      );
      return;
    }

    jsonLog("auth_principal_resolved", {
      requestId: id,
      principalType: principal.principalType,
      principalId: principal.principalId,
      userId: principal.userId,
      teamId: principal.teamId
    });

    if (req.method === "GET" && pathname === "/v1/codex/config") {
      sendJson(res, 200, codexConfigForPrincipal(principal));
      return;
    }

    if (req.method === "GET" && pathname === "/v1/codex/installer-config") {
      const body = await installerConfigForPrincipal(rawKey, principal, id);
      res.writeHead(200, {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      });
      res.end(body);
      return;
    }

    if (pathname === "/v1/browser/page") {
      await handleBrowserPage(req, res, principal, id);
      return;
    }

    if (req.method === "GET" && pathname === "/v1/models") {
      await proxyModels(req, res, rawKey, principal, id);
      return;
    }

    if ((req.method === "GET" && isCapabilityGetPath(pathname)) ||
        (req.method === "POST" && capabilityPostPaths.has(pathname))) {
      await proxyCapability(
        req,
        res,
        rawKey,
        principal,
        id,
        `${pathname}${parsedUrl.search}`
      );
      return;
    }

    if (pathname === "/v1/responses") {
      await proxyResponses(req, res, rawKey, principal, id);
      return;
    }

    await handleChat(req, res, rawKey, principal, id);
  } catch (error) {
    jsonLog("request_failed", {
      requestId: id,
      error: redactSecrets(error?.message || String(error)),
      code: error?.code || null
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
