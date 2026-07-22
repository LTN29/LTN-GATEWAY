#!/bin/zsh
set -euo pipefail
read -s "TEAM_KEY?Dán API key của team rồi nhấn Enter: "
echo
printf %s "$TEAM_KEY" | shasum -a 256 | awk '{print $1}'
unset TEAM_KEY
