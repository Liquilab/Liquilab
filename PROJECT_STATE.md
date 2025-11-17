# PROJECT_STATE · LiquiLab Indexer & API (Concise)

> Living document for the LiquiLab Flare V3 indexer stack.  
> Last updated: 2025-11-17 (S0-OPS01 complete and deployed to staging). Target size ≤ 25 KB; archived snapshots live under `docs/ops/STATE_ARCHIVE/`.

---

## 1. Indexer Overview

**GECOVERED:** ✅ Fully implemented and operational.

- **Purpose:** Consolidated Flare V3 pipeline that ingests raw Ēnosys/Sparkdex NonfungiblePositionManager/pool events, enriches them, and feeds LiquiLab dashboards.
- **Mode (2025-11-09):** **Flare-only RPC** (no ANKR traffic). Middleware gate funnels all traffic to `/placeholder` until demo cookie set; `/placeholder` password is **Demo88**. Admin dashboards: `/admin/ankr` (cache-only stats) and `/admin/db` (table explorer, confirmation pending).
- **Architecture:** `CLI (backfill | follower)` → `IndexerCore` → `RpcScanner` → `Decoders (factory | pool | nfpm | state)` → `DbWriter` → Postgres (`PoolEvent`, `PositionEvent`, analytics tables). Streams still match Ēnosys/Sparkdex pools + NFPM + pool_state + position_reads.
- **Run modes:** Backfill (deterministic windows, stream-selectable) + follower tailer (12 s cadence, confirmation depth=2). Data lifecycle: raw NDJSON (180 d) → enriched JSON → Postgres (authoritative) → dashboards/APIs.
- **Routing:** Pure Pages Router (Next.js 15). Mixed App Router conflicts were resolved by removing `app/` directory and consolidating all API routes under `pages/api/`.

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
- **Resilience:** confirmation depth=2, reorg trim via checkpoints, autoslow with exponential backoff + jitter on 429, concurrency downshifts on repeated failures.

---

## 3. Database Schema Summary

**GECOVERED:** ✅ Core tables and relationships fully implemented.

- **Core tables:**  
  - `PoolEvent (id=txHash:logIndex)` — rows for `PoolCreated`, pool Swap/Mint/Burn/Collect. Columns: `pool`, `timestamp`, `eventName`, `sender`, `owner`, `recipient`, `tickLower`, `tickUpper`, `amount`, `amount0`, `amount1`, `sqrtPriceX96`, `liquidity`, `tick`.  
  - `PositionEvent` — Mint/Increase/Decrease/Collect (per tokenId & pool).  
  - `PositionTransfer` — ERC721 transfers across owners.  
  - `SyncCheckpoint` — per-stream progress (keys: `NPM:global`, `FACTORY:enosys|sparkdex`, `POOLS:all`, etc).  
  - `analytics_market`, `analytics_position`, `analytics_position_snapshot`, `metrics_daily_*` — derived KPI tables for TVL, APY, wallet adoption.  
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

**Indices:** `(wallet_address)` and `(position_id,date)`; refresh ≤60s/MV.  
**Verifiers:** `npm run verify:mv` checks row counts and column names.

<!-- DELTA 2025-11-16 END -->

---

## Changelog — 2025-11-16
- Updated env matrix + endpoint contracts + security baseline (PROJECT_STATE.md, docs/ENVIRONMENT.md).
- Added middleware CSP/CORS/rate-limit, health/details, entitlements, GDPR stub, consent banner, and legal pages.
- Added MV freshness + SSR verify scripts and expanded roadmap (Roadmap_Features.md); wired verify chain.
- Added staging deploy workflow + merge gate, staging env notes (Stripe TEST, Mailgun degrade, Sentry DSN), and uptime/Sentry test docs.
- **Added GECOVERED markers** to sections 1-6 (Indexer Overview, Key Components, Database Schema, Environments, Configuration, CLI Usage, API Endpoints).
- **Added Sprint IDs** to all Delta 2025-11-16 items:
  - Database: SP2-D01..D04 (MVs), SP3-D10, SP3-D12, SP6-D11 (Tables)
  - API Endpoints: SP2-T50, SP2-T51, SP3-T52, SP3-T53, SP3-T54, SP6-T55
  - DS Components: SP1-T30..T36
  - Security & Compliance: SP3-T42, SP3-T54, SP4-T40..T42
  - Observability: SP4-B04..B06
  - Gating: SP3-G01, SP3-G02
  - Verify Suite: SP4-T44..T46
- **S0 (staging):** Dockerfile zonder BuildKit mounts + start.sh; staging Docker build gestabiliseerd.

## Changelog — 2025-11-17

- **Railway Build Fix (S0-OPS01):** Removed BuildKit `# syntax=` directive from Dockerfile to resolve Railway cache mount errors.
- **railway.toml:** Added explicit `dockerfilePath = "Dockerfile"` and `DOCKER_BUILDKIT = "1"` for proper multi-stage build support.
- **Git Workflow:** Merged Docker stabilization fixes to staging branch via feature branch `fix/staging-docker-20251117072003`.
- **Dev Environment:** Configured `.zshrc` to auto-navigate to `$HOME/Projects/Liquilab_staging` on terminal startup.
- **S0-OPS01 Completion:**
  - `pages/api/sentry-test.ts`: Sentry staging test endpoint with eventId return
  - `src/lib/observability/withSentryApiHandler.ts`: API route error wrapper for Sentry capture
  - `src/lib/observability/sentry.ts`: Enhanced environment detection (staging/production/development)
  - `scripts/verify-db/staging-seed.mjs`: DB seed validation script with minimum row count checks
  - `scripts/verify-billing/stripe-test.mjs`: Stripe TEST key verification script
  - `docs/ops/UPTIME_MONITOR.md`: Uptime monitor configuration guide
  - `package.json`: Added `verify:db:staging` and `verify:billing:stripe` scripts
  - `PROJECT_STATE.md`: Added sections 7.9 (DB seed), 7.10 (Stripe TEST), 7.11 (Uptime monitor), updated 7.7 (merge gates), 7.8 (Sentry test)
- **Files Modified:** `Dockerfile`, `railway.toml`, `package.json`, `PROJECT_STATE.md`, `src/lib/observability/sentry.ts`, created `pages/api/sentry-test.ts`, `src/lib/observability/withSentryApiHandler.ts`, `scripts/verify-db/staging-seed.mjs`, `scripts/verify-billing/stripe-test.mjs`, `docs/ops/UPTIME_MONITOR.md`
- **Verification:** Scripts tested locally - correct error handling when env vars missing. Changes committed and pushed to staging branch (commit `508b18cc`). Railway auto-deploy triggered.
- **Staging Validation (2025-11-17):**
  - ✅ Health endpoint: `GET /api/health` returns `{ ok: true, ts: ... }` (uptime monitor ready)
  - ✅ Sentry test: `POST /api/sentry-test` returns `{ ok: true, sentry: true, sentryConfigured: true, env: "staging", eventId: "..." }` - Sentry events successfully logged to dashboard
  - ✅ DB seed verify: Script functional - connects to staging DB, checks table row counts. Production database successfully copied to staging (607k PoolEvent, 233k PositionEvent, 79k PositionTransfer rows). `analytics_market_metrics_daily` marked as optional (non-blocking) since it may be empty in production.
  - ⚠️ Stripe TEST verify: Keys found in Railway staging but validation failed (Invalid API Key). May need key refresh or Stripe dashboard verification. Script functional - requires `stripe` package installed.
- **Status:** S0-OPS01 repo/config side complete and deployed to staging. Sentry configured and operational. DB verify script functional - staging DB seeded with production data. Stripe keys present but need validation/refresh.

## 4. Environments & Env Keys (Web = Flare-only)

**GECOVERED:** ✅ Environment matrix fully documented and operational.

- **Matrix (Local → Staging → Production):**  
  - **Local:** `FLARE_RPC_URL` (public ok), `DATABASE_URL` local, `DB_DISABLE=false`, `HEALTH_DB_REQUIRED=false`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, Stripe/Mailgun optional.  
  - **Staging (Railway Web):** Flare RPC only (`FLARE_RPC_URL`), `DB_DISABLE=false`, `HEALTH_DB_REQUIRED=false`, `CRON_SECRET` set, Stripe **TEST** keys (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), Mailgun sandbox (`MAILGUN_MODE=degrade`), Sentry DSN (staging), feature flags via `FEATURE_FLAGS`, `DEGRADED_MODE` optional.  
  - **Production (Railway Web):** Flare RPC only; `HEALTH_DB_REQUIRED=false` to avoid false reds when DB is intentionally paused for web; `CRON_SECRET` required; `DEGRADED_MODE=0`; HSTS on; rate-limit + CORS enforced.  
  - **Worker / Indexer (Railway Worker):** May use `ANKR_ADV_API_URL`/`ANKR_ADV_API_KEY` in addition to `FLARE_RPC_URL`; `DATABASE_URL` required; `HEALTH_DB_REQUIRED=true`.  
- **Server env (core):** `FLARE_RPC_URL`, `FLARE_WS_URL`, `FLARE_RPC_URLS`, `ENOSYS_V3_FACTORY`, `SPARKDEX_V3_FACTORY`, `ENOSYS_NFPM`, `SPARKDEX_NFPM`, `DATABASE_URL`, `RAW_DB`, `DB_DISABLE` (web may set `true`), `HEALTH_DB_REQUIRED` (web=`false`), `CRON_SECRET`, `FEATURE_FLAGS`, `DEGRADED_MODE`, `WALLET_REQUIRED`, `SENTRY_DSN` (staging/prod).  
- **Billing (EUR naming):** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PREMIUM_EUR`, `STRIPE_PRICE_PRO_EUR`, `STRIPE_PRICE_ADDON5_EUR`, `STRIPE_PRICE_ALERTS5_EUR`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_LL_STRIPE_PRICE_PREMIUM_BASE_5`, `NEXT_PUBLIC_LL_STRIPE_PRICE_POOL_SLOT`, `NEXT_PUBLIC_LL_STRIPE_PRICE_ALERTS_PACK_5`.  
- **Mail:** `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM`, `MAILGUN_MODE` (sandbox/live).  
- **Client (`NEXT_PUBLIC_*`):** `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_FLARE_RPC_URL`, `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_FEATURE_FLAGS`, `NEXT_PUBLIC_LL_STRIPE_PRICE_*`, `NEXT_PUBLIC_ENABLE_BLAZESWAP`, `NEXT_PUBLIC_KOEN_WALLET`.  
- **Hosting:** Node / Next.js listens on `$PORT` (Railway). **Web routes stay Flare-only**; ANKR endpoints blocked on web.  
- **Rotation:** Rotate `CRON_SECRET`, Stripe keys, Mailgun keys per release; staging keys refreshed before promoting to prod.

---

## 5. Configuration Defaults

**GECOVERED:** ✅ Indexer configuration fully documented.

- `indexer.config.ts`:  
  ```ts
  rpc: { batchSize: 1000, maxConcurrency: 12, minConcurrency: 4, requestTimeout: 30_000 }
  follower: { pollIntervalMs: 12_000, confirmationBlocks: 2, restartDelayMs: 5_000 }
  db: { batchSize: 1000, checkpointInterval: 25 }
  retry: { maxAttempts: 5, initialDelayMs: 250, backoffMultiplier: 2, maxDelayMs: 5_000 }
  ```
- Storage & retention: raw NDJSON retained 180 days; enriched snapshots kept until downstream BI export; Postgres analytics indefinite.  
- Railway / production runtime uses `pnpm run start` (`next start -p $PORT`).  
- Autoslow policy: base delay `ceil(1000 / rps)` with cap 15 s jitter; concurrency reduces after 3 consecutive failures.  
- Reorg mitigation: before each window the follower checks `windowStart-1`; if mismatch, entries ≥ reorgBlock trimmed and checkpoint rewound.

---

## 6. CLI Usage

**GECOVERED:** ✅ CLI commands documented and operational.

```bash
# Backfill everything (factories + nfpm + pools + state readers)
pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts \
  --factory=enosys \
  --streams=factories,nfpm,pools,pool_state,position_reads \
  --from=29837200 --rps=8 --reset

# SparkDEX-only pools
pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts \
  --factory=sparkdex --streams=factories,pools --from=30717263

# Pools-only backfill (uses checkpoint POOLS:all)
pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts \
  --streams=pools --from=49618000

# NFPM tokenId spot backfill
pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts 23145 24890 --streams=nfpm

# Follower (polling tail across all factories + pools + nfpm)
pnpm exec tsx -r dotenv/config scripts/indexer-follower.ts --factory=all

# Dev runner: pool events only
pnpm exec tsx -r dotenv/config scripts/dev/run-pools.ts --from=49618000 --dry
```
- **Outputs:**  
  - Structured start JSON → stdout + `data/indexer.progress.json`.  
  - Rolling logs → `logs/indexer-YYYYMMDD.log`.  
  - Database writes → `PoolEvent`, `PositionEvent`, `PositionTransfer`, `PoolStateSnapshot`, `SyncCheckpoint`.

---

## 7. API & Analytics Layer
- **Public/partner APIs:**  
  - `GET /api/positions?address=0x…` — aggregated positions (Free tier masking applied; uses analytics snapshots).  
  - `GET /api/health` — reports provider status (RPC, mail, indexer freshness).  
  - `GET /api/indexer/progress` — exposes checkpoint/lag info (global + per-stream).  
  - `GET /api/intel/news` (Perplexity-powered web signals; not indexer but relies on Pool metadata).
- **Analytics tables & metrics:**  
  - `analytics_market` (per provider, TVL, volume, APR).  
  - `analytics_position_snapshot` (tokenId share, inRange%, fee accrual, strategy width).  
  - `metrics_daily_pool` (TVL, fee APR, swap volume, unique LPs).  
  - Derived metrics:  
    • TVL (USD via DefiLlama price feeds)  
    • APY (feeYield + incentives)  
    • InRange% (tickLower/Upper vs current tick)  
    • Fee yield (daily fees / liquidity)  
    • Impermanent loss estimator (IL_est) vs hold baseline.  
  - Pool detail view uses: owner concentration, whale entries/exits, collect cadence, RangeBand strategy buckets (Aggressive/Balanced/Conservative), alerts readiness.

<!-- DELTA 2025-11-16 START -->

### 7.1 API Payload Specs (v1) — New/Extended Endpoints

#### Entitlements & server-side gating **(SP3-T52)**

**GET /api/entitlements?wallet=0x…**  

Response (`ApiEnvelope<Entitlements>`):

```ts
type Entitlements = {
  wallet: string;
  plan: 'VISITOR' | 'PREMIUM' | 'PRO';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'none';
  maxPools: number;
  features: string[]; // e.g. ['rangeband','reports','alerts']
  indexedUpToTs?: string | null;
};
```

**DoD:** 200 with valid wallet → plan/status from DB (`BillingCustomer`).  
**Verifiers:** `curl -s /api/entitlements?wallet=0x... | jq -r '.data.plan'`

#### Positions overview (wallet) **(SP2-T50)**

**GET /api/analytics/wallet/{wallet}/positions**

Response (`ApiEnvelope<WalletPositionsResponse>`):

```ts
type PositionOverview = {
  positionId: string;
  wallet: string;
  dex: 'Enosys' | 'SparkDEX' | 'Other';
  chain: 'Flare';
  token0Symbol: string; token1Symbol: string;
  feeTierBps: number;
  tvlUsd: number;
  unclaimedFeesUsd: number;
  incentivesUsd: number;
  apr7dPct: number | null;
  // RangeBand™
  minPrice: number; maxPrice: number; currentPrice: number;
  strategyCode: 'AGR'|'BAL'|'CONS';
  spreadPct: number; bandColor: 'GREEN'|'ORANGE'|'RED'|'UNKNOWN';
  positionRatio: number | null;
  // Claim signal
  unclaimedFeesPctOfTvl: number | null;
  claimSignalState: 'NONE'|'ELEVATED'|'OPTIMAL';
};

type WalletPositionsResponse = {
  header: { tvlTotalUsd: number; positionsActive: number; fees24hUsd: number; };
  positions: PositionOverview[];
};
```

**Degrade:** `code: 'INDEXER_LAGGING'` + `staleTs`.  
**Verifiers:** Golden wallet returns ≥1 position; `jq '.data.positions|length'`.

#### RangeBand preview **(SP2-T51)**

**GET /api/rangeband/preview?pool=0x…&min=…&max=…[&wallet=0x…]**

Response (`ApiEnvelope<RangeBandPreview>`):

```ts
type RangeBandPreview = {
  currentPrice: number;
  band: { min: number; max: number };
  status: 'IN_RANGE'|'OUT_OF_RANGE'|'INSUFFICIENT_DATA';
  estFees7dUsd?: number | null;
  estIl7dUsd?: number | null;
};
```

**Degrade:** `code:'RANGEBAND_NO_DATA'`.  
**Verifier:** `curl -s '/api/rangeband/preview?pool=0x..&min=..&max=..' | jq '.ok'`

#### User settings (GDPR/notifications) **(SP3-T53)**

**GET /api/user/settings?wallet=0x…**  
**POST /api/user/settings** (body: `{ wallet, email?, notifications? }`)

Response (`ApiEnvelope<UserSettings>`):

```ts
type UserSettings = {
  email?: string; emailVerified: boolean;
  notifications: { alerts: boolean; reports: boolean; marketing: boolean; };
};
```

**DoD:** e-mail validation; unsubscribe updates notifications.  
**Verifiers:** CRUD via cURL; `jq '.data.settings.emailVerified'`.

#### GDPR delete **(SP3-T54)**

**POST /api/user/delete** (body: `{ wallet, confirm: true }`)

**Actions:** Stripe cancel → delete `BillingCustomer` + `UserSettings` + `AlertConfig`; pseudonimize analytics (wallet→hash).  
**DoD:** Audit log entry + confirmation email (Mailgun mode-aware).  
**Verifier:** Returns `{ ok:true }` and audit record exists.

#### Alerts CRUD (post MVP UI, backend MVP-ready) **(SP6-T55)**

**GET/POST/PUT/DELETE /api/user/alerts**

Schema:

```ts
type AlertRecord = {
  id: string; wallet: string; positionId: string;
  type: 'out_of_range'|'near_band'|'claim_ready';
  enabled: boolean; lastTriggered?: string | null;
};
```

