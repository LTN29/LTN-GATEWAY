---
name: muse-tao-anh
description: Tạo ảnh và sửa ảnh nhiều lượt bằng Muse (model muse2api/muse-image-chat) qua Gateway Simi; ảnh được tải về máy và hiện ngay trong chat Codex. Dùng khi user muốn tạo ảnh bằng Muse hoặc chỉnh tiếp ảnh Muse vừa tạo cho đúng ý.
---

# Muse - Tạo ảnh và sửa nhiều lượt

App Codex không hiện ảnh từ link ngoài, nên luôn tải ảnh về máy rồi hiển thị bằng
đường dẫn tuyệt đối. Dùng lệnh `ltn-muse` do installer cài; lệnh tự lấy key
Gateway và client ID đã cài, không in key. Không hỏi user key, không đọc/in key,
không gọi `router.simi.vn`. Nếu thiếu lệnh `ltn-muse`, báo user chạy Update.

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
  vì có thể ảnh vẫn đang được tạo và tốn lượt của tài khoản.
- `error` là câu "⚠️ Không tạo được ảnh..." từ Muse: báo nguyên văn ngắn gọn,
  gợi ý user chỉnh prompt.
- HTTP 401: lỗi key, báo user; 403: tài khoản chưa được mở model Muse, báo
  tính năng chưa được mở cho tài khoản và dừng. Không đổi model để né quyền.
- Lỗi mạng hay sandbox chặn: xin user duyệt quyền mạng, không gọi đó là lỗi DNS.
- Không hiển thị JSON, lệnh hay tham số nội bộ cho user thông thường.
