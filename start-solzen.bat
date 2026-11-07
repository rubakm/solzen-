@echo off
title SOLZEN dev

rem --- Backend (contact form + admin) in its own window ---
start "SOLZEN backend" cmd /k "cd /d %~dp0backend && (if not exist node_modules npm install) && npm start"

rem --- Website ---
cd /d "%~dp0frontend"
if not exist node_modules (
  echo Installing dependencies, first run only...
  call npm install
)
echo Starting SOLZEN on http://localhost:5173  (admin: Ctrl + Alt + A)
call npm run dev -- --open
pause
