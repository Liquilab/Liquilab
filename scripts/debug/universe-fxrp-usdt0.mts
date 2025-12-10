#!/usr/bin/env tsx

/**
 * Read-only diagnostic for FXRP/USDT0 pools (Enosys + SparkDEX).
 * Checks:
 * 1) Pool table presence
 * 2) mv_pool_liquidity rows
 * 3) mv_position_lifetime_v1 positions/owners
 *
 * Usage: tsx scripts/debug/universe-fxrp-usdt0.mts (with DATABASE_URL set, dev server not required)
 */

import { PrismaClient } from '@prisma/client';
import { UNIVERSE_PAIR_SAMPLES } from './universe-pair-samples';

async function main() {
  const prisma = new PrismaClient();

  try {
    const fxrpUsdt0 = UNIVERSE_PAIR_SAMPLES.find((p) => p.label === 'FXRP/USDT0');
    const enosysPool = fxrpUsdt0?.pools.find((p) => p.dex === 'ENOSYS')?.address;
    const sparkdexPool = fxrpUsdt0?.pools.find((p) => p.dex === 'SPARKDEX')?.address;

    if (!fxrpUsdt0 || !enosysPool || !sparkdexPool) {
      console.log('[FXRP_USDT0] Pair config missing in UNIVERSE_PAIR_SAMPLES');
      return;
    }

    // Pool table check
    const pools = await prisma.$queryRaw<
      Array<{ address: string; token0: string; token1: string; fee: number | null }>
    >`
      SELECT address, token0, token1, fee
      FROM "Pool"
      WHERE lower(address) IN (${enosysPool.toLowerCase()}, ${sparkdexPool.toLowerCase()});
    `;
    console.log('[FXRP_USDT0] Pool table rows:', pools);

    // mv_pool_liquidity check
    const liq = await prisma.$queryRaw<
      Array<{
        pool_address: string;
        token0_symbol: string | null;
        token1_symbol: string | null;
        amount0_raw: bigint | null;
        amount1_raw: bigint | null;
      }>
    >`
      SELECT pool_address, token0_symbol, token1_symbol, amount0_raw, amount1_raw
      FROM "mv_pool_liquidity"
      WHERE lower(pool_address) IN (${enosysPool.toLowerCase()}, ${sparkdexPool.toLowerCase()});
    `;
    console.log('[FXRP_USDT0] mv_pool_liquidity rows:', liq);

    // mv_position_lifetime_v1 check
    const lifetime = await prisma.$queryRaw<
      Array<{ primary_pool: string; positions_total: bigint; owners_distinct: bigint }>
    >`
      SELECT primary_pool,
             COUNT(*)::bigint                                 AS positions_total,
             COUNT(DISTINCT last_known_owner)::bigint         AS owners_distinct
      FROM "mv_position_lifetime_v1"
      WHERE lower(primary_pool) IN (${enosysPool.toLowerCase()}, ${sparkdexPool.toLowerCase()})
        AND last_known_owner IS NOT NULL
        AND last_known_owner <> ''
      GROUP BY primary_pool;
    `;
    console.log('[FXRP_USDT0] mv_position_lifetime_v1 rows:', lifetime);
  } catch (error) {
    console.error('[FXRP_USDT0] Error', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
