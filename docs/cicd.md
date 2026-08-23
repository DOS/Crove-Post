# CI/CD Automation System (GitHub Actions & Deployment)

The Crove Post CI/CD system provides end-to-end automation: source code verification, runtime branding and license validation, multi-arch Docker container builds, and deployment to Cloudflare Workers and GCP servers.

---

## 1. GitHub Actions Workflows

| Workflow | File | Trigger | Purpose |
| :--- | :--- | :--- | :--- |
| **Deploy SSO Bridge** | `.github/workflows/deploy-sso.yml` | Push to `apps/crove-sso/**` or dispatch | Runs Vitest (31 tests) + deploys Cloudflare Worker to `sso.crove.com` (main) or `beta-sso.crove.com` (dev). |
| **Build & Deploy Containers** | `.github/workflows/build-deploy-crove.yml` | Push to `dev` or published release | Runs Branding Guard -> Builds & pushes GHCR image `ghcr.io/dos/crove-post` (`beta` / `latest`). |
| **Build & Publish Containers** | `.github/workflows/build-containers.yml` | Push to `main` / `dev` or tags | Multi-arch container build (amd64 + arm64) for `ghcr.io/dos/crove-post`. |
| **Branding Guard CI** | `.github/workflows/branding-guard.yml` | Push / PR to `main` or `dev` | Validates runtime branding engine contracts and AGPL-3.0 compliance. |
| **Upstream Sync** | `.github/workflows/sync-upstream.yml` | Daily schedule (03:00 UTC) or dispatch | Automatically fetches upstream `gitroomhq/postiz-app` commits and opens automated PRs. |

---

## 2. Branching & Deployment Strategy

```
[ DEV Branch (Staging) ]
   │
   ├──> 1. Push commit to `dev` branch
   ├──> 2. CI/CD runs Branding Guard & Test suites
   ├──> 3. Build & Push Image: ghcr.io/dos/crove-post:beta
   └──> 4. Updates Beta environment: beta-post.crove.com
   
[ MAIN Branch (Production) ]
   │
   ├──> 1. Merge PR from `dev` into `main`
   ├──> 2. Publish GitHub Release / Tag
   ├──> 3. Build & Push Image: ghcr.io/dos/crove-post:latest
   └──> 4. Updates Production environment: post.crove.com
```

---

## 3. Required Repository Secrets

| Secret | Description | Required |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | Token with permissions to deploy Cloudflare Workers and update DNS | Yes |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID (`3368ff98a4c956164b7bbdc8fb950163` or `5f2a58925e790423dfafa0e6bee46b28`) | Optional |
| `GITHUB_TOKEN` | Automatically provisioned by GitHub Actions with package write permissions | Automatic |
| `GCP_SSH_KEY` | SSH Private Key for connecting to GCP `crove-server` | Optional (for automated push deployment) |
| `GCP_HOST` | GCP Server IP address (`34.87.89.118`) | Optional |

---

## 4. Automation Scripts

| Script | Path | Purpose |
| :--- | :--- | :--- |
| **Deploy Beta** | `scripts/deploy-beta.ps1` | Runs tests, deploys SSO Beta, and outputs container instructions |
| **Deploy Prod** | `scripts/deploy-prod.ps1` | Runs tests, deploys SSO Prod, and outputs container instructions |
| **Deploy SSO** | `scripts/deploy-sso.ps1` | Independent SSO deployment with `-Environment beta` or `prod` |
| **Branding Guard** | `scripts/branding-guard.ts` | Comprehensive contract validation suite for runtime branding |
| **Build All** | `scripts/build-all.ps1` | Full parallel/sequential workspace build verification |
| **Dev Environment** | `scripts/dev.ps1` | Starts development server on Windows PowerShell |