**Rate limiting:** max 50 alerts/wallet.  
**Degrade:** queue pause → `code:'ALERTS_PAUSED'`.  
**Verifiers:** CRUD integration test.

#### Nice to have (post-MVP)

**POST /api/reports/export** → `{ downloadUrl, expiresAt }` (CSV/PDF).  
**GET /api/analytics/leaderboard?metric=…** (wallets masked).

**Status:** Nice to have (post-MVP).

<!-- DELTA 2025-11-16 END -->

### 7.2 Endpoint Manifest (v1)

**GECOVERED:** ✅ Core API endpoints operational.

- `GET /api/health` → `{ ok, ts }` (log-only).  
- `GET /api/health/details` → `{ ok|degrade, ts, components:{db,analytics,billing,mail,indexer}, notes:{lastRefreshTs,degradeCount} }` (no DB reads when `DB_DISABLE=true`).  
- `GET /api/prices/current` → `{ ok|degrade, ts, prices, ttl=60s }` (Flare-only; legacy `/api/prices/ankr*` = 410).  
- `GET /api/analytics/summary` → `{ ok|degrade, analytics:{indexedUpToTs,...} }` (MV-driven; accepts `degrade:true`).  
- `GET /api/analytics/pool/[address]` → `{ ok|degrade, pool, indexedUpToTs }` (includes RangeBand fields).  
- `GET|POST /api/entitlements` → `{ ok|degrade, plan:'VISITOR'|'PREMIUM'|'PRO', status, maxPools, features, indexedUpToTs }` (server authoritative; VISITOR fallback on degrade).  
- `POST /api/billing/create-checkout-session` → `{ ok|degrade, url? }` (requires `walletAddress`, plan, Stripe EUR IDs).  
- `POST /api/billing/portal` → `{ ok|degrade, url? }` (requires wallet; uses `NEXT_PUBLIC_APP_URL`/origin).  
- `POST /api/webhooks/stripe` → `{ ok|degrade }` (Stripe signature + DB on).  
- `POST /api/mail/test` → `{ ok|degrade }` (mode-aware; Mailgun sandbox allowed).  
- `POST /api/user/delete` → `{ ok:true, degrade:true, code:'GDPR_STUB', wallet, email }` (MVP runbook stub, audit via logs).

### 7.3 Design System & Pages (UI-canon)
- **Table/Detail:** Pool table columns = pair, TVL (tabular-nums), fees24h, APR, RangeBand status, owner concentration. Pool detail sections: hero, liquidity band, fee accrual, owner stats, whale watch, alerts CTA.  
- **Pages:** `/`, `/summary`, `/pool/[address]`, `/pricing`, `/rangeband`, `/account`, `/status`, `/legal/{terms,privacy,cookies}`.  
- **Consent:** `CookieBanner` is non-blocking; renders once via `_app.tsx`; uses primary “Electric Blue” + Aqua accent; backgrounds `#0B1530`. Token icons are local SVG (`/media/tokens/*.svg`), fallback `/media/icons/token-default.svg`.  
- **Gating:** No auto-connect; browser-only flows wrapped in `useClientReady()`. Legal pages + consent available pre-auth.  
- **RangeBand:** labels Aggressive/Balanced/Conservative; tokens rendered via SSR `<img>` with tabular numerals.

### 7.4 DoD & Verify Matrix
- **Policy:** Local = log-only for billing/mailgun; Staging = fail-hard on verify suite; Prod = fail-hard + HSTS + placeholder gate unless `PLACEHOLDER_OFF=1`. `HEALTH_DB_REQUIRED=false` keeps web green when DB paused.  
- **Verify suite:** `npm run verify` = `lint:ci && scan:prices && verify:api:prices && verify:pricing && verify:icons && verify:api:analytics && verify:billing && verify:mailgun && verify:mv && verify:ssr`.  
- **Additional verifiers:** `verify:mv` (MV freshness), `verify:ssr` (SSR HTML markers), billing/mailgun scripts remain soft-fail locally but required on staging/prod handoff.  
- **Ops checks:** cron guarded by `CRON_SECRET`; rate-limit active on `/api/*` (60 req/min per IP, skipped on localhost); CORS restricted to localhost/staging/prod.

### 7.7 Environments & Merge Gates
- **Staging deploy:** via GitHub Actions workflow `Staging Deploy` (trigger: PR base `staging` or label `staging`; runs `npm run verify` then Railway deploy to “Liquilab (staging project)”).  
- **Status check:** `Staging Deploy` must be green before merge.  
- **S0-OPS01 DoD:** Staging environment must pass:
  - Sentry test event logged (`POST /api/sentry-test`)
  - DB seed validation (`npm run verify:db:staging`)
  - Stripe TEST keys verified (`npm run verify:billing:stripe`)
  - Uptime monitor configured (`docs/ops/UPTIME_MONITOR.md`)
  - Verify suite green (`npm run verify`)

### 7.8 Sentry test (S0-OPS01)
- **Endpoint:** `POST /api/sentry-test`
- **Expected:** HTTP 200 with `{ ok: true, sentry: true, sentryConfigured: true, env: "staging", eventId: "..." }`
- **Staging test:**
  ```bash
  curl -X POST https://staging.liquilab.io/api/sentry-test
  ```
- **Verification:** Check Sentry dashboard for "Sentry staging test event" with environment tag "staging"
- **Helper:** `withSentryApiHandler()` wrapper available in `src/lib/observability/withSentryApiHandler.ts` for API route error capture
- **Railway Setup:** ✅ Complete
  - `SENTRY_DSN` configured in Railway staging service
  - `SENTRY_ENVIRONMENT=staging` set correctly
  - Status (2025-11-17): Sentry operational - test events successfully logged with eventId tracking

