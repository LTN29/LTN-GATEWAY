[CmdletBinding()]
param(
  [string]$GatewayBaseUrl = $(if ($env:LTN_GATEWAY_BASE_URL) { $env:LTN_GATEWAY_BASE_URL } else { "https://ai.simi.vn/v1" }),
  [ValidateSet("install", "repair", "status", "uninstall", "auto", "profiles")]
  [string]$Mode,
  [string]$TeamApiKey,
  [switch]$SkipCodexInstall,
  [switch]$Uninstall
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Get-ConfiguredValue {
  param([string]$Name, [string]$Fallback)

  $value = [Environment]::GetEnvironmentVariable($Name, "Process")
  if ([string]::IsNullOrWhiteSpace($value)) {
    $value = [Environment]::GetEnvironmentVariable($Name, "User")
  }
  if ([string]::IsNullOrWhiteSpace($value)) { return $Fallback }
  return $value.Trim()
}

function Escape-TomlString {
  param([string]$Value)
  return $Value.Replace('\', '\\').Replace('"', '\"')
}

function Get-ObjectPropertyValue {
  param(
    [object]$Object,
    [string]$Name
  )

  if ($null -eq $Object) { return $null }
  $property = $Object.PSObject.Properties[$Name]
  if ($null -eq $property) { return $null }
  return $property.Value
}

function Confirm-ComboIdSyntax {
  param(
    [AllowNull()]
    [string]$ComboId,
    [string]$Name
  )

  if ([string]::IsNullOrWhiteSpace($ComboId)) {
    throw "Thiếu Combo ID cho '$Name'. Admin cần cấu hình biến CODEX_COMBO_* tương ứng trên Gateway."
  }

  $trimmed = $ComboId.Trim()
  if ([string]::IsNullOrWhiteSpace($trimmed)) {
    throw "Thiếu Combo ID cho '$Name'. Admin cần cấu hình biến CODEX_COMBO_* tương ứng trên Gateway."
  }
  if ($trimmed.Length -gt 200) {
    throw "Combo ID cho '$Name' quá dài. Độ dài tối đa là 200 ký tự."
  }
  if ($trimmed -match '[\r\n]') {
    throw "Combo ID cho '$Name' không được chứa CR hoặc LF."
  }
  if ($trimmed -match '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]') {
    throw "Combo ID cho '$Name' không được chứa ký tự điều khiển."
  }

  return $trimmed
}

function Confirm-TeamApiKey {
  param([AllowNull()][string]$ApiKey)

  if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    throw "API key của team không được để trống."
  }

  # Clipboard input can include a trailing CR/LF. Trim it before constructing
  # the Authorization header, then reject any control character left inside.
  $trimmed = $ApiKey.Trim()
  if ([string]::IsNullOrWhiteSpace($trimmed)) {
    throw "API key của team không được để trống."
  }
  if ($trimmed.Length -gt 4096) {
    throw "API key của team quá dài."
  }
  if ($trimmed -match '[\x00-\x1F\x7F]') {
    throw "API key của team chứa ký tự điều khiển không hợp lệ. Hãy sao chép lại key trên một dòng."
  }

  return $trimmed
}

function Read-TeamApiKey {
  Write-Host "Chọn cách nhập API key:"
  Write-Host "  1. Lấy từ Clipboard (khuyến nghị)"
  Write-Host "  2. Gõ tay, ký tự được ẩn"
  $inputMode = Read-Host "Nhập 1-2, mặc định 1"
  if ([string]::IsNullOrWhiteSpace($inputMode)) { $inputMode = "1" }

  if ($inputMode -eq "1") {
    try {
      $clipboardKey = Get-Clipboard -Raw -ErrorAction Stop
    } catch {
      throw "Không đọc được Clipboard. Hãy chạy lại, chọn cách 2 và gõ API key. Chi tiết: $($_.Exception.Message)"
    }
    if ([string]::IsNullOrWhiteSpace([string]$clipboardKey)) {
      throw "Clipboard không có API key. Hãy sao chép key trước rồi chạy lại installer."
    }
    Write-Host "Đã nhận API key từ Clipboard."
    return [string]$clipboardKey
  }

  if ($inputMode -ne "2") {
    throw "Lựa chọn không hợp lệ. Chỉ nhập 1 hoặc 2."
  }

  $secureKey = Read-Host "Gõ API key của team" -AsSecureString
  $keyPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPtr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPtr)
  }
}

function Get-StoredTeamApiKey {
  $value = [Environment]::GetEnvironmentVariable("LTN_TEAM_API_KEY", "Process")
  if ([string]::IsNullOrWhiteSpace($value)) {
    $value = [Environment]::GetEnvironmentVariable("LTN_TEAM_API_KEY", "User")
  }
  if ([string]::IsNullOrWhiteSpace($value)) { return $null }
  return [string]$value
}

function Confirm-ClientId {
  param([AllowNull()][string]$ClientId)

  if ([string]::IsNullOrWhiteSpace($ClientId)) { return $null }
  $trimmed = $ClientId.Trim()
  if ($trimmed.Length -gt 100 -or $trimmed -match '[\r\n]') { return $null }
  if ($trimmed -notmatch '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$') {
    return $null
  }
  return $trimmed.ToLowerInvariant()
}

function Get-OrCreateClientId {
  $clientId = Confirm-ClientId ([Environment]::GetEnvironmentVariable("LTN_CLIENT_ID", "User"))
  if (-not $clientId) {
    $clientId = Confirm-ClientId ([Environment]::GetEnvironmentVariable("LTN_CLIENT_ID", "Process"))
  }
  if (-not $clientId) {
    $clientId = [guid]::NewGuid().ToString()
  }
  return $clientId
}

function Update-CodexConfig {
  param(
    [string]$ExistingContent,
    [string]$ManagedRootContent,
    [string]$ManagedTableContent
  )

  $lines = @($ExistingContent -split "\r?\n")
  $rootLines = [System.Collections.Generic.List[string]]::new()
  $tableLines = [System.Collections.Generic.List[string]]::new()
  $insideManagedBlock = $false
  $insideManagedTable = $false
  $section = "root"

  foreach ($line in $lines) {
    if ($line -match '^\s*# BEGIN LTN CODEX MANAGED(?: ROOT| TABLES)?\s*$') {
      $insideManagedBlock = $true
      continue
    }
    if ($line -match '^\s*# END LTN CODEX MANAGED(?: ROOT| TABLES)?\s*$') {
      $insideManagedBlock = $false
      continue
    }
    if ($insideManagedBlock) { continue }

    if ($insideManagedTable) {
      if ($line -match '^\s*\[') {
        $insideManagedTable = $false
      } else {
        continue
      }
    }

    if ($line -match '^\s*\[(?:model_providers\.ltn_gateway(?:\.auth)?|mcp_servers\.simi_browser)\]\s*$') {
      $insideManagedTable = $true
      $section = "tables"
      continue
    }

    if ($line -match '^\s*\[') { $section = "tables" }
    if ($section -eq "root" -and $line -match '^\s*model\s*=') { continue }
    if ($section -eq "root" -and $line -match '^\s*model_provider\s*=') { continue }
    if ($line -match '^\s*# Managed by LTN Codex installer\.\s*$') { continue }
    if ($line -match '^\s*# Change Combo members and fallback order in 9Router, not on this machine\.\s*$') { continue }

    if ($section -eq "root") { $rootLines.Add($line) }
    else { $tableLines.Add($line) }
  }

  $parts = [System.Collections.Generic.List[string]]::new()
  if (-not [string]::IsNullOrWhiteSpace($ManagedRootContent)) { $parts.Add($ManagedRootContent.Trim()) }
  $preservedRoot = ($rootLines -join [Environment]::NewLine).Trim()
  if ($preservedRoot) { $parts.Add($preservedRoot) }
  $preservedTables = ($tableLines -join [Environment]::NewLine).Trim()
  if ($preservedTables) { $parts.Add($preservedTables) }
  # Append managed child tables after user tables. TOML permits a child table
  # after its parent, but defining a parent after an already-created child can
  # fail with "Cannot declare ... twice" on otherwise valid Codex configs.
  if (-not [string]::IsNullOrWhiteSpace($ManagedTableContent)) { $parts.Add($ManagedTableContent.Trim()) }
  if ($parts.Count -eq 0) { return "" }
  return ($parts -join ([Environment]::NewLine + [Environment]::NewLine)) + [Environment]::NewLine
}

