$env:Path = "C:\Program Files\nodejs;" + $env:Path
Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:Path = 'C:\Program Files\nodejs;' + `$env:Path; cd backend; npm run dev }"
Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:Path = 'C:\Program Files\nodejs;' + `$env:Path; cd frontend; npm run dev }"
Write-Host "Servers started in new windows."
