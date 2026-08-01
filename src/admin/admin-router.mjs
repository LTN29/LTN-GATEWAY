import { readFile } from "node:fs/promises";
import { extname, join, normalize, relative, resolve } from "node:path";
import { config } from "../config.mjs";
import { readBody } from "../http.mjs";
import { jsonLog, requestId as makeRequestId, redactSecrets } from "../utils.mjs";
import { authenticateAdmin } from "./admin-auth.mjs";
import { issueCsrfToken, verifyCsrfToken } from "./admin-csrf.mjs";
import { requirePermission, visibleTeamIds } from "./admin-rbac.mjs";
import { getAdminAudit, listAdminAudit, writeAdminAudit } from "./admin-audit.mjs";
import { createUser, deleteUser, getUser, importUsersCsv, listUsers, patchUser, rotateUserKey, setUserEnabled, validateUsersCsv } from "./services/admin-users-service.mjs";
import { createTeam, deleteTeam, getTeam, listTeams, patchTeam } from "./services/admin-teams-service.mjs";
import { usageDevices, usageExport, usageSummary, usageTeam, usageTeams, usageTimeseries, usageUser, usageUserErrors, usageUsers } from "./services/admin-usage-service.mjs";
import { approveReviewCandidate, getMemoryFile, getMemoryVersion, getReviewCandidate, listMemoryFiles, listMemoryVersions, listReviewCandidates, readMemoryAudit, rejectReviewCandidate, rollbackMemoryFile } from "./services/admin-memory-service.mjs";
import { listSyncOutbox, retryAllSync, retrySyncItem } from "./services/admin-sync-service.mjs";
import { configSummary, dashboardSummary, systemHealth } from "./services/admin-system-service.mjs";

const rateBuckets = new Map();
const MAX_RATE_BUCKETS = 2_000;

function adminHeaders(extra = {}) {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "content-security-policy": "default-src 'self'; frame-ancestors 'self'",
    ...extra
  };
}

function sendAdminJson(res, status, payload, requestId, headers = {}) {
  const body = Buffer.from(JSON.stringify(payload.ok === false ? { ...payload, requestId } : { ok: true, data: payload, requestId }));
  res.writeHead(status, { ...adminHeaders(headers), "content-length": body.length });
  res.end(body);
}

function sendAdminError(res, status, code, message, requestId, fieldErrors = null) {
  sendAdminJson(res, status, {
    ok: false,
    error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) }
  }, requestId);
}

