export function assistantTextFromJson(payload) {
  const chatText =
    payload?.choices?.[0]?.message?.content ||
    payload?.output_text ||
    "";

  if (chatText) return chatText;

  const chunks = [];
  for (const output of payload?.output || []) {
    for (const item of output?.content || []) {
      if (
        ["output_text", "text"].includes(item?.type) &&
        typeof item?.text === "string"
      ) {
        chunks.push(item.text);
      }
    }
  }
  return chunks.join("");
}

export function assistantTextFromSse(raw) {
  const chunks = [];

  for (const line of String(raw || "").split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;

    try {
      const payload = JSON.parse(data);
      const content =
        payload?.choices?.[0]?.delta?.content ??
        payload?.choices?.[0]?.message?.content ??
        payload?.delta?.text ??
        (payload?.type === "response.output_text.delta" ? payload?.delta : undefined) ??
        payload?.output_text;

      if (typeof content === "string") chunks.push(content);
    } catch {
      // Ignore non-JSON SSE lines.
    }
  }

  return chunks.join("");
}

export function responsesJsonSucceeded(payload) {
  return !["failed", "cancelled", "incomplete"].includes(payload?.status);
}

export function responsesSseCompleted(raw) {
  let completed = false;

  for (const line of String(raw || "").split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      const payload = JSON.parse(data);
      if (payload?.type === "response.failed") return false;
      if (payload?.type === "response.completed") completed = true;
    } catch {
      // Ignore non-JSON SSE lines.
    }
  }

  return completed;
}
