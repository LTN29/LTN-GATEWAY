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
