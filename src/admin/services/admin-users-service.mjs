import { chmod, copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { config, loadTeams, normalizeAiPolicy } from "../../config.mjs";
import { sha256, newUserApiKey, safePolicy, safeTeamId, safeText, safeUserId, parseCsv, csvEscape } from "../admin-validation.mjs";

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function chmodPrivate(path) {
  if (process.platform !== "win32") await chmod(path, 0o600);
}

async function withUsersLock(fn) {
  const lockPath = `${config.usersFile}.lock`;
  const deadline = Date.now() + 5000;
  await mkdir(dirname(config.usersFile), { recursive: true });
  while (true) {
    try {
      await mkdir(lockPath, { recursive: false });
      break;
    } catch (error) {
      if (error?.code !== "EEXIST" || Date.now() > deadline) throw new Error("Không thể khóa users.json.");
      await sleep(25);
    }
  }
  try {
    return await fn();
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

async function readUsersFile() {
  try {
    const parsed = JSON.parse(await readFile(config.usersFile, "utf8"));
    if (parsed.version !== 1 || !parsed.users || typeof parsed.users !== "object" || Array.isArray(parsed.users)) {
      throw new Error("users.json không hợp lệ.");
    }
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return { version: 1, users: {} };
    throw error;
  }
}

async function writeUsersFile(parsed) {
  await mkdir(dirname(config.usersFile), { recursive: true });
  try {
    await copyFile(config.usersFile, `${config.usersFile}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const tmp = `${config.usersFile}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(parsed, null, 2) + "\n", "utf8");
  await chmodPrivate(tmp);
  await rename(tmp, config.usersFile);
  await chmodPrivate(config.usersFile);
}

async function ensureTeamEnabled(teamId) {
  const teams = await loadTeams({ force: true });
  const team = teams.byCode.get(teamId);
  if (!team) throw Object.assign(new Error("Team không tồn tại."), { statusCode: 400, code: "TEAM_NOT_FOUND" });
  if (!team.enabled) throw Object.assign(new Error("Team đang disabled."), { statusCode: 400, code: "TEAM_DISABLED" });
  return team;
}

async function ensureUserMemory(memoryFile, userId, teamId, role) {
  const target = resolve(config.memoryDir, memoryFile);
  const rel = relative(config.memoryDir, target);
  if (!rel || rel.startsWith("..")) throw new Error("memoryFile path traversal");
  try {
    await readFile(target, "utf8");
    return;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `# Hồ sơ công việc

## Vai trò và phạm vi
- User ID: ${userId}
- Team: ${teamId}
- Vai trò: ${role || ""}

## Phong cách đầu ra

## Quy trình cá nhân

## Mẫu yêu cầu hiệu quả

## Quy tắc riêng

## Metadata
- Last updated:
- Version: 1
`, "utf8");
  await chmodPrivate(target);
}

function userMemoryPath(memoryFile) {
  const target = resolve(config.memoryDir, memoryFile);
  const rel = relative(config.memoryDir, target);
  if (!rel || rel.startsWith("..")) throw new Error("memoryFile path traversal");
  return target;
}

function publicUser(userId, user) {
  return {
    userId,
    displayName: user.displayName || userId,
    teamId: user.teamId,
    role: user.role || "",
    enabled: user.enabled !== false,
    memoryFile: user.memoryFile,
    aiPolicy: user.aiPolicy || { mode: "inherit" }
  };
}

export async function listUsers({ teamId = "", enabled = "", search = "", limit = 50, offset = 0 } = {}) {
  const parsed = await readUsersFile();
  let items = Object.entries(parsed.users).map(([userId, user]) => publicUser(userId, user));
  if (teamId) items = items.filter((item) => item.teamId === safeTeamId(teamId));
  if (enabled !== "") {
    const wanted = ["1", "true", "enabled"].includes(String(enabled).toLowerCase());
    items = items.filter((item) => item.enabled === wanted);
  }
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter((item) => item.userId.includes(q) || item.displayName.toLowerCase().includes(q));
  }
  const total = items.length;
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 50));
  const pageOffset = Math.max(0, Number(offset) || 0);
  return { items: items.slice(pageOffset, pageOffset + pageSize), total, limit: pageSize, offset: pageOffset };
}

export async function getUser(userId) {
  const id = safeUserId(userId);
  const parsed = await readUsersFile();
  const user = parsed.users[id];
  if (!user) throw Object.assign(new Error("Không tìm thấy nhân viên."), { statusCode: 404, code: "USER_NOT_FOUND" });
  return publicUser(id, user);
}

export async function createUser(input) {
  const userId = safeUserId(input.userId);
  const teamId = safeTeamId(input.teamId || input.team);
  const displayName = safeText(input.displayName || userId, 120);
  const role = safeText(input.role || "", 120);
  await ensureTeamEnabled(teamId);
  return withUsersLock(async () => {
    const parsed = await readUsersFile();
    if (parsed.users[userId]) throw Object.assign(new Error("User đã tồn tại."), { statusCode: 409, code: "USER_EXISTS" });
    const apiKey = newUserApiKey();
    parsed.users[userId] = {
      displayName,
      teamId,
      role,
      keyHash: sha256(apiKey),
      enabled: true,
      memoryFile: `users/${teamId}/${userId}.md`,
      aiPolicy: safePolicy(input.aiPolicy || { mode: input.policyMode || "inherit", premiumLimit: input.premiumLimit })
    };
    await writeUsersFile(parsed);
    await ensureUserMemory(parsed.users[userId].memoryFile, userId, teamId, role);
    return { user: publicUser(userId, parsed.users[userId]), apiKey };
  });
}

export async function patchUser(userId, patch) {
  const id = safeUserId(userId);
  return withUsersLock(async () => {
    const parsed = await readUsersFile();
    const user = parsed.users[id];
    if (!user) throw Object.assign(new Error("Không tìm thấy nhân viên."), { statusCode: 404, code: "USER_NOT_FOUND" });
    if (patch.displayName !== undefined) user.displayName = safeText(patch.displayName, 120);
    if (patch.role !== undefined) user.role = safeText(patch.role, 120);
    if (patch.teamId !== undefined) {
      const teamId = safeTeamId(patch.teamId);
      await ensureTeamEnabled(teamId);
      user.teamId = teamId;
      user.memoryFile = `users/${teamId}/${id}.md`;
      await ensureUserMemory(user.memoryFile, id, teamId, user.role || "");
    }
    if (patch.aiPolicy !== undefined) user.aiPolicy = normalizeAiPolicy(safePolicy(patch.aiPolicy), "user");
    await writeUsersFile(parsed);
    return publicUser(id, user);
  });
}

export async function setUserEnabled(userId, enabled) {
  const id = safeUserId(userId);
  return withUsersLock(async () => {
    const parsed = await readUsersFile();
    const user = parsed.users[id];
    if (!user) throw Object.assign(new Error("Không tìm thấy nhân viên."), { statusCode: 404, code: "USER_NOT_FOUND" });
    user.enabled = Boolean(enabled);
    await writeUsersFile(parsed);
    return publicUser(id, user);
  });
}

export async function rotateUserKey(userId) {
  const id = safeUserId(userId);
  return withUsersLock(async () => {
    const parsed = await readUsersFile();
    const user = parsed.users[id];
    if (!user) throw Object.assign(new Error("Không tìm thấy nhân viên."), { statusCode: 404, code: "USER_NOT_FOUND" });
    const apiKey = newUserApiKey();
    user.keyHash = sha256(apiKey);
    await writeUsersFile(parsed);
    return { user: publicUser(id, user), apiKey };
  });
}

export async function validateUsersCsv(csvText) {
  const rows = parseCsv(csvText);
  const [header, ...dataRows] = rows;
  const columns = (header || []).map((item) => String(item).trim());
  const required = ["userId", "displayName", "teamId", "role", "policyMode", "premiumLimit"];
  if (required.some((col) => !columns.includes(col))) {
    throw Object.assign(new Error("CSV thiếu header bắt buộc."), { statusCode: 400, code: "INVALID_CSV" });
  }
  const seen = new Set();
  const existing = await readUsersFile();
  const preview = [];
  const errors = [];
  for (const [rowIndex, row] of dataRows.entries()) {
    const item = Object.fromEntries(columns.map((col, index) => [col, row[index] || ""]));
    try {
      const userId = safeUserId(item.userId);
      const teamId = safeTeamId(item.teamId);
      if (seen.has(userId)) throw new Error("Trùng userId trong CSV.");
      if (existing.users[userId]) throw new Error("User đã tồn tại trong config.");
      seen.add(userId);
      await ensureTeamEnabled(teamId);
      preview.push({
        row: rowIndex + 2,
        userId,
        displayName: safeText(item.displayName || userId, 120),
        teamId,
        role: safeText(item.role || "", 120),
        aiPolicy: safePolicy({ mode: item.policyMode || "inherit", premiumLimit: item.premiumLimit })
      });
    } catch (error) {
      errors.push({ row: rowIndex + 2, message: error.message });
    }
  }
  return { valid: errors.length === 0, preview, errors };
}

export async function importUsersCsv(csvText) {
  const validation = await validateUsersCsv(csvText);
  if (!validation.valid) {
    throw Object.assign(new Error("CSV chưa hợp lệ."), { statusCode: 400, code: "INVALID_CSV", fieldErrors: validation.errors });
  }
  return withUsersLock(async () => {
    const parsed = await readUsersFile();
    let originalUsersText = null;
    try {
      originalUsersText = await readFile(config.usersFile, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    const keyRows = [["userId", "displayName", "teamId", "apiKey"]];
    for (const item of validation.preview) {
      if (parsed.users[item.userId]) throw Object.assign(new Error("User đã tồn tại."), { statusCode: 409, code: "USER_EXISTS" });
      const apiKey = newUserApiKey();
      parsed.users[item.userId] = {
        displayName: item.displayName,
        teamId: item.teamId,
        role: item.role,
        keyHash: sha256(apiKey),
        enabled: true,
        memoryFile: `users/${item.teamId}/${item.userId}.md`,
        aiPolicy: item.aiPolicy
      };
      keyRows.push([item.userId, item.displayName, item.teamId, apiKey]);
    }
    const createdMemoryFiles = [];
    try {
      await writeUsersFile(parsed);
      for (const item of validation.preview) {
        const memoryFile = parsed.users[item.userId].memoryFile;
        const target = userMemoryPath(memoryFile);
        const existed = await readFile(target, "utf8").then(() => true).catch((error) => {
          if (error?.code === "ENOENT") return false;
          throw error;
        });
        await ensureUserMemory(memoryFile, item.userId, item.teamId, item.role);
        if (!existed) createdMemoryFiles.push(target);
      }
    } catch (error) {
      for (const path of createdMemoryFiles.reverse()) {
        await rm(path, { force: true }).catch(() => {});
      }
      if (originalUsersText === null) {
        await rm(config.usersFile, { force: true }).catch(() => {});
      } else {
        const tmp = `${config.usersFile}.${process.pid}.${Date.now()}.rollback.tmp`;
        await writeFile(tmp, originalUsersText, "utf8");
        await chmodPrivate(tmp);
        await rename(tmp, config.usersFile);
        await chmodPrivate(config.usersFile);
      }
      throw error;
    }
    return "\uFEFF" + keyRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
  });
}
