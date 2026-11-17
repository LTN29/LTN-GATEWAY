import test from "node:test";
import assert from "node:assert/strict";
import { modelListSummary, requestToolSummary, responseToolCalls, trailingToolResults } from "../src/tool-telemetry.mjs";
import { applyReasoningPolicy } from "../src/reasoning-policy.mjs";
import { config } from "../src/config.mjs";

test("trailingToolResults: chỉ kết quả công cụ ở cuối, có tên công cụ, số chữ và ảnh – không có nội dung", () => {
  const input = [
    { role: "user", content: [{ type: "input_text", text: "mở trang" }] },
    { type: "function_call", call_id: "a", namespace: "mcp__simi_browser__", name: "browser_snapshot", arguments: "{}" },
    { type: "function_call_output", call_id: "a", output: "x".repeat(5000) },
    { type: "function_call", call_id: "b", name: "shell", arguments: "{}" },
    { type: "function_call_output", call_id: "b", output: [{ type: "input_text", text: "ok" }, { type: "input_image", image_url: "data:image/jpeg;base64,AAA" }] }
  ];
  assert.deepEqual(trailingToolResults(input), [
    { name: "mcp__simi_browser__.browser_snapshot", chars: 5000, images: 0 },
    { name: "shell", chars: 2, images: 1 }
  ]);
  assert.deepEqual(trailingToolResults([...input, { role: "user", content: "cảm ơn" }]), []);
  assert.deepEqual(trailingToolResults("chuỗi"), []);
});

test("responseToolCalls đọc SSE và JSON; requestToolSummary đếm cả namespace và tool có sẵn", () => {
  const sse = [
    'event: response.output_item.done',
    'data: {"type":"response.output_item.done","item":{"type":"function_call","namespace":"mcp__simi_browser__","name":"browser_act","call_id":"c1","arguments":"{}"}}',
    'data: {"type":"response.output_item.done","item":{"type":"message","role":"assistant","content":[]}}',
    'data: {"type":"response.output_item.done","item":{"type":"web_search_call","status":"completed"}}',
    'data: {"type":"response.completed"}'
  ].join("\n");
  assert.deepEqual(responseToolCalls(Buffer.from(sse), true), ["mcp__simi_browser__.browser_act", "web_search_call"]);
  assert.deepEqual(responseToolCalls(JSON.stringify({ output: [{ type: "function_call", name: "shell" }] }), false), ["shell"]);
  assert.deepEqual(requestToolSummary([{ type: "function", name: "shell" }, { type: "namespace", name: "n", tools: [{ type: "function", name: "a" }, { type: "function", name: "b" }] }, { type: "web_search" }]),
    { toolsDefined: 4, hostedTools: ["web_search"] });
});

test("modelListSummary đếm model theo kind (biết vì sao tìm web không chạy)", () => {
  assert.deepEqual(modelListSummary(JSON.stringify({ data: [{ id: "a/search", kind: "webSearch" }, { id: "b/fetch", kind: "webFetch" }, { id: "c/search", kind: "webSearch" }] })),
    { models: 3, kinds: { webSearch: 2, webFetch: 1 } });
  assert.deepEqual(modelListSummary(JSON.stringify({ data: [] })), { models: 0, kinds: {} });
  assert.equal(modelListSummary("không phải json"), null);
});

test("TOOL_STEP_REASONING_EFFORT chỉ hạ mức suy nghĩ ở bước tiếp sau công cụ, mặc định tắt", () => {
  const user = { principalType: "user", teamId: "SALES", team: { code: "SALES" } };
  assert.equal(applyReasoningPolicy({ model: "cx/gpt-6.1-sol" }, user, "responses", { toolStep: true }).reasoning.effort, "medium");
  const before = config.toolStepReasoningEffort;
  try {
    config.toolStepReasoningEffort = "low";
    assert.equal(applyReasoningPolicy({ model: "cx/gpt-6.1-sol" }, user, "responses", { toolStep: true }).reasoning.effort, "low");
    assert.equal(applyReasoningPolicy({ model: "cx/gpt-6.1-sol" }, user, "responses", { toolStep: false }).reasoning.effort, "medium");
    assert.equal(applyReasoningPolicy({ model: "cx/gpt", reasoning: { effort: "minimal" } }, user, "responses", { toolStep: true }).reasoning.effort, "minimal", "không nâng mức");
    assert.equal(applyReasoningPolicy({ model: "cc/claude-opus-5-5" }, user, "responses", { toolStep: true }).output_config.effort, "low");
  } finally {
    config.toolStepReasoningEffort = before;
  }
});
