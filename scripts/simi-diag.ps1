# Chẩn đoán SIMI trên máy server (chỉ ĐỌC, không sửa gì). Chạy trong PowerShell (Administrator):
#   $env:SIMI_TEST_KEY = "<key test>"      # key tài khoản test, không dùng key admin
#   powershell -ExecutionPolicy Bypass -File .\simi-diag.ps1
# Kết quả ghi ra file simi-diag-<ngày-giờ>.txt cạnh script; key, token, email đều được che bằng ***.
param(
  [string]$Gateway = 'https://ai.simi.vn',
  [string]$Router = 'http://127.0.0.1:20128',
  [string]$ClaudeModel = 'cc/claude-sonnet-5-5',
  [string]$GptModel = 'cx/gpt-6.1-sol',
  [string]$GatewayDir = 'D:\LTN-GATEWAY'
)
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$key = $env:SIMI_TEST_KEY
if (-not $key) { Write-Host 'Thiếu $env:SIMI_TEST_KEY – đặt key test trước rồi chạy lại.'; exit 1 }
$out = Join-Path $PSScriptRoot ("simi-diag-" + (Get-Date -Format 'yyyyMMdd-HHmm') + ".txt")
$tmp = Join-Path $env:TEMP 'simi-diag'; New-Item -ItemType Directory -Force -Path $tmp | Out-Null

function Mask([string]$s) {
  if ($null -eq $s) { return '' }
  $s = $s.Replace($key, '***')
  $s = [regex]::Replace($s, '(?i)(bearer\s+)[A-Za-z0-9._\-]{8,}', '$1***')
  $s = [regex]::Replace($s, '[\w.+\-]+@[\w\-]+\.[\w.\-]+', '***@***')
  $s = [regex]::Replace($s, '(?i)\b(sk|key|tok|token|pat|ghp)[-_][A-Za-z0-9]{12,}', '$1-***')
  $s = [regex]::Replace($s, '"b64_json"\s*:\s*"[^"]{40,}"', '"b64_json":"(ảnh)"')
  return $s
}
function W([string]$s) { $m = Mask $s; Add-Content -Path $out -Value $m -Encoding UTF8; Write-Host $m }
function H([string]$s) { W ''; W ('==== ' + $s + ' ====') }

# gọi HTTP bằng curl.exe: trả status, thời gian byte đầu, tổng thời gian, dung lượng, nội dung
function Call([string]$method, [string]$url, $body, [int]$timeout = 180) {
  $res = Join-Path $tmp 'res.txt'; $req = Join-Path $tmp 'req.json'
  $cargs = @('-sS', '-o', $res, '-w', '%{http_code} %{time_starttransfer} %{time_total} %{size_download}', '--max-time', "$timeout",
    '-H', "Authorization: Bearer $key", '-H', 'X-LTN-Client-ID: simi-diag-0001', '-X', $method)
  if ($null -ne $body) {
    [IO.File]::WriteAllText($req, ($body | ConvertTo-Json -Depth 10 -Compress), [Text.UTF8Encoding]::new($false))
    $cargs += @('-H', 'Content-Type: application/json', '--data-binary', "@$req")
  }
  $meta = (& curl.exe @cargs $url 2>&1) -join ' '
  $text = if (Test-Path $res) { [IO.File]::ReadAllText($res) } else { '' }
  $p = $meta.Trim().Split(' ')
  return [pscustomobject]@{ status = $p[0]; ttfb = $p[1]; total = $p[2]; bytes = $p[3]; text = $text; raw = $meta }
}

