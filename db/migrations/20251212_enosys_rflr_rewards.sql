-- Enosys rFLR rewards staging table
-- Mirrors the SparkDEX rewards staging pattern but targets Enosys rFLR API ingestion.

CREATE TABLE IF NOT EXISTS rewards_enosys_rflr (
  id TEXT PRIMARY KEY,                     -- stable identifier (e.g., txHash:logIndex or API composite key)
  pool_address TEXT NOT NULL,              -- target Enosys pool (lowercase)
  reward_token_address TEXT NOT NULL,
  reward_token_symbol TEXT NOT NULL,
  amount_raw NUMERIC(78, 0) NOT NULL,      -- raw token amount (wei-style)
  amount_normalized NUMERIC,               -- token units (e.g., 18 decimals)
  amount_usd NUMERIC(38, 18),              -- USD value (computed during ingestion; can be NULL until priced)
  rewarded_at TIMESTAMPTZ NOT NULL,        -- timestamp of reward attribution (from API)
  source TEXT NOT NULL DEFAULT 'ENOSYS_RFLR_API'
);

CREATE INDEX IF NOT EXISTS rewards_enosys_rflr_pool_idx
  ON rewards_enosys_rflr (pool_address);

CREATE INDEX IF NOT EXISTS rewards_enosys_rflr_token_idx
  ON rewards_enosys_rflr (reward_token_symbol);

CREATE INDEX IF NOT EXISTS rewards_enosys_rflr_rewarded_at_idx
  ON rewards_enosys_rflr (rewarded_at);

