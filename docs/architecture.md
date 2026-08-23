# Crove OS System Architecture (Hybrid Sync & Unified SSO)

This document specifies the technical architecture standard for **Hybrid Identity & Organization Synchronization**, **API-First Delegation (Method 3) for Organization Management**, the **Centralized Generic OAuth 2.0 PKCE Bridge (`api.dos.me`)**, and **Autonomous Agent Connections (DOSClaw)** between **DOS.Me ID** and all member applications across the **Crove Ecosystem** (Crove Post, Crove CRM, Crove Sign, Crove Cal, and Crove Desk).

---

## 1. 🌟 Crove OS Ecosystem Overview

The Crove ecosystem connects independent, best-in-class open-source core platforms through a unified identity layer, shared multi-tenant database infrastructure, and event-driven data synchronization:

```
                                  ┌───────────────────────────────┐
                                  │      DOS.Me ID & Platform     │
                                  │  (Supabase Auth + api.dos.me) │
                                  └───────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
       ┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
       │    Crove Post     │            │     Crove CRM     │            │    Crove Sign     │
       │ (Postiz - NestJS) │            │ (Twenty - TypeORM)│            │(Documenso - Next) │
       │   Schema: post    │            │   Schema: core    │            │   Schema: sign    │
       └───────────────────┘            └───────────────────┘            └───────────────────┘
                 │                                │                                │
                 └────────────────────────────────┼────────────────────────────────┘
                                                  ▼
                                        ┌───────────────────┐
                                        │     Crove Cal     │
                                        │  (Cal.com - TRPC) │
                                        │   Schema: cal     │
                                        └───────────────────┘
```

---

## 2. 🔄 Hybrid Identity & Organization Sync Standard

### 2.1. Core Problem & Rationale
- Each member application (Postiz, Twenty CRM, Documenso, Cal.com) maintains its own database schema for maximum operational autonomy and smooth upstream synchronization.
- **Push Webhooks Only**: If a user creates an Organization on DOS.Me before ever logging into a satellite app, the satellite app lacks the local `User ID` required to establish foreign key constraints.
- **JIT Login Sync Only**: If a user is added to a new Organization on DOS.Me while already authenticated, satellite apps will suffer data drift unless the user explicitly logs out and logs back in.

👉 **Standard Architecture**: **Two-Phase Hybrid Sync (JIT + Webhooks)**.

---

### 2.2. Two-Phase Synchronization Workflow

#### 🔹 Phase 1: JIT (Just-In-Time) Sync upon OIDC Sign-In
When a user signs in via **DOS ID**:
1. **User & Profile Synchronization**: The satellite app consumes the `id_token` / `userinfo` claims from DOS.Me:
   - `sub`: Unique ID from DOS.Me / Supabase Auth
   - `email`: Primary email address
   - `name`: Full display name
   - `picture`: Avatar URL
   $\rightarrow$ The satellite app automatically provisions or updates its local `User` record, syncing name and profile picture.
2. **Organization Provisioning**:
   - If the user has no existing Organization in the satellite app, the app inspects the `organizations: [{ id, name, slug, role }]` claim to provision the corresponding Workspace/Organization and assign appropriate roles (`SUPERADMIN` / `ADMIN` / `USER`).

#### 🔹 Phase 2: Event-Driven Real-Time Sync via Webhooks
When an administrative change occurs on DOS.Me (organization renamed, member invited, member removed, subscription tier updated):
- **DOS.Me Event Router** dispatches an HMAC-SHA256 signed HTTP POST webhook (`X-DOS-Signature: sha256=...`) to internal endpoints across satellite apps:
  - `https://post.crove.com/api/webhooks/dos-org-sync`
  - `https://crm.crove.com/api/webhooks/dos-org-sync`
  - `https://sign.crove.com/api/webhooks/dos-org-sync`
  - `https://cal.crove.com/api/webhooks/dos-org-sync`
  - `https://desk.crove.com/api/webhooks/dos-org-sync`

---

## 3. 🏛️ Organization Creation: API-First Delegation (Method 3)

