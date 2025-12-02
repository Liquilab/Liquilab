#!/usr/bin/env tsx

/**
 * Create all Materialized Views from SQL files in db/views/
 * This script reads all MV SQL files and executes them to create the views.
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const MV_FILES = [
  'mv_pool_latest_state.sql',
  'mv_pool_fees_24h.sql',
  'mv_position_range_status.sql',
  'mv_pool_position_stats.sql',
  'mv_position_latest_event.sql',
  'mv_pool_volume_7d.sql',
  'mv_pool_fees_7d.sql',
  'mv_positions_active_7d.sql',
  'mv_wallet_lp_7d.sql',
  'mv_pool_changes_7d.sql',
  // Note: mv_position_lifetime_v1 might not exist yet, will skip if missing
];

async function checkMVExists(mvName: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = ${mvName}
      ) as exists
    `;
    return result[0]?.exists ?? false;
  } catch (error) {
    console.error(`Error checking MV ${mvName}:`, error);
    return false;
  }
}

async function createMV(sqlFile: string): Promise<{ success: boolean; error?: string }> {
  const mvName = sqlFile.replace('.sql', '');
  const filePath = join(process.cwd(), 'db/views', sqlFile);

  try {
    // Check if MV already exists
    const exists = await checkMVExists(mvName);
    if (exists) {
      console.log(`⏭️  ${mvName} already exists, skipping`);
      return { success: true };
    }

    // Read SQL file
    const sql = readFileSync(filePath, 'utf-8');
    
    // Execute SQL (split by semicolons to handle multiple statements)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await prisma.$executeRawUnsafe(statement);
      }
    }

    console.log(`✅ Created ${mvName}`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to create ${mvName}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

async function main() {
  console.log('🔨 Creating Materialized Views...\n');

  const results: Array<{ file: string; success: boolean; error?: string }> = [];

  for (const sqlFile of MV_FILES) {
    const result = await createMV(sqlFile);
    results.push({ file: sqlFile, ...result });
  }

  // Try mv_position_lifetime_v1 if it exists
  try {
    const lifetimeFile = 'mv_position_lifetime_v1.sql';
    const lifetimePath = join(process.cwd(), 'db/views', lifetimeFile);
    const fs = await import('fs');
    if (fs.existsSync(lifetimePath)) {
      const result = await createMV(lifetimeFile);
      results.push({ file: lifetimeFile, ...result });
    } else {
      console.log(`⏭️  ${lifetimeFile} not found, skipping`);
    }
  } catch (error) {
    // Ignore if file doesn't exist
  }

  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`   ✅ Created: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed MVs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
    process.exit(1);
  }

  console.log('\n✅ All Materialized Views created successfully!');
  console.log('   Next step: Run refresh to populate data:');
  console.log('   npm run refresh:mvs');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

