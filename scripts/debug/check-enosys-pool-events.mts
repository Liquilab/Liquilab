#!/usr/bin/env tsx
// @ts-nocheck
/**
 * Quick PoolEvent coverage check for Enosys golden pools (WFLR/USDT0, FXRP/USDT0, STXRP/FXRP).
 * Usage:
 *   cd "$HOME/Projects/Liquilab_staging"
 *   export DATABASE_URL="postgresql://postgres:yKWcFvDWUGxJsXdThwaReVVzixOPnuAx@yamabiko.proxy.rlwy.net:37785/railway"
 *   npm exec tsx scripts/debug/check-enosys-pool-events.mts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POOLS = [
  { name: 'WFLR/USDT0 Enosys', addr: '0x3c2a7b76795e58829faaa034486d417dd0155162' },
  { name: 'FXRP/USDT0 Enosys', addr: '0x686f53f0950ef193c887527ec027e6a574a4dbe1' },
  { name: 'STXRP/FXRP Enosys', addr: '0xa4cE7dAfC6fB5acEEDd0070620b72aB8f09b0770' },
];

async function main() {
  const latestRows = await prisma.$queryRaw<{ max_block: number | null }[]>`
    SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
  `;
  const latest = latestRows[0]?.max_block ?? 0;
  const window7d = latest - 50400;

  for (const pool of POOLS) {
    const rows = await prisma.$queryRaw<
      { eventName: string | null; cnt: bigint | null; min_block: number | null; max_block: number | null }[]
    >`
      SELECT "eventName" AS "eventName", COUNT(*)::bigint AS cnt, MIN("blockNumber") AS min_block, MAX("blockNumber") AS max_block
      FROM "PoolEvent"
      WHERE LOWER("pool") = ${pool.addr}
      GROUP BY "eventName"
    `;

    const byEvent = Object.fromEntries(
      rows.map((r) => [(r.eventName ?? 'unknown').toLowerCase(), Number(r.cnt ?? 0)]),
    );
    const minBlock =
      rows.reduce<number | null>(
        (acc, r) => (r.min_block != null ? (acc == null ? r.min_block : Math.min(acc, r.min_block)) : acc),
        null,
      ) ?? null;
    const maxBlock =
      rows.reduce<number | null>(
        (acc, r) => (r.max_block != null ? (acc == null ? r.max_block : Math.max(acc, r.max_block)) : acc),
        null,
      ) ?? null;

    const inWindow = maxBlock !== null && maxBlock >= window7d ? 'IN_7D_WINDOW' : 'OUTSIDE_7D_WINDOW';
    const swapCount = byEvent.swap ?? 0;
    const status =
      swapCount > 0 && inWindow === 'IN_7D_WINDOW'
        ? 'OK'
        : swapCount > 0
          ? 'WARN_OUTSIDE_WINDOW'
          : 'WARN_NO_EVENTS';

    console.log(
      `${pool.name} | pool=${pool.addr} | swap=${swapCount} mint=${byEvent.mint ?? 0} burn=${byEvent.burn ?? 0} collect=${byEvent.collect ?? 0} | min_block=${minBlock ?? 'null'} max_block=${maxBlock ?? 'null'} | window=${inWindow} | status=${status}`,
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

