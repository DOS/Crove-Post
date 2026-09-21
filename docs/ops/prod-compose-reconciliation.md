# Prod Compose Reconciliation - crove-server VM

- **Date:** audited + Phase A 2026-09-21 morning; **Phase B EXECUTED 2026-09-21** (JOY approved)
- **Runtime:** GCP `crove-server` (asia-southeast1-b), stack dir `/opt/crove`
- **Source of record:** `scripts/docker-compose.prod.yaml`

## Outcome

Phase B is **DONE**. The VM now runs the repo compose file (with two
evidence-based corrections that are merged back into this repo - see
Deviations). Prod and beta both verified serving after every step
(`post.crove.com` and `beta-post.crove.com` returned 200 throughout).

| Step | Result |
|---|---|
| Backups | `docker-compose.prod.yaml.bak-20260921` + `crove-server.env.bak-20260921` in `/opt/crove` |
| Repo file installed at `/opt/crove/docker-compose.prod.yaml` | yes, `docker compose config` validated |
| crove-post / crove-redis / cloudflared recreated | yes; crove-post reports `healthy` via the new healthcheck |
| Temporal stack S18 healthchecks | yes: temporal, temporal-postgresql, temporal-elasticsearch all `healthy` |
| Temporal password rotated | yes: 32-char random in `.env` + `crove-server.env`, role altered inside temporal-postgresql; temporal server reconnects with the new password (old dev default no longer valid for network auth) |
| Legacy crove-postgres + postiz-redis | REMOVED (evidence: prod uses `redis://crove-redis:6379` and Supabase; pg_stat_activity showed no client connections). Volumes kept on disk |

## Deviations from the repo file as originally authored (now merged back)

1. **dynamicconfig stays `development-sql.yaml`.** The `temporalio/auto-setup`
   image ships only `development-sql.yaml` / `development-cass.yaml` - there is
   no `production-sql` template - and the `./dynamicconfig` mount shadows the
   image dir anyway. `scripts/docker-compose.prod.yaml` was corrected to match.
2. **Temporal healthcheck probes the container IP, not localhost.** The
   temporal server binds its services to the container eth0 address, so a
   `localhost:7233` probe is refused forever and reported `unhealthy` while the
   server was actually fine. The probe now uses
   `bash -c "</dev/tcp/$$(hostname -i)/7233"`.
3. **Compose interpolation needs `/opt/crove/.env`.** `${CROVE_TEMPORAL_POSTGRES_PASSWORD:?}`
   is resolved from the compose-level env file (`/opt/crove/.env`), not the
   service-level `env_file:`. `.env` was created with the rotated value and
   `chmod 600`. Deployment notes added to the compose header.
4. **crove-web stays dormant.** `ghcr.io/dos/crove-web` does not exist, and a
   `docker compose up` that includes the service fails the whole group on the
   missing image (confirmed live). Landing page remains on Vercel.

## Residual / deferred items

- **pg_hba on the temporal-postgres volume**: the volume was initialized with
  `trust` rows for local + 127.0.0.1/32 (stock docker defaults). Connections
  from the docker network still hit the `scram-sha-256` rule and require the
  rotated password, and the container publishes no ports, so exposure is
  internal-only. Full pg_hba normalization would require editing the file in
  the data volume - deferred as low value / nonzero risk.
- **`crove_postgres-volume`** still holds the pre-Supabase data. Delete after
  the 2-week safety window (not before JOY confirms).
- **`CROVE_WEB_IMAGE`**: if crove.com is ever moved off Vercel, build and push
  the image first, then start the service.
