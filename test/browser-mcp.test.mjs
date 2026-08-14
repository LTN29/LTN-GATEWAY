import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

test("browser MCP exposes prompt-first multi-page tools over stdio", async () => {
  const child = spawn(process.execPath, [fileURLToPath(new URL("../scripts/browser-mcp.mjs", import.meta.url))], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, LTN_CHROME_DEBUG_PORT: "1" }
  });
  const lines = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
  const messages = [];
  lines.on("line", (line) => messages.push(JSON.parse(line)));

  child.stdin.write(`${JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } }
  })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "browser_status", arguments: {} } })}\n`);

  const deadline = Date.now() + 3_000;
  while (messages.length < 3 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  child.kill();

  assert.equal(messages.find((message) => message.id === 1)?.result?.serverInfo?.name, "simi-browser");
  const listed = messages.find((message) => message.id === 2)?.result?.tools || [];
  assert.deepEqual(listed.map((tool) => tool.name), [
    "browser_read_pages",
    "browser_status",
    "browser_read_workbook",
    "browser_read_local_workbook",
    "browser_read_candidate_cvs"
  ]);
  assert.equal(listed[0].inputSchema.properties.urls.maxItems, 8);
  assert.equal(listed[2].inputSchema.properties.max_rows.maximum, 5000);
  assert.equal(listed[3].inputSchema.properties.workbook_path.description.includes(".xlsx"), true);
  assert.equal(listed[4].inputSchema.properties.link_column.description.includes("CV"), true);
  const status = messages.find((message) => message.id === 3)?.result?.structuredContent;
  assert.equal(status.running, false);
  assert.equal(status.mode, "persistent-managed-profile");
});
