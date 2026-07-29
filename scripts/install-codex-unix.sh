#!/usr/bin/env bash
set -euo pipefail

GATEWAY_BASE_URL="${LTN_GATEWAY_BASE_URL:-https://ai.simi.vn/v1}"
CODEX_HOME="${CODEX_HOME:-${HOME}/.codex}"
CONFIG_PATH="${CODEX_HOME}/config.toml"
BIN_DIR="${CODEX_HOME}/bin"
CLIENT_ID_PATH="${CODEX_HOME}/ltn-client-id"
CREDENTIAL_DIR="${CODEX_HOME}/credentials"
LINUX_KEY_PATH="${CREDENTIAL_DIR}/ltn-team-key"
HELPER_PATH="${BIN_DIR}/ltn-codex-token"
KEYCHAIN_SERVICE="LTN Codex Team Key"
SECRET_SERVICE_LABEL="LTN Codex Team Key"
OS_NAME=""
AUTH_BACKEND=""
TEAM_API_KEY=""
REMOTE_CONFIG_FILE=""
REMOTE_MODELS_FILE=""
MODE="${1:-}"
CODEX_CMD_PATH=""
CODEX_INSTALL_KIND="missing"
CODEX_VERSION=""
CODEX_HEALTH_STATUS="unknown"
CODEX_HEALTH_REASON=""
CODEX_HEALTH_OUTPUT=""

cleanup() {
  if [ -n "${REMOTE_CONFIG_FILE}" ] && [ -f "${REMOTE_CONFIG_FILE}" ]; then
    rm -f "${REMOTE_CONFIG_FILE}"
  fi
  if [ -n "${REMOTE_MODELS_FILE}" ] && [ -f "${REMOTE_MODELS_FILE}" ]; then
    rm -f "${REMOTE_MODELS_FILE}"
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
  for cmd in curl mktemp grep sed awk chmod mv rm mkdir tr; do
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
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import uuid
print(uuid.uuid4())
PY
    return
  fi
  die "Không tạo được UUID an toàn. Hãy cài uuidgen hoặc python3."
}

get_or_create_client_id() {
  local client_id tmp
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

read_team_key() {
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

json_value() {
  local file="$1"
  local path="$2"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$file" "$path" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as f:
    data = json.load(f)
value = data
for part in sys.argv[2].split("."):
    if not isinstance(value, dict) or part not in value:
        sys.exit(0)
    value = value[part]
if value is None:
    sys.exit(0)
print(value)
PY
    return
  fi
  if command -v node >/dev/null 2>&1; then
    node -e 'const fs=require("fs"); let v=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); for (const p of process.argv[2].split(".")) { if (!v || typeof v !== "object" || !(p in v)) process.exit(0); v=v[p]; } if (v != null) console.log(v);' "$file" "$path"
    return
  fi
  die "Cần python3 hoặc node để đọc phản hồi JSON từ Gateway."
}

combo_exists() {
  local file="$1"
  local combo_id="$2"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$file" "$combo_id" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as f:
    data = json.load(f)
combo_id = sys.argv[2]
found = False
for item in data.get("data", []):
    if item.get("id") == combo_id:
        found = True
        owned_by = item.get("owned_by")
        if owned_by is not None and owned_by != "combo":
            print("bad_owner")
            sys.exit(2)
if not found:
    print("missing")
    sys.exit(1)
print("ok")
PY
    return $?
  fi
  if command -v node >/dev/null 2>&1; then
    node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); const id=process.argv[2]; let found=false; for (const item of data.data || []) { if (item.id===id) { found=true; if (item.owned_by != null && item.owned_by !== "combo") { console.log("bad_owner"); process.exit(2); } } } if (!found) { console.log("missing"); process.exit(1); } console.log("ok");' "$file" "$combo_id"
    return $?
  fi
  die "Cần python3 hoặc node để xác minh Combo trong GET /v1/models."
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
    echo "[3/6] Go ban Codex npm bi hong..."
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
  echo "[4/6] Cai Codex CLI chinh thuc..."
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
  echo "[2/6] Phat hien Codex CLI bi loi: ${CODEX_HEALTH_REASON}"
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
  echo "[1/6] Kiem tra Codex CLI..."
  if diagnose_codex_cli; then
    echo "Codex CLI: OK"
    echo "Codex version: ${CODEX_VERSION}"
    return 0
  fi

  repair_codex_cli_once

  echo "[5/6] Xac minh Codex CLI..."
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
  echo "LTN Gateway chua duoc cau hinh. Khong co API key nao duoc thay doi." >&2
  echo "Neu macOS van chan ban Codex chinh thuc, vui long lien he IT. Installer khong tat Gatekeeper va khong bo qua canh bao malware." >&2
  exit 21
}

fetch_and_validate_gateway() {
  local config_file models_file routing_mode premium_combo free_combo result
  config_file="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-config.XXXXXX")"
  models_file="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-models.XXXXXX")"
  REMOTE_CONFIG_FILE="${config_file}"
  REMOTE_MODELS_FILE="${models_file}"
  curl_with_auth "${GATEWAY_BASE_URL%/}/codex/config" "${config_file}" ||
    die_code 30 "Gateway khong truy cap duoc hoac API key khong hop le khi goi /v1/codex/config."
  curl_with_auth "${GATEWAY_BASE_URL%/}/models" "${models_file}" ||
    die_code 30 "Gateway khong truy cap duoc hoac API key khong hop le khi goi /v1/models."

  routing_mode="$(json_value "${config_file}" "routing.mode")"
  premium_combo="$(json_value "${config_file}" "combos.premium")"
  free_combo="$(json_value "${config_file}" "combos.free")"

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
    *)
      validate_combo_syntax "${premium_combo}" "combos.premium"
      validate_combo_syntax "${free_combo}" "combos.free"
      DEFAULT_MODEL="${premium_combo}"
      REQUIRED_COMBOS="${premium_combo}
