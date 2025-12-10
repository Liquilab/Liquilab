-- Add USD amount column for SparkDEX TokenDistributor rewards
ALTER TABLE rewards_sparkdex_distributor
ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(38, 18);

