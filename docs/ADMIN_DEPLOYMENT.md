# Admin Console deployment plan

Không tự deploy từ máy dev. Các bước dự kiến trên Mac mini production:

```bash
cd ~/ltn-memory-gateway/ltn-memory-gateway

# 1. Backup
cp config/users.json "config/users.json.backup-$(date -u +%Y%m%dT%H%M%SZ)"
cp config/teams.json "config/teams.json.backup-$(date -u +%Y%m%dT%H%M%SZ)"
[ -f config/admins.json ] && cp config/admins.json "config/admins.json.backup-$(date -u +%Y%m%dT%H%M%SZ)"

# 2. Pull code đã review
git pull origin main

# 3. Dependencies và build
npm ci
npm --prefix admin-ui install
npm run admin:build
npm test
npm run check
npm run admin:typecheck
npm run admin:test

# 4. Admin config
cp -n config/admins.example.json config/admins.json
chmod 600 config/admins.json
```

Pilot trước khi mở rộng:

```bash
# xem checklist chi tiết
sed -n '1,220p' docs/ADMIN_PILOT_CHECKLIST.md
```

Thêm env production, không commit:

```env
ADMIN_UI_ENABLED=true
ADMIN_UI_DIST_DIR=./admin-ui/dist
ADMIN_ALLOWED_HOSTS=admin-ai.simi.vn
ADMIN_ALLOWED_ORIGIN=https://admin-ai.simi.vn
ADMIN_CONFIG_FILE=./config/admins.json
ADMIN_AUDIT_FILE=./data/admin-audit.jsonl
CLOUDFLARE_ACCESS_TEAM_DOMAIN=<team>.cloudflareaccess.com
CLOUDFLARE_ACCESS_AUD=<Access app aud>
```

Restart service:

```bash
launchctl kickstart -k gui/$(id -u)/vn.simi.ltn-gateway
```

Health check:

```bash
curl -sS http://127.0.0.1:20129/health
curl -sS -H "Host: admin-ai.simi.vn" http://127.0.0.1:20129/admin/api/v1/system/health
```

Cloudflare dự kiến:

```text
admin-ai.simi.vn
→ Cloudflare Access policy
→ Cloudflare Tunnel
→ http://127.0.0.1:20129
```

Admin hostname phải được Cloudflare Access bảo vệ trước khi bật `ADMIN_UI_ENABLED=true` production.

Rollback:

```bash
git log --oneline -5
git revert <commit>
npm ci
npm run admin:build
npm test
npm run check
launchctl kickstart -k gui/$(id -u)/vn.simi.ltn-gateway
```

Nếu lỗi config:

```bash
cp config/admins.json.backup-YYYYMMDDTHHMMSSZ config/admins.json
chmod 600 config/admins.json
launchctl kickstart -k gui/$(id -u)/vn.simi.ltn-gateway
```
