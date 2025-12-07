/**
 * Analytics Database Layer
 *
 * Provides typed access to LiquiLab analytics data from Postgres MVs and tables.
 *
 * SSoT Dependencies:
 * - mv_pool_liquidity: Pool-level token amounts
 * - mv_pool_fees_24h: 24h swap-based fees per pool
 * - mv_pool_fees_7d: 7d swap-based fees per pool
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

export interface PoolHeadMetrics {
  poolAddress: string;
  dex: string | null;
  token0Symbol: string | null;
  token1Symbol: string | null;
  tvlUsd: number;
  fees24hUsd: number;
  fees7dUsd: number;
  positionsCount: number;
}

export type DexName = 'ENOSYS' | 'SPARKDEX' | 'OTHER';

export interface PoolUniverseHead {
  pair: {
    token0Symbol: string | null;
    token1Symbol: string | null;
    token0Address: string;
    token1Address: string;
  };
  summary: {
    tvlUsd: number;
    fees24hUsd: number;
    fees7dUsd: number;
    positionsCount: number;
    walletsCount: number;
    poolsCount: number;
  };
  dexBreakdown: Array<{
    dex: DexName;
    tvlUsd: number;
    fees7dUsd: number;
    positionsCount: number;
    poolsCount: number;
  }>;
  segments: Array<{
    poolAddress: string;
    dex: DexName;
    feeTierBps: number | null;
    tvlUsd: number;
    fees7dUsd: number;
    positionsCount: number;
  }>;
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

type PoolTokenMeta = {
  symbol0: string | null;
  symbol1: string | null;
  token0: string | null;
  token1: string | null;
  decimals0: number | null;
  decimals1: number | null;
};

// ============================================================
// Constants (Contract addresses for W3 scope)
// ============================================================

const CONTRACTS = {
  factories: {
    enosys: '0x17aa157ac8c54034381b840cb8f6bf7fc355f0de',
    sparkdex: '0x8a2578d23d4c532cc9a98fad91c0523f5efde652',
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

/** Regex for validating Ethereum addresses (lowercase hex) */
export const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i;

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

// ============================================================
// MV Existence Checks
// ============================================================

async function checkMvExists(prisma: import('@prisma/client').PrismaClient, mvName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<ExistsResult[]>`
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = ${mvName}
    ) as exists
  `;
  return result[0]?.exists ?? false;
}

// ============================================================
// Robust Numeric Scaling Helpers
// ============================================================

/**
 * Convert unknown DB values (number, string, bigint, Decimal) to a finite number.
 * Handles Prisma Decimal objects by calling toString().
 */
