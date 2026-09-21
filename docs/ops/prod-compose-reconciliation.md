# Prod Compose Reconciliation - crove-server VM

- **Date:** 2026-09-21 (minimal batch audit)
- **Runtime:** GCP `crove-server` (asia-southeast1-b), stack dir `/opt/crove`
- **Source of record:** `scripts/docker-compose.prod.yaml`

## Current state (verified 2026-09-21)

Prod app DB is Supabase (confirmed from the running container env:
`...pooler.supabase.com:6543/postgres?...schema=post`). The VM deploy copy
`/opt/crove/docker-compose.prod.yaml` is an older fork revision and additionally
still defines services the source of record dropped.

### VM deploy file is missing (repo file has, VM file lacks)

1. `CROVE_POST_IMAGE` pin override + `pull_policy: always` (audit I-B4)
2. crove-post explicit pm2/nginx command + proven healthcheck (2026-08-12 outage class)
3. Temporal server healthcheck (TCP 7233), temporal-postgresql healthcheck,
   temporal-elasticsearch healthcheck (audit S18: silent-wedge alarms)
4. `POSTGRES_PWD` / `POSTGRES_PASSWORD` required-var form
   (`${CROVE_TEMPORAL_POSTGRES_PASSWORD:?...}`)
5. `DYNAMIC_CONFIG_FILE_PATH=config/dynamicconfig/production-sql.yaml`
   (VM runs `development-sql.yaml`)

### VM file has extra, repo file dropped (intentionally)

1. `crove-postgres` service (local Postgres 17) + `postgres-volume` + the
   depends_on health gate - legacy from before the Supabase migration
2. VM also runs a stray `postiz-redis` container (pre-rename stack debris,
   not referenced by the current deploy file)

### Completed (Phase A - zero runtime impact)

1. Added `CROVE_TEMPORAL_POSTGRES_PASSWORD=temporal` to
   `/opt/crove/crove-server.env` - matches the password temporal-postgresql was
   initialized with, so the repo file becomes interpolable without changing any
   runtime state. Comment marks it for rotation in the window.

## Reconciliation window (Phase B - needs a maintenance slot)

Order matters; each step is a separate rollback point.

1. Put the repo file at `/opt/crove/docker-compose.prod.yaml`
   (`docker compose config -q` first, with the env file).
2. `docker compose up -d` for crove-post / crove-web / cloudflared /
   crove-redis only - adopts image pin, pull policy, healthcheck. App briefly
   recreates; schedule off-peak.
3. Temporal stack: flip `DYNAMIC_CONFIG_FILE_PATH` to `production-sql.yaml` and
   adopt the three S18 healthchecks. Restart order: temporal-postgresql ->
   temporal-elasticsearch -> temporal -> temporal-ui/admin-tools. Verify a test
   workflow executes (schedule a post on beta, which shares this cluster).
4. Rotate `CROVE_TEMPORAL_POSTGRES_PASSWORD` (current value is the well-known
   dev default `temporal`): update the env file, reset the temporal user's
   password inside temporal-postgresql, then recreate the temporal services.
5. Retire legacy: confirm nothing connects to the local `crove-postgres`
   (app DB is Supabase) and nothing uses `postiz-redis`, then
   `docker compose rm`/`down` them and delete `postgres-volume` after a
   2-week safety window (volume holds the pre-migration data - keep it until
   then; do NOT delete before checking with JOY).

## Verification after each step

- `docker ps` health status for the touched services
- `docker compose -f /opt/crove/docker-compose.prod.yaml logs --tail=50` on error
- End-to-end: schedule a post on beta (shares the Temporal cluster) and watch
  it publish; check prod posting on an existing scheduled slot
