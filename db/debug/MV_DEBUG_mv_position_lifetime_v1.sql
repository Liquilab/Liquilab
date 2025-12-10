-- SSoT from scripts/db/create-materialized-views.mts
-- Extracted for manual review (do not apply directly; use the create script as the authoritative source).

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
GROUP BY pe."tokenId", pe."pool", pe."nfpmAddress";

-- If a direct-create variant exists in scripts/fix/create-mvs-direct.mts, paste it below for comparison.
