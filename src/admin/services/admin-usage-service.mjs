import { readFile } from "node:fs/promises";
import { config } from "../../config.mjs";
import { redactSecrets } from "../../utils.mjs";
import { csvEscape, safeTeamId, safeUserId } from "../admin-validation.mjs";

const READ_CACHE_TTL_MS = 1_000;
const MAX_JSON_CACHE_ENTRIES = 10;
const jsonReadCache = new Map();

function setJsonCache(path, value) {
  jsonReadCache.delete(path);
  jsonReadCache.set(path, value);
  while (jsonReadCache.size > MAX_JSON_CACHE_ENTRIES) {
    jsonReadCache.delete(jsonReadCache.keys().next().value);
  }
}

async function readJson(path, fallback) {
  const cached = jsonReadCache.get(path);
  if (cached?.data && Date.now() - cached.loadedAt < READ_CACHE_TTL_MS) return cached.data;
  if (cached?.pending) return cached.pending;

  const pending = readFile(path, "utf8")
    .then((raw) => JSON.parse(raw))
    .catch((error) => {
      if (error?.code === "ENOENT") return fallback;
      throw error;
    })
    .then((data) => {
      setJsonCache(path, { data, loadedAt: Date.now(), pending: null });
      return data;
    })
    .catch((error) => {
      jsonReadCache.delete(path);
      throw error;
    });

  setJsonCache(path, { data: cached?.data || null, loadedAt: cached?.loadedAt || 0, pending });
  return pending;
}

function pageArgs({ page = 1, pageSize = 50 } = {}) {
  const limit = Math.min(100, Math.max(1, Number(pageSize) || 50));
  const currentPage = Math.max(1, Number(page) || 1);
  return { page: currentPage, pageSize: limit, offset: (currentPage - 1) * limit };
}

function inRange(date, from, to) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function analyticsRecords({ dateFrom = "", dateTo = "", from = "", to = "", teamId = "", teamIds = null, userId = "", route = "", success = "" } = {}, analytics) {
  const start = dateFrom || from;
  const end = dateTo || to;
  const scopedTeamIds = Array.isArray(teamIds) ? new Set(teamIds.map((item) => safeTeamId(item))) : null;
  return Object.values(analytics.dailyUsers || {}).filter((item) => {
    if (!inRange(item.date, start, end)) return false;
    if (teamId && item.teamId !== safeTeamId(teamId)) return false;
    if (scopedTeamIds && !scopedTeamIds.has(item.teamId)) return false;
    if (userId && item.userId !== safeUserId(userId)) return false;
    if (route && Number(item[route] || 0) <= 0) return false;
    if (success === "true" && Number(item.success || 0) <= 0) return false;
    if (success === "false" && Number(item.errors || 0) <= 0) return false;
    return true;
  });
}

function mergeMetric(target, record) {
  target.requests += Number(record.requests || 0);
  target.success += Number(record.success || 0);
  target.errors += Number(record.errors || 0);
  target.premium += Number(record.premium || 0);
  target.free += Number(record.free || 0);
  target.test += Number(record.test || 0);
  target.inputTokens += Number(record.inputTokens || 0);
  target.outputTokens += Number(record.outputTokens || 0);
  target.totalTokens += Number(record.totalTokens || 0);
  target.latencyWeighted += Number(record.averageLatencyMs || 0) * Number(record.requests || 0);
  if (record.updatedAt && (!target.lastUsedAt || record.updatedAt > target.lastUsedAt)) target.lastUsedAt = record.updatedAt;
  for (const key of Object.keys(record.clientIdHashes || {})) {
    target.devices.add(key);
  }
}

function emptyMetric(extra = {}) {
  return {
    requests: 0,
    success: 0,
    errors: 0,
    premium: 0,
    free: 0,
    test: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    latencyWeighted: 0,
    averageLatencyMs: 0,
    successRate: 0,
    devices: new Set(),
    lastUsedAt: null,
    ...extra
  };
}

function finalizeMetric(metric) {
  return {
    ...metric,
    devices: metric.devices.size,
    averageLatencyMs: metric.requests ? Math.round(metric.latencyWeighted / metric.requests) : 0,
    successRate: metric.requests ? Math.round((metric.success / metric.requests) * 10000) / 100 : 0,
    latencyWeighted: undefined
  };
}

