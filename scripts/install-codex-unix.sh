#!/usr/bin/env bash
set -euo pipefail

GATEWAY_BASE_URL="${LTN_GATEWAY_BASE_URL:-https://ai.simi.vn/v1}"
CODEX_HOME="${CODEX_HOME:-${HOME}/.codex}"
CONFIG_PATH="${CODEX_HOME}/config.toml"
BIN_DIR="${CODEX_HOME}/bin"
CLIENT_ID_PATH="${CODEX_HOME}/ltn-client-id"
CREDENTIAL_DIR="${CODEX_HOME}/credentials"
LINUX_KEY_PATH="${CREDENTIAL_DIR}/ltn-team-key"
BRIDGE_TOKEN_PATH="${CREDENTIAL_DIR}/ltn-browser-bridge-token"
HELPER_PATH="${BIN_DIR}/ltn-codex-token"
KEYCHAIN_SERVICE="LTN Codex Team Key"
SECRET_SERVICE_LABEL="LTN Codex Team Key"
OS_NAME=""
AUTH_BACKEND=""
TEAM_API_KEY=""
REMOTE_CONFIG_FILE=""
MODE="${1:-}"
CODEX_CMD_PATH=""
CODEX_INSTALL_KIND="missing"
CODEX_VERSION=""
CODEX_HEALTH_STATUS="unknown"
CODEX_HEALTH_REASON=""
CODEX_HEALTH_OUTPUT=""
CONFIG_CHANGED=0
MANAGED_SKILL_NAMES="simi simi-tro-chuyen simi-tao-anh simi-tao-video simi-doc-van-ban simi-chep-loi simi-vector simi-tim-kiem-web simi-doc-trang-web simi-trinh-duyet simi-doc-pdf simi-cai-dat"

cleanup() {
  if [ -n "${REMOTE_CONFIG_FILE}" ] && [ -f "${REMOTE_CONFIG_FILE}" ]; then
    rm -f "${REMOTE_CONFIG_FILE}"
  fi
}
trap cleanup EXIT HUP INT TERM

die() {
  echo "$*" >&2
  exit 1
}

die_code() {
  local code="$1"
  shift
  echo "$*" >&2
  exit "${code}"
}

detect_os() {
  case "$(uname -s)" in
    Darwin) OS_NAME="macos" ;;
    Linux) OS_NAME="linux" ;;
    *) die_code 10 "Installer chi ho tro macOS hoac Linux." ;;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    arm64|aarch64|x86_64|amd64) return 0 ;;
    *) die_code 10 "Kien truc CPU khong duoc ho tro: $(uname -m)" ;;
  esac
}

require_basic_dependencies() {
  local missing=""
  for cmd in curl mktemp grep sed awk chmod mv rm mkdir rmdir tr wc; do
    if ! command -v "${cmd}" >/dev/null 2>&1; then
      missing="${missing} ${cmd}"
    fi
  done
  [ -z "${missing}" ] || die_code 11 "Thieu dependency:${missing}"
}

ensure_dirs() {
  mkdir -p "${CODEX_HOME}" "${BIN_DIR}"
  chmod 700 "${CODEX_HOME}" "${BIN_DIR}" 2>/dev/null || true
}

is_uuid() {
  printf '%s' "$1" | grep -Eiq '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
}

new_uuid() {
  if command -v uuidgen >/dev/null 2>&1; then
    uuidgen | tr '[:upper:]' '[:lower:]'
    return
  fi
  if [ -r /proc/sys/kernel/random/uuid ]; then
    tr '[:upper:]' '[:lower:]' < /proc/sys/kernel/random/uuid
    return
  fi
  die "Không tạo được UUID an toàn trên hệ điều hành này."
}

get_or_create_client_id() {
  local client_id tmp
  if [ -f "${CONFIG_PATH}" ] && grep -q '^\[mcp_servers\.simi_browser\]$' "${CONFIG_PATH}"; then
    echo "Browser MCP config: co" >&2
  else
    echo "Browser MCP config: chua co - chay Repair" >&2
  fi
  if [ -f "${CLIENT_ID_PATH}" ]; then
    client_id="$(tr -d '\r\n' < "${CLIENT_ID_PATH}")"
    if is_uuid "${client_id}"; then
      printf '%s' "${client_id}"
      return
    fi
  fi

  client_id="$(new_uuid)"
  tmp="${CLIENT_ID_PATH}.$$.$(date +%s).tmp"
  printf '%s\n' "${client_id}" > "${tmp}"
  chmod 600 "${tmp}"
  mv "${tmp}" "${CLIENT_ID_PATH}"
  chmod 600 "${CLIENT_ID_PATH}"
  printf '%s' "${client_id}"
}

read_stored_team_key() {
  if [ -n "${TEAM_API_KEY}" ]; then
    return 0
  fi
  if [ -n "${LTN_TEAM_API_KEY:-}" ]; then
    TEAM_API_KEY="${LTN_TEAM_API_KEY}"
    return 0
  fi
  if [ -n "${NINEROUTER_KEY:-}" ]; then
    TEAM_API_KEY="${NINEROUTER_KEY}"
    return 0
  fi
  if [ -x "${HELPER_PATH}" ]; then
    TEAM_API_KEY="$(${HELPER_PATH} 2>/dev/null || true)"
  fi
}

read_team_key() {
  if [ -z "${TEAM_API_KEY}" ] && [ "${MODE}" = "--repair" ]; then
    read_stored_team_key
    if [ -z "${TEAM_API_KEY}" ]; then
      die "Repair khong tim thay API key da luu. Hay chay Install/Update mot lan hoac truyen LTN_TEAM_API_KEY."
    fi
    echo "Repair: dung API key da luu, khong yeu cau nhap lai."
  fi
  if [ -z "${TEAM_API_KEY}" ]; then
    if [ ! -r /dev/tty ]; then
      die "Khong tim thay terminal de nhap API key. Hay chay lai trong terminal tuong tac."
    fi
    IFS= read -r -s -p 'API key cua team: ' TEAM_API_KEY < /dev/tty
    printf '\n'
  fi
  [ -n "${TEAM_API_KEY}" ] || die "API key cua team khong duoc de trong."
}

