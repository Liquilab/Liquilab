#!/usr/bin/env tsx

/**
 * Coverage Gaps Diagnostic (W49 vs W3)
 * 
 * Shows breakdown: Raw → State → Priced Universe
 * Identifies where data loss occurs in the pipeline.
 * 
 * W3 Reference (Enosys + SparkDEX v3 on Flare, 2025-11-16):
 *   - Positions: 74,857
 *   - Wallets: 8,594
 * 
 * Usage: npm run verify:data:coverage-gaps
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// W3 Cross-DEX reference constants
const W3_POSITIONS = 74_857;
const W3_WALLETS = 8_594;

// Factory addresses for W3 scope
const FACTORY_ADDRESSES = [
  '0x8bb7b4474a5a1d10d27a046d5cc50b2c203a590c', // Enosys V3 Factory
  '0xc05a5aa56df0dc97d6b9849a06627a079790014f', // SparkDEX V3 Factory
];

// NFPM addresses for W3 scope
const NFPM_ADDRESSES = [
  '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657', // Enosys NFPM
  '0xee5ff5bc5f852764b5584d92a4d592a53dc527da', // SparkDEX NFPM
];

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

interface PricedStats {
  tvlUsd: number;
  pricedPools: number;
  unpricedPools: number;
  activeWallets7d: number;
}

async function getRawStats(): Promise<RawStats> {
  // PositionEvent counts
  const eventCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint as count
    FROM "PositionEvent"
    WHERE "nfpmAddress" IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
  `;
  const positionEvents = Number(eventCountResult[0]?.count ?? 0);

  const tokenIdResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT "tokenId")::bigint as count
    FROM "PositionEvent"
    WHERE "nfpmAddress" IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
  `;
  const distinctTokenIds = Number(tokenIdResult[0]?.count ?? 0);

  const poolResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT "pool")::bigint as count
    FROM "PositionEvent"
    WHERE "nfpmAddress" IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
  `;
  const distinctPools = Number(poolResult[0]?.count ?? 0);

  // PositionTransfer counts
  const transferCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint as count
    FROM "PositionTransfer"
    WHERE "nfpmAddress" IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
  `;
  const positionTransfers = Number(transferCountResult[0]?.count ?? 0);

  const walletResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT "to")::bigint as count
    FROM "PositionTransfer"
    WHERE "nfpmAddress" IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
      AND "to" != '0x0000000000000000000000000000000000000000'
  `;
  const distinctWallets = Number(walletResult[0]?.count ?? 0);

  return {
    positionEvents,
    distinctTokenIds,
    distinctPools,
    positionTransfers,
    distinctWallets,
  };
}

async function getStateStats(): Promise<StateStats> {
  // Check if MV exists
  const mvExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_position_lifetime_v1'
    ) as exists
  `;

  let positions = 0;
  let byDex: Array<{ dex: string; positions: number }> = [];

  if (mvExists[0]?.exists) {
    const posResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count FROM "mv_position_lifetime_v1"
    `;
    positions = Number(posResult[0]?.count ?? 0);

    const dexResult = await prisma.$queryRaw<Array<{ dex: string; positions: bigint }>>`
      SELECT dex, COUNT(*)::bigint as positions
      FROM "mv_position_lifetime_v1"
      GROUP BY dex
      ORDER BY dex
    `;
    byDex = dexResult.map(row => ({
      dex: row.dex,
      positions: Number(row.positions),
    }));
  }

  // Wallets from PositionTransfer
  const walletResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT "to")::bigint as count
    FROM "PositionTransfer"
    WHERE "nfpmAddress" IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
      AND "to" != '0x0000000000000000000000000000000000000000'
  `;
  const wallets = Number(walletResult[0]?.count ?? 0);

  // Pools from Pool table
  const poolResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint as count
    FROM "Pool"
    WHERE LOWER(factory) IN (${FACTORY_ADDRESSES[0].toLowerCase()}, ${FACTORY_ADDRESSES[1].toLowerCase()})
  `;
  const pools = Number(poolResult[0]?.count ?? 0);

  return { positions, wallets, pools, byDex };
}

async function getPricedStats(): Promise<PricedStats> {
  // TVL from mv_pool_latest_state
  const tvlResult = await prisma.$queryRaw<Array<{ tvl: number | null }>>`
    SELECT COALESCE(SUM(tvl_usd), 0)::float as tvl
    FROM mv_pool_latest_state
  `.catch(() => [{ tvl: 0 }]);
  const tvlUsd = Number(tvlResult[0]?.tvl ?? 0);

  // Priced pools (tvl > 0)
  const pricedResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint as count
    FROM mv_pool_latest_state
    WHERE tvl_usd > 0
  `.catch(() => [{ count: 0n }]);
  const pricedPools = Number(pricedResult[0]?.count ?? 0);

  // Unpriced pools
  const unpricedResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint as count
    FROM mv_pool_latest_state
    WHERE tvl_usd = 0 OR tvl_usd IS NULL
  `.catch(() => [{ count: 0n }]);
  const unpricedPools = Number(unpricedResult[0]?.count ?? 0);

  // Active wallets 7d
  let activeWallets7d = 0;
  const mvWalletExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_wallet_lp_7d'
    ) as exists
  `;

  if (mvWalletExists[0]?.exists) {
    const activeResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT wallet)::bigint as count FROM "mv_wallet_lp_7d"
    `.catch(() => [{ count: 0n }]);
    activeWallets7d = Number(activeResult[0]?.count ?? 0);
  }

  return { tvlUsd, pricedPools, unpricedPools, activeWallets7d };
}

function formatPct(value: number, reference: number): string {
  if (reference === 0) return 'N/A';
  const pct = (value / reference) * 100;
  return `${pct.toFixed(1)}%`;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

async function main() {
  console.log('\n=== Coverage Gaps Diagnostic (W49 vs W3) ===\n');
  console.log('Pipeline: Raw NFPM → SP2 Canonical State → Priced Universe\n');

  // Raw stats
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 1. RAW NFPM (PositionEvent + PositionTransfer)          │');
  console.log('├─────────────────────────────────────────────────────────┤');
  const raw = await getRawStats();
  console.log(`│ PositionEvents:       ${String(raw.positionEvents.toLocaleString()).padStart(15)} events           │`);
  console.log(`│ Distinct tokenIds:    ${String(raw.distinctTokenIds.toLocaleString()).padStart(15)} positions        │`);
  console.log(`│ Distinct pools:       ${String(raw.distinctPools.toLocaleString()).padStart(15)} pools             │`);
  console.log(`│ PositionTransfers:    ${String(raw.positionTransfers.toLocaleString()).padStart(15)} transfers        │`);
  console.log(`│ Distinct wallets:     ${String(raw.distinctWallets.toLocaleString()).padStart(15)} wallets           │`);
  console.log(`│                                                         │`);
  console.log(`│ Coverage vs W3:                                         │`);
  console.log(`│   Positions: ${formatPct(raw.distinctTokenIds, W3_POSITIONS).padStart(8)}  (${raw.distinctTokenIds.toLocaleString()} / ${W3_POSITIONS.toLocaleString()})            │`);
  console.log(`│   Wallets:   ${formatPct(raw.distinctWallets, W3_WALLETS).padStart(8)}  (${raw.distinctWallets.toLocaleString()} / ${W3_WALLETS.toLocaleString()})              │`);
  console.log('└─────────────────────────────────────────────────────────┘\n');

  // State stats
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 2. SP2 CANONICAL STATE (mv_position_lifetime_v1)        │');
  console.log('├─────────────────────────────────────────────────────────┤');
  const state = await getStateStats();
  console.log(`│ Positions (MV):       ${String(state.positions.toLocaleString()).padStart(15)} positions        │`);
  console.log(`│ Wallets (transfers):  ${String(state.wallets.toLocaleString()).padStart(15)} wallets           │`);
  console.log(`│ Pools (Pool table):   ${String(state.pools.toLocaleString()).padStart(15)} pools             │`);
  if (state.byDex.length > 0) {
    console.log(`│                                                         │`);
    console.log(`│ By DEX:                                                 │`);
    for (const row of state.byDex) {
      console.log(`│   ${row.dex.padEnd(15)}: ${String(row.positions.toLocaleString()).padStart(10)} positions            │`);
    }
  }
  console.log(`│                                                         │`);
  console.log(`│ Coverage vs W3:                                         │`);
  console.log(`│   Positions: ${formatPct(state.positions, W3_POSITIONS).padStart(8)}  (${state.positions.toLocaleString()} / ${W3_POSITIONS.toLocaleString()})            │`);
  console.log(`│   Wallets:   ${formatPct(state.wallets, W3_WALLETS).padStart(8)}  (${state.wallets.toLocaleString()} / ${W3_WALLETS.toLocaleString()})              │`);
  console.log('└─────────────────────────────────────────────────────────┘\n');

  // Priced stats
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 3. PRICED UNIVERSE (mv_pool_latest_state)               │');
  console.log('├─────────────────────────────────────────────────────────┤');
  const priced = await getPricedStats();
  console.log(`│ TVL (priced):         ${formatUsd(priced.tvlUsd).padStart(15)}                   │`);
  console.log(`│ Priced pools:         ${String(priced.pricedPools.toLocaleString()).padStart(15)} pools             │`);
  console.log(`│ Unpriced pools:       ${String(priced.unpricedPools.toLocaleString()).padStart(15)} pools             │`);
  console.log(`│ Active wallets (7d):  ${String(priced.activeWallets7d.toLocaleString()).padStart(15)} wallets           │`);
  console.log(`│                                                         │`);
  console.log(`│ Wallet activity:                                        │`);
  console.log(`│   Active (7d) vs State: ${formatPct(priced.activeWallets7d, state.wallets).padStart(8)}                      │`);
  console.log(`│   Active (7d) vs W3:    ${formatPct(priced.activeWallets7d, W3_WALLETS).padStart(8)}                      │`);
  console.log('└─────────────────────────────────────────────────────────┘\n');

  // Gap analysis
  console.log('=== Gap Analysis ===\n');
  
  const rawToStateGap = raw.distinctTokenIds - state.positions;
  if (rawToStateGap !== 0) {
    if (rawToStateGap > 0) {
      console.log(`⚠️  Raw → State gap: ${rawToStateGap.toLocaleString()} positions lost in MV aggregation`);
    } else {
      console.log(`✅ State has ${Math.abs(rawToStateGap).toLocaleString()} more positions than raw (aggregation correct)`);
    }
  } else {
    console.log('✅ Raw → State: No position gap');
  }

  const poolGap = state.pools - priced.pricedPools;
  if (poolGap > 0) {
    console.log(`⚠️  ${poolGap.toLocaleString()} pools unpriced (${formatPct(poolGap, state.pools)} of total)`);
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