function Test-ComboIds {
  param(
    [object[]]$Models,
    [string[]]$RequiredIds
  )

  $missing = [System.Collections.Generic.List[string]]::new()
  foreach ($comboId in $RequiredIds) {
    $matches = @($Models | Where-Object {
      (Get-ObjectPropertyValue -Object $_ -Name "id") -eq $comboId
    })
    if ($matches.Count -eq 0) {
      $missing.Add($comboId)
      continue
    }

    $ownedByValues = @($matches | ForEach-Object {
      Get-ObjectPropertyValue -Object $_ -Name "owned_by"
    } | Where-Object { $_ })
    $invalidOwnedByValues = @($ownedByValues | Where-Object { $_ -ne "combo" })
    if ($invalidOwnedByValues.Count -gt 0) {
      throw "Model '$comboId' tồn tại nhưng owned_by không phải 'combo'. Hãy kiểm tra lại trên 9Router Dashboard -> Combos."
    }
    if ($ownedByValues.Count -eq 0) {
      Write-Warning "Model '$comboId' tồn tại trong GET /v1/models nhưng không có owned_by. Tạm chấp nhận vì 9Router đã trả về đúng ID."
    }
  }

  return $missing.ToArray()
}

function Read-InstallerMode {
  while ($true) {
    Write-Host "Chọn chế độ:"
    Write-Host "  1. Install/Update"
    Write-Host "  2. Repair"
    Write-Host "  3. Status"
    Write-Host "  4. Uninstall"
    $choice = (Read-Host "Nhập 1-4").Trim()
    switch ($choice) {
      "1" { return "install" }
      "2" { return "repair" }
      "3" { return "status" }
      "4" { return "uninstall" }
      default { Write-Host "Lựa chọn không hợp lệ. Vui lòng nhập 1, 2, 3 hoặc 4." }
    }
  }
}

function Get-CodexCommandStatus {
  $command = Get-Command codex -ErrorAction SilentlyContinue
  if (-not $command) {
    return [pscustomobject]@{
      Found = $false
      Path = $null
      Healthy = $false
      Version = $null
      Reason = "Không tìm thấy lệnh codex trong PATH."
    }
  }

  try {
    $output = & $command.Source --version 2>&1
    if ($LASTEXITCODE -eq 0) {
      return [pscustomobject]@{
        Found = $true
        Path = $command.Source
        Healthy = $true
        Version = (($output | Out-String).Trim())
        Reason = $null
      }
    }

    return [pscustomobject]@{
      Found = $true
      Path = $command.Source
      Healthy = $false
      Version = $null
      Reason = "codex --version trả exit code $LASTEXITCODE."
    }
  } catch {
    return [pscustomobject]@{
      Found = $true
      Path = $command.Source
      Healthy = $false
      Version = $null
      Reason = $_.Exception.Message
    }
  }
}

function Install-OfficialCodexCli {
  $installerUri = [Uri]"https://chatgpt.com/codex/install.ps1"
  if ($installerUri.Scheme -ne "https" -or $installerUri.Host -ne "chatgpt.com") {
    throw "URL cài Codex CLI chính thức không hợp lệ."
  }

  Write-Host "Đang cài Codex CLI standalone chính thức từ OpenAI..."
  $previousNonInteractive = $env:CODEX_NON_INTERACTIVE
  try {
    $env:CODEX_NON_INTERACTIVE = "1"
    $officialInstaller = Invoke-RestMethod `
      -Method Get `
      -Uri $installerUri.AbsoluteUri
    if ([string]::IsNullOrWhiteSpace([string]$officialInstaller)) {
      throw "Installer Codex CLI chính thức trả về nội dung rỗng."
    }
    Invoke-Expression ([string]$officialInstaller)
  } finally {
    if ($null -eq $previousNonInteractive) {
      Remove-Item Env:CODEX_NON_INTERACTIVE -ErrorAction SilentlyContinue
    } else {
      $env:CODEX_NON_INTERACTIVE = $previousNonInteractive
    }
  }

  $status = Get-CodexCommandStatus
  if (-not $status.Healthy) {
    throw "Không thể xác minh Codex CLI sau khi cài: $($status.Reason)"
  }
}

function Test-GatewayHealth {
  param([string]$BaseUrl)

  try {
    $healthUrl = $BaseUrl.TrimEnd("/") -replace "/v1$", "/health"
    Invoke-RestMethod -Method Get -Uri $healthUrl -TimeoutSec 8 | Out-Null
    return "OK ($healthUrl)"
  } catch {
    return "Không kiểm tra được ($($_.Exception.Message))"
  }
}

function Install-Managed9RouterSkills {
  param(
    [string]$CodexHome,
    [string]$GatewayBaseUrl
  )

  $skillNames = @(
    "simi",
    "simi-tro-chuyen",
    "simi-tao-anh",
    "simi-tao-video",
    "simi-doc-van-ban",
    "simi-chep-loi",
    "simi-vector",
    "simi-tim-kiem-web",
    "simi-doc-trang-web",
    "simi-trinh-duyet",
    "simi-doc-pdf",
    "simi-cai-dat"
  )
  $gatewayRoot = $GatewayBaseUrl -replace '/v1$', ''
  $skillsRoot = Join-Path $CodexHome "skills"
  New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null

  foreach ($skillName in $skillNames) {
    $skillDir = Join-Path $skillsRoot $skillName
    $skillPath = Join-Path $skillDir "SKILL.md"
    $tempPath = Join-Path $skillDir ("SKILL.md.{0}.tmp" -f [Guid]::NewGuid().ToString("N"))
    $skillUri = [Uri]("$gatewayRoot/install/skills/$skillName/SKILL.md")
    if ($skillName -eq "simi-trinh-duyet" -and (Test-Path -LiteralPath $skillDir)) {
      Remove-Item -LiteralPath $skillDir -Recurse -Force
      Write-Host "Đã xóa skill trình duyệt Simi cũ trước khi cài bản MCP-only."
    }
    New-Item -ItemType Directory -Force -Path $skillDir | Out-Null
    try {
      Invoke-WebRequest `
        -UseBasicParsing `
        -Uri $skillUri.AbsoluteUri `
        -OutFile $tempPath `
        -MaximumRedirection 0
      $skillText = [IO.File]::ReadAllText($tempPath)
      if ($skillText.Length -gt 262144 -or
          $skillText -notmatch "(?m)^name:\s*$([regex]::Escape($skillName))\s*$" -or
          $skillText -notmatch "(?m)^---\s*$") {
        throw "Nội dung skill '$skillName' không hợp lệ."
      }
      Move-Item -LiteralPath $tempPath -Destination $skillPath -Force
    } finally {
      if (Test-Path -LiteralPath $tempPath) {
        Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
      }
    }
  }

  Write-Host "Đã cài/cập nhật $($skillNames.Count) skill Simi. Khởi động lại Codex Desktop để nạp skill mới."
}

