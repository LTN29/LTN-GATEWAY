// Số liệu công cụ cho mỗi lượt /v1/responses (chỉ tên + kích thước, KHÔNG ghi nội dung):
// - toolResults: kết quả công cụ app vừa gửi lên (bước trước gọi công cụ gì, trả về bao nhiêu chữ / ảnh)
// - toolCalls: model ở lượt này yêu cầu gọi công cụ gì tiếp
// Ghép với khoảng thời gian giữa 2 lượt liên tiếp của cùng người → biết công cụ nào chậm, công cụ nào làm phình ngữ cảnh.

const CALL_TYPES = new Set(["function_call", "custom_tool_call", "computer_call", "local_shell_call", "web_search_call", "file_search_call", "image_generation_call", "code_interpreter_call", "mcp_call"]);
const MAX_ITEMS = 8;

function callName(item) {
  if (!item || typeof item !== "object") return "";
  const base = item.name || item.action?.type || item.type || "";
  return String(item.namespace ? `${item.namespace}.${base}` : base).slice(0, 80);
}

function isImage(part) {
  return part && typeof part === "object" && ["input_image", "image", "image_url"].includes(part.type);
}

function outputSize(output) {
  if (typeof output === "string") return { chars: output.length, images: 0 };
  if (!Array.isArray(output)) return { chars: output ? JSON.stringify(output).length : 0, images: 0 };
  let chars = 0; let images = 0;
  for (const part of output) {
    if (isImage(part)) images += 1;
    else if (typeof part === "string") chars += part.length;
    else chars += String(part?.text ?? part?.input_text ?? part?.output_text ?? "").length;
  }
  return { chars, images };
}

// Kết quả công cụ ở CUỐI input (các *_output sau tin nhắn cuối) – đây là những gì vừa chạy xong trên máy người dùng.
export function trailingToolResults(input) {
  if (!Array.isArray(input)) return [];
  const names = new Map();
  for (const item of input) {
    if (item && CALL_TYPES.has(item.type) && item.call_id) names.set(item.call_id, callName(item));
  }
  const results = [];
  for (let index = input.length - 1; index >= 0; index -= 1) {
    const item = input[index];
    const type = String(item?.type || "");
    if (type.endsWith("_call_output")) {
      results.unshift({ name: names.get(item.call_id) || type.replace(/_output$/, ""), ...outputSize(item.output) });
      continue;
    }
    if (CALL_TYPES.has(type) || type === "reasoning") continue;
    break;
  }
  return results.slice(-MAX_ITEMS);
}

export function requestToolSummary(tools) {
  if (!Array.isArray(tools)) return { toolsDefined: 0, hostedTools: [] };
  let count = 0;
  const hosted = new Set();
  for (const tool of tools) {
    if (tool?.type === "namespace" && Array.isArray(tool.tools)) count += tool.tools.length;
    else if (tool?.type === "function" || tool?.type === "custom") count += 1;
    else if (tool?.type) { count += 1; hosted.add(String(tool.type).slice(0, 40)); }
  }
  return { toolsDefined: count, hostedTools: [...hosted] };
}

// Công cụ model yêu cầu gọi trong câu trả lời (SSE hoặc JSON).
export function responseToolCalls(captured, isStream) {
  const names = [];
  const push = (item) => { if (item && CALL_TYPES.has(item.type) && names.length < MAX_ITEMS) names.push(callName(item)); };
  const text = Buffer.isBuffer(captured) ? captured.toString("utf8") : String(captured || "");
  if (!text) return names;
  if (isStream) {
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith("data:") || !line.includes("output_item.done")) continue;
      try {
        const event = JSON.parse(line.slice(5));
        if (event?.type === "response.output_item.done") push(event.item);
      } catch {
        // dòng SSE không phải JSON hoàn chỉnh – bỏ qua
      }
    }
    return names;
  }
  try {
    const payload = JSON.parse(text);
    for (const item of payload?.output || payload?.response?.output || []) push(item);
  } catch {
    // không phải JSON
  }
  return names;
}

// Danh sách model của /v1/models/<loại>: đếm theo kind để biết vì sao công cụ tìm / đọc web không chạy.
export function modelListSummary(captured) {
  try {
    const payload = JSON.parse(Buffer.isBuffer(captured) ? captured.toString("utf8") : String(captured || ""));
    const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    const kinds = {};
    for (const item of items) {
      const kind = String(item?.kind || item?.type || "other").slice(0, 30);
      kinds[kind] = (kinds[kind] || 0) + 1;
    }
    return { models: items.length, kinds };
  } catch {
    return null;
  }
}
