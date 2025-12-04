/**
 * Analytics Database Layer
 *
 * Provides typed access to LiquiLab analytics data from Postgres MVs and tables.
 *
 * SSoT Dependencies:
 * - mv_pool_liquidity: Pool-level token amounts
 * - mv_position_lifetime_v1: Position counts by DEX
 * - mv_wallet_lp_7d: Active wallet counts
 * - config/token-pricing.config.ts: Pricing universe
 * - src/services/tokenPriceService.ts: USD price lookups
 *
 * @module lib/analytics/db
 */

// ============================================================
// Types & Interfaces
// ============================================================

export interface UniverseOverview {
  tvlPricedUsd: number;
  pricedPoolsCount: number;
  unpricedPoolsCount: number;
  totalPoolsCount: number;
  positionsCount: number;
  walletsCount: number;
  activeWallets7d: number;
}

interface PoolLiquidityRow {
  pool_address: string;
  dex: string;
  token0_address: string;
  token1_address: string;
  token0_symbol: string | null;
  token1_symbol: string | null;
  token0_decimals: number | null;
  token1_decimals: number | null;
  amount0_raw: string;
  amount1_raw: string;
  positions_count: bigint;
  last_event_ts: number;
}

interface CountResult {
  count: bigint;
}

interface ExistsResult {
  exists: boolean;
}

// ============================================================
// Constants (Contract addresses for W3 scope)
// ============================================================

const CONTRACTS = {
  factories: {
    enosys: '0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de',
    sparkdex: '0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652',
  },
  nfpms: {
    enosys: '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
    sparkdex: '0xee5ff5bc5f852764b5584d92a4d592a53dc527da',
  },
} as const;

// ============================================================
// TTL Cache (for repeated queries within short window)
// ============================================================

const ttlCache = new Map<string, { expires: number; value: unknown }>();
let pgPool: import('pg').Pool | null = null;

function hasDatabase(): boolean {
  return process.env.DB_DISABLE !== 'true' && Boolean(process.env.DATABASE_URL);
}

async function withTTL<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const cached = ttlCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.value as T;
  }

  const value = await fn();
  ttlCache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

function getPool(pgModule: typeof import('pg')): import('pg').Pool {
  if (!pgPool) {
    pgPool = new pgModule.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return pgPool;
}

// ============================================================
// Generic Query Helper (with graceful degradation)
// ============================================================

export async function queryOrDegrade<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
  ttlMs = 60_000,
): Promise<{ ok: boolean; degrade?: boolean; rows?: T[] }> {
  if (!hasDatabase()) {
    return { ok: false, degrade: true };
  }

  let pgModule: typeof import('pg');
  try {
    pgModule = require('pg');
  } catch {
    return { ok: false, degrade: true };
  }

  const cacheKey = `${sql}::${JSON.stringify(params)}`;

  try {
    const rows = await withTTL<T[]>(cacheKey, ttlMs, async () => {
      const pool = getPool(pgModule);
      const result = await pool.query<T>(sql, params);
      return result.rows;
    });
    return { ok: true, rows };
  } catch {
    return { ok: false, degrade: true };
  }
}

// ============================================================
// MV Existence Checks
// ============================================================

async function checkMvExists(
  prisma: import('@prisma/client').PrismaClient,
  mvName: string,
): Promise<boolean> {
  const result = await prisma.$queryRaw<ExistsResult[]>`
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = ${mvName}
    ) as exists
  `;
  return result[0]?.exists ?? false;
}

// ============================================================
// Pool TVL Computation
// ============================================================

interface PoolTvlResult {
  tvlPricedUsd: number;
  pricedPoolsCount: number;
  unpricedPoolsCount: number;
  totalPoolsCount: number;
}

