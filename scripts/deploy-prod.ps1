<#
.SYNOPSIS
    Automated deployment pipeline for the Crove Production environment (crove.com & post.crove.com).
.DESCRIPTION
    Script workflow:
    1. Run Branding Guard validation
    2. Output Docker compose stack commands for production server
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

# 1. Branding Guard
if (-not $SkipTests) {
    Write-Host "`n[1/2] Checking Branding Guard validation..." -ForegroundColor Green
    pnpm dlx tsx scripts/branding-guard.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Branding Guard validation failed! Aborting deployment."
        exit 1
    }
    Write-Host "-> Branding validation passed!" -ForegroundColor Green
} else {
    Write-Host "`n[1/2] Skipping tests (-SkipTests)." -ForegroundColor Yellow
}

# 2. Docker Stack Production deployment instructions
Write-Host "`n[2/2] Configure Docker Stack Production on GCP Server..." -ForegroundColor Green
Write-Host "Production environment configuration files:" -ForegroundColor Cyan
Write-Host "  - scripts/crove-server.env" -ForegroundColor White
Write-Host "  - scripts/docker-compose.prod.yaml" -ForegroundColor White

Write-Host "`nCommands to start Production Stack on GCP VM (crove-server):" -ForegroundColor Yellow
Write-Host "  docker compose -f scripts/docker-compose.prod.yaml up -d" -ForegroundColor White

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  PRODUCTION DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "  - Landing Page:  https://crove.com (and https://www.crove.com)" -ForegroundColor Cyan
Write-Host "  - App Dashboard: https://post.crove.com" -ForegroundColor Cyan
Write-Host "  - SSO: via api.dos.me PKCE bridge (sso.crove.com worker removed)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
