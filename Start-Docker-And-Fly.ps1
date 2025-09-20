param(
  [string]$RepoRoot = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing",
  [string]$AppName  = "oramax-ui"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Die($m){ Write-Error $m; exit 1 }

# 1) Docker Desktop check/start
$dockerOk = $false
try { docker version | Out-Null; $dockerOk = $true } catch { $dockerOk = $false }

if (-not $dockerOk) {
  $pf = $env:ProgramFiles
  $pfx86 = ${env:ProgramFiles(x86)}
  $localApp = $env:LocalAppData

  $candidatePaths = @(
    (Join-Path $pf "Docker\Docker\Docker Desktop.exe"),
    ($(if ($pfx86) { Join-Path $pfx86 "Docker\Docker\Docker Desktop.exe" } )),
    (Join-Path $localApp "Docker\Docker\Docker Desktop.exe")
  ) | Where-Object { $_ -and (Test-Path $_) }

  $candidatePaths = @($candidatePaths)  # force array

  if (-not $candidatePaths -or $candidatePaths.Count -eq 0) {
    Die "Docker Desktop not found. Install: https://www.docker.com/products/docker-desktop/"
  }

  if (-not (Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $candidatePaths[0] | Out-Null
  }

  # Wait for daemon
  $tries = 120
  while ($tries -gt 0) {
    try { docker info | Out-Null; break } catch { Start-Sleep -Seconds 2; $tries-- }
  }
  if ($tries -le 0) { Die "Docker is not ready. Open Docker Desktop and try again." }
}

# 2) Local build & deploy to Fly
if (-not (Test-Path -LiteralPath $RepoRoot)) { Die "Repo not found: $RepoRoot" }
Set-Location $RepoRoot

fly deploy -a $AppName --local-only
Write-Host "OK: Fly local deploy completed."
