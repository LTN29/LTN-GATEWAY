import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const close = (server) => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
const hash = (key) => createHash("sha256").update(key).digest("hex");

test("key-scoped model list, direct routing, live membership, quota and API bypass protection", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "ltn-combo-selection-"));
  const combos = [
    { name: "SIMI-GPT", models: ["cx/gpt", "ag/gemini"] },
    { name: "SIMI-FREE", models: ["oc/free"] },
    { name: "SIMI-CLAUDE", models: ["cc/claude"] }
  ];
  let dashboardUnavailable = false;
  const forwarded = [];
  const upstream = http.createServer(async (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.url === "/api/combos") {
      assert.equal(req.headers.cookie, "session=mock-dashboard-secret");
      assert.equal(req.headers.authorization, undefined);
      res.statusCode = dashboardUnavailable ? 401 : 200;
      res.end(JSON.stringify({ combos }));
      return;
    }
    assert.notEqual(req.headers.cookie, "session=mock-dashboard-secret");
    if (req.url === "/v1/models") {
      res.end(JSON.stringify({ data: ["cx/gpt", "ag/gemini", "oc/free", "cc/claude"].map((id) => ({ id, owned_by: "provider" })) }));
      return;
    }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const payload = JSON.parse(Buffer.concat(chunks).toString());
    forwarded.push({ path: req.url, payload });
    res.end(JSON.stringify({ status: "completed", model: payload.model, output: [] }));
  });
  const upstreamPort = await listen(upstream);
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  await writeFile(teamsFile, JSON.stringify({ teams: [{ code: "IT", displayName: "IT", enabled: true,
    memoryFile: "IT.md", aiPolicy: { mode: "premium_always", premiumCombo: "SIMI-GPT", modelSelection: "combo_members" } }] }));
  const users = {
    alpha: { displayName: "Alpha", teamId: "IT", keyHash: hash("key-alpha"), aiPolicy: { mode: "inherit" } },
    beta: { displayName: "Beta", teamId: "IT", keyHash: hash("key-beta"), aiPolicy: { mode: "inherit", premiumCombo: "SIMI-CLAUDE" } },
    daily: { displayName: "Daily", teamId: "IT", keyHash: hash("key-daily"), aiPolicy: { mode: "limited_daily", premiumLimit: 1, usageScope: "user", freeCombo: "SIMI-FREE" } }
  };
  await writeFile(usersFile, JSON.stringify({ version: 1, users }));
  Object.assign(process.env, {
    TEAMS_FILE: teamsFile, LTN_USERS_CONFIG_FILE: usersFile, LTN_LEGACY_TEAM_KEYS_ENABLED: "false",
    UPSTREAM_BASE_URL: `http://127.0.0.1:${upstreamPort}`, NINEROUTER_DASHBOARD_COOKIE: "session=mock-dashboard-secret",
    CODEX_USAGE_FILE: join(root, "usage.json"), MEMORY_EXTRACTION_ENABLED: "false", USER_ANALYTICS_ENABLED: "false"
  });
  const { createGatewayServer } = await import("../src/server.mjs");
  const gateway = createGatewayServer();
  const port = await listen(gateway);
  t.after(async () => { await close(gateway); await close(upstream); });
  const call = (path, key = "key-alpha", payload) => fetch(`http://127.0.0.1:${port}${path}`, {
    method: payload ? "POST" : "GET",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "x-ltn-client-id": "11111111-1111-4111-8111-111111111111" },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const list = await call("/v1/models?client_version=test");
  assert.equal(list.status, 200);
  assert.equal(list.headers.get("cache-control"), "no-store");
  const catalog = await list.json();
  assert.deepEqual(catalog.data.map((m) => m.id), ["cx/gpt", "ag/gemini"]);
  assert.deepEqual(catalog.models.map((m) => m.slug), ["cx/gpt", "ag/gemini"]);
  assert.deepEqual((await (await call("/v1/models", "key-beta")).json()).data.map((m) => m.id), ["cc/claude"]);
  const clientConfig = await (await call("/v1/codex/config")).json();
  assert.equal(clientConfig.defaultModel, "cx/gpt");
  assert.equal(JSON.stringify(clientConfig).includes("mock-dashboard-secret"), false);
  assert.equal((await (await call("/v1/codex/model-catalog")).json()).models.length, 2);
  assert.match(await (await call("/v1/codex/installer-config")).text(), /combo_members\ncx\/gpt/);
  const response = await call("/v1/responses", "key-alpha", { model: "ag/gemini", input: "hi", reasoning: { effort: "high" } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-ltn-selected-model"), "ag/gemini");
  assert.equal(forwarded.at(-1).payload.model, "ag/gemini");
  assert.equal(forwarded.at(-1).payload.reasoning.effort, "high");
  for (const path of ["/v1/responses", "/v1/chat/completions", "/v1/messages", "/v1/images/generations"]) {
    const count = forwarded.length;
    assert.equal((await call(path, "key-alpha", { model: "cc/claude", input: "hi", messages: [] })).status, 403);
    assert.equal(forwarded.length, count);
  }
  assert.equal((await call("/v1/models/image")).status, 403);
  assert.equal((await call("/v1/models", "bad-key")).status, 401);
  assert.equal((await call("/v1/responses", "key-daily", { model: "cc/claude", input: "hi" })).status, 403);
  // A denied request releases its reservation, preserving the one Premium slot.
  assert.equal((await call("/v1/responses", "key-daily", { model: "cx/gpt", input: "hi" })).status, 200);
  assert.equal((await call("/v1/responses", "key-daily", { model: "cx/gpt", input: "hi" })).status, 403);
  assert.equal((await call("/v1/responses", "key-daily", { model: "oc/free", input: "hi" })).status, 200);
  assert.equal((await call("/v1/chat/completions", "key-daily", { model: "cx/gpt", messages: [] })).status, 403);
  combos[0].models = ["cx/gpt"];
  assert.equal((await call("/v1/responses", "key-alpha", { model: "ag/gemini", input: "hi" })).status, 403);
  dashboardUnavailable = true;
  assert.equal((await call("/v1/models")).status, 503);
  assert.equal((await call("/v1/responses", "key-alpha", { model: "cx/gpt", input: "hi" })).status, 503);
});
