# HANDOVER_TO_GPT.md

**Date:** 2025-12-05
**Urgency:** HIGH (Blocking CTA unification)
**Status:** Failed to create shared CTA component due to missing anchor text.

---

## Problem

The input CTA_TEXT `"Start 14-day Pro trial"` was NOT found in the codebase.
The instructions strictly required finding this exact text to proceed with unification.

---

## Findings

**Searched for:** `"Start 14-day Pro trial"`

**Exact matches:** 0

**Near matches found:**
- `"Start 14 day trial"`
  - `src/components/hero/Hero.tsx` (line 52)
- `"Start 14-day free trial"`
  - `src/components/pricing/PremiumCard.tsx` (line 157)
- `"Start free trial"`
  - `pages/rangeband.tsx` (line 141) — Note: context mentions "14-day free trial".
- `"Start 14-day trial"`
  - `pages/pricing-lab.tsx` (line 492)

---

## Suggested Follow-up

1.  **Clarify the intended source text:**
    - Should I unify *all* the above variations to `"Start 14-day Pro trial"`?
    - Or was the input text slightly incorrect (e.g. should have been "Start 14-day free trial")?

2.  **Proposed Action:**
    - Run again with `CTA_TEXT` set to one of the existing strings (e.g. `"Start 14-day free trial"`).
    - Or provide an explicit instruction to "Replace ALL near-match variations with 'Start 14-day Pro trial'".

---

## Current state — Data/Analytics
- MVP SSoT = current PoolEvent + 7d-MV chain (fees/volume/changes) powering Strategy C endpoints and Universe/Pro views; this remains production until further notice.
- V2 target (design-only) = fact_swap/fact_reward/fact_pool_snapshot (+ fact_position_snapshot) with agg_pool_daily; see `docs/DATA_ARCHITECTURE_V2_GOAL.md` for the canonical goal model.

## Enosys PoolEvent Backfill Tooling — 2025-12-09

- Previous issue: ANKR scans for Enosys pools (factory 0x17aa157ac8c54034381b840cb8f6bf7fc355f0de) hit RpcRequestError -32062 “Block range is too large”; golden Enosys pools (WFLR/USDT0, FXRP/USDT0, STXRP/FXRP) had zero PoolEvent swaps in the last 7d so fee MVs and analytics showed 0.
- New behaviour: RpcScanner now caps blockWindow per provider (Flare public 25, ANKR Flare 2000, generic 1000) using effectiveBlockWindow = min(requested, providerCap). `backfill:enosys:pools` discovers Enosys factory pools (optional --pool), defaults blockWindow=1000/rps=8/concurrency=6, and tail-scans from last Swap+1 or fallback 51,300,000; `debug:enosys:events` reports per-pool swap/mint/burn/collect counts, min/max blocks, window flag, and status (OK/WARN_OUTSIDE_WINDOW/WARN_NO_EVENTS).
- Next manual steps: set `ANKR_NODE_URL` + `DATABASE_URL`; run `npm run backfill:enosys:pools -- --blockWindow=1000 --rps=8 --concurrency=6` (optionally `--pool=<addr>`), then refresh fee MVs, run `npm run debug:enosys:events`, and validate mv_pool_fees_24h/7d and analytics fees for the golden pools.

---

## SparkDEX Tail Backfill & Fees — 2025-12-09

