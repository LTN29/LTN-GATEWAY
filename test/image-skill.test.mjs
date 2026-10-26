import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("image skill distinguishes network approval, DNS, and repair failures", async () => {
  const skill = await readFile(
    new URL("../vendor/9router-skills/simi-tao-anh/SKILL.md", import.meta.url),
    "utf8"
  );

  assert.match(skill, /network access needs approval/);
  assert.match(skill, /Do not tell the user to run Repair for that case/);
  assert.match(skill, /Report DNS only when name resolution itself failed/);
});

test("image skill picks the image model matching the active chat model", async () => {
  const skill = await readFile(
    new URL("../vendor/9router-skills/simi-tao-anh/SKILL.md", import.meta.url),
    "utf8"
  );

  assert.match(skill, /^---\r?\nname: simi-tao-anh\r?\n/);
  assert.match(skill, /cùng hãng với model chat đang dùng/);
  assert.match(skill, /\/models\/image/);
  assert.match(skill, /Khối lệnh/);
  assert.match(skill, /ltn-codex-token/);
  assert.match(skill, /simi-image-bad\.json/);
  assert.match(skill, /muse-tao-anh/);
  assert.match(skill, /kết thúc lượt/);
  assert.match(skill, /--max-time 170/);
  assert.doesNotMatch(skill, /not a binary\/SSE image downloader/);
  assert.doesNotMatch(skill, /combo_members/);
  assert.doesNotMatch(skill, /router\.simi\.vn\//);
});

test("update skill runs the official installer in non-interactive Update mode", async () => {
  const skill = await readFile(
    new URL("../vendor/9router-skills/simi-cap-nhat/SKILL.md", import.meta.url),
    "utf8"
  );

  assert.match(skill, /^---\r?\nname: simi-cap-nhat\r?\n/);
  assert.match(skill, /https:\/\/ai\.simi\.vn\/install\/codex-full\.ps1/);
  assert.match(skill, /-Mode update/);
  assert.match(skill, /codex\.sh/);
  assert.match(skill, /--update/);
  assert.match(skill, /tắt hẳn Codex/);
  assert.doesNotMatch(skill, /-Mode (install|repair|uninstall)/);
  assert.doesNotMatch(skill, /sudo bash/);
});
