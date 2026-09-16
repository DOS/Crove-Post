# First-Party Headless Provisioning & One-Time Ticket API

## 1. Overview
Enables zero-friction autonomous connections (e.g. DOSClaw AI agents, ecosystem connectors) to provision local user and workspace projections in Crove Post and receive a one-time authentication ticket without requiring interactive registration or company setup forms.

---

## 2. API Specifications

### DOS-Me first-party bootstrap

`POST /api/internal/first-party/bootstrap` is exposed publicly through nginx;
Nest receives `/internal/first-party/bootstrap`. It authenticates the exact raw
JSON bytes with HMAC SHA256 over
`timestamp.nonce.POST./api/internal/first-party/bootstrap.rawBody`, using
`X-DOS-Timestamp`, a 16-byte hex `X-DOS-Nonce`, and `X-DOS-Signature: sha256=<hex>`.
The secret is `CROVE_POST_BOOTSTRAP_SIGNING_SECRET`, falling back only to
`CROVE_POST_CLIENT_SECRET`. Missing secrets, Redis or headers fail closed.
`ENABLE_ECOSYSTEM_SYNC=false` explicitly disables the endpoint.

The nested `user`, `organization`, and `oauth` payload matches DOS-Me's
`docs/platform/FIRST-PARTY-PROVISIONING.md`. Timestamps allow five minutes of skew;
Redis claims nonces atomically for 601 seconds to cover future-dated requests.
Only registered static OAuth clients are supported by this contract.

Prisma projects canonical user and organization UUIDs and upserts membership in
one serializable transaction with bounded conflict retries. Existing GENERIC
users already linked to the exact DOS provider ID retain their local ID to
preserve foreign keys. Email alone never links accounts. OWNER maps to
SUPERADMIN, ADMIN to ADMIN, MEMBER/USER to USER. Deleted/inactive identities and
deleted organizations are rejected. The existing Organization schema has no slug
column; slug is validated but not persisted or used for authorization. No schema
change is required.

The response contains only `launch_url`, at the exact configured HTTPS
`FRONTEND_URL` origin (`beta-post.crove.com` or `post.crove.com`), with one opaque
256-bit ticket. Redis retains a hash of the ticket for 60 seconds, bound to DOS
subject, local user, org, client ID and state. No session/access token or state is
included in the launch URL. `/oauth/authorize?ticket=...` exchanges the ticket
server-side before rendering the app, sets HttpOnly Secure cookies, removes the
ticket via a 303 redirect, and shows the existing consent screen. Caller-supplied
client/state/redirect overrides cannot override the stored ticket context.
`POST /v1/ticket/consume` supports these tickets with an atomic Redis consume;
its new ticket response does not contain a JWT. Existing legacy JWT ticket and
`/v1/provision` behavior is unchanged.

Beta deployment must use the command override in `scripts/docker-compose.beta.yaml`
to start the application without running Prisma `db push --accept-data-loss`.
Beta already has the application schema; dynamic Mastra tables belong to Mastra
and must not be reconciled or deleted during application startup. Preserve the
existing volumes and deploy only the app service with an immutable image digest.

#### Local integration verification

Use disposable local PostgreSQL 17 and Redis 7.2 instances at ports 15491 and
16391. Set `DATABASE_URL` and `DATABASE_DIRECT_URL` to the local PostgreSQL
database, and `REDIS_URL=redis://127.0.0.1:16391`. Run
`pnpm exec prisma db push --schema libraries/nestjs-libraries/src/database/prisma/schema.prisma --skip-generate`
against that empty local database only, then
`pnpm exec jest --config tests/bootstrap.jest.cjs --runInBand`.
The suite refuses other database/Redis targets and tests HTTP authentication,
raw bytes, skew, nonce replay/concurrency, transactional idempotency, identity
collisions, safe launch URLs, ticket binding, expiry and concurrent consumption.

### 2.1. Headless Provisioning: `POST /v1/provision`

- **Authentication**: `Authorization: Bearer <PROVISIONING_SECRET_KEY>`
- **Idempotency**: Idempotent create-or-update based on `userId` (DOS ID) and `orgId`.

