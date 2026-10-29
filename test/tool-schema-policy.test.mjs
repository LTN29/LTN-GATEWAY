import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRootSchema, sanitizeToolSchemas } from "../src/tool-schema-policy.mjs";

const COMBINERS = ["anyOf", "oneOf", "allOf"];
const rootIsClean = (schema) => schema.type === "object" && COMBINERS.every((key) => !(key in schema));

const oneOfRoot = {
  oneOf: [
    { type: "object", properties: { url: { type: "string" }, mode: { type: "string" } }, required: ["url", "mode"], additionalProperties: false },
    { type: "object", properties: { file_id: { type: "string" }, mode: { type: "string" } }, required: ["file_id", "mode"], additionalProperties: false }
  ]
};

test("root oneOf becomes one object schema with merged properties", () => {
  const result = normalizeRootSchema(oneOfRoot);
  assert.ok(rootIsClean(result));
  assert.deepEqual(Object.keys(result.properties).sort(), ["file_id", "mode", "url"]);
  assert.deepEqual(result.required, ["mode"], "only fields required by every branch stay required");
  assert.equal(result.additionalProperties, false);
  assert.match(result.description, /exactly one/);
});

test("root allOf merges required fields", () => {
  const result = normalizeRootSchema({ allOf: [
    { type: "object", properties: { a: { type: "string" } }, required: ["a"] },
    { type: "object", properties: { b: { type: "number" } }, required: ["b"] }
  ] });
  assert.ok(rootIsClean(result));
  assert.deepEqual(result.required.sort(), ["a", "b"]);
});

test("conflicting property schemas are kept as a nested anyOf", () => {
  const result = normalizeRootSchema({ anyOf: [
    { type: "object", properties: { v: { type: "string" } } },
    { type: "object", properties: { v: { type: "number" } } }
  ] });
  assert.deepEqual(result.properties.v, { anyOf: [{ type: "string" }, { type: "number" }] });
});

test("nested combiners and clean schemas are untouched", () => {
  const schema = { type: "object", properties: { edits: { type: "array", items: { oneOf: [{ type: "string" }, { type: "number" }] } } } };
  assert.equal(normalizeRootSchema(schema), schema);
});

test("responses, namespace, chat and messages tools are all fixed without mutating input", () => {
  const responses = { tools: [
    { type: "function", name: "ok", parameters: { type: "object", properties: {} } },
    { type: "function", name: "bad", parameters: oneOfRoot },
    { type: "namespace", name: "mcp__x", tools: [{ type: "function", name: "inner", parameters: { anyOf: oneOfRoot.oneOf } }] },
    { type: "web_search" }
  ] };
  const snapshot = JSON.stringify(responses);
  const r = sanitizeToolSchemas(responses, "responses");
  assert.deepEqual(r.changed, ["bad", "inner"]);
  assert.ok(rootIsClean(r.payload.tools[1].parameters));
  assert.ok(rootIsClean(r.payload.tools[2].tools[0].parameters));
  assert.equal(r.payload.tools[0], responses.tools[0]);
  assert.equal(JSON.stringify(responses), snapshot);

  const chat = sanitizeToolSchemas({ tools: [{ type: "function", function: { name: "c", parameters: oneOfRoot } }] }, "chat");
  assert.deepEqual(chat.changed, ["c"]);
  assert.ok(rootIsClean(chat.payload.tools[0].function.parameters));

  const messages = sanitizeToolSchemas({ tools: [{ name: "m", input_schema: oneOfRoot }] }, "messages");
  assert.deepEqual(messages.changed, ["m"]);
  assert.ok(rootIsClean(messages.payload.tools[0].input_schema));
});

test("payloads without bad schemas are returned as the same object", () => {
  const payload = { tools: [{ type: "function", name: "f", parameters: { type: "object" } }] };
  assert.equal(sanitizeToolSchemas(payload).payload, payload);
  assert.equal(sanitizeToolSchemas({ input: "hi" }).changed.length, 0);
});
