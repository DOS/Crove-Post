<#
.SYNOPSIS
    Automated build and test for all applications in Crove monorepo.
.DESCRIPTION
    Automates parallel/sequential builds for:
    - apps/web (Landing page Next.js)
    - apps/frontend (App Dashboard Next.js)
    - apps/backend (API NestJS)
    - apps/orchestrator (Temporal Background Jobs)
    - apps/crove-sso (Cloudflare Worker SSO Bridge)
.EXAMPLE
    .\scripts\build-all.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CROVE MONOREPO - FULL BUILD & VALIDATION" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Build & Test SSO Worker
Write-Host "`n[1/4] Build & Test Cloudflare Worker SSO (@crove/sso)..." -ForegroundColor Green
pnpm --filter @crove/sso test
if ($LASTEXITCODE -ne 0) { Write-Error "SSO Test failed!"; exit 1 }

# 2. Build Landing Page
Write-Host "`n[2/4] Build Landing Page (@crove/web)..." -ForegroundColor Green
pnpm --filter @crove/web run build
if ($LASTEXITCODE -ne 0) { Write-Error "Web Build failed!"; exit 1 }

# 3. Prisma Generate
Write-Host "`n[3/4] Generate Prisma Client..." -ForegroundColor Green
pnpm run prisma-generate

# 4. Build Core Apps
Write-Host "`n[4/4] Build Core Backend & Frontend..." -ForegroundColor Green
pnpm run build

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  ALL APPLICATIONS BUILT SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
