## Changelog — 2025-12-12 (PHASE3.3-STABLE-PAIR-PARITY)
- Enforced stable_pair_spot_truth valuation for USDT0 pools in `/api/positions` with per-position valuationMode + warnings surfaced via debug=1. Golden wallet (0x57d...) now shows valuationMode for every position, and Enosys WFLR/USDT0 #28134 evaluates with stable_pair_spot_truth (price01≈0.0126248793, price10≈79.2087). UI remains untouched; verification via `npm run verify`, `npm run build`, and manual `/api/positions?address=0x57d294d815968f0efa722f1e8094da65402cd951&debug=1`.
- **Files Modified:** `pages/api/positions.ts`, `src/lib/positions/types.ts`.

## Changelog — 2025-12-12 (SP2-STABLE-PAIR-PRICING-SOURCES)
- Added explicit `pricingSource0/pricingSource1` metadata to `/api/positions` so debug parity checks can see whether stable_pair_spot_truth or registry/external sources priced each side; keeps valuationMode logging intact.
- **Files Modified:** `pages/api/positions.ts`, `src/lib/positions/types.ts`.

### Phase 3.3 UI Freeze
- UI components remain frozen until stable-pair parity DoD is signed off. Any visual/layout changes must be filed under a separate Phase 4 task.
# PROJECT_STATE · LiquiLab Indexer & API (Concise)

> Living document for the LiquiLab Flare V3 indexer stack.  
> Last updated: 2025-12-04 (SP2-PRICING closed; final state documented). Target size ≤ 25 KB; archived snapshots live under `docs/ops/STATE_ARCHIVE/`.

---

## 1. Indexer Overview

**GECOVERED:** ✅ Fully implemented and operational.

- **Purpose:** Consolidated Flare V3 pipeline that ingests raw Ēnosys/Sparkdex NonfungiblePositionManager/pool events, enriches them, and feeds LiquiLab dashboards.
- **Mode (2025-11-09):** **Flare-only RPC** (no ANKR traffic). Middleware gate funnels all traffic to `/placeholder` until demo cookie set; `/placeholder` password is **Demo88**. Admin dashboards: `/admin/ankr` (cache-only stats) and `/admin/db` (table explorer, confirmation pending).
- **Architecture:** `CLI (backfill | follower)` → `IndexerCore` → `RpcScanner` → `Decoders (factory | pool | nfpm | state)` → `DbWriter` → Postgres (`PoolEvent`, `PositionEvent`, analytics tables). Streams still match Ēnosys/Sparkdex pools + NFPM + pool_state + position_reads.
- **Run modes:** Backfill (deterministic windows, stream-selectable) + follower tailer (12 s cadence, confirmation depth=2). Data lifecycle: raw NDJSON (180 d) → enriched JSON → Postgres (authoritative) → dashboards/APIs.
- **Routing:** Pure Pages Router (Next.js 15). Mixed App Router conflicts were resolved by removing `app/` directory and consolidating all API routes under `pages/api/`.

### 1.1 Railway Indexer Follower Service
- **Service name:** `flare-indexer-follower` (proposed Railway service name).
- **Purpose:** Continuously updates the database with new Flare blockchain events (NFPM, Factory, PoolEvent) using free Flare RPC endpoints, keeping the DB in sync after initial backfills complete.
- **Entrypoint script:** `scripts/indexer-follower.ts` (TypeScript, runs via `tsx`).
- **Start command (Railway):**
  ```bash
  tsx scripts/indexer-follower.ts --factory=all
  ```
  Or via npm script:
  ```bash
  npm run indexer:flare:follow
  ```
