# Copilot & AI Coding Agent Instructions for Crove Post

## 1. Project Overview & Context
- **Crove Post** is the open-source social media management and scheduling platform of the **Crove OS** business ecosystem (based on Postiz).
- Supports scheduling and publishing posts to 28+ channels (LinkedIn, X/Twitter, Facebook, Instagram, YouTube, TikTok, Threads, Pinterest, Reddit, Bluesky, Mastodon, Telegram, Discord, etc.).
- Monorepo architecture managed via **PNPM Workspaces** (Node.js >= 22.12.0).

---

## 2. Monorepo Architecture & Key Directories
- `apps/backend`: NestJS REST API Gateway, Controllers, OAuth & Webhook endpoints.
- `apps/frontend`: Next.js 16 (App Router) + React 19 + Tailwind CSS 3 UI.
- `apps/orchestrator`: Temporal Worker for scheduled posting workflows and background activities.
- `apps/crove-sso`: Cloudflare Worker SSO bridge (optional edge fallback).
- `libraries/nestjs-libraries`: Database layer (Prisma), 34+ Social Providers, Email, Notifications, Mastra MCP Server.
- `libraries/helpers`: Runtime branding engine, Fetch wrappers, Subdomain management, Auth helper utilities.
- `libraries/react-shared-libraries`: Reusable React components, translations, UI forms.
- `docs/`: Technical specifications (`architecture.md`, `sso-architecture.md`, `first-party-provisioning.md`, `cicd.md`).

---

## 3. Core Architectural Principles for AI Agents & Reviewers

### A. Backend Layering Standard (Strict - No Shortcuts)
Always adhere to the multi-tier architecture:
`DTO` $\rightarrow$ `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` (Prisma)
- Validation: Decorated DTOs using `class-validator` and `class-transformer`.
- Business Logic: Must reside in Services (`libraries/nestjs-libraries` or `apps/backend/src/services`), not in Controllers.
- Generic Code: Provider-specific logic must be isolated in its provider implementation, never in generic routing code.

### B. Database & Multi-Schema Standard
- Database: PostgreSQL (Supabase pooler / direct connection) targeting schema `post`.
- Always use **Prisma ORM** (`schema.prisma`). Never write raw SQL strings.
- Support `DATABASE_URL` (connection pooler on port 6543) and `DATABASE_DIRECT_URL` (direct connection on port 5432 for migrations).

### C. Authentication & Ecosystem SSO Standard
- Central Identity Provider: **DOS ID** (`api.dos.me` / Supabase Auth OAuth 2.1 PKCE).
- Generic OAuth Bridge: Postiz connects to `https://api.dos.me/sso/authorize`, `POST /sso/token`, `GET /sso/userinfo`.
- First-Party Headless Provisioning: `POST /v1/provision` creates/updates local `User` and `Organization` projections from DOS ID and issues single-use tickets (`ticket:${jti}` in Redis).
- Ticket Consumption: `POST /v1/ticket/consume` validates and atomically deletes the ticket to prevent replay attacks, establishing session cookies (`auth`, `showorg`).
- Token Revocation: Full RFC 7009 compliance via `POST /oauth/revoke`.

### D. 2-Tier Synchronization Standard
- **Tier 1 (Database Mirror & Webhooks)**: Real-time inbound webhook sync (`POST /api/webhooks/dos-org-sync`) signed via constant-time HMAC-SHA256 (`crypto.timingSafeEqual`).
- **Tier 2 (Agentic MCP Protocols)**: Model Context Protocol server exposing aliased tools (`schedule_post`, `list_channels`, `list_posts`, `upload_from_url`) via `/api/mcp`.

---

## 4. Frontend & UI Guidelines
- Framework: Next.js 16 App Router with React 19.
- Styling: Tailwind CSS 3 with system color tokens in `apps/frontend/src/app/colors.scss` and `global.scss`. Do NOT use deprecated `--color-custom*` classes.
- State & Data Fetching: Always use SWR via the custom `useFetch` hook (`@gitroom/helpers/utils/custom.fetch`).
- Hooks Rule: Each SWR call must be encapsulated in its own hook and adhere to React hooks rules.
- Native Components: Prefer writing native components over adding third-party UI dependencies.

---

## 5. Developer Workflows & Commands
- Dependency Manager: **PNPM ONLY** (`pnpm install`). Never use npm or yarn.
- Build: `pnpm run build` (builds frontend, backend, orchestrator).
- Branding Guard: `pnpm dlx tsx scripts/branding-guard.ts` (validates contracts and branding tokens).
- Development: `pnpm run dev`
- Tests: `pnpm test`
- Commits: Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
