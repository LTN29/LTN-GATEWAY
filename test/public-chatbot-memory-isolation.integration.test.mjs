import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
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

test("public chatbot principal neither receives nor extracts memory", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-public-chatbot-"));
  const memoryDir = join(root, "memory");
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  const key = "public-chatbot-integration-key";
  const hash = (value) => createHash("sha256").update(value).digest("hex");
  await mkdir(memoryDir, { recursive: true });
  await writeFile(teamsFile, JSON.stringify({
    teams: [{
      code: "WARRANTY",
      displayName: "Warranty",
      enabled: true,
      memoryFile: "WARRANTY.md",
      aiPolicy: { mode: "free_only" }
    }]
  }));
  await writeFile(usersFile, JSON.stringify({
    version: 1,
    users: {
      "warranty-public-chatbot": {
        displayName: "Warranty Public Chatbot",
        teamId: "WARRANTY",
        role: "PUBLIC_CHATBOT_SERVICE",
        keyHash: hash(key),
        enabled: true,
        memoryFile: "users/WARRANTY/warranty-public-chatbot.md",
        memoryMode: "none",
        aiPolicy: { mode: "free_only" }
      }
    }
  }));
  await writeFile(join(memoryDir, "COMPANY.md"), "# COMPANY\nPRIVATE COMPANY MEMORY");
  await writeFile(join(memoryDir, "WARRANTY.md"), "# WARRANTY\nPRIVATE WARRANTY MEMORY");

  const requests = [];
  let extractionCalls = 0;
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
    requests.push({ url: req.url, body });
    res.setHeader("content-type", "application/json");
    if (req.url === "/v1/models") {
      res.end(JSON.stringify({ data: [{ id: "SIMI-FREE", owned_by: "combo" }] }));
      return;
    }
    if (req.url === "/v1/chat/completions" && body.model === "memory-test") {
      extractionCalls += 1;
      res.end(JSON.stringify({ choices: [{ message: { content: "{\"version\":1,\"candidates\":[]}" } }] }));
      return;
    }
    if (req.url === "/v1/responses") {
      res.end(JSON.stringify({
        id: "resp_public",
        status: "completed",
        output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "safe" }] }]
      }));
      return;
    }
    if (req.url === "/v1/chat/completions") {
      res.end(JSON.stringify({ choices: [{ message: { role: "assistant", content: "safe" } }] }));
      return;
    }
    res.writeHead(404);
    res.end("{}");
  });

  const upstreamPort = await listen(upstream);
  process.env.TEAMS_FILE = teamsFile;
  process.env.LTN_USERS_CONFIG_FILE = usersFile;
  process.env.MEMORY_DIR = memoryDir;
  process.env.UPSTREAM_BASE_URL = `http://127.0.0.1:${upstreamPort}`;
  process.env.MEMORY_MODEL = "memory-test";
  process.env.CODEX_COMBO_FREE = "SIMI-FREE";
  process.env.CODEX_DEFAULT_POLICY = "free_only";
  process.env.CODEX_USAGE_FILE = join(root, "usage.json");
  process.env.USER_ANALYTICS_FILE = join(root, "analytics.json");
  process.env.USER_USAGE_FILE = join(root, "user-usage.json");
  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "false";

  const { createGatewayServer } = await import(`../src/server.mjs?public-memory=${Date.now()}`);
  const gateway = createGatewayServer();
  const gatewayPort = await listen(gateway);
  const baseUrl = `http://127.0.0.1:${gatewayPort}`;

  try {
    const responsesResult = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "client-model", instructions: "PUBLIC INSTRUCTION", input: "question" })
    });
    assert.equal(responsesResult.status, 200);

    const chatResult = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "client-model", messages: [{ role: "system", content: "PUBLIC SYSTEM" }, { role: "user", content: "question" }] })
    });
    assert.equal(chatResult.status, 200);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const responseRequest = requests.find((item) => item.url === "/v1/responses");
    const chatRequest = requests.find((item) => item.url === "/v1/chat/completions" && item.body.model !== "memory-test");
    assert.equal(responseRequest.body.instructions, "PUBLIC INSTRUCTION");
    assert.doesNotMatch(JSON.stringify(responseRequest.body), /PRIVATE COMPANY MEMORY|PRIVATE WARRANTY MEMORY/);
    assert.deepEqual(chatRequest.body.messages, [
      { role: "system", content: "PUBLIC SYSTEM" },
      { role: "user", content: "question" }
    ]);
    assert.equal(extractionCalls, 0);
  } finally {
    await close(gateway);
    await close(upstream);
  }
});
