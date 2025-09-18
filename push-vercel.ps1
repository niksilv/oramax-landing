# save as: push-vercel.ps1
param(
  [string]$RepoRoot = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing",
  [string]$Subdir   = "public\predictor",   # άλλαξέ το σε public\detector αν χρειάζεται
  [string]$Branch   = "main",
  [string]$Message  = "deploy: update $Subdir"
)

function Die($m){ Write-Error $m; exit 1 }

# 1) Go to repo & basic checks
if (!(Test-Path $RepoRoot)) { Die "Repo not found: $RepoRoot" }
Set-Location $RepoRoot

if (!(Test-Path (Join-Path $RepoRoot $Subdir))) {
  Die "Subdir not found: $(Join-Path $RepoRoot $Subdir)"
}

Write-Host "== Pushing $Subdir to GitHub → Vercel auto-deploy ==" -ForegroundColor Cyan

# 2) Sync branch (avoid conflicts)
git fetch origin $Branch | Out-Null
git rev-parse --abbrev-ref HEAD | Select-Object -First 1 | ForEach-Object {
  if ($_ -ne $Branch) { git checkout $Branch | Out-Null }
}
git pull --rebase origin $Branch

# 3) Stage only the target subdir (include deletions)
# The trailing '.\' helps 'git add' track deletions inside the subdir
$SubdirFull = Join-Path $RepoRoot $Subdir
git add -A "$SubdirFull\." 2>$null

# Optional: add common config files if άλλαξαν
if (Test-Path ".\next.config.js") { git add ".\next.config.js" | Out-Null }
if (Test-Path ".\vercel.json")    { git add ".\vercel.json"    | Out-Null }

# 4) Commit (if there’s something to commit)
$pending = git status --porcelain
if ([string]::IsNullOrWhiteSpace($pending)) {
  Write-Host "No changes detected in $Subdir. Nothing to commit." -ForegroundColor Yellow
} else {
  git commit -m $Message
}

# 5) Push → triggers Vercel build
git push origin $Branch

Write-Host "Done. Vercel will pick up the new commit and deploy." -ForegroundColor Green
Write-Host "Check: https://vercel.com/dashboard (project: oramax-landing)" -ForegroundColor Cyan
