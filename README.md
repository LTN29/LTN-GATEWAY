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

## Cài Codex CLI cho nhân viên

9Router là nơi duy nhất quản lý model con và fallback thông qua **Combos**.
Gateway chọn Combo Premium/Free theo policy của team, rồi chuyển nguyên Combo ID
sang 9Router.

Policy mặc định toàn hệ thống được cấu hình bằng biến môi trường:

```env
CODEX_COMBO_PREMIUM=
CODEX_COMBO_FREE=
CODEX_COMBO_TEST=SIMI-GEMINI
CODEX_DEFAULT_POLICY=limited_daily
CODEX_DEFAULT_PREMIUM_LIMIT=3
CODEX_USAGE_TIMEZONE=Asia/Ho_Chi_Minh
```

Mỗi team có thể override trong `config/teams.json` bằng `aiPolicy`:

```json
{
  "aiPolicy": {
    "mode": "premium_always|limited_daily|free_only|test_only|inherit",
    "premiumLimit": 3,
    "usageScope": "client|team",
    "premiumCombo": "SIMI-GPT",
    "freeCombo": "SIMI-FREE",
    "testCombo": "SIMI-GEMINI"
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

URL macOS/Linux `/install/codex.sh` cũng trả một bootstrap nhỏ. Bootstrap tải full installer
từ route cố định `https://ai.simi.vn/install/codex-full.sh`, chỉ chấp nhận HTTPS,
không đi theo redirect sang domain khác, chạy bằng `bash` từ file tạm và luôn xóa file tạm.

Trên macOS/Linux, installer tự kiểm tra Codex CLI trước khi hỏi API key. Nếu phát hiện
`codex` bị hỏng do bản npm cũ, symlink gãy, vendor binary mất, `ENOENT` hoặc `Killed: 9`,
installer sẽ gỡ đúng package npm `@openai/codex` khi xác định được nguồn, rồi cài lại
bằng standalone installer chính thức từ `https://chatgpt.com/codex/install.sh`.
Installer chỉ cấu hình LTN Gateway sau khi `codex --version` chạy thành công.
Phần cài Codex/Gateway vẫn tự đọc JSON và xác minh Combo; installer cũng kiểm tra/cài
Node.js 20+ và Python 3 để bật Browser Bridge, lệnh mạng 9Router và PDF runtime.

Trên Windows, installer cài Codex CLI standalone bằng installer chính thức
`https://chatgpt.com/codex/install.ps1`; Codex standalone được cài riêng với runtime
Node.js/Python mà LTN dùng cho mạng, browser và PDF.
Installer chỉ tiếp tục cấu hình LTN Gateway sau khi `codex --version` chạy thành công.

Installer không tắt bảo vệ macOS, không chạy `xattr` để bỏ quarantine, không tắt
Gatekeeper và không hướng dẫn bỏ qua cảnh báo malware. Nếu bản Codex chính thức vẫn bị
macOS chặn, installer dừng và yêu cầu liên hệ IT.

Trên macOS/Linux, installer chỉ hỏi API key team sau khi Codex CLI khỏe. Trên Windows,
installer hỏi key trong chế độ `Install/Update` hoặc `Repair` và lưu vào biến môi trường
User `LTN_TEAM_API_KEY`.
Trên macOS, key được lưu trong Keychain và Codex đọc qua helper
`~/.codex/bin/ltn-codex-token`. Trên Ubuntu/Linux, installer ưu tiên Secret Service
qua `secret-tool`; nếu máy không có Secret Service khả dụng thì lưu key vào
`~/.codex/credentials/ltn-team-key` với quyền `600`.

Installer tạo client ID một lần tại `~/.codex/ltn-client-id`, giữ lại khi repair, xóa khi
uninstall, và ghi `http_headers` để Codex gửi `X-LTN-Client-ID` cho Gateway.

Mỗi lần `Install/Update` hoặc `Repair`, installer cũng tự cài/cập nhật bộ 9Router
skills vào `~/.codex/skills/`: Entry, Chat, Image, Video, TTS, STT, Embeddings,
Web Search, Web Fetch, Browser và PDF. Skill được tải từ chính `ai.simi.vn`, được kiểm tra tên
trước khi thay atomically và không yêu cầu nhân viên tải trực tiếp từ GitHub.
`Status` hiển thị số lượng `9Router skills: 11/11`; `Uninstall` chỉ xóa các file
skill do installer quản lý.

Installer tạo thêm ba lệnh trong `~/.codex/bin` (Windows có đuôi `.cmd`):

```text
ltn-9router GET /models/web
ltn-9router POST /search {"model":"search-combo","query":"...","max_results":5}
ltn-pdf --json --max-chars 200000 /path/to/file.pdf
```

`ltn-9router` dùng mạng qua Gateway và tự lấy API key/client ID; `ltn-pdf` dùng
venv Python riêng với `pypdf`, `pdfplumber` và `pymupdf`. PDF scan không có lớp text
sẽ được báo rõ là cần OCR, không trả kết quả giả.

