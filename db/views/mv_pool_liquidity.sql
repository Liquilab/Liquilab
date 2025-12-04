-- mv_pool_liquidity
-- Per-pool token liquidity based on cumulative position events
--
-- Calculates net liquidity per pool by:
-- - Adding amounts from INCREASE events
-- - Subtracting amounts from DECREASE events
--
-- Used by getUniverseOverview to compute TVL for the pricing universe.
--
-- NFPM contract addresses (W3 scope):
--   Enosys:   0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657
--   SparkDEX: 0xee5ff5bc5f852764b5584d92a4d592a53dc527da
--
-- Refresh: via npm run db:mvs:refresh:7d or /api/enrich/refresh-views

CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_liquidity" AS
WITH pool_amounts AS (
  SELECT
    LOWER(pe."pool") AS pool_address,
    -- Sum amounts: positive for INCREASE, negative for DECREASE
    -- Using text cast to avoid enum handling issues
    SUM(
      CASE 
        WHEN pe."eventType"::text IN ('INCREASE', 'MINT') 
          THEN COALESCE(CAST(pe."amount0" AS NUMERIC), 0)
        WHEN pe."eventType"::text IN ('DECREASE', 'BURN') 
          THEN -COALESCE(CAST(pe."amount0" AS NUMERIC), 0)
        ELSE 0
      END
    ) AS amount0_raw,
    SUM(
      CASE 
        WHEN pe."eventType"::text IN ('INCREASE', 'MINT') 
          THEN COALESCE(CAST(pe."amount1" AS NUMERIC), 0)
        WHEN pe."eventType"::text IN ('DECREASE', 'BURN') 
          THEN -COALESCE(CAST(pe."amount1" AS NUMERIC), 0)
        ELSE 0
      END
    ) AS amount1_raw,
    COUNT(DISTINCT pe."tokenId") AS positions_count,
    MAX(pe."timestamp") AS last_event_ts
  FROM "PositionEvent" pe
  WHERE pe."nfpmAddress" IS NOT NULL
    AND LOWER(pe."nfpmAddress") IN (
      '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
      '0xee5ff5bc5f852764b5584d92a4d592a53dc527da'
    )
  GROUP BY LOWER(pe."pool")
)
SELECT
  pa.pool_address,
  CASE 
    WHEN p.factory = '0x17aa157ac8c54034381b840cb8f6bf7fc355f0de' THEN 'enosys-v3'
    WHEN p.factory = '0x8a2578d23d4c532cc9a98fad91c0523f5efde652' THEN 'sparkdex-v3'
    ELSE 'unknown'
  END AS dex,
  p.token0 AS token0_address,
  p.token1 AS token1_address,
  p."token0Symbol" AS token0_symbol,
  p."token1Symbol" AS token1_symbol,
  p."token0Decimals" AS token0_decimals,
  p."token1Decimals" AS token1_decimals,
  -- Ensure amounts are non-negative (negative would indicate more withdrawn than deposited)
  GREATEST(pa.amount0_raw, 0) AS amount0_raw,
  GREATEST(pa.amount1_raw, 0) AS amount1_raw,
  pa.positions_count,
  pa.last_event_ts
FROM pool_amounts pa
JOIN "Pool" p ON LOWER(p.address) = pa.pool_address
WHERE pa.amount0_raw > 0 OR pa.amount1_raw > 0
WITH NO DATA;

-- Unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_liquidity_pool_idx 
  ON "mv_pool_liquidity" ("pool_address");

-- Index for dex filtering
CREATE INDEX IF NOT EXISTS mv_pool_liquidity_dex_idx 
  ON "mv_pool_liquidity" ("dex");
