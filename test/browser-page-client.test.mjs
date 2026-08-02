import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("browser page client defaults to CDP and keeps the bridge only as an explicit fallback", async () => {
  const source = await readFile(new URL("../scripts/browser-page.mjs", import.meta.url), "utf8");

  assert.match(source, /spawn\(nodeBin, \[bridgePath\]/);
  assert.match(source, /detached: true/);
  assert.match(source, /windowsHide: true/);
  assert.match(source, /LTN_BROWSER_BRIDGE_TOKEN_PATH/);
  assert.match(source, /describeFetchError/);
  assert.match(source, /\/v1\/bridge\/capture/);
  assert.match(source, /chromeDebugPath/);
  assert.match(source, /startChromeDebug/);
  assert.match(source, /ensureChromeDebug\(targetUrls\[0\]/);
  assert.match(source, /readCdpPages/);
  assert.match(source, /browser\.pages/);
  assert.match(source, /useLegacyBridge/);
  assert.match(source, /args\.has\("--bridge"\)/);
  assert.match(source, /remote-debugging-port|\/json\/version/);
  assert.doesNotMatch(source, /cookie/i);
  assert.doesNotMatch(source, /localStorage|sessionStorage|password/i);
});
