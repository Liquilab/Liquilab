/**
 * Staking rewards ingestion (SparkDEX TokenDistributor + Enosys rFLR API)
 *
 * Examples:
 *   npm run indexer:staking
 *   npm run indexer:staking -- --from=51800000 --to=51801000
 */

import { StakingScanner } from '../src/indexer/stakingScanner';
import { STAKING_REWARDS, type StakingRewardsConfig } from '../src/indexer/config/stakingContracts';
import { PrismaClient } from '@prisma/client';
import { getTokenPriceUsd } from '@/services/tokenPriceService';
import pLimit from 'p-limit';
import { RateLimiter } from '@/indexer/lib/rateLimiter';
import { createPublicClient, http } from 'viem';
import { flare } from 'viem/chains';

type StakingContractConfig = StakingRewardsConfig & { address: string };

type EnosysApiReward = {
  poolAddress: string;
  rewardTokenAddress: string;
  rewardTokenSymbol: string;
  amountRaw: bigint;
  rewardedAt: Date;
};

const SPARKDEX_FACTORY = '0x8a2578d23d4c532cc9a98fad91c0523f5efde652';

const prisma = new PrismaClient();

const DEFAULT_BLOCK_WINDOW = 5000;
const DEFAULT_RPS = 25;
const DEFAULT_CONCURRENCY = 12;
const SPARKDEX_CHUNK_DEFAULT = 20; // cap chunk when providerCap < requested window
const START_BLOCK = 29_837_200; // Genesis block for Enosys/SparkDEX
const BACK_RANGE_BLOCKS_90D = 650_000; // ~90 days at ~12s blocks

function resolveRpcUrl(): string {
  if (process.env.ANKR_NODE_URL) return process.env.ANKR_NODE_URL;
  if (process.env.FLARE_RPC_URL) return process.env.FLARE_RPC_URL;
  return 'https://flare-api.flare.network/ext/bc/C/rpc';
}

function getProviderCap(rpcUrl: string): number {
  const url = rpcUrl.toLowerCase();
  if (url.includes('flare-api.flare.network')) return 30;
  if (url.includes('rpc.ankr.com/flare')) return 2000;
  return 1000;
}

function buildStakingContracts(): StakingContractConfig[] {
  return STAKING_REWARDS.filter((c) => !!c.distributorAddress && c.type !== 'api').map((c) => ({
    ...c,
    address: c.distributorAddress!.toLowerCase(),
    poolIdentifier: c.poolIdentifier?.toLowerCase(),
    rewardToken: c.rewardToken.toLowerCase(),
  }));
}

function buildApiContracts(): StakingRewardsConfig[] {
  return STAKING_REWARDS.filter((c) => c.type === 'api' && !!c.apiUrl);
}

async function loadSparkdexPools(prisma: PrismaClient): Promise<Set<string>> {
  const rows = await prisma.pool.findMany({
    where: { factory: SPARKDEX_FACTORY },
    select: { address: true },
  });
  return new Set(rows.map((r) => r.address.toLowerCase()));
}

function normalizeTimestamp(value: any): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value * 1000;
    return new Date(ms);
  }
  return new Date();
}

function coerceBigInt(value: any): bigint | null {
  try {
    if (typeof value === 'bigint') return value;
    if (value === null || value === undefined) return null;
    return BigInt(value);
  } catch {
    return null;
  }
}

function parseEnosysApiRewards(payload: any, fallbackToken: { address: string; symbol: string }): EnosysApiReward[] {
  const items: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.pools)
    ? payload.pools
    : Array.isArray(payload?.positions)
    ? payload.positions
    : [];

  const rewards: EnosysApiReward[] = [];

  for (const item of items) {
    const poolAddress: string | undefined =
      item.poolAddress ||
      item.pool_address ||
      item.pool ||
      item.lpToken ||
      item.lp_token ||
      item.address ||
      undefined;

    if (!poolAddress || typeof poolAddress !== 'string') continue;

    const rewardTokenAddress: string =
      item.rewardTokenAddress ||
      item.reward_token_address ||
      item.token ||
      item.token_address ||
      fallbackToken.address;

    const rewardTokenSymbol: string =
      item.rewardTokenSymbol || item.reward_token_symbol || item.symbol || fallbackToken.symbol;

    const raw =
      coerceBigInt(item.amountRaw) ||
      coerceBigInt(item.amount_raw) ||
      coerceBigInt(item.amount) ||
      coerceBigInt(item.rewardsWei) ||
      coerceBigInt(item.rewards_wei);

    if (raw === null || raw === undefined) continue;

    const rewardedAt = normalizeTimestamp(
      item.rewardedAt || item.rewarded_at || item.timestamp || item.updatedAt || item.updated_at || Date.now(),
    );

    rewards.push({
      poolAddress: poolAddress.toLowerCase(),
      rewardTokenAddress: rewardTokenAddress.toLowerCase(),
      rewardTokenSymbol,
      amountRaw: raw,
      rewardedAt,
    });
  }

  return rewards;
}

