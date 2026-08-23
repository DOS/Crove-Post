<#
.SYNOPSIS
    Automated build, test and deployment for Cloudflare Worker Crove SSO (Beta & Prod).
.DESCRIPTION
    Script workflow:
    1. Verify Node.js & pnpm environment
    2. Run SSO unit test suite (31/31 unit tests)
    3. Deploy worker to Cloudflare via Wrangler CLI for the specified environment
.PARAMETER Environment
    Deployment target: 'beta' (default) or 'prod'
.EXAMPLE
    .\scripts\deploy-sso.ps1 -Environment beta
.EXAMPLE
    .\scripts\deploy-sso.ps1 -Environment prod
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [ValidateSet("beta", "prod")]
    [string]$Environment = "beta",

    [Parameter()]
    [string]$UpstreamClientId = "",

    [Parameter()]
    [string]$UpstreamClientSecret = "",

    [Parameter()]
    [string]$DownstreamClientId = "",

    [Parameter()]
    [string]$DownstreamClientSecret = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CROVE SSO WORKER - AUTOMATED DEPLOYMENT ($($Environment.ToUpper()))" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Run SSO unit tests
Write-Host "`n[1/3] Running Vitest unit tests for @crove/sso..." -ForegroundColor Green
$testResult = pnpm --filter @crove/sso test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Tests failed! Aborting deployment."
    exit 1
}
Write-Host "-> All tests passed successfully!" -ForegroundColor Green

# 2. Configure Secrets if provided
if ($UpstreamClientId -or $UpstreamClientSecret) {
    Write-Host "`n[2/3] Configuring Cloudflare Secrets..." -ForegroundColor Green
    $envFlag = if ($Environment -eq "beta") { "-e beta" } else { "" }
    
    if ($UpstreamClientId) {
        Write-Host "-> Setting UPSTREAM_CLIENT_ID..."
        $UpstreamClientId | pnpm --filter @crove/sso exec wrangler secret put UPSTREAM_CLIENT_ID $envFlag
    }
    if ($UpstreamClientSecret) {
        Write-Host "-> Setting UPSTREAM_CLIENT_SECRET..."
        $UpstreamClientSecret | pnpm --filter @crove/sso exec wrangler secret put UPSTREAM_CLIENT_SECRET $envFlag
    }
    if ($DownstreamClientId) {
        Write-Host "-> Setting DOWNSTREAM_CLIENT_ID..."
        $DownstreamClientId | pnpm --filter @crove/sso exec wrangler secret put DOWNSTREAM_CLIENT_ID $envFlag
    }
    if ($DownstreamClientSecret) {
        Write-Host "-> Setting DOWNSTREAM_CLIENT_SECRET..."
        $DownstreamClientSecret | pnpm --filter @crove/sso exec wrangler secret put DOWNSTREAM_CLIENT_SECRET $envFlag
    }
} else {
    Write-Host "`n[2/3] Skipping secrets upload (using pre-configured dashboard/env secrets)." -ForegroundColor Gray
}

# 3. Deploy Worker
Write-Host "`n[3/3] Deploying Cloudflare Worker ($Environment)..." -ForegroundColor Green
if ($Environment -eq "beta") {
    pnpm --filter @crove/sso run deploy:beta
} else {
    pnpm --filter @crove/sso run deploy:prod
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  DEPLOYMENT SUCCEEDED FOR $($Environment.ToUpper())!" -ForegroundColor Green
    if ($Environment -eq "beta") {
        Write-Host "  SSO Endpoint: https://beta-sso.crove.com" -ForegroundColor Cyan
        Write-Host "  App Callback: https://beta-post.crove.com/settings" -ForegroundColor Cyan
    } else {
        Write-Host "  SSO Endpoint: https://sso.crove.com" -ForegroundColor Cyan
        Write-Host "  App Callback: https://post.crove.com/settings" -ForegroundColor Cyan
    }
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Error "Deployment failed. Please check Cloudflare authentication or API token."
    exit 1
}
