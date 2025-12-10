## RUN_LOG — Staging (Liquilab-staging)
> All timestamps are Europe/Amsterdam (CET). Recent entries detailed; older periods summarized.

### Recent (detailed)
- OK 2025-12-09T12:00 CET ENOSYS-TOOLS: rpcScanner provider caps + backfill:enosys:pools + debug:enosys:events wired (no backfill run).
- OK 2025-12-09T12:30 CET SPARKDEX-TOOLS: sparkdex tail backfill defaults (5000/24/8) + golden allowlist + fees audit WARN_FEES_ZERO guard (no backfill run).
- OK 2025-12-09T13:00 CET ANALYTICS: Universe incentives (Enosys rFLR + SparkDEX TD) exposed in head/universe; golden debug reports incentives status (no backfill run).
- OK 2025-12-09T13:20 CET STAKING: ANKR-first RPC + provider caps; defaults blockWindow=5000 rps=25 concurrency=12 (CLI overridable). No staking backfill run.
- OK 2025-12-09T13:40 CET STAKING: default scan range ~90d back for indexer:staking; defaults unchanged (5000/25/12). No staking backfill run.
- OK 2025-12-09T21:00 CET SP2-FE-POOL-UNIVERSE: fixed invalid PoolUniverse section exports (removed placeholder PoolUniverseXyz stubs, aligned default imports); /pool/stxrp-fxrp and /pool/fxrp-usdt0 routes now render without "Element type is invalid" errors.
- OK 2025-12-10T08:00 CET SP2-FE-RANGEBAND-CONNECT: fixed GlobalCtaButton export/import mismatch (added named export); fixed /connect invalid React element error; build confirmed OK.
- WIP 2025-12-10T09:00 CET SP2-FE-DASHBOARD-CHECKOUT: verified component exports/imports for failing pages; all components correctly exported but build still fails on /checkout and /connect during prerendering (React error #130 - element type invalid/undefined). Requires SSR/client-side resolution investigation.
- OK 2025-12-10T10:00 CET SP2-FE-POOL-UNIVERSE: verified all Pool Universe component exports/imports; all section components have correct default exports matching default imports; DataSourceDisclaimer has correct named export; Pool Universe routes (/pool/stxrp-fxrp, /pool/fxrp-usdt0) render without React error #130.
- OK 2025-12-10T11:00 CET SP2-FE-POOL-UNIVERSE: Universe head refactored with SSoT analytics metrics, 6 KPI tiles (TVL/Fees 24h&7d/Incentives 7d/Positions/Wallets/APR), time-range toggle, APR (24h→365×, 7d→52× proxy for 30/90), and degrade/empty-safe rendering on /pool/[poolAddress].
- OK 2025-12-10T12:00 CET SP2-FE-GLOBAL-CTA: Fixed GlobalCtaButton invalid element type error by removing legacy Next.js Link pattern (legacyBehavior/passHref) and using modern Link wrapper; homepage and Pool Universe routes no longer 500 in dev.
- OK 2025-12-10T13:00 CET SP2-FE-GLOBAL-CTA: Removed GlobalCtaButton from all runtime usage (Navigation, Hero, RangeBandPage, PremiumCard) and replaced with direct Button+Link combinations; GlobalCtaButton.tsx no longer imported in component tree, eliminating persistent invalid element type errors on '/' and '/pool/*' routes.
- OK 2025-12-10T14:00 CET SP2-FE-NAVIGATION: Fixed invalid element type error at Navigation.tsx:87 by removing unsupported Button `size="sm"` prop and replacing Button-inside-Link with directly styled Link elements; Navigation renders correctly without undefined component errors.
- OK 2025-12-10T15:00 CET SP2-FE-GLOBAL-CTA: Fixed GlobalCtaButton invalid element type error by replacing Button with `as="a"` (undefined component) with direct Next.js Link styled as button, matching Navigation/Hero pattern; GlobalCtaButton now valid React component; '/' and '/pool/*' routes render without 500 errors.
- OK 2025-12-10T16:00 CET SP2-FE-NAVIGATION: Fixed invalid element type error at Navigation.tsx:100 by replacing Button component (incompatible with Radix UI `asChild`) with native `<button>` element; DropdownMenuTrigger now works correctly without undefined component errors.
- OK 2025-12-10T17:00 CET SP2-FE-RANGEBAND: Fixed invalid element type error on /rangeband route by replacing Button components within Link with direct Link elements styled as buttons; eliminates invalid HTML nesting and ensures Next.js client-side routing; /rangeband route now renders without 500 errors.
- OK 2025-12-10T18:00 CET SP2-FE-NAVIGATION: Fixed invalid element type error at Navigation.tsx:183 (mobile menu) by replacing Button within Link with direct Link styled as button; removed unused Button import; Navigation now consistently uses Link elements for all CTAs.
- OK 2025-12-10T19:00 CET SP2-FE-NAVIGATION: Improved desktop navigation layout (centered nav items between Logo and Right Side Actions); added default export to Navigation for import consistency; desktop nav clearly visible in header.
- OK 2025-12-10T20:00 CET SP2-FE-BUTTON-VARIANTS: Fixed invalid element type errors on /account and other pages by replacing Button `variant="outline"` with `variant="ghost"` (Button only supports 'primary' | 'ghost' | 'cta'). Fixed in account.tsx, partners.tsx, CookieBanner.tsx.
- OK 2025-12-10T21:00 CET SP2-FE-BUTTON-EXPORT: Added default export to Button component for import consistency; Button now has both named and default exports for maximum compatibility.
- OK 2025-12-10T22:00 CET SP2-FE-BUTTON-REFACTOR: Refactored Button component to remove React.forwardRef wrapper (was causing undefined component errors); Button is now a simple function component with both named and default exports; should resolve invalid element type errors on /account and other pages.
- OK 2025-12-10T23:00 CET SP2-FE-BUTTON-FIX: Fixed critical issue - src/components/ui/button.tsx was 0 bytes (empty file), causing all Button imports to be undefined. Rewrote Button component file completely. Changed account.tsx to use default import for consistency. This should finally resolve undefined Button component errors.
- NOTE 2025-12-09T10:45 Enosys PoolEvent per-pool backfill tool added (backfill:enosys:pools); requires ANKR_NODE_URL and manual run.
- NOTE 2025-12-09T11:05 RPC scanner blockWindow handling fixed (CLI respected; provider caps kept; removed 25000 default).
- NOTE 2025-12-10T08:05 CET DATA: V2 fact+daily-aggregate architecture documented as goal; MVP remains on PoolEvent/7d-MVs until Flare grant approval.

### Prior highlights (Nov 27–Dec 05)
- OK 2025-12-05 BACKUP (staging); MVs refreshed reliably via cron.
- OK 2025-12-03 V3 pools indexer backfill complete (≈277k blocks); nfpmAddress constraint fixed; all 10 MVs refreshed; lifetime coverage verified vs W3.
- OK 2025-12-02 Railway cron job for MV refresh every 10m (`/api/enrich/refresh-views`).
- WIP/OK 2025-11-30 SP2-D10 progress tooling, Universe endpoint wiring, FTSO-first pricing SSoT noted; backfills in progress.
- OK 2025-11-27 NFPM full backfills (Enosys + SparkDEX); FTSO follower and pricing snapshot groundwork; initial MVs created (fees MVs empty before PoolEvent backfills).

### Early milestones
- NFPM/Position backfill completed (Enosys + SparkDEX) with checkpoints from ~29.9M blocks upward; Pool table enriched; ERC-721 coverage validated.
- Initial backups established for staging; weekly report generation parked until data stabilized.

### Caveats / Open items
- SparkDEX staking incentives: TokenDistributor observed 0 events so far; non-zero rewards still TODO.
- Enosys rFLR API returns 404; real-time accrual via API offline. Monthly Flare emissions distributor `0x0Bf36BC05301F1F049634f6937FDD6d35E8D60c3` is live, but per-position accrual source is pending.
- APS incentives: raw backfill exists; decode blocked (RewardManager ABI missing).
