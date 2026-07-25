# User-key pilot cho LTN Gateway

Mục tiêu pilot: chuyển dần từ API key dùng chung theo team sang API key riêng cho từng nhân viên, nhưng vẫn giữ legacy team key để rollback.

## Nguyên tắc

- Mỗi nhân viên có một API key riêng, không chia sẻ key.
- `LTN_CLIENT_ID` chỉ là device ID để phân tích thiết bị, không phải danh tính người dùng.
- Gateway xác định `userId` từ API key đã hash, không nhận `X-LTN-User-ID` từ client.
- `USER.md` là hồ sơ công việc, không phải hồ sơ cá nhân.
- Không nhập password, OTP, API key, token, thông tin ngân hàng hoặc dữ liệu nhạy cảm vào chat.
- TEAM/COMPANY knowledge phải qua review queue trong giai đoạn pilot.

## Tạo user pilot

```bash
node scripts/manage-users.mjs create \
  --user-id sales-ngoc \
  --display-name "Ngọc" \
  --team SALES \
  --role "Tư vấn Shopee"
```

CLI chỉ in API key plaintext đúng một lần. `config/users.json` chỉ lưu SHA-256 hash.

## Nhân viên đổi sang key cá nhân

Không cần cài lại Codex nếu đã có. Chỉ chạy Repair:

Windows:

```powershell
irm https://ai.simi.vn/install/codex.ps1 | iex
```

macOS/Linux:

```bash
curl -fsSL https://ai.simi.vn/install/codex.sh | bash
```

Chọn `Repair`, nhập API key cá nhân.

## Theo dõi

```bash
node scripts/report-user-usage.mjs --user sales-ngoc --days 7
node scripts/generate-user-coaching.mjs --user sales-ngoc --days 7
node scripts/review-memory.mjs list
node scripts/memory-status.mjs
node scripts/retry-memory-sync.mjs --status
```

Coaching chỉ phân tích cách dùng hệ thống và cấu trúc yêu cầu công việc; không dùng để đánh giá năng lực, tính cách, sức khỏe hoặc thông tin nhạy cảm.

## Migration đề xuất

1. Giữ `config/teams.json`.
2. Thêm `config/users.json`.
3. Đặt `LTN_LEGACY_TEAM_KEYS_ENABLED=true`.
4. Tạo 3-5 user pilot.
5. Nhân viên chạy Repair và nhập key cá nhân.
6. Theo dõi usage/USER.md/review queue 3-5 ngày.
7. Chỉ sau khi ổn định mới cân nhắc `LTN_LEGACY_TEAM_KEYS_ENABLED=false`.

## Rollback

- Bật lại `LTN_LEGACY_TEAM_KEYS_ENABLED=true`.
- Nhân viên chạy Repair và nhập lại team key cũ nếu cần.
- Rollback memory trong phạm vi `memory/`:

```bash
node scripts/memory-rollback.mjs --file memory/users/SALES/sales-ngoc.md --list
node scripts/memory-rollback.mjs --file memory/users/SALES/sales-ngoc.md --version VERSION_ID
```

## Knowledge Memory governance

- USER knowledge có thể auto-update khi confidence cao, long-term, explicit và không nhạy cảm.
- TEAM/COMPANY knowledge luôn vào review queue trong pilot.
- Queue không lưu raw prompt/response.
- SharePoint mapping mới:
  - `memory/COMPANY.md` → `COMPANY.md`
  - `memory/SALES.md` → `teams/SALES.md`
  - `memory/users/SALES/sales-ngoc.md` → `users/SALES/sales-ngoc.md`
- Xem chi tiết tại `docs/MEMORY_GOVERNANCE.md`.
