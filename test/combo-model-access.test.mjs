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
  assert.deepEqual(model.input_modalities, ["text"]);
});

test("catalog preserves declared vision and supplies known Claude vision when metadata is absent", () => {
  assert.deepEqual(codexModelEntry({ id: "cc/claude-opus-5-5" }).input_modalities, ["text", "image"]);
  assert.deepEqual(codexModelEntry({ id: "cc/claude-sonnet-5-5" }).input_modalities, ["text", "image"]);
  assert.deepEqual(codexModelEntry({ id: "custom/vision", input_modalities: ["text", "image", "image"] }).input_modalities, ["text", "image"]);
  assert.deepEqual(codexModelEntry({ id: "cc/claude-opus-5-5", input_modalities: ["text"] }).input_modalities, ["text"]);
  assert.deepEqual(codexModelEntry({ id: "custom/unknown", input_modalities: [] }).input_modalities, ["text"]);
});

test("Claude 5.5 catalog exposes High for IT and only levels up to Medium for others", () => {
  const model = { id: "cc/claude-opus-5-5" };
  const it = codexModelEntry(model, 0, { principalType: "user", teamId: "IT" });
  assert.deepEqual(it.supported_reasoning_levels.map((level) => level.effort), ["low", "medium", "high"]);
  const sales = codexModelEntry(model, 0, { principalType: "user", teamId: "SALES" });
  assert.deepEqual(sales.supported_reasoning_levels.map((level) => level.effort), ["low", "medium"]);
  assert.equal(sales.default_reasoning_level, "medium");
});

test("GPT vision catalogs cover deployed model IDs without enabling unknown aliases", () => {
  for (const id of ["cx/gpt-5.6-sol", "cx/gpt-5-6-sol", "cx/gpt-5.6-terra", "cx/gpt-5.6-luna",
    "cx/gpt-6-sol", "cx/gpt-6-astra", "cx/gpt-6-luna[1m]", "cx/gpt-6.1-sol"]) {
    const entry = codexModelEntry({ id });
    assert.equal(entry.slug, id);
    assert.deepEqual(entry.input_modalities, ["text", "image"], id);
  }
  for (const id of ["cx/gpt", "cx/gpt-6-unknown", "custom/text-model", "cx/gpt-image-2"]) {
    assert.deepEqual(codexModelEntry({ id }).input_modalities, ["text"], id);
  }
  assert.deepEqual(codexModelEntry({ id: "cx/gpt-6.1-sol", input_modalities: ["text"] }).input_modalities, ["text"]);
});

test("Gemini chat models and router presets allow images without enabling specialized or unknown models", () => {
  for (const id of ["ag/gemini-3.1-pro-low", "ag/gemini-3.1-pro-high", "ag/gemini-3.1-pro-agent",
    "ag/gemini-3.8-flash-medium", "gc/gemini-3-flash", "gemini/gemini-3.1-pro-preview",
    "gemini/gemini-3.1-flash-lite", "gc/gemini-2.5-pro", "gc/gemini-2.5-flash"]) {
    const entry = codexModelEntry({ id });
    assert.equal(entry.slug, id);
    assert.deepEqual(entry.input_modalities, ["text", "image"], id);
  }
  for (const id of ["ag/gemini", "ag/gemini-pro-agent", "ag/gemini-future", "gemini/gemini-3.8-flash-tts",
    "gemini/gemini-embedding-001", "gemini/gemini-3.1-flash-image"]) {
    assert.deepEqual(codexModelEntry({ id }).input_modalities, ["text"], id);
  }
  assert.deepEqual(codexModelEntry({ id: "ag/gemini-3.1-pro-low", input_modalities: ["text"] }).input_modalities, ["text"]);
});
