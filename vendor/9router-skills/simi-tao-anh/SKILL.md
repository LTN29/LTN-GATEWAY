---
name: simi-tao-anh
description: Tạo hoặc chỉnh ảnh (xóa chữ, retouch, đổi màu, đổi nền, outpaint) qua Simi Gateway bằng model ảnh cùng hãng với model chat đang dùng, lưu file ảnh về máy và hiển thị trong chat. Dùng khi user yêu cầu tạo, vẽ, sửa hoặc xóa chữ trên ảnh.
---

# Simi - Tạo ảnh

Dựa trên skill `9router-image` của 9Router, chỉnh cho SIMI: mọi request đi qua
`https://ai.simi.vn/v1` bằng key đã cài, không bao giờ gọi `router.simi.vn`.
Model chat không tự vẽ ảnh; ảnh do model ảnh tạo qua Gateway, chọn model ảnh
**cùng hãng với model chat đang dùng**.

## Quy tắc nhanh (quan trọng nhất)

- Mỗi yêu cầu chỉ chạy **một khối lệnh** ở mục "Khối lệnh" (khối tự lấy key,
  chọn model, gọi Gateway, đổi model khi lỗi và lưu file). Không tự gọi
  `/models/image`, `/models/info` hay curl riêng lẻ trước đó.
- Chạy khối lệnh **ngay với quyền mạng** (xin duyệt mạng ở lần chạy đầu); không
  chạy thử trong sandbox trước.
- Khối in đúng một dòng JSON. Có `"ok":true` thì hiển thị ảnh và **kết thúc lượt**:
  không chạy lại, không tạo thêm, không thử model khác.
- Không đọc, in, hỏi hay tạo key; không dùng `OPENAI_API_KEY` hay key khác.
  Không gọi trực tiếp 9Router hoặc endpoint quản trị để né quyền Gateway.
- For an ordinary user, report progress and the saved image in natural language.
  Do not show request JSON, API calls, curl commands, tool/function-call syntax,
  `<tool_call>` markup, key values or provider parameters in the chat response.

## Chuẩn bị tham số

| Tham số | Cách điền |
|---|---|
| `Mode` | `generate` (ảnh mới) hoặc `edit` (sửa, xóa chữ, đổi màu, outpaint, ghép) |
| `Prompt` | prompt đầy đủ theo mục "Viết prompt" |
| `Src` | chỉ khi `edit`: đường dẫn ảnh gốc (ảnh user gửi, hoặc ảnh vừa tạo khi user muốn sửa tiếp) |
| `Out` | `outputs/<ten-ngan-khong-dau>.png`, tên mới cho mỗi lượt, không ghi đè ảnh cũ |
| `Size` | để trống, hoặc `1024x1024` / `1024x1536` (dọc) / `1536x1024` (ngang) theo mục đích |
| `Chat` | ID model chat của phiên (ví dụ `cx/gpt-5.5`, `ag/gemini-3-pro`, `cc/claude-opus-5-5`); không rõ thì đọc dòng `model = "..."` trong `config.toml` của Codex |
| `Want` | model ảnh user chỉ định đích danh; thường để trống |

Khối lệnh tự chọn: chat GPT (`cx/`, `gpt`, `openai/`) → model ảnh `cx/` trước;
Gemini, Claude và model khác → model Gemini image trước. Mỗi yêu cầu thử tối đa
2 model. Sửa ảnh chỉ dùng model có khả năng `edit` theo `/models/info` (model chỉ
tạo ảnh từ chữ sẽ bỏ qua ảnh gốc nên không dùng). Model lỗi phía provider bị bỏ
qua 30 phút; lỗi tài khoản/không hỗ trợ thì bỏ qua cả nhóm provider đó. Lỗi
401/403/429 dừng ngay.

## Khối lệnh

Windows (PowerShell). Chỉ thay phần tham số ở đầu; prompt đặt giữa `@'` và `'@`,
hai dấu này phải nằm riêng một dòng:

