import { chmod, copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config, loadTeams, normalizeAiPolicy } from "../../config.mjs";
import { safePolicy, safeTeamId, safeText } from "../admin-validation.mjs";

async function sleep(ms) { await new Promise((resolve) => setTimeout(resolve, ms)); }
async function chmodPrivate(path) { if (process.platform !== "win32") await chmod(path, 0o600); }

async function withTeamsLock(fn) {
  const lockPath = `${config.teamsFile}.lock`;
  const deadline = Date.now() + 5000;
  await mkdir(dirname(config.teamsFile), { recursive: true });
  while (true) {
    try { await mkdir(lockPath, { recursive: false }); break; }
    catch (error) {
      if (error?.code !== "EEXIST" || Date.now() > deadline) throw new Error("Không thể khóa teams.json.");
      await sleep(25);
    }
  }
  try { return await fn(); } finally { await rm(lockPath, { recursive: true, force: true }); }
}

async function readTeamsFile() {
  const parsed = JSON.parse(await readFile(config.teamsFile, "utf8"));
  if (!parsed.teams) throw new Error("teams.json không hợp lệ.");
  return parsed;
}

async function writeTeamsFile(parsed) {
  try { await copyFile(config.teamsFile, `${config.teamsFile}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`); }
  catch (error) { if (error?.code !== "ENOENT") throw error; }
  const tmp = `${config.teamsFile}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(parsed, null, 2) + "\n", "utf8");
  await chmodPrivate(tmp);
  await rename(tmp, config.teamsFile);
  await chmodPrivate(config.teamsFile);
}

function asArray(parsed) {
  return Array.isArray(parsed.teams)
    ? parsed.teams
    : Object.entries(parsed.teams || {}).map(([code, team]) => ({ ...team, code }));
}

export async function listTeams() {
  const teams = await loadTeams({ force: true });
  const usersRaw = await readFile(config.usersFile, "utf8").then(JSON.parse).catch(() => ({ users: {} }));
  return [...teams.byCode.values()].map((team) => ({
    code: team.code,
    teamId: team.code,
    displayName: team.displayName,
    enabled: team.enabled,
    memoryFile: team.memoryFile,
    aiPolicy: team.aiPolicy || { mode: "inherit" },
    memberCount: Object.values(usersRaw.users || {}).filter((user) => String(user.teamId).toUpperCase() === team.code).length
  }));
}

export async function getTeam(teamId) {
  const id = safeTeamId(teamId);
  const item = (await listTeams()).find((team) => team.code === id);
  if (!item) throw Object.assign(new Error("Không tìm thấy team."), { statusCode: 404, code: "TEAM_NOT_FOUND" });
  return item;
}

export async function patchTeam(teamId, patch) {
  const id = safeTeamId(teamId);
  return withTeamsLock(async () => {
    const parsed = await readTeamsFile();
    const teams = asArray(parsed);
    const team = teams.find((item) => String(item.code || "").toUpperCase() === id);
    if (!team) throw Object.assign(new Error("Không tìm thấy team."), { statusCode: 404, code: "TEAM_NOT_FOUND" });
    if (patch.displayName !== undefined) team.displayName = safeText(patch.displayName, 120);
    if (patch.enabled !== undefined) team.enabled = Boolean(patch.enabled);
    if (patch.aiPolicy !== undefined) team.aiPolicy = normalizeAiPolicy(safePolicy(patch.aiPolicy), "client");
    if (Array.isArray(parsed.teams)) parsed.teams = teams;
    else parsed.teams[id] = team;
    await writeTeamsFile(parsed);
    return getTeam(id);
  });
}
