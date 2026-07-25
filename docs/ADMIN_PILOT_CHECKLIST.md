# LTN Admin Console - Pilot Checklist

Checklist này dùng cho pilot 5 người trước khi mở rộng lên khoảng 50 nhân viên.

## Trước khi bật

- Cloudflare Access đã bảo vệ `admin-ai.simi.vn`.
- Tunnel trỏ về `http://127.0.0.1:20129`.
- `ADMIN_UI_ENABLED=true` chỉ đặt trên Mac mini production khi đã sẵn sàng.
- `ADMIN_ALLOWED_HOSTS=admin-ai.simi.vn`.
- `ADMIN_ALLOWED_ORIGIN=https://admin-ai.simi.vn`.
- `CLOUDFLARE_ACCESS_TEAM_DOMAIN` và `CLOUDFLARE_ACCESS_AUD` đã đúng app Access.
- `config/admins.json` được tạo từ `config/admins.example.json`.
- `.env`, `config/users.json`, `config/teams.json`, `config/admins.json`, `data/*.jsonl` không nằm trong Git.

## RBAC pilot

- 1 `SUPER_ADMIN`.
- 1 `IT_ADMIN`.
- 1 `TEAM_MANAGER` cho `SALES`.
- 1 `AUDITOR` nếu cần xem audit read-only.
- TEAM_MANAGER không thấy dữ liệu team khác.
- TEAM_MANAGER không duyệt COMPANY.
- AUDITOR không thực hiện được write action.

## User lifecycle

- Tạo 5 user pilot.
- API key chỉ hiển thị một lần.
- Đóng modal thì key bị xóa khỏi state trình duyệt.
- Rotate key làm key cũ mất hiệu lực.
- Disable user chặn request mới.
- Bulk import test bằng CSV giả, không dùng key production thật.

## Usage và thiết bị

- Request của user xuất hiện trong dashboard.
- Usage theo user/team đúng scope.
- Device chỉ hiển thị hash prefix, không hiển thị raw `LTN_CLIENT_ID`.
- Export CSV không có API key, keyHash, raw prompt hoặc raw client ID.

## Knowledge Memory

- TEAM candidate xuất hiện trong Review.
- TEAM_MANAGER approve được TEAM candidate thuộc team mình.
- MANAGEMENT hoặc SUPER_ADMIN approve COMPANY.
- Candidate nhạy cảm không được approve trực tiếp.
- Memory file có version backup sau thay đổi.
- Rollback có confirmation và tạo backup mới.

## SharePoint sync

- Sync pending/failed hiển thị trong `/admin/sync`.
- Retry one item hoạt động.
- Retry all có audit.
- Không cho sửa remote path từ UI.
- Không gọi SharePoint production trong test tự động.

## Audit

- Create user, rotate, disable/enable, import, approve/reject memory, rollback, retry sync đều có audit.
- Audit không chứa API key plaintext, full keyHash, JWT, Authorization, raw prompt hoặc raw response.
- TEAM_MANAGER chỉ thấy audit thuộc scope phù hợp.

## Thiết bị kiểm thử

- Desktop Chrome/Safari.
- iPad ngang.
- Windows PowerShell installer vẫn không regression.
- macOS/Linux installer vẫn không regression.

## Rollback pilot

Nếu cần tắt Admin UI:

```bash
ADMIN_UI_ENABLED=false
# restart service/launchd
```

Nếu cần rollback code:

```bash
git log --oneline -5
git checkout <previous-good-commit>
npm ci
npm test
npm run check
npm run admin:build
# restart service/launchd
```

Không xóa `config/users.json`, `config/teams.json`, `config/admins.json`, `.env` hoặc thư mục `data/` khi rollback.