- Backfill changes: `backfill:sparkdex:tail` now restricts to the four golden SparkDEX pools (factory 0x8a2578d23d4c532cc9a98fad91c0523f5efde652), with defaults blockWindow=5000, rps=24, concurrency=8; per-pool fromBlock=max(last_swap_block, 40,000,000) → latestBlock; optional `--pool` to target one pool; RpcScanner provider caps apply (ANKR preferred).
- Fee audit changes: `debug:sparkdex:fees-audit` now reports swap_total, swap_7d, last_swap_block, window flag, mv_pool_fees_24h/7d presence, head fees24hUsd/fees7dUsd, and status (OK, WARN_OUTSIDE_WINDOW, WARN_FEES_ZERO, ERROR); exits non-zero when swaps are in-window but fees stay zero.
- Next manual steps: set `ANKR_NODE_URL` + `DATABASE_URL`; run `npm run backfill:sparkdex:tail -- --blockWindow=5000 --rps=24 --concurrency=8` (optionally `--pool=<addr>`), then `npm run db:mvs:refresh:7d`, followed by `npm run debug:sparkdex:fees-audit` and `npm run debug:universe:golden` to confirm SparkDEX fees populate or are marked OUTSIDE_WINDOW.

---

## Incentives Data Wiring — rFLR & SPX (2025-12-07)

### Problem
Generic incentives model (incentivesUsd + breakdown) exists in types, but no end-to-end wiring from rFLR/SPX reward sources (Enosys API, SparkDEX TokenDistributor) into enrichment/DB/analytics responses. Incentives currently surface as zero/omitted in pool/position analytics.

### Repro / Context (current analytics path)
- Pool analytics API: `pages/api/analytics/pool/[id].ts` calls `getPoolHeadMetrics` and `getPoolUniverseHead` from `src/lib/analytics/db.ts`. Responses include TVL, fees (24h/7d), positions, wallets; **no incentives fields**.
- Positions/summary helpers: `src/lib/positions.ts`, `src/lib/positions/server.ts` compute rewards as fees + incentives, but incentives fall back to legacy rflr fields; no real incentives feed is mapped in.
- Types: `src/types/positions.ts` now has `incentivesUsd` + optional `incentivesBreakdown`; legacy `rflrRewardsUsd` marked legacy.
- Staking SSoT: `src/indexer/config/stakingContracts.ts` defines `StakingRewardsConfig` for:
  - Enosys rFLR (API): pseudo-address `enosys-rflr-api`, apiUrl `https://v3.dex.enosys.global/api/flr/v2/stats/rflr`, rewardTokenSymbol `rFLR`.
  - SparkDEX TokenDistributor (SPX + rFLR): distributor `0xc2DF11C68f86910B99EAf8acEd7F5189915Ba24F`, SPX token `0x657097cC15fdEc9e383dB8628B57eA4a763F2ba0`, rFLR placeholder token address.
- DB/views: `db/views/` contains fees/liquidity/positions MVs (e.g., mv_pool_fees_24h/7d, mv_pool_liquidity, mv_position_lifetime_v1) but **no incentives/rewards views**.
- TokenDistributor ABI present: `src/indexer/abis/tokenDistributor.ts` (covers SPX/rFLR distributions).

### Observed vs Expected
- Expected: incentivesUsd/breakdown populated from real rFLR (and later SPX/APS) rewards and exposed via pool/position analytics.
- Observed: incentives not present in analytics responses; no DB view or enrichment step producing incentives totals; indexer config knows about reward sources but ingestion/aggregation is not wired.

### Root-cause hypotheses
1) No ingestion of TokenDistributor reward events into a rewards table/view.
2) Enosys rFLR API not integrated into enrichment pipeline; data never stored or mapped.
3) Analytics services (`lib/analytics/db.ts`) only read fees/liquidity/positions views; incentives MVs or join logic absent.
4) Price conversion for incentives tokens (rFLR/SPX) not applied, so incentivesUsd cannot be computed.

### Proposed design (stepwise, schema-aligned)
1) **Ingest rewards (read path)**  
   - SparkDEX TokenDistributor: add indexer/enrichment step to pull distributor events (address: 0xc2DF...24F), attribute to pools/pairs, store per-pool reward amounts (by token) with timestamps.  
   - Enosys rFLR API: scheduled fetch to store per-pool/per-position reward amounts (rFLR) with timestamps.