```powershell
& {
$Mode   = 'generate'
$Prompt = @'
<prompt đầy đủ>
'@
$Src    = ''
$Out    = 'outputs\<ten-file>.png'
$Size   = ''
$Chat   = '<id model chat>'
$Want   = ''

function Get-Env($n) { $v = [Environment]::GetEnvironmentVariable($n, 'Process'); if (-not $v) { $v = [Environment]::GetEnvironmentVariable($n, 'User') }; $v }
function Say($o) { $o | ConvertTo-Json -Compress }
try {
  $key = Get-Env 'LTN_TEAM_API_KEY'; if (-not $key) { $key = Get-Env 'NINEROUTER_KEY' }
  if (-not $key) { Say @{ ok = $false; error = 'missing_key' }; return }
  $base = Get-Env 'NINEROUTER_URL'; if (-not $base) { $base = 'https://ai.simi.vn' }
  $base = $base.TrimEnd('/'); if ($base -notmatch '/v1$') { $base += '/v1' }
  $hdr = @('-H', "Authorization: Bearer $key")
  $cid = Get-Env 'LTN_CLIENT_ID'; if ($cid) { $hdr += @('-H', "X-LTN-Client-ID: $cid") }
  function Get-Json($path) {
    $t = [IO.Path]::GetTempFileName()
    $c = & curl.exe -sS --max-time 30 -o $t -w '%{http_code}' @hdr "$base$path"
    $s = [IO.File]::ReadAllText($t); Remove-Item -LiteralPath $t
    if ($c -ne '200') { throw "HTTP $c $path" }
    $s | ConvertFrom-Json
  }
  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $badFile = Join-Path ([IO.Path]::GetTempPath()) 'simi-image-bad.json'
  $bad = @{}
  if (Test-Path -LiteralPath $badFile) {
    try { (Get-Content -Raw -LiteralPath $badFile | ConvertFrom-Json).PSObject.Properties | ForEach-Object { if ($now - [long]$_.Value -lt 1800) { $bad[$_.Name] = [long]$_.Value } } } catch {}
  }
  $ids = @((Get-Json '/models/image').data | ForEach-Object { $_.id })
  $cx = @($ids | Where-Object { $_ -like 'cx/*' })
  $gm = @($ids | Where-Object { $_ -match 'gemini' -and $_ -match 'image' })
  $order = if ($Chat -match '^(cx/|gpt|openai/)') { $cx + $gm } else { $gm + $cx }
  if ($Want -and ($ids -contains $Want)) { $order = @($Want) + $order }
  $order = @($order | Select-Object -Unique | Where-Object { -not $bad.ContainsKey($_) })
  if ($Mode -eq 'edit') {
    $order = @($order | Where-Object { try { @((Get-Json ('/models/info?id=' + [uri]::EscapeDataString($_))).capabilities) -contains 'edit' } catch { $false } } | Select-Object -First 2)
  }
  $dir = Split-Path -Parent $Out; if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $tried = @()
  foreach ($m in @($order | Select-Object -First 2)) {
    if ($bad.ContainsKey($m)) { continue }
    $tried += $m
    $body = @{ model = $m; prompt = $Prompt; n = 1 }
    if ($Size) { $body.size = $Size }
    if ($Mode -eq 'edit') {
      $mime = switch ([IO.Path]::GetExtension($Src).ToLower()) { '.jpg' { 'image/jpeg' } '.jpeg' { 'image/jpeg' } '.webp' { 'image/webp' } default { 'image/png' } }
      $body.image = "data:$mime;base64," + [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $Src).Path))
    }
    $req = [IO.Path]::GetTempFileName(); $res = [IO.Path]::GetTempFileName()
    [IO.File]::WriteAllText($req, ($body | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding $false))
    $code = & curl.exe -sS --max-time 170 -o $res -w '%{http_code}' @hdr -H 'Content-Type: application/json' --data-binary "@$req" "$base/images/generations"
    $txt = [IO.File]::ReadAllText($res); Remove-Item -LiteralPath $req, $res
    if ($code -eq '000') { Say @{ ok = $false; error = 'network_or_timeout'; model = $m }; return }
    if ($code -eq '200') {
      $bytes = $null
      $b64 = [regex]::Matches($txt, '"b64_json"\s*:\s*"([^"]+)"')
      if ($b64.Count) { $bytes = [Convert]::FromBase64String($b64[$b64.Count - 1].Groups[1].Value) }
      else {
        $u = [regex]::Matches($txt, '"url"\s*:\s*"(https?://[^"]+)"')
        if ($u.Count) { $f = [IO.Path]::GetTempFileName(); & curl.exe -sS --max-time 60 -o $f $u[$u.Count - 1].Groups[1].Value; $bytes = [IO.File]::ReadAllBytes($f); Remove-Item -LiteralPath $f }
      }
      if ($bytes -and $bytes.Length -gt 1000) {
        $path = $Out; if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8) { $path = [IO.Path]::ChangeExtension($Out, '.jpg') }
        $full = [IO.Path]::GetFullPath([IO.Path]::Combine((Get-Location).Path, $path))
        [IO.File]::WriteAllBytes($full, $bytes)
        Say @{ ok = $true; path = $full; model = $m }; return
      }
    }
    if (@('401', '403', '429') -contains $code) { Say @{ ok = $false; status = $code; error = $txt.Substring(0, [Math]::Min(300, $txt.Length)) }; return }
    $bad[$m] = $now
    if ($txt -match 'not supported|unsupported|account|quota|reset after') {
      $p = $m.Split('/')[0] + '/'; $ids | Where-Object { $_.StartsWith($p) } | ForEach-Object { $bad[$_] = $now }
    }
    $bad | ConvertTo-Json -Compress | Set-Content -LiteralPath $badFile
  }
  Say @{ ok = $false; error = 'no_working_model'; tried = $tried; next = $(if ($Mode -eq 'edit') { 'muse-tao-anh' } else { '' }) }
} catch { Say @{ ok = $false; error = "$($_.Exception.Message)" } }
}
```

