@echo off
REM One-click Vercel deploy for the EVOLVE lifestyle site.
REM You only interact with the login prompt the first time.
cd /d "%~dp0"
echo.
echo === EVOLVE  -  Vercel deploy ===
echo If this is your first time, a browser/login prompt will appear.
echo.
call npx --yes vercel@latest login
echo.
echo Deploying to production...
call npx --yes vercel@latest --prod --yes
echo.
echo Done. The https://...vercel.app URL above is your live site.
pause
