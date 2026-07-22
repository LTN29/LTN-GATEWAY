import test from "node:test";
import assert from "node:assert/strict";
import {
  assistantTextFromJson,
  assistantTextFromSse
} from "../src/response-parser.mjs";

test("reads non-stream assistant content", () => {
  assert.equal(
    assistantTextFromJson({
      choices: [{ message: { content: "OK" } }]
    }),
    "OK"
  );
});

test("reads SSE deltas", () => {
  const sse = [
    'data: {"choices":[{"delta":{"content":"LTN "}}]}',
    'data: {"choices":[{"delta":{"content":"OK"}}]}',
    "data: [DONE]"
  ].join("\n");

  assert.equal(assistantTextFromSse(sse), "LTN OK");
});
