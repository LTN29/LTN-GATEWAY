import test from "node:test";
import assert from "node:assert/strict";
import { createSseNamespaceRestorer, flattenNamespaceTools, restoreNamespaceCalls } from "../src/tool-namespaces.mjs";

const codexPayload = () => ({
  model: "cc/claude-opus-5-5",
  tool_choice: "auto",
  tools: [
    { type: "function", name: "shell_command", parameters: { type: "object" } },
    { type: "namespace", name: "mcp__simi_browser", description: "Tools in the mcp__simi_browser namespace.", tools: [
      { type: "function", name: "browser_read_pages", description: "Read pages.", strict: false, parameters: { type: "object", properties: { urls: { type: "array" } } } },
      { type: "function", name: "browser_status", description: "Status.", parameters: { type: "object", properties: {} } }
    ] },
    { type: "web_search", external_web_access: false }
  ],
  input: [
    { type: "message", role: "user", content: [{ type: "input_text", text: "Read Shopee" }] },
    { type: "function_call", namespace: "mcp__simi_browser", name: "browser_status", arguments: "{}", call_id: "c1" },
    { type: "function_call_output", call_id: "c1", output: "{\"running\":true}" }
  ]
});

test("Codex namespace tools become flat functions for 9Router", () => {
  const original = codexPayload();
  const { payload, toolMap } = flattenNamespaceTools(original);
  assert.deepEqual(payload.tools.map((tool) => tool.type), ["function", "function", "function", "web_search"]);
  assert.deepEqual(payload.tools.map((tool) => tool.name).slice(0, 3),
    ["shell_command", "mcp__simi_browser__browser_read_pages", "mcp__simi_browser__browser_status"]);
  assert.match(payload.tools[1].description, /Read pages\./);
  assert.equal(payload.tools[1].parameters.properties.urls.type, "array");
  assert.deepEqual(payload.input[1], { type: "function_call", name: "mcp__simi_browser__browser_status", arguments: "{}", call_id: "c1" });
  assert.deepEqual(payload.input[2], original.input[2]);
  assert.equal(toolMap.get("mcp__simi_browser__browser_read_pages").namespace, "mcp__simi_browser");
  assert.equal(original.tools[1].type, "namespace", "the client request object is not mutated");
});

test("requests without namespaces are forwarded unchanged", () => {
  const payload = { model: "m", tools: [{ type: "function", name: "f" }], input: "hi" };
  const result = flattenNamespaceTools(payload);
  assert.equal(result.payload, payload);
  assert.equal(result.toolMap, null);
});

test("long or colliding names stay within 64 characters and remain unique", () => {
  const { payload, toolMap } = flattenNamespaceTools({ tools: [
    { type: "function", name: "a__b" },
    { type: "namespace", name: "a", tools: [{ type: "function", name: "b" }] },
    { type: "namespace", name: "mcp__codex_apps__safety_settings_with_a_very_long_name", tools: [{ type: "function", name: "prepare_parental_control_update_now" }] }
  ] });
  const names = payload.tools.map((tool) => tool.name);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.every((name) => name.length <= 64 && /^[a-zA-Z0-9_-]+$/.test(name)));
  assert.equal(toolMap.get(names[1]).name, "b");
  assert.equal(toolMap.get(names[2]).namespace, "mcp__codex_apps__safety_settings_with_a_very_long_name");
});

test("JSON responses restore the namespace Codex expects", () => {
  const { toolMap } = flattenNamespaceTools(codexPayload());
  const restored = restoreNamespaceCalls({ output: [
    { type: "function_call", name: "mcp__simi_browser__browser_read_pages", arguments: "{\"urls\":[\"https://shopee.vn/x\"]}", call_id: "t1" },
    { type: "function_call", name: "shell_command", arguments: "{}", call_id: "t2" },
    { type: "message", role: "assistant", content: [{ type: "output_text", text: "mcp__simi_browser__browser_status" }] }
  ] }, toolMap);
  assert.deepEqual(restored.output[0], { type: "function_call", name: "browser_read_pages", namespace: "mcp__simi_browser", arguments: "{\"urls\":[\"https://shopee.vn/x\"]}", call_id: "t1" });
  assert.equal(restored.output[1].name, "shell_command");
  assert.equal(restored.output[1].namespace, undefined);
  assert.equal(restored.output[2].content[0].text, "mcp__simi_browser__browser_status", "plain text is never rewritten");
});

test("SSE stream restores namespaces even when events are split across chunks", () => {
  const { toolMap } = flattenNamespaceTools(codexPayload());
  const item = { id: "fc1", type: "function_call", name: "mcp__simi_browser__browser_status", arguments: "{}", call_id: "c9" };
  const stream = [
    `event: response.output_item.added\ndata: ${JSON.stringify({ type: "response.output_item.added", output_index: 0, item })}\n\n`,
    `event: response.output_item.done\ndata: ${JSON.stringify({ type: "response.output_item.done", output_index: 0, item })}\n\n`,
    `data: ${JSON.stringify({ type: "response.completed", response: { output: [item] } })}\n\n`,
    "data: [DONE]\n\n"
  ].join("");
  const restorer = createSseNamespaceRestorer(toolMap);
  let out = "";
  for (let index = 0; index < stream.length; index += 37) out += restorer.push(stream.slice(index, index + 37));
  out += restorer.flush();
  const events = out.split("\n\n").filter(Boolean);
  assert.equal(events.length, 4);
  const items = events.slice(0, 2).map((event) => JSON.parse(event.split("\n").find((line) => line.startsWith("data:")).slice(5)).item);
  for (const restoredItem of items) {
    assert.equal(restoredItem.name, "browser_status");
    assert.equal(restoredItem.namespace, "mcp__simi_browser");
  }
  assert.match(events[0], /^event: response\.output_item\.added/);
  const completed = JSON.parse(events[2].slice(6));
  assert.equal(completed.response.output[0].namespace, "mcp__simi_browser");
  assert.equal(events[3], "data: [DONE]");
});