read_menu_choice() {
  local choice
  if [ ! -r /dev/tty ]; then
    die "Khong tim thay terminal de chon che do. Hay dung --install, --repair, --status hoac --uninstall."
  fi

  {
    echo "Chon che do:"
    echo "  1. Install/Update"
    echo "  2. Repair"
    echo "  3. Status"
    echo "  4. Uninstall"
    printf "Nhap 1-4: "
  } > /dev/tty

  IFS= read -r choice < /dev/tty
  case "${choice}" in
    1) MODE="--install" ;;
    2) MODE="--repair" ;;
    3) MODE="--status" ;;
    4) MODE="--uninstall" ;;
    *) die "Lua chon khong hop le." ;;
  esac
}

curl_with_auth() {
  local url="$1"
  local output="$2"
  local curl_config status
  curl_config="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-curl.XXXXXX")"
  chmod 600 "${curl_config}"
  {
    printf 'header = "Authorization: Bearer %s"\n' "${TEAM_API_KEY}"
    printf 'fail\nsilent\nshow-error\n'
  } > "${curl_config}"
  if curl --config "${curl_config}" --output "${output}" "${url}"; then
    rm -f "${curl_config}"
    return 0
  fi
  status=$?
  rm -f "${curl_config}"
  return "${status}"
}

validate_combo_syntax() {
  local value="$1"
  local name="$2"
  [ -n "${value}" ] || die "Thiếu Combo ID ${name}."
  [ "${#value}" -le 200 ] || die "Combo ID ${name} quá dài."
  case "${value}" in
    *$'\r'*|*$'\n'*) die "Combo ID ${name} không được chứa CR/LF." ;;
  esac
}

redact_diagnostic() {
  printf '%s' "$1" | sed -E 's/(Bearer )[A-Za-z0-9._~+\/=-]+/\1[REDACTED]/g; s/sk-[A-Za-z0-9_-]{12,}/[REDACTED_API_KEY]/g'
}

resolve_codex_command() {
  local link_target=""
  CODEX_CMD_PATH="$(command -v codex 2>/dev/null || true)"
  if [ -z "${CODEX_CMD_PATH}" ]; then
    CODEX_INSTALL_KIND="missing"
    return 1
  fi
  if [ -L "${CODEX_CMD_PATH}" ]; then
    link_target="$(readlink "${CODEX_CMD_PATH}" 2>/dev/null || true)"
  fi

  case "${CODEX_CMD_PATH}" in
    "${HOME}/.local/bin/codex"|\
    "${CODEX_HOME}/bin/codex")
      CODEX_INSTALL_KIND="standalone"
      ;;
    *node_modules*|*/npm/*|*/.npm/*)
      CODEX_INSTALL_KIND="npm"
      ;;
    /opt/homebrew/*|/usr/local/*)
      if printf '%s' "${link_target}" | grep -q 'node_modules/@openai/codex'; then
        CODEX_INSTALL_KIND="npm"
      elif [ -L "${CODEX_CMD_PATH}" ]; then
        CODEX_INSTALL_KIND="standalone"
      else
        CODEX_INSTALL_KIND="unknown"
      fi
      ;;
    *)
      CODEX_INSTALL_KIND="unknown"
      ;;
  esac
  return 0
}

run_codex_version_check() {
  local command_path="$1"
  local output_file status
  output_file="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-version.XXXXXX")"

  if command -v perl >/dev/null 2>&1; then
    perl -e 'alarm shift; exec @ARGV' 8 "${command_path}" --version > "${output_file}" 2>&1
    status=$?
  else
    "${command_path}" --version > "${output_file}" 2>&1
    status=$?
  fi

  CODEX_HEALTH_OUTPUT="$(redact_diagnostic "$(cat "${output_file}" 2>/dev/null || true)")"
  rm -f "${output_file}"
  return "${status}"
}

diagnose_codex_cli() {
  CODEX_VERSION=""
  CODEX_HEALTH_STATUS="unhealthy"
  CODEX_HEALTH_REASON=""
  CODEX_HEALTH_OUTPUT=""

  if ! resolve_codex_command; then
    CODEX_HEALTH_REASON="missing_command"
    return 1
  fi

  if [ -L "${CODEX_CMD_PATH}" ] && [ ! -e "${CODEX_CMD_PATH}" ]; then
    CODEX_HEALTH_REASON="broken_symlink"
    return 1
  fi

  if [ ! -e "${CODEX_CMD_PATH}" ]; then
    CODEX_HEALTH_REASON="missing_file"
    return 1
  fi

  if [ ! -x "${CODEX_CMD_PATH}" ]; then
    CODEX_HEALTH_REASON="not_executable"
    return 1
  fi

  if run_codex_version_check "${CODEX_CMD_PATH}"; then
    CODEX_VERSION="$(printf '%s' "${CODEX_HEALTH_OUTPUT}" | head -n 1 | tr -d '\r')"
    if [ -n "${CODEX_VERSION}" ]; then
      CODEX_HEALTH_STATUS="healthy"
      CODEX_HEALTH_REASON="ok"
      return 0
    fi
    CODEX_HEALTH_REASON="empty_version"
    return 1
  fi

  case "${CODEX_HEALTH_OUTPUT}" in
    *ENOENT*|*'no such file'*|*'No such file'*) CODEX_HEALTH_REASON="vendor_missing" ;;
    *Killed*|*'Killed: 9'*) CODEX_HEALTH_REASON="killed_9" ;;
    *) CODEX_HEALTH_REASON="version_failed" ;;
  esac
  return 1
}

cleanup_broken_npm_codex() {
  local npm_root npm_prefix
  [ "${CODEX_INSTALL_KIND}" = "npm" ] || return 0
  command -v npm >/dev/null 2>&1 || return 0

  npm_root="$(npm root -g 2>/dev/null || true)"
  npm_prefix="$(npm prefix -g 2>/dev/null || true)"
  if [ -n "${npm_root}" ] && [ -d "${npm_root}/@openai/codex" ]; then
    echo "[3/7] Go ban Codex npm bi hong..."
    npm uninstall -g @openai/codex >/dev/null
  fi

  if [ -n "${CODEX_CMD_PATH}" ] &&
     [ -L "${CODEX_CMD_PATH}" ] &&
     [ ! -e "${CODEX_CMD_PATH}" ] &&
     [ "$(basename "${CODEX_CMD_PATH}")" = "codex" ] &&
     [ -n "${npm_prefix}" ]; then
    case "${CODEX_CMD_PATH}" in
      "${npm_prefix}/bin/codex"|\
      "${npm_prefix}/codex"|\
      /opt/homebrew/bin/codex|\
      /usr/local/bin/codex)
        rm -f "${CODEX_CMD_PATH}"
        ;;
    esac
  fi
}

install_codex_cli_official() {
  echo "[4/7] Cai Codex CLI chinh thuc..."
  if ! command -v curl >/dev/null 2>&1; then
    die_code 11 "Thieu curl de cai Codex CLI."
  fi
  if ! curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh; then
    die_code 20 "Khong the cai Codex CLI bang installer chinh thuc."
  fi
  if [ -x "${HOME}/.local/bin/codex" ]; then
    export PATH="${HOME}/.local/bin:${PATH}"
  fi
  if [ -x "${CODEX_HOME}/bin/codex" ]; then
    export PATH="${CODEX_HOME}/bin:${PATH}"
  fi
}

repair_codex_cli_once() {
  echo "[2/7] Phat hien Codex CLI bi loi: ${CODEX_HEALTH_REASON}"
  case "${CODEX_HEALTH_REASON}" in
    missing_command|broken_symlink|missing_file|not_executable|vendor_missing|killed_9|version_failed|empty_version)
      cleanup_broken_npm_codex
      install_codex_cli_official
      ;;
    *)
      install_codex_cli_official
      ;;
  esac
}

ensure_codex_cli_healthy() {
  echo "[1/7] Kiem tra Codex CLI..."
  if diagnose_codex_cli; then
    echo "Codex CLI: OK"
    echo "Codex version: ${CODEX_VERSION}"
    return 0
  fi

  repair_codex_cli_once

  echo "[5/7] Xac minh Codex CLI..."
  if diagnose_codex_cli; then
    echo "Codex CLI: OK"
    echo "Codex version: ${CODEX_VERSION}"
    return 0
  fi

  echo "Khong the khoi phuc Codex CLI." >&2
  echo "Ly do: ${CODEX_HEALTH_REASON}" >&2
  if [ -n "${CODEX_HEALTH_OUTPUT}" ]; then
    echo "Chan doan: ${CODEX_HEALTH_OUTPUT}" >&2
  fi
  echo "SIMI Gateway chua duoc cau hinh. Khong co API key nao duoc thay doi." >&2
  echo "Neu macOS van chan ban Codex chinh thuc, vui long lien he IT. Installer khong tat Gatekeeper va khong bo qua canh bao malware." >&2
  exit 21
}

fetch_and_validate_gateway() {
  local config_file protocol_version routing_mode premium_combo free_combo test_combo
  config_file="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-config.XXXXXX")"
  REMOTE_CONFIG_FILE="${config_file}"
  echo "Đang xác minh Combo SIMI AI qua Gateway..."
  curl_with_auth "${GATEWAY_BASE_URL%/}/codex/installer-config" "${config_file}" ||
    die_code 30 "Gateway không truy cập được, API key không hợp lệ hoặc Combo chưa được cấu hình."

  protocol_version="$(sed -n '1p' "${config_file}" | tr -d '\r')"
  routing_mode="$(sed -n '2p' "${config_file}" | tr -d '\r')"
  premium_combo="$(sed -n '3p' "${config_file}" | tr -d '\r')"
  free_combo="$(sed -n '4p' "${config_file}" | tr -d '\r')"
  test_combo="$(sed -n '5p' "${config_file}" | tr -d '\r')"
  [ "${protocol_version}" = "LTN_CODEX_INSTALLER_V2" ] ||
    die_code 30 "Phản hồi cấu hình installer từ Gateway không hợp lệ."

  case "${routing_mode}" in
    premium_always)
      validate_combo_syntax "${premium_combo}" "combos.premium"
      DEFAULT_MODEL="${premium_combo}"
      REQUIRED_COMBOS="${premium_combo}"
      ;;
    free_only)
      validate_combo_syntax "${free_combo}" "combos.free"
      DEFAULT_MODEL="${free_combo}"
      REQUIRED_COMBOS="${free_combo}"
      ;;
    test_only)
      validate_combo_syntax "${test_combo}" "combos.test"
      DEFAULT_MODEL="${test_combo}"
      REQUIRED_COMBOS="${test_combo}"
      ;;
    *)
      validate_combo_syntax "${premium_combo}" "combos.premium"
      validate_combo_syntax "${free_combo}" "combos.free"
      DEFAULT_MODEL="${premium_combo}"
      REQUIRED_COMBOS="${premium_combo}
${free_combo}"
      ;;
  esac

  rm -f "${config_file}"
  REMOTE_CONFIG_FILE=""
}

gateway_health_status() {
  local health_url
  health_url="${GATEWAY_BASE_URL%/}"
  case "${health_url}" in
    */v1) health_url="${health_url%/v1}/health" ;;
    *) health_url="${health_url}/health" ;;
  esac
  if curl --fail --silent --show-error --max-time 5 "${health_url}" >/dev/null 2>&1; then
    echo "Gateway reachable: yes"
  else
    echo "Gateway reachable: no"
  fi
}

