import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

test("IT users stay outside memory and analytics while routing normally", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-it-outside-control-"));
  const memoryDir = join(root, "memory");
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  const analyticsFile = join(root, "analytics.json");
  const key = "it-admin-integration-key";
  const hash = createHash("sha256").update(key).digest("hex");

  await mkdir(memoryDir, { recursive: true });
  await writeFile(join(memoryDir, "COMPANY.md"), "PRIVATE COMPANY MEMORY");
  await writeFile(join(memoryDir, "IT.md"), "PRIVATE IT MEMORY");
  await writeFile(teamsFile, JSON.stringify({
    teams: [{
      code: "IT",
      displayName: "IT",
      enabled: true,
      memoryFile: "IT.md",
      aiPolicy: { mode: "test_only", testCombo: "SIMI-GEMINI" }
    }]
  }));
  await writeFile(usersFile, JSON.stringify({
    version: 1,
    users: {
      "it-admin": {
        displayName: "IT Admin",
        teamId: "IT",
        role: "Administrator",
        keyHash: hash,
        enabled: true,
        memoryFile: "users/IT/it-admin.md",
        memoryMode: "full",
        aiPolicy: { mode: "inherit" }
      }
    }
  }));

  const requests = [];
  let extractionCalls = 0;
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
    requests.push({ url: req.url, body });
    res.setHeader("content-type", "application/json");
    if (req.url === "/v1/chat/completions" && body.model === "memory-test") {
      extractionCalls += 1;
      res.end(JSON.stringify({ choices: [{ message: { content: "NO_UPDATE" } }] }));
      return;
    }
    if (req.url === "/v1/responses") {
      res.end(JSON.stringify({
        status: "completed",
        usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
        output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "ok" }] }]
      }));
      return;
    }
    if (req.url === "/v1/chat/completions") {
      res.end(JSON.stringify({ choices: [{ message: { role: "assistant", content: "ok" } }] }));
      return;
    }
    res.writeHead(404).end("{}");
  });

  const upstreamPort = await listen(upstream);
  process.env.TEAMS_FILE = teamsFile;
  process.env.LTN_USERS_CONFIG_FILE = usersFile;
  process.env.MEMORY_DIR = memoryDir;
  process.env.UPSTREAM_BASE_URL = `http://127.0.0.1:${upstreamPort}`;
  process.env.MEMORY_MODEL = "memory-test";
  process.env.MEMORY_UPDATE_ENABLED = "true";
  process.env.CODEX_COMBO_TEST = "SIMI-GEMINI";
  process.env.CODEX_DEFAULT_POLICY = "test_only";
  process.env.CODEX_USAGE_FILE = join(root, "routing-usage.json");
  process.env.USER_ANALYTICS_FILE = analyticsFile;
  process.env.USER_ANALYTICS_ENABLED = "true";
  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "false";

  const { createGatewayServer } = await import(`../src/server.mjs?it-outside=${Date.now()}`);
  const gateway = createGatewayServer();
  const gatewayPort = await listen(gateway);
  const baseUrl = `http://127.0.0.1:${gatewayPort}`;

  try {
    const responsesResult = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "client-model", instructions: "IT INSTRUCTION", input: "IT QUESTION" })
    });
    assert.equal(responsesResult.status, 200);
    assert.equal(responsesResult.headers.get("x-ltn-route-tier"), "test");

    const chatResult = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: "client-model",
        messages: [{ role: "system", content: "IT SYSTEM" }, { role: "user", content: "IT QUESTION" }]
      })
    });
    assert.equal(chatResult.status, 200);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const responseRequest = requests.find((item) => item.url === "/v1/responses");
    const chatRequest = requests.find((item) =>
      item.url === "/v1/chat/completions" && item.body.model !== "memory-test"
    );
    assert.equal(responseRequest.body.model, "SIMI-GEMINI");
    assert.equal(responseRequest.body.instructions, "IT INSTRUCTION");
    assert.doesNotMatch(JSON.stringify(responseRequest.body), /PRIVATE COMPANY MEMORY|PRIVATE IT MEMORY/);
    assert.deepEqual(chatRequest.body.messages, [
      { role: "system", content: "IT SYSTEM" },
      { role: "user", content: "IT QUESTION" }
    ]);
    assert.equal(extractionCalls, 0);
    await assert.rejects(access(analyticsFile), { code: "ENOENT" });
    await assert.rejects(access(join(memoryDir, "users", "IT", "it-admin.md")), { code: "ENOENT" });
  } finally {
    await close(gateway);
    await close(upstream);
  }
});