async function ingestEnosysApiRewards(config: StakingRewardsConfig): Promise<void> {
  if (!config.apiUrl) return;

  console.log(`[Indexer] Fetching Enosys rFLR rewards from API: ${config.apiUrl}`);

  try {
    const res = await fetch(config.apiUrl);
    if (!res.ok) {
      console.warn(`[Indexer] Enosys API returned ${res.status}`);
      return;
    }

    const payload = await res.json();
    const rewards = parseEnosysApiRewards(payload, {
      address: (config.rewardToken || '').toLowerCase(),
      symbol: config.rewardTokenSymbol || 'rFLR',
    });

    if (!rewards.length) {
      console.log('[Indexer] Enosys API returned no reward rows');
      return;
    }

    const rewardPriceUsd =
      config.rewardTokenSymbol && config.rewardToken
        ? await getTokenPriceUsd(config.rewardTokenSymbol, config.rewardToken)
        : null;

    for (const r of rewards) {
      const amountNormalized = Number(r.amountRaw) / 1e18;
      const amountUsd = rewardPriceUsd !== null ? amountNormalized * rewardPriceUsd : null;
      const id = `${r.poolAddress}:${r.rewardTokenAddress}:${r.rewardedAt.toISOString()}`;

      await prisma.$executeRawUnsafe(
        `
          INSERT INTO rewards_enosys_rflr (
            id, pool_address, reward_token_address, reward_token_symbol,
            amount_raw, amount_normalized, amount_usd, rewarded_at, source
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8, $9
          )
          ON CONFLICT (id) DO NOTHING;
        `,
        id,
        r.poolAddress,
        r.rewardTokenAddress,
        r.rewardTokenSymbol,
        r.amountRaw.toString(),
        amountNormalized,
        amountUsd,
        r.rewardedAt.toISOString(),
        'ENOSYS_RFLR_API',
      );
    }

    console.log(`[Indexer] ✓ Enosys rFLR rewards ingested: ${rewards.length} rows`);
  } catch (err) {
    console.error('[Indexer] Failed to ingest Enosys rFLR rewards', err);
  }
}

function resolveRewardPool(
  config: StakingContractConfig,
  event: Awaited<ReturnType<StakingScanner['scan']>>[number],
  sparkdexPools: Set<string>,
): string | null {
  const candidates = [
    event.poolAddress,
    event.metadata?.poolAddress,
    event.metadata?.pool,
    event.metadata?.recipient,
    event.userAddress,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const lower = candidate.toLowerCase();
      if (sparkdexPools.has(lower)) {
        return lower;
      }
    }
  }

  if (config.poolIdentifier) {
    return config.poolIdentifier;
  }

  return null;
}

