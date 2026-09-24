@echo off
setlocal
title EvoRank X6.1 - Node-Fallback
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js wurde nicht gefunden.
  echo Nutze bitte EVORANK.exe oder EVORANK-STARTEN.bat.
  pause
  exit /b 1
)
node "%~dp0EVORANK-NODE-SERVER.mjs"
if errorlevel 1 pause
endlocal
