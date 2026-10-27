import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("SIMI Chrome stays visible and the user has a direct shortcut to the managed profile", async () => {
  const launcher = await read("../scripts/chrome-debug.mjs");
  assert.match(launcher, /windowsHide: false/);
  const installer = await read("../scripts/install-codex-windows.ps1");
  assert.match(installer, /Install-SimiChromeShortcut -CodexHome \$codexHome/);
  assert.match(installer, /SIMI Chrome\.lnk/);
  assert.match(installer, /--user-data-dir=/);
  assert.match(installer, /chrome-profile/);
  assert.match(installer, /remote-debugging-port=9222/);
});

test("browser MCP can bring SIMI Chrome forward for sign-in and verification", async () => {
  const mcp = await read("../scripts/browser-mcp.mjs");
  assert.match(mcp, /name: "browser_open_window"/);
  assert.match(mcp, /activateCdpTarget/);
  const cdp = await read("../scripts/browser-cdp.mjs");
  assert.match(cdp, /verify\\\\\/traffic/);
  const skill = await read("../vendor/9router-skills/simi-trinh-duyet/SKILL.md");
  assert.match(skill, /simi_browser\.browser_open_window/);
  assert.match(skill, /SIMI Chrome/);
});

test("macOS and Ubuntu installers create a visible SIMI Chrome launcher", async () => {
  const unix = await read("../scripts/install-codex-unix.sh");
  assert.match(unix, /install_browser_bridge\n  install_simi_chrome_launcher\n/);
  assert.match(unix, /SIMI Chrome\.app/);
  assert.match(unix, /CFBundleExecutable/);
  assert.match(unix, /simi-chrome\.desktop/);
  assert.match(unix, /metadata::trusted true/);
  assert.match(unix, /xdg-user-dir DESKTOP/);
});
