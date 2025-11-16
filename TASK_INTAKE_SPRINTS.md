# TASK INTAKE — LiquiLab Sprint Plan (S0-S6)

> **Purpose:** Copy/paste TASK INTAKE blokken voor alle sprints, gegroepeerd per sprint en georderd als FE → API → DATA → OPS → BILLING → MAIL.
> **Generated:** 2025-11-16 op basis van PROJECT_STATE.md, ROADMAP_DOMAIN_SPECS.md
> **Updated:** 2025-11-16 (Scope decisions applied)
> **Status:** 🔒 APPROVED — Ready for sprint planning & ticket creation (Option B: Balanced MVP, 18 weeks)

---

## Sprint 0 (S0) — Foundation & Infrastructure Setup

### OPS-01: Staging Environment Setup

```
TASK INTAKE (copy/paste)

Sprint/ID: S0-OPS01

Domein: OPS

Model: CODEX

Titel: Setup Railway staging environment met dedicated DB + Stripe TEST + Sentry + Uptime

Goal: Staging environment operational zodat alle SP1 PRs getest kunnen worden vóór merge naar main

Acceptatie (DoD):
- Railway staging project `liquilab-staging` created + deployed
- Dedicated Postgres DB provisioned + seeded with demo data
- Stripe TEST keys configured + test payment succeeds
- Mailgun degrade mode active (MAILGUN_MODE=degrade, no emails sent)
- Sentry staging project created + test error logged via /api/sentry-test
- Uptime monitor (UptimeRobot/Pingdom) configured + checks /api/health every 5min
- CI workflow deploys to staging on PR open
- GitHub branch protection: requires "Staging Deploy" status check
- Verify: Railway dashboard shows staging deploy green; curl https://staging.liquilab.io/api/health → 200

Scope/Files: Railway dashboard, .github/workflows/staging-deploy.yml, Sentry dashboard, UptimeRobot config

Env: STAGING (setup)

Notities/risico's: BLOCKER voor alle SP1 PRs. Setup first, test deploy, validate all 4 merge gate checks pass.
```

---

### OPS-02: Verify Suite CI Integration

```
TASK INTAKE (copy/paste)

Sprint/ID: S0-OPS02

Domein: OPS

Model: CODEX

Titel: Integrate npm run verify in CI workflow met fail-hard thresholds

Goal: All verify checks run automatically in CI, blocking merge als critical checks falen

Acceptatie (DoD):
- CI workflow runs `npm run verify` on staging deploy
- Fail-hard checks (block deploy): verify:env, verify:pricing, verify:icons, verify:brand
- Soft-fail checks (log warnings): verify:a11y (local), verify:billing (degrade OK)
- CI logs show "✓ All verifications passed" bij success
- Failed check → PR merge blocked via GitHub status check
- Verify: Push to PR → CI runs verify suite → status visible in GitHub PR

Scope/Files: .github/workflows/ci.yml, package.json scripts

Env: LOCAL → STAGING → PROD

Notities/risico's: verify:brand en verify:typography zijn nieuwe checks (SP1), moeten eerst geïmplementeerd worden.
```

---

## Sprint 1 (SP1) — Foundation & Design System

### FE-01: Figma Foundations & Tokens Export

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T37

Domein: FRONTEND

Model: CODEX (token export script) + CLAUDE (Figma structure spec)

Titel: Setup Figma Foundations → Style Dictionary → tokens.css export pipeline

Goal: Design tokens (fonts, colors, spacing, numerics) exporteerbaar als CSS vars, serving as SSoT voor brand system

Acceptatie (DoD):
- Figma file structured: Foundations → Components → Patterns → Page Templates
- Style Dictionary config exports Figma tokens as JSON → src/styles/tokens.css
- CSS vars present: --brand-primary, --brand-accent, --bg-canvas, --font-header (Quicksand), --font-body (Inter), --num-style-tabular (tabular-nums)
- Typography tokens: Quicksand 600/700 voor headers, Inter 400/500 voor body/tables
- Numerics tokens: --num-style-tabular aliased naar tabular-nums voor KPI/pricing
- Verify: npm run tokens:build → exit 0; test -f src/styles/tokens.css; grep 'tabular-nums' src/styles/tokens.css → found

Scope/Files: figma/liquilab-design-system.fig, config/tokens.config.js, scripts/build-tokens.mjs, src/styles/tokens.css

Env: LOCAL (Figma export) → STAGING (validation)

Notities/risico's: CRITICAL PATH voor SP1-T38/T40/T39. Tokens eerst, rest volgt. Requires Figma plugin "Figma Tokens" voor sync.
```

---

### FE-02: DS Components Visual Specification

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T38

Domein: FRONTEND

Model: CLAUDE (component specs) + COMPOSER 1 (Figma frames)

Titel: Design all DS components in Figma met states, variants, A11y annotations

Goal: Complete visual spec voor ErrorBoundary, Toast, Modal, Form.*, Accordion, CookieBanner, DataState ready voor FE implementation

Acceptatie (DoD):
- Figma frames voor 7 DS componenten: ErrorBoundary, Toast, Modal, Form.* (Text/Select/Checkbox), Accordion, CookieBanner, DataState
- States per component: default, hover, focus, active, disabled, error, loading (minimaal 3 states)
- A11y annotations in Figma: ARIA roles, keyboard nav flows, focus indicators (2px --brand-primary)
- Color contrast checks: all text ≥4.5:1 WCAG AA (verified via Figma plugin Stark/A11y)
- Responsive breakpoints: mobile (320px), tablet (768px), desktop (1024px+)
- Numeric fields spec: All KPI/pricing values use class="numeric" annotation voor tabular-nums
- Verify: Figma file contains frames "DS — ErrorBoundary", "DS — Toast", etc. (7 total); each has ≥3 states; contrast check pass

Scope/Files: figma/liquilab-design-system.fig (Components section)

Env: DESIGN (Figma) → LOCAL (handoff)

Notities/risico's: Depends on SP1-T37 (tokens). Numeric fields MUST show .numeric class usage in specs voor FE implementation guidance.
```

---

### FE-03: Wave-Hero Implementation

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T40

Domein: FRONTEND

Model: CLAUDE (asset specs) + COMPOSER 1 (visual polish)

Titel: Implement wave-hero background met crisp rendering in onderste 50% viewport fold

Goal: Wave hero staat crisp als achtergrond in onderste 50% van de fold; rest van de achtergrond sluit naadloos aan bij hero

Acceptatie (DoD):
- Wave hero background: crisp SVG/PNG in bottom 50% viewport fold at breakpoints sm/md/lg (320px/768px/1024px)
- Assets: /public/media/brand/hero-wave.svg + hero-wave@2x.png (Retina-safe, 2x pixel density)
- CSS: fixed position, seamless gradient from --bg-canvas (top 50%) to wave (bottom 50%)
- Device pixel ratio awareness: image-rendering: -webkit-optimize-contrast voor crisp rendering
- Hero variants: Home (default), Pricing (calculator focus), RangeBand (interactive demo)
- OG hero variants: hero-wave-home.png, hero-wave-pricing.png, hero-wave-rangeband.png (1200×630) voor social previews
- Verify: test -f public/media/brand/hero-wave.svg && test -f hero-wave@2x.png; Lighthouse CLS < 0.1; screenshot diff at 320px/768px/1024px (max diff <5%); curl / | grep -q "hero-wave" → found in SSR HTML

Scope/Files: public/media/brand/hero-wave.*, src/styles/hero.css, components/Hero.tsx

Env: LOCAL → STAGING → PROD

