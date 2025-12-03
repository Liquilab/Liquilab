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

// NFPM addresses for W3 scope (Enosys + SparkDEX v3 on Flare)
const NFPM_ADDRESSES = [
  '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657', // Enosys
  '0xee5ff5bc5f852764b5584d92a4d592a53dc527da', // SparkDEX
];

async function getLifetimeStats(): Promise<LifetimeStats> {
  // Positions from MV or PositionEvent
  const mvExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_position_lifetime_v1'
    ) as exists
  `;

  let totalPositions = 0;
  let byDexPositions: Array<{ dex: string; positions: number }> = [];

  if (mvExists[0]?.exists) {
    const mvHasData = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "mv_position_lifetime_v1"
    `;

    if (Number(mvHasData[0]?.count || 0) > 0) {
      const posResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "mv_position_lifetime_v1"
      `;
      totalPositions = Number(posResult[0]?.count || 0);

      const dexResult = await prisma.$queryRaw<Array<{ dex: string; positions: bigint }>>`
        SELECT dex, COUNT(*) as positions
        FROM "mv_position_lifetime_v1"
        GROUP BY dex
        ORDER BY dex
      `;
      byDexPositions = dexResult.map(row => ({
        dex: row.dex,
        positions: Number(row.positions),
      }));
    }
  }

  if (totalPositions === 0) {
    console.log('⚠️  Using PositionEvent for position count...\n');
    const posResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "tokenId") as count 
      FROM "PositionEvent"
      WHERE LOWER("nfpmAddress") IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
    `;
    totalPositions = Number(posResult[0]?.count || 0);
  }

  // Wallets from PositionTransfer (owner info is here, not in PositionEvent)
  const walletResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT "to") as count 
    FROM "PositionTransfer"
    WHERE "nfpmAddress" IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
      AND "to" != '0x0000000000000000000000000000000000000000'
  `;
  const totalWallets = Number(walletResult[0]?.count || 0);

  // By DEX breakdown (wallets from transfers)
  const byDexWallets = await prisma.$queryRaw<Array<{ nfpmAddress: string; wallets: bigint }>>`
    SELECT 
      "nfpmAddress",
      COUNT(DISTINCT "to") as wallets
    FROM "PositionTransfer"
    WHERE "nfpmAddress" IN (${NFPM_ADDRESSES[0]}, ${NFPM_ADDRESSES[1]})
      AND "to" != '0x0000000000000000000000000000000000000000'
    GROUP BY "nfpmAddress"
  `;

  // Merge position and wallet data by DEX
  const byDex = byDexPositions.map(p => {
    const nfpm = p.dex === 'enosys-v3' ? NFPM_ADDRESSES[0] : NFPM_ADDRESSES[1];
    const walletRow = byDexWallets.find(w => w.nfpmAddress === nfpm);
    return {
      dex: p.dex,
      positions: p.positions,
      wallets: Number(walletRow?.wallets || 0),
    };
  });

  return {
    totalPositions,
    totalWallets,
    byDex,
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

