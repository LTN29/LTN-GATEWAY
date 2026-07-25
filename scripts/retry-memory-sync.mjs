#!/usr/bin/env node
import {
  listSyncOutbox,
  retryAllSync
} from "../src/admin/services/admin-sync-service.mjs";

const args = process.argv.slice(2);
function opt(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] || fallback : fallback;
}

if (args.includes("--status")) {
  const outbox = await listSyncOutbox();
  const pending = outbox.filter((item) => item.status === "pending").length;
  const failed = outbox.filter((item) => item.status === "failed").length;
  const synced = outbox.filter((item) => item.status === "synced").length;
  console.log(`pending=${pending} failed=${failed} synced=${synced}`);
} else {
  const result = await retryAllSync({ max: Math.max(1, Number(opt("max", "20")) || 20) });
  console.log(`Processed sync records: ${result.processed}`);
}