function Get-OrCreateBrowserBridgeToken {
  $existing = [Environment]::GetEnvironmentVariable("LTN_BROWSER_BRIDGE_TOKEN", "User")
  if (-not [string]::IsNullOrWhiteSpace($existing) -and $existing.Length -ge 32) {
    return $existing.Trim()
  }

  $bytes = New-Object byte[] 32
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  $token = (-join ($bytes | ForEach-Object { $_.ToString("x2") })).Substring(0, 64)
  try {
    [Environment]::SetEnvironmentVariable("LTN_BROWSER_BRIDGE_TOKEN", $token, "User")
  } catch {
    Write-Warning "Không lưu được Browser Bridge token vào User environment; token vẫn được giữ cho phiên cài đặt này."
  }
  $env:LTN_BROWSER_BRIDGE_TOKEN = $token
  return $token
}

function Install-BrowserBridge {
  param(
    [string]$CodexHome,
    [string]$BinDir,
    [string]$GatewayBaseUrl,
    [string]$BridgeToken
  )

  $gatewayRoot = $GatewayBaseUrl -replace '/v1$', ''
  $bridgePath = Join-Path $CodexHome "browser-bridge.mjs"
  $pageClientPath = Join-Path $CodexHome "browser-page.mjs"
  $cdpClientPath = Join-Path $CodexHome "browser-cdp.mjs"
  $chromeDebugPath = Join-Path $CodexHome "chrome-debug.mjs"
  $browserMcpPath = Join-Path $CodexHome "browser-mcp.mjs"
  $bridgeTemp = "$bridgePath.$([Guid]::NewGuid().ToString('N')).tmp"
  try {
    Invoke-WebRequest -UseBasicParsing `
      -Uri ([Uri]"$gatewayRoot/install/browser-bridge.mjs").AbsoluteUri `
      -OutFile $bridgeTemp -MaximumRedirection 0
    Move-Item -LiteralPath $bridgeTemp -Destination $bridgePath -Force
  } finally {
    if (Test-Path -LiteralPath $bridgeTemp) { Remove-Item -LiteralPath $bridgeTemp -Force -ErrorAction SilentlyContinue }
  }
  $pageClientTemp = "$pageClientPath.$([Guid]::NewGuid().ToString('N')).tmp"
  try {
    Invoke-WebRequest -UseBasicParsing `
      -Uri ([Uri]"$gatewayRoot/install/tools/browser-page.mjs").AbsoluteUri `
      -OutFile $pageClientTemp -MaximumRedirection 0
    Move-Item -LiteralPath $pageClientTemp -Destination $pageClientPath -Force
  } finally {
    if (Test-Path -LiteralPath $pageClientTemp) { Remove-Item -LiteralPath $pageClientTemp -Force -ErrorAction SilentlyContinue }
  }
  foreach ($asset in @(
    @{ Name = "browser-cdp.mjs"; Path = $cdpClientPath },
    @{ Name = "chrome-debug.mjs"; Path = $chromeDebugPath },
    @{ Name = "browser-mcp.mjs"; Path = $browserMcpPath }
  )) {
    $assetTemp = "$($asset.Path).$([Guid]::NewGuid().ToString('N')).tmp"
    try {
      Invoke-WebRequest -UseBasicParsing `
        -Uri ([Uri]"$gatewayRoot/install/tools/$($asset.Name)").AbsoluteUri `
        -OutFile $assetTemp -MaximumRedirection 0
      Move-Item -LiteralPath $assetTemp -Destination $asset.Path -Force
    } finally {
      if (Test-Path -LiteralPath $assetTemp) { Remove-Item -LiteralPath $assetTemp -Force -ErrorAction SilentlyContinue }
    }
  }

  $extensionDir = Join-Path $CodexHome "browser-extension"
  $credentialDir = Join-Path $CodexHome "credentials"
  $bridgeTokenPath = Join-Path $credentialDir "ltn-browser-bridge-token"
  New-Item -ItemType Directory -Force -Path $credentialDir | Out-Null
  [IO.File]::WriteAllText($bridgeTokenPath, $BridgeToken, [Text.UTF8Encoding]::new($false))
  New-Item -ItemType Directory -Force -Path $extensionDir | Out-Null
  foreach ($asset in @("manifest.json", "service-worker.js", "popup.html", "popup.js", "options.html", "options.js")) {
    $assetPath = Join-Path $extensionDir $asset
    $assetTemp = "$assetPath.$([Guid]::NewGuid().ToString('N')).tmp"
    try {
      Invoke-WebRequest -UseBasicParsing `
        -Uri ([Uri]"$gatewayRoot/install/browser-extension/$asset").AbsoluteUri `
        -OutFile $assetTemp -MaximumRedirection 0
      Move-Item -LiteralPath $assetTemp -Destination $assetPath -Force
    } finally {
      if (Test-Path -LiteralPath $assetTemp) { Remove-Item -LiteralPath $assetTemp -Force -ErrorAction SilentlyContinue }
    }
  }
  $configPath = Join-Path $extensionDir "bridge-config.js"
  [IO.File]::WriteAllText(
    $configPath,
    "self.SIMI_BRIDGE_TOKEN = '$BridgeToken';`r`n",
    [Text.UTF8Encoding]::new($false)
  )

  $bridgeWrapper = Join-Path $BinDir "ltn-browser-bridge.cmd"
  $pageWrapper = Join-Path $BinDir "ltn-browser-page.cmd"
  $chromeDebugWrapper = Join-Path $BinDir "ltn-chrome-debug.cmd"
  $escapedCodexHome = $CodexHome.Replace('"', '')
  $bridgeWrapperText = @"
@echo off
if defined LTN_BROWSER_NODE_PATH (
  "%LTN_BROWSER_NODE_PATH%" "$escapedCodexHome\browser-bridge.mjs"
) else (
  node "$escapedCodexHome\browser-bridge.mjs"
)
"@
  [IO.File]::WriteAllText($bridgeWrapper, $bridgeWrapperText.TrimStart(), [Text.UTF8Encoding]::new($false))
  $pageWrapperText = @'
@echo off
setlocal
if defined LTN_BROWSER_NODE_PATH (
  "%LTN_BROWSER_NODE_PATH%" "%CODEX_HOME%\browser-page.mjs" %*
) else (
  node "%CODEX_HOME%\browser-page.mjs" %*
)
endlocal
'@
  $pageWrapperText = $pageWrapperText.Replace('%CODEX_HOME%', $escapedCodexHome)
  [IO.File]::WriteAllText($pageWrapper, $pageWrapperText.TrimStart(), [Text.UTF8Encoding]::new($false))
  $chromeDebugWrapperText = @'
@echo off
setlocal
if defined LTN_BROWSER_NODE_PATH (
  "%LTN_BROWSER_NODE_PATH%" "%CODEX_HOME%\chrome-debug.mjs" %*
) else (
  node "%CODEX_HOME%\chrome-debug.mjs" %*
)
endlocal
'@
  $chromeDebugWrapperText = $chromeDebugWrapperText.Replace('%CODEX_HOME%', $escapedCodexHome)
  [IO.File]::WriteAllText($chromeDebugWrapper, $chromeDebugWrapperText.TrimStart(), [Text.UTF8Encoding]::new($false))
  Write-Host "Đã cài Chrome CDP client: $chromeDebugPath"
  Write-Host "Đã cài browser MCP tự động: $browserMcpPath"
  Write-Host "  Tự động mở profile Chrome khi skill simi-trinh-duyet được gọi"
  Write-Host "  User chỉ cần đăng nhập một lần trong cửa sổ Chrome mới"
}