- **Required environment variables:**
  - `DATABASE_URL` or `DATABASE_PUBLIC_URL` — PostgreSQL connection string (Railway Postgres service).
  - `FLARE_RPC_URL` (optional) — Flare RPC endpoint. Defaults to `https://flare-api.flare.network/ext/bc/C/rpc` (free public endpoint) if not set. **Follower uses ONLY this env var; ANKR RPC is ignored in follower mode.**
  - `ENOSYS_NFPM` (optional) — Default: `0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657`.
  - `SPARKDEX_NFPM` (optional) — Default: `0xEE5FF5Bc5F852764b5584d92A4d592A53DC527da`.
  - `ENOSYS_V3_FACTORY` (optional) — Default: `0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de`.
  - `SPARKDEX_V3_FACTORY` (optional) — Default: `0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652`.
  - `DB_DISABLE` (optional) — Set to `false` for the follower service (web app should have `DB_DISABLE=true` to prevent conflicts).
  - **Note:** `ANKR_NODE_URL` is reserved for backfill scripts only. The follower explicitly ignores `ANKR_NODE_URL` and uses only `FLARE_RPC_URL` (free Flare API).
- **Configuration:**
  - Poll interval: 12 seconds (`indexer.config.ts` → `follower.pollIntervalMs: 12000`).
  - Confirmation blocks: 32 blocks behind chain head for safety (`follower.confirmationBlocks: 32`).
  - Streams indexed: NFPM (default), Factory events (if `--factory=all`), PoolEvent (if `--factory=all`).
  - Checkpoints: Uses `SyncCheckpoint` table for idempotent resume (`NPM:global`, `FACTORY:enosys`, `FACTORY:sparkdex`, `POOLS:all`).
- **Relationship to backfills:**
  - **Backfills (SP2-D10, SP2-INC1):** One-off historical data ingestion jobs that populate initial data sets (e.g., PoolEvent backfill from block 29,989,866 → 51,459,673, rFLR/APS incentives from start blocks).
  - **Follower:** Continuous tail indexing that keeps the database updated with new events after backfills complete. The follower resumes from checkpoints set by backfills, so it only processes new blocks.
  - **Deployment timing:** The follower should be deployed after SP2-D11 (7d-MVs refresh) and SP2-T60 (Weekly report) are complete, so that the database is fully populated before continuous updates begin.
- **Local testing:**
  ```bash
  npm run indexer:flare:follow
  # Or with explicit factory selection:
  npm run indexer:follow -- --factory=all
  ```
- **Monitoring:** Check `data/indexer.progress.json` for current checkpoint and lag status. Railway logs show sync progress and error counts (max 5 consecutive errors before exit).

---

## Decisions (D#)
- **D-2025-11-06** — Documented Database configuration (source of truth) in PROJECT_STATE.md and aligned local/.env keys for `DATABASE_URL`, `RAW_DB`, `FLARE_API_BASE`, and `FLARE_RPC_URL`.
- **D-2025-11-06** — Added V3 addresses & Indexer scripts to PROJECT_STATE.md; confirmed DB config as source of truth and aligned .env keys (DATABASE_URL, RAW_DB, FLARE_API_BASE, FLARE_RPC_URL).
- **D-2025-11-06** — Documented Database configuration (source of truth) in PROJECT_STATE.md and aligned local/.env keys for `DATABASE_URL`, `RAW_DB`, `FLARE_API_BASE`, and `FLARE_RPC_URL`.
- **D-2025-11-06** — Added V3 addresses & Indexer scripts to PROJECT_STATE.md; confirmed DB config as source of truth and aligned .env keys (DATABASE_URL, RAW_DB, FLARE_API_BASE, FLARE_RPC_URL).

---

## Working Agreements
- Always add an 'Advies' line when a better option exists (see `docs/PROMPTING_STANDARD.md`).
- Data-first pipeline playbook (Incentives & analytics): see dedicated section below for the mandatory 3-phase workflow (goal/golden pools, source validation before code, pipeline only after data proof) and hard stop rules on empty/404 sources.
- MVP SSoT: PoolEvent + current 7d-MV chain remains the production source of truth; any deep refactor must consult `docs/DATA_ARCHITECTURE_V2_GOAL.md` first.

---

## 2. Key Components

**GECOVERED:** ✅ Core indexer components fully implemented.

