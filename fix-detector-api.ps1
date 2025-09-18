param(
  [switch]$NoPush = $false
)

# ----- SETTINGS -----
$LandingPath   = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing"
$DetDir        = Join-Path $LandingPath "public\detector"
$IndexPath     = Join-Path $DetDir "index.html"
$ApiBaseJsPath = Join-Path $DetDir "api-base.js"
$NextConfig    = Join-Path $LandingPath "next.config.js"

function Die($msg){ Write-Error $msg; exit 1 }

if (!(Test-Path $LandingPath)) { Die "Landing path not found: $LandingPath" }
if (!(Test-Path $DetDir))      { Die "Detector dir not found: $DetDir" }
if (!(Test-Path $IndexPath))   { Die "index.html not found: $IndexPath" }

Write-Host "== OramaX detector API fix ==" -ForegroundColor Cyan

# 1) Ensure api-base.js (defines window.API_BASE)
if (!(Test-Path $ApiBaseJsPath)) {
$apiJs = @'
(() => {
  try {
    const qs = new URLSearchParams(location.search);
    const apiOverride = qs.get('api'); // optional override ?api=<full-base>

    const host = location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    const API_BASE = apiOverride
      ? apiOverride.replace(/\/$/, '')
      : (isLocal ? 'http://localhost:8000/exoplanet'
                 : '/detector/api/exoplanet');

    window.API_BASE = API_BASE;
    console.log('[OramaX] API_BASE =', API_BASE);
  } catch (e) {
    console.error('[OramaX] Failed to set API_BASE', e);
  }
})();
'@
  Set-Content -LiteralPath $ApiBaseJsPath -Value $apiJs -Encoding UTF8
  Write-Host "Created api-base.js"
}

# 2) Inject <script src="api-base.js?..."> into <head> (or before first <script>)
$index = Get-Content -LiteralPath $IndexPath -Raw -Encoding UTF8
$ts = (Get-Date).ToString('yyyyMMddHHmmss')
$inject = "<script src=""api-base.js?v=$ts""></script>"

if ($index -notmatch 'api-base\.js') {
  if ($index -match '</head>') {
    $index = $index -replace '</head>', ("  $inject`r`n</head>")
  } elseif ($index -match '<script') {
    $index = $index -replace '<script', ($inject + "`r`n<script")
  } else {
    $index = $inject + "`r`n" + $index
  }
  Set-Content -LiteralPath $IndexPath -Value $index -Encoding UTF8
  Write-Host "Injected api-base.js into index.html"
} else {
  $index = $index -replace 'api-base\.js(\?v=\d+)?', "api-base.js?v=$ts"
  Set-Content -LiteralPath $IndexPath -Value $index -Encoding UTF8
  Write-Host "Refreshed api-base.js cache-bust in index.html"
}

# 3) Mass replace hardcoded bases and unify on window.API_BASE
$files = Get-ChildItem $DetDir -Recurse -Include *.js,*.html
foreach ($f in $files) {
  $text = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8

  # 3a) Replace any hardcoded localhost base with window.API_BASE
  $text = $text -replace 'https?://localhost:8000/exoplanet/?', 'window.API_BASE'
  $text = $text -replace 'https?://127\.0\.0\.1:8000/exoplanet/?', 'window.API_BASE'

  # 3b) Normalize "const API_BASE = ..." to window.API_BASE
  $text = [regex]::Replace($text, '\bconst\s+API_BASE\s*=\s*[^;]+;', 'const API_BASE = window.API_BASE;', 'IgnoreCase')

  # 3c) Replace fetch("http://localhost:8000/exoplanet/...") with fetch(window.API_BASE + "/...")
  $text = [regex]::Replace(
    $text,
    'fetch\(\s*["'']https?://(localhost|127\.0\.0\.1):8000/exoplanet/([^"''\s]+)',
    'fetch(window.API_BASE + "/$2"',
    'IgnoreCase'
  )

  Set-Content -LiteralPath $f.FullName -Value $text -Encoding UTF8
}

Write-Host "Patched detector files."

# 4) Ensure Vercel rewrites to Fly in next.config.js
$desiredNext = @"
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/detector/api/:path*',
        destination: 'https://oramax-app.fly.dev/:path*',
      },
    ];
  },
  async headers() {
    return [
      { source: '/detector/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};
module.exports = nextConfig;
"@

if (!(Test-Path $NextConfig)) {
  Set-Content -LiteralPath $NextConfig -Value $desiredNext -Encoding UTF8
  Write-Host "Created next.config.js with rewrites."
} else {
  $nc = Get-Content -LiteralPath $NextConfig -Raw -Encoding UTF8
  if ($nc -notmatch '/detector/api/') {
    Copy-Item -LiteralPath $NextConfig -Destination "$NextConfig.bak.$ts" -Force
    Set-Content -LiteralPath $NextConfig -Value $desiredNext -Encoding UTF8
    Write-Host "Rewrote next.config.js (backup saved)."
  } else {
    Write-Host "next.config.js already includes detector rewrites."
  }
}

# 5) Cache-bust common assets in index.html
$index = Get-Content -LiteralPath $IndexPath -Raw -Encoding UTF8
foreach ($name in @('app.js','hook.js','engine-toggle.js','oramax-ml-toggle.js','detector.js','main.js','styles.css')) {
  $pattern = [regex]::Escape($name) + '(\?v=\d+)?'
  $index = [regex]::Replace($index, $pattern, "$name?v=$ts", 'IgnoreCase')
}
Set-Content -LiteralPath $IndexPath -Value $index -Encoding UTF8
Write-Host "Updated cache-bust in index.html"

# 6) git commit & push
if (-not $NoPush) {
  Push-Location $LandingPath
  git add public next.config.js | Out-Null
  git commit -m "fix(detector): unify API_BASE via window.API_BASE + Vercel proxy + cache-bust" -ErrorAction SilentlyContinue | Out-Null
  git push origin main
  Pop-Location
  Write-Host "Pushed changes — Vercel will redeploy." -ForegroundColor Green
} else {
  Write-Host "Skipped push (NoPush). Inspect and commit manually." -ForegroundColor Yellow
}

Write-Host "Done."
