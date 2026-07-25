# Admin Console security

## Cloudflare Access

Backend không tin `Cf-Access-Authenticated-User-Email` làm nguồn duy nhất. Admin API yêu cầu `Cf-Access-Jwt-Assertion` và verify:

- chữ ký bằng JWKS Cloudflare Access;
- issuer;
- audience;
- expiration;
- email claim sau khi JWT hợp lệ.

Admin không có trong `config/admins.json` trả 403. Admin disabled trả 403.

## Host và Origin

Admin routes chỉ hoạt động trên hostname trong `ADMIN_ALLOWED_HOSTS`. Production nên đặt:

```env
ADMIN_ALLOWED_HOSTS=admin-ai.simi.vn
ADMIN_ALLOWED_ORIGIN=https://admin-ai.simi.vn
```

Write request kiểm tra Origin và CSRF.

## CSRF

Browser admin dùng Cloudflare Access session, nên write request cần:

```http
X-LTN-CSRF-Token: ...
```

Token lấy từ:

```http
GET /admin/api/v1/csrf
```

Token nằm trong memory frontend, không lưu `localStorage`/`sessionStorage`.

## Audit

Write action ghi `data/admin-audit.jsonl` với lock + atomic append. Audit không ghi:

- raw API key;
- full keyHash;
- raw Client ID;
- raw prompt/response;
- Cloudflare JWT;
- Authorization header.

Nếu audit bắt buộc lỗi, write action không được báo thành công.

## Security headers

Admin API trả:

- `Cache-Control: no-store`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`
- `Content-Security-Policy`

Không dùng wildcard CORS cho Admin API.

## Rate limit

Admin API có rate limit riêng theo admin identity:

- read/minute;
- write/minute;
- key action/hour.

Không dùng quota AI của nhân viên cho Admin API.

Rate limit và CSRF token hiện lưu in-memory, phù hợp một Gateway process. Nếu scale multi-process/container, cần chuyển sang shared store để tránh lệch quota/rate-limit giữa process.

## Phase 2 hardening

- TEAM_MANAGER bị scope theo `teamIds` ở backend, không chỉ ẩn menu frontend.
- USER memory không được trả qua file detail/version/rollback cho TEAM_MANAGER hoặc MANAGEMENT mặc định.
- Memory rollback dùng `fileId` opaque, validate version, backup file hiện tại, restore atomic, ghi audit và sync/outbox.
- Bulk import rollback `users.json` và xóa USER.md vừa tạo nếu có lỗi giữa chừng.
- Usage devices chỉ trả hash prefix, không trả raw `LTN_CLIENT_ID`.
- Audit explorer trả `ipHashPrefix`, không trả full IP hash hoặc metadata chứa secret.

## Không làm

- Không tạo form login riêng trong Gateway.
- Không cho employee API key vào Admin API.
- Không cho frontend chọn Combo/model con.
- Không expose `.env`, connection string, Microsoft secret, Cloudflare token.
- Không tạo web terminal hoặc arbitrary command endpoint.
