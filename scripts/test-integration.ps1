<#
.SYNOPSIS
    Automated integration test runner with disposable Docker test containers and guaranteed teardown.
.DESCRIPTION
    1. Spawns isolated PostgreSQL and Redis test containers on random high ports
    2. Runs Prisma migrations and executes Jest bootstrap integration tests
    3. Guarantees cleanup (docker rm -f) of all test containers in a finally block
.EXAMPLE
    .\scripts\test-integration.ps1
#>

[CmdletBinding()]
param (
    [Parameter()]
    [int]$PgPort = 15491,

    [Parameter()]
    [int]$RedisPort = 16391,

    [Parameter()]
    [switch]$KeepContainers
)

$ErrorActionPreference = "Stop"

$Timestamp = Get-Date -Format "yyyyMMddHHmmss"
$PgContainer = "crove-test-pg-$Timestamp"
$RedisContainer = "crove-test-redis-$Timestamp"

Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  CROVE POST - INTEGRATION TEST RUNNER (AUTO-TEARDOWN)  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

try {
    Write-Host "`n[1/4] Starting disposable test containers..." -ForegroundColor Green
    docker run -d --name $PgContainer -p "127.0.0.1:${PgPort}:5432" -e POSTGRES_PASSWORD=postiz-password -e POSTGRES_USER=postiz-user -e POSTGRES_DB=postiz-db-local postgres:17-alpine | Out-Null
    docker run -d --name $RedisContainer -p "127.0.0.1:${RedisPort}:6379" redis:7.2 | Out-Null

    Write-Host "Waiting for database readiness on port ${PgPort}..." -ForegroundColor DarkGray
    $attempts = 0
    $ready = $false
    while ($attempts -lt 30 -and -not $ready) {
        Start-Sleep -Seconds 1
        $res = docker exec $PgContainer pg_isready -U postiz-user -d postiz-db-local 2>&1
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
        }
        $attempts++
    }

    if (-not $ready) {
        throw "PostgreSQL test container failed to become healthy within 30 seconds."
    }
    Write-Host "-> Test containers ready: $PgContainer (port $PgPort), $RedisContainer (port $RedisPort)" -ForegroundColor Green

    # Set temporary environment variables for integration tests
    $env:DATABASE_URL = "postgresql://postiz-user:postiz-password@127.0.0.1:${PgPort}/postiz-db-local"
    $env:DATABASE_DIRECT_URL = "postgresql://postiz-user:postiz-password@127.0.0.1:${PgPort}/postiz-db-local"
    $env:REDIS_URL = "redis://127.0.0.1:${RedisPort}"
    $env:JWT_SECRET = "test-jwt-secret-key-32-chars-minimum-length-ok"

    Write-Host "`n[2/4] Pushing Prisma schema to test database..." -ForegroundColor Green
    pnpm dlx prisma@6.5.0 db push --accept-data-loss --schema ./libraries/nestjs-libraries/src/database/prisma/schema.prisma --skip-generate
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma db push to test database failed."
    }

    Write-Host "`n[3/4] Running Jest integration test suite..." -ForegroundColor Green
    pnpm exec jest --config tests/bootstrap.jest.cjs --runInBand --no-cache
    if ($LASTEXITCODE -ne 0) {
        throw "Integration tests failed."
    }

    Write-Host "`n[4/4] All integration tests PASSED successfully!" -ForegroundColor Green

} catch {
    Write-Error "Test execution failed: $_"
} finally {
    if (-not $KeepContainers) {
        Write-Host "`n[Teardown] Cleaning up disposable test containers..." -ForegroundColor DarkYellow
        docker rm -f $PgContainer 2>$null | Out-Null
        docker rm -f $RedisContainer 2>$null | Out-Null
        Write-Host "-> Successfully removed test containers: $PgContainer, $RedisContainer" -ForegroundColor DarkGray
    } else {
        Write-Host "`n[Notice] Preserving test containers (-KeepContainers specified)." -ForegroundColor Yellow
    }
}
