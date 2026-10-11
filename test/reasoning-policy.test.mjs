import test from "node:test";
import assert from "node:assert/strict";
import { applyReasoningPolicy, cappedReasoningEffort } from "../src/reasoning-policy.mjs";

const sales = { principalType: "user", teamId: "SALES", team: { code: "SALES" } };
const it = { principalType: "user", teamId: "IT", team: { code: "IT" } };

test("reasoning is capped by authenticated identity, with a medium default", () => {
  for (const effort of ["high", "xhigh", "max", "ultra"]) {
    assert.equal(cappedReasoningEffort(effort, sales), "medium");
    assert.equal(cappedReasoningEffort(effort, it), "high");
  }
  for (const effort of ["none", "minimal", "low", "medium"]) {
    assert.equal(cappedReasoningEffort(effort, sales), effort);
    assert.equal(cappedReasoningEffort(effort, it), effort);
  }
  for (const effort of [undefined, null, "", "unlimited", {}]) {
    assert.equal(cappedReasoningEffort(effort, sales), "medium");
  }
  assert.equal(cappedReasoningEffort("high", { principalType: "team", team: { code: "IT" } }), "high");
  assert.equal(cappedReasoningEffort("high", { ...sales, role: "IT_ADMIN" }), "high");
});

test("Responses preserves reasoning options and cannot elevate through body identity or aliases", () => {
  const input = { model: "cx/gpt", teamId: "IT", role: "IT_ADMIN",
    reasoning: { effort: "high", summary: "auto" }, reasoning_effort: "ultra" };
  const result = applyReasoningPolicy(input, sales);
  assert.equal(result.reasoning.effort, "medium");
  assert.equal(result.reasoning.summary, "auto");
  assert.equal(result.reasoning_effort, "medium");
  assert.equal(input.reasoning.effort, "high");
  assert.equal(applyReasoningPolicy({ model: "cx/gpt" }, sales).reasoning.effort, "medium");
});

test("Chat applies the same cap to both effort encodings", () => {
  const input = { reasoning_effort: "xhigh", reasoning: { effort: "high" }, messages: [] };
  const result = applyReasoningPolicy(input, sales, "chat");
  assert.equal(result.reasoning_effort, "medium");
  assert.equal(result.reasoning.effort, "medium");
  assert.equal(applyReasoningPolicy(input, it, "chat").reasoning_effort, "high");
  assert.equal(applyReasoningPolicy({}, sales, "chat").reasoning_effort, "medium");
});

test("Claude 5.5 cannot disable thinking and native effort cannot override the cap", () => {
  const payload = { model: "cc/claude-opus-5-5", reasoning: { effort: "high", summary: "auto" },
    output_config: { effort: "max", format: { type: "json_schema" } },
    thinking: { type: "disabled", budget_tokens: 50000, display: "omitted" } };
  const result = applyReasoningPolicy(payload, sales);
  assert.equal(result.reasoning.effort, "medium");
  assert.equal(result.reasoning_effort, "medium");
  assert.equal(result.output_config.effort, "medium");
  assert.deepEqual(result.output_config.format, payload.output_config.format);
  assert.deepEqual(result.thinking, { type: "adaptive", display: "omitted" });
  assert.equal(payload.thinking.type, "disabled");
  for (const effort of ["none", "minimal"]) {
    const low = applyReasoningPolicy({ model: payload.model, reasoning: { effort } }, sales);
    assert.equal(low.output_config.effort, "low");
    assert.equal(low.thinking.type, "adaptive");
  }
  const high = applyReasoningPolicy(payload, it);
  assert.equal(high.output_config.effort, "high");
  assert.equal(high.reasoning.effort, "high");
  const messages = applyReasoningPolicy({ model: payload.model, output_config: { effort: "max" } }, sales, "messages");
  assert.equal(messages.output_config.effort, "medium");
  assert.equal(messages.thinking.type, "adaptive");
});

test("OpenAI routes normalize mixed provider presets without touching unrelated options", () => {
  const payload = {
    model: "ag/gemini", reasoning: { effort: "high", summary: "auto" },
    thinking: { type: "disabled" }, enable_thinking: false, thinking_budget: 100000,
    thinkingConfig: { thinkingLevel: "HIGH" },
    generationConfig: { temperature: 0.2, thinkingConfig: { thinkingBudget: 100000 } },
    request: { generationConfig: { maxOutputTokens: 2000, thinkingConfig: { thinkingLevel: "HIGH" } } },
    params: { custom: "keep", reasoning_effort: "max", thinking: { budget_tokens: 100000 } },
    output_config: { effort: "max", format: { type: "json_schema" } }
  };
  for (const format of ["responses", "chat"]) {
    const result = applyReasoningPolicy(payload, sales, format);
    assert.equal(result.reasoning_effort, "medium");
    assert.equal(result.reasoning.effort, "medium");
    assert.equal(result.output_config.effort, "medium");
    for (const key of ["thinking", "thinkingConfig", "enable_thinking", "thinking_budget"]) {
      assert.equal(result[key], undefined);
    }
    assert.deepEqual(result.generationConfig, { temperature: 0.2 });
    assert.deepEqual(result.request.generationConfig, { maxOutputTokens: 2000 });
    assert.deepEqual(result.params, { custom: "keep" });
    assert.deepEqual(result.output_config.format, { type: "json_schema" });
  }
  assert.equal(payload.generationConfig.thinkingConfig.thinkingBudget, 100000);
  const defaultRequest = applyReasoningPolicy({ model: "cx/gpt" }, sales);
  assert.equal(defaultRequest.reasoning.effort, "medium");
  assert.equal(defaultRequest.reasoning_effort, "medium");
});
