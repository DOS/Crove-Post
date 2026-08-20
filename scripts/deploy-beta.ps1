<#
.SYNOPSIS
    Tự động hóa triển khai môi trường Beta (beta.crove.com & beta-post.crove.com).
.DESCRIPTION
    Script thực hiện:
    1. Kiểm thử SSO Worker (@crove/sso) và Branding Guard
    2. Deploy Cloudflare Worker Crove SSO cho môi trường Beta (beta-sso.crove.com)
    3. Hướng dẫn / Tự động khởi chạy Docker Stack Beta trên server qua Cloudflare Tunnel
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

# 1. Chạy kiểm thử & Branding Guard
if (-not $SkipTests) {
    Write-Host "`n[1/3] Đang chạy kiểm thử Vitest cho @crove/sso..." -ForegroundColor Green
    pnpm --filter @crove/sso test
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Kiểm thử SSO thất bại! Dừng quá trình deploy."
        exit 1
    }

    Write-Host "`nĐang kiểm tra tính hợp lệ của Branding Guard..." -ForegroundColor Green
    pnpm dlx tsx scripts/branding-guard.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Branding Guard thất bại! Dừng quá trình deploy."
        exit 1
    }
    Write-Host "-> Toàn bộ kiểm thử và kiểm tra branding đã vượt qua!" -ForegroundColor Green
} else {
    Write-Host "`n[1/3] Bỏ qua bước kiểm thử (-SkipTests)." -ForegroundColor Yellow
}

# 2. Deploy Cloudflare Worker cho môi trường Beta
Write-Host "`n[2/3] Đang deploy Cloudflare Worker Crove SSO (Beta)..." -ForegroundColor Green
pnpm --filter @crove/sso run deploy:beta

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deploy SSO Beta lên Cloudflare thất bại."
    exit 1
}
Write-Host "-> SSO Beta Worker đã deploy thành công tới https://beta-sso.crove.com" -ForegroundColor Green

# 3. Thông tin khởi chạy Docker Stack Beta trên GCP Server
Write-Host "`n[3/3] Cấu hình Docker Stack Beta cho Server..." -ForegroundColor Green
Write-Host "File cấu hình môi trường Beta:" -ForegroundColor Cyan
Write-Host "  - Docker Compose: scripts/docker-compose.beta.yaml"
Write-Host "  - Environment:    scripts/crove-server.beta.env"
Write-Host "  - Tunnel Config:  scripts/tunnel-config.yml"

Write-Host "`nLệnh khởi chạy Stack Beta trên GCP VM (crove-server):" -ForegroundColor Yellow
Write-Host "  docker compose -f scripts/docker-compose.beta.yaml up -d" -ForegroundColor White

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  MÔI TRƯỜNG BETA ĐÃ SẴN SÀNG:" -ForegroundColor Green
Write-Host "  - Landing Page:  https://beta.crove.com" -ForegroundColor Cyan
    Write-Host "  - App Dashboard: https://beta-post.crove.com" -ForegroundColor Cyan
Write-Host "  - SSO Bridge:    https://beta-sso.crove.com" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
