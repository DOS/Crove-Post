# First-Party Headless Provisioning & One-Time Ticket API

## 1. Overview
Enables zero-friction autonomous connections (e.g. DOSClaw AI agents, ecosystem connectors) to provision local user and workspace projections in Crove Post and receive a one-time authentication ticket without requiring interactive registration or company setup forms.

---

## 2. API Specifications

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
# Canonical DOS-Me bootstrap

`POST /api/internal/first-party/bootstrap` implements the contract in DOS-Me's
`docs/platform/FIRST-PARTY-PROVISIONING.md`. Nginx removes `/api` before routing
to NestJS; HMAC verification always uses the full canonical public path.

- `X-DOS-Timestamp`: ISO timestamp produced by `new Date().toISOString()`.
- `X-DOS-Nonce`: 16 random bytes encoded as 32 lowercase hex characters.
- `X-DOS-Signature`: `sha256=` plus the lowercase HMAC SHA256 hex digest of
  `timestamp + "." + nonce + ".POST./api/internal/first-party/bootstrap." + rawBody`.
- Maximum clock skew is five minutes in either direction. Redis `SET NX EX`
  claims the nonce for 601 seconds, covering future timestamps as well as past ones.
- The signing key is `CROVE_POST_BOOTSTRAP_SIGNING_SECRET`, falling back only to
  `CROVE_POST_CLIENT_SECRET`, matching DOS-Me. Missing credentials fail closed.
- `CROVE_POST_CLIENT_ID` must identify the existing static first-party OAuth app.
  The bootstrap does not create OAuth clients or issue access tokens.
- Real `REDIS_URL`, `JWT_SECRET`, and an exact `FRONTEND_URL` of
  `https://beta-post.crove.com` or `https://post.crove.com` are required.
  Request Host headers never influence launch or consent URLs.

The request has nested `user: {id, email, name}`,
`organization: {id, name, slug, role}`, and `oauth: {client_id, state}` objects.
Identifiers are DOS UUIDs. A serializable transaction upserts the user,
organization, and membership together. New users keep the canonical DOS UUID;
legacy users already linked through `providerName=GENERIC, providerId=<DOS UUID>`
retain their local ID and foreign keys. Email alone never links accounts.
Ambiguous, disabled, deleted, or conflicting identities fail closed. Existing
deleted organizations are not restored. OWNER maps to SUPERADMIN (organization
role only), ADMIN to ADMIN, and MEMBER/USER to USER; global admin is never granted.
The current local Organization model has no slug field. Slug is accepted as
contract metadata, while DOS-Me remains its source of truth. No schema change
or additional workspace is created by this endpoint.

Response: `{ "launch_url": "https://beta-post.crove.com/api/internal/first-party/launch?ticket=<opaque handle>" }`.
The 256-bit ticket lives in Redis for 60 seconds, keyed by its SHA256 hash. Its
stored value binds DOS user, local user, organization, client ID and state.
`GET /api/internal/first-party/launch` atomically reads/deletes the ticket using
Lua, rechecks the active membership and OAuth app, sets Secure, HttpOnly,
host-only session/organization cookies, then sends a 303 to `/oauth/authorize`
using only the stored client/state. This backend handoff avoids a frontend
login redirect before session establishment. Extra redirect or OAuth query
parameters are ignored. It never approves consent automatically.

Neither response exposes a JWT, client secret, refresh token, or `pos_` token.
Launch responses use `Cache-Control: no-store` and `Referrer-Policy: no-referrer`.
Container Nginx access logs omit query strings; Sentry error/transaction export
excludes first-party routes. Any outer proxy must also omit ticket query strings.

Compatibility: `/v1/provision` and `/v1/ticket/consume` remain unchanged for their
existing callers and JWT ticket format. Canonical bootstrap tickets cannot be
consumed there and do not accept caller-controlled redirects.

## Validation and Beta release

`apps/backend/test/first-party-bootstrap.spec.ts` runs real HTTP requests against
NestJS and disposable PostgreSQL/Redis, including concurrent replay/consumption.
CI runs it in the Build workflow. Locally, use isolated containers on loopback
ports 15432 and 16379, set `DATABASE_URL`, `DATABASE_DIRECT_URL`, and `REDIS_URL`,
then run:

```sh
pnpm exec prisma db push --schema libraries/nestjs-libraries/src/database/prisma/schema.prisma --skip-generate
pnpm exec jest --config apps/backend/test/jest-bootstrap.config.cjs --runInBand
```

These schema setup commands are for disposable test databases only. Release the
reviewed merge's immutable container digest to `crove-post-beta` only. The Beta
container must start Nginx and the app processes without invoking the legacy
`prisma-db-push` startup script. Do not alter production or shared schemas.

---