2) **Aggregate per window**  
   - Create or extend a rewards MV (per pool, per token, per window: 24h/7d) using stored reward events/API snapshots. Sum token amounts and compute USD using existing price/oracle helpers.
3) **Expose via analytics**  
   - In `lib/analytics/db.ts` pool head/universe: join rewards MV to produce `incentivesUsd` (total) and optional breakdown (tokenSymbol, amount, amountUsd) per pool and per pair.  
   - In position analytics (where applicable): map position-level rewards (from API/TokenDistributor or aggregated per position) into `incentivesUsd`/`incentivesBreakdown`.
4) **API surface**  
   - Extend analytics response types to include incentives fields (pool/position), defaulting to 0/[] when unavailable.
5) **Verification**  
   - Validate on a busy pool (e.g., WFLR/FXRP) with known rewards; compare against DEX UI/APIs.

### Current state (2025-12-09)
- Pool head + Universe: incentives24hUsd/incentives7dUsd now flow through getPoolHeadMetrics and getPoolUniverseHead (Enosys rFLR MVs with amount_usd; SparkDEX TokenDistributor priced at query time). API/types expose incentives on universe summary; `scripts/debug/universe-golden-pairs.mts` reports incentives with ZERO_WITH_REWARDS vs ZERO_NO_REWARDS.
- Position-level incentives: still TODO (no per-position rewards surfaced; keep incentives fields zeroed in positions).
- Staking RPC/defaults: ANKR-first RPC, provider caps (Flare≤25, ANKR=2000, generic=1000); staking defaults blockWindow=5000/rps=25/concurrency=12. Default scan window now starts ~90 days back (latestBlock−~650k, bounded by genesis) when --from is not provided.

### Evidence (file paths)
- Pool API: `pages/api/analytics/pool/[id].ts`
- Analytics core: `src/lib/analytics/db.ts` (TVL/fees/positions; no incentives)
- Position types/helpers: `src/types/positions.ts`, `src/lib/positions.ts`, `src/lib/positions/server.ts`
- Staking SSoT: `src/indexer/config/stakingContracts.ts`
- TokenDistributor ABI: `src/indexer/abis/tokenDistributor.ts`
- Views: `db/views/*.sql` (fees/liquidity/positions; no incentives)

### Remaining issues / Risks
- No existing schema/MV for incentives; requires careful design to avoid double-counting and to align with time windows.
- Token price sourcing for rFLR/SPX must reuse existing price service (FTSO/CoinGecko) to avoid hardcoding.
- Mapping rewards to pools/pairs may need on-chain pool lookup for distributor events.

### Triage plan (implementation order)
1) Implement rewards ingestion (TokenDistributor + Enosys API) into a staging table or reuse existing raw events with a rewards view.
2) Build rewards aggregation MV (per pool, per token, per window) with USD conversion.
3) Wire analytics services to surface incentivesUsd/breakdown (pool/position) and extend API responses.
4) Validate against a known rewarded pool; then extend to additional reward tokens (APS).

### Ask for GPT (future prompts)
- “Implement TokenDistributor rewards ingestion → rewards MV → incentivesUsd/breakdown for pools.”
- “Integrate Enosys rFLR API rewards into the same rewards MV and analytics responses.”
- “Extend pool/position analytics APIs to return incentives fields and add tests.”

### Urgency
High for Universe/Pro metrics accuracy (TVL/APR completeness); needed for investor/ops dashboards where incentives materially affect APR.

### SparkDEX Incentives Mapping — 2025-12-08

