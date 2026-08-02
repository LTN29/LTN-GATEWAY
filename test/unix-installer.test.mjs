import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const bootstrapPath = new URL("../scripts/install-codex-unix-bootstrap.sh", import.meta.url);
const fullInstallerPath = new URL("../scripts/install-codex-unix.sh", import.meta.url);
const bootstrapFsPath = fileURLToPath(bootstrapPath);
const fullInstallerFsPath = fileURLToPath(fullInstallerPath);

async function readScript(path) {
  return readFile(path, "utf8");
}

test("Unix bootstrap is safe for curl pipe bash", async () => {
  const script = await readScript(bootstrapPath);

  assert.match(script, /^#!\/usr\/bin\/env bash/);
  assert.match(script, /set -euo pipefail/);
  assert.match(script, /INSTALLER_URL="https:\/\/ai\.simi\.vn\/install\/codex-full\.sh"/);
  assert.match(script, /INSTALLER_HOST="ai\.simi\.vn"/);
  assert.match(script, /mktemp "\$\{TMPDIR:-\/tmp\}\/ltn-codex-installer\.XXXXXX"/);
  assert.match(script, /trap cleanup EXIT HUP INT TERM/);
  assert.match(script, /--proto '=https'/);
  assert.match(script, /--proto-redir '=https'/);
  assert.match(script, /%{url_effective}/);
  assert.match(script, /if \[ "\$\{EFFECTIVE_URL\}" != "\$\{INSTALLER_URL\}" \]/);
  assert.match(script, /bash "\$\{TEMP_INSTALLER\}" "\$@"/);
  assert.doesNotMatch(script, /^\s*param\s*\(/m);
  assert.doesNotMatch(script, /\[CmdletBinding\(\)\]/);
  assert.doesNotMatch(script, /\bsk-[A-Za-z0-9_-]{12,}\b/);
  assert.doesNotMatch(script, /SIMI-(?:GPT|FREE|AI)/);
  assert.doesNotMatch(script, /config[\\/]teams\.json/i);
});

test("Unix full installer supports macOS/Linux without embedding secrets or combo prefixes", async () => {
  const script = await readScript(fullInstallerPath);

  assert.match(script, /^#!\/usr\/bin\/env bash/);
  assert.match(script, /set -euo pipefail/);
  assert.match(script, /Darwin\) OS_NAME="macos"/);
  assert.match(script, /Linux\) OS_NAME="linux"/);
  assert.match(script, /Hệ điều hành: macOS/);
  assert.match(script, /Hệ điều hành: Linux/);
  assert.match(script, /Kiểm tra: codex --version/);
  assert.match(script, /Khởi động: codex/);
  assert.match(script, /https:\/\/chatgpt\.com\/codex\/install\.sh \| CODEX_NON_INTERACTIVE=1 sh/);
  assert.doesNotMatch(script, /https:\/\/chatgpt\.com\/codex\/install\.sh \| sh/);
  assert.match(script, /MODE="\$\{1:-\}"/);
  assert.match(script, /read -r -s -p 'API key cua team: '/);
  assert.match(script, /read_stored_team_key\(\)/);
  assert.match(script, /\[ "\$\{MODE\}" = "--repair" \]/);
  assert.match(script, /Repair: dung API key da luu/);
  assert.match(script, /local existing_token="\$\{LTN_BROWSER_BRIDGE_TOKEN:-\}"/);
  assert.doesNotMatch(script, /\$\{#LTN_BROWSER_BRIDGE_TOKEN:-0\}/);
  assert.match(script, /< \/dev\/tty/);
  assert.match(script, /read_menu_choice\(\)/);
  assert.match(script, /Chon che do:/);
  assert.match(script, /1\. Install\/Update/);
  assert.match(script, /2\. Repair/);
  assert.match(script, /3\. Status/);
  assert.match(script, /4\. Uninstall/);
  assert.match(script, /IFS= read -r choice < \/dev\/tty/);
  assert.match(script, /if \[ -z "\$\{MODE\}" \]; then/);
  assert.match(script, /diagnose_codex_cli\(\)/);
  assert.match(script, /repair_codex_cli_once\(\)/);
  assert.match(script, /install_codex_cli_official\(\)/);
  assert.match(script, /ensure_codex_cli_healthy\(\)/);
  assert.match(script, /CODEX_NON_INTERACTIVE=1 sh/);
  assert.match(script, /npm uninstall -g @openai\/codex/);
  assert.match(script, /readlink "\$\{CODEX_CMD_PATH\}"/);
  assert.match(script, /node_modules\/@openai\/codex/);
  assert.match(script, /vendor_missing/);
  assert.match(script, /killed_9/);
  assert.match(script, /broken_symlink/);
  assert.match(script, /version_failed/);
  assert.match(script, /exit 21/);
  assert.match(script, /LTN_CODEX_SOURCE_ONLY/);
  assert.doesNotMatch(script, /codex --version >\/dev\/null 2>&1 \|\| true/);
  assert.doesNotMatch(script, /rm -rf "\$\{HOME\}\/\.codex|rm -rf ~\/\.codex|spctl --master-disable|xattr -d/);
  assert.match(script, /if curl --config "\$\{curl_config\}" --output "\$\{output\}" "\$\{url\}"; then/);
  assert.match(script, /status=\$\?/);
  assert.match(script, /\/codex\/installer-config/);
  assert.match(script, /LTN_CODEX_INSTALLER_V2/);
  assert.match(script, /test_only/);
  assert.match(script, /Đang xác minh Combo SIMI AI qua Gateway/);
  assert.match(script, /command -v python3/);
  assert.match(script, /python3 python3-venv python3-pip nodejs npm/);
  assert.doesNotMatch(script, /combo\/\$\{?[A-Za-z_]/);
  assert.doesNotMatch(script, /combo\/SIMI-AI/);
  assert.match(script, /CLIENT_ID_PATH="\$\{CODEX_HOME\}\/ltn-client-id"/);
  assert.match(script, /chmod 600 "\$\{CLIENT_ID_PATH\}"/);
  assert.match(script, /LTN_SECURITY_COMMAND:-\/usr\/bin\/security/);
  assert.match(script, /find-generic-password -s "LTN Codex Team Key" -w/);
  assert.doesNotMatch(script, /find-generic-password[^\n]*-a\s+["']?simi/i);
  assert.match(script, /secret-tool store/);
  assert.match(script, /LINUX_KEY_PATH="\$\{CREDENTIAL_DIR\}\/ltn-team-key"/);
  assert.match(script, /chmod 600 "\$\{LINUX_KEY_PATH\}"/);
  assert.match(script, /# BEGIN LTN CODEX MANAGED/);
  assert.match(script, /# END LTN CODEX MANAGED/);
  assert.match(script, /http_headers = \{ "X-LTN-Client-ID" = "\$\{client_id\}" \}/);
  assert.match(script, /\[model_providers\.ltn_gateway\.auth\]/);
  assert.match(script, /name = "SIMI Gateway"/);
  assert.match(script, /command = "\$\{escaped_helper\}"/);
  assert.match(script, /--install\|--repair\|--status\|--uninstall/);
  assert.match(script, /remove_managed_config/);
  assert.match(script, /install_managed_9router_skills\(\)/);
  assert.match(script, /install\/skills\/\$\{skill_name\}\/SKILL\.md/);
  assert.match(script, /MANAGED_SKILL_NAMES=/);
  assert.match(script, /9Router skills: \$\{skill_count\}\/11/);
  assert.match(script, /ensure_runtime_dependencies\(\)/);
  assert.match(script, /install_local_tools\(\)/);
  assert.match(script, /install\/tools\/\$\{asset\}/);
  assert.match(script, /install\/tools\/browser-page\.mjs/);
  assert.match(script, /browser-cdp\.mjs/);
  assert.match(script, /chrome-debug\.mjs/);
  assert.match(script, /browser-mcp\.mjs/);
  assert.match(script, /\[mcp_servers\.simi_browser\]/);
  assert.match(script, /tool_timeout_sec = 90/);
  assert.match(script, /Browser MCP config:/);
  assert.match(script, /Browser MCP runtime:/);
  assert.match(script, /rm -rf -- "\$\{skill_dir\}"/);
  assert.match(script, /MCP-only/);
  assert.match(script, /ltn-chrome-debug/);
  assert.match(script, /page_client_path="\$\{CODEX_HOME\}\/browser-page\.mjs"/);
  assert.match(script, /exec .*page_client_path/);
  assert.doesNotMatch(script, /\bsk-[A-Za-z0-9_-]{12,}\b/);
  assert.doesNotMatch(script, /MS_CLIENT_SECRET|Cloudflare token/i);
  assert.doesNotMatch(script, /config[\\/]teams\.json/i);
});

test("Unix installer verifies Codex before asking for API key or writing config", async () => {
  const script = await readScript(fullInstallerPath);
  const installFlow = script.match(/install_or_repair\(\) \{[\s\S]*?\n\}/)?.[0] || "";

  assert.match(installFlow, /ensure_codex_cli_healthy/);
  assert.match(installFlow, /read_team_key/);
  assert.match(installFlow, /fetch_and_validate_gateway/);
  assert.match(installFlow, /store_credential/);
  assert.match(installFlow, /merge_config/);
  assert.ok(
    installFlow.indexOf("ensure_codex_cli_healthy") <
      installFlow.indexOf("read_team_key")
  );
  assert.ok(
    installFlow.indexOf("read_team_key") <
      installFlow.indexOf("merge_config")
  );
});

test("Unix installer status does not auto repair or ask for API key", async () => {
  const script = await readScript(fullInstallerPath);
  const statusFunction = script.match(/^status\(\) \{[\s\S]*?\n\}/m)?.[0] || "";

  assert.match(statusFunction, /diagnose_codex_cli/);
  assert.doesNotMatch(statusFunction, /ensure_codex_cli_healthy|repair_codex_cli_once|install_codex_cli_official|read_team_key|store_credential|merge_config/);
});

test("Unix installer config merge removes only the LTN managed block and avoids duplicates", async () => {
  const script = await readScript(fullInstallerPath);

  assert.ok(script.includes("/^# BEGIN LTN CODEX MANAGED$/ { inside=1; next }"));
  assert.ok(script.includes("/^# END LTN CODEX MANAGED$/ { inside=0; next }"));
  assert.ok(script.includes("inside { next }"));
  assert.ok(script.includes("!seen_table && /^[[:space:]]*model[[:space:]]*=/ { next }"));
  assert.ok(script.includes("!seen_table && /^[[:space:]]*model_provider[[:space:]]*=/ { next }"));
});

test("Unix shell scripts pass bash syntax check when bash is available", { skip: !commandExists("bash") }, () => {
  for (const path of [bootstrapFsPath, fullInstallerFsPath]) {
    const result = spawnSync("bash", ["-n", path], {
      encoding: "utf8"
    });
    assert.equal(result.status, 0, result.stderr);
  }
});

function commandExists(command) {
  const probe = spawnSync(command, ["--version"], {
    encoding: "utf8",
    stdio: "ignore"
  });
  return probe.status === 0;
}
