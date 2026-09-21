# ADR-0001: Upstream Sync Policy and Fork Delta Inventory

- **Status:** Accepted
- **Date:** 2026-09-21
- **Deciders:** JOY, ZCode agent (minimal-batch refactor planning)

## Context

Crove Post is a long-lived fork of `gitroomhq/postiz-app` (AGPL-3.0). Historically there was confusion about how much the fork diverged from upstream: an early exploration report (2026-09-20) claimed the fork had rewritten the frontend structure (App Router + SWR + Zustand) while upstream supposedly still used Nx + Redux. Git evidence disproved this:

- `upstream/main` contains the fork's pnpm restructure commit `4ba51565` ("feat: move to pnpm", 2025-05-06). The restructure originated upstream.
- `upstream/main` today ships `swr 2.2.5`, `zustand 5.0.5`, `next 16.3.1`, `react 19.2.4`, has `apps/frontend`, and no longer has `libraries/frontend-library` or Redux.
- The fork's merge-base with `upstream/main` is an upstream commit from 2026-09-03, and the automated daily sync (`sync-upstream.yml`) merges upstream into `dev` regularly.

The fork's true delta is **additive**: DOS ID SSO, DOS shared billing, the runtime branding engine, DOS ecosystem sync / first-party bootstrap, the `apps/web` marketing site, and fork-specific UI (DOS billing pages, agents). The shared core intentionally tracks upstream.

Upstream commit velocity is steady (~3-4 commits/day every month, measured over 2025-12 through 2026-09), so waiting for a "quiet period" to refactor is not a strategy.

## Decision

1. **Keep the automated upstream sync for both backend and frontend.** The structures align; merges are file-level. Never restructure `libraries/nestjs-libraries` paths or split it into new packages, as that would break the corridor.
2. **Additive-first rule.** New fork features go in separate paths (existing examples: `apps/web`, `libraries/nestjs-libraries/src/dos-billing`, `apps/backend/src/ecosystem`). This keeps zero overlap with upstream.
3. **Divergence is deliberate and recorded.** Any fork change to a file that upstream also edits must be listed in `docs/fork-delta.md` with a reason. Any library upgrade ahead of upstream (for example `@dnd-kit` replacing `react-dnd` inside a rebuilt module) counts as fork delta and must be recorded there too.
4. **Hot upstream files get special care.** `apps/frontend/src/components/launches/calendar.tsx` and `apps/frontend/src/components/new-launch/*` are the most-churned files upstream. Rebuilding them is allowed but must be scheduled as its own decision, accepting the recurring merge cost.
5. **Fork-ahead generic cleanups should preferably be contributed upstream first** (upstream merges external PRs actively), then flow back through the sync corridor. Examples: eslint 9 flat-config migration, Tailwind v4 completion.

## Consequences

- The daily sync keeps delivering upstream fixes (provider fixes, security, MCP work) with bounded conflict cost, as long as the delta inventory is maintained.
- AI agents working on this repo must consult `docs/fork-delta.md` before editing shared files, and must append entries when they create new deliberate divergence.
- Refactor batches that only add files (tests, docs, CI, loading/error routes) carry no upstream merge cost and are the preferred first moves.
