@echo off
cd /d "%~dp0"
title Reminder Widget
set PORT=8765

echo ==========================================
echo  Reminder widget
echo  A small window opens in a couple seconds.
echo  Close this window to stop the server.
echo ==========================================
echo.

REM 既にサーバーが動いていれば二重起動しないよう軽くチェック
powershell -Command "try { (New-Object Net.Sockets.TcpClient).Connect('127.0.0.1', %PORT%); exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
  echo Server already running on port %PORT%.
  goto openwindow
)

start "" /min cmd /c "cd /d ""%~dp0"" && (where python >nul 2>&1 && python -m http.server %PORT% || (where py >nul 2>&1 && py -m http.server %PORT% || npx --yes http-server -p %PORT% -c-1))"

:openwindow
timeout /t 2 >nul

set CHROME=
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe

if not "%CHROME%"=="" (
  start "" "%CHROME%" --app=http://localhost:%PORT%/widget.html --window-size=340,520
) else (
  start "" http://localhost:%PORT%/widget.html
)
