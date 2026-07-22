#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f ".env" ]]; then
  echo "Thiếu .env. Chạy ./scripts/bootstrap.sh trước."
  exit 1
fi

if [[ ! -f "config/teams.json" ]]; then
  echo "Thiếu config/teams.json."
  exit 1
fi

set -a
source .env
set +a

exec node src/server.mjs