#### Request Headers:
```http
POST /v1/provision HTTP/1.1
Host: post.crove.com
Authorization: Bearer <PROVISIONING_SECRET_KEY>
Content-Type: application/json
```

#### Request Body:
```json
{
  "userId": "48fc3631-ec8c-4e78-aa98-ec89c1c3624d",
  "email": "joy@dos.ai",
  "name": "JOY",
  "orgId": "ca970340-c49d-4360-90e1-5c9fae597337",
  "orgName": "Crove Corporation",
  "role": "SUPERADMIN"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "ticket": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "loginUrl": "https://post.crove.com/auth/ticket?ticket=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_...",
    "email": "joy@dos.ai",
    "name": "JOY"
  },
  "organization": {
    "id": "ca970340-c49d-4360-90e1-5c9fae597337",
    "name": "Crove Corporation"
  }
}
```

---

### 2.2. Ticket Consumption: `POST /v1/ticket/consume`

- **Endpoint**: `POST /v1/ticket/consume`
- **Purpose**: Consumes a valid one-time ticket, establishes secure authentication cookies (`auth`, `showorg`), and redirects directly to the target URL (e.g. OAuth authorize consent screen).

#### Request Body:
```json
{
  "ticket": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirect_to": "/oauth/authorize?client_id=pca_dosclaw_prod_18790ccb&response_type=code"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "jwt": "...",
  "userId": "usr_...",
  "orgId": "ca970340-c49d-4360-90e1-5c9fae597337",
  "redirect_to": "/oauth/authorize?client_id=pca_dosclaw_prod_18790ccb&response_type=code"
}
```
# Consent binding after ticket exchange

For canonical bootstrap, `CROVE_POST_CLIENT_ID` must be configured to the existing
DOS-Me static OAuth client, and `JWT_SECRET` must be available. Other clients
cannot use this bootstrap endpoint. The ticket captures the registered OAuth app
ID and redirect URL in addition to the DOS subject, local user, organization,
client ID and state. Changing the registered redirect invalidates outstanding
tickets and consent requests rather than redirecting an existing flow elsewhere.

Ticket exchange creates a distinct random `firstPartyConsentId` and stores the
complete consent tuple in Redis for five minutes. The ID appears only in the
signed, HTTP-only auth cookie. AuthMiddleware passes it to the consent controller
only after JWT verification, including requests made through the internal auth
header. Request-supplied marker headers are ignored. Existing cookie names,
domain and logout behavior remain unchanged.

The configured first-party client always requires this marker and a live Redis
binding. A missing, used, expired or mismatched binding never falls back to
ordinary OAuth. Approval or denial atomically compares and deletes the tuple,
including the launch ID, current authoritative subject, user, organization,
client, state, app ID and registered redirect. A later tab's cookie cannot approve
an earlier tab's state, including launches for the same user and organization.
Creation also atomically updates the latest consent ID for the DOS subject.
Approval compares this pointer as well as the tuple, so starting a newer launch
supersedes the older launch on the server, even if its signed JWT was retained.
This applies across tabs and devices for that subject. A consumed newer launch
does not restore any earlier binding. When bootstrap signing is configured but
the first-party client ID is missing, OAuth approval fails closed with HTTP 503
instead of silently falling back to legacy behavior.
This static bootstrap contract does not include PKCE: injecting a challenge or
challenge method is rejected. An explicit redirect URI must exactly match the
captured registered redirect.

After successful approval or denial, the auth cookie becomes an ordinary session
without the launch marker. Legacy OAuth remains available for other clients;
the configured DOS-Me client still needs a fresh bootstrap and cannot reuse that
ordinary session to bypass replay protection. Legacy `/v1/provision` and JWT
ticket contracts are unchanged. A marked session must complete or deny its bound
consent before using an unrelated OAuth flow.

`tests/bootstrap-consent.spec.ts` exercises real HTTP controllers, AuthMiddleware,
OAuthService/repository code issuance, PostgreSQL and Redis. Regression coverage
includes two-tab supersession, subject/org/client/state changes, registered
redirect changes, PKCE injection, expiry, eight simultaneous approvals, marker
tampering, replay after returning to an ordinary session, and legacy OAuth.
