# SALES TEAM CONTEXT

Cập nhật gần nhất: 2026-07-23

## Ngữ cảnh và kiến thức

- Sales Analytics phục vụ doanh thu, đơn hàng, lợi nhuận SKU, quảng cáo, voucher, hoàn trả và shop health.
- Hệ thống phải hỗ trợ nhiều shop và có ALL_SHOPS.
- Dashboard ưu tiên đọc từ read model hoặc aggregate DB thay vì phụ thuộc live API.

## Quyết định và quy trình

- KPI tổng hợp phải dùng weighted aggregate, không lấy trung bình đơn giản giữa các shop.
- Sales Analytics là lớp read-only riêng, không gộp vào Mirror Stock.
- Cần hiển thị freshness và xử lý partial failure.

## Việc đang làm

- Hoàn thiện read models, đối soát Shopee API và kiến trúc mở rộng TikTok.
