#!/usr/bin/env tsx
// @ts-nocheck
/**
 * SparkDEX fees audit for golden pools.
 * Usage:
 *   cd "$HOME/Projects/Liquilab_staging"
 *   export DATABASE_URL="postgresql://postgres:yKWcFvDWUGxJsXdThwaReVVzixOPnuAx@yamabiko.proxy.rlwy.net:37785/railway"
 *   npm exec tsx scripts/debug/sparkdex-fees-audit.mts
 */

import { PrismaClient } from '@prisma/client';
import { getPoolHeadMetrics } from '@/lib/analytics/db';

const prisma = new PrismaClient();

type PoolInfo = {
  name: string;
  addr: string;
};

const POOLS: PoolInfo[] = [
  { name: 'STXRP/FXRP SparkDEX', addr: '0x5fD4139cC6fDFddbd4Fa74ddf9aE8f54BC87C555' },
  { name: 'WFLR/USDT0 SparkDEX', addr: '0x2860db7a2b33b79e59ea450ff43b2dc673a22d3d' },
  { name: 'WFLR/USDT0 SparkDEX (big)', addr: '0x63873f0d7165689022feef1b77428df357b33dcf' },
  { name: 'FXRP/USDT0 SparkDEX', addr: '0x88d46717b16619b37fa2dfd2f038defb4459f1f7' },
];

async function main() {
  const latestRows = await prisma.$queryRaw<{ max_block: number | null }[]>`
    SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
  `;
  const latest = latestRows[0]?.max_block ?? 0;
  const window7dStart = latest - 50400;

  let warnFeesZeroInWindow = 0;
  let errors = 0;

  for (const pool of POOLS) {
    try {
      const addr = pool.addr.toLowerCase();

      const evRows = await prisma.$queryRaw<
        { eventName: string | null; cnt: bigint | null; min_block: number | null; max_block: number | null }[]
      >`
        SELECT "eventName", COUNT(*)::bigint AS cnt, MIN("blockNumber") AS min_block, MAX("blockNumber") AS max_block
        FROM "PoolEvent"
        WHERE LOWER("pool") = ${addr}
        GROUP BY "eventName"
      `;

      const counts: Record<string, number> = {};
      let minBlock: number | null = null;
      let maxBlock: number | null = null;
      for (const row of evRows) {
        counts[(row.eventName ?? 'unknown').toLowerCase()] = Number(row.cnt ?? 0);
        if (row.min_block !== null) minBlock = minBlock === null ? row.min_block : Math.min(minBlock, row.min_block);
        if (row.max_block !== null) maxBlock = maxBlock === null ? row.max_block : Math.max(maxBlock, row.max_block);
      }

      const fees24Rows = await prisma.$queryRaw<{ fees0?: string | null; fees1?: string | null }[]>`
        SELECT fees0::text AS fees0, fees1::text AS fees1
        FROM "mv_pool_fees_24h"
        WHERE pool = ${addr}
        LIMIT 1
      `;
      const fees7Rows = await prisma.$queryRaw<{ fees0?: string | null; fees1?: string | null }[]>`
        SELECT fees0::text AS fees0, fees1::text AS fees1
        FROM "mv_pool_fees_7d"
        WHERE pool = ${addr}
        LIMIT 1
      `;

      const mvFees24 = fees24Rows[0] ?? {};
      const mvFees7 = fees7Rows[0] ?? {};

      const head = await getPoolHeadMetrics(addr);
      const metrics = head.metrics;

      const swapCountTotal = counts['swap'] ?? 0;
      const lastSwapBlock = maxBlock ?? null;
      const swaps7dRows = await prisma.$queryRaw<{ cnt: bigint | null }[]>`
        SELECT COUNT(*)::bigint AS cnt
        FROM "PoolEvent"
        WHERE LOWER("pool") = ${addr}
          AND "eventName" = 'Swap'
          AND "blockNumber" >= ${window7dStart}
      `;
      const swapCount7d = Number(swaps7dRows[0]?.cnt ?? 0);

      const windowFlag =
        lastSwapBlock !== null && lastSwapBlock >= window7dStart ? 'IN_7D_WINDOW' : 'OUTSIDE_7D_WINDOW';

      const fees24hUsd = metrics?.fees24hUsd ?? 0;
      const fees7dUsd = metrics?.fees7dUsd ?? 0;

      let status = 'OK';
      if (swapCount7d > 0 && windowFlag === 'IN_7D_WINDOW' && fees7dUsd <= 0) {
        status = 'WARN_FEES_ZERO';
        warnFeesZeroInWindow += 1;
      } else if (swapCount7d > 0 && windowFlag === 'OUTSIDE_7D_WINDOW') {
        status = 'WARN_OUTSIDE_WINDOW';
      } else if (swapCount7d === 0 && windowFlag === 'IN_7D_WINDOW') {
        status = 'WARN_FEES_ZERO';
        warnFeesZeroInWindow += 1;
      } else if (swapCount7d === 0 && windowFlag === 'OUTSIDE_7D_WINDOW') {
        status = 'WARN_OUTSIDE_WINDOW';
      }

      console.log(
        `${pool.name} | pool=${addr} | swap_total=${swapCountTotal} swap_7d=${swapCount7d} | ` +
          `min_block=${minBlock ?? 'null'} max_block=${lastSwapBlock ?? 'null'} | window=${windowFlag} | ` +
          `mv24h=[${mvFees24.fees0 ?? 'null'},${mvFees24.fees1 ?? 'null'}] mv7d=[${mvFees7.fees0 ?? 'null'},${mvFees7.fees1 ?? 'null'}] | ` +
          `headFees24hUsd=${fees24hUsd.toFixed(2)} headFees7dUsd=${fees7dUsd.toFixed(2)} headIncentives7dUsd=${(metrics?.incentives7dUsd ?? 0).toFixed(2)} | status=${status}`,
      );
    } catch (error) {
      errors += 1;
      console.error(`[SPARKDEX_FEES_AUDIT] Error for pool ${pool.addr}:`, error);
    }
  }

  if (warnFeesZeroInWindow > 0 || errors > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

