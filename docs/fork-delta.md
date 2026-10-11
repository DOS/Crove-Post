# Fork Delta Inventory (Crove Post vs upstream `gitroomhq/postiz-app`)

This document lists every deliberate divergence from upstream, per ADR-0001. AI agents: consult this before editing shared files, and append entries when creating new divergence. Keep the structure below.

Last verified: 2026-09-21 (fork `dev` vs `upstream/main`).

## 1. Fork-owned paths (additive, no upstream counterpart)

| Path | Purpose |
|---|---|
| `apps/web` | Fork marketing site (crove.com) |
| `libraries/nestjs-libraries/src/dos-billing` | DOS Plus/Pro shared billing via `api.dos.me` |
| `apps/backend/src/ecosystem` | DOS ecosystem sync, first-party bootstrap (DOSClaw), provision/ticket endpoints |
| `libraries/helpers/src/utils/brand.config.ts` | Runtime branding engine |
| `libraries/helpers/src/utils/ecosystem.config.ts` | Ecosystem sync configuration |
| `scripts/branding-guard.ts`, `.github/workflows/branding-guard.yml` | Branding leak enforcement |
| `scripts/docker-compose.beta.yaml`, `scripts/docker-compose.prod.yaml`, `scripts/validate-beta-compose.mjs` | Fork deploy stacks |
| `docs/*` (fork docs, ADRs, refactor docs) | Documentation |
| `apps/frontend` billing components (DOS checkout, lifetime), agents UI | Fork product surfaces inside shared app |

## 2. Diverging shared files (fork edits that upstream also edits)

| Path | Reason | Upstream conflict risk |
|---|---|---|
| `package.json` (root) | pnpm overrides (next, react, multer), fork deps (billing, agents), `@crove/*` workspace names | Low (mechanical conflicts) |
| `pnpm-lock.yaml` | Follows package.json | High churn, always mechanical |
| `.github/workflows/*` | Fork CI (build.yml, sync-upstream.yml, branding-guard.yml, build-containers.yml) | Low (fork-owned workflows) |
| `.env.example` | Fork env sections (branding, DOS billing, ecosystem, SSO) | Low |
| `apps/sdk` package naming | `@crove/node` branding | Low |
| `libraries/nestjs-libraries/src/openai/openai.service.ts` | `pickClips` (sync 2026-09-21) uses the fork `getOpenAIClient()`/`getModel()` pattern so OPENAI_BASE_URL / OPENAI_MODEL_NAME keep working; upstream hardcodes a module-level client and model | Low (file gains upstream methods over time) |
| `libraries/nestjs-libraries/src/upload/local.storage.ts` | `removeFile` containment guard (path.relative check refusing to unlink outside the upload directory) - CodeQL js/path-injection hardening | Low |
| `libraries/nestjs-libraries/src/database/prisma/clipping/clipping.service.ts` | Fixed-format failure logging (data passed as arguments, not interpolated) - CodeQL js/tainted-format-string hardening | Low |
| `apps/backend/src/api/routes/no.auth.integrations.controller.ts` | "Authentication failed" log (added upstream in v2.25.1) passes the `integration` route param as an argument instead of interpolating it into the format string - CodeQL js/tainted-format-string hardening | Low |
| `apps/backend/src/api/routes/billing.controller.ts` | DOS shared billing branches (subscribe, portal, current billing, cancel, prorate). Since the v2.25.1 sync, `/cancel` in DOS mode emails the cancel feedback after dos.me accepts the cancel; the Stripe path keeps upstream's "email only when `cancel_at` is set" | Medium (upstream reworks billing regularly) |
| `apps/frontend/src/components/billing/main.billing.component.tsx` | DOS mode on top of upstream's v2.25.1 billing redesign: monthly-only Plus ($9) / Pro ($19) cards (`PlanCard` `label` prop, yearly toggle hidden, only FREE/STANDARD/PRO), portal/cancel box gated by `showPortalAndCancel`, `BillingHistory` hidden (invoices live in the dos.me portal, so the portal button keeps the "/ Invoices History" label), upstream's cancel-toggle toasts skipped (a dos.me cancel never toggles), non-OK responses toasted | Medium |
| `libraries/nestjs-libraries/src/chat/tools/upload.from.url.tool.ts`, `upload.widget.tool.ts` | MCP descriptions point agents at this deployment's public API and `brand.docsUrl` instead of the upstream CLI (which defaults to the upstream cloud) and upstream docs | Low |
| `libraries/nestjs-libraries/src/integrations/social/youtube.provider.ts` | `refreshErrorMessage` names the deployment brand, so the Workspace admin trusts the right OAuth app | Low |
| `apps/frontend/src/components/new-launch/editor.tsx`, `apps/frontend/src/components/new-launch/manage.modal.tsx`, `apps/frontend/src/components/launches/calendar.context.tsx`, `apps/frontend/src/components/launches/select.channels.tsx`, `apps/frontend/src/components/launches/select.customer.tsx`, `apps/frontend/src/components/launches/menu/menu.tsx`, `apps/frontend/src/components/launches/helpers/date.picker.tsx`, `apps/frontend/src/components/settings/teams.component.tsx` | The ESLint code-scanning gate fails on React Compiler `react-hooks` errors in lines the v2.25.1 sync brought in. Fixes: missing `useCallback` deps added, `t` declared before use, the toolbar gets the TipTap editor from state (`OnlyEditor` `onEditor` prop) instead of reading `editorRef` while rendering (so it now has the editor as soon as it is created), and the editor-rebuild and customer-switch resets adjust state while rendering instead of in an effect (no render with the stale value). Worth sending upstream so the delta disappears | High (hottest upstream files - re-check on every sync) |
| `package.json` `prisma-db-push` | Fork keeps `pnpm exec prisma` (no `prisma-reset` / `docker-*` scripts); took upstream's removal of `--accept-data-loss` in the v2.25.1 sync | Low |

## 3. Planned divergence (accepted, not yet done)

| Area | Plan | Trigger |
|---|---|---|
| `apps/frontend/src/components/launches/calendar.tsx` | Modular calendar rebuild (@dnd-kit, optimistic SWR) | Deferred until after minimal batch; hottest upstream file (98 recent commits) |
| `apps/frontend/src/components/new-launch/*` | Composer split-view rebuild (Typefully style) | Deferred; second-hottest upstream area |
| `apps/frontend/src/app/colors.scss` + `global.scss` | Token consolidation per DESIGN.md, polonto.css purge | Deferred (touches hundreds of files) |
| Tailwind 3.4 → 4 | Wait for upstream's own v4 migration to land | Re-evaluate after upstream lands it |
| eslint 8 → 9 flat config | Prefer upstream-first PR; else fork migration in CI workflow (fork-owned) | Minimal batch item |
| Mantine 5 removal (9 files) | Deferred, harmless short-term | During shell/composer rebuild |

## 4. Deliberately frozen contracts

| Item | Constraint |
|---|---|
| `docker-compose.yaml` service name `postiz` | Frozen: branding-guard allowlist and `scripts/validate-beta-compose.mjs` key off it |
| Temporal workflow files on `origin/main` | Immutable; new versions only (see CLAUDE.md) |
| `MOBILE_APP_SCHEME` | Must stay empty; endpoint returns 501 when unset (upstream code-leak guard) |
