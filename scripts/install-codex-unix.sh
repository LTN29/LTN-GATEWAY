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

detect_os() {
  case "$(uname -s)" in
    Darwin) OS_NAME="macos" ;;
    Linux) OS_NAME="linux" ;;
    *) die "Installer chỉ hỗ trợ macOS hoặc Linux." ;;
  esac
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
    IFS= read -r -s -p 'API key cua team: ' TEAM_API_KEY
    printf '\n'
  fi
  [ -n "${TEAM_API_KEY}" ] || die "API key cua team khong duoc de trong."
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

fetch_and_validate_gateway() {
  local config_file models_file routing_mode premium_combo free_combo result
  config_file="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-config.XXXXXX")"
  models_file="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-models.XXXXXX")"
  REMOTE_CONFIG_FILE="${config_file}"
  REMOTE_MODELS_FILE="${models_file}"
  curl_with_auth "${GATEWAY_BASE_URL%/}/codex/config" "${config_file}"
  curl_with_auth "${GATEWAY_BASE_URL%/}/models" "${models_file}"

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

install_codex_if_missing() {
  if command -v codex >/dev/null 2>&1; then
    codex --version >/dev/null 2>&1 || true
    return
  fi
  if ! command -v curl >/dev/null 2>&1; then
    die "Thiếu curl để cài Codex CLI."
  fi
  curl -fsSL https://chatgpt.com/codex/install.sh | sh
  export PATH="${HOME}/.codex/bin:${HOME}/.local/bin:/usr/local/bin:/opt/homebrew/bin:${PATH}"
  command -v codex >/dev/null 2>&1 || die "Không tìm thấy codex sau khi cài. Hãy mở terminal mới hoặc thêm ~/.codex/bin vào PATH."
  codex --version >/dev/null
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
  read_team_key
  fetch_and_validate_gateway
  install_codex_if_missing
  client_id="$(get_or_create_client_id)"
  store_credential
  merge_config "${client_id}"
  echo ""
  echo "Cài đặt LTN Codex hoàn tất."
  echo "Gateway: ${GATEWAY_BASE_URL%/}"
  echo "Model mặc định: ${DEFAULT_MODEL}"
  echo "Sử dụng: codex"
  if [ "${OS_NAME}" = "macos" ]; then
    echo "Nếu dùng Codex Desktop: hãy đóng hoàn toàn app, mở lại, rồi tạo New chat."
  fi
}

status() {
  local client_id redacted
  ensure_dirs
  echo "OS: ${OS_NAME}"
  if command -v codex >/dev/null 2>&1; then
    echo "Codex: $(codex --version 2>/dev/null || echo installed)"
  else
    echo "Codex: chưa tìm thấy"
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

menu() {
  echo "Chọn chế độ:"
  echo "  1. Install/Update"
  echo "  2. Repair"
  echo "  3. Status"
  echo "  4. Uninstall"
  printf 'Nhập 1-4: '
  local choice
  IFS= read -r choice
  case "${choice}" in
    1) MODE="--install" ;;
    2) MODE="--repair" ;;
    3) MODE="--status" ;;
    4) MODE="--uninstall" ;;
    *) die "Lựa chọn không hợp lệ." ;;
  esac
}

main() {
  detect_os
  case "${MODE}" in
    "") menu ;;
    --install|--repair|--status|--uninstall) ;;
    *) die "Flag không hợp lệ. Dùng --install, --repair, --status hoặc --uninstall." ;;
  esac

  case "${MODE}" in
    --install|--repair) install_or_repair ;;
    --status) status ;;
    --uninstall) uninstall_ltn ;;
  esac
}

main
