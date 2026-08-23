<#
.SYNOPSIS
    Khởi động môi trường phát triển (Dev) cho Crove Monorepo trên Windows PowerShell.
.DESCRIPTION
    Hỗ trợ chạy đồng thời:
    - Landing Page Next.js (Port 3000)
    - App Frontend Dashboard (Port 4200)
    - Backend API & Orchestrator (Port 3000 internal / background)
.PARAMETER Mode
    'all' (toàn bộ gồm Web + App + Backend), 'web' (chỉ Landing Page), 'app' (chỉ App Frontend)
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
        Write-Host "Khởi chạy Landing Page (apps/web) trên http://localhost:3000..." -ForegroundColor Green
        pnpm --filter @crove/web run dev
    }
    "app" {
        Write-Host "Khởi chạy App Frontend (apps/frontend)..." -ForegroundColor Green
        pnpm --filter @crove/frontend run dev
    }
    "sso" {
        Write-Host "Khởi chạy SSO Worker cục bộ..." -ForegroundColor Green
        pnpm --filter @crove/sso run dev
    }
    "all" {
        Write-Host "Khởi chạy song song Landing Page, Frontend & Backend..." -ForegroundColor Green
        pnpm run dev
    }
}
