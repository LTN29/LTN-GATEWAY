import { createHash, timingSafeEqual } from "node:crypto";

export function sha256(value) {
  return createHash("sha256").update(String(value), "utf8").digest("hex");
}

export function safeUserId(value) {
  const userId = String(value || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(userId)) {
    throw Object.assign(new Error("userId không hợp lệ."), { statusCode: 400, code: "INVALID_USER_ID" });
  }
  return userId;
}

export function safeTeamId(value) {
  const teamId = String(value || "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,40}$/.test(teamId)) {
    throw Object.assign(new Error("teamId không hợp lệ."), { statusCode: 400, code: "INVALID_TEAM_ID" });
  }
  return teamId;
}

export function safeText(value, max = 200) {
  const text = String(value || "").trim();
  if (text.includes("\0") || /[\r\n]/.test(text) || text.length > max) {
    throw Object.assign(new Error("Giá trị văn bản không hợp lệ."), { statusCode: 400, code: "INVALID_TEXT" });
  }
  return text;
}

export function safePolicy(value = {}) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw Object.assign(new Error("aiPolicy phải là object."), { statusCode: 400, code: "INVALID_POLICY" });
  }
  const mode = String(value.mode || "inherit").trim();
  if (!["premium_always", "limited_daily", "free_only", "inherit"].includes(mode)) {
    throw Object.assign(new Error("policy mode không hợp lệ."), { statusCode: 400, code: "INVALID_POLICY" });
  }
  const policy = { mode };
  if (value.premiumLimit !== undefined && value.premiumLimit !== null && value.premiumLimit !== "") {
    const limit = Number(value.premiumLimit);
    if (!Number.isInteger(limit) || limit < 0 || limit > 10000) {
      throw Object.assign(new Error("premiumLimit không hợp lệ."), { statusCode: 400, code: "INVALID_POLICY" });
    }
    policy.premiumLimit = limit;
  }
  return policy;
}

export function timingSafeEqualString(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function csvEscape(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const input = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((item) => item.some((cellValue) => String(cellValue).trim()));
}
