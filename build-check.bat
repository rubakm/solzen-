@echo off
cd /d "%~dp0frontend"
echo Building SOLZEN...
call npm run build > "%~dp0build-log.txt" 2>&1
echo Build finished with code %ERRORLEVEL% >> "%~dp0build-log.txt"
