import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("browser page client starts the bridge and captures only through the local bridge", async () => {
  const source = await readFile(new URL("../scripts/browser-page.mjs", import.meta.url), "utf8");

  assert.match(source, /spawn\(nodeBin, \[bridgePath\]/);
  assert.match(source, /detached: true/);
  assert.match(source, /windowsHide: true/);
  assert.match(source, /LTN_BROWSER_BRIDGE_TOKEN_PATH/);
  assert.match(source, /describeFetchError/);
  assert.match(source, /\/v1\/bridge\/capture/);
  assert.doesNotMatch(source, /cookie/i);
  assert.doesNotMatch(source, /localStorage|sessionStorage|password/i);
});
