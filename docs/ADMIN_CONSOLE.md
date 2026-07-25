# LTN Admin Console

LTN Admin Console là lớp quản trị riêng cho SIMI AI tại `https://admin-ai.simi.vn`.

9Router vẫn chỉ phụ trách provider, model, Combo và usage upstream. Admin Console phụ trách nhân viên, team, API key cá nhân, AI policy/quota, usage aggregate, Knowledge Memory, review TEAM/COMPANY, SharePoint sync, audit và health.

## Kiến trúc

```text
admin-ai.simi.vn
→ Cloudflare Access
→ LTN Gateway /admin và /admin/api/v1/*
→ admin services
→ config/users.json, config/teams.json, config/admins.json
→ data usage/analytics/audit
→ memory files/review queue/sync outbox
→ SharePoint
```

Public AI API vẫn tách riêng:

- `/health`
- `/v1/models`
- `/v1/codex/config`
- `/v1/responses`

Admin API nằm ở `/admin/api/v1/*`, không nằm dưới `/v1`.

## Admin config

Production dùng `config/admins.json`, không commit file này.

Mẫu:

```bash
cp config/admins.example.json config/admins.json
chmod 600 config/admins.json
```

Roles:

- `SUPER_ADMIN`: toàn quyền.
- `IT_ADMIN`: quản lý user/key/system/sync/rollback, không mặc định duyệt COMPANY.
- `TEAM_MANAGER`: chỉ xem team được cấp và duyệt TEAM memory đúng team.
- `MANAGEMENT`: xem aggregate toàn công ty và duyệt COMPANY.
- `AUDITOR`: chỉ đọc audit/usage/history.

## API chính

- `GET /admin/api/v1/me`
- `GET /admin/api/v1/csrf`
- `GET /admin/api/v1/dashboard`
- `GET/POST /admin/api/v1/users`
- `PATCH /admin/api/v1/users/:userId`
- `POST /admin/api/v1/users/:userId/enable`
- `POST /admin/api/v1/users/:userId/disable`
- `POST /admin/api/v1/users/:userId/rotate-key`
- `POST /admin/api/v1/users/import/validate`
- `POST /admin/api/v1/users/import/commit`
- `GET/PATCH /admin/api/v1/teams/:teamId`
- `GET /admin/api/v1/usage/summary`
- `GET /admin/api/v1/usage/timeseries`
- `GET /admin/api/v1/usage/users`
- `GET /admin/api/v1/usage/users/:userId`
- `GET /admin/api/v1/usage/teams`
- `GET /admin/api/v1/usage/teams/:teamId`
- `GET /admin/api/v1/usage/devices`
- `GET /admin/api/v1/usage/export`
- `GET /admin/api/v1/memory/review`
- `POST /admin/api/v1/memory/review/:id/approve`
- `POST /admin/api/v1/memory/review/:id/reject`
- `GET /admin/api/v1/memory/files`
- `GET /admin/api/v1/memory/files/:fileId`
- `GET /admin/api/v1/memory/files/:fileId/versions`
- `GET /admin/api/v1/memory/files/:fileId/versions/:versionId`
- `POST /admin/api/v1/memory/files/:fileId/rollback`
- `GET /admin/api/v1/sync`
- `POST /admin/api/v1/sync/:id/retry`
- `POST /admin/api/v1/sync/retry-all`
- `GET /admin/api/v1/audit`
- `GET /admin/api/v1/audit/:id`
- `GET /admin/api/v1/system/health`
- `GET /admin/api/v1/system/config-summary`

## Phase 2 pilot capabilities

- Dashboard dùng dữ liệu thật từ Admin API, không dùng mock trong production build.
- User management có list/filter, create, enable/disable, rotate key và one-time key modal.
- Bulk import CSV có validate riêng, commit all-or-nothing ở service và trả key CSV một lần với `no-store`.
- Usage có aggregate theo user, team, device hash prefix và CSV export không chứa raw prompt/key.
- Memory review có approve/reject, kiểm tra sensitivity lại khi admin sửa summary.
- Memory explorer dùng `fileId` opaque, không nhận raw path từ browser.
- Rollback tạo backup hiện tại, restore atomic, audit và sync/outbox.
- Audit explorer đọc `data/admin-audit.jsonl` đã redact, có filter/phân trang.
- Sync management cho retry one/retry-all, không cho sửa remote path.

## One-time API key

Khi tạo hoặc rotate user, plaintext API key chỉ xuất hiện trong response hiện tại. Server chỉ lưu SHA-256 hash, audit không lưu key, response `Cache-Control: no-store`.

UI phải hiển thị cảnh báo:

> API key chỉ hiển thị một lần. Hãy gửi riêng cho đúng nhân viên.

## Bulk import 50 user

CSV:

```csv
userId,displayName,teamId,role,policyMode,premiumLimit
sales-ngoc,Ngọc,SALES,Tư vấn Shopee,limited_daily,5
```

Luồng:

1. `POST /admin/api/v1/users/import/validate`
2. Hiển thị preview/lỗi theo dòng.
3. `POST /admin/api/v1/users/import/commit`
4. Server tạo user all-or-nothing và trả CSV chứa key một lần.

CSV output chống formula injection cho cell bắt đầu bằng `=`, `+`, `-`, `@`.

## CLI fallback

Các CLI vẫn hoạt động và dùng chung service với Admin API:

```bash
node scripts/manage-users.mjs list
node scripts/review-memory.mjs list
node scripts/retry-memory-sync.mjs --status
node scripts/memory-status.mjs
```
