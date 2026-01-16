@echo off
rem -------------------------------------------------------------
rem  Vini - Start Full Stack (Backend + Frontend + Mobile)
rem -------------------------------------------------------------

set "ROOT_DIR=%~dp0"

echo Starting Vini Backend Server...
start "Vini Backend" cmd /k "cd /d "%ROOT_DIR%server" && npm run dev"

echo Starting Vini Frontend Web App...
start "Vini Frontend" cmd /k "cd /d "%ROOT_DIR%" && npm run dev"

echo Starting Vini Mobile App...
start "Vini Mobile" cmd /k "cd /d "%ROOT_DIR%vini-mobile" && npm start"

echo Done! All 3 services are launching in separate windows.
