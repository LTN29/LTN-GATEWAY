import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const unix = readFileSync(new URL("../scripts/install-codex-unix.sh", import.meta.url), "utf8");
const windows = readFileSync(new URL("../scripts/install-codex-windows.ps1", import.meta.url), "utf8");
const code = unix.match(/<<'PLUGINJS'\n([\s\S]*?)\nPLUGINJS/)[1];
function run(catalog, failList = false, failAdd = false) {
  const calls = [], warnings = [];
  vm.runInNewContext(code, {
    process: { argv: ["node", "-", "/bin/codex"] },
    console: { warn: message => warnings.push(message), log() {} },
    require: () => ({ spawnSync(command, args) {
      calls.push(args);
      if (args[1] === "list") return { status: failList ? 1 : 0, stdout: JSON.stringify(catalog) };
      return { status: failAdd ? 1 : 0, stderr: "install failure" };
    } })
  });
  return { calls, warnings };
}
test("common plugins use discovered IDs and preserve installed/disabled plugins", () => {
  const result = run({ installed: [{ name: "pdf", enabled: false }], available: [
    { name: "pdf", pluginId: "pdf@official" },
    { name: "documents", pluginId: "documents@actual-marketplace" },
    { name: "gmail", pluginId: "gmail@official" }
  ] });
  assert.equal(result.calls.length, 2);
  assert.deepEqual(Array.from(result.calls[1]), ["plugin", "add", "documents@actual-marketplace", "--json"]);
  assert.equal(result.warnings.length, 5);
});
test("missing CLI support and failed plugin downloads do not abort setup", () => {
  assert.match(run({}, true).warnings[0], /Gateway setup will continue/);
  const result = run({ available: [{ name: "pdf", pluginId: "pdf@official" }] }, false, true);
  assert.ok(result.warnings.some(message => message.includes("Could not install plugin 'pdf'")));
});
test("both installers invoke common plugin installation and share defaults", () => {
  assert.match(windows, /Install-CommonCodexPlugins\r?\n\r?\n\$installedCodexStatus/);
  assert.match(unix, /verify_codex_managed_runtime_config\n  install_common_codex_plugins/);
  for (const name of ["documents", "pdf", "spreadsheets", "presentations", "template-creator", "visualize", "computer-use"]) {
    assert.ok(windows.includes('"' + name + '"'));
    assert.ok(code.includes('"' + name + '"'));
  }
  assert.match(windows, /installed \| Where-Object/);
  assert.match(windows, /plugin add \$entry.pluginId --json/);
});

test("Windows runtime fallback uses official verified artifacts and per-user installation", () => {
  assert.match(windows, /https:\/\/nodejs\.org\/dist\/latest-v22\.x/);
  assert.match(windows, /Get-FileHash -LiteralPath \$archive -Algorithm SHA256/);
  assert.match(windows, /Get-AuthenticodeSignature -LiteralPath \$installer/);
  assert.match(windows, /Python Software Foundation/);
  assert.match(windows, /InstallAllUsers=0/);
  assert.match(windows, /Install-DirectWindowsRuntime -Kind node/);
  assert.match(windows, /Install-DirectWindowsRuntime -Kind python/);
  assert.match(windows, /\$nodeRuntimeReady -and \$pdfRuntimeReady/);
  assert.match(windows, /LTN_SKIP_RUNTIME_INSTALL/);
});
