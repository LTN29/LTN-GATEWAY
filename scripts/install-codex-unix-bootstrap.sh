#!/usr/bin/env bash
set -euo pipefail

INSTALLER_URL="https://ai.simi.vn/install/codex-full.sh"
INSTALLER_HOST="ai.simi.vn"
TEMP_INSTALLER=""

cleanup() {
  if [ -n "${TEMP_INSTALLER}" ] && [ -f "${TEMP_INSTALLER}" ]; then
    rm -f "${TEMP_INSTALLER}"
  fi
}
trap cleanup EXIT HUP INT TERM

case "${INSTALLER_URL}" in
  https://${INSTALLER_HOST}/install/codex-full.sh) ;;
  *) echo "Codex installer chỉ được tải từ https://${INSTALLER_HOST}." >&2; exit 1 ;;
esac

if ! command -v curl >/dev/null 2>&1; then
  echo "Thiếu curl để tải Codex installer." >&2
  exit 1
fi

TEMP_INSTALLER="$(mktemp "${TMPDIR:-/tmp}/ltn-codex-installer.XXXXXX")"
chmod 700 "${TEMP_INSTALLER}"

METADATA="$(curl --fail --silent --show-error --location \
  --proto '=https' \
  --proto-redir '=https' \
  --write-out '%{http_code} %{url_effective}' \
  --output "${TEMP_INSTALLER}" \
  "${INSTALLER_URL}")"
HTTP_CODE="${METADATA%% *}"
EFFECTIVE_URL="${METADATA#* }"

if [ "${HTTP_CODE}" != "200" ]; then
  echo "Không tải được Codex installer: HTTP ${HTTP_CODE}." >&2
  exit 1
fi

if [ "${EFFECTIVE_URL}" != "${INSTALLER_URL}" ]; then
  echo "Codex installer bị redirect sang URL không được phép." >&2
  exit 1
fi

bash "${TEMP_INSTALLER}" "$@"
