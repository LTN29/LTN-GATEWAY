import { sha256 } from "./utils.mjs";
import { loadTeams } from "./config.mjs";

export async function authenticateTeam(rawKey) {
  const teams = await loadTeams();
  return teams.byHash.get(sha256(rawKey)) || null;
}
