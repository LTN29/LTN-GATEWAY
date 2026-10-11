import test from "node:test";
import assert from "node:assert/strict";
import { membersOfCombos, memberSelectionEnabled, codexModelEntry } from "../src/combo-model-access.mjs";
import { normalizeAiPolicy } from "../src/config.mjs";
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

test("catalog does not invent reasoning levels or context capacity", () => {
  const model = codexModelEntry({ id: "cx/gpt" });
  assert.equal(model.slug, "cx/gpt");
  assert.equal(model.visibility, "list");
  assert.deepEqual(model.supported_reasoning_levels, []);
  assert.equal(model.context_window, null);
});
