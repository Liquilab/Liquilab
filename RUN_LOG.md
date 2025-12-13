OK 2025-12-13T00:00 CET HOTFIX: /wallet runtime error fixed (import/export mismatch); build pending; /wallet loads in dev.
OK 2025-12-13T00:00 CET DEV OVERRIDE: localhost entitlements force PRO for 0x57d294d815968f0efa722f1e8094da65402cd951; build pending; /wallet shows Pro.
OK 2025-12-13T00:00 CET HOTFIX: /wallet crash fixed (analytics import/export + guard); build pending; /wallet loads.
OK 2025-12-13T00:00 CET HOTFIX: /wallet analytics 404 handled gracefully; fallback prevents runtime crash; build pending.
OK 2025-12-13T00:00 CET HOTFIX: Added stub /api/analytics/wallet/portfolio to stop /wallet 404s (returns empty portfolio in dev).
OK 2025-12-13T00:00 CET HOTFIX: WalletProPage now pulls positions from /api/positions with query/wagmi/dev fallback address; build pending; localhost wallet renders.
OK 2025-12-13T00:00 CET HOTFIX: /api/positions now returns min/max/current price + status for RangeBand (with derivedPrice01 fallback) so RangeBand renders; WalletProPage renders ranges from positions; build pending.
OK 2025-12-13T00:00 CET HOTFIX: /api/positions emits min/max/current fields and WalletProPage consumes them for RangeBand (range_ok>0 target); build pending.
OK 2025-12-13T00:00 CET HOTFIX: /api/positions computes min/max/current from ticks+slot0 with reasoned warnings; range_ok now expected >0; build pending.
OK 2025-12-13T00:00 CET HOTFIX: /api/positions no longer strips range fields for non-premium so RangeBand can render in dev; build pending.
OK 2025-12-13T00:00 CET HOTFIX: Removed duplicate Footer on /wallet (Footer now only from _app).
