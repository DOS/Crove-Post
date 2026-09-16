#!/usr/bin/env bash
# Database backup for the production VM (cron → R2 / local rotation).
#
# The app database lives in Supabase (managed, has its own PITR) — this script
# backs up the two databases that live on the VM and have NO backup:
#   1. temporal-postgresql (Temporal DB: workflow history)
#   2. Any dynamic tables written by the app outside Supabase (none today,
#      but harmless to include if that changes).
#
# Supabase backups are handled by Supabase itself — verify PITR is enabled.
#
# Install on the VM (as root):
#   scp scripts/backup-db.sh crove-server:/opt/crove/backup-db.sh
#   chmod +x /opt/crove/backup-db.sh
#   crontab -e
#     17 2 * * * /opt/crove/backup-db.sh >> /opt/crove/backups/backup.log 2>&1
#
# Restore drill (run quarterly — audit C2): restore the latest dump into a
# throwaway container and `SELECT 1` against it before trusting the backup.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/crove/backups}"
RETAIN_DAYS="${RETAIN_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

echo "[$STAMP] checking temporal stack health before backup..."
UNHEALTHY="$(docker ps --filter name=temporal --filter health=unhealthy --format '{{.Names}}')"
if [ -n "$UNHEALTHY" ]; then
  echo "[$STAMP] ERROR: temporal containers UNHEALTHY: $UNHEALTHY — refusing to back up a wedged state-store. Investigate with 'docker inspect --format \"{{json .State.Health}}\" $UNHEALTHY'" >&2
  exit 1
fi

echo "[$STAMP] backing up temporal-postgresql..."
docker exec temporal-postgresql \
  pg_dump -U temporal -d temporal \
  | gzip > "$BACKUP_DIR/temporal-$STAMP.sql.gz"

# Verify the dump is not empty before pruning anything.
if [ ! -s "$BACKUP_DIR/temporal-$STAMP.sql.gz" ]; then
  echo "[$STAMP] ERROR: temporal dump is empty — aborting" >&2
  exit 1
fi

echo "[$STAMP] pruning dumps older than $RETAIN_DAYS days..."
find "$BACKUP_DIR" -name 'temporal-*.sql.gz' -mtime "+$RETAIN_DAYS" -delete

# Optional: copy off-box to R2 if rclone is configured.
if command -v rclone >/dev/null 2>&1 && rclone listremotes | grep -q .; then
  REMOTE="$(rclone listremotes | head -1)"
  rclone copy "$BACKUP_DIR/temporal-$STAMP.sql.gz" "$REMOTE/crove-backups/" || \
    echo "[$STAMP] WARN: rclone upload failed" >&2
fi

echo "[$STAMP] done."
