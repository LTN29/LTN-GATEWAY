import test from "node:test";
import assert from "node:assert/strict";
import {
  parseModelRequest,
  injectResponsesMemory,
  responseInputMessages
} from "../src/model-routing.mjs";

test("preserves a 9Router Combo ID exactly", () => {
  const raw = Buffer.from(JSON.stringify({
    model: "combo/ltn-code-auto",
    input: "hello"
  }));

  assert.equal(parseModelRequest(raw).model, "combo/ltn-code-auto");
});

test("rejects a missing model", () => {
  assert.throws(
    () => parseModelRequest(Buffer.from('{"input":"hello"}')),
    /model phải là một chuỗi không rỗng/
  );
});

test("rejects malformed JSON", () => {
  assert.throws(
    () => parseModelRequest(Buffer.from("{")),
    /JSON không hợp lệ/
  );
});

test("injects memory before client instructions without changing model", () => {
  const result = injectResponsesMemory({
    model: "combo/ltn-code-auto",
    instructions: "Client instruction",
    input: "Hello"
  }, "LTN memory");

  assert.equal(result.model, "combo/ltn-code-auto");
  assert.match(result.instructions, /^LTN memory/);
  assert.match(result.instructions, /Client instruction/);
  assert.equal(result.input, "Hello");
});

test("normalizes string and Responses message input for extraction", () => {
  assert.deepEqual(responseInputMessages("Hello"), [
    { role: "user", content: "Hello" }
  ]);

  assert.deepEqual(responseInputMessages([
    {
      role: "user",
      content: [
        { type: "input_text", text: "First" },
        { type: "text", text: "Second" }
      ]
    },
    { role: "assistant", content: "Answer" }
  ]), [
    { role: "user", content: "First\nSecond" },
    { role: "assistant", content: "Answer" }
  ]);
});
