import { randomBytes } from "node:crypto";
import { config } from "../config.mjs";
import { timingSafeEqualString } from "./admin-validation.mjs";

const tokens = new Map();

export function issueCsrfToken(admin) {
  const token = randomBytes(32).toString("base64url");
  tokens.set(`${admin.email}:${token}`, {
    email: admin.email,
    expiresAt: Date.now() + config.adminCsrfTtlSeconds * 1000
  });
  return {
    token,
    expiresAt: new Date(Date.now() + config.adminCsrfTtlSeconds * 1000).toISOString()
  };
}

export function verifyCsrfToken(admin, token) {
  const raw = String(token || "");
  if (!raw) return false;
  for (const [key, record] of tokens) {
    if (record.expiresAt <= Date.now()) {
      tokens.delete(key);
      continue;
    }
    if (record.email === admin.email && timingSafeEqualString(key, `${admin.email}:${raw}`)) {
      return true;
    }
  }
  return false;
}