**Current state (SparkDEX)**
- Ingestion: SparkDEX pools/events indexed via NFPM/pool scanners; stakingContracts.ts lists TokenDistributor 0xc2DF11C68f86910B99EAf8acEd7F5189915Ba24F (SPX + rFLR), but no indexer job ingests distributor events.
- DB/views: Analytics rely on fee/liquidity/position MVs (mv_pool_fees_24h/7d, mv_pool_liquidity, mv_position_lifetime_v1, etc.). No rewards/incentives table or MV exists.
- Analytics: `/api/analytics/pool/[id]` → `lib/analytics/db.ts` (getPoolHeadMetrics/getPoolUniverseHead) uses TVL/fees/positions/wallets only; incentives not joined or exposed.
- Types/helpers: incentivesUsd + breakdown types exist (`src/types/positions.ts`; helpers in `src/lib/positions.ts`, `src/lib/positions/server.ts`), but SparkDEX incentives are effectively zero because nothing populates them.
- ABI/SSoT: TokenDistributor ABI present (`src/indexer/abis/tokenDistributor.ts`); SSoT config in `src/indexer/config/stakingContracts.ts` includes TokenDistributor + SPX token `0x657097cC15fdEc9e383dB8628B57eA4a763F2ba0` and rFLR placeholder.

**Textual flow (today)**
SparkDEX on-chain (pools/NFPM) → indexer writes Pool/PoolEvent/PositionEvent → analytics MVs (fees/liquidity/positions) → `lib/analytics/db.ts` → `/api/analytics/pool/[id]` → frontend. TokenDistributor rewards path is absent; no rewards persisted/aggregated.

**Gaps & risks**
- No TokenDistributor ingestion for SPX/rFLR ⇒ no rewards data stored.
- No rewards aggregation views (24h/7d) ⇒ incentivesUsd/breakdown cannot be computed.
- Analytics API/types do not join rewards ⇒ incentives absent in head/universe.
- Price conversion for SPX/rFLR not applied for incentives; need to reuse existing pricing service.

**High-level next steps (no code in this run)**
1) Add rewards staging + per-window aggregation (24h/7d) for TokenDistributor events (per pool, per token, with USD conversion).
2) Join rewards aggregates in `getPoolHeadMetrics`/`getPoolUniverseHead` to populate incentivesUsd + breakdown (default 0/[] when missing).
3) Keep Enosys API and position-level incentives for a follow-up; reuse the same rewards pipeline.

### SparkDEX Pipeline Mapping — 2025-12-09 (doc-only)
- Data flow (current): SparkDEX on-chain (pools/NFPM) → indexer writes Pool/PoolEvent/PositionEvent → analytics MVs (fees/liquidity/positions) → `lib/analytics/db.ts` → `/api/analytics/pool/[id]` → frontend. TokenDistributor rewards path is absent; no rewards persisted/aggregated.
- Components: NFPM/pool scanners ingest SparkDEX; SSoT lists TokenDistributor 0xc2DF11C68f86910B99EAf8acEd7F5189915Ba24F with SPX 0x657097cC15fdEc9e383dB8628B57eA4a763F2ba0 and rFLR placeholder; no rewards ingestion job.
- Views: `mv_pool_fees_24h/7d`, `mv_pool_liquidity`, `mv_pool_reserves_now`, `mv_position_lifetime_v1` (no rewards MV/table).
- Analytics: `src/lib/analytics/db.ts` head/universe uses TVL/fees/positions/wallets; incentives not joined. API `/api/analytics/pool/[id]` surfaces those fields only.
- Types: incentivesUsd + breakdown defined (`src/types/positions.ts`, helpers in `src/lib/positions.ts`, `src/lib/positions/server.ts`), but always empty for SparkDEX because nothing populates them.
- Gap: No TokenDistributor ingestion for SPX/rFLR → no rewards data; no rewards aggregates; no price conversion applied for incentives.

### SparkDEX TokenDistributor Rewards Schema Design — 2025-12-09 (doc-only)
- Staging (proposed, not created): `rewards_sparkdex_distributor`
  - Columns: id (txHash:logIndex), distributor_address, reward_token_address, reward_token_symbol, pool_address (or pair key), recipient, amount_raw, amount_normalized, block_number, tx_hash, log_index, timestamp, source ('SPARKDEX_TOKEN_DISTRIBUTOR').