Để Codex đọc trang đang mở bằng tài khoản Chrome đã đăng nhập, installer cũng cài
local Browser Bridge và bộ Chrome Extension. Chạy `ltn-browser-bridge`, sau đó mở
`chrome://extensions`, bật Developer mode và chọn Load unpacked tới thư mục
`~/.codex/browser-extension` (Windows dùng `%USERPROFILE%\\.codex\\browser-extension`).
Giữ tab cần đọc ở trạng thái đang mở; skill `9router-browser` sẽ lấy phần text đang
hiển thị và gửi qua Gateway. Mật khẩu, cookie và token phiên không bị đọc.

Bridge local cần Node.js 20+ trên máy nhân viên. Nếu lệnh `node` không có trong PATH,
có thể đặt `LTN_BROWSER_NODE_PATH` trỏ tới `node` rồi chạy lại wrapper bridge.

Các capability đi qua Gateway bằng cùng API key cá nhân/team:

```text
Codex skill → https://ai.simi.vn/v1/{capability}
            → LTN Gateway
            → 9Router 127.0.0.1:20128
```

Gateway chỉ whitelist các route cần thiết: model discovery, image/video,
TTS/STT, embeddings, web search/fetch và chat. `router.simi.vn` vẫn là Dashboard
admin được Cloudflare Access bảo vệ.

Trước khi ghi cấu hình, installer gọi `GET /v1/models` bằng API key team và
dừng với lỗi rõ ràng nếu thiếu Combo. Installer không tải hoặc cho nhân viên
chọn danh sách model con.

Installer lấy policy và Combo ID Premium/Free từ endpoint xác thực
`GET /v1/codex/config`. Endpoint này không trả secret, key hash hoặc danh sách
model con.

Sau khi cài, admin chỉ thay đổi thành phần hoặc thứ tự fallback tại
**9Router Dashboard → Combos**. Máy nhân viên luôn giữ nguyên Combo ID.

Repair hoặc rotate API key: chạy lại installer; block cấu hình được cập nhật
thay vì tạo trùng. Khi chọn `Repair`, installer tự dùng key đã lưu trên máy
(Windows User Environment, macOS Keychain hoặc Linux Secret Service/file), nên
không cần nhập lại key. Chỉ khi key chưa từng được lưu hoặc đã bị xóa thì
installer mới yêu cầu nhập lại. Gỡ cấu hình LTN (không gỡ Codex CLI):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-codex-windows.ps1 -Uninstall
```

Lệnh public trên Windows/macOS/Ubuntu/Linux đều hiện menu thao tác chuyên nghiệp:

```text
Chọn chế độ:
  1. Install/Update
  2. Repair
  3. Status
  4. Uninstall
Nhập 1-4:
```

`CODEX_COMBO_TEST` đăng ký tier Test độc lập trong Admin Console. Team chỉ chuyển
sang Combo này sau khi admin chọn policy `Test`; biến này không thay đổi hai tier
Premium/Free hoặc policy mặc định.

`Install/Update` hỏi API key team khi cần; `Repair` ưu tiên key đã lưu và chỉ hỏi
khi không tìm thấy key. `Status` chỉ kiểm tra trạng thái.
`Uninstall` xóa block LTN trong `~/.codex/config.toml`, helper token và client ID; không gỡ Codex CLI.

Nếu muốn gọi trực tiếp không qua menu trên macOS/Ubuntu/Linux, dùng flag qua `bash -s --`:

```bash
curl -fsSL https://ai.simi.vn/install/codex.sh | bash -s -- --status
curl -fsSL https://ai.simi.vn/install/codex.sh | bash -s -- --repair
curl -fsSL https://ai.simi.vn/install/codex.sh | bash -s -- --uninstall
```

Trên Windows, lệnh public khuyến nghị vẫn là:

```powershell
irm https://ai.simi.vn/install/codex.ps1 | iex
```

File cấu hình Codex nằm ở `~/.codex/config.toml`. Installer chỉ thay block giữa:

```toml
# BEGIN LTN CODEX MANAGED
# END LTN CODEX MANAGED
```

Nếu dùng Codex Desktop trên macOS, sau khi cài hoặc repair hãy đóng hẳn app,
mở lại, rồi tạo New chat để app đọc lại cấu hình mới.

## Bảo mật

Không commit:

- `.env`
- `config/teams.json`
- API key
- Microsoft client secret
- Token
- Log chứa dữ liệu nhạy cảm

`config/teams.json` chỉ chứa hash của key, không chứa key nguyên bản.

## User-key pilot

Gateway hỗ trợ migration từ team key sang API key riêng cho từng nhân viên:

```text
API key cá nhân → userId → teamId → aiPolicy → usage theo user → COMPANY.md + TEAM.md + USER.md
```

`LTN_CLIENT_ID` chỉ là device ID. Một user dùng nhiều máy vẫn dùng chung quota Premium theo `userId`; client ID chỉ được hash để phân tích thiết bị.

Config user production nằm ở `config/users.json` qua biến:

```bash
LTN_USERS_CONFIG_FILE=./config/users.json
LTN_LEGACY_TEAM_KEYS_ENABLED=true
```

Không commit `config/users.json` production. Dùng `config/users.example.json` làm mẫu.

Tạo user pilot:

```bash
node scripts/manage-users.mjs create \
  --user-id sales-ngoc \
  --display-name "Ngọc" \
  --team SALES \
  --role "Tư vấn Shopee"
