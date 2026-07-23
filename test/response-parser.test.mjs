import test from "node:test";
import assert from "node:assert/strict";
import {
  assistantTextFromJson,
  assistantTextFromSse,
  responsesJsonSucceeded,
  responsesSseCompleted
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

test("reads Responses API non-stream output", () => {
  assert.equal(
    assistantTextFromJson({
      output: [{
        type: "message",
        content: [{ type: "output_text", text: "Responses OK" }]
      }]
    }),
    "Responses OK"
  );
});

test("reads Responses API SSE output text deltas", () => {
  const sse = [
    'data: {"type":"response.output_text.delta","delta":"LTN "}',
    'data: {"type":"response.output_text.delta","delta":"OK"}',
    'data: {"type":"response.completed","response":{"status":"completed"}}'
  ].join("\n");

  assert.equal(assistantTextFromSse(sse), "LTN OK");
  assert.equal(responsesSseCompleted(sse), true);
});

test("does not mark failed or incomplete Responses as successful", () => {
  assert.equal(responsesJsonSucceeded({ status: "failed" }), false);
  assert.equal(
    responsesSseCompleted(
      'data: {"type":"response.failed","response":{"status":"failed"}}'
    ),
    false
  );
});
