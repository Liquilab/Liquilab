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

interface PoolLiquidityRow {
  pool_address: string;
  dex: string;
  token0_address: string;
  token1_address: string;
  token0_symbol: string | null;
  token1_symbol: string | null;
  token0_decimals: number | null;
  token1_decimals: number | null;
  amount0_raw: string; // NUMERIC as string
  amount1_raw: string; // NUMERIC as string
  positions_count: bigint;
  last_event_ts: number;
  
}

/**
 * Compute Universe TVL and pool pricing coverage
 * 
 * Uses mv_pool_liquidity + pricing service to:
 * - Classify pools as "priced" (both token0/token1 in pricing universe with valid prices) vs "unpriced"
 * - Compute TVL (USD) for priced pools
 * - Count positions from mv_position_lifetime_v1
 * - Count wallets from PositionTransfer
 * - Active wallets from mv_wallet_lp_7d
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
    // Import pricing config and service
    const { isInPricingUniverse } = await import('../../../config/token-pricing.config');
    const { getTokenPriceUsd } = await import('@/services/tokenPriceService');

    // Check if mv_pool_liquidity exists
    const mvLiquidityExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_pool_liquidity'
      ) as exists
    `;

    let tvlPricedUsd = 0;
    let pricedPoolsCount = 0;
    let unpricedPoolsCount = 0;
    let totalPoolsCount = 0;

    if (mvLiquidityExists[0]?.exists) {
      // Query mv_pool_liquidity for per-pool amounts
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

      totalPoolsCount = liquidityRows.length;

      for (const row of liquidityRows) {
        const symbol0 = row.token0_symbol || '';
        const symbol1 = row.token1_symbol || '';
        const decimals0 = row.token0_decimals ?? 18;
        const decimals1 = row.token1_decimals ?? 18;

        // Check if both tokens are in pricing universe
        if (!symbol0 || !symbol1) {
          unpricedPoolsCount++;
          continue;
        }

        const inUniverse0 = isInPricingUniverse(symbol0);
        const inUniverse1 = isInPricingUniverse(symbol1);

        if (!inUniverse0 || !inUniverse1) {
          unpricedPoolsCount++;
          continue;
        }

        // Get USD prices for both tokens
        const price0 = await getTokenPriceUsd(symbol0, row.token0_address);
        const price1 = await getTokenPriceUsd(symbol1, row.token1_address);

        if (price0 === null || price1 === null) {
          unpricedPoolsCount++;
          continue;
        }

        // Pool is priced - compute TVL
        pricedPoolsCount++;

        // Convert raw amounts to human-readable using decimals
        const amount0Raw = BigInt(row.amount0_raw || '0');
        const amount1Raw = BigInt(row.amount1_raw || '0');
        
        const amount0 = Number(amount0Raw) / Math.pow(10, decimals0);
        const amount1 = Number(amount1Raw) / Math.pow(10, decimals1);

        const poolTvl = amount0 * price0 + amount1 * price1;
        tvlPricedUsd += poolTvl;
      }
    } else {
      // mv_pool_liquidity doesn't exist - fall back to Pool table for counts only
      console.log('[UniverseOverview] mv_pool_liquidity not found; TVL = 0');
      
      const pools = await prisma.pool.findMany({
        where: {
          factory: {
            in: [ENOSYS_FACTORY.toLowerCase(), SPARKDEX_FACTORY.toLowerCase()],
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

      totalPoolsCount = pools.length;

      for (const pool of pools) {
        const symbol0 = pool.token0Symbol || '';
        const symbol1 = pool.token1Symbol || '';

        if (!symbol0 || !symbol1) {
          unpricedPoolsCount++;
          continue;
        }

        const inUniverse0 = isInPricingUniverse(symbol0);
        const inUniverse1 = isInPricingUniverse(symbol1);

        if (!inUniverse0 || !inUniverse1) {
          unpricedPoolsCount++;
          continue;
        }

        const price0 = await getTokenPriceUsd(symbol0, pool.token0);
        const price1 = await getTokenPriceUsd(symbol1, pool.token1);

        if (price0 === null || price1 === null) {
          unpricedPoolsCount++;
        } else {
          pricedPoolsCount++;
        }
      }
      // TVL remains 0 without mv_pool_liquidity
    }

    // Get positions count from mv_position_lifetime_v1
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
      // Fallback: count distinct tokenIds from PositionEvent
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
