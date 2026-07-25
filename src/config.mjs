import { resolve, relative, sep } from "node:path";
import { readFile } from "node:fs/promises";

function bool(value, fallback = false) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePolicyMode(value, fallback = "inherit") {
  const mode = String(value || fallback).trim().toLowerCase();
  if (["premium_always", "limited_daily", "free_only", "inherit"].includes(mode)) {
    return mode;
  }
  throw new Error(`aiPolicy.mode không hợp lệ: ${value}`);
}

function normalizeUsageScope(value, fallback = "client") {
  const scope = String(value || fallback).trim().toLowerCase();
  if (["client", "team", "user"].includes(scope)) return scope;
  throw new Error(`aiPolicy.usageScope không hợp lệ: ${value}`);
}

export const config = {
  port: Number(process.env.PORT || 20129),
  host: process.env.HOST || "0.0.0.0",
  upstreamBaseUrl: String(
    process.env.UPSTREAM_BASE_URL || "http://127.0.0.1:20128"
  ).replace(/\/+$/, ""),
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS || 180000),
  memoryModel: process.env.MEMORY_MODEL || "mmf/mimo-auto",
  memoryExtractionEnabled: bool(process.env.MEMORY_EXTRACTION_ENABLED, true),
  memoryExtractionModel: process.env.MEMORY_EXTRACTION_MODEL || process.env.MEMORY_MODEL || "SIMI-FREE",
  memoryExtractionTimeoutMs: number(process.env.MEMORY_EXTRACTION_TIMEOUT_MS || 15000, 15000),
  memoryExtractionMinConfidence: number(process.env.MEMORY_EXTRACTION_MIN_CONFIDENCE || 0.8, 0.8),
  codexCombos: {
    premium: process.env.CODEX_COMBO_PREMIUM || "",
    free: process.env.CODEX_COMBO_FREE || ""
  },
  codexDefaultPolicy: normalizePolicyMode(
    process.env.CODEX_DEFAULT_POLICY || "limited_daily",
    "limited_daily"
  ),
  codexDefaultPremiumLimit: number(
    process.env.CODEX_DEFAULT_PREMIUM_LIMIT || 3,
    3
  ),
  codexUsageTimezone: process.env.CODEX_USAGE_TIMEZONE || "Asia/Ho_Chi_Minh",
  codexUsageFile: resolve(
    process.env.CODEX_USAGE_FILE || "./data/codex-usage.json"
  ),
  codexUsageRetentionDays: number(
    process.env.CODEX_USAGE_RETENTION_DAYS || 60,
    60
  ),
  codexUsageReservationTtlMs: number(
    process.env.CODEX_USAGE_RESERVATION_TTL_MS ||
      Math.max(Number(process.env.UPSTREAM_TIMEOUT_MS || 180000) + 60_000, 300_000),
    300_000
  ),
  codexUsageLockTimeoutMs: number(
    process.env.CODEX_USAGE_LOCK_TIMEOUT_MS || 5000,
    5000
  ),
  codexUsageLockStaleMs: number(
    process.env.CODEX_USAGE_LOCK_STALE_MS || 120_000,
    120_000
  ),
  codexRoutingEnabled: bool(process.env.CODEX_ROUTING_ENABLED, true),
  get legacyTeamKeysEnabled() {
    return bool(process.env.LTN_LEGACY_TEAM_KEYS_ENABLED, false);
  },
  get teamsFile() {
    return resolve(process.env.TEAMS_FILE || "./config/teams.json");
  },
  get usersFile() {
    return resolve(process.env.LTN_USERS_CONFIG_FILE || "./config/users.json");
  },
  get memoryDir() {
    return resolve(process.env.MEMORY_DIR || "./memory");
  },
  userMemoryEnabled: bool(process.env.USER_MEMORY_ENABLED, true),
  userMemoryAutoUpdate: bool(process.env.USER_MEMORY_AUTO_UPDATE, true),
  userMemoryAutoUpdateMinConfidence: number(
    process.env.USER_MEMORY_AUTO_UPDATE_MIN_CONFIDENCE || 0.9,
    0.9
  ),
  teamMemoryEnabled: bool(process.env.TEAM_MEMORY_ENABLED, true),
  teamMemoryAutoUpdate: bool(process.env.TEAM_MEMORY_AUTO_UPDATE, false),
  companyMemoryEnabled: bool(process.env.COMPANY_MEMORY_ENABLED, true),
  companyMemoryAutoUpdate: bool(process.env.COMPANY_MEMORY_AUTO_UPDATE, false),
  memoryReviewQueueEnabled: bool(process.env.MEMORY_REVIEW_QUEUE_ENABLED, true),
  memoryReviewQueueFile: resolve(
    process.env.MEMORY_REVIEW_QUEUE_FILE || "./data/memory-review-queue.jsonl"
  ),
  memoryAuditFile: resolve(process.env.MEMORY_AUDIT_FILE || "./data/memory-audit.jsonl"),
  memorySyncOutboxFile: resolve(
    process.env.MEMORY_SYNC_OUTBOX_FILE || "./data/memory-sync-outbox.jsonl"
  ),
  memoryBackupDir: resolve(process.env.MEMORY_BACKUP_DIR || "./data/memory-backups"),
  userAnalyticsEnabled: bool(process.env.USER_ANALYTICS_ENABLED, true),
  userAnalyticsFile: resolve(
    process.env.USER_ANALYTICS_FILE || "./data/user-analytics.json"
  ),
  userUsageFile: resolve(process.env.USER_USAGE_FILE || "./data/user-usage.json"),
  memoryMaxFileBytes: number(process.env.MEMORY_MAX_FILE_BYTES || 262144, 262144),
  memoryBackupLimit: number(process.env.MEMORY_BACKUP_LIMIT || 20, 20),
  maxBodyBytes: Number(process.env.MAX_BODY_BYTES || 4_000_000),
  maxContextChars: Number(process.env.MAX_CONTEXT_CHARS || 24_000),
  maxCaptureBytes: Number(process.env.MAX_CAPTURE_BYTES || 8_000_000),
  maxMemoryChars: Number(process.env.MAX_MEMORY_CHARS || 16_000),
  memoryUpdateEnabled: bool(process.env.MEMORY_UPDATE_ENABLED, true),
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || "*",
  adminToken: process.env.ADMIN_TOKEN || "",
  adminUiEnabled: bool(process.env.ADMIN_UI_ENABLED, false),
  adminUiDistDir: resolve(process.env.ADMIN_UI_DIST_DIR || "./admin-ui/dist"),
  adminAllowedHosts: String(process.env.ADMIN_ALLOWED_HOSTS || "admin-simi.simi.vn")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  adminAllowedOrigin: process.env.ADMIN_ALLOWED_ORIGIN || "https://admin-simi.simi.vn",
  adminConfigFile: resolve(process.env.ADMIN_CONFIG_FILE || "./config/admins.json"),
  adminAuditFile: resolve(process.env.ADMIN_AUDIT_FILE || "./data/admin-audit.jsonl"),
  cloudflareAccessTeamDomain: process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN || "",
  cloudflareAccessAud: process.env.CLOUDFLARE_ACCESS_AUD || "",
  cloudflareAccessJwksFile: process.env.CLOUDFLARE_ACCESS_JWKS_FILE || "",
  adminCsrfTtlSeconds: number(process.env.ADMIN_CSRF_TTL_SECONDS || 1800, 1800),
  adminRateLimitReadPerMinute: number(process.env.ADMIN_RATE_LIMIT_READ_PER_MINUTE || 120, 120),
  adminRateLimitWritePerMinute: number(process.env.ADMIN_RATE_LIMIT_WRITE_PER_MINUTE || 30, 30),
  adminRateLimitKeyActionPerHour: number(process.env.ADMIN_RATE_LIMIT_KEY_ACTION_PER_HOUR || 20, 20),
  oneDrive: {
    mode: (process.env.ONEDRIVE_MODE || "off").toLowerCase(),
    localDir: process.env.ONEDRIVE_LOCAL_DIR || "",
    tenantId: process.env.MS_TENANT_ID || "",
    clientId: process.env.MS_CLIENT_ID || "",
    clientSecret: process.env.MS_CLIENT_SECRET || "",
    driveId: process.env.ONEDRIVE_DRIVE_ID || "",
    folder: process.env.ONEDRIVE_FOLDER || "LTN-AI-Memory"
  }
};