- **CLI entrypoints:**  
  - `scripts/indexer-backfill.ts` — orchestrates batch runs, stream selection (factories, nfpm, pools), structured start logs. When `--streams=pools` is passed, now invokes `IndexerCore.indexPoolEvents`.  
  - `scripts/indexer-follower.ts` — resilient hourly tail; supports factory/pool catch-up plus NFPM stream by default.  
  - `scripts/dev/run-pools.ts` — dev runner for pool-events: `indexPoolEvents` from block 49,618,000 (or `--from`) to `latest - confirmations`, with optional `--dry` flag.
- **Core services:**  
  - `IndexerCore` — stream coordinators, checkpoint handling, pool registry integration. Exposes `indexPoolEvents({ fromBlock?, toBlock?, checkpointKey?, dryRun? })`.  
  - `RpcScanner` — viem-based `eth_getLogs` batching (batchSize=1000), adaptive concurrency (12→4), autoslow on HTTP 429.  
  - `factoryScanner` — decodes `CreatePool` / `PoolCreated`, caches block timestamps.  
  - `poolScanner` — decodes pool-contract Swap/Mint/Burn/Collect using `mapPoolEvent` helper.  
  - `dbWriter` — batch upserts for `PositionEvent`, `PositionTransfer`, `PoolEvent`.  
  - `poolRegistry` — resolves pool universe (PoolCreated rows ∩ optional allowlist).  
  - `pool_state` / `position_reads` stream helpers read slot0/liquidity & `positions(tokenId)` at `blockNumber: windowEnd`.
- **Mappers & decoders:**  
  - `src/indexer/mappers/mapPoolEvent.ts` — pure mapping function: decoded Uniswap V3 pool event args → `PoolEventRow` with stringified bigints, lowercase addresses, and numeric ticks.
- **ABIs:**  
  - `src/indexer/abis/factory.ts` (Uniswap V3 factories).  
  - `src/indexer/abis/pool.ts` (Swap/Mint/Burn/Collect).  
  - `src/indexer/abis/abis.ts` (NFPM events).  
- **Data paths & artefacts:**  
  - `data/raw/*.ndjson`, `data/enriched/*.json`, `logs/indexer-YYYYMMDD.log`.  
  - Configuration: `data/config/startBlocks.json`, optional `data/config/pools.allowlist.json`.  
  - Progress snapshots: `data/indexer.progress.json` (JSON with phase, stream, window).
- **Config files:**  
  - `config/pricing.json` — canonical pricing config used by `/pricing`, hero, and billing UI (SSoT for all pricing).  
  - `src/lib/billing/pricing.ts` — pricing calculation helpers and plan configuration (references `config/pricing.json`).  
- **Resilience:** confirmation depth=2, reorg trim via checkpoints, autoslow with exponential backoff + jitter on 429, concurrency downshifts on repeated failures.

---

## 3. Database Schema Summary

**GECOVERED:** ✅ Core tables and relationships fully implemented.

- **Core tables:**  
  - `PoolEvent (id=txHash:logIndex)` — rows for `PoolCreated`, pool Swap/Mint/Burn/Collect. Columns: `pool`, `timestamp`, `eventName`, `sender`, `owner`, `recipient`, `tickLower`, `tickUpper`, `amount`, `amount0`, `amount1`, `sqrtPriceX96`, `liquidity`, `tick`.  
  - `PositionEvent` — Mint/Increase/Decrease/Collect (per tokenId & pool).  
  - `PositionTransfer` — ERC721 transfers across owners.  
  - `SyncCheckpoint` — per-stream progress (keys: `NPM:global`, `FACTORY:enosys|sparkdex`, `POOLS:all`, etc).  
  - `PoolState` — **Current on-chain reserves SSoT** (per pool). Stores `reserve0_raw`/`reserve1_raw` from direct token balance reads (not event reconstruction), `dex` tag (`enosys-v3`/`sparkdex-v3`), `last_block_number`, `updated_at`. Populated via `scripts/backfill-pool-state.ts` and kept in sync by indexer follower. Used by `mv_pool_reserves_now` for Universe TVL aggregation. **(INDEXER-POOLSTATE)**  
  - `analytics_market`, `analytics_position`, `analytics_position_snapshot`, `metrics_daily_*` — derived KPI tables for TVL, APY, wallet adoption.  
  - `PoolIncentiveSnapshot` — current incentive rates per pool (rFLR, APS, etc.).  
  - Supporting tables: `PoolStateSnapshot`, `PositionSnapshot`, `User`, `Wallet`.
