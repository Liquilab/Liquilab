#!/usr/bin/env tsx

/**
 * Compare mv_position_lifetime_v1 wallets_distinct with API walletsCount for key pairs.
 * Pairs:
 * - WFLR/FXRP
 * - WFLR/USDT0
 * - FXRP/USDT0
 * - SFLR/WFLR
 *
 * Requires the dev server running on localhost:3000 and DATABASE_URL set.
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { UNIVERSE_PAIR_SAMPLES, type PairSample } from './universe-pair-samples';

function getBasePool(pair: PairSample): string | null {
  return pair.pools.find((p) => p.dex === 'ENOSYS')?.address ?? pair.pools[0]?.address ?? null;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    for (const pair of UNIVERSE_PAIR_SAMPLES) {
      const basePool = getBasePool(pair);
      if (!basePool) {
        console.log(`[UNIVERSE_PAIR_WALLETS] ${pair.label} base pool not found in SSoT`);
        continue;
      }

      // Discover the token pair for the base pool by address
      const base = await prisma.$queryRaw<Array<{ token0_address: string; token1_address: string }>>`
        SELECT token0_address, token1_address
        FROM "mv_pool_liquidity"
        WHERE lower(pool_address) = lower(${basePool})
        LIMIT 1;
      `;

      if (!base[0]) {
        console.log(
          `[UNIVERSE_PAIR_WALLETS] ${pair.label} base=${basePool} NOT_FOUND in mv_pool_liquidity`,
        );
        continue;
      }

      const a = base[0].token0_address.toLowerCase();
      const b = base[0].token1_address.toLowerCase();
      const addrA = a < b ? a : b;
      const addrB = a < b ? b : a;

      const pools = await prisma.$queryRaw<Array<{ pool_address: string }>>`
        SELECT pool_address
        FROM "mv_pool_liquidity"
        WHERE (
          (lower(token0_address) = ${addrA} AND lower(token1_address) = ${addrB})
          OR (lower(token0_address) = ${addrB} AND lower(token1_address) = ${addrA})
        )
      `;
      const lowerPools = pools.map((p) => p.pool_address.toLowerCase());

      // MV count
      const mvRows = lowerPools.length
        ? await prisma.$queryRaw<Array<{ wallets_distinct: bigint }>>`
            SELECT COUNT(DISTINCT last_known_owner)::bigint AS wallets_distinct
            FROM "mv_position_lifetime_v1"
            WHERE LOWER(primary_pool) = ANY(${lowerPools})
              AND last_known_owner IS NOT NULL
              AND last_known_owner <> ''
          `
        : [{ wallets_distinct: BigInt(0) }];
      const walletsDistinct = mvRows[0]?.wallets_distinct ? Number(mvRows[0].wallets_distinct) : 0;

      // API count
      const apiRes = await fetch(`http://localhost:3000/api/analytics/pool/${pair.basePool}`);
      const apiJson = (await apiRes.json()) as {
        pool?: { universe?: { summary?: { walletsCount?: number } } };
      };
      const walletsCount = apiJson.pool?.universe?.summary?.walletsCount ?? 0;

      const status = walletsDistinct === walletsCount ? 'OK' : 'DIFF';
      console.log(
        `[UNIVERSE_PAIR_WALLETS] ${pair.label} base=${basePool} mv=${walletsDistinct} api=${walletsCount} status=${status}`,
      );
    }
  } catch (error) {
    console.error('[UNIVERSE_PAIR_WALLETS] Error', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
