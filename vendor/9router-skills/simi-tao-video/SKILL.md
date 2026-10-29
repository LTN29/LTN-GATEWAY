---
name: simi-tao-video
description: Tạo video ngắn từ mô tả hoặc từ một ảnh làm khung hình đầu bằng Muse (model muse2api/muse-video-chat) qua SIMI Gateway; video được tải về máy và trả link xem/tải. Dùng khi user yêu cầu tạo video, clip hoặc biến ảnh thành video.
---

# Simi - Tạo video

Mục tiêu là trả về **file video hoàn chỉnh**, không chỉ kịch bản hay prompt. Dùng lệnh
`ltn-muse --video` do installer cài; lệnh tự lấy key Gateway và client ID, không in key.
Không hỏi user key, không đọc/in key. Nếu thiếu `ltn-muse` hoặc lệnh chưa có tùy chọn
`--video`, báo user chạy Update (UPDATESIMI) rồi dừng.

## Chuẩn bị yêu cầu

- Có đủ ý tưởng thì làm ngay; chỉ hỏi một câu ngắn khi user chưa nói muốn video về gì.
- Viết prompt đầy đủ: chủ thể, hành động, bối cảnh, chuyển động máy quay, ánh sáng,
  phong cách. Giữ ngôn ngữ user dùng. Không hứa thời lượng/độ phân giải cụ thể.
- Ảnh user gửi để "biến thành video" dùng làm `--ref` (tối đa **1** ảnh, là khung
  hình đầu). Nhiều ảnh thì hỏi user chọn một.

## Chạy đúng một lần

- Lệnh cần Internet: chạy **ngay với quyền mạng** (xin escalation ở lần gọi đầu),
  không chạy thử trong sandbox trước.
- Mỗi yêu cầu chỉ gọi **một lần**; thường mất 1–3 phút, tối đa khoảng 11 phút.
  Chờ lệnh kết thúc; không gọi song song, không gọi lại khi đang chờ.
- Mỗi lượt tạo video tốn quota tài khoản Muse; không tạo thêm bản "đẹp hơn" nếu
  user không yêu cầu.

Windows PowerShell:

```powershell
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE ".codex" }
& (Join-Path $codexHome "bin\ltn-muse.cmd") --video --prompt "<prompt>" [--ref "<ảnh khung đầu>"]
```

macOS/Linux:

```bash
"${CODEX_HOME:-$HOME/.codex}/bin/ltn-muse" --video --prompt "<prompt>" [--ref "<ảnh>"]
```

## Kết quả

Lệnh in một dòng JSON: `ok`, `video` (`path` trên máy, `url`, `download_url`, `size`),
`meta`, hoặc `error`. Mặc định lưu ở thư mục `Videos/muse` của người dùng.
Chỉ coi là xong khi có `"ok": true` và `video.path` tồn tại.

- Trả đường dẫn tuyệt đối của file và link [Xem video](url) / [Tải video](download_url).
  Có thể nhúng `![video](<path tuyệt đối>)` để app hiện preview.
- Không hiển thị JSON, lệnh hay tham số nội bộ cho user thông thường.
- Kết thúc bằng một câu hỏi ngắn: video đã đúng ý chưa, muốn đổi gì.

Sửa video: không chỉnh được video cũ. Viết lại prompt đầy đủ (mô tả cũ + thay đổi) và
tạo video mới khi user yêu cầu; có thể dùng một ảnh làm khung đầu để giữ bố cục.

## Lỗi

- Không tự gọi lại khi lỗi hoặc hết giờ: video có thể vẫn đang được tạo và đã tốn
  lượt. Báo lỗi rồi kết thúc lượt; user muốn thử lại sẽ yêu cầu.
- `error` bắt đầu bằng "⚠️ Không tạo được video": báo nguyên văn ngắn, gợi ý sửa prompt.
- HTTP 403: tài khoản chưa được mở model video; báo và dừng, không đổi model để né.
- HTTP 401: lỗi key, báo user. Lỗi mạng/sandbox chặn: xin quyền mạng, không gọi là lỗi DNS.
- Ảnh khung đầu quá lớn/HTTP 413: nhờ user gửi ảnh nhỏ hơn.
