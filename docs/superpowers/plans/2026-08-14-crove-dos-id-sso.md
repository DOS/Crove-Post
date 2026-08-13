# Crove DOS ID SSO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Completed steps use checked boxes.

**Goal:** Deploy a PKCE compatibility bridge at `sso.crove.com` so the upstream Postiz image can use Supabase DOS ID for SSO without creating a duplicate Crove user.

**Architecture:** A Cloudflare Worker exposes the OAuth endpoints expected by Postiz and acts as a confidential OAuth 2.1 client of Supabase. A Durable Object provides strongly consistent, expiring, single-use state and authorization-code storage. Production activation happens only after the verified DOS ID subject is bound to the existing Postiz user with exact database preconditions.

**Tech Stack:** TypeScript 5.5.4, Cloudflare Workers, Durable Objects, Wrangler 4.123.0, Vitest 4.1.10, `@cloudflare/vitest-pool-workers` 0.21.3, Supabase OAuth 2.1, GCP Secret Manager, Docker Compose, PostgreSQL.

## Global Constraints

- Keep the upstream Postiz image and Generic OAuth environment contract unchanged.
- Use `https://sso.crove.com` as the bridge origin and `https://crove.com/settings` as the only downstream redirect URI.
- Use S256 PKCE and exact allowlists for client ID, redirect URI, response type, grant type, and scope.
- State expires after 600 seconds; bridge authorization codes expire after 60 seconds; both are single-use.
- Never log client secrets, authorization codes, access tokens, refresh tokens, or user claims.
- Never commit secret values to Git or Wrangler configuration.
- Do not apply schema or DDL to the shared production Supabase project.
- Preserve the existing Postiz user ID, organization membership, 15 integrations, and 10 posts.
- Enable `DISABLE_REGISTRATION=true` only after SSO login is verified.
- Use PowerShell 7 for local shell commands.

---

### Task 1: Worker package and OAuth request validation

**Files:**
- Create: `apps/crove-sso/package.json`
- Create: `apps/crove-sso/tsconfig.json`
- Create: `apps/crove-sso/wrangler.jsonc`
- Create: `apps/crove-sso/vitest.config.ts`
- Create: `apps/crove-sso/src/env.ts`
- Create: `apps/crove-sso/src/oauth.ts`
- Create: `apps/crove-sso/test/oauth.test.ts`
- Modify: `pnpm-workspace.yaml`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: `parseAuthorizeRequest(request: Request, env: Env): AuthorizeRequest`
- Produces: `parseTokenRequest(request: Request, env: Env): Promise<TokenRequest>`
- Produces: `createPkce(): Promise<{ verifier: string; challenge: string }>`
- Produces: `oauthError(error: string, description: string, status?: number): Response`

- [x] **Step 1: Add the package manifest and test configuration**

Create a workspace package with scripts `test`, `typecheck`, `cf-typegen`, and `deploy`. Pin Wrangler 4.123.0, Vitest 4.1.10, the Workers test pool 0.21.3, and TypeScript 5.5.4. Configure `cloudflareTest()` to load `wrangler.jsonc`.

- [x] **Step 2: Write failing authorization-validation tests**

Add tests that call `parseAuthorizeRequest()` and prove it rejects an unknown client ID, a callback other than `https://crove.com/settings`, a response type other than `code`, and a scope outside `openid profile email`.

- [x] **Step 3: Run the targeted tests and verify RED**

Run: `pnpm.cmd --filter @crove/sso test -- test/oauth.test.ts`

Expected: FAIL because `src/oauth.ts` does not exist.

- [x] **Step 4: Implement minimal authorization validation**

Define `Env` with all Worker secrets and the Durable Object binding. Parse query parameters with `URL`, compare exact strings, and return safe OAuth errors without echoing values.

- [x] **Step 5: Add and verify token-validation tests**

Test form content type, `grant_type=authorization_code`, exact downstream client ID and redirect URI, missing code, and invalid client secret. Use a fixed-length byte comparison implemented with Web Crypto-compatible primitives.

- [x] **Step 6: Add and verify the PKCE test**

Generate a verifier from 32 random bytes, compute SHA-256, encode with base64url without padding, and assert the challenge matches an independent digest of the returned verifier.

- [x] **Step 7: Run tests and typecheck**

Run:

```powershell
pnpm.cmd --filter @crove/sso test
pnpm.cmd --filter @crove/sso typecheck
```

