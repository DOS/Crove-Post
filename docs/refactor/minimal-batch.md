# Minimal Batch: Highest Benefit, Lowest Upstream Divergence

- **Status:** Approved by JOY on 2026-09-21 (plan review)
- **Scope:** Foundation safety + test/docs baseline only. UI polish deliberately deferred to a follow-up decision.
- **Source of record:** this file. A Vietnamese dark-theme HTML copy for reading lives at `docs/refactor/minimal-batch-vi.html`.

## Selection principle

Merge conflicts only arise when we edit files upstream also edits. Work that only adds files (tests, docs, CI, loading/error routes) has zero upstream merge cost. The two hottest upstream files (`components/launches/calendar.tsx`, `components/new-launch/*`) are explicitly out of scope for this batch.

## Work items

### 1. Foundation safety (~2 agent-days)

1. Kick the upstream sync workflow and land the sync PR into `dev`.
2. Migrate eslint 8 to eslint 9 + `@typescript-eslint` 8 so the eslint CI workflow turns green. If upstream has already migrated, take their config; the workflow files are fork-owned so either path carries no upstream conflict.
3. Remove leftover untracked `apps/crove-sso` build artifacts on disk.
4. Reconcile prod compose drift on the `crove-server` VM against `scripts/docker-compose.prod.yaml` (ops, no repo change).

### 2. Test and docs baseline (~2 agent-days)

1. Playwright smoke E2E for the main flow: login, compose a post, schedule it, see it on the calendar (runs against beta).
2. Vitest + Testing Library baseline for 2-3 core form primitives.
3. CLAUDE.md: correct stale facts (frontend is Next.js 16 App Router, not Vite; `tailwind.config.cjs` not `.js`; logic lives in `libraries/nestjs-libraries`; component inventory) and add a frontend architecture map.
4. ADR-0001 (upstream sync policy) and `docs/fork-delta.md` (divergence inventory).
5. This document plus the Vietnamese HTML copy.

### 3. Deferred (with re-evaluation triggers)

| Deferred item | Trigger to revisit |
|---|---|
| Composer split-view + calendar rebuild (@dnd-kit, TanStack Query) | After this batch, based on real beta UX |
| Token consolidation + polonto.css purge | Separate batch, accepts wide file churn |
| Tailwind v4, Radix UI kit, Recharts | When a module rebuild actually needs them |
| Mantine 5 removal | During shell/composer rebuild |

## Constraints

- Does not touch billing/auth: JOY's pending DOS billing UAT on prod is not blocked.
- Every work item ships as a small PR: review pass, beta deploy, Playwright smoke, agent merge, JOY UAT.
- Estimated ~5-8 agent-days total.

## Verification done during planning (evidence)

- `git branch -r --contains 4ba51565` includes `upstream/main`: the pnpm restructure originated upstream.
- `git show upstream/main:package.json`: `swr 2.2.5`, `zustand 5.0.5`, `next 16.3.1`, `react 19.2.4`, no Redux.
- `git ls-tree`-style check: `libraries/frontend-library` does not exist on `upstream/main`; `apps/frontend/package.json` does.
- Upstream commits per month (git log count, approximate - exact counts shift with the moment of measurement): 2025-12: 75, 2026-01: 122, 2026-02: 98, 2026-03: 105, 2026-04: 80, 2026-05: 89, 2026-06: 68, 2026-07: 99, 2026-08: ~119-121, 2026-09 (first three weeks): ~103-109.
