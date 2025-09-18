param([switch]$SkipFly = $false)

$Landing = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing"
$Api     = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-exoplanet-api\web"

Write-Host "== Deploy OramaX ==" -ForegroundColor Cyan

# 1) UI β†’ Vercel (git push)
Push-Location $Landing
git add public
git commit -m "deploy(detector): latest fixes & patches" -ErrorAction SilentlyContinue | Out-Null
git push origin main
Pop-Location
Write-Host "β” UI pushed to GitHub (Vercel auto-deploy)" -ForegroundColor Green

# 2) API β†’ Fly.io (Ξ±Ξ½ Ξ΄ΞµΞ½ Ξ΄ΞΏΞΈΞµΞ― -SkipFly)
if (-not $SkipFly) {
    Push-Location $Api
    flyctl deploy --app oramax-app --remote-only
    Pop-Location
    Write-Host "β” API deploy triggered to Fly.io (oramax-app)" -ForegroundColor Green
}

Write-Host "== Done. Open ==" -ForegroundColor Cyan
Write-Host " UI : https://www.oramax.space/detector/"
Write-Host " API: https://oramax-app.fly.dev/docs"