To ensure **seamless user experience (staying within the app)** and **absolute data consistency (Single Source of Truth)**, satellite apps do not write directly to `public.organizations`. Instead, they delegate creation via **DOS.Me Central API Hub (`api.dos.me`)**:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌──────────────────────┐
│   User creates  │──────▶│  Satellite App  │──────▶│   api.dos.me    │──────▶│ Database (Supabase)  │
│  Org in app UI  │       │(Post/Sign/CRM)  │       │(NestJS Org Svc) │       │ schema: public       │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └──────────────────────┘
                                                             │
                                          ┌──────────────────┴──────────────────┐
                                          │ Webhook Dispatcher (HMAC-SHA256)    │
                                          ├─────────────────────────────────────┤
                                          │ ▶ Crove Post (`/api/webhooks/...`)  │
                                          │ ▶ Crove CRM                         │
                                          │ ▶ Crove Sign                        │
                                          │ ▶ Crove Cal                         │
                                          │ ▶ Crove Desk                        │
                                          └─────────────────────────────────────┘
```

### 3.1. Detailed Execution Flow
1. **Satellite App Frontend / Server Action**:
   - **Endpoint**: `POST https://api.dos.me/organizations` (or `https://beta-api.dos.me/organizations`)
   - **Header**: `Authorization: Bearer <user_access_token>`
   - **Body**:
     ```json
     {
       "name": "Acme Corporation",
       "slug": "acme-corp"
     }
     ```
2. **Processing at `api.dos.me`**:
   - Validates **Quota / Plan Entitlements** (ensuring Free/Pro/Enterprise limits are enforced).
   - Inserts organization into `public.organizations` and assigns the user as `OWNER` in `public.org_members`.
   - `WebhookDispatcherService` fans out an `org.created` event to all registered satellite endpoints.
   - Returns `{ success: true, organization: { id, name, slug } }`.
3. **Satellite App Reaction**: Sets `active_org` to the newly created Organization ID without requiring page reloads or external redirects.

---

## 4. 🔑 Centralized Generic OAuth 2.0 PKCE Bridge (`api.dos.me`)

### 4.1. Edge Proxy Elimination & Centralization
Previously, Cloudflare Workers (`sso.crove.com` and `beta-sso.crove.com`) were used as stateful intermediaries. All PKCE Bridge functionality is now centralized inside `apps/api` (`api.dos.me` and `beta-api.dos.me`), eliminating external Cloudflare Workers.

```
┌─────────────────────────┐          ┌─────────────────────────┐          ┌─────────────────────────┐
│   Open Source Client    │          │       api.dos.me        │          │      Supabase Auth      │
│(Postiz / Twenty / Sign) │          │  (Generic OAuth Bridge) │          │ (OAuth 2.1 Server PKCE) │
└─────────────────────────┘          └─────────────────────────┘          └─────────────────────────┘
             │                                    │                                    │
             │ 1. GET /oauth/authorize (No PKCE)  │                                    │
             │───────────────────────────────────▶│ 2. Generate S256 PKCE Pair         │
             │                                    │    (verifier & challenge)          │
             │                                    │ 3. Redirect to Supabase            │
             │                                    │───────────────────────────────────▶│
             │                                    │                                    │
             │                                    │ 4. Supabase returns auth code      │
             │                                    │◀───────────────────────────────────│
             │ 5. Redirect with Bridge Code       │                                    │
             │◀───────────────────────────────────│                                    │
             │                                    │                                    │
             │ 6. POST /oauth/token (Basic/Post)  │                                    │
             │───────────────────────────────────▶│ 7. Exchange code + verifier        │
             │                                    │───────────────────────────────────▶│
             │                                    │ 8. Return Token Pair               │
             │                                    │◀───────────────────────────────────│
             │ 9. Return access_token + claims    │                                    │
             │◀───────────────────────────────────│                                    │
             │                                    │                                    │
             │ 10. GET /oauth/userinfo (Bearer)   │                                    │
             │───────────────────────────────────▶│ 11. Enrich `organizations` array   │
             │                                    │     from PostgreSQL DB             │
             │ 12. Return UserInfo + Orgs         │                                    │
             │◀───────────────────────────────────│                                    │
```

### 4.2. Standard Environment Configuration for Satellite Apps

