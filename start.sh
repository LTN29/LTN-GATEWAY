#!/bin/zsh
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -f "./config/teams.json" ]]; then
  echo "Thiếu config/teams.json"
  echo "Hãy copy config/teams.example.json thành config/teams.json và điền keyHash."
  exit 1
fi
set -a
if [[ -f ".env" ]]; then
  source ".env"
fi
set +a
exec node src/server.mjs
