import { config } from "./config.mjs";
import { loadTeamMemory, replaceTeamMemory, enqueueTeamMemoryUpdate } from "./memory.mjs";
import { upstreamFetch } from "./upstream.mjs";
import { redactSecrets, stripCodeFence, jsonLog } from "./utils.mjs";

function latestConversation(messages, assistantText) {
  const useful = [];

  for (const message of messages.slice(-12)) {
    if (!["user", "assistant"].includes(message?.role)) continue;
    if (typeof message.content === "string") {
      useful.push(`${message.role.toUpperCase()}:\n${message.content}`);
    }
  }

  if (assistantText) {
    useful.push(`ASSISTANT:\n${assistantText}`);
  }

  return redactSecrets(useful.join("\n\n")).slice(0, 28_000);
}

export function scheduleMemoryExtraction({
  team,
  rawKey,
  originalMessages,
  assistantText,
  requestId
}) {
  if (!config.memoryUpdateEnabled) return;

  enqueueTeamMemoryUpdate(team, async () => {
    try {
      const current = await loadTeamMemory(team);
      const conversation = latestConversation(originalMessages, assistantText);

      if (!conversation.trim()) return;

      const prompt = [
        {
          role: "system",
          content: [
            `Bạn đang duy trì file kiến thức ngắn gọn cho team ${team.displayName}.`,
            "Chỉ lưu kiến thức có giá trị lâu dài: quyết định đã chốt, quy trình, chính sách, trạng thái quan trọng, lỗi và cách xử lý đã xác nhận.",
            "Không lưu lời chào, câu hỏi tạm thời, nội dung lặp, suy đoán, dữ liệu khách hàng, email cá nhân, số điện thoại, mật khẩu, API key, token hoặc secret.",
            "Giữ file gọn, gom chung, không tạo lịch sử chi tiết.",
            `Giới hạn toàn bộ file dưới ${config.maxMemoryChars} ký tự.`,
            "Nếu cuộc trò chuyện không tạo ra kiến thức bền vững mới, trả về chính xác: NO_UPDATE",
            "Nếu có cập nhật, trả về TOÀN BỘ nội dung Markdown mới để thay thế file hiện tại, không bọc code fence.",
            "Dùng cấu trúc:",
            `# ${team.displayName} TEAM CONTEXT`,
            "",
            "Cập nhật gần nhất: YYYY-MM-DD",
            "",
            "## Ngữ cảnh và kiến thức",
            "- ...",
            "",
            "## Quyết định và quy trình",
            "- ...",
            "",
            "## Việc đang làm",
            "- ..."
          ].join("\n")
        },
        {
          role: "user",
          content: [
            "FILE HIỆN TẠI:",
            current,
            "",
            "CUỘC TRAO ĐỔI MỚI:",
            conversation
          ].join("\n")
        }
      ];

      const response = await upstreamFetch("/v1/chat/completions", {
        method: "POST",
        rawKey,
        requestId: `${requestId}-memory`,
        body: JSON.stringify({
          model: config.memoryModel,
          messages: prompt,
          stream: false,
          temperature: 0.1
        })
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Memory model lỗi ${response.status}: ${text.slice(0, 500)}`);
      }

      const payload = JSON.parse(text);
      const result = stripCodeFence(
        payload?.choices?.[0]?.message?.content || ""
      ).trim();

      if (!result || result === "NO_UPDATE") {
        jsonLog("memory_no_update", { requestId, team: team.code });
        return;
      }

      await replaceTeamMemory(team, result);
      jsonLog("memory_updated", {
        requestId,
        team: team.code,
        chars: result.length
      });
    } catch (error) {
      jsonLog("memory_update_failed", {
        requestId,
        team: team.code,
        error: error?.message || String(error)
      });
    }
  });
}
