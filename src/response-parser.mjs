export function assistantTextFromJson(payload) {
  return (
    payload?.choices?.[0]?.message?.content ||
    payload?.output_text ||
    ""
  );
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
        payload?.output_text;

      if (typeof content === "string") chunks.push(content);
    } catch {
      // Ignore non-JSON SSE lines.
    }
  }

  return chunks.join("");
}
