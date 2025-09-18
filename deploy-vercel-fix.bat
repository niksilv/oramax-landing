@echo off
setlocal

REM === Πήγαινε στο project ===
cd /d "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing"

REM === Δημιούργησε το απαιτούμενο stub αν λείπει ===
if not exist "app\contact" mkdir "app\contact"

(
echo export const metadata = { title: "Contact - OramaX" };
echo export default function ContactPage() {
echo ^  return (
echo ^    <main style={{padding:"24px",fontFamily:"system-ui,sans-serif"}}>
echo ^      <h1>Contact</h1>
echo ^      <p>This is a placeholder Contact page so the build can succeed.</p>
echo ^    </main>
echo ^  );
echo }
) > "app\contact\page.js"

echo.
echo === Manual deploy to Vercel (production) ===
echo (θα χρειαστείς `vercel login` και `vercel link` αν δεν έγιναν ήδη)
vercel deploy --prod --yes

echo.
echo === Done. Check the production URL shown above. ===
pause
