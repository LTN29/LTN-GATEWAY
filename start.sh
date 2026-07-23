#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f ".env" ]]; then
  echo "Thiếu .env"
  exit 1
fi

if [[ ! -f "config/teams.json" ]]; then
  echo "Thiếu config/teams.json"
  exit 1
fi

set -a
source .env
set +a

exec "/opt/homebrew/bin/node" src/server.mjs
