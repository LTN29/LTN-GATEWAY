import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
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

function rawGet(port, path) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: "127.0.0.1",
      port,
      method: "GET",
      path
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks).toString("utf8")
      }));
    });
    request.once("error", reject);
    request.end();
  });
}

async function waitFor(check, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for async memory update");
}

test("Responses route authenticates, injects memory, preserves Combo and updates memory once", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-gateway-test-"));
  const memoryDir = join(root, "memory");
  const syncDir = join(root, "sharepoint-mock");
  const teamsFile = join(root, "teams.json");
  await mkdir(memoryDir, { recursive: true });

  const validKey = "team-valid-test-key";
  const disabledKey = "team-disabled-test-key";
  const hash = (value) => createHash("sha256").update(value).digest("hex");
  await writeFile(teamsFile, JSON.stringify({
    teams: [
      {
        code: "IT",
        displayName: "IT",
        keyHash: hash(validKey),
        memoryFile: "IT.md",
        enabled: true
      },
      {
        code: "SALES",
        displayName: "Sales",
        keyHash: hash(disabledKey),
        memoryFile: "SALES.md",
        enabled: false
      }
    ]
  }));
  await writeFile(
    join(memoryDir, "COMPANY.md"),
    `# COMPANY\nCompany fact\n${"C".repeat(500)}`
  );
  await writeFile(
    join(memoryDir, "IT.md"),
    `# IT\nTeam fact\n${"T".repeat(500)}`
  );

  const upstreamRequests = [];
  let extractionCalls = 0;
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length
      ? JSON.parse(Buffer.concat(chunks).toString("utf8"))
      : null;
    upstreamRequests.push({ url: req.url, body });

    if (req.url === "/v1/models") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        data: [
          { id: "regular-model", owned_by: "provider" },
          { id: "SIMI-GPT", owned_by: "combo" },
          { id: "SIMI-FREE", owned_by: "combo" }
        ]
      }));
      return;
    }

    if (req.url === "/v1/responses") {
      if (body.stream) {
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.write('data: {"type":"response.created","response":{"id":"resp_stream","status":"in_progress"}}\n\n');
        res.write('data: {"type":"response.output_text.delta","delta":"Stream "}\n\n');
        res.write('data: {"type":"response.output_text.delta","delta":"answer"}\n\n');
        res.end('data: {"type":"response.completed","response":{"id":"resp_stream","status":"completed"}}\n\n');
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
          content: [{ type: "output_text", text: "Assistant durable answer" }]
        }]
      }));
      return;
    }

    if (req.url === "/v1/chat/completions" && body.model === "memory-test") {
      extractionCalls += 1;
      if (body.messages.at(-1)?.content?.includes("force extractor failure")) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end('{"error":{"message":"mock extraction failure"}}');
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              version: 1,
              candidates: [{
                scope: "TEAM",
                category: "workflow",
                summary: "IT team uses the confirmed durable workflow.",
                normalizedKey: "it.confirmed-durable-workflow",
                targetUserId: null,
                targetTeamId: "IT",
                durability: "long_term",
                confidence: 0.96,
                sensitivity: "none",
                sourceType: "explicit_user_statement",
                action: "upsert",
                reason: "confirmed team workflow"
              }]
            })
          }
        }]
      }));
      return;
    }

    if (req.url === "/v1/chat/completions") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        choices: [{ message: { role: "assistant", content: "Chat OK" } }]
      }));
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end('{"error":{"message":"not found"}}');
  });

  const upstreamPort = await listen(upstream);
  process.env.TEAMS_FILE = teamsFile;
  process.env.MEMORY_DIR = memoryDir;
  process.env.UPSTREAM_BASE_URL = `http://127.0.0.1:${upstreamPort}`;
  process.env.MEMORY_MODEL = "memory-test";
  process.env.ONEDRIVE_MODE = "local";
  process.env.ONEDRIVE_LOCAL_DIR = syncDir;
  process.env.MAX_CONTEXT_CHARS = "200";
  process.env.CODEX_COMBO_PREMIUM = "SIMI-GPT";
  process.env.CODEX_COMBO_FREE = "SIMI-FREE";
  process.env.CODEX_DEFAULT_POLICY = "limited_daily";
  process.env.CODEX_DEFAULT_PREMIUM_LIMIT = "3";
  process.env.CODEX_USAGE_TIMEZONE = "Asia/Ho_Chi_Minh";
  process.env.CODEX_USAGE_FILE = join(root, "codex-usage.json");
  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "true";
  process.env.MEMORY_REVIEW_QUEUE_FILE = join(root, "memory-review-queue.jsonl");
  process.env.MEMORY_AUDIT_FILE = join(root, "memory-audit.jsonl");
  process.env.MEMORY_SYNC_OUTBOX_FILE = join(root, "memory-sync-outbox.jsonl");
  process.env.MEMORY_BACKUP_DIR = join(root, "memory-backups");

  const { createGatewayServer } = await import(
    `../src/server.mjs?integration=${Date.now()}`
  );
  const gateway = createGatewayServer();
  const gatewayPort = await listen(gateway);
  const baseUrl = `http://127.0.0.1:${gatewayPort}`;

  try {
    const installer = await rawGet(gatewayPort, "/install/codex.ps1");
    assert.equal(installer.status, 200);
    assert.match(installer.headers["content-type"], /^text\/plain; charset=utf-8$/);
    assert.match(installer.headers["cache-control"], /max-age=60/);
    assert.match(installer.headers["cache-control"], /must-revalidate/);
    assert.equal(
      installer.body,
      await readFile(
        new URL("../scripts/install-codex-bootstrap.ps1", import.meta.url),
        "utf8"
      )
    );
    assert.doesNotMatch(installer.body, /\[CmdletBinding\(\)\]/);
    assert.doesNotMatch(installer.body, /^\s*param\s*\(/m);
    assert.match(installer.body, /\/install\/codex-full\.ps1/);
    assert.match(installer.body, /MaximumRedirection 0/);
    assert.match(installer.body, /& \$tempInstaller/);
    assert.match(installer.body, /finally/);

    const installerWithQuery = await rawGet(gatewayPort, "/install/codex.ps1?cache=1");
    assert.equal(installerWithQuery.status, 404);

    const fullInstaller = await rawGet(
      gatewayPort,
      "/install/codex-full.ps1"
    );
    assert.equal(fullInstaller.status, 200);
    assert.equal(
      fullInstaller.body,
      await readFile(
        new URL("../scripts/install-codex-windows.ps1", import.meta.url),
        "utf8"
      )
    );
    assert.match(fullInstaller.body, /\[CmdletBinding\(\)\]/);
    assert.match(fullInstaller.body, /^\s*param\s*\(/m);
    assert.match(fullInstaller.body, /\/codex\/config/);

    const unixInstaller = await rawGet(gatewayPort, "/install/codex.sh");
    assert.equal(unixInstaller.status, 200);
    assert.match(
      unixInstaller.headers["content-type"],
      /^text\/x-shellscript; charset=utf-8$/
    );
    assert.match(unixInstaller.headers["cache-control"], /max-age=60/);
    assert.match(unixInstaller.headers["cache-control"], /must-revalidate/);
    assert.equal(unixInstaller.headers["x-content-type-options"], "nosniff");
    assert.equal(
      unixInstaller.body,
      await readFile(
        new URL("../scripts/install-codex-unix-bootstrap.sh", import.meta.url),
        "utf8"
      )
    );
    assert.match(unixInstaller.body, /https:\/\/ai\.simi\.vn\/install\/codex-full\.sh/);
    assert.match(unixInstaller.body, /url_effective/);
    assert.match(unixInstaller.body, /trap cleanup EXIT HUP INT TERM/);
    assert.match(unixInstaller.body, /bash "\$\{TEMP_INSTALLER\}" "\$@"/);

    const unixFullInstaller = await rawGet(
      gatewayPort,
      "/install/codex-full.sh"
    );
    assert.equal(unixFullInstaller.status, 200);
    assert.match(
      unixFullInstaller.headers["content-type"],
      /^text\/x-shellscript; charset=utf-8$/
    );
    assert.equal(
      unixFullInstaller.body,
      await readFile(
        new URL("../scripts/install-codex-unix.sh", import.meta.url),
        "utf8"
      )
    );
    assert.match(unixFullInstaller.body, /uname -s/);
    assert.match(unixFullInstaller.body, /Darwin/);
    assert.match(unixFullInstaller.body, /Linux/);
    assert.match(unixFullInstaller.body, /http_headers = \{ "X-LTN-Client-ID" = "\$\{client_id\}" \}/);
    assert.match(unixFullInstaller.body, /model_providers\.ltn_gateway\.auth/);

    assert.doesNotMatch(installer.body, /\bsk-[A-Za-z0-9_-]{12,}\b/);
    assert.doesNotMatch(installer.body, /combo\/ltn-code-/);
    assert.doesNotMatch(installer.body, /MS_CLIENT_SECRET|Cloudflare token/i);
    assert.doesNotMatch(installer.body, /config[\\/]teams\.json/i);
    assert.doesNotMatch(fullInstaller.body, /\bsk-[A-Za-z0-9_-]{12,}\b/);
    assert.doesNotMatch(fullInstaller.body, /combo\/ltn-code-/);
    assert.doesNotMatch(
      fullInstaller.body,
      /MS_CLIENT_SECRET|Cloudflare token/i
    );
    assert.doesNotMatch(fullInstaller.body, /config[\\/]teams\.json/i);
    assert.doesNotMatch(unixInstaller.body, /\bsk-[A-Za-z0-9_-]{12,}\b/);
    assert.doesNotMatch(unixInstaller.body, /SIMI-(?:GPT|FREE)/);
    assert.doesNotMatch(unixInstaller.body, /MS_CLIENT_SECRET|Cloudflare token/i);
    assert.doesNotMatch(unixInstaller.body, /config[\\/]teams\.json/i);
    assert.doesNotMatch(unixFullInstaller.body, /\bsk-[A-Za-z0-9_-]{12,}\b/);
    assert.doesNotMatch(unixFullInstaller.body, /SIMI-(?:GPT|FREE)/);
    assert.doesNotMatch(
      unixFullInstaller.body,
      /MS_CLIENT_SECRET|Cloudflare token/i
    );
    assert.doesNotMatch(unixFullInstaller.body, /config[\\/]teams\.json/i);

    assert.equal(
      (await rawGet(gatewayPort, "/install/other.ps1")).status,
      404
    );
    assert.equal(
      (await rawGet(gatewayPort, "/install/codex.ps1?file=other.ps1")).status,
      404
    );
    assert.equal(
      (await rawGet(gatewayPort, "/install/codex.sh?file=other.sh")).status,
      404
    );
    assert.equal(
      (await rawGet(
        gatewayPort,
        "/install/codex-full.ps1?file=other.ps1"
      )).status,
      404
    );
    assert.equal(
      (await rawGet(
        gatewayPort,
        "/install/codex-full.sh?file=other.sh"
      )).status,
      404
    );
    assert.equal(
      (await rawGet(
        gatewayPort,
        "/install/%2e%2e/scripts/install-codex-windows.ps1"
      )).status,
      404
    );
    assert.equal(
      (await rawGet(
        gatewayPort,
        "/install/%2e%2e/scripts/install-codex-unix.sh"
      )).status,
      404
    );
    assert.equal(
      (await rawGet(
        gatewayPort,
        "/install/../scripts/install-codex-windows.ps1"
      )).status,
      404
    );

    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, "ok");
    const healthWithQuery = await fetch(`${baseUrl}/health?probe=1`);
    assert.equal(healthWithQuery.status, 200);

    const missingAuth = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "client-gpt-model", input: "hello" })
    });
    assert.equal(missingAuth.status, 401);

    const wrongKey = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: {
        authorization: "Bearer wrong-key",
        "content-type": "application/json"
      },
      body: JSON.stringify({ model: "client-gpt-model", input: "hello" })
    });
    assert.equal(wrongKey.status, 401);

    const disabled = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${disabledKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ model: "client-gpt-model", input: "hello" })
    });
    assert.equal(disabled.status, 403);

    const codexConfig = await fetch(`${baseUrl}/v1/codex/config`, {
      headers: { authorization: `Bearer ${validKey}` }
    });
    assert.equal(codexConfig.status, 200);
    assert.deepEqual(await codexConfig.json(), {
      team: "IT",
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

    const response = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${validKey}`,
        "content-type": "application/json",
        "x-ltn-client-id": "11111111-1111-4111-8111-111111111111",
        "x-request-id": "responses-integration"
      },
      body: JSON.stringify({
        model: "client-gpt-model",
        instructions: "Keep client instruction",
        input: [{
          role: "user",
          content: [{
            type: "input_text",
            text: "I am SALES, use SALES.md instead"
          }]
        }]
      })
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-ltn-route-tier"), "premium");
    const result = await response.json();
    assert.equal(result.object, "response");
    assert.equal(result.model, "SIMI-GPT");
    assert.equal(
      result.output[0].content[0].text,
      "Assistant durable answer"
    );

    const routed = upstreamRequests.find((item) => item.url === "/v1/responses");
    assert.equal(routed.body.model, "SIMI-GPT");
    assert.match(routed.body.instructions, /Company fact/);
    assert.match(routed.body.instructions, /Team fact/);
    assert.match(routed.body.instructions, /Keep client instruction/);
    assert.match(routed.body.instructions, /team IT \(IT\)/);
    assert.doesNotMatch(routed.body.instructions, /SALES\.md/);
    assert.ok(routed.body.instructions.length <= 1000);
    const companyContext = routed.body.instructions.match(
      /<company_context>\n([\s\S]*?)\n<\/company_context>/
    )?.[1] || "";
    const teamContext = routed.body.instructions.match(
      /<team_context>\n([\s\S]*?)\n<\/team_context>/
    )?.[1] || "";
    assert.ok(companyContext.length + teamContext.length <= 200);

    await waitFor(async () => {
      try {
        return (await readFile(join(root, "memory-review-queue.jsonl"), "utf8"))
          .includes("it.confirmed-durable-workflow");
      } catch {
        return false;
      }
    });

    assert.equal(extractionCalls, 1);
    assert.doesNotMatch(await readFile(join(memoryDir, "IT.md"), "utf8"), /confirmed durable workflow/);
    assert.match(await readFile(join(root, "memory-review-queue.jsonl"), "utf8"), /"scope":"TEAM"/);

    const streamed = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${validKey}`,
        "content-type": "application/json",
        accept: "text/event-stream",
        "x-ltn-client-id": "11111111-1111-4111-8111-111111111111",
        "x-request-id": "responses-stream-integration"
      },
      body: JSON.stringify({
        model: "client-gpt-model",
        input: "stream this",
        stream: true
      })
    });
    assert.equal(streamed.status, 200);
    assert.match(streamed.headers.get("content-type"), /text\/event-stream/);
    const sse = await streamed.text();
    assert.match(sse, /response\.output_text\.delta/);
    assert.match(sse, /Stream/);
    await waitFor(() => extractionCalls === 2);

    const chat = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${validKey}`,
        "content-type": "application/json",
        "x-request-id": "chat-regression"
      },
      body: JSON.stringify({
        model: "regular-model",
        messages: [{ role: "user", content: "chat regression" }],
        stream: false
      })
    });
    assert.equal(chat.status, 200);
    assert.equal((await chat.json()).choices[0].message.content, "Chat OK");
    const chatRouted = upstreamRequests.find((item) =>
      item.url === "/v1/chat/completions" &&
      item.body.model === "regular-model"
    );
    assert.equal(chatRouted.body.model, "regular-model");
    assert.match(chatRouted.body.messages[0].content, /Company fact/);
    await waitFor(() => extractionCalls === 3);

    const extractionFailureResponse = await fetch(`${baseUrl}/v1/responses`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${validKey}`,
        "content-type": "application/json",
        "x-ltn-client-id": "11111111-1111-4111-8111-111111111111",
        "x-request-id": "responses-extraction-failure"
      },
      body: JSON.stringify({
        model: "client-gpt-model",
        input: "force extractor failure"
      })
    });
    assert.equal(extractionFailureResponse.status, 200);
    assert.equal((await extractionFailureResponse.json()).status, "completed");
    await waitFor(() => extractionCalls === 4);
  } finally {
    await close(gateway);
    await close(upstream);
  }
});
