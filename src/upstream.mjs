import { config } from "./config.mjs";

export async function upstreamFetch(path, {
  method = "GET",
  rawKey,
  body,
  accept = "*/*",
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
        authorization: `Bearer ${rawKey}`,
        "content-type": "application/json",
        accept,
        "x-request-id": requestId
      },
      body,
      signal: combinedSignal,
      redirect: "manual"
    });
  } finally {
    clearTimeout(timeout);
  }
}
