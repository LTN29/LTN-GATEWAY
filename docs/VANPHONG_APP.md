# Phát hành app Văn Phòng AI qua Gateway

Gateway vừa là nơi tải app lần đầu, vừa là kênh tự cập nhật cho máy nhân viên.

| Đường dẫn | Dùng cho |
|---|---|
| `GET /install/vanphong` | Trang tải cho máy mới (Windows / Mac / Ubuntu) |
| `GET /install/vanphong/latest.json` | App kiểm tra bản mới (4 giờ/lần và khi bấm **Kiểm tra bản mới**) |
| `GET /install/vanphong/<file>` | Tải file build, hỗ trợ tải tiếp (`Range`) |

Các route này công khai giống `/install/codex.ps1` (file build không chứa key hay secret).
Gateway chỉ phục vụ file có tên trong `latest.json`.

## Đăng bản mới

Server Gateway production là máy **Windows** (`D:\LTN-GATEWAY`, chạy dưới dạng dịch vụ Windows `LTNGateway`).
Server chỉ cần **file build** của app, không cần mã nguồn.

1. Có file build trên server, một trong hai cách:
   - **Build ngay trên server** (cần Node.js 20+): giải nén mã nguồn app (ví dụ `D:\VanPhongAI-src`) rồi
     `npm ci` và `npm run dist` → thư mục `dist` có `VanPhongAI-x.y.z-Setup.exe` và `VanPhongAI-x.y.z-portable.exe`.
     Build trên Windows chỉ ra bản Windows.
   - **Chép file build sẵn** từ máy dev vào một thư mục trên server, ví dụ `D:\vanphong-0.9.7`
     (để chung hoặc trong các thư mục con `windows\`, `mac\`, `linux\` đều được).
2. Chỉ đăng bản cho loại máy nhân viên đang dùng; mỗi thư mục chỉ chứa file của **1 phiên bản**:
   - `VanPhongAI-0.9.7-Setup.exe` (Windows, bản cài – tự cập nhật êm nhất)
   - `VanPhongAI-0.9.7-portable.exe` (Windows, bản chạy ngay)
   - `VanPhongAI-0.9.7-mac-arm64.zip` (máy Mac của nhân viên)
   - `VanPhongAI-0.9.7-linux-amd64.deb`, `VanPhongAI-0.9.7-linux-x86_64.AppImage` (máy Ubuntu của nhân viên)
3. Chạy trong PowerShell trên server:

```powershell
cd D:\LTN-GATEWAY
node --env-file=.env scripts/publish-vanphong.mjs D:\VanPhongAI-src\dist --notes "- Có gì mới ..."
Invoke-RestMethod http://127.0.0.1:20129/install/vanphong/latest.json | Select-Object version
```

`--env-file=.env` để script ghi đúng `VANPHONG_RELEASE_DIR` mà Gateway đang dùng. Script chép file vào
`VANPHONG_RELEASE_DIR` (mặc định `./data/releases/vanphong`), tính SHA-256 và ghi `latest.json` sau cùng.
**Không cần khởi động lại Gateway.** Script giữ file của 2 bản gần nhất (`--keep N` để đổi) và từ chối đăng
bản cũ hơn bản đang có (`--force` để quay về bản cũ).

Cập nhật code Gateway (khi có thay đổi trong repo) – PowerShell **Run as Administrator**:

```powershell
cd D:\LTN-GATEWAY
git pull --ff-only
Restart-Service LTNGateway
Invoke-RestMethod http://127.0.0.1:20129/health
```

Server chạy macOS/Linux thì dùng lệnh tương ứng (`~/vanphong-0.9.7`, khởi động lại bằng `launchctl`/systemd).

## Trên máy nhân viên

- App **tự tải sẵn** bản mới ở chế độ nền (kiểm tra SHA-256), rồi báo **"Văn Phòng AI x.y.z đã sẵn sàng"** bằng thẻ trong app, nút **⬆️ Cập nhật x.y.z** trên thanh trên cùng và thông báo của hệ điều hành. Người dùng bấm **Cập nhật ngay** là xong:
  - Windows bản cài: chạy bộ cài im lặng, cài đè, tự mở lại.
  - Windows bản portable: thay file `.exe` đang dùng rồi mở lại.
  - macOS: thay `VanPhongAI.app`, gỡ cờ cách ly, ký ad-hoc, mở lại.
  - Ubuntu `.deb`: hỏi mật khẩu máy (pkexec) rồi `apt-get install`, mở lại. AppImage: thay file.
- **Báo ngay qua Sảnh**: Gateway đọc lại `latest.json` mỗi 30 giây (đổi bằng `LOBBY_RELEASE_CHECK_MS`). Thấy phiên bản đổi thì gửi sự kiện `app-release` tới mọi app đang mở Sảnh, các app đó tải sẵn ngay (vài giây). Lời chào của Sảnh (`hello`) cũng kèm `app.version`.
- Máy không mở Sảnh vẫn tự kiểm tra lúc mở app, mỗi giờ, khi quay lại app sau 20 phút và khi máy ngủ dậy.
- App chỉ báo khi `version` trên Gateway **lớn hơn** bản đang chạy: mỗi lần đổi giao diện / tính năng nhớ tăng `version` trong `package.json` của app trước khi build.
- Tắt tự kiểm tra và tải sẵn: **Cài đặt → Cập nhật**.
