-- mv_pool_reserves_now
-- Current on-chain reserves per pool (SSoT for Pool Universe TVL)
--
-- This view exposes PoolState data for analytics consumption.
-- PoolState is populated via on-chain reads (not event reconstruction),
-- ensuring accurate "current reserves" even if events are missing.
--
-- Refresh: PoolState is updated automatically by indexer follower.
-- This MV can be refreshed periodically or on-demand for analytics queries.
--
-- Usage: Analytics repo queries this for Universe Total TVL aggregation.

CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_reserves_now" AS
SELECT
  LOWER(ps.pool_address) AS pool_address,
  ps.dex,
  LOWER(ps.token0_address) AS token0_address,
  LOWER(ps.token1_address) AS token1_address,
  ps.reserve0_raw,
  ps.reserve1_raw,
  ps.last_block_number,
  ps.updated_at
FROM "PoolState" ps
WITH NO DATA;

-- Unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_reserves_now_pool_idx 
  ON "mv_pool_reserves_now" ("pool_address");

-- Index for dex filtering
CREATE INDEX IF NOT EXISTS mv_pool_reserves_now_dex_idx 
  ON "mv_pool_reserves_now" ("dex");

