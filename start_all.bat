@echo off
rem -------------------------------------------------
rem  Vini - Start Full Stack (Backend + Frontend)
rem -------------------------------------------------

echo Starting Vini Backend Server...
start "Vini Backend" cmd /k "cd /d c:\VINI anti\vini\server && npm run dev"

echo Starting Vini Frontend Web App...
start "Vini Frontend" cmd /k "cd /d c:\VINI anti\vini && npm run dev"

echo Done! Server and Frontend are launching in separate windows.
