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
    $modelLine = [regex]::Match($configText, '(?m)^\s*model\s*=\s*"([^"]+)"\s*$')
    Write-Host "  LTN Gateway config: $(if ($hasLtnProvider) { "có" } else { "chưa có" })"
    if ($modelLine.Success) {
      Write-Host "  Model mặc định: $($modelLine.Groups[1].Value)"
    }
  } else {
    Write-Host "  LTN Gateway config: chưa có"
  }

  $keyConfigured = -not [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable("LTN_TEAM_API_KEY", "User"))
  $clientConfigured = -not [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable("LTN_CLIENT_ID", "User"))
  Write-Host "  API key team: $(if ($keyConfigured) { "đã lưu" } else { "chưa lưu" })"
  Write-Host "  Client ID: $(if ($clientConfigured) { "đã tạo" } else { "chưa tạo" })"
  Write-Host "  Gateway health: $(Test-GatewayHealth -BaseUrl $GatewayBaseUrl)"
  Write-Host "  Wrapper dir: $BinDir"
}

function Invoke-LtnUninstall {
  param(
    [string]$ConfigPath,
    [string]$BinDir
  )

  if (Test-Path $ConfigPath) {
    $existingConfig = [IO.File]::ReadAllText($ConfigPath)
    $cleanedConfig = Update-CodexConfig -ExistingContent $existingConfig -ManagedContent ""
    [IO.File]::WriteAllText($ConfigPath, $cleanedConfig, [Text.UTF8Encoding]::new($false))
  }
  foreach ($wrapper in @("codex-fast.cmd", "codex-power.cmd")) {
    $wrapperPath = Join-Path $BinDir $wrapper
    if (Test-Path $wrapperPath) {
      Remove-Item -LiteralPath $wrapperPath -Force
    }
  }
  [Environment]::SetEnvironmentVariable("LTN_TEAM_API_KEY", $null, "User")
  [Environment]::SetEnvironmentVariable("LTN_CLIENT_ID", $null, "User")
  Remove-Item Env:LTN_TEAM_API_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:LTN_CLIENT_ID -ErrorAction SilentlyContinue
  Write-Host "Đã gỡ cấu hình LTN Gateway, wrapper, LTN_TEAM_API_KEY và LTN_CLIENT_ID. Codex CLI không bị gỡ."
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

Write-Host "Đang xác minh Combo trên 9Router qua Gateway..."
$headers = @{ Authorization = "Bearer $TeamApiKey" }
try {
  $remoteConfig = Invoke-RestMethod -Method Get -Uri "$GatewayBaseUrl/codex/config" -Headers $headers
  $comboPremium = [string](Get-ObjectPropertyValue -Object $remoteConfig.combos -Name "premium")
  $comboFree = [string](Get-ObjectPropertyValue -Object $remoteConfig.combos -Name "free")
  $routingMode = [string](Get-ObjectPropertyValue -Object $remoteConfig.routing -Name "mode")
} catch {
  throw "Gateway chưa cung cấp đủ cấu hình Codex Premium/Free. Admin cần cấu hình CODEX_COMBO_PREMIUM/CODEX_COMBO_FREE hoặc aiPolicy của team. Chi tiết: $($_.Exception.Message)"
}

$requiredCombos = if ($routingMode -eq "free_only") {
  $comboFree = Confirm-ComboIdSyntax -ComboId $comboFree -Name "combos.free"
  $defaultModel = $comboFree
  @($comboFree)
} elseif ($routingMode -eq "premium_always") {
  $comboPremium = Confirm-ComboIdSyntax -ComboId $comboPremium -Name "combos.premium"
  $defaultModel = $comboPremium
  @($comboPremium)
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
env_http_headers = { "X-LTN-Client-ID" = "LTN_CLIENT_ID" }
"@

$updatedConfig = Update-CodexConfig -ExistingContent $existingConfig -ManagedContent $configContent
[IO.File]::WriteAllText($configPath, $updatedConfig, [Text.UTF8Encoding]::new($false))
[Environment]::SetEnvironmentVariable("LTN_TEAM_API_KEY", $TeamApiKey, "User")
$env:LTN_TEAM_API_KEY = $TeamApiKey
$clientId = Get-OrCreateClientId
[Environment]::SetEnvironmentVariable("LTN_CLIENT_ID", $clientId, "User")
$env:LTN_CLIENT_ID = $clientId

Write-Host ""
Write-Host "Cài đặt hoàn tất."
Write-Host "  Gateway: $GatewayBaseUrl"
Write-Host "  Model mặc định: $defaultModel"
Write-Host "  Sử dụng: codex"