write_macos_helper() {
  cat > "${HELPER_PATH}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [ -n "${LTN_TEAM_API_KEY:-}" ]; then
  printf '%s' "${LTN_TEAM_API_KEY}"
  exit 0
fi
if [ -n "${NINEROUTER_KEY:-}" ]; then
  printf '%s' "${NINEROUTER_KEY}"
  exit 0
fi
security_command="${LTN_SECURITY_COMMAND:-/usr/bin/security}"
if token="$("${security_command}" find-generic-password -s "LTN Codex Team Key" -w 2>/dev/null)" && [ -n "${token}" ]; then
  printf '%s' "${token}"
  exit 0
fi
echo "Khong tim thay LTN team token." >&2
exit 1
EOF
  chmod 700 "${HELPER_PATH}"
}

write_linux_helper() {
  local account="$1"
  if command -v secret-tool >/dev/null 2>&1 && secret-tool lookup service ltn-codex account "${account}" >/dev/null 2>&1; then
    cat > "${HELPER_PATH}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [ -n "${LTN_TEAM_API_KEY:-}" ]; then
  printf '%s' "${LTN_TEAM_API_KEY}"
  exit 0
fi
if [ -n "${NINEROUTER_KEY:-}" ]; then
  printf '%s' "${NINEROUTER_KEY}"
  exit 0
fi
if token="$(secret-tool lookup service ltn-codex 2>/dev/null)" && [ -n "${token}" ]; then
  printf '%s' "${token}"
  exit 0
fi
echo "Khong tim thay LTN team token." >&2
exit 1
EOF
  else
    cat > "${HELPER_PATH}" <<EOF
#!/usr/bin/env bash
set -euo pipefail
if [ -n "\${LTN_TEAM_API_KEY:-}" ]; then
  printf '%s' "\${LTN_TEAM_API_KEY}"
  exit 0
fi
if [ -n "\${NINEROUTER_KEY:-}" ]; then
  printf '%s' "\${NINEROUTER_KEY}"
  exit 0
fi
if [ -r "${LINUX_KEY_PATH}" ]; then
  cat "${LINUX_KEY_PATH}"
  exit 0
fi
echo "Khong tim thay LTN team token." >&2
exit 1
EOF
  fi
  chmod 700 "${HELPER_PATH}"
}

