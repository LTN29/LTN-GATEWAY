---
name: simi-cai-dat
description: Cài phần mềm, thư viện và dependency trên Windows, macOS hoặc Linux; ưu tiên file người dùng đã tải, cache offline và package manager, đồng thời dùng Simi để tìm tài liệu hoặc nguồn chính thức khi mạng trực tiếp bị chặn. Dùng khi user yêu cầu cài, setup, bổ sung dependency, sửa lỗi thiếu command/module/runtime, hoặc đã tải file .exe, .msi, .msix, .zip, .whl, .tar.gz, .deb, .rpm nhưng chưa cài được.
---

# Simi - Cài đặt phần mềm và dependency

Thực hiện trọn quy trình khi user ra lệnh cài đặt. Không dừng ở việc đưa hướng dẫn nếu có thể tự kiểm tra và cài trong phạm vi được cấp quyền.

## Quy trình

1. Xác định hệ điều hành, kiến trúc, shell, project và dependency đang thiếu từ lỗi thực tế.
2. Kiểm tra xem command/package đã tồn tại chưa; tránh cài trùng.
3. Tìm artifact user đã tải trong thư mục project và thư mục Downloads. Chỉ tìm theo tên hoặc đuôi liên quan, không quét hay đọc file cá nhân không cần thiết.
4. Ưu tiên cài offline từ artifact hoặc cache đã có.
5. Nếu chưa có, dùng package manager phù hợp: `winget`, `choco`, `scoop`, `npm`, `pnpm`, `pip`, `pipx`, `uv`, `cargo`, `go`, `brew`, `apt`, `dnf`, `yum`, `pacman` hoặc `zypper`.
6. Nếu mạng package manager bị chặn, dùng `simi-tim-kiem-web` để xác định tài liệu và URL chính thức; dùng `simi-doc-trang-web` chỉ cho nội dung văn bản. Không coi `/web/fetch` là proxy an toàn cho file nhị phân.
7. Nếu không thể tải artifact nhị phân qua mạng hiện có, nói rõ URL, tên file và checksum cần thiết; tiếp tục ngay khi user đặt file vào máy.
8. Sau khi cài, chạy kiểm tra phiên bản và lệnh/test ban đầu đã thất bại.

## Cài từ file có sẵn

- Windows: nhận diện `.msi`, `.msix`, `.appx`, `.exe`, `.zip`, `.nupkg` và wheel Python. Xem chữ ký số bằng `Get-AuthenticodeSignature` khi có thể. Với installer im lặng, chỉ dùng switch được tài liệu chính thức xác nhận.
- Python: ưu tiên virtual environment của project. Cài wheel/offline bằng `python -m pip install --no-index --find-links <thu-muc> <goi>`; không tự ý cài global.
- Node.js: ưu tiên lockfile và cache; dùng chế độ offline tương ứng nếu package manager hỗ trợ. Không xóa lockfile để né lỗi.
- Linux: kiểm tra package metadata trước khi dùng `dpkg`, `rpm` hoặc package manager. Không tự bỏ qua kiểm tra chữ ký.
- Archive: giải nén vào thư mục tạm hoặc thư mục tool có phạm vi rõ ràng; xác định executable và cách thêm PATH trước khi thay đổi môi trường user.

## An toàn và quyền

- Chỉ cài khi user yêu cầu rõ ràng. Phân tích/diagnose không đồng nghĩa với cho phép cài.
- Đọc lệnh cài đặt hoặc script tải về trước khi chạy. Không dùng kiểu tải trực tiếp rồi pipe vào shell nếu chưa kiểm tra nội dung và nguồn.
- Ưu tiên nguồn chính thức, HTTPS, chữ ký số và checksum công bố. Không tắt antivirus, Gatekeeper, signature enforcement hay TLS verification.
- Với quyền admin, thay đổi PATH toàn máy, service, driver, kernel module hoặc package global, dùng cơ chế xin quyền của Codex và nêu đúng hành động cần cấp quyền.
- Không in API key Simi và không ghi key vào script, log hoặc artifact.

## Kết quả cần báo

Nêu package/phần mềm và phiên bản đã cài, nguồn hoặc file đã dùng, phạm vi cài (project/user/system), lệnh xác minh, và phần còn bị chặn nếu có.