function hostAllowed(req) {
  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  if (config.adminAllowedHosts.includes(host)) return true;
  if (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(host)) return true;
  return false;
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (origin === config.adminAllowedOrigin) return true;
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

function isWrite(method) {
  return ["POST", "PATCH", "PUT", "DELETE"].includes(method);
}

function rateLimit(admin, kind) {
  const now = Date.now();
  if (rateBuckets.size >= MAX_RATE_BUCKETS) {
    for (const [key, record] of rateBuckets) {
      if (record.expiresAt <= now) rateBuckets.delete(key);
    }
  }
  const minute = Math.floor(Date.now() / 60000);
  const hour = Math.floor(Date.now() / 3600000);
  const limit = kind === "key"
    ? config.adminRateLimitKeyActionPerHour
    : kind === "write"
      ? config.adminRateLimitWritePerMinute
      : config.adminRateLimitReadPerMinute;
  const bucketId = `${admin.email}:${kind}:${kind === "key" ? hour : minute}`;
  const current = rateBuckets.get(bucketId);
  const count = (current?.count || 0) + 1;
  rateBuckets.set(bucketId, {
    count,
    expiresAt: kind === "key" ? (hour + 1) * 3600000 : (minute + 1) * 60000
  });
  if (count > limit) {
    throw Object.assign(new Error("Bạn thao tác quá nhanh, vui lòng thử lại sau."), { statusCode: 429, code: "RATE_LIMITED" });
  }
}

async function parseJsonBody(req) {
  const raw = await readBody(req);
  if (!raw.length) return {};
  try { return JSON.parse(raw.toString("utf8")); }
  catch {
    throw Object.assign(new Error("JSON không hợp lệ."), { statusCode: 400, code: "INVALID_JSON" });
  }
}

function urlParts(req) {
  const url = new URL(req.url, "http://admin.local");
  return { path: url.pathname, query: Object.fromEntries(url.searchParams.entries()) };
}

function scopedQuery(admin, query) {
  const teamIds = visibleTeamIds(admin);
  if (!teamIds) return query;
  if (query.teamId) return query;
  return { ...query, teamIds };
}

async function guardedWrite(req, admin, requestId, action, targetType, targetId, teamId, fn) {
  if (!originAllowed(req)) throw Object.assign(new Error("Origin không được phép."), { statusCode: 403, code: "BAD_ORIGIN" });
  if (!verifyCsrfToken(admin, req.headers["x-ltn-csrf-token"])) {
    throw Object.assign(new Error("CSRF token không hợp lệ hoặc hết hạn."), { statusCode: 403, code: "BAD_CSRF" });
  }
  const result = await fn();
  await writeAdminAudit({ admin, action, targetType, targetId, teamId, result: "success", requestId, req });
  return result;
}

export async function handleAdminApi(req, res) {
  const requestId = makeRequestId(req.headers["x-request-id"]);
  res.setHeader("x-request-id", requestId);
  if (!hostAllowed(req)) {
    sendAdminError(res, 404, "ADMIN_HOST_NOT_ALLOWED", "Admin Console không hoạt động trên hostname này.", requestId);
    return true;
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      ...adminHeaders(),
      "access-control-allow-origin": config.adminAllowedOrigin,
      "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,x-ltn-csrf-token,x-request-id,cf-access-jwt-assertion"
    });
    res.end();
    return true;
  }
  try {
    const admin = await authenticateAdmin(req);
    rateLimit(admin, req.url.includes("rotate-key") || req.url.includes("/import/commit") ? "key" : isWrite(req.method) ? "write" : "read");
    const { path, query } = urlParts(req);
    if (isWrite(req.method)) {
      if (!originAllowed(req)) throw Object.assign(new Error("Origin không được phép."), { statusCode: 403, code: "BAD_ORIGIN" });
      if (!verifyCsrfToken(admin, req.headers["x-ltn-csrf-token"])) {
        throw Object.assign(new Error("CSRF token không hợp lệ hoặc hết hạn."), { statusCode: 403, code: "BAD_CSRF" });
      }
    }
    const body = isWrite(req.method) ? await parseJsonBody(req) : {};

    if (req.method === "GET" && path === "/admin/api/v1/me") {
      sendAdminJson(res, 200, { admin }, requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/csrf") {
      sendAdminJson(res, 200, issueCsrfToken(admin), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/dashboard") {
      requirePermission(admin, "dashboard:read");
      sendAdminJson(res, 200, await dashboardSummary(scopedQuery(admin, query)), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/users") {
      requirePermission(admin, "users:read", { teamId: query.teamId || null });
      const scopedTeams = visibleTeamIds(admin);
      if (scopedTeams && !query.teamId) {
        const merged = [];
        let total = 0;
        for (const teamId of scopedTeams) {
          const result = await listUsers({ ...query, teamId });
          merged.push(...result.items);
          total += result.total;
        }
        sendAdminJson(res, 200, { items: merged, total, limit: merged.length, offset: 0 }, requestId);
      } else {
        sendAdminJson(res, 200, await listUsers(query), requestId);
      }
    } else if (req.method === "POST" && path === "/admin/api/v1/users") {
      requirePermission(admin, "users:write");
      const result = await guardedWrite(req, admin, requestId, "USER_CREATED", "USER", body.userId, body.teamId, () => createUser(body));
      sendAdminJson(res, 201, result, requestId, { "cache-control": "no-store" });
    } else if (req.method === "POST" && path === "/admin/api/v1/users/import/validate") {
      requirePermission(admin, "users:write");
      const validation = await validateUsersCsv(String(body.csv || ""));
      sendAdminJson(res, 200, {
        ...validation,
        preview: validation.preview.map(({ apiKey, ...item }) => item)
      }, requestId);
    } else if (req.method === "POST" && path === "/admin/api/v1/users/import/commit") {
      requirePermission(admin, "users:key");
      const csv = await guardedWrite(req, admin, requestId, "USERS_IMPORTED", "USER", "bulk", null, () => importUsersCsv(String(body.csv || "")));
      const out = Buffer.from(csv);
      res.writeHead(200, {
        ...adminHeaders({
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": 'attachment; filename="ltn-users-imported.csv"'
        }),
        "content-length": out.length
      });
      res.end(out);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+$/.test(path) && req.method === "GET") {
      const userId = decodeURIComponent(path.split("/").at(-1));
      const user = await getUser(userId);
      requirePermission(admin, "users:read", { teamId: user.teamId });
      sendAdminJson(res, 200, user, requestId);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+\/usage$/.test(path) && req.method === "GET") {
      const userId = decodeURIComponent(path.split("/").at(-2));
      const user = await getUser(userId);
      requirePermission(admin, "usage:read", { teamId: user.teamId });
      sendAdminJson(res, 200, await usageUser(userId, query), requestId);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+\/devices$/.test(path) && req.method === "GET") {
      const userId = decodeURIComponent(path.split("/").at(-2));
      const user = await getUser(userId);
      requirePermission(admin, "usage:read", { teamId: user.teamId });
      sendAdminJson(res, 200, await usageDevices({ ...query, userId }), requestId);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+\/errors$/.test(path) && req.method === "GET") {
      const userId = decodeURIComponent(path.split("/").at(-2));
      const user = await getUser(userId);
      requirePermission(admin, "usage:read", { teamId: user.teamId });
      sendAdminJson(res, 200, await usageUserErrors(userId, query), requestId);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+$/.test(path) && req.method === "PATCH") {
      requirePermission(admin, "users:write");
      const userId = decodeURIComponent(path.split("/").at(-1));
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "USER_UPDATED", "USER", userId, body.teamId, () => patchUser(userId, body)), requestId);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+$/.test(path) && req.method === "DELETE") {
      requirePermission(admin, "users:write");
      const userId = decodeURIComponent(path.split("/").at(-1));
      const user = await getUser(userId);
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "USER_DELETED", "USER", userId, user.teamId, () => deleteUser(userId)), requestId);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+\/enable$/.test(path) && req.method === "POST") {
      requirePermission(admin, "users:write");
      const userId = decodeURIComponent(path.split("/").at(-2));
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "USER_ENABLED", "USER", userId, null, () => setUserEnabled(userId, true)), requestId);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+\/disable$/.test(path) && req.method === "POST") {
      requirePermission(admin, "users:write");
      const userId = decodeURIComponent(path.split("/").at(-2));
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "USER_DISABLED", "USER", userId, null, () => setUserEnabled(userId, false)), requestId);
    } else if (/^\/admin\/api\/v1\/users\/[^/]+\/rotate-key$/.test(path) && req.method === "POST") {
      requirePermission(admin, "users:key");
      const userId = decodeURIComponent(path.split("/").at(-2));
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "USER_KEY_ROTATED", "USER", userId, null, () => rotateUserKey(userId, body)), requestId, { "cache-control": "no-store" });
    } else if (req.method === "GET" && path === "/admin/api/v1/teams") {
      requirePermission(admin, "teams:read");
      sendAdminJson(res, 200, { items: await listTeams() }, requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/codex/combos") {
      requirePermission(admin, "teams:read");
      const items = Object.entries(config.codexCombos)
        .map(([key, id]) => ({ key, id: String(id || "").trim() }))
        .filter((item) => item.id)
        .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
      sendAdminJson(res, 200, { items }, requestId);
    } else if (req.method === "POST" && path === "/admin/api/v1/teams") {
      requirePermission(admin, "teams:write");
      const teamId = String(body.teamId || body.code || "").toUpperCase();
      sendAdminJson(res, 201, await guardedWrite(req, admin, requestId, "TEAM_CREATED", "TEAM", teamId, teamId, () => createTeam(body)), requestId);
    } else if (/^\/admin\/api\/v1\/teams\/[^/]+$/.test(path) && req.method === "GET") {
      const teamId = decodeURIComponent(path.split("/").at(-1)).toUpperCase();
      requirePermission(admin, "teams:read", { teamId });
      sendAdminJson(res, 200, await getTeam(teamId), requestId);
    } else if (/^\/admin\/api\/v1\/teams\/[^/]+\/users$/.test(path) && req.method === "GET") {
      const teamId = decodeURIComponent(path.split("/").at(-2)).toUpperCase();
      requirePermission(admin, "users:read", { teamId });
      sendAdminJson(res, 200, await listUsers({ ...query, teamId }), requestId);
    } else if (/^\/admin\/api\/v1\/teams\/[^/]+\/usage$/.test(path) && req.method === "GET") {
      const teamId = decodeURIComponent(path.split("/").at(-2)).toUpperCase();
      requirePermission(admin, "usage:read", { teamId });
      sendAdminJson(res, 200, await usageTeam(teamId, query), requestId);
    } else if (/^\/admin\/api\/v1\/teams\/[^/]+$/.test(path) && req.method === "PATCH") {
      const teamId = decodeURIComponent(path.split("/").at(-1)).toUpperCase();
      requirePermission(admin, "teams:write", { teamId });
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "TEAM_UPDATED", "TEAM", teamId, teamId, () => patchTeam(teamId, body)), requestId);
    } else if (/^\/admin\/api\/v1\/teams\/[^/]+$/.test(path) && req.method === "DELETE") {
      const teamId = decodeURIComponent(path.split("/").at(-1)).toUpperCase();
      requirePermission(admin, "teams:write", { teamId });
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "TEAM_DELETED", "TEAM", teamId, teamId, () => deleteTeam(teamId)), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/usage/summary") {
      requirePermission(admin, "usage:read", { teamId: query.teamId || null });
      sendAdminJson(res, 200, await usageSummary(scopedQuery(admin, query)), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/usage/timeseries") {
      requirePermission(admin, "usage:read", { teamId: query.teamId || null });
      sendAdminJson(res, 200, await usageTimeseries(scopedQuery(admin, query)), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/usage/users") {
      requirePermission(admin, "usage:read", { teamId: query.teamId || null });
      sendAdminJson(res, 200, await usageUsers(scopedQuery(admin, query)), requestId);
    } else if (/^\/admin\/api\/v1\/usage\/users\/[^/]+$/.test(path) && req.method === "GET") {
      requirePermission(admin, "usage:read", { teamId: query.teamId || null });
      sendAdminJson(res, 200, await usageUser(decodeURIComponent(path.split("/").at(-1)), query), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/usage/teams") {
      requirePermission(admin, "usage:read", { teamId: query.teamId || null });
      sendAdminJson(res, 200, await usageTeams(scopedQuery(admin, query)), requestId);
    } else if (/^\/admin\/api\/v1\/usage\/teams\/[^/]+$/.test(path) && req.method === "GET") {
      const teamId = decodeURIComponent(path.split("/").at(-1)).toUpperCase();
      requirePermission(admin, "usage:read", { teamId });
      sendAdminJson(res, 200, await usageTeam(teamId, query), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/usage/devices") {
      requirePermission(admin, "usage:read", { teamId: query.teamId || null });
      sendAdminJson(res, 200, await usageDevices(scopedQuery(admin, query)), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/usage/export") {
      requirePermission(admin, "usage:read", { teamId: query.teamId || null });
      const out = Buffer.from(await usageExport(scopedQuery(admin, query)), "utf8");
      res.writeHead(200, {
        ...adminHeaders({
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": 'attachment; filename="ltn-usage-export.csv"'
        }),
        "content-length": out.length
      });
      res.end(out);
    } else if (req.method === "GET" && path === "/admin/api/v1/memory/review") {
      requirePermission(admin, "memory:read", { teamId: query.teamId || null, scope: query.scope || null });
      sendAdminJson(res, 200, await listReviewCandidates(query), requestId);
    } else if (/^\/admin\/api\/v1\/memory\/review\/[^/]+$/.test(path) && req.method === "GET") {
      sendAdminJson(res, 200, await getReviewCandidate(decodeURIComponent(path.split("/").at(-1))), requestId);
    } else if (/^\/admin\/api\/v1\/memory\/review\/[^/]+\/approve$/.test(path) && req.method === "POST") {
      const id = decodeURIComponent(path.split("/").at(-2));
      const candidate = await getReviewCandidate(id);
      requirePermission(admin, candidate.scope === "COMPANY" ? "memory:approve_company" : "memory:approve_team", { teamId: candidate.sourceTeamId, scope: candidate.scope });
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "MEMORY_APPROVED", "MEMORY_CANDIDATE", id, candidate.sourceTeamId, () => approveReviewCandidate(id, body, admin)), requestId);
    } else if (/^\/admin\/api\/v1\/memory\/review\/[^/]+\/reject$/.test(path) && req.method === "POST") {
      const id = decodeURIComponent(path.split("/").at(-2));
      const candidate = await getReviewCandidate(id);
      requirePermission(admin, "memory:read", { teamId: candidate.sourceTeamId, scope: candidate.scope });
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "MEMORY_REJECTED", "MEMORY_CANDIDATE", id, candidate.sourceTeamId, () => rejectReviewCandidate(id, body, admin)), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/memory/files") {
      requirePermission(admin, "memory:read");
      sendAdminJson(res, 200, await listMemoryFiles({ includeUsers: admin.roles.includes("SUPER_ADMIN") || admin.roles.includes("IT_ADMIN") }), requestId);
    } else if (/^\/admin\/api\/v1\/memory\/files\/[^/]+$/.test(path) && req.method === "GET") {
      requirePermission(admin, "memory:read");
      const file = await getMemoryFile(decodeURIComponent(path.split("/").at(-1)));
      requirePermission(admin, "memory:read", { teamId: file.teamId, scope: file.scope });
      if (file.scope === "USER" && !(admin.roles.includes("SUPER_ADMIN") || admin.roles.includes("IT_ADMIN"))) {
        throw Object.assign(new Error("Bạn không có quyền xem USER memory."), { statusCode: 403, code: "FORBIDDEN" });
      }
      sendAdminJson(res, 200, file, requestId);
    } else if (/^\/admin\/api\/v1\/memory\/files\/[^/]+\/versions$/.test(path) && req.method === "GET") {
      requirePermission(admin, "memory:read");
      const fileId = decodeURIComponent(path.split("/").at(-2));
      const file = await getMemoryFile(fileId);
      requirePermission(admin, "memory:read", { teamId: file.teamId, scope: file.scope });
      if (file.scope === "USER" && !(admin.roles.includes("SUPER_ADMIN") || admin.roles.includes("IT_ADMIN"))) {
        throw Object.assign(new Error("Bạn không có quyền xem USER memory."), { statusCode: 403, code: "FORBIDDEN" });
      }
      sendAdminJson(res, 200, await listMemoryVersions(fileId), requestId);
    } else if (/^\/admin\/api\/v1\/memory\/files\/[^/]+\/versions\/[^/]+$/.test(path) && req.method === "GET") {
      requirePermission(admin, "memory:read");
      const parts = path.split("/");
      const fileId = decodeURIComponent(parts.at(-3));
      const file = await getMemoryFile(fileId);
      requirePermission(admin, "memory:read", { teamId: file.teamId, scope: file.scope });
      if (file.scope === "USER" && !(admin.roles.includes("SUPER_ADMIN") || admin.roles.includes("IT_ADMIN"))) {
        throw Object.assign(new Error("Bạn không có quyền xem USER memory."), { statusCode: 403, code: "FORBIDDEN" });
      }
      sendAdminJson(res, 200, await getMemoryVersion(fileId, decodeURIComponent(parts.at(-1))), requestId);
    } else if (/^\/admin\/api\/v1\/memory\/files\/[^/]+\/rollback$/.test(path) && req.method === "POST") {
      requirePermission(admin, "memory:rollback");
      const fileId = decodeURIComponent(path.split("/").at(-2));
      const file = await getMemoryFile(fileId);
      if (file.scope === "USER" && !(admin.roles.includes("SUPER_ADMIN") || admin.roles.includes("IT_ADMIN"))) {
        throw Object.assign(new Error("Bạn không có quyền rollback USER memory."), { statusCode: 403, code: "FORBIDDEN" });
      }
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "MEMORY_ROLLBACK", "MEMORY_FILE", fileId, null, () => rollbackMemoryFile(fileId, body.versionId, admin)), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/memory/audit") {
      requirePermission(admin, "audit:read");
      sendAdminJson(res, 200, { items: await readMemoryAudit(query) }, requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/audit") {
      requirePermission(admin, "audit:read", { teamId: query.teamId || null });
      sendAdminJson(res, 200, await listAdminAudit(query, admin), requestId);
    } else if (/^\/admin\/api\/v1\/audit\/[^/]+$/.test(path) && req.method === "GET") {
      requirePermission(admin, "audit:read");
      sendAdminJson(res, 200, await getAdminAudit(decodeURIComponent(path.split("/").at(-1)), admin), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/sync") {
      requirePermission(admin, "sync:read");
      sendAdminJson(res, 200, { items: await listSyncOutbox(query) }, requestId);
    } else if (/^\/admin\/api\/v1\/sync\/[^/]+\/retry$/.test(path) && req.method === "POST") {
      requirePermission(admin, "sync:write");
      const id = decodeURIComponent(path.split("/").at(-2));
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "SYNC_RETRIED", "SYNC_ITEM", id, null, () => retrySyncItem(id)), requestId);
    } else if (req.method === "POST" && path === "/admin/api/v1/sync/retry-all") {
      requirePermission(admin, "sync:write");
      sendAdminJson(res, 200, await guardedWrite(req, admin, requestId, "SYNC_RETRY_ALL", "SYNC_ITEM", "all", null, () => retryAllSync(body)), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/system/health") {
      requirePermission(admin, "system:read");
      sendAdminJson(res, 200, await systemHealth(), requestId);
    } else if (req.method === "GET" && path === "/admin/api/v1/system/config-summary") {
      requirePermission(admin, "system:read");
      sendAdminJson(res, 200, await configSummary(), requestId);
    } else {
      sendAdminError(res, 404, "NOT_FOUND", "Không tìm thấy Admin API.", requestId);
    }
  } catch (error) {
    jsonLog("admin_api_failed", {
      requestId,
      method: req.method,
      path: req.url,
      statusCode: error?.statusCode || 500,
      code: error?.code || "ADMIN_INTERNAL_ERROR",
      message: redactSecrets(error?.message || String(error))
    });
    sendAdminError(
      res,
      error?.statusCode || 500,
      error?.code || "ADMIN_INTERNAL_ERROR",
      error?.statusCode ? error.message : "Admin API xử lý thất bại.",
      requestId,
      error?.fieldErrors || null
    );
  }
  return true;
}

