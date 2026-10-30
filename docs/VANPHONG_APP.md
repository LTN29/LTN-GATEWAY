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

1. Build app trên máy dev (`npm run dist`, `npm run dist:mac`, `npm run dist:linux`).
2. Chép các file build cần phát hành vào một thư mục trên máy chạy Gateway, ví dụ `~/vanphong-0.9.0/` (để chung một chỗ hoặc trong các thư mục con `windows/`, `mac/`, `linux/` đều được):
   - `VanPhongAI-0.9.0-Setup.exe` (Windows, bản cài – tự cập nhật êm nhất)
   - `VanPhongAI-0.9.0-portable.exe` (Windows, bản chạy ngay)
   - `VanPhongAI-0.9.0-mac-arm64.zip`
   - `VanPhongAI-0.9.0-linux-amd64.deb`, `VanPhongAI-0.9.0-linux-x86_64.AppImage`
3. Chạy trong thư mục repo Gateway:

```bash
node scripts/publish-vanphong.mjs ~/vanphong-0.9.0 --notes "- Computer Use trong tab Chat
- Tự cập nhật 1 nút"
```

Script chép file vào `VANPHONG_RELEASE_DIR` (mặc định `./data/releases/vanphong`), tính SHA-256
và ghi `latest.json` sau cùng. Không cần khởi động lại Gateway. Script giữ file của 2 bản gần nhất
(`--keep N` để đổi) và từ chối đăng bản cũ hơn bản đang có (`--force` để quay về bản cũ).

## Trên máy nhân viên

- Thanh trên cùng hiện nút **⬆️ Bản mới x.y.z** → **Tải bản mới** → **Cài & mở lại app**.
- App tải đúng file cho máy mình, kiểm tra SHA-256 rồi mới cài:
  - Windows bản cài: chạy bộ cài im lặng, cài đè, tự mở lại.
  - Windows bản portable: thay file `.exe` đang dùng rồi mở lại.
  - macOS: thay `VanPhongAI.app`, gỡ cờ cách ly, ký ad-hoc, mở lại.
  - Ubuntu `.deb`: hỏi mật khẩu máy (pkexec) rồi `apt-get install`, mở lại. AppImage: thay file.
- Tắt tự kiểm tra: **Cài đặt → Cập nhật**.
