import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash, randomUUID } from "node:crypto";
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

function team(code, key, aiPolicy = undefined) {
  return {
    code,
    displayName: code,
    keyHash: hash(key),
    memoryFile: `${code}.md`,
    enabled: true,
    ...(aiPolicy ? { aiPolicy } : {})
  };
}

async function postResponse(baseUrl, key, {
  clientId,
  model = "client-direct-gpt",
  input = "hello",
  requestId = randomUUID()
} = {}) {
  const headers = {
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    "x-request-id": requestId
  };
  if (clientId) headers["x-ltn-client-id"] = clientId;
  const response = await fetch(`${baseUrl}/v1/responses`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      input,
      aiPolicy: { mode: "premium_always" },
      routeTier: "premium",
      team: "IT"
    })
  });
  const bodyText = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    bodyText
  };
}

test("Codex routing applies per-team Premium/Free policy without trusting client body", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-codex-routing-test-"));
  const memoryDir = join(root, "memory");
  const teamsFile = join(root, "teams.json");
  await mkdir(memoryDir, { recursive: true });
  await writeFile(join(memoryDir, "COMPANY.md"), "# COMPANY\n");

  const keys = {
    it: "it-key",
    management: "management-key",
    warranty: "warranty-key",
    cskh: "cskh-key",
    defaultTeam: "default-key",
    teamScope: "team-scope-key",
    override: "override-key"
  };

  await writeFile(teamsFile, JSON.stringify({
    teams: [
      team("IT", keys.it, { mode: "premium_always" }),
      team("MANAGEMENT", keys.management, { mode: "premium_always" }),
      team("WARRANTY", keys.warranty, {
        mode: "limited_daily",
        premiumLimit: 3,
        usageScope: "client"
      }),
      team("CSKH", keys.cskh, { mode: "free_only" }),
      team("DEFAULT", keys.defaultTeam),
      team("TEAM_SCOPE", keys.teamScope, {
        mode: "limited_daily",
        premiumLimit: 1,
        usageScope: "team"
      }),
      team("OVERRIDE", keys.override, {
        mode: "limited_daily",
        premiumLimit: 1,
        usageScope: "client",
        premiumCombo: "TEAM-GPT",
        freeCombo: "TEAM-FREE"
      })
    ]
  }));

  const upstreamRequests = [];
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length
      ? JSON.parse(Buffer.concat(chunks).toString("utf8"))
      : null;
    upstreamRequests.push({ url: req.url, body });

    if (req.url === "/v1/responses") {
      if (body.input === "fail-upstream") {
        res.writeHead(500, { "content-type": "application/json" });
        res.end('{"error":{"message":"upstream failed"}}');
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        id: "resp_test",
        object: "response",
        status: "completed",
        model: body.model,
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
      res.end(JSON.stringify({
        choices: [{ message: { role: "assistant", content: "# X\n" } }]
      }));
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end("{}");
  });

  const upstreamPort = await listen(upstream);
  process.env.TEAMS_FILE = teamsFile;
  process.env.MEMORY_DIR = memoryDir;
  process.env.UPSTREAM_BASE_URL = `http://127.0.0.1:${upstreamPort}`;
  process.env.MEMORY_UPDATE_ENABLED = "false";
  process.env.CODEX_COMBO_PREMIUM = "SIMI-GPT";
  process.env.CODEX_COMBO_FREE = "SIMI-FREE";
  process.env.CODEX_DEFAULT_POLICY = "limited_daily";
  process.env.CODEX_DEFAULT_PREMIUM_LIMIT = "2";
  process.env.CODEX_USAGE_TIMEZONE = "Asia/Ho_Chi_Minh";
  process.env.CODEX_USAGE_FILE = join(root, "codex-usage.json");
  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "true";

  const capturedLogs = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = function write(chunk, ...args) {
    capturedLogs.push(String(chunk));
    return originalWrite.call(this, chunk, ...args);
  };

  const { createGatewayServer } = await import(
    `../src/server.mjs?routing=${Date.now()}`
  );
  const gateway = createGatewayServer();
  const gatewayPort = await listen(gateway);
  const baseUrl = `http://127.0.0.1:${gatewayPort}`;

  const clientA = "11111111-1111-4111-8111-111111111111";
  const clientB = "22222222-2222-4222-8222-222222222222";
  const fullClientId = "33333333-3333-4333-8333-333333333333";

  try {
    for (let i = 0; i < 5; i += 1) {
      const response = await postResponse(baseUrl, keys.it);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-ltn-route-tier"), "premium");
    }
    assert.equal(upstreamRequests.at(-1).body.model, "SIMI-GPT");

    for (let i = 0; i < 5; i += 1) {
      const response = await postResponse(baseUrl, keys.management);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-ltn-route-tier"), "premium");
    }
    assert.equal(upstreamRequests.at(-1).body.model, "SIMI-GPT");

    for (let i = 1; i <= 4; i += 1) {
      const response = await postResponse(baseUrl, keys.warranty, {
        clientId: clientA,
        model: "direct-premium-gpt"
      });
      assert.equal(response.status, 200);
      assert.equal(
        response.headers.get("x-ltn-route-tier"),
        i <= 3 ? "premium" : "free"
      );
      assert.equal(upstreamRequests.at(-1).body.model, i <= 3 ? "SIMI-GPT" : "SIMI-FREE");
    }

    const clientBFirst = await postResponse(baseUrl, keys.warranty, {
      clientId: clientB
    });
    assert.equal(clientBFirst.headers.get("x-ltn-route-tier"), "premium");

    const missingClient = await postResponse(baseUrl, keys.warranty);
    assert.equal(missingClient.status, 400);

    const badClient = await postResponse(baseUrl, keys.warranty, {
      clientId: "not-a-uuid"
    });
    assert.equal(badClient.status, 400);

    const failedUpstream = await postResponse(baseUrl, keys.warranty, {
      clientId: "55555555-5555-4555-8555-555555555555",
      input: "fail-upstream"
    });
    assert.equal(failedUpstream.status, 500);
    const afterFailure = await postResponse(baseUrl, keys.warranty, {
      clientId: "55555555-5555-4555-8555-555555555555"
    });
    assert.equal(afterFailure.headers.get("x-ltn-route-tier"), "premium");

    const freeOnly = await postResponse(baseUrl, keys.cskh);
    assert.equal(freeOnly.status, 200);
    assert.equal(freeOnly.headers.get("x-ltn-route-tier"), "free");
    assert.equal(upstreamRequests.at(-1).body.model, "SIMI-FREE");

    const defaultFirst = await postResponse(baseUrl, keys.defaultTeam, {
      clientId: fullClientId
    });
    const defaultSecond = await postResponse(baseUrl, keys.defaultTeam, {
      clientId: fullClientId
    });
    const defaultThird = await postResponse(baseUrl, keys.defaultTeam, {
      clientId: fullClientId
    });
    assert.equal(defaultFirst.headers.get("x-ltn-route-tier"), "premium");
    assert.equal(defaultSecond.headers.get("x-ltn-route-tier"), "premium");
    assert.equal(defaultThird.headers.get("x-ltn-route-tier"), "free");

    const teamScopeFirst = await postResponse(baseUrl, keys.teamScope);
    const teamScopeSecond = await postResponse(baseUrl, keys.teamScope, {
      clientId: clientB
    });
    assert.equal(teamScopeFirst.status, 200);
    assert.equal(teamScopeFirst.headers.get("x-ltn-route-tier"), "premium");
    assert.equal(teamScopeSecond.headers.get("x-ltn-route-tier"), "free");

    const overrideFirst = await postResponse(baseUrl, keys.override, {
      clientId: clientA
    });
    const overrideSecond = await postResponse(baseUrl, keys.override, {
      clientId: clientA
    });
    assert.equal(overrideFirst.headers.get("x-ltn-route-tier"), "premium");
    assert.equal(overrideSecond.headers.get("x-ltn-route-tier"), "free");
    assert.equal(upstreamRequests.at(-2).body.model, "TEAM-GPT");
    assert.equal(upstreamRequests.at(-1).body.model, "TEAM-FREE");

    const configResponse = await fetch(`${baseUrl}/v1/codex/config`, {
      headers: { authorization: `Bearer ${keys.warranty}` }
    });
    assert.equal(configResponse.status, 200);
    assert.deepEqual(await configResponse.json(), {
      team: "WARRANTY",
      routing: {
        mode: "limited_daily",
        premiumLimit: 3,
        usageScope: "client",
        resetTimezone: "Asia/Ho_Chi_Minh"
      },
      combos: {
        premium: "SIMI-GPT",
        free: "SIMI-FREE"
      }
    });

    const concurrent = await Promise.all(
      Array.from({ length: 4 }, (_, index) => postResponse(baseUrl, keys.warranty, {
        clientId: "44444444-4444-4444-8444-444444444444",
        requestId: `concurrent-${index}`
      }))
    );
    assert.deepEqual(
      concurrent.map((response) => response.headers.get("x-ltn-route-tier")).sort(),
      ["free", "premium", "premium", "premium"]
    );

    const rawUsage = JSON.parse(await readFile(process.env.CODEX_USAGE_FILE, "utf8"));
    const usageRecords = Object.values(rawUsage.codex_daily_usage);
    assert.ok(usageRecords.some((record) =>
      record.team_code === "WARRANTY" &&
      record.client_id_hash &&
      record.successful_request_count >= 4
    ));
    assert.ok(usageRecords.some((record) =>
      record.team_code === "TEAM_SCOPE" &&
      record.client_id_hash === "" &&
      record.successful_request_count === 2
    ));
    assert.equal(
      usageRecords.some((record) => record.team_code === "IT"),
      false
    );
    assert.equal(
      usageRecords.some((record) => record.team_code === "CSKH"),
      false
    );

    const logs = capturedLogs.join("");
    assert.match(logs, /codex_route_selected/);
    assert.doesNotMatch(logs, /it-key|warranty-key|management-key|cskh-key|default-key/);
    assert.doesNotMatch(logs, new RegExp(fullClientId));
    assert.doesNotMatch(logs, new RegExp(clientA));
  } finally {
    process.stdout.write = originalWrite;
    await close(gateway);
    await close(upstream);
  }
});
