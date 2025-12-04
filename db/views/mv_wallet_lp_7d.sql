-- mv_wallet_lp_7d
-- 7-day LP activity snapshot per wallet
--
-- Derives active wallets from PositionTransfer (most reliable) and PositionEvent.
-- A wallet is "active (7d)" if it has at least one LP-related event in the last 7 days.
--
-- Sources:
-- - PositionTransfer: from/to addresses (most reliable, always populated)
-- - PositionEvent: sender/owner/recipient (often NULL, used as fallback)
--
-- NFPM contract addresses (W3 scope):
--   Enosys:   0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657
--   SparkDEX: 0xee5ff5bc5f852764b5584d92a4d592a53dc527da
--
-- Refresh: via npm run db:mvs:refresh:7d or /api/enrich/refresh-views

CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_wallet_lp_7d" AS
WITH
-- Get max timestamp for relative 7d calculation
max_ts AS (
  SELECT COALESCE(MAX("timestamp"), 0) AS max_timestamp FROM "PositionEvent"
),
-- Active wallets from PositionTransfer (most reliable)
transfer_wallets AS (
  SELECT LOWER(pt."to") AS wallet, pt."timestamp"
  FROM "PositionTransfer" pt
  CROSS JOIN max_ts
  WHERE pt."timestamp" >= max_ts.max_timestamp - 604800  -- 7 days in seconds
    AND LOWER(pt."nfpmAddress") IN (
      '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
      '0xee5ff5bc5f852764b5584d92a4d592a53dc527da'
    )
    AND pt."to" != '0x0000000000000000000000000000000000000000'
  UNION ALL
  SELECT LOWER(pt."from") AS wallet, pt."timestamp"
  FROM "PositionTransfer" pt
  CROSS JOIN max_ts
  WHERE pt."timestamp" >= max_ts.max_timestamp - 604800
    AND LOWER(pt."nfpmAddress") IN (
      '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
      '0xee5ff5bc5f852764b5584d92a4d592a53dc527da'
    )
    AND pt."from" != '0x0000000000000000000000000000000000000000'
),
-- Active wallets from PositionEvent (sender/owner/recipient)
event_wallets AS (
  SELECT LOWER(pe."sender") AS wallet, pe."timestamp"
  FROM "PositionEvent" pe
  CROSS JOIN max_ts
  WHERE pe."timestamp" >= max_ts.max_timestamp - 604800
    AND LOWER(pe."nfpmAddress") IN (
      '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
      '0xee5ff5bc5f852764b5584d92a4d592a53dc527da'
    )
    AND pe."sender" IS NOT NULL
    AND pe."sender" != '0x0000000000000000000000000000000000000000'
  UNION ALL
  SELECT LOWER(pe."owner") AS wallet, pe."timestamp"
  FROM "PositionEvent" pe
  CROSS JOIN max_ts
  WHERE pe."timestamp" >= max_ts.max_timestamp - 604800
    AND LOWER(pe."nfpmAddress") IN (
      '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
      '0xee5ff5bc5f852764b5584d92a4d592a53dc527da'
    )
    AND pe."owner" IS NOT NULL
    AND pe."owner" != '0x0000000000000000000000000000000000000000'
  UNION ALL
  SELECT LOWER(pe."recipient") AS wallet, pe."timestamp"
  FROM "PositionEvent" pe
  CROSS JOIN max_ts
  WHERE pe."timestamp" >= max_ts.max_timestamp - 604800
    AND LOWER(pe."nfpmAddress") IN (
      '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
      '0xee5ff5bc5f852764b5584d92a4d592a53dc527da'
    )
    AND pe."recipient" IS NOT NULL
    AND pe."recipient" != '0x0000000000000000000000000000000000000000'
),
-- Combine all wallet activity
all_wallets AS (
  SELECT wallet, "timestamp" FROM transfer_wallets
  UNION ALL
  SELECT wallet, "timestamp" FROM event_wallets
)
SELECT
  wallet,
  COUNT(*) AS events_count_7d,
  MIN("timestamp") AS first_activity_ts_7d,
  MAX("timestamp") AS last_activity_ts_7d
FROM all_wallets
WHERE wallet IS NOT NULL
GROUP BY wallet
WITH NO DATA;

-- Unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_wallet_lp_7d_wallet_idx
  ON "mv_wallet_lp_7d" ("wallet");
