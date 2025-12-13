import type { NextApiRequest, NextApiResponse } from 'next';

import { queryOrDegrade } from '@/lib/analytics/db';
import type {
  AnalyticsPoolHead,
  AnalyticsPoolResponse,
  AnalyticsPoolUniverse,
  AnalyticsPoolUniverseSegment,
} from '@/lib/analytics/types';

const ENOSYS_FACTORY = '0x17aa157ac8c54034381b840cb8f6bf7fc355f0de';

// ---------------------------------------------------------------------------
// Schema-Adaptive Pool-Key Detection
// ---------------------------------------------------------------------------

/**
 * Preferred column names for pool/market address matching.
 * Order matters: first match wins.
 */
const PREFERRED_POOL_KEY_COLUMNS = [
  'pool',
  'pool_address',
  'pooladdress',
  'poolAddress',
  'market',
  'market_address',
  'marketaddress',
  'marketAddress',
] as const;

type PoolKeyCache = {
  column: string | null;
  expires: number;
};

const poolKeyCache = new Map<string, PoolKeyCache>();
const CACHE_TTL_MS = 60_000;

/**
 * Resolves the pool-address key column for a given table.
 * Uses information_schema introspection with caching.
 */
async function resolvePoolKeyColumn(tableName: string): Promise<string | null> {
  const cached = poolKeyCache.get(tableName);
  if (cached && cached.expires > Date.now()) {
    return cached.column;
  }

  // Query information_schema for columns
  const colResult = await queryOrDegrade<{ column_name: string }>(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
    `,
    [tableName],
    CACHE_TTL_MS,
  );

  if (!colResult.ok || !colResult.rows || colResult.rows.length === 0) {
    poolKeyCache.set(tableName, { column: null, expires: Date.now() + CACHE_TTL_MS });
    return null;
  }

  const columnNames = colResult.rows.map((r) => r.column_name);

  // Try preferred columns first (exact match, case-insensitive)
  for (const preferred of PREFERRED_POOL_KEY_COLUMNS) {
    const match = columnNames.find((c) => c.toLowerCase() === preferred.toLowerCase());
    if (match) {
      poolKeyCache.set(tableName, { column: match, expires: Date.now() + CACHE_TTL_MS });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[PoolAnalytics] Resolved pool key for ${tableName}: ${match}`);
      }
      return match;
    }
  }

  // Heuristic fallback: column containing both "pool" and "address"
  const heuristicMatches = columnNames.filter((c) => {
    const lower = c.toLowerCase();
    return lower.includes('pool') && lower.includes('address');
  });

  if (heuristicMatches.length === 1) {
    const match = heuristicMatches[0];
    poolKeyCache.set(tableName, { column: match, expires: Date.now() + CACHE_TTL_MS });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PoolAnalytics] Heuristic pool key for ${tableName}: ${match}`);
    }
    return match;
  }

  // Ambiguous or no match
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[PoolAnalytics] No pool key found for ${tableName}. Columns: ${columnNames.join(', ')}`);
  }
  poolKeyCache.set(tableName, { column: null, expires: Date.now() + CACHE_TTL_MS });
  return null;
}

/**
 * Quotes an identifier for use in SQL (handles camelCase).
 */
