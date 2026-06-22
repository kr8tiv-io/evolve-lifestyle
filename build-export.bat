@echo off
cd /d "C:\Users\lucid\Desktop\evolve-lifestyle"
set NEXT_EXPORT=1
call npm run build
echo EXPORT_DONE_EXITCODE=%ERRORLEVEL%
