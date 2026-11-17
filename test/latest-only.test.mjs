// AI làm lại việc cũ: trí nhớ "Ngữ cảnh gần đây" lưu nguyên văn yêu cầu trước (vd "đóng gói src.zip") nên model tưởng
// là việc phải làm. Ngữ cảnh gần đây phải hiện rõ là việc ĐÃ XONG, và system luôn có luật chỉ làm tin mới nhất.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = await mkdtemp(join(tmpdir(), "ltn-latest-"));
await mkdir(join(dir, "memory"), { recursive: true });
process.env.MEMORY_DIR = join(dir, "memory");
process.env.ONEDRIVE_MODE = "off";
const { buildMemorySystemContent, presentRecentContext, LATEST_ONLY_RULE } = await import("../src/memory.mjs");

const team = { code: "SALES", displayName: "Sales" };
const user = { principalType: "user", userId: "u1", displayName: "U1" };

test("system content always carries the latest-message-only rule", () => {
  const s = buildMemorySystemContent(team, "c", "t", "", user);
  assert.ok(s.includes(LATEST_ONLY_RULE));
  assert.match(LATEST_ONLY_RULE, /tin nhắn MỚI NHẤT/);
  assert.match(LATEST_ONLY_RULE, /KHÔNG tự làm lại/);
});

test("old and new recent-work-context lines are shown as finished, never as a request", () => {
  const mem = "# Ngữ cảnh gần đây\n<!-- ltn:key=recent-work-context -->\n- Yêu cầu công việc gần đây: đóng gói src.zip\n# Khác\n- Thích văn ngắn\n";
  const s = buildMemorySystemContent(team, "c", "t", mem, user);
  assert.doesNotMatch(s, /Yêu cầu công việc gần đây/);
  assert.match(s, /ĐÃ xử lý xong – chỉ để hiểu bối cảnh, KHÔNG tự làm lại\): đóng gói src\.zip/);
  assert.match(s, /- Thích văn ngắn/);
  const crlf = "<!-- ltn:key=recent-work-context -->\r\n- Chủ đề trao đổi gần đây (đã xử lý): sửa bài viết\r\n";
  assert.match(presentRecentContext(crlf), /KHÔNG tự làm lại\): sửa bài viết/);
  assert.equal(presentRecentContext("- Yêu cầu công việc gần đây: x"), "- Yêu cầu công việc gần đây: x"); // ngoài khối recent-work-context thì giữ nguyên
});
