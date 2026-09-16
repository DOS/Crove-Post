# SSO Architecture via Centralized PKCE Bridge (`api.dos.me/sso/callback`)

This document details the Single Sign-On (SSO) architecture and clarifies the specific role of `https://api.dos.me/sso/callback` (and `https://beta-api.dos.me/sso/callback`).

---

## 1. Why Postiz Specifically Needs the PKCE Bridge

Across the open-source platforms used in the Crove ecosystem, there is a fundamental difference in OAuth client capability:

| Application | Core Framework | Native PKCE / OAuth 2.1 Support | Needs Bridge? |
| :--- | :--- | :--- | :--- |
| **Crove Post** (Postiz) | NestJS + Passport OAuth2 (Custom generic provider) | ❌ **No** — Upstream Postiz only implements basic OAuth 2.0 without PKCE parameters (`code_challenge` / `code_verifier`). | ✅ **Yes** (Strictly required) |
| **Crove Sign** (Documenso) | Next.js + NextAuth.js / Auth.js | ✅ **Yes** — Native PKCE support built into NextAuth. | ❌ No (Can connect directly to Supabase OIDC) |
| **Crove Cal** (Cal.com) | Next.js + NextAuth.js (SAML / OIDC provider) | ✅ **Yes** — Native PKCE / standard OIDC support. | ❌ No (Can connect directly to Supabase OIDC) |
| **Crove CRM** (Twenty) | NestJS + Custom OIDC Client / Passport OIDC | ✅ **Yes** — Standard OIDC discovery with PKCE. | ❌ No (Can connect directly to Supabase OIDC) |

Because **Supabase Auth acts as an OAuth 2.1 Server** and strictly enforces PKCE (`code_challenge` S256 on `/authorize` and `code_verifier` on `/token`), **Postiz cannot authenticate directly against Supabase Auth without modifying its upstream core codebase**.

To preserve 100% upstream code compatibility for Postiz, **`api.dos.me`** provides a lightweight **PKCE Bridge**:
- It accepts basic OAuth 2.0 from Postiz.
- It generates and attaches the required PKCE challenge before forwarding the user to Supabase Auth.
- It receives the Supabase code at `https://api.dos.me/sso/callback`, exchanges it with Supabase using the stored `code_verifier`, and hands a bridge code back to Postiz.

---

## 2. SSO Flow for Postiz via Bridge

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  User Browser   │       │   Crove Post    │       │   api.dos.me    │       │  Supabase Auth  │
│                 │       │    (Postiz)     │       │  (PKCE Bridge)  │       │    (DOS ID)     │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
         │                         │                         │                         │
         │ 1. Click "DOS ID Login" │                         │                         │
         │────────────────────────▶│                         │                         │
         │                         │ 2. GET /sso/authorize   │                         │
         │                         │    (client_id, state,   │                         │
         │                         │     redirect_uri)       │                         │
         │                         │────────────────────────▶│                         │
         │                         │                         │ 3. Generate S256 PKCE   │
         │                         │                         │    (verifier/challenge) │
         │                         │                         │    Store state in cache │
         │                         │                         │ 4. Redirect to Supabase │
         │                         │                         │    redirect_uri:        │
         │                         │                         │    api.dos.me/sso/      │
         │                         │                         │    callback             │
         │ 5. Redirect to Supabase Login UI                  │────────────────────────▶│
         │◀──────────────────────────────────────────────────┼─────────────────────────│
         │                         │                         │                         │
         │ 6. User enters credentials & approves consent     │                         │
         │───────────────────────────────────────────────────┼────────────────────────▶│
         │                         │                         │                         │
         │ 7. Supabase redirects with auth code              │                         │
         │    to https://api.dos.me/sso/callback             │                         │
         │──────────────────────────────────────────────────▶│                         │
         │                         │                         │ 8. Exchange code +      │
         │                         │                         │    verifier for tokens  │
         │                         │                         │────────────────────────▶│
         │                         │                         │ 9. Return tokens        │
         │                         │                         │◀────────────────────────│
         │                         │                         │                         │
         │                         │                         │ 10. Generate bridge     │
         │                         │                         │     code & redirect to  │
         │                         │                         │     Postiz callback     │
         │ 11. Redirect with bridge code                     │                         │
         │◀──────────────────────────────────────────────────│                         │
         │                         │                         │                         │
         │ 12. Forward code to app │                         │                         │
         │────────────────────────▶│ 13. POST /sso/token     │                         │
         │                         │     (bridge code)       │                         │
         │                         │────────────────────────▶│ 14. Return access_token│
         │                         │                         │◀────────────────────────│
         │                         │ 15. GET /sso/userinfo   │                         │
         │                         │     (Bearer token)      │                         │
         │                         │────────────────────────▶│ 16. Query DB & enrich  │
         │                         │                         │     orgs + roles        │
         │                         │                         │ 17. Return user claims  │
         │                         │◀────────────────────────│                         │
         │ 18. Authenticated in App│                         │                         │
         │◀────────────────────────│                         │                         │
