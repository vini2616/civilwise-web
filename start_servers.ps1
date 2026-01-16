$root = "c:\backup\VINI anti\vini"

Write-Host "Starting Vini Servers in separate windows..."

# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\server'; npm run dev"

# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run dev"

# Mobile
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\vini-mobile'; npm start"

Write-Host "All servers launched!"
