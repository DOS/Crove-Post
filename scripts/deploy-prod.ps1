<#
.SYNOPSIS
    Automated deployment pipeline for the Crove Production environment (crove.com & post.crove.com).
.DESCRIPTION
    Script workflow:
    1. Comprehensive testing for SSO Worker and Branding Guard
    2. Deploy Cloudflare Worker Crove SSO for Production (sso.crove.com)
    3. Output Docker compose stack commands for production server
.EXAMPLE
    .\scripts\deploy-prod.ps1
#>

[CmdletBinding()]
param (
    [Parameter()]
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CROVE PRODUCTION ENVIRONMENT - DEPLOYMENT PIPELINE" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Run tests & Branding Guard
if (-not $SkipTests) {
    Write-Host "`n[1/3] Running Vitest unit tests for @crove/sso..." -ForegroundColor Green
    pnpm --filter @crove/sso test
    if ($LASTEXITCODE -ne 0) {
        Write-Error "SSO tests failed! Aborting deployment."
        exit 1
    }

    Write-Host "`nChecking Branding Guard validation..." -ForegroundColor Green
    pnpm dlx tsx scripts/branding-guard.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Branding Guard validation failed! Aborting deployment."
        exit 1
    }
    Write-Host "-> All tests and branding validation passed!" -ForegroundColor Green
} else {
    Write-Host "`n[1/3] Skipping tests (-SkipTests)." -ForegroundColor Yellow
}

# 2. Deploy Cloudflare Worker for Production
Write-Host "`n[2/3] Deploying Cloudflare Worker Crove SSO (Production)..." -ForegroundColor Green
pnpm --filter @crove/sso run deploy:prod

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy SSO Production to Cloudflare."
    exit 1
}
Write-Host "-> SSO Production Worker deployed successfully to https://sso.crove.com" -ForegroundColor Green

# 3. Docker Stack Production deployment instructions
Write-Host "`n[3/3] Configure Docker Stack Production on GCP Server..." -ForegroundColor Green
Write-Host "Production environment configuration files:" -ForegroundColor Cyan
Write-Host "  - scripts/crove-server.env" -ForegroundColor White
Write-Host "  - scripts/docker-compose.prod.yaml" -ForegroundColor White

Write-Host "`nCommands to start Production Stack on GCP VM (crove-server):" -ForegroundColor Yellow
Write-Host "  docker compose -f scripts/docker-compose.prod.yaml up -d" -ForegroundColor White

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  PRODUCTION DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "  - Landing Page:  https://crove.com (and https://www.crove.com)" -ForegroundColor Cyan
Write-Host "  - App Dashboard: https://post.crove.com" -ForegroundColor Cyan
Write-Host "  - SSO Endpoint:  https://sso.crove.com" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
