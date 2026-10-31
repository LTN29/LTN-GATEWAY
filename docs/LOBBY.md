# Sảnh online (app Văn Phòng AI)

Tab **🌐 Sảnh** trong app Văn Phòng AI cho mọi người đang dùng AI gặp nhau:
thấy ai đang online, đang làm gì, chọn nhân vật riêng, nhắn tin với nhau và cùng xem
video YouTube trên màn chiếu của quán.
App tự kết nối bằng chính key đã cài qua bộ cài SIMI, không cần đăng nhập thêm.

## Route (đều yêu cầu `Authorization: Bearer <API key của user>`)

| Route | Việc |
| --- | --- |
| `GET /v1/lobby/stream` | Kênh SSE: `hello` (mình, người đang online, danh sách phòng, `cinema`, `app`), rồi `member`, `leave`, `move`, `emote`, `message`, `cinema`, `app-release`, `roster` (danh sách id đang online, mỗi `LOBBY_ROSTER_MS`), `me` (`devices`: số máy đang mở cùng tài khoản). Ping mỗi 25 giây. |
| `GET /v1/lobby/members` | Ảnh chụp danh sách đang online + phòng (không cần SSE). |
| `GET /v1/lobby/messages?room=…&limit=50&before=<ts>` | Lịch sử một phòng. |
| `POST /v1/lobby/messages` | `{ room, text }` hoặc `{ to: "<memberId>", text }` để nhắn riêng. Thêm được `images: [id…]` (tối đa 4, id từ `/upload`), `mentions: ["u:…", "all"]` (@gọi tên; `all` = @mọi người), `replyTo: "<id tin>"`. |
| `POST /v1/lobby/messages/delete` | `{ room, id }` – người gửi thu hồi tin của mình; admin xoá tin trong phòng chung. Phát `message-delete`. |
| `POST /v1/lobby/upload?room=…\|to=…&thumbBytes=N&w=&h=` | Thân = ảnh thu nhỏ (N byte) + ảnh đầy đủ. Chỉ PNG / JPEG / WebP / GIF (kiểm tra theo nội dung). Trả `{ id }`. |
| `GET /v1/lobby/file?id=…[&thumb=1]` | Tải ảnh – chỉ người xem được phòng chứa ảnh. |
| `POST /v1/lobby/cat` | `{ action: pet \| feed \| play \| call }` – chơi với mèo của quán; phát sự kiện `cat` (mọi máy thấy cùng một con mèo). |
| `POST /v1/lobby/interact` | `{ to, kind: highfive \| cheers \| coffee \| hug \| dance[, style] }`; `hug` / `dance` gửi lời mời (`interact` state `ask`) – người nhận trả lời `{ id, accept }`. Diễn: `interact` state `go` cho cả Sảnh. |
| `GET /v1/lobby/admin` · `POST /v1/lobby/admin` | Chỉ admin (`LOBBY_ADMINS`): tổng quan + `{ action: mute \| kick \| unkick \| perms \| cinema \| announce \| unpin \| npc }`. |
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
- Giới hạn: 8 tin / 10 giây (`LOBBY_MSG_PER_10S`), 16 ảnh / 10 giây, 12 cập nhật trạng thái / giây mỗi người, tin tối đa
  `LOBBY_MAX_MESSAGE_CHARS` ký tự.

## Ảnh, @gọi tên, trả lời (từ app 0.9.13)

- App nén ảnh ngay trên máy (cạnh dài tối đa 1600px, WebP ~200–400 KB, kèm ảnh thu nhỏ ~20–60 KB), bỏ thông tin ẩn như GPS.
  GIF giữ nguyên (≤ 5 MB) để còn chuyển động.
- Ảnh gắn với đúng phòng lúc tải lên: ảnh trong tin nhắn riêng chỉ 2 người xem được, kể cả admin cũng không.
- Ảnh tự xoá sau `LOBBY_FILE_RETENTION_DAYS` ngày; ảnh tải lên mà không gửi tự xoá sau 1 ngày; xoá tin thì xoá luôn ảnh.
- `mentions` chỉ giữ người có thật và ở trong phòng đó; `@mọi người` chỉ ở phòng chung, cần quyền, tối đa 3 lần / giờ.
  App hiện thông báo hệ thống khi mình được tag.

## Admin Sảnh

- Admin = tài khoản trong `LOBBY_ADMINS` (theo mã tài khoản, **không** theo tên hiển thị). Key chung của team không làm admin được.
- Tab 🛡️ Quản trị trong app: ai đang online + phiên bản app từng máy, khoá chat (15 phút → 1 ngày), mời ra khỏi Sảnh,
  phân quyền (mặc định → team → từng người) cho: gửi ảnh, @mọi người, thêm video, nhắn riêng; khoá màn chiếu, chuyển bài,
  xoá hàng chờ; thông báo ghim / thông báo nổi; xoá tin trong phòng chung.
