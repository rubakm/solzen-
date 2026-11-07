@echo off
cd /d "%~dp0"
call :main > push-log.txt 2>&1
exit /b
:main
git add -A
git commit -m "Backend: keep running when the database is unreachable; report DB status in /health" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_019RSjnkFC87eqSPbCYuw4rm"
git push origin main
echo PUSH_DONE
exit /b