```

CLI chỉ in API key plaintext đúng một lần và chỉ lưu SHA-256 hash. Rotate/disable:

```bash
node scripts/manage-users.mjs rotate-key --user-id sales-ngoc
node scripts/manage-users.mjs disable --user-id sales-ngoc
```

Nhân viên không cần cài lại Codex; chạy installer, chọn `Repair`. Key cá nhân chỉ
cần nhập ở lần cài đầu tiên, các lần Repair sau sẽ dùng key đã lưu.

Report/coaching nội bộ, không có public admin endpoint mặc định:

```bash
node scripts/report-user-usage.mjs --user sales-ngoc --days 7
node scripts/report-user-usage.mjs --team SALES --days 7 --csv ./reports/sales.csv
node scripts/generate-user-coaching.mjs --user sales-ngoc --days 7
```

Memory user được nạp theo thứ tự `COMPANY.md → TEAM.md → USER.md`. Nếu USER.md chưa tồn tại, Gateway tạo template an toàn trong `memory/users/<TEAM>/<userId>.md`.

Tài khoản thuộc bộ phận `IT` (hoặc user có `role` là `IT`/`IT_ADMIN`) được đánh dấu
**Ngoài vòng kiểm soát**: vẫn xác thực và định tuyến theo Combo/Policy đã chọn, nhưng
không nạp memory, không tạo/cập nhật USER.md, không chạy memory extraction và không
ghi user analytics. Log vận hành tối thiểu không chứa nội dung tin nhắn vẫn được giữ.

TEAM/COMPANY memory candidate nên đi qua review queue trong pilot:

```bash
node scripts/review-memory.mjs list
node scripts/review-memory.mjs show CANDIDATE_ID
node scripts/review-memory.mjs approve CANDIDATE_ID
node scripts/review-memory.mjs reject CANDIDATE_ID
```

Knowledge Memory hiện dùng extractor JSON có validate, redaction, dedup theo `normalizedKey`,
USER auto-update an toàn, còn TEAM/COMPANY bắt buộc qua review queue. Xem đầy đủ tại
`docs/MEMORY_GOVERNANCE.md`.

Lệnh vận hành memory:

```bash
node scripts/memory-status.mjs
node scripts/review-memory.mjs list --scope TEAM
node scripts/retry-memory-sync.mjs --status
node scripts/retry-memory-sync.mjs --max 20
node scripts/migrate-memory-format.mjs --dry-run
```

Rollback memory chỉ trong thư mục `memory/`:

```bash
node scripts/memory-rollback.mjs --file memory/users/SALES/sales-ngoc.md --list
node scripts/memory-rollback.mjs --file memory/users/SALES/sales-ngoc.md --version VERSION_ID
```

Xem checklist pilot đầy đủ tại `docs/USER_PILOT_GUIDE.md`.

## LTN Admin Console

Admin Console là lớp quản trị riêng dự kiến chạy tại `https://admin-simi.simi.vn`, tách khỏi 9Router Dashboard.

9Router tiếp tục quản lý provider/model/Combo/fallback. LTN Admin Console quản lý:

- nhân viên, team, API key cá nhân;
- AI policy/quota và usage aggregate;
- Knowledge Memory, review TEAM/COMPANY;
- SharePoint sync/outbox;
- audit và health Gateway/9Router.

Admin API nằm dưới `/admin/api/v1/*`, không dùng employee API key và không đặt dưới `/v1`.
Backend xác thực bằng Cloudflare Access JWT `Cf-Access-Jwt-Assertion`, enforce RBAC, CSRF cho write request,
host/origin allowlist và audit bắt buộc cho thao tác ghi.

Cloudflare Tunnel production nên route chung về LTN Gateway port `20129`:

```text
ai.simi.vn           -> http://localhost:20129
admin-simi.simi.vn   -> http://localhost:20129
router.simi.vn       -> http://localhost:20128
```

Admin Console vẫn tách bằng hostname/path và Cloudflare Access, không cần service riêng port `20130`.

Tài liệu:

- `docs/ADMIN_CONSOLE.md`
- `docs/ADMIN_SECURITY.md`
- `docs/ADMIN_DEPLOYMENT.md`
- `docs/ADMIN_PILOT_CHECKLIST.md`

Phase 2 bổ sung các màn hình pilot thực tế cho user lifecycle, bulk import, usage theo user/team/device,
memory review, memory explorer/version/rollback, SharePoint sync, system health và audit explorer.
Admin UI vẫn mặc định tắt bằng `ADMIN_UI_ENABLED=false`; chỉ bật sau khi Cloudflare Access và
`config/admins.json` đã sẵn sàng.

Lưu ý vận hành: CSRF token và Admin API rate-limit hiện là in-memory, phù hợp mô hình một process trên
Mac mini. Nếu mở rộng multi-process/container scale-out, cần chuyển các state này sang store dùng chung.

Build/test local:

```bash
npm run admin:typecheck
npm run admin:test
npm run admin:build
```