W ("SIMI chẩn đoán – " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz') + " – máy " + $env:COMPUTERNAME)

H '1. Gateway'
try { $svc = Get-Service LTNGateway -ErrorAction Stop; W ("Dịch vụ LTNGateway: " + $svc.Status) } catch { W 'Không thấy dịch vụ LTNGateway' }
if (Test-Path $GatewayDir) {
  Push-Location $GatewayDir
  W ((git log --oneline -3) -join ' | ')
  W ("git status: " + ((git status --short) -join ' ; '))
  Pop-Location
}
$h = Call 'GET' "$Gateway/health" $null 20; W ("/health: " + $h.status + " ttfb " + $h.ttfb + "s")

H '2. Docker'
W ((docker ps --format '{{.Names}} | {{.Image}} | {{.Status}} | {{.Ports}}') -join "`n")
W ((docker stats --no-stream --format '{{.Name}} CPU {{.CPUPerc}} RAM {{.MemUsage}}') -join "`n")
$patterns = [ordered]@{ '429/rate limit' = '429|rate.?limit|too many'; 'timeout' = 'timeout|timed out|ETIMEDOUT'; '5xx' = '\b5\d\d\b'; 'fallback' = 'fallback|retry|switch'; 'translate' = 'translat|convert'; 'cache' = 'cache'; 'image' = 'image'; 'search/fetch' = 'search|fetch' }
foreach ($name in @(docker ps --format '{{.Names}}' | Where-Object { $_ -match '9router|muse' })) {
  W ''; W ("-- log 24h: " + $name)
  $log = @(docker logs --since 24h $name 2>&1 | ForEach-Object { "$_" })
  W ("số dòng: " + $log.Count)
  foreach ($k in $patterns.Keys) { W ("  " + $k + ": " + @($log | Where-Object { $_ -match $patterns[$k] }).Count) }
  $err = @($log | Where-Object { $_ -match '(?i)error|fail|429|timeout|\b5\d\d\b' })
  W ("  dòng lỗi: " + $err.Count + " – 20 dòng cuối:")
  $err | Select-Object -Last 20 | ForEach-Object { W ("    " + $_.Substring(0, [Math]::Min(300, $_.Length))) }
}

H '3. Tốc độ: qua Gateway và thẳng 9Router (yêu cầu nhỏ, không stream)'
foreach ($m in @($ClaudeModel, $GptModel)) {
  foreach ($target in @(@{ n = 'Gateway'; u = "$Gateway/v1/responses" }, @{ n = '9Router'; u = "$Router/v1/responses" })) {
    $runs = @()
    for ($i = 1; $i -le 3; $i++) {
      $r = Call 'POST' $target.u @{ model = $m; input = 'Trả lời đúng 1 chữ: OK'; stream = $false; max_output_tokens = 32 } 120
      $runs += ("{0} byte-đầu {1}s tổng {2}s" -f $r.status, $r.ttfb, $r.total)
      if ($r.status -ne '200' -and $i -eq 1) { W ("  lỗi " + $m + " " + $target.n + ": " + $r.text.Substring(0, [Math]::Min(300, $r.text.Length))) }
    }
    W ("{0,-24} {1,-8} {2}" -f $m, $target.n, ($runs -join ' | '))
  }
}

H '4. Cache prompt (2 lần cùng yêu cầu dài, cùng prompt_cache_key)'
$long = ((1..700) | ForEach-Object { "Quy định nội bộ số $_ của công ty SIMI về quy trình bán hàng và chăm sóc khách hàng." }) -join "`n"
foreach ($m in @($ClaudeModel, $GptModel)) {
  foreach ($target in @(@{ n = 'Gateway'; u = "$Gateway/v1/responses" }, @{ n = '9Router'; u = "$Router/v1/responses" })) {
    $ck = 'simi-diag-cache-' + ($m -replace '\W', '') + '-' + $target.n + '-' + (Get-Date -Format 'HHmmss')
    $usage = @()
    for ($i = 1; $i -le 2; $i++) {
      $r = Call 'POST' $target.u @{ model = $m; instructions = $long; input = "Trả lời đúng 1 chữ: OK (lần $i)"; stream = $false; max_output_tokens = 32; prompt_cache_key = $ck } 180
      $u = $null; try { $u = ($r.text | ConvertFrom-Json).usage } catch {}
      $cached = if ($u) { @($u.input_tokens_details.cached_tokens, $u.cache_read_input_tokens, $u.prompt_tokens_details.cached_tokens) | Where-Object { $_ -ne $null } | Select-Object -First 1 } else { $null }
      $usage += ("lần {0}: {1} tổng {2}s input {3} cached {4}" -f $i, $r.status, $r.total, $(if ($u) { $u.input_tokens } else { '?' }), $(if ($null -ne $cached) { $cached } else { 'không có trường' }))
      Start-Sleep -Seconds 2
    }
    W ("{0,-24} {1,-8} {2}" -f $m, $target.n, ($usage -join ' | '))
  }
}

H '5. Công cụ qua Gateway: tìm web, đọc web, tạo ảnh'
$web = Call 'GET' "$Gateway/v1/models/web" $null 30
W ("/v1/models/web: " + $web.status + " " + $web.total + "s")
$items = @(); try { $items = @(($web.text | ConvertFrom-Json).data) } catch {}
W ("  " + (($items | ForEach-Object { $_.id + '(' + $_.kind + ')' }) -join ', '))
$searchModel = ($items | Where-Object { "$($_.kind) $($_.id)" -match 'search' } | Select-Object -First 1).id
$fetchModel = ($items | Where-Object { "$($_.kind) $($_.id)" -match 'fetch' } | Select-Object -First 1).id
if ($searchModel) { $r = Call 'POST' "$Gateway/v1/search" @{ model = $searchModel; query = 'giá vàng hôm nay'; max_results = 3 } 60; W ("/v1/search (" + $searchModel + "): " + $r.status + " " + $r.total + "s " + $r.text.Substring(0, [Math]::Min(300, $r.text.Length))) }
if ($fetchModel) { $r = Call 'POST' "$Gateway/v1/web/fetch" @{ model = $fetchModel; url = 'https://vnexpress.net'; max_characters = 2000 } 60; W ("/v1/web/fetch (" + $fetchModel + "): " + $r.status + " " + $r.total + "s " + $r.text.Substring(0, [Math]::Min(300, $r.text.Length))) }
$img = Call 'GET' "$Gateway/v1/models/image" $null 30
$imgIds = @(); try { $imgIds = @(($img.text | ConvertFrom-Json).data | ForEach-Object { $_.id }) } catch {}
W ("/v1/models/image: " + $img.status + " – " + ($imgIds -join ', '))
foreach ($im in ($imgIds | Select-Object -First 3)) {
  $r = Call 'POST' "$Gateway/v1/images/generations" @{ model = $im; prompt = 'quả táo đỏ trên nền trắng'; n = 1 } 180
  $len = 0; try { $d = ($r.text | ConvertFrom-Json).data[0]; $len = "$($d.b64_json)$($d.url)".Length } catch {}
  W ("  ảnh " + $im + ": " + $r.status + " " + $r.total + "s, dữ liệu " + $len + " ký tự" + $(if ($r.status -ne '200') { " – " + $r.text.Substring(0, [Math]::Min(300, $r.text.Length)) } else { '' }))
}

W ''; W ("Xong. Báo cáo: " + $out)
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
