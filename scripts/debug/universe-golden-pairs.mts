#!/usr/bin/env tsx
// @ts-nocheck

/**
 * Golden pairs TVL/fees coverage report.
 * Uses getPoolHeadMetrics (mv_pool_reserves_now + mv_pool_fees_24h/7d) to print
 * tvlUsd, fees24hUsd, fees7dUsd per golden pool, with simple status flags.
 */

import { PrismaClient } from '@prisma/client';
import { getPoolHeadMetrics } from '@/lib/analytics/db';

type GoldenPool = {
  pair: string;
  dex: 'enosys-v3' | 'sparkdex-v3';
  poolAddress: string;
};

const GOLDEN_POOLS: GoldenPool[] = [
  // STXRP/FXRP
  { pair: 'STXRP/FXRP', dex: 'enosys-v3', poolAddress: '0xa4cE7dAfC6fB5acEEDd0070620b72aB8f09b0770' },
  { pair: 'STXRP/FXRP', dex: 'sparkdex-v3', poolAddress: '0x5fD4139cC6fDFddbd4Fa74ddf9aE8f54BC87C555' },
  // WFLR/USDT0
  { pair: 'WFLR/USDT0', dex: 'enosys-v3', poolAddress: '0x3C2a7B76795E58829FAAa034486D417dd0155162' },
  { pair: 'WFLR/USDT0', dex: 'sparkdex-v3', poolAddress: '0x2860db7a2b33b79e59ea450ff43b2dc673a22d3d' },
  { pair: 'WFLR/USDT0', dex: 'sparkdex-v3', poolAddress: '0x63873f0d7165689022feef1b77428df357b33dcf' },
  // FXRP/USDT0
  { pair: 'FXRP/USDT0', dex: 'enosys-v3', poolAddress: '0x686f53F0950Ef193C887527eC027E6A574A4DbE1' },
  { pair: 'FXRP/USDT0', dex: 'sparkdex-v3', poolAddress: '0x88d46717b16619b37fa2dfd2f038defb4459f1f7' },
];

type Status = 'OK' | 'WARN_TVL_ZERO' | 'WARN_FEES_ZERO' | 'ERROR';

const prisma = new PrismaClient();

type Coverage = {
  swapCount: number;
  mintCount: number;
  burnCount: number;
  collectCount: number;
  minBlock: number | null;
  maxBlock: number | null;
};

async function getRewardRows(pool: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ cnt: bigint | null }[]>`
    SELECT COUNT(*)::bigint AS cnt
    FROM (
      SELECT pool_address FROM "mv_enosys_rewards_7d" WHERE LOWER(pool_address) = ${pool}
      UNION ALL
      SELECT pool_address FROM "mv_sparkdex_rewards_7d" WHERE LOWER(pool_address) = ${pool}
    ) t
  `;
  return Number(rows[0]?.cnt ?? 0);
}

async function getPoolEventCoverage(pool: string): Promise<Coverage> {
  const rows = await prisma.$queryRaw<
    { eventName: string | null; cnt: bigint | null; min_block: number | null; max_block: number | null }[]
  >`
    SELECT "eventName" AS "eventName", COUNT(*)::bigint AS cnt, MIN("blockNumber") AS min_block, MAX("blockNumber") AS max_block
    FROM "PoolEvent"
    WHERE LOWER("pool") = ${pool}
    GROUP BY "eventName"
  `;

  let swapCount = 0;
  let mintCount = 0;
  let burnCount = 0;
  let collectCount = 0;
  let minBlock: number | null = null;
  let maxBlock: number | null = null;

  for (const row of rows) {
    const cnt = Number(row.cnt ?? 0);
    if (row.min_block !== null) {
      minBlock = minBlock === null ? row.min_block : Math.min(minBlock, row.min_block);
    }
    if (row.max_block !== null) {
      maxBlock = maxBlock === null ? row.max_block : Math.max(maxBlock, row.max_block);
    }

    switch ((row.eventName ?? '').toLowerCase()) {
      case 'swap':
        swapCount = cnt;
        break;
      case 'mint':
        mintCount = cnt;
        break;
      case 'burn':
        burnCount = cnt;
        break;
      case 'collect':
        collectCount = cnt;
        break;
      default:
        break;
    }
  }

  return { swapCount, mintCount, burnCount, collectCount, minBlock, maxBlock };
}

