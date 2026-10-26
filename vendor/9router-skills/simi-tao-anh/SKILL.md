---
name: simi-tao-anh
description: Tạo hoặc chỉnh ảnh (xóa chữ, retouch, đổi nền, outpaint, ghép ảnh) qua Simi Gateway bằng model ảnh cùng hãng với model chat đang dùng, lưu file ảnh về máy và hiển thị trong chat. Dùng khi user yêu cầu tạo, vẽ, sửa hoặc xóa chữ trên ảnh.
---

# Simi - Tạo ảnh

Dựa trên skill `9router-image` của 9Router, chỉnh cho SIMI: mọi request đi qua
`https://ai.simi.vn/v1` bằng key đã cài, không bao giờ gọi `router.simi.vn`.

## Nguyên tắc

- Model chat không tự vẽ ảnh. Ảnh do **model ảnh** tạo qua Gateway; skill này
  chọn model ảnh **cùng hãng với model chat đang dùng**.
- Không đọc, in, hỏi hay tạo key mới. Không tìm hoặc dùng `OPENAI_API_KEY`
  hay key nào khác. Chỉ dùng key installer đã cài (mục "Kết nối").
- Không gọi trực tiếp 9Router hoặc endpoint quản trị để né quyền Gateway.
- 401 là lỗi xác thực: báo user, không tự đổi key. 403: báo tính năng chưa được
  mở cho tài khoản rồi dừng, không gọi lại, không đổi model để né quyền.
- Lưu ảnh vào thư mục `outputs/` của workspace (tạo nếu chưa có), tên file mô tả
  ngắn, không dấu. Giữ nguyên ảnh gốc của user.
- For an ordinary user, report progress and the saved image in natural language.
  Do not show request JSON, API calls, curl commands, tool/function-call syntax,
  `<tool_call>` markup, key values or provider parameters in the chat response.
  Không nói đã xong khi chưa có file ảnh hợp lệ.

## 1. Kết nối (không in key)

Gateway: `NINEROUTER_URL` nếu có (bỏ `/` cuối, thêm `/v1` nếu thiếu), mặc định
`https://ai.simi.vn/v1`. Key và client ID lấy như sau, chỉ đưa vào header:

| Hệ điều hành | Key | Client ID |
|---|---|---|
| Windows (PowerShell) | `$env:LTN_TEAM_API_KEY`, nếu trống thì `[Environment]::GetEnvironmentVariable('LTN_TEAM_API_KEY','User')` | `LTN_CLIENT_ID` (cùng cách) |
| macOS / Linux | `"${CODEX_HOME:-$HOME/.codex}/bin/ltn-codex-token"` (in key ra stdout) | file `${CODEX_HOME:-$HOME/.codex}/ltn-client-id` |

Windows dùng `curl.exe` (không dùng alias `curl` của PowerShell). Header:
`Authorization: Bearer <key>`, `X-LTN-Client-ID: <client id>` (nếu có).
Chỉ khi không tìm thấy key ở mọi nguồn trên mới báo user chạy installer chọn
Update/Repair.

## 2. Chọn model ảnh theo model chat đang dùng

1. Xác định model chat của phiên hiện tại: ID model mà phiên/hệ thống cho biết;
   nếu không rõ, đọc dòng `model = "..."` ở đầu `${CODEX_HOME:-~/.codex}/config.toml`.
2. Lấy danh sách model ảnh: `GET {gateway}/models/image` → `data[].id`.
   Chỉ dùng ID có trong danh sách này, không đoán ID.
3. Chọn theo bảng (giữ thứ tự danh sách trả về):

| Model chat | Model ảnh ưu tiên |
|---|---|
| `cx/*`, `gpt-*`, `openai/*` | ID bắt đầu bằng `cx/` hoặc `openai/` có chứa `image` |
| `ag/*`, `gemini*`, `*/gemini-*` | ID chứa `gemini` và `image` (cùng tiền tố provider nếu có) |
| `muse2api/*` | dùng skill `muse-tao-anh` (lệnh `ltn-muse`) nếu đã cài; nếu không, dùng nhóm mặc định |
| Claude và model khác không có model ảnh | nhóm Gemini image, rồi nhóm `cx/` image |

4. User nêu đích danh model ảnh thì dùng đúng model đó (nếu có trong danh sách).
5. Cần thông số (size, quality, hỗ trợ sửa ảnh) thì xem
   `GET {gateway}/models/info?id=<ID đã URL-encode>`. Không suy ra khả năng sửa ảnh
   từ khả năng đọc ảnh của model chat.

Đổi model chỉ khi model đã chọn lỗi phía provider (HTTP 400, 404, 422, 5xx hoặc
body báo model/provider lỗi): thử **một** model kế tiếp cùng nhóm, rồi tối đa
**một** model nhóm mặc định. Không thử khi lỗi 401, 403, 429. Báo user model đã dùng.

