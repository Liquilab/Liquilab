#!/usr/bin/env tsx

/**
 * Drop MVs that don't have unique indexes (required for CONCURRENTLY refresh)
 * After dropping, the refresh-views endpoint will recreate them with indexes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MVS_TO_DROP = [
  'mv_pool_latest_state',
  'mv_position_range_status',
  'mv_pool_position_stats',
  'mv_position_latest_event',
];

async function main() {
  console.log('🗑️  Dropping MVs without unique indexes...\n');

  for (const mv of MVS_TO_DROP) {
    try {
      await prisma.$executeRawUnsafe(`DROP MATERIALIZED VIEW IF EXISTS "${mv}" CASCADE`);
      console.log(`✅ Dropped ${mv}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to drop ${mv}: ${errorMsg}`);
    }
  }

  console.log('\n✅ Done! Now run the refresh-views endpoint to recreate MVs with indexes.');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

