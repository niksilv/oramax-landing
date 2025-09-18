param(
  [string]$RepoRoot = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing",
  [string]$Message = "UI update"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Die($m){ Write-Error $m; exit 1 }

if (-not (Test-Path $RepoRoot)) { Die "Repo not found: $RepoRoot" }
Set-Location $RepoRoot

git add -A
if (git diff --cached --quiet) {
  Write-Host "No changes to commit"
} else {
  git commit -m $Message
}
git pull --rebase
git push origin HEAD
Write-Host "✅ Pushed to GitHub"
