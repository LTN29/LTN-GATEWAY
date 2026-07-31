import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
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

test("Gateway proxies authenticated 9Router capability endpoints without rewriting payloads", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-capability-proxy-"));
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  const key = "capability-team-key";
  const keyHash = createHash("sha256").update(key).digest("hex");
  await writeFile(teamsFile, JSON.stringify({
    teams: [{
      code: "MEDIA",
      displayName: "Media",
      keyHash,
      enabled: true,
      memoryFile: "MEDIA.md",
      aiPolicy: { mode: "free_only" }
    }]
  }));
  await writeFile(usersFile, JSON.stringify({ version: 1, users: {} }));

  const requests = [];
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    requests.push({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization,
      contentType: req.headers["content-type"],
      connectionId: req.headers["x-connection-id"],
      body
    });

    if (req.url === "/v1/models/image") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ data: [{ id: "openai/gpt-image-2" }] }));
      return;
    }
    if (req.url === "/v1/images/generations?response_format=binary") {
      const model = JSON.parse(body.toString("utf8")).model;
      if (model === "delay") {
        setTimeout(() => res.writeHead(200, { "content-type": "application/json" }).end("{}"), 200);
        return;
      }
      if ([401, 404, 502].includes(Number(model))) {
        res.writeHead(Number(model), { "content-type": "application/json" });
        res.end(JSON.stringify({ error: { message: `upstream ${model}` } }));
        return;
      }
      res.writeHead(200, { "content-type": "image/png" });
      res.end(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
      return;
    }
    if (req.url === "/v1/audio/transcriptions") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ text: "xin chao" }));
      return;
    }
    if (req.url === "/v1/videos/job-123") {
      res.writeHead(200, {
        "content-type": "application/json",
        "x-9router-connection-id": "connection-123"
      });
      res.end(JSON.stringify({ status: "done" }));
      return;
    }
    res.writeHead(404).end("{}");
  });

  const upstreamPort = await listen(upstream);
  process.env.TEAMS_FILE = teamsFile;
  process.env.LTN_USERS_CONFIG_FILE = usersFile;
  process.env.MEMORY_DIR = join(root, "memory");
  process.env.UPSTREAM_BASE_URL = `http://127.0.0.1:${upstreamPort}`;
  process.env.LTN_LEGACY_TEAM_KEYS_ENABLED = "true";
  process.env.MAX_CAPABILITY_BODY_BYTES = "32000000";
  process.env.UPSTREAM_TIMEOUT_MS = "50";

  const { createGatewayServer } = await import(`../src/server.mjs?capability=${Date.now()}`);
  const gateway = createGatewayServer();
  const gatewayPort = await listen(gateway);
  const baseUrl = `http://127.0.0.1:${gatewayPort}`;
  const headers = { authorization: `Bearer ${key}` };
  const logChunks = [];
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, ...args) => {
    logChunks.push(String(chunk));
    return originalStdoutWrite(chunk, ...args);
  };

  try {
    const unauthenticated = await fetch(`${baseUrl}/v1/images/generations`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    assert.equal(unauthenticated.status, 401);

    const models = await fetch(`${baseUrl}/v1/models/image`, { headers });
    assert.equal(models.status, 200);
    assert.equal((await models.json()).data[0].id, "openai/gpt-image-2");

    const image = await fetch(
      `${baseUrl}/v1/images/generations?response_format=binary`,
      {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify({ model: "openai/gpt-image-2", prompt: "test" })
      }
    );
    assert.equal(image.status, 200);
    assert.equal(image.headers.get("content-type"), "image/png");
    assert.deepEqual(
      Buffer.from(await image.arrayBuffer()),
      Buffer.from([0x89, 0x50, 0x4e, 0x47])
    );

    const multipartBody = Buffer.from(
      "--test-boundary\r\nContent-Disposition: form-data; name=\"model\"\r\n\r\nwhisper-1\r\n--test-boundary--\r\n"
    );
    const transcription = await fetch(`${baseUrl}/v1/audio/transcriptions`, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "multipart/form-data; boundary=test-boundary"
      },
      body: multipartBody
    });
    assert.equal(transcription.status, 200);
    assert.equal((await transcription.json()).text, "xin chao");

    const video = await fetch(`${baseUrl}/v1/videos/job-123`, {
      headers: { ...headers, "x-connection-id": "connection-123" }
    });
    assert.equal(video.status, 200);
    assert.equal(video.headers.get("x-9router-connection-id"), "connection-123");

    const imageRequest = requests.find((item) =>
      item.url === "/v1/images/generations?response_format=binary"
    );
    assert.equal(imageRequest.authorization, `Bearer ${key}`);
    assert.equal(imageRequest.contentType, "application/json");
    assert.deepEqual(JSON.parse(imageRequest.body.toString("utf8")), {
      model: "openai/gpt-image-2",
      prompt: "test"
    });

    for (const status of [401, 404, 502]) {
      const response = await fetch(
        `${baseUrl}/v1/images/generations?response_format=binary`,
        {
          method: "POST",
          headers: { ...headers, "content-type": "application/json" },
          body: JSON.stringify({ model: String(status), prompt: "sensitive prompt" })
        }
      );
      assert.equal(response.status, status);
    }

    const timedOut = await fetch(
      `${baseUrl}/v1/images/generations?response_format=binary`,
      {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify({ model: "delay", prompt: "sensitive timeout prompt" })
      }
    );
    assert.equal(timedOut.status, 504);
    assert.equal((await timedOut.json()).error.code, null);

    const transcriptionRequest = requests.find((item) =>
      item.url === "/v1/audio/transcriptions"
    );
    assert.equal(
      transcriptionRequest.contentType,
      "multipart/form-data; boundary=test-boundary"
    );
    assert.deepEqual(transcriptionRequest.body, multipartBody);

    const videoRequest = requests.find((item) => item.url === "/v1/videos/job-123");
    assert.equal(videoRequest.connectionId, "connection-123");

    const unsupported = await fetch(`${baseUrl}/v1/admin/danger`, {
      method: "POST",
      headers
    });
    assert.equal(unsupported.status, 404);
    const logs = logChunks.join("");
    assert.doesNotMatch(logs, new RegExp(key));
    assert.doesNotMatch(logs, /sensitive (?:prompt|timeout prompt)/);
  } finally {
    process.stdout.write = originalStdoutWrite;
    await close(gateway);
    await close(upstream);
  }
});
