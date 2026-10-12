import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readInternalCombos } from "../integrations/9router/internal-combos.mjs";
import { prepareComboApi } from "../scripts/prepare-9router-combo-api.mjs";
import { config } from "../src/config.mjs";
import { allowedComboModels } from "../src/combo-model-access.mjs";

const token = "mock-server-only-token-" + "x".repeat(32);
const env = { LTN_COMBO_API_TOKEN: token, NINEROUTER_PEER_TOKEN: "mock-peer" };
const headers = { authorization: `Bearer ${token}`, "x-9r-peer-token": "mock-peer", "x-9r-real-ip": "127.0.0.1" };

test("internal reader rejects employee/cookie auth, spoofed peers, writes and unsafe data", async () => {
  let reads = 0;
  const read = async () => { reads++; return [{ name: "TEAM", models: ["cx/gpt"], apiKey: "DO-NOT-EXPOSE" }]; };
  const call = (customHeaders, method = "GET", customEnv = env, url = "http://localhost/api/internal/ltn-combos") =>
    readInternalCombos(new Request(url, { headers: customHeaders, method }), customEnv, read);
  for (const [input, status] of [
    [{ cookie: "auth_token=dashboard" }, 401],
    [{ ...headers, authorization: "Bearer employee-key" }, 401],
    [{ ...headers, "x-9r-peer-token": "spoofed" }, 403],
    [{ ...headers, "x-9r-real-ip": "203.0.113.1" }, 403]
  ]) assert.equal((await call(input)).status, status);
  assert.equal((await call(headers, "GET", { ...env, LTN_COMBO_API_TOKEN: "" })).status, 503);
  assert.equal((await call(headers, "POST")).status, 405);
  assert.equal((await call(headers, "GET", env, "http://localhost/api/internal/ltn-combos?extra=1")).status, 400);
  assert.equal(reads, 0);
  const response = await call(headers);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { combos: [{ name: "TEAM", models: ["cx/gpt"] }] });
  const dbFailure = await readInternalCombos(new Request("http://localhost/api/internal/ltn-combos", { headers }), env, async () => { throw new Error(token); });
  assert.equal(dbFailure.status, 503);
  assert.equal((await dbFailure.text()).includes(token), false);
});

test("Gateway uses dedicated credentials with no redirect or dashboard fallback", async (t) => {
  const previous = { routerComboApiUrl: config.routerComboApiUrl, routerComboApiToken: config.routerComboApiToken, routerDashboardCookie: config.routerDashboardCookie };
  let mode = "ok";
  let calls = 0;
  const server = http.createServer((req, res) => {
    calls++;
    assert.equal(req.url, "/api/internal/ltn-combos");
    assert.equal(req.headers.authorization, `Bearer ${token}`);
    assert.equal(req.headers.cookie, undefined);
    if (mode === "redirect") { res.writeHead(302, { location: "/secret-destination" }); res.end(); return; }
    if (mode === "denied") { res.writeHead(401); res.end(); return; }
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ combos: [{ name: "TEAM", models: ["cx/gpt"] }] }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => { Object.assign(config, previous); await new Promise((resolve) => server.close(resolve)); });
  const url = `http://127.0.0.1:${server.address().port}/api/internal/ltn-combos`;
  Object.assign(config, { routerComboApiUrl: url, routerComboApiToken: token, routerDashboardCookie: "stale-secret-cookie" });
  assert.deepEqual(await allowedComboModels({}, "test", ["TEAM"]), ["cx/gpt"]);
  for (const next of ["denied", "redirect"]) {
    mode = next;
    await assert.rejects(allowedComboModels({}, "test", ["TEAM"]), { statusCode: 503 });
  }
  assert.equal(calls, 3);
  config.routerComboApiUrl = "http://public.example/api/internal/ltn-combos";
  await assert.rejects(allowedComboModels({}, "test", ["TEAM"]), { statusCode: 503 });
  config.routerComboApiUrl = url;
  config.routerComboApiToken = "employee-key";
  await assert.rejects(allowedComboModels({}, "test", ["TEAM"]), { statusCode: 503 });
  assert.equal(calls, 3);
});

test("9Router source patch is narrow, backed up, repeatable and refuses incompatible source", async () => {
  const repo = await mkdtemp(join(tmpdir(), "ltn-router-patch-"));
  await mkdir(join(repo, "src"));
  const proxyPath = join(repo, "src/proxy.js");
  const source = 'import { proxy as dashboardProxy } from "./dashboardGuard";\nexport default async function proxy(request) {\n  return dashboardProxy(request);\n}\n';
  await writeFile(proxyPath, source);
  await prepareComboApi(repo);
  const patched = await readFile(proxyPath, "utf8");
  assert.equal(await readFile(`${proxyPath}.ltn-backup`, "utf8"), source);
  assert.match(patched, /pathname === "\/api\/internal\/ltn-combos"/);
  assert.match(patched, /return dashboardProxy\(request\)/);
  await prepareComboApi(repo);
  assert.equal(await readFile(proxyPath, "utf8"), patched);
  const route = await readFile(join(repo, "src/app/api/internal/ltn-combos/route.js"), "utf8");
  assert.match(route, /readInternalCombos\(request, process.env, getCombos\)/);
  await writeFile(proxyPath, "incompatible source");
  await assert.rejects(prepareComboApi(repo), /Unsupported/);
  assert.equal(await readFile(proxyPath, "utf8"), "incompatible source");
});