macOS / Linux (bash + Python của Codex). Điền tham số ở dòng `MODE=...`; nếu
prompt có dấu `'` thì viết thành `'\''`:

```bash
PY="${CODEX_HOME:-$HOME/.codex}/pdf-runtime/bin/python"; [ -x "$PY" ] || PY=python3
MODE='generate' PROMPT='<prompt đầy đủ>' SRC='' OUT='outputs/<ten-file>.png' SIZE='' \
CHAT='<id model chat>' WANT='' "$PY" - <<'PY'
import base64, json, os, pathlib, re, subprocess, tempfile, time, urllib.error, urllib.parse, urllib.request
E = lambda n, d="": os.environ.get(n, d)
home = E("CODEX_HOME") or os.path.expanduser("~/.codex")
def say(o): print(json.dumps(o, ensure_ascii=False)); raise SystemExit
key = E("LTN_TEAM_API_KEY") or E("NINEROUTER_KEY")
if not key:
    try: key = subprocess.run([home + "/bin/ltn-codex-token"], capture_output=True, text=True, timeout=5).stdout.strip()
    except Exception: key = ""
if not key: say({"ok": False, "error": "missing_key"})
base = (E("NINEROUTER_URL") or "https://ai.simi.vn").rstrip("/")
base = base if base.endswith("/v1") else base + "/v1"
hdr = {"Authorization": "Bearer " + key, "User-Agent": "simi-tao-anh/1.0"}
cid = E("LTN_CLIENT_ID")
if not cid and os.path.exists(home + "/ltn-client-id"): cid = open(home + "/ltn-client-id").read().strip()
if cid: hdr["X-LTN-Client-ID"] = cid
def call(path, body=None, t=30):
    req = urllib.request.Request(base + path, data=None if body is None else json.dumps(body).encode(),
                                 headers={**hdr, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=t) as r: return r.status, r.read()
    except urllib.error.HTTPError as e: return e.code, e.read()
try:
    now = time.time(); badf = pathlib.Path(tempfile.gettempdir()) / "simi-image-bad.json"
    try: bad = {k: v for k, v in json.loads(badf.read_text()).items() if now - v < 1800}
    except Exception: bad = {}
    s, b = call("/models/image")
    if s != 200: say({"ok": False, "status": s, "error": b[:300].decode("utf-8", "replace")})
    ids = [m["id"] for m in json.loads(b)["data"]]
    cx = [i for i in ids if i.startswith("cx/")]; gm = [i for i in ids if "gemini" in i and "image" in i]
    mode, chat, want = E("MODE", "generate"), E("CHAT"), E("WANT")
    order = cx + gm if re.match(r"(cx/|gpt|openai/)", chat) else gm + cx
    if want in ids: order = [want] + order
    order = [m for i, m in enumerate(order) if m not in order[:i] and m not in bad]
    if mode == "edit":
        keep = []
        for m in order:
            s, b = call("/models/info?id=" + urllib.parse.quote(m, safe=""))
            if s == 200 and "edit" in (json.loads(b).get("capabilities") or []): keep.append(m)
            if len(keep) == 2: break
        order = keep
    out = pathlib.Path(E("OUT")); out.parent.mkdir(parents=True, exist_ok=True); tried = []
    for m in order[:2]:
        if m in bad: continue
        tried.append(m); body = {"model": m, "prompt": E("PROMPT"), "n": 1}
        if E("SIZE"): body["size"] = E("SIZE")
        if mode == "edit":
            src = pathlib.Path(E("SRC")).expanduser()
            mime = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}.get(src.suffix.lower(), "image/png")
            body["image"] = f"data:{mime};base64," + base64.b64encode(src.read_bytes()).decode()
        try: s, b = call("/images/generations", body, 170)
        except Exception: say({"ok": False, "error": "network_or_timeout", "model": m})
        t = b.decode("utf-8", "replace")
        if s == 200:
            data = None; f = re.findall(r'"b64_json"\s*:\s*"([^"]+)"', t)
            if f: data = base64.b64decode(f[-1])
            else:
                u = re.findall(r'"url"\s*:\s*"(https?://[^"]+)"', t)
                if u: data = urllib.request.urlopen(urllib.request.Request(u[-1], headers={"User-Agent": "simi-tao-anh/1.0"}), timeout=60).read()
            if data and len(data) > 1000:
                p = out.with_suffix(".jpg") if data[:2] == b"\xff\xd8" else out
                p.write_bytes(data); say({"ok": True, "path": str(p.resolve()), "model": m})
        if s in (401, 403, 429): say({"ok": False, "status": s, "error": t[:300]})
        bad[m] = now
        if re.search(r"not supported|unsupported|account|quota|reset after", t, re.I):
            pre = m.split("/")[0] + "/"
            bad.update({i: now for i in ids if i.startswith(pre)})
        badf.write_text(json.dumps(bad))
    say({"ok": False, "error": "no_working_model", "tried": tried, "next": "muse-tao-anh" if mode == "edit" else ""})
except SystemExit: raise
except Exception as exc: say({"ok": False, "error": str(exc)[:300]})
PY
```

