# LTN Gateway

Gateway OpenAI-compatible đặt trước 9Router, có bộ nhớ Markdown theo team và
đồng bộ SharePoint/OneDrive qua Microsoft Graph hoặc thư mục sync local.

Đọc [bối cảnh dự án và môi trường production](docs/PROJECT_CONTEXT.md) trước
khi sửa code hoặc chuẩn bị triển khai.

## Chức năng

- Nhận diện team bằng SHA-256 của API key.
- Tên key trong 9Router nên đặt `TEAM-{CODE}` để quản lý.
- Đọc `COMPANY.md` và file Markdown của team trước mỗi request.
- Proxy `/v1/models` và `/v1/chat/completions` sang 9Router.
- Proxy `/v1/responses` cho Codex CLI với cùng pipeline COMPANY/TEAM memory.
- Hỗ trợ `stream: true` và `stream: false`.
- Sau mỗi câu trả lời, dùng model để rút ra kiến thức bền vững.
- Chỉ cập nhật một file Markdown gọn cho mỗi team.
- Loại bỏ mẫu secret phổ biến trước khi ghi.
- Ghi file atomic và giữ một file `.bak` local.
- Đồng bộ OneDrive bằng thư mục sync local hoặc Microsoft Graph.
- Chạy nền bằng macOS LaunchAgent và tự khởi động lại.

## Các file memory có sẵn

- `COMPANY.md`
- `WARRANTY.md`
- `INVENTORY.md`
- `MOBILE.md`
- `WEB.md`
- `MARKETING.md`
- `CSKH.md`
- `SALES.md`
- `IT.md`
- `MANAGEMENT.md`

Chỉ team đã đăng ký key mới sử dụng được.

## Cài nhanh trên Mac mini

```bash
cd ~/ltn-gateway
./scripts/bootstrap.sh
```

Đăng ký key của team:

```bash
node scripts/register-team.mjs WARRANTY "Warranty"
node scripts/register-team.mjs INVENTORY "Inventory"
node scripts/register-team.mjs IT "IT"
```

Mỗi lệnh sẽ yêu cầu dán API key trong chế độ ẩn. Gateway chỉ ghi SHA-256 vào `config/teams.json`.

Chạy foreground để test:

```bash
./start.sh
```

Terminal khác:

```bash
curl -sS http://127.0.0.1:20129/health
./test-local.sh
```

## Chạy tự động 24/7

```bash
./scripts/install-service.sh
```

Kiểm tra:

```bash
curl -sS http://127.0.0.1:20129/health
tail -f logs/gateway.log
```

Gỡ service:

```bash
./scripts/uninstall-service.sh
```

## SharePoint / OneDrive

### Cách 1: thư mục OneDrive trên Mac

Cài OneDrive và đăng nhập tài khoản công ty. Trong `.env`:

```env
ONEDRIVE_MODE=local
ONEDRIVE_LOCAL_DIR=/Users/TEN_USER/Library/CloudStorage/OneDrive-TEN_CONG_TY/LTN-AI-Memory
```

### Cách 2: Microsoft Graph

Trong `.env`:

```env
ONEDRIVE_MODE=graph
MS_TENANT_ID=...
MS_CLIENT_ID=...
MS_CLIENT_SECRET=...
ONEDRIVE_DRIVE_ID=...
ONEDRIVE_FOLDER=LTN-AI-Memory
```

Folder `LTN-AI-Memory` phải tồn tại trước. App Registration cần Application permission phù hợp và admin consent.

Đồng bộ toàn bộ file thủ công:

```bash
set -a; source .env; set +a
node scripts/sync-all.mjs
```

## Base URL cho ứng dụng chat

Local:

```text
http://127.0.0.1:20129/v1
```

Sau khi cấu hình Cloudflare Tunnel:

```text
https://ai.simi.vn/v1
```

API key là key riêng của team đã đăng ký trong Gateway và đang hoạt động trong 9Router.

## Cài Codex CLI trên Windows

9Router là nơi duy nhất quản lý model con và fallback thông qua **Combos**.
Gateway chọn Combo Premium/Free theo policy của team, rồi chuyển nguyên Combo ID
sang 9Router.

Policy mặc định toàn hệ thống được cấu hình bằng biến môi trường:

```env
CODEX_COMBO_PREMIUM=
CODEX_COMBO_FREE=
CODEX_DEFAULT_POLICY=limited_daily
CODEX_DEFAULT_PREMIUM_LIMIT=3
CODEX_USAGE_TIMEZONE=Asia/Ho_Chi_Minh
```

Mỗi team có thể override trong `config/teams.json` bằng `aiPolicy`:

```json
{
  "aiPolicy": {
    "mode": "premium_always|limited_daily|free_only|inherit",
    "premiumLimit": 3,
    "usageScope": "client|team",
    "premiumCombo": "SIMI-GPT",
    "freeCombo": "SIMI-FREE"
  }
}
```

Gateway vẫn khởi động nếu các biến Combo chưa có; khi route Codex cần dùng mà
thiếu cấu hình, Gateway trả lỗi rõ ràng.

Chạy installer local:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-codex-windows.ps1
```

Máy nhân viên cài bằng URL public cố định của Gateway:

| Hệ điều hành | Lệnh cài |
| --- | --- |
| Windows | `irm https://ai.simi.vn/install/codex.ps1 \| iex` |
| macOS | `curl -fsSL https://ai.simi.vn/install/codex.sh \| bash` |
| Ubuntu/Linux | `curl -fsSL https://ai.simi.vn/install/codex.sh \| bash` |

URL Windows `/install/codex.ps1` trả một bootstrap nhỏ. Bootstrap tải full installer từ route cố định
`https://ai.simi.vn/install/codex-full.ps1`, chạy bằng call operator và luôn
xóa file tạm sau khi hoàn tất hoặc gặp lỗi.

Installer chỉ hỏi API key team. Installer tạo `LTN_CLIENT_ID` một lần, giữ lại
khi repair, và ghi `env_http_headers` để Codex gửi `X-LTN-Client-ID` cho Gateway.

Trước khi ghi cấu hình, installer gọi `GET /v1/models` bằng API key team và
dừng với lỗi rõ ràng nếu thiếu Combo. Installer không tải hoặc cho nhân viên
chọn danh sách model con.

Installer lấy policy và Combo ID Premium/Free từ endpoint xác thực
`GET /v1/codex/config`. Endpoint này không trả secret, key hash hoặc danh sách
model con.

Sau khi cài, admin chỉ thay đổi thành phần hoặc thứ tự fallback tại
**9Router Dashboard → Combos**. Máy nhân viên luôn giữ nguyên Combo ID.

Repair hoặc rotate API key: chạy lại installer; block cấu hình được cập nhật
thay vì tạo trùng. Gỡ cấu hình LTN (không gỡ Codex CLI):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-codex-windows.ps1 -Uninstall
```

## Bảo mật

Không commit:

- `.env`
- `config/teams.json`
- API key
- Microsoft client secret
- Token
- Log chứa dữ liệu nhạy cảm

`config/teams.json` chỉ chứa hash của key, không chứa key nguyên bản.
