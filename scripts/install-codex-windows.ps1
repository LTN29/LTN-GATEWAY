[CmdletBinding()]
param(
  [string]$GatewayBaseUrl = $(if ($env:LTN_GATEWAY_BASE_URL) { $env:LTN_GATEWAY_BASE_URL } else { "https://ai.simi.vn/v1" }),
  [ValidateSet("auto", "profiles")]
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

function Update-CodexConfig {
  param(
    [string]$ExistingContent,
    [string]$ManagedContent
  )

  $lines = @($ExistingContent -split "\r?\n")
  $kept = [System.Collections.Generic.List[string]]::new()
  $insideManagedProvider = $false
  $hasSeenTable = $false

  foreach ($line in $lines) {
    if ($line -match '^\s*\[model_providers\.ltn_gateway\]\s*$') {
      $insideManagedProvider = $true
      $hasSeenTable = $true
      continue
    }
    if ($insideManagedProvider -and $line -match '^\s*\[') {
      $insideManagedProvider = $false
    }
    if ($insideManagedProvider) { continue }
    if ($line -match '^\s*\[') { $hasSeenTable = $true }
    if (-not $hasSeenTable -and $line -match '^\s*model\s*=') { continue }
    if (-not $hasSeenTable -and $line -match '^\s*model_provider\s*=') { continue }
    if ($line -match '^\s*# Managed by LTN Codex installer\.\s*$') { continue }
    if ($line -match '^\s*# Change Combo members and fallback order in 9Router, not on this machine\.\s*$') { continue }
    $kept.Add($line)
  }

  $preserved = ($kept -join [Environment]::NewLine).Trim()
  if ($preserved) {
    return $ManagedContent.Trim() + [Environment]::NewLine + [Environment]::NewLine + $preserved + [Environment]::NewLine
  }
  return $ManagedContent.Trim() + [Environment]::NewLine
}

function Test-ComboIds {
  param(
    [object[]]$Models,
    [string[]]$RequiredIds
  )

  $missing = [System.Collections.Generic.List[string]]::new()
  foreach ($comboId in $RequiredIds) {
    $matches = @($Models | Where-Object { $_.id -eq $comboId })
    if ($matches.Count -eq 0) {
      $missing.Add($comboId)
      continue
    }

    $ownedByValues = @($matches | ForEach-Object { $_.owned_by } | Where-Object { $_ })
    if ($ownedByValues.Count -gt 0 -and -not ($ownedByValues -contains "combo")) {
      throw "Model '$comboId' tồn tại nhưng owned_by không phải 'combo'. Hãy kiểm tra lại trên 9Router Dashboard -> Combos."
    }
  }

  return $missing.ToArray()
}

$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$configPath = Join-Path $codexHome "config.toml"
$binDir = Join-Path $codexHome "bin"

if ($Uninstall) {
  if (Test-Path $configPath) {
    $existingConfig = [IO.File]::ReadAllText($configPath)
    $cleanedConfig = Update-CodexConfig -ExistingContent $existingConfig -ManagedContent ""
    [IO.File]::WriteAllText($configPath, $cleanedConfig, [Text.UTF8Encoding]::new($false))
  }
  foreach ($wrapper in @("codex-fast.cmd", "codex-power.cmd")) {
    $wrapperPath = Join-Path $binDir $wrapper
    if (Test-Path $wrapperPath) {
      Remove-Item -LiteralPath $wrapperPath -Force
    }
  }
  [Environment]::SetEnvironmentVariable("LTN_TEAM_API_KEY", $null, "User")
  Remove-Item Env:LTN_TEAM_API_KEY -ErrorAction SilentlyContinue
  Write-Host "Đã gỡ cấu hình LTN Gateway, wrapper và LTN_TEAM_API_KEY. Codex CLI không bị gỡ."
  return
}

$GatewayBaseUrl = $GatewayBaseUrl.TrimEnd("/")
$comboAuto = Get-ConfiguredValue "CODEX_COMBO_AUTO" ""
$comboFast = Get-ConfiguredValue "CODEX_COMBO_FAST" ""
$comboDefault = Get-ConfiguredValue "CODEX_COMBO_DEFAULT" ""
$comboPower = Get-ConfiguredValue "CODEX_COMBO_POWER" ""

$gatewayUri = $null
if (-not [Uri]::TryCreate($GatewayBaseUrl, [UriKind]::Absolute, [ref]$gatewayUri) -or
    $gatewayUri.Scheme -notin @("http", "https")) {
  throw "GatewayBaseUrl phải là URL HTTP/HTTPS tuyệt đối."
}
if ($gatewayUri.Scheme -ne "https" -and $gatewayUri.Host -notin @("localhost", "127.0.0.1", "::1")) {
  throw "Gateway từ xa phải dùng HTTPS để bảo vệ API key team."
}

if ([string]::IsNullOrWhiteSpace($TeamApiKey)) {
  $secureKey = Read-Host "API key của team" -AsSecureString
  $keyPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  try {
    $TeamApiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPtr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPtr)
  }
}

if ([string]::IsNullOrWhiteSpace($TeamApiKey)) {
  throw "API key của team không được để trống."
}

if ([string]::IsNullOrWhiteSpace($Mode)) {
  Write-Host "Chọn chế độ:"
  Write-Host "  1. Auto đơn giản"
  Write-Host "  2. Fast / Default / Power"
  $choice = Read-Host "Nhập 1 hoặc 2"
  $Mode = if ($choice -eq "1") { "auto" } elseif ($choice -eq "2") { "profiles" } else { throw "Lựa chọn không hợp lệ." }
}