store_credential() {
  local account
  account="$(id -un)"
  if [ "${OS_NAME}" = "macos" ]; then
    /usr/bin/security add-generic-password -a "${account}" -s "${KEYCHAIN_SERVICE}" -w "${TEAM_API_KEY}" -U >/dev/null
    AUTH_BACKEND="macos_keychain"
    write_macos_helper "${account}"
    return
  fi

  if command -v secret-tool >/dev/null 2>&1; then
    if printf '%s' "${TEAM_API_KEY}" | secret-tool store --label="${SECRET_SERVICE_LABEL}" service ltn-codex account "${account}" >/dev/null 2>&1; then
      AUTH_BACKEND="secret_service"
      write_linux_helper "${account}"
      return
    fi
  fi

  mkdir -p "${CREDENTIAL_DIR}"
  chmod 700 "${CREDENTIAL_DIR}"
  local tmp="${LINUX_KEY_PATH}.$$.$(date +%s).tmp"
  printf '%s' "${TEAM_API_KEY}" > "${tmp}"
  chmod 600 "${tmp}"
  mv "${tmp}" "${LINUX_KEY_PATH}"
  chmod 600 "${LINUX_KEY_PATH}"
  AUTH_BACKEND="file"
  write_linux_helper "${account}"
}

escape_toml() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

