#!/bin/zsh
set -euo pipefail

read -s "TEAM_KEY?Dán API key của team để test: "
echo

curl -sS http://127.0.0.1:20129/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEAM_KEY" \
  -d '{
    "model": "mmf/mimo-auto",
    "messages": [
      {
        "role": "user",
        "content": "Trả lời chính xác: LTN GATEWAY FULL OK"
      }
    ],
    "stream": false
  }'

echo
unset TEAM_KEY
