#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
function opt(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] || "" : fallback;
}
function has(name) {
  return args.includes(`--${name}`);
}
function usage() {
  console.log(`Usage:
  node scripts/report-user-usage.mjs --date 2026-07-24
  node scripts/report-user-usage.mjs --user sales-ngoc --days 7
  node scripts/report-user-usage.mjs --team SALES --days 30
  node scripts/report-user-usage.mjs --team SALES --days 7 --csv ./reports/sales.csv`);
}
if (has("help") || args.length === 0) {
  usage();
  process.exit(0);
}

const analyticsFile = resolve(opt("file", process.env.USER_ANALYTICS_FILE || "./data/user-analytics.json"));
const usersFile = resolve(opt("users-file", process.env.LTN_USERS_CONFIG_FILE || "./config/users.json"));
const filterUser = opt("user");
const filterTeam = opt("team").toUpperCase();
const filterDate = opt("date");
const csvPath = opt("csv");

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

const analytics = await readJson(analyticsFile, { dailyUsers: {} });
const users = await readJson(usersFile, { users: {} });
let rows = Object.values(analytics.dailyUsers || {});
if (filterUser) rows = rows.filter((row) => row.userId === filterUser);
if (filterTeam) rows = rows.filter((row) => row.teamId === filterTeam);
if (filterDate) rows = rows.filter((row) => row.date === filterDate);

const output = rows.map((row) => {
  const user = users.users?.[row.userId] || {};
  return {
    date: row.date,
    userId: row.userId,
    displayName: user.displayName || row.userId,
    team: row.teamId,
    role: user.role || "",
    requests: row.requests || 0,
    premium: row.premium || 0,
    free: row.free || 0,
    success: row.success || 0,
    errors: row.errors || 0,
    averageLatencyMs: row.averageLatencyMs || 0,
    inputTokens: row.inputTokens || 0,
    outputTokens: row.outputTokens || 0,
    totalTokens: row.totalTokens || 0,
    deviceCount: Object.keys(row.clientIdHashes || {}).length,
    taskCategories: JSON.stringify(row.taskCategories || {}),
    promptQuality: JSON.stringify(row.promptQuality || {}),
    missingContext: JSON.stringify(row.missingContext || {})
  };
});

if (csvPath) {
  const headers = Object.keys(output[0] || {
    date: "", userId: "", displayName: "", team: "", role: "", requests: ""
  });
  const csv = [
    headers.join(","),
    ...output.map((row) => headers.map((key) =>
      JSON.stringify(String(row[key] ?? ""))
    ).join(","))
  ].join("\n") + "\n";
  await mkdir(dirname(resolve(csvPath)), { recursive: true });
  await writeFile(resolve(csvPath), csv, "utf8");
  console.log(`Wrote CSV: ${csvPath}`);
} else {
  console.table(output);
}
