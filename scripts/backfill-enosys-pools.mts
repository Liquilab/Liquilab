#!/usr/bin/env tsx
// @ts-nocheck
/**
 * Enosys PoolEvent backfill (per-pool from last Swap -> latest).
 *
 * Usage (example):
 *   cd "$HOME/Projects/Liquilab_staging"
 *   export DATABASE_URL="postgresql://postgres:...@host:port/db"
 *   export ANKR_NODE_URL="https://rpc.ankr.com/flare/..."
 *   npm run backfill:enosys:pools -- --from=51000000 --to=52000000
 *
 * Defaults:
 *   - factory: Enosys v3 factory from indexer.config.ts
 *   - from: last Swap + 1 when present, else fallback 51,300,000 (overridable via --from)
 *   - to: latest RPC block (or --to override)
 *   - blockWindow=1000, rps=8, concurrency=6 (overridable via CLI)
 *   - relies on provider-aware chunking in RpcScanner (no checkpoints used here)
 */

import { PrismaClient } from '@prisma/client';
import { RpcScanner } from '@/indexer/rpcScanner';
import { EventDecoder } from '@/indexer/eventDecoder';
import { DbWriter } from '@/indexer/dbWriter';
import { PoolScanner } from '@/indexer/poolScanner';
import { indexerConfig } from '../indexer.config';

type CliOpts = {
  fromBlock?: number;
  toBlock?: number;
  pool?: string;
  blockWindow?: number;
  rps?: number;
  concurrency?: number;
};

function parseArgs(): CliOpts {
  const opts: CliOpts = {};
  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [flag, raw] = arg.replace(/^--/, '').split('=');
    const value = raw ?? '';
    if (flag === 'from') opts.fromBlock = parseInt(value, 10);
    if (flag === 'to') opts.toBlock = parseInt(value, 10);
    if (flag === 'pool') opts.pool = value.trim().toLowerCase();
    if (flag === 'blockWindow') opts.blockWindow = parseInt(value, 10);
    if (flag === 'rps') opts.rps = parseInt(value, 10);
    if (flag === 'concurrency') opts.concurrency = parseInt(value, 10);
  }
  return opts;
}

const DEFAULT_BLOCK_WINDOW = 1000;
const DEFAULT_RPS = 8;
const DEFAULT_CONCURRENCY = 6;
const FALLBACK_START_BLOCK = 51_300_000;

const prisma = new PrismaClient();
const decoder = new EventDecoder();
const writer = new DbWriter(prisma);

const ENOSYS_FACTORY = indexerConfig.contracts.factories.enosys.toLowerCase();
const GOLDEN_ENOSYS = [
  '0x3c2a7b76795e58829faaa034486d417dd0155162', // WFLR/USDT0 Enosys
  '0x686f53f0950ef193c887527ec027e6a574a4dbe1', // FXRP/USDT0 Enosys
  '0xa4ce7dafc6fb5aceedd0070620b72ab8f09b0770', // STXRP/FXRP Enosys
];

async function getEnosysPools(poolFilter?: string): Promise<{ address: string; blockNumber: number | null }[]> {
  const whereFactory = ENOSYS_FACTORY;
  const rows = await prisma.pool.findMany({
    where: { factory: { equals: whereFactory, mode: 'insensitive' } },
    select: { address: true, blockNumber: true },
  });
  const base = rows.map((r) => ({ address: r.address.toLowerCase(), blockNumber: r.blockNumber ?? null }));

  // Ensure golden pools are included even if missing from query
  for (const g of GOLDEN_ENOSYS) {
    if (!base.find((p) => p.address === g)) {
      base.push({ address: g, blockNumber: null });
    }
  }

  const filtered = poolFilter ? base.filter((p) => p.address === poolFilter) : base;

  // Deduplicate
  const seen = new Set<string>();
  const uniq: { address: string; blockNumber: number | null }[] = [];
  for (const p of filtered) {
    if (seen.has(p.address)) continue;
    seen.add(p.address);
    uniq.push(p);
  }

  return uniq;
}

async function getLastSwapBlock(pool: string): Promise<number | null> {
  const rows = await prisma.$queryRaw<{ last_block: number | null }[]>`
    SELECT MAX("blockNumber") AS last_block
    FROM "PoolEvent"
    WHERE LOWER("pool") = ${pool} AND "eventName" = 'Swap'
  `;
  return rows[0]?.last_block ?? null;
}

async function main() {
  const cli = parseArgs();
  const blockWindow = cli.blockWindow ?? DEFAULT_BLOCK_WINDOW;
  const rps = cli.rps ?? DEFAULT_RPS;
  const concurrency = cli.concurrency ?? DEFAULT_CONCURRENCY;
  const scanner = new RpcScanner({ blockWindow, rps, concurrency });
  const poolScanner = new PoolScanner(scanner);

  const pools = await getEnosysPools(cli.pool);
  const latest = cli.toBlock ?? (await scanner.getLatestBlock());

  console.log(
    JSON.stringify({
      mode: 'enosys-pools-backfill',
      poolCount: pools.length,
      samplePools: pools.slice(0, 5).map((p) => p.address),
      latestBlock: latest,
      requestedBlockWindow: blockWindow,
      rps,
      concurrency,
      rpcUrl: indexerConfig.rpc.url,
      overrides: { from: cli.fromBlock, to: cli.toBlock, pool: cli.pool },
    }),
  );

  let totalEvents = 0;
  let totalBlocks = 0;
  let processedPools = 0;

  for (const pool of pools) {
    const lastSwap = await getLastSwapBlock(pool.address);
    const derivedStart = lastSwap !== null ? lastSwap + 1 : FALLBACK_START_BLOCK;
    const fromBlock = cli.fromBlock !== undefined ? cli.fromBlock : derivedStart;
    const toBlock = latest;

    if (fromBlock > toBlock) {
      console.log(JSON.stringify({ pool: pool.address, fromBlock, toBlock, message: 'up-to-date' }));
      continue;
    }

    console.log(
      `[ENOSYS_BACKFILL] pool=${pool.address} startBlock=${fromBlock} latestBlock=${latest} blockWindow=${blockWindow} rps=${rps} concurrency=${concurrency}`,
    );

    const scanResult = await poolScanner.scan({
      fromBlock,
      toBlock,
      pools: [pool.address],
      blockWindow,
    });

    let written = 0;
    if (scanResult.rows.length > 0) {
      const writeStats = await writer.writePoolEvents(scanResult.rows);
      written = writeStats.written;
    }

    processedPools += 1;
    totalBlocks += scanResult.scannedBlocks;
    totalEvents += written;

    console.log(
      JSON.stringify({
        pool: pool.address,
        fromBlock,
        toBlock,
        blocksScanned: scanResult.scannedBlocks,
        eventsDecoded: scanResult.rows.length,
        eventsWritten: written,
        blockWindow,
        rps,
        concurrency,
      }),
    );
  }

  console.log(
    JSON.stringify({
      summary: {
        pools: processedPools,
        blocksScanned: totalBlocks,
        eventsWritten: totalEvents,
      },
    }),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

