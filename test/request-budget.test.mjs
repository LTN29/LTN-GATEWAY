import test from "node:test";
import assert from "node:assert/strict";
import { budgetResponsesPayload } from "../src/request-budget.mjs";

const image = (id) => ({ type: "input_image", image_url: `data:image/png;base64,${id}` });

test("Responses budget hoists tool screenshots and keeps only recent images", () => {
  const input = [
    { type: "message", role: "user", content: [image("old1"), image("old2")] },
    { type: "function_call_output", call_id: "shot", output: [{ type: "input_text", text: "captured" }, image("tool")] },
    { type: "message", role: "user", content: [image("new1"), image("new2"), image("new3")] }
  ];
  const { payload, stats } = budgetResponsesPayload({ model: "m", input });

  assert.equal(payload.input[1].output, "captured\n[Tool trả về 1 ảnh; ảnh được đính kèm ngay sau kết quả này.]");
  assert.deepEqual(payload.input[2].content, [image("tool")]);
  assert.equal(stats.hoistedImages, 1);
  assert.equal(stats.omittedImages, 2);
  assert.equal(payload.input[0].content.every((part) => part.type === "input_text"), true);
  assert.equal(payload.input[3].content.length, 3);
});

test("Responses budget removes pasted base64 and truncates oversized tool text", () => {
  const blob = `data:image/png;base64,${"A".repeat(8000)}`;
  const { payload, stats } = budgetResponsesPayload({
    model: "m",
    input: [{ type: "function_call_output", output: `${blob}\n${"log line ".repeat(30_000)}` }]
  });

  assert.equal(payload.input[0].output.includes("A".repeat(4096)), false);
  assert.match(payload.input[0].output, /Dữ liệu base64 8022 ký tự đã được lược bỏ/);
  assert.ok(payload.input[0].output.length < 201_000);
  assert.deepEqual({ base64Blobs: stats.base64Blobs, truncatedTexts: stats.truncatedTexts }, { base64Blobs: 1, truncatedTexts: 1 });
});
