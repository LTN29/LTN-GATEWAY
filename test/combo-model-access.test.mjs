import test from "node:test";
import assert from "node:assert/strict";
import { membersOfCombos, memberSelectionEnabled, codexModelEntry } from "../src/combo-model-access.mjs";
import { config, normalizeAiPolicy } from "../src/config.mjs";
import { safePolicy } from "../src/admin/admin-validation.mjs";
import { resolvePrincipalCodexPolicy } from "../src/codex-routing.mjs";

test("combo membership is exact, deduplicated, and fails closed", () => {
  const payload = { combos: [{ name: "SIMI-GPT", models: ["cx/gpt", "ag/gemini", "cx/gpt"] }] };
  assert.deepEqual(membersOfCombos(payload, ["SIMI-GPT"]), ["cx/gpt", "ag/gemini"]);
  assert.throws(() => membersOfCombos(payload, ["simi-gpt"]), { statusCode: 503 });
  for (const models of [[], [{ provider: "cx", model: "gpt" }], ["bad\nmodel"], [" cx/gpt"]]) {
    assert.throws(() => membersOfCombos({ combos: [{ name: "x", models }] }, ["x"]), { statusCode: 503 });
  }
  assert.throws(() => membersOfCombos({ combos: [{ name: "x", models: ["y"] }, { name: "y", models: ["cx/gpt"] }] }, ["x"]), /lồng nhau/);
});

test("user key can override its assigned combo while inheriting team mode", () => {
  const principal = {
    principalType: "user",
    aiPolicy: { mode: "inherit", modelSelection: "combo_members", premiumCombo: "SIMI-CLAUDE" },
    team: { code: "SALES", aiPolicy: { mode: "premium_always", premiumCombo: "SIMI-GPT" } }
  };
  assert.equal(resolvePrincipalCodexPolicy(principal).combos.premium, "SIMI-CLAUDE");
  assert.equal(resolvePrincipalCodexPolicy(principal).mode, "premium_always");
  assert.equal(memberSelectionEnabled(principal), true);
  principal.aiPolicy.modelSelection = "combo";
  principal.team.aiPolicy.modelSelection = "combo_members";
  assert.equal(memberSelectionEnabled(principal), false);
});

test("admin policy accepts member selection and rejects invalid choices", () => {
  const policy = { mode: "premium_always", modelSelection: "combo_members", premiumCombo: "SIMI-GPT" };
  assert.equal(normalizeAiPolicy(safePolicy(policy)).modelSelection, "combo_members");
  assert.throws(() => safePolicy({ modelSelection: "all" }), { statusCode: 400 });
  assert.throws(() => normalizeAiPolicy({ modelSelection: "all" }), /modelSelection/);
});

test("server member selection applies to every account including explicit legacy policies", () => {
  const previous = config.codexModelSelection;
  try {
    config.codexModelSelection = "combo_members";
    const principal = {
      principalType: "user",
      aiPolicy: { mode: "premium_always" },
      team: { aiPolicy: { premiumCombo: "SIMI-GEMINI" } }
    };
    assert.equal(memberSelectionEnabled(principal), true);
    assert.equal(resolvePrincipalCodexPolicy(principal).modelSelection, "combo_members");
    assert.equal(resolvePrincipalCodexPolicy(principal).combos.premium, "SIMI-GEMINI");
    principal.team.aiPolicy.modelSelection = "combo";
    principal.aiPolicy.modelSelection = "combo";
    assert.equal(memberSelectionEnabled(principal), true);
    assert.equal(resolvePrincipalCodexPolicy(principal).modelSelection, "combo_members");
    assert.equal(memberSelectionEnabled({ principalType: "team", team: principal.team }), true);
    config.codexModelSelection = "combo";
    assert.equal(memberSelectionEnabled(principal), false);
    assert.equal(resolvePrincipalCodexPolicy(principal).modelSelection, "combo");
    principal.aiPolicy.modelSelection = "combo_members";
    assert.equal(memberSelectionEnabled(principal), true);
    assert.equal(resolvePrincipalCodexPolicy(principal).modelSelection, "combo_members");
  } finally {
    config.codexModelSelection = previous;
  }
});

test("catalog does not invent reasoning levels or context capacity", () => {
  const model = codexModelEntry({ id: "cx/gpt" });
  assert.equal(model.slug, "cx/gpt");
  assert.equal(model.visibility, "list");
  assert.deepEqual(model.supported_reasoning_levels, []);
  assert.equal(model.context_window, null);
});

test("Claude 5.5 catalog exposes High for IT and only levels up to Medium for others", () => {
  const model = { id: "cc/claude-opus-5-5" };
  const it = codexModelEntry(model, 0, { principalType: "user", teamId: "IT" });
  assert.deepEqual(it.supported_reasoning_levels.map((level) => level.effort), ["low", "medium", "high"]);
  const sales = codexModelEntry(model, 0, { principalType: "user", teamId: "SALES" });
  assert.deepEqual(sales.supported_reasoning_levels.map((level) => level.effort), ["low", "medium"]);
  assert.equal(sales.default_reasoning_level, "medium");
});
