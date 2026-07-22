#!/bin/zsh
set -euo pipefail

LABEL="vn.simi.ltn-gateway"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
rm -f "$PLIST"

echo "Đã gỡ service $LABEL"