function toNumeric(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  // Handle Prisma Decimal or other objects with toString()
  if (typeof (value as Record<string, unknown>).toString === 'function') {
    const str = String(value);
    const parsed = Number(str);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Scale raw token amounts from MV (stored as raw integer strings) to token-native units.
 * Formula: raw / 10^decimals
 *
 * @param raw - Raw value from DB (can be number, string, bigint, or Decimal)
 * @param decimals - Token decimals (default 18 if null/undefined)
 * @returns Scaled amount as a finite number, or 0 if invalid
 */
function scaleAmount(raw: unknown, decimals: number | null | undefined): number {
  const digits = typeof decimals === 'number' && decimals >= 0 ? decimals : 18;
  const base = toNumeric(raw);
  if (!Number.isFinite(base) || base === 0) return 0;
  const scaled = base / Math.pow(10, digits);
  return Number.isFinite(scaled) ? scaled : 0;
}

// ============================================================
// DEX Normalization
// ============================================================

function normalizeDex(dex: string | null | undefined): DexName {
  if (!dex) return 'OTHER';
  const lower = dex.toLowerCase();
  if (lower.includes('enosys')) return 'ENOSYS';
  if (lower.includes('sparkdex') || lower.includes('spark')) return 'SPARKDEX';
  return 'OTHER';
}

function factoryToDex(factory: string | null | undefined): DexName {
  if (!factory) return 'OTHER';
  const lower = factory.toLowerCase();
  if (lower === CONTRACTS.factories.enosys) return 'ENOSYS';
  if (lower === CONTRACTS.factories.sparkdex) return 'SPARKDEX';
  return 'OTHER';
}

// ============================================================
// Symbol Pair Fallback Allowlist (for cross-DEX token contracts)
// ============================================================

/**
 * Explicit allowlist of symbol pairs for which symbol-based fallback matching is enabled.
 * This is deliberately narrow to avoid over-aggregating unrelated tokens that share symbols.
 * 
 * Use case: Enosys and SparkDEX may use different token contracts for the same synthetic
 * (e.g., stXRP on SparkDEX vs stXRP on Enosys), but UX should show a unified Universe.
 */
type SymbolPair = [string, string];

const SYMBOL_PAIR_FALLBACK_ALLOWLIST: SymbolPair[] = [
  ['FXRP', 'STXRP'], // stXRP/FXRP pair on Flare v3 (Enosys + SparkDEX use different contracts)
];

function normaliseSymbolPair(a: string, b: string): SymbolPair {
  const upperA = a.toUpperCase().trim();
  const upperB = b.toUpperCase().trim();
  return upperA <= upperB ? [upperA, upperB] : [upperB, upperA];
}

function isSymbolPairAllowedForFallback(a: string, b: string): boolean {
  if (!a || !b) return false;
  const key = normaliseSymbolPair(a, b);
  return SYMBOL_PAIR_FALLBACK_ALLOWLIST.some(
    ([x, y]) => x === key[0] && y === key[1],
  );
}

// ============================================================
// Pair Slug Resolution (for friendly URLs)
// ============================================================

/**
 * Resolve a canonical pool address from a symbol pair.
 *
 * Used for friendly pair slug URLs like /pool/stxrp-fxrp.
 * Queries the Pool table to find pools matching the given symbol pair,
 * then returns the first match as the canonical base pool for Universe view.
 *
 * @param symbolA - First token symbol (uppercase)
 * @param symbolB - Second token symbol (uppercase)
 * @returns Lowercase pool address, or null if no pool found
 */
export async function getCanonicalPoolAddressForSymbolPair(
  symbolA: string,
  symbolB: string,
): Promise<string | null> {
  if (!symbolA || !symbolB) return null;
  if (!hasDatabase()) return null;

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Normalise to uppercase and sort alphabetically for consistent matching
    const [keyA, keyB] = normaliseSymbolPair(symbolA, symbolB);

    // Query pools matching this symbol pair (order-independent)
    const candidates = await prisma.$queryRaw<Array<{
      address: string;
      token0Symbol: string | null;
      token1Symbol: string | null;
    }>>`
      SELECT 
        address,
        "token0Symbol",
        "token1Symbol"
      FROM "Pool"
      WHERE 
        (UPPER(TRIM("token0Symbol")) = ${keyA} AND UPPER(TRIM("token1Symbol")) = ${keyB})
        OR (UPPER(TRIM("token0Symbol")) = ${keyB} AND UPPER(TRIM("token1Symbol")) = ${keyA})
      ORDER BY address
      LIMIT 10
    `;

    if (candidates.length === 0) {
      console.log(`[POOL_UNIVERSE] Pair slug resolve ${keyA}/${keyB} -> null (no candidates)`);
      return null;
    }

    // Return the first candidate's address as canonical
    const canonicalAddress = candidates[0].address.toLowerCase();

    console.log(
      `[POOL_UNIVERSE] Pair slug resolve ${keyA}/${keyB} -> ${canonicalAddress} (candidates=${candidates.length})`,
    );

    return canonicalAddress;
  } catch (error) {
    console.error('[POOL_UNIVERSE] Pair slug resolve failed:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
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
  // Cast numeric columns to text to ensure consistent string representation
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
      amount0_raw::text AS amount0_raw,
      amount1_raw::text AS amount1_raw,
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

    if (!symbol0 || !symbol1) {
      unpricedPoolsCount++;
      continue;
    }

    if (!isInPricingUniverse(symbol0) || !isInPricingUniverse(symbol1)) {
      unpricedPoolsCount++;
      continue;
    }

    const [price0, price1] = await Promise.all([
      getTokenPriceUsd(symbol0, row.token0_address),
      getTokenPriceUsd(symbol1, row.token1_address),
    ]);

    if (price0 === null || price1 === null) {
      unpricedPoolsCount++;
      continue;
    }

    pricedPoolsCount++;
    const decimals0 = row.token0_decimals ?? 18;
    const decimals1 = row.token1_decimals ?? 18;
    const amount0 = scaleAmount(row.amount0_raw, decimals0);
    const amount1 = scaleAmount(row.amount1_raw, decimals1);
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
        in: [CONTRACTS.factories.enosys, CONTRACTS.factories.sparkdex],
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

  return { tvlPricedUsd: 0, pricedPoolsCount, unpricedPoolsCount, totalPoolsCount };
}

// ============================================================
// Position & Wallet Counts
// ============================================================

async function getPositionsCount(prisma: import('@prisma/client').PrismaClient): Promise<number> {
  const mvExists = await checkMvExists(prisma, 'mv_position_lifetime_v1');

  if (mvExists) {
    const result = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*)::bigint as count FROM "mv_position_lifetime_v1"
    `;
    return Number(result[0]?.count ?? 0);
  }

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

async function getWalletsCount(prisma: import('@prisma/client').PrismaClient): Promise<number> {
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

async function getActiveWallets7d(prisma: import('@prisma/client').PrismaClient): Promise<number> {
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
    const { getTokenPriceUsd } = await import('@/services/tokenPriceService');

    const mvLiquidityExists = await checkMvExists(prisma, 'mv_pool_liquidity');

    let poolMetrics: PoolTvlResult;
    if (mvLiquidityExists) {
      poolMetrics = await computePoolTvlFromMv(prisma, isInPricingUniverse, getTokenPriceUsd);
    } else {
      console.log('[UNIVERSE] mv_pool_liquidity not found; TVL = 0');
      poolMetrics = await computePoolCountsFromTable(prisma, isInPricingUniverse, getTokenPriceUsd);
    }

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

// ============================================================
// Pool-Level Position Count
// ============================================================

async function countPositionsForPool(
  prisma: import('@prisma/client').PrismaClient,
  poolAddress: string,
): Promise<number> {
  const mvExists = await checkMvExists(prisma, 'mv_position_lifetime_v1');

  if (mvExists) {
    const result = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "mv_position_lifetime_v1"
      WHERE LOWER("primary_pool") = ${poolAddress}
    `;
    return Number(result[0]?.count ?? 0);
  }

  const fallback = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(DISTINCT "tokenId")::bigint AS count
    FROM "PositionEvent"
    WHERE LOWER("pool") = ${poolAddress}
      AND LOWER("nfpmAddress") IN (
        ${CONTRACTS.nfpms.enosys},
        ${CONTRACTS.nfpms.sparkdex}
      )
  `;
  return Number(fallback[0]?.count ?? 0);
}

// ============================================================
// Pool Fees Computation
// ============================================================

/**
 * Compute USD fees from fee MVs for a specific pool.
 *
 * The fee MVs (mv_pool_fees_24h, mv_pool_fees_7d) store swap-based fees:
 * - Already computed as: input_volume * (fee_tier / 1_000_000)
 * - Values are in raw token units (need scaling by decimals)
 *
 * This function:
 * 1. Fetches the fee amounts from the appropriate MV (cast to text for consistent parsing)
 * 2. Scales by token decimals using scaleAmount()
 * 3. Converts to USD using current token prices
 */
async function computeFeesUsd(
  prisma: import('@prisma/client').PrismaClient,
  period: '24h' | '7d',
  poolAddress: string,
  meta: PoolTokenMeta,
  price0: number | null,
  price1: number | null,
): Promise<number> {
  if (price0 === null || price1 === null) return 0;
  const viewName = period === '24h' ? 'mv_pool_fees_24h' : 'mv_pool_fees_7d';
  const hasView = await checkMvExists(prisma, viewName);
  if (!hasView) return 0;

  if (period === '24h') {
    // Cast to text to ensure consistent string representation from Postgres NUMERIC
    const rows = await prisma.$queryRaw<{ amount0: string; amount1: string }[]>`
      SELECT "amount0"::text AS amount0, "amount1"::text AS amount1
      FROM "mv_pool_fees_24h"
      WHERE LOWER("pool") = ${poolAddress}
      LIMIT 1
    `;
    if (!rows.length) return 0;
    const fee0 = scaleAmount(rows[0].amount0, meta.decimals0);
    const fee1 = scaleAmount(rows[0].amount1, meta.decimals1);
    return fee0 * price0 + fee1 * price1;
  }

  // 7d fees
  const rows = await prisma.$queryRaw<{ fees0: string; fees1: string }[]>`
    SELECT fees0::text AS fees0, fees1::text AS fees1
    FROM "mv_pool_fees_7d"
    WHERE LOWER("pool") = ${poolAddress}
    LIMIT 1
  `;
  if (!rows.length) return 0;
  const fee0 = scaleAmount(rows[0].fees0, meta.decimals0);
  const fee1 = scaleAmount(rows[0].fees1, meta.decimals1);
  return fee0 * price0 + fee1 * price1;
}

// ============================================================
// Pool Head Metrics
// ============================================================

type PoolHeadResult = {
  ok: boolean;
  degrade: boolean;
  metrics: PoolHeadMetrics | null;
};

/**
 * Get head metrics for a specific pool.
 *
 * Fetches:
 * - TVL from mv_pool_liquidity (amount0_raw, amount1_raw scaled by decimals)
 * - 24h/7d fees from mv_pool_fees_24h/7d (swap-based, scaled by decimals)
 * - Position count from mv_position_lifetime_v1
 *
 * Returns ok: true with metrics (possibly zeroed) for valid pools.
 * Returns degrade: true only when the DB is unavailable.
 */
export async function getPoolHeadMetrics(poolAddress: string): Promise<PoolHeadResult> {
  if (!poolAddress) {
    return { ok: false, degrade: false, metrics: null };
  }

  const normalized = poolAddress.toLowerCase();
  if (!ADDRESS_REGEX.test(normalized)) {
    return { ok: false, degrade: false, metrics: null };
  }

  if (!hasDatabase()) {
    return { ok: false, degrade: true, metrics: null };
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const { getTokenPriceUsd } = await import('@/services/tokenPriceService');

    // Check MV exists
    const liquidityMvExists = await checkMvExists(prisma, 'mv_pool_liquidity');
    if (!liquidityMvExists) {
      return { ok: false, degrade: true, metrics: null };
    }

    // Query liquidity row with ::text casts for numeric columns
    const liquidity = await prisma.$queryRaw<PoolLiquidityRow[]>`
      SELECT 
        pool_address,
        dex,
        token0_address,
        token1_address,
        token0_symbol,
        token1_symbol,
        token0_decimals,
        token1_decimals,
        amount0_raw::text AS amount0_raw,
        amount1_raw::text AS amount1_raw,
        positions_count,
        last_event_ts
      FROM "mv_pool_liquidity"
      WHERE pool_address = ${normalized}
      LIMIT 1
    `;

    const liquidityRow = liquidity[0] ?? null;
    if (!liquidityRow) {
      // Pool not in liquidity MV yet; return zeroed metrics, not degrade
      return { ok: true, degrade: false, metrics: null };
    }

    // Build meta from liquidity row
    const meta: PoolTokenMeta = {
      symbol0: liquidityRow.token0_symbol,
      symbol1: liquidityRow.token1_symbol,
      token0: liquidityRow.token0_address,
      token1: liquidityRow.token1_address,
      decimals0: liquidityRow.token0_decimals,
      decimals1: liquidityRow.token1_decimals,
    };

    // Check pricing eligibility
    let price0: number | null = null;
    let price1: number | null = null;
    const symbol0 = meta.symbol0?.trim() ?? '';
    const symbol1 = meta.symbol1?.trim() ?? '';
    [price0, price1] = await Promise.all([
      getTokenPriceUsd(symbol0, meta.token0 ?? undefined),
      getTokenPriceUsd(symbol1, meta.token1 ?? undefined),
    ]);

    const canPrice = price0 !== null && price1 !== null;

    // Scale amounts from raw to token-native units
    const token0Amount = scaleAmount(liquidityRow.amount0_raw, meta.decimals0);
    const token1Amount = scaleAmount(liquidityRow.amount1_raw, meta.decimals1);

    // Compute TVL
    let tvlUsd = 0;
    if (canPrice) {
      tvlUsd = token0Amount * (price0 as number) + token1Amount * (price1 as number);
    }

    // Get positions count (from liquidity row first, fallback to MV query)
    let positionsCount = Number(liquidityRow.positions_count ?? 0);
    if (!positionsCount) {
      positionsCount = await countPositionsForPool(prisma, normalized);
    }

    // Compute fees
    const fees24hUsd = canPrice ? await computeFeesUsd(prisma, '24h', normalized, meta, price0, price1) : 0;
    const fees7dUsd = canPrice ? await computeFeesUsd(prisma, '7d', normalized, meta, price0, price1) : 0;

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '[POOL_HEAD_METRICS] %s tvlUsd=%d fees24hUsd=%d fees7dUsd=%d positions=%d',
        normalized,
        tvlUsd,
        fees24hUsd,
        fees7dUsd,
        positionsCount,
      );
    }

    return {
      ok: true,
      degrade: false,
      metrics: {
        poolAddress: liquidityRow.pool_address,
        dex: liquidityRow.dex,
        token0Symbol: liquidityRow.token0_symbol,
        token1Symbol: liquidityRow.token1_symbol,
        tvlUsd,
        fees24hUsd,
        fees7dUsd,
        positionsCount,
      },
    };
  } catch (error) {
    console.error('[POOL_HEAD] failed', error);
    return { ok: false, degrade: true, metrics: null };
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================
// Pool Universe Head (Pair-centric aggregation)
// ============================================================

type PoolUniverseHeadResult = {
  ok: boolean;
  degrade: boolean;
  universe: PoolUniverseHead | null;
};

/**
 * Create a canonical pair key from two token addresses (order-independent).
 * Returns addresses in lowercase, sorted alphabetically.
 */
function makePairKey(addr1: string, addr2: string): string {
  const a = addr1.toLowerCase();
  const b = addr2.toLowerCase();
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Get pair-centric Universe head metrics by aggregating across all pools
 * for the same token pair (regardless of DEX or fee tier).
 *
 * This function:
 * 1. Finds the base pool from Pool table (primary source) to get token pair
 * 2. Queries Pool table for ALL pools with the same token pair (any DEX)
 * 3. Gets liquidity data from mv_pool_liquidity where available
 * 4. Aggregates metrics across all pools
 * 5. Returns summary + per-DEX breakdown + individual segments
 */
export async function getPoolUniverseHead(poolAddress: string): Promise<PoolUniverseHeadResult> {
  if (!poolAddress) {
    return { ok: false, degrade: false, universe: null };
  }

  const normalized = poolAddress.toLowerCase();
  if (!ADDRESS_REGEX.test(normalized)) {
    return { ok: false, degrade: false, universe: null };
  }

  if (!hasDatabase()) {
    return { ok: false, degrade: true, universe: null };
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const { isInPricingUniverse } = await import('../../../config/token-pricing.config');
    const { getTokenPriceUsd } = await import('@/services/tokenPriceService');

    // Step 1: Get the base pool from Pool table to identify the token pair
    // Use raw SQL for reliable case-insensitive address matching
    const basePoolRows = await prisma.$queryRaw<Array<{
      address: string;
      token0: string;
      token1: string;
      token0Symbol: string | null;
      token1Symbol: string | null;
      token0Decimals: number | null;
      token1Decimals: number | null;
      fee: number;
      factory: string;
    }>>`
      SELECT 
        address,
        token0,
        token1,
        "token0Symbol",
        "token1Symbol",
        "token0Decimals",
        "token1Decimals",
        fee,
        factory
      FROM "Pool"
      WHERE LOWER(address) = ${normalized}
      LIMIT 1
    `;

    if (!basePoolRows.length) {
      // Pool not found in Pool table; return empty universe (not degrade)
      console.log(`[POOL_UNIVERSE] Pool ${normalized} not found in Pool table`);
      return { ok: true, degrade: false, universe: null };
    }
    
    const basePool = basePoolRows[0];

    const token0Addr = basePool.token0.toLowerCase();
    const token1Addr = basePool.token1.toLowerCase();
    const pairKey = makePairKey(token0Addr, token1Addr);

    // Get symbols for potential fallback matching
    const pairSymbol0 = basePool.token0Symbol?.trim().toUpperCase() ?? '';
    const pairSymbol1 = basePool.token1Symbol?.trim().toUpperCase() ?? '';

    console.log(`[POOL_UNIVERSE] Base pool: ${normalized}`);
    console.log(`[POOL_UNIVERSE] Pair symbols: ${pairSymbol0}/${pairSymbol1}`);
    console.log(`[POOL_UNIVERSE] token0Addr: ${token0Addr}`);
    console.log(`[POOL_UNIVERSE] token1Addr: ${token1Addr}`);
    console.log(`[POOL_UNIVERSE] Factory: ${basePool.factory} → ${factoryToDex(basePool.factory)}`);

    // Define the pool row type for queries
    type PoolRow = {
      address: string;
      token0: string;
      token1: string;
      token0Symbol: string | null;
      token1Symbol: string | null;
      token0Decimals: number | null;
      token1Decimals: number | null;
      fee: number;
      factory: string;
    };

    // Step 2: Two-phase pair discovery
    // Phase 1: Address-based matching (PRIMARY SSoT)
    const poolsByAddress = await prisma.$queryRaw<PoolRow[]>`
      SELECT DISTINCT
        address,
        token0,
        token1,
        "token0Symbol",
        "token1Symbol",
        "token0Decimals",
        "token1Decimals",
        fee,
        factory
      FROM "Pool"
      WHERE 
        (LOWER(token0) = ${token0Addr} AND LOWER(token1) = ${token1Addr})
        OR (LOWER(token0) = ${token1Addr} AND LOWER(token1) = ${token0Addr})
    `;

    console.log(`[POOL_UNIVERSE] Phase 1 (address-based): found ${poolsByAddress.length} pools`);

    // Phase 2: Symbol-based fallback (only if address-based returns < 2 pools AND pair is allowlisted)
    let allPairPoolsRaw: PoolRow[] = [...poolsByAddress];
    let symbolFallbackUsed = false;

    if (poolsByAddress.length < 2 && pairSymbol0 && pairSymbol1) {
      if (isSymbolPairAllowedForFallback(pairSymbol0, pairSymbol1)) {
        console.log(`[POOL_UNIVERSE] Phase 2: Symbol-fallback enabled for ${pairSymbol0}/${pairSymbol1} (allowlisted)`);
        
        const poolsBySymbol = await prisma.$queryRaw<PoolRow[]>`
          SELECT DISTINCT
            address,
            token0,
            token1,
            "token0Symbol",
            "token1Symbol",
            "token0Decimals",
            "token1Decimals",
            fee,
            factory
          FROM "Pool"
          WHERE 
            (UPPER(TRIM("token0Symbol")) = ${pairSymbol0} AND UPPER(TRIM("token1Symbol")) = ${pairSymbol1})
            OR (UPPER(TRIM("token0Symbol")) = ${pairSymbol1} AND UPPER(TRIM("token1Symbol")) = ${pairSymbol0})
        `;

        // Merge and deduplicate by address
        const seenAddresses = new Set(poolsByAddress.map(p => p.address.toLowerCase()));
        for (const p of poolsBySymbol) {
          if (!seenAddresses.has(p.address.toLowerCase())) {
            allPairPoolsRaw.push(p);
            seenAddresses.add(p.address.toLowerCase());
          }
        }

        symbolFallbackUsed = poolsBySymbol.length > 0 && allPairPoolsRaw.length > poolsByAddress.length;
        
        console.log(
          `[POOL_UNIVERSE] Symbol-fallback used for pair ${pairSymbol0}/${pairSymbol1}; ` +
          `byAddress=${poolsByAddress.length}, bySymbol=${poolsBySymbol.length}, merged=${allPairPoolsRaw.length}`
        );
      } else {
        console.log(`[POOL_UNIVERSE] Phase 2: Symbol-fallback skipped for ${pairSymbol0}/${pairSymbol1} (not in allowlist)`);
      }
    }

    console.log(`[POOL_UNIVERSE] Total pools found: ${allPairPoolsRaw.length}${symbolFallbackUsed ? ' (symbol-fallback applied)' : ''}`);
    for (const p of allPairPoolsRaw) {
      console.log(`[POOL_UNIVERSE]   - ${p.address} (${factoryToDex(p.factory)}): ${p.token0Symbol}/${p.token1Symbol}`);
    }

    if (!allPairPoolsRaw.length) {
      return { ok: true, degrade: false, universe: null };
    }

    // Step 3: Get liquidity data from MV for all these pools
    const poolAddresses = allPairPoolsRaw.map((p) => p.address.toLowerCase());
    
    let liquidityMap = new Map<string, PoolLiquidityRow>();
    const liquidityMvExists = await checkMvExists(prisma, 'mv_pool_liquidity');
    
    if (liquidityMvExists && poolAddresses.length > 0) {
      // Fetch all liquidity rows for these pools in one query
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
          amount0_raw::text AS amount0_raw,
          amount1_raw::text AS amount1_raw,
          positions_count,
          last_event_ts
        FROM "mv_pool_liquidity"
        WHERE pool_address = ANY(${poolAddresses}::text[])
      `;
      
      for (const row of liquidityRows) {
        liquidityMap.set(row.pool_address.toLowerCase(), row);
      }
      console.log(`[POOL_UNIVERSE] Found ${liquidityRows.length} pools in mv_pool_liquidity`);
    }

    // Get pricing info once (use base pool symbols)
    const symbol0 = basePool.token0Symbol?.trim() ?? '';
    const symbol1 = basePool.token1Symbol?.trim() ?? '';
    let price0: number | null = null;
    let price1: number | null = null;
    [price0, price1] = await Promise.all([
      getTokenPriceUsd(symbol0, token0Addr),
      getTokenPriceUsd(symbol1, token1Addr),
    ]);

    const canPrice = price0 !== null && price1 !== null;

    // Step 4: Compute per-pool metrics
    const segments: PoolUniverseHead['segments'] = [];
    const dexAgg: Record<DexName, { tvlUsd: number; fees24hUsd: number; fees7dUsd: number; positionsCount: number; poolsCount: number }> = {
      ENOSYS: { tvlUsd: 0, fees24hUsd: 0, fees7dUsd: 0, positionsCount: 0, poolsCount: 0 },
      SPARKDEX: { tvlUsd: 0, fees24hUsd: 0, fees7dUsd: 0, positionsCount: 0, poolsCount: 0 },
      OTHER: { tvlUsd: 0, fees24hUsd: 0, fees7dUsd: 0, positionsCount: 0, poolsCount: 0 },
    };

    let totalTvlUsd = 0;
    let totalFees24hUsd = 0;
    let totalFees7dUsd = 0;
    let totalPositionsCount = 0;

    for (const poolRow of allPairPoolsRaw) {
      const poolAddr = poolRow.address.toLowerCase();
      const dex = factoryToDex(poolRow.factory);
      
      // Check if tokens are reversed relative to base pool
      const isReversed = poolRow.token0.toLowerCase() === token1Addr;
      
      // Get decimals (handle potential pair reversal)
      const decimals0 = isReversed ? (poolRow.token1Decimals ?? 18) : (poolRow.token0Decimals ?? 18);
      const decimals1 = isReversed ? (poolRow.token0Decimals ?? 18) : (poolRow.token1Decimals ?? 18);

      const meta: PoolTokenMeta = {
        symbol0: isReversed ? poolRow.token1Symbol : poolRow.token0Symbol,
        symbol1: isReversed ? poolRow.token0Symbol : poolRow.token1Symbol,
        token0: isReversed ? poolRow.token1 : poolRow.token0,
        token1: isReversed ? poolRow.token0 : poolRow.token1,
        decimals0,
        decimals1,
      };

      // Get liquidity from MV if available
      const liquidityRow = liquidityMap.get(poolAddr);
      
      let poolTvlUsd = 0;
      let poolPositions = 0;
      
      if (liquidityRow && canPrice) {
        // Use MV data for TVL
        const amt0Raw = isReversed ? liquidityRow.amount1_raw : liquidityRow.amount0_raw;
        const amt1Raw = isReversed ? liquidityRow.amount0_raw : liquidityRow.amount1_raw;
        const amt0 = scaleAmount(amt0Raw, decimals0);
        const amt1 = scaleAmount(amt1Raw, decimals1);
        poolTvlUsd = amt0 * (price0 as number) + amt1 * (price1 as number);
        poolPositions = Number(liquidityRow.positions_count ?? 0);
      }
      
      // Fallback: count positions from MV if not in liquidity MV
      if (!poolPositions) {
        poolPositions = await countPositionsForPool(prisma, poolAddr);
      }

      // Compute fees
      const poolFees24h = canPrice ? await computeFeesUsd(prisma, '24h', poolAddr, meta, price0, price1) : 0;
      const poolFees7d = canPrice ? await computeFeesUsd(prisma, '7d', poolAddr, meta, price0, price1) : 0;

      // Fee tier
      const feeTierBps = typeof poolRow.fee === 'number' ? Math.round(poolRow.fee / 100) : null;

      console.log(`[POOL_UNIVERSE] Pool ${poolAddr} (${dex}): TVL=$${poolTvlUsd.toFixed(2)}, fees7d=$${poolFees7d.toFixed(2)}, positions=${poolPositions}`);

      segments.push({
        poolAddress: poolAddr,
        dex,
        feeTierBps,
        tvlUsd: poolTvlUsd,
        fees7dUsd: poolFees7d,
        positionsCount: poolPositions,
      });

      // Aggregate
      totalTvlUsd += poolTvlUsd;
      totalFees24hUsd += poolFees24h;
      totalFees7dUsd += poolFees7d;
      totalPositionsCount += poolPositions;

      dexAgg[dex].tvlUsd += poolTvlUsd;
      dexAgg[dex].fees24hUsd += poolFees24h;
      dexAgg[dex].fees7dUsd += poolFees7d;
      dexAgg[dex].positionsCount += poolPositions;
      dexAgg[dex].poolsCount += 1;
    }

    // Active LP wallets (7d) across all pools in this pair
    let walletsCount = 0;
    const walletMvExists = await checkMvExists(prisma, 'mv_wallet_lp_7d');
    if (walletMvExists && poolAddresses.length > 0) {
      try {
        const walletRows = await prisma.$queryRaw<CountResult[]>`
          SELECT COUNT(DISTINCT wallet)::bigint AS count
          FROM "mv_wallet_lp_7d"
          WHERE LOWER(pool) = ANY(${poolAddresses})
        `;
        walletsCount = Number(walletRows[0]?.count ?? 0);
      } catch (error) {
        console.warn('[POOL_UNIVERSE] walletsCount query failed', error);
      }
    }

    // Build DEX breakdown
    const dexBreakdown: PoolUniverseHead['dexBreakdown'] = [];
    for (const dexKey of ['ENOSYS', 'SPARKDEX', 'OTHER'] as DexName[]) {
      const agg = dexAgg[dexKey];
      if (agg.poolsCount > 0) {
        dexBreakdown.push({
          dex: dexKey,
          tvlUsd: agg.tvlUsd,
          fees7dUsd: agg.fees7dUsd,
          positionsCount: agg.positionsCount,
          poolsCount: agg.poolsCount,
        });
      }
    }

    console.log(`[POOL_UNIVERSE] Summary: TVL=$${totalTvlUsd.toFixed(2)}, pools=${segments.length}, DEXes=${dexBreakdown.length}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[POOL_UNIVERSE_HEAD] %s summary=%o', poolAddress, {
        tvlUsd: totalTvlUsd,
        fees24hUsd: totalFees24hUsd,
        fees7dUsd: totalFees7dUsd,
        positionsCount: totalPositionsCount,
        walletsCount,
      });
    }

    const universe: PoolUniverseHead = {
      pair: {
        token0Symbol: symbol0 || null,
        token1Symbol: symbol1 || null,
        token0Address: token0Addr,
        token1Address: token1Addr,
      },
      summary: {
        tvlUsd: totalTvlUsd,
        fees24hUsd: totalFees24hUsd,
        fees7dUsd: totalFees7dUsd,
        positionsCount: totalPositionsCount,
        walletsCount,
        poolsCount: segments.length,
      },
      dexBreakdown,
      segments,
    };

    return { ok: true, degrade: false, universe };
  } catch (error) {
    console.error('[POOL_UNIVERSE_HEAD] failed', error);
    return { ok: false, degrade: true, universe: null };
  } finally {
    await prisma.$disconnect();
  }
}
