// Tạo tài khoản dịch vụ cho phần mềm Prosper Supply (AI hỗ trợ trang Thống kê bán hàng).
// memoryMode = none: Gateway không chèn và không ghi bộ nhớ COMPANY/TEAM cho request của Prosper (số liệu bán hàng không lọt vào memory).
//
// Cách dùng (trên Mac mini, trong ~/ltn-gateway):
//   1. Tạo key mới trong 9Router, đặt tên PROSPER-AI, gán Combo có Claude Opus 5.5 (Prosper mặc định dùng Opus 5.5, mức suy nghĩ medium).
//   2. node scripts/register-prosper-ai.mjs [TEAM]      (mặc định TEAM = IT)
//      → dán key vừa tạo (ẩn khi gõ).
//   3. Đặt AI_GATEWAY_API_KEY=<key đó> trong .env production của Prosper rồi khởi động lại backend Prosper.
import { stdin as input, stdout as output, env, argv, exit } from "node:process";
import { createUser } from "../src/admin/services/admin-users-service.mjs";

const teamId = (argv[2] || env.PROSPER_AI_TEAM || "IT").trim().toUpperCase();
const premiumLimit = Number(env.PROSPER_AI_PREMIUM_LIMIT || 100);

output.write(`Dán API key 9Router của tài khoản PROSPER-AI rồi Enter (team ${teamId}): `);
const apiKey = await new Promise((resolveKey) => {
  let value = "";
  input.setRawMode?.(true);
  input.resume();
  const onData = (chunk) => {
    const char = chunk.toString("utf8");
    if (char === "\r" || char === "\n") {
      input.off("data", onData);
      input.setRawMode?.(false);
      input.pause();
      output.write("\n");
      resolveKey(value.trim());
    } else if (char === "\u0003") {
      exit(130);
    } else if (char === "\u007f") {
      value = value.slice(0, -1);
    } else {
      value += char;
    }
  };
  input.on("data", onData);
});

await createUser({
  userId: "prosper-ai",
  displayName: "Prosper Supply – AI thống kê bán hàng",
  teamId,
  role: "PROSPER_AI_SERVICE",
  apiKey,
  memoryMode: "none",
  aiPolicy: { mode: "limited_daily", premiumLimit }
});

output.write("Đã tạo tài khoản dịch vụ prosper-ai (memoryMode=none).\n");
output.write("Đặt AI_GATEWAY_API_KEY bằng key vừa dán trong .env của Prosper Supply, rồi khởi động lại backend Prosper.\n");
