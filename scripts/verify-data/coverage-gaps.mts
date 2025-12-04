#!/usr/bin/env tsx

/**
 * Coverage Gaps Diagnostic (W49 vs W3)
 *
 * Shows breakdown: Raw → State → Priced Universe
 * Identifies where data loss occurs in the pipeline.
 *
 * Usage: npm run verify:data:coverage-gaps
 *
 * @module scripts/verify-data/coverage-gaps
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { getUniverseOverview, type UniverseOverview } from '../../src/lib/analytics/db';

// ============================================================
// W3 Reference Constants
// ============================================================

const W3_REFERENCE = {
  tvlUsd: 58_900_000,
  pools: 238,
  positions: 74_857,
  wallets: 8_594,
} as const;

// ============================================================
// Contract Addresses (W3 scope)
// ============================================================

const CONTRACTS = {
  nfpms: [
    '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657', // Enosys
    '0xee5ff5bc5f852764b5584d92a4d592a53dc527da', // SparkDEX
  ],
  factories: [
    '0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de', // Enosys
    '0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652', // SparkDEX
  ],
} as const;

// ============================================================
// Types
// ============================================================

interface RawStats {
  positionEvents: number;
  distinctTokenIds: number;
  distinctPools: number;
  positionTransfers: number;
  distinctWallets: number;
}

interface StateStats {
  positions: number;
  wallets: number;
  pools: number;
  byDex: Array<{ dex: string; positions: number }>;
}

interface CountResult {
  count: bigint;
}

interface ExistsResult {
  exists: boolean;
}

interface DexResult {
  dex: string;
  positions: bigint;
}

// ============================================================
// Formatting Helpers
// ============================================================

function formatPct(value: number, reference: number): string {
  if (reference === 0) return 'N/A';
  return `${((value / reference) * 100).toFixed(1)}%`;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function padLeft(str: string, len: number): string {
  return str.padStart(len);
}

// ============================================================
// Data Fetching
// ============================================================

const prisma = new PrismaClient();

async function getRawStats(): Promise<RawStats> {
  const [nfpm0, nfpm1] = CONTRACTS.nfpms;

  const eventCount = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(*)::bigint as count FROM "PositionEvent"
    WHERE "nfpmAddress" IN (${nfpm0}, ${nfpm1})
  `;

  const tokenIdCount = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(DISTINCT "tokenId")::bigint as count FROM "PositionEvent"
    WHERE "nfpmAddress" IN (${nfpm0}, ${nfpm1})
  `;

  const poolCount = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(DISTINCT "pool")::bigint as count FROM "PositionEvent"
    WHERE "nfpmAddress" IN (${nfpm0}, ${nfpm1})
  `;

  const transferCount = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(*)::bigint as count FROM "PositionTransfer"
    WHERE "nfpmAddress" IN (${nfpm0}, ${nfpm1})
  `;

  const walletCount = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(DISTINCT "to")::bigint as count FROM "PositionTransfer"
    WHERE "nfpmAddress" IN (${nfpm0}, ${nfpm1})
      AND "to" != '0x0000000000000000000000000000000000000000'
  `;

  return {
    positionEvents: Number(eventCount[0]?.count ?? 0),
    distinctTokenIds: Number(tokenIdCount[0]?.count ?? 0),
    distinctPools: Number(poolCount[0]?.count ?? 0),
    positionTransfers: Number(transferCount[0]?.count ?? 0),
    distinctWallets: Number(walletCount[0]?.count ?? 0),
  };
}

async function getStateStats(): Promise<StateStats> {
  const [nfpm0, nfpm1] = CONTRACTS.nfpms;
  const [factory0, factory1] = CONTRACTS.factories;

  // Check MV existence
  const mvExists = await prisma.$queryRaw<ExistsResult[]>`
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_position_lifetime_v1'
    ) as exists
  `;

  let positions = 0;
  let byDex: Array<{ dex: string; positions: number }> = [];

  if (mvExists[0]?.exists) {
    const posResult = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*)::bigint as count FROM "mv_position_lifetime_v1"
    `;
    positions = Number(posResult[0]?.count ?? 0);

    const dexResult = await prisma.$queryRaw<DexResult[]>`
      SELECT dex, COUNT(*)::bigint as positions
      FROM "mv_position_lifetime_v1"
      GROUP BY dex ORDER BY dex
    `;
    byDex = dexResult.map((row) => ({
      dex: row.dex,
      positions: Number(row.positions),
    }));
  }

  const walletResult = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(DISTINCT "to")::bigint as count FROM "PositionTransfer"
    WHERE "nfpmAddress" IN (${nfpm0}, ${nfpm1})
      AND "to" != '0x0000000000000000000000000000000000000000'
  `;

  const poolResult = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(*)::bigint as count FROM "Pool"
    WHERE LOWER(factory) IN (${factory0.toLowerCase()}, ${factory1.toLowerCase()})
  `;

  return {
    positions,
    wallets: Number(walletResult[0]?.count ?? 0),
    pools: Number(poolResult[0]?.count ?? 0),
    byDex,
  };
}

// ============================================================
// Output Functions
// ============================================================

function printBox(title: string, lines: string[]): void {
  const width = 57;
  console.log('┌' + '─'.repeat(width) + '┐');
  console.log('│ ' + title.padEnd(width - 1) + '│');
  console.log('├' + '─'.repeat(width) + '┤');
  for (const line of lines) {
    console.log('│ ' + line.padEnd(width - 1) + '│');
  }
  console.log('└' + '─'.repeat(width) + '┘');
  console.log();
}

function printRawStats(raw: RawStats): void {
  const lines = [
    `PositionEvents:       ${padLeft(raw.positionEvents.toLocaleString(), 15)} events`,
    `Distinct tokenIds:    ${padLeft(raw.distinctTokenIds.toLocaleString(), 15)} positions`,
    `Distinct pools:       ${padLeft(raw.distinctPools.toLocaleString(), 15)} pools`,
    `PositionTransfers:    ${padLeft(raw.positionTransfers.toLocaleString(), 15)} transfers`,
    `Distinct wallets:     ${padLeft(raw.distinctWallets.toLocaleString(), 15)} wallets`,
    '',
    'Coverage vs W3:',
    `  Positions: ${padLeft(formatPct(raw.distinctTokenIds, W3_REFERENCE.positions), 8)}  (${raw.distinctTokenIds.toLocaleString()} / ${W3_REFERENCE.positions.toLocaleString()})`,
    `  Wallets:   ${padLeft(formatPct(raw.distinctWallets, W3_REFERENCE.wallets), 8)}  (${raw.distinctWallets.toLocaleString()} / ${W3_REFERENCE.wallets.toLocaleString()})`,
  ];
  printBox('1. RAW NFPM (PositionEvent + PositionTransfer)', lines);
}

function printStateStats(state: StateStats): void {
  const lines = [
    `Positions (MV):       ${padLeft(state.positions.toLocaleString(), 15)} positions`,
    `Wallets (transfers):  ${padLeft(state.wallets.toLocaleString(), 15)} wallets`,
    `Pools (Pool table):   ${padLeft(state.pools.toLocaleString(), 15)} pools`,
  ];

  if (state.byDex.length > 0) {
    lines.push('', 'By DEX:');
    for (const row of state.byDex) {
      lines.push(`  ${row.dex.padEnd(15)}: ${padLeft(row.positions.toLocaleString(), 10)} positions`);
    }
  }

  lines.push(
    '',
    'Coverage vs W3:',
    `  Positions: ${padLeft(formatPct(state.positions, W3_REFERENCE.positions), 8)}  (${state.positions.toLocaleString()} / ${W3_REFERENCE.positions.toLocaleString()})`,
    `  Wallets:   ${padLeft(formatPct(state.wallets, W3_REFERENCE.wallets), 8)}  (${state.wallets.toLocaleString()} / ${W3_REFERENCE.wallets.toLocaleString()})`,
  );

  printBox('2. SP2 CANONICAL STATE (mv_position_lifetime_v1)', lines);
}

function printUniverseStats(universe: UniverseOverview): void {
  const lines = [
    `TVL (priced):         ${padLeft(formatUsd(universe.tvlPricedUsd), 15)}`,
    `Priced pools:         ${padLeft(universe.pricedPoolsCount.toLocaleString(), 15)} pools`,
    `Unpriced pools:       ${padLeft(universe.unpricedPoolsCount.toLocaleString(), 15)} pools`,
    `Total pools:          ${padLeft(universe.totalPoolsCount.toLocaleString(), 15)} pools`,
    `Active wallets (7d):  ${padLeft(universe.activeWallets7d.toLocaleString(), 15)} wallets`,
    '',
    'Pool pricing breakdown:',
    `  Priced vs Total:     ${padLeft(formatPct(universe.pricedPoolsCount, universe.totalPoolsCount), 8)}`,
    `  Priced vs W3 (238):  ${padLeft(formatPct(universe.pricedPoolsCount, W3_REFERENCE.pools), 8)}`,
    '',
    'TVL coverage vs W3 ($58.9M):',
    `  ${padLeft(formatPct(universe.tvlPricedUsd, W3_REFERENCE.tvlUsd), 8)}`,
  ];

  if (universe.tvlPricedUsd === 0 && universe.pricedPoolsCount > 0) {
    lines.push('  (TVL = 0: run db:mvs:refresh:7d)');
  }

  printBox('3. PRICED UNIVERSE (mv_pool_liquidity + pricing)', lines);
}

function printGapAnalysis(raw: RawStats, state: StateStats, universe: UniverseOverview): void {
  console.log('=== Gap Analysis ===\n');

  const rawToStateGap = raw.distinctTokenIds - state.positions;
  if (rawToStateGap > 0) {
    console.log(`⚠️  Raw → State: ${rawToStateGap.toLocaleString()} positions lost in MV aggregation`);
  } else if (rawToStateGap < 0) {
    console.log(`✅ State has ${Math.abs(rawToStateGap).toLocaleString()} more positions than raw`);
  } else {
    console.log('✅ Raw → State: No position gap');
  }

  const poolGap = state.pools - universe.pricedPoolsCount;
  if (poolGap > 0) {
    console.log(`⚠️  ${poolGap.toLocaleString()} pools unpriced (${formatPct(poolGap, state.pools)} of total)`);
  } else if (universe.pricedPoolsCount > 0) {
    console.log('✅ All pools in pricing universe');
  }

  if (universe.tvlPricedUsd === 0 && universe.pricedPoolsCount > 0) {
    console.log(`\n📊 TVL Note: ${universe.pricedPoolsCount} pools priced, but TVL = 0`);
    console.log('   Run: npm run db:mvs:refresh:7d');
  } else if (universe.tvlPricedUsd > 0) {
    console.log(`\n✅ TVL: ${formatUsd(universe.tvlPricedUsd)} across ${universe.pricedPoolsCount} priced pools`);
  }

  console.log();
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  console.log('\n=== Coverage Gaps Diagnostic (W49 vs W3) ===\n');
  console.log('Pipeline: Raw NFPM → SP2 State → Priced Universe\n');

  try {
    const [raw, state, universe] = await Promise.all([
      getRawStats(),
      getStateStats(),
      getUniverseOverview(),
    ]);

    printRawStats(raw);
    printStateStats(state);
    printUniverseStats(universe);
    printGapAnalysis(raw, state, universe);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] ${msg}`);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('[ERROR]', error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
