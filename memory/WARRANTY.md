# WARRANTY TEAM CONTEXT

Cập nhật gần nhất: 2026-07-23

## Ngữ cảnh và kiến thức

- Inventory là nguồn dữ liệu chuẩn của hệ thống bảo hành.
- Motor máy hút bụi bảo hành 24 tháng; sản phẩm điện tử khác 12 tháng; pin và phụ kiện tháo rời bán riêng 6 tháng.
- Chỉ sản phẩm chính đủ điều kiện bảo hành; phụ kiện thông thường và sản phẩm không điện không đủ điều kiện.
- Không giới hạn kích hoạt trong 15 ngày; hệ thống kiểm tra theo ngày mua và chặn khi đã hết hạn.
- Không fallback theo tên sản phẩm nếu đã có productId hoặc SKU.

## Quyết định và quy trình

- Public Lookup tách thành tra cứu hạn bảo hành và theo dõi phiếu gửi bảo hành.
- Bundle phải được Inventory resolve; UNRESOLVED tách biệt với NOT_ELIGIBLE.
- Yêu cầu đổi bảo hành chỉ tạo nội bộ, Inventory xác nhận hoặc từ chối trước khi trừ kho.
- Linh kiện inbound từ Warranty sang Inventory phải idempotent.

## Việc đang làm

- Tiếp tục rà soát bundle Q5, M6, A7, A9 và E7.
