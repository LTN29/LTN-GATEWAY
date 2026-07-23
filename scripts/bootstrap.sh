#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== LTN Gateway Bootstrap =="

if ! command -v node >/dev/null 2>&1; then
  echo "Chưa có Node.js. Cài bằng: brew install node"
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( NODE_MAJOR < 20 )); then
  echo "Cần Node.js 20 trở lên. Hiện tại: $(node -v)"
  exit 1
fi

[[ -f .env ]] || cp .env.example .env
[[ -f config/teams.json ]] || cp config/teams.example.json config/teams.json

mkdir -p logs runtime memory
chmod +x start.sh test-local.sh scripts/*.sh

node --check src/server.mjs
npm test

echo
echo "Bootstrap hoàn tất."
echo "Tiếp theo đăng ký team:"
echo "  node scripts/register-team.mjs WARRANTY 'Warranty'"
echo
echo "Sau đó chạy:"
echo "  ./start.sh"
