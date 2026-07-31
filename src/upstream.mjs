import { config } from "./config.mjs";

export async function upstreamFetch(path, {
  method = "GET",
  rawKey,
  body,
  accept = "*/*",
  contentType = "application/json",
  extraHeaders = {},
  requestId,
  signal
} = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.upstreamTimeoutMs);
  const combinedSignal = signal
    ? AbortSignal.any([controller.signal, signal])
    : controller.signal;

  try {
    return await fetch(`${config.upstreamBaseUrl}${path}`, {
      method,
      headers: {
        ...extraHeaders,
        authorization: `Bearer ${rawKey}`,
        ...(contentType ? { "content-type": contentType } : {}),
        accept,
        "x-request-id": requestId
      },
      body,
      signal: combinedSignal,
      redirect: "manual"
    });
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      const timeoutError = new Error("9Router khong phan hoi trong thoi gian cho phep.");
      timeoutError.statusCode = 504;
      timeoutError.code = "UPSTREAM_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
