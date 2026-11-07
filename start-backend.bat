@echo off
title SOLZEN backend
cd /d "%~dp0backend"
if not exist node_modules (
  echo Installing backend dependencies, first run only...
  call npm install
)
echo SOLZEN backend running. Keep this window open. Log: backend-log.txt
call npm start > "%~dp0backend-log.txt" 2>&1
type "%~dp0backend-log.txt"
pause