- Gateway kiểm tra quyền ở mọi route. Mọi thao tác admin ghi vào `LOBBY_DATA_DIR/admin-audit.jsonl`.
- Admin không đọc / không xoá được tin nhắn riêng giữa hai người khác.
- Quyền, khoá chat, thông báo ghim lưu ở `LOBBY_DATA_DIR/settings.json`.

## Mèo, tương tác, nhảy (từ app 0.9.14)

- Mèo "Mít": Gateway quyết định mèo đi đâu / làm gì (`hello.cat`, sự kiện `cat`), app tự tìm đường và diễn → mọi máy thấy cùng một con mèo.
- `POST /v1/lobby/state { dance: "groove" | "disco" | "robot" | "shuffle" | "spin" | "hands" | null }` – nhảy liên tục; gửi vị trí mới (đi chỗ khác) là tự dừng.
  Người vào sau thấy ai đang nhảy (`members[].dance`). App tính nhịp theo giờ Gateway nên mọi người nhảy khớp nhịp.
- Tương tác cần cả hai đang online và không ẩn; lời mời hết hạn sau 30 giây; không mời dồn dập cùng một người.

## Trợ lý SIMI – NPC (từ app 0.9.15)

- `GET /v1/lobby/npc` → `{ npc: { id, name, avatar, ready } | null, guides }` (guides = hướng dẫn admin đã sửa, `null` = dùng bản có sẵn trong app).
- `POST /v1/lobby/npc/ask { question, history?, guide? }` → `{ answer }`. Gateway gọi lại chính đường `/v1/responses` của nó bằng **key của tài khoản NPC**
  (định tuyến Combo, hạn mức, log như mọi tài khoản) – người hỏi không tốn lượt. Giới hạn `LOBBY_NPC_PER_HOUR` câu / người / giờ.
- Admin: `POST /v1/lobby/admin { action: "npc", id }` chọn tài khoản; `{ action: "npc-guides", guides?, notes? }` sửa hướng dẫn / ghi chú cho AI
  (lưu `LOBBY_DATA_DIR/npc.json`, phát `npc-guides` để mọi máy tải lại).
- **Key**: `users.json` chỉ có mã băm, nên đặt key thật của tài khoản NPC trong `.env`: `LOBBY_NPC_KEYS=<key>` (nhiều key cách nhau dấu phẩy).
  Gateway tự đối chiếu key thuộc tài khoản nào; tab Quản trị hiện ✅ sẵn sàng / ⚠️ chưa có key. Key không bao giờ gửi về app hay ghi log.

## Ai thấy ai

- Người bật **ẩn** không có trong danh sách online của ai (lưu trên Gateway, tắt mở app vẫn ẩn) nhưng vẫn nhắn tin được.
- Một tài khoản mở app trên nhiều máy (nhiều `X-LTN-Client-ID`) là **một người**: các máy đó không thấy nhau; `hello.me.devices` và sự kiện `me` cho biết số máy.
- Mỗi `LOBBY_ROSTER_MS` Gateway gửi `roster` (id những người đang online, không tính người ẩn); app thấy lệch thì tải lại `GET /v1/lobby/members`.

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
LOBBY_ROSTER_MS=30000           # gửi danh sách online để app tự đối chiếu
LOBBY_CINEMA_PER_PERSON=3        # mỗi người xếp tối đa bao nhiêu video
LOBBY_CINEMA_MAX_QUEUE=30        # cả hàng chờ
LOBBY_CINEMA_MAX_MINUTES=180     # video dài hơn bị từ chối
LOBBY_CINEMA_UNKNOWN_MINUTES=30  # không biết độ dài → tự chuyển sau
LOBBY_CINEMA_LOOKUP=true         # false = không hỏi YouTube tên / độ dài (máy chủ không ra Internet)
LOBBY_ADMINS=it-ltn              # admin Sảnh (mã tài khoản trong users.json, cách nhau dấu phẩy)
LOBBY_IMAGE_MAX_MB=5             # mỗi ảnh
LOBBY_FILE_RETENTION_DAYS=30     # số ngày giữ ảnh
LOBBY_FILES_MAX_MB=4096          # tổng dung lượng ảnh trên máy chủ
LOBBY_IMAGES_PER_DAY=200         # số ảnh mỗi người mỗi ngày
```

Không có biến bắt buộc; không cấu hình gì thì Sảnh bật với giá trị mặc định ở trên.
SSE chạy qua Cloudflare Tunnel như stream chat sẵn có, không cần mở thêm cổng.

## Kiểm tra sau khi triển khai

```bash
curl -sS -H "Authorization: Bearer <key của bạn>" https://ai.simi.vn/v1/lobby/members | python3 -m json.tool
curl -sN -H "Authorization: Bearer <key của bạn>" https://ai.simi.vn/v1/lobby/stream   # thấy event: hello là đạt
```
