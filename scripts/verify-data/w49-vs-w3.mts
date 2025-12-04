#!/usr/bin/env tsx

/**
 * W49 vs W3 Dataset Coverage Comparison
 *
 * Compares current W49 dataset (SP2) against W3 Cross-DEX reference.
 * Uses UniverseOverview from analytics/db.ts for all metrics.
 *
 * Usage: npm run verify:data:w49-vs-w3
 *
 * @module scripts/verify-data/w49-vs-w3
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { getUniverseOverview, type UniverseOverview } from '../../src/lib/analytics/db';

// ============================================================
// W3 Reference Constants (Enosys + SparkDEX v3 on Flare, 2025-11-16)
// ============================================================

const W3_REFERENCE = {
  tvlUsd: 58_900_000,
  pools: 238,
  positions: 74_857,
  wallets: 8_594,
} as const;

// ============================================================
// Formatting Helpers
// ============================================================

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatPct(value: number, reference: number): string {
  if (reference === 0) return 'N/A';
  return `${((value / reference) * 100).toFixed(1)}%`;
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

// ============================================================
// Output Functions
// ============================================================

function printMetric(
  label: string,
  w3Value: number,
  w49Value: number,
  format: (n: number) => string = formatNumber,
): void {
  console.log(`${label}:`);
  console.log(`  W3:   ${format(w3Value)}`);
  console.log(`  W49:  ${format(w49Value)}`);
  console.log(`  Cov:  ${formatPct(w49Value, w3Value)}`);
  console.log();
}

function printPoolBreakdown(universe: UniverseOverview): void {
  console.log('Pools:');
  console.log(`  W3:       ${formatNumber(W3_REFERENCE.pools)}`);
  console.log(`  W49:      ${formatNumber(universe.totalPoolsCount)} total`);
  console.log(`    Priced:   ${formatNumber(universe.pricedPoolsCount)} (${formatPct(universe.pricedPoolsCount, universe.totalPoolsCount)})`);
  console.log(`    Unpriced: ${formatNumber(universe.unpricedPoolsCount)} (${formatPct(universe.unpricedPoolsCount, universe.totalPoolsCount)})`);
  console.log(`  Cov (total): ${formatPct(universe.totalPoolsCount, W3_REFERENCE.pools)}`);
  console.log();
}

function printSummary(universe: UniverseOverview): void {
  console.log('=== Summary ===');

  const metrics = [
    universe.tvlPricedUsd / W3_REFERENCE.tvlUsd,
    universe.pricedPoolsCount / W3_REFERENCE.pools,
    universe.positionsCount / W3_REFERENCE.positions,
    universe.walletsCount / W3_REFERENCE.wallets,
  ];

  const avgCoverage = (metrics.reduce((a, b) => a + b, 0) / metrics.length) * 100;

  if (avgCoverage >= 95) {
    console.log('✅ Excellent coverage (≥95%)');
  } else if (avgCoverage >= 80) {
    console.log('⚠️  Good coverage (≥80%)');
  } else if (avgCoverage >= 50) {
    console.log('⚠️  Partial coverage (≥50%)');
  } else {
    console.log('❌ Low coverage (<50%)');
  }

  console.log(`   Average: ${avgCoverage.toFixed(1)}%`);

  if (universe.tvlPricedUsd === 0 && universe.pricedPoolsCount > 0) {
    console.log('\n📊 TVL Note: Run db:mvs:refresh:7d to populate mv_pool_liquidity');
  }

  console.log();
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  console.log('\n=== W3 vs W49 Dataset Coverage ===\n');

  let universe: UniverseOverview;

  try {
    universe = await getUniverseOverview();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Failed to get universe overview: ${msg}`);
    process.exit(1);
  }

  // Print metrics
  printMetric('TVL (USD, priced pools)', W3_REFERENCE.tvlUsd, universe.tvlPricedUsd, formatUsd);

  if (universe.tvlPricedUsd === 0 && universe.pricedPoolsCount > 0) {
    console.log('  Note: TVL = 0; run db:mvs:refresh:7d to populate\n');
  }

  printPoolBreakdown(universe);
  printMetric('Positions', W3_REFERENCE.positions, universe.positionsCount);
  printMetric('Wallets', W3_REFERENCE.wallets, universe.walletsCount);

  console.log('Active Wallets (7d):');
  console.log(`  W49:  ${formatNumber(universe.activeWallets7d)} (~${formatPct(universe.activeWallets7d, W3_REFERENCE.wallets)} of W3 total)`);
  console.log();

  printSummary(universe);
}

const prisma = new PrismaClient();

main()
  .catch((error) => {
    console.error('[ERROR]', error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
