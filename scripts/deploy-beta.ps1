<#
.SYNOPSIS
    Automated deployment pipeline for the Crove Beta environment (beta-post.crove.com).
.DESCRIPTION
    Script workflow:
    1. Run Branding Guard validation
    2. Output Docker compose stack commands for GCP server
.EXAMPLE
    .\scripts\deploy-beta.ps1
#>

[CmdletBinding()]
param (
    [Parameter()]
    [switch]$SkipTests,

    [Parameter()]
    [string]$GcpServerHost = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CROVE BETA ENVIRONMENT - AUTOMATED DEPLOYMENT PIPELINE" -ForegroundColor Yellow
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

Write-Host "`nChecking Beta deployment contract..." -ForegroundColor Green
pnpm run validate:beta-deploy
if ($LASTEXITCODE -ne 0) {
    Write-Error "Beta deployment contract validation failed! Aborting deployment."
    exit 1
}

# 2. Docker Stack Beta deployment instructions
Write-Host "`n[2/2] Configure Docker Stack Beta on GCP Server..." -ForegroundColor Green
Write-Host "Beta environment configuration file:" -ForegroundColor Cyan
Write-Host "  - scripts/crove-server.beta.env" -ForegroundColor White
Write-Host "  - scripts/docker-compose.beta.yaml" -ForegroundColor White

Write-Host "`nCommands to start Beta Stack on GCP VM (crove-server):" -ForegroundColor Yellow
Write-Host "  docker compose -f scripts/docker-compose.beta.yaml up -d --no-deps --pull always crove-post-beta" -ForegroundColor White

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  BETA DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "  - App Dashboard: https://beta-post.crove.com" -ForegroundColor Cyan
Write-Host "  - SSO: via api.dos.me PKCE bridge (sso.crove.com worker removed)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
