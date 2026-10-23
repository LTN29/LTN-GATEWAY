import { config } from "./config.mjs";

const OMITTED_IMAGE = "[Ảnh cũ đã được lược bỏ để giữ hội thoại trong giới hạn ngữ cảnh.]";
const BASE64_RUN = /(?:data:[\w.+-]+\/[\w.+-]+;base64,)?[A-Za-z0-9+/]{4096,}={0,2}/g;

function isImagePart(part) {
  return part && typeof part === "object" &&
    (part.type === "input_image" || part.type === "image" || part.type === "image_url");
}

function compactText(value, stats) {
  if (typeof value !== "string") return value;
  let text = value.replace(BASE64_RUN, (match) => {
    stats.base64Blobs += 1;
    return `[Dữ liệu base64 ${match.length} ký tự đã được lược bỏ.]`;
  });
  const limit = config.responsesMaxTextChars;
  if (text.length > limit) {
    stats.truncatedTexts += 1;
    const head = Math.floor(limit * 0.7);
    const tail = limit - head;
    text = `${text.slice(0, head)}\n\n[... đã lược bỏ ${text.length - limit} ký tự ở giữa để tránh vượt giới hạn ngữ cảnh ...]\n\n${text.slice(-tail)}`;
  }
  return text;
}

function compactPart(part, stats) {
  if (typeof part === "string") return compactText(part, stats);
  if (!part || typeof part !== "object" || isImagePart(part)) return part;
  const next = { ...part };
  for (const key of ["text", "input_text", "output_text"]) {
    if (typeof next[key] === "string") next[key] = compactText(next[key], stats);
  }
  return next;
}

function compactContent(content, stats) {
  if (typeof content === "string") return compactText(content, stats);
  return Array.isArray(content) ? content.map((part) => compactPart(part, stats)) : content;
}

// Many upstream translators serialize images inside tool results as text. A
// 1080p screenshot then costs millions of tokens instead of one vision input.
function hoistToolImages(input, stats) {
  const result = [];
  for (const item of input) {
    if (item?.type !== "function_call_output" && item?.type !== "custom_tool_call_output" ||
        !Array.isArray(item.output) || !item.output.some(isImagePart)) {
      result.push(item);
      continue;
    }
    const images = item.output.filter(isImagePart);
    const text = item.output
      .filter((part) => !isImagePart(part))
      .map((part) => typeof part === "string" ? part : part?.text || part?.input_text || part?.output_text || "")
      .filter(Boolean)
      .join("\n");
    stats.hoistedImages += images.length;
    result.push({
      ...item,
      output: [text, `[Tool trả về ${images.length} ảnh; ảnh được đính kèm ngay sau kết quả này.]`].filter(Boolean).join("\n")
    });
    result.push({ type: "message", role: "user", content: images });
  }
  return result;
}

function limitImages(input, stats) {
  let remaining = config.responsesMaxImages;
  const result = new Array(input.length);
  for (let index = input.length - 1; index >= 0; index -= 1) {
    const item = input[index];
    if (!Array.isArray(item?.content)) {
      result[index] = item;
      continue;
    }
    const content = [];
    for (let partIndex = item.content.length - 1; partIndex >= 0; partIndex -= 1) {
      const part = item.content[partIndex];
      if (!isImagePart(part)) content.unshift(part);
      else if (remaining > 0) {
        remaining -= 1;
        content.unshift(part);
      } else {
        stats.omittedImages += 1;
        content.unshift({ type: "input_text", text: OMITTED_IMAGE });
      }
    }
    result[index] = { ...item, content };
  }
  return result;
}

export function budgetResponsesPayload(payload) {
  const stats = { hoistedImages: 0, omittedImages: 0, base64Blobs: 0, truncatedTexts: 0 };
  if (!Array.isArray(payload?.input)) {
    return { payload: { ...payload, input: compactContent(payload?.input, stats) }, stats };
  }
  let input = hoistToolImages(payload.input, stats).map((item) => {
    if (!item || typeof item !== "object") return compactPart(item, stats);
    const next = { ...item };
    if ("content" in next) next.content = compactContent(next.content, stats);
    if ("output" in next) next.output = compactContent(next.output, stats);
    return next;
  });
  input = limitImages(input, stats);
  return { payload: { ...payload, input }, stats };
}

export function budgetChanged(stats) {
  return Object.values(stats).some(Boolean);
}
