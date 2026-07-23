export function parseModelRequest(raw) {
  let payload;

  try {
    payload = JSON.parse(Buffer.from(raw).toString("utf8"));
  } catch {
    const error = new Error("JSON không hợp lệ");
    error.statusCode = 400;
    error.type = "invalid_request_error";
    throw error;
  }

  if (typeof payload.model !== "string" || !payload.model.trim()) {
    const error = new Error("model phải là một chuỗi không rỗng");
    error.statusCode = 400;
    error.type = "invalid_request_error";
    throw error;
  }

  return payload;
}

function contentText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      if (typeof item.text === "string") return item.text;
      if (typeof item.input_text === "string") return item.input_text;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

export function responseInputMessages(input) {
  if (typeof input === "string") {
    return [{ role: "user", content: input }];
  }
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (typeof item === "string") return { role: "user", content: item };
      if (!item || typeof item !== "object") return null;

      const role = ["user", "assistant"].includes(item.role)
        ? item.role
        : "user";
      const content = contentText(item.content);
      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

export function injectResponsesMemory(payload, systemContent) {
  const clientInstructions =
    typeof payload.instructions === "string" ? payload.instructions.trim() : "";

  return {
    ...payload,
    instructions: clientInstructions
      ? `${systemContent}\n\n<client_instructions>\n${clientInstructions}\n</client_instructions>`
      : systemContent
  };
}
