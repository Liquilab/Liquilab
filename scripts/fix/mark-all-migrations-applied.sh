#!/bin/bash

# Script to mark all pending migrations as applied
# Run this on Railway: railway run bash scripts/fix/mark-all-migrations-applied.sh

MIGRATIONS=(
  "20251026120000_payment_invoices"
  "20251026130000_placeholder_signup"
  "20251027200940_app_settings"
  "20251029185441_wallet_discovery"
  "20251106_analytics_position_flat"
  "20251106_analytics_position_init"
  "20251109_mv_pool_fees_24h"
  "20251109_mv_pool_latest_state"
  "20251109_pool_incentive_store"
)

echo "Marking migrations as applied..."
for migration in "${MIGRATIONS[@]}"; do
  echo "Marking $migration as applied..."
  npx prisma migrate resolve --applied "$migration" || echo "Failed or already applied: $migration"
done

echo ""
echo "Checking migration status..."
npx prisma migrate status

