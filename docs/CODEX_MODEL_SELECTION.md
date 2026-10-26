# Chọn model theo Combo được cấp cho API key

Tính năng này dùng Combo của 9Router làm nhóm quyền. User chọn ID model thành
viên trên Codex; Gateway xác minh ID đó và chuyển nguyên model sang 9Router.
Không gọi tên Combo trong request nên không chạy fallback của Combo.

## Gán nhóm cho tài khoản

Để tự áp dụng cho mọi tài khoản, đặt
`CODEX_MODEL_SELECTION=combo_members` trong `.env` server rồi restart Gateway.
Gateway sử dụng Combo đã gán cho user/bộ phận hoặc Combo mặc định; không cần sửa
từng tài khoản hay nạp lại key. Máy user chạy Update để nhận catalog và mở lại
Codex. Chế độ server này ưu tiên hơn `modelSelection` riêng của user/bộ phận,
kể cả giá trị `combo` đã lưu trước đây. Combo đã gán và chính sách quota vẫn
giữ nguyên. Mặc định khi chưa đặt biến vẫn là `combo`, cho phép lựa chọn riêng.

Trong Admin Console → chỉnh sửa nhân viên hoặc bộ phận:

1. Chọn **Quyền chọn model → User chọn model trong Combo**.
2. Chọn chính sách **Luôn Premium**, nhập Combo Premium tương ứng chức vụ
   (ví dụ `SIMI-GPT`, `SIMI-CLAUDE`, `SIMI-GEMINI`). Hoặc chọn **Chỉ Free**
   và nhập `SIMI-FREE` vào Combo Free.
3. Lưu. Nhân viên để **Kế thừa** sẽ dùng cấu hình bộ phận. Có thể gán Combo
   khác trực tiếp cho nhân viên mà vẫn giữ bộ nhớ của bộ phận.

Tên vai trò là thông tin hồ sơ; nó không tự động ánh xạ sang Combo. Admin gán
Combo vào policy của user/key hoặc bộ phận.

Ví dụ phần `aiPolicy` của user trong `config/users.json` (không thay keyHash):

```json
{
  "mode": "premium_always",
  "modelSelection": "combo_members",
  "premiumCombo": "SIMI-GPT"
}
```

Không có `modelSelection` sẽ kế thừa mặc định server. Đặt `combo` sẽ giữ hành vi routing cũ.

## Nguồn danh sách và quyền

Gateway đọc combo trên mỗi lần lấy danh sách và mỗi request inference, không
cache quyền. Admin vẫn chỉnh thành viên trên 9Router. Ưu tiên endpoint nội bộ
`NINEROUTER_COMBO_API_URL` với `NINEROUTER_COMBO_API_TOKEN` riêng cho server;
xem [triển khai endpoint 9Router](NINEROUTER_INTERNAL_COMBOS.md).
Đường mới cần build image 9Router có extension, chỉ pull Gateway không đủ.
Nếu không cấu hình URL nội bộ, dùng `GET /api/combos` từ `UPSTREAM_BASE_URL` như cũ.

Nếu management API local của 9Router yêu cầu đăng nhập dashboard, admin đặt
`NINEROUTER_DASHBOARD_COOKIE` trong `.env` server bằng session cookie hợp lệ.
Cookie chỉ gửi đến `/api/combos`, không trả cho user, không dùng user API key
để truy cập dashboard. Cookie hết hạn: Gateway trả 503 và admin cần cập nhật.
Không mở public management API hoặc bỏ bảo vệ dashboard để khắc phục lỗi này.

Combo phải chứa các ID model trực tiếp dạng string. Combo lồng nhau, Combo
trống, dữ liệu sai hoặc không đọc được dashboard đều trả lỗi; không mở toàn bộ
model khi gặp lỗi. Model không xuất hiện trong `/v1/models` của 9Router không
được đưa vào menu. Admin kiểm tra model/provider hỗ trợ Responses và tool calls
cho Codex trước khi cấp.

`GET /v1/models` trả cả `data` theo định dạng OpenAI và `models` theo catalog
Codex, chỉ chứa model thuộc nhóm của key. `GET /v1/codex/model-catalog` trả
catalog thuần `{ "models": [...] }`; tất cả endpoint này yêu cầu API key.
Catalog không tự suy đoán context window hoặc mức reasoning mà upstream chưa
cung cấp. Mức reasoning user yêu cầu vẫn được chuyển tiếp nguyên vẹn; hiệu lực
thực tế phụ thuộc provider và model.

Gateway kiểm tra model ở `/v1/responses`, `/v1/chat/completions`, `/v1/messages`.
Chỉ các API hội thoại này bị giới hạn theo thành viên Combo. Capability API
(ảnh, video, giọng nói, chép lời, embedding, tìm kiếm web, đọc trang web và các
danh sách model tương ứng như `/v1/models/image`) mở cho mọi tài khoản, kể cả
tài khoản bật `combo_members`: Gateway chuyển thẳng sang 9Router như chế độ
`combo`, không kiểm tra Combo và không parse body multipart/binary.

Với `limited_daily`, danh sách bao gồm cả nhóm Premium và Free, nhưng request
chỉ chấp nhận model thuộc tier hiện tại. Khi hết quota Premium, model Premium
trả 403; user cần chọn model Free. Request bị từ chối không tiêu hao quota.
Các tài khoản này chỉ được inference qua `/v1/responses` để tránh vượt quota
bằng Chat Completions hoặc Messages. Muốn user luôn chọn model trong một nhóm
chức vụ, dùng `premium_always`, `free_only` hoặc `test_only` thay vì limited daily.

## Cấu hình máy user

Chạy lại lệnh cài public và chọn **5. Update** để dùng key đã lưu (hoặc Repair).
Installer Windows,
macOS/Linux sẽ lấy catalog của key, ghi `.codex/ltn-model-catalog.json` và thêm
`model_catalog_json` trong `config.toml`; model mặc định là thành viên đầu tiên
khả dụng. Installer sao lưu config trước khi chỉnh sửa.

Đóng và mở lại Codex desktop, tạo chat mới, kiểm tra menu model. Có thể kiểm
tra CLI bằng `/model` hoặc `codex --model "ID_MODEL"`. Hiển thị menu desktop
phụ thuộc phiên bản Codex; test mock không xác nhận giao diện desktop thực tế.

Sau khi admin thêm model hoặc đổi nhóm, chạy Repair lại để cập nhật catalog
cục bộ. Sau khi thu hồi model, Gateway chặn ngay request mới, kể cả catalog
trên máy user vẫn còn entry cũ. Muốn quay về Combo tự routing, đổi quyền chọn
model về **Combo tự chọn model**, chạy Repair lại và khởi động lại Codex.

Log `codex_route_selected` ghi `selectedCombo` (nhóm quyền) và `selectedModel`
(model user chọn). Response có header `X-LTN-Selected-Model`; model thực tế và
reasoning upstream vẫn kiểm tra trong log 9Router.

## Triển khai

Đây là thay đổi source local, chưa tác động production. Sau khi review/test,
admin triển khai theo `docs/PROJECT_CONTEXT.md`, build Admin UI nếu sử dụng,
gán policy cho một key pilot rồi Repair trên máy pilot. Xác minh:

- Key pilot chỉ lấy được thành viên Combo được cấp.
- Model đã chọn đến 9Router nguyên ID và dùng được tool calls.
- ID model ngoài nhóm trả 403, dashboard không đọc được trả 503.
- Menu desktop và mức reasoning trên phiên bản Codex của user.