merge_config() {
  local client_id="$1"
  local backup tmp escaped_base escaped_model escaped_helper escaped_node escaped_browser_mcp
  local preserved_root preserved_tables python_cmd validation_status
  escaped_base="$(escape_toml "${GATEWAY_BASE_URL%/}")"
  escaped_model="$(escape_toml "${DEFAULT_MODEL}")"
  escaped_helper="$(escape_toml "${HELPER_PATH}")"
  escaped_node="$(escape_toml "${RUNTIME_NODE_CMD:-node}")"
  escaped_browser_mcp="$(escape_toml "${CODEX_HOME}/browser-mcp.mjs")"
  mkdir -p "${CODEX_HOME}"

  preserved_root="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-root.XXXXXX")"
  preserved_tables="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-tables.XXXXXX")"

  if [ -f "${CONFIG_PATH}" ]; then
    backup="${CONFIG_PATH}.backup-$(date +%Y%m%d-%H%M%S)"
    cp "${CONFIG_PATH}" "${backup}"

    awk -v root_file="${preserved_root}" -v table_file="${preserved_tables}" '
      BEGIN { managed=0; legacy=0; section="root" }
      /^# BEGIN LTN CODEX MANAGED$/ { managed=1; next }
      /^# END LTN CODEX MANAGED$/ { managed=0; next }
      /^# BEGIN LTN CODEX MANAGED ROOT$/ { managed=1; next }
      /^# END LTN CODEX MANAGED ROOT$/ { managed=0; next }
      /^# BEGIN LTN CODEX MANAGED TABLES$/ { managed=1; next }
      /^# END LTN CODEX MANAGED TABLES$/ { managed=0; next }
      managed { next }
      legacy {
        if ($0 ~ /^[[:space:]]*\[/) { legacy=0 }
        else { next }
      }
      /^[[:space:]]*\[(model_providers\.ltn_gateway(\.auth)?|mcp_servers\.simi_browser)\][[:space:]]*$/ {
        legacy=1
        section="tables"
        next
      }
      /^[[:space:]]*\[/ { section="tables" }
      section == "root" && /^[[:space:]]*model[[:space:]]*=/ { next }
      section == "root" && /^[[:space:]]*model_provider[[:space:]]*=/ { next }
      section == "root" { print > root_file; next }
      { print > table_file }
    ' "${CONFIG_PATH}"
  fi

  tmp="${CONFIG_PATH}.$$.$(date +%s).tmp"
  {
    cat <<EOF
# BEGIN LTN CODEX MANAGED ROOT
# Managed by LTN Codex installer.
model = "${escaped_model}"
model_provider = "ltn_gateway"
# END LTN CODEX MANAGED ROOT
EOF
    cat "${preserved_root}"
    cat <<EOF

# BEGIN LTN CODEX MANAGED TABLES
[model_providers.ltn_gateway]
name = "SIMI Gateway"
base_url = "${escaped_base}"
wire_api = "responses"
http_headers = { "X-LTN-Client-ID" = "${client_id}" }

[model_providers.ltn_gateway.auth]
command = "${escaped_helper}"
args = []
timeout_ms = 5000
refresh_interval_ms = 300000

[mcp_servers.simi_browser]
command = "${escaped_node}"
args = ["${escaped_browser_mcp}"]
startup_timeout_sec = 20
tool_timeout_sec = 90
# END LTN CODEX MANAGED TABLES
EOF
    cat "${preserved_tables}"
  } > "${tmp}"

  python_cmd="${CODEX_HOME}/pdf-runtime/bin/python"
  if [ ! -x "${python_cmd}" ]; then
    python_cmd="${RUNTIME_PYTHON_CMD:-$(command -v python3 2>/dev/null || true)}"
  fi
  if [ -n "${python_cmd}" ]; then
    set +e
    "${python_cmd}" - "${tmp}" <<'PYVALIDATE'
import sys
try:
    import tomllib
except ModuleNotFoundError:
    try:
        import tomli as tomllib
    except ModuleNotFoundError:
        raise SystemExit(2)
with open(sys.argv[1], "rb") as handle:
    tomllib.load(handle)
PYVALIDATE
    validation_status=$?
    set -e
    if [ "${validation_status}" -eq 2 ]; then
      echo "Canh bao: Python hien tai chua co tomllib/tomli; bo qua buoc validate TOML bo sung." >&2
    elif [ "${validation_status}" -ne 0 ]; then
      rm -f "${tmp}" "${preserved_root}" "${preserved_tables}"
      die_code 34 "config.toml moi khong hop le; da giu nguyen config cu."
    fi
  fi

  if [ ! -f "${CONFIG_PATH}" ] || ! cmp -s "${tmp}" "${CONFIG_PATH}"; then
    CONFIG_CHANGED=1
  fi
  chmod 600 "${tmp}"
  mv "${tmp}" "${CONFIG_PATH}"
  chmod 600 "${CONFIG_PATH}"
  rm -f "${preserved_root}" "${preserved_tables}"
}

remove_managed_config() {
  local tmp
  [ -f "${CONFIG_PATH}" ] || return
  tmp="${CONFIG_PATH}.$$.$(date +%s).tmp"
  awk '
    BEGIN { managed=0; legacy=0; section="root" }
    /^# BEGIN LTN CODEX MANAGED$/ { managed=1; next }
    /^# END LTN CODEX MANAGED$/ { managed=0; next }
    /^# BEGIN LTN CODEX MANAGED ROOT$/ { managed=1; next }
    /^# END LTN CODEX MANAGED ROOT$/ { managed=0; next }
    /^# BEGIN LTN CODEX MANAGED TABLES$/ { managed=1; next }
    /^# END LTN CODEX MANAGED TABLES$/ { managed=0; next }
    managed { next }
    legacy {
      if ($0 ~ /^[[:space:]]*\[/) { legacy=0 }
      else { next }
    }
    /^[[:space:]]*\[(model_providers\.ltn_gateway(\.auth)?|mcp_servers\.simi_browser)\][[:space:]]*$/ {
      legacy=1
      section="tables"
      next
    }
    /^[[:space:]]*\[/ { section="tables" }
    section == "root" && /^[[:space:]]*model[[:space:]]*=/ { next }
    section == "root" && /^[[:space:]]*model_provider[[:space:]]*=/ { next }
    { print }
  ' "${CONFIG_PATH}" > "${tmp}"
  chmod 600 "${tmp}"
  mv "${tmp}" "${CONFIG_PATH}"
}

install_managed_9router_skills() {
  local gateway_root skills_root skill_name skill_dir skill_path tmp skill_url
  gateway_root="${GATEWAY_BASE_URL%/}"
  gateway_root="${gateway_root%/v1}"
  skills_root="${CODEX_HOME}/skills"
  mkdir -p "${skills_root}"
  chmod 700 "${skills_root}" 2>/dev/null || true

  for skill_name in ${MANAGED_SKILL_NAMES}; do
    skill_dir="${skills_root}/${skill_name}"
    skill_path="${skill_dir}/SKILL.md"
    tmp="${skill_dir}/SKILL.md.$$.$(date +%s).tmp"
    skill_url="${gateway_root}/install/skills/${skill_name}/SKILL.md"
    if [ "${skill_name}" = "simi-trinh-duyet" ] && [ -d "${skill_dir}" ]; then
      rm -rf -- "${skill_dir}"
      echo "Da xoa skill trinh duyet Simi cu truoc khi cai ban MCP-only."
    fi
    mkdir -p "${skill_dir}"
    chmod 700 "${skill_dir}" 2>/dev/null || true
    if ! curl --fail --silent --show-error --max-redirs 0 \
      --output "${tmp}" "${skill_url}"; then
      rm -f "${tmp}"
      die_code 31 "Khong the tai skill ${skill_name} tu Gateway."
    fi
    if [ "$(wc -c < "${tmp}" | tr -d ' ')" -gt 262144 ] ||
       ! grep -Eq "^name:[[:space:]]*${skill_name}[[:space:]]*$" "${tmp}" ||
       ! grep -Eq '^---[[:space:]]*$' "${tmp}"; then
      rm -f "${tmp}"
      die_code 31 "Noi dung skill ${skill_name} tu Gateway khong hop le."
    fi
    chmod 600 "${tmp}"
    mv "${tmp}" "${skill_path}"
    chmod 600 "${skill_path}"
  done
  echo "Da cai/cap nhat 12 skill Simi. Khoi dong lai Codex Desktop de nap skill moi."
}

get_or_create_browser_bridge_token() {
  local existing_token="${LTN_BROWSER_BRIDGE_TOKEN:-}"
  if [ -n "${existing_token}" ] && [ "${#existing_token}" -ge 32 ]; then
    printf '%s' "${existing_token}"
    return
  fi
  if [ -r "${BRIDGE_TOKEN_PATH}" ]; then
    local stored_token
    stored_token="$(tr -d '\r\n' < "${BRIDGE_TOKEN_PATH}")"
    if [ "${#stored_token}" -ge 32 ]; then
      printf '%s' "${stored_token}"
      return
    fi
  fi
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi
  od -An -N32 -tx1 /dev/urandom | tr -d ' \n'
}

install_browser_bridge() {
  local gateway_root bridge_path bridge_tmp page_client_path page_client_tmp cdp_client_path chrome_debug_path browser_mcp_path asset asset_path asset_tmp bridge_token
  gateway_root="${GATEWAY_BASE_URL%/}"
  gateway_root="${gateway_root%/v1}"
  bridge_path="${CODEX_HOME}/browser-bridge.mjs"
  page_client_path="${CODEX_HOME}/browser-page.mjs"
  cdp_client_path="${CODEX_HOME}/browser-cdp.mjs"
  chrome_debug_path="${CODEX_HOME}/chrome-debug.mjs"
  browser_mcp_path="${CODEX_HOME}/browser-mcp.mjs"
  bridge_tmp="${bridge_path}.$$.$(date +%s).tmp"
  if ! curl --fail --silent --show-error --max-redirs 0 \
    --output "${bridge_tmp}" "${gateway_root}/install/browser-bridge.mjs"; then
    rm -f "${bridge_tmp}"
    die_code 32 "Khong the tai browser bridge tu Gateway."
  fi
  chmod 600 "${bridge_tmp}"
  mv "${bridge_tmp}" "${bridge_path}"
  page_client_tmp="${page_client_path}.$$.$(date +%s).tmp"
  if ! curl --fail --silent --show-error --max-redirs 0 \
    --output "${page_client_tmp}" "${gateway_root}/install/tools/browser-page.mjs"; then
    rm -f "${page_client_tmp}"
    die_code 32 "Khong the tai browser page client tu Gateway."
  fi
  chmod 600 "${page_client_tmp}"
  mv "${page_client_tmp}" "${page_client_path}"
  for asset in browser-cdp.mjs chrome-debug.mjs browser-mcp.mjs; do
    case "${asset}" in
      browser-cdp.mjs) asset_path="${cdp_client_path}" ;;
      chrome-debug.mjs) asset_path="${chrome_debug_path}" ;;
      browser-mcp.mjs) asset_path="${browser_mcp_path}" ;;
    esac
    asset_tmp="${asset_path}.$$.$(date +%s).tmp"
    if ! curl --fail --silent --show-error --max-redirs 0 \
      --output "${asset_tmp}" "${gateway_root}/install/tools/${asset}"; then
      rm -f "${asset_tmp}"
      die_code 32 "Khong the tai browser asset ${asset}."
    fi
    chmod 600 "${asset_tmp}"
    mv "${asset_tmp}" "${asset_path}"
  done

  extension_root="${CODEX_HOME}/browser-extension"
  mkdir -p "${extension_root}"
  chmod 700 "${extension_root}"
  for asset in manifest.json service-worker.js popup.html popup.js options.html options.js; do
    asset_path="${extension_root}/${asset}"
    asset_tmp="${asset_path}.$$.$(date +%s).tmp"
    if ! curl --fail --silent --show-error --max-redirs 0 \
      --output "${asset_tmp}" "${gateway_root}/install/browser-extension/${asset}"; then
      rm -f "${asset_tmp}"
      die_code 32 "Khong the tai browser extension asset ${asset}."
    fi
    chmod 600 "${asset_tmp}"
    mv "${asset_tmp}" "${asset_path}"
  done

  bridge_token="$(get_or_create_browser_bridge_token)"
  [ -n "${bridge_token}" ] || die_code 32 "Khong tao duoc browser bridge token."
  mkdir -p "${CREDENTIAL_DIR}"
  chmod 700 "${CREDENTIAL_DIR}"
  printf '%s' "${bridge_token}" > "${BRIDGE_TOKEN_PATH}"
  chmod 600 "${BRIDGE_TOKEN_PATH}"
  printf 'self.SIMI_BRIDGE_TOKEN = %s;\n' "$(printf '%s' "${bridge_token}" | sed "s/'/\\\\'/g; s/.*/'&'/")" > "${extension_root}/bridge-config.js"
  chmod 600 "${extension_root}/bridge-config.js"

cat > "${BIN_DIR}/ltn-browser-bridge" <<EOF
#!/usr/bin/env bash
set -euo pipefail
export LTN_BROWSER_BRIDGE_TOKEN="\${LTN_BROWSER_BRIDGE_TOKEN:-\$(cat "${BRIDGE_TOKEN_PATH}")}"
node_bin="\${LTN_BROWSER_NODE_PATH:-node}"
exec "\${node_bin}" "${bridge_path}"
EOF
  chmod 700 "${BIN_DIR}/ltn-browser-bridge"
cat > "${BIN_DIR}/ltn-browser-page" <<EOF
#!/usr/bin/env bash
set -euo pipefail
node_bin="\${LTN_BROWSER_NODE_PATH:-node}"
exec "\${node_bin}" "${page_client_path}" "\$@"
EOF
  chmod 700 "${BIN_DIR}/ltn-browser-page"
cat > "${BIN_DIR}/ltn-chrome-debug" <<EOF
#!/usr/bin/env bash
set -euo pipefail
node_bin="\${LTN_BROWSER_NODE_PATH:-node}"
exec "\${node_bin}" "${chrome_debug_path}" "\$@"
EOF
  chmod 700 "${BIN_DIR}/ltn-chrome-debug"
  echo "Da cai Chrome CDP client: ${chrome_debug_path}"
  echo "Da cai browser MCP tu dong: ${browser_mcp_path}"
  echo "  Tu dong mo profile Chrome khi skill simi-trinh-duyet duoc goi"
  echo "  User chi can dang nhap mot lan trong cua so Chrome moi"
}

