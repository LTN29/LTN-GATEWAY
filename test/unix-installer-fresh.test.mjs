import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const script = () => readFile(new URL("../scripts/install-codex-unix.sh", import.meta.url), "utf8");

test("installer never stops silently: errors print the failing line", async () => {
  const text = await script();
  assert.match(text, /^#!\/usr\/bin\/env bash\nset -Eeuo pipefail\n/);
  assert.match(text, /trap '.*Loi: installer dung o dong \$\{LINENO\}.*' ERR/);
});

test("a fresh machine without config.toml does not abort while reading the current model", async () => {
  const text = await script();
  assert.doesNotMatch(text, /current_model="\$\(sed[^\n]*CONFIG_PATH[^\n]*\| head/, "pipefail + missing file used to exit silently at step 6");
  const block = /current_model=""\n\s*if \[ -f "\$\{CONFIG_PATH\}" \]; then\n\s*(current_model="\$\(awk .*?\)")\n\s*fi/s.exec(text);
  assert.ok(block, "model is only read when config.toml exists");
  if (spawnSync("bash", ["-c", "true"]).status !== 0) return;
  for (const [content, expected] of [
    [null, ""],
    ['model = "claude-sonnet-5-5"\nmodel_provider = "ltn_gateway"\n\n[profiles.fast]\nmodel = "x"\n', "claude-sonnet-5-5"],
    ['[profiles.fast]\nmodel = "x"\n', ""]
  ]) {
    const prelude = content === null
      ? 'CONFIG_PATH=/nonexistent/config.toml'
      : `CONFIG_PATH="$(mktemp)"; printf '%s' ${JSON.stringify(content)} > "$CONFIG_PATH"`;
    const run = spawnSync("bash", ["-c", `set -Eeuo pipefail; ${prelude}; current_model=""; if [ -f "\${CONFIG_PATH}" ]; then ${block[1]}; fi; printf '%s' "$current_model"`], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout, expected);
  }
});

test("Linux gets a private Node.js 22 when the distro ships an older one", async () => {
  const text = await script();
  assert.match(text, /install_ltn_node_runtime\(\) \{/);
  assert.match(text, /if \[ "\$\{OS_NAME\}" = "linux" \] && .*\n(?:.*\n){0,6}.*\( install_ltn_node_runtime \)/);
  assert.match(text, /node_os="linux"/);
  assert.match(text, /sha256sum/);
});
