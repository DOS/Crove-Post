# Changelog

All notable changes to **Crove Post** (formerly Postiz app fork) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Fixed
- **Beta Runtime: DOS-Me First-Party Bootstrap 401 & Facebook Connect `client_id=undefined`**:
  - Root cause: the Beta runtime (`crove-post-beta` on `crove-server`) had no `CROVE_POST_CLIENT_ID`/`CROVE_POST_CLIENT_SECRET` configured, so `BootstrapGuard` failed closed with 401 before HMAC verification; `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` were also missing, producing `client_id=undefined` in the Connect Facebook URL.
  - Remediated by configuring `CROVE_POST_CLIENT_ID=pca_dosclaw_beta_7ef5e5f1`, `CROVE_POST_CLIENT_SECRET` (existing OAuth client secret, no rotation) and copying `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` from the prod env file into the Beta env file on the VM (gitignored by design via `scripts/*.env`).
  - Verified with a signed request differential: signed bootstrap → HTTP 400 (guard passed, validation rejected the test body) vs unsigned → HTTP 401 (fail-closed). No OAuth app was recreated and no token was rotated.
  - Beta container recreated with the same immutable image digest; a one-off boot hang after recreate (backend blocked pre-Nest with no network sockets) was cleared by a plain `docker restart`.

### Added
- **MCP Client Icons & Onboarding Enhancements (Upstream Sync)**:
  - Added Nanoclaw and other third-party MCP client icons support in Public API.
  - Upgraded onboarding experience and interactive modal walkthroughs.
- **Post Workflow v1.1.2**:
  - Enhanced background workflow with automatic retry on heartbeat timeouts when no heartbeat details are present.
- **Frontend & Media Modernization Roadmap**:
  - Expanded `ROADMAP.md` with Crove OS visual design standards, workspace switcher overhaul, and R2 direct upload pipeline.

## [v2.24.0] - 2026-09-03

### Added
- **DOS.Me Organization -> Teams Hierarchy & JIT Token Claims**:
  - Integrated `teams` scope (`openid profile email organizations teams offline_access`) into OAuth authorization links.
  - Added parsing for `active_org_id`, `organizations: [{ id, name, slug, role }]`, and `teams: [{ id, org_id, name, slug, role }]` claims in `OauthProvider.getUser()`.
  - Added documentation for Zero-Latency JIT Token Claims and Organization/Teams hierarchy in `docs/sso-architecture.md`.
- **OpenAI-Compatible API Gateway Support**:
  - Added dynamic configuration support for `OPENAI_BASE_URL`, `OPENAI_MODEL_NAME`, and `OPENAI_IMAGE_MODEL` across `OpenaiService`, `CopilotController`, `AgentGraphService`, and `AutopostService`.
- **Cross-Platform Chrome Extension Build System**:
  - Added Node.js cross-platform build script (`apps/extension/build.mjs`) supporting Windows PowerShell and Linux/macOS `zip`.
  - Updated Chrome Extension Manifest V3 with expanded host permissions and externally connectable domains (`*.crove.com`, `*.crove.io`, `*.dos.me`).
- **Multi-Provider Subscription Architecture**:
  - Added `provider` column (`@default("stripe")`) to `Subscription` model to support multi-provider billing engines (e.g. RevenueCat).

### Fixed
- **JIT Organization Synchronization in `AuthService.checkExists()`**:
  - Fixed returning users missing claim/org updates by centralizing `syncUserOrganizations()` in `checkExists()` before issuing JWT.
  - Enabled canonical `orgId` inheritance during initial user/org creation in `createOrgAndUser()`.
- **Database Catalog & Schema Stability**:
  - Cleaned up orphaned dynamic Mastra catalog entries from PostgreSQL.
  - Optimized database connection pool strings with `connection_limit`, `pool_timeout`, and `connect_timeout`.
- **Upstream Sync**:
  - Merged upstream Postiz changes including Post Workflow v1.1.1, RevenueCat subscriptions, and Seedance video provider.

### Previous Releases

## [v2.23.0] - 2026-08-27

### Added
- **Centralized DOS.Me SSO & PKCE Bridge Integration**:
  - Configured Generic OAuth 2.0 client authentication pointing to `https://api.dos.me/oauth/*` (Production) and `https://beta-api.dos.me/oauth/*` (Beta).
  - Added support for dynamic `POSTIZ_OAUTH_SCOPE` environment variable (`openid profile email organizations offline_access`).
  - Added OIDC UserInfo claim enrichment parsing (`sub`, `email`, `name`, `picture`, and `organizations: [{ id, name, slug, role }]`).
- **Autonomous AI Agent Connectivity (DOSClaw)**:
  - Added built-in platform OAuth application support for DOSClaw agent connectors on Beta (`pca_dosclaw_beta_7ef5e5f1`) and Production (`pca_dosclaw_prod_18790ccb`).
  - Implemented standard OAuth 2.0 Token Revocation endpoint (`POST /oauth/revoke`, RFC 7009) with `OAuthService.revokeToken(token)` to invalidate `pos_*` tokens when agents disconnect.
- **Two-Phase Hybrid Identity & Organization Sync**:
  - Implemented Phase 1 (JIT Organization Provisioning): Automatically provisions local workspace and assigns user roles during first-time OIDC login.
  - Implemented Phase 2 (Real-Time Webhook Synchronization): Added `POST /api/webhooks/dos-org-sync` controller with HMAC-SHA256 signature verification (`X-DOS-Signature`) handling `org.created`, `org.updated`, `org.deleted`, `org.member_added`, and `org.member_removed` events.
- **Database Multi-Schema Connection Pooling**:
  - Configured `directUrl = env("DATABASE_DIRECT_URL")` in `schema.prisma` to support Supabase/PgBouncer connection pooling.
  - Fully synchronized all 41 Prisma models into the dedicated `post` schema on Supabase.
- **Brand Assets & UI Styling**:
  - Added official DOS logo SVG asset at `/icons/dos.svg` and unified OAuth provider display button.
  - Added comprehensive English technical architecture documentation in `docs/architecture.md`.

### Changed
- **Authentication UX & Security**:
  - Streamlined auth flow: Automatically display single-touch DOS ID login button when generic OAuth is active.
  - Removed local email/password registration form when SSO is enforced across the ecosystem.
- **CI/CD & Deployment Workflows**:
  - Upgraded GitHub Actions container workflows to auto-build beta images on `dev` push and restrict production image builds to published tags/releases.
  - Standardized all deployment and automation PowerShell scripts (`scripts/*.ps1`) with English comments and logs.
  - Updated `sync-upstream.yml` to accurately compare `origin/main` against `upstream/main` for automated upstream PR creation.

### Removed
- **Legacy Web3 Wallet**:
  - Removed deprecated Solana Web3 wallet provider (`@solana/wallet-adapter`) from login and registration interfaces in favor of the unified DOS ID embedded account-abstraction smart wallet.
- **Standalone Cloudflare SSO Workers**:
  - Deprecated separate Cloudflare Worker proxies (`sso.crove.com`, `beta-sso.crove.com`) in favor of the central PKCE Bridge embedded in `api.dos.me`.

---

## [2.23.0] - 2026-08-04

### Added
- Streamed media uploads pipeline.
- Duplicate-post protection mechanisms.
- Dynamic MCP registration and tool filtering.
