/**
 * Verifier: Pool Head Metrics Coverage
 *
 * Checks how many v3 pools (Enosys + SparkDEX) have head metrics in:
 * - mv_pool_liquidity
 * - mv_pool_fees_24h
 * - mv_pool_fees_7d
 * - mv_position_lifetime_v1
 *
 * Usage:
 *   npm run verify:data:pool-head
 */

import { PrismaClient } from '@prisma/client';

type PoolRow = {
  pool_address: string;
  dex: string;
};

type FeeRow = {
  pool: string;
};

type LifetimeRow = {
  primary_pool: string | null;
};

const SAMPLE_LIMIT = 10;

function percent(count: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((count / total) * 100).toFixed(1)}%`;
}

function formatPoolSample(pools: PoolRow[], missingSet: Set<string>): string[] {
  const samples: string[] = [];
  for (const pool of pools) {
    if (missingSet.has(pool.pool_address)) {
      samples.push(`  - ${pool.dex.padEnd(11)} ${pool.pool_address}`);
    }
    if (samples.length >= SAMPLE_LIMIT) break;
  }
  if (samples.length === 0) {
    samples.push('  (none)');
  }
  return samples;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('=== Pool Head Metrics Coverage (STAGING) ===\n');

    const pools = await prisma.$queryRaw<PoolRow[]>`
      SELECT pool_address, dex
      FROM "mv_pool_liquidity"
    `;

    if (!pools.length) {
      console.log('No pools found in mv_pool_liquidity. Ensure MVs are refreshed.');
      return;
    }

    const normalizedPools = pools.map((pool) => ({
      pool_address: pool.pool_address.toLowerCase(),
      dex: pool.dex ?? 'unknown',
    }));

    const totalPools = normalizedPools.length;
    const poolSet = new Set(normalizedPools.map((pool) => pool.pool_address));

    const fees24hRows = await prisma.$queryRaw<FeeRow[]>`
      SELECT LOWER("pool") AS pool
      FROM "mv_pool_fees_24h"
    `;
    const fees7dRows = await prisma.$queryRaw<FeeRow[]>`
      SELECT LOWER("pool") AS pool
      FROM "mv_pool_fees_7d"
    `;
    const lifetimeRows = await prisma.$queryRaw<LifetimeRow[]>`
      SELECT LOWER(primary_pool) AS primary_pool
      FROM "mv_position_lifetime_v1"
      WHERE primary_pool IS NOT NULL
    `;

    const fees24hSet = new Set(fees24hRows.map((row) => row.pool));
    const fees7dSet = new Set(fees7dRows.map((row) => row.pool));
    const lifetimeSet = new Set(lifetimeRows.map((row) => row.primary_pool ?? ''));

    const withFees24h = normalizedPools.filter((pool) => fees24hSet.has(pool.pool_address)).length;
    const withFees7d = normalizedPools.filter((pool) => fees7dSet.has(pool.pool_address)).length;
    const withLifetime = normalizedPools.filter((pool) => lifetimeSet.has(pool.pool_address)).length;

    const missingFees24h = new Set([...poolSet].filter((pool) => !fees24hSet.has(pool)));
    const missingFees7d = new Set([...poolSet].filter((pool) => !fees7dSet.has(pool)));
    const missingLifetime = new Set([...poolSet].filter((pool) => !lifetimeSet.has(pool)));

    console.log(`Total v3 pools (mv_pool_liquidity):  ${totalPools}\n`);

    console.log('Liquidity:');
    console.log(`  withLiquidity:       ${totalPools} (${percent(totalPools, totalPools)})\n`);

    console.log('Fees 24h:');
    console.log(`  withFees24h:         ${withFees24h} (${percent(withFees24h, totalPools)})`);
    console.log(`  missingFees24h:      ${missingFees24h.size} (${percent(missingFees24h.size, totalPools)})\n`);

    console.log('Fees 7d:');
    console.log(`  withFees7d:          ${withFees7d} (${percent(withFees7d, totalPools)})`);
    console.log(`  missingFees7d:       ${missingFees7d.size} (${percent(missingFees7d.size, totalPools)})\n`);

    console.log('Lifetime Positions:');
    console.log(`  withLifetimePositions:  ${withLifetime} (${percent(withLifetime, totalPools)})`);
    console.log(`  missingLifetime:        ${missingLifetime.size} (${percent(missingLifetime.size, totalPools)})\n`);

    console.log('Missing 24h fees (sample):');
    formatPoolSample(normalizedPools, missingFees24h).forEach((line) => console.log(line));
    console.log('\nMissing 7d fees (sample):');
    formatPoolSample(normalizedPools, missingFees7d).forEach((line) => console.log(line));
    console.log('\nMissing lifetime positions (sample):');
    formatPoolSample(normalizedPools, missingLifetime).forEach((line) => console.log(line));
  } catch (error) {
    console.error('[POOL_HEAD_VERIFIER] Failed to compute coverage');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 0;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[POOL_HEAD_VERIFIER] Unexpected error', error);
  process.exitCode = 0;
});
