@echo off
setlocal
cd /d "%~dp0"
rem ---- Set by Claude once your GitHub repo exists ----
set REPO_URL=https://github.com/rubakm/solzen-.git
echo Publishing SOLZEN to %REPO_URL% ...
echo (If a GitHub sign-in window opens, sign in and approve.)
call :main > "%~dp0publish-log.txt" 2>&1
type "%~dp0publish-log.txt"
echo.
echo Finished. You can close this window.
pause
exit /b

:main
where git || (echo ERROR: Git is not installed. Get it from https://git-scm.com & exit /b 1)
rem Keep the backend lock file in sync (adds the MongoDB package)
pushd backend
call npm install --no-audit --no-fund
popd
if not exist .git git init -b main
git config user.name >nul || git config user.name "Rubak M"
git config user.email >nul || git config user.email "info@solzen.in"
git add -A
git commit -m "SOLZEN website: refreshed design, admin panel, gallery, MongoDB storage"
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin main
echo EXIT CODE %ERRORLEVEL%
exit /b
