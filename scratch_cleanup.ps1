$ErrorActionPreference = "SilentlyContinue"

Write-Host "=== EduTrack Repository Cleanup Execution ===" -ForegroundColor Cyan

$deletedFiles = @()
$deletedDirs = @()

$targetFiles = @(
    "scratch_master_migrate.ps1",
    "scratch_copy_backend_extras.js",
    "scratch_copy_frontend.js",
    "scratch_copy_mobile.js",
    "scratch_copy_prisma.js",
    "scratch_migrate.js",
    "execute_physical_migration.js",
    "verification-report.json",
    "apps\api\test.txt",
    "Thumbs.db",
    ".DS_Store"
)

foreach ($f in $targetFiles) {
    if (Test-Path $f) {
        Remove-Item -Path $f -Force -ErrorAction SilentlyContinue
        $deletedFiles += $f
    }
}

if (Test-Path "migration-backup") {
    Remove-Item -Path "migration-backup" -Recurse -Force -ErrorAction SilentlyContinue
    $deletedDirs += "migration-backup/"
}

if (Test-Path "scratch_verify.ps1") {
    Remove-Item -Path "scratch_verify.ps1" -Force -ErrorAction SilentlyContinue
    $deletedFiles += "scratch_verify.ps1"
}

Write-Host "Cleanup completed successfully." -ForegroundColor Green
