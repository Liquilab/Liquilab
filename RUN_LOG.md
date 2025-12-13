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
OK 2025-12-13T00:00 CET PR: /wallet stabilized (positions + RangeBand); build passed; branch wallet-rangeband-pr pushed.
OK 2025-12-13T16:30 CET RESTORE: Fixed /pricing, /rangeband, /account pages; restored Button.tsx, added pricingConfig export, fixed named/default exports for WaveBackground and GlobalCtaButton; build passed.
OK 2025-12-13T19:30 CET RESTORE: Restored full /pool/[poolAddress] with PoolUniversePage (Liquidity venues, LP Population, RangeBand, Fees/APR, etc.); build ok.
OK 2025-12-13T21:00 CET UNIVERSE: Added graceful degradation; ts now from Postgres (last_updated); RangeBand section added to layout; build ok.