- Aggregation (proposed, not created): `mv_sparkdex_rewards_24h`, `mv_sparkdex_rewards_7d` (per pool_address, reward_token_symbol)
  - Columns: pool_address, reward_token_symbol, amount_window (raw), amount_window_usd (using existing pricing/FTSO), window_start, window_end.
  - Intended analytics outputs:
    - incentivesUsd = sum(amount_window_usd) per pool.
    - incentivesBreakdown = per-token breakdown `{ tokenSymbol, amount, amountUsd }`.

### Remaining gaps
- No TokenDistributor ingestion exists; no rewards tables/MVs in DB; incentivesUsd/breakdown remain empty for SparkDEX.

### Immediate next steps (for implementation)
1) Implement `rewards_sparkdex_distributor` staging + `mv_sparkdex_rewards_24h/7d` aggregates (per pool/token, USD via existing pricing).
2) Join these MVs in `getPoolHeadMetrics`/`getPoolUniverseHead` to populate incentivesUsd/breakdown for SparkDEX pools; default 0/[] otherwise.
3) Leave Enosys API + position-level incentives for follow-up; reuse the same rewards pipeline.

### SparkDEX TokenDistributor Rewards — DB Layer Implementation — 2025-12-10
- Staging table created (migration): `rewards_sparkdex_distributor` (id, distributor_address, reward_token_address/symbol, pool_address, recipient, amount_raw, amount_normalized, block_number, tx_hash, log_index, timestamp, source). Indexes on pool, token, block.
- Aggregation views added: `mv_sparkdex_rewards_24h` (7200-block window) and `mv_sparkdex_rewards_7d` (50400-block window), aggregating per pool + token, with placeholder `amount_usd` (0) pending price integration.
- Scope: DB-only; no indexer ingestion or analytics joins yet. Pricing integration for incentives USD is still TODO (currently 0).

### SparkDEX TokenDistributor Rewards — Implementation Snapshot — 2025-12-11
- Ingestion: `scripts/indexer-staking.mts` extended to write TokenDistributor (custom staking config) events into `rewards_sparkdex_distributor` using `StakingScanner` + `TOKEN_DISTRIBUTOR_ABI`. Pool fallback uses distributor address when pool mapping is unknown; amount_normalized uses 18 decimals; USD pricing not written to DB (staging only).
- Aggregation: existing MVs `mv_sparkdex_rewards_24h` / `mv_sparkdex_rewards_7d` remain unchanged (amount_usd placeholder). Analytics computes incentivesUsd on the fly using tokenPriceService.
- Analytics: `getPoolHeadMetrics` now fetches SparkDEX incentives via `computeSparkdexIncentivesForWindow` (24h/7d) summing amount_raw × price/1e18; fields added to head metrics and API response. Universe/segments not yet wired to incentives.
- Remaining gaps: pool mapping for TokenDistributor events is heuristic (falls back to distributor address); amount_usd columns in MVs remain 0; no incentives in universe/segments; Enosys + position-level incentives remain TODO.

## PoolEvent Coverage — Enosys vs SparkDEX — 2025-12-08

**Problem (blocking fees):** Enosys WFLR/USDT0 (`0x3C2a7B...`) and FXRP/USDT0 (`0x686f53...`) had **zero PoolEvent rows** (Swap/Mint/Burn/Collect), so fee MVs and analytics returned 0 despite high TVL and active trading. STXRP/FXRP had coverage, creating misleading asymmetry.

**Root cause:** PoolEvent pool list was built solely from `PoolEvent` PoolCreated rows. Follower/backfill defaults ran NFPM-only streams, so factories/pools were never scanned for some Enosys pools; no PoolCreated rows → pools excluded from pool scanner → PoolEvent stayed empty.

