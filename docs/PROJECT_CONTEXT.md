# Bối cảnh dự án LTN Gateway

> Đọc file này trước khi sửa code, viết test hoặc chuẩn bị hướng dẫn triển khai.

## 1. Vai trò của repository hiện tại

Repository trên máy đang chạy Codex là môi trường phát triển/bản sao source,
không phải production.

Được phép thực hiện tại đây:

- Đọc và sửa source code.
- Viết unit test, integration test bằng mock và static validation.
- Audit kiến trúc.
- Chuẩn bị migration và hướng dẫn triển khai tương thích ngược.

Không được suy luận trạng thái production từ `localhost` của máy hiện tại.
Không tự commit, push, SSH, deploy hoặc thay đổi hạ tầng production nếu chưa
được yêu cầu rõ ràng.

## 2. Mục đích của LTN Gateway

LTN Gateway là lớp AI Gateway trung tâm của SIMIGO:

1. Nhận request từ AI client trên máy nhân viên.
2. Xác thực API key riêng của team.
3. Nhận diện team bằng SHA-256 của API key trong `config/teams.json`.
4. Nạp `memory/COMPANY.md` và file Markdown của team.
5. Chèn memory phù hợp vào request.
6. Chuyển tiếp request sang 9Router.
7. Giữ nguyên model hoặc Combo ID do client gửi.
8. Trích xuất kiến thức bền vững sau hội thoại.
9. Ghi atomic vào file memory tương ứng và giữ backup.
10. Đồng bộ memory lên SharePoint bằng Microsoft Graph app-only.

Không tin `teamCode`, `memoryFile` hoặc tên team do client tự gửi. Team chỉ
được xác định từ API key đã xác thực.

## 3. Kiến trúc production

Production chạy trên Mac mini của công ty, repository tại:

```text
~/ltn-gateway
```

Luồng request:

```text
Máy nhân viên
  → https://ai.simi.vn/v1
  → Cloudflare Tunnel
  → LTN Gateway 127.0.0.1:20129
  → 9Router Docker 127.0.0.1:20128
  → model hoặc Combo do 9Router xử lý
```

Thông số:

- LTN Gateway: Node.js, port `20129`.
- Service manager: macOS launchd.
- Service label: `vn.simi.ltn-gateway`.
- 9Router: Docker trên cùng Mac mini, host port `127.0.0.1:20128`.
- Gateway upstream: `UPSTREAM_BASE_URL=http://127.0.0.1:20128`.

## 4. Domain và ranh giới truy cập

- `https://ai.simi.vn`: API dành cho nhân viên, trỏ đến LTN Gateway `20129`.
- `https://ai.simi.vn/v1`: Base URL dành cho AI client.
- `https://router.simi.vn`: Dashboard 9Router dành cho admin, trỏ đến `20128`
  và được bảo vệ bằng Cloudflare Access.

Nguyên tắc:

- Không trỏ `ai.simi.vn` trực tiếp vào 9Router port `20128`.
- Không bật luồng đăng nhập trình duyệt Cloudflare Access trên `ai.simi.vn`.
- Không bỏ bảo vệ admin khỏi `router.simi.vn`.
- Không thay đổi DNS, Tunnel hoặc Cloudflare route khi chưa được yêu cầu.

## 5. Team authentication và memory

Production có các team:

- `WARRANTY`
- `INVENTORY`
- `MOBILE`
- `WEB`
- `MARKETING`
- `CSKH`
- `SALES`
- `IT`
- `MANAGEMENT`

`config/teams.json` chỉ lưu SHA-256 của API key, không lưu key plaintext.

Memory gồm:

- Ngữ cảnh chung: `memory/COMPANY.md`.
- Ngữ cảnh riêng: một file Markdown tương ứng với từng team.

Thay đổi schema config phải tương thích với config cũ, có validation rõ ràng
và không làm production crash khi field mới chưa tồn tại.

## 6. SharePoint và Microsoft Graph

Production đồng bộ memory bằng Microsoft Graph app-only:

- Chế độ: `ONEDRIVE_MODE=graph`.
- SharePoint site: `Simi AI Memory`.
- Document Library: `Shared Documents / Tài liệu`.
- Folder: `Simi-AI-Memory`.
- Entra app: `LTN-Gateway-SharePoint`.
- Permission: `Sites.Selected`, chỉ có quyền write trên site được cấp riêng.

Tenant ID, client ID, client secret, drive ID và các credential Graph chỉ được
cấu hình trong `.env` production trên Mac mini. Không hardcode hoặc ghi chúng
ra log.

## 7. Model và 9Router Combo

9Router là nguồn quản lý duy nhất cho:

- Model và provider.
- Account và quota.
- Combo.
- Thành phần, thứ tự model và fallback trong Combo.

Gateway và installer chỉ dùng Combo ID đã được admin tạo. Gateway phải chuyển
nguyên vẹn `combo/...` sang 9Router:

- Không bung Combo.
- Không chọn model con.
- Không tự fallback.
- Không nhân bản logic routing của 9Router.

Máy nhân viên chỉ chạy Codex CLI và gọi `https://ai.simi.vn/v1`. Nhân viên cài
một lần; khi admin sửa thành phần hoặc thứ tự Combo trên 9Router, request tiếp
theo dùng cấu hình mới mà không cần cài lại máy nhân viên.

## 8. Quy trình phát triển và triển khai

Tại máy phát triển:

1. Sửa source.
2. Chạy test bằng mock/local test environment.
3. Báo cáo file đã sửa, test và phần chưa thể xác minh.
4. Chuẩn bị lệnh Git/deploy nhưng không tự chạy.

Admin chủ động đưa source lên Git và triển khai trên Mac mini:

```bash
cd ~/ltn-gateway
git status
git pull --ff-only origin main
npm ci
npm test
launchctl kickstart -k "gui/$(id -u)/vn.simi.ltn-gateway"
sleep 3
curl -sS http://127.0.0.1:20129/health | python3 -m json.tool
curl -sS https://ai.simi.vn/health | python3 -m json.tool
```

Chỉ restart sau khi test thành công. Không dùng `git reset --hard`,
`git clean -fd`, không xóa `.env` và không ghi đè `config/teams.json`.

Nếu cần biến môi trường mới:

- Chỉ cập nhật `.env.example` trong source.
- Không sửa `.env` production từ máy phát triển.
- Dùng default an toàn khi phù hợp.
- Báo rõ tên biến admin cần thêm, không kèm secret.

## 9. Secret không được commit

Không commit hoặc đưa vào tài liệu/log:

- `.env`.
- `config/teams.json` production.
- API key team hoặc key dạng `sk-...`.
- Microsoft tenant/client secret và Graph token.
- Cloudflare token.
- OneDrive/SharePoint credential.
- Setup token production.

## 10. Các thao tác production bị cấm mặc định

Không tự thực hiện từ máy phát triển:

- `launchctl` hoặc restart Docker production.
- Cài/chỉnh Cloudflare Tunnel, route hoặc DNS.
- Sửa Microsoft Entra app hoặc SharePoint permission.
- Ghi vào SharePoint production.
- Rotate secret.
- Gọi API bằng production team key.
- Sửa file production qua SSH.
- Commit, push hoặc deploy.

Kết quả test trên máy phát triển chỉ được báo là:

> Source code và test local đã hoàn tất.

Chỉ xác nhận production hoạt động sau khi admin deploy trên Mac mini và cả
health check local lẫn public đều đạt.
