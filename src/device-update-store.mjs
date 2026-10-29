// Latest auto-update report per device. Small JSON file, one record per
// user (or legacy team key) + hashed client ID. No file contents, prompts or
// keys are stored: only versions, timestamps and short error messages.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config } from "./config.mjs";
import { redactSecrets } from "./utils.mjs";

const MAX_DEVICES = 20_000;
let writeQueue = Promise.resolve();

function emptyStore() {
  return { version: 1, devices: {} };
}

async function readStore(path = config.deviceUpdatesFile) {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    if (parsed?.version === 1 && parsed.devices && typeof parsed.devices === "object") return parsed;
  } catch (error) {
    if (error?.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
  }
  return emptyStore();
}

async function writeStore(store, path = config.deviceUpdatesFile) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, JSON.stringify(store, null, 2), { mode: 0o600 });
  await rename(temporary, path);
}

const shortText = (value, max) => redactSecrets(String(value ?? "")).replace(/[\r\n\t]+/g, " ").slice(0, max);
const TARGET_RE = /^[\w./-]{1,120}$/;

// Validates the client body; throws a 400 error on malformed input.
export function normalizeUpdateReport(body) {
  const fail = (message) => Object.assign(new Error(message), { statusCode: 400, type: "invalid_request_error" });
  if (!body || typeof body !== "object" || Array.isArray(body)) throw fail("Báo cáo cập nhật không hợp lệ.");
  const bundleVersion = String(body.bundleVersion || "");
  if (bundleVersion && !/^[a-f0-9]{16,64}$/.test(bundleVersion)) throw fail("bundleVersion không hợp lệ.");
  const installerVersion = Number(body.installerVersion || 0);
  if (!Number.isInteger(installerVersion) || installerVersion < 0 || installerVersion > 10_000) throw fail("installerVersion không hợp lệ.");
  const platform = ["win32", "darwin", "linux"].includes(body.platform) ? body.platform : "other";
  const checkedAt = Number.isFinite(Date.parse(body.checkedAt)) ? new Date(body.checkedAt).toISOString() : null;
  const targets = (list) => (Array.isArray(list) ? list : []).slice(0, 50)
    .map((item) => String(typeof item === "object" ? item?.target : item || ""))
    .filter((target) => TARGET_RE.test(target));
  const failed = (Array.isArray(body.failed) ? body.failed : []).slice(0, 50).map((item) => ({
    target: TARGET_RE.test(String(item?.target || "")) ? String(item.target) : "",
    error: shortText(item?.error, 200)
  }));
  const fullUpdate = body.fullUpdate && typeof body.fullUpdate === "object"
    ? {
        attemptedAt: Number.isFinite(Date.parse(body.fullUpdate.attemptedAt)) ? new Date(body.fullUpdate.attemptedAt).toISOString() : null,
        exitCode: Number.isInteger(body.fullUpdate.exitCode) ? body.fullUpdate.exitCode : null,
        error: body.fullUpdate.error ? shortText(body.fullUpdate.error, 300) : null
      }
    : null;
  return {
    bundleVersion: bundleVersion || null,
    installerVersion,
    platform,
    checkedAt,
    updated: targets(body.updated),
    failed,
    fullUpdate,
    error: body.error ? shortText(body.error, 300) : null
  };
}

export function deviceKey(principal, clientIdHash) {
  const owner = principal.userId || `team:${principal.team?.code || principal.principalId}`;
  return `${owner}|${clientIdHash}`;
}

// minimal=true (IT "outside control" accounts) keeps only version state.
export async function recordUpdateReport(principal, clientIdHash, report, { minimal = false, now = new Date() } = {}) {
  const run = writeQueue.then(async () => {
    const store = await readStore();
    const key = deviceKey(principal, clientIdHash);
    const previous = store.devices[key] || {};
    const record = {
      userId: principal.userId || null,
      teamId: principal.team?.code || null,
      clientIdHashPrefix: clientIdHash.slice(0, 12),
      firstReportAt: previous.firstReportAt || now.toISOString(),
      lastReportAt: now.toISOString(),
      bundleVersion: report.bundleVersion || previous.bundleVersion || null,
      installerVersion: report.installerVersion,
      platform: report.platform,
      minimal
    };
    if (!minimal) {
      Object.assign(record, {
        checkedAt: report.checkedAt,
        lastUpdatedAt: report.updated.length ? now.toISOString() : previous.lastUpdatedAt || null,
        updated: report.updated,
        failed: report.failed,
        fullUpdate: report.fullUpdate,
        error: report.error
      });
    }
    store.devices[key] = record;
    const keys = Object.keys(store.devices);
    if (keys.length > MAX_DEVICES) {
      keys.sort((a, b) => String(store.devices[a].lastReportAt).localeCompare(String(store.devices[b].lastReportAt)));
      for (const old of keys.slice(0, keys.length - MAX_DEVICES)) delete store.devices[old];
    }
    await writeStore(store);
    return record;
  });
  writeQueue = run.catch(() => {});
  return run;
}

export async function listDeviceUpdates() {
  const store = await readStore();
  return Object.values(store.devices);
}