${free_combo}"
      ;;
  esac

  printf '%s\n' "${REQUIRED_COMBOS}" | while IFS= read -r combo_id; do
    [ -n "${combo_id}" ] || continue
    result="$(combo_exists "${models_file}" "${combo_id}")" || {
      case "$?" in
        2) die "Model '${combo_id}' tồn tại nhưng owned_by không phải combo." ;;
        *) die "Thiếu Combo trên 9Router: ${combo_id}" ;;
      esac
    }
    [ "${result}" = "ok" ] || die "Combo không hợp lệ: ${combo_id}"
  done

  rm -f "${config_file}" "${models_file}"
  REMOTE_CONFIG_FILE=""
  REMOTE_MODELS_FILE=""
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
  local account="$1"
  cat > "${HELPER_PATH}" <<EOF
#!/usr/bin/env bash
set -euo pipefail
/usr/bin/security find-generic-password -a "${account}" -s "${KEYCHAIN_SERVICE}" -w
EOF
  chmod 700 "${HELPER_PATH}"
}

write_linux_helper() {
  local account="$1"
  if command -v secret-tool >/dev/null 2>&1 && secret-tool lookup service ltn-codex account "${account}" >/dev/null 2>&1; then
    cat > "${HELPER_PATH}" <<EOF
#!/usr/bin/env bash
set -euo pipefail
secret-tool lookup service ltn-codex account "${account}"
EOF
  else
    cat > "${HELPER_PATH}" <<EOF
#!/usr/bin/env bash
set -euo pipefail
cat "${LINUX_KEY_PATH}"
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
  local backup tmp escaped_base escaped_model escaped_helper
  escaped_base="$(escape_toml "${GATEWAY_BASE_URL%/}")"
  escaped_model="$(escape_toml "${DEFAULT_MODEL}")"
  escaped_helper="$(escape_toml "${HELPER_PATH}")"
  mkdir -p "${CODEX_HOME}"

  if [ -f "${CONFIG_PATH}" ]; then
    backup="${CONFIG_PATH}.backup-$(date +%Y%m%d-%H%M%S)"
    cp "${CONFIG_PATH}" "${backup}"
  fi

  tmp="${CONFIG_PATH}.$$.$(date +%s).tmp"
  {
    cat <<EOF
# BEGIN LTN CODEX MANAGED
# Managed by LTN Codex installer.
model = "${escaped_model}"
model_provider = "ltn_gateway"

[model_providers.ltn_gateway]
name = "LTN Gateway"
base_url = "${escaped_base}"
wire_api = "responses"
http_headers = { "X-LTN-Client-ID" = "${client_id}" }

[model_providers.ltn_gateway.auth]
command = "${escaped_helper}"
args = []
timeout_ms = 5000
refresh_interval_ms = 300000
# END LTN CODEX MANAGED
EOF
    if [ -f "${CONFIG_PATH}" ]; then
      awk '
        BEGIN { inside=0; seen_table=0 }
        /^# BEGIN LTN CODEX MANAGED$/ { inside=1; next }
        /^# END LTN CODEX MANAGED$/ { inside=0; next }
        inside { next }
        /^\[/ { seen_table=1 }
        !seen_table && /^[[:space:]]*model[[:space:]]*=/ { next }
        !seen_table && /^[[:space:]]*model_provider[[:space:]]*=/ { next }
        { print }
      ' "${CONFIG_PATH}"
    fi
  } > "${tmp}"
  chmod 600 "${tmp}"
  mv "${tmp}" "${CONFIG_PATH}"
  chmod 600 "${CONFIG_PATH}"
}

remove_managed_config() {
  local tmp
  [ -f "${CONFIG_PATH}" ] || return
  tmp="${CONFIG_PATH}.$$.$(date +%s).tmp"
  awk '
    BEGIN { inside=0 }
    /^# BEGIN LTN CODEX MANAGED$/ { inside=1; next }
    /^# END LTN CODEX MANAGED$/ { inside=0; next }
    inside { next }
    { print }
  ' "${CONFIG_PATH}" > "${tmp}"
  chmod 600 "${tmp}"
  mv "${tmp}" "${CONFIG_PATH}"
}

install_or_repair() {
  local client_id
  ensure_dirs
  detect_arch
  require_basic_dependencies
  ensure_codex_cli_healthy
  echo "[6/6] Cau hinh LTN Gateway..."
  read_team_key
  fetch_and_validate_gateway
  client_id="$(get_or_create_client_id)"
  store_credential
  merge_config "${client_id}"
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
      echo "  4. Nếu dùng Codex Desktop: đóng hoàn toàn ứng dụng, mở lại, rồi tạo New chat."
      ;;
    linux)
      echo "  4. Nếu lệnh codex chưa được nhận diện, đăng xuất rồi đăng nhập lại."
      ;;
  esac
}

status() {
  local client_id redacted
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
  gateway_health_status
}

uninstall_ltn() {
  local account
  account="$(id -un)"
  remove_managed_config
  rm -f "${HELPER_PATH}" "${CLIENT_ID_PATH}" "${LINUX_KEY_PATH}"
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
