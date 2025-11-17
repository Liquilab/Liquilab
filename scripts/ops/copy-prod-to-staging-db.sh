#!/bin/sh
set -e

# Copy production database to staging database
# Usage: ./scripts/ops/copy-prod-to-staging-db.sh [PROD_DATABASE_URL]

STAGING_DB_URL="${STAGING_DATABASE_URL:-postgresql://postgres:hNLzTOzYzGuReDubpcLDLGuPhricYmQr@crossover.proxy.rlwy.net:56937/railway}"

if [ -z "$1" ]; then
  echo "Usage: $0 [PROD_DATABASE_URL]"
  echo ""
  echo "Example:"
  echo "  $0 'postgresql://postgres:password@prod.proxy.rlwy.net:5432/railway'"
  echo ""
  echo "Or set PROD_DATABASE_URL environment variable:"
  echo "  export PROD_DATABASE_URL='postgresql://...'"
  echo "  $0"
  exit 1
fi

PROD_DB_URL="$1"
BACKUP_FILE="/tmp/liquilab_prod_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "[backup] Creating backup from production database..."
echo "[backup] Source: ${PROD_DB_URL%%@*}@***"
pg_dump "$PROD_DB_URL" > "$BACKUP_FILE"

if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
  echo "[backup] ERROR: Backup file is empty or missing"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[backup] ✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

echo ""
echo "[restore] Restoring to staging database..."
echo "[restore] Target: ${STAGING_DB_URL%%@*}@***"

# Drop existing connections and restore
psql "$STAGING_DB_URL" <<EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = current_database()
  AND pid <> pg_backend_pid();
EOF

psql "$STAGING_DB_URL" < "$BACKUP_FILE"

echo ""
echo "[restore] ✅ Database restored successfully"
echo "[cleanup] Backup file saved at: $BACKUP_FILE"
echo ""
echo "Next steps:"
echo "  1. Verify: npm run verify:db:staging"
echo "  2. Cleanup: rm $BACKUP_FILE (optional)"

