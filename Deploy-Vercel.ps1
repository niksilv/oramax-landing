param(
  [string]$RepoRoot = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing",
  [switch]$Prod
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Die($m){ Write-Error $m; exit 1 }

if (-not (Test-Path $RepoRoot)) { Die "Repo not found: $RepoRoot" }
Set-Location $RepoRoot

if (-not (Test-Path ".vercel")) {
  vercel login
  vercel link
}

if ($Prod) {
  vercel --prod
} else {
  vercel
}

Write-Host "✅ Vercel deploy complete"