function Refresh-ProcessPath {
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $env:Path = (($userPath, $machinePath | Where-Object { $_ }) -join ";")
}

function Install-WingetPackage {
  param([string]$PackageId)

  if ($env:LTN_SKIP_RUNTIME_INSTALL -eq "1") { return $false }
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $winget) {
    Write-Warning "Không tìm thấy winget để cài $PackageId. Hãy cài thủ công rồi chạy Repair."
    return $false
  }

  Write-Host "Đang cài runtime Windows: $PackageId..."
  & $winget.Source install `
    --id $PackageId `
    --exact `
    --source winget `
    --accept-package-agreements `
    --accept-source-agreements `
    --silent | Out-Host
  return ($LASTEXITCODE -eq 0)
}

function Ensure-NodeRuntime {
  Refresh-ProcessPath
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    $version = (& $node.Source --version 2>$null | Out-String).Trim()
    $major = 0
    if ($version -match '^v(\d+)') { $major = [int]$Matches[1] }
    if ($major -ge 20) {
      Write-Host "Node.js: $version"
      return $true
    }
    Write-Warning "Node.js hiện tại $version thấp hơn Node.js 20; sẽ thử cập nhật."
  }

  if (-not (Install-WingetPackage -PackageId "OpenJS.NodeJS.LTS")) {
    Write-Warning "Không cài được Node.js tự động. Browser bridge và lệnh ltn-9router sẽ cần Node.js 20+."
    return $false
  }
  Refresh-ProcessPath
  $node = Get-Command node -ErrorAction SilentlyContinue
  if (-not $node) {
    Write-Warning "Node.js đã cài nhưng chưa có trong PATH của phiên này. Mở terminal mới rồi chạy Repair."
    return $false
  }
  Write-Host "Node.js: $((& $node.Source --version 2>$null | Out-String).Trim())"
  return $true
}

function Get-PythonCommand {
  Refresh-ProcessPath
  $candidates = @(
    Get-Command py, python, python3 -All -ErrorAction SilentlyContinue
  ) | Where-Object {
    $_.Source -and $_.Source -notmatch '(?i)[\\/]WindowsApps[\\/]python(?:3)?\.exe$'
  }

  foreach ($candidate in $candidates) {
    try {
      $probeArgs = if ($candidate.Name -match '^py(\.exe)?$') {
        @('-3', '-c', 'import sys; print(sys.executable)')
      } else {
        @('-c', 'import sys; print(sys.executable)')
      }
      $executable = (& $candidate.Source @probeArgs 2>$null | Select-Object -Last 1 | Out-String).Trim()
      if ($LASTEXITCODE -eq 0 -and
          -not [string]::IsNullOrWhiteSpace($executable) -and
          (Test-Path -LiteralPath $executable -PathType Leaf)) {
        return $candidate
      }
    } catch {
      # Ignore stale aliases and broken launchers, then try the next candidate.
    }
  }
  return $null
}

function Ensure-PdfRuntime {
  param([string]$CodexHome)

  if ($env:LTN_SKIP_RUNTIME_INSTALL -eq "1") {
    Write-Host "Bỏ qua cài runtime PDF do LTN_SKIP_RUNTIME_INSTALL=1."
    return $false
  }
  $python = Get-PythonCommand
  if (-not $python) {
    if (-not (Install-WingetPackage -PackageId "Python.Python.3.12")) {
      Write-Warning "Không cài được Python 3.12 tự động bằng winget."
    }
    Refresh-ProcessPath
    $python = Get-PythonCommand
  }
  if (-not $python) {
    Write-Warning "Không tìm thấy Python 3.12+. Phân tích PDF sẽ yêu cầu cài Python rồi chạy Repair."
    return $false
  }

  $runtimeDir = Join-Path $CodexHome "pdf-runtime"
  $venvPython = Join-Path $runtimeDir "Scripts\python.exe"
  if (-not (Test-Path -LiteralPath $venvPython)) {
    New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
    if ($python.Name -match '^py(\.exe)?$') {
      & $python.Source -3 -m venv $runtimeDir | Out-Host
    } else {
      & $python.Source -m venv $runtimeDir | Out-Host
    }
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $venvPython)) {
      Write-Warning "Không tạo được Python venv cho PDF."
      return $false
    }
  }

  $marker = Join-Path $runtimeDir ".ltn-pdf-deps-v3"
  if (-not (Test-Path -LiteralPath $marker)) {
    Write-Host "Đang cài thư viện tài liệu: pypdf, pdfplumber, pymupdf, openpyxl, tomli..."
    & $venvPython -m pip install --disable-pip-version-check --upgrade pypdf pdfplumber pymupdf openpyxl tomli | Out-Host
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "Không tải được thư viện PDF. Kiểm tra mạng rồi chạy Repair."
      return $false
    }
    [IO.File]::WriteAllText($marker, "pypdf`npdfplumber`npymupdf`nopenpyxl`ntomli`n", [Text.UTF8Encoding]::new($false))
  }
  Write-Host "Python PDF runtime: $venvPython"
  return $true
}