Expected: all tests pass and TypeScript exits 0.

- [x] **Step 8: Commit**

```powershell
git add pnpm-workspace.yaml pnpm-lock.yaml apps/crove-sso
git commit -m "feat: validate Crove SSO OAuth requests"
```

### Task 2: Durable Object state and single-use code storage

**Files:**
- Create: `apps/crove-sso/src/state-store.ts`
- Create: `apps/crove-sso/test/state-store.test.ts`
- Modify: `apps/crove-sso/src/env.ts`
- Modify: `apps/crove-sso/wrangler.jsonc`

**Interfaces:**
- Consumes: `Env.OAUTH_STATE: DurableObjectNamespace<OAuthStateStore>`
- Produces: `OAuthStateStore.fetch()` private operations for `put` and atomic `take`, including expired-key deletion
- Produces: `putState(env, key, value, ttlSeconds): Promise<void>`
- Produces: `takeState<T>(env, key): Promise<T | null>`

- [x] **Step 1: Write failing Durable Object tests**

Test that a stored value can be taken exactly once, a replay returns null, and an expired value returns null. Use the Workers Vitest integration with a real Durable Object binding.

- [x] **Step 2: Run the targeted tests and verify RED**

Run: `pnpm.cmd --filter @crove/sso test -- test/state-store.test.ts`

Expected: FAIL because `OAuthStateStore` is missing.

- [x] **Step 3: Implement the strongly consistent store**

Use Durable Object SQLite storage with a single table created in `blockConcurrencyWhile()`. Store JSON, absolute expiry milliseconds, and delete on atomic take. Return 404 for missing and expired keys.

- [x] **Step 4: Add eviction and concurrency coverage**

Use `evictDurableObject()` to prove persisted state survives eviction. Start two parallel `takeState()` calls and assert exactly one receives the value.

- [x] **Step 5: Run tests and typecheck**

Run:

```powershell
pnpm.cmd --filter @crove/sso test
pnpm.cmd --filter @crove/sso typecheck
```

Expected: all tests pass and TypeScript exits 0.

- [x] **Step 6: Commit**

```powershell
git add apps/crove-sso
git commit -m "feat: add single-use OAuth state store"
```

### Task 3: End-to-end bridge endpoints

**Files:**
- Create: `apps/crove-sso/src/index.ts`
- Create: `apps/crove-sso/test/worker.test.ts`
- Modify: `apps/crove-sso/src/oauth.ts`
- Modify: `apps/crove-sso/src/state-store.ts`
- Modify: `apps/crove-sso/wrangler.jsonc`

**Interfaces:**
- Consumes: the validation, PKCE, and state-store interfaces from Tasks 1 and 2
- Produces: Worker routes `GET /health`, `GET /authorize`, `GET /callback`, `POST /token`, and `GET /userinfo`

- [x] **Step 1: Write failing `/health` and `/authorize` integration tests**

Call `exports.default.fetch()` in the Workers runtime. Assert `/health` returns a static JSON response. Assert `/authorize` redirects to Supabase with exact client ID, callback, scope, random state, `code_challenge_method=S256`, and no downstream state exposed upstream.

- [x] **Step 2: Run the targeted tests and verify RED**

Run: `pnpm.cmd --filter @crove/sso test -- test/worker.test.ts`

Expected: FAIL because `src/index.ts` does not exist.

- [x] **Step 3: Implement `/health` and `/authorize`**

Route by exact method and pathname. Persist the downstream request, generated verifier, and downstream state for 600 seconds before redirecting to Supabase.

- [x] **Step 4: Write failing `/callback` tests**

Mock only the upstream Supabase token endpoint. Prove callback consumes state, posts the stored PKCE verifier with `client_secret_post`, creates a one-time bridge code, preserves the original downstream state, adds `Referrer-Policy: no-referrer`, and rejects missing or replayed upstream state.

- [x] **Step 5: Implement `/callback`**

Exchange the upstream code, retain the token response only behind a 60-second random bridge code, and redirect to `https://crove.com/settings`. On upstream error, return a safe `temporarily_unavailable` response without including the upstream body.

- [x] **Step 6: Write failing `/token` tests**

Prove exact client authentication, exact redirect URI, single-use bridge code consumption, replay rejection, and `Cache-Control: no-store` plus `Pragma: no-cache` on every token response.

- [x] **Step 7: Implement `/token`**

