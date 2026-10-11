import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

test("local Word/Excel/PDF edits preserve sources and MCP returns real bounded document data", async (t) => {
  const bundled = resolve(dirname(process.execPath), "..", "..", "python", process.platform === "win32" ? "python.exe" : "bin/python3");
  const python = process.env.LTN_TEST_PYTHON || (existsSync(bundled) ? bundled : "python3");
  const probe = spawnSync(python, ["-c", "import docx, openpyxl, pypdf"], { encoding: "utf8" });
  if (probe.status !== 0) { t.skip("Python document dependencies are unavailable."); return; }
  const root = await mkdtemp(join(tmpdir(), "simi-documents-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const script = fileURLToPath(new URL("../scripts/document-tool.py", import.meta.url));
  const fixture = spawnSync(python, [fileURLToPath(new URL("./document-tool-fixtures.py", import.meta.url)), root, script], {
    encoding: "utf8", timeout: 30000
  });
  assert.equal(fixture.status, 0, fixture.stdout + fixture.stderr);
  const files = JSON.parse(fixture.stdout);
  const child = spawn(process.execPath, [fileURLToPath(new URL("../scripts/browser-mcp.mjs", import.meta.url))], {
    stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, LTN_PYTHON_PATH: python, LTN_DOCUMENT_TOOL_PATH: script }
  });
  t.after(() => child.kill());
  const pending = new Map();
  const lines = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
  lines.on("line", (line) => {
    const message = JSON.parse(line);
    pending.get(message.id)?.(message);
  });
  let nextId = 0;
  const call = (name, args) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => reject(new Error("MCP document call timed out")), 10000);
    pending.set(id, (message) => { clearTimeout(timer); pending.delete(id); resolve(message.result); });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } }) + "\n");
  });
  const result = await call("document_read", { path: files.word, count: 1, max_chars: 1000 });
  assert.equal(result.isError, undefined);
  assert.equal(result.structuredContent.blocks.length, 1);
  assert.equal(result.structuredContent.blocks[0].text, "Chào anh chị em, chào anh chị em.");
  const output = join(root, "MCP đã sửa.docx");
  const edit = await call("document_edit", {
    path: files.word, fingerprint: result.structuredContent.fingerprint, output_path: output,
    edits: [{ block_id: result.structuredContent.blocks[0].id, before: "Chào", after: "Xin chào" }]
  });
  assert.equal(edit.isError, undefined);
  assert.equal(edit.structuredContent.path, output);
  assert.equal(edit.structuredContent.source_preserved, true);
  const verify = await call("document_read", { path: output, count: 1 });
  assert.match(verify.structuredContent.blocks[0].text, /^Xin chào/);
});
