#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = process.argv.slice(2);
function opt(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] || "" : fallback;
}
function usage() {
  console.log("Usage: node scripts/generate-user-coaching.mjs --user sales-ngoc --days 7");
}
if (args.includes("--help") || args.length === 0) {
  usage();
  process.exit(0);
}

const userId = opt("user");
if (!userId) {
  usage();
  process.exit(1);
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

const analytics = await readJson(resolve(process.env.USER_ANALYTICS_FILE || "./data/user-analytics.json"), { dailyUsers: {} });
const users = await readJson(resolve(process.env.LTN_USERS_CONFIG_FILE || "./config/users.json"), { users: {} });
const user = users.users?.[userId] || { displayName: userId, teamId: "" };
const rows = Object.values(analytics.dailyUsers || {}).filter((row) => row.userId === userId);

function top(map) {
  return Object.entries(map || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
}

const categories = top(Object.assign({}, ...rows.map((row) => row.taskCategories)));
const missing = top(Object.assign({}, ...rows.map((row) => row.missingContext)));

console.log(`Nhân viên: ${user.displayName || userId}`);
console.log(`Team: ${user.teamId || ""}`);
console.log("");
console.log("Công việc thường dùng AI:");
for (const item of categories.length ? categories : ["other"]) console.log(`- ${item}`);
console.log("");
console.log("Những thông tin thường thiếu:");
for (const item of missing.length ? missing : ["desired_output_format", "tone", "length"]) console.log(`- ${item}`);
console.log("");
console.log("Mẫu câu hỏi đề xuất:");
console.log(`Sản phẩm:
Nhu cầu của khách:
Khách đang phân vân:
Kênh gửi:
Giọng văn:
Độ dài:
Yêu cầu đầu ra:`);
console.log("");
console.log("Ghi chú: báo cáo này chỉ phân tích cách dùng hệ thống và cấu trúc yêu cầu công việc; không dùng để đánh giá năng lực, tính cách hoặc thông tin nhạy cảm.");