## Đọc kết quả (một dòng JSON)

| Kết quả | Việc làm |
|---|---|
| `"ok":true` | Mở ảnh ở `path` xem nhanh, hiển thị bằng `![mô tả](<path>)`, nêu model đã dùng, hỏi user cần chỉnh gì rồi **kết thúc lượt** |
| `"next":"muse-tao-anh"` | Chưa có model sửa ảnh dùng được: chuyển ngay sang skill `muse-tao-anh` (lệnh `ltn-muse --ref "<Src>"`) với cùng prompt, đúng một lần |
| `no_working_model` khi tạo ảnh mới | Báo user các model ảnh đang lỗi phía provider, thử lại sau; dừng |
| `status` 401 | Lỗi key: báo user, không tự đổi key |
| `status` 403 | Báo tính năng chưa được mở cho tài khoản và dừng; không gọi lại, không đổi model để né quyền |
| `status` 429 | Hết lượt/quá tải: báo user thử lại sau; dừng |
| `missing_key` | Báo user chạy installer, chọn Update/Repair |
| `network_or_timeout` hoặc lỗi mạng | Xem mục "Lỗi mạng và quyền" |

User chat bằng `muse2api/*` hoặc nhắc "Muse" thì dùng thẳng skill
`muse-tao-anh`, không chạy khối lệnh này.

## Viết prompt

Ảnh mới: chủ thể và hành động; bố cục, khung hình; chi tiết bắt buộc; phong cách,
ánh sáng; điều cần tránh; tỉ lệ. Chữ trong ảnh ngắn và chính xác. Tỉ lệ theo mục
đích: vuông cho bài đăng, dọc cho story/poster, ngang cho banner/slide; tôn trọng
kích thước user nêu.

Sửa ảnh: luôn dùng ảnh user gửi hoặc ảnh vừa tạo làm `Src`, không âm thầm tạo ảnh
mới thay thế. Prompt ghi rõ phần cần đổi và phần **giữ nguyên** (chủ thể, khuôn
mặt, logo, chữ không yêu cầu xóa, hình dạng sản phẩm, bố cục, ánh sáng, góc máy,
phong cách). Xóa chữ: nêu vùng/chữ cần xóa và yêu cầu lấp nền tự nhiên. Outpaint:
nêu hướng mở rộng và nội dung vùng mới.

Ảnh kết quả không giữ y hệt ảnh gốc thì nói rõ với user, không tự chạy lại. Không
gọi ảnh tạo ra là ảnh thật, tài sản thương hiệu chính thức hay tài liệu đã xác minh.

## Lỗi mạng và quyền

If network access needs approval or is sandbox-blocked, ask the user to approve
internet access for this request. Do not tell the user to run Repair for that case
and do not call it a DNS error. Report DNS only when name resolution itself failed
in the returned error. Repair is appropriate only when the installer-managed
credential or installed skill/runtime is missing.

Mỗi ảnh mất khoảng 15–60 giây và tốn quota. Không retry khi chưa biết lần trước
đã tạo job hay chưa. Không tạo nhiều ảnh nếu user không yêu cầu.