Notities/risico's: Depends on SP1-T37 (--bg-canvas token). Lossless compression voor SVG. Test Retina rendering op Macbook/iPhone.
```

---

### FE-04: OG & Social Previews

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T39

Domein: FRONTEND

Model: CLAUDE (Firefly brief) + AUTO (OG meta implementation)

Titel: Generate 10 OG variants (1200×630) + automatic OG meta per route

Goal: Social previews (Slack/Discord/Twitter) tonen branded OG images met route-specific content

Acceptatie (DoD):
- Firefly brief: 10 OG variants — Home, Dashboard, RangeBand, Pricing, FAQ, Pool Detail, Account, Legal, Status, 404
- Assets exported: /public/media/brand/og-*.png (2x Retina @ 2400×1260, optimized → 1200×630)
- Automatic OG meta: Next.js Head component per route with og:title, og:description, og:image, og:type, twitter:card
- Fallback: default OG image if route-specific missing (og-default.png)
- Verify: npm run verify:og → all public routes have OG tags + assets exist; test -f public/media/brand/og-home.png (× 10 variants); social preview test via Slack/Discord/Twitter → card renders correctly; Lighthouse SEO score ≥95

Scope/Files: public/media/brand/og-*.png, pages/_document.tsx, components/SEO/OGTags.tsx, scripts/verify-og.mjs

Env: LOCAL → STAGING → PROD

Notities/risico's: Parallel to SP1-T38/T40 (no blocking dependency). Firefly brief kan 1-2 dagen duren. Prioritize MVP 5 routes first (Home/Dashboard/RangeBand/Pricing/FAQ).
```

---

### FE-05: Typography & Numerals Refactor

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T40 (was duplicate, renumbered as FE-05 voor clarity)

Domein: FRONTEND

Model: CODEX (global CSS + refactor)

Titel: Apply Quicksand/Inter fonts globally + enforce tabular-nums on all numeric values

Goal: Alle headers gebruiken Quicksand, alle body/tables gebruiken Inter, alle numerics gebruiken .numeric class voor stable layout

Acceptatie (DoD):
- Quicksand (600/700) applied to all headers (h1-h6) via global CSS (--font-header)
- Inter (400/500) applied to body, tables, forms via global CSS (--font-body)
- font-variant-numeric: tabular-nums enforced on all numeric values via CSS class .numeric
- Refactor inline styles → CSS classes: .heading-xl, .heading-lg, .body, .label, .numeric
- SSoT currency helpers: formatUSD(), formatEUR(), formatNumber(), formatPercent() in src/lib/format/currency.ts
- Verify: npm run verify:typography → checks all h1-h6 use Quicksand, all numeric values use .numeric class; visual regression: pricing table, pool table, dashboard KPIs (layout stable); grep -r "font-family: 'Quicksand'" src/ → 0 matches (all via CSS vars)

Scope/Files: src/styles/globals.css, src/lib/format/currency.ts, components/**/*.tsx (refactor inline font styles)

Env: LOCAL → STAGING → PROD

Notities/risico's: Depends on SP1-T37 (tokens). Large refactor across codebase (scan all components). Prioritize KPI/pricing/table components first.
```

---

### FE-06: verify:brand Implementation

```
TASK INTAKE (copy/paste)

Sprint/ID: S0-FE06 (infrastructure for SP1 gate)

Domein: FRONTEND

Model: CODEX

Titel: Implement npm run verify:brand check (fonts, colors, numerics validation)

Goal: Automated check enforces brand system consistency vóór SP1 PR merge

Acceptatie (DoD):
- Script scripts/verify-brand/check-brand.mjs validates:
  * Typography tokens present (--font-header, --font-body, --num-style-tabular) in tokens.css
  * Warns if inline font-family found (should use CSS vars)
  * Checks numeric values use .numeric class for tabular-nums
  * Verifies brand colors (--brand-primary, --brand-accent, --bg-canvas) present
- Exit 0 if compliant, warnings logged for violations
- Integrated in package.json: "verify:brand": "node scripts/verify-brand/check-brand.mjs"
- CI runs verify:brand as part of verify suite (fail-hard if tokens missing)
- Verify: npm run verify:brand → exit 0; grep inline font components/ → warnings logged

Scope/Files: scripts/verify-brand/check-brand.mjs, package.json

Env: LOCAL → STAGING (CI hard-fail)

Notities/risico's: Must complete before SP1-T37 PR merge. Part of STAGING merge gate.
```

---

### FE-07: verify:typography Implementation

```
TASK INTAKE (copy/paste)

Sprint/ID: S0-FE07 (infrastructure for SP1 gate)

Domein: FRONTEND

Model: CODEX

Titel: Implement npm run verify:typography check (tabular-nums enforcement)

Goal: Automated check enforces .numeric class usage on all KPI/pricing/table numerics

Acceptatie (DoD):
- Script scripts/verify-typography/check-numerics.mjs scans components for numeric displays (TVL, APR, fees, prices)
- Validates .numeric class presence on numeric values
- Soft-fail local (warnings only), hard-fail CI if >10 violations
- Integrated in package.json: "verify:typography": "node scripts/verify-typography/check-numerics.mjs"
- Verify: npm run verify:typography → logs violations, exit 0 locally; CI=true npm run verify:typography → hard-fail if >10 violations

Scope/Files: scripts/verify-typography/check-numerics.mjs, package.json

Env: LOCAL (soft-fail) → STAGING (hard-fail CI)

Notities/risico's: Must complete before SP1-T40 PR merge (typography refactor). Part of STAGING merge gate.
```

---

## Sprint 2 (SP2) — Data & Analytics

### DATA-01: Materialized View — Wallet Portfolio

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-D01

Domein: DATA

Model: CODEX

Titel: Create mv_wallet_portfolio_latest materialized view voor wallet-level portfolio snapshot

Goal: Snelle query voor wallet portfolio overview zonder JOIN hell

Acceptatie (DoD):
- MV schema: mv_wallet_portfolio_latest(wallet_address, tvl_total_usd, positions_active, fees24h_usd, ts)
- Refresh strategy: ≤60s/MV (cron job or trigger)
- Index: (wallet_address) for fast lookup
- Verify: npm run verify:mv checks row counts and column names; query via /api/analytics/wallet/{wallet}/positions → data comes from MV

Scope/Files: prisma/migrations/*, scripts/refresh-mvs.ts, src/lib/db/mvs.ts

Env: LOCAL (dev DB) → STAGING → PROD

Notities/risico's: Requires position data in DB (indexer must be running). Test with golden wallet 0xKOEN.
```

---

### DATA-02: Materialized View — Position Overview

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-D02

Domein: DATA

Model: CODEX

Titel: Create mv_position_overview_latest voor position-level analytics + RangeBand™ status

Goal: SSoT voor RangeBand™ status (bandColor, positionRatio) — FE berekent NIETS

Acceptatie (DoD):
- MV schema: mv_position_overview_latest(position_id, wallet_address, pool_id, tvl_usd_current, unclaimed_fees_usd, apr_7d, range_min, range_max, current_price, strategy_code, spread_pct, band_color, position_ratio, unclaimed_fees_pct_of_tvl, claim_signal_state, ts)
- bandColor: GREEN|ORANGE|RED|UNKNOWN (calculated in MV, not FE)
- positionRatio: 0..1 | null (calculated in MV, not FE)
- Refresh strategy: ≤60s/MV
- Index: (position_id), (wallet_address)
- Verify: curl /api/analytics/pool/[id] | jq '.pool.bandColor' → returns valid color; grep -r "calculateBandColor" components/ → 0 matches (RangeBand™ SSoT guardrail)

