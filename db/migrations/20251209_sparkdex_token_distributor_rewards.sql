-- SparkDEX TokenDistributor rewards staging table
-- Stores raw reward distributions (SPX/rFLR) emitted by the TokenDistributor
-- Address: 0xc2DF11C68f86910B99EAf8acEd7F5189915Ba24F

CREATE TABLE IF NOT EXISTS rewards_sparkdex_distributor (
  id TEXT PRIMARY KEY,                     -- typically txHash:logIndex
  distributor_address TEXT NOT NULL,       -- TokenDistributor address
  reward_token_address TEXT NOT NULL,
  reward_token_symbol TEXT NOT NULL,
  pool_address TEXT NOT NULL,              -- target pool address (lowercase)
  recipient TEXT,                          -- recipient wallet (lowercase)
  amount_raw NUMERIC(78, 0) NOT NULL,      -- raw token amount (wei-style)
  amount_normalized NUMERIC,               -- optional normalized amount (token units)
  block_number BIGINT NOT NULL,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'SPARKDEX_TOKEN_DISTRIBUTOR'
);

CREATE INDEX IF NOT EXISTS rewards_sparkdex_distributor_pool_idx
  ON rewards_sparkdex_distributor (pool_address);

CREATE INDEX IF NOT EXISTS rewards_sparkdex_distributor_token_idx
  ON rewards_sparkdex_distributor (reward_token_symbol);

CREATE INDEX IF NOT EXISTS rewards_sparkdex_distributor_block_idx
  ON rewards_sparkdex_distributor (block_number);