runtime_node_major() {
  local node_command="$1" version
  version="$(${node_command} --version 2>/dev/null || true)"
  printf '%s' "${version#v}" | cut -d. -f1
}

run_privileged() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    return 1
  fi
}

install_runtime_packages() {
  [ "${LTN_SKIP_RUNTIME_INSTALL:-0}" = "1" ] && return 1
  if [ "${OS_NAME}" = "macos" ] && command -v brew >/dev/null 2>&1; then
    brew install node python
    return $?
  fi

  if [ "${OS_NAME}" != "linux" ]; then
    return 1
  fi
  if command -v apt-get >/dev/null 2>&1; then
    run_privileged apt-get update &&
      run_privileged apt-get install -y python3 python3-venv python3-pip nodejs npm
    return $?
  fi
  if command -v dnf >/dev/null 2>&1; then
    run_privileged dnf install -y python3 python3-pip nodejs npm
    return $?
  fi
  if command -v yum >/dev/null 2>&1; then
    run_privileged yum install -y python3 python3-pip nodejs npm
    return $?
  fi
  if command -v pacman >/dev/null 2>&1; then
    run_privileged pacman -Sy --noconfirm python python-pip nodejs npm
    return $?
  fi
  if command -v zypper >/dev/null 2>&1; then
    run_privileged zypper --non-interactive install python3 python3-pip nodejs npm
    return $?
  fi
  return 1
}

resolve_runtime_commands() {
  RUNTIME_NODE_CMD="$(command -v node 2>/dev/null || true)"
  RUNTIME_PYTHON_CMD="$(command -v python3 2>/dev/null || command -v python 2>/dev/null || true)"
}

