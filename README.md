# LTN Gateway

Gateway OpenAI-compatible đặt trước 9Router, có bộ nhớ Markdown theo team và đồng bộ OneDrive.

## Chức năng

- Nhận diện team bằng SHA-256 của API key.
- Tên key trong 9Router nên đặt `TEAM-{CODE}` để quản lý.
- Đọc `COMPANY.md` và file Markdown của team trước mỗi request.
- Proxy `/v1/models` và `/v1/chat/completions` sang 9Router.
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

## OneDrive

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

## Bảo mật

Không commit:

- `.env`
- `config/teams.json`
- API key
- Microsoft client secret
- Token
- Log chứa dữ liệu nhạy cảm

`config/teams.json` chỉ chứa hash của key, không chứa key nguyên bản.
