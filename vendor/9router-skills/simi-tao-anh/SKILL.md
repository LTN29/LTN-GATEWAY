---
name: simi-tao-anh
description: Tạo hoặc chỉnh ảnh (xóa chữ, retouch, đổi màu, đổi nền, outpaint) qua Simi Gateway bằng model ảnh tốt nhất đang có, hoặc tự thiết kế ảnh có chữ (poster, banner, bài đăng, thumbnail, infographic) bằng HTML rồi xuất qua design_render; lưu file ảnh về máy và hiển thị trong chat. Dùng khi user yêu cầu tạo, vẽ, thiết kế, sửa hoặc xóa chữ trên ảnh.
---

# Simi - Tạo ảnh

## Ảnh có chữ / thiết kế: tự thiết kế rồi `design_render` (kiểu Claude Desktop)

- Poster, banner, bài đăng MXH, thumbnail, infographic, thiệp, menu, chứng nhận,
  logo chữ, ảnh quảng cáo… mà phiên có công cụ **`design_render`** (Văn Phòng AI,
  server `vp_browser`) → tự viết 1 trang HTML / CSS / SVG đúng khổ ảnh rồi gọi
  `design_render` (`html`, `path` = `<thư mục làm việc>/outputs/<ten>.png|.jpg|.pdf`,
  `width`, `height`). Chữ tiếng Việt đúng 100 %, nét gấp 2, đúng màu thương hiệu –
  model tạo ảnh hay viết sai / méo chữ.
- **Đang dùng model Claude: đây là cách mặc định để "tạo ảnh"** (Claude không có
  model ảnh riêng; ảnh đẹp của Claude Desktop là ảnh tự thiết kế bằng code).
- Làm đẹp: 1 ý chính + 1 điểm nhấn lớn, lưới căn lề, tối đa 2 font Google có tiếng
  Việt (Be Vietnam Pro, Montserrat, Inter, Lexend, Playfair Display…), 3–5 màu,
  trang trí bằng SVG / gradient / hình khối tự vẽ.
- Cần ảnh chụp / tranh chân thực (người, sản phẩm, phong cảnh): `image_generate`
  tạo phần ảnh **không chữ** → đặt làm nền / khung trong HTML → phủ chữ bằng
  `design_render`.
- Xuất xong **nhìn ảnh xem trước + đọc cảnh báo** (chữ tràn, bị cắt, bị khối khác
  đè) → sửa → xuất lại cùng `path`, tối đa 3 vòng.

## Chọn đúng công cụ ngay từ đầu (không thử cách khác trước)

| Yêu cầu | Công cụ |
|---|---|
| Đổi màu chữ / logo, xoá nền logo / chữ ký / con dấu / sản phẩm trên nền trơn, làm nét, cắt, xoay, chỉnh sáng, xoá chữ trên nền phẳng, chèn logo | `image_retouch` – 1 lần gọi, vài giây |
| Đổi nền thành cảnh khác, thêm / bớt vật thể, tách nền ảnh chụp người / vật trên nền phức tạp, đổi phong cách, ghép nhiều ảnh | `image_generate` mode `edit` (tách nền: `transparent_background: true`) |
| Poster, banner, bài đăng, ảnh có chữ tiếng Việt | tự thiết kế HTML → `design_render` |
| Ảnh chụp / tranh mới | `image_generate` |

Không tự viết script Python / Node / PowerShell để xử lý ảnh khi đã có các công cụ trên.
Logo chữ đen nền màu → chữ trắng nền trong suốt:
`ops: [{op:"transparent", mode:"all"}, {op:"recolor", to:"#ffffff"}]`, `output_path` đuôi `.png`.

## Chỉnh ảnh có sẵn: dùng `image_retouch` trước (nhanh, giữ đúng chi tiết)

