@echo off
cd /d "%~dp0"
title Meas Server
set PORT=8765

echo ==========================================
echo  Meas (Sansou) local server
echo  Uses PowerShell only - no Python/Node needed.
echo  Browser opens automatically in a couple seconds.
echo  Close this window to stop the server.
echo ==========================================
echo.

start "" /b cmd /c "timeout /t 2 >nul & start http://localhost:%PORT%/meas.html"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0meas_server.ps1" -Port %PORT%
