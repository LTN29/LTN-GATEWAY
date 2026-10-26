---
name: simi-cap-nhat
description: Cập nhật Simi (skill, công cụ, cấu hình Gateway) ngay trong chat, không cần user mở Terminal. Dùng khi user nói "cập nhật Simi", "update Simi", "update skill", "chạy Update/Repair", hoặc khi một skill Simi báo cần Update/Repair do thiếu công cụ/skill.
---

# Simi - Cập nhật

Chạy installer chính thức của SIMI ở chế độ **Update** thay cho user. Update dùng
API key đã lưu trên máy, không hỏi gì, tải lại toàn bộ skill, công cụ và cấu hình.
Sau khi xong, user chỉ cần tắt hẳn Codex rồi mở lại.

## Khi nào chạy

- Chỉ chạy khi user yêu cầu cập nhật, hoặc user đồng ý sau khi một skill Simi báo
  thiếu công cụ/skill. Không tự chạy khi user không yêu cầu.
- Không chạy để xử lý lỗi 401/403/429, lỗi mạng hay lỗi model; các lỗi đó Update
  không sửa được.
- Không chạy Install, Repair hay Uninstall bằng skill này. Không hỏi, đọc, in hay
  nhập API key. Installer báo không tìm thấy key đã lưu thì dừng và báo user nhờ IT
  cài lại (Install), không tự xử lý.

## Cách chạy (một lệnh, có quyền mạng)

Chạy **ngay với quyền mạng** (xin duyệt mạng ở lần chạy đầu), không chạy thử trong
sandbox trước. Lệnh có thể mất 1-5 phút; chờ lệnh kết thúc, không chạy lại giữa chừng.
Chỉ tải installer từ `https://ai.simi.vn`, không dùng nguồn khác.

Windows (PowerShell):

```powershell
& {
  $ErrorActionPreference = 'Stop'
  $tmp = Join-Path $env:TEMP ("ltn-codex-update-{0}.ps1" -f [Guid]::NewGuid().ToString('N'))
  try {
    Invoke-WebRequest -UseBasicParsing -Uri 'https://ai.simi.vn/install/codex-full.ps1' -OutFile $tmp -MaximumRedirection 0
    $text = [IO.File]::ReadAllText($tmp, [Text.UTF8Encoding]::new($false, $true))
    [IO.File]::WriteAllText($tmp, $text, [Text.UTF8Encoding]::new($true))
    $ps = (Get-Process -Id $PID).Path
    & $ps -NoLogo -NoProfile -ExecutionPolicy Bypass -File $tmp -Mode update 2>&1 | Select-Object -Last 25
    "LTN_UPDATE_EXIT=$LASTEXITCODE"
  } finally {
    if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue }
  }
}
```

macOS / Linux:

```bash
curl -fsSL --proto '=https' https://ai.simi.vn/install/codex.sh | bash -s -- --update 2>&1 | tail -n 25; echo "LTN_UPDATE_EXIT=${PIPESTATUS[1]}"
```

Không dùng `sudo` cho lệnh này. Nếu installer cần cài gói hệ thống và hỏi mật khẩu
hoặc báo thiếu Node.js/Python, báo user nhờ IT, không tự cài thêm.

## Báo kết quả cho user

- `LTN_UPDATE_EXIT=0`: báo ngắn "Đã cập nhật Simi xong", nêu số skill nếu output
  có dòng "Đã cài/cập nhật ... skill", rồi hướng dẫn: **tắt hẳn Codex (thoát cả
  biểu tượng dưới khay hệ thống/Dock) rồi mở lại, tạo chat mới**. Kết thúc lượt.
- Mã khác 0: nêu dòng lỗi chính trong output bằng lời thường (ví dụ không kết nối
  được Gateway, không tìm thấy key đã lưu), không dán toàn bộ log. Không tự chạy lại,
  không chuyển sang Install/Repair.
- Lỗi mạng hoặc sandbox chặn: xin user duyệt quyền mạng; không gọi đó là lỗi DNS.

For an ordinary user, report progress and the result in natural language. Do not
show the command, tool/function-call syntax, `<tool_call>` markup, key values or the
full installer log in the chat response.