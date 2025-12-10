-- mv_sparkdex_rewards_7d
-- Aggregates SparkDEX TokenDistributor rewards (SPX, rFLR) per pool over the last ~7d (50400 blocks).
-- USD conversion is placeholder (0) until price integration is added.

DROP MATERIALIZED VIEW IF EXISTS "mv_sparkdex_rewards_7d" CASCADE;

CREATE MATERIALIZED VIEW "mv_sparkdex_rewards_7d" AS
WITH latest_blocks AS (
  SELECT MAX(block_number) AS max_block FROM rewards_sparkdex_distributor
),
window_rewards AS (
  SELECT
    LOWER(r.pool_address) AS pool_address,
    LOWER(r.reward_token_address) AS reward_token_address,
    r.reward_token_symbol AS reward_token_symbol,
    r.amount_raw AS amount_raw
  FROM rewards_sparkdex_distributor r
  CROSS JOIN latest_blocks lb
  WHERE r.block_number >= COALESCE(lb.max_block, 0) - 50400
)
SELECT
  pool_address,
  reward_token_address,
  reward_token_symbol,
  SUM(amount_raw) AS amount_raw,
  0::NUMERIC AS amount_usd -- TODO: join pricing source for USD conversion
FROM window_rewards
GROUP BY pool_address, reward_token_address, reward_token_symbol
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS mv_sparkdex_rewards_7d_pool_token_idx
  ON "mv_sparkdex_rewards_7d" (pool_address, reward_token_address);

