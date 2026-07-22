# IT TEAM CONTEXT

Cập nhật gần nhất: 2026-07-23

## Ngữ cảnh và kiến thức

- Mac mini được dùng làm server nội bộ và AI gateway.
- 9Router chạy local tại 127.0.0.1:20128; LTN Gateway dùng cổng 20129.
- Cloudflare Tunnel và Access được dùng để đưa dịch vụ ra ngoài an toàn.
- Mac mini không được sleep khi làm server; có thể khóa màn hình và tắt màn hình.

## Quyết định và quy trình

- Mỗi team dùng API key riêng; Gateway nhận diện team bằng SHA-256 của giá trị key.
- Tên key trong 9Router dùng để quản lý nhưng không tự xuất hiện trong HTTP request.
- Không mở port trực tiếp nếu đã dùng Cloudflare Tunnel.
- Secret chỉ lưu local/server và không commit Git.

## Việc đang làm

- Hoàn thiện Gateway, memory theo team, OneDrive sync và cấu hình ứng dụng chat.
