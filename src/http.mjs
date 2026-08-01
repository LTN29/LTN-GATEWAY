import { config } from "./config.mjs";

export function sendJson(res, status, payload, headers = {}) {
  const body = Buffer.from(JSON.stringify(payload));

  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": body.length,
    "access-control-allow-origin": config.corsAllowOrigin,
    ...headers
  });
  res.end(body);
}

export function openAiError(message, type = "gateway_error", code = null) {
  return {
    error: {
      message,
      type,
      param: null,
      code
    }
  };
}

export async function readBody(req, maxBytes = config.maxBodyBytes) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;

    if (size > maxBytes) {
      const error = new Error("Request body vượt quá giới hạn");
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function setCors(res) {
  res.setHeader("access-control-allow-origin", config.corsAllowOrigin);
}

export function handleOptions(res) {
  res.writeHead(204, {
    "access-control-allow-origin": config.corsAllowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization,content-type,x-request-id,x-connection-id,x-ltn-client-id,x-ltn-browser-bridge",
    "access-control-max-age": "86400"
  });
  res.end();
}
