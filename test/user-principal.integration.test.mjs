import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function waitFor(check, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for async user usage write");
}

async function postResponse(baseUrl, key, clientId) {
  const response = await fetch(`${baseUrl}/v1/responses`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      "x-ltn-client-id": clientId
    },
    body: JSON.stringify({ model: "client-model", input: "hello" })
  });
  return {
    status: response.status,
    route: response.headers.get("x-ltn-route-tier"),
    body: await response.text()
  };
}

test("user key resolves user principal and premium limit is shared across devices", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-user-principal-test-"));
  const memoryDir = join(root, "memory");
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  const usageFile = join(root, "codex-usage.json");
  const analyticsFile = join(root, "user-analytics.json");
  await mkdir(memoryDir, { recursive: true });
  await writeFile(join(memoryDir, "COMPANY.md"), "# COMPANY\n");
  await writeFile(join(memoryDir, "SALES.md"), "# SALES\n");

  const userKey = "user-sales-ngoc-key";
  const legacyTeamKey = "legacy-sales-key";
  await writeFile(teamsFile, JSON.stringify({
    teams: [{
      code: "SALES",
      displayName: "Kinh doanh",
      keyHash: hash(legacyTeamKey),
      memoryFile: "SALES.md",
      enabled: true,
      aiPolicy: {
        mode: "limited_daily",
        premiumLimit: 2,
        usageScope: "client"
      }
    }]
  }));
  await writeFile(usersFile, JSON.stringify({
    version: 1,
    users: {
      "sales-ngoc": {
        displayName: "Ngọc",
        teamId: "SALES",
        role: "Tư vấn Shopee",
        keyHash: hash(userKey),
        enabled: true,
        memoryFile: "users/SALES/sales-ngoc.md",
        aiPolicy: { mode: "inherit" }
      }
    }
  }));

  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : null;
    if (req.url === "/v1/responses") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        object: "response",
        status: "completed",
        model: body.model,
        usage: { input_tokens: 3, output_tokens: 4, total_tokens: 7 },
        output: [{
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "ok" }]
        }]
      }));
      return;
    }
    if (req.url === "/v1/chat/completions") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ choices: [{ message: { content: "NO_UPDATE" } }] }));
      return;
    }
    res.writeHead(404).end("{}");
  });

  const upstreamPort = await listen(upstream);
  process.env.TEAMS_FILE = teamsFile;
  process.env.LTN_USERS_CONFIG_FILE = usersFile;
  process.env.MEMORY_DIR = memoryDir;
  process.env.UPSTREAM_BASE_URL = `http://127.0.0.1:${upstreamPort}`;
  process.env.MEMORY_UPDATE_ENABLED = "false";
  process.env.CODEX_COMBO_PREMIUM = "SIMI-GPT";
  process.env.CODEX_COMBO_FREE = "SIMI-FREE";
  process.env.CODEX_USAGE_FILE = usageFile;
  process.env.USER_ANALYTICS_FILE = analyticsFile;
  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "true";

  const { createGatewayServer } = await import(`../src/server.mjs?user=${Date.now()}`);
  const gateway = createGatewayServer();
  const port = await listen(gateway);
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const configResponse = await fetch(`${baseUrl}/v1/codex/config`, {
      headers: { authorization: `Bearer ${userKey}` }
    });
    assert.equal(configResponse.status, 200);
    const codexConfig = await configResponse.json();
    assert.equal(codexConfig.principalType, "user");
    assert.equal(codexConfig.userId, "sales-ngoc");
    assert.equal(codexConfig.teamId, "SALES");
    assert.equal(codexConfig.routing.usageScope, "user");

    const clientA = "11111111-1111-4111-8111-111111111111";
    const clientB = "22222222-2222-4222-8222-222222222222";
    assert.equal((await postResponse(baseUrl, userKey, clientA)).route, "premium");
    assert.equal((await postResponse(baseUrl, userKey, clientB)).route, "premium");
    assert.equal((await postResponse(baseUrl, userKey, clientA)).route, "free");

    await waitFor(async () => {
      const usage = JSON.parse(await readFile(usageFile, "utf8"));
      const record = Object.values(usage.codex_daily_usage)
        .find((item) => item.user_id === "sales-ngoc");
      return record?.successful_request_count === 3;
    });
    const usage = JSON.parse(await readFile(usageFile, "utf8"));
    const userRecords = Object.values(usage.codex_daily_usage)
      .filter((record) => record.user_id === "sales-ngoc");
    assert.equal(userRecords.length, 1);
    assert.equal(userRecords[0].principal_type, "user");
    assert.equal(userRecords[0].successful_request_count, 3);
    assert.doesNotMatch(await readFile(usageFile, "utf8"), new RegExp(clientA));

    await waitFor(async () => {
      const analytics = JSON.parse(await readFile(analyticsFile, "utf8"));
      const aggregate = Object.values(analytics.dailyUsers)
        .find((record) => record.userId === "sales-ngoc");
      return aggregate?.requests === 3;
    });
    const analytics = JSON.parse(await readFile(analyticsFile, "utf8"));
    const aggregate = Object.values(analytics.dailyUsers)
      .find((record) => record.userId === "sales-ngoc");
    assert.equal(aggregate.requests, 3);
    assert.equal(aggregate.inputTokens, 9);
    assert.equal(aggregate.outputTokens, 12);
    assert.equal(aggregate.totalTokens, 21);
    assert.doesNotMatch(await readFile(analyticsFile, "utf8"), /hello|user-sales-ngoc-key/);
  } finally {
    await close(gateway);
    await close(upstream);
  }
});

