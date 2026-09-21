This project is **Crove Post** (`@crove/*`), a fork of [Postiz](https://github.com/gitroomhq/postiz-app) (AGPL-3.0) that schedules social media posts through 36 provider integrations (see `libraries/nestjs-libraries/src/integrations/integration.manager.ts`).
You can add posts to the calendar, they will be added into a workflow and posted at the right time.

Fork-specific surfaces (not in upstream): DOS ID SSO (`api.dos.me`), DOS shared billing (`libraries/nestjs-libraries/src/dos-billing`), runtime branding engine (`libraries/helpers/src/utils/brand.config.ts` + `scripts/branding-guard.ts`), DOS ecosystem sync / first-party bootstrap (`apps/backend/src/ecosystem`), and the `apps/web` marketing site. Everything else intentionally tracks upstream. See `docs/adr/0001-upstream-sync-and-fork-delta.md` and `docs/fork-delta.md`.

This project is a monorepo with a root-only package.json of dependencies.
Made with PNPM. We are using only pnpm, don't use any other dependency manager.
Never install frontend components from npmjs, focus on writing native components.

## Layout

- apps/backend - NestJS API. Controllers are thin; most logic lives in libraries.
- apps/orchestrator - NestJS Temporal worker: workflows, activities, signals.
- apps/frontend - Next.js 16 App Router dashboard (React 19, port 4200). This is Next.js, not Vite.
- apps/web - fork-owned Next.js marketing site.
- apps/extension - Chrome MV3 extension (Vite + crxjs).
- apps/sdk - published public SDK (`@crove/node`, built with tsup).
- apps/commands - NestJS CLI commands.
- libraries/nestjs-libraries - shared backend services: database (Prisma), integrations, uploads, billing, dos-billing, ecosystem, temporal, chat/MCP.
- libraries/react-shared-libraries - shared frontend primitives: form controls, toaster, translation.
- libraries/helpers - shared utils (`custom.fetch`, `brand.config`, `ecosystem.config`).

## Frontend

- Routing lives in `/apps/frontend/src/app` with route groups `(app)`, `(extension)`, `(provider)`.
- Always use SWR to fetch stuff, and use the "useFetch" hook from `/libraries/helpers/src/utils/custom.fetch.tsx`.

When using SWR, each one has to be in a separate hook and must comply with react-hooks/rules-of-hooks, never put eslint-disable-next-line on it.

It means that this is valid:
const useCommunity = () => {
   return useSWR....
}

This is not valid:
const useCommunity = () => {
  return {
    communities: () => useSWR<CommunitiesListResponse>("communities", getCommunities),
    providers: () => useSWR<ProvidersListResponse>("providers", getProviders),
  };
}

- Client state uses Zustand with two stores: the composer store (`components/new-launch/store.ts`) and the modal manager (`components/layout/new-modal.tsx`). The timezone preference is not Zustand - it is localStorage + dayjs (`components/layout/set.timezone.tsx`). There is no Redux.
- Styling is Tailwind 3 + SCSS tokens. Before writing any component look at:
  - `/apps/frontend/src/app/colors.scss`
  - `/apps/frontend/src/app/global.scss`
  - `/apps/frontend/tailwind.config.cjs` (note: `.cjs`)

All the --color-custom* are deprecated, don't use them; use the `--new-*` tokens. The design language is documented in `DESIGN.md`.
`/apps/frontend/src/app/polonto.css` is vendored Polotno/Blueprint CSS, do not hand-edit it.

- Most UI is in `/apps/frontend/src/components`: `new-launch` (post composer), `launches` (planner/calendar), `layout` (app shell), `billing` (DOS shared billing), `agents` (CopilotKit chat), `media` (Polotno editor), `public-api`, `settings`, `auth`.
- `/apps/frontend/src/components/ui` is nearly empty. Shared form primitives live in `/libraries/react-shared-libraries/src/form`.
- Backend DTOs are reused in forms via `classValidatorResolver` (intentional coupling, keep it).

## Backend

When working on the backend we need to pass the 3 layers:
DTO >> Controller >> Service >> Repository (no shortcuts)
In some cases we will have
DTO >> Controller >> Manager >> Service >> Repository.

Most of the server logic lives in `/libraries/nestjs-libraries`.
The backend app is mostly used to write controllers and import from the libraries.

- Never use RAW SQL queries, always use Prisma (schema at `/libraries/nestjs-libraries/src/database/prisma/schema.prisma`).
- The database is PostgreSQL on Supabase with PgBouncer; the Prisma datasource uses `directUrl` for migrations.
- Publishing pipeline: `PostsService` starts a Temporal workflow (`postWorkflowV*`); workers run in `apps/orchestrator` with one activity worker per provider task queue.
- Code must always be generic: provider-specific logic only inside the provider file in `/libraries/nestjs-libraries/src/integrations/social`. Extend the provider interface and call it generically; never write `if (facebookProvider) {}` inside a generic file.

## Temporal rules (load-bearing)

- Workflow files that are already in origin/main can never be changed in place, because changing a workflow fails all its activities. Instead create a new workflow with the version, and everywhere the workflow is being called, change it to the new workflow version.
- Workflow activity parameters cannot be changed, as it will break the workflow. If we need to change the parameters, create a new activity with the new parameters, and then create a new workflow that uses the new activity.

## Working rules

- The system is in production with many users: make sure changes do not break anything for existing users, and a migration might be needed.
- Whenever you generate a PR, PR description, or similar, **always** follow the PR Template (.github/PULL_REQUEST_TEMPLATE.md)
- Every PR description **must** contain a `# QA` section with real, numbered steps a reviewer can follow to verify the change (setup, action, expected result), written so they can be run without asking the author anything. This is not optional and applies to humans and agents alike, including one-line fixes. The section is extracted verbatim and shown on the review board, so:
  - Use the exact heading `# QA` (`# Testing`, `# Test plan`, `# How to test`, `# How to verify`, `# Verification`, `# Steps to test` and `# Manual testing` are also recognised, but prefer `# QA`). The whole heading must match, so something like `## Testing philosophy` is not picked up.
  - Never leave the template placeholder in place, and never write `N/A`, `TBD`, `todo`, `none` or a bare empty checkbox as the whole section - those all count as no QA at all and the board will show the PR as missing testing notes.
  - Steps inside a fenced code block are ignored, so keep them as plain numbered lines. Write each step as a numbered checkbox (`1. [ ] step`) so a reviewer can tick it off while working through it - the numbering is what the board extracts, the checkbox is for the reviewer.
- Every PR description **must** answer `# What kind of change does this PR introduce?` with actual detail, not just a category. `Bug fix.` / `Feature.` on its own is not acceptable. State the type, the area it touches (backend, frontend, orchestrator, a specific provider or screen), and in one to three sentences what concretely changed and where - the key function, endpoint, file or field - plus what deliberately stayed the same. A reader should understand the change from this section alone, without opening the diff.
- Avoid as much as possible creating new files with pure logic of algorithms, it's usually wrong
- When you write code, make sure that what you add looks like something similar somewhere else in the code, don't make weird patterns
- When you finished running, run another agents that matches the new code with the existing system code, to see that it looks similar and is not a weird pattern.
- Linting of the project can run only from the root.
- Use only pnpm.
- Branding guard (`scripts/branding-guard.ts`, enforced in CI) blocks reintroducing upstream endpoints or branding; use `branding-guard-allow:` comments only for deliberate references.
