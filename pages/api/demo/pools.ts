import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

import { prisma } from '@/server/db';
import { getRangeWidthPct, getStrategy } from '@/components/pools/PoolRangeIndicator';
import type { RangeStatus } from '@/components/pools/PoolRangeIndicator';

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 12;
const DB_TIMEOUT_MS = 700;
const ENOSYS_FACTORY = '0x17aa157ac8c54034381b840cb8f6bf7fc355f0de';
const SPARKDEX_FACTORY = '0x8a2578d23d4c532cc9a98fad91c0523f5efde652';
const STATUS_ROTATION: Array<'in' | 'near' | 'out'> = ['in', 'near', 'out'];
const CACHE_HEADER = 'public, max-age=60, s-maxage=60, stale-while-revalidate=120';

const FALLBACK_PATH = path.join(process.cwd(), 'public', 'brand.pools.json');

type Dex = 'enosys-v3' | 'sparkdex-v3';

type PoolRow = {
  pool_address: string;
  factory: string | null;
  provider_slug: string | null;
  token0_address: string | null;
  token1_address: string | null;
  token0_symbol: string | null;
  token1_symbol: string | null;
  token0_decimals: number | null;
  token1_decimals: number | null;
  fee: number | null;
  tvl_usd: Prisma.Decimal | number | null;
  incentives_usd: Prisma.Decimal | number | null;
  snapshot_ts: Date | null;
  tick: string | null;
  liquidity: string | null;
  fees_token0: Prisma.Decimal | number | null;
  fees_token1: Prisma.Decimal | number | null;
  fees_24h_usd: Prisma.Decimal | number | null;
};

type DemoPoolItem = {
  providerSlug: string;
  providerName: string;
  poolId: string;
  pairLabel: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Icon: string | null;
  token1Icon: string | null;
  feeTierBps: number;
  rangeMin: number;
  rangeMax: number;
  currentPrice: number;
  rangeWidthPct?: number;
  strategy?: 'aggressive' | 'balanced' | 'conservative';
  strategyLabel?: string;
  status: RangeStatus;
  tvlUsd: number;
  dailyFeesUsd: number;
  dailyIncentivesUsd: number;
  apr24hPct?: number;
  domain?: string;
  isDemo?: boolean;
  displayId?: string;
};

type ApiResponse = {
  ok: boolean;
  source: 'db' | 'snapshot';
  generatedAt: string;
  items: DemoPoolItem[];
  badgeLabel?: string;
  legal?: {
    disclaimer?: string;
  };
  warnings?: string[];
  placeholder?: boolean;
  error?: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse | { ok: false; reason: string }>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, reason: 'method_not_allowed' });
  }

  const limit = clamp(Math.floor(parseParam(req.query.limit, DEFAULT_LIMIT)), 1, MAX_LIMIT);
  const minTvl = Math.max(0, parseParam(req.query.minTvl, 0));
  const nowIso = new Date().toISOString();

  const warnings: string[] = [];
  let pools: DemoPoolItem[] = [];
  let source: ApiResponse['source'] = 'db';

  try {
    const dbPools = await withTimeout(fetchPoolsFromDb(limit * 4), DB_TIMEOUT_MS);
    const filtered = filterByTvl(dbPools, minTvl);
    pools = selectDiversePools(filtered, limit);
    if (!pools.length) {
      warnings.push('db_empty');
      throw new Error('empty_result');
    }
  } catch (error) {
    if (error instanceof Error && error.message !== 'empty_result') {
      warnings.push('db_error');
    }
    try {
      const snapshotPools = await readSnapshotPools();
      const filtered = filterByTvl(snapshotPools, minTvl);
      pools = selectDiversePools(filtered, limit);
      source = 'snapshot';
    } catch (fallbackError) {
      warnings.push('snapshot_error');
      return res.status(503).json({ ok: false, reason: 'no_data' });
    }
  }

  if (!pools.length) {
    return res.status(503).json({ ok: false, reason: 'no_data' });
  }

  res.setHeader('Cache-Control', CACHE_HEADER);
  return res.status(200).json({
    ok: true,
    source,
    generatedAt: nowIso,
    items: pools,
    badgeLabel: 'Demo · generated from live prices',
    legal: {
      disclaimer: 'Not financial advice.',
    },
    warnings: warnings.length ? warnings : undefined,
  });
}