Consume the bridge code atomically and return the stored upstream JSON response once. Never refresh or transform upstream tokens.

- [x] **Step 8: Write failing `/userinfo` tests**

Mock only the Supabase UserInfo endpoint. Prove the bridge requires a Bearer token, forwards it without logging, preserves safe status and JSON body, and adds `Cache-Control: no-store`.

- [x] **Step 9: Implement `/userinfo` and safe structured logging**

Log only request ID, endpoint, HTTP status, safe error code, and duration. Do not log URLs with query strings, request bodies, authorization headers, token bodies, or claims.

- [x] **Step 10: Run the full quality gate**

Run:

```powershell
pnpm.cmd --filter @crove/sso test
pnpm.cmd --filter @crove/sso typecheck
pnpm.cmd --filter @crove/sso cf-typegen
git diff --check
```

Expected: all tests pass, type generation and typecheck exit 0, and no whitespace errors exist.

- [x] **Step 11: Commit**

```powershell
git add apps/crove-sso pnpm-lock.yaml
git commit -m "feat: bridge Postiz OAuth to DOS ID"
```

### Task 4: Cloudflare deployment and Supabase callback activation

**Files:**
- Modify: `apps/crove-sso/wrangler.jsonc`
- Modify: `D:\Projects\Crove\.env` locally without committing secret values
- Modify externally: GCP Secret Manager, Cloudflare Worker, Supabase OAuth client, and `/opt/crove/.env`

**Interfaces:**
- Consumes: GCP secrets `CROVE_POSTIZ_OAUTH_CLIENT_ID` and `CROVE_POSTIZ_OAUTH_CLIENT_SECRET`
- Produces: GCP secrets `CROVE_SSO_BRIDGE_CLIENT_ID` and `CROVE_SSO_BRIDGE_CLIENT_SECRET`
- Produces: deployed origin `https://sso.crove.com`

- [x] **Step 1: Generate and store downstream credentials**

Generate a public client ID and a 256-bit client secret with Web Crypto. Add them to GCP Secret Manager over stdin without printing values.

- [x] **Step 2: Configure Cloudflare secrets**

Copy the upstream and downstream credentials from GCP Secret Manager directly into Worker secrets named `UPSTREAM_CLIENT_ID`, `UPSTREAM_CLIENT_SECRET`, `DOWNSTREAM_CLIENT_ID`, and `DOWNSTREAM_CLIENT_SECRET` without writing plaintext temp files.

- [x] **Step 3: Deploy Worker and custom domain**

Deploy Worker `crove-sso` with compatibility date `2026-08-13`, `nodejs_compat`, Durable Object migration `v1`, observability enabled, and custom domain `sso.crove.com`.

- [x] **Step 4: Verify deployed fail-closed behavior**

Verify `/health` returns 200. Verify unknown client, wrong callback, wrong response type, missing code, and unauthenticated token requests fail with the documented OAuth errors. Confirm no secret values occur in recent Worker logs.

- [x] **Step 5: Update Supabase OAuth client**

Using the official Supabase OAuth Admin API with the service-role key from GCP Secret Manager, update Crove client `18790ccb-4d71-48cd-ad24-aee5f3ced3da` to redirect only to `https://sso.crove.com/callback`. Read the client back and assert the exact callback, name, grant types, and authentication method.

- [x] **Step 6: Configure Postiz production endpoints but keep SSO hidden**

Create a root-owned 0600 backup of `/opt/crove/.env`. Set the Postiz OAuth URLs to bridge endpoints and its client credentials to the downstream bridge credentials. Keep `POSTIZ_GENERIC_OAUTH` empty until identity binding finishes.

- [x] **Step 7: Commit deployment configuration**

```powershell
git add apps/crove-sso/wrangler.jsonc
git commit -m "chore: configure Crove SSO deployment"
```

### Task 5: Verified DOS ID identity binding

**Files:**
- Create externally: root-owned PostgreSQL backup under `/opt/crove/backups/`
- Modify externally: one exact `User` row in the Postiz production database

**Interfaces:**
- Consumes: verified DOS ID `sub` and email from Supabase UserInfo
- Produces: existing user `c5c577f6-4aef-491a-8f6a-6b975f8b9678` bound to provider `GENERIC`

- [x] **Step 1: Obtain a verified upstream identity**

