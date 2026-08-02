import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("browser skill is MCP-only and cannot fall back to slow terminal commands", async () => {
  const skill = await readFile(
    new URL("../vendor/9router-skills/9router-browser/SKILL.md", import.meta.url),
    "utf8"
  );

  assert.match(skill, /simi_browser\.browser_read_pages/);
  assert.match(skill, /MCP-only workflow/);
  assert.match(skill, /Never run Terminal commands/);
  assert.match(skill, /option 2 \(Repair\)/);
  assert.doesNotMatch(skill, /ltn-browser-page/);
  assert.doesNotMatch(skill, /ltn-chrome-debug/);
  assert.doesNotMatch(skill, /```(?:bash|powershell)/);
});