- **Relationships:**  
  - Factory events discover pools (`PoolCreated` → `PoolEvent.pool`).  
  - NFPM events produce `PositionEvent` + `PositionTransfer` (linked via tokenId).  
  - Pool-contract events feed `PoolEvent` for Swap/Mint/Burn/Collect analytics.  
  - Checkpoints enforce idempotent ingestion; `eventsCount` updated per batch.
- **Conventions:**  
  - Address storage: lower-case hex.  
  - Monetary columns stored as stringified integers (wei) in raw tables; analytics layer casts to numeric.  
  - BigInt-likes stored as strings to avoid JS precision loss.

<!-- DELTA 2025-11-16 START -->

### 3.1 New Tables (MVP + Compliance)

- **`UserSettings(wallet PK, email, email_verified, notifications JSONB, created_at, updated_at)`** — User preferences for GDPR compliance. **(SP3-D10)**
- **`AlertConfig(id, wallet, position_id, type, enabled, created_at)`** — Alert configuration per position. **(SP6-D11)**
- **`AlertLog(id, alert_id, triggered_at, code, meta JSONB)`** — **Nice to have** — Alert trigger history.
- **`AuditLog(id, ts, actor, action, target, meta JSONB)`** — GDPR/ops audit trail. **(SP3-D12)**

### 3.2 New Materialized Views (MVP)

- **`mv_wallet_portfolio_latest(wallet_address, tvl_total_usd, positions_active, fees24h_usd, ts)`** — Wallet-level portfolio snapshot. **(SP2-D01)**
- **`mv_position_overview_latest(position_id, wallet_address, pool_id, tvl_usd_current, unclaimed_fees_usd, apr_7d, range_min, range_max, current_price, strategy_code, spread_pct, band_color, position_ratio, unclaimed_fees_pct_of_tvl, claim_signal_state, ts)`** — Position-level analytics with RangeBand™ status. **(SP2-D02)**
- **`mv_position_day_stats(position_id, date, price_open, price_close, range_lower_price, range_upper_price, tvl_usd_avg, fees_usd_earned, fees_usd_claimed, time_in_range_pct)`** — Daily position performance. **(SP2-D03)**
- **`mv_position_events_recent(position_id, ts, event_type, token0_delta, token1_delta, fees_usd, incentives_usd, tx_hash)`** — Recent position events (7d window). **(SP2-D04)**
- **`mv_position_lifetime_v1(token_id, pool_address, nfpm_address, dex, first_event_ts, last_event_ts, event_count, last_known_owner)`** — Lifetime v3 LP positions (Enosys + SparkDEX v3 on Flare), one row per tokenId. Used for W3 Cross-DEX coverage comparison (74,857 positions; 8,594 wallets). Verifier: `npm run verify:data:lifetime-vs-w3`. **(SP2-D11)**
- **`mv_pool_reserves_now(pool_address, dex, token0_address, token1_address, reserve0_raw, reserve1_raw, last_block_number, updated_at)`** — Current on-chain reserves per pool (SSoT for Pool Universe TVL). Exposes `PoolState` data for analytics consumption. PoolState is populated via on-chain reads (not event reconstruction), ensuring accurate "current reserves" even if events are missing. Used by analytics repo for Universe Total TVL aggregation. MV uses PoolState DB column names (pool_address, token0_address, reserve0_raw, ...) instead of Prisma field names. **(INDEXER-POOLSTATE)**

- **PoolUniversePage guardrails:** Pool Universe React page must never return `null`; empty/error/warming states must render `DataStateBanner`/placeholder so users never see only the background when data is missing or warming. **(SP2-FE-POOL-UNIVERSE)**
- **Providers import/export fixed:** `_app.tsx` and `src/providers.tsx` now use matching default export for `Providers`; `DataStateBanner` and `WarmingPlaceholder` export defaults to avoid `Element type is invalid` runtime errors. **(SP2-FE-POOL-UNIVERSE)**

