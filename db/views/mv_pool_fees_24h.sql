-- mv_pool_fees_24h
-- Rolling 24-hour swap-based fee aggregates per pool (Enosys + SparkDEX v3).
-- Fees are computed from Swap events using Pool.fee (ppm): fee = abs(amount) * fee_tier / 1_000_000.
-- Columns: pool (text, lowercase), fees0 (numeric), fees1 (numeric).
-- Window: latest PoolEvent block minus ~24h (~7200 blocks @12s).

DROP MATERIALIZED VIEW IF EXISTS "mv_pool_fees_24h" CASCADE;

CREATE MATERIALIZED VIEW "mv_pool_fees_24h" AS
WITH latest_blocks AS (
  SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
),
window_swaps AS (
  SELECT
    LOWER(pe."pool") AS pool_address,
    CAST(COALESCE(pe."amount0", '0') AS NUMERIC) AS amount0_raw,
    CAST(COALESCE(pe."amount1", '0') AS NUMERIC) AS amount1_raw,
    p.fee AS fee_tier
  FROM "PoolEvent" pe
  CROSS JOIN latest_blocks lb
  JOIN "Pool" p ON LOWER(p.address) = LOWER(pe."pool")
  WHERE pe."blockNumber" >= lb.max_block - 7200
    AND pe."eventName" = 'Swap'
)
SELECT
  pool_address AS "pool",
  SUM(ABS(amount0_raw) * fee_tier / 1000000) AS fees0,
  SUM(ABS(amount1_raw) * fee_tier / 1000000) AS fees1
FROM window_swaps
GROUP BY pool_address
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_fees_24h_pool_idx
  ON "mv_pool_fees_24h" ("pool");