**Fix (implemented):**
- PoolRegistry now unions `Pool` table addresses with PoolCreated rows and uses Pool.blockNumber as min-block fallback, ensuring all known pools (including Enosys WFLR/USDT0 + FXRP/USDT0) are scanned.
- `scripts/indexer-backfill.ts` defaults to streams `nfpm,factories,pools`; `scripts/indexer-follower.ts` always runs NFPM + factories + pools (no more NFPM-only default).
- `scripts/debug/universe-golden-pairs.mts` now reports PoolEvent swap/mint/burn/collect counts and min/max blocks for golden pools to spot coverage gaps quickly.
- ANKR routing: `indexer.config.ts` now prefers `RPC_BASE`/`ANKR_NODE_URL` over `FLARE_RPC_URL`. One-shot Enosys PoolEvent backfill (ANKR):  
  `cd "$HOME/Projects/Liquilab_staging" && export ANKR_NODE_URL="https://rpc.ankr.com/flare/cee6b4f8866b7f8afa826f378953ae26eaa74fd174d1d282460e0fbad2b35b01" && npm run indexer:backfill -- --factory=enosys --streams=nfpm,factories,pools --from=51000000 --to=51900000 --rps=12 --concurrency=25 --blockWindow=25`
- Verification helper: `scripts/debug/check-enosys-pool-events.mts` prints swap/mint/burn/collect counts + min/max blocks for Enosys golden pools.
- Provider-aware block windows: RpcScanner now caps blockWindow per RPC provider (Flare public: 30/safe 25; ANKR Flare: up to 20000; generic: 1000). ANKR-based backfills/followers/staking are no longer clamped to 25 when requesting larger windows.

## SparkDEX Fees Audit — 2025-12-08
- Problem: SparkDEX pools showed zero fees despite large swap counts.
- Findings (via `scripts/debug/sparkdex-fees-audit.mts`):
  - STXRP/FXRP SparkDEX `0x5fD4139cC6fDFddbd4Fa74ddf9aE8f54BC87C555`: swaps present, mv_pool_fees_24h/7d null, head fees=0 → WARN_FEES_ZERO.
  - WFLR/USDT0 SparkDEX `0x2860db7a2b33b79e59ea450ff43b2dc673a22d3d`: swaps present, mv fees null, head fees=0 → WARN_FEES_ZERO.
  - WFLR/USDT0 SparkDEX (big) `0x63873f0d7165689022feef1b77428df357b33dcf`: swaps present, mv fees null, head fees=0 → WARN_FEES_ZERO.
  - FXRP/USDT0 SparkDEX `0x88d46717b16619b37fa2dfd2f038defb4459f1f7`: swaps present, mv fees null, head fees=0 → WARN_FEES_ZERO.
- Conclusion: PoolEvent coverage OK; mv_pool_fees_24h/7d lack rows for SparkDEX pools, causing zero fees in analytics. Structural MV/population issue remains; SparkDEX fee/APR is not trustworthy until mv_pool_fees_* are populated for SparkDEX pools. Next step: fix MV/population for SparkDEX pools (fees) before re-running analytics.

## Fees MVs — Enosys + SparkDEX — 2025-12-09
- Previous state: mv_pool_fees_24h/7d produced rows mainly for Enosys STXRP/FXRP; SparkDEX pools with swaps had null MV rows ⇒ zero fees in analytics.
- New definition: mv_pool_fees_24h/7d now compute fees for all Enosys + SparkDEX v3 pools using PoolEvent Swap amounts (abs(amount0/1)) × Pool.fee / 1e6 over block windows (~24h=7200, ~7d=50400); unique index on pool.
- Verification: refresh MVs, then run `npm run debug:universe:golden` and `npm run debug:sparkdex-fees-audit`; expect no WARN_FEES_ZERO on pools with swaps>0 once MVs are populated.