export async function handleAdminStatic(req, res) {
  if (!config.adminUiEnabled || !req.url.startsWith("/admin")) return false;
  if (req.url.startsWith("/admin/api/")) return false;
  const requestId = makeRequestId(req.headers["x-request-id"]);
  if (!hostAllowed(req)) {
    sendAdminError(res, 404, "ADMIN_HOST_NOT_ALLOWED", "Admin Console không hoạt động trên hostname này.", requestId);
    return true;
  }
  const url = new URL(req.url, "http://admin.local");
  const relPath = url.pathname === "/admin" || url.pathname === "/admin/"
    ? "index.html"
    : url.pathname.replace(/^\/admin\/?/, "");
  const safe = normalize(relPath).replace(/^(\.\.[\\/])+/, "");
  const target = resolve(config.adminUiDistDir, safe);
  const distRel = relative(config.adminUiDistDir, target);
  const finalPath = !distRel.startsWith("..") && distRel ? target : join(config.adminUiDistDir, "index.html");
  let body;
  let pathUsed = finalPath;
  try {
    body = await readFile(finalPath);
  } catch {
    pathUsed = join(config.adminUiDistDir, "index.html");
    body = await readFile(pathUsed);
  }
  const ext = extname(pathUsed);
  const contentType = ext === ".js" ? "text/javascript; charset=utf-8" : ext === ".css" ? "text/css; charset=utf-8" : "text/html; charset=utf-8";
  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": pathUsed.endsWith("index.html") ? "no-store" : "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff"
  });
  res.end(body);
  return true;
}
