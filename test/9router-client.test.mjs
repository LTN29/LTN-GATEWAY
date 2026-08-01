import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const clientPath = fileURLToPath(new URL("../scripts/9router-client.mjs", import.meta.url));

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function runClient(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [clientPath, ...args], { env });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("ltn-9router routes authenticated network calls through the Gateway", async () => {
  const requests = [];
  const gateway = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    requests.push({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization,
      clientId: req.headers["x-ltn-client-id"],
      body: Buffer.concat(chunks).toString("utf8")
    });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, results: [{ title: "network result" }] }));
  });
  const port = await listen(gateway);

  try {
    const result = await runClient(
      ["POST", "/search", JSON.stringify({ model: "search-combo", query: "test" })],
      {
        ...process.env,
        LTN_GATEWAY_BASE_URL: `http://127.0.0.1:${port}/v1`,
        LTN_TEAM_API_KEY: "client-test-secret",
        LTN_CLIENT_ID: "client-12345678"
      }
    );
    assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout).results[0].title, "network result");
    assert.equal(requests[0].url, "/v1/search");
    assert.equal(requests[0].authorization, "Bearer client-test-secret");
    assert.equal(requests[0].clientId, "client-12345678");
    assert.doesNotMatch(result.stderr, /client-test-secret/);
  } finally {
    await close(gateway);
  }
});