ensure_runtime_dependencies() {
  local node_major runtime_dir venv_python marker
  [ -f "${CODEX_HOME}/browser-mcp.mjs" ] && echo "Browser MCP runtime: da cai" || echo "Browser MCP runtime: chua co - chay Repair"
  resolve_runtime_commands
  node_major=0
  if [ -n "${RUNTIME_NODE_CMD}" ]; then
    node_major="$(runtime_node_major "${RUNTIME_NODE_CMD}")"
  fi
  if [ -z "${RUNTIME_NODE_CMD}" ] || [ "${node_major}" -lt 20 ] || [ -z "${RUNTIME_PYTHON_CMD}" ]; then
    echo "Kiem tra Node.js 20+ va Python 3..."
    if [ "${LTN_SKIP_RUNTIME_INSTALL:-0}" != "1" ] && ! install_runtime_packages; then
      echo "Canh bao: khong tu dong cai duoc Node.js/Python. Hay cai thu cong roi chay Repair." >&2
    fi
    resolve_runtime_commands
  fi

  if [ -n "${RUNTIME_NODE_CMD}" ]; then
    node_major="$(runtime_node_major "${RUNTIME_NODE_CMD}")"
    echo "Node.js: $(${RUNTIME_NODE_CMD} --version 2>/dev/null || true)"
    if [ "${node_major}" -lt 20 ]; then
      echo "Canh bao: Node.js hien tai nho hon 20; ltn-9router va 9Router real co the khong chay du." >&2
    fi
  else
    echo "Canh bao: chua co Node.js; bridge va ltn-9router se chua dung duoc." >&2
  fi

  if [ -z "${RUNTIME_PYTHON_CMD}" ]; then
    echo "Canh bao: chua co Python 3; phan tich PDF se bao loi cho den khi cai Python." >&2
    return 0
  fi

  runtime_dir="${CODEX_HOME}/pdf-runtime"
  venv_python="${runtime_dir}/bin/python"
  mkdir -p "${runtime_dir}"
  if [ ! -x "${venv_python}" ]; then
    if ! "${RUNTIME_PYTHON_CMD}" -m venv "${runtime_dir}" >/dev/null 2>&1; then
      echo "Canh bao: khong tao duoc Python venv cho PDF." >&2
      return 0
    fi
  fi
  marker="${runtime_dir}/.ltn-pdf-deps-v2"
  if [ ! -f "${marker}" ] && [ "${LTN_SKIP_RUNTIME_INSTALL:-0}" != "1" ]; then
    echo "Dang cai thu vien PDF: pypdf, pdfplumber, pymupdf, tomli..."
    if "${venv_python}" -m pip install --disable-pip-version-check --upgrade pypdf pdfplumber pymupdf tomli; then
      printf 'pypdf\npdfplumber\npymupdf\ntomli\n' > "${marker}"
      chmod 600 "${marker}"
    else
      echo "Canh bao: khong tai duoc thu vien PDF. Kiem tra mang roi chay Repair." >&2
    fi
  fi
  echo "Python PDF runtime: ${venv_python}"
}

install_local_tools() {
  local gateway_root tools_dir asset asset_path asset_tmp
  gateway_root="${GATEWAY_BASE_URL%/}"
  gateway_root="${gateway_root%/v1}"
  tools_dir="${CODEX_HOME}/tools"
  mkdir -p "${tools_dir}"
  chmod 700 "${tools_dir}"
  for asset in 9router-client.mjs pdf-extract.py; do
    asset_path="${tools_dir}/${asset}"
    asset_tmp="${asset_path}.$$.$(date +%s).tmp"
    if ! curl --fail --silent --show-error --max-redirs 0 \
      --output "${asset_tmp}" "${gateway_root}/install/tools/${asset}"; then
      rm -f "${asset_tmp}"
      die_code 32 "Khong the tai local tool ${asset} tu Gateway."
    fi
    chmod 700 "${asset_tmp}"
    mv "${asset_tmp}" "${asset_path}"
  done

  cat > "${BIN_DIR}/ltn-9router" <<EOF
#!/usr/bin/env bash
set -euo pipefail
node_bin="\${LTN_NODE_PATH:-\${LTN_BROWSER_NODE_PATH:-node}}"
exec "\${node_bin}" "${tools_dir}/9router-client.mjs" "\$@"
EOF
  chmod 700 "${BIN_DIR}/ltn-9router"
  cat > "${BIN_DIR}/ltn-pdf" <<EOF
#!/usr/bin/env bash
set -euo pipefail
if [ -n "\${LTN_PYTHON_PATH:-}" ]; then
  python_bin="\${LTN_PYTHON_PATH}"
elif [ -x "${CODEX_HOME}/pdf-runtime/bin/python" ]; then
  python_bin="${CODEX_HOME}/pdf-runtime/bin/python"
else
  python_bin="\${PYTHON_BIN:-\${RUNTIME_PYTHON_CMD:-python3}}"
fi
exec "\${python_bin}" "${tools_dir}/pdf-extract.py" "\$@"
EOF
  chmod 700 "${BIN_DIR}/ltn-pdf"
  echo "Da cai lenh mang: ltn-9router"
  echo "Da cai lenh PDF: ltn-pdf"
}

verify_codex_managed_runtime_config() {
  local mcp_json
  if ! grep -Eq '^[[:space:]]*model_provider[[:space:]]*=[[:space:]]*"ltn_gateway"[[:space:]]*$' "${CONFIG_PATH}"; then
    die_code 34 "Cau hinh model_provider=ltn_gateway chua duoc ghi dung vao config.toml."
  fi
  if ! mcp_json="$("${CODEX_CMD_PATH}" mcp get simi_browser --json 2>/dev/null)"; then
    if ! mcp_json="$("${CODEX_CMD_PATH}" mcp get simi_browser 2>/dev/null)"; then
      echo "Canh bao: Codex CLI hien tai chua xac minh duoc MCP simi_browser; hay chay Status sau khi mo Terminal moi." >&2
      return 0
    fi
  fi
  if ! printf '%s' "${mcp_json}" | grep -q 'browser-mcp.mjs'; then
    die_code 34 "Codex khong tim thay MCP simi_browser sau khi cai dat."
  fi
  echo "Codex runtime config: provider ltn_gateway + MCP simi_browser OK"
}

install_or_repair() {
  local client_id
  ensure_dirs
  detect_arch
  require_basic_dependencies
  ensure_codex_cli_healthy
  ensure_runtime_dependencies
  echo "[6/7] Cau hinh SIMI Gateway..."
  read_team_key
  fetch_and_validate_gateway
  client_id="$(get_or_create_client_id)"
  store_credential
  merge_config "${client_id}"
  echo "[7/7] Cai full skill 9Router..."
  install_managed_9router_skills
  install_browser_bridge
  install_local_tools
  verify_codex_managed_runtime_config
  diagnose_codex_cli >/dev/null 2>&1 || die_code 21 "Codex CLI bi loi sau khi cau hinh. Vui long lien he IT."
  echo ""
  echo "Cài đặt LTN Codex hoàn tất."
  case "${OS_NAME}" in
    macos) echo "Hệ điều hành: macOS" ;;
    linux) echo "Hệ điều hành: Linux" ;;
  esac
  echo "Codex CLI: ${CODEX_VERSION}"
  echo "Gateway: ${GATEWAY_BASE_URL%/}"
  echo "Model mặc định: ${DEFAULT_MODEL}"
  echo ""
  echo "Bước tiếp theo:"
  echo "  1. Mở cửa sổ Terminal mới."
  echo "  2. Kiểm tra: codex --version"
  echo "  3. Khởi động: codex"
  case "${OS_NAME}" in
    macos)
      if [ "${CONFIG_CHANGED}" = "0" ]; then
        echo "  4. Cau hinh khong doi: chi tao New chat, khong can dong/mo hoac dang nhap lai."
      else
        echo "  4. Provider/MCP da thay doi: dong va mo lai Codex Desktop mot lan de giao dien nap cau hinh moi."
      fi
      ;;
    linux)
      echo "  4. Nếu lệnh codex chưa được nhận diện, đăng xuất rồi đăng nhập lại."
      ;;
  esac
}