async function indexStakingStream(opts: { from?: number; to?: number; blockWindow: number; rps: number; concurrency: number }) {
  console.log('[Indexer] Starting STAKING stream...');

  const stakingContracts = buildStakingContracts();
  const apiContracts = buildApiContracts();

  if (stakingContracts.length === 0) {
    console.warn('[Indexer] No staking contracts configured. Update src/indexer/config/stakingContracts.ts');
    return;
  }

  const rpcUrl = resolveRpcUrl();
  const providerCap = getProviderCap(rpcUrl);
  const requestedBlockWindow = opts.blockWindow;
  const effectiveBlockWindow = Math.min(requestedBlockWindow, providerCap);
  const rps = opts.rps;
  const concurrency = opts.concurrency;
  const rateLimiter = new RateLimiter({ rps, burst: rps * 2 });

  const publicClient = createPublicClient({
    chain: flare,
    transport: http(rpcUrl),
  });

  console.log(
    `[Indexer][Staking] rpc=${rpcUrl} requestedBlockWindow=${requestedBlockWindow} providerCap=${providerCap} effectiveBlockWindow=${effectiveBlockWindow} rps=${rps} concurrency=${concurrency}`,
  );

  let latestBlockNumber = opts.to;
  if (latestBlockNumber === undefined) {
    try {
      latestBlockNumber = Number(await publicClient.getBlockNumber());
    } catch (error) {
      console.warn('[Indexer] Failed to fetch latest block; falling back to blockWindow seed', error);
      latestBlockNumber = undefined;
    }
  }

  const defaultFrom = latestBlockNumber !== undefined
    ? Math.max(START_BLOCK, latestBlockNumber - BACK_RANGE_BLOCKS_90D)
    : START_BLOCK;

  let effectiveFrom = opts.from ?? defaultFrom;
  let effectiveTo = opts.to ?? latestBlockNumber ?? effectiveFrom + effectiveBlockWindow;

  console.log(
    `[Indexer] Range: from=${effectiveFrom} to=${effectiveTo} (source=${opts.from || opts.to ? 'CLI' : 'DEFAULT_90D'}) latestBlock=${latestBlockNumber ?? 'unknown'}`,
  );
  const fromBlockParsed = effectiveFrom;
  const toBlockParsed = effectiveTo;

  const sparkdexPools = await loadSparkdexPools(prisma);
  let sparkdexRewardsWritten = 0;
  let sparkdexEventsScanned = 0;
  let enosysRewardsWritten = 0;

  // Enosys API-based rewards (rFLR)
  for (const apiConfig of apiContracts) {
    await ingestEnosysApiRewards(apiConfig);
    // Count logging happens inside ingest; we only track invocation here.
    enosysRewardsWritten = 0; // placeholder; per-row counts are logged internally
  }

  // Scan each staking contract
  for (const config of stakingContracts) {
    console.log(`[Indexer] Scanning ${config.dex} staking (${config.address})...`);

    const scanner = new StakingScanner(rpcUrl, config);
    const rewardPriceUsd =
      config.rewardTokenSymbol && config.rewardToken
        ? await getTokenPriceUsd(config.rewardTokenSymbol, config.rewardToken)
        : null;

    const chunkSize = Math.max(1, effectiveBlockWindow);
    const ranges: Array<{ from: number; to: number }> = [];
    for (let current = fromBlockParsed; current <= toBlockParsed; current += chunkSize) {
      const end = Math.min(current + chunkSize - 1, toBlockParsed);
      ranges.push({ from: current, to: end });
    }

    const limit = pLimit(concurrency);

    await Promise.all(
      ranges.map((range) =>
        limit(async () => {
          try {
            const events = await rateLimiter.schedule(() => scanner.scan(range.from, range.to));
            sparkdexEventsScanned += events.length;

            if (events.length > 0) {
              await prisma.stakingEvent.createMany({
                data: events.map((e) => ({
                  id: e.id,
                  stakingContract: e.stakingContract,
                  poolAddress: e.poolAddress,
                  eventName: e.eventName,
                  userAddress: e.userAddress,
                  rewardToken: e.rewardToken,
                  amount: e.amount,
                  blockNumber: e.blockNumber,
                  txHash: e.txHash,
                  logIndex: e.logIndex,
                  timestamp: e.timestamp,
                  metadata: e.metadata,
                })),
                skipDuplicates: true,
              });
            }

            if (config.type === 'custom' && config.distributorAddress) {
              const rewardInserts = events
                .map((e) => {
                  const poolAddress = resolveRewardPool(config, e, sparkdexPools);
                  if (!poolAddress) {
                    console.warn(
                      `[Indexer] Skipping reward ${e.id} (${config.id}) - no pool mapping (recipient=${e.metadata?.recipient})`,
                    );
                    return null;
                  }

                  const rewardTokenAddress = (e.rewardToken || config.rewardToken).toLowerCase();
                  const rewardTokenSymbol = config.rewardTokenSymbol;
                  const amountRaw = e.amount ? BigInt(e.amount) : 0n;
                  const amountNormalized = Number(amountRaw) / 1e18;
                  const amountUsd = rewardPriceUsd !== null ? amountNormalized * rewardPriceUsd : null;

                  return {
                    id: e.id,
                    distributor_address: config.distributorAddress!.toLowerCase(),
                    reward_token_address: rewardTokenAddress,
                    reward_token_symbol: rewardTokenSymbol,
                    pool_address: poolAddress,
                    recipient: e.userAddress || e.metadata?.recipient || null,
                    amount_raw: amountRaw.toString(),
                    amount_normalized: amountNormalized,
                    amount_usd: amountUsd,
                    block_number: e.blockNumber,
                    tx_hash: e.txHash,
                    log_index: e.logIndex,
                    timestamp: new Date(e.timestamp * 1000).toISOString(),
                    source: 'SPARKDEX_TOKEN_DISTRIBUTOR',
                  };
                })
                .filter((row): row is NonNullable<typeof row> => row !== null);

              if (rewardInserts.length > 0) {
                sparkdexRewardsWritten += rewardInserts.length;
                for (const row of rewardInserts) {
                  await prisma.$executeRawUnsafe(
                    `
                      INSERT INTO rewards_sparkdex_distributor (
                        id, distributor_address, reward_token_address, reward_token_symbol, pool_address,
                        recipient, amount_raw, amount_normalized, amount_usd, block_number, tx_hash, log_index, timestamp, source
                      ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10, $11, $12, $13, $14
                      )
                      ON CONFLICT (id) DO NOTHING;
                    `,
                    row.id,
                    row.distributor_address,
                    row.reward_token_address,
                    row.reward_token_symbol,
                    row.pool_address,
                    row.recipient,
                    row.amount_raw,
                    row.amount_normalized,
                    row.amount_usd,
                    row.block_number,
                    row.tx_hash,
                    row.log_index,
                    row.timestamp,
                    row.source,
                  );
                }
              }
            }

            if (events.length > 0) {
              console.log(
                `[Indexer] ✓ ${config.dex} ${range.from}→${range.to}: ${events.length} events written`
              );
            }
          } catch (err) {
            console.warn(
              `[Indexer] Warning scanning ${range.from}→${range.to}: ${(err as Error).message ?? String(err)}`,
            );
          }
        }),
      ),
    );
  }

  console.log('[Indexer] STAKING stream complete!');
  console.log(
    `[Indexer] Summary: SparkDEX scanned=${sparkdexEventsScanned}, written=${sparkdexRewardsWritten}, Enosys rFLR ingestion attempted (see logs)`,
  );
}