async function computePoolTvlFromMv(
  prisma: import('@prisma/client').PrismaClient,
  isInPricingUniverse: (symbol: string) => boolean,
  getTokenPriceUsd: (symbol: string, address?: string) => Promise<number | null>,
): Promise<PoolTvlResult> {
  const liquidityRows = await prisma.$queryRaw<PoolLiquidityRow[]>`
    SELECT 
      pool_address,
      dex,
      token0_address,
      token1_address,
      token0_symbol,
      token1_symbol,
      token0_decimals,
      token1_decimals,
      amount0_raw::text,
      amount1_raw::text,
      positions_count,
      last_event_ts
    FROM "mv_pool_liquidity"
  `;

  let tvlPricedUsd = 0;
  let pricedPoolsCount = 0;
  let unpricedPoolsCount = 0;
  const totalPoolsCount = liquidityRows.length;

  for (const row of liquidityRows) {
    const symbol0 = row.token0_symbol ?? '';
    const symbol1 = row.token1_symbol ?? '';

    // Skip if missing symbols
    if (!symbol0 || !symbol1) {
      unpricedPoolsCount++;
      continue;
    }

    // Check pricing universe
    if (!isInPricingUniverse(symbol0) || !isInPricingUniverse(symbol1)) {
      unpricedPoolsCount++;
      continue;
    }

    // Fetch prices
    const [price0, price1] = await Promise.all([
      getTokenPriceUsd(symbol0, row.token0_address),
      getTokenPriceUsd(symbol1, row.token1_address),
    ]);

    if (price0 === null || price1 === null) {
      unpricedPoolsCount++;
      continue;
    }

    // Compute TVL
    pricedPoolsCount++;
    const decimals0 = row.token0_decimals ?? 18;
    const decimals1 = row.token1_decimals ?? 18;
    const amount0 = Number(BigInt(row.amount0_raw || '0')) / 10 ** decimals0;
    const amount1 = Number(BigInt(row.amount1_raw || '0')) / 10 ** decimals1;
    tvlPricedUsd += amount0 * price0 + amount1 * price1;
  }

  return { tvlPricedUsd, pricedPoolsCount, unpricedPoolsCount, totalPoolsCount };
}

async function computePoolCountsFromTable(
  prisma: import('@prisma/client').PrismaClient,
  isInPricingUniverse: (symbol: string) => boolean,
  getTokenPriceUsd: (symbol: string, address?: string) => Promise<number | null>,
): Promise<PoolTvlResult> {
  const pools = await prisma.pool.findMany({
    where: {
      factory: {
        in: [
          CONTRACTS.factories.enosys.toLowerCase(),
          CONTRACTS.factories.sparkdex.toLowerCase(),
        ],
      },
    },
    select: {
      address: true,
      token0Symbol: true,
      token1Symbol: true,
      token0: true,
      token1: true,
    },
  });

  let pricedPoolsCount = 0;
  let unpricedPoolsCount = 0;
  const totalPoolsCount = pools.length;

  for (const pool of pools) {
    const symbol0 = pool.token0Symbol ?? '';
    const symbol1 = pool.token1Symbol ?? '';

    if (!symbol0 || !symbol1) {
      unpricedPoolsCount++;
      continue;
    }

    if (!isInPricingUniverse(symbol0) || !isInPricingUniverse(symbol1)) {
      unpricedPoolsCount++;
      continue;
    }

    const [price0, price1] = await Promise.all([
      getTokenPriceUsd(symbol0, pool.token0),
      getTokenPriceUsd(symbol1, pool.token1),
    ]);

    if (price0 === null || price1 === null) {
      unpricedPoolsCount++;
    } else {
      pricedPoolsCount++;
    }
  }

  // TVL = 0 without mv_pool_liquidity
  return { tvlPricedUsd: 0, pricedPoolsCount, unpricedPoolsCount, totalPoolsCount };
}

// ============================================================
// Position & Wallet Counts
// ============================================================