- Làm nét, phóng to, chỉnh sáng / màu, khử nhiễu, cắt, xoay, xoá chữ / vết, viết lại
  chữ hoặc logo bị mờ, che / làm mờ vùng, chèn logo → **`simi_browser.image_retouch`**
  (chạy Pillow trên máy, vài giây, giữ nguyên mọi chi tiết khác của ảnh gốc).
- Cách làm: `inspect:true` lấy kích thước → nhìn ảnh, ước lượng `box` theo tỉ lệ 0–1 →
  gọi `ops` (vd chữ mờ: `erase` vùng chữ → `text` đúng chữ, màu, đậm → `sharpen`) →
  xem ảnh kết quả, chưa khớp thì chỉnh box / màu, gọi lại tối đa 2 lần.
- Model tạo ảnh (`image_generate` mode `edit`) vẽ lại cả ảnh nên chậm và dễ sai chi tiết;
  chỉ dùng khi cần vẽ nội dung mới (đổi bối cảnh, thêm / bớt vật thể, đổi phong cách).

## Cách gọi: ưu tiên công cụ `image_generate`

- **Luôn dùng công cụ MCP `simi_browser.image_generate`** nếu có trong phiên:
  `prompt` (viết theo mục "Viết prompt"), `output_path` (đường dẫn tuyệt đối
  `<thư mục làm việc>/outputs/<ten-ngan-khong-dau>.png`), `mode` = `generate` /
  `edit`, `source_path` khi sửa ảnh, `size` nếu cần, `chat_model` = model chat
  đang dùng. Công cụ tự chọn model ảnh **theo model chat người dùng đang chọn**
  (GPT → gpt-image, Gemini → Gemini/Imagen; Claude và model khác → model ảnh tốt
  nhất), tự dự phòng, lưu file – không cần quyền mạng của sandbox.
- Công cụ mặc định tạo ảnh **chất lượng cao** (`quality` bỏ trống). Chỉ đặt
  `quality: "medium"` khi người dùng cần bản nháp / cần gấp.
- Sửa ảnh: bỏ trống `size` – công cụ tự lấy khổ theo tỉ lệ ảnh gốc và yêu cầu model
  giữ đúng chi tiết ảnh gốc (mặt người, logo, chữ). Chỉ điền `size` khi người dùng
  muốn đổi khổ.
- Ghép / giữ đúng sản phẩm, logo, người mẫu: đưa thêm ảnh tham chiếu qua `ref_paths`
  (tối đa 3 ảnh) và ghi trong prompt mỗi ảnh dùng làm gì.
- **Không bao giờ tự dùng Muse** (`muse_image`, skill `muse-tao-anh`): chỉ khi người
  dùng chọn skill Muse hoặc ghi đích danh "Muse". Ảnh lỗi thì báo người dùng, không chuyển sang Muse.
- Gọi **một lần** cho mỗi yêu cầu. Kết quả `ok:true` → hiển thị ảnh bằng giá trị
  `show` (`![](đường dẫn)`) và kết thúc lượt. `next:"muse_image"` → chuyển sang
  công cụ `muse_image` với ảnh gốc làm `refs`, đúng một lần (công cụ chỉ trả `next` này khi người dùng đã chọn Muse).
- Chỉ khi phiên KHÔNG có công cụ `image_generate` mới dùng "Khối lệnh" bên dưới.

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

