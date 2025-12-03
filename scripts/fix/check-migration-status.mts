#!/usr/bin/env tsx

/**
 * Check which migrations have already been applied to the database
 * Helps resolve migration drift issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking migration status...\n');

  const migrations = [
    '20251025185340_early_access',
    '20251026120000_payment_invoices',
    '20251026130000_placeholder_signup',
    '20251027200940_app_settings',
    '20251029185441_wallet_discovery',
    '20251106_analytics_position_flat',
    '20251106_analytics_position_init',
    '20251109_mv_pool_fees_24h',
    '20251109_mv_pool_latest_state',
    '20251109_pool_incentive_store',
  ];

  console.log('Checking if database objects already exist:\n');

  // Check for enum types
  const enumTypes = ['PositionEventType', 'CapitalFlowType', 'PoolStatus', 'PaymentStatus', 'PaymentKind', 'UserState'];
  for (const enumType of enumTypes) {
    try {
      const result = await prisma.$queryRaw<Array<{ typname: string }>>`
        SELECT typname 
        FROM pg_type 
        WHERE typname = ${enumType}
      `;
      if (result.length > 0) {
        console.log(`✅ Enum ${enumType} exists`);
      } else {
        console.log(`❌ Enum ${enumType} missing`);
      }
    } catch (error) {
      console.log(`⚠️  Could not check enum ${enumType}:`, error);
    }
  }

  console.log('\nChecking for tables:\n');
  const tables = ['User', 'PoolEvent', 'WaitlistEntry', 'PositionEvent', 'PositionTransfer', 'CapitalFlow', 'Wallet', 'UserPool', 'Payment', 'SyncCheckpoint', 'BackfillCursor'];
  for (const table of tables) {
    try {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename = ${table}
      `;
      if (result.length > 0) {
        console.log(`✅ Table ${table} exists`);
      } else {
        console.log(`❌ Table ${table} missing`);
      }
    } catch (error) {
      console.log(`⚠️  Could not check table ${table}:`, error);
    }
  }

  console.log('\n📝 Recommendation:');
  console.log('If all enums and tables exist, mark migrations as applied:');
  for (const migration of migrations) {
    console.log(`   railway run npx prisma migrate resolve --applied ${migration}`);
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