```env
# ================================================================
# CROVE POST (POSTIZ) - CENTRALIZED GENERIC OAUTH 2.0 CONFIG
# ================================================================
POSTIZ_GENERIC_OAUTH=true

# --- PRODUCTION ENVIRONMENT ---
POSTIZ_OAUTH_URL=https://api.dos.me
POSTIZ_OAUTH_AUTH_URL=https://api.dos.me/oauth/authorize
POSTIZ_OAUTH_TOKEN_URL=https://api.dos.me/oauth/token
POSTIZ_OAUTH_USERINFO_URL=https://api.dos.me/oauth/userinfo

# --- BETA ENVIRONMENT ---
# POSTIZ_OAUTH_URL=https://beta-api.dos.me
# POSTIZ_OAUTH_AUTH_URL=https://beta-api.dos.me/oauth/authorize
# POSTIZ_OAUTH_TOKEN_URL=https://beta-api.dos.me/oauth/token
# POSTIZ_OAUTH_USERINFO_URL=https://beta-api.dos.me/oauth/userinfo

POSTIZ_OAUTH_CLIENT_ID=crove-postiz
POSTIZ_OAUTH_CLIENT_SECRET=<CROVE_POSTIZ_OAUTH_CLIENT_SECRET>
POSTIZ_OAUTH_SCOPE="openid profile email organizations offline_access"
NEXT_PUBLIC_POSTIZ_OAUTH_DISPLAY_NAME="DOS ID"
NEXT_PUBLIC_POSTIZ_OAUTH_LOGO_URL="/icons/generic-oauth.svg"
```

---

## 5. 🤖 Autonomous Agent Integration (DOSClaw Connector)

### 5.1. Protocol & Token Model
DOSClaw AI agents connect via **Option A (One-Touch OAuth 2.0)**:
- **Client IDs**:
  - Beta: `pca_dosclaw_beta_7ef5e5f1`
  - Production: `pca_dosclaw_prod_18790ccb`
- **Redirect URIs**:
  - Beta: `https://beta-api.dos.me/oauth/crove-post/callback`
  - Production: `https://api.dos.me/oauth/crove-post/callback`
- **Token Format**: Crove Post issues scoped `pos_*` tokens upon consent.
- **Token Revocation (RFC 7009)**: `POST /oauth/revoke` with `{ token: "pos_..." }` immediately invalidates access tokens when agents disconnect.
- **Security Boundary**: The token is stored securely in **DOS-Me Vault**. DOS.AI agents only receive an `agent_connection_binding` reference and never see plaintext credentials.

---

## 6. 📦 Webhook Payload Specification (`/api/webhooks/dos-org-sync`)

### 6.1. Required Headers
```http
POST /api/webhooks/dos-org-sync HTTP/1.1
Host: post.crove.com
Content-Type: application/json
X-DOS-Signature: sha256=<hex_hmac_sha256_signature>
```

### 6.2. Payload Schema
```json
{
  "event": "org.member_added",
  "timestamp": "2026-08-23T08:00:00Z",
  "data": {
    "org_id": "org_dos_123456",
    "org_name": "Tingee Corporation",
    "user_id": "usr_dos_789012",
    "user_email": "member@crove.com",
    "user_name": "Nguyen Van A",
    "role": "ADMIN"
  }
}
```

### 6.3. Supported Event Types
| Event | Description | Crove Post Handler |
| :--- | :--- | :--- |
| `org.created` | New organization created | Creates `Organization` & sets user as `SUPERADMIN` |
| `org.updated` | Organization name changed | Updates `Organization.name` |
| `org.deleted` | Organization removed | Sets `Organization.deletedAt` |
| `org.member_added` | Member added to organization | Creates `UserOrganization` record with mapped role |
| `org.member_removed` | Member removed from organization | Removes `UserOrganization` association |

---

## 7. 📊 Entity Mapping across Crove Ecosystem Schemas

| DOS.Me (`public`) | Crove Post (`post`) | Crove CRM (`core`) | Crove Sign (`sign`) | Crove Cal (`cal`) |
| :--- | :--- | :--- | :--- | :--- |
| `profiles.user_id` | `User.providerId` | `user.id` / `sub` | `User.id` | `users.id` |
| `profiles.email` | `User.email` | `user.email` | `User.email` | `users.email` |
| `profiles.name` | `User.name` | `user.name` | `User.name` | `users.name` |
| `organizations.id` | `Organization.id` | `workspace.id` | `Organisation.id` | `Team.id` |
| `organizations.name` | `Organization.name` | `workspace.name` | `Organisation.name` | `Team.name` |
| `org_members.role` | `UserOrganization.role` | `workspaceMember.role` | `OrganisationMember.role` | `Membership.role` |
