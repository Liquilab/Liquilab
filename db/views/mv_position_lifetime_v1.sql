-- mv_position_lifetime_v1
-- Lifetime v3 LP positions (W3-equivalent scope; one row per tokenId)
-- Covers Enosys + SparkDEX v3 on Flare mainnet
-- Used to compare coverage vs W3 Cross-DEX reference (74,857 positions; 8,594 wallets)
--
-- NFPM contract addresses (W3 scope):
--   Enosys:   0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657
--   SparkDEX: 0xee5ff5bc5f852764b5584d92a4d592a53dc527da
--
-- Refresh: on-demand or via cron (not included in 10-min refresh cycle)

CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_position_lifetime_v1" AS
SELECT
    pe."tokenId" AS token_id,
    pe."pool" AS pool_address,
    pe."nfpmAddress" AS nfpm_address,
    CASE 
        WHEN LOWER(pe."nfpmAddress") = '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657' THEN 'enosys-v3'
        WHEN LOWER(pe."nfpmAddress") = '0xee5ff5bc5f852764b5584d92a4d592a53dc527da' THEN 'sparkdex-v3'
        ELSE 'unknown'
    END AS dex,
    MIN(pe."timestamp") AS first_event_ts,
    MAX(pe."timestamp") AS last_event_ts,
    COUNT(*) AS event_count,
    MAX(pe."owner") AS last_known_owner
FROM "PositionEvent" pe
WHERE pe."nfpmAddress" IS NOT NULL
  AND LOWER(pe."nfpmAddress") IN (
      '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
      '0xee5ff5bc5f852764b5584d92a4d592a53dc527da'
  )
GROUP BY pe."tokenId", pe."pool", pe."nfpmAddress"
WITH NO DATA;

-- Unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_position_lifetime_v1_token_id_idx 
    ON "mv_position_lifetime_v1" ("token_id", "nfpm_address");

-- Index for dex filtering
CREATE INDEX IF NOT EXISTS mv_position_lifetime_v1_dex_idx 
    ON "mv_position_lifetime_v1" ("dex");

