import { listDeviceUpdates } from "../../device-update-store.mjs";

const STALE_MS = 24 * 60 * 60 * 1000;

// Compares each device's last report with what the Gateway ships right now.
export function deviceUpdateState(record, manifest, now = Date.now()) {
  const last = Date.parse(record.lastReportAt || "");
  if (!Number.isFinite(last) || now - last > STALE_MS) return "stale";
  if (Array.isArray(record.failed) && record.failed.length) return "failing";
  if (record.fullUpdate?.error) return "failing";
  if (manifest.bundleVersion && record.bundleVersion !== manifest.bundleVersion) return "outdated";
  if (Number(record.installerVersion || 0) < Number(manifest.installerVersion || 0)) return "outdated";
  return "current";
}

export async function updateDevices(query = {}, { now = Date.now(), manifest = null } = {}) {
  const current = manifest || (await import("../../server.mjs")).buildAutoUpdateManifest;
  const shipped = typeof current === "function" ? await current() : current;
  const scoped = Array.isArray(query.teamIds) ? new Set(query.teamIds.map((id) => String(id).toUpperCase())) : null;
  const teamId = String(query.teamId || "").toUpperCase();
  const userId = String(query.userId || "");
  const wanted = String(query.state || "");
  const all = (await listDeviceUpdates())
    .filter((item) => !scoped || scoped.has(String(item.teamId || "").toUpperCase()))
    .filter((item) => !teamId || String(item.teamId || "").toUpperCase() === teamId)
    .filter((item) => !userId || item.userId === userId)
    .map((item) => ({ ...item, state: deviceUpdateState(item, shipped, now) }));
  const summary = { total: all.length, current: 0, outdated: 0, failing: 0, stale: 0 };
  for (const item of all) summary[item.state] += 1;
  const order = { failing: 0, stale: 1, outdated: 2, current: 3 };
  const items = all
    .filter((item) => !wanted || item.state === wanted)
    .sort((a, b) => order[a.state] - order[b.state] || String(b.lastReportAt).localeCompare(String(a.lastReportAt)));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 50));
  const page = Math.max(1, Number(query.page) || 1);
  return {
    shipped: {
      bundleVersion: shipped.bundleVersion || null,
      installerVersion: shipped.installerVersion || 0,
      paused: Boolean(shipped.paused)
    },
    summary,
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize
  };
}
