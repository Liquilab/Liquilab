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
  ttlCache.set(key, {
    value,
    expires: Date.now() + ttlMs,
  });

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

export async function queryOrDegrade<T extends Record<string, unknown>>(
  sql: string,
  params: any[] = [],
  ttlMs = 60_000,
): Promise<{ ok: boolean; degrade?: boolean; rows?: T[] }> {
  if (!hasDatabase()) {
    return { ok: false, degrade: true };
  }

  let pgModule: typeof import('pg');
  try {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
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

// Factory addresses for W3 scope (Enosys + SparkDEX v3 on Flare)
const ENOSYS_FACTORY = '0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de';
const SPARKDEX_FACTORY = '0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652';

// NFPM addresses for W3 scope
const ENOSYS_NFPM = '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657';
const SPARKDEX_NFPM = '0xee5ff5bc5f852764b5584d92a4d592a53dc527da';

export interface UniverseOverview {
  tvlPricedUsd: number;
  pricedPoolsCount: number;
  unpricedPoolsCount: number;
  totalPoolsCount: number;
  positionsCount: number;
  walletsCount: number;
  activeWallets7d: number;
}

/**
 * Compute Universe TVL and pool pricing coverage
 * 
 * Uses Pool table + pricing service to:
 * - Classify pools as "priced" (both token0/token1 have USD prices) vs "unpriced"
 * - Count positions from mv_position_lifetime_v1 (no enum dependency)
 * - Count wallets from PositionTransfer
 * - Active wallets from mv_wallet_lp_7d
 * 
 * Note: TVL computation is currently disabled (returns 0) because computing per-position
 * TVL requires position amounts which are not reliably available in MVs.
 * TVL can be computed on-demand per pool/position via the API when needed.
 */
export async function getUniverseOverview(): Promise<UniverseOverview> {
  if (!hasDatabase()) {
    return {
      tvlPricedUsd: 0,
      pricedPoolsCount: 0,
      unpricedPoolsCount: 0,
      totalPoolsCount: 0,
      positionsCount: 0,
      walletsCount: 0,
      activeWallets7d: 0,
    };
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Get pools from Pool table (Enosys + SparkDEX v3)
    const pools = await prisma.pool.findMany({
      where: {
        factory: {
          in: [ENOSYS_FACTORY.toLowerCase(), SPARKDEX_FACTORY.toLowerCase()],
        },
      },
      select: {
        address: true,
        token0: true,
        token1: true,
        token0Symbol: true,
        token1Symbol: true,
        token0Decimals: true,
        token1Decimals: true,
      },
    });

    const totalPoolsCount = pools.length;

    // Get pricing service
    const { getTokenPriceWithFallback } = await import('@/services/tokenPriceService');

    // Check pricing availability for each pool
    let pricedPoolsCount = 0;
    let unpricedPoolsCount = 0;

    for (const pool of pools) {
      if (!pool.token0Symbol || !pool.token1Symbol) {
        unpricedPoolsCount++;
        continue;
      }

      // Try to get prices for both tokens (with fallback to pool ratio)
      const price0Result = await getTokenPriceWithFallback(pool.token0Symbol, 1.0, pool.token0);
      const price1Result = await getTokenPriceWithFallback(pool.token1Symbol, 1.0, pool.token1);

      // Pool is "priced" if both tokens have real USD prices (not pool_ratio fallback)
      const isPriced = 
        price0Result.source !== 'pool_ratio' && 
        price0Result.source !== 'unknown' &&
        price1Result.source !== 'pool_ratio' && 
        price1Result.source !== 'unknown';

      if (isPriced) {
        pricedPoolsCount++;
      } else {
        unpricedPoolsCount++;
      }
    }

    // TVL computation is disabled for now (requires per-position amounts which 
    // need enum-based queries that can fail). TVL can be computed on-demand via API.
    // TODO: Implement TVL computation using a dedicated MV or RPC-based approach.
    const tvlPricedUsd = 0;

    // Get positions count from mv_position_lifetime_v1 (no enum dependency)
    let positionsCount = 0;
    const mvLifetimeExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_position_lifetime_v1'
      ) as exists
    `;

    if (mvLifetimeExists[0]?.exists) {
      const posResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count FROM "mv_position_lifetime_v1"
      `;
      positionsCount = Number(posResult[0]?.count ?? 0);
    } else {
      // Fallback: count distinct tokenIds from PositionEvent (no eventType filter)
      const posResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT "tokenId")::bigint as count 
        FROM "PositionEvent"
        WHERE LOWER("nfpmAddress") IN (
          ${ENOSYS_NFPM},
          ${SPARKDEX_NFPM}
        )
      `;
      positionsCount = Number(posResult[0]?.count ?? 0);
    }

    // Get wallets count from PositionTransfer
    const walletsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "to")::bigint as count 
      FROM "PositionTransfer"
      WHERE LOWER("nfpmAddress") IN (
        ${ENOSYS_NFPM},
        ${SPARKDEX_NFPM}
      )
        AND "to" != '0x0000000000000000000000000000000000000000'
    `;
    const walletsCount = Number(walletsResult[0]?.count ?? 0);

    // Get active wallets 7d from mv_wallet_lp_7d
    let activeWallets7d = 0;
    const mvWalletExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_wallet_lp_7d'
      ) as exists
    `;

    if (mvWalletExists[0]?.exists) {
      const activeResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT wallet)::bigint as count FROM "mv_wallet_lp_7d"
      `.catch(() => [{ count: 0n }]);
      activeWallets7d = Number(activeResult[0]?.count ?? 0);
    }

    return {
      tvlPricedUsd,
      pricedPoolsCount,
      unpricedPoolsCount,
      totalPoolsCount,
      positionsCount,
      walletsCount,
      activeWallets7d,
    };
  } catch (error) {
    console.error('[UniverseOverview] Error:', error);
    return {
      tvlPricedUsd: 0,
      pricedPoolsCount: 0,
      unpricedPoolsCount: 0,
      totalPoolsCount: 0,
      positionsCount: 0,
      walletsCount: 0,
      activeWallets7d: 0,
    };
  } finally {
    await prisma.$disconnect();
  }
}
