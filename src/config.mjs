import { resolve, basename } from "node:path";
import { readFile } from "node:fs/promises";

function bool(value, fallback = false) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

export const config = {
  port: Number(process.env.PORT || 20129),
  host: process.env.HOST || "0.0.0.0",
  upstreamBaseUrl: String(
    process.env.UPSTREAM_BASE_URL || "http://127.0.0.1:20128"
  ).replace(/\/+$/, ""),
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS || 180000),
  memoryModel: process.env.MEMORY_MODEL || "mmf/mimo-auto",
  codexCombos: {
    auto: process.env.CODEX_COMBO_AUTO || "",
    fast: process.env.CODEX_COMBO_FAST || "",
    default: process.env.CODEX_COMBO_DEFAULT || "",
    power: process.env.CODEX_COMBO_POWER || ""
  },
  teamsFile: resolve(process.env.TEAMS_FILE || "./config/teams.json"),
  memoryDir: resolve(process.env.MEMORY_DIR || "./memory"),
  maxBodyBytes: Number(process.env.MAX_BODY_BYTES || 4_000_000),
  maxContextChars: Number(process.env.MAX_CONTEXT_CHARS || 24_000),
  maxCaptureBytes: Number(process.env.MAX_CAPTURE_BYTES || 8_000_000),
  maxMemoryChars: Number(process.env.MAX_MEMORY_CHARS || 16_000),
  memoryUpdateEnabled: bool(process.env.MEMORY_UPDATE_ENABLED, true),
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || "*",
  adminToken: process.env.ADMIN_TOKEN || "",
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
  byHash: new Map(),
  byCode: new Map()
};

export async function loadTeams({ force = false } = {}) {
  if (!force && teamsCache.byHash.size && Date.now() - teamsCache.loadedAt < 10_000) {
    return teamsCache;
  }

  const raw = await readFile(config.teamsFile, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.teams)) {
    throw new Error("config/teams.json phải có thuộc tính teams là một mảng");
  }

  const byHash = new Map();
  const byCode = new Map();

  for (const item of parsed.teams) {
    const code = String(item.code || "").trim().toUpperCase();
    const keyHash = String(item.keyHash || "").trim().toLowerCase();
    const memoryFile = basename(String(item.memoryFile || `${code}.md`));
    const enabled = item.enabled !== false;

    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
      throw new Error(`Team code không hợp lệ: ${item.code}`);
    }
    if (!/^[a-f0-9]{64}$/.test(keyHash)) {
      throw new Error(`keyHash không hợp lệ của team ${code}`);
    }
    if (byHash.has(keyHash)) {
      throw new Error(`Trùng keyHash ở team ${code}`);
    }
    if (byCode.has(code)) {
      throw new Error(`Trùng team code ${code}`);
    }

    const team = {
      code,
      keyHash,
      memoryFile,
      displayName: String(item.displayName || code),
      enabled
    };

    byHash.set(keyHash, team);
    byCode.set(code, team);
  }

  teamsCache = {
    loadedAt: Date.now(),
    byHash,
    byCode
  };

  return teamsCache;
}