function parseParam(value: string | string[] | undefined, fallback: number): number {
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function filterByTvl(pools: DemoPoolItem[], minTvl: number): DemoPoolItem[] {
  if (!minTvl) return pools;
  return pools.filter((pool) => (pool.tvlUsd ?? 0) >= minTvl);
}

async function fetchPoolsFromDb(limit: number): Promise<DemoPoolItem[]> {
  const query = Prisma.sql`
    WITH latest_snapshot AS (
      SELECT
        am."poolAddress" AS pool_address,
        am."providerSlug" AS provider_slug,
        snap."tvlUsd"    AS tvl_usd,
        snap."incentiveUsd" AS incentives_usd,
        snap."ts"        AS snapshot_ts,
        ROW_NUMBER() OVER (PARTITION BY am."poolAddress" ORDER BY snap."ts" DESC) AS rn
      FROM "analytics_market" am
      JOIN "analytics_market_snapshot" snap ON snap."marketIdFk" = am."id"
      WHERE am."poolAddress" IS NOT NULL
    ),
    latest_per_pool AS (
      SELECT pool_address, provider_slug, tvl_usd, incentives_usd, snapshot_ts
      FROM latest_snapshot
      WHERE rn = 1
    )
    SELECT
      p."address"        AS pool_address,
      p."factory"        AS factory,
      latest_per_pool.provider_slug,
      p."token0"         AS token0_address,
      p."token1"         AS token1_address,
      p."token0Symbol"   AS token0_symbol,
      p."token1Symbol"   AS token1_symbol,
      p."token0Decimals" AS token0_decimals,
      p."token1Decimals" AS token1_decimals,
      p."fee"            AS fee,
      latest_per_pool.tvl_usd,
      latest_per_pool.incentives_usd,
      latest_per_pool.snapshot_ts,
      state.tick,
      state.liquidity,
      fees.fees_token0,
      fees.fees_token1,
      fees.fees_24h_usd
    FROM "Pool" p
    LEFT JOIN latest_per_pool ON latest_per_pool.pool_address = p."address"
    LEFT JOIN "mv_pool_latest_state" state ON state."pool" = p."address"
    LEFT JOIN "mv_pool_fees_24h" fees ON fees."pool" = p."address"
    WHERE LOWER(p."factory") IN (${ENOSYS_FACTORY}, ${SPARKDEX_FACTORY})
    ORDER BY COALESCE(latest_per_pool.tvl_usd, 0) DESC NULLS LAST
    LIMIT ${limit}
  `;

  const rows = await prisma.$queryRaw<PoolRow[]>(query);
  return rows.map(mapRowToDemoPool);
}

function mapRowToDemoPool(row: PoolRow): DemoPoolItem {
  const poolAddress = row.pool_address ?? '';
  const providerSlug = (row.provider_slug ?? '').toLowerCase() || 'enosys';
  const providerName = providerSlug === 'sparkdex' ? 'SparkDEX' : providerSlug === 'blazeswap' ? 'BlazeSwap' : 'Ēnosys';
  const token0Symbol = (row.token0_symbol ?? 'T0').toUpperCase();
  const token1Symbol = (row.token1_symbol ?? 'T1').toUpperCase();
  const pairLabel = `${token0Symbol}/${token1Symbol}`;
  const feeBps = row.fee ?? 0;
  const tvlUsd = toNumber(row.tvl_usd) ?? 0;
  const dailyFeesUsd = toNumber(row.fees_24h_usd) ?? 0;
  const dailyIncentivesUsd = toNumber(row.incentives_usd) ?? 0;
  
  // Generate plausible range and price data for demo
  const basePrice = 1.0;
  const rangeWidth = 0.1 + (Math.random() * 0.3); // 10-40% range
  const rangeMin = basePrice * (1 - rangeWidth / 2);
  const rangeMax = basePrice * (1 + rangeWidth / 2);
  const currentPrice = basePrice * (0.95 + Math.random() * 0.1); // Price within or near range
  const rangeWidthPct = getRangeWidthPct(rangeMin, rangeMax);
  const strategy = getStrategy(rangeWidthPct);
  
  // Determine status based on price position
  let status: RangeStatus = 'out';
  if (currentPrice >= rangeMin && currentPrice <= rangeMax) {
    status = 'in';
  } else {
    const distanceFromRange = Math.min(
      Math.abs(currentPrice - rangeMin),
      Math.abs(currentPrice - rangeMax)
    );
    const rangeSize = rangeMax - rangeMin;
    if (distanceFromRange < rangeSize * 0.1) {
      status = 'near';
    }
  }
  
  // Rotate status deterministically based on pool address
  const seed = poolAddress.toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % 997;
  }
  status = STATUS_ROTATION[hash % STATUS_ROTATION.length];
  
  // Calculate APR
  const apr24hPct = tvlUsd > 0 ? ((dailyFeesUsd + dailyIncentivesUsd) / tvlUsd) * 365 * 100 : 0;
  
  // Token icons
  const token0Icon = `/media/tokens/${token0Symbol.toLowerCase()}.webp`;
  const token1Icon = `/media/tokens/${token1Symbol.toLowerCase()}.webp`;

  return {
    providerSlug,
    providerName,
    poolId: poolAddress,
    pairLabel,
    token0Symbol,
    token1Symbol,
    token0Icon,
    token1Icon,
    feeTierBps: feeBps,
    rangeMin,
    rangeMax,
    currentPrice,
    rangeWidthPct,
    strategy: strategy.tone,
    strategyLabel: strategy.label,
    status,
    tvlUsd,
    dailyFeesUsd,
    dailyIncentivesUsd,
    apr24hPct: Number.isFinite(apr24hPct) ? apr24hPct : undefined,
    isDemo: true,
    displayId: `${providerSlug}-${poolAddress.slice(0, 8)}`,
  };
}

