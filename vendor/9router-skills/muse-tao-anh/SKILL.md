---
name: muse-tao-anh
description: Tạo ảnh và sửa ảnh nhiều lượt bằng Muse (model muse2api/muse-image-chat) qua Gateway Simi; ảnh được tải về máy và hiện ngay trong chat Codex. Dùng khi user muốn tạo ảnh bằng Muse hoặc chỉnh tiếp ảnh Muse vừa tạo cho đúng ý.
---

# Muse - Tạo ảnh và sửa nhiều lượt

App Codex không hiện ảnh từ link ngoài, nên luôn tải ảnh về máy rồi hiển thị bằng
đường dẫn tuyệt đối. Dùng lệnh `ltn-muse` do installer cài; lệnh tự lấy key
Gateway và client ID đã cài, không in key. Không hỏi user key, không đọc/in key,
không gọi `router.simi.vn`. Nếu thiếu lệnh `ltn-muse`, báo user chạy Update.

## Chạy đúng một lần rồi dừng

- Lệnh cần Internet. Chạy lệnh **ngay với quyền mạng** (xin escalation/duyệt mạng
  trong lần gọi đầu tiên); không chạy thử trong sandbox trước rồi mới xin quyền.
- Mỗi yêu cầu của user chỉ gọi `ltn-muse` **một lần**. Lệnh có thể mất tới gần
  3 phút; chờ lệnh kết thúc, không gọi song song hay gọi lại trong lúc chờ.
- Ảnh user gửi kèm chỉ dùng làm `--ref`; xem ảnh đó **không** có nghĩa là đã tạo
  xong. Chỉ coi là xong khi lệnh in `"ok": true`.
- Khi đã có `"ok": true`: hiển thị ảnh, hỏi một câu ngắn rồi **kết thúc lượt**.
  Không tạo thêm ảnh, không chạy lại để "làm đẹp hơn", không thử model khác.

## Tạo ảnh mới

Windows PowerShell:

```powershell
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE ".codex" }
& (Join-Path $codexHome "bin\ltn-muse.cmd") --prompt "<prompt>"
```

macOS/Linux:

```bash
"${CODEX_HOME:-$HOME/.codex}/bin/ltn-muse" --prompt "<prompt>"
```

Prompt nên tả rõ: chủ thể và hành động, bố cục, chi tiết bắt buộc, phong cách và
ánh sáng, tỉ lệ khung. Giữ đúng ngôn ngữ user dùng.

## Sửa ảnh (lượt tiếp theo)

Khi user góp ý ảnh vừa tạo (ví dụ "cho mèo màu trắng, nằm trên sofa"):

1. Viết lại **prompt đầy đủ** = mô tả ảnh trước + thay đổi user yêu cầu + câu
   "giữ nguyên bố cục, góc máy và phong cách của ảnh tham chiếu, chỉ đổi: ...".
   Model chỉ đọc lượt này, không nhớ lượt trước.
2. Gửi ảnh gần nhất làm tham chiếu bằng `--ref "<đường dẫn ảnh trước>"`
   (tối đa 4 ảnh). Nếu user đính kèm ảnh riêng, dùng ảnh đó.
3. Không xoá hay ghi đè ảnh cũ; mỗi lượt là một file mới.

Ảnh tham chiếu chỉ giúp giữ bố cục, không bảo đảm giữ y hệt; nếu chi tiết bị đổi
ngoài ý muốn, nói rõ với user.

## Khi nào dừng

Áp dụng cho cả ảnh từ model và chỉnh trực tiếp trên ảnh gốc:

- Xem ảnh kết quả **một lần** ở cỡ bình thường. Ảnh từ model đúng yêu cầu chính
  thì trả luôn và kết thúc lượt; không chạy lại để "làm đẹp hơn" (khối lệnh
  Gateway và `ltn-muse` vẫn giữ quy tắc chạy một lần).
- Chỉnh trực tiếp ảnh gốc: chỉ sửa thêm khi lỗi **thấy rõ** ở cỡ xem bình
  thường, tối đa **2 lần sửa**, mỗi lần chỉ chỉnh ngưỡng/mask. Lỗi nhỏ phải
  zoom mới thấy thì không tự sửa; nêu ngắn để user quyết định.
- Không dùng công cụ tạo hình trực quan/visualization để xem ảnh, không
  zoom/crop soi từng vùng, không xuất nhiều bản.

Chỉnh trực tiếp ảnh gốc bằng Python (đổi màu, sáng/tối, crop, retouch nhẹ) chỉ
khi user yêu cầu chỉnh trên ảnh gốc, và cần Pillow. Runtime của installer không
cài Pillow: kiểm tra bằng `python -c "import PIL"`; thiếu Pillow thì **không tự
`pip install`**, dùng đường Gateway (khối lệnh `simi-tao-anh` với `Mode = 'edit'`)
hoặc `muse-tao-anh`. Có Pillow thì làm trong **một** lệnh: đọc ảnh gốc, tạo mask
theo màu/vùng cần đổi (loại trừ da/nền, làm mờ biên 1-2px), giữ độ sáng/bóng,
lưu file mới, không ghi đè ảnh gốc.

## Kết quả và hiển thị

Lệnh in một dòng JSON: `ok`, `images` (mỗi ảnh có `path` trên máy,
`url` gốc, `download_url`), `meta` (file JSON lưu prompt/ref của lượt đó),
hoặc `error`. Mặc định lưu vào thư mục `Pictures/muse` trong thư mục người dùng.

- Hiện từng ảnh bằng `![mô tả ngắn](<path tuyệt đối>)` và nêu đường dẫn file.
- Kèm link gốc dạng [Mở/tải ảnh](download_url) nếu cần chia sẻ.
- Mở ảnh xem trước khi trả lời: kiểm tra đúng yêu cầu, chủ thể không bị cắt.
- Kết thúc bằng một câu hỏi ngắn: ảnh đã đúng ý chưa, muốn đổi gì.

## Lỗi

- Mỗi yêu cầu chỉ gọi **một lần**. Không tự gọi lại khi lỗi hoặc hết giờ,
  vì có thể ảnh vẫn đang được tạo và tốn lượt của tài khoản. Báo lỗi cho user
  rồi kết thúc lượt; user muốn thử lại thì sẽ yêu cầu.
- Lỗi "ảnh tham chiếu quá lớn" hoặc HTTP 413: nhờ user gửi ảnh nhỏ hơn; không
  tự cắt/nén ảnh rồi gọi lại.
- `error` là câu "⚠️ Không tạo được ảnh..." từ Muse: báo nguyên văn ngắn gọn,
  gợi ý user chỉnh prompt.
- HTTP 401: lỗi key, báo user; 403: tài khoản chưa được mở model Muse, báo
  tính năng chưa được mở cho tài khoản và dừng. Không đổi model để né quyền.
- Lỗi mạng hay sandbox chặn: xin user duyệt quyền mạng, không gọi đó là lỗi DNS.
- Không hiển thị JSON, lệnh hay tham số nội bộ cho user thông thường.
