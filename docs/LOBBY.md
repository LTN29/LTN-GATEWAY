# Sảnh online (app Văn Phòng AI)

Tab **🌐 Sảnh** trong app Văn Phòng AI cho mọi người đang dùng AI gặp nhau:
thấy ai đang online, đang làm gì, chọn nhân vật riêng, nhắn tin với nhau và cùng xem
video YouTube trên màn chiếu của quán.
App tự kết nối bằng chính key đã cài qua bộ cài SIMI, không cần đăng nhập thêm.

## Route (đều yêu cầu `Authorization: Bearer <API key của user>`)

| Route | Việc |
| --- | --- |
| `GET /v1/lobby/stream` | Kênh SSE: `hello` (mình, người đang online, danh sách phòng, `cinema`, `app`), rồi `member`, `leave`, `move`, `emote`, `message`, `cinema`, `app-release`. Ping mỗi 25 giây. |
| `GET /v1/lobby/members` | Ảnh chụp danh sách đang online + phòng (không cần SSE). |
| `GET /v1/lobby/messages?room=…&limit=50&before=<ts>` | Lịch sử một phòng. |
| `POST /v1/lobby/messages` | `{ room, text }` hoặc `{ to: "<memberId>", text }` để nhắn riêng. |
| `POST /v1/lobby/state` | `{ status: { activity, text, model }, pos: { x, z }, emote }` – trạng thái, vị trí nhân vật, biểu cảm. |
| `POST /v1/lobby/profile` | `{ avatar, hidden, nickname }` – nhân vật, ẩn trạng thái; `nickname` chỉ dùng cho key chung của team. |
| `GET /v1/lobby/cinema` | Màn chiếu: `{ now, current, queue }` – video đang chiếu (kèm `startedAt` để các máy chiếu đồng bộ) và hàng chờ. |
| `POST /v1/lobby/cinema` | `{ action: "add", url }` thêm link YouTube · `{ action: "skip" }` chuyển bài · `{ action: "remove", id }` gỡ video của mình · `{ action: "duration", videoId, seconds }` app báo độ dài video. |

Phòng: `all` (cả công ty), `dm:<a>~<b>` (nhắn riêng, chỉ 2 người). Phòng team đã bỏ –
`team:<TEAMID>` trả 403. Mã thành viên: `u:<userId>`; key chung của team: `t:<TEAM>:<8 ký tự client id>`.

## Nguyên tắc

- Tên, team, vai trò lấy từ `config/users.json` theo key đã xác thực.
- Chỉ trạng thái được chia sẻ (`activity`: idle, chat, work, image, video, web, doc, away),
  không bao giờ có nội dung hỏi AI.
- Tin nhắn không qua 9Router, không vào memory, log chỉ ghi số ký tự.
- Tài khoản dịch vụ (`PUBLIC_CHATBOT_SERVICE`, `memoryMode: none`) không vào Sảnh.
- Giới hạn: 8 tin / 10 giây, 12 cập nhật trạng thái / giây mỗi người, tin tối đa
  `LOBBY_MAX_MESSAGE_CHARS` ký tự.

## Màn chiếu YouTube

- Ai cũng thêm được link YouTube (`youtube.com/watch?v=…`, `youtu.be/…`, `shorts/…`, `live/…`).
  Gateway hỏi YouTube tên video + độ dài; video riêng tư / không cho nhúng bị từ chối ngay.
- **Xếp hàng theo lượt**: mỗi người 1 video mỗi vòng (người đang có video chiếu lùi xuống vòng sau),
  tối đa 3 video chờ mỗi người, 30 video cả hàng.
- **Chuyển bài**: người thêm video bỏ qua ngay; người khác bỏ phiếu, đủ quá nửa số người online thì chuyển.
- Hết video tự chuyển bài kế tiếp. Không lấy được độ dài thì app đang xem báo lại; vẫn không có thì tự
  chuyển sau `LOBBY_CINEMA_UNKNOWN_MINUTES` phút.
- Hàng chờ chỉ nằm trong bộ nhớ (khởi động lại Gateway là trống). Không lưu lịch sử xem.

## Cấu hình (`.env`)

```env
LOBBY_ENABLED=true            # false = tắt Sảnh ngay
LOBBY_DATA_DIR=./data/lobby   # hồ sơ nhân vật + lịch sử tin nhắn
LOBBY_RETENTION_DAYS=30       # số ngày giữ tin nhắn
LOBBY_MAX_MESSAGE_CHARS=2000
LOBBY_CINEMA_PER_PERSON=3        # mỗi người xếp tối đa bao nhiêu video
LOBBY_CINEMA_MAX_QUEUE=30        # cả hàng chờ
LOBBY_CINEMA_MAX_MINUTES=180     # video dài hơn bị từ chối
LOBBY_CINEMA_UNKNOWN_MINUTES=30  # không biết độ dài → tự chuyển sau
LOBBY_CINEMA_LOOKUP=true         # false = không hỏi YouTube tên / độ dài (máy chủ không ra Internet)
```

Không có biến bắt buộc; không cấu hình gì thì Sảnh bật với giá trị mặc định ở trên.
SSE chạy qua Cloudflare Tunnel như stream chat sẵn có, không cần mở thêm cổng.

## Kiểm tra sau khi triển khai

```bash
curl -sS -H "Authorization: Bearer <key của bạn>" https://ai.simi.vn/v1/lobby/members | python3 -m json.tool
curl -sN -H "Authorization: Bearer <key của bạn>" https://ai.simi.vn/v1/lobby/stream   # thấy event: hello là đạt
```