### Universe Head — Metric Definitions (Pro View)

- **Total TVL**
  - Definition: Sum of **current liquidity across all pools for this pair** (Enosys, SparkDEX, future providers), in USD.
  - Semantics:
    - Per pool: use current token reserves from the PoolState SSoT (`mv_pool_reserves_now`); `TVL_pool = reserve0_now * price(token0) + reserve1_now * price(token1)`.
    - Pair TVL: `Total TVL = Σ TVL_pool` over all pools for the pair.
    - Snapshot (“now in the pool”), not PositionEvent flow aggregates.
  - UX: Head shows USD value + % change vs previous period (24H/7D/30D/90D). “Across N pools on Enosys + SparkDEX” is short text/tooltip; no separate tile.

- **Accrued Fees (window)**
  - Definition: LP-relevant swap fees generated across all pools for this pair in the selected window (24H/7D/30D/90D), in USD.
  - Semantics: Use fee MVs (e.g., `mv_pool_fees_24h`, `mv_pool_fees_7d`), convert to USD per pool, sum across pair. Market-level; per-LP collected/uncollected is account/position scope.
  - UX: Tile shows USD amount + % change vs previous period for the same window. Subtitle detail lives in a tooltip.

- **Incentives (window)**
  - Definition: DEX/protocol rewards (e.g., rFLR/FLR/APS) accruing to LPs in this pair for the selected window, in USD.
  - Semantics: Sum all configured incentive streams for the pair’s pools over the window; convert rewards to USD.
  - UX: Tile shows USD amount + % change vs previous period. A separate “Incentives breakdown” section (below head) covers split by DEX/token; head stays minimal with tooltips.

- **Active Positions**
  - Definition: Count of active v3 LP positions (NFTs) across all pools for this pair.
  - Semantics: From lifetime position SSoT (e.g., `mv_position_lifetime_v1` or derived active MV); count distinct (tokenId, nfpmAddress) with current liquidity > 0 / not closed in any pool of the pair.
  - UX: Tile shows count + % change vs previous period; “active” aligned with Active LP Wallets definition.

- **Active LP Wallets**
  - Definition: Distinct wallets that **currently hold at least one active LP position** in this pair.
  - Semantics: From same SSoT, restrict to active positions in any pool of the pair; `COUNT(DISTINCT last_known_owner)`.
  - UX: Tile shows count + % change vs previous period; tooltip clarifies it’s a snapshot of wallets with exposure now (not “wallets with events in last 7d”).

- **APR (Base vs Total)**
  - Definition: Illustrative yield based on selected window and current TVL.
  - Semantics:
    - Base APR (fees-only): e.g., 7D → `(fees7dUsd * 365 / 7) / tvlUsd`; 24H → `(fees24hUsd * 365) / tvlUsd`; others analogous.
    - Total APR (fees + incentives): `(fees_windowUsd + incentives_windowUsd)` annualised / tvlUsd.
    - APR is illustrative, not a guaranteed APY.
  - UX: Tile shows one main APR (Total APR: fees+incentives) with a subline for Base APR. Badge reflects APR change vs previous period for the same window. Updates when the head period toggle changes.

- **Period toggle (24H/7D/30D/90D)**
  - Single central toggle drives: Accrued Fees, Incentives, APR calculations, and all “change vs previous period” badges.
  - Tile subtitles stay minimal; full definitions live in tooltips on info icons to keep the head visually quiet.

**Indices:** `(wallet_address)` and `(position_id,date)`; refresh ≤60s/MV.  
**Verifiers:** `npm run verify:mv` checks row counts and column names.  
**Refresh Automation:** Railway Cron Job configured to refresh all MVs every 10 minutes via `/api/enrich/refresh-views` endpoint. Cron job service linked to Liquilab-staging web service with `CRON_SECRET` authentication. See `docs/RAILWAY_CRON_MV_REFRESH.md` for setup details.

<!-- DELTA 2025-11-16 END -->

---

