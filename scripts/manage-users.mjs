#!/usr/bin/env node
const args = process.argv.slice(2);
const command = args[0];

function usage() {
  console.log(`Usage:
  node scripts/manage-users.mjs create --user-id ID --display-name NAME --team TEAM --role ROLE
  node scripts/manage-users.mjs list
  node scripts/manage-users.mjs disable --user-id ID
  node scripts/manage-users.mjs enable --user-id ID
  node scripts/manage-users.mjs rotate-key --user-id ID

Options:
  --users-file PATH   Default: LTN_USERS_CONFIG_FILE or ./config/users.json
  --teams-file PATH   Default: TEAMS_FILE or ./config/teams.json`);
}

function opt(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] || "" : fallback;
}

if (opt("users-file")) process.env.LTN_USERS_CONFIG_FILE = opt("users-file");
if (opt("teams-file")) process.env.TEAMS_FILE = opt("teams-file");

const {
  createUser,
  listUsers,
  rotateUserKey,
  setUserEnabled
} = await import("../src/admin/services/admin-users-service.mjs");

try {
  if (!command || command === "--help" || command === "-h") {
    usage();
  } else if (command === "create") {
    const result = await createUser({
      userId: opt("user-id"),
      displayName: opt("display-name"),
      teamId: opt("team"),
      role: opt("role")
    });
    console.log(`User created: ${result.user.userId}`);
    console.log(`API key - chỉ hiển thị một lần: ${result.apiKey}`);
  } else if (command === "list") {
    const result = await listUsers({ limit: 1000 });
    for (const user of result.items) {
      console.log(`${user.userId}\t${user.displayName}\t${user.teamId}\t${user.role || ""}\t${user.enabled ? "enabled" : "disabled"}\t${user.aiPolicy?.mode || "inherit"}`);
    }
  } else if (command === "disable") {
    const user = await setUserEnabled(opt("user-id"), false);
    console.log(`Disabled user: ${user.userId}`);
  } else if (command === "enable") {
    const user = await setUserEnabled(opt("user-id"), true);
    console.log(`Enabled user: ${user.userId}`);
  } else if (command === "rotate-key") {
    const result = await rotateUserKey(opt("user-id"));
    console.log(`Rotated key for: ${result.user.userId}`);
    console.log(`API key mới - chỉ hiển thị một lần: ${result.apiKey}`);
  } else {
    usage();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
