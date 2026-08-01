import { randomBytes } from "node:crypto";
import { config } from "../config.mjs";
import { timingSafeEqualString } from "./admin-validation.mjs";

const tokens = new Map();
const MAX_TOKENS_PER_ADMIN = 20;

function pruneTokens(email) {
  const now = Date.now();
  const activeForAdmin = [];
  for (const [key, record] of tokens) {
    if (record.expiresAt <= now) {
      tokens.delete(key);
    } else if (record.email === email) {
      activeForAdmin.push(key);
    }
  }
  while (activeForAdmin.length >= MAX_TOKENS_PER_ADMIN) {
    tokens.delete(activeForAdmin.shift());
  }
}

export function issueCsrfToken(admin) {
  pruneTokens(admin.email);
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
