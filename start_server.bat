@echo off
rem Navigate to server directory
cd /d "c:\VINI anti\vini\server"
rem Install dependencies
npm install
rem Start the server in development mode
npm run dev