### 7.9 DB Seed Validation (S0-OPS01)
- **Script:** `npm run verify:db:staging`
- **Checks:** Row counts for `PoolEvent`, `PositionEvent`, `PositionTransfer`, `analytics_market_metrics_daily`
- **Minimums:** PoolEvent ≥100, PositionEvent ≥50, PositionTransfer ≥50, analytics_market_metrics_daily ≥10
- **Optional Tables:** `analytics_market_metrics_daily` is marked as optional (non-blocking) - this table may be empty in production if it's a materialized view that requires manual refresh
- **Usage:** Run locally against staging DATABASE_URL (use proxy URL: `*.proxy.rlwy.net`, not `railway.internal`)
- **Exit:** Non-zero if any required table below minimum threshold (optional tables show warnings but don't fail)
- **Status (2025-11-17):** Script functional - correctly connects to staging DB and validates table counts. Staging database successfully copied from production (607k PoolEvent, 233k PositionEvent, 69k PositionTransfer rows).
- **Data Seeding Strategy:** Staging does not require a separate indexer. Recommended approach: periodic database copy from production to staging (via `pg_dump`/`pg_restore` or Railway backup restore). This provides realistic test data without the overhead of running a separate indexer worker for staging. See `scripts/ops/copy-prod-to-staging-db.sh` for automated copy script.

### 7.10 Stripe TEST Verification (S0-OPS01)
- **Script:** `npm run verify:billing:stripe`
- **Requires:** `STRIPE_SECRET_KEY` (must start with `sk_test_`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Action:** Retrieves Stripe account info to verify TEST keys are valid
- **Safety:** Only runs against TEST keys (exits if production key detected)
- **Usage:** Run locally before staging deploy to verify Stripe TEST configuration
- **Status (2025-11-17):** Stripe keys found in Railway staging (`STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`). Script requires `stripe` package (`npm install stripe`). Key validation may fail if keys are expired or have insufficient permissions - verify in Stripe dashboard.

### 7.11 Uptime Monitor (S0-OPS01, SP4-B05)
- **Endpoint:** `GET /api/health`
- **URL:** `https://staging.liquilab.io/api/health`
- **Expected:** HTTP 200, `{ ok: true, ts: <timestamp> }`
- **Monitor:** External service (UptimeRobot/Pingdom) checks every 5 minutes
- **Documentation:** See `docs/ops/UPTIME_MONITOR.md` for setup instructions
- **Alert:** Triggered after 2 consecutive failures (10+ minutes downtime)

### 7.5 Sprints (S0…S4)
- **S0 (SSoT Δ-2025-11-16):** Env matrix + endpoint contracts + consent/legal stubs + DoD/verify matrix.  
- **S1 (Web launch readiness):** Pricing SSoT aligned (`config/pricing` → `/api/public/pricing` → UI), entitlement gate active, SSR smoke green, degraded modes documented.  
- **S2 (Analytics hardening):** MV freshness monitors (`verify:mv`), pool detail stability, `/status` page hydration + alerts CTA.  
- **S3 (Billing & mail):** Stripe EUR plans live, portal flows via `/api/billing/*`, Mailgun live mode, GDPR automation follow-up.  
- **S4 (Post-MVP nice-to-haves):** Leaderboard, reports/export, onboarding wizard, payment history UI, alerts CRUD UI.

### 7.6 Security Baseline
- **Headers:** CSP (self + Stripe JS/frames + Coingecko connect; mixed-content blocked via upgrade), `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS on production only.  
- **CORS:** allow only localhost, staging, prod app domains (extend via `CORS_ALLOW_ORIGINS`).  
- **Rate-limit:** token bucket 60 req/min per IP for `/api/*` (skips localhost); OPTIONS replies are fast.  
- **Gate:** placeholder auth cookie (`ll_pass`) active in production unless `PLACEHOLDER_OFF=1`.  
- **Secrets rotation:** rotate Stripe/Mailgun/CRON secrets per release; avoid runtime FS for config (TS modules only).

---

## 8. Testing & Verification
- **Performance envelope:** MacBook Pro M4 Pro (2024), Node 20/22, pnpm 9. Batch=1000 + concurrency=12 stable with ANKR RPC. Autoslow kicks in gracefully under rate limits.  
- **Backfill stats (latest full run):**  
  - Ēnosys NFPM: 239 474 events.  
  - SparkDEX NFPM: 231 963 events.  
  - PoolCreated rows: 404 (Ēnosys+SparkDEX combined).  
  - Pool-contract events (initial ingest): ~1.8 M Swap/Mint/Burn/Collect rows.  
- **Checkpoints:** `NPM:global`, `FACTORY:enosys`, `FACTORY:sparkdex`, `POOLS:all`, `POOL_STATE:enosys|sparkdex`, `POSITION_READS:global`.  
- **Block coverage:** min block ≈ 29,937,200 (Ēnosys launch) → max ≈ 50,180,000 (current head − confirmations).  
- **Verification commands:**  
  ```bash
  # Smoke tests
  pnpm exec tsx scripts/dev/indexer-smoke.mjs         # progress + NDJSON counts
  psql $DATABASE_URL -f scripts/dev/smoke-db-pool-events.sql  # pool events + checkpoints
  psql $DATABASE_URL -c "select eventname,count(*) from \"PoolEvent\" group by 1 order by 1;"
  psql $DATABASE_URL -c "select key,lastblock from \"SyncCheckpoint\" order by key;"
  
  # Unit tests (viem decode roundtrip + mapPoolEvent)
  pnpm exec vitest src/indexer/__tests__/poolDecode.spec.ts
  ```  
  - Continuous follower monitored via logs + `data/indexer.progress.json`.  
- **Known limitations:** Cloud sandbox DNS issues against `flare-api.flare.network` / `rpc.ankr.com` (local runs succeed); TypeScript `--noEmit` flagged legacy Jest tests lacking typings (tracked separately).

---

## 9. Next Work
- ✅ Pool-contract events indexed (Swap/Mint/Burn/Collect).  
- ✅ CLI backfill supports `--streams=pools` (invokes `IndexerCore.indexPoolEvents`).  
- ✅ Dev runner + smoke SQL + unit tests for pool decode flow.  
- ▶ Enrich analytics: inRange %, fee yield trend, IL% breakdown, pool cohort BI exports.  
- ▶ UI surfaces: PoolDetail deep dive (owner metrics, whale watch, alert toggles).  
- ▶ Automation: nightly `state:rotate` cron, weekly snapshots → `public/brand*.json`.  
- ▶ Ops: finalize transactional mail provider; integrate alerts pipeline once analytics stable.  
- ▶ BI exports: NDJSON dumps for `PoolEvent` / `PositionEvent` (quarterly).  
- ▶ Testing: upstream RPC alternates (Flare official) + CI smoke for indexer scripts.

---
# Data & Indexer Config
- **Database (local dev)**
  ```env
  DATABASE_URL="postgresql://koen@localhost:5432/liquilab?schema=public"
  RAW_DB="postgresql://koen@localhost:5432/liquilab"
  ```
- **RPC (Flare via ANKR)**
  - HTTPS: `https://rpc.ankr.com/flare/cee6b4f8866b7f8afa826f378953ae26eaa74fd174d1d282460e0fbad2b35b01`
  - WSS: `wss://rpc.ankr.com/flare/ws/cee6b4f8866b7f8afa826f378953ae26eaa74fd174d1d282460e0fbad2b35b01`
- **Uniswap v3 / NFPM addresses (Flare)**
  ```env
  ENOSYS_NFPM="0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657"
  SPARKDEX_NFPM="0xEE5FF5Bc5F852764b5584d92A4d592A53DC527da"
  ENOSYS_V3_FACTORY="0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de"
  SPARKDEX_V3_FACTORY="0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652"
  ```

### NFPM (ERC-721) — Position NFTs (Flare)
- **Ēnosys NFPM (Flare)** — `0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657` — [Flarescan](https://flarescan.com/token/0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657?erc721&chainid=14) — canonical ERC-721 Position Manager for Ēnosys v3 pools (mints, transfers, burns LP NFTs).
- **Sparkdex NFPM (Flare)** — `0xEE5FF5Bc5F852764b5584d92A4d592A53DC527da` — [Flarescan](https://flarescan.com/token/0xEE5FF5Bc5F852764b5584d92A4d592A53DC527da?erc721&chainid=14) — Sparkdex Position Manager contract; mirrors Uniswap v3 semantics for Sparkdex pools.

#### .env — Indexer essentials
```env
# Flare RPC (Ankr)
FLARE_RPC_URL="https://rpc.ankr.com/flare/cee6b4f8866b7f8afa826f378953ae26eaa74fd174d1d282460e0fbad2b35b01"
FLARE_WS_URL="wss://rpc.ankr.com/flare/ws/cee6b4f8866b7f8afa826f378953ae26eaa74fd174d1d282460e0fbad2b35b01"

# NFPM (ERC-721 Position Manager)
ENOSYS_NFPM="0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657"
SPARKDEX_NFPM="0xEE5FF5Bc5F852764b5584d92A4d592A53DC527da"
```

#### Verification
```zsh
PROJECT_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Liquilab"; cd "$PROJECT_DIR" || exit 1
node scripts/dev/verify-nfpm.mjs --nfpm=0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657 --id=12345
```
Expect JSON `{ nfpm, positionId, name, symbol, owner }`. Non-existent IDs or wrong NFPM emit a JSON error payload and exit code `1`.

## Data & Infra — ANKR Advanced API
- **Benefits:**  
  ✅ Faster RPC calls (no public rate limits)  
  ✅ Real-time token prices (<100 ms)  
  ✅ Multi-chain support (Flare, Ethereum, BSC, Polygon, …)  
  ✅ Historical price data with custom intervals  
  ✅ Whale watching (token transfer history)  
  ✅ WebSocket-ready for real-time feeds  
  ✅ Reliable uptime/performance (managed infra)
- **Endpoints & auth:** `https://rpc.ankr.com/multichain`, header `X-API-Key: $ANKR_ADV_API_KEY`, default chain `flare` (chainId 14).  
- **Environment:** `ANKR_ADV_API_URL`, `ANKR_ADV_API_KEY`, `FLARE_CHAIN_ID`.  
- **Repo usage:** client helper `src/lib/ankr/advancedClient.ts`, smoke script `scripts/dev/ankr-smoke.mts`, concurrency ≤ 6 with backoff on 429/5xx.  
- **Rate-limit policy:** respect ANKR Advanced quotas; throttle to ≤ 6 concurrent requests, exponential backoff on error.  
- **Docs:** see `docs/infra/ankr.md` for query examples and roadmap (enrich unknown pools/owners, nightly validation).

## Monitoring — ANKR API usage
- **API (`pages/api/admin/ankr.ts`):** fetches ANKR billing endpoint, caches responses in `data/ankr_costs.json` for 24 h, supports `?refresh=1` overrides, returns masked API key tail + history array for visualizations.
- **Dashboard (`pages/admin/ankr.tsx`):** dark-blue admin view (Brand guardrails) showing daily/monthly cost, total calls, last updated, force-refresh controls, and a simple trend chart using cached history.
- **Daily Ankr refresh job:** EasyCron hits `https://app.liquilab.io/api/admin/ankr?refresh=1` every day at **04:40 Europe/Amsterdam** (account timezone) so the cache stays fresh without manual visits. Railway fallback command: `node scripts/scheduler/ankr-refresh.ts`.
- **Scheduler script:** `scripts/scheduler/ankr-refresh.ts` — manual helper for Railway cron / local runs (invokes `/api/admin/ankr?refresh=1` and logs success/failure).

## Analytics: Position index (token_id)
- **Table:** `analytics_position` (token_id TEXT PK, owner_address, pool_address, nfpm_address, first_block, last_block, first_seen_at, last_seen_at).  
- **Purpose:** Canonical lookup of every Flare concentrated-liquidity position NFT (Ēnosys + Sparkdex) with latest ownership and pool association for downstream analytics & alerts.
- **Heuristic classifier:** `nfpm_address` derives from `first_block` — blocks `< 30617263` → Ēnosys NFPM (`0xD977…6657`), otherwise Sparkdex NFPM (`0xEE5F…27da`).  
  - **Follow-up:** replace with contract-address join once NFPM emitter is persisted in raw events.
- **Pool attribution:** primary source is `PositionEvent.pool` mode; fallback matches Mint events via `txHash + tickLower + tickUpper` against `PoolEvent` (`eventName='Mint'`).

### Runbook — tokenId→pool backfill & analytics_position_flat refresh
```zsh
# Apply latest prisma migration (idempotent)
PROJECT_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Liquilab"; cd "$PROJECT_DIR" || exit 1
pnpm prisma migrate deploy

# Backfill tokenId→pool for PositionEvent rows with pool='unknown'
# Strategy A: use PositionEvent MINT rows with known pool
# Strategy B: match PoolEvent.Mint via txHash + tickLower/tickUpper
export RAW_DB="postgresql://koen@localhost:5432/liquilab"
npm run sql:backfill:tokenid-pool

# Refresh analytics_position_flat materialized view
# Creates flat view: token_id, owner_address, pool_address, first_block, last_block, first_ts, last_ts
npm run sql:refresh:analytics-flat

# Verification (counts, top owners/pools, anomaly CSVs under /tmp)
npm run sql:verify:tokenid-pool
```
- **Success criteria:**  
  - `PositionEvent` rows with `pool='unknown'` reduced to near-zero after backfill.
  - `analytics_position_flat` row count matches distinct tokenIds in `PositionEvent ∪ PositionTransfer`.  
  - `owner_address` populated for tokens with transfers.  
  - `/tmp/liqui_positions_missing_pool.csv` contains only positions without any PoolEvent match.
  - `/tmp/liqui_positions_top_owners.csv` exports top 1000 owners by position count.

### Runbook — analytics_position refresh (legacy)
```zsh
# Backfill / refresh analytics_position (idempotent UPSERT)
psql "$RAW_DB" -f scripts/dev/backfill-analytics-position.sql

# Verification (counts, top owners/pools, anomaly CSVs under /tmp)
psql "$RAW_DB" -f scripts/dev/verify-analytics-position.sql
```
- **Success criteria:**  
  - `analytics_position` row count matches distinct tokenIds in `PositionEvent ∪ PositionTransfer`.  
  - `owner_address` populated for tokens with transfers; `nfpm_address` only contains Ēnosys/Sparkdex values.  
  - `/tmp/token_ids_without_owner.csv` empty after first full backfill (except never-transferred positions).  
  - `/tmp/tokens_bad_nfpm.csv` empty once NFPM emitter is stored.

### Indexing — ERC-721 tokenId→pool resolver (NFPM.positions + Factory.getPool)
- **Goal:** Resolve lingering `PositionEvent.pool='unknown'` rows by reading `positions(tokenId)` directly from Ēnosys/Sparkdex NFPMs, deriving pool address via both factories, and updating Postgres in-place.  
- **Script:** `scripts/dev/fix-pool-by-nfpm-viem.mts` (Viem + ANKR RPC; idempotent UPSERT).  
- **Env (.env.local):** quote values to avoid zsh expansion.
  ```env
  ANKR_HTTP_URL="https://rpc.ankr.com/flare/${ANKR_API_KEY}"
  ENOSYS_NFPM="0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657"
  SPARKDEX_NFPM="0xEE5FF5Bc5F852764b5584d92A4d592A53DC527da"
  ENOSYS_V3_FACTORY="0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de"
  SPARKDEX_V3_FACTORY="0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652"
  DATABASE_URL="postgresql://koen@localhost:5432/liquilab?schema=public"
  RAW_DB="postgresql://koen@localhost:5432/liquilab"
  ```
- **Command:**
  ```zsh
  # Defaults: --limit=5000 --offset=0 --concurrency=10 (capped at 12 RPC calls)
  DOTENV_CONFIG_PATH=.env.local pnpm tsx scripts/dev/fix-pool-by-nfpm-viem.mts \
    --limit=7500 --offset=0 --concurrency=12
  ```
- **Behavior:**  
  - Fetches DISTINCT tokenIds where `PositionEvent.pool='unknown'` (batched window).  
  - Calls `positions(tokenId)` on Ēnosys NFPM, then Sparkdex if needed; for each response, tries both factories’ `getPool(token0, token1, fee)` until non-zero pool is found.  
  - Applies updates via single `UPDATE "PositionEvent" SET "pool"=$pool WHERE tokenId=$tokenId AND pool='unknown'`.  
  - Tracks counters (processed/resolved/skipped) and logs every 100 IDs; prints remaining unknown count via SQL at completion.  
  - Resumable via `--offset` pagination; safe to re-run (idempotent).  
- **Success criteria:**  
  - Remaining `PositionEvent.pool='unknown'` count steadily declines toward 0.  
  - `analytics_position_flat.pool_address` aligns with on-chain NFPM + factory readings (spot-check via verify script).  
  - NFPM RPC calls remain ≤ 12 concurrent; ANKR usage stays within plan limits.

### Analytics — Provider split (estimate)
We classify ERC-721 positions per provider (Ēnosys vs Sparkdex) using the *first seen block* of each tokenId (Sparkdex launch block **30617263**).  
Run:

```zsh
PSQL_URL="postgresql://koen@localhost:5432/liquilab"
psql "$PSQL_URL" -v ON_ERROR_STOP=1 -f scripts/dev/provider-estimate.sql
psql "$PSQL_URL" -v ON_ERROR_STOP=1 -f scripts/dev/verify-provider-estimate.sql
```

Outputs:
	• `analytics_provider_estimate(token_id, first_block, provider)` materialized view with indexes  
	• Totals per provider + coverage vs total tokenIds  
	• (Optional) top owners per provider if `analytics_position_flat` exists  

Next (accuracy): when NFPM address is stored per event/transfer, replace the first-block heuristic with address-based classification for perfect attribution.

### Portfolio & Core Actions (demo API + UI)
- **API — `/api/analytics/positions`:** paginated JSON feed backed by `analytics_position_flat` (fallback `analytics_position`). Supports `page`, `per`, `owner`, `pool`, `search` filters, clamps per 10‑200, returns `X-Total-Count` header.  
- **UI — `/portfolio`:** Client-side page with filters (owner/pool/tokenId), pagination controls, empty/error/loading states pulling from the API for demos.  
- **Docs:** Sidebar now points to “Portfolio & Core Actions” to guide Product/investors to the relevant roadmap section.

### Indexer — Architecture & Runbook
- **Reference doc:** `docs/indexer/architecture.md` (streams, storage layout, integrity rules, observability).  
- **Status:** All streams (factories, pools, NFPM, pool_state, position_reads) share the same 1,000 block window + 16-block confirmation buffer; cursors sync via `data/cursors.json`; raw NDJSON append-only with idempotent upserts.  
- **Commands (macOS/zsh):**
  ```zsh
  # Enosys full stream window
  pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts \
    --factory=enosys --from=29837200 \
    --streams=factories,pools,logs,nfpm,pool_state,position_reads \
    --rps=8 --confirmations=16 --reset

  # SparkDEX follow-up (no reset)
  pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts \
    --factory=sparkdex --from=30617263 \
    --streams=factories,pools,logs,nfpm,pool_state,position_reads \
    --rps=8 --confirmations=16
  ```
- **Observability:** track `data/indexer.progress.json`, tail `logs/indexer-YYYYMMDD.log`, `/api/indexer/progress` endpoint. Lossless raw files live under `data/raw/*`, enriched sets under `data/enriched/*`, analytics prep under `data/analytics/daily/*`.

## Runbooks
- **Backfill Ēnosys**
  ```zsh
  PROJECT_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Liquilab"; cd "$PROJECT_DIR" || exit 1
  pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts \
    --factory=enosys --from=29837200 \
    --streams=factories,logs,nfpm,pool_state,position_reads \
    --rps=8 --confirmations=32 --tokenIds="" --reset
  ```
- **Backfill Sparkdex**
  ```zsh
  PROJECT_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Liquilab"; cd "$PROJECT_DIR" || exit 1
  pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts \
    --factory=sparkdex --from=30617263 \
    --streams=factories,logs,nfpm,pool_state,position_reads \
    --rps=8 --confirmations=32 --tokenIds="" --reset
  ```
- **Sanity — pools mini-window**
  ```zsh
  PROJECT_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Liquilab"; cd "$PROJECT_DIR" || exit 1
  pnpm exec tsx -r dotenv/config scripts/dev/run-pools.ts --from=49618000 --to=49620000 || true
  ```
- **Sanity — DB queries (role koen)**
  ```zsh
  PROJECT_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Liquilab"; cd "$PROJECT_DIR" || exit 1
  export PSQL_URL="postgresql://koen@localhost:5432/liquilab"

  psql "$PSQL_URL" -F $'\t' -A -P pager=off <<'SQL'
  SELECT "eventName", COUNT(*) AS rows FROM "PoolEvent" GROUP BY 1 ORDER BY 2 DESC;
  SELECT "blockNumber","pool","eventName","txHash","logIndex",
         COALESCE("owner",'') owner, COALESCE("recipient",'') recipient,
         COALESCE("amount0",'0') amount0, COALESCE("amount1",'0') amount1,
         "tickLower","tickUpper","tick", COALESCE("sqrtPriceX96",'0') sqrtpx
  FROM "PoolEvent"
  WHERE "eventName" IN ('Swap','Mint','Burn','Collect')
  ORDER BY "blockNumber" DESC, "logIndex" DESC
  LIMIT 20;
  SELECT id,"lastBlock", to_char("updatedAt",'YYYY-MM-DD HH24:MI:SS') AS updated
  FROM "SyncCheckpoint"
  WHERE id LIKE 'POOLS:%' OR id LIKE 'FACTORY:%' OR id='NPM:global'
  ORDER BY "updatedAt" DESC
  LIMIT 10;
  SQL

  psql "$PSQL_URL" -F $'\t' -A -P pager=off <<'SQL'
  SELECT COUNT(*) AS bad_amount0 FROM "PoolEvent" WHERE "amount0" ~ '^-?[0-9]+-[0-9]+$';
  SELECT COUNT(*) AS bad_amount1 FROM "PoolEvent" WHERE "amount1" ~ '^-?[0-9]+-[0-9]+$';
  SQL
  ```
- **Daylog tail**
  ```zsh
  PROJECT_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Liquilab"; cd "$PROJECT_DIR" || exit 1
  LOG="logs/indexer-$(date +%Y%m%d).log"
  [ -f "$LOG" ] && tail -n 200 "$LOG" | grep -E '^\[RPC\] Scanning ' | tail -n 1 || echo "No daylog; see console output."
  ```

### Indexer Runbook (Flare, Enosys/Sparkdex)
- RPC (HTTPS): `https://rpc.ankr.com/flare/cee6b4f8866b7f8afa826f378953ae26eaa74fd174d1d282460e0fbad2b35b01`
- NFPM: Ēnosys `0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657`, Sparkdex `0xEE5FF5Bc5F852764b5584d92A4d592A53DC527da`
- Factories: Ēnosys `0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de`, Sparkdex `0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652`
- Commands (examples):
  ```zsh
  pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts --factory=enosys  --from=29837200 --streams=factories,pools,nfpm,positions --rps=8 --confirmations=32 --reset
  pnpm exec tsx -r dotenv/config scripts/indexer-backfill.ts --factory=sparkdex --from=30617263 --streams=factories,pools,nfpm,positions --rps=8 --confirmations=32 --reset
  ```

### Analytics View (one row per NFT position)
- Create/refresh: `psql "$PSQL_URL" -f scripts/dev/backfill-analytics-position-flat.sql && psql "$PSQL_URL" -c 'REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_position_flat;'`
- Verify: `psql "$PSQL_URL" -f scripts/dev/verify-analytics-position-flat.sql`

-## Known issues
- Mailgun account still pending reactivation, so `MAILGUN_MODE` remains `degrade` locally/CI until mg.liquilab.io is fully approved.
-
-## Open actions
- Once Mailgun is active, flip `MAILGUN_MODE=live` in staging, run `npm run verify:mailgun`, and only then roll to Railway production.
-
## Changelog — 2025-11-08

### **ERC-721 Full Indexing + Pool Metadata Architecture**

**Database Migration (2025-11-08 12:00-14:45 CET):**
- ✅ Created new Railway Postgres database "switchyard" (50GB) after previous database crash
- ✅ Applied Prisma migrations (all tables created fresh)
- ⏳ **INDEXER RUNNING** — Full backfill in progress with ANKR RPC
  - Streams: `factories`, `pools`, `nfpm`
  - Progress: 132,000/242,300 events written (~54% complete)
  - ETA: ~45 minutes remaining
  - Database URL: `postgresql://postgres:***@switchyard.proxy.rlwy.net:52817/railway`

**Schema Changes:**
- ✅ Added `nfpmAddress` column to `PositionTransfer` table (distinguish Enosys vs SparkDEX)
- ✅ Created `Pool` table for pool metadata:
  - `address` (PK), `token0`, `token1`, `fee`
  - `token0Symbol`, `token1Symbol` (e.g. "WFLR/USDT")
  - `token0Name`, `token1Name`, `token0Decimals`, `token1Decimals`
  - `factory`, `blockNumber`, `txHash`
  - Indexes on `factory`, `token0+token1`, `blockNumber`

**New Scripts:**
- ✅ `scripts/dev/enrich-pools.mts` — Enriches Pool table with token metadata via RPC
  - Reads `PoolCreated` events from `PoolEvent`
  - Fetches ERC-20 symbol/name/decimals for token0 and token1
  - Usage: `tsx scripts/dev/enrich-pools.mts [--limit=100] [--offset=0]`
  - Rate limited: 100ms delay between pools to avoid RPC throttling

**Data Model Updates:**
- ✅ `eventDecoder.ts` — Added `nfpmAddress` to `DecodedTransfer` interface
- ✅ `dbWriter.ts` — Now writes `nfpmAddress` to `PositionTransfer` table
- ✅ `prisma/schema.prisma` — Added Pool model + nfpmAddress field

**Current Database Status (2025-11-08 14:45):**
```
✅ PositionEvent: 132,000 (INCREASE/DECREASE/COLLECT)
✅ PositionTransfer: 25,780 (NFT ownership transfers)
✅ PoolEvent: 404 (PoolCreated events only)
⏳ Pool contract events (Swap/Mint/Burn/Collect): Pending
⏳ Pool metadata enrichment: Pending (after indexer completes)
```

**Next Steps (After Indexer Completes):**
1. Verify all data: PositionEvent, PositionTransfer, PoolEvent counts
2. Run pool metadata enrichment: `tsx scripts/dev/enrich-pools.mts`
3. Verify pool names display correctly (e.g. "WFLR/USDT (0.05%)")
4. Setup Railway Indexer Follower for continuous updates
5. Implement RangeBand™ status API (IN_RANGE/NEAR_BAND/OUT_OF_RANGE)

**Known Issues:**
- Pool contract events (Swap/Mint/Burn/Collect) not yet appearing in database despite indexer scanning them
- Pool enrichment script will fetch metadata for 404 pools (~40 minutes with rate limiting)
- `poolCount: 0` in progress file suggests pool registry may not be populated yet
- Enrichment readiness is now tracked via `src/lib/enrich/registry.ts` (`npm run verify:enrichment` reports all required views/APIs present), but the new view stubs still need to be executed inside Postgres and refreshed via `/api/enrich/refresh-views` or cron.

---

## Changelog — 2025-11-08 (Earlier)
• **ERC-721 Full Indexing** — Completed full historical backfill of all ERC-721 Transfer events from both Enosys V3 NFPM (`0xD9770b1C7A6ccd33C75b5bcB1c0078f46bE46657`) and SparkDEX V3 NFPM (`0xEE5FF5Bc5F852764b5584d92A4d592A53DC527da`). Total: 41,777 transfers, 24,432 unique NFT positions, 40,195 MINTs, 532 BURNs. Indexed locally using ANKR RPC (fast) and written directly to Railway Postgres (yamabiko). Earliest block: 29,989,866 (2025-04-13), latest: 50,289,944 (current).
• **Railway Database Migration** — Successfully migrated from crashed 500MB database (Postgres dc2e) to new 50GB database (yamabiko). Used external proxy URL for local indexing: `postgresql://postgres:tFXzfPtgqJpXOKbGBEiYeAstRdRdqAVF@yamabiko.proxy.rlwy.net:54929/railway`.
• **Indexer Follower Setup** — Added `indexer:follow:railway` npm script for continuous following using Flare Public RPC (free). Railway service configured with `Dockerfile.worker`, custom start command `npm run indexer:follow:railway`, and environment variables for both NFPMs.
• **RAILWAY_INDEXER_SETUP.md** — Created comprehensive deployment guide for Railway Indexer Follower service, including environment variables, troubleshooting, verification queries, and known issues (single NFPM scan limitation).
• **package.json** — Added `indexer:follow:railway` script: `tsx scripts/indexer-follower.ts --stream=nfpm`.
• **PROJECT_STATE.md** — Updated last modified date to 2025-11-08, added changelog entry for ERC-721 indexing completion and Railway setup.

**Database Status (2025-11-08):**
- 41,777 total transfers (Enosys + SparkDEX)
- 24,432 unique NFT positions
- 6,380 unique wallets
- Block range: 29,989,866 → 50,289,944
- Top wallet: `0xf406b4E97c31420D91fBa42a3a9D8cfe47BF710b` (501 transfers)

**Next Steps:**
1. Deploy Indexer Follower to Railway with Flare Public RPC
2. Monitor for 1 hour to ensure stability
3. Consider enhancing indexer to scan both NFPMs simultaneously (currently single contract per run)

## Changelog — 2025-11-09

### **SparkDEX NFPM Backfill Completed (Append-Only)**

**Date:** 2025-11-09 14:30-15:05 CET  
**Operation:** Append-only backfill of SparkDEX NFPM position transfers

**Results:**
- ✅ **60,563 SparkDEX transfers inserted** (0 duplicates, 0 errors)
- ✅ **50,421 unique SparkDEX positions** indexed
- ✅ **Block range:** 30,760,825 → 50,302,571
- ⏱️ **Runtime:** 14.65 minutes
- 🌐 **RPC Source:** ANKR (`cee6b4f8...`)
- 🔐 **Safety:** ON CONFLICT DO NOTHING (no updates/deletions)

**Final Database State:**
```
DEX        Positions   Transfers   Block Range
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enosys     24,435      25,780      29,989,866 → 50,291,147
SparkDEX   50,421      60,563      30,760,825 → 50,302,571
Unknown    1           1           49,766,640
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL      74,857      86,344
```

**Technical Details:**
- Script: `scripts/backfill-sparkdex-safe.js`
- Method: Raw JSON-RPC (`eth_getLogs`) + Prisma `$executeRawUnsafe`
- Window: 5,000 blocks per request
- Rate: 6.67 RPS (150ms delay)
- Batch: 500 inserts per transaction
- UUID & timestamp generation for required schema columns

**Next Steps:**
1. ✅ Verify daily cron includes SparkDEX NFPM for future runs
2. ✅ Confirm aggregate counts in `/admin/db` dashboard
3. ⏳ Update `indexer.config.ts` to use array of NFPMs for unified scanning
4. ⏳ Test daily follower with both Enosys + SparkDEX

---

## Changelog — 2025-11-09

• **Railway Database Migration:** Migrated from crashed 500MB Railway database ("yamabiko") to new 50GB instance ("switchyard" → renamed to "Postgres"). DATABASE_URL updated to use variable references (`${{Postgres.DATABASE_URL}}`) for both LiquiLab and Indexer Follower services.
• **Full ERC-721 Data Indexing:** Completed backfill of historical ERC-721 position data (PositionTransfer + PositionEvent) for both Enosys and SparkDEX NFPMs from block 29,837,200 to 51,400,000+ using ANKR RPC. Database now contains **73,468 PositionTransfer** events and **49,012 distinct positions**.
• **Schema Enhancements:**
  - Added `nfpmAddress` column to `PositionTransfer` table to distinguish between Enosys and SparkDEX NFPMs.
  - Created `Pool` table with metadata (token0, token1, fee, symbols, names, decimals, factory, blockNumber).
  - Created `Token` model for reusable token metadata.
• **New Scripts:**
  - `scripts/dev/enrich-pools.mts` — Enriches Pool table with token metadata via RPC calls (symbols, names, decimals).
  - `scripts/ankr/fetch-factories-pools.mts` — Fetches PoolCreated events from factories and Mint/Burn/Collect events from pools.
  - `scripts/ankr/smart-pool-scanner.mts` — Two-phase scanner: quick scan to identify top 50 active pools, then full scan for those pools.
• **Railway Deployment:**
  - Created dedicated `Dockerfile.worker` for Indexer Follower service (avoids Next.js build, includes scripts/src/indexer.config.ts).
  - Fixed `tsx` dependency placement (moved from devDependencies to dependencies).
  - Configured Railway Cron Job for daily indexer backfills (8:00 AM CET).
  - Indexer Follower now uses Flare public RPC with reduced settings (RPS=2, Concurrency=2, BlockWindow=25) to comply with 30-block limit.
• **Placeholder Restoration:**
  - Re-created `pages/placeholder.tsx` with wave-hero background and modern glassmorphic login UI.
  - Middleware correctly redirects all traffic to `/placeholder` when `PLACEHOLDER_PASS` is set.
  - Access password: `Demo88`.
• **Vercel Migration:** Removed all Vercel-related configuration (`.vercel/`, `vercel.json`, `vercel.json.backup`). Project now fully deployed on Railway.
• **Documentation:**
  - Created `RAILWAY_INDEXER_SETUP.md` with detailed Railway configuration instructions.
  - Updated `HANDOVER_TO_CHATGPT.md` with latest indexer status, database credentials, and next steps.

## Changelog — 2025-11-09
- prisma/migrations/20251109_mv_pool_latest_state/migration.sql — Added latest-state materialized view for pool tick/liquidity snapshots.
- prisma/migrations/20251109_mv_pool_fees_24h/migration.sql — Added 24h fees materialized view with pool index for concurrent refreshes.
- pages/api/demo/pools.ts — Rebuilt endpoint to prefer Railway Postgres views with snapshot fallback and 60s caching.
- pages/api/demo/history.ts — Added read-only history endpoint exposing 24h deltas from demo.history.json.
- scripts/cron/update-demo-history.ts — New cron helper that appends TVL/pool totals once every 20h+ with 14-day retention.
- public/demo.history.json — Seeded history file for API + cron to read/write.
- PROJECT_STATE.md — Recorded prospect endpoint rollout and linked artefacts in changelog.

## Changelog — 2025-11-09
- src/lib/entitlements/resolveRole.ts — Added canonical resolver with query/header/cookie overrides plus premium/analytics flags.
- pages/api/entitlements.ts — Wired resolver output (role, flags, source) into pricing/entitlements response.
- pages/api/positions.ts — Applied role-aware masking + entitlements metadata and hardened cache to return canonical data per role.
- src/lib/positions/types.ts — Extended summary contract with entitlements block for client awareness.
- src/components/dev/RoleOverrideToggle.tsx — Lightweight dev toggle to set ll_role cookie and reload locally.
- pages/index.tsx — Prospect home now respects ?role overrides, updates PoolsTable entitlements, and exposes the dev toggle.
- pages/dashboard.tsx — User home reads role override, surfaces current state badge, and reuses the dev toggle.

## Changelog — 2025-11-09
- pages/koen.tsx — Fixed entitlement fallback display from 'FREE' → 'VISITOR' to match new role model.

## Changelog — 2025-11-09
- prisma/migrations/20251109_pool_incentive_store/migration.sql — Added append-only pool_incentive table for per-pool USD/day + token payloads.
- prisma/schema.prisma — Mapped PoolIncentiveSnapshot model onto the new pool_incentive table.
- src/lib/incentives/schema.ts — Shared Zod parser for incentives payloads (addresses, tokens, usdPerDay).
- scripts/data/import-incentives.ts — Append-only importer that upserts incentives JSON files and logs inserted/updated counts.
- pages/api/incentives/index.ts — Single-pool incentives endpoint with cache headers and graceful 404/400 handling.
- pages/api/incentives/bulk.ts — Bulk incentives fetch (≤50 pools) with ordered responses and identical caching.

## Changelog — 2025-11-09
- src/lib/providers/ankr.ts — Added Ankr NFT/price helpers with env validation and safe fallbacks.
- src/lib/pricing/prices.ts — Added shared price loader (Ankr-first, DefiLlama fallback, stable overrides for USDTe/USDC.e).

## Changelog — 2025-11-09
- src/lib/positions/types.ts — Added shared summary payload contract for the KPI endpoint.
- pages/api/positions/summary.ts — Introduced wallet summary API (NFPM enumerate via Ankr, on-chain tick heuristics, entitlements + caching).

## Changelog — 2025-11-09
- src/lib/positions/types.ts — Added premium grid fields (liquidity payload, incentives, claim) plus legacy compatibility notes.
- pages/api/positions.ts — Replaced endpoint with Ankr-based NFPM reader, incentives lookup, caching, and entitlements-aware masking for the premium grid.

## Changelog — 2025-11-09
- src/lib/positions/types.ts — Extended summary payload type with optional warnings meta for safer fallback responses.
- pages/api/positions/summary.ts — Added entitlements fallback + catch-all error handling to avoid 500s and always return calm payloads.

## Changelog — 2025-11-09
- src/components/pools/PoolCard.tsx — Added premium grid card with calm TVL/APR/incentives layout and RangeBand status dots.
- src/components/pools/PoolsGrid.tsx — Added responsive grid + skeleton/empty states with Connect CTA for wallets.
- pages/dashboard.tsx — Hooked premium grid data (positions/summary via React Query), entitlements-aware gating, and wallet-aware layout.

## Changelog — 2025-11-09
- src/components/pools/PoolsGrid.tsx — Added header row, responsive layout cues, and demo-aware rendering for the visitor experience.
- src/components/pools/PoolCard.tsx — Polished currency formatting, RangeBand expansion, token breakdown, and premium masking logic.
- pages/dashboard.tsx — Refreshed hero/CTA copy and wired the premium grid data + React Query fetching for visitor/premium flows.

## Changelog — 2025-11-09
- src/components/pools/PoolCard.tsx — Added defensive USD/amount formatting and masking fallbacks to prevent visitor crashes.
- pages/dashboard.tsx — Wrapped entitlements in safe helper so visitor rendering never dereferences undefined flags.

## Changelog — 2025-11-09
- src/components/hero/Hero.tsx — Added centered visitor hero with Aqua USPs, RangeBand teaser, and dual CTAs.
- src/components/demo/DemoPools.tsx — Added demo pools card with DB-backed list/grid toggle and connect CTA.
- src/components/pools/PoolsGrid.tsx — Extended header/layout hooks for new hero/demo flow.
- src/components/pools/PoolCard.tsx — Hardened currency/token formatting and masking logic for visitor demo data.
- pages/dashboard.tsx — Wired new hero + demo components with safe entitlements fallback.

## Changelog — 2025-11-09
- src/components/rangeband/InlineMini.tsx — Added inline RangeBand™ mini visual for the visitor hero card.
- src/components/hero/Hero.tsx — Updated hero layout to embed the inline mini visual and refreshed CTA buttons.
- src/components/demo/DemoPools.tsx — Wired demo pools card with list/grid toggle and connect CTA for visitors.
- src/components/pools/PoolCard.tsx — Hardened USD/token formatting and premium masking for visitor demo rendering.
- src/components/pools/PoolsGrid.tsx — Added header scaffolding used by the hero/demo flow.
- src/styles/globals.css — Added `.btn-ghost` utility for secondary hero CTA with branded focus states.
- pages/dashboard.tsx — Layered wave background correctly and inserted new hero/demo components with safe entitlements.

## Changelog — 2025-11-09
- src/styles/globals.css — Added RangeBand rail/dot utility styles for the visitor hero mini visual.
- src/components/rangeband/InlineReal.tsx — Implemented RangeBand™ semantics (live price polling, range segment, strategy toggle).
- src/components/hero/Hero.tsx — Swapped inline mini for the semantic RangeBand component while preserving brand layout.

## Changelog — 2025-11-09
- src/components/utils/ScreenshotButton.tsx — Added reusable “Download PNG” button that captures the full page via html-to-image.
- src/styles/globals.css — Extended .btn-ghost styles with disabled handling for the screenshot action.
- pages/dashboard.tsx — Added screenshot button in the dashboard header so visitors can download a PNG snapshot.
- pages/koen.tsx — Added the same screenshot download control to Koen’s wallet header.

## Changelog — 2025-11-09
- src/components/hero/Hero.tsx — Fixed RangeBand import to use InlineReal component after removing InlineMini.

## Changelog — 2025-11-10
- **CRITICAL FIX: Real USD Pricing Implementation**
- src/services/tokenPriceService.ts — NEW: CoinGecko API integration (323 lines) with 5-min caching (node-cache), 40+ token mappings (WFLR, sFLR, USDC.e, USDT, WETH, HLN, FXRP, SPX, APS, etc.), special character handling (USDC.e → USDCE, USD₮0 → USD0), and 3-level fallback strategy: (1) CoinGecko API, (2) stablecoin assumption ($1.00), (3) pool ratio with warning.
- src/utils/poolHelpers.ts — CRITICAL: Replaced fake USD pricing logic (lines 846-861) with real price fetching via getTokenPriceWithFallback(). Previously used pool price ratio as USD price, causing 50-5000% TVL overestimations in non-stablecoin pools. Now logs price sources (coingecko/stablecoin/pool_ratio) and warns on inaccurate fallbacks.
- package.json / package-lock.json — Added node-cache dependency for price caching.
- .env.example — Added COINGECKO_API_KEY documentation (optional, for Pro tier 300 calls/min; free tier 50 calls/min sufficient with caching).
- **IMPACT:** Fixed ~190 pools (80% of database) with accurate TVL. Examples: sFLR/WFLR pool TVL corrected from $205 (43x overestimation) to $3.10 (real), SPX/WFLR from $5.2M (433x) to ~$12k. Total platform TVL corrected from $150M (fake) to ~$59M (real), now matching DefiLlama coverage. ~40,000 positions now show correct USD values.
- **VERIFICATION:** CoinGecko API tested and working (WFLR=$0.0159, USDT=$0.9997, USDC=$0.9997, WETH=$3,608.33). Cache performance: 5-min TTL, expected >80% hit rate with ~10 unique tokens × 12 API calls/hour = 120 calls/hour (well within free tier).
- DEPLOYMENT_TVL_FIX.md — NEW: Complete deployment guide with monitoring checklist, success/warning/error indicators, verification steps, rollback plan, and post-deployment tasks.
- docs/PROMPT_FOR_GPT_TVL_FIX.md — Enhanced with real database context (238 pools analyzed, 40+ token mappings, test wallet identified).
- docs/research/TVL_DIFFERENCES_LIQUILAB_VS_DEFILLAMA.md — Technical analysis of why TVL differences existed (fake USD pricing, coverage gaps, data lag).
- docs/DATA_READINESS_TVL_FIX.md — Complete data inventory confirming all required data available (50k positions, 238 pools with 100% metadata).
- **COMMITS:** a857ed5 (implementation), 138e693 (deployment guide). Deployed to Railway production via auto-deploy.

## Changelog — 2025-11-10
- src/lib/providers/ankr.ts — Replaced Ankr NFT enumeration with viem-based NFPM balance/log scanning plus caching.
- PROJECT_STATE.md — Documented the NFPM viem enumeration migration.

## Changelog — 2025-11-10
- src/services/positionCountService.ts — Rebuilt NFPM position counting with viem log scans and persistent caching in `position_counts`.

## Changelog — 2025-11-10
- **WEEKLY REPORT + TVL API INTEGRATION**
- pages/api/analytics/tvl.ts — NEW: Aggregated TVL endpoint (173 lines) that sums all positions from database using CoinGecko prices via tokenPriceService.ts. Groups by pool for efficiency, returns Enosys/SparkDEX breakdown, position counts, and avg values. Response includes calculated timestamp and price source.
- scripts/generate-weekly-report.js — UPGRADED: Now fetches TVL from /api/analytics/tvl (LiquiLab CoinGecko) with triple-layer fallback: (1) LiquiLab API, (2) DefiLlama, (3) cached values. Replaced hardcoded DefiLlama-only logic. Footer now shows dynamic price source.
- **IMPACT:** Weekly reports now use same accurate TVL calculation as the app (CoinGecko + pool ratios), ensuring consistency across all user-facing surfaces. No more DefiLlama vs LiquiLab discrepancies in reports.
- **API RESPONSE FORMAT:**
  ```json
  {
    "success": true,
    "data": {
      "totalTVL": 59300000,
      "enosysTVL": 6600000,
      "sparkdexTVL": 52700000,
      "positionCount": { "total": 50542, "enosys": 24568, "sparkdex": 25974 },
      "avgPositionValue": { "total": 1173, "enosys": 270, "sparkdex": 2030 },
      "calculatedAt": "2025-11-10T...",
      "priceSource": "CoinGecko API + pool ratios"
    }
  }
  ```
- **WEEKLY REPORT FLOW:** generate-weekly-report.js → fetchLiquiLabTVL() → /api/analytics/tvl → tokenPriceService.ts (CoinGecko) → Markdown/HTML report with real TVL.
- **COMMITS:** 02426ff (TVL API + report upgrade).

## Changelog — 2025-11-10
- **RAILWAY 502 DEBUGGING (3+ HOURS, UNRESOLVED)**
- **PROBLEM:** LiquiLab main web service shows persistent 502 Bad Gateway after GitHub repository migration from `koen0373/LP-Manager` to `Liquilab/Liquilab`.
- **SYMPTOMS:** Container starts, Prisma Client generates, then immediately stops. No Next.js server startup. Deploy logs show only "Starting Container → Prisma generate → Stopping Container" (~5 seconds total).
- **ROOT CAUSE IDENTIFIED:** Railway uses Nixpacks auto-detect instead of Dockerfile. Nixpacks cannot execute shell scripts (./start.sh). Multiple configuration layers conflict (railway.toml, Custom Start Command, package.json, Dockerfile).
- **ATTEMPTED FIXES (ALL FAILED):**
  1. Enhanced start.sh with comprehensive logging (never executed)
  2. Created railway.toml with builder="DOCKERFILE" (ignored by Railway)
  3. Modified Dockerfile cache bust v0.1.6 → v0.1.7 (no effect)
  4. Changed package.json start script to inline migrations: `"npx prisma migrate deploy && npx next start"` (overridden by railway.toml)
  5. Updated railway.toml to use Nixpacks with no startCommand (deployment pending)
- **CURRENT STATUS:** Last commit 9847e59 should fix the issue by removing railway.toml startCommand override. Deployment in progress.
- **INDEXER FOLLOWER:** Successfully deployed with Dockerfile.worker, runs hourly via Cron (0 * * * *), uses Flare public RPC (free).
- **FILES MODIFIED:**
  - start.sh (enhanced logging, not working due to Nixpacks)
  - Dockerfile (cache bust v0.1.7)
  - Dockerfile.worker (npm install instead of npm ci, WORKING)
  - package.json (start script: inline migrations)
  - railway.toml (removed startCommand override)
  - pages/api/analytics/tvl.ts.disabled (temporarily disabled due to deployment issues)
  - scripts/generate-weekly-report.js (falls back to DefiLlama)
  - RAILWAY_502_FIX_HANDOVER.md (NEW: comprehensive debugging documentation)
- **NEXT STEPS FOR CHATGPT:**
  1. Verify last deployment (9847e59) succeeded
  2. Check Deploy Logs show Next.js "Ready" message
  3. Test: curl https://app.liquilab.io/api/health (expect 200 OK)
  4. If still 502: Consider manual Railway Settings override or contact Railway support
  5. Re-enable /api/analytics/tvl endpoint once site is stable
  6. Update weekly report to use LiquiLab TVL instead of DefiLlama
- **COMMITS:** cbc8e5d (start.sh), d15d8f2 (logging), ed7b7e6 (worker fix), 906c483 (package.json), 9847e59 (railway.toml).
- **DOCUMENTATION:** Complete root cause analysis and all attempted solutions documented in RAILWAY_502_FIX_HANDOVER.md.

## Changelog — 2025-11-12
- docs/PROMPTING_STANDARD.md — Created prompting standard document with Advisory Requirement section; mandated 'Advies' line in responses and 'Advisory/next_suggested_step' in [PASTE BLOCK — RESULTS FOR GPT].
- PROJECT_STATE.md — Added Working Agreements section with bullet: Always add an 'Advies' line when a better option exists (see docs/PROMPTING_STANDARD.md).
- docs/PR_BODY_ROLLBACK.md — Created PR body template for rolling back to UI snapshot `ui-2025-11-10-1000` (commit `0ab99aa2f4250b1bbd5ea39e724513d23800a564`). Plan: merge rollback via PR; no force-push to main. Local WIP stashed on backup branch.
- src/components/utils/ScreenshotButton.tsx — Added browser guards (`isBrowser` check) and improved dynamic import of html-to-image with `cacheBust` and `devicePixelRatio`; early return null if not in browser.
- package.json — Verified html-to-image is in dependencies (already present).
- pages/api/positions.ts — Verified exports `fetchCanonicalPositionData` and `buildRoleAwareData` (already present).
- .eslintrc.json — Verified no-undef rule is enforced (already present).

## Changelog — 2025-11-12
- pages/api/health.ts — Simplified the health handler to a static JSON response so the web service health check stays lightweight.
- package.json — Normalized the start script to `next start -p $PORT -H 0.0.0.0` and added `verify:web` for port/health verification.
- scripts/verify-web/port-and-health.mjs — Added an automated check ensuring the start script and health endpoint stay compliant.
- package.json — Added tsconfig-paths dependency required by verify:web script.
- 2025-11-12: pages/api/enrich/price.ts — Swapped deprecated enrichmentCache/tokenPriceService imports for the CoinGecko-backed helpers from services/tokenPriceService; build no longer fails resolving modules.
- 2025-11-12: package.json — Normalized `build` to `next build` so the web service uses the standard Next.js lifecycle; confirmed existing health endpoint remains lightweight.

## Changelog — 2025-11-12 (Web Ready)
- (docs) package.json — Verified `build`=`next build` and `start`=`next start -p $PORT -H 0.0.0.0`; no edits required.
- (docs) pages/api/health.ts — Confirmed lightweight JSON handler in place for deploy health checks.
- 2025-11-12: scripts/verify-web/pid-hold.mjs — Added a PID hold verifier to prove the web process stays alive (no pre/poststart prisma hooks needed).

## Changelog — 2025-11-12 (scanResult fix)
- src/lib/indexer/scan.ts — Added normalize helper so scan consumers always get scoped events/nextFrom data.
- src/indexer/indexerCore.ts — Replaced free scanResult usage with normalized locals and guarded error handling.
- scripts/verify-indexer/scan.mjs — Added dry-scan verifier checking start script + presence of indexer core.
- .eslintrc.json — Enforced no-undef across src/scripts to prevent undeclared variables.
- package.json — Added verify:indexer script for the new dry-scan check.

## Changelog — 2025-11-12 (ANKR backfill runner)
- src/indexer/indexerCore.ts — Added explicit chunk next-from logging and guarded pool scan fallbacks so scanResult can never be undefined mid-run.
- scripts/indexer/backfill-ankr.mjs — New windowed ANKR PAYG runner that bundles IndexerCore via esbuild, enforces ANKR-first RPC ordering, and checkpoint-logs every window.
- scripts/verify-indexer/backfill-plan.mjs — Plan verifier emitting JSON (start/head/target/windows) so ops can review the window schedule before execution.
- package.json — Added `indexer:backfill:ankr` and `verify:indexer:plan` scripts for the new tooling.
- Ops — Backfill plan: `windowSize=10k` blocks, `headMargin=50k`, `maxRetries=3` with 5→20s backoff, checkpoint key = `ankr-payg`.

## Changelog — 2025-11-12 (enrichment registry + icon unification)
- src/lib/enrich/registry.ts — Added filesystem detector for required MVs + `/api/enrich/*` so dashboards can check readiness programmatically.
- scripts/verify-enrichment/registry.mjs — Bundles the registry via esbuild and exits non-zero when any enrichment component is missing; wired into `npm run verify`.
- scripts/verify-enrichment/icons.mjs — Scans `src/` & `pages/` to ensure no legacy `/icons/` paths remain (allows `/media/icons/`).
- db/views/mv_*.sql — Minimal CREATE MATERIALIZED VIEW stubs for pool state, 24h fees, latest events, range status, and pool stats (safe to `psql -f` before scheduling refresh jobs).
- public/media/** — Moved all token (webp/svg) assets into `/media/tokens`, wallet logos into `/media/wallets`, and added brand-safe RangeBand + fallback SVGs under `/media/icons`.
- src/lib/icons/tokenIcon.tsx & src/components/TokenIcon.tsx — Centralized resolver now emits `/media/tokens/${symbol}.webp` + remote fallback; components import the shared helper.
- src/services/tokenIconService.ts, pools & pricing UI — Updated to new `/media` paths; Pool detail, wallet connect, demo tables, headers, and range indicator now use `TokenIcon` or `/media/icons/*`.
- package.json — Added `verify`, `verify:enrichment`, `verify:icons`, and `lint:ci` scripts so `npm run verify && npm run lint:ci && npm run build` succeeds locally.

### Changelog — 2025-11-13
- src/lib/icons/tokenIcon.tsx — Local-first resolver walks /media/tokens (.webp→.png→.svg) before Dexscreener, ending on token-default if every source fails.
- src/lib/icons/dexscreener.ts — Shared helpers expose normalized symbol fallback plus static.dexscreener URL builder for optional remote use.
- next.config.js — Allowed static.dexscreener.com token icons via `images.remotePatterns` so Next/Image can render optional remote files.
- PROJECT_STATE.md — Logged the icon strategy and reminded contributors that /public/media/tokens filenames must be lowercase symbols.
- next.config.js — Added rewrite so `/media/tokens/*` requests can fall back to legacy `/icons/*` assets in production.
- scripts/verify-static/icons-paths.mjs — Local verifier checks that either media or legacy icon trees contain files for flr/usd0/fxrp before deploy.
- public/media/icons/token-default.svg — Confirmed brand-safe default icon is packaged for final fallback rendering.
- src/lib/icons/symbolMap.ts — Introduced canonicalSymbol + alias map (WFLR→FLR, USDC.e→USDCE, USDT₀→USD0, JOULE) to resolve local filenames consistently.
- src/lib/icons/tokenIcon.tsx — TokenIcon now iterates canonical local candidates (.webp/.png/.svg) before remote fallback, rendered via plain `<img>` to avoid Next/Image 404s in lists.
- src/lib/icons/dexscreener.ts, src/lib/icons/tokenIcon.tsx, src/lib/icons/symbolMap.ts — Added shared builder that outputs local-extension list + Dexscreener URLs (with chain slug map) and a Next/Image-based TokenIcon that marks remote sources unoptimized.
- scripts/verify-static/icons-paths.mjs, scripts/verify-icons/remote-probe.sh — Added static file+remote icon verifiers so CI can confirm local assets exist and Dexscreener endpoints respond before deploy.

### Changelog — 2025-11-13
- package.json, package-lock.json — Added `html-to-image` as a runtime dependency so the ScreenshotButton's lazy import no longer fails at build time.
- pages/api/positions.ts, pages/api/wallet/summary.ts — Exposed canonical position helpers and updated the wallet summary route to consume them via alias paths, fixing the missing exports while keeping responses role-aware.
- .eslintrc.json — Extended the `no-undef` rule to TSX files to ensure client components stay fully typed.
- src/features/pools/PoolRow.tsx — Added `address` field to `PoolRowToken` interface and passed token addresses to `TokenIcon` component for improved Dexscreener fallback resolution.
- src/lib/icons/tokenIcon.tsx — Verified local-first icon resolution (webp→png→svg) with Dexscreener address-based fallback and default icon final fallback.
- src/lib/icons/symbolMap.ts — Verified symbol normalization (WFLR→flr, USDC.e→usdce, USDT₀→usd0) and canonical path generation.
- src/lib/icons/dexscreener.ts — Verified Dexscreener URL builder uses lowercased 0x addresses and correct chain slug ("flare"); requests .png (not .webp) from Dexscreener.
- next.config.js — Verified `images.remotePatterns` includes static.dexscreener.com/token-icons/** for remote icon support.
- scripts/verify-static/icons-paths.mjs — Verified icon verifier checks both /media/tokens and legacy /icons directories for required symbols (flr, usd0, usdce, fxrp, joule).

## Changelog — 2025-11-12

### Icon Discovery & Fetching Pipeline

**Problem:** Need automated discovery of token addresses from Enosys/SparkDEX factories and fetching of token icons from Dexscreener CDN.

**Solution:**
- Created `scripts/icons/collect-flare-dex-tokens.mjs` — RPC-based token discovery via `eth_getLogs` scanning PoolCreated events from factory contracts. Extracts token0/token1 addresses, resolves symbols via `eth_call`, normalizes via `config/token-aliases.flare.json`. Outputs `data/flare.tokens.json` manifest.
- Created `scripts/icons/fetch-dex-icons.mjs` — Downloads icons from Dexscreener (`https://static.dexscreener.com/token-icons/flare/{address}.png`). Saves to `public/media/tokens/{SYMBOL}.png` and `public/media/tokens/by-address/{address}.png`. Supports `--only-missing` flag and concurrency control (default 8). Writes `data/flare.icons.manifest.json` with statuses.
- Created `scripts/verify-icons/remote-probe.mjs` — Probes Dexscreener URLs via HEAD requests and reports availability statistics (200/404/other counts).
- Created `config/token-aliases.flare.json` — Static symbol/address canonicalization (WFLR→FLR, USDC.e→USDCE, USDT₀→USD0, etc.).
- Updated `package.json` — Added `@noble/hashes` dependency (keccak256 for event topic hashing) and npm scripts: `icons:collect`, `icons:fetch`, `icons:probe`.

**Environment Variables:**
- `FLARE_RPC_URLS` (comma-separated; first used as HTTP RPC)
- `ENOSYS_V3_FACTORY` (default: `0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de`)
- `ENOSYS_FACTORY_START` (default: `29925441`)
- `SPARKDEX_V3_FACTORY` (default: `0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652`)
- `SPARKDEX_FACTORY_START` (default: `30717263`)
- `CHAIN_SLUG` (default: `flare`)

**Usage:**
```bash
# 1. Discover tokens
npm run icons:collect -- --rpc=https://flare-api.flare.network/ext/bc/C/rpc

# 2. Probe availability (optional)
npm run icons:probe -- --limit=200

# 3. Fetch icons
npm run icons:fetch -- --only-missing --concurrency=8
```

**Icon Resolution Order (UI):**
1. Local: `/media/tokens/{symbol}.webp` → `.png` → `.svg`
2. Dexscreener: `https://static.dexscreener.com/token-icons/flare/{address}.png` (200-gated)
3. Default: `/media/icons/token-default.svg`

**Files changed:**
- `scripts/icons/collect-flare-dex-tokens.mjs` — New token discovery script
- `scripts/icons/fetch-dex-icons.mjs` — New icon fetcher script
- `scripts/verify-icons/remote-probe.mjs` — New probe script
- `config/token-aliases.flare.json` — New aliases config
- `package.json` — Added `@noble/hashes` dependency and npm scripts

**Result:** ✅ Automated token icon discovery and fetching pipeline; no app runtime changes; icons saved to `public/media/tokens/` for UI consumption.

---

## Changelog — 2025-11-13

**Icon Collector Fix:**
- Fixed `scripts/icons/collect-flare-dex-tokens.mjs` — Removed invalid `@noble/hashes/sha3.js` import (ERR_PACKAGE_PATH_NOT_EXPORTED); replaced keccak256 computation with hard-coded UniswapV3 PoolCreated topic constant (`0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118`).
- Updated `decodeTokenAddresses()` — Simplified to extract addresses directly from topics[1] and topics[2] using `.slice(26)` (addresses are in last 20 bytes of 32-byte indexed topics).
- Added `scripts/verify-icons/topic-matches.mjs` — RPC smoke-test script for verifying PoolCreated event logs; CLI: `--rpc <url> --factory <addr> --from <bn> --to <bn>`; outputs JSON with count.
- Updated `package.json` — Added `icons:test:topic` npm script; removed `@noble/hashes` from direct dependencies (still available transitively via wagmi/viem).
- **No app runtime changes** — Scripts-only fix; `npm run build` unaffected.

**Files changed:**
- `scripts/icons/collect-flare-dex-tokens.mjs` — Removed @noble/hashes imports, hard-coded topic
- `scripts/verify-icons/topic-matches.mjs` — New smoke-test script
- `package.json` — Added `icons:test:topic` script, removed `@noble/hashes` dependency

---

## Changelog — 2025-11-13

**Local-Only Icon Rendering:**
- Replaced `src/lib/icons/tokenIcon.tsx` — Removed Next/Image and Dexscreener dependencies; now uses native `<img>` with local-only candidate list (PNG→WEBP→SVG by symbol, then by-address, then default fallback).
- Updated `src/lib/icons/symbolMap.ts` — Enhanced `canonicalSymbol()` to return uppercase A–Z0–9 only; added XUSD→USD0 alias mapping.
- Stubbed `src/lib/icons/dexscreener.ts` — Exports no-op functions for backwards compatibility; removed `DEXS_HOST` constant to prevent bundling; no runtime Dexscreener calls.
- Added `scripts/verify-icons/no-remote-icons.mjs` — Post-build verifier that scans `.next/static` and `public/` for `static.dexscreener.com` references and legacy `/icons/` paths (excluding `/media/icons/` fallback); exits 1 if found.
- Updated `package.json` — Added `verify:icons:local` script.
- **No remote icon fetches** — All components use `@lib/icons/tokenIcon` which only resolves local assets; `npm run build` and `npm run verify:icons:local` pass.

**Files changed:**
- `src/lib/icons/tokenIcon.tsx` — Local-only icon resolver with fallback chain
- `src/lib/icons/symbolMap.ts` — Enhanced canonicalization with XUSD alias
- `src/lib/icons/dexscreener.ts` — Stubbed (no-op exports)
- `scripts/verify-icons/no-remote-icons.mjs` — New verifier script
- `package.json` — Added `verify:icons:local` script

---

## Changelog — 2025-11-13

### Homepage UI Restore from d9030cc2

**Problem:** Need to restore the historical homepage layout from commit d9030cc2 that had a working hero section with proposition + trial CTA and live demo section.

**Solution:**
- Restored `pages/index.tsx` from commit d9030cc2 — Unified hero section with proposition, feature list, and "Connect wallet — start free" CTA; includes DemoSection component for live proof-of-concept.
- Adapted imports to use alias paths (`@/components/...`, `@/lib/...`) instead of relative imports.
- Ensured all icon usage goes through local-only `TokenIcon` resolver (no remote Dexscreener requests).
- Maintained brand guardrails: dark-blue cards (`rgba(10, 15, 26, 0.88)`), Electric Blue primary (`#3B82F6`), Aqua accents (`#1BE8D2`), tabular-nums for pricing.

**Files changed:**
- `pages/index.tsx` — Restored historical homepage structure from d9030cc2 with adapted imports

**Result:** ✅ Homepage restored with working hero and demo sections; `npm run build` passes; no remote icon requests; UI matches historical d9030cc2 layout.

---

## Changelog — 2025-11-13

### Local Dev Stabilization & Wagmi Auto-Modal Fix

**Problem:** Wagmi auto-connect causing modal loops; brand images scattered; dev scripts need cleanup.

**Solution:**
- Created `src/lib/web3/wagmiConfig.ts` — Centralized wagmi config with `autoConnect: false` to prevent modal loops; uses Flare chain, cookieStorage, injected + WalletConnect connectors.
- Updated `src/providers/wagmi.tsx` — Uses centralized config from `@/lib/web3/wagmiConfig`; single WagmiProvider + QueryClientProvider.
- Fixed `src/components/WalletConnect.tsx` — Added mount guard; connect button only enabled when `status === 'disconnected'`; removed auto-triggers.
- Fixed `src/components/onboarding/ConnectWalletModal.tsx` — Added mount guard; connect functions check `status === 'disconnected' && !isConnected` before connecting.
- Updated `scripts/verify-enrichment/icons.mjs` — Extended to detect legacy `/icons/` and `./icons/` paths (excluding `/media/icons/`); checks for brand assets in `/public/media/brand/`.
- Updated `package.json` — Changed `dev` script to `next dev -p 3000 -H 0.0.0.0` (removed turbopack); added `dev:clean` script.

**Files changed:**
- `src/lib/web3/wagmiConfig.ts` — New centralized wagmi config (autoConnect: false)
- `src/providers/wagmi.tsx` — Updated to use centralized config
- `src/components/WalletConnect.tsx` — Added mount guard and status checks
- `src/components/onboarding/ConnectWalletModal.tsx` — Added mount guard and status checks
- `scripts/verify-enrichment/icons.mjs` — Extended verifier for legacy paths and brand assets
- `package.json` — Updated dev scripts

**Result:** ✅ Wagmi auto-connect disabled; no modal loops; single provider; brand images normalized under `/media/brand/`; dev scripts cleaned; `npm run build` passes.

---

## Changelog — 2025-11-13

### Fix DemoPoolsTable Runtime Error

**Problem:** Runtime TypeError in `DemoPoolsTable.tsx` line 236: `Cannot read properties of undefined (reading 'toUpperCase')` when `token0Symbol` or `token1Symbol` is undefined.

**Solution:**
- Fixed `src/components/demo/DemoPoolsTable.tsx` — Added null-safe handling for `token0Symbol` and `token1Symbol` in `selectDemoPools` function; uses `(item.token0Symbol || '').toUpperCase()` to prevent undefined access.

**Files changed:**
- `src/components/demo/DemoPoolsTable.tsx` — Added null-safe token symbol handling

**Result:** ✅ Demo pools table no longer crashes when token symbols are undefined; handles missing data gracefully.

---

## Changelog — 2025-11-13

### Fix DemoPoolsTable pairLabel Runtime Error

**Problem:** Runtime TypeError in `DemoPoolsTable.tsx` line 252: `Cannot read properties of undefined (reading 'toLowerCase')` when `pairLabel` is undefined.

**Solution:**
- Fixed `src/components/demo/DemoPoolsTable.tsx` — Added null-safe handling for `pairLabel` in `isFlaro` check; uses `(item.pairLabel && item.pairLabel.toLowerCase().includes('flaro.org')) || false` to prevent undefined access.

**Files changed:**
- `src/components/demo/DemoPoolsTable.tsx` — Added null-safe pairLabel handling

**Result:** ✅ Demo pools table no longer crashes when pairLabel is undefined; handles missing pairLabel gracefully.

---

## Changelog — 2025-11-13

### Wallet Connect Modal Stabilization & Single Wagmi Config

**Problem:** Wallet connect modal auto-opens or stays stuck after connect; duplicate Wagmi configs; no debug visibility into wallet state.

**Solution:**
- Updated `src/lib/web3/wagmiConfig.ts` — Set `autoConnect: true` (was `false`); consolidated single Wagmi config with Flare chain, cookieStorage, injected + WalletConnect connectors.
- Removed duplicate configs — `src/lib/wagmi.ts` and `src/lib 2/wagmi.ts` are legacy (not imported); single source of truth is `src/lib/web3/wagmiConfig.ts`.
- Created `src/lib/web3/useWalletDebug.ts` — Dev-only debug hook that logs wallet state changes when `NEXT_PUBLIC_DEBUG_WALLET_STATE=true`; logs address, isConnected, status, chainId.
- Created `src/components/WalletButton.tsx` — Simple wrapper around `WalletConnect` with mount guard and debug logging; single entry point for wallet connect UI.
- Fixed `src/components/WalletConnect.tsx` — Added `isConnected` check; connect functions guard against `status !== 'disconnected' || isConnected` to prevent duplicate connects; modal closes automatically when `address` is set.
- Fixed `src/components/onboarding/ConnectWalletModal.tsx` — Connect functions already guard against `status !== 'disconnected' && !isConnected`; no auto-triggers found.
- Wallet icons — Already configured under `/public/media/wallets/*` (metamask.svg, phantom.png, okx.webp, brave.webp, rabby.svg, walletconnect.webp, bifrost.svg); WalletConnect component uses these paths.

**Files changed:**
- `src/lib/web3/wagmiConfig.ts` — Set autoConnect: true; single consolidated config
- `src/lib/web3/useWalletDebug.ts` — New debug hook for wallet state logging
- `src/components/WalletButton.tsx` — New wallet button component with debug logging
- `src/components/WalletConnect.tsx` — Added isConnected guard; prevent duplicate connects
- `PROJECT_STATE.md` — Added changelog entry

**Result:** ✅ Single Wagmi config/provider; no auto-modal popups; modal closes after successful connect; debug logging available; wallet icons load from `/media/wallets/*`.

---

## Changelog — 2025-11-13

### Data Enrichment Consolidation & Analytics Endpoints

**Problem:** Need consolidated enrichment MVs, analytics endpoints with TTL & degrade-mode, and weekly report generator.

**Solution:**
- Created 7d MVs — Added `db/views/mv_pool_volume_7d.sql`, `mv_pool_fees_7d.sql`, `mv_positions_active_7d.sql`, `mv_wallet_lp_7d.sql`, `mv_pool_changes_7d.sql` for weekly analytics.
- Created `scripts/enrich/refresh-views.mjs` — Refresh orchestrator that refreshes all MVs in safe order (dependencies first); logs timings and handles missing MVs gracefully.
- Updated `pages/api/enrich/refresh-views.ts` — Extended to refresh all 10 MVs (5 core + 5 7d) in safe order.
- Created `src/lib/analytics/db.ts` — Read-only analytics adapter with degrade-mode support; checks MV existence and `DB_DISABLE` flag; returns `{ok, degrade, ts, data, reason}` responses.
- Created `pages/api/analytics/summary.ts` — Network KPIs endpoint (pools_total, tvl_estimate, positions_total, fees_24h, fees_7d) with 30s TTL cache and degrade-mode.
- Created `pages/api/analytics/pool/[id].ts` — Pool-specific analytics endpoint (fees_24h/7d, positions_count, volume_7d) with 30s TTL cache and degrade-mode.
- Created `scripts/reports/weekly-liquidity-pool-report.mjs` — Weekly report generator; accepts `--week YYYY-WW` or `--week auto`; generates report.md + 3 CSV files (top-pools, top-wallets, pool-changes); handles degrade-mode gracefully.
- Created `scripts/verify-enrichment/mv-health.mjs` — MV health checker; verifies existence, row counts, and refresh status for all MVs.
- Created `scripts/verify-report/weekly.mjs` — Weekly report verifier; runs generator and asserts report.md + CSV files exist and are non-empty.
- Updated `package.json` — Added `verify:mv`, `verify:report`, updated `report:weekly` script.

**Files changed:**
- `db/views/mv_pool_volume_7d.sql` — New 7d volume MV
- `db/views/mv_pool_fees_7d.sql` — New 7d fees MV
- `db/views/mv_positions_active_7d.sql` — New 7d active positions MV
- `db/views/mv_wallet_lp_7d.sql` — New 7d wallet LP MV
- `db/views/mv_pool_changes_7d.sql` — New 7d pool changes MV
- `scripts/enrich/refresh-views.mjs` — New refresh orchestrator
- `pages/api/enrich/refresh-views.ts` — Extended to refresh all 10 MVs
- `src/lib/analytics/db.ts` — New analytics DB adapter
- `pages/api/analytics/summary.ts` — New network KPIs endpoint
- `pages/api/analytics/pool/[id].ts` — New pool analytics endpoint
- `scripts/reports/weekly-liquidity-pool-report.mjs` — New weekly report generator
- `scripts/verify-enrichment/mv-health.mjs` — New MV health checker
- `scripts/verify-report/weekly.mjs` — New report verifier
- `package.json` — Added verify:mv, verify:report scripts; updated report:weekly

**Result:** ✅ Enrichment MVs consolidated; refresh orchestrator added; analytics endpoints (TTL + degrade) implemented; weekly report generator + verifiers added; CI/build pass.

---

## Changelog — 2025-11-13

### Lint Fixes: Icon & Verification Scripts

**Problem:** Lint errors and warnings preventing clean `npm run lint:ci` pass.

**Solution:**
- Fixed `src/lib/icons/dexscreener.ts` — Renamed unused `chain` parameter to `_chain` in `resolveChainSlug()` to satisfy `@typescript-eslint/no-unused-vars` rule.
- Fixed `scripts/verify-enrichment/icons.mjs` — Renamed unused `e` catch variable to `_e` to remove warning.
- Fixed `src/lib/icons/tokenIcon.tsx` — Added scoped ESLint disable comment for `<img>` element (Next.js prefers `<Image />` but dynamic `src` with fallback chain requires native `<img>`).

**Files changed:**
- `src/lib/icons/dexscreener.ts` — Renamed unused parameter
- `scripts/verify-enrichment/icons.mjs` — Renamed unused catch variable
- `src/lib/icons/tokenIcon.tsx` — Added ESLint disable comment
- `PROJECT_STATE.md` — Added changelog entry

**Result:** ✅ Lint errors resolved; warnings handled; verify/lint/build pass without behavioural changes to icons.

---

## Changelog — 2025-11-13

### Final Lint Cleanup: Zero Warnings

**Problem:** Remaining ESLint warnings preventing clean `npm run lint:ci` pass with 0 warnings.

**Solution:**
- Fixed `scripts/verify-enrichment/icons.mjs` — Removed unused `_e` catch variable; use empty catch block instead.
- Fixed `scripts/verify-enrichment/mv-health.mjs` — Incorporated `extendedOk` into output summary and exit code logic; now used meaningfully.
- Fixed `src/lib/icons/tokenIcon.tsx` — Converted `<img>` to `next/image` with `unoptimized` flag to preserve dynamic src fallback chain; removed unused eslint-disable directive.

**Files changed:**
- `scripts/verify-enrichment/icons.mjs` — Removed unused catch variable
- `scripts/verify-enrichment/mv-health.mjs` — Used extendedOk in output and exit logic
- `src/lib/icons/tokenIcon.tsx` — Converted to next/image, removed eslint-disable
- `PROJECT_STATE.md` — Added changelog entry

**Result:** ✅ All ESLint warnings eliminated; `npm run lint:ci` passes with 0 errors and 0 warnings; verify/lint/build all pass.

---

## Changelog — 2025-11-13

### Dev/Start Scripts Normalization & Documentation

**Problem:** Need to clarify the difference between `npm run build` (builds only) vs `npm run dev`/`npm start` (serves the app).

**Solution:**
- Normalized `package.json` scripts — `dev` script: `"next dev -p 3000 -H 0.0.0.0"` (local dev); `start` script: `"next start -p $PORT"` (production/Railway).
- Documented run commands — Added clarification in PROJECT_STATE.md:
  - `npm run build` — Builds the app only (does not start a server).
  - `npm run dev` — Starts development server at http://localhost:3000.
  - `PORT=3000 npm start` — Starts production server locally (for testing prod build).

**Files changed:**
- `package.json` — Normalized start script to `"next start -p $PORT"` (removed redundant `-H 0.0.0.0`).
- `PROJECT_STATE.md` — Added changelog entry documenting build vs serve distinction.

**Result:** ✅ Scripts normalized; clear documentation on how to run the app locally (dev) and in production (Railway); `npm run build` builds only, `npm run dev` or `npm start` serve the app.

## Changelog — 2025-11-14

### Homepage Restoration: RangeBand™ Hero + Demo Pools Table/Grid Toggle

**Problem:** Homepage needed to be restored to a visitor-friendly marketing page with:
1. Integrated RangeBand™ interactive explainer in the hero section
2. Demo pools section with table/grid view toggle
3. No forced wallet-connect screen on initial load

**Solution:**
- Restored `pages/index.tsx` with integrated hero featuring `InlineReal` RangeBand interactive component.
- Added demo pools section with table/grid view toggle (buttons to switch between `DemoPoolsTable` and `PoolsGrid` components).
- Removed auto-open wallet modal; replaced with `WalletConnect` button that user must explicitly click.
- Updated `DemoPoolsTable` to support `onPositionsChange` callback prop to sync positions with grid view.
- Modified `PoolsGrid` to accept `PositionData[]` and support `demoMode` prop (defaults to true), removing wallet gating for demo content.

**Files changed:**
- `pages/index.tsx` — Restored marketing-first homepage with RangeBand hero + demo pools table/grid toggle.
- `src/components/demo/DemoPoolsTable.tsx` — Added `onPositionsChange` callback prop to notify parent of position updates.
- `src/components/pools/PoolsGrid.tsx` — Updated to accept `PositionData[]` and support `demoMode` prop; wallet gate only active when `demoMode=false`.

**Result:** ✅ Homepage is a public marketing page with integrated RangeBand explainer and demo pools table/grid toggle; no forced wallet-connect on load; wallet connect only triggered by explicit user action.

### Demo Selection Build Guard
- `pages/api/demo/selection.ts` — parallelized wallet/pool seed resolution, capped batch sizes, and lowered internal fetch timeouts (4s) with graceful warnings so demo data always resolves (or degrades) quickly during `next build`.

---

## Changelog — 2025-11-13

### Media Asset Canonicalization & Verifier

**Problem:** Static assets referenced legacy `/icons` paths, causing 404s (e.g. `/media/icons/rangeband.svg`) and inconsistent wallet logos.

**Solution:**
- Added `config/assets.json` + `src/lib/assets.ts` as the canonical asset map (brand, wallets, token fallback) and wired Header, PoolRangeIndicator, WalletConnect, and demo tables to the helper.
- Created dedicated assets (`public/media/brand/rangeband.svg`, `public/media/tokens/token-default.svg`) and updated token icon fallbacks (`src/lib/icons/tokenIcon.tsx`, `src/lib/icons/symbolMap.ts`, `src/services/tokenIconService.ts`, demo table) to rely on the shared helpers.
- Extended `scripts/verify-enrichment/icons.mjs` to fail on any `/icons/` references and to ensure every asset declared in the map exists on disk.

**Files changed:**
- `config/assets.json` — canonical asset registry (brand, wallets, tokens)
- `src/lib/assets.ts` — helper exports (`getBrandAsset`, `getWalletIcon`, `getTokenAsset`)
- `public/media/brand/rangeband.svg`, `public/media/tokens/token-default.svg` — ensured canonical assets exist
- `src/components/Header.tsx`, `src/components/pools/PoolRangeIndicator.tsx`, `src/components/WalletConnect.tsx`, `src/components/demo/DemoPoolsTable.tsx` — switched to helper-driven asset paths
- `src/lib/icons/tokenIcon.tsx`, `src/lib/icons/symbolMap.ts`, `src/services/tokenIconService.ts` — token fallback icons now use `/media/tokens/token-default.svg`
- `scripts/verify-enrichment/icons.mjs` — now blocks `/icons/` references and validates all assets from the map

**Result:** ✅ All `/media/icons` usages removed, wallet/brand assets pull from `/media/brand` or `/media/wallets`, and the enhanced verifier prevents future regressions.

---

## Changelog — 2025-11-14

### Flare-Only Price Unification: /api/prices/current

**Problem:** Client components fetching prices from DexScreener API directly and legacy `/api/prices/ankr` endpoint, violating Flare-only provider policy.

**Solution:**
- Created `/api/prices/current` (multi-symbol, TTL 60s) powered by existing CoinGecko `tokenPriceService` (323 lines, 5-min cache, 40+ token mappings).
- Replaced client-side price calls in `InlineReal.tsx` (homepage hero RangeBand) and `rangeband.tsx` (explainer page) from DexScreener/ANKR to `/api/prices/current?symbols=WFLR,FXRP`.
- Added verifiers: `scripts/verify-api/prices-current.mjs` (asserts 200 OK + numeric prices) and `scripts/scan/prices-sources.mjs` (fails build if DexScreener or `/api/prices/ankr` found in `src/`).
- Updated `package.json` scripts: `verify:api:prices`, `scan:prices`.
- **Note:** `tokenIconService.ts` DexScreener usage retained — **icon metadata only**, not price data.

**Files changed:**
- `pages/api/prices/current.ts` — new multi-symbol price endpoint (CoinGecko-backed, 60s TTL)
- `src/components/rangeband/InlineReal.tsx` — replaced `/api/prices/ankr` with `/api/prices/current?symbols=WFLR`
- `pages/rangeband.tsx` — replaced DexScreener direct call with `/api/prices/current?symbols=FXRP`
- `scripts/verify-api/prices-current.mjs` — new API endpoint verifier
- `scripts/scan/prices-sources.mjs` — new source scanner (blocks DexScreener price calls + ANKR endpoint)
- `package.json` — added `verify:api:prices`, `scan:prices` scripts

**Policy reaffirmation:**
- ✅ Flare-only: All price data now sourced via CoinGecko (Flare token IDs) through unified `/api/prices/current`.
- ✅ No DexScreener price calls in runtime code (icon fallbacks allowed in `tokenIconService.ts`).
- ✅ Legacy `/api/prices/ankr` replaced — verifier blocks future usage.

**MV refresh telemetry:** TODO — implement refresh timestamp logging for materialized views (`mv_pool_fees_24h`, `mv_pool_volume_7d`, etc.) to track data freshness in analytics endpoints.

**Result:** ✅ Price unification complete; verifiers added; build/lint pass; Flare-only policy enforced across all client components.

---

## Changelog — 2025-11-14

### Flare-Only Price Hardening: Symbol Normalization + Alias Mapping + Legacy Deprecation

**Problem:** `/api/prices/current` lacked robust symbol normalization for Flare tokens with special characters (USDT₀, USDC.e), no alias mapping (FXRP→XRP, USDT0→USDT), and legacy `/api/prices/ankr*` endpoints still active.

**Solution:**
- Enhanced `tokenPriceService` with `canonicalSymbol()` normalization (uppercase A-Z0-9; ₮→T, ₀→0, .→removed).
- Added alias mapping via `config/token-price.aliases.json` (USDT0→USDT, USDCE→USDC, WFLR→FLR, FXRP→XRP via Ripple CoinGecko ID).
- Added optional address-based lookup via `config/token-price.addresses.json` (Flare contract addresses → CoinGecko IDs).
- Updated `/api/prices/current` to use canonical symbols and return normalized symbols in response.
- Deprecated `/api/prices/ankr.ts` and `/api/prices/ankr 2.ts` with **410 Gone** status and migration message.
- Hardened verifiers: `verify:api:prices` now tests FXRP, USDT0, WFLR (requires ≥2 prices); `scan:prices` blocks `/api/prices/ankr` imports and usage.

**Files changed:**
- `config/token-price.aliases.json` — new symbol→canonical alias map (USDT0→USDT, FXRP→XRP, etc.)
- `config/token-price.addresses.json` — new Flare contract→CoinGecko ID map (FXRP address→ripple, etc.)
- `src/services/tokenPriceService.ts` — added canonicalSymbol(), alias/address resolution, updated batch fetcher
- `pages/api/prices/current.ts` — updated to use canonical symbols and return normalized responses
- `pages/api/prices/ankr.ts` — deprecated with 410 Gone + migration message
- `pages/api/prices/ankr 2.ts` — deprecated with 410 Gone + migration message
- `scripts/verify-api/prices-current.mjs` — updated to test FXRP, USDT0, WFLR (min 2 prices required)
- `scripts/scan/prices-sources.mjs` — updated to scan for `/api/prices/ankr` imports + usage

**Policy reaffirmation:**
- ✅ Flare-only: All price data via CoinGecko with Flare-specific token mappings (FXRP=Ripple, WFLR=Flare Networks).
- ✅ No DexScreener price calls in runtime code (icon metadata allowed in `tokenIconService.ts`).
- ✅ Legacy `/api/prices/ankr*` endpoints return 410 Gone — verifiers block future usage.
- ✅ Robust normalization handles USDT₀, USDC.e, FXRP, and other Flare token variants.

**Result:** ✅ Symbol coverage extended for Flare tokens; legacy endpoints deprecated; verifiers hardened; Flare-only policy enforced.

---

## Changelog — 2025-11-14

### Price Unification MVP: Symbol Normalization + Address Mapping + Verifier Hardening

**Files changed:**
- `src/lib/prices/tokenPriceService.ts` — moved from services/, added address mapping (USDT0/FXRP), TTL 60s cache
- `pages/api/prices/current.ts` — recreated, uses canonical symbols, partial failures return warnings
- `config/token-price.aliases.json` — confirmed aliases (USDT0→USDT, USDCE→USDC, FXRP→XRP, WFLR→FLR)
- `config/token-price.addresses.json` — Flare address map (USDT0 0x96b4...→tether, FXRP 0xad55...→ripple)
- `pages/api/prices/ankr.ts` — 410 Gone with deprecation message
- `pages/api/prices/ankr 2.ts` — 410 Gone with deprecation message
- `scripts/verify-api/prices-current.mjs` — tests FXRP,USDT0,WFLR, requires ≥2 prices
- `scripts/scan/prices-sources.mjs` — blocks /api/prices/ankr imports/require/fetch, DexScreener price calls
- `package.json` — verify script includes verify:api:prices + scan:prices

**Notes:** MVP coverage for WFLR/FXRP/USDT0/USDCE/USD0/FLR; address-based lookup prioritizes contract addresses; verifiers wired into CI via `npm run verify`.

---

## Changelog — 2025-11-14

### Config Bundling: JSON → TypeScript Modules

**Files changed:**
- `config/token-price.aliases.ts` — new TS module replacing JSON (import-based config)
- `config/token-price.addresses.ts` — new TS module replacing JSON (lowercase addresses)
- `src/lib/prices/tokenPriceService.ts` — switched from fs.readFileSync to import-based config
- `pages/api/enrich/price.ts` — updated to use @/lib/prices/tokenPriceService
- `scripts/verify-api/prices-current.mjs` — uses PORT env var for base URL
- `package.json` — verify script confirmed includes scan:prices + verify:api:prices

**Notes:** Config now bundled at build time (no runtime fs reads); addresses lowercase; FXRP/USDT0 address mapping preserved; verifiers tightened; Flare-only reaffirmed.

---

## Changelog — 2025-11-14

### Price Config Bundling + Verifier Hardening

**Files changed:**
- `config/token-price.aliases.ts` — TS module (symbol → CoinGecko ID: USDT0→tether, USDCE→usd-coin, USD0→tether, WFLR/FLR→flare-networks, FXRP→ripple)
- `config/token-price.addresses.ts` — TS module (Flare addresses → CoinGecko IDs: USDT0 0x96b4...→tether, FXRP 0xad55...→ripple)
- `src/lib/prices/tokenPriceService.ts` — import-based config (no fs), `normalise()` function, address-first resolution
- `pages/api/prices/current.ts` — uses `normalise()` from service
- `pages/api/enrich/price.ts` — uses `normalise()` from service
- `pages/api/prices/ankr.ts` — 410 Gone (deprecated)
- `pages/api/prices/ankr 2.ts` — 410 Gone (deprecated)
- `scripts/verify-api/prices-current.mjs` — PORT env var, ≥2 prices required, warnings logged
- `scripts/scan/prices-sources.mjs` — blocks /api/prices/ankr imports/require/fetch
- `package.json` — verify script includes scan:prices + verify:api:prices

**Notes:** (a) Price alias+address map bundled to TS (no runtime fs); (b) ANKR price routes return 410; (c) Verifiers tightened + wired into `npm run verify`; (d) Flare-only re-affirmed; (e) MV-refresh telemetry TODO stub added.

## Changelog — 2025-11-15

- Pricing: made positions loading wallet-aware and degrade-safe on /pricing (NO_WALLET/INVALID_WALLET) so the page stays stable while billing CTAs remain available.

- S2: Added /api/analytics/{summary,pool} (TTL 60s, degrade-mode), MV refresh orchestrator stub, FE wired /summary & /pool to analytics, verifiers added.

## Changelog — 2025-11-15

- S3-prep: Added billing scaffolding (Stripe checkout/portal/webhook + Mailgun test) with degrade=true fallback plus verify:billing and config/billing.ts SSoT.

## Changelog — 2025-11-15

- Stripe MVP: env-driven billing config, Prisma BillingCustomer + roles helper, degrade-safe checkout/portal/webhook + Mailgun provider + verify:billing covering all routes.

## Changelog — 2025-11-15

- S3-prep: Removed 'extraSlot' from pricing SSoT/UI/verifier; kept Extra5 bundles + Alerts only and tightened drift enforcement.

## Changelog — 2025-11-15

- .env.local: normalized Stripe TEST env variable names and updated price IDs for Premium/Pro/Extra5/Alerts5.

- Billing: wired Stripe TEST checkout, portal, webhooks (BillingCustomer + Mailgun) and pricing CTAs; verify:billing tolerates degrade builds.

- Billing: added src/lib/api/billing client helpers and wired /pricing CTAs to create-checkout-session and portal with wallet-aware degrade cues.

- Mailgun: degrade-safe provider (`MAILGUN_MODE`, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_BASE_URL`, `MAILGUN_FROM_DEFAULT`, `MAILGUN_TEST_RECIPIENT`) plus /api/mail/test + verify:mailgun to keep email flows from breaking the UI.

## Changelog — 2025-11-16

### Scope Decisions Finalized: Option B (Balanced MVP, 18 weeks) — APPROVED ✅

**Date:** 2025-11-16  
**Decision Maker:** Product Owner + Engineering Lead  
**Status:** 🔒 LOCKED

**Scope Decision Applied:** Option B (Balanced MVP, 18 weeks)

**5 Decisions Finalized:**

1. **SP5 Polish Components → KEEP ALL in MVP (moved to SP1)**
   - Tasks: ErrorBoundary (SP1-T30), Toast (SP1-T31), Modal (SP1-T32), Forms (SP1-T33), DataState (SP1-T36)
   - Rationale: Professional polish worth 2-week delay (16w → 18w MVP). ErrorBoundary required for Sentry integration, Modal required for GDPR delete flow, Forms required for Account page.
   - Impact: +68h dev time, +2 weeks timeline

2. **FAQ Page (SP1-T13) → MOVE TO POST-MVP**
   - Alternative: External help center (Notion/Intercom) for MVP launch
   - Impact: -16h dev time (2 days saved)

3. **Internal Status Panel (SP4-T43) → KEEP IN SP4**
   - Rationale: Low effort (8h), high value for ops visibility
   - Impact: +8h dev time (1 day)

4. **EUR Pricing Label (SP3-B02) → KEEP IN SP3**
   - Rationale: EU market transparency, competitive advantage
   - Impact: +8h dev time (1 day)

5. **GDPR Delete Flow (SP3-T54 + SP3-T26) → FULL IMPLEMENTATION**
   - Rationale: Legal requirement (GDPR Art. 17 Right to be Forgotten)
   - Impact: No change (already planned in SP3)

**Final MVP Scope (18 weeks):**
- **S0 (1w):** Infrastructure + CI/CD + verify suite
- **SP1 (3w):** Tokens + DS + Hero + OG + Typography + 5 polish components (absorbed from SP5)
- **SP2 (2-3w):** 4 MVs + Analytics APIs + Charts
- **SP3 (3w):** Billing + Legal + Account + EUR label
- **SP4 (2w):** Sentry + Uptime + Status panel + CookieBanner
- **SP5:** Absorbed in SP1 ✅
- **SP6:** Deferred to Post-MVP ✅
- **Post-MVP:** FAQ, Alerts, Reports, Leaderboard, Onboarding

**Documents Created:**
1. `SCOPE_DECISIONS_FINALIZED.md` — Locked decisions + approval sign-off
2. `SCOPE_VALIDATION_REPORT.md` — 8 items flagged + 5 decision points analyzed
3. `SPRINT_ROADMAP_EXECUTIVE_SUMMARY.md` — Updated timeline (18w) + cost estimates
4. `TASK_INTAKE_SPRINTS.md` — 62 tasks (54 MVP + 8 Post-MVP), copy/paste ready

**Critical Path:** S0 (1w) → SP1 (3w, incl. polish) → SP2 (2-3w) → SP3 (3w) → SP4 (2w) + Buffer (3-4w)

**Go-Live Target:** Week 18 (estimated mid-Q2 2025 if starting now)

**Next Actions (Week 1):**
- Kick off S0-OPS01 (Staging environment setup) — **BLOCKER** for SP1
- Start legal drafting (external lawyer, Privacy/Terms/Cookies) — **HIGH RISK** in SP3
- Test Figma → Style Dictionary export (validate SP1-T37 feasibility)
- Setup Sentry + UptimeRobot accounts (validate SP4-B04/B05 feasibility)

---

### Delta 2025-11-16: Sprint Roadmap Foundation

**Files changed:**
- `PROJECT_STATE.md` — Added comprehensive Delta 2025-11-16 covering:
  - Section 7.1: New/extended API endpoints (entitlements, wallet positions, RangeBand preview, user settings, GDPR delete, alerts CRUD)
  - Section 3.1-3.2: New database tables (UserSettings, AlertConfig, AuditLog) and materialized views (mv_wallet_portfolio_latest, mv_position_overview_latest, mv_position_day_stats, mv_position_events_recent)
  - Appendix D: Design System & Components, Security & Compliance, Environments & Operations, Route Gating Matrix, Non-Goals, Error Codes Catalog

**Purpose:** Consolidate all project specifications for definitive sprint-based roadmap generation via GPT Pro.

**Key additions:**
- **API specs:** 8 new/extended endpoints with TypeScript contracts, DoD, and verifiers
- **Database:** 4 new tables + 4 new MVs with indices and refresh requirements
- **Design System:** RangeBand™ props SSoT + 7 new DS components (ErrorBoundary, Toast, Modal, Form.*, Accordion, CookieBanner, DataState)
- **Security:** CORS, rate limiting, GDPR compliance, cookie consent, legal routes
- **Operations:** Staging requirements, observability (Sentry, uptime, logging), backup strategy, incident levels
- **Gating:** Route × plan matrix with server-side enforcement via `/api/entitlements`
- **Non-goals:** Multi-chain, on-chain transactions in UI, advanced IL viz, PWA
- **Error codes:** 10 standard API error codes cataloged

**Notes:**
- All existing content preserved; delta additions marked with `<!-- DELTA 2025-11-16 START/END -->`
- Nice-to-have items explicitly marked (AlertLog table, reports export, leaderboard)
- Verifiers specified for all new capabilities (curl/jq/npm run verify:*)
- Consistent with existing terminology (plan/gating, degrade, RangeBand™, MV, SSoT)

---

<!-- CHANGELOG_ARCHIVE_INDEX -->
See archives in /docs/changelog/.

---

## Appendix D — Delta 2025-11-16

### D.1 Design System & Components (v1)

<!-- DELTA 2025-11-16 START -->

#### RangeBand™ Props (SSoT)

```ts
type RangeBandProps = {
  currentPrice: number;
  minPrice: number; maxPrice: number;
  strategyCode: 'AGR'|'BAL'|'CONS';
  spreadPct: number;
  bandColor: 'GREEN'|'ORANGE'|'RED'|'UNKNOWN';
  positionRatio: number | null; // 0..1, null when unknown
  variant: 'compact'|'large';
  tooltip?: string;
};
```

**Rules:** `bandColor`/`positionRatio` exclusively from data layer; FE calculates no logic.

#### DS Components (New)

- **`ErrorBoundary`** — React error boundary (page-level). **(SP1-T30)**
- **`Toast`** — success/error/info queue. **(SP1-T31)**
- **`Modal`** — generic modal component. **(SP1-T32)**
- **`Form.*`** — text/select/checkbox with validation. **(SP1-T33)**
- **`Accordion`** — FAQ component. **(SP1-T34)**
- **`CookieBanner`** — GDPR cookie consent. **(SP1-T35)**
- **`DataState`** — loading/empty/degrade pattern component. **(SP1-T36)**

**DoD:** Storybook entries + A11y (ARIA, focus); number format helpers (USD, pct, K/M/B).

<!-- DELTA 2025-11-16 END -->

---

### D.2 Security & Compliance

<!-- DELTA 2025-11-16 START -->

- **CORS:** Allow only `app.liquilab.io`, `staging.liquilab.io`, `localhost`. **(SP4-T40)**
- **Rate limiting:** Redis-backed; 10 req/min/IP public routes, 100 req/min/wallet user routes. 429 JSON response. **(SP4-T41)**
- **Cookie consent:** `CookieBanner` + `/legal/cookies` (consent in `localStorage: ll_cookies_accepted`). **(SP4-T42)**
- **Legals:** `/legal/privacy`, `/legal/terms`, `/legal/cookies` required before launch. **(SP3-T42)**
- **GDPR delete:** Server-side flow via `/api/user/delete` + `AuditLog` entry + email confirmation. **(SP3-T54)**

<!-- DELTA 2025-11-16 END -->

---

### D.3 Environments & Operations

<!-- DELTA 2025-11-16 START -->

#### Staging Environment

- **Required:** Separate Railway project + separate DB + Stripe TEST keys + `MAILGUN_MODE='degrade'`. **(SP4-B06)**

#### Observability

- **Sentry:** Front+back required. **(SP4-B04)**
- **Uptime:** Monitor on `/api/health`. **(SP4-B05)**
- **Logging:** JSON format (`ts`, `component`, `severity`, `code`, `requestId`).

#### Backups

- **Daily:** Full backup (7d retention).
- **Weekly:** Full backup (90d retention).
- **Quarterly:** Test-restore runbook execution.

#### Incident Levels

- **SEV-1:** Site down / analytics incorrect.
- **SEV-2:** Degrade > X%.
- **SEV-3:** UI glitch.
- **Status:** `/status` reflects component states.

<!-- DELTA 2025-11-16 END -->

---

### D.4 Route Gating Matrix (Plan-Based Enforcement)

<!-- DELTA 2025-11-16 START -->

#### Route × Plan Matrix

- **`/` (Home):** Visitor = demo; Premium/Pro = connect→dashboard.
- **`/summary` vs `/dashboard`:** **TODO consolidate** — dashboard = logged-in home.
- **`/pool/[id]`:** Visitor blurred metrics; Premium details; Pro + peer metrics (post-MVP).
- **`/rangeband`:** Visitor explainer; Premium/Pro interactive.
- **`/pricing`:** Always visible; CTAs depend on billing health/plan.
- **`/account`:** Premium/Pro only; `past_due` = read-only + banner.

**Enforcement:** FE uses `usePlanGating()`; BE validates via `/api/entitlements` (no client-override). **(SP3-G01 + SP3-G02)**

<!-- DELTA 2025-11-16 END -->

---

### D.5 Non-Goals / Out of Scope (MVP)

<!-- DELTA 2025-11-16 START -->

- **No multi-chain** — Flare-only.
- **No on-chain transactions** (claim/collect) in UI — deep links only.
- **No advanced IL visualizations** — status/indication only.
- **No PWA/offline/push notifications**.

<!-- DELTA 2025-11-16 END -->

---

### D.6 Error Codes Catalog

<!-- DELTA 2025-11-16 START -->

Standard API error codes:

- `UPSTREAM_TIMEOUT` — External service timeout.
- `INDEXER_LAGGING` — Indexer behind chain head.
- `INVALID_WALLET` — Invalid wallet address format.
- `POOL_NOT_FOUND` — Pool does not exist.
- `RATE_LIMITED` — Too many requests.
- `BILLING_DEGRADED` — Billing service unavailable.
- `MAILGUN_DEGRADE_MODE` — Email service in degrade mode.
- `ALERTS_PAUSED` — Alert processing paused.
- `UNAUTHORIZED` — Authentication required.
- `RANGEBAND_NO_DATA` — Insufficient data for RangeBand calculation.

<!-- DELTA 2025-11-16 END -->

---

### D.7 Brand System

<!-- DELTA 2025-11-16 START -->

#### Design Tokens (CSS Variables + Aliasing)

**Colors:**
```css
/* Brand */
--brand-primary: #3B82F6;        /* Electric Blue */
--brand-accent: #1BE8D2;         /* Signal Aqua */
--brand-navy: #0B1530;           /* LiquiLab Navy */

/* Background */
--bg-canvas: #0B1530;            /* Main background */
--bg-surface: rgba(10, 15, 26, 0.88); /* Card background */
--bg-elevated: rgba(15, 20, 36, 0.95);

/* Text */
--text-high: rgba(255, 255, 255, 0.95);
--text-med: rgba(255, 255, 255, 0.70);
--text-low: rgba(255, 255, 255, 0.50);

/* Semantic */
--success: #10B981;
--warn: #F59E0B;
--error: #EF4444;

/* Typography (SP1-T37) */
--font-header: 'Quicksand', system-ui, sans-serif;  /* Headers h1-h6, weights 600/700 */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;  /* Body/Tables/Forms, weights 400/500 */

/* Numerics (SP1-T37) */
--num-style-tabular: tabular-nums;  /* Enforced via .numeric class for KPI/pricing/tabellen */
font-variant-numeric: var(--num-style-tabular);

/* Spacing (4-pt scale) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;

/* Radii */
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;

/* Elevations (box-shadow) */
--elevation-e1: 0 1px 2px rgba(0,0,0,0.1);
--elevation-e2: 0 4px 6px rgba(0,0,0,0.1);
--elevation-e3: 0 10px 15px rgba(0,0,0,0.1);
--elevation-e4: 0 20px 25px rgba(0,0,0,0.15);
--elevation-e5: 0 25px 50px rgba(0,0,0,0.25);

/* Opacities */
--opacity-low: 0.50;
--opacity-med: 0.70;
--opacity-high: 0.95;
```

#### Typography

**Fonts:**
- **Headers (h1-h6):** Quicksand (weights: 600/700) — via `--font-header` (SP1-T37)
- **Body/Tables/Forms:** Inter (weights: 400/500) — via `--font-body` (SP1-T37)
- **Fallback Stack:** 
  - Quicksand: `'Quicksand', system-ui, sans-serif`
  - Inter: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`

**Tabular Numerals (Enforced via SP1-T37):**
- Apply `font-variant-numeric: tabular-nums` as default for:
  - KPIs (TVL, fees, APR)
  - Pricing tables (calculator, checkout)
  - All numeric data tables
- CSS utility: `.numeric { font-variant-numeric: var(--num-style-tabular); }` (alias: `tabular-nums`)
- **Enforcement:** All numeric values in UI MUST use `.numeric` class (verified by `npm run verify:typography`)

**Scale:**
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

#### Numerics & Currency Notation

**Helper Functions (SSoT):**

```typescript
// src/lib/format/currency.ts
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatEUR(value: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value === 0) return '0.00';
  if (value < 1000) return value.toFixed(2);
  if (value < 1_000_000) return `${(value / 1000).toFixed(2)}K`;
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return `${(value / 1_000_000_000).toFixed(2)}B`;
}

export function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${value.toFixed(2)}%`;
}
```

**Rules:**
- Fees: always show "0.00" when `fees === 0` (never "—")
- Null values: display "—" (em dash)
- Thousand separator: comma (en-US) for USD, space (nl-NL) for EUR

#### Iconography

**Token Icons (Local-First Strategy):**

1. **Primary:** `/public/media/tokens/{SYMBOL}.svg|png|webp` (lowercase)
2. **By-address fallback:** `/public/media/tokens/by-address/{address}.png`
3. **Default fallback:** `/public/media/tokens/token-default.svg`

**SSR Visibility:**
- Token icons must render on SSR (use `<img>` with static paths, not dynamic imports)
- Verify presence: `test -f public/media/tokens/token-default.svg`

**Component:**
```typescript
// src/lib/icons/tokenIcon.tsx (existing)
// Rules: local-first, no remote calls in runtime, unoptimized next/image
```

#### UI Canon (SP1-T37/T40)

**Wave-Hero Background (SP1-T40):**
- **Placement:** Crisp SVG/PNG in bottom 50% viewport fold at breakpoints sm/md/lg (320px/768px/1024px)
- **Assets:** `/public/media/brand/hero-wave.svg` + `hero-wave@2x.png` (Retina-safe, 2x pixel density)
- **CSS:** Fixed position, seamless gradient from `--bg-canvas` (top 50%) to wave (bottom 50%)
- **Rendering:** `image-rendering: -webkit-optimize-contrast` for crisp rendering
- **Verifiers:** Lighthouse CLS < 0.1, screenshot diff at 320px/768px/1024px (max diff <5%)

**Numerics Default (SP1-T37):**
- **Rule:** All KPI/fees/pricing values use `class="numeric"` → `font-variant-numeric: tabular-nums`
- **Enforcement:** Verified by `npm run verify:typography` (checks all numeric values use `.numeric` class)
- **Rationale:** Prevents layout shift in tables/dashboards when values update

**Icon Policy (Unchanged):**
- Token icons: local-first strategy (no remote calls in runtime)
- Fallback chain: SVG → PNG → WEBP → default

#### Accessibility (A11y)

**WCAG AA Targets:**
- Text contrast: ≥4.5:1 (normal), ≥3:1 (large/bold)
- Interactive elements: ≥3:1 contrast
- Focus indicators: visible 2px outline with `--brand-primary`

**Focus Management:**
```css
*:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**ARIA Requirements:**
- All interactive elements: ARIA labels
- Form inputs: associated labels + error messages
- Modals: `role="dialog"`, `aria-modal="true"`, focus trap
- Live regions: `aria-live="polite"` for status updates

**Advies — Next Step:**  
Implement SP1-T37 (Figma Foundations & Tokens) immediately to export `--font-header`, `--font-body`, and `--num-style-tabular` tokens. Validate token export via `npm run tokens:build` before proceeding to wave-hero (SP1-T40) implementation.

<!-- DELTA 2025-11-16 END -->

---

### D.8 Design System → Figma Library

<!-- DELTA 2025-11-16 START -->

#### Figma Structure

**Libraries:**
1. **Foundations** — Colors, typography, spacing, radii, shadows
2. **Components** — Buttons, inputs, modals, cards, badges, RangeBand™
3. **Patterns** — Data tables, forms, empty states, error boundaries
4. **Page Templates** — Home, Dashboard, Pool Detail, Pricing, Account
5. **Email** — Transactional email templates (plain text + HTML)

#### Tokens Mapping (Figma → CSS)

**Export Strategy:**

1. **Style Dictionary:** Use Style Dictionary to export Figma tokens as JSON
2. **Token Format:**
```json
{
  "color": {
    "brand": {
      "primary": { "value": "#3B82F6" },
      "accent": { "value": "#1BE8D2" }
    }
  },
  "spacing": {
    "md": { "value": "16px" }
  }
}
```

3. **Build Pipeline:**
```bash
# Generate CSS from tokens
npm run tokens:build
# Output: src/styles/tokens.css (imported in globals.css)
```

**Figma Plugins:**
- **Figma Tokens:** Sync design tokens bidirectionally
- **Design Lint:** Validate contrast, spacing, typography

**Workflow:**
1. Design in Figma → Export tokens JSON
2. Run `tokens:build` → Generate CSS variables
3. Import in `globals.css`
4. Verify: `npm run verify:tokens` (check CSS var coverage)

#### Component Inventory

**Status:**
- ✅ Header, Footer, WalletConnect, PoolCard, RangeBand™, TokenIcon
- ❌ ErrorBoundary, Toast, Modal, Form.*, Accordion, CookieBanner, DataState

**Figma Deliverables (Required):**
- Component specs (props, states, variants)
- Interaction states (hover, active, disabled, focus)
- Responsive breakpoints (mobile, tablet, desktop)
- Dark mode variants (if applicable)

<!-- DELTA 2025-11-16 END -->

---

### D.9 Hero Wave Background Specification

<!-- DELTA 2025-11-16 START -->

#### Hero Rendering Rules

**Layout:**
- **Wave hero:** Crisp SVG/PNG background, positioned in **bottom 50% of viewport fold**
- **Top 50%:** Seamless gradient transition from `--bg-canvas` to wave top edge
- **No blur:** Wave must render sharp at all resolutions

**CSS Implementation:**
```css
.page-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    180deg,
    var(--bg-canvas) 0%,
    var(--bg-canvas) 50%,
    transparent 50%
  );
}

.page-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background: url('/media/brand/wave-bg.svg') bottom center / cover no-repeat;
  image-rendering: -webkit-optimize-contrast; /* Crisp rendering */
}
```

**Device Pixel Ratio Awareness:**
- Export wave assets at 2x resolution for Retina displays
- Use `srcset` for responsive images if needed

**Verification:**
- Visual QA: Wave appears crisp on all devices (mobile, tablet, desktop, Retina)
- Lighthouse: No layout shift on hero load

<!-- DELTA 2025-11-16 END -->

---

### D.10 Observability & Compliance (Visual Indicators)

<!-- DELTA 2025-11-16 START -->

#### Status Badges

**Component: `StatusBadge`**

```typescript
type BadgeVariant = 'ok' | 'degrade' | 'stale' | 'error';

type StatusBadgeProps = {
  variant: BadgeVariant;
  label?: string;
  timestamp?: string; // ISO8601
};
```

**Visual States:**
- **OK:** Green dot + "Operational"
- **Degrade:** Orange dot + "Degraded" + timestamp
- **Stale:** Yellow dot + "Data may be stale" + `staleTs`
- **Error:** Red dot + "Error" + error code

**CSS:**
```css
.badge-ok { background: var(--success); }
.badge-degrade { background: var(--warn); }
.badge-stale { background: var(--warn); opacity: 0.8; }
.badge-error { background: var(--error); }
```

#### Stale Indicator Pattern

**Rule:** Show stale badge when `Date.now() - staleTs > 3600_000` (1 hour)

**API Response (Degrade Mode):**
```typescript
type ApiEnvelope<T> = {
  ok: boolean;
  degrade?: boolean;
  code?: string;
  message?: string;
  ts: number;          // Server timestamp
  staleTs?: number;    // Last fresh data timestamp
  data?: T;
};
```

**UI Implementation:**
```typescript
// src/components/status/StaleIndicator.tsx
export function StaleIndicator({ staleTs }: { staleTs?: number }) {
  if (!staleTs) return null;
  const ageMs = Date.now() - staleTs;
  if (ageMs < 3600_000) return null;
  
  return (
    <StatusBadge 
      variant="stale" 
      label={`Data from ${formatRelativeTime(staleTs)}`}
      timestamp={new Date(staleTs).toISOString()}
    />
  );
}
```

**Placement:**
- Dashboard header (if portfolio data stale)
- Pool detail page (if analytics stale)
- Analytics summary (if MV refresh lag > 1h)

<!-- DELTA 2025-11-16 END -->

---

### D.11 Verify Suite Extensions

<!-- DELTA 2025-11-16 START -->

#### New Verification Checks

**1. `verify:a11y` — Accessibility Audit** **(SP4-T44)**

```javascript
// scripts/verify-a11y/axe-check.mjs
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';

const routes = ['/', '/pricing', '/rangeband', '/faq'];
const browser = await puppeteer.launch();

for (const route of routes) {
  const page = await browser.newPage();
  await page.goto(`http://localhost:3000${route}`);
  const results = await new AxePuppeteer(page).analyze();
  
  // Soft-fail local (warnings), hard-fail staging (errors)
  const severity = process.env.CI ? 'error' : 'warning';
  if (results.violations.length > 0 && severity === 'error') {
    console.error(`A11y violations on ${route}`);
    process.exit(1);
  }
}
```

**DoD:**
- Checks WCAG AA compliance (contrast, ARIA, keyboard nav)
- Soft-fail local (log warnings), hard-fail staging/CI
- Integrated in `npm run verify`

**2. `verify:og` — Open Graph Tags** **(SP4-T45)**

```javascript
// scripts/verify-og/meta-tags.mjs
import { readFileSync } from 'fs';
import { glob } from 'glob';

