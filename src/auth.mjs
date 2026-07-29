import { timingSafeEqual } from "node:crypto";
import { sha256 } from "./utils.mjs";
import { config, loadTeams, loadUsers } from "./config.mjs";

function safeHashEqual(a, b) {
  const left = Buffer.from(String(a || ""), "hex");
  const right = Buffer.from(String(b || ""), "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

function teamPrincipal(team) {
  return {
    principalType: "team",
    principalId: team.code,
    userId: null,
    teamId: team.code,
    team,
    displayName: team.displayName,
    role: null,
    memoryMode: "full",
    enabled: team.enabled,
    aiPolicy: team.aiPolicy,
    memoryFile: null
  };
}

export async function authenticatePrincipal(rawKey) {
  const keyHash = sha256(rawKey);
  const users = await loadUsers();

  for (const user of users.byId.values()) {
    if (!safeHashEqual(keyHash, user.keyHash)) continue;
    return user;
  }

  if (!config.legacyTeamKeysEnabled) return null;

  const teams = await loadTeams();
  for (const team of teams.byCode.values()) {
    if (!safeHashEqual(keyHash, team.keyHash)) continue;
    return teamPrincipal(team);
  }

  return null;
}

export async function authenticateTeam(rawKey) {
  const principal = await authenticatePrincipal(rawKey);
  return principal?.team || null;
}
