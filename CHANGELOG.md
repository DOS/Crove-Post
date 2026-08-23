# Changelog

All notable changes to **Crove Post** (formerly Postiz app fork) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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
