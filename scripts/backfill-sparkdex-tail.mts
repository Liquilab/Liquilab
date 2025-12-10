#!/usr/bin/env tsx
// @ts-nocheck
/**
 * SparkDEX PoolEvent tail backfill (per-pool last_swap_block → latest).
 *
 * Usage:
 *   cd "$HOME/Projects/Liquilab_staging"
 *   export DATABASE_URL="postgresql://postgres:...@host:port/db"
 *   export ANKR_NODE_URL="https://rpc.ankr.com/flare/..."
 *   npm run backfill:sparkdex:tail
 *
 * Defaults (SparkDEX tail):
 *   - blockWindow=5000, rps=24, concurrency=8 (CLI overridable)
 *   - factory allowlist: SparkDEX v3 factory only
 *   - pools: restricted to the 4 golden SparkDEX pools (optionally --pool=<addr>)
 *   - fromBlock = max(last_swap_block, SAFE_MIN_BLOCK=40,000,000), toBlock = latest RPC block
 *   - RpcScanner handles provider caps (ANKR preferred); no checkpoints.
 */

import { PrismaClient } from '@prisma/client';
import { RpcScanner } from '@/indexer/rpcScanner';
import { EventDecoder } from '@/indexer/eventDecoder';
import { DbWriter } from '@/indexer/dbWriter';
import { PoolScanner } from '@/indexer/poolScanner';
import { indexerConfig } from '../indexer.config';

type CliOpts = {
  blockWindow?: number;
  rps?: number;
  concurrency?: number;
  pool?: string;
};

const DEFAULT_BLOCK_WINDOW = 5000;
const DEFAULT_RPS = 24;
const DEFAULT_CONCURRENCY = 8;
const SAFE_MIN_BLOCK = 40_000_000;
const SPARKDEX_FACTORY = '0x8a2578d23d4c532cc9a98fad91c0523f5efde652';
const GOLDEN_SPARKDEX = [
  '0x5fd4139cc6fdfddbd4fa74ddf9ae8f54bc87c555',
  '0x2860db7a2b33b79e59ea450ff43b2dc673a22d3d',
  '0x63873f0d7165689022feef1b77428df357b33dcf',
  '0x88d46717b16619b37fa2dfd2f038defb4459f1f7',
];

function parseArgs(): CliOpts {
  const opts: CliOpts = {};
  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [flag, raw] = arg.replace(/^--/, '').split('=');
    const value = raw ?? '';
    if (flag === 'blockWindow') opts.blockWindow = parseInt(value, 10);
    if (flag === 'rps') opts.rps = parseInt(value, 10);
    if (flag === 'concurrency') opts.concurrency = parseInt(value, 10);
    if (flag === 'pool') opts.pool = value.trim().toLowerCase();
  }
  return opts;
}

const prisma = new PrismaClient();
const decoder = new EventDecoder();
const writer = new DbWriter(prisma);

type PoolRow = { address: string };

async function getSparkdexPools(poolFilter?: string): Promise<PoolRow[]> {
  const rows = await prisma.pool.findMany({
    where: { factory: { equals: SPARKDEX_FACTORY, mode: 'insensitive' } },
    select: { address: true },
  });
  const base = rows.map((r) => ({ address: r.address.toLowerCase() }));

  // Enforce golden allowlist
  const allowlist = new Set(GOLDEN_SPARKDEX);
  const filtered = base.filter((p) => allowlist.has(p.address));

  const finalList = poolFilter ? filtered.filter((p) => p.address === poolFilter) : filtered;

  // Deduplicate
  const seen = new Set<string>();
  const uniq: PoolRow[] = [];
  for (const p of finalList) {
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

  const pools = await getSparkdexPools(cli.pool);
  const latest = await scanner.getLatestBlock();

  console.log(
    JSON.stringify({
      mode: 'sparkdex-tail',
      poolCount: pools.length,
      samplePools: pools.slice(0, 4).map((p) => p.address),
      latestBlock: latest,
      requestedBlockWindow: blockWindow,
      rps,
      concurrency,
      rpcUrl: indexerConfig.rpc.url,
      overrides: { pool: cli.pool },
    }),
  );

  let totalBlocks = 0;
  let totalEvents = 0;
  let totalPools = 0;

  for (const pool of pools) {
    const lastSwap = await getLastSwapBlock(pool.address);
    const fromBlock = Math.max(lastSwap ?? SAFE_MIN_BLOCK, SAFE_MIN_BLOCK);
    const toBlock = latest;

    if (fromBlock > toBlock) {
      console.log(JSON.stringify({ pool: pool.address, fromBlock, toBlock, message: 'up-to-date' }));
      continue;
    }

    console.log(
      `[SPARKDEX_TAIL] pool=${pool.address} fromBlock=${fromBlock} latestBlock=${latest} blockWindow=${blockWindow} rps=${rps} concurrency=${concurrency}`,
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

    totalPools += 1;
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
        pools: totalPools,
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