async function getPositionsCount(
  prisma: import('@prisma/client').PrismaClient,
): Promise<number> {
  const mvExists = await checkMvExists(prisma, 'mv_position_lifetime_v1');

  if (mvExists) {
    const result = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*)::bigint as count FROM "mv_position_lifetime_v1"
    `;
    return Number(result[0]?.count ?? 0);
  }

  // Fallback: count distinct tokenIds from PositionEvent
  const result = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(DISTINCT "tokenId")::bigint as count 
    FROM "PositionEvent"
    WHERE LOWER("nfpmAddress") IN (
      ${CONTRACTS.nfpms.enosys},
      ${CONTRACTS.nfpms.sparkdex}
    )
  `;
  return Number(result[0]?.count ?? 0);
}

async function getWalletsCount(
  prisma: import('@prisma/client').PrismaClient,
): Promise<number> {
  const result = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(DISTINCT "to")::bigint as count 
    FROM "PositionTransfer"
    WHERE LOWER("nfpmAddress") IN (
      ${CONTRACTS.nfpms.enosys},
      ${CONTRACTS.nfpms.sparkdex}
    )
      AND "to" != '0x0000000000000000000000000000000000000000'
  `;
  return Number(result[0]?.count ?? 0);
}

async function getActiveWallets7d(
  prisma: import('@prisma/client').PrismaClient,
): Promise<number> {
  const mvExists = await checkMvExists(prisma, 'mv_wallet_lp_7d');
  if (!mvExists) return 0;

  try {
    const result = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(DISTINCT wallet)::bigint as count FROM "mv_wallet_lp_7d"
    `;
    return Number(result[0]?.count ?? 0);
  } catch {
    return 0;
  }
}

// ============================================================
// Main Export: getUniverseOverview
// ============================================================

/**
 * Compute Universe TVL and analytics metrics
 *
 * Uses:
 * - mv_pool_liquidity for token amounts → TVL
 * - token-pricing.config for pricing universe
 * - tokenPriceService for USD prices
 * - mv_position_lifetime_v1 for position counts
 * - PositionTransfer for wallet counts
 * - mv_wallet_lp_7d for active wallets
 *
 * @returns UniverseOverview with TVL, pool counts, positions, wallets
 */
export async function getUniverseOverview(): Promise<UniverseOverview> {
  const emptyResult: UniverseOverview = {
    tvlPricedUsd: 0,
    pricedPoolsCount: 0,
    unpricedPoolsCount: 0,
    totalPoolsCount: 0,
    positionsCount: 0,
    walletsCount: 0,
    activeWallets7d: 0,
  };

  if (!hasDatabase()) {
    console.log('[UNIVERSE] No database connection; returning empty metrics');
    return emptyResult;
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Import SSoT dependencies
    const { isInPricingUniverse } = await import('../../../config/token-pricing.config');
    const { getTokenPriceUsd } = await import('@/services/tokenPriceService');

    // Compute pool TVL (prefer MV, fall back to Pool table)
    const mvLiquidityExists = await checkMvExists(prisma, 'mv_pool_liquidity');

    let poolMetrics: PoolTvlResult;
    if (mvLiquidityExists) {
      poolMetrics = await computePoolTvlFromMv(prisma, isInPricingUniverse, getTokenPriceUsd);
    } else {
      console.log('[UNIVERSE] mv_pool_liquidity not found; TVL = 0');
      poolMetrics = await computePoolCountsFromTable(prisma, isInPricingUniverse, getTokenPriceUsd);
    }

    // Fetch counts in parallel
    const [positionsCount, walletsCount, activeWallets7d] = await Promise.all([
      getPositionsCount(prisma),
      getWalletsCount(prisma),
      getActiveWallets7d(prisma),
    ]);

    const result: UniverseOverview = {
      ...poolMetrics,
      positionsCount,
      walletsCount,
      activeWallets7d,
    };

    console.log(
      `[UNIVERSE] TVL=$${(result.tvlPricedUsd / 1_000_000).toFixed(2)}M | ` +
        `Pools=${result.pricedPoolsCount}/${result.totalPoolsCount} priced | ` +
        `Positions=${result.positionsCount} | Wallets=${result.walletsCount}`,
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[UNIVERSE] Error: ${message}`);
    return emptyResult;
  } finally {
    await prisma.$disconnect();
  }
}