Write-Host "Đang xác minh Combo trên 9Router qua Gateway..."
$headers = @{ Authorization = "Bearer $TeamApiKey" }
if (-not $comboAuto -or -not $comboFast -or -not $comboDefault -or -not $comboPower) {
  try {
    $remoteConfig = Invoke-RestMethod -Method Get -Uri "$GatewayBaseUrl/codex/config" -Headers $headers
    if (-not $comboAuto) { $comboAuto = [string]$remoteConfig.combos.auto }
    if (-not $comboFast) { $comboFast = [string]$remoteConfig.combos.fast }
    if (-not $comboDefault) { $comboDefault = [string]$remoteConfig.combos.default }
    if (-not $comboPower) { $comboPower = [string]$remoteConfig.combos.power }
  } catch {
    throw "Gateway chưa cung cấp đủ cấu hình Codex Combo. Admin cần cấu hình CODEX_COMBO_AUTO/FAST/DEFAULT/POWER trên Mac mini. Chi tiết: $($_.Exception.Message)"
  }
}

$requiredCombos = if ($Mode -eq "auto") {
  @($comboAuto)
} else {
  @($comboFast, $comboDefault, $comboPower)
}
foreach ($comboId in $requiredCombos) {
  if ([string]::IsNullOrWhiteSpace($comboId)) {
    throw "Thiếu Combo ID cho chế độ '$Mode'. Admin cần cấu hình biến CODEX_COMBO_* tương ứng trên Gateway."
  }
  if ($comboId -notmatch '^combo/[A-Za-z0-9._/-]+$') {
    throw "Combo ID không hợp lệ: '$comboId'. Giá trị phải bắt đầu bằng combo/."
  }
}

try {
  $modelResponse = Invoke-RestMethod -Method Get -Uri "$GatewayBaseUrl/models" -Headers $headers
} catch {
  throw "Không gọi được GET $GatewayBaseUrl/models. Kiểm tra Gateway và API key team. Chi tiết: $($_.Exception.Message)"
}

$models = @($modelResponse.data)
$missing = Test-ComboIds -Models $models -RequiredIds $requiredCombos
if ($missing.Count -gt 0) {
  throw "Thiếu Combo trên 9Router: $($missing -join ', '). Hãy tạo tại 9Router Dashboard -> Combos rồi chạy lại installer."
}

if (-not $SkipCodexInstall) {
  if (-not (Get-Command codex -ErrorAction SilentlyContinue)) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
      throw "Chưa có Node.js/npm. Hãy cài Node.js LTS rồi chạy lại installer."
    }
    Write-Host "Đang cài Codex CLI..."
    npm install --global @openai/codex
    if ($LASTEXITCODE -ne 0) { throw "Cài Codex CLI thất bại." }
  }
}

New-Item -ItemType Directory -Force -Path $codexHome, $binDir | Out-Null

$existingConfig = ""
if (Test-Path $configPath) {
  $backupPath = "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $configPath -Destination $backupPath
  $existingConfig = [IO.File]::ReadAllText($configPath)
  Write-Host "Đã sao lưu config cũ: $backupPath"
}

$defaultModel = if ($Mode -eq "auto") { $comboAuto } else { $comboDefault }
$escapedBaseUrl = Escape-TomlString $GatewayBaseUrl
$escapedModel = Escape-TomlString $defaultModel
$configContent = @"
# Managed by LTN Codex installer.
# Change Combo members and fallback order in 9Router, not on this machine.
model = "$escapedModel"
model_provider = "ltn_gateway"

[model_providers.ltn_gateway]
name = "LTN Gateway"
base_url = "$escapedBaseUrl"
env_key = "LTN_TEAM_API_KEY"
wire_api = "responses"
"@

$updatedConfig = Update-CodexConfig -ExistingContent $existingConfig -ManagedContent $configContent
[IO.File]::WriteAllText($configPath, $updatedConfig, [Text.UTF8Encoding]::new($false))
[Environment]::SetEnvironmentVariable("LTN_TEAM_API_KEY", $TeamApiKey, "User")
$env:LTN_TEAM_API_KEY = $TeamApiKey

if ($Mode -eq "profiles") {
  $fastWrapper = @"
@echo off
codex --model "$comboFast" %*
"@
  $powerWrapper = @"
@echo off
codex --model "$comboPower" %*
"@
  [IO.File]::WriteAllText((Join-Path $binDir "codex-fast.cmd"), $fastWrapper, [Text.ASCIIEncoding]::new())
  [IO.File]::WriteAllText((Join-Path $binDir "codex-power.cmd"), $powerWrapper, [Text.ASCIIEncoding]::new())

  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $pathParts = @($userPath -split ";" | Where-Object { $_ })
  if ($pathParts -notcontains $binDir) {
    $newPath = (@($pathParts) + $binDir) -join ";"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path = "$env:Path;$binDir"
  }
}

Write-Host ""
Write-Host "Cài đặt hoàn tất."
Write-Host "  Gateway: $GatewayBaseUrl"
Write-Host "  Model mặc định: $defaultModel"
if ($Mode -eq "auto") {
  Write-Host "  Sử dụng: codex"
} else {
  Write-Host "  Sử dụng: codex-fast | codex | codex-power"
}
Write-Host "Admin có thể đổi model và thứ tự fallback trong 9Router Dashboard -> Combos mà không cần cài lại máy này."
