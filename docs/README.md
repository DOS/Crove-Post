# Crove Post Technical Documentation

Welcome to the official technical documentation for **Crove Post** (the open-source multi-channel social media scheduler and management platform based on Postiz).

---

## 📚 Documentation Index

| Document | Key Highlights |
| :--- | :--- |
| **[0. Crove OS Architecture Standard (Hybrid Sync & Unified SSO)](./architecture.md)** | Technical specification for Crove OS ecosystem: Two-phase Hybrid Sync (JIT + Webhooks), API-First Delegation (Method 3) for organization creation, and centralized Generic OAuth 2.0 PKCE Bridge on `api.dos.me`. |
| **[1. Runtime Branding Engine (White-labeling)](./branding.md)** | Configure application branding (Logo, Name, Primary Color, Email Templates, Swagger, MCP) via `BRAND_*` environment variables with zero image rebuilds. |
| **[2. Upstream Synchronization & CI Guard](./upstream-sync.md)** | Automated synchronization with upstream `gitroomhq/postiz-app` via GitHub Actions and automated contract validation via Branding Guard CI. |
| **[3. SSO & OAuth 2.1 PKCE Bridge Architecture](./sso-integration.md)** | Single Sign-On bridge connecting Postiz Generic OAuth with DOS ID / Supabase OAuth 2.1 via Cloudflare Workers & Durable Objects. |
| **[4. First-Party Provisioning API](./first-party-provisioning.md)** | Automated account & workspace provisioning API specification (`/v1/provision`). |
| **[5. Beta & Production Environments](./beta-environment.md)** | Independent configurations for Production (`crove.com`, `post.crove.com`) and Beta (`beta.crove.com`, `beta-post.crove.com`). |
| **[6. CI/CD & Deployment Pipeline](./cicd.md)** | GitHub Actions multi-arch container build, branching strategy (dev/main), and automated server deployment. |

---

## 🏗️ System Architecture

The project is structured as a **Monorepo (PNPM Workspaces)**:

```
├── apps/
│   ├── backend/        # NestJS API Server (DTO -> Controller -> Service -> Repository)
│   ├── orchestrator/   # Temporal Worker (Workflows & Activities for scheduled posting)
│   ├── frontend/       # Next.js 16 (App Router) + React 19 + Tailwind CSS 3
│   ├── extension/      # Chrome Extension Manifest V3 (Cookie capture & social bridge)
│   └── crove-sso/      # Cloudflare Worker SSO Bridge (OAuth 2.1 PKCE)
├── libraries/
│   ├── helpers/        # Shared utilities, Brand Config Engine, Fetch wrappers
│   ├── nestjs-libraries/# 34+ Social Providers, Email, Database Prisma, Mastra MCP
│   └── react-shared-libraries/ # UI Components, i18n Translations, Sentry
├── docs/               # Technical specifications and architecture guides
├── scripts/            # Deployment and testing scripts (branding-guard.ts, PowerShell)
└── .github/workflows/  # CI/CD Workflows (Build, Sync Upstream, Branding Guard)
```

---

## 🚀 Quick Start

### Local Development with PNPM

```powershell
# 1. Install dependencies
pnpm install

# 2. Generate Prisma Client
pnpm exec prisma generate --schema=libraries/nestjs-libraries/src/database/prisma/schema.prisma

# 3. Start development environment
pnpm dev
```

### Running with Docker Compose

```powershell
docker compose -f docker-compose.yaml up -d
```
