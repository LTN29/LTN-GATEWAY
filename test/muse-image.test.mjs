import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const script = fileURLToPath(new URL("../scripts/muse-image.py", import.meta.url));
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==",
  "base64"
);

async function python() {
  for (const cmd of ["python3", "python"]) {
    try {
      await run(cmd, ["--version"]);
      return cmd;
    } catch {}
  }
  return null;
}

async function withMock(handler, fn) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    return await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function runMuse(py, base, args, extraEnv = {}) {
  const outDir = await mkdtemp(join(tmpdir(), "muse-out-"));
  const env = {
    ...process.env,
    LTN_GATEWAY_BASE_URL: base,
    LTN_TEAM_API_KEY: "test-key-not-printed",
    LTN_CLIENT_ID: "client-test-1234",
    ...extraEnv
  };
  let stdout;
  try {
    ({ stdout } = await run(py, [script, "--out-dir", outDir, "--timeout", "10", ...args], { env }));
  } catch (error) {
    stdout = error.stdout;
  }
  return { result: JSON.parse(stdout.trim()), stdout, outDir };
}

test("muse-image saves the image once and never prints the key", async (t) => {
  const py = await python();
  if (!py) return t.skip("python not available");
  let chatCalls = 0;
  await withMock((req, res) => {
    if (req.url === "/v1/chat/completions") {
      chatCalls += 1;
      const port = req.socket.localPort;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        choices: [{ message: { content: `![a](http://127.0.0.1:${port}/img.png)` } }]
      }));
      return;
    }
    res.writeHead(200, { "content-type": "image/png" });
    res.end(PNG);
  }, async (base) => {
    const { result, stdout, outDir } = await runMuse(py, base, ["--prompt", "may hut bui"]);
    assert.equal(result.ok, true);
    assert.equal(chatCalls, 1);
    assert.equal(result.images.length, 1);
    assert.doesNotMatch(stdout, /test-key-not-printed/);
    const files = await readdir(outDir);
    assert.ok(files.some((name) => name.endsWith(".png") || name.endsWith(".img")));
  });
});

test("muse-image refuses an oversized reference before calling the Gateway", async (t) => {
  const py = await python();
  if (!py) return t.skip("python not available");
  const dir = await mkdtemp(join(tmpdir(), "muse-ref-"));
  const big = join(dir, "big.png");
  // Random bytes: too big for the budget and not decodable, so the result does not
  // depend on whether Pillow is installed (Pillow cannot shrink it either).
  const { randomBytes } = await import("node:crypto");
  await writeFile(big, randomBytes(300_000));
  let chatCalls = 0;
  await withMock((req, res) => {
    chatCalls += 1;
    res.writeHead(500);
    res.end();
  }, async (base) => {
    const { result } = await runMuse(
      py,
      base,
      ["--prompt", "sua anh", "--ref", big],
      { MUSE_MAX_REQUEST_BYTES: "100000" }
    );
    assert.equal(result.ok, false);
    assert.match(result.error, /quá lớn/);
    assert.equal(chatCalls, 0);
  });
});

test("muse-image explains HTTP 413 from the Gateway", async (t) => {
  const py = await python();
  if (!py) return t.skip("python not available");
  await withMock((req, res) => {
    res.writeHead(413, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Request body vượt quá giới hạn" } }));
  }, async (base) => {
    const { result } = await runMuse(py, base, ["--prompt", "meo"]);
    assert.equal(result.ok, false);
    assert.match(result.error, /413/);
    assert.match(result.error, /nhỏ hơn/);
  });
});

test("muse skill stops after a successful image", async () => {
  const skill = await readFile(
    new URL("../vendor/9router-skills/muse-tao-anh/SKILL.md", import.meta.url),
    "utf8"
  );
  assert.match(skill, /kết thúc lượt/);
  assert.match(skill, /quyền mạng/);
  assert.match(skill, /"ok": true/);
});