```

---

## 3. Comparison: Native Apps vs. Bridge Apps

### Direct Apps (Documenso, Twenty CRM, Cal.com)
- **Supabase OAuth Client**: Created with their direct callback URL (e.g. `https://sign.crove.com/api/auth/callback/credentials`).
- **Protocol**: Direct OAuth 2.1 with PKCE generated by NextAuth / OIDC client.
- **Bridge Required?**: ❌ No.

### Bridge Apps (Postiz / Legacy OAuth 2.0 Clients)
- **Supabase OAuth Client**: Created with `redirect_uris` pointing to the bridge: `https://api.dos.me/sso/callback` (Prod) or `https://beta-api.dos.me/sso/callback` (Beta).
- **Protocol**: Basic OAuth 2.0 $\rightarrow$ translated to OAuth 2.1 PKCE by `api.dos.me`.
- **Bridge Required?**: ✅ Yes.

---

## 4. Environment Endpoints for Postiz

| Environment | Postiz Auth URL (`POSTIZ_OAUTH_AUTH_URL`) | Supabase OAuth Client Redirect URI |
| :--- | :--- | :--- |
| **Production** | `https://api.dos.me/sso/authorize` | `https://api.dos.me/sso/callback` |
| **Beta** | `https://beta-api.dos.me/sso/authorize` | `https://beta-api.dos.me/sso/callback` |

---

## 5. Crove OAuth App Connection Specifications (Production & SSO Bridge)

For all ecosystem applications (Crove Post, Crove CRM, Crove Desk, Crove Sign) connecting via DOS ID / Supabase OAuth:

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Client ID** | `18790ccb-4d71-48cd-ad24-aee5f3ced3da` | Production OAuth Client ID on Supabase Auth |
| **Client Secret** | `tQbSNFzbP03onxFrgScOfxYfzbvkjSou-gaPVtHh6fg` | Production Client Secret (stored in GCP Secret Manager) |
| **Token Auth Method** | `client_secret_basic` (or `client_secret_post`) | HTTP Basic / Post authentication method for token endpoint |
| **Recommended Env Vars** | `CROVE_OAUTH_CLIENT_ID`<br>`CROVE_OAUTH_CLIENT_SECRET` | Standardized environment variable naming convention across the Crove ecosystem |
| **Postiz Specific Mapping** | `POSTIZ_OAUTH_CLIENT_ID=crove-postiz`<br>`POSTIZ_OAUTH_CLIENT_SECRET=<CROVE_POSTIZ_OAUTH_CLIENT_SECRET>` | Internal bridge client credentials connecting to `api.dos.me/sso/*` |

---

## 6. Organization -> Teams Hierarchy & JIT Token Claims Standard

As standardized by DOS.Me Core, all SSO identity tokens and `/sso/userinfo` endpoints now embed unified `organizations` and `teams` claims for Zero-Latency JIT Provisioning.

### Unified JWT Claims Payload:
```json
{
  "sub": "7a3562bb-f529-45e0-bdfa-b73ca55ce8c8",
  "email": "agent@acme.com",
  "name": "Jane Doe",
  "picture": "https://avatar.dos.me/jane.png",
  "active_org_id": "org_987654321",
  "organizations": [
    {
      "id": "org_987654321",
      "name": "Acme Corporation",
      "slug": "acme",
      "role": "ADMIN"
    }
  ],
  "teams": [
    {
      "id": "team_11223344",
      "org_id": "org_987654321",
      "name": "Customer Support",
      "slug": "customer-support",
      "role": "LEAD"
    },
    {
      "id": "team_55667788",
      "org_id": "org_987654321",
      "name": "Social Media Marketing",
      "slug": "social-media",
      "role": "MEMBER"
    }
  ]
}
```

### Integration across Crove Products:
- **Crove Post (`post.crove.com`)**: Parses `organizations` for active workspace and `teams` for channel access & campaign group assignment.
- **Crove Desk (`desk.crove.com`)**: Maps `teams` to Inboxes (Support, Billing, VIP) with role `LEAD` for supervisor privileges.
- **Crove CRM (`crm.crove.com`)**: Scopes Leads, Deals, and Pipelines to the user's active `teams`.
- **Crove Sign (`sign.crove.com`)**: Authorizes document signature workflows based on team roles (`LEAD` / `ADMIN`).


