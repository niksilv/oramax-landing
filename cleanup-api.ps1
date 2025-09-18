$DetDir = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing\public\detector"

# Σάρωσε όλα τα .js και .html
$files = Get-ChildItem $DetDir -Recurse -Include *.js,*.html

foreach ($f in $files) {
    $txt = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8

    # 1) Ό,τι έχει localhost base -> window.API_BASE
    $txt = $txt -replace "http://localhost:8000/exoplanet","window.API_BASE"
    $txt = $txt -replace "http://127\.0\.0\.1:8000/exoplanet","window.API_BASE"

    # 2) Normalize const API_BASE = ... ;
    $txt = [regex]::Replace($txt, "\bconst\s+API_BASE\s*=\s*[^;]+;", "const API_BASE = window.API_BASE;", "IgnoreCase")

    Set-Content -LiteralPath $f.FullName -Value $txt -Encoding UTF8
    Write-Host "Patched $($f.Name)"
}

Write-Host "✅ Όλα τα detector αρχεία καθαρίστηκαν"
