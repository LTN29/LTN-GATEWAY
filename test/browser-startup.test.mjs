import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const run = promisify(execFile);
const reader = fileURLToPath(new URL("../scripts/browser-page.mjs", import.meta.url));

test("browser startup preserves launcher failure instead of hiding it behind a connection timeout", async () => {
  const directory = await mkdtemp(join(tmpdir(), "simi-startup-test-"));
  const launcher = join(directory, "fake-launcher.mjs");
  try {
    await writeFile(launcher, 'console.error("Chrome failed: profile is already in use"); process.exitCode = 1;');
    await assert.rejects(run(process.execPath, [reader, "https://example.com"], {
      timeout: 5000,
      env: { ...process.env, LTN_CHROME_DEBUG_PORT: "1", LTN_CHROME_DEBUG_PATH: launcher, LTN_BROWSER_NODE_PATH: process.execPath }
    }), error => {
      assert.match(error.stderr, /profile is already in use/);
      assert.doesNotMatch(error.stderr, /kh.ng r./);
      return true;
    });
  } finally { await unlink(launcher); await rmdir(directory); }
});

test("missing Chrome launcher produces a specific repair error without opening a browser", async () => {
  const directory = await mkdtemp(join(tmpdir(), "simi-startup-test-"));
  try {
    await assert.rejects(run(process.execPath, [reader, "https://example.com"], {
      timeout: 5000,
      env: { ...process.env, LTN_CHROME_DEBUG_PORT: "1", LTN_CHROME_DEBUG_PATH: join(directory, "missing.mjs") }
    }), error => {
      assert.match(error.stderr, /Chrome launcher is missing/);
      return true;
    });
  } finally { await rmdir(directory); }
});
