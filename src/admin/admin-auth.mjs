import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { readFile } from "node:fs/promises";
import { config } from "../config.mjs";
import { redactSecrets } from "../utils.mjs";
import { normalizeAdminConfig } from "./admin-rbac.mjs";

let jwksCache = { loadedAt: 0, keys: [] };
let adminsCache = { loadedAt: 0, path: "", admins: new Map() };

function b64urlDecode(value) {
  return Buffer.from(String(value || "").replaceAll("-", "+").replaceAll("_", "/"), "base64");
}

function jsonFromB64url(value) {
  return JSON.parse(b64urlDecode(value).toString("utf8"));
}

function cloudflareTeamDomain() {
  return config.cloudflareAccessTeamDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

async function loadJwks() {
  if (jwksCache.keys.length && Date.now() - jwksCache.loadedAt < 3600000) return jwksCache.keys;

  if (config.cloudflareAccessJwksFile) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(config.cloudflareAccessJwksFile, "utf8"));
    } catch (error) {
      throw Object.assign(new Error("CLOUDFLARE_ACCESS_JWKS_FILE không đọc được hoặc JSON không hợp lệ."), {
        statusCode: 500,
        code: "JWKS_FILE_INVALID",
        cause: error
      });
    }
    jwksCache = { loadedAt: Date.now(), keys: parsed.keys || [] };
    return jwksCache.keys;
  }

  if (!config.cloudflareAccessTeamDomain) {
    throw Object.assign(new Error("Thiếu CLOUDFLARE_ACCESS_TEAM_DOMAIN."), {
      statusCode: 500,
      code: "ADMIN_AUTH_NOT_CONFIGURED"
    });
  }

  let response;
  let parsed;
  try {
    response = await fetch(`https://${cloudflareTeamDomain()}/cdn-cgi/access/certs`);
    parsed = await response.json();
  } catch (error) {
    throw Object.assign(new Error("Không tải được Cloudflare Access JWKS. Kiểm tra CLOUDFLARE_ACCESS_TEAM_DOMAIN và network từ Mac mini."), {
      statusCode: 502,
      code: "JWKS_UNAVAILABLE",
      cause: error
    });
  }

  if (!response.ok || !Array.isArray(parsed.keys)) {
    throw Object.assign(new Error("Cloudflare Access JWKS trả dữ liệu không hợp lệ."), {
      statusCode: 502,
      code: "JWKS_UNAVAILABLE"
    });
  }

  jwksCache = { loadedAt: Date.now(), keys: parsed.keys };
  return jwksCache.keys;
}

export async function loadAdmins({ force = false } = {}) {
  const path = config.adminConfigFile;
  if (!force && adminsCache.path === path && Date.now() - adminsCache.loadedAt < 10000) return adminsCache.admins;

  let parsed;
  try {
    parsed = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    const code = error?.code === "ENOENT" ? "ADMIN_CONFIG_NOT_FOUND" : "ADMIN_CONFIG_INVALID_JSON";
    const message = error?.code === "ENOENT"
      ? "Không tìm thấy config/admins.json."
      : "config/admins.json không phải JSON hợp lệ.";
    throw Object.assign(new Error(message), { statusCode: 500, code, cause: error });
  }

  if (parsed.version !== 1 || !parsed.admins || typeof parsed.admins !== "object" || Array.isArray(parsed.admins)) {
    throw Object.assign(new Error("config/admins.json không hợp lệ."), {
      statusCode: 500,
      code: "ADMIN_CONFIG_INVALID"
    });
  }

  const admins = new Map();
  try {
    for (const [email, item] of Object.entries(parsed.admins)) {
      const normalized = normalizeAdminConfig(email, item);
      admins.set(normalized.email, normalized);
    }
  } catch (error) {
    throw Object.assign(new Error(error?.message || "config/admins.json không hợp lệ."), {
      statusCode: 500,
      code: "ADMIN_CONFIG_INVALID",
      cause: error
    });
  }

  adminsCache = { loadedAt: Date.now(), path, admins };
  return admins;
}

function issuerExpected() {
  return `https://${cloudflareTeamDomain()}`;
}

async function verifyCloudflareJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw Object.assign(new Error("Cloudflare Access JWT không hợp lệ."), { statusCode: 401, code: "INVALID_ACCESS_JWT" });

  const [headerPart, payloadPart, signaturePart] = parts;
  const header = jsonFromB64url(headerPart);
  const payload = jsonFromB64url(payloadPart);

  if (!["RS256", "ES256"].includes(header.alg)) {
    throw Object.assign(new Error("Cloudflare Access JWT alg không được hỗ trợ."), { statusCode: 401, code: "INVALID_ACCESS_JWT" });
  }

  const key = (await loadJwks()).find((item) => item.kid === header.kid);
  if (!key) throw Object.assign(new Error("Không tìm thấy JWKS key."), { statusCode: 401, code: "INVALID_ACCESS_JWT" });

  const publicKey = createPublicKey({ key, format: "jwk" });
  const algorithm = header.alg === "RS256" ? "RSA-SHA256" : "SHA256";
  const ok = cryptoVerify(
    algorithm,
    Buffer.from(`${headerPart}.${payloadPart}`),
    publicKey,
    b64urlDecode(signaturePart)
  );
  if (!ok) throw Object.assign(new Error("Cloudflare Access JWT sai chữ ký."), { statusCode: 401, code: "INVALID_ACCESS_JWT" });

  const now = Math.floor(Date.now() / 1000);
  if (Number(payload.exp || 0) <= now) throw Object.assign(new Error("Cloudflare Access JWT đã hết hạn."), { statusCode: 401, code: "ACCESS_JWT_EXPIRED" });
  if (payload.iss !== issuerExpected()) throw Object.assign(new Error("Cloudflare Access JWT sai issuer."), { statusCode: 401, code: "INVALID_ACCESS_ISSUER" });

  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (config.cloudflareAccessAud && !aud.includes(config.cloudflareAccessAud)) {
    throw Object.assign(new Error("Cloudflare Access JWT sai audience."), { statusCode: 401, code: "INVALID_ACCESS_AUDIENCE" });
  }

  const email = String(payload.email || payload.sub || "").trim().toLowerCase();
  if (!email || !email.includes("@")) throw Object.assign(new Error("Cloudflare Access JWT thiếu email."), { statusCode: 401, code: "INVALID_ACCESS_IDENTITY" });
  return { email, claims: payload };
}

export async function authenticateAdmin(req) {
  const token = req.headers["cf-access-jwt-assertion"];
  if (!token) throw Object.assign(new Error("Thiếu Cf-Access-Jwt-Assertion."), { statusCode: 401, code: "MISSING_ACCESS_JWT" });

  const identity = await verifyCloudflareJwt(token);
  const admins = await loadAdmins();
  const admin = admins.get(identity.email);
  if (!admin) throw Object.assign(new Error("Admin chưa được cấp quyền."), { statusCode: 403, code: "ADMIN_NOT_ALLOWED" });
  if (!admin.enabled) throw Object.assign(new Error("Admin đã bị vô hiệu hóa."), { statusCode: 403, code: "ADMIN_DISABLED" });
  return admin;
}

export function safeAuthError(error) {
  return redactSecrets(error?.message || String(error));
}