## Changelog — 2025-12-12 (PHASE2-WALLET-PRO-UI-PORT)
- **PHASE2-WALLET-PRO-UI-PORT:** Ported Wallet Pro "My Positions" page to match figma/src/pages/WalletOverviewPro.tsx pixel-perfect layout. Updated tabs with gradient underline (from-[#3B82F6] to-[#1BE8D2]), added List/Grid toggle buttons matching Figma, refactored table structure to match PoolTableRow exactly (grid-cols-[2fr_1fr_1fr_1fr_1fr], exact spacing/padding). RangeBandPositionBar updated to match Figma "list" variant (centered line with width based on strategy %, dot marker, min/max prices under ends, current price centered). Table rows use positionKey for keys to prevent cross-DEX collisions. No data pipeline changes; UI-only port. Verified npm run build passes; PRO wallet shows positions with correct layout; PREMIUM gating unchanged.
- **Files Modified:** `src/components/wallet/WalletProPage.tsx` (UI layout port), `src/components/wallet/RangeBandPositionBar.tsx` (Figma list variant), `PROJECT_STATE.md` (this entry).

## Changelog — 2025-12-12 (WALLET-PRO-RUNTIME-FIX)
- **WALLET-PRO-RUNTIME-FIX:** Fixed WalletProPage render crash caused by invalid toPrecision() arguments. Added safePrecision() helper that normalizes/clamps decimals to [1,100] range, handles null/undefined/NaN inputs. Updated formatTokenAmount to return "0" for zero values (not "—") and safely handle all edge cases. UI-only runtime stability patch; no data/pricing changes.
- **Files Modified:** `src/components/wallet/WalletProPage.tsx` (safePrecision helper + formatTokenAmount fix), `RUN_LOG.md` (this entry).

## Changelog — 2025-12-12 (PHASE3.1-WALLET-PRO-USD-CORRECTNESS)
- **PHASE3.1-WALLET-PRO-USD-CORRECTNESS:** Fixed USD conversion correctness: never use missing prices as 0; TVL/fees return null (not wrong numbers) when pricing uncertain; added pool-implied pricing fallback when paired with confident-price token (registry/coingecko/stablecoin/defillama); added pricingSource tracking per token; added debug mode (?debug=1) with per-position breakdown fields; added aggregate counters (missing_price_token_count, positions_with_null_tvlUsd_count, positions_with_null_feesUsd_count, pool_implied_price_used_count). No UI changes.
- **Files Modified:** `pages/api/positions.ts` (USD conversion rules + pool-implied fallback + debug mode), `src/lib/pricing/prices.ts` (pricingSource tracking).

## Changelog — 2025-12-12 (PH3.x-PRICING-HINTS)
- Introduced `src/lib/pricing/hints.ts` for priority token metadata (symbol, CoinGecko/DefiLlama IDs, stable overrides) and wired the pricing pipeline to consult these hints before existing CoinGecko/DefiLlama/Ankr fallbacks, adding per-source logging and preserving cache TTL. This reduces “missing price” counts for wallet TVL/fees without touching UI.
- **Files Modified:** `src/lib/pricing/hints.ts`, `src/lib/pricing/prices.ts`, `RUN_LOG.md`.

## Changelog — 2025-12-12 (PHASE3.2c-VALUATION)
- Added per-position valuationMode (stable_pair_spot_truth, registry_fallback, external_price, unpriced_null), valuation notes, and effective USD prices with debug logging so Wallet API can surface how TVL/fees were priced; implemented stable-pair spot truth for USDT0 pools (WFLR/USDT0 #28134 now within ±0.05% of Enosys reference). Logs aggregate valuation counts while debug=1 prints per-position breakdowns.
- **Files Modified:** `pages/api/positions.ts`, `src/lib/positions/types.ts`, `src/lib/pricing/prices.ts`, `RUN_LOG.md`.

## Changelog — 2025-12-12 (PHASE3-WALLET-PRO-DATA)
- **PHASE3-WALLET-PRO-DATA:** Data-only hardening for Wallet Pro positions. Added per-DEX counters/logs (mapped/partial/failed, fees/incentives/range stats); TVL/fees now compute with slot0 + feeGrowth deltas per position; incentives tracked per DEX with explicit null warnings; rangeband inversion guard and warnings; pricing pipeline now uses registry hard prices + stablecoins + CoinGecko/Ankr/DefiLlama with cache hit logs and missing-price warnings. No UI changes.
- **Files Modified:** `pages/api/positions.ts` (data robustness/logging), `src/lib/pricing/prices.ts` (registry + cache logging).

## Changelog — 2025-12-12 (CLEANUP-BRAND-REDIRECT)
- Added temporary `/brand -> /` redirect via `pages/brand.tsx` (GSSP) to preserve legacy backlinks while the cleanup plan proceeds. No UI components touched.

## Changelog — 2025-12-12 (CLEANUP-PRICING-LAB-REDIRECT)
- Added temporary `/pricing-lab -> /pricing` redirect via `pages/pricing-lab.tsx` to keep legacy bookmarks alive while the cleanup plan proceeds. No UI components touched.

## Changelog — 2025-12-12 (CLEANUP-PORTFOLIO-NAV)
- **Files Modified:** `src/components/Navigation.tsx`
- Topnav “Portfolio” routes to `/wallet` to respect gated wallet experience; verified via `npm run verify`, `npm run build`, and manual nav click.

## Changelog — 2025-12-12 (CLEANUP-PORTFOLIO-REDIRECT)
- **Files Modified:** `pages/portfolio.tsx`
- Temporary `/portfolio -> /wallet` redirect (GSSP) preserves bookmarks/backlinks while the wallet experience remains gated; verified via `npm run verify`, `npm run build`, and manual curl (307 → /wallet).

## Changelog — 2025-12-12 (CLEANUP-FASTFORWARD-REDIRECT)
- **Files Modified:** `pages/fastforward/success.tsx`
- Temporary `/fastforward/success -> /fastforward/pay?status=success` redirect (GSSP) preserves legacy links while consolidating the flow; verified via `npm run verify`, `npm run build`, and manual curl (307 → /fastforward/pay?status=success).

## Changelog — 2025-12-12 (CLEANUP-SALES-REDIRECT)
- **Files Modified:** `pages/sales/index.tsx`
- Temporary `/sales -> /sales/offer` redirect (GSSP) keeps legacy entrypoints alive while funnel is consolidated; verified via `npm run verify`, `npm run build`, and manual curl (307 → /sales/offer).

## Changelog — 2025-12-12 (CLEANUP-LOGIN-REDIRECT)
- **Files Modified:** `pages/login.tsx`
- Temporary `/login -> /connect` redirect (GSSP) keeps wallet-first onboarding consistent; verified via `npm run verify`, `npm run build`, and manual curl (307 → /connect).

## Changelog — 2025-12-12 (CLEANUP-DASHBOARD-REDIRECT)
- **Files Modified:** `pages/dashboard.tsx`
- Temporary `/dashboard -> /` redirect (GSSP) keeps the MVP funnel lean by routing visitors to the homepage overview; verified via `npm run verify`, `npm run build`, and manual curl (307 → /).

## Changelog — 2025-12-12 (CLEANUP-DEMO-REDIRECT)
- **Files Modified:** `pages/demo.tsx`
- Temporary `/demo -> /` redirect (GSSP) keeps the funnel lean while preserving old bookmarks; verified via `npm run verify`, `npm run build`, and manual curl (307 → /).

## Changelog — 2025-12-12 (CLEANUP-KOEN-PAGE-REMOVAL)
- **Files Modified:** `pages/koen.tsx`
- Removed the legacy `/koen` page as part of cleanup (content now consolidated elsewhere).

## Changelog — 2025-12-12 (CLEANUP-KOEN-MIDDLEWARE-REDIRECT)
- **Files Modified:** `middleware.ts`
- Added middleware rule to redirect `/koen` to `/` (temporary) so old bookmarks keep working; verified via `npm run verify`, `npm run build`, and manual curl (307 → /).

## Changelog — 2025-12-12 (CLEANUP-SUMMARY-PAGE-REMOVAL)
- **Files Modified:** `pages/summary.tsx`
- Removed the legacy `/summary` page as part of the cleanup consolidation effort.

## Changelog — 2025-12-12 (CLEANUP-SUMMARY-MIDDLEWARE-REDIRECT)
- **Files Modified:** `middleware.ts`
- Added middleware rule to redirect `/summary` to `/` (temporary) to preserve old bookmarks; verified via `npm run verify`, `npm run build`, and manual curl (307 → /).

## Changelog — 2025-12-11 (SP3-WALLET-PRO My Positions Design Align)
- **SP3-WALLET-PRO-MY-POSITIONS:** Aligned Wallet Pro "My Positions" view with Figma Portfolio Pro design. Changed page title to "Portfolio Pro" with "Pro" badge. Added tab navigation: "My Positions" (active) and "Performance & Analytics (Pro)" (inactive placeholder). Implemented sort bar above table with Select dropdown (Health Status, TVL, APR, Unclaimed Fees). Refactored positions table to match Figma structure: grid layout with columns (Pool specifications, TVL, Unclaimed fees, Incentives, APR), RangeBand visual per row styled as horizontal line with end ticks and current-price marker, "View Pool Universe →" link per row routing to correct pool address/slug. Removed water-wave background overlay for wallet content (changed pages/wallet/index.tsx to use clean dark background #0B1221 instead of WaveBackground). All table rows derived from live usePositions data via getWalletPortfolioAnalytics; no static demo pools. RangeBandPositionBar updated to match Figma styling (centered band, end ticks, current-price dot with glow animation for in-range). Sort functionality implemented (health status priority, TVL/APR/fees descending). Empty state shows "No Active Positions" with CTA to explore Pool Universe. Build passes successfully.
- **Files Modified:** `src/components/wallet/WalletProPage.tsx` (complete refactor), `src/components/wallet/RangeBandPositionBar.tsx` (styling update), `pages/wallet/index.tsx` (background change), `PROJECT_STATE.md` (this entry).

## Changelog — 2025-12-11T14:00 CET
- SP2-FE-POOL-UNIVERSE: Rebuilt Pool Universe frontend for /pool/[tokenId] to match SP2 Universe specification. Implemented complete Rustig layout with: (1) Universe head with 6 KPI tiles (TVL, Fees 24h/7d, Incentives 7d, Positions, Wallets, APR) + time-range toggle (24h/7d/30d/90d), (2) Liquidity Venues table (DEX, Fee Tier, TVL, Fees, Incentives, APR, Positions, Wallets), (3) LP Population section (positions/wallets counts, positions-per-wallet ratio, DEX distribution), (4) RangeBand™ Yield & Efficiency section (total APR, yield composition band), (5) Wallet Flows & Notable Moves section (placeholder for future flows data), (6) Pool Intel — Web Signals section (wired to PoolIntelCard), (7) Context Card with smart-static insights (Market Structure, Yield Drivers, Participant Behavior). All sections handle loading/empty/degrade states gracefully. Universe head APR calculation: 24h→365×, 7d→52× (30d/90d use 7d proxy). Components use real analytics data from /api/analytics/pool/[id] SSoT. Updated src/lib/analytics/db.ts to include fees24hUsd and incentives7dUsd in segments. Route supports both pool addresses and pair slugs (e.g., /pool/stxrp-fxrp). All 7 golden pools verified to render without React errors.

---

Zet bijvoorbeeld deze TODO-sectie in je PROJECT_STATE.md:

### TODO — Ecosystem intel (Enosys & SparkDEX Telegram)

Doel  
Integreren van live community context door een simpele Telegram-integratie (of mock) die de laatste officiële aankondigingen ophaalt voor de pool card.

Technische richting  
- Gebruik de `WebSearch` tool of een eenvoudige scraping-API (server-side, cached) om de laatste 1-2 berichten uit publieke kanalen te halen.
- Fallback naar een statische "ecosystem update" lijst (JSON in repo) die we handmatig of via cron updaten.
- Presenteren in de "Pool Intel" kaart als "Latest Signal".

Status  
[ ] Concept uitwerken in SP3.  
[ ] API-route `/api/intel/telegram` opzetten.  
[ ] Frontend component `TelegramSignalWidget`.

---

[End of State]
