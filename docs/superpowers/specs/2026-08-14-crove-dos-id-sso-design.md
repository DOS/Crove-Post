# Crove DOS ID SSO Design

## Status

Approved architecture direction: deploy a standalone OAuth compatibility bridge and keep the upstream Postiz image unchanged.

## Goal

Allow Crove users to sign in through DOS ID, backed by the existing Supabase OAuth 2.1 provider, without forking or rebuilding Postiz.

## Constraints

- Keep the upstream Postiz image and its Generic OAuth environment contract unchanged.
- Supabase OAuth 2.1 requires Authorization Code with PKCE.
- Postiz Generic OAuth does not currently send PKCE parameters.
- Preserve the existing Crove user, organization, integrations, and content.
- Prevent duplicate Postiz users during the identity transition.
- Disable local email registration only after DOS ID login is verified.
- Never log client secrets, authorization codes, access tokens, refresh tokens, or user claims.

## Selected Architecture

Deploy a Cloudflare Worker named `crove-sso` at `https://sso.crove.com` with a Durable Object binding named `OAUTH_STATE`.

Postiz treats the bridge as its Generic OAuth provider. The bridge acts as an OAuth 2.1 confidential client of Supabase DOS ID and adds the missing PKCE behavior.

### Components

1. **Postiz downstream client**
   - Authorization endpoint: `https://sso.crove.com/authorize`
   - Token endpoint: `https://sso.crove.com/token`
   - UserInfo endpoint: `https://sso.crove.com/userinfo`
   - Redirect URI: `https://crove.com/settings`
   - Uses a bridge-specific client ID and secret.

2. **Cloudflare OAuth bridge**
   - Validates every downstream OAuth parameter against exact allowlists.
   - Generates an S256 PKCE verifier and challenge.
   - Preserves the downstream state without exposing it to the upstream provider.
   - Exchanges the Supabase authorization code server-side.
   - Issues a short-lived, single-use bridge authorization code.
   - Proxies UserInfo requests to Supabase.

3. **Supabase DOS ID upstream provider**
   - Authorization endpoint: `https://gulptwduchsjcsbndmua.supabase.co/auth/v1/oauth/authorize`
   - Token endpoint: `https://gulptwduchsjcsbndmua.supabase.co/auth/v1/oauth/token`
   - UserInfo endpoint: `https://gulptwduchsjcsbndmua.supabase.co/auth/v1/oauth/userinfo`
   - Crove callback: `https://sso.crove.com/callback`

4. **Durable Object state store**
   - Stores authorization transactions for at most 10 minutes.
   - Stores bridge authorization codes for at most 60 seconds.
   - Atomically consumes state and authorization codes.
   - Provides strong consistency and replay protection.

## Endpoint Behavior

### `GET /authorize`

1. Require `response_type=code`.
2. Require the exact bridge client ID.
3. Require `redirect_uri=https://crove.com/settings`.
4. Restrict scope to `openid profile email`.
5. Generate a cryptographically random upstream state and PKCE verifier.
6. Persist the transaction with a 10-minute expiry.
7. Redirect to Supabase with `code_challenge_method=S256`.

### `GET /callback`

1. Require a valid, unexpired upstream state.
2. Consume the transaction atomically.
3. Exchange the Supabase code using the stored PKCE verifier and confidential client secret.
4. Generate a random one-time bridge code.
5. Store the upstream token response behind that bridge code for at most 60 seconds.
6. Redirect to the original Postiz redirect URI with the bridge code and original Postiz state.

### `POST /token`

1. Require `application/x-www-form-urlencoded`.
2. Require `grant_type=authorization_code`.
3. Authenticate the exact bridge client ID and secret using constant-time comparison.
4. Require the exact Postiz redirect URI.
5. Atomically consume the bridge code.
6. Return the upstream token response once.

### `GET /userinfo`

1. Require a Bearer access token.
2. Proxy the request to the Supabase UserInfo endpoint.
3. Return only the upstream response body and safe headers.
4. Never log the token or claims.

### `GET /health`

Return a static status document without checking secrets or external dependencies.

