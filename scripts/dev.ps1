<#
.SYNOPSIS
    Start the development environment for Crove Monorepo on Windows PowerShell.
.DESCRIPTION
    Supports running services:
    - Landing Page Next.js (Port 3000)
    - App Frontend Dashboard (Port 4200)
    - Backend API & Orchestrator (Port 3000 internal / background)
.PARAMETER Mode
    'all' (Full stack: Web + App + Backend), 'web' (Landing Page only), 'app' (App Frontend only), 'sso' (SSO Worker only)
.EXAMPLE
    .\scripts\dev.ps1 -Mode all
.EXAMPLE
    .\scripts\dev.ps1 -Mode web
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [ValidateSet("all", "web", "app", "sso")]
    [string]$Mode = "all"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  STARTING CROVE DEV ENVIRONMENT [Mode: $($Mode.ToUpper())]" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

switch ($Mode) {
    "web" {
        Write-Host "Starting Landing Page (apps/web) on http://localhost:3000..." -ForegroundColor Green
        pnpm --filter @crove/web run dev
    }
    "app" {
        Write-Host "Starting App Frontend (apps/frontend)..." -ForegroundColor Green
        pnpm --filter @crove/frontend run dev
    }
    "sso" {
        Write-Host "Starting local SSO Worker..." -ForegroundColor Green
        pnpm --filter @crove/sso run dev
    }
    "all" {
        Write-Host "Starting Landing Page, Frontend & Backend in parallel..." -ForegroundColor Green
        pnpm run dev
    }
}
