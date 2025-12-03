#!/usr/bin/env tsx

/**
 * Verify lifetime positions coverage vs W3 Cross-DEX reference
 * 
 * W3 Reference (Enosys + SparkDEX v3 on Flare):
 *   - Positions: 74,857
 *   - Wallets: 8,594
 * 
 * Usage: npm run verify:data:lifetime-vs-w3
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// W3 Cross-DEX reference constants (Enosys + SparkDEX v3 on Flare)
const W3_POSITIONS = 74_857;
const W3_WALLETS = 8_594;

interface LifetimeStats {
  totalPositions: number;
  totalWallets: number;
  byDex: {
    dex: string;
    positions: number;
    wallets: number;
  }[];
}

async function getLifetimeStats(): Promise<LifetimeStats> {
  // Check if MV exists
  const mvExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_position_lifetime_v1'
    ) as exists
  `;

  if (!mvExists[0]?.exists) {
    console.log('⚠️  MV mv_position_lifetime_v1 does not exist. Querying PositionEvent directly...\n');
    return getLifetimeStatsFromSource();
  }

  // Check if MV has data
  const mvHasData = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "mv_position_lifetime_v1"
  `;

  if (Number(mvHasData[0]?.count || 0) === 0) {
    console.log('⚠️  MV mv_position_lifetime_v1 is empty. Querying PositionEvent directly...\n');
    return getLifetimeStatsFromSource();
  }

  // Query from MV
  const totalPositions = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT token_id) as count FROM "mv_position_lifetime_v1"
  `;

  const totalWallets = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT last_known_owner) as count 
    FROM "mv_position_lifetime_v1"
    WHERE last_known_owner IS NOT NULL
  `;

  const byDex = await prisma.$queryRaw<Array<{ dex: string; positions: bigint; wallets: bigint }>>`
    SELECT 
      dex,
      COUNT(DISTINCT token_id) as positions,
      COUNT(DISTINCT last_known_owner) as wallets
    FROM "mv_position_lifetime_v1"
    WHERE last_known_owner IS NOT NULL
    GROUP BY dex
    ORDER BY dex
  `;

  return {
    totalPositions: Number(totalPositions[0]?.count || 0),
    totalWallets: Number(totalWallets[0]?.count || 0),
    byDex: byDex.map(row => ({
      dex: row.dex,
      positions: Number(row.positions),
      wallets: Number(row.wallets),
    })),
  };
}

async function getLifetimeStatsFromSource(): Promise<LifetimeStats> {
  // NFPM addresses for W3 scope
  const nfpmAddresses = [
    '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657', // Enosys
    '0xee5ff5bc5f852764b5584d92a4d592a53dc527da', // SparkDEX
  ];

  const totalPositions = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT "tokenId") as count 
    FROM "PositionEvent"
    WHERE LOWER("nfpmAddress") IN (${nfpmAddresses[0]}, ${nfpmAddresses[1]})
  `;

  const totalWallets = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT "owner") as count 
    FROM "PositionEvent"
    WHERE LOWER("nfpmAddress") IN (${nfpmAddresses[0]}, ${nfpmAddresses[1]})
      AND "owner" IS NOT NULL
  `;

  const byDex = await prisma.$queryRaw<Array<{ nfpmAddress: string; positions: bigint; wallets: bigint }>>`
    SELECT 
      "nfpmAddress",
      COUNT(DISTINCT "tokenId") as positions,
      COUNT(DISTINCT "owner") as wallets
    FROM "PositionEvent"
    WHERE LOWER("nfpmAddress") IN (${nfpmAddresses[0]}, ${nfpmAddresses[1]})
      AND "owner" IS NOT NULL
    GROUP BY "nfpmAddress"
    ORDER BY "nfpmAddress"
  `;

  return {
    totalPositions: Number(totalPositions[0]?.count || 0),
    totalWallets: Number(totalWallets[0]?.count || 0),
    byDex: byDex.map(row => ({
      dex: row.nfpmAddress?.toLowerCase() === nfpmAddresses[0] ? 'enosys-v3' : 'sparkdex-v3',
      positions: Number(row.positions),
      wallets: Number(row.wallets),
    })),
  };
}

function formatPct(value: number, reference: number): string {
  if (reference === 0) return 'N/A';
  const pct = (value / reference) * 100;
  return `${pct.toFixed(2)}%`;
}

async function main() {
  console.log('📊 Lifetime v3 LP Positions vs W3 Cross-DEX Reference\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const stats = await getLifetimeStats();

  // Overall stats
  console.log('📈 Overall Coverage:');
  console.log('┌─────────────────┬──────────────┬──────────────┬──────────────┐');
  console.log('│ Metric          │ LiquiLab     │ W3 Reference │ Coverage     │');
  console.log('├─────────────────┼──────────────┼──────────────┼──────────────┤');
  console.log(`│ Positions       │ ${String(stats.totalPositions).padStart(12)} │ ${String(W3_POSITIONS).padStart(12)} │ ${formatPct(stats.totalPositions, W3_POSITIONS).padStart(12)} │`);
  console.log(`│ Wallets         │ ${String(stats.totalWallets).padStart(12)} │ ${String(W3_WALLETS).padStart(12)} │ ${formatPct(stats.totalWallets, W3_WALLETS).padStart(12)} │`);
  console.log('└─────────────────┴──────────────┴──────────────┴──────────────┘\n');

  // By DEX
  if (stats.byDex.length > 0) {
    console.log('📊 By DEX:');
    console.log('┌─────────────────┬──────────────┬──────────────┐');
    console.log('│ DEX             │ Positions    │ Wallets      │');
    console.log('├─────────────────┼──────────────┼──────────────┤');
    for (const row of stats.byDex) {
      console.log(`│ ${row.dex.padEnd(15)} │ ${String(row.positions).padStart(12)} │ ${String(row.wallets).padStart(12)} │`);
    }
    console.log('└─────────────────┴──────────────┴──────────────┘\n');
  }

  // Coverage assessment
  const positionCoverage = (stats.totalPositions / W3_POSITIONS) * 100;
  const walletCoverage = (stats.totalWallets / W3_WALLETS) * 100;

  console.log('🎯 Assessment:');
  if (positionCoverage >= 95 && walletCoverage >= 95) {
    console.log('   ✅ Excellent coverage (≥95%)');
  } else if (positionCoverage >= 80 && walletCoverage >= 80) {
    console.log('   ⚠️  Good coverage (≥80%) - some positions/wallets may be missing');
  } else if (positionCoverage >= 50 && walletCoverage >= 50) {
    console.log('   ⚠️  Partial coverage (≥50%) - significant data may be missing');
  } else {
    console.log('   ❌ Low coverage (<50%) - backfill or indexing likely incomplete');
  }

  // Gap analysis
  const positionGap = W3_POSITIONS - stats.totalPositions;
  const walletGap = W3_WALLETS - stats.totalWallets;

  if (positionGap > 0 || walletGap > 0) {
    console.log('\n📉 Gap Analysis:');
    if (positionGap > 0) {
      console.log(`   - Missing ~${positionGap.toLocaleString()} positions`);
    }
    if (walletGap > 0) {
      console.log(`   - Missing ~${walletGap.toLocaleString()} wallets`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

