-- mv_pool_fees_24h
-- Captures rolling 24h fee stats per pool. Refresh schedule: cron or /api/enrich/refresh-views.
CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_fees_24h" AS
WITH latest_blocks AS (
  SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
)
SELECT p."pool",
       SUM(CAST(COALESCE(p."amount0", '0') AS NUMERIC)) AS "amount0",
       SUM(CAST(COALESCE(p."amount1", '0') AS NUMERIC)) AS "amount1"
FROM "PoolEvent" p
CROSS JOIN latest_blocks lb
WHERE p."blockNumber" >= lb.max_block - 7200 -- approx 24h on Flare
GROUP BY p."pool"
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_fees_24h_pool_idx ON "mv_pool_fees_24h" ("pool");