## Security Invariants

- Exact client ID, redirect URI, response type, grant type, and scope validation.
- S256 PKCE only.
- Random values use Web Crypto with at least 256 bits of entropy.
- State and bridge codes are single-use and expire quickly.
- OAuth errors never echo secrets or upstream response bodies that may contain tokens.
- Responses containing tokens use `Cache-Control: no-store` and `Pragma: no-cache`.
- Authorization and callback responses set a restrictive referrer policy.
- No permissive CORS headers are required.
- Structured logs contain request IDs, endpoint names, safe error codes, and latency only.

## Secret Ownership

### GCP Secret Manager

- Existing Supabase client ID: `CROVE_POSTIZ_OAUTH_CLIENT_ID`
- Existing rotated Supabase client secret: `CROVE_POSTIZ_OAUTH_CLIENT_SECRET`
- New Postiz-to-bridge client ID: `CROVE_SSO_BRIDGE_CLIENT_ID`
- New Postiz-to-bridge client secret: `CROVE_SSO_BRIDGE_CLIENT_SECRET`

### Cloudflare Worker Secrets

- `UPSTREAM_CLIENT_ID`
- `UPSTREAM_CLIENT_SECRET`
- `DOWNSTREAM_CLIENT_ID`
- `DOWNSTREAM_CLIENT_SECRET`

No secret values are committed to Git or stored in Wrangler configuration.

## Identity Migration

Before enabling the DOS ID button publicly:

1. Complete a controlled DOS ID authorization and verify the returned email is exactly `joy@dos.ai`.
2. Capture the verified DOS ID `sub` without logging the access token.
3. Back up the exact existing Postiz user row and related organization membership identifiers.
4. Assert there is exactly one existing `LOCAL` user for `joy@dos.ai` and no conflicting `GENERIC` identity.
5. Update only that row to `providerName=GENERIC` and `providerId=<verified sub>` inside a database transaction.
6. Verify the same user ID, organization, integrations, and content counts remain unchanged.

If any precondition fails, stop without mutating the identity.

## Deployment

- Worker name: `crove-sso`
- Custom domain: `sso.crove.com`
- Compatibility date: `2026-08-14`
- Compatibility flag: `nodejs_compat`
- Observability: enabled with structured logs
- Durable Object migration tag: `v1`
- Durable Object class: `OAuthStateStore`

The custom domain is managed by Wrangler. No separate DNS record is required.

## Test Strategy

### Unit and integration tests

- Reject unknown client IDs.
- Reject non-allowlisted redirect URIs.
- Reject unsupported response and grant types.
- Generate a correct S256 PKCE challenge.
- Preserve downstream state through the callback.
- Reject missing, expired, and replayed state.
- Reject missing, expired, and replayed bridge codes.
- Reject invalid downstream client secrets.
- Return upstream token responses only once.
- Proxy UserInfo without logging Bearer tokens.
- Add no-store headers to sensitive responses.

Tests follow red-green-refactor with Vitest and the Cloudflare Workers test pool.

### Deployment verification

1. Verify `/health` on the deployed custom domain.
2. Verify invalid OAuth requests fail closed.
3. Verify the full DOS ID login flow with Playwright.
4. Verify logout and login again.
5. Verify the original Postiz user ID, organization, channels, and content remain intact.
6. Set `DISABLE_REGISTRATION=true`.
7. Verify local email registration is unavailable while DOS ID login remains available.

## Rollback

1. Clear `POSTIZ_GENERIC_OAUTH` in Postiz production and recreate the container.
2. Confirm the DOS ID button is absent and the existing authenticated session remains unaffected.
3. Keep the Worker deployed but unreachable from Postiz for investigation, or remove its custom domain if required.
4. Restore the exact backed-up user identity fields only if the identity migration had completed and DOS ID login cannot be recovered.

## Out of Scope

- Modifying or rebuilding Postiz source code.
- Replacing Supabase DOS ID.
- Adding schema or DDL to the shared production Supabase project.
- Generalizing the bridge for arbitrary third-party clients.
