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
