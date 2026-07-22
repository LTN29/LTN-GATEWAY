import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile, rename, mkdir, copyFile } from "node:fs/promises";
import { dirname } from "node:path";

export function sha256(value) {
  return createHash("sha256").update(String(value), "utf8").digest("hex");
}

export function requestId(value) {
  return value || randomUUID();
}

export function getBearerToken(headers) {
  const auth = headers.authorization || "";
  const match = String(auth).match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function jsonLog(event, data = {}) {
  process.stdout.write(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...data
  }) + "\n");
}

export async function atomicWrite(path, content, { backup = false } = {}) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;

  if (backup) {
    try {
      await copyFile(path, `${path}.bak`);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  await writeFile(tmp, content, "utf8");
  await rename(tmp, path);
}

export async function readUtf8(path, fallback = null) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

export function stripCodeFence(value) {
  const text = String(value || "").trim();
  const match = text.match(/^```(?:markdown|md)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : text;
}

export function redactSecrets(value) {
  let text = String(value || "");

  const patterns = [
    /\bsk-[A-Za-z0-9_-]{12,}\b/g,
    /\bBearer\s+[A-Za-z0-9._~+\/=-]{12,}\b/gi,
    /\b(?:api[_ -]?key|access[_ -]?token|refresh[_ -]?token|client[_ -]?secret|password|mật khẩu)\s*[:=]\s*["']?[^\s"',;]{6,}/gi,
    /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g
  ];

  for (const pattern of patterns) {
    text = text.replace(pattern, "[REDACTED]");
  }

  return text;
}

export function safeTeamCode(value) {
  const code = String(value || "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
    throw new Error("Team code chỉ được dùng A-Z, 0-9, dấu _ hoặc -");
  }
  return code;
}
