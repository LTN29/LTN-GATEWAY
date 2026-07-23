$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$installerUri = [Uri]"https://ai.simi.vn/install/codex-full.ps1"
if ($installerUri.Scheme -ne "https") {
  throw "Codex installer chỉ được tải qua HTTPS."
}
if ($installerUri.Host -ne "ai.simi.vn") {
  throw "Codex installer phải được tải từ ai.simi.vn."
}
if ([string]::IsNullOrWhiteSpace($env:TEMP)) {
  throw "Không tìm thấy thư mục TEMP của Windows."
}

$tempInstaller = Join-Path $env:TEMP (
  "ltn-codex-installer-{0}.ps1" -f [Guid]::NewGuid().ToString("N")
)

try {
  Invoke-WebRequest `
    -UseBasicParsing `
    -Uri $installerUri.AbsoluteUri `
    -OutFile $tempInstaller `
    -MaximumRedirection 0

  if (-not (Test-Path -LiteralPath $tempInstaller -PathType Leaf)) {
    throw "Không tải được Codex installer."
  }

  & $tempInstaller
} finally {
  if (Test-Path -LiteralPath $tempInstaller) {
    Remove-Item -LiteralPath $tempInstaller -Force -ErrorAction SilentlyContinue
  }
}