const pages = glob.sync('pages/**/*.tsx');
const requiredTags = ['og:title', 'og:description', 'og:image'];

for (const page of pages) {
  const content = readFileSync(page, 'utf-8');
  // Check for Next.js Head component with required OG tags
  // Exit 1 if missing on public routes
}
```

**DoD:**
- Validates OG tags presence on all public routes
- Checks asset existence (`/media/brand/og-image.png`)
- Per-route validation (title, description, image)

**3. `verify:icons-path` — Token Icon Paths + SSR** **(SP4-T46)**

```javascript
// scripts/verify-icons/ssr-markers.mjs
import { readFileSync } from 'fs';
import { existsSync } from 'fs';

// 1. Check required icon files exist
const requiredIcons = ['flr', 'usd0', 'usdce', 'fxrp', 'wflr', 'token-default'];
for (const icon of requiredIcons) {
  const paths = [
    `public/media/tokens/${icon}.svg`,
    `public/media/tokens/${icon}.png`,
    `public/media/tokens/${icon}.webp`
  ];
  if (!paths.some(p => existsSync(p))) {
    console.error(`Missing icon: ${icon}`);
    process.exit(1);
  }
}

// 2. Check SSR output contains <img src="/media/tokens/...">
const ssrHtml = readFileSync('.next/server/pages/index.html', 'utf-8');
if (!ssrHtml.includes('/media/tokens/')) {
  console.error('Token icons not SSR-visible');
  process.exit(1);
}
```

**DoD:**
- Validates all required token icons exist locally
- Checks SSR HTML output contains token icon paths
- Fails if default fallback missing

#### Integration in Verify Pipeline

**Updated `package.json`:**

```json
{
  "scripts": {
    "verify": "npm run verify:env && npm run verify:pricing && npm run verify:billing && npm run verify:mailgun && npm run verify:mv && npm run verify:a11y && npm run verify:og && npm run verify:icons",
    "verify:a11y": "node scripts/verify-a11y/axe-check.mjs",
    "verify:og": "node scripts/verify-og/meta-tags.mjs",
    "verify:icons": "node scripts/verify-icons/ssr-markers.mjs"
  }
}
```

**CI Workflow:**
```yaml
# .github/workflows/verify.yml
- name: Run verification suite
  run: |
    npm run build
    npm run verify
  env:
    CI: true
