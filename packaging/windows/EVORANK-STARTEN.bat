@echo off
setlocal
title EvoRank X5.8
set "EVORANK_PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%EVORANK_PS%" set "EVORANK_PS=powershell.exe"
"%EVORANK_PS%" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0EVORANK-SERVER.ps1"
if errorlevel 1 (
  echo.
  echo EVORANK konnte nicht gestartet werden.
  echo Falls Node.js installiert ist, nutze EVORANK-START-MIT-NODE.bat.
  pause
)
endlocal
