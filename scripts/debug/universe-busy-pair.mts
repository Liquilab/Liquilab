#!/usr/bin/env tsx

/**
 * Read-only diagnostic for busy pairs (e.g., stXRP/FXRP).
 * Uses current MV schemas (reserves/fees/lifetime) and degrades safely if views differ.
 */

const DEFAULT_PAIR = 'stxrp-fxrp';
const DAYS_7_BLOCK_WINDOW = 50_400; // aligned with mv_pool_fees_7d window

type PoolRow = {
  address: string;
  dex: string;
  token0_symbol: string | null;
  token1_symbol: string | null;
};

type FeeRow = { fees0?: string | null; fees1?: string | null };
type WalletRow = { count?: bigint | null };
type Status = 'OK' | 'WARN_FEES_ZERO';

function parsePairArg(): { token0: string; token1: string } {
  const arg = process.argv.find((a) => a.startsWith('--pair='))?.split('=')[1] ?? DEFAULT_PAIR;
  const [a, b] = arg.split('-');
  return { token0: (a || '').toUpperCase(), token1: (b || '').toUpperCase() };
}

async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { token0, token1 } = parsePairArg();

  try {
    const pools = await prisma.$queryRaw<PoolRow[]>`
      SELECT
        address,
        CASE 
          WHEN factory = '0x17aa157ac8c54034381b840cb8f6bf7fc355f0de' THEN 'enosys-v3'
          WHEN factory = '0x8a2578d23d4c532cc9a98fad91c0523f5efde652' THEN 'sparkdex-v3'
          ELSE COALESCE(factory, 'unknown')
        END AS dex,
        "token0Symbol" AS token0_symbol,
        "token1Symbol" AS token1_symbol
      FROM "Pool"
      WHERE (UPPER("token0Symbol") = ${token0} AND UPPER("token1Symbol") = ${token1})
         OR (UPPER("token0Symbol") = ${token1} AND UPPER("token1Symbol") = ${token0})
    `;

    if (!pools.length) {
      console.log(`[UNIVERSE_DEBUG] No pools found for pair ${token0}/${token1}`);
      return;
    }

    const maxBlockRows = await prisma.$queryRaw<[{ max_block: bigint | null }]>`
      SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
    `;
    const maxBlock = Number(maxBlockRows[0]?.max_block ?? 0);
    const windowStart = maxBlock > 0 ? maxBlock - DAYS_7_BLOCK_WINDOW : 0;

    console.log(
      `[UNIVERSE_DEBUG] Pair ${token0}/${token1}: pools=${pools.length}, max_block=${maxBlock}, 7d window start=${windowStart}`,
    );

    for (const row of pools) {
      const poolAddr = row.address.toLowerCase();

      // swaps last 7d
      const swapsRows = await prisma.$queryRaw<{ count: bigint | null }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "PoolEvent"
        WHERE LOWER(pool) = ${poolAddr}
          AND "eventName" = 'Swap'
          AND "blockNumber" >= ${windowStart}
      `;
      const swaps7d = Number(swapsRows[0]?.count ?? 0);

      // fees 24h/7d (view columns: pool, fees0, fees1)
      let fees24h: FeeRow = {};
      let fees7d: FeeRow = {};
      try {
        const fees24hRows = await prisma.$queryRaw<FeeRow[]>`
          SELECT fees0, fees1
          FROM "mv_pool_fees_24h"
          WHERE pool = ${poolAddr}
        `;
        fees24h = fees24hRows[0] ?? {};
      } catch (err) {
        console.warn('[UNIVERSE_DEBUG] mv_pool_fees_24h schema mismatch:', (err as Error).message);
      }

      try {
        const fees7dRows = await prisma.$queryRaw<FeeRow[]>`
          SELECT fees0, fees1
          FROM "mv_pool_fees_7d"
          WHERE pool = ${poolAddr}
        `;
        fees7d = fees7dRows[0] ?? {};
      } catch (err) {
        console.warn('[UNIVERSE_DEBUG] mv_pool_fees_7d schema mismatch:', (err as Error).message);
      }

      // wallets from mv_position_lifetime_v1 (column: primary_pool, last_known_owner)
      let wallets = 0;
      try {
        const walletsRows = await prisma.$queryRaw<WalletRow[]>`
          SELECT COUNT(DISTINCT last_known_owner)::bigint AS count
          FROM "mv_position_lifetime_v1"
          WHERE LOWER(primary_pool) = ${poolAddr}
            AND last_known_owner IS NOT NULL
            AND last_known_owner <> ''
        `;
        wallets = Number(walletsRows[0]?.count ?? 0);
      } catch (err) {
        console.warn('[UNIVERSE_DEBUG] mv_position_lifetime_v1 schema mismatch:', (err as Error).message);
      }

      const fees24hNum0 = Number(fees24h.fees0 ?? 0);
      const fees24hNum1 = Number(fees24h.fees1 ?? 0);
      const fees7dNum0 = Number(fees7d.fees0 ?? 0);
      const fees7dNum1 = Number(fees7d.fees1 ?? 0);
      const warnFeesZero = swaps7d > 0 && fees24hNum0 === 0 && fees24hNum1 === 0 && fees7dNum0 === 0 && fees7dNum1 === 0;
      const status: Status = warnFeesZero ? 'WARN_FEES_ZERO' : 'OK';

      console.log(
        `[UNIVERSE_DEBUG] dex=${row.dex} pool=${poolAddr} swaps7d=${swaps7d} ` +
          `fees24h=[${fees24h.fees0 ?? 'null'},${fees24h.fees1 ?? 'null'}] ` +
          `fees7d=[${fees7d.fees0 ?? 'null'},${fees7d.fees1 ?? 'null'}] wallets=${wallets} status=${status}`,
      );
    }
  } catch (error) {
    console.error('[UNIVERSE_DEBUG] Error', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
