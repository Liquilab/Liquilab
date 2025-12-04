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

// Factory addresses for W3 scope (from PROJECT_STATE.md)
const FACTORY_ADDRESSES = [
  '0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de', // Enosys V3 Factory
  '0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652', // SparkDEX V3 Factory
];

// NFPM addresses for W3 scope
const NFPM_ADDRESSES = [
  '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657', // Enosys NFPM
  '0xee5ff5bc5f852764b5584d92a4d592a53dc527da', // SparkDEX NFPM
];

interface W49Stats {
  tvlUsd: number;
  pools: number;
  positions: number;
  wallets: number;
  activeWallets: number;
}

async function getW49Stats(): Promise<W49Stats> {
  // Get UniverseOverview (includes TVL, pool counts, positions, wallets)
  const universe = await getUniverseOverview();
  const tvlUsd = universe.tvlPricedUsd;
  const pools = universe.totalPoolsCount;

  // Use UniverseOverview for positions, wallets, active wallets
  const positions = universe.positionsCount;
  const wallets = universe.walletsCount;
  const activeWallets = universe.activeWallets7d;

  return { tvlUsd, pools, positions, wallets, activeWallets };
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
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

  const stats = await getW49Stats();

  // TVL
  console.log('TVL (USD, priced pools):');
  console.log(`  W3:   ${formatUsd(W3_TVL_USD)}`);
  console.log(`  W49:  ${formatUsd(stats.tvlUsd)}`);
  console.log(`  Cov:  ${formatPct(stats.tvlUsd, W3_TVL_USD)}`);
  console.log();

  // Pools
  console.log('Pools:');
  console.log(`  W3:   ${W3_POOLS.toLocaleString()}`);
  console.log(`  W49:  ${stats.pools.toLocaleString()}`);
  console.log(`  Cov:  ${formatPct(stats.pools, W3_POOLS)}`);
  console.log();

  // Positions
  console.log('Positions:');
  console.log(`  W3:   ${W3_POSITIONS.toLocaleString()}`);
  console.log(`  W49:  ${stats.positions.toLocaleString()}`);
  console.log(`  Cov:  ${formatPct(stats.positions, W3_POSITIONS)}`);
  console.log();

  // Wallets
  console.log('Wallets:');
  console.log(`  W3:   ${W3_WALLETS.toLocaleString()}`);
  console.log(`  W49:  ${stats.wallets.toLocaleString()}`);
  console.log(`  Cov:  ${formatPct(stats.wallets, W3_WALLETS)}`);
  console.log();

  // Active Wallets (7d)
  console.log('Active Wallets (mv_wallet_lp_7d):');
  console.log(`  W49:  ${stats.activeWallets.toLocaleString()} (~${formatPct(stats.activeWallets, W3_WALLETS)} of W3 total)`);
  console.log();

  // Summary
  console.log('=== Summary ===');
  const avgCoverage = (
    (stats.tvlUsd / W3_TVL_USD) +
    (stats.pools / W3_POOLS) +
    (stats.positions / W3_POSITIONS) +
    (stats.wallets / W3_WALLETS)
  ) / 4 * 100;

  if (avgCoverage >= 95) {
    console.log('✅ Excellent overall coverage (≥95%)');
  } else if (avgCoverage >= 80) {
    console.log('⚠️  Good coverage (≥80%) - some gaps remain');
  } else if (avgCoverage >= 50) {
    console.log('⚠️  Partial coverage (≥50%) - significant data missing');
  } else {
    console.log('❌ Low coverage (<50%) - backfill or indexing incomplete');
  }
  console.log(`   Average coverage: ${avgCoverage.toFixed(1)}%\n`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

