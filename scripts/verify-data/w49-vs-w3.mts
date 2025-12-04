#!/usr/bin/env tsx

/**
 * W49 vs W3 Dataset Coverage Comparison
 * 
 * Compares current W49 dataset (SP2) against W3 Cross-DEX reference.
 * 
 * W3 Reference (Enosys + SparkDEX v3 on Flare, 2025-11-16):
 *   - TVL (USD): $58.9M
 *   - Pools: 238
 *   - Positions: 74,857
 *   - Wallets: 8,594
 * 
 * Usage: npm run verify:data:w49-vs-w3
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first, then .env as fallback
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { getUniverseOverview } from '../../src/lib/analytics/db';

const prisma = new PrismaClient();

// W3 Cross-DEX reference constants (Enosys + SparkDEX v3 on Flare)
const W3_TVL_USD = 58_900_000;
const W3_POOLS = 238;
const W3_POSITIONS = 74_857;
const W3_WALLETS = 8_594;

function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPct(value: number, reference: number): string {
  if (reference === 0) return 'N/A';
  const pct = (value / reference) * 100;
  return `${pct.toFixed(1)}%`;
}

async function main() {
  console.log('\n=== W3 vs W49 Dataset Coverage ===\n');

  const universe = await getUniverseOverview();

  // TVL
  console.log('TVL (USD, priced pools):');
  console.log(`  W3:   ${formatUsd(W3_TVL_USD)}`);
  console.log(`  W49:  ${formatUsd(universe.tvlPricedUsd)}`);
  console.log(`  Cov:  ${formatPct(universe.tvlPricedUsd, W3_TVL_USD)}`);
  if (universe.tvlPricedUsd === 0) {
    console.log('  Note: TVL = 0 because per-pool amounts are not yet exposed in MVs');
  }
  console.log();

  // Pools (total and priced/unpriced breakdown)
  console.log('Pools:');
  console.log(`  W3:       ${W3_POOLS.toLocaleString()}`);
  console.log(`  W49:      ${universe.totalPoolsCount.toLocaleString()} total`);
  console.log(`    Priced:   ${universe.pricedPoolsCount.toLocaleString()} (${formatPct(universe.pricedPoolsCount, universe.totalPoolsCount)})`);
  console.log(`    Unpriced: ${universe.unpricedPoolsCount.toLocaleString()} (${formatPct(universe.unpricedPoolsCount, universe.totalPoolsCount)})`);
  console.log(`  Cov (total): ${formatPct(universe.totalPoolsCount, W3_POOLS)}`);
  console.log();

  // Positions
  console.log('Positions:');
  console.log(`  W3:   ${W3_POSITIONS.toLocaleString()}`);
  console.log(`  W49:  ${universe.positionsCount.toLocaleString()}`);
  console.log(`  Cov:  ${formatPct(universe.positionsCount, W3_POSITIONS)}`);
  console.log();

  // Wallets
  console.log('Wallets:');
  console.log(`  W3:   ${W3_WALLETS.toLocaleString()}`);
  console.log(`  W49:  ${universe.walletsCount.toLocaleString()}`);
  console.log(`  Cov:  ${formatPct(universe.walletsCount, W3_WALLETS)}`);
  console.log();

  // Active Wallets (7d)
  console.log('Active Wallets (7d):');
  console.log(`  W49:  ${universe.activeWallets7d.toLocaleString()} (~${formatPct(universe.activeWallets7d, W3_WALLETS)} of W3 total)`);
  console.log();

  // Summary
  console.log('=== Summary ===');
  
  // For coverage, we use priced pools (not total), positions, and wallets
  // TVL is excluded from average until amounts are available
  const poolCov = universe.pricedPoolsCount / W3_POOLS;
  const posCov = universe.positionsCount / W3_POSITIONS;
  const walletCov = universe.walletsCount / W3_WALLETS;
  
  // Weighted average (excluding TVL which is 0)
  const avgCoverage = (poolCov + posCov + walletCov) / 3 * 100;

  if (avgCoverage >= 95) {
    console.log('✅ Excellent overall coverage (≥95%)');
  } else if (avgCoverage >= 80) {
    console.log('⚠️  Good coverage (≥80%) - some gaps remain');
  } else if (avgCoverage >= 50) {
    console.log('⚠️  Partial coverage (≥50%) - significant data missing');
  } else {
    console.log('❌ Low coverage (<50%) - backfill or indexing incomplete');
  }
  console.log(`   Average coverage (pools/positions/wallets): ${avgCoverage.toFixed(1)}%`);
  
  if (universe.tvlPricedUsd === 0) {
    console.log('\n📊 TVL Note: Currently 0 because per-pool token amounts are not in MVs.');
    console.log('   Next step: Create mv_pool_liquidity or fetch amounts via RPC.');
  }
  console.log();
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
