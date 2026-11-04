// Nhãn tốc độ model lấy từ thời gian thật tới chữ đầu tiên và tỉ lệ lỗi (chỉ để user tham khảo khi tự chọn model).
import test from "node:test";
import assert from "node:assert/strict";
import { recordModelSpeed, modelSpeed, withModelSpeed, resetModelSpeed } from "../src/model-speed.mjs";

test("trung vị thời gian tới chữ đầu, nhãn nhanh / chậm / hay lỗi, bỏ mẫu quá cũ", () => {
  resetModelSpeed();
  const now = 10_000_000_000;
  for (const ms of [1200, 900, 2500, 1800]) recordModelSpeed("cc/fast", { ok: true, firstTokenMs: ms }, now);
  assert.equal(modelSpeed("cc/fast", now), null, "dưới 5 mẫu thì chưa kết luận");
  recordModelSpeed("cc/fast", { ok: true, firstTokenMs: 1500 }, now);
  assert.deepEqual(modelSpeed("cc/fast", now), { samples: 5, medianMs: 1500, p90Ms: 2220, errorRate: 0, label: "fast" });

  for (const ms of [17000, 21000, 52000, 16000, 30000]) recordModelSpeed("cx/slow", { ok: true, firstTokenMs: ms }, now);
  assert.equal(modelSpeed("cx/slow", now).label, "slow");

  for (let i = 0; i < 6; i++) recordModelSpeed("oc/flaky", { ok: i % 2 === 0, firstTokenMs: 800 }, now);
  assert.equal(modelSpeed("oc/flaky", now).label, "unstable");
  assert.equal(modelSpeed("oc/flaky", now).errorRate, 0.5);

  assert.equal(modelSpeed("cc/fast", now + 7 * 3600 * 1000), null, "quá 6 giờ thì bỏ");
  const list = withModelSpeed([{ id: "cc/fast" }, { id: "khac" }], now);
  assert.equal(list[0].speed.label, "fast");
  assert.equal("speed" in list[1], false);
});
