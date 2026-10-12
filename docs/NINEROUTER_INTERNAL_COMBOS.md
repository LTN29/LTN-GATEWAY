# API Combo nội bộ, không dùng cookie dashboard

## Thành phần

Gateway hỗ trợ `NINEROUTER_COMBO_API_URL` và `NINEROUTER_COMBO_API_TOKEN`.
Khi URL được cấu hình, chỉ sử dụng endpoint đó; không fallback sang cookie.
URL phải là HTTP loopback (`127.0.0.1`, `localhost` hoặc `[::1]`), đường dẫn
`/api/internal/ltn-combos`, không query, credentials hay redirect.
Khóa là 32–256 ký tự chữ/số/underscore/hyphen; khuyến nghị random 32 byte hex.

9Router stock v0.5.95 chưa có endpoint này. Các file trong
`integrations/9router/` bổ sung endpoint chỉ GET, trả `{combos:[{name,models}]}`
trực tiếp từ `getCombos()` hiện tại. Không cache quyền và không đọc DB credentials.
Dashboard vẫn giữ nguyên bảo vệ đăng nhập.

Endpoint kiểm tra khóa server và IP đã được `custom-server.js` đóng dấu bằng
`NINEROUTER_PEER_TOKEN`. Chạy bằng bare `next start` không có trusted-peer token
sẽ bị từ chối. Không tự đặt `NINEROUTER_PEER_TOKEN`; custom server tạo nó mỗi lần
khởi động. Không dựa vào header IP do client tự gửi.

## Chuẩn bị image 9Router trên server Windows

Không sửa file bên trong container production đang chạy: thay đổi có thể mất
khi recreate và route Next cần build. Dùng checkout riêng của source v0.5.95,
không phải thư mục Gateway. Nếu chưa có source:

```powershell
git clone --branch v0.5.95 --depth 1 https://github.com/decolua/9router.git D:\9router-src
if ($LASTEXITCODE -ne 0) { throw 'Không tải được source 9Router' }
```

Sau khi cập nhật source Gateway, chuẩn bị route và build image:

```powershell
cd D:\LTN-GATEWAY
node scripts/prepare-9router-combo-api.mjs D:\9router-src
if ($LASTEXITCODE -ne 0) { throw 'Không chuẩn bị được endpoint nội bộ' }
docker build -t simi-9router:0.5.95-ltn D:\9router-src
if ($LASTEXITCODE -ne 0) { throw 'Build 9Router thất bại; giữ image cũ' }
```

Script chỉ sửa nhánh proxy đúng `/api/internal/ltn-combos`, giữ backup
`src/proxy.js.ltn-backup` và thêm hai file route/helper. Source không tương thích
hoặc file custom có nội dung khác sẽ bị từ chối; cần review trước khi nâng phiên bản.

## Cấu hình container

Trong compose/config container **hiện có**, đổi image thành
`simi-9router:0.5.95-ltn`, giữ nguyên data volume, mount và các env hiện tại.
Không xóa volume/container để cài trắng. Backup dữ liệu trước rollout.

Thêm env riêng cho 9Router:

```dotenv
LTN_COMBO_API_TOKEN=<khóa server mới>
LTN_COMBO_API_ALLOWED_IPS=<IP kết nối Gateway được container nhìn thấy>
```

IP mặc định chỉ loopback. Gateway Windows gọi qua cổng Docker publish có thể
được container nhìn thấy là IP gateway của Docker network. Lấy thông tin bằng
`docker inspect 9router --format '{{json .NetworkSettings.Networks}}'` và dùng
IP nguồn thực tế; không dùng wildcard, danh sách IP công khai hay tin X-Forwarded-For.
Publish cổng 9Router ở host loopback: `127.0.0.1:20128:20128`.
Không proxy `/api/internal/ltn-combos` ra domain công khai. Nếu có reverse proxy
dashboard, chặn đường dẫn nội bộ này trong cấu hình reverse proxy.

Khóa có thể tạo bằng `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
trên terminal riêng của server. Không gửi khóa lên chat, commit, client installer
hay log. Lưu cùng một giá trị trong env container và `.env` Gateway.

Recreate service 9Router bằng compose hiện có sau khi review volume/env/port;
không chạy một container mới chiếm cùng cổng. Bản Gateway không tự thay hạ tầng.

## Kiểm tra trước khi chuyển Gateway

Đặt hai dòng trên Gateway nhưng chưa restart service:

```dotenv
NINEROUTER_COMBO_API_URL=http://127.0.0.1:20128/api/internal/ltn-combos
NINEROUTER_COMBO_API_TOKEN=<cùng khóa server>
```

Kiểm tra Node trên server, đọc token từ `.env` không in token:

```powershell
cd D:\LTN-GATEWAY
node --env-file=.env scripts/check-internal-combos.mjs
```

HTTP 200 và đúng combo: `Restart-Service LTNGateway -ErrorAction Stop`, rồi kiểm
tra `/v1/codex/config` bằng key user bình thường và Update client. Có thể xóa
`NINEROUTER_DASHBOARD_COOKIE` sau khi xác nhận đường mới hoạt động.

HTTP 401: khóa không khớp; 403: trusted peer/IP không đúng; 404: image chưa có
route; 503: thiếu khóa/không chạy custom server hoặc DB không đọc được.
Không bỏ kiểm tra xác thực để chữa lỗi. Khóa không có thời hạn session dashboard,
nhưng vẫn cần thay chủ động khi muốn rotate hoặc nghi ngờ bị lộ.

Rollback: bỏ URL/token Gateway, restore cookie hợp lệ rồi restart Gateway;
trở lại image 9Router cũ với nguyên volume. Chế độ cookie vẫn cần phiên còn hạn.

Đã test auth/deny/method/redaction, mock Gateway và apply source patch; chưa
build hay triển khai image Docker trên máy production trong phiên làm việc này.
