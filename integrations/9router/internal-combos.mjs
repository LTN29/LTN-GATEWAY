import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value) => createHash("sha256").update(String(value)).digest();
const equal = (left, right) => timingSafeEqual(digest(left), digest(right));

// This endpoint accepts no dashboard or employee credentials. The trusted peer
// headers must originate from 9Router's custom-server.js, not the HTTP client.
export function authorizeComboReader(headers, env) {
  const token = env.LTN_COMBO_API_TOKEN || "";
  const peerToken = env.NINEROUTER_PEER_TOKEN || "";
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(token) || !peerToken) return 503;
  const authorization = headers.get("authorization") || "";
  if (!equal(authorization, `Bearer ${token}`)) return 401;
  if (!equal(headers.get("x-9r-peer-token") || "", peerToken)) return 403;
  const allowed = (env.LTN_COMBO_API_ALLOWED_IPS || "127.0.0.1,::1,::ffff:127.0.0.1")
    .split(",").map((ip) => ip.trim()).filter(Boolean);
  return allowed.includes(headers.get("x-9r-real-ip") || "") ? 200 : 403;
}

export async function readInternalCombos(request, env, getCombos) {
  const denied = authorizeComboReader(request.headers, env);
  const headers = { "cache-control": "no-store" };
  if (denied !== 200) return Response.json({ error: "Internal combo access unavailable or denied" }, { status: denied, headers });
  if (request.method !== "GET") return Response.json({ error: "Read-only endpoint" }, { status: 405, headers: { ...headers, allow: "GET" } });
  if (new URL(request.url).search) return Response.json({ error: "Query parameters are not supported" }, { status: 400, headers });
  try {
    const combos = await getCombos();
    if (!Array.isArray(combos) || combos.some((combo) => typeof combo.name !== "string" || !Array.isArray(combo.models) || combo.models.some((model) => typeof model !== "string"))) {
      throw new Error("Invalid combo data");
    }
    // Never serialize provider credentials, settings, arbitrary DB fields or cookies.
    return Response.json({ combos: combos.map(({ name, models }) => ({ name, models })) }, { headers });
  } catch {
    return Response.json({ error: "Internal combo data unavailable" }, { status: 503, headers });
  }
}
