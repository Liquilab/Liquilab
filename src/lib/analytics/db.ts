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
 * Normalize symbol for config lookup
 */
function canonicalSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/₮/g, 'T')
    .replace(/₀/g, '0')
    .replace(/\./g, '')
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Compute Universe TVL and pool pricing coverage
 * 
 * Uses Pool table + pricing service to:
 * - Classify pools as "priced" (both token0/token1 in pricing universe with valid prices) vs "unpriced"
 * - Count positions from mv_position_lifetime_v1 (no enum dependency)
 * - Count wallets from PositionTransfer
 * - Active wallets from mv_wallet_lp_7d
 * 
 * Note: TVL computation requires per-pool token amounts which are not currently in MVs.
 * TVL will show 0 until a dedicated amounts MV is created or RPC-based approach is implemented.
 * For now, we classify pools as priced/unpriced based on pricing universe membership.
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
    const { getTokenPricingConfig, isInPricingUniverse } = await import('../../../config/token-pricing.config');
    const { getTokenPriceUsd } = await import('@/services/tokenPriceService');

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

    // Classify pools based on pricing universe membership and price availability
    let pricedPoolsCount = 0;
    let unpricedPoolsCount = 0;
    let tvlPricedUsd = 0;

    for (const pool of pools) {
      // Check if both tokens are in pricing universe
      const symbol0 = pool.token0Symbol || '';
      const symbol1 = pool.token1Symbol || '';
      
      // A pool is only "priced" if:
      // 1. Both tokens have symbols
      // 2. Both tokens are in the pricing universe (pricingUniverse: true)
      // 3. Both tokens have valid USD prices (not null/unknown)
      
      if (!symbol0 || !symbol1) {
        unpricedPoolsCount++;
        continue;
      }

      const inUniverse0 = isInPricingUniverse(symbol0);
      const inUniverse1 = isInPricingUniverse(symbol1);

      if (!inUniverse0 || !inUniverse1) {
        // At least one token not in pricing universe
        unpricedPoolsCount++;
        continue;
      }

      // Both tokens are in pricing universe, try to get prices
      const price0 = await getTokenPriceUsd(symbol0, pool.token0);
      const price1 = await getTokenPriceUsd(symbol1, pool.token1);

      if (price0 === null || price1 === null) {
        // At least one token has no valid price
        unpricedPoolsCount++;
        continue;
      }

      // Pool is priced
      pricedPoolsCount++;

      // TVL computation would go here if we had pool amounts
      // For now, TVL remains 0 until we have per-pool liquidity amounts
      // TODO: Implement TVL computation using on-chain pool.liquidity or dedicated MV
      // tvlPricedUsd += amount0 * price0 + amount1 * price1;
    }

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