let teamsCache = {
  loadedAt: 0,
  path: "",
  byHash: new Map(),
  byCode: new Map()
};

let usersCache = {
  loadedAt: 0,
  path: "",
  byHash: new Map(),
  byId: new Map()
};

function safeRelativeMemoryFile(value, label) {
  const raw = String(value || "").trim().replaceAll("\\", "/");
  if (!raw || raw.includes("\0") || /[\r\n]/.test(raw)) {
    throw new Error(`${label} không hợp lệ`);
  }
  const target = resolve(config.memoryDir, raw);
  const rel = relative(config.memoryDir, target);
  if (!rel || rel.startsWith("..") || rel.includes(`..${sep}`)) {
    throw new Error(`${label} phải nằm trong thư mục memory`);
  }
  return raw;
}

export function normalizeAiPolicy(value, fallbackUsageScope = "client") {
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("aiPolicy phải là object");
  }

  const policy = {
    mode: normalizePolicyMode(value.mode || "inherit"),
    usageScope: normalizeUsageScope(value.usageScope || fallbackUsageScope)
  };

  if (value.premiumLimit !== undefined && value.premiumLimit !== null && value.premiumLimit !== "") {
    const premiumLimit = Number(value.premiumLimit);
    if (!Number.isInteger(premiumLimit) || premiumLimit < 0 || premiumLimit > 10_000) {
      throw new Error("aiPolicy.premiumLimit không hợp lệ");
    }
    policy.premiumLimit = premiumLimit;
  }

  if (value.premiumCombo !== undefined && value.premiumCombo !== null) {
    policy.premiumCombo = String(value.premiumCombo).trim();
  }
  if (value.freeCombo !== undefined && value.freeCombo !== null) {
    policy.freeCombo = String(value.freeCombo).trim();
  }

  return policy;
}