export async function usageSummary({ from = "", to = "", teamId = "", userId = "" } = {}) {
  const analytics = await readJson(config.userAnalyticsFile, { dailyUsers: {} });
  const records = analyticsRecords({ from, to, teamId, userId }, analytics);
  const summary = {
    requests: 0,
    success: 0,
    errors: 0,
    premium: 0,
    free: 0,
    test: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    averageLatencyMs: 0,
    taskCategories: {},
    promptQuality: {},
    missingContext: {},
    devices: 0
  };
  let latencyWeighted = 0;
  const devices = new Set();
  for (const record of records) {
    summary.requests += Number(record.requests || 0);
    summary.success += Number(record.success || 0);
    summary.errors += Number(record.errors || 0);
    summary.premium += Number(record.premium || 0);
    summary.free += Number(record.free || 0);
    summary.test += Number(record.test || 0);
    summary.inputTokens += Number(record.inputTokens || 0);
    summary.outputTokens += Number(record.outputTokens || 0);
    summary.totalTokens += Number(record.totalTokens || 0);
    latencyWeighted += Number(record.averageLatencyMs || 0) * Number(record.requests || 0);
    for (const [key, value] of Object.entries(record.taskCategories || {})) summary.taskCategories[key] = (summary.taskCategories[key] || 0) + value;
    for (const [key, value] of Object.entries(record.promptQuality || {})) summary.promptQuality[key] = (summary.promptQuality[key] || 0) + value;
    for (const [key, value] of Object.entries(record.missingContext || {})) summary.missingContext[key] = (summary.missingContext[key] || 0) + value;
    for (const key of Object.keys(record.clientIdHashes || {})) devices.add(`${record.userId}:${key}`);
  }
  summary.averageLatencyMs = summary.requests ? Math.round(latencyWeighted / summary.requests) : 0;
  summary.successRate = summary.requests ? Math.round((summary.success / summary.requests) * 10000) / 100 : 0;
  summary.devices = devices.size;
  return summary;
}

export async function usageTimeseries({ from = "", to = "", teamId = "", teamIds = null } = {}) {
  const analytics = await readJson(config.userAnalyticsFile, { dailyUsers: {} });
  const byDate = new Map();
  const scopedTeamIds = Array.isArray(teamIds) ? new Set(teamIds.map((item) => safeTeamId(item))) : null;
  for (const record of Object.values(analytics.dailyUsers || {})) {
    if (!inRange(record.date, from, to) || (teamId && record.teamId !== teamId)) continue;
    if (scopedTeamIds && !scopedTeamIds.has(record.teamId)) continue;
    const item = byDate.get(record.date) || { date: record.date, requests: 0, premium: 0, free: 0, test: 0, errors: 0 };
    item.requests += Number(record.requests || 0);
    item.premium += Number(record.premium || 0);
    item.free += Number(record.free || 0);
    item.test += Number(record.test || 0);
    item.errors += Number(record.errors || 0);
    byDate.set(record.date, item);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function usageUsers(query = {}) {
  const analytics = await readJson(config.userAnalyticsFile, { dailyUsers: {} });
  const grouped = new Map();
  for (const record of analyticsRecords(query, analytics)) {
    const key = record.userId || "unknown";
    const item = grouped.get(key) || emptyMetric({ userId: key, teamId: record.teamId || null });
    mergeMetric(item, record);
    grouped.set(key, item);
  }
  const items = [...grouped.values()].map(finalizeMetric);
  items.sort((a, b) => Number(b.requests) - Number(a.requests) || String(a.userId).localeCompare(String(b.userId)));
  const page = pageArgs(query);
  return { items: items.slice(page.offset, page.offset + page.pageSize), total: items.length, page: page.page, pageSize: page.pageSize };
}

export async function usageUser(userId, query = {}) {
  const result = await usageUsers({ ...query, userId });
  const item = result.items.find((entry) => entry.userId === safeUserId(userId)) || finalizeMetric(emptyMetric({ userId: safeUserId(userId), teamId: null }));
  return item;
}

export async function usageUserErrors(userId, query = {}) {
  const analytics = await readJson(config.userAnalyticsFile, { dailyUsers: {} });
  const id = safeUserId(userId);
  const items = [];
  for (const record of analyticsRecords({ ...query, userId: id }, analytics)) {
    for (const error of Array.isArray(record.recentErrors) ? record.recentErrors : []) {
      items.push({
        occurredAt: error.occurredAt || record.updatedAt || record.date,
        status: Number(error.status) || 0,
        code: redactSecrets(String(error.code || "UPSTREAM_ERROR")),
        message: redactSecrets(String(error.message || "Không có nội dung lỗi.")),
        requestId: String(error.requestId || ""),
        endpoint: String(error.endpoint || ""),
        routeTier: String(error.routeTier || ""),
        selectedCombo: String(error.selectedCombo || ""),
        latencyMs: Math.max(0, Number(error.latencyMs) || 0)
      });
    }
  }
  items.sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));
  const page = pageArgs(query);
  return {
    items: items.slice(page.offset, page.offset + page.pageSize),
    total: items.length,
    page: page.page,
    pageSize: page.pageSize
  };
}