function deriveStatus(tvlUsd: number, fees24hUsd: number, fees7dUsd: number, swaps: number): Status {
  if (tvlUsd === 0) return 'WARN_TVL_ZERO';
  if (tvlUsd > 0 && swaps > 0 && fees24hUsd === 0 && fees7dUsd === 0) return 'WARN_FEES_ZERO';
  return 'OK';
}

async function main() {
  const summary = { total: 0, ok: 0, warnTvl: 0, warnFees: 0, warnIncentives: 0, error: 0 };

  try {
    for (const pool of GOLDEN_POOLS) {
      summary.total += 1;
      const addr = pool.poolAddress.toLowerCase();

      try {
        const [result, coverage, rewardsRows] = await Promise.all([
          getPoolHeadMetrics(addr),
          getPoolEventCoverage(addr),
          getRewardRows(addr),
        ]);
        const metrics = result.metrics as any;
        if (!metrics) {
          console.log(
            `${pool.pair} | ${pool.dex} | ${addr} | tvlUsd=null | fees24hUsd=null | fees7dUsd=null | swaps=${coverage.swapCount} | events_min_block=${coverage.minBlock ?? 'null'} | events_max_block=${coverage.maxBlock ?? 'null'} | status=ERROR`,
          );
          summary.error += 1;
          continue;
        }

        const tvlUsd = metrics.tvlUsd ?? 0;
        const fees24hUsd = metrics.fees24hUsd ?? 0;
        const fees7dUsd = metrics.fees7dUsd ?? 0;
        const incentives24hUsd = metrics.incentives24hUsd ?? 0;
        const incentives7dUsd = metrics.incentives7dUsd ?? 0;

        const status = deriveStatus(tvlUsd, fees24hUsd, fees7dUsd, coverage.swapCount);
        let incentivesStatus: 'OK' | 'ZERO_WITH_REWARDS' | 'ZERO_NO_REWARDS' | 'ERROR' = 'OK';
        if (incentives7dUsd > 0) {
          incentivesStatus = 'OK';
        } else if (rewardsRows > 0) {
          incentivesStatus = 'ZERO_WITH_REWARDS';
          summary.warnIncentives += 1;
        } else {
          incentivesStatus = 'ZERO_NO_REWARDS';
        }

        if (status === 'WARN_TVL_ZERO') summary.warnTvl += 1;
        else if (status === 'WARN_FEES_ZERO') summary.warnFees += 1;
        else summary.ok += 1;

        console.log(
          `${pool.pair} | ${pool.dex} | ${addr} | ` +
            `tvlUsd=${tvlUsd.toFixed(2)} | fees24hUsd=${fees24hUsd.toFixed(2)} | fees7dUsd=${fees7dUsd.toFixed(2)} | ` +
            `incentives24hUsd=${incentives24hUsd.toFixed(2)} | incentives7dUsd=${incentives7dUsd.toFixed(2)} | rewards_rows=${rewardsRows} | incentivesStatus=${incentivesStatus} | ` +
            `swaps=${coverage.swapCount} mints=${coverage.mintCount} burns=${coverage.burnCount} collects=${coverage.collectCount} ` +
            `events_min_block=${coverage.minBlock ?? 'null'} events_max_block=${coverage.maxBlock ?? 'null'} | status=${status}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        summary.error += 1;
        console.log(
          `${pool.pair} | ${pool.dex} | ${addr} | tvlUsd=error | fees24hUsd=error | fees7dUsd=error | status=ERROR | msg=${msg}`,
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(
    `[GOLDEN_SUMMARY] total=${summary.total} ok=${summary.ok} warn_tvl_zero=${summary.warnTvl} warn_fees_zero=${summary.warnFees} warn_incentives=${summary.warnIncentives} errors=${summary.error}`,
  );
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('[GOLDEN] Fatal error', msg);
  process.exitCode = 1;
});