status() {
  local client_id redacted skill_name skill_count mcp_json
  ensure_dirs
  echo "OS: ${OS_NAME}"
  detect_arch
  echo "Architecture: $(uname -m)"
  if diagnose_codex_cli; then
    echo "Codex command: ${CODEX_CMD_PATH}"
    echo "Codex install type: ${CODEX_INSTALL_KIND}"
    echo "Codex healthy: yes"
    echo "Codex version: ${CODEX_VERSION}"
  else
    echo "Codex command: ${CODEX_CMD_PATH:-not found}"
    echo "Codex install type: ${CODEX_INSTALL_KIND}"
    echo "Codex healthy: no"
    echo "Codex reason: ${CODEX_HEALTH_REASON}"
    if [ -n "${CODEX_HEALTH_OUTPUT}" ]; then
      echo "Codex diagnostic: ${CODEX_HEALTH_OUTPUT}"
    fi
  fi
  [ -f "${CONFIG_PATH}" ] && echo "config.toml: có" || echo "config.toml: chưa có"
  if [ -f "${CONFIG_PATH}" ] && grep -q 'model_providers.ltn_gateway' "${CONFIG_PATH}"; then
    echo "provider ltn_gateway: có"
  else
    echo "provider ltn_gateway: chưa có"
  fi
  if [ -f "${CLIENT_ID_PATH}" ]; then
    client_id="$(tr -d '\r\n' < "${CLIENT_ID_PATH}")"
    if is_uuid "${client_id}"; then
      redacted="$(printf '%s' "${client_id}" | cut -c1-8)"
      echo "Client ID: ${redacted}-..."
    else
      echo "Client ID: không hợp lệ"
    fi
  else
    echo "Client ID: chưa có"
  fi
  if [ -x "${HELPER_PATH}" ] && "${HELPER_PATH}" >/dev/null 2>&1; then
    echo "Credential: có"
  else
    echo "Credential: chưa có hoặc không đọc được"
  fi
  skill_count=0
  for skill_name in ${MANAGED_SKILL_NAMES}; do
    if [ -f "${CODEX_HOME}/skills/${skill_name}/SKILL.md" ]; then
      skill_count=$((skill_count + 1))
    fi
  done
  echo "Simi skills: ${skill_count}/12"
  if [ -r "${BRIDGE_TOKEN_PATH}" ]; then
    echo "Browser bridge token: da tao"
  else
    echo "Browser bridge token: chua tao"
  fi
  resolve_runtime_commands
  if [ -n "${RUNTIME_NODE_CMD}" ]; then
    echo "Node.js: $(${RUNTIME_NODE_CMD} --version 2>/dev/null || true)"
  else
    echo "Node.js: chua co"
  fi
  if [ -n "${RUNTIME_PYTHON_CMD}" ]; then
    echo "Python: ${RUNTIME_PYTHON_CMD}"
  else
    echo "Python: chua co"
  fi
  [ -x "${CODEX_HOME}/pdf-runtime/bin/python" ] && echo "PDF runtime: da tao" || echo "PDF runtime: chua tao"
  if [ -n "${CODEX_CMD_PATH}" ]; then
    if mcp_json="$("${CODEX_CMD_PATH}" mcp get simi_browser --json 2>/dev/null)" ||
       mcp_json="$("${CODEX_CMD_PATH}" mcp get simi_browser 2>/dev/null)"; then
      echo "Codex config parser: OK"
      if grep -Eq '^[[:space:]]*model_provider[[:space:]]*=[[:space:]]*"ltn_gateway"[[:space:]]*$' "${CONFIG_PATH}"; then
        echo "Codex configured provider: ltn_gateway"
      else
        echo "Codex configured provider: khong dung"
      fi
      if printf '%s' "${mcp_json}" | grep -q 'browser-mcp.mjs'; then
        echo "Codex MCP registry: simi_browser"
      else
        echo "Codex MCP registry: khong tim thay"
      fi
    else
      echo "Codex config parser: loi"
    fi
  fi
  gateway_health_status
}

uninstall_ltn() {
  local account skill_name skill_dir
  account="$(id -un)"
  remove_managed_config
  rm -f "${HELPER_PATH}" "${CLIENT_ID_PATH}" "${LINUX_KEY_PATH}" "${BRIDGE_TOKEN_PATH}" "${CODEX_HOME}/browser-bridge.mjs" "${CODEX_HOME}/browser-page.mjs" "${CODEX_HOME}/browser-cdp.mjs" "${CODEX_HOME}/chrome-debug.mjs" "${CODEX_HOME}/browser-mcp.mjs"
  rm -f "${BIN_DIR}/ltn-9router" "${BIN_DIR}/ltn-pdf"
  rm -rf "${CODEX_HOME}/tools" "${CODEX_HOME}/pdf-runtime"
  rm -rf "${CODEX_HOME}/browser-extension"
  rm -f "${BIN_DIR}/ltn-browser-bridge" "${BIN_DIR}/ltn-browser-page" "${BIN_DIR}/ltn-chrome-debug"
  for skill_name in ${MANAGED_SKILL_NAMES}; do
    skill_dir="${CODEX_HOME}/skills/${skill_name}"
    rm -f "${skill_dir}/SKILL.md"
    rmdir "${skill_dir}" 2>/dev/null || true
  done
  if [ "${OS_NAME}" = "macos" ]; then
    /usr/bin/security delete-generic-password -a "${account}" -s "${KEYCHAIN_SERVICE}" >/dev/null 2>&1 || true
  elif command -v secret-tool >/dev/null 2>&1; then
    secret-tool clear service ltn-codex account "${account}" >/dev/null 2>&1 || true
  fi
  echo "Đã gỡ cấu hình LTN Codex. Không gỡ Codex CLI."
}

main() {
  detect_os
  if [ -z "${MODE}" ]; then
    read_menu_choice
  fi

  case "${MODE}" in
    --install|--repair|--status|--uninstall) ;;
    *) die "Flag không hợp lệ. Dùng --install, --repair, --status hoặc --uninstall." ;;
  esac

  case "${MODE}" in
    --install|--repair) install_or_repair ;;
    --status) status ;;
    --uninstall) uninstall_ltn ;;
  esac
}

if [ "${LTN_CODEX_SOURCE_ONLY:-0}" != "1" ]; then
  main
fi