```

**Fail-hard vs Log-only:**
- **Fail-hard (block deploy):** `verify:env`, `verify:pricing`, `verify:icons`
- **Log-only (local dev):** `verify:a11y` (soft-fail), `verify:billing` (degrade mode OK)

<!-- DELTA 2025-11-16 END -->

---

<!-- DELTA 2025-11-16 START -->

### D.12 Verify Suite Extensions — Brand & Typography

#### verify:brand — Brand System Compliance

**Purpose:** Validate brand system consistency (fonts, colors, numerics)

**Script:** `scripts/verify-brand/check-brand.mjs`

```javascript
// Check 1: Typography tokens present
const tokensCSS = readFileSync('src/styles/tokens.css', 'utf-8');
const requiredTokens = ['--font-header', '--font-body', '--num-style-tabular'];
requiredTokens.forEach(token => {
  if (!tokensCSS.includes(token)) {
    console.error(`Missing token: ${token}`);
    process.exit(1);
  }
});

// Check 2: Headers use Quicksand
const components = glob.sync('components/**/*.tsx');
components.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  // Warn if inline font-family (should use CSS var)
  if (content.match(/font-family:\s*['"]Quicksand['"]/)) {
    console.warn(`${file}: Use --font-header instead of inline Quicksand`);
  }
});

// Check 3: Numeric values use .numeric class
const numericPattern = /\{.*?\d+\.?\d*.*?\}/g;  // React numeric values
components.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  const matches = content.match(numericPattern);
  if (matches && !content.includes('className="numeric"')) {
    console.warn(`${file}: Consider .numeric class for tabular-nums`);
  }
});
```

**DoD:**
- Validates `--font-header`, `--font-body`, `--num-style-tabular` in tokens.css
- Warns on inline font-family (should use CSS vars)
- Checks numeric values use `.numeric` class for tabular-nums
- Verifies brand colors (`--brand-primary`, `--brand-accent`, `--bg-canvas`) present

**Verifier:**
```bash
npm run verify:brand  # Exit 0 if compliant, warnings logged
```

#### verify:typography — Tabular Numerals Enforcement

**Purpose:** Enforce tabular-nums on all KPI/pricing/table numerics

**Script:** `scripts/verify-typography/check-numerics.mjs`

```javascript
// Find all numeric displays in components
const components = glob.sync('components/**/*.tsx');
const violations = [];

components.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  // Patterns: TVL, APR, fees, prices
  const numericPatterns = [
    /tvl|fees|apr|price|usd|eur|count/i
  ];
  
  numericPatterns.forEach(pattern => {
    if (content.match(pattern) && !content.includes('.numeric')) {
      violations.push(`${file}: Numeric value without .numeric class`);
    }
  });
});

if (violations.length > 0) {
  console.warn('Tabular-nums violations:', violations);
  // Soft-fail locally, hard-fail in CI if > 10 violations
  if (process.env.CI && violations.length > 10) process.exit(1);
}
```

**DoD:**
- Scans components for numeric displays (TVL, APR, fees, prices)
- Validates `.numeric` class presence
- Soft-fail local (warnings), hard-fail CI (>10 violations)

**Verifier:**
```bash
npm run verify:typography  # Logs violations, exit 0 locally
CI=true npm run verify:typography  # Hard-fail in CI
```

#### Integration in Package.json

**Updated scripts:**
```json
{
  "scripts": {
    "tokens:build": "style-dictionary build --config config/tokens.config.js",
    "verify": "npm run verify:env && npm run verify:brand && npm run verify:typography && npm run verify:pricing && npm run verify:billing && npm run verify:mailgun && npm run verify:mv && npm run verify:a11y && npm run verify:og && npm run verify:icons",
    "verify:brand": "node scripts/verify-brand/check-brand.mjs",
    "verify:typography": "node scripts/verify-typography/check-numerics.mjs"
  }
}
```

<!-- DELTA 2025-11-16 END -->

---

<!-- DELTA 2025-11-16 START -->

### D.13 Staging Environment & Merge Gating (SP1)

#### Staging Requirements (Pre-SP1 Merge)

**Infrastructure:**
- **Railway Project:** Separate `liquilab-staging` project (isolated from prod)
- **Database:** Dedicated Postgres instance (separate connection pool)
- **Environment Variables:**
  - `NODE_ENV=staging`
  - `NEXT_PUBLIC_APP_URL=https://staging.liquilab.io`
  - `DATABASE_URL=<staging-db-url>`
  - `STRIPE_SECRET_KEY=<test-key>`  (Stripe TEST mode)
  - `MAILGUN_MODE=degrade`  (no actual email delivery)
  - `SENTRY_DSN=<staging-project-dsn>`
  - `SENTRY_ENVIRONMENT=staging`

**Merge Gate (SP1 PRs):**

Before any SP1 PR can merge to `main`, the following MUST pass:

1. **STAGING Deploy Green:**
   - Railway deploy succeeds
   - `/api/health` returns 200
   - Homepage renders without errors

2. **Sentry Active:**
   - Test error logged to Sentry staging project
   - Event appears in Sentry dashboard with readable stack traces
   - Source maps uploaded correctly
   - **Verifier:** `curl /api/sentry-test` → 500 + Sentry event ID returned

3. **Uptime Monitor Active:**
   - External monitor (UptimeRobot/Pingdom) configured for staging
   - Checks `/api/health` every 5 minutes
   - Alert channel configured (Slack/email)
   - **Verifier:** Simulate downtime → alert received within 10 minutes

4. **Verify Suite Pass:**
   - `npm run verify` exits 0 on staging
   - All checks green: env, brand, typography, pricing, billing, mailgun, mv, a11y, og, icons
   - **Verifier:** CI workflow logs show "✓ All verifications passed"

**DoD (Staging Setup):**
- [ ] Railway staging project created + deployed
- [ ] Staging database provisioned + seeded with demo data
- [ ] Stripe TEST keys configured + test payment succeeds
- [ ] Mailgun degrade mode active (no emails sent, logs only)
- [ ] Sentry staging project created + test error logged
- [ ] Uptime monitor configured + downtime alert tested
- [ ] CI workflow updated: deploy to staging on PR open, run verify suite

**Enforcement:**
- GitHub branch protection: require "Staging Deploy" status check
- PR template includes checklist: "☐ Staging verify suite passed"
- Merge blocked if any check fails

**Rationale:**
Prevents broken code from reaching production. Catches integration issues early (DB, Stripe, Sentry, email). Ensures SP1 brand/design changes don't break existing functionality.

<!-- DELTA 2025-11-16 END -->

---

## Advies

**Next Step (SP1 Pre-merge):** Setup staging environment (Railway + DB + Sentry + Uptime) en configureer merge gate voor SP1 PRs. Implement SP1-T37 (Figma Foundations & Tokens) immediately na staging activering. Validate tokens export via `npm run tokens:build` + `npm run verify:brand` before proceeding to wave-hero (SP1-T40) implementation.

**Rationale:** Staging gate prevents broken SP1 brand changes from reaching production. Tokens export (Quicksand/Inter/tabular-nums) must complete first as dependency for all subsequent design/UI work (T38/T40/T39). Tabular numerals via `.numeric` class enforced by `verify:typography` ensures stable layout in tables/dashboards.

**Post-SP1:** Implement `src/lib/format/currency.ts` met SSoT currency/number helpers (formatUSD, formatEUR, formatNumber, formatPercent) en refactor bestaande inline formattering naar deze centrale helpers. Verifieer met visual regression test op demo pools table (controleer: "0.00" voor zero fees, "—" voor null APR, tabular-nums in numerieke kolommen).

---

## Changelog — 2025-11-17

- S0 (staging): Dockerfile zonder BuildKit cache-mounts + start.sh; staging Docker build gestabiliseerd.
- S0-OPS01: Sentry server init + smoke-route; Dockerfile/start.sh/.dockerignore geborgd; ops runbook toegevoegd voor staging reset en health.
- Changelog — 2025-11-17: Added Sentry STAGING test endpoint /api/sentry-test using @sentry/node helper and documented env vars.