test("user config rejects duplicate hash and user hash matching legacy team key", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-user-config-test-"));
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  await writeFile(teamsFile, JSON.stringify({
    teams: [{
      code: "SALES",
      keyHash: hash("team-key"),
      enabled: true,
      memoryFile: "SALES.md"
    }]
  }));
  process.env.TEAMS_FILE = teamsFile;
  process.env.LTN_USERS_CONFIG_FILE = usersFile;
  process.env.MEMORY_DIR = join(root, "memory");

  await writeFile(usersFile, JSON.stringify({
    version: 1,
    users: {
      "sales-a": { teamId: "SALES", keyHash: hash("same"), enabled: true },
      "sales-b": { teamId: "SALES", keyHash: hash("same"), enabled: true }
    }
  }));
  let mod = await import(`../src/config.mjs?dup=${Date.now()}`);
  await assert.rejects(() => mod.loadUsers({ force: true }), /Trùng keyHash/);

  await writeFile(usersFile, JSON.stringify({
    version: 1,
    users: {
      "sales-a": { teamId: "SALES", keyHash: hash("team-key"), enabled: true }
    }
  }));
  mod = await import(`../src/config.mjs?teamhash=${Date.now()}`);
  await assert.rejects(() => mod.loadUsers({ force: true }), /trùng legacy team keyHash/);
});

test("team config can be team-only when legacy team keys are disabled", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-team-only-config-test-"));
  const teamsFile = join(root, "teams.json");
  await writeFile(teamsFile, JSON.stringify({
    teams: [{
      code: "CSKH",
      displayName: "CSKH",
      enabled: true,
      memoryFile: "CSKH.md",
      aiPolicy: { mode: "limited_daily", premiumLimit: 3, usageScope: "user" }
    }]
  }));
  process.env.TEAMS_FILE = teamsFile;
  process.env.MEMORY_DIR = join(root, "memory");

  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "false";
  let mod = await import(`../src/config.mjs?teamonly=${Date.now()}`);
  let teams = await mod.loadTeams({ force: true });
  assert.equal(teams.byCode.get("CSKH").displayName, "CSKH");
  assert.equal(teams.byHash.size, 0);

  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "true";
  mod = await import(`../src/config.mjs?teamonlylegacy=${Date.now()}`);
  await assert.rejects(() => mod.loadTeams({ force: true }), /thiếu keyHash/);
});

test("legacy team key follows compatibility flag", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-legacy-flag-test-"));
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  await writeFile(teamsFile, JSON.stringify({
    teams: [{
      code: "SALES",
      keyHash: hash("team-key"),
      enabled: true,
      memoryFile: "SALES.md"
    }]
  }));
  await writeFile(usersFile, JSON.stringify({ version: 1, users: {} }));
  process.env.TEAMS_FILE = teamsFile;
  process.env.LTN_USERS_CONFIG_FILE = usersFile;
  process.env.MEMORY_DIR = join(root, "memory");

  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "true";
  let auth = await import(`../src/auth.mjs?legacyon=${Date.now()}`);
  assert.equal((await auth.authenticatePrincipal("team-key")).principalType, "team");

  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "false";
  auth = await import(`../src/auth.mjs?legacyoff=${Date.now()}`);
  assert.equal(await auth.authenticatePrincipal("team-key"), null);
});
