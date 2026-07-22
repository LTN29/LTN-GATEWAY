import test from "node:test";
import assert from "node:assert/strict";
import { sha256, redactSecrets, safeTeamCode } from "../src/utils.mjs";

test("sha256 stable", () => {
  assert.equal(
    sha256("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  );
});

test("redacts common secrets", () => {
  const result = redactSecrets("api_key=sk-abcdefghijklmnop");
  assert.equal(result.includes("sk-abcdefghijklmnop"), false);
});

test("team code normalized", () => {
  assert.equal(safeTeamCode(" warranty "), "WARRANTY");
});
