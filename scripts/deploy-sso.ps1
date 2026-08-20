<#
.SYNOPSIS
    Tự động hóa build, test và deploy Cloudflare Worker Crove SSO (Beta & Prod).
.DESCRIPTION
    Script thực hiện:
    1. Kiểm tra môi trường Node.js & pnpm
    2. Chạy test bộ mã nguồn SSO (31/31 unit tests)
    3. Deploy worker lên Cloudflare qua Wrangler CLI tương ứng với môi trường chỉ định
.PARAMETER Environment
    Môi trường triển khai: 'beta' (mặc định) hoặc 'prod'
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

# 1. Chạy unit tests SSO
Write-Host "`n[1/3] Đang chạy bộ kiểm thử Vitest cho @crove/sso..." -ForegroundColor Green
$testResult = pnpm --filter @crove/sso test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Kiểm thử thất bại! Dừng quá trình deploy."
    exit 1
}
Write-Host "-> Toàn bộ tests đã vượt qua thành công!" -ForegroundColor Green

# 2. Cấu hình Secrets nếu có truyền vào
if ($UpstreamClientId -or $UpstreamClientSecret) {
    Write-Host "`n[2/3] Đang cấu hình Cloudflare Secrets..." -ForegroundColor Green
    $envFlag = if ($Environment -eq "beta") { "-e beta" } else { "" }
    
    if ($UpstreamClientId) {
        Write-Host "-> Thiết lập UPSTREAM_CLIENT_ID..."
        $UpstreamClientId | pnpm --filter @crove/sso exec wrangler secret put UPSTREAM_CLIENT_ID $envFlag
    }
    if ($UpstreamClientSecret) {
        Write-Host "-> Thiết lập UPSTREAM_CLIENT_SECRET..."
        $UpstreamClientSecret | pnpm --filter @crove/sso exec wrangler secret put UPSTREAM_CLIENT_SECRET $envFlag
    }
    if ($DownstreamClientId) {
        Write-Host "-> Thiết lập DOWNSTREAM_CLIENT_ID..."
        $DownstreamClientId | pnpm --filter @crove/sso exec wrangler secret put DOWNSTREAM_CLIENT_ID $envFlag
    }
    if ($DownstreamClientSecret) {
        Write-Host "-> Thiết lập DOWNSTREAM_CLIENT_SECRET..."
        $DownstreamClientSecret | pnpm --filter @crove/sso exec wrangler secret put DOWNSTREAM_CLIENT_SECRET $envFlag
    }
} else {
    Write-Host "`n[2/3] Bỏ qua nạp secrets (sử dụng secrets đã lưu trên Cloudflare Dashboard)." -ForegroundColor Gray
}

# 3. Deploy Worker
Write-Host "`n[3/3] Đang deploy Cloudflare Worker ($Environment)..." -ForegroundColor Green
if ($Environment -eq "beta") {
    pnpm --filter @crove/sso run deploy:beta
} else {
    pnpm --filter @crove/sso run deploy:prod
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  DEPLOY THÀNH CÔNG CHO MÔI TRƯỜNG $($Environment.ToUpper())!" -ForegroundColor Green
    if ($Environment -eq "beta") {
        Write-Host "  SSO Endpoint: https://beta-sso.crove.com" -ForegroundColor Cyan
        Write-Host "  App Callback: https://beta-app.crove.com/settings" -ForegroundColor Cyan
    } else {
        Write-Host "  SSO Endpoint: https://sso.crove.com" -ForegroundColor Cyan
        Write-Host "  App Callback: https://post.crove.com/settings" -ForegroundColor Cyan
    }
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Error "Deployment thất bại. Vui lòng kiểm tra quyền đăng nhập Cloudflare (wrangler login) hoặc token API."
    exit 1
}
