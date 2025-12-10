-- mv_enosys_rewards_7d
-- Aggregates Enosys rFLR rewards per pool/token over the last 7 days.
-- Mirrors the SparkDEX rewards aggregation pattern.

DROP MATERIALIZED VIEW IF EXISTS "mv_enosys_rewards_7d" CASCADE;

CREATE MATERIALIZED VIEW "mv_enosys_rewards_7d" AS
WITH window_rewards AS (
  SELECT
    LOWER(r.pool_address) AS pool_address,
    LOWER(r.reward_token_address) AS reward_token_address,
    r.reward_token_symbol AS reward_token_symbol,
    r.amount_raw AS amount_raw,
    r.amount_usd AS amount_usd
  FROM rewards_enosys_rflr r
  WHERE r.rewarded_at >= NOW() - INTERVAL '7 days'
)
SELECT
  pool_address,
  reward_token_address,
  reward_token_symbol,
  SUM(amount_raw) AS amount_raw,
  SUM(COALESCE(amount_usd, 0)) AS amount_usd
FROM window_rewards
GROUP BY pool_address, reward_token_address, reward_token_symbol
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS mv_enosys_rewards_7d_pool_token_idx
  ON "mv_enosys_rewards_7d" (pool_address, reward_token_address);

