import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const hasPython = ["python3", "python", "py"].some((cmd) => spawnSync(cmd, ["-c", "1"], { stdio: "ignore" }).status === 0);

test("muse_image runs outside the sandbox and falls back when the managed venv is broken", { skip: !hasPython && "no python" }, async () => {
  const dir = await mkdtemp(join(tmpdir(), "muse-mcp-"));
  const script = join(dir, "fake-muse.py");
  await writeFile(script, "import sys, json\nprint('noise')\nprint(json.dumps({'ok': True, 'argv': sys.argv[1:]}))\n");
  try {
    const child = spawn(process.execPath, [fileURLToPath(new URL("../scripts/browser-mcp.mjs", import.meta.url))], {
      env: { ...process.env, LTN_MUSE_SCRIPT_PATH: script, LTN_PYTHON_PATH: join(dir, "missing-python"), CODEX_HOME: dir },
      stdio: ["pipe", "pipe", "ignore"]
    });
    let out = "";
    child.stdout.on("data", (chunk) => { out += chunk; });
    child.stdin.end(`${JSON.stringify({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "muse_image", arguments: { prompt: "phòng bừa bộn", refs: ["/tmp/a.png"] } } })}\n`);
    await new Promise((resolve) => child.once("close", resolve));
    const reply = JSON.parse(out.trim().split("\n").at(-1));
    assert.equal(reply.result.structuredContent.ok, true);
    assert.deepEqual(reply.result.structuredContent.argv, ["--prompt", "phòng bừa bộn", "--ref", "/tmp/a.png"]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
