import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isOutsideControlPrincipal } from "../src/principal-control.mjs";

test("outside-control rule covers IT team keys and legacy IT role aliases", () => {
  assert.equal(isOutsideControlPrincipal({
    principalType: "team",
    teamId: "IT"
  }), true);
  assert.equal(isOutsideControlPrincipal({
    principalType: "user",
    teamId: "SALES",
    role: "IT_ADMIN"
  }), true);
  assert.equal(isOutsideControlPrincipal({
    principalType: "user",
    teamId: "SALES",
    role: "Sales"
  }), false);
});

test("admin creation marks IT user outside control and does not create USER.md", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-admin-it-user-"));
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  const memoryDir = join(root, "memory");

  await writeFile(teamsFile, JSON.stringify({
    teams: [{
      code: "IT",
      displayName: "IT",
      enabled: true,
      memoryFile: "IT.md",
      aiPolicy: { mode: "test_only" }
    }]
  }));

  process.env.TEAMS_FILE = teamsFile;
  process.env.LTN_USERS_CONFIG_FILE = usersFile;
  process.env.MEMORY_DIR = memoryDir;
  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "false";

  const { createUser } = await import(`../src/admin/services/admin-users-service.mjs?it-admin=${Date.now()}`);
  const result = await createUser({
    userId: "it-admin",
    displayName: "IT Admin",
    teamId: "IT",
    role: "Administrator",
    apiKey: "it-admin-api-key",
    memoryMode: "full",
    aiPolicy: { mode: "inherit" }
  });

  assert.equal(result.user.outsideControl, true);
  assert.equal(result.user.memoryMode, "full");
  await assert.rejects(
    access(join(memoryDir, "users", "IT", "it-admin.md")),
    { code: "ENOENT" }
  );
});
