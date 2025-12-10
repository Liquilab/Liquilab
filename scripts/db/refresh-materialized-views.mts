#!/usr/bin/env tsx

/**
 * Refresh Materialized Views
 * 
 * Refreshes all materialized views in dependency order.
 * Uses CONCURRENTLY when possible, falls back to non-concurrent refresh.
 * 
 * Usage: npm run db:mvs:refresh:7d
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Refresh order (respects dependencies)
const REFRESH_ORDER = [
  // Base MVs (no dependencies)
  'mv_pool_latest_state',
  'mv_pool_fees_24h',
  'mv_pool_fees_7d',
  'mv_pool_position_stats',
  'mv_position_latest_event',
  'mv_pool_volume_7d',
  'mv_positions_active_7d',
  'mv_wallet_lp_7d',
  'mv_pool_changes_7d',
  'mv_position_lifetime_v1',
  // Dependent MVs (after base views)
  'mv_position_range_status', // depends on mv_pool_latest_state
  // TVL-related MVs (depends on Pool table)
  'mv_pool_liquidity',
];

async function refreshMV(mvName: string): Promise<{ name: string; success: boolean; duration: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Try CONCURRENTLY first (requires unique index)
    try {
      await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY "${mvName}"`);
      const duration = Date.now() - startTime;
      console.log(`✅ ${mvName} (${duration}ms)`);
      return { name: mvName, success: true, duration };
    } catch (concurrentError) {
      const errorMsg = concurrentError instanceof Error ? concurrentError.message : String(concurrentError);
      
      // If CONCURRENTLY fails because MV is not populated, use non-concurrent refresh
      if (errorMsg.includes('not populated') || errorMsg.includes('CONCURRENTLY cannot be used')) {
        await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW "${mvName}"`);
        const duration = Date.now() - startTime;
        console.log(`✅ ${mvName} (non-concurrent, ${duration}ms)`);
        return { name: mvName, success: true, duration };
      }
      
      // Re-throw other errors
      throw concurrentError;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${mvName} (${duration}ms): ${errorMsg}`);
    return { name: mvName, success: false, duration, error: errorMsg };
  }
}

async function main() {
  console.log('🔄 Refreshing Materialized Views...\n');

  const results: Array<{ name: string; success: boolean; duration: number; error?: string }> = [];

  for (const mvName of REFRESH_ORDER) {
    const result = await refreshMV(mvName);
    results.push(result);
  }

  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`   ✅ Refreshed: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏱️  Total time: ${totalDuration}ms`);

  if (failed > 0) {
    console.log('\n❌ Failed MVs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }

  console.log('\n✅ All Materialized Views refreshed successfully!');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
