import { config } from "./config.mjs";

export async function upstreamFetch(path, {
  method = "GET",
  rawKey,
  body,
  accept = "*/*",
  requestId
} = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.upstreamTimeoutMs);

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
      signal: controller.signal,
      redirect: "manual"
    });
  } finally {
    clearTimeout(timeout);
  }
}