## SparkDEX PoolEvent Tail Backfill — 2025-12-09
- Problem: SparkDEX pools had last swaps around block ~51.46M while global PoolEvent max was ~51.9M; tail backfill was only scanning near-tip checkpoints, leaving the gap, so fee MVs stayed empty for SparkDEX pools.
- Fix: Added `scripts/backfill-sparkdex-tail.mts` (npm run backfill:sparkdex:tail) to backfill per-pool from last Swap block (or startBlock if missing) to latest, bypassing checkpoints. Uses existing RpcScanner/decoder/dbWriter and provider-aware chunking. Run against Railway DB + ANKR RPC to fill the gap, then refresh fee MVs.

## Enosys PoolEvent Backfill — 2025-12-09
- Problem: Enosys WFLR/USDT0 (`0x3C2a7B...`) and FXRP/USDT0 (`0x686f53...`) had 0 PoolEvent rows; fees MVs stayed empty. Enosys STXRP/FXRP was fine.
- Fix: Added `scripts/backfill-enosys-pools.mts` (npm run backfill:enosys:pools) to backfill Enosys pools per-pool from last Swap block (or pool.startBlock) to latest, using ANKR/Flare provider-aware scanning, bypassing checkpoints. Updated `scripts/debug/check-enosys-pool-events.mts` to show swap/mint/burn/collect counts, min/max block, and 7d window status for Enosys golden pools.
- How to verify: Run the Enosys backfill with ANKR, refresh mv_pool_fees_24h/7d, then run `npm run debug:universe:golden` and `npm run debug:check-enosys` (or `npm exec tsx scripts/debug/check-enosys-pool-events.mts`) to confirm swaps are in-window and fees become non-zero.

## RPC blockWindow handling — 2025-12-09
- Issue: Scanner logs showed “Block window 25000 exceeds provider limit 20000” even when CLI requested smaller values; requested window wasn’t respected.
- Fix: RpcScanner now takes requested blockWindow from caller/CLI, clamps only to provider caps (Flare public ~25/30, ANKR 20000, generic 1000). Removed implicit 25000 default; clamp logs show requested/providerCap/effective. Enosys backfill passes blockWindow through to scanner.
- Validation: Run `npm run backfill:enosys:pools -- --blockWindow=1000 --rps=8 --concurrency=6` with ANKR_NODE_URL set; logs should show effective window=1000 (no 25000 clamp).

**Backfill plan (do not run here):**
- Command: `npm run indexer:backfill -- --factory=enosys --streams=nfpm,factories,pools --from <startBlock>` (adjust fromBlock as needed). This repopulates PoolEvent for Enosys pools. After backfill, refresh fee MVs and re-run `npm run debug:universe:golden` to confirm non-zero PoolEvent counts and fees.

**Remaining risks:** Other Enosys pools beyond the golden set may still be missing PoolEvent rows if they were never in the `Pool` table—verify via PoolEvent coverage debug. Ensure future deployments keep follower/backfill streams at `nfpm,factories,pools` to avoid regression.
- Any major schema refactor must align with `docs/DATA_ARCHITECTURE_V2_GOAL.md` and only proceed after grant approval and MVP stability (legacy PoolEvent + MVs stay SSoT until then).

## Staking RPC Defaults — 2025-12-09

- Staking indexer now prefers `ANKR_NODE_URL` (fallback `FLARE_RPC_URL`), applies provider caps (Flare ≤30, ANKR 2000, generic 1000) with effectiveBlockWindow=min(requested, cap). Defaults: blockWindow=5000, rps=25, concurrency=12 (CLI overridable). Logs show rpc/blockWindow/providerCap/effective and chunking uses the capped window.
- Validation: run `npm run indexer:staking` with `ANKR_NODE_URL` set; expect effectiveBlockWindow ≤ 2000 in logs. With ANKR unset + FLARE set, window should clamp ≤30.
- Next steps: short staking run to verify RPC selection/logging; then longer backfill if needed. Debug scripts (`debug:universe:golden`, `debug:sparkdex:fees-audit`) unaffected.

