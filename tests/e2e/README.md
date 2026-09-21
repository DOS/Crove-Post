# Crove Post - Smoke E2E

Playwright smoke suite for the deployed app (beta by default).

## What runs

| Suite | Needs credentials | Covers |
|---|---|---|
| `public smoke` | no | `/auth` redirect, Crove branding, DOS ID button, login page |
| `authenticated smoke` | yes (`E2E_DOS_EMAIL` + `E2E_DOS_PASSWORD`) | sign in via DOS ID SSO, compose a post, schedule it, see it on the calendar |

The authenticated flow creates a real post in the beta workspace. Use the
dedicated beta test account only - never a personal account.

## Run

```bash
pnpm exec playwright install chromium   # once per machine
pnpm run test:e2e                       # public checks

# full flow (dedicated beta test account required)
E2E_DOS_EMAIL=... E2E_DOS_PASSWORD=... pnpm run test:e2e
```

`E2E_BASE_URL` overrides the target (defaults to `https://beta-post.crove.com`).

## Status / next steps

- The public suite is verified against beta (2026-09-21, PR-tested).
- The authenticated suite is scaffolded: selectors for the DOS ID hosted form
  and the composer need finalizing during the first credential-backed run,
  which requires a beta test account from the DOS ID side.
- Not wired into CI yet - wire it after the test account exists and the
  authenticated flow is stable (secret: `E2E_DOS_*`).
