# INVENTORY TEAM CONTEXT

Cập nhật gần nhất: 2026-07-23

## Ngữ cảnh và kiến thức

- Inventory là source of truth cho sản phẩm, kho, đơn hàng, SKU, bundle và tồn kho.
- Mã kho chính gồm SG WARRANTY, HN WARRANTY, SG KOC, HN KOC, SG LEVANTHO và HN NAMTRUNGYEN.
- Không resolve sản phẩm bằng fallback tên mơ hồ khi có ID hoặc SKU chuẩn.

## Quyết định và quy trình

- Chuyển kho bảo hành chỉ cho phép KOC sang WARRANTY cùng vùng và kho đích phải xác nhận.
- Destination warehouse code phải chuẩn hóa whitespace và encode URL đúng.
- Mirror stock bỏ qua giao dịch WARRANTY.
- Yêu cầu đổi bảo hành có lịch sử audit và không tự động trừ kho.

## Việc đang làm

- Hoàn thiện mapping combo và độ chính xác của bundle resolution.
