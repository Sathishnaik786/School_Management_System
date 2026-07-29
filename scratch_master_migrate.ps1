Write-Host "=== EduTrack Enterprise Physical Migration Execution ===" -ForegroundColor Cyan

# Step 1: Backup Placeholders if present (Safety Checks)
if ((Test-Path "apps\api") -and (-not (Test-Path "apps\api_placeholder"))) {
    Write-Host "[1/6] Safe Backup: apps/api -> apps/api_placeholder" -ForegroundColor Yellow
    Rename-Item -Path "apps\api" -NewName "api_placeholder"
}

if ((Test-Path "apps\web") -and (-not (Test-Path "apps\web_placeholder"))) {
    Write-Host "[2/6] Safe Backup: apps/web -> apps/web_placeholder" -ForegroundColor Yellow
    Rename-Item -Path "apps\web" -NewName "web_placeholder"
}

if ((Test-Path "apps\mobile") -and (-not (Test-Path "apps\mobile_placeholder"))) {
    Write-Host "[3/6] Safe Backup: apps/mobile -> apps/mobile_placeholder" -ForegroundColor Yellow
    Rename-Item -Path "apps\mobile" -NewName "mobile_placeholder"
}

# Step 2: Move original application source trees safely
if (Test-Path "backend") {
    Write-Host "[4/6] Relocating: backend -> apps/api" -ForegroundColor Green
    Move-Item -Path "backend" -Destination "apps\api"
}

if (Test-Path "frontend") {
    Write-Host "[5/6] Relocating: frontend -> apps/web" -ForegroundColor Green
    Move-Item -Path "frontend" -Destination "apps\web"
}

if (Test-Path "mobile-app") {
    Write-Host "[6/6] Relocating: mobile-app -> apps/mobile" -ForegroundColor Green
    Move-Item -Path "mobile-app" -Destination "apps\mobile"
}

# Step 3: Remove stale node_modules to guarantee fresh dependency tree
Write-Host "`n[Clean-up] Removing stale node_modules from target workspaces for fresh install..." -ForegroundColor Yellow
if (Test-Path "apps\api\node_modules") {
    Remove-Item -Path "apps\api\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "apps\web\node_modules") {
    Remove-Item -Path "apps\web\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "apps\mobile\node_modules") {
    Remove-Item -Path "apps\mobile\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "=== Physical Directory Relocation Completed Successfully ===" -ForegroundColor Cyan