async function readSnapshotPools(): Promise<DemoPoolItem[]> {
  try {
    const content = await fs.readFile(FALLBACK_PATH, 'utf8');
    const parsed = JSON.parse(content) as Array<Record<string, unknown>>;
    return parsed.map((entry) => {
      const poolAddress = String(entry.poolAddress ?? entry.pool_address ?? '');
      const providerSlug = String(entry.providerSlug ?? entry.provider_slug ?? 'enosys').toLowerCase();
      const providerName = providerSlug === 'sparkdex' ? 'SparkDEX' : providerSlug === 'blazeswap' ? 'BlazeSwap' : 'Ēnosys';
      const token0 = normalizeToken(entry.token0);
      const token1 = normalizeToken(entry.token1);
      const pairLabel = `${token0.symbol}/${token1.symbol}`;
      const feeBps = Number((entry.pair as Record<string, unknown> | undefined)?.fee_bps ?? entry.feeBps ?? 0);
      const tvlUsd = toNumber(entry.tvlUsd) ?? 0;
      const dailyFeesUsd = toNumber(entry.fees24hUsd) ?? 0;
      const dailyIncentivesUsd = toNumber(entry.incentivesUsd) ?? 0;
      
      // Generate demo range data
      const basePrice = 1.0;
      const rangeWidth = 0.15 + (Math.random() * 0.25);
      const rangeMin = basePrice * (1 - rangeWidth / 2);
      const rangeMax = basePrice * (1 + rangeWidth / 2);
      const currentPrice = basePrice * (0.95 + Math.random() * 0.1);
      const rangeWidthPct = getRangeWidthPct(rangeMin, rangeMax);
      const strategy = getStrategy(rangeWidthPct);
      
      let status: RangeStatus = 'out';
      if (currentPrice >= rangeMin && currentPrice <= rangeMax) {
        status = 'in';
      } else {
        const distanceFromRange = Math.min(
          Math.abs(currentPrice - rangeMin),
          Math.abs(currentPrice - rangeMax)
        );
        const rangeSize = rangeMax - rangeMin;
        if (distanceFromRange < rangeSize * 0.1) {
          status = 'near';
        }
      }
      
      const seed = poolAddress.toLowerCase();
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) {
        hash = (hash + seed.charCodeAt(i)) % 997;
      }
      status = STATUS_ROTATION[hash % STATUS_ROTATION.length];
      
      const apr24hPct = tvlUsd > 0 ? ((dailyFeesUsd + dailyIncentivesUsd) / tvlUsd) * 365 * 100 : 0;
      
      return {
        providerSlug,
        providerName,
        poolId: poolAddress,
        pairLabel,
        token0Symbol: token0.symbol,
        token1Symbol: token1.symbol,
        token0Icon: `/media/tokens/${token0.symbol.toLowerCase()}.webp`,
        token1Icon: `/media/tokens/${token1.symbol.toLowerCase()}.webp`,
        feeTierBps: feeBps,
        rangeMin,
        rangeMax,
        currentPrice,
        rangeWidthPct,
        strategy: strategy.tone,
        strategyLabel: strategy.label,
        status,
        tvlUsd,
        dailyFeesUsd,
        dailyIncentivesUsd,
        apr24hPct: Number.isFinite(apr24hPct) ? apr24hPct : undefined,
        isDemo: true,
        displayId: `${providerSlug}-${poolAddress.slice(0, 8)}`,
      };
    });
  } catch {
    return [];
  }
}

function normalizeToken(value: unknown): { symbol: string; address: string; decimals: number } {
  if (!value || typeof value !== 'object') {
    return { symbol: 'T', address: '', decimals: 18 };
  }
  const token = value as Record<string, unknown>;
  return {
    symbol: String(token.symbol ?? 'T').toUpperCase(),
    address: String(token.address ?? '').toLowerCase(),
    decimals: Number(token.decimals ?? 18),
  };
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  try {
    const num = typeof value === 'object' && 'toString' in value ? Number((value as { toString(): string }).toString()) : Number(value);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

function selectDiversePools(pools: DemoPoolItem[], limit: number): DemoPoolItem[] {
  if (!pools.length) return [];
  const buckets: Record<string, DemoPoolItem[]> = {
    'enosys': [],
    'sparkdex': [],
    'blazeswap': [],
  };

  pools.forEach((pool) => {
    const bucket = buckets[pool.providerSlug] ?? buckets['enosys'];
    bucket.push(pool);
  });

  Object.values(buckets).forEach((list) => list.sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0)));

  const ordered: DemoPoolItem[] = [];
  while (ordered.length < limit && (buckets['enosys'].length || buckets['sparkdex'].length || buckets['blazeswap'].length)) {
    for (const provider of ['enosys', 'sparkdex', 'blazeswap'] as const) {
      if (ordered.length >= limit) break;
      const candidate = buckets[provider].shift();
      if (candidate) {
        ordered.push(candidate);
      }
    }
  }

  if (ordered.length < limit) {
    const leftovers = pools.filter((pool) => !ordered.includes(pool));
    for (const pool of leftovers) {
      if (ordered.length >= limit) break;
      ordered.push(pool);
    }
  }

  return ordered;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('timeout')), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}

export default handler;