### Enosys Incentives Pipeline — 2025-12-08
- Source: Enosys rFLR API (`apiUrl` in `stakingContracts.ts`, id `enosys-rflr-api`).
- Ingestion: `scripts/indexer-staking.mts` now fetches the Enosys API, maps per-pool rewards (poolAddress, reward token, amount_raw, rewarded_at), prices via `getTokenPriceUsd`, and writes into `rewards_enosys_rflr` with amount_usd populated.
- Staging/MVs: `rewards_enosys_rflr` (migration `20251212_enosys_rflr_rewards.sql`), aggregated by `mv_enosys_rewards_24h` and `mv_enosys_rewards_7d` (summing amount_raw + amount_usd per pool/token over 24h/7d).
- Alignment: Mirrors the SparkDEX staging + MV pattern; keeps Enosys incentives ready for analytics joins.
- Analytics: Pool head and Pool Universe now consume Enosys rewards via `mv_enosys_rewards_*`, exposing incentives24hUsd/incentives7dUsd with safe defaults; 30D/90D use the 7D proxy (consistent with fees/APR).
- TODO: Extend incentives to per-segment breakdowns (if needed) and to position-level analytics; validate Enosys pool mapping and API payload nuances.
- Fix: Enosys incentives helper now queries fixed MVs (`mv_enosys_rewards_24h/7d`) instead of dynamic names, eliminating 42P01 errors when resolving incentives for Enosys pools; remains degrade-safe if MVs are empty.

### Enosys rFLR Rewards DB Layer — 2025-12-08
- Added staging table migration `rewards_enosys_rflr` (DB-only): per-pool rewards with token address/symbol, raw/normalized amounts, optional amount_usd, rewarded_at timestamp, and source `ENOSYS_RFLR_API`.
- Added aggregation MVs `mv_enosys_rewards_24h` and `mv_enosys_rewards_7d`: sum amount_raw and amount_usd per pool_address + reward_token_address/symbol over 24h/7d windows.
- Mirrors the SparkDEX rewards staging + MV pattern to prepare for Enosys rFLR ingestion; no indexer/analytics wiring yet.
- Open questions: how the Enosys API attributes rewards to pools (per-pool vs global), and which pricing path to use during ingestion; to be addressed before wiring analytics.

## Data Architecture v2 Migration Plan (Post-Grant, design-only)

This is documentation-only. **No code/schema changes now; MVP SSoT remains the existing MV-based pipeline.** Flare follower stays on Flare RPC; ANKR is for explicit backfills only.

- **Phase 0 — Documentation only (now):** Define target facts/aggregates and wall-clock windows; no schema/code/backfills.
- **Phase 1 — Dual-write foundation (future):** Indexer/backfills write to facts (`fact_swap`, `fact_reward`, `fact_pool_snapshot`; later `fact_position_snapshot`) alongside legacy tables/MVs. Reads unchanged.
- **Phase 2 — Shadow aggregates:** Build `agg_pool_daily` (optional `agg_position_daily`) from facts; add golden-pairs comparison (old MVs vs new aggregates on TVL/fees/incentives) plus random-pool samples.
- **Phase 3 — Read-path switch (pool head + Universe):** Point `getPoolHeadMetrics`/`getPoolUniverseHead` to `agg_pool_daily` + `fact_pool_snapshot`; keep old MVs refreshed as safety; add staleness indicators.
- **Phase 4 — Deprecate old MVs:** Stop refreshing legacy fee/reward MVs and DEX-specific reward tables; retarget backfill/debug scripts to facts/aggregates; drop legacy only after confidence.
- **Phase 5 — IL/APR per position:** Add `fact_position_snapshot`, wire NFPM/`PositionEvent`, and expose IL/APR per position in analytics/APIs.

**Acceptance / rollback per phase:**
- Verify golden pairs and a random sample for parity on TVL/fees/incentives before switching reads; rollback = revert read-path to legacy MVs and pause fact reads.
- Dual-write can be toggled independently; legacy remains the SSoT until explicit cut-over.

