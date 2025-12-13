# PROJECT_STATE · LiquiLab Indexer & API (Concise)

> Living document for the LiquiLab Flare V3 indexer stack.  
> Last updated: 2025-11-10 20:00 CET. Target size ≤ 25 KB; archived snapshots live under `docs/ops/STATE_ARCHIVE/`.

---

## 1. Indexer Overview
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

---

## 2. Key Components
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
- **Resilience:** confirmation depth=2, reorg trim via checkpoints, autoslow with exponential backoff + jitter on 429, concurrency downshifts on repeated failures.

---

## 3. Database Schema Summary
- **Core tables:**  
  - `PoolEvent (id=txHash:logIndex)` — rows for `PoolCreated`, pool Swap/Mint/Burn/Collect. Columns: `pool`, `timestamp`, `eventName`, `sender`, `owner`, `recipient`, `tickLower`, `tickUpper`, `amount`, `amount0`, `amount1`, `sqrtPriceX96`, `liquidity`, `tick`.  
  - `PositionEvent` — Mint/Increase/Decrease/Collect (per tokenId & pool).  
  - `PositionTransfer` — ERC721 transfers across owners.  
  - `SyncCheckpoint` — per-stream progress (keys: `NPM:global`, `FACTORY:enosys|sparkdex`, `POOLS:all`, etc).  
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

---

## Changelog — 2025-12-12 (PHASE2-WALLET-PRO-UI-PORT)
- **PHASE2-WALLET-PRO-UI-PORT:** Ported Wallet Pro "My Positions" page to match figma/src/pages/WalletOverviewPro.tsx pixel-perfect layout. Updated tabs with gradient underline (from-[#3B82F6] to-[#1BE8D2]), added List/Grid toggle buttons matching Figma, refactored table structure to match PoolTableRow exactly (grid-cols-[2fr_1fr_1fr_1fr_1fr], exact spacing/padding). RangeBandPositionBar updated to match Figma "list" variant (centered line with width based on strategy %, dot marker, min/max prices under ends, current price centered). Table rows use positionKey for keys to prevent cross-DEX collisions. No data pipeline changes; UI-only port. Verified npm run build passes; PRO wallet shows positions with correct layout; PREMIUM gating unchanged.
- **Files Modified:** `src/components/wallet/WalletProPage.tsx` (UI layout port), `src/components/wallet/RangeBandPositionBar.tsx` (Figma list variant), `PROJECT_STATE.md` (this entry).

## Changelog — 2025-12-12 (PHASE3-WALLET-PRO-DATA)
- **PHASE3-WALLET-PRO-DATA:** Data-only hardening for Wallet Pro positions. Added per-DEX counters/logs (mapped/partial/failed, fees/incentives/range stats); TVL/fees now compute with slot0 + feeGrowth deltas per position; incentives tracked per DEX with explicit null warnings; rangeband inversion guard and warnings; pricing pipeline now uses registry hard prices + stablecoins + CoinGecko/Ankr/DefiLlama with cache hit logs and missing-price warnings. No UI changes.
- **Files Modified:** `pages/api/positions.ts` (data robustness/logging), `src/lib/pricing/prices.ts` (registry + cache logging).

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
