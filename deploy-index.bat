@echo off
setlocal

REM === Path του UI repo ===
cd /d "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing"

echo.
echo === Pull latest (avoid conflicts) ===
git pull --rebase

echo.
echo === Stage ONLY the correct index ===
git add "public\detector\index.html"

echo.
echo === Commit ===
git commit -m "deploy(detector): update public/detector/index.html"

echo.
echo === Push to main (Vercel auto-deploy) ===
git push origin main

echo.
echo === Done. Check Vercel dashboard and open the page in Incognito ===
echo     https://www.oramax.space/detector/
pause