function quoteIdent(ident: string): string {
  return `"${ident.replace(/"/g, '""')}"`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PoolRow = {
  address: string;
  token0: string;
  token1: string;
  token0symbol: string | null;
  token1symbol: string | null;
  fee: number;
  factory: string;
};

type HeadRow = {
  tvl_usd: number | null;
  fees24h_usd: number | null;
  fees7d_usd: number | null;
  positions_count: number | null;
  ts: Date | null;
};

type SummaryRow = {
  tvl_usd: number | null;
  fees24h_usd: number | null;
  fees7d_usd: number | null;
  positions_count: number | null;
  wallets_count: number | null;
  ts: Date | null;
};

type SegmentRow = {
  dex: string | null;
  fee_tier_bps: number | null;
  tvl_usd: number | null;
  fees7d_usd: number | null;
  positions_count: number | null;
};

type SnapshotMarketRow = {
  id: string;
  provider_slug: string | null;
  fee_tier_bps: number | null;
  pool_address: string | null;
};

type MarketSnapshotRow = {
  market_id: string | null;
  tvl_usd: number | null;
  ts: Date | null;
};

type MarketPositionRow = {
  market_id: string | null;
  positions_count: number | null;
  wallets_count: number | null;
  fees_usd: number | null;
  ts: Date | null;
};

type SummaryPositionRow = {
  positions_count: number | null;
  wallets_count: number | null;
  fees_usd: number | null;
  ts: Date | null;
};

type Capabilities = {
  hasLegacyPoolState: boolean;
  hasAnalyticsSnapshots: boolean;
  hasAnalyticsMarket: boolean;
  legacyPoolKeyColumn: string | null;
};

let cachedCapabilities: { value: Capabilities; expires: number } | null = null;

async function detectCapabilities(): Promise<Capabilities> {
  if (cachedCapabilities && cachedCapabilities.expires > Date.now()) {
    return cachedCapabilities.value;
  }

  // Check legacy MV
  const legacyRes = await queryOrDegrade<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'mv_pool_latest_state'
        AND column_name = 'tvl_usd'
    ) AS exists
    `,
    [],
    60_000,
  );

  // Check analytics_position_snapshot
  const snapshotRes = await queryOrDegrade<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'analytics_position_snapshot'
    ) AS exists
    `,
    [],
    60_000,
  );

  // Check analytics_market
  const marketRes = await queryOrDegrade<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'analytics_market'
    ) AS exists
    `,
    [],
    60_000,
  );

  // Resolve pool key column for legacy MV if it exists
  let legacyPoolKeyColumn: string | null = null;
  if (legacyRes.ok && legacyRes.rows && legacyRes.rows[0]?.exists) {
    legacyPoolKeyColumn = await resolvePoolKeyColumn('mv_pool_latest_state');
  }

  const capabilities: Capabilities = {
    hasLegacyPoolState: Boolean(legacyRes.ok && legacyRes.rows && legacyRes.rows[0]?.exists && legacyPoolKeyColumn),
    hasAnalyticsSnapshots: Boolean(snapshotRes.ok && snapshotRes.rows && snapshotRes.rows[0]?.exists),
    hasAnalyticsMarket: Boolean(marketRes.ok && marketRes.rows && marketRes.rows[0]?.exists),
    legacyPoolKeyColumn,
  };

  cachedCapabilities = { value: capabilities, expires: Date.now() + 60_000 };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[PoolAnalytics] Capabilities:', capabilities);
  }

  return capabilities;
}

function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AnalyticsPoolResponse>) {
  const idParam = String(req.query.id ?? '').trim();
  if (!isValidAddress(idParam)) {
    res.status(400).json({ ok: false, degrade: true, ts: Date.now(), pool: undefined });
    return;
  }

  const poolAddress = idParam.toLowerCase();

  const basePoolResult = await queryOrDegrade<PoolRow>(
    `
    SELECT
      address,
      token0,
      token1,
      COALESCE("token0Symbol", NULL) AS token0symbol,
      COALESCE("token1Symbol", NULL) AS token1symbol,
      fee,
      factory
    FROM "Pool"
    WHERE lower(address) = lower($1)
    LIMIT 1
    `,
    [poolAddress],
    5_000,
  );

  if (!basePoolResult.ok || !basePoolResult.rows || basePoolResult.rows.length === 0) {
    res.status(200).json({ ok: true, degrade: true, ts: Date.now(), pool: undefined });
    return;
  }

  const basePool = basePoolResult.rows[0];

  const pairPoolsResult = await queryOrDegrade<{ address: string; fee: number; factory: string }>(
    `
    SELECT address, fee, factory
    FROM "Pool"
    WHERE
      (
        lower(token0) = lower($1) AND lower(token1) = lower($2)
      ) OR (
        lower(token0) = lower($2) AND lower(token1) = lower($1)
      )
    `,
    [basePool.token0, basePool.token1],
    5_000,
  );

  const pairPools = pairPoolsResult.ok && pairPoolsResult.rows ? pairPoolsResult.rows : [];
  const pairAddresses = pairPools.map((p) => p.address.toLowerCase());
  if (!pairAddresses.includes(poolAddress)) {
    pairAddresses.push(poolAddress);
  }

  const capabilities = await detectCapabilities();

  let head: AnalyticsPoolHead | null = null;
  let summary: AnalyticsPoolUniverse['summary'] | null = null;
  let segments: AnalyticsPoolUniverseSegment[] = [];
  let degrade = false;
  const timestamps: number[] = [];

  // ---------------------------------------------------------------------------
  // Legacy Path (mv_pool_latest_state with schema-adaptive pool key)
  // ---------------------------------------------------------------------------
  if (capabilities.hasLegacyPoolState && capabilities.legacyPoolKeyColumn) {
    const poolCol = quoteIdent(capabilities.legacyPoolKeyColumn);

    // Also resolve pool key for fee MVs
    const fees24hPoolKey = await resolvePoolKeyColumn('mv_pool_fees_24h');
    const fees7dPoolKey = await resolvePoolKeyColumn('mv_pool_fees_7d');

    const fees24hCol = fees24hPoolKey ? quoteIdent(fees24hPoolKey) : null;
    const fees7dCol = fees7dPoolKey ? quoteIdent(fees7dPoolKey) : null;

    const headResult = await queryOrDegrade<HeadRow>(
      `
      WITH pos AS (
        SELECT COUNT(DISTINCT "tokenId") AS positions_count, MAX("timestamp") AS updated_at
        FROM "PositionEvent"
        WHERE lower(pool) = lower($1)
      )
      SELECT
        COALESCE(ls.tvl_usd, 0) AS tvl_usd,
        ${fees24hCol ? `COALESCE(f24."fees_usd_24h", 0)` : '0'} AS fees24h_usd,
        ${fees7dCol ? `COALESCE(f7."fees_usd_7d", 0)` : '0'} AS fees7d_usd,
        COALESCE(pos.positions_count, 0) AS positions_count,
        GREATEST(
          COALESCE(ls.updated_at, TO_TIMESTAMP(0)),
          ${fees24hCol ? `COALESCE(f24.updated_at, TO_TIMESTAMP(0))` : 'TO_TIMESTAMP(0)'},
          ${fees7dCol ? `COALESCE(f7.updated_at, TO_TIMESTAMP(0))` : 'TO_TIMESTAMP(0)'},
          COALESCE(pos.updated_at, TO_TIMESTAMP(0))
        ) AS ts
      FROM (SELECT 1) x
      LEFT JOIN "mv_pool_latest_state" ls ON lower(ls.${poolCol}) = lower($1)
      ${fees24hCol ? `LEFT JOIN "mv_pool_fees_24h" f24 ON lower(f24.${fees24hCol}) = lower($1)` : ''}
      ${fees7dCol ? `LEFT JOIN "mv_pool_fees_7d" f7 ON lower(f7.${fees7dCol}) = lower($1)` : ''}
      LEFT JOIN pos ON TRUE
      `,
      [poolAddress],
      5_000,
    );

    const summaryResult = await queryOrDegrade<SummaryRow>(
      `
      WITH pools AS (
        SELECT UNNEST($1::text[]) AS pool
      ),
      pos AS (
        SELECT pool, COUNT(DISTINCT "tokenId") AS positions_count, MAX("timestamp") AS updated_at
        FROM "PositionEvent"
        WHERE lower(pool) = ANY ($1)
        GROUP BY pool
      ),
      owners AS (
        SELECT COUNT(DISTINCT owner) AS wallets_count
        FROM "PositionEvent"
        WHERE lower(pool) = ANY ($1)
      )
      SELECT
        SUM(COALESCE(ls.tvl_usd, 0)) AS tvl_usd,
        ${fees24hCol ? `SUM(COALESCE(f24."fees_usd_24h", 0))` : '0'} AS fees24h_usd,
        ${fees7dCol ? `SUM(COALESCE(f7."fees_usd_7d", 0))` : '0'} AS fees7d_usd,
        SUM(COALESCE(pos.positions_count, 0)) AS positions_count,
        COALESCE((SELECT wallets_count FROM owners), 0) AS wallets_count,
        GREATEST(
          MAX(COALESCE(ls.updated_at, TO_TIMESTAMP(0))),
          ${fees24hCol ? `MAX(COALESCE(f24.updated_at, TO_TIMESTAMP(0)))` : 'TO_TIMESTAMP(0)'},
          ${fees7dCol ? `MAX(COALESCE(f7.updated_at, TO_TIMESTAMP(0)))` : 'TO_TIMESTAMP(0)'},
          MAX(COALESCE(pos.updated_at, TO_TIMESTAMP(0)))
        ) AS ts
      FROM pools p
      LEFT JOIN "mv_pool_latest_state" ls ON lower(ls.${poolCol}) = lower(p.pool)
      ${fees24hCol ? `LEFT JOIN "mv_pool_fees_24h" f24 ON lower(f24.${fees24hCol}) = lower(p.pool)` : ''}
      ${fees7dCol ? `LEFT JOIN "mv_pool_fees_7d" f7 ON lower(f7.${fees7dCol}) = lower(p.pool)` : ''}
      LEFT JOIN pos ON lower(pos.pool) = lower(p.pool)
      `,
      [pairAddresses],
      5_000,
    );

    const segmentsResult = await queryOrDegrade<SegmentRow>(
      `
      WITH pools AS (
        SELECT UNNEST($1::text[]) AS pool
      ),
      base AS (
        SELECT
          p.address,
          p.fee,
          p.factory,
          COALESCE(ls.tvl_usd, 0) AS tvl_usd,
          ${fees7dCol ? `COALESCE(f7."fees_usd_7d", 0)` : '0'} AS fees7d_usd,
          COALESCE(pos.positions_count, 0) AS positions_count
        FROM pools pl
        JOIN "Pool" p ON lower(p.address) = lower(pl.pool)
        LEFT JOIN "mv_pool_latest_state" ls ON lower(ls.${poolCol}) = lower(pl.pool)
        ${fees7dCol ? `LEFT JOIN "mv_pool_fees_7d" f7 ON lower(f7.${fees7dCol}) = lower(pl.pool)` : ''}
        LEFT JOIN (
          SELECT pool, COUNT(DISTINCT "tokenId") AS positions_count
          FROM "PositionEvent"
          WHERE lower(pool) = ANY ($1)
          GROUP BY pool
        ) pos ON lower(pos.pool) = lower(pl.pool)
      )
      SELECT
        CASE WHEN lower(factory) = $2 THEN 'enosys-v3' ELSE 'sparkdex-v3' END AS dex,
        fee AS fee_tier_bps,
        SUM(tvl_usd) AS tvl_usd,
        SUM(fees7d_usd) AS fees7d_usd,
        SUM(positions_count) AS positions_count
      FROM base
      GROUP BY dex, fee
      ORDER BY tvl_usd DESC NULLS LAST
      `,
      [pairAddresses, ENOSYS_FACTORY],
      5_000,
    );

    if (!headResult.ok || !summaryResult.ok || !segmentsResult.ok) {
      degrade = true;
    }

    const headRow = headResult.ok && headResult.rows ? headResult.rows[0] : null;
    const summaryRow = summaryResult.ok && summaryResult.rows ? summaryResult.rows[0] : null;
    const segmentRows = segmentsResult.ok && segmentsResult.rows ? segmentsResult.rows : [];

    if (headRow) {
      head = {
        tvlUsd: Number(headRow.tvl_usd ?? 0),
        fees24hUsd: Number(headRow.fees24h_usd ?? 0),
        fees7dUsd: Number(headRow.fees7d_usd ?? 0),
        positionsCount: Number(headRow.positions_count ?? 0),
      };
      if (headRow.ts) timestamps.push(new Date(headRow.ts).getTime());
    }

    if (summaryRow) {
      summary = {
        tvlUsd: Number(summaryRow.tvl_usd ?? 0),
        fees24hUsd: Number(summaryRow.fees24h_usd ?? 0),
        fees7dUsd: Number(summaryRow.fees7d_usd ?? 0),
        positionsCount: Number(summaryRow.positions_count ?? 0),
        walletsCount: Number(summaryRow.wallets_count ?? 0),
      };
      if (summaryRow.ts) timestamps.push(new Date(summaryRow.ts).getTime());
    }

    segments = segmentRows.map((seg) => ({
      dex: seg.dex ?? 'other',
      feeTierBps: seg.fee_tier_bps ?? 0,
      tvlUsd: Number(seg.tvl_usd ?? 0),
      fees7dUsd: Number(seg.fees7d_usd ?? 0),
      positionsCount: Number(seg.positions_count ?? 0),
    }));

    if (process.env.NODE_ENV !== 'production') {
      console.log('[PoolAnalytics] Legacy path results:', {
        pool: poolAddress,
        headTvl: head?.tvlUsd,
        summaryTvl: summary?.tvlUsd,
        segmentsCount: segments.length,
      });
    }
  }
  // ---------------------------------------------------------------------------
  // Analytics Snapshots Path
  // ---------------------------------------------------------------------------
  else if (capabilities.hasAnalyticsSnapshots && capabilities.hasAnalyticsMarket) {
    const pairMarketsResult = await queryOrDegrade<SnapshotMarketRow>(
      `
      SELECT
        id::text,
        "providerSlug" AS provider_slug,
        "feeTierBps" AS fee_tier_bps,
        "poolAddress" AS pool_address
      FROM analytics_market
      WHERE
        (
          "poolAddress" IS NOT NULL
          AND lower("poolAddress") = ANY ($1::text[])
        )
        OR (
          $2 <> '' AND $3 <> ''
          AND lower("token0Symbol") = lower($2)
          AND lower("token1Symbol") = lower($3)
        )
        OR (
          $2 <> '' AND $3 <> ''
          AND lower("token0Symbol") = lower($3)
          AND lower("token1Symbol") = lower($2)
        )
      `,
      [pairAddresses, basePool.token0symbol ?? '', basePool.token1symbol ?? ''],
      5_000,
    );

    const pairMarkets = pairMarketsResult.ok && pairMarketsResult.rows ? pairMarketsResult.rows : [];
    if (!pairMarkets.length) {
      degrade = true;
    } else {
      const pairMarketIds = pairMarkets.map((row) => row.id).filter(Boolean);
      const baseMarketId =
        pairMarkets.find((row) => row.pool_address?.toLowerCase() === poolAddress)?.id ?? pairMarketIds[0] ?? null;

      const marketSnapshotsResult = await queryOrDegrade<MarketSnapshotRow>(
        `
        WITH pair_markets AS (
          SELECT UNNEST($1::bigint[]) AS id
        )
        SELECT DISTINCT ON (snap."marketIdFk")
          snap."marketIdFk"::text AS market_id,
          snap."tvlUsd" AS tvl_usd,
          snap.ts
        FROM analytics_market_snapshot snap
        JOIN pair_markets pm ON pm.id = snap."marketIdFk"
        ORDER BY snap."marketIdFk", snap.ts DESC
        `,
        [pairMarketIds],
        5_000,
      );

      const positionsByMarketResult = await queryOrDegrade<MarketPositionRow>(
        `
        WITH pair_markets AS (
          SELECT UNNEST($1::bigint[]) AS id
        ),
        positions AS (
          SELECT p.id, p."walletId", p."marketIdFk"
          FROM analytics_position p
          JOIN pair_markets pm ON pm.id = p."marketIdFk"
        ),
        latest_snap AS (
          SELECT DISTINCT ON (s."positionIdFk")
            s."positionIdFk",
            s."feesUsd",
            s.ts
          FROM analytics_position_snapshot s
          JOIN positions pos ON pos.id = s."positionIdFk"
          ORDER BY s."positionIdFk", s.ts DESC
        )
        SELECT
          pos."marketIdFk"::text AS market_id,
          COUNT(pos.id) AS positions_count,
          COUNT(DISTINCT pos."walletId") AS wallets_count,
          SUM(COALESCE(latest_snap."feesUsd", 0)) AS fees_usd,
          MAX(latest_snap.ts) AS ts
        FROM positions pos
        LEFT JOIN latest_snap ON latest_snap."positionIdFk" = pos.id
        GROUP BY pos."marketIdFk"
        `,
        [pairMarketIds],
        5_000,
      );

      const summaryPositionsResult = await queryOrDegrade<SummaryPositionRow>(
        `
        WITH pair_markets AS (
          SELECT UNNEST($1::bigint[]) AS id
        ),
        positions AS (
          SELECT p.id, p."walletId"
          FROM analytics_position p
          JOIN pair_markets pm ON pm.id = p."marketIdFk"
        ),
        latest_snap AS (
          SELECT DISTINCT ON (s."positionIdFk")
            s."positionIdFk",
            s."feesUsd",
            s.ts
          FROM analytics_position_snapshot s
          JOIN positions pos ON pos.id = s."positionIdFk"
          ORDER BY s."positionIdFk", s.ts DESC
        )
        SELECT
          COUNT(positions.id) AS positions_count,
          COUNT(DISTINCT positions."walletId") AS wallets_count,
          SUM(COALESCE(latest_snap."feesUsd", 0)) AS fees_usd,
          MAX(latest_snap.ts) AS ts
        FROM positions
        LEFT JOIN latest_snap ON latest_snap."positionIdFk" = positions.id
        `,
        [pairMarketIds],
        5_000,
      );

      if (!marketSnapshotsResult.ok || !positionsByMarketResult.ok || !summaryPositionsResult.ok) {
        degrade = true;
      } else if (!baseMarketId) {
        degrade = true;
      } else {
        const marketSnapshots = new Map<string, MarketSnapshotRow>();
        (marketSnapshotsResult.rows ?? []).forEach((row) => {
          if (!row.market_id) return;
          marketSnapshots.set(row.market_id, row);
          if (row.ts) timestamps.push(new Date(row.ts).getTime());
        });

        const marketPositions = new Map<string, MarketPositionRow>();
        (positionsByMarketResult.rows ?? []).forEach((row) => {
          if (!row.market_id) return;
          marketPositions.set(row.market_id, row);
          if (row.ts) timestamps.push(new Date(row.ts).getTime());
        });

        const summaryRow = summaryPositionsResult.rows?.[0] ?? null;

        const headSnapshot = marketSnapshots.get(baseMarketId);
        const headPositions = marketPositions.get(baseMarketId);
        head = {
          tvlUsd: Number(headSnapshot?.tvl_usd ?? 0),
          fees24hUsd: 0,
          fees7dUsd: Number(headPositions?.fees_usd ?? 0),
          positionsCount: Number(headPositions?.positions_count ?? 0),
        };

        summary = {
          tvlUsd: Array.from(marketSnapshots.values()).reduce((acc, row) => acc + Number(row.tvl_usd ?? 0), 0),
          fees24hUsd: 0,
          fees7dUsd: Number(summaryRow?.fees_usd ?? 0),
          positionsCount: Number(summaryRow?.positions_count ?? 0),
          walletsCount: Number(summaryRow?.wallets_count ?? 0),
        };

        segments = pairMarkets.map((market) => {
          const snapshot = marketSnapshots.get(market.id ?? '');
          const stats = marketPositions.get(market.id ?? '');
          const dex =
            market.provider_slug?.toLowerCase().includes('enosys') === true
              ? 'enosys-v3'
              : market.provider_slug?.toLowerCase().includes('sparkdex') === true
                ? 'sparkdex-v3'
                : 'other';
          return {
            dex,
            feeTierBps: market.fee_tier_bps ?? 0,
            tvlUsd: Number(snapshot?.tvl_usd ?? 0),
            fees7dUsd: Number(stats?.fees_usd ?? 0),
            positionsCount: Number(stats?.positions_count ?? 0),
          };
        });

        if (summaryRow?.ts) timestamps.push(new Date(summaryRow.ts).getTime());
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[PoolAnalytics] Analytics snapshots path results:', {
        pool: poolAddress,
        headTvl: head?.tvlUsd,
        summaryTvl: summary?.tvlUsd,
        segmentsCount: segments.length,
      });
    }
  } else {
    degrade = true;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[PoolAnalytics] No data path available. Capabilities:', capabilities);
    }
  }

  const pair = {
    token0Symbol: basePool.token0symbol ?? null,
    token1Symbol: basePool.token1symbol ?? null,
  };

  const summaryFinal =
    summary ??
    ({
      tvlUsd: 0,
      fees24hUsd: 0,
      fees7dUsd: 0,
      positionsCount: 0,
      walletsCount: 0,
    } as AnalyticsPoolUniverse['summary']);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[PoolAnalytics] Final response:', {
      pool: poolAddress,
      head,
      summary: summaryFinal,
      degrade,
    });
  }

  const timestampsMs = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

  res.status(200).json({
    ok: true,
    degrade,
    ts: timestampsMs,
    pool: {
      head,
      universe: {
        pair,
        summary: summaryFinal,
        segments,
      },
    },
  });
}