Scope/Files: prisma/migrations/*, scripts/refresh-mvs.ts, src/lib/rangeband/calculate.ts (server-side only)

Env: LOCAL → STAGING → PROD

Notities/risico's: CRITICAL for RangeBand™ SSoT guardrail. MV logic must match Uniswap V3 math. Test edge cases (extreme price ranges, 0 liquidity).
```

---

### DATA-03: Materialized View — Position Day Stats

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-D03

Domein: DATA

Model: CODEX

Titel: Create mv_position_day_stats voor daily position performance (7d/30d charts)

Goal: Historical snapshots voor charts zonder live calculation overhead

Acceptatie (DoD):
- MV schema: mv_position_day_stats(position_id, date, price_open, price_close, range_lower_price, range_upper_price, tvl_usd_avg, fees_usd_earned, fees_usd_claimed, time_in_range_pct)
- Refresh strategy: daily cron job (00:00 UTC)
- Index: (position_id, date)
- Verify: query returns data for last 30d; charts render in /pool/[id] (7d/30d variants)

Scope/Files: prisma/migrations/*, scripts/refresh-mvs.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Requires historical position snapshots. Backfill for existing positions may take time.
```

---

### DATA-04: Materialized View — Position Events Recent

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-D04

Domein: DATA

Model: CODEX

Titel: Create mv_position_events_recent voor recent position events (7d window)

Goal: Fast query voor recent events zonder scanning entire PositionEvent table

Acceptatie (DoD):
- MV schema: mv_position_events_recent(position_id, ts, event_type, token0_delta, token1_delta, fees_usd, incentives_usd, tx_hash)
- Refresh strategy: ≤60s/MV
- Index: (position_id), (ts DESC)
- Verify: npm run verify:mv; event counts match PositionEvent table for 7d window

Scope/Files: prisma/migrations/*, scripts/refresh-mvs.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: 7d window may grow large for active positions. Consider pagination.
```

---

### API-01: Analytics Wallet Positions Endpoint

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-T50

Domein: API

Model: CODEX

Titel: Implement GET /api/analytics/wallet/{wallet}/positions met MV integration

Goal: Wallet positions overview met RangeBand™ status uit mv_position_overview_latest

Acceptatie (DoD):
- Response type: ApiEnvelope<WalletPositionsResponse>
- WalletPositionsResponse: { header: { tvlTotalUsd, positionsActive, fees24hUsd }, positions: PositionOverview[] }
- PositionOverview includes: bandColor, positionRatio (from MV, not calculated in API)
- Degrade mode: code 'INDEXER_LAGGING' + staleTs if MV refresh lag > 1h
- Verify: golden wallet returns ≥1 position; jq '.data.positions|length' > 0; jq '.data.positions[0].bandColor' → valid color

Scope/Files: pages/api/analytics/wallet/[wallet]/positions.ts, src/lib/db/queries/positions.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Depends on SP2-D01/D02 (MVs). Test degrade mode by pausing MV refresh.
```

---

### API-02: RangeBand Preview Endpoint

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-T51

Domein: API

Model: CODEX

Titel: Implement GET /api/rangeband/preview voor interactive RangeBand™ calculator

Goal: User kan range input geven (min/max) en krijgt preview van status + estimates

Acceptatie (DoD):
- GET /api/rangeband/preview?pool=0x...&min=...&max=...[&wallet=0x...]
- Response type: ApiEnvelope<RangeBandPreview>
- RangeBandPreview: { currentPrice, band: { min, max }, status: 'IN_RANGE'|'OUT_OF_RANGE'|'INSUFFICIENT_DATA', estFees7dUsd, estIl7dUsd }
- Degrade mode: code 'RANGEBAND_NO_DATA' if insufficient pool data
- Verify: curl '/api/rangeband/preview?pool=0x..&min=..&max=..' | jq '.ok' → true

Scope/Files: pages/api/rangeband/preview.ts, src/lib/rangeband/estimate.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Estimates zijn approximations (7d historical average). Not financial advice disclaimer needed in UI.
```

---

### FE-08: Integrate Analytics Summary

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-T13

Domein: FRONTEND

Model: AUTO

Titel: Integrate /api/analytics/summary endpoint in /summary route

Goal: Summary page consumes API, handles degrade mode, shows stale banner

Acceptatie (DoD):
- /summary page fetches /api/analytics/summary via React Query
- Handles degrade mode: shows stale banner + cached data if degrade: true
- Timeout handling: 60s max, fallback to cached data
- Verify: curl /api/analytics/summary | jq '.ok' → true; golden wallet test renders data

Scope/Files: pages/summary.tsx, src/hooks/useAnalyticsSummary.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: /summary route consolidatie met /dashboard is TODO. For now, implement as separate route.
```

---

### FE-09: Integrate MV Position Overview

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-T14

Domein: FRONTEND

Model: AUTO

Titel: Integrate mv_position_overview_latest in /pool/[id] route

Goal: Pool detail page pulls RangeBand™ status from MV (FE presentational only)

Acceptatie (DoD):
- /pool/[id] fetches /api/analytics/pool/[id] → data includes bandColor, positionRatio from MV
- RangeBand™ component receives props, does NO calculation
- Verify: curl /api/analytics/pool/[id] | jq '.pool.bandColor' → valid color; grep -r "calculateBandColor" components/ → 0 matches

Scope/Files: pages/pool/[id].tsx, components/RangeBand.tsx

Env: LOCAL → STAGING → PROD

Notities/risico's: RangeBand™ SSoT guardrail MUST be enforced. Code review rejects any FE calculation logic.
```

---

### FE-10: Day Stats Chart 7d/30d

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-T15

Domein: FRONTEND

Model: AUTO

Titel: Render charts from mv_position_day_stats (7d/30d variants)

Goal: Position performance charts met historical data (fees, TVL, time in range)

Acceptatie (DoD):
- Chart component renders 7d and 30d variants
- Data from mv_position_day_stats via API
- Chart styling: compact (200px height) vs large (400px), tabular-nums voor labels, Signal Aqua (#1BE8D2) primary line
- Responsive: 768px breakpoint (mobile stacks, desktop side-by-side)
- Verify: visual test + data points validation; charts render correctly at 320px/768px/1024px

Scope/Files: components/Charts/PositionPerformance.tsx, src/hooks/usePositionDayStats.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Chart library (recharts/victory) moet gekozen worden. Ensure chart labels use .numeric class.
```

---

### FE-11: RangeBand Preview UI Integration

```
TASK INTAKE (copy/paste)

Sprint/ID: SP2-T16

Domein: FRONTEND

Model: AUTO

Titel: Hook /api/rangeband/preview into /rangeband interactive calculator

Goal: User kan range slider gebruiken en live preview zien van RangeBand™ status + estimates

Acceptatie (DoD):
- /rangeband page: range slider (min/max price inputs) + pool selector
- Live preview: debounced API call (500ms) to /api/rangeband/preview
- Shows: status badge (IN_RANGE/OUT_OF_RANGE), estFees7dUsd, estIl7dUsd
- Handles degrade mode: shows "Insufficient data" message if code: 'RANGEBAND_NO_DATA'
- Verify: curl '/api/rangeband/preview?pool=0x..&min=..&max=..' | jq '.ok' → true; UI updates on slider change

Scope/Files: pages/rangeband.tsx, components/RangeBandCalculator.tsx, src/hooks/useRangeBandPreview.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Slider UX moet smooth zijn (debounce belangrijk). Consider caching recent preview results.
```

---

## Sprint 3 (SP3) — Billing & Compliance

### API-03: Entitlements Endpoint

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-T52

Domein: API

Model: CODEX

Titel: Implement GET /api/entitlements?wallet=0x... voor server-authoritative plan gating

Goal: Server returns plan/status from DB (BillingCustomer) — NO client-override mogelijk

Acceptatie (DoD):
- GET /api/entitlements?wallet=0x...
- Response: ApiEnvelope<Entitlements>
- Entitlements: { wallet, plan: 'VISITOR'|'PREMIUM'|'PRO', status: 'trialing'|'active'|'past_due'|'canceled'|'none', maxPools, features: string[], indexedUpToTs }
- Plan from DB (BillingCustomer table), fallback VISITOR if no record
- Verify: curl /api/entitlements?wallet=0x... | jq -r '.data.plan' → returns plan from DB (not query param)

Scope/Files: pages/api/entitlements.ts, src/lib/db/queries/billing.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: COMPLIANCE guardrail — server-authoritative. Test: client cannot override plan by changing query param.
```

---

### API-04: User Settings CRUD

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-T53

Domein: API

Model: CODEX

Titel: Implement GET/POST /api/user/settings voor email + preferences

Goal: User kan email + notification preferences opslaan (GDPR compliance)

Acceptatie (DoD):
- GET /api/user/settings?wallet=0x... → UserSettings
- POST /api/user/settings → update UserSettings
- UserSettings: { email?, emailVerified: boolean, notifications: { alerts, reports, marketing } }
- Email validation: required format check, async check (not already in use)
- Unsubscribe flow: update notifications via query param (e.g., ?unsubscribe=alerts)
- Verify: curl /api/user/settings?wallet=0x... | jq '.data.settings.emailVerified' → boolean

Scope/Files: pages/api/user/settings.ts, src/lib/db/queries/user-settings.ts, prisma schema (UserSettings table)

Env: LOCAL → STAGING → PROD

Notities/risico's: Email verification flow (send verification email) is separate task. For MVP, emailVerified defaults false.
```

---

### API-05: User Delete (GDPR)

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-T54

Domein: API + BILLING

Model: CODEX

Titel: Implement POST /api/user/delete voor GDPR compliance

Goal: User kan account verwijderen → Stripe cancel + DB cleanup + pseudonimize analytics

Acceptatie (DoD):
- POST /api/user/delete (body: { wallet, confirm: true })
- Actions: Stripe subscription cancel → delete BillingCustomer + UserSettings + AlertConfig → pseudonimize analytics (wallet→hash in analytics tables)
- AuditLog entry: { ts, actor: wallet, action: 'USER_DELETE', target: wallet, meta: { stripe_sub_id, deleted_records } }
- Confirmation email via Mailgun (mode-aware: no email in degrade mode, log only)
- Verify: returns { ok: true }; AuditLog entry exists; Stripe subscription canceled

Scope/Files: pages/api/user/delete.ts, src/lib/billing/stripe.ts, src/lib/db/queries/user-delete.ts, prisma schema (AuditLog table)

Env: LOCAL → STAGING (Stripe TEST) → PROD

Notities/risico's: COMPLIANCE guardrail — GDPR delete is pre-launch blocker. Test: delete flow completes + audit log + Stripe cancel.
```

---

### BILLING-01: Email Verplicht in Checkout

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-B01

Domein: BILLING

Model: CODEX

Titel: Enforce email input in Stripe checkout (no empty email allowed)

Goal: Alle subscriptions hebben email address voor receipts + GDPR compliance

Acceptatie (DoD):
- Stripe checkout session: email field required (cannot proceed without valid email)
- Validation: 400 error if empty email in checkout request
- Email stored in BillingCustomer table
- Verify: Checkout attempt without email fails; valid email → subscription created + email in DB

Scope/Files: pages/api/billing/create-checkout-session.ts, src/lib/billing/stripe.ts

Env: LOCAL → STAGING (Stripe TEST) → PROD

Notities/risico's: Stripe TEST mode in staging. Validate with test card 4242 4242 4242 4242.
```

---

### BILLING-02: EUR Label + 24h FX Cache

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-B02

Domein: BILLING + FRONTEND

Model: CODEX (FX API) + AUTO (UI)

Titel: Show "Charged in EUR (≈ €XX.XX)" label + 24h FX cache

Goal: Users zien approximate EUR pricing naast USD (transparency voor EU users)

Acceptatie (DoD):
- FX API: GET /api/billing/fx-rate → returns EUR/USD rate (ECB or similar, TTL 24h)
- Cache: Redis-backed or in-memory with 24h expiration
- Fallback: if FX API unavailable, use last cached rate + stale indicator "* Rate from [date]"
- UI: "Charged in EUR (≈ €XX.XX)" label below USD pricing on /pricing page
- Typography: Inter 400, 14px, --text-med opacity (0.6)
- Verify: curl /api/billing/fx-rate | jq '.rate' → returns numeric EUR/USD rate; cache headers: Cache-Control: max-age=86400; npm run verify:pricing checks EUR label presence; visual test

Scope/Files: pages/api/billing/fx-rate.ts, components/Pricing/Calculator.tsx, src/lib/format/currency.ts

Env: LOCAL (mock rate) → STAGING (ECB API) → PROD

Notities/risico's: Depends on SP1-T37 (currency helpers in src/lib/format/currency.ts). FX rate refresh cron job needed.
```

---

### BILLING-03: Trial Countdown Badge

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-B03

Domein: BILLING + FRONTEND

Model: AUTO

Titel: Show trial countdown badge "D-n" for active trials

Goal: Users zien hoeveel dagen trial remaining (urgency → conversion)

Acceptatie (DoD):
- Badge format: "D-n" (e.g., "D-7" for 7 days remaining)
- Placement: top-right corner of pricing card for users with status: 'trialing'
- Colors: Signal Aqua (#1BE8D2) background, white text, 600 font weight
- Timer logic: auto-updates daily (no live countdown); disappears on trial end
- Data source: /api/entitlements?wallet=0x... → { status: 'trialing', trialEndsAt: ISO8601 }
- Verify: E2E test with trial subscription fixture → badge shows "D-14" → advance 7 days → badge shows "D-7"; visual test (trialing users only); curl /api/entitlements?wallet=0xTRIAL | jq '.data.status' → "trialing"

Scope/Files: components/Pricing/TrialBadge.tsx, pages/api/entitlements.ts

Env: LOCAL (mock trial) → STAGING (Stripe TEST trial) → PROD

Notities/risico's: Trial countdown calculation: Math.ceil((trialEndsAt - now) / 86400000). Test edge case: day of expiration (D-0 vs D-1).
```

---

### FE-12: Pricing Page Email/EUR/Trial

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-T21 + SP3-T22 + SP3-T23 (consolidated)

Domein: FRONTEND

Model: AUTO

Titel: Update /pricing page met email validation, EUR label, trial countdown badge

Goal: Pricing page compliant + EU-friendly + conversion-optimized

Acceptatie (DoD):
- Email input in checkout flow: required field, validation (format check), 400 on empty
- EUR label: "Charged in EUR (≈ €XX.XX)" below USD pricing (uses /api/billing/fx-rate)
- Trial countdown badge: "D-n" badge for trialing users (top-right pricing card)
- Calculator UX: pool slider (step 5, min 5), add-ons checkboxes, live total update, tabular-nums for stable layout
- Degrade states: Stripe degrade (disabled CTA + warning), 0 pools selected (tooltip), email missing (inline validation)
- Verify: checkout without email fails; EUR label visible + updates daily; trial badge shows for trial users; visual test at 320px/768px/1024px

Scope/Files: pages/pricing.tsx, components/Pricing/Calculator.tsx, components/Pricing/TrialBadge.tsx

Env: LOCAL → STAGING → PROD

Notities/risico's: Depends on SP3-B01/B02/B03 (API endpoints). Test all degrade states.
```

---

### FE-13: Account Page

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-T24

Domein: FRONTEND

Model: AUTO

Titel: Build /account page met profile, subscription, preferences sections

Goal: Premium/Pro users kunnen settings beheren (email, notifications, subscription)

Acceptatie (DoD):
- Page renders for Premium/Pro users (VISITOR → redirect to /pricing)
- Sections: Profile (email, wallet), Subscription (plan, status, cancel CTA), Preferences (notifications checkboxes)
- Verify: page accessible for Premium/Pro users; VISITOR redirected; sections render correctly

Scope/Files: pages/account.tsx, components/Account/Profile.tsx, components/Account/Subscription.tsx, components/Account/Preferences.tsx

Env: LOCAL → STAGING → PROD

Notities/risico's: Depends on SP3-T25/T26 (settings API + delete flow). Forms use react-hook-form + Zod validation (see detailed spec in ROADMAP).
```

---

### FE-14: Account Settings API Integration

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-T25

Domein: FRONTEND

Model: AUTO

Titel: Integrate /api/user/settings in /account page (CRUD + email verification)

Goal: User kan email + notification preferences opslaan via UI

Acceptatie (DoD):
- GET /api/user/settings on page load → populate form
- POST /api/user/settings on form submit → save changes
- Email validation: required/format check (regex), async check (not already in use, debounced 500ms)
- Email preferences: alerts/reports/marketing checkboxes (opt-in), auto-save on change
- Success state: green checkmark + "Settings saved" toast (3s auto-dismiss)
- Degrade handling: stale data banner on load error, toast error + retry button on save error
- Verify: curl /api/user/settings?wallet=0x... | jq '.data.settings.emailVerified' → boolean; form saves + persists

Scope/Files: pages/account.tsx, components/Account/ProfileForm.tsx, src/hooks/useUserSettings.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Forms pattern: react-hook-form + Zod validation (see detailed spec in ROADMAP_DOMAIN_SPECS.md → /account section).
```

---

### FE-15: Account Delete Flow

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-T26

Domein: FRONTEND

Model: AUTO

Titel: Implement GDPR delete flow in /account (Danger Zone)

Goal: User kan account verwijderen met confirmation modal (type DELETE)

Acceptatie (DoD):
- Danger Zone section: red border, collapsed by default (Accordion pattern)
- "Delete Account" button (red, ghost style) → opens confirm modal
- Confirm modal: title "Delete your account?", content "Type DELETE to confirm", text input (must type "DELETE" exactly)
- Actions: "Cancel" (secondary), "Delete Account" (red primary, disabled until "DELETE" typed)
- Flow: Confirm → POST /api/user/delete → success toast → redirect /pricing?deleted=true
- Degrade handling: modal stays open + inline error "Delete failed — contact support" on API error
- Verify: returns { ok: true }; AuditLog entry exists; Stripe subscription canceled

Scope/Files: pages/account.tsx, components/Account/DangerZone.tsx, components/Modals/DeleteConfirm.tsx

Env: LOCAL → STAGING → PROD

Notities/risico's: GDPR compliance. Test: delete flow completes + audit log + Stripe cancel. Modal pattern uses SP1-T38 Modal component.
```

---

### OPS-03: Legal Pages

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-T42 (part of SP4-L01)

Domein: OPS + FRONTEND

Model: CLAUDE (legal content) + AUTO (UI)

Titel: Create /legal/{privacy,terms,cookies} pages met GDPR-compliant content

Goal: Legal pages exist + accessible + compliant vóór launch (COMPLIANCE guardrail)

Acceptatie (DoD):
- Routes: /legal/privacy, /legal/terms, /legal/cookies (SSR, SEO meta, last updated date)
- Content: GDPR-compliant Privacy Policy, Terms of Service, Cookie Policy (juridisch advies indien mogelijk)
- Template: Quicksand 600 headers, Inter 400 body, max-width 800px, TOC + Accordion pattern
- WCAG AA compliance: contrast ≥4.5:1, keyboard nav (Tab/Enter/Space), focus indicators (2px --brand-primary)
- Verify: curl -I /legal/privacy | grep "200 OK" (× 3 routes); footer links accessible; keyboard nav works

Scope/Files: pages/legal/privacy.tsx, pages/legal/terms.tsx, pages/legal/cookies.tsx, components/Legal/LegalTemplate.tsx

Env: LOCAL → STAGING → PROD (pre-launch blocker)

Notities/risico's: COMPLIANCE guardrail — legal pages verplicht. Juridisch advies external dependency (kan 1-2 weken duren). Placeholder content OK voor staging, maar real content vóór prod launch.
```

---

### FE-16: CookieBanner Component

```
TASK INTAKE (copy/paste)

Sprint/ID: SP4-T41 (part of SP4-L01)

Domein: FRONTEND

Model: AUTO

Titel: Implement CookieBanner component met localStorage consent tracking

Goal: GDPR-compliant cookie consent banner (COMPLIANCE guardrail)

Acceptatie (DoD):
- CookieBanner: fixed bottom, z-index 1000, ARIA dialog, focus trap, Esc/Enter dismiss
- Consent tracking: localStorage.ll_cookies_accepted ('true'|'false')
- First visit logic: check localStorage on mount → show banner after 2s delay if null
- Actions: "Accept All" (primary), "Reject All" (secondary), "Cookie Settings" (link to /legal/cookies)
- Dismiss: Esc key defaults to Reject, Enter on Accept button → Accept, click outside → no action (user must choose)
- Verify: banner appears on first visit (clear localStorage before test); keyboard nav (Tab→buttons→Enter→Esc); npm run verify:a11y → CookieBanner passes Axe audit (≥95 score)

Scope/Files: components/CookieBanner.tsx, src/hooks/useCookieConsent.ts

Env: LOCAL → STAGING → PROD (pre-launch blocker)

Notities/risico's: COMPLIANCE guardrail — CookieBanner verplicht. A11y critical: focus trap + keyboard nav + ARIA. Test: first visit flow, dismiss, persistence.
```

---

### OPS-04: Gating Hook + Route Matrix

```
TASK INTAKE (copy/paste)

Sprint/ID: SP3-G01 + SP3-G02

Domein: FRONTEND + API

Model: CODEX

Titel: Implement usePlanGating() hook + route × plan matrix enforcement

Goal: Client-side gating via hook + server-side validation via /api/entitlements

Acceptatie (DoD):
- Hook: usePlanGating() → returns { plan, canAccess(route), maxPools, features }
- Route matrix:
  * / (Home): Visitor = demo; Premium/Pro = connect→dashboard
  * /summary vs /dashboard: dashboard = logged-in home (consolidate TODO)
  * /pool/[id]: Visitor blurred metrics; Premium details; Pro + peer metrics (post-MVP)
  * /rangeband: Visitor explainer; Premium/Pro interactive
  * /pricing: Always visible; CTAs depend on billing health/plan
  * /account: Premium/Pro only; past_due = read-only + banner
- Server-side validation: API routes check /api/entitlements (no client-override)
- Verify: curl /api/entitlements?wallet=0xTEST | jq -r '.data.plan' → plan from DB; FE gating blocks Visitor from /account; Premium can access /rangeband

Scope/Files: src/hooks/usePlanGating.ts, middleware/gating.ts, pages/api/entitlements.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: COMPLIANCE guardrail — /api/entitlements server-authoritative. Test: client cannot bypass gating by manipulating localStorage/query params.
```

---

## Sprint 4 (SP4) — Observability & Compliance

### OPS-05: Sentry Front/Back Integration

```
TASK INTAKE (copy/paste)

Sprint/ID: SP4-B04

Domein: OPS + FRONTEND

Model: CODEX (Sentry config) + COMPOSER 1 (error UI)

Titel: Setup Sentry front+back met ErrorBoundary + source maps

Goal: Errors logged to Sentry dashboard met readable stack traces (COMPLIANCE guardrail + STAGING gate)

Acceptatie (DoD):
- Sentry SDK: @sentry/nextjs installed + configured
- Frontend: ErrorBoundary catches React errors → logs to Sentry + shows fallback UI ("Something went wrong" + Reload button + Sentry event ID)
- Backend: API errors (500, unhandled exceptions) → logs to Sentry with context (wallet, route, method)
- Source maps: uploaded to Sentry for stack trace resolution
- Test route: /api/sentry-test throws intentional error → logs to Sentry
- Sentry projects: staging (TEST project) + prod (PROD project)
- Verify: npm run verify:sentry → test error logged; frontend navigate to /sentry-test-crash → ErrorBoundary renders + Sentry event visible; backend curl /api/sentry-test → 500 + Sentry event visible; Sentry dashboard shows readable stack traces

Scope/Files: sentry.client.config.ts, sentry.server.config.ts, components/ErrorBoundary.tsx, pages/api/sentry-test.ts, next.config.js (source maps upload)

Env: LOCAL (disabled) → STAGING (Sentry TEST project) → PROD (Sentry PROD project)

Notities/risico's: STAGING merge gate — Sentry active check required. ErrorBoundary UI uses SP1-T38 component spec. Test: intentional error → event in dashboard + source maps readable.
```

---

### OPS-06: Uptime Monitor Setup

```
TASK INTAKE (copy/paste)

Sprint/ID: SP4-B05

Domein: OPS

Model: CODEX

Titel: Configure uptime monitor (UptimeRobot/Pingdom) voor /api/health

Goal: External monitoring checks /api/health every 5min + alerts on downtime (COMPLIANCE guardrail + STAGING gate)

Acceptatie (DoD):
- External monitor: UptimeRobot or Pingdom or Railway built-in monitor
- Endpoint: /api/health returns { status: "ok" } with 200 status (no DB/RPC calls, instant response)
- Frequency: check every 5 minutes
- Alerts: Slack/email notification on downtime (≥2 consecutive failures)
- Status page: optional public status page (status.liquilab.io) shows uptime history
- Verify: curl https://app.liquilab.io/api/health | jq '.status' → "ok"; monitor dashboard uptime ≥99.9% (3mo rolling); downtime test (stop Railway service) → alert received within 10 minutes

Scope/Files: pages/api/health.ts (already exists), UptimeRobot/Pingdom dashboard config

Env: STAGING → PROD

Notities/risico's: STAGING merge gate — Uptime monitor active check required. /api/health endpoint GECOVERED (already exists). Test: downtime alert flow.
```

---

### OPS-07: CI Workflow Staging Deploy

```
TASK INTAKE (copy/paste)

Sprint/ID: S0-OPS03 (CI infrastructure)

Domein: OPS

Model: CODEX

Titel: Setup CI workflow voor automatic staging deploy on PR open

Goal: Every PR triggers staging deploy + verify suite run (STAGING merge gate)

Acceptatie (DoD):
- GitHub Actions workflow: .github/workflows/staging-deploy.yml
- Trigger: on PR open/sync to main
- Steps: checkout → install deps → build → deploy to Railway staging → run npm run verify
- Status check: "Staging Deploy" success/failure posted to PR
- GitHub branch protection: require "Staging Deploy" status check to merge
- Verify: open PR → CI runs → staging deploy succeeds → verify suite passes → status check green; failed verify → PR merge blocked

Scope/Files: .github/workflows/staging-deploy.yml, Railway config

Env: CI (GitHub Actions) → STAGING

Notities/risico's: Railway staging project must exist first (S0-OPS01). CI secrets: RAILWAY_TOKEN, SENTRY_AUTH_TOKEN. Test: open test PR → observe CI run.
```

---

### FE-17: FAQ Page (Accordion)

```
TASK INTAKE (copy/paste)

Sprint/ID: POST-MVP (was SP1-T13)

Domein: FRONTEND

Model: AUTO

Titel: Build /faq page met Accordion component + anchor links

Goal: FAQ met collapsible sections + deep links naar specific questions

Acceptatie (DoD):
- /faq page uses Accordion component (from SP1-T38 DS spec)
- Each FAQ: question (heading) + answer (body text), collapsible
- Anchor links: #how-rangeband-works → auto-expand relevant accordion section
- Keyboard navigation: Tab → questions, Enter/Space → toggle, Arrow keys → navigate
- Verify: click anchor link → section expands; keyboard nav works; ARIA expanded states correct

Scope/Files: pages/faq.tsx, components/Accordion.tsx (from SP1-T38)

Env: LOCAL → STAGING → PROD

Notities/risico's: **DEFERRED TO POST-MVP** per scope decision 2025-11-16. Use external help center (Notion/Intercom) for MVP launch. FAQ content: product/marketing team input needed.
```

---

### OPS-08: Internal Status Panel

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T13

Domein: FRONTEND

Model: AUTO

Titel: Build /faq page met Accordion component + anchor links

Goal: FAQ met collapsible sections + deep links naar specific questions

Acceptatie (DoD):
- /faq page uses Accordion component (from SP1-T38 DS spec)
- Each FAQ: question (heading) + answer (body text), collapsible
- Anchor links: #how-rangeband-works → auto-expand relevant accordion section
- Keyboard navigation: Tab → questions, Enter/Space → toggle, Arrow keys → navigate
- Verify: click anchor link → section expands; keyboard nav works; ARIA expanded states correct

Scope/Files: pages/faq.tsx, components/Accordion.tsx (from SP1-T38)

Env: LOCAL → STAGING → PROD

Notities/risico's: Depends on SP1-T38 (Accordion component). FAQ content: product/marketing team input needed.
```

---

### OPS-08: Internal Status Panel

```
TASK INTAKE (copy/paste)

Sprint/ID: SP4-T43

Domein: OPS + FRONTEND

Model: CODEX (status endpoint) + AUTO (UI)

Titel: Build /status internal panel voor component health monitoring

Goal: Ops/support can see db/analytics/billing/mail/indexer statuses at a glance

Acceptatie (DoD):
- /status page (no auth for MVP, internal use only)
- Component states:
  * Database: ok (green), slow (yellow, >500ms), down (red)
  * Analytics MVs: last refresh timestamp, stale if >2h
  * Billing (Stripe): ok / degrade (Stripe API timeout)
  * Mail (Mailgun): ok / degrade (queue paused or API error)
  * Indexer: last processed block + lag in seconds, stale if >300s
- SEV level indicators: SEV-1 (red, critical), SEV-2 (orange, major), SEV-3 (yellow, minor)
- Visual design: 3-col grid (desktop), 1-col (mobile), status badges (8px circle + label), relative timestamps + absolute on hover
- Optional: incident log (last 10, newest first: Timestamp/SEV/Component/Message)
- Verify: /status page accessible; matches /api/health output; Sentry test error visible in log (SP4-B04 integration)

Scope/Files: pages/status.tsx, components/Status/ComponentCard.tsx, components/Status/StatusBadge.tsx, pages/api/health.ts (extend with component details)

Env: LOCAL → STAGING → PROD

Notities/risico's: /api/health endpoint GECOVERED, extend with component breakdown. Status page is internal (no public status.liquilab.io for MVP).
```

---

## Sprint 4 (SP4) — Observability & Compliance

### OPS-05: Sentry Front/Back Integration

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T30

Domein: FRONTEND

Model: CODEX

Titel: Implement ErrorBoundary component (page-level fallback + Sentry logging)

Goal: React errors caught + logged to Sentry, user sees fallback UI instead of blank page

Acceptatie (DoD):
- ErrorBoundary component: wraps pages in _app.tsx
- Fallback UI: "Something went wrong" heading, "Reload" button, Sentry event ID (for support reference)
- Logs error to Sentry with component stack trace
- Forced throw test: /sentry-test-crash route → ErrorBoundary renders (no blank page)
- Verify: E2E crash route → ErrorBoundary fallback visible + Sentry event logged

Scope/Files: components/ErrorBoundary.tsx, pages/_app.tsx, pages/sentry-test-crash.tsx (test route)

Env: LOCAL → STAGING → PROD

Notities/risico's: Depends on SP4-B04 (Sentry). Uses SP1-T38 visual spec (fallback UI design).
```

---

### FE-19: Toast Component

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T31

Domein: FRONTEND

Model: CODEX

Titel: Implement Toast notification system (queue + ARIA live region)

Goal: Consistent success/error/info notifications across app

Acceptatie (DoD):
- Toast component: queue system, auto-dismiss (3s default), manual dismiss (X button)
- Variants: success (green), error (red), info (blue), warning (yellow)
- ARIA live region: aria-live="polite" voor screen reader announcements
- Position: bottom-right corner (desktop), bottom center (mobile)
- Verify: unit test dispatch success/error → toasts render in queue order; auto-dismiss after 3s; manual dismiss works

Scope/Files: components/Toast/ToastProvider.tsx, components/Toast/Toast.tsx, src/hooks/useToast.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Uses SP1-T38 visual spec (Toast variants). Global provider in _app.tsx.
```

---

### FE-20: Modal Component

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T32

Domein: FRONTEND

Model: CODEX

Titel: Implement generic Modal wrapper (Esc/overlay close, focus trap)

Goal: Reusable modal voor confirmations, forms, etc. met A11y

Acceptatie (DoD):
- Modal component: generic wrapper, supports title, content, actions (footer buttons)
- A11y: role="dialog", aria-modal="true", focus trap (Tab cycles within modal), Esc key closes
- Overlay: click outside modal → close (optional, configurable)
- Animations: smooth fade-in/out (respects prefers-reduced-motion)
- Verify: Axe check passes; keyboard nav works (Tab→buttons→Esc closes); click outside closes (if enabled)

Scope/Files: components/Modal/Modal.tsx, components/Modal/ModalProvider.tsx, src/hooks/useModal.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Uses SP1-T38 visual spec (Modal design). Focus trap library: focus-trap-react.
```

---

### FE-21: Form Components

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T33

Domein: FRONTEND

Model: CODEX

Titel: Implement Form.* components (Text/Select/Checkbox met validation)

Goal: Standardized form components met react-hook-form integration

Acceptatie (DoD):
- Form.Text: text input, validation states (default/focus/error/success), inline error messages
- Form.Select: dropdown, same validation states
- Form.Checkbox: checkbox + label, validation states
- Integration: react-hook-form + Zod schema validation
- Error display: red border + error message below field (Inter 400, 14px, --error color)
- Success state: green checkmark icon
- Verify: invalid email blocks submit; form state persists; A11y labels associated

Scope/Files: components/Form/FormText.tsx, components/Form/FormSelect.tsx, components/Form/FormCheckbox.tsx

Env: LOCAL → STAGING → PROD

Notities/risico's: Uses SP1-T38 visual spec (Form states). react-hook-form + Zod already in package.json?
```

---

### FE-22: DataState Component

```
TASK INTAKE (copy/paste)

Sprint/ID: SP1-T36

Domein: FRONTEND

Model: CODEX

Titel: Implement DataState pattern component (loading/empty/degrade/error)

Goal: Consistent states across app voor data fetching scenarios

Acceptatie (DoD):
- DataState component accepts state prop: 'loading' | 'empty' | 'degrade' | 'error' | 'success'
- Loading: skeleton loaders (shimmer effect)
- Empty: "No data" message + optional CTA (e.g., "Connect wallet")
- Degrade: stale data banner + cached data visible + timestamp "Last updated X mins ago"
- Error: error message + "Retry" button
- Success: renders children (actual data)
- Verify: Storybook stories for all 5 states; visual regression test

Scope/Files: components/DataState.tsx, components/Skeleton.tsx

Env: LOCAL → STAGING → PROD

Notities/risico's: Uses SP1-T38 visual spec (DataState variants). Skeleton shimmer effect: CSS animation.
```

---

## Sprint 5 (SP5) — Polish (Absorbed in SP1)

**Note:** All SP5 polish tasks (ErrorBoundary, Toast, Modal, Form Components, DataState) have been **moved to Sprint 1 (SP1)** per scope decision 2025-11-16 (Option B: Balanced MVP).

**Tasks moved to SP1 (see above):**
- SP1-T30: ErrorBoundary Implementation → See "Sprint 4 (SP4) — OPS-05"
- SP1-T31: Toast Component → See "Sprint 4 (SP4) — FE-19"
- SP1-T32: Modal Component → See "Sprint 4 (SP4) — FE-20"
- SP1-T33: Form Components → See "Sprint 4 (SP4) — FE-21"
- SP1-T36: DataState Component → See "Sprint 4 (SP4) — FE-22"

**Rationale:** Professional UX polish worth 2-week delay (16w → 18w MVP). ErrorBoundary required for Sentry integration, Modal required for GDPR delete flow, Forms required for Account page, Toast/DataState provide consistent patterns across app.

**Timeline Impact:** SP5 work absorbed in SP1 (week 2-4), no separate SP5 sprint needed. Total MVP duration: 18 weeks.

---

## Sprint 6 (SP6) — Advanced Features (Deferred to Post-MVP)

**Note:** All SP6 tasks have been **deferred to Post-MVP** per scope decision 2025-11-16 (Option B: Balanced MVP). Alerts functionality not critical for launch; can be added post-MVP based on user demand.

### API-06: Alerts CRUD (POST-MVP)

```
TASK INTAKE (copy/paste)

Sprint/ID: POST-MVP (was SP6-T55, part of SP6-T31)

Domein: API

Model: CODEX

Titel: Implement GET/POST/PUT/DELETE /api/user/alerts voor alert configuration

Goal: Premium+Alerts users kunnen alerts configureren per position

Acceptatie (DoD):
- GET /api/user/alerts?wallet=0x... → list of AlertRecord[]
- POST /api/user/alerts → create new alert
- PUT /api/user/alerts/[id] → update alert (enable/disable)
- DELETE /api/user/alerts/[id] → delete alert
- AlertRecord schema: { id, wallet, positionId, type: 'out_of_range'|'near_band'|'claim_ready', enabled, lastTriggered }
- Rate limiting: max 50 alerts/wallet
- Degrade mode: code 'ALERTS_PAUSED' if queue paused
- Verify: CRUD E2E test; curl CRUD cycle; code:'ALERTS_PAUSED' on degrade

Scope/Files: pages/api/user/alerts/index.ts, pages/api/user/alerts/[id].ts, prisma schema (AlertConfig table)

Env: LOCAL → STAGING → PROD

Notities/risico's: **DEFERRED TO POST-MVP** per scope decision 2025-11-16. Alert delivery logic (Mailgun templates) is separate task. For MVP, focus on core analytics features first. Alerts can be added post-launch based on user demand.
```

---

### FE-23: Alerts Toggles UI (POST-MVP)

```
TASK INTAKE (copy/paste)

Sprint/ID: POST-MVP (was SP6-T32)

Domein: FRONTEND

Model: AUTO

Titel: Add alert toggles in dashboard (per position)

Goal: User kan alerts aan/uit zetten per position via toggle switches

Acceptatie (DoD):
- Dashboard: each position card has alert toggle (out_of_range, claim_ready)
- Toggle state: enabled (green), disabled (gray)
- Save to API: PUT /api/user/alerts/[id] on toggle change
- Persists: toggle state persists across sessions
- Degrade handling: shows "Alerts unavailable" message if code:'ALERTS_PAUSED'
- Verify: toggle persists; API call succeeds; delivery test (manual: trigger alert → email sent, if delivery implemented)

Scope/Files: components/PoolCard.tsx, src/hooks/useAlerts.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: **DEFERRED TO POST-MVP** per scope decision 2025-11-16. Depends on SP6-T55 (alerts CRUD API). Alert delivery is post-MVP (for now, just UI + API persistence when implemented).
```

---

## Nice to Have (Post-MVP)

**Note:** All items below have been **confirmed as Post-MVP** per scope decision 2025-11-16 (Option B: Balanced MVP). These features add value but are not critical for initial launch.

### FE-24: Reports Export (POST-MVP)

```
TASK INTAKE (copy/paste)

Sprint/ID: POST-MVP

Domein: FRONTEND + API

Model: CODEX (export logic) + AUTO (UI)

Titel: Implement POST /api/reports/export voor CSV/PDF download

Goal: Pro users kunnen historical reports downloaden (portfolio/fees/IL)

Acceptatie (DoD):
- POST /api/reports/export (body: { wallet, format: 'csv'|'pdf', dateFrom, dateTo, reportType: 'portfolio'|'fees'|'il' })
- Response: { downloadUrl, expiresAt } (signed URL, 1h expiration)
- CSV generation: papaparse library
- PDF generation: pdfkit or jsPDF
- Verify: download succeeds; CSV/PDF contains correct data; URL expires after 1h

Scope/Files: pages/api/reports/export.ts, src/lib/reports/generate.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Nice to have (not MVP critical). Storage: Railway ephemeral storage or S3 bucket.
```

---

### FE-25: Leaderboard (POST-MVP)

```
TASK INTAKE (copy/paste)

Sprint/ID: POST-MVP

Domein: FRONTEND + API

Model: CODEX (query logic) + AUTO (UI)

Titel: Implement GET /api/analytics/leaderboard voor top wallets ranking

Goal: Pro users zien peer comparison (wallets masked voor privacy)

Acceptatie (DoD):
- GET /api/analytics/leaderboard?metric=tvl|fees|apr&period=7d|30d&limit=100
- Response: { leaderboard: [{ rank, wallet (masked 0x1234...5678), value, badge? }], userRank? }
- Privacy: wallet addresses masked (first 6 + last 4 chars), opt-out mechanism
- Query: analytics_wallet_metrics_daily table, cache 1h (TTL 3600s)
- Verify: query returns top 100; user rank shown if wallet provided; masked wallets

Scope/Files: pages/api/analytics/leaderboard.ts, pages/leaderboard.tsx

Env: LOCAL → STAGING → PROD

Notities/risico's: Nice to have (not MVP critical). Privacy compliance: opt-out via UserSettings.showInLeaderboard.
```

---

### FE-26: Onboarding Wizard (POST-MVP)

```
TASK INTAKE (copy/paste)

Sprint/ID: POST-MVP

Domein: FRONTEND

Model: COMPOSER 1 (UI polish) + AUTO

Titel: Build interactive onboarding wizard (5 steps)

Goal: Nieuwe users zien optional tour (improves UX, not MVP blocker)

Acceptatie (DoD):
- Modal overlay met step indicator (1/5)
- Steps: 1) Welcome → "LiquiLab aggregates all your DEX positions", 2) Connect wallet → demo connect, 3) View positions → highlight PoolsGrid, 4) RangeBand™ → tooltip explainer, 5) Upgrade → pricing CTA
- Skip button + "Don't show again" checkbox
- Stored in localStorage: ll_onboarding_completed
- Verify: first visit → wizard shows; skip → dismissed; "Don't show again" → persists

Scope/Files: components/Onboarding/OnboardingWizard.tsx, src/hooks/useOnboarding.ts

Env: LOCAL → STAGING → PROD

Notities/risico's: Nice to have (not MVP critical). MEDIUM PRIORITY post-launch.
```

---

## Summary

**Total Tasks:** 54 MVP + 8 Post-MVP = **62 total** (S0: 2, SP1: 12 [incl. 5 from SP5], SP2: 11, SP3: 13, SP4: 8, SP5: absorbed, SP6: deferred, Post-MVP: 8)

**Scope Decision Applied (2025-11-16):** Option B (Balanced MVP, 18 weeks)
- ✅ **Kept in MVP:** All SP5 polish (ErrorBoundary/Toast/Modal/Forms/DataState → moved to SP1)
- ✅ **Kept in MVP:** EUR label (SP3-B02), Status panel (SP4-T43)
- ❌ **Deferred to Post-MVP:** FAQ page (external help center), SP6 Alerts, Reports, Leaderboard, Onboarding

**Sprint Breakdown:**
- **S0 (Infrastructure):** 4 tasks (Staging setup, CI/CD, verify:brand, verify:typography)
- **SP1 (Foundation + Polish):** 12 tasks (Tokens, DS specs, Wave-hero, OG, Typography + 5 polish components)
- **SP2 (Data & Analytics):** 11 tasks (4 MVs + 2 API + 5 FE integration)
- **SP3 (Billing & Compliance):** 13 tasks (3 API + 3 Billing + 4 FE + 3 OPS incl. legal/gating)
- **SP4 (Observability):** 8 tasks (Sentry + Uptime + CookieBanner + Status + FAQ deferred + CI)
- **SP5:** Absorbed in SP1 ✅
- **SP6:** Deferred to Post-MVP ✅
- **Post-MVP:** 8 tasks (FAQ, Alerts CRUD/UI, Reports, Leaderboard, Onboarding, Advanced IL)

**Total Duration:** **18 weeks** (4.5 months calendar time)

**Critical Path:** S0 (1w) → SP1 (3w, incl. polish) → SP2 (2-3w) → SP3 (3w) → SP4 (2w) + Buffer (3-4w)

**Guardrails Enforced:**
- RangeBand™ SSoT: SP2-D02, SP2-T50, SP2-T14 (MV calculates, API delivers, FE presents)
- Flare-only: verified in all API tasks (no ANKR endpoints)
- Compliance: SP3-T52 (entitlements), SP4-B04 (Sentry), SP4-B05 (Uptime), SP4-L01 (Legal+CookieBanner)
- Brand: SP1-T37 (tokens), verify:brand, verify:typography (CSS vars, tabular-nums enforced)

**Merge Gates:**
- STAGING setup (S0-OPS01) vóór alle SP1 PRs
- 4 checks: Deploy Green, Sentry Active, Uptime Active, Verify Suite Pass
- Guardrails checks in verify suite (brand, typography, RangeBand™ SSoT, Flare-only)

---

**Generated:** 2025-11-16  
**Updated:** 2025-11-16 (Scope decisions applied)  
**Status:** 🔒 APPROVED — Ready for sprint planning & ticket creation (Option B: Balanced MVP, 18 weeks)  
**Next Step:** Review tasks → Assign owners → Create tickets in Jira/Linear/GitHub Projects → Kick off S0-OPS01 (Staging setup)

