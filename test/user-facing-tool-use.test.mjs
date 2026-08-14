import test from "node:test";
import assert from "node:assert/strict";
import { buildMemorySystemContent } from "../src/memory.mjs";
import { readFile } from "node:fs/promises";

test("gateway instructions forbid invented or exposed tool-call payloads", () => {
  const content = buildMemorySystemContent(
    { code: "TEST", displayName: "Test" },
    "company",
    "team"
  );

  assert.match(content, /Call only tools actually exposed in the current session/);
  assert.match(content, /Never invent or print tool\/function-call markup/);
  assert.match(content, /instead of pretending the work was done/);
});

test("Simi skills require natural-language updates instead of tool markup", async () => {
  const files = ["simi", "simi-trinh-duyet", "simi-tao-anh"];
  const skills = await Promise.all(files.map((name) => readFile(
    new URL(`../vendor/9router-skills/${name}/SKILL.md`, import.meta.url),
    "utf8"
  )));

  for (const skill of skills) {
    assert.match(skill, /ordinary user/i);
    assert.match(skill, /tool-call|tool\/function-call/i);
  }
});