function parseArgs(argv: string[]): { from?: number; to?: number; blockWindow?: number; rps?: number; concurrency?: number } {
  const result: { from?: number; to?: number; blockWindow?: number; rps?: number; concurrency?: number } = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--from=')) {
      result.from = Number(arg.split('=')[1]);
    } else if (arg === '--from' && argv[i + 1]) {
      result.from = Number(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--to=')) {
      result.to = Number(arg.split('=')[1]);
    } else if (arg === '--to' && argv[i + 1]) {
      result.to = Number(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--blockWindow=')) {
      result.blockWindow = Number(arg.split('=')[1]);
    } else if (arg === '--blockWindow' && argv[i + 1]) {
      result.blockWindow = Number(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--rps=')) {
      result.rps = Number(arg.split('=')[1]);
    } else if (arg === '--rps' && argv[i + 1]) {
      result.rps = Number(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--concurrency=')) {
      result.concurrency = Number(arg.split('=')[1]);
    } else if (arg === '--concurrency' && argv[i + 1]) {
      result.concurrency = Number(argv[i + 1]);
      i += 1;
    }
  }
  return result;
}

async function main() {
  const { from, to, blockWindow, rps, concurrency } = parseArgs(process.argv.slice(2));
  await indexStakingStream({
    from,
    to,
    blockWindow: blockWindow ?? DEFAULT_BLOCK_WINDOW,
    rps: rps ?? DEFAULT_RPS,
    concurrency: concurrency ?? DEFAULT_CONCURRENCY,
  });
}

main().catch((err) => {
  console.error('[Indexer] Fatal error:', err);
  process.exitCode = 1;
  prisma.$disconnect();
});

