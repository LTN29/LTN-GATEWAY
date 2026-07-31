import { chmod, copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config } from "./config.mjs";
import { jsonLog, redactSecrets } from "./utils.mjs";

function emptyStore() {
  return { version: 1, dailyUsers: {} };
}

// Analytics is a small JSON file. Serialize read/modify/write transactions
// in this process so concurrent requests cannot overwrite each other's data.
let analyticsWriteQueue = Promise.resolve();

function dateKey(date, userId) {
  return `${date}|${userId || "legacy-team"}`;
}

function average(previousAverage, previousCount, nextValue) {
  if (!Number.isFinite(nextValue)) return previousAverage || 0;
  return Math.round((((previousAverage || 0) * previousCount) + nextValue) / (previousCount + 1));
}

const MAX_RECENT_ERRORS_PER_USER_DAY = 50;

async function readStore(path) {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || !parsed.dailyUsers || typeof parsed.dailyUsers !== "object") {
      throw new Error("user analytics schema không hợp lệ");
    }
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return emptyStore();
    try {
      const backup = `${path}.corrupt-${Date.now()}`;
      await copyFile(path, backup);
      jsonLog("user_analytics_corrupt_backup", { backup });
    } catch (backupError) {
      jsonLog("user_analytics_corrupt_backup_failed", {
        error: redactSecrets(backupError?.message || String(backupError))
      });
    }
    jsonLog("user_analytics_read_failed", {
      error: redactSecrets(error?.message || String(error))
    });
    throw error;
  }
}

async function writeStore(path, store) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2) + "\n", "utf8");
  if (process.platform !== "win32") {
    await chmod(tmp, 0o600);
    await rename(tmp, path);
    await chmod(path, 0o600);
    return;
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await copyFile(tmp, path);
      await rm(tmp, { force: true });
      return;
    } catch (error) {
      if (!["EPERM", "EBUSY", "EACCES"].includes(error?.code) || attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }
}

export async function recordUserAnalytics({
  date,
  principal,
  routeTier,
  selectedCombo,
  status,
  latencyMs,
  usage = null,
  analytics = null,
  clientIdHashPrefix = null,
  errorDetail = null
}) {
  if (!config.userAnalyticsEnabled || !principal?.userId) return;

  analyticsWriteQueue = analyticsWriteQueue
    .catch(() => undefined)
    .then(() => recordUserAnalyticsTransaction({
      date,
      principal,
      routeTier,
      selectedCombo,
      status,
      latencyMs,
      usage,
      analytics,
      clientIdHashPrefix,
      errorDetail
    }));
  return analyticsWriteQueue;
}

async function recordUserAnalyticsTransaction({
  date,
  principal,
  routeTier,
  selectedCombo,
  status,
  latencyMs,
  usage,
  analytics,
  clientIdHashPrefix,
  errorDetail
}) {
  try {
    const store = await readStore(config.userAnalyticsFile);
    const key = dateKey(date, principal.userId);
    const record = store.dailyUsers[key] || {
      date,
      userId: principal.userId,
      teamId: principal.teamId,
      requests: 0,
      success: 0,
      errors: 0,
      premium: 0,
      free: 0,
      test: 0,
      averageLatencyMs: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      taskCategories: {},
      promptQuality: {},
      missingContext: {},
      clientIdHashes: {},
      models: {},
      recentErrors: []
    };

    const previousCount = record.requests;
    record.requests += 1;
    if (status >= 200 && status < 300) record.success += 1;
    else record.errors += 1;
    if (routeTier === "premium") record.premium += 1;
    if (routeTier === "free") record.free += 1;
    if (routeTier === "test") record.test = Number(record.test || 0) + 1;
    record.averageLatencyMs = average(record.averageLatencyMs, previousCount, latencyMs);
    if (usage) {
      record.inputTokens += Number(usage.input_tokens || usage.prompt_tokens || 0);
      record.outputTokens += Number(usage.output_tokens || usage.completion_tokens || 0);
      record.totalTokens += Number(usage.total_tokens || 0);
    }
    if (analytics?.taskCategory) {
      record.taskCategories[analytics.taskCategory] =
        (record.taskCategories[analytics.taskCategory] || 0) + 1;
    } else {
      record.taskCategories.other = (record.taskCategories.other || 0) + 1;
    }
    if (analytics?.promptQuality) {
      record.promptQuality[analytics.promptQuality] =
        (record.promptQuality[analytics.promptQuality] || 0) + 1;
    }
    for (const item of analytics?.missingContext || []) {
      record.missingContext[item] = (record.missingContext[item] || 0) + 1;
    }
    if (clientIdHashPrefix) {
      record.clientIdHashes[clientIdHashPrefix] =
        (record.clientIdHashes[clientIdHashPrefix] || 0) + 1;
    }
    if (selectedCombo) {
      record.models[selectedCombo] = (record.models[selectedCombo] || 0) + 1;
    }
    if (status < 200 || status >= 300) {
      if (!Array.isArray(record.recentErrors)) record.recentErrors = [];
      const safeError = errorDetail && typeof errorDetail === "object" ? errorDetail : {};
      record.recentErrors.push({
        occurredAt: new Date().toISOString(),
        status: Number(status) || 0,
        code: redactSecrets(String(safeError.code || "UPSTREAM_ERROR")).slice(0, 120),
        message: redactSecrets(String(safeError.message || `Yêu cầu thất bại với HTTP ${status}.`)).slice(0, 1000),
        requestId: String(safeError.requestId || "").slice(0, 128),
        endpoint: String(safeError.endpoint || "").slice(0, 160),
        routeTier: String(routeTier || "").slice(0, 40),
        selectedCombo: String(selectedCombo || "").slice(0, 160),
        latencyMs: Math.max(0, Number(latencyMs) || 0)
      });
      if (record.recentErrors.length > MAX_RECENT_ERRORS_PER_USER_DAY) {
        record.recentErrors.splice(0, record.recentErrors.length - MAX_RECENT_ERRORS_PER_USER_DAY);
      }
    }
    record.updatedAt = new Date().toISOString();
    store.dailyUsers[key] = record;
    await writeStore(config.userAnalyticsFile, store);
    jsonLog("user_analytics_recorded", {
      userId: principal.userId,
      teamId: principal.teamId,
      route: routeTier
    });
  } catch (error) {
    jsonLog("user_analytics_record_failed", {
      userId: principal?.userId,
      teamId: principal?.teamId,
      error: redactSecrets(error?.message || String(error))
    });
  }
}