Run the bridge authorization flow in Chrome. Confirm the visible DOS ID account is `joy@dos.ai`. Complete consent, exchange the returned bridge code through the bridge token endpoint, call UserInfo, and retain only `{sub,email}` in memory. Do not log or persist the access token.

- [x] **Step 2: Re-run exact database preconditions**

Assert in one read-only query: one user for `joy@dos.ai`, provider `LOCAL`, empty provider ID, zero `GENERIC` conflicts, one membership to organization `314a2673-b9c3-49d6-b916-6836513381c0`, 15 integrations, and 10 posts.

- [x] **Step 3: Create a minimal identity backup**

Export the exact user row and membership rows with `pg_dump --data-only --column-inserts` to a root-owned 0600 file. Verify its checksum and nonzero size without printing password or provider tokens.

- [x] **Step 4: Bind the identity transactionally**

Inside one transaction, lock the exact user row, repeat every precondition, update only `providerName='GENERIC'`, `providerId=<verified sub>`, and `updatedAt=now()`, then require exactly one affected row. Roll back automatically if any assertion fails.

- [x] **Step 5: Verify preservation**

Assert the same user ID, email, membership, organization ID, integration count, and post count. Assert there is one `GENERIC` identity for the verified subject and no remaining `LOCAL` identity for that email.

### Task 6: Enable SSO, disable local registration, and verify production

**Files:**
- Modify externally: `/opt/crove/.env`

**Interfaces:**
- Produces: visible DOS ID SSO on `https://crove.com/auth`
- Produces: local registration disabled while Generic OAuth remains available

- [x] **Step 1: Activate DOS ID and recreate Postiz**

Set `POSTIZ_GENERIC_OAUTH=true` and `DISABLE_REGISTRATION=true` in `/opt/crove/.env`, recreate only the Postiz application container, and wait for its health check to pass.

- [x] **Step 2: Verify unauthenticated UI with Playwright**

Assert the auth page shows `DOS ID`, does not offer local registration, and clicking DOS ID redirects through `sso.crove.com` to the Supabase DOS ID consent flow.

- [x] **Step 3: Verify positive login**

Complete DOS ID login and assert Crove opens the existing organization. Verify the UI exposes the previously connected channels and existing posts rather than onboarding a new organization.

- [x] **Step 4: Verify logout and login again**

Log out, repeat DOS ID login, and assert the same Postiz user ID and organization are used.

- [x] **Step 5: Verify negative registration behavior**

Call `/auth/can-register` and assert local registration is false. Attempt a local email registration request and assert it fails with `Registration is disabled`. Confirm DOS ID login still succeeds afterward.

- [x] **Step 6: Inspect health and logs**

Assert the Postiz container is healthy, `https://crove.com` returns a successful response, Worker logs contain no secrets or tokens, and there are no OAuth error spikes from the verified run.

- [x] **Step 7: Run completion audit**

Re-read the approved design and this plan. Map every goal and invariant to fresh test, runtime, database, and browser evidence. Do not declare completion if any item lacks direct evidence.

- [x] **Step 8: Commit final operational documentation changes if any**

```powershell
git add apps/crove-sso docs/superpowers
git commit -m "docs: record Crove DOS ID SSO rollout"
```

## Production Rollout Evidence

- Cloudflare Worker deployment: `crove-sso`, deployment `03ce550a5b784411829012e4361f248f`.
- Custom domain: `https://sso.crove.com` with successful health and fail-closed checks.
- Supabase OAuth client: `18790ccb-4d71-48cd-ad24-aee5f3ced3da`, redirect URI restricted to `https://sso.crove.com/callback`.
- Verified DOS ID subject: `48fc3631-ec8c-4e78-aa98-ec89c1c3624d` for `joy@dos.ai`.
- Existing Postiz user preserved: `c5c577f6-4aef-491a-8f6a-6b975f8b9678`, one membership, 15 integrations, and 10 posts.
- Identity backup: `/opt/crove/backups/postiz-identity.pre-dos-id.20260813T211816Z.sql`, SHA-256 `2712a260c8f3002220cad43971d92e33f0f5aebf72a85b10d97bd21494115672`.
- Postiz container verified healthy with zero restarts and no OAuth, unhandled, uncaught, or panic lines in the final log window.
- Cloudflare structured-log audit covered 51 events and found no unexpected application log keys or forbidden secret/token/claim terms.
- Playwright verified the DOS ID login, existing workspace and channels, logout, repeat login, and local registration rejection.
