@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js 24 LTS is required. Install Node.js and reopen this file.
  pause
  exit /b 1
)
node "%~dp0scripts\start-studio.mjs" %*
set "studio_exit=%errorlevel%"
if not "%studio_exit%"=="0" (
  echo.
  echo [ERROR] Studio stopped. See the message above.
  if not "%~1"=="--prepare" pause
)
exit /b %studio_exit%