## 3. Tạo ảnh mới

`POST {gateway}/images/generations?response_format=binary`, body JSON:

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `model` | có | từ bước 2 |
| `prompt` | có | prompt đã viết theo mục 5 |
| `size` | không | `1024x1024`, `1792x1024`, `1024x1792`...; Gemini bỏ qua size |
| `n` | không | mặc định 1, không tạo hàng loạt |

Ghi body ra file tạm (UTF-8) rồi gửi bằng `--data-binary @<file>` để tránh lỗi
dấu ngoặc và tiếng Việt trên PowerShell. Dùng `curl --fail-with-body -sS
--max-time 300 -o outputs/<ten>.png -w "%{http_code} %{content_type}"`.

Kiểm tra kết quả trước khi báo xong:
- `content_type` là `image/*`: file ảnh hợp lệ.
- Là JSON: đọc `data[0].b64_json` (decode ra file) hoặc `data[0].url` (tải về,
  kiểm tra `image/*`). JSON lỗi thì xóa file, không lưu lỗi thành ảnh.
- Là SSE (`text/event-stream`, provider `cx`/codex): lấy ảnh base64 trong event
  cuối có dữ liệu ảnh rồi decode ra file.

## 4. Sửa ảnh, xóa chữ, outpaint, ghép ảnh

Luôn dùng ảnh user đính kèm hoặc nêu đường dẫn; không âm thầm tạo ảnh mới thay
thế. Thứ tự cách gọi (theo `/models/info` của model đã chọn):

1. Model hỗ trợ edit: `POST {gateway}/images/edits?response_format=binary`,
   multipart: `-F model=<id> -F "prompt=<...>" -F "image=@<ảnh gốc>"`
   (thêm `-F "mask=@<mask>"` nếu có; ghép nhiều ảnh thì lặp `-F "image[]=@..."`
   theo đúng tên trường model hỗ trợ).
2. Provider nhận ảnh tham chiếu qua `/images/generations` (`cx`/codex:
   `image`/`images[]`; `nanobanana`, `fal-ai`, FLUX, `runwayml`: `image`):
   gửi ảnh dạng data URL `data:image/png;base64,...` trong body JSON (ghi ra file
   tạm rồi `--data-binary @file`).
3. Model trong nhóm không sửa được ảnh: chọn model khác có hỗ trợ theo bước 2.
   Không có model nào hỗ trợ thì báo user, không chế ảnh mới thay thế.

Prompt sửa ảnh phải ghi rõ phần cần đổi và phần **giữ nguyên**: chủ thể, khuôn
mặt, logo, chữ không yêu cầu xóa, hình dạng sản phẩm, ánh sáng, góc máy, phong
cách. Xóa chữ: nêu vùng/chữ cần xóa và yêu cầu lấp nền tự nhiên. Outpaint: nêu
hướng mở rộng (trái/phải/trên/dưới/mọi phía) và nội dung vùng mới.

## 5. Viết prompt và kiểm tra ảnh

Viết prompt theo thứ tự: chủ thể và hành động; bố cục, khung hình; chi tiết bắt
buộc; phong cách, ánh sáng; điều cần tránh; tỉ lệ. Chữ trong ảnh phải ngắn và
chính xác. Chọn tỉ lệ theo mục đích: vuông cho bài đăng, dọc cho story/poster,
ngang cho banner/slide; tôn trọng kích thước user nêu.

Trước khi trả lời, mở ảnh vừa lưu để kiểm tra: đúng yêu cầu, chủ thể không bị
cắt, chữ đọc được nếu cần, không lỗi rõ ràng. Lỗi thì sửa prompt và thử lại
**một lần**. Hiển thị ảnh bằng Markdown với đường dẫn tuyệt đối, ví dụ
`![meo-ngu](C:/Users/ten/du-an/outputs/meo-ngu.png)`, nói ngắn ảnh có gì, model
đã dùng, tỉ lệ đã chọn, rồi hỏi user cần chỉnh gì. Sửa tiếp thì dùng ảnh vừa tạo
làm ảnh gốc và prompt đầy đủ (prompt cũ + thay đổi).

Không gọi ảnh tạo ra là ảnh thật, tài sản thương hiệu chính thức hay tài liệu
đã xác minh.

## 6. Lỗi mạng và quyền

If network access needs approval or is sandbox-blocked, ask the user to approve
internet access for this request. Do not tell the user to run Repair for that case
and do not call it a DNS error. Report DNS only when name resolution itself failed
in the returned error. Repair is appropriate only when the installer-managed
credential or installed skill/runtime is missing.

Mỗi ảnh mất khoảng 10–90 giây và tốn quota. Không retry khi chưa biết lần trước
đã tạo job hay chưa. Không tạo nhiều ảnh nếu user không yêu cầu.