export async function usageTeams(query = {}) {
  const analytics = await readJson(config.userAnalyticsFile, { dailyUsers: {} });
  const grouped = new Map();
  for (const record of analyticsRecords(query, analytics)) {
    const key = record.teamId || "UNKNOWN";
    const item = grouped.get(key) || emptyMetric({ teamId: key, users: new Set() });
    item.users.add(record.userId);
    mergeMetric(item, record);
    grouped.set(key, item);
  }
  const items = [...grouped.values()].map((item) => ({ ...finalizeMetric(item), users: item.users.size }));
  items.sort((a, b) => Number(b.requests) - Number(a.requests) || String(a.teamId).localeCompare(String(b.teamId)));
  const page = pageArgs(query);
  return { items: items.slice(page.offset, page.offset + page.pageSize), total: items.length, page: page.page, pageSize: page.pageSize };
}

export async function usageTeam(teamId, query = {}) {
  const result = await usageTeams({ ...query, teamId });
  const id = safeTeamId(teamId);
  return result.items.find((entry) => entry.teamId === id) || { teamId: id, requests: 0, success: 0, errors: 0, premium: 0, free: 0, test: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, averageLatencyMs: 0, successRate: 0, devices: 0, users: 0, lastUsedAt: null };
}

export async function usageDevices(query = {}) {
  const analytics = await readJson(config.userAnalyticsFile, { dailyUsers: {} });
  const grouped = new Map();
  for (const record of analyticsRecords(query, analytics)) {
    for (const [hash, rawInfo] of Object.entries(record.clientIdHashes || {})) {
      const info = typeof rawInfo === "object" && rawInfo ? rawInfo : { requests: Number(rawInfo || 0) };
      const key = `${record.userId}:${hash}`;
      const item = grouped.get(key) || {
        userId: record.userId,
        teamId: record.teamId,
        clientIdHashPrefix: String(hash).slice(0, 12),
        firstSeenAt: info.firstSeenAt || record.date,
        lastSeenAt: info.lastSeenAt || record.updatedAt || record.date,
        requests: 0,
        warning: null
      };
      item.requests += Number(info.requests || 0);
      if (info.firstSeenAt && info.firstSeenAt < item.firstSeenAt) item.firstSeenAt = info.firstSeenAt;
      if (info.lastSeenAt && info.lastSeenAt > item.lastSeenAt) item.lastSeenAt = info.lastSeenAt;
      grouped.set(key, item);
    }
  }
  const byUser = new Map();
  for (const item of grouped.values()) byUser.set(item.userId, (byUser.get(item.userId) || 0) + 1);
  const items = [...grouped.values()].map((item) => ({
    ...item,
    warning: byUser.get(item.userId) > 3 ? "Nhiều thiết bị dùng cùng user key." : null
  }));
  items.sort((a, b) => String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)));
  const page = pageArgs(query);
  return { items: items.slice(page.offset, page.offset + page.pageSize), total: items.length, page: page.page, pageSize: page.pageSize };
}

export async function usageExport(query = {}) {
  const users = await usageUsers({ ...query, page: 1, pageSize: 100 });
  const rows = [["userId", "teamId", "requests", "premium", "free", "test", "success", "errors", "totalTokens", "averageLatencyMs", "devices", "lastUsedAt"]];
  for (const item of users.items) {
    rows.push([item.userId, item.teamId, item.requests, item.premium, item.free, item.test, item.success, item.errors, item.totalTokens, item.averageLatencyMs, item.devices, item.lastUsedAt || ""]);
  }
  return "\uFEFF" + rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}