function Test-TomlConfigContent {
  param(
    [string]$Content,
    [string]$CodexHome
  )

  $venvPython = if ($env:LTN_PYTHON_PATH) {
    $env:LTN_PYTHON_PATH
  } else {
    Join-Path $CodexHome "pdf-runtime\Scripts\python.exe"
  }
  if (-not (Test-Path -LiteralPath $venvPython)) {
    return [pscustomobject]@{ Supported = $false; Valid = $false }
  }

  $tempPath = Join-Path $CodexHome ("config.toml.validate-{0}.tmp" -f [guid]::NewGuid().ToString("N"))
  $validatorPath = "$tempPath.py"
  $validator = @'
import json
import os
result = {"supported": True, "valid": False, "detail": ""}
try:
    import tomllib
except ModuleNotFoundError:
    try:
        import tomli as tomllib
    except ModuleNotFoundError:
        result = {"supported": False, "valid": False, "detail": "tomllib/tomli unavailable"}
if result["supported"]:
    try:
        with open(os.environ["LTN_TOML_VALIDATE_PATH"], "rb") as handle:
            tomllib.load(handle)
        result["valid"] = True
    except Exception as exc:
        result["detail"] = f"{type(exc).__name__}: {exc}"
print(json.dumps(result, ensure_ascii=True))
'@
  try {
    [IO.File]::WriteAllText($tempPath, $Content, [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText($validatorPath, $validator, [Text.UTF8Encoding]::new($false))
    $previousErrorActionPreference = $ErrorActionPreference
    $previousValidatePath = $env:LTN_TOML_VALIDATE_PATH
    try {
      $ErrorActionPreference = "Continue"
      # Pass the config path through the environment and run a temporary .py
      # file. Windows PowerShell 5.1 can corrupt both paths containing spaces
      # and multiline source passed through `python -c`.
      $env:LTN_TOML_VALIDATE_PATH = $tempPath
      $validationOutput = (& $venvPython $validatorPath 2>&1 | Out-String).Trim()
      $exitCode = $LASTEXITCODE
    } finally {
      $ErrorActionPreference = $previousErrorActionPreference
      if ($null -eq $previousValidatePath) {
        Remove-Item Env:LTN_TOML_VALIDATE_PATH -ErrorAction SilentlyContinue
      } else {
        $env:LTN_TOML_VALIDATE_PATH = $previousValidatePath
      }
    }
    if ($exitCode -ne 0 -or [string]::IsNullOrWhiteSpace($validationOutput)) {
      return [pscustomobject]@{
        Supported = $true
        Valid = $false
        Detail = "Python validator không trả kết quả JSON hợp lệ (exit $exitCode)."
      }
    }
    try {
      $validation = $validationOutput | ConvertFrom-Json -ErrorAction Stop
    } catch {
      return [pscustomobject]@{
        Supported = $true
        Valid = $false
        Detail = "Không đọc được JSON từ Python validator."
      }
    }
    $detail = [string]$validation.detail
    if ($detail.Length -gt 500) { $detail = $detail.Substring(0, 500) }
    return [pscustomobject]@{
      Supported = [bool]$validation.supported
      Valid = [bool]$validation.valid
      Detail = $detail
    }
  } finally {
    if (Test-Path -LiteralPath $tempPath) {
      Remove-Item -LiteralPath $tempPath -Force
    }
    if (Test-Path -LiteralPath $validatorPath) {
      Remove-Item -LiteralPath $validatorPath -Force
    }
  }
}

function Install-LocalTools {
  param(
    [string]$CodexHome,
    [string]$BinDir,
    [string]$GatewayBaseUrl,
    [bool]$PdfRuntimeReady
  )

  $gatewayRoot = $GatewayBaseUrl -replace '/v1$', ''
  $toolsDir = Join-Path $CodexHome "tools"
  New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
  foreach ($asset in @("9router-client.mjs", "pdf-extract.py")) {
    $assetPath = Join-Path $toolsDir $asset
    $assetTemp = "$assetPath.$([Guid]::NewGuid().ToString('N')).tmp"
    try {
      Invoke-WebRequest -UseBasicParsing `
        -Uri ([Uri]"$gatewayRoot/install/tools/$asset").AbsoluteUri `
        -OutFile $assetTemp -MaximumRedirection 0
      Move-Item -LiteralPath $assetTemp -Destination $assetPath -Force
    } finally {
      if (Test-Path -LiteralPath $assetTemp) { Remove-Item -LiteralPath $assetTemp -Force -ErrorAction SilentlyContinue }
    }
  }

  $spreadsheetAsset = "spreadsheet-audit.py"
  $spreadsheetPath = Join-Path $toolsDir $spreadsheetAsset
  $spreadsheetTemp = "$spreadsheetPath.$([Guid]::NewGuid().ToString('N')).tmp"
  try {
    try {
      Invoke-WebRequest -UseBasicParsing `
        -Uri ([Uri]"$gatewayRoot/install/tools/$spreadsheetAsset").AbsoluteUri `
        -OutFile $spreadsheetTemp -MaximumRedirection 0
      Move-Item -LiteralPath $spreadsheetTemp -Destination $spreadsheetPath -Force
    } catch {
      Write-Warning "Chưa tải được công cụ Excel có cấu trúc; Browser và các chức năng khác vẫn dùng được. Admin cần triển khai spreadsheet-audit.py rồi chạy Repair."
    }
  } finally {
    if (Test-Path -LiteralPath $spreadsheetTemp) { Remove-Item -LiteralPath $spreadsheetTemp -Force -ErrorAction SilentlyContinue }
  }

  $escapedCodexHome = $CodexHome.Replace('"', '')
  $nodeWrapper = @"
@echo off
setlocal
if defined LTN_NODE_PATH (
  "%LTN_NODE_PATH%" "$escapedCodexHome\tools\9router-client.mjs" %*
) else if defined LTN_BROWSER_NODE_PATH (
  "%LTN_BROWSER_NODE_PATH%" "$escapedCodexHome\tools\9router-client.mjs" %*
) else (
  node "$escapedCodexHome\tools\9router-client.mjs" %*
)
endlocal
"@
  [IO.File]::WriteAllText((Join-Path $BinDir "ltn-9router.cmd"), $nodeWrapper.TrimStart(), [Text.UTF8Encoding]::new($false))

  $pdfWrapper = @"
@echo off
setlocal
if defined LTN_PYTHON_PATH (
  "%LTN_PYTHON_PATH%" "$escapedCodexHome\tools\pdf-extract.py" %*
) else if exist "$escapedCodexHome\pdf-runtime\Scripts\python.exe" (
  "$escapedCodexHome\pdf-runtime\Scripts\python.exe" "$escapedCodexHome\tools\pdf-extract.py" %*
) else if defined PY_PYTHON (
  py -3 "$escapedCodexHome\tools\pdf-extract.py" %*
) else (
  python "$escapedCodexHome\tools\pdf-extract.py" %*
)
endlocal
"@
  [IO.File]::WriteAllText((Join-Path $BinDir "ltn-pdf.cmd"), $pdfWrapper.TrimStart(), [Text.UTF8Encoding]::new($false))
  Write-Host "Đã cài lệnh mạng: ltn-9router"
  Write-Host "Đã cài lệnh PDF: ltn-pdf (runtime: $(if ($PdfRuntimeReady) { "OK" } else { "chưa sẵn sàng" }))"
}

function Show-InstallerStatus {
  param(
    [string]$ConfigPath,
    [string]$BinDir,
    [string]$GatewayBaseUrl
  )

  $codexStatus = Get-CodexCommandStatus
  Write-Host "Trạng thái LTN Codex:"
  if ($codexStatus.Found) {
    Write-Host "  Codex CLI: $($codexStatus.Path)"
    if ($codexStatus.Healthy) {
      Write-Host "  Phiên bản: $($codexStatus.Version)"
    } else {
      Write-Host "  Codex CLI lỗi: $($codexStatus.Reason)"
    }
  } else {
    Write-Host "  Codex CLI: chưa tìm thấy"
  }

  Write-Host "  Config: $ConfigPath"
  if (Test-Path $ConfigPath) {
    $configText = [IO.File]::ReadAllText($ConfigPath)
    $hasLtnProvider = $configText -match '(?m)^\s*\[model_providers\.ltn_gateway\]\s*$'
    $hasBrowserMcp = $configText -match '(?m)^\s*\[mcp_servers\.simi_browser\]\s*$'
    $modelLine = [regex]::Match($configText, '(?m)^\s*model\s*=\s*"([^"]+)"\s*$')
    Write-Host "  SIMI Gateway config: $(if ($hasLtnProvider) { "có" } else { "chưa có" })"
    Write-Host "  Browser MCP config: $(if ($hasBrowserMcp) { "có" } else { "chưa có - chạy Repair" })"
    if ($modelLine.Success) {
      Write-Host "  Model mặc định: $($modelLine.Groups[1].Value)"
    }
  } else {
    Write-Host "  SIMI Gateway config: chưa có"
    Write-Host "  Browser MCP config: chưa có - chạy Repair"
  }

  $keyConfigured = -not [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable("LTN_TEAM_API_KEY", "User"))
  $clientConfigured = -not [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable("LTN_CLIENT_ID", "User"))
  Write-Host "  API key team: $(if ($keyConfigured) { "đã lưu" } else { "chưa lưu" })"
  Write-Host "  Client ID: $(if ($clientConfigured) { "đã tạo" } else { "chưa tạo" })"
  Write-Host "  Gateway health: $(Test-GatewayHealth -BaseUrl $GatewayBaseUrl)"
  Write-Host "  Wrapper dir: $BinDir"
  $skillsRoot = Join-Path (Split-Path -Parent $ConfigPath) "skills"
  $skillCount = @(
    "simi", "simi-tro-chuyen", "simi-tao-anh", "simi-tao-video",
    "simi-doc-van-ban", "simi-chep-loi", "simi-vector",
    "simi-tim-kiem-web", "simi-doc-trang-web", "simi-trinh-duyet", "simi-doc-pdf", "simi-cai-dat"
  ).Where({ Test-Path -LiteralPath (Join-Path (Join-Path $skillsRoot $_) "SKILL.md") }).Count
  Write-Host "  Simi skills: $skillCount/12"
  $bridgeConfigured = -not [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable("LTN_BROWSER_BRIDGE_TOKEN", "User"))
  Write-Host "  Browser bridge token: $(if ($bridgeConfigured) { "đã tạo" } else { "chưa tạo" })"
  $browserMcpPath = Join-Path (Split-Path -Parent $ConfigPath) "browser-mcp.mjs"
  Write-Host "  Browser MCP runtime: $(if (Test-Path -LiteralPath $browserMcpPath) { "đã cài" } else { "chưa có - chạy Repair" })"
  $nodeStatus = Get-Command node -ErrorAction SilentlyContinue
  $pythonStatus = Get-PythonCommand
  Write-Host "  Node.js: $(if ($nodeStatus) { (& $nodeStatus.Source --version 2>$null | Out-String).Trim() } else { "chưa có" })"
  Write-Host "  Python: $(if ($pythonStatus) { $pythonStatus.Source } else { "chưa có" })"
  Write-Host "  PDF runtime: $(if (Test-Path (Join-Path (Split-Path -Parent $ConfigPath) "pdf-runtime\Scripts\python.exe")) { "đã tạo" } else { "chưa tạo" })"
  $runtimeConfig = Test-CodexManagedRuntimeConfig -ConfigPath $ConfigPath
  if ($runtimeConfig.Supported) {
    Write-Host "  Codex config parser: $(if ($runtimeConfig.ConfigValid) { "OK" } else { "lỗi" })"
    Write-Host "  Codex configured provider: $(if ($runtimeConfig.Provider) { "ltn_gateway" } else { "không đúng" })"
    Write-Host "  Codex MCP registry: $(if ($runtimeConfig.BrowserMcp) { "simi_browser" } else { "không tìm thấy" })"
  }
}

function Test-CodexManagedRuntimeConfig {
  param([string]$ConfigPath)

  $codexStatus = Get-CodexCommandStatus
  if (-not $codexStatus.Healthy) {
    return [pscustomobject]@{ Supported = $false; ConfigValid = $false; Provider = $false; BrowserMcp = $false }
  }

  $configText = if (Test-Path -LiteralPath $ConfigPath) {
    [IO.File]::ReadAllText($ConfigPath)
  } else {
    ""
  }
  $mcpJson = (& $codexStatus.Path mcp get simi_browser --json 2>$null | Out-String)
  $configValid = $LASTEXITCODE -eq 0
  if (-not $configValid) {
    $mcpJson = (& $codexStatus.Path mcp get simi_browser 2>$null | Out-String)
    $configValid = $LASTEXITCODE -eq 0
  }
  return [pscustomobject]@{
    Supported = $true
    ConfigValid = $configValid
    Provider = $configValid -and ($configText -match '(?m)^\s*model_provider\s*=\s*"ltn_gateway"\s*$')
    BrowserMcp = $configValid -and ($mcpJson -match 'browser-mcp\.mjs')
  }
}

function Invoke-LtnUninstall {
  param(
    [string]$ConfigPath,
    [string]$BinDir
  )

  if (Test-Path $ConfigPath) {
    $existingConfig = [IO.File]::ReadAllText($ConfigPath)
    $cleanedConfig = Update-CodexConfig -ExistingContent $existingConfig -ManagedRootContent "" -ManagedTableContent ""
    [IO.File]::WriteAllText($ConfigPath, $cleanedConfig, [Text.UTF8Encoding]::new($false))
  }
  foreach ($wrapper in @("codex-fast.cmd", "codex-power.cmd", "ltn-browser-bridge.cmd", "ltn-browser-page.cmd", "ltn-chrome-debug.cmd", "ltn-9router.cmd", "ltn-pdf.cmd")) {
    $wrapperPath = Join-Path $BinDir $wrapper
    if (Test-Path $wrapperPath) {
      Remove-Item -LiteralPath $wrapperPath -Force
    }
  }
  $skillsRoot = Join-Path (Split-Path -Parent $ConfigPath) "skills"
  foreach ($skillName in @(
    "simi", "simi-tro-chuyen", "simi-tao-anh", "simi-tao-video",
    "simi-doc-van-ban", "simi-chep-loi", "simi-vector",
    "simi-tim-kiem-web", "simi-doc-trang-web", "simi-trinh-duyet", "simi-doc-pdf", "simi-cai-dat",
    "9router", "9router-chat", "9router-image", "9router-video", "9router-tts",
    "9router-stt", "9router-embeddings", "9router-web-search", "9router-web-fetch",
    "9router-browser", "9router-pdf"
  )) {
    $skillDir = Join-Path $skillsRoot $skillName
    $skillPath = Join-Path $skillDir "SKILL.md"
    if (Test-Path -LiteralPath $skillPath) {
      Remove-Item -LiteralPath $skillPath -Force
    }
    if ((Test-Path -LiteralPath $skillDir) -and
        -not (Get-ChildItem -LiteralPath $skillDir -Force | Select-Object -First 1)) {
      Remove-Item -LiteralPath $skillDir -Force
    }
  }
  [Environment]::SetEnvironmentVariable("LTN_TEAM_API_KEY", $null, "User")
  [Environment]::SetEnvironmentVariable("LTN_CLIENT_ID", $null, "User")
  [Environment]::SetEnvironmentVariable("NINEROUTER_URL", $null, "User")
  [Environment]::SetEnvironmentVariable("NINEROUTER_KEY", $null, "User")
  [Environment]::SetEnvironmentVariable("LTN_BROWSER_BRIDGE_TOKEN", $null, "User")
  Remove-Item Env:LTN_TEAM_API_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:LTN_CLIENT_ID -ErrorAction SilentlyContinue
  Remove-Item Env:LTN_BROWSER_BRIDGE_TOKEN -ErrorAction SilentlyContinue
  $browserBridgePath = Join-Path (Split-Path -Parent $ConfigPath) "browser-bridge.mjs"
  $browserPagePath = Join-Path (Split-Path -Parent $ConfigPath) "browser-page.mjs"
  $browserCdpPath = Join-Path (Split-Path -Parent $ConfigPath) "browser-cdp.mjs"
  $chromeDebugPath = Join-Path (Split-Path -Parent $ConfigPath) "chrome-debug.mjs"
  $browserMcpPath = Join-Path (Split-Path -Parent $ConfigPath) "browser-mcp.mjs"
  $browserTokenPath = Join-Path (Split-Path -Parent $ConfigPath) "credentials\ltn-browser-bridge-token"
  $browserExtensionPath = Join-Path (Split-Path -Parent $ConfigPath) "browser-extension"
  $toolsPath = Join-Path (Split-Path -Parent $ConfigPath) "tools"
  $pdfRuntimePath = Join-Path (Split-Path -Parent $ConfigPath) "pdf-runtime"
  if (Test-Path -LiteralPath $browserBridgePath) { Remove-Item -LiteralPath $browserBridgePath -Force }
  if (Test-Path -LiteralPath $browserPagePath) { Remove-Item -LiteralPath $browserPagePath -Force }
  if (Test-Path -LiteralPath $browserCdpPath) { Remove-Item -LiteralPath $browserCdpPath -Force }
  if (Test-Path -LiteralPath $chromeDebugPath) { Remove-Item -LiteralPath $chromeDebugPath -Force }
  if (Test-Path -LiteralPath $browserMcpPath) { Remove-Item -LiteralPath $browserMcpPath -Force }
  if (Test-Path -LiteralPath $browserTokenPath) { Remove-Item -LiteralPath $browserTokenPath -Force }
  if (Test-Path -LiteralPath $browserExtensionPath) { Remove-Item -LiteralPath $browserExtensionPath -Recurse -Force }
  if (Test-Path -LiteralPath $toolsPath) { Remove-Item -LiteralPath $toolsPath -Recurse -Force }
  if (Test-Path -LiteralPath $pdfRuntimePath) { Remove-Item -LiteralPath $pdfRuntimePath -Recurse -Force }
  Write-Host "Đã gỡ cấu hình SIMI Gateway, wrapper, LTN_TEAM_API_KEY và LTN_CLIENT_ID. Codex CLI không bị gỡ."
}

$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$configPath = Join-Path $codexHome "config.toml"
$binDir = Join-Path $codexHome "bin"

if ($Uninstall) {
  $Mode = "uninstall"
}
if ([string]::IsNullOrWhiteSpace($Mode)) {
  $Mode = Read-InstallerMode
}
if ($Mode -in @("auto", "profiles")) {
  $Mode = "install"
}

$GatewayBaseUrl = $GatewayBaseUrl.TrimEnd("/")

if ($Mode -eq "status") {
  Show-InstallerStatus -ConfigPath $configPath -BinDir $binDir -GatewayBaseUrl $GatewayBaseUrl
  return
}
if ($Mode -eq "uninstall") {
  Invoke-LtnUninstall -ConfigPath $configPath -BinDir $binDir
  return
}

$gatewayUri = $null
if (-not [Uri]::TryCreate($GatewayBaseUrl, [UriKind]::Absolute, [ref]$gatewayUri) -or
    $gatewayUri.Scheme -notin @("http", "https")) {
  throw "GatewayBaseUrl phải là URL HTTP/HTTPS tuyệt đối."
}
if ($gatewayUri.Scheme -ne "https" -and $gatewayUri.Host -notin @("localhost", "127.0.0.1", "::1")) {
  throw "Gateway từ xa phải dùng HTTPS để bảo vệ API key team."
}

if ([string]::IsNullOrWhiteSpace($TeamApiKey)) {
  if ($Mode -eq "repair") {
    $TeamApiKey = Get-StoredTeamApiKey
    if ([string]::IsNullOrWhiteSpace($TeamApiKey)) {
      throw "Repair không tìm thấy API key đã lưu. Hãy chạy Install/Update một lần hoặc truyền -TeamApiKey."
    }
    Write-Host "Repair: dùng API key đã lưu, không yêu cầu nhập lại."
  } else {
    $TeamApiKey = Read-TeamApiKey
  }
}

$TeamApiKey = Confirm-TeamApiKey $TeamApiKey

Write-Host "Đang xác minh Combo SIMI AI qua Gateway..."
$headers = @{ Authorization = "Bearer $TeamApiKey" }
try {
  $remoteConfig = Invoke-RestMethod -Method Get -Uri "$GatewayBaseUrl/codex/config" -Headers $headers
  $comboPremium = [string](Get-ObjectPropertyValue -Object $remoteConfig.combos -Name "premium")
  $comboFree = [string](Get-ObjectPropertyValue -Object $remoteConfig.combos -Name "free")
  $comboTest = [string](Get-ObjectPropertyValue -Object $remoteConfig.combos -Name "test")
  $routingMode = [string](Get-ObjectPropertyValue -Object $remoteConfig.routing -Name "mode")
} catch {
  throw "Gateway chưa cung cấp cấu hình Codex hợp lệ. Admin cần kiểm tra CODEX_COMBO_PREMIUM/CODEX_COMBO_FREE/CODEX_COMBO_TEST hoặc aiPolicy của team. Chi tiết: $($_.Exception.Message)"
}

$requiredCombos = if ($routingMode -eq "free_only") {
  $comboFree = Confirm-ComboIdSyntax -ComboId $comboFree -Name "combos.free"
  $defaultModel = $comboFree
  @($comboFree)
} elseif ($routingMode -eq "premium_always") {
  $comboPremium = Confirm-ComboIdSyntax -ComboId $comboPremium -Name "combos.premium"
  $defaultModel = $comboPremium
  @($comboPremium)
} elseif ($routingMode -eq "test_only") {
  $comboTest = Confirm-ComboIdSyntax -ComboId $comboTest -Name "combos.test"
  $defaultModel = $comboTest
  @($comboTest)
} else {
  $comboPremium = Confirm-ComboIdSyntax -ComboId $comboPremium -Name "combos.premium"
  $comboFree = Confirm-ComboIdSyntax -ComboId $comboFree -Name "combos.free"
  $defaultModel = $comboPremium
  @($comboPremium, $comboFree) | Select-Object -Unique
}

try {
  $modelResponse = Invoke-RestMethod -Method Get -Uri "$GatewayBaseUrl/models" -Headers $headers
} catch {
  throw "Không gọi được GET $GatewayBaseUrl/models. Kiểm tra Gateway và API key team. Chi tiết: $($_.Exception.Message)"
}

$models = @($modelResponse.data)
$missing = @(Test-ComboIds -Models $models -RequiredIds $requiredCombos)
if ($missing.Count -gt 0) {
  throw "Thiếu Combo trên 9Router: $($missing -join ', '). Hãy tạo tại 9Router Dashboard -> Combos rồi chạy lại installer."
}

if (-not $SkipCodexInstall) {
  $preInstallCodexStatus = Get-CodexCommandStatus
  if (-not $preInstallCodexStatus.Healthy) {
    Install-OfficialCodexCli
  }
}

New-Item -ItemType Directory -Force -Path $codexHome, $binDir | Out-Null
$browserBridgeToken = Get-OrCreateBrowserBridgeToken
$nodeRuntimeReady = Ensure-NodeRuntime
$pdfRuntimeReady = Ensure-PdfRuntime -CodexHome $codexHome
Install-Managed9RouterSkills -CodexHome $codexHome -GatewayBaseUrl $GatewayBaseUrl
Install-BrowserBridge -CodexHome $codexHome -BinDir $binDir -GatewayBaseUrl $GatewayBaseUrl -BridgeToken $browserBridgeToken
Install-LocalTools -CodexHome $codexHome -BinDir $binDir -GatewayBaseUrl $GatewayBaseUrl -PdfRuntimeReady $pdfRuntimeReady

$existingConfig = ""
if (Test-Path $configPath) {
  $backupPath = "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $configPath -Destination $backupPath
  $existingConfig = [IO.File]::ReadAllText($configPath)
  Write-Host "Đã sao lưu config cũ: $backupPath"
}

$escapedBaseUrl = Escape-TomlString $GatewayBaseUrl
$escapedModel = Escape-TomlString $defaultModel
$nodeCommand = "node"
$installedNode = Get-Command node -ErrorAction SilentlyContinue
if ($installedNode) { $nodeCommand = $installedNode.Source }
$escapedNodeCommand = Escape-TomlString $nodeCommand
$escapedBrowserMcpPath = Escape-TomlString (Join-Path $codexHome "browser-mcp.mjs")
$managedRootContent = @"
# BEGIN LTN CODEX MANAGED ROOT
# Managed by LTN Codex installer.
model = "$escapedModel"
model_provider = "ltn_gateway"
# END LTN CODEX MANAGED ROOT
"@

$managedTableContent = @"
# BEGIN LTN CODEX MANAGED TABLES
[model_providers.ltn_gateway]
name = "SIMI Gateway"
base_url = "$escapedBaseUrl"
env_key = "LTN_TEAM_API_KEY"
wire_api = "responses"
env_http_headers = { "X-LTN-Client-ID" = "LTN_CLIENT_ID" }

[mcp_servers.simi_browser]
command = "$escapedNodeCommand"
args = ["$escapedBrowserMcpPath"]
startup_timeout_sec = 20
tool_timeout_sec = 600
# END LTN CODEX MANAGED TABLES
"@

$updatedConfig = Update-CodexConfig -ExistingContent $existingConfig -ManagedRootContent $managedRootContent -ManagedTableContent $managedTableContent
$configChanged = $updatedConfig -ne $existingConfig
$managedOnlyConfig = Update-CodexConfig -ExistingContent "" -ManagedRootContent $managedRootContent -ManagedTableContent $managedTableContent
$managedValidation = Test-TomlConfigContent -Content $managedOnlyConfig -CodexHome $codexHome
if ($managedValidation.Supported -and -not $managedValidation.Valid) {
  throw "Cấu hình Simi do installer tạo không hợp lệ. $($managedValidation.Detail)"
}
$tomlValidation = Test-TomlConfigContent -Content $updatedConfig -CodexHome $codexHome
if ($tomlValidation.Supported -and -not $tomlValidation.Valid) {
  $detail = if ($tomlValidation.Detail) { " Chi tiết: $($tomlValidation.Detail)" } else { "" }
  throw "config.toml sau khi ghép không hợp lệ; installer đã giữ nguyên config cũ.$detail"
}
if (-not $tomlValidation.Supported) {
  Write-Warning "Python hiện tại chưa có tomllib/tomli; bỏ qua bước validate TOML bổ sung."
}
[IO.File]::WriteAllText($configPath, $updatedConfig, [Text.UTF8Encoding]::new($false))
[Environment]::SetEnvironmentVariable("LTN_TEAM_API_KEY", $TeamApiKey, "User")
$env:LTN_TEAM_API_KEY = $TeamApiKey
$clientId = Get-OrCreateClientId
[Environment]::SetEnvironmentVariable("LTN_CLIENT_ID", $clientId, "User")
$env:LTN_CLIENT_ID = $clientId
$gatewayRoot = $GatewayBaseUrl -replace '/v1$', ''
[Environment]::SetEnvironmentVariable("NINEROUTER_URL", $gatewayRoot, "User")
[Environment]::SetEnvironmentVariable("NINEROUTER_KEY", $TeamApiKey, "User")
$env:NINEROUTER_URL = $gatewayRoot
$env:NINEROUTER_KEY = $TeamApiKey
$env:LTN_BROWSER_BRIDGE_TOKEN = $browserBridgeToken

$runtimeConfigStatus = Test-CodexManagedRuntimeConfig -ConfigPath $configPath
if ($runtimeConfigStatus.Supported) {
  if (-not $runtimeConfigStatus.ConfigValid) {
    Write-Warning "Codex CLI hiện tại chưa xác minh được MCP simi_browser; cấu hình đã được cài và có thể kiểm tra lại bằng Status."
  } elseif (-not $runtimeConfigStatus.Provider) {
    Write-Warning "Cấu hình model_provider=ltn_gateway chưa được xác nhận; hãy chạy Status sau khi mở Terminal mới."
  } elseif (-not $runtimeConfigStatus.BrowserMcp) {
    Write-Warning "Codex chưa xác nhận MCP simi_browser; hãy chạy Status sau khi mở Terminal mới."
  } else {
    Write-Host "  Codex runtime config: provider ltn_gateway + MCP simi_browser OK"
  }
} else {
  Write-Warning "Chưa thể gọi Codex để kiểm tra config; installer đã ghi config.toml và MCP simi_browser."
}

$installedCodexStatus = Get-CodexCommandStatus
Write-Host ""
Write-Host "Cài đặt LTN Codex hoàn tất."
Write-Host "  Hệ điều hành: Windows"
Write-Host "  Codex CLI: $(if ($installedCodexStatus.Healthy) { $installedCodexStatus.Version } else { "chưa xác định" })"
Write-Host "  Gateway: $GatewayBaseUrl"
Write-Host "  Model mặc định: $defaultModel"
Write-Host "  Browser: MCP tự động, profile đăng nhập được giữ lại"
Write-Host ""
Write-Host "Bước tiếp theo:"
Write-Host "  1. Mở cửa sổ PowerShell hoặc Command Prompt mới."
Write-Host "  2. Kiểm tra: codex --version"
Write-Host "  3. Khởi động: codex"
Write-Host "  4. Prompt trực tiếp: Vào URL này tôi đã login và kiểm tra dữ liệu."
if (-not $configChanged) {
  Write-Host "  Cấu hình không đổi: chỉ tạo New chat, không cần đóng/mở hoặc đăng nhập lại."
} else {
  Write-Host "  Provider/MCP đã thay đổi: đóng và mở lại Codex Desktop một lần để giao diện nạp cấu hình mới."
}
