import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { config, loadTeams } from "../../config.mjs";
import { usageSummary } from "./admin-usage-service.mjs";

async function readJsonl(path) {
  try { return (await readFile(path, "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
  catch (error) { if (error?.code === "ENOENT") return []; throw error; }
}

async function dirSize(path) {
  let size = 0;
  for (const name of await readdir(path).catch(() => [])) {
    const full = resolve(path, name);
    const info = await stat(full).catch(() => null);
    if (!info) continue;
    if (info.isDirectory()) size += await dirSize(full);
    else size += info.size;
  }
  return size;
}

export async function configSummary() {
  return {
    adminUiEnabled: config.adminUiEnabled,
    memoryExtractionEnabled: config.memoryExtractionEnabled,
    userMemoryEnabled: config.userMemoryEnabled,
    reviewQueueEnabled: config.memoryReviewQueueEnabled,
    analyticsEnabled: config.userAnalyticsEnabled,
    sharePointMode: config.oneDrive.mode,
    upstreamConfigured: Boolean(config.upstreamBaseUrl),
    cloudflareAccessConfigured: Boolean(config.cloudflareAccessTeamDomain && config.cloudflareAccessAud),
    allowedHosts: config.adminAllowedHosts
  };
}

export async function systemHealth() {
  const teams = await loadTeams({ force: true }).catch(() => ({ byCode: new Map() }));
  const queue = await readJsonl(config.memoryReviewQueueFile);
  const outbox = await readJsonl(config.memorySyncOutboxFile);
  let routerStatus = "unknown";
  try {
    const response = await fetch(`${config.upstreamBaseUrl}/v1/models`, { signal: AbortSignal.timeout(2500) });
    routerStatus = response.ok ? "ok" : `http_${response.status}`;
  } catch {
    routerStatus = "unreachable";
  }
  return {
    gateway: "ok",
    router: routerStatus,
    uptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version,
    teams: teams.byCode.size,
    memoryExtractionEnabled: config.memoryExtractionEnabled,
    userMemoryEnabled: config.userMemoryEnabled,
    reviewQueueEnabled: config.memoryReviewQueueEnabled,
    analyticsEnabled: config.userAnalyticsEnabled,
    sharePointConfigured: config.oneDrive.mode !== "off",
    syncPending: outbox.filter((item) => item.status === "pending").length,
    syncFailed: outbox.filter((item) => item.status === "failed").length,
    memoryPendingTeam: queue.filter((item) => item.status === "pending" && item.scope === "TEAM").length,
    memoryPendingCompany: queue.filter((item) => item.status === "pending" && item.scope === "COMPANY").length,
    diskBytes: await dirSize(resolve("./data")).catch(() => 0)
  };
}

export async function dashboardSummary(query = {}) {
  const usersRaw = await readFile(config.usersFile, "utf8").then(JSON.parse).catch(() => ({ users: {} }));
  let users = Object.values(usersRaw.users || {});
  if (Array.isArray(query.teamIds)) {
    const teamSet = new Set(query.teamIds);
    users = users.filter((user) => teamSet.has(String(user.teamId).toUpperCase()));
  } else if (query.teamId) {
    users = users.filter((user) => String(user.teamId).toUpperCase() === String(query.teamId).toUpperCase());
  }
  const usage = await usageSummary(query);
  const health = await systemHealth();
  return {
    usersTotal: users.length,
    usersEnabled: users.filter((user) => user.enabled !== false).length,
    usersDisabled: users.filter((user) => user.enabled === false).length,
    usage,
    health
  };
}