export async function loadTeams({ force = false } = {}) {
  const teamsFile = config.teamsFile;
  if (!force && teamsCache.path === teamsFile && teamsCache.loadedAt && Date.now() - teamsCache.loadedAt < 10_000) {
    return teamsCache;
  }

  const raw = await readFile(teamsFile, "utf8");
  const parsed = JSON.parse(raw);
  const entries = Array.isArray(parsed.teams)
    ? parsed.teams.map((item) => [item.code, item])
    : Object.entries(parsed.teams || {}).map(([code, item]) => [code, { ...item, code }]);

  if (!entries.length) {
    throw new Error("config/teams.json phải có danh sách teams hợp lệ");
  }

  const byHash = new Map();
  const byCode = new Map();

  for (const [, item] of entries) {
    const code = String(item.code || "").trim().toUpperCase();
    const keyHash = String(item.keyHash || "").trim().toLowerCase();
    const enabled = item.enabled !== false;

    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
      throw new Error(`Team code không hợp lệ: ${item.code}`);
    }
    if (keyHash && !/^[a-f0-9]{64}$/.test(keyHash)) {
      throw new Error(`keyHash không hợp lệ của team ${code}`);
    }
    if (config.legacyTeamKeysEnabled && !keyHash) {
      throw new Error(`Team ${code} thiếu keyHash trong khi LTN_LEGACY_TEAM_KEYS_ENABLED=true`);
    }
    if (keyHash && byHash.has(keyHash)) {
      throw new Error(`Trùng keyHash ở team ${code}`);
    }
    if (byCode.has(code)) {
      throw new Error(`Trùng team code ${code}`);
    }

    const team = {
      code,
      teamId: code,
      keyHash,
      memoryFile: safeRelativeMemoryFile(
        item.memoryFile || `${code}.md`,
        `memoryFile của team ${code}`
      ),
      displayName: String(item.displayName || code),
      enabled,
      aiPolicy: normalizeAiPolicy(item.aiPolicy, "user")
    };

    if (keyHash) byHash.set(keyHash, team);
    byCode.set(code, team);
  }

  teamsCache = { loadedAt: Date.now(), path: teamsFile, byHash, byCode };
  return teamsCache;
}

export async function loadUsers({ force = false } = {}) {
  const usersFile = config.usersFile;
  if (!force && usersCache.path === usersFile && usersCache.loadedAt && Date.now() - usersCache.loadedAt < 10_000) {
    return usersCache;
  }

  const teams = await loadTeams({ force });
  let raw = "";
  try {
    raw = await readFile(usersFile, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      usersCache = { loadedAt: Date.now(), path: usersFile, byHash: new Map(), byId: new Map() };
      return usersCache;
    }
    throw error;
  }

  const parsed = JSON.parse(raw);
  if (parsed.version !== undefined && parsed.version !== 1) {
    throw new Error("config/users.json version không hợp lệ");
  }
  if (!parsed.users || typeof parsed.users !== "object" || Array.isArray(parsed.users)) {
    throw new Error("config/users.json phải có object users");
  }

  const byHash = new Map();
  const byId = new Map();

  for (const [rawUserId, item] of Object.entries(parsed.users)) {
    const userId = String(rawUserId || "").trim();
    if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(userId)) {
      throw new Error(`userId không hợp lệ: ${rawUserId}`);
    }
    const keyHash = String(item.keyHash || "").trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(keyHash)) {
      throw new Error(`keyHash không hợp lệ của user ${userId}`);
    }
    if (byHash.has(keyHash)) {
      throw new Error(`Trùng keyHash ở user ${userId}`);
    }
    if (teams.byHash.has(keyHash)) {
      throw new Error(`keyHash của user ${userId} trùng legacy team keyHash`);
    }
    const teamId = String(item.teamId || item.team || "").trim().toUpperCase();
    const team = teams.byCode.get(teamId);
    if (!team) throw new Error(`teamId của user ${userId} không tồn tại`);
    if (!team.enabled) throw new Error(`Team ${teamId} của user ${userId} đang disabled`);
    if (item.enabled !== undefined && typeof item.enabled !== "boolean") {
      throw new Error(`enabled của user ${userId} phải là boolean`);
    }

    const user = {
      principalType: "user",
      principalId: userId,
      userId,
      teamId,
      team,
      keyHash,
      displayName: String(item.displayName || userId),
      role: item.role ? String(item.role) : null,
      enabled: item.enabled !== false,
      memoryFile: safeRelativeMemoryFile(
        item.memoryFile || `users/${teamId}/${userId}.md`,
        `memoryFile của user ${userId}`
      ),
      aiPolicy: normalizeAiPolicy(item.aiPolicy || { mode: "inherit" }, "user")
    };

    byHash.set(keyHash, user);
    byId.set(userId, user);
  }

  usersCache = { loadedAt: Date.now(), path: usersFile, byHash, byId };
  return usersCache;
}