Công cụ `image_generate` lấy model ảnh cùng hãng với model chat đang chọn trước,
rồi mới tới model ảnh tốt nhất khác (bản mới / pro trước, bản mini / miễn phí sau),
không bao giờ tự dùng Muse. Khối lệnh dự phòng: chat GPT (`cx/`,
`gpt`, `openai/`) →
model ảnh `cx/` trước; Gemini, Claude và model khác → model Gemini image trước. Mỗi yêu cầu thử tối đa
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
| `"ok":true` | Hiển thị ảnh bằng `![mô tả](<path>)` (hoặc giá trị `show`), viết **1–2 câu** (đã làm gì; sửa ảnh thì nêu điểm khác ảnh gốc nếu có) rồi **kết thúc lượt**. Không kể prompt, model, tham số, từng bước đã làm |
| `"next":"muse-tao-anh"` | Chưa có model sửa ảnh dùng được: chuyển ngay sang skill `muse-tao-anh` (lệnh `ltn-muse --ref "<Src>"`) với cùng prompt, đúng một lần |
| `no_working_model` khi tạo ảnh mới | Báo user các model ảnh đang lỗi phía provider, thử lại sau; dừng |
| `status` 401 | Lỗi key: báo user, không tự đổi key |
| `status` 403 | Báo tính năng chưa được mở cho tài khoản và dừng; không gọi lại, không đổi model để né quyền |
| `status` 429 | Hết lượt/quá tải: báo user thử lại sau; dừng |
| `missing_key` | Báo user chạy installer, chọn Update/Repair |
| `network_or_timeout` hoặc lỗi mạng | Xem mục "Lỗi mạng và quyền" |

User chat bằng `muse2api/*` hoặc nhắc "Muse" thì dùng thẳng skill
`muse-tao-anh`, không chạy khối lệnh này.

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

## Viết prompt

Prompt quyết định ảnh đẹp hay xấu – không chuyển nguyên câu ngắn của user.
Viết prompt **bằng tiếng Anh**, 60–150 từ, đủ các ý:

1. Chủ thể + hành động, chi tiết bắt buộc (sản phẩm, người, số lượng, trang phục).
2. Bối cảnh, bố cục, góc máy / khung hình (close-up, wide shot, top-down…).
3. Phong cách rõ ràng: professional product photo / cinematic photo / flat vector
   illustration / 3D render / watercolor…; hợp mục đích (quảng cáo, mạng xã hội, in ấn).
4. Ánh sáng, bảng màu, chất liệu; thêm `high detail, sharp focus`.
5. Chữ trong ảnh: giữ nguyên tiếng Việt có dấu, đặt trong ngoặc kép, tối đa vài
   từ (ví dụ `headline text "Khai trương"`); nội dung dài để ngoài ảnh.
6. Điều cần tránh (no watermark, no extra text, no distorted hands…).

Tỉ lệ (`size`) theo mục đích: vuông cho bài đăng, dọc cho story/poster, ngang cho
banner/slide; tôn trọng kích thước user nêu. User đưa yêu cầu quá chung chung
("vẽ ảnh đẹp về Tết") thì tự bổ sung chi tiết hợp lý, không hỏi lại.

Sửa ảnh: luôn dùng ảnh user gửi hoặc ảnh vừa tạo làm `Src`, không âm thầm tạo ảnh
mới thay thế. Prompt ghi rõ phần cần đổi và phần **giữ nguyên** (chủ thể, khuôn
mặt, logo, chữ không yêu cầu xóa, hình dạng sản phẩm, bố cục, ánh sáng, góc máy,
phong cách). Xóa chữ: nêu vùng/chữ cần xóa và yêu cầu lấp nền tự nhiên. Outpaint:
nêu hướng mở rộng và nội dung vùng mới.

Ảnh bán hàng / ảnh có sản phẩm thật, logo, bao bì phải giữ ĐÚNG từng chi tiết: model
ảnh vẽ lại cả khung nên dễ biến sản phẩm thành mẫu khác. Làm theo thứ tự: (1) đổi nền
/ bối cảnh mà sản phẩm đứng yên → `image_generate` mode `edit` với ảnh gốc, prompt ghi
"keep the product exactly as in the source image: same shape, parts, colors, logo text";
(2) cần người / phòng mới hoàn toàn → tạo ảnh nền không có sản phẩm, rồi ghép sản phẩm
cắt từ ảnh gốc bằng `image_retouch` / `design_render` (sản phẩm là ảnh thật 100 %).
Kết quả sai sản phẩm thì nói ngắn 1–2 câu và làm luôn cách (2), không viết báo cáo dài.

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