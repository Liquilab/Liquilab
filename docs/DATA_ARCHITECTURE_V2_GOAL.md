# Liquilab Data Architecture — V2 Goal Model (Fact + Daily Aggregate)

## 1) Current MVP Architecture (short recap)
- Path today: `PoolEvent`/`PositionEvent`/`PoolState` → 7d materialized views (fees/volume/changes) → Strategy C endpoints (`/api/analytics/pool`) → Universe/Pro views.
- **Production SSoT (MVP):** The existing PoolEvent + 7d-MV chain remains the source of truth for Liquilab Pro/Premium.
- Live follower: Flare public RPC only. Backfills/one-offs: ANKR Flare RPC only (ANKR_NODE_URL).

## 2) Target V2 Architecture (Fact + Daily Aggregate)
- Canonical fact tables:
  - `fact_swap` — normalized swaps with `fee_usd`/`volume_usd`, timestamp-based.
  - `fact_reward` — all incentives (Enosys, SparkDEX, future) with a `source` column.
  - `fact_pool_snapshot` — TVL snapshots from on-chain reserves.
  - `fact_position_snapshot` — optional, for IL/P&L and per-position analytics.
  - `dim_pool`, `dim_token`.
- Aggregate layers:
  - `agg_pool_daily` — per pool, per day: `fees_usd`, `volume_usd`, `incentives_usd`, `avg_tvl_usd`, `swap_count`.
  - Optional `agg_position_daily` — positions/wallets/IL rollups.
- Time semantics:
  - Windows (24h/7d/30d/90d) are query-time sums over daily buckets (wall-clock timestamps, not block deltas).
  - TVL SSoT = pool snapshots (on-chain), **not** event reconstruction.

## 3) Relationship to MVP
- MVP stays on the existing PoolEvent + 7d-MV chain; no refactor now.
- V2 architecture is a “north star” only; implementation deferred.
- Golden pairs (STXRP/FXRP, WFLR/USDT0, FXRP/USDT0 on Enosys + SparkDEX) validate both MVP and future V2 metrics.

## 4) Migration Strategy (Once Grant is Approved)
- Phase 0: Design & schema review only.
- Phase 1: Dual-write facts (`fact_swap`, `fact_reward`, `fact_pool_snapshot`) while keeping current tables/MVs as SSoT.
- Phase 2: Build `agg_pool_daily` + debug/compare V1 vs V2 on golden pairs.
- Phase 3: Switch read path (`getPoolHeadMetrics`/`getPoolUniverseHead`) to V2 aggregates after validation.
- Phase 4: Retire old MVs and staging tables after a cooling-off period.
- RPC policy: live follower = Flare public RPC; ANKR only for controlled backfills.

## 5) Future Extensions
- IL/APR from `fact_position_snapshot`.
- Alerts and Weekly reports should reuse the same aggregates (no parallel pipelines).

