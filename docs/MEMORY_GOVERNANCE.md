# Knowledge Memory governance

Tài liệu này mô tả pipeline Knowledge Memory cho pilot LTN Gateway. Không có public admin endpoint; mọi thao tác quản trị chạy bằng CLI trên máy production.

## Pipeline

```text
User request
→ Gateway xác thực principal
→ Nạp COMPANY.md → TEAM.md → USER.md
→ Gửi upstream
→ Trả response chính
→ Chạy extractor fail-open
→ Redact + validate JSON candidate
→ Xử lý theo scope
```

Extractor lỗi, timeout hoặc SharePoint sync lỗi không được làm hỏng request chính.

## Scope

- `NONE`: chào hỏi, cảm ơn, task ngắn hạn, dữ liệu nhạy cảm, thông tin chưa chắc chắn.
- `USER`: vai trò, phạm vi phụ trách, workflow cá nhân, phong cách output, prompt mẫu riêng.
- `TEAM`: quy trình/phê duyệt/chính sách/mẫu nội dung dùng chung trong một phòng ban.
- `COMPANY`: chính sách, thương hiệu, sản phẩm, bảo hành hoặc quyết định áp dụng toàn công ty.

TEAM và COMPANY luôn qua review queue trong pilot. Không bật auto-write cho hai scope này.

## USER auto-update

USER chỉ tự ghi khi đủ điều kiện:

- user principal hợp lệ;
- `scope=USER`;
- `confidence >= USER_MEMORY_AUTO_UPDATE_MIN_CONFIDENCE`;
- `durability=long_term`;
- `sensitivity=none`;
- `sourceType=explicit_user_statement`;
- `targetUserId` khớp user hiện tại;
- không xung đột normalizedKey với TEAM/COMPANY.

Nếu không đủ điều kiện, candidate không auto-write; TEAM/COMPANY vào queue, USER có thể bị queue để admin xem.

## Review queue

File queue:

```text
data/memory-review-queue.jsonl
```

Lệnh:

```bash
node scripts/review-memory.mjs list
node scripts/review-memory.mjs list --scope TEAM
node scripts/review-memory.mjs list --team SALES
node scripts/review-memory.mjs show CANDIDATE_ID
node scripts/review-memory.mjs approve CANDIDATE_ID --note "Đã xác nhận"
node scripts/review-memory.mjs reject CANDIDATE_ID --note "Chưa chính xác"
```

Approve sẽ backup, upsert theo `normalizedKey`, ghi audit và sync SharePoint. Reject không sửa memory.

## Backup, audit, rollback

- Audit: `data/memory-audit.jsonl`
- Backup: `data/memory-backups/<encoded-safe-file>/<version>.md`
- Outbox sync: `data/memory-sync-outbox.jsonl`

Rollback:

```bash
node scripts/memory-rollback.mjs --file memory/users/SALES/sales-ngoc.md --list
node scripts/memory-rollback.mjs --file memory/users/SALES/sales-ngoc.md --version VERSION_ID
```

Rollback chỉ cho phép file nằm trong `MEMORY_DIR`, backup trạng thái hiện tại trước khi restore, ghi audit và sync SharePoint fail-open.

## SharePoint mapping

```text
memory/COMPANY.md                  → Simi-AI-Memory/COMPANY.md
memory/SALES.md                    → Simi-AI-Memory/teams/SALES.md
memory/IT.md                       → Simi-AI-Memory/teams/IT.md
memory/users/SALES/sales-ngoc.md   → Simi-AI-Memory/users/SALES/sales-ngoc.md
```

Không dùng displayName làm filename. Unknown path và path traversal bị từ chối.

## Sync retry và status

```bash
node scripts/retry-memory-sync.mjs --status
node scripts/retry-memory-sync.mjs --max 20
node scripts/memory-status.mjs
```

Outbox không lưu nội dung file, chỉ lưu path, hash, attempts và lỗi đã redact.

## Migration an toàn

```bash
node scripts/migrate-memory-format.mjs --dry-run
node scripts/migrate-memory-format.mjs --apply
```

Migration không tự rewrite toàn bộ Markdown cũ; nội dung cũ được giữ, metadata mới xuất hiện dần khi upsert.

## Dữ liệu không được lưu

Không lưu raw prompt/response, API key, bearer token, password, OTP, private key, cookie, connection string, email/số điện thoại/CCCD/tài khoản ngân hàng nếu không cần, dữ liệu sức khỏe, HR, lương, kỷ luật hoặc dữ liệu cá nhân khách hàng.

## Pilot config khuyến nghị

```env
MEMORY_EXTRACTION_ENABLED=true
USER_MEMORY_ENABLED=true
USER_MEMORY_AUTO_UPDATE=true
USER_MEMORY_AUTO_UPDATE_MIN_CONFIDENCE=0.95
TEAM_MEMORY_ENABLED=true
TEAM_MEMORY_AUTO_UPDATE=false
COMPANY_MEMORY_ENABLED=true
COMPANY_MEMORY_AUTO_UPDATE=false
MEMORY_REVIEW_QUEUE_ENABLED=true
```

Chỉ bật cho 3-5 user pilot, kiểm tra queue/status hằng ngày. Không bật `TEAM_MEMORY_AUTO_UPDATE=true` hoặc `COMPANY_MEMORY_AUTO_UPDATE=true` trong pilot.
