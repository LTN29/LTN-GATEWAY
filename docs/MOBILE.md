# Sảnh Văn Phòng AI trên điện thoại (PWA)

Trang `https://<gateway>/m` – web app cho điện thoại (iPhone, Android), 3 tab:

- **Sảnh** – Sảnh 3D như app máy tính, tối ưu cho điện thoại: **cần điều khiển (joystick)** để đi lại, kéo 1 ngón xoay góc nhìn,
  chụm 2 ngón phóng to / thu nhỏ; nút to dễ bấm: Tủ đồ, trạng thái, biểu cảm + nhảy, nói với cả Sảnh, Trợ lý SIMI, màn chiếu,
  toàn cảnh, về chỗ mình; chạm đồng nghiệp → nhắn riêng / đi tới / đập tay / cụng ly / mời cà phê / ôm / mời nhảy; chạm mèo Mít.
  Tiết kiệm pin: không bóng đổ, 30 khung hình/giây, dừng vẽ khi sang tab khác hoặc khoá màn hình. Máy không có WebGL → vẫn dùng 2 tab còn lại.
- **Tin nhắn** – chat chung / nhắn riêng, gửi ảnh, @tag, trả lời, thu hồi.
- **Online** – ai đang online, theo team, tìm người.

Không cần App Store; "Thêm vào màn hình chính" là dùng như app. Bida hiện chỉ chơi trên máy tính.

## Dựng lại Sảnh 3D cho điện thoại

Phần 3D dùng chung code với app máy tính (repo app, `src/office3d/`). Sửa Sảnh 3D xong thì đóng gói lại cho trang điện thoại:

```
cd <repo app>
npm run build:mobile -- <repo Gateway>/site/mobile/sanh3d
```

rồi commit thư mục `site/mobile/sanh3d/` bên repo Gateway.

## Đăng nhập bằng mã QR

1. App Văn Phòng AI trên máy tính → tab **Sảnh** → nút **📱 Điện thoại** → gọi `POST /v1/mobile/pair` (bằng key của máy tính).
   Gateway trả link `https://<gateway>/m#pair=<mã>`: mã ngẫu nhiên, **dùng 1 lần**, hết hạn sau 5 phút.
2. Điện thoại quét QR → `POST /v1/mobile/claim` → nhận token phiên `vpm_…` (lưu trong trình duyệt điện thoại).
3. Điện thoại gọi `/v1/lobby/*` bằng token đó, là **đúng người** đang dùng máy tính (key riêng: cùng tài khoản; key chung của team: cùng mã máy đã ghép).

## An toàn

- Token điện thoại **chỉ dùng được Sảnh**: gọi `/v1/models`, `/v1/responses`, `/v1/chat/completions`… đều bị chặn 403.
- Gateway chỉ lưu **mã băm** của token và của key máy tính (`data/mobile/sessions.json`), không lưu token / key.
- Đổi hoặc khoá key máy tính → mọi phiên điện thoại của key đó tự hết hiệu lực.
- Mỗi người tối đa 5 phiên điện thoại; ghép thêm thì phiên cũ nhất bị bỏ. Không dùng 60 ngày thì phiên hết hạn.
- Đăng xuất trên điện thoại (nút ⇥ góc trên) xoá phiên đó. Trên máy tính, hộp **📱** liệt kê các điện thoại đã đăng nhập,
  mỗi máy có nút **Đăng xuất** từ xa (`GET /v1/mobile/sessions`, `POST /v1/mobile/revoke` – chỉ máy tính, chỉ điện thoại của chính mình).

## Cấu hình (.env, tuỳ chọn)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PUBLIC_BASE_URL` | lấy theo Host / X-Forwarded-* | Địa chỉ in vào mã QR, ví dụ `https://ai.simi.vn` (đặt khi Gateway đứng sau proxy đổi Host) |
| `MOBILE_SESSIONS_FILE` | `./data/mobile/sessions.json` | Nơi lưu phiên điện thoại |
| `MOBILE_PAIR_SECONDS` | `300` | Thời hạn mã QR |
| `MOBILE_SESSION_DAYS` | `60` | Phiên tự hết hạn nếu không dùng |

Điện thoại phải mở được địa chỉ trong mã QR qua mạng di động / Wi-Fi (dùng tên miền công khai, không dùng IP nội bộ).
