import { randomBytes } from "node:crypto";
import { stdout } from "node:process";
import { createUser } from "../src/admin/services/admin-users-service.mjs";

const apiKey = `ltn_warranty_${randomBytes(32).toString("base64url")}`;

await createUser({
  userId: "warranty-public-chatbot",
  displayName: "Warranty Public Chatbot",
  teamId: "WARRANTY",
  role: "PUBLIC_CHATBOT_SERVICE",
  apiKey,
  memoryMode: "none",
  aiPolicy: {
    mode: "limited_daily",
    premiumLimit: Number(process.env.WARRANTY_CHATBOT_PREMIUM_LIMIT || 200)
  }
});

stdout.write("Đã tạo service principal warranty-public-chatbot với memoryMode=none.\n");
stdout.write("API key chỉ hiển thị một lần. Lưu ngay vào secret store của Warranty:\n");
stdout.write(`${apiKey}\n`);
