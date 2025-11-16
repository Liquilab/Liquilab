# LiquiLab Sprint Roadmap — Executive Summary

> **Audience:** Management, Product, Marketing, Stakeholders  
> **Purpose:** High-level overview of sprint plan, timelines, risks, go-live criteria  
> **Generated:** 2025-11-16  
> **Updated:** 2025-11-16 (Scope decisions applied)  
> **Status:** 🔒 APPROVED — Option B (Balanced MVP, 18 weeks)

---

## 🎯 Mission

Launch **LiquiLab V1** (Flare-only, MVP scope) met complete brand system, design tokens, billing compliance, en observability infrastructure binnen **18 weeks** (4.5 months, Option B: Balanced MVP **APPROVED** ✅).

---

## 📅 Sprint Timeline Overview

| Sprint | Focus | Duration | Key Deliverables | Go-Live Blocker? |
|--------|-------|----------|------------------|------------------|
| **S0** | Infrastructure Setup | 1 week | Staging environment + CI/CD | ✅ YES (blocks SP1) |
| **SP1** | Foundation & Design System | 3 weeks | Figma tokens, DS components, Wave-hero, OG assets | ✅ YES (brand foundation) |
| **SP2** | Data & Analytics | 2-3 weeks | Materialized views, RangeBand™ API, wallet analytics | ⚠️ CRITICAL (SSoT) |
| **SP3** | Billing & Compliance | 3 weeks | Stripe integration, Legal pages, GDPR delete, Entitlements | ✅ YES (compliance) |
| **SP4** | Observability & Compliance | 2 weeks | Sentry, Uptime monitoring, Status page, CookieBanner | ✅ YES (ops readiness) |
| **SP5** | Polish & UX | *(absorbed in SP1)* | ErrorBoundary, Toast, Modal, Forms, DataState (moved to SP1) | ✅ YES (in SP1) |
| **SP6** | Advanced Features | *(deferred)* | Alerts CRUD (post-MVP) | ❌ NO (post-launch) |

**Total Estimated Duration:** 18 weeks (4.5 months) **[LOCKED]**  
**Critical Path:** S0 → SP1 (incl. polish) → SP2 → SP3 → SP4 (minimum for go-live)  
**Scope Decision:** Option B (Balanced MVP) — Keep all UX polish in SP1, defer FAQ/SP6 to Post-MVP

---

## 🚀 Go-Live Criteria (MVP Definition)

### Must-Have (Blockers) ✅

**Brand & Design (SP1):**
- ✅ Figma design system exported → CSS tokens (Quicksand/Inter, tabular-nums)
- ✅ Wave-hero background implemented (crisp rendering, responsive)
- ✅ OG social preview images (10 variants)
- ✅ Typography refactor complete (all numerics use `.numeric` class)
- ✅ **UX Polish (SP5 moved to SP1):** ErrorBoundary, Toast, Modal, Forms, DataState

**Data & Analytics (SP2):**
- ✅ 4 Materialized Views operational (wallet portfolio, position overview, day stats, events)
- ✅ RangeBand™ status calculated server-side (FE presentational only)
- ✅ Wallet analytics API (`/api/analytics/wallet/{wallet}/positions`)
- ✅ RangeBand preview API (`/api/rangeband/preview`)

**Billing & Compliance (SP3):**
- ✅ Stripe checkout requires email (GDPR compliance)
- ✅ **EUR pricing label + 24h FX cache** (SP3-B02, kept in MVP ✅)
- ✅ Trial countdown badge ("D-n" format)
- ✅ Entitlements API server-authoritative (`/api/entitlements`)
- ✅ User settings CRUD (`/api/user/settings`)
- ✅ GDPR delete flow (`/api/user/delete` → Stripe cancel + DB cleanup)
- ✅ Legal pages (`/legal/privacy`, `/legal/terms`, `/legal/cookies`)
- ✅ CookieBanner component (A11y compliant, localStorage consent)

**Observability (SP4):**
- ✅ Sentry front+back active (ErrorBoundary + source maps)
- ✅ Uptime monitor configured (`/api/health` checked every 5min)
- ✅ **Internal status panel** (`/status`, SP4-T43, kept in MVP ✅)
- ✅ CI/CD staging deploy + verify suite (automated checks)

### Nice-to-Have (Post-Launch) ⏭️

- **FAQ page** (external help center) — **Post-MVP** (deferred per scope decision ✅)
- Reports export (CSV/PDF) — **Post-MVP**
- Leaderboard (peer comparison) — **Post-MVP**
- Onboarding wizard (5-step tour) — **Post-MVP**
- Alerts CRUD + delivery — **Post-MVP** (SP6 deferred)
- Advanced IL analytics — **Post-MVP**

---

## 🛡️ Non-Negotiable Guardrails

These rules are **enforced in code** and **verified in CI**. Violations block PR merge.

### 1. RangeBand™ Single Source of Truth (SSoT)

**Rule:** Frontend calculates **NOTHING**. `bandColor` and `positionRatio` come exclusively from data layer (Materialized View).

**Rationale:** Prevents divergence between dashboard/API. Data layer has authoritative pool state (current tick, liquidity). Frontend is presentational only.

**Enforcement:**
- API endpoint `/api/analytics/wallet/{wallet}/positions` delivers `bandColor` + `positionRatio`
- FE `RangeBand` component accepts these as props, calculates nothing
- CI check: `grep -r "calculateBandColor" components/` → 0 matches (blocks merge if found)

**Owner:** DATA + API + FE (SP2-D02, SP2-T50, SP2-T14)

---

### 2. Flare-Only Runtime

**Rule:** Web/runtime blijft Flare-only. Token prices via unified API (CoinGecko backend). Token icons local-first + SSR-visible.

**Rationale:** Simplifies deployment (one chain), reduces external dependencies, improves SSR performance.

**Enforcement:**
- No ANKR endpoints in `/pages/api/*` (blocked by code review)
- Token prices via `/api/prices/current` (CoinGecko backend, cached)
- Token icons: `/public/media/tokens/*.svg|png|webp` → SSR `<img>`
- No dynamic imports for critical assets (icons, fonts, hero)

**Owner:** API + FE (all sprints)

---

### 3. Compliance (Pre-Launch Blocker)

**Rule:** Legal pages + CookieBanner + server-authoritative entitlements + Sentry + Uptime monitoring **REQUIRED** before production launch.

**Rationale:** GDPR compliance (cookie consent, privacy policy), billing integrity (no client-side plan override), operational visibility (error tracking, uptime alerts).

**Enforcement:**
- `/legal/*` routes return 200 (not 404)
- `CookieBanner` appears on first visit (`localStorage.ll_cookies_accepted` check)
- `/api/entitlements` server-authoritative (client cannot override plan)
- Sentry active: test error logs to dashboard
- Uptime monitor: `/api/health` checked every 5min

**Owner:** OPS + FE (SP3, SP4)

---

### 4. Brand Consistency

**Rule:** Primary Electric Blue (#3B82F6), Aqua accent (#1BE8D2), background #0B1530. Tabular numerals for all KPI/pricing/table values.

**Rationale:** Consistent brand identity across all touchpoints. Stable numeric layout prevents column width jitter in tables (improves UX).

**Enforcement:**
- Design tokens export: `--brand-primary`, `--brand-accent`, `--bg-canvas`
- All brand colors via CSS vars (no hardcoded hex in components)
- Numeric values use `.numeric` class → `font-variant-numeric: tabular-nums`
- CI checks: `npm run verify:brand` + `npm run verify:typography` (blocks merge if violations)

**Owner:** DESIGN + FE (SP1-T37, SP1-T40)

---

## 🔒 Staging Merge Gate (Quality Control)

Before **any SP1+ PR** can merge to `main`, the following **4 checks** must pass:

### 1. Staging Deploy Green ✅
- Railway staging project deploys successfully
- `/api/health` returns 200
- Homepage renders without errors

### 2. Sentry Active ✅
- Test error logged to Sentry staging project
- Event appears in dashboard with readable stack traces
- Source maps uploaded correctly
- **Verifier:** `curl /api/sentry-test` → 500 + Sentry event ID returned

### 3. Uptime Monitor Active ✅
- External monitor (UptimeRobot/Pingdom) configured for staging
- Checks `/api/health` every 5 minutes
- Alert channel configured (Slack/email)
- **Verifier:** Simulate downtime → alert received within 10 minutes

### 4. Verify Suite Pass ✅
- `npm run verify` exits 0 on staging
- All checks green: env, brand, typography, pricing, billing, mailgun, mv, a11y, og, icons
- **Verifier:** CI workflow logs show "✓ All verifications passed"

**Enforcement:** GitHub branch protection requires "Staging Deploy" status check. PR merge blocked if any check fails.

---

## 📊 Resource Allocation

### Team Roles & Workload

| Role | Owner | Sprint Load | Critical Sprints |
|------|-------|-------------|------------------|
| **Design (Figma)** | COMPOSER 1 | Heavy in SP1 (tokens, DS, OG) | SP1 |
| **Frontend Lead** | AUTO/CLAUDE | Heavy in SP1 (incl. SP5 polish), SP3 | SP1, SP3 |
| **Backend/API** | CODEX | Heavy in SP2, SP3 | SP2, SP3 |
| **Data Engineering** | CODEX | Heavy in SP2 (MVs) | SP2 |
| **DevOps** | CODEX | Heavy in S0, SP4 | S0, SP4 |
| **Billing Integration** | CODEX | Heavy in SP3 | SP3 |
| **Legal/Compliance** | External (CLAUDE templates) | SP3 (legal pages) | SP3 |
| **Marketing (OG assets)** | External (Firefly brief) | SP1 (OG images) | SP1 |

### Parallel Work Opportunities

**Sprint 1 (SP1):**
- **Parallel:** T37 (tokens) can start immediately while T38 (DS visual specs) is in progress
- **Parallel:** T39 (OG assets) can run independently after T37 completes (no blocking dependency)
- **Sequential:** T40 (wave-hero) depends on T37 (tokens for `--bg-canvas`)
- **Sequential:** T30-T36 (UX polish: ErrorBoundary/Toast/Modal/Forms/DataState) depend on T38 (DS specs)

**Sprint 2 (SP2):**
- **Parallel:** All 4 Materialized Views (D01-D04) can be developed simultaneously
- **Parallel:** API endpoints (T50, T51) can start while MVs are in final testing
- **Sequential:** FE integration (T13-T16) depends on API endpoints being live

**Sprint 3 (SP3):**
- **Parallel:** Billing tasks (B01-B03) + Legal pages (L01) can run independently
- **Parallel:** API endpoints (T52-T54) can develop while FE pages (T21-T26) design in Figma
- **Sequential:** FE integration depends on API endpoints

---

## ⚠️ Risk Register

### High Risk (Mitigation Required)

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Legal content delay** (SP3-L01) | Go-live blocker | Medium | Start legal content drafting NOW (external lawyer), use templates for staging | OPS/Legal |
| **Figma token export issues** (SP1-T37) | Blocks entire SP1 | Medium | Test Style Dictionary export early in S0, use manual fallback if plugin fails | Design |
| **MV refresh performance** (SP2-D01-D04) | Stale data degrades UX | Medium | Implement degrade mode + stale indicators, optimize queries, consider incremental refresh | Data Eng |
| **Stripe TEST mode limitations** (SP3) | Cannot test full checkout flow | Low | Document Stripe TEST card numbers (4242...), test webhook events manually | Billing |
| **Sentry/Uptime setup delays** (SP4) | Staging gate blocked | Low | Setup Sentry/Uptime in parallel with S0 (staging env), validate immediately | DevOps |

### Medium Risk (Monitor)

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Wave-hero rendering inconsistencies** (SP1-T40) | Visual polish issue, not blocker | Medium | Test on 5+ devices (iPhone, Android, Mac, Windows), use Retina-safe assets | FE + Design |
| **A11y violations** (SP1-SP5) | Legal risk (WCAG AA required) | Low | Run `npm run verify:a11y` in CI (soft-fail local, hard-fail staging), manual keyboard nav testing | FE |
| **RangeBand™ calculation edge cases** (SP2-D02) | Incorrect status shown to users | Low | Unit test extreme price ranges (0 liquidity, price >> max, price << min), golden dataset validation | Data Eng |
| **GDPR delete race conditions** (SP3-T54) | Data integrity issue | Low | Implement transaction locks (Prisma `$transaction`), audit log every step | API |
| **Verify suite false positives** (S0-SP4) | CI blocks valid PRs | Low | Tune thresholds (soft-fail vs hard-fail), add override mechanism for emergencies | DevOps |

---

## 💰 Cost Implications

### Infrastructure (Monthly)

| Service | Purpose | Cost (Staging) | Cost (Prod) | Notes |
|---------|---------|----------------|-------------|-------|
| **Railway (Web + Worker)** | Hosting + indexer | $20-40 | $50-100 | Scales with usage |
| **PostgreSQL (Railway)** | Database | $10 | $25-50 | 10GB → 50GB growth |
| **Stripe** | Billing | Free (TEST mode) | 2.9% + €0.30/tx | Standard pricing |
| **Mailgun** | Email | Free (degrade mode) | $35/mo (50k emails) | Flex plan |
| **Sentry** | Error tracking | Free (5k events/mo) | $26/mo (50k events) | Team plan |
| **UptimeRobot/Pingdom** | Uptime monitoring | Free (50 monitors) | $15/mo (advanced) | Optional upgrade |
| **CoinGecko API** | Token prices | Free (demo key) | $129/mo (Analyst plan) | 500 calls/min |
| **External Services** | Legal review, OG design | - | $500-1500 (one-time) | Lawyer + designer |

**Total Estimated Monthly (Staging):** $30-50  
**Total Estimated Monthly (Production):** $250-350 + transaction fees  
**One-Time Setup Costs:** $500-1500 (legal + design)

### Development Time (Estimated)

| Sprint | FE Hours | API Hours | DATA Hours | OPS Hours | Total |
|--------|----------|-----------|------------|-----------|-------|
| S0 | 8 | - | - | 16 | 24h (3 days) |
| SP1 | 120 | - | - | 16 | 136h (17 days) |
| SP2 | 60 | 40 | 60 | 8 | 168h (21 days) |
| SP3 | 80 | 60 | - | 24 | 164h (20 days) |
| SP4 | 32 | - | - | 40 | 72h (9 days) |
| SP5 | 60 | - | - | 8 | 68h (8.5 days) |
| SP6 | 24 | 16 | - | - | 40h (5 days) |
| **Total** | **384h** | **116h** | **60h** | **112h** | **672h (84 days)** |

**Assumptions:**
- 1 FE dev @ 8h/day = 48 days (2.4 months)
- 1 API dev @ 8h/day = 14.5 days (0.7 months)
- 1 Data Eng @ 8h/day = 7.5 days (0.4 months)
- 1 DevOps @ 8h/day = 14 days (0.7 months)

**Reality Check:** With parallel work + external help (design, legal), **calendar time = 12-18 weeks** (3-4.5 months).

---

## 🎯 Success Metrics (Post-Launch)

### Week 1 KPIs (Stability)

- ✅ Uptime ≥99.5% (max 30min downtime)
- ✅ Sentry error rate <1% of pageviews
- ✅ MV refresh lag <5min average
- ✅ API P95 latency <500ms
- ✅ Zero critical bugs (SEV-1)

### Month 1 KPIs (Adoption)

- ✅ 100+ unique wallets connected
- ✅ 10+ Premium subscriptions (trial → paid conversion)
- ✅ Avg session duration >3min
- ✅ Bounce rate <60%
- ✅ RangeBand™ calculator engagement >20% of visitors

### Month 3 KPIs (Growth)

- ✅ 500+ unique wallets
- ✅ 50+ Premium subscriptions
- ✅ 5+ Pro subscriptions
- ✅ MRR (Monthly Recurring Revenue) >$500
- ✅ NPS (Net Promoter Score) >40

---

## 📋 Pre-Launch Checklist (Final Review)

### Technical

- [ ] All SP1-SP4 tasks complete (foundation, data, billing, observability)
- [ ] Staging environment fully operational (4 merge gate checks pass)
- [ ] Production database backed up (pre-migration snapshot)
- [ ] Stripe LIVE mode keys configured (TEST → LIVE migration)
- [ ] Mailgun LIVE mode active (degrade → active)
- [ ] Legal pages reviewed by lawyer (privacy, terms, cookies)
- [ ] CookieBanner consent flow tested (first visit, accept, reject, persistence)
- [ ] Sentry production project active (error tracking, source maps)
- [ ] Uptime monitor production endpoint configured (`/api/health`)
- [ ] All verify checks pass: `npm run verify` exits 0
- [ ] Load testing completed (100 concurrent users, no crashes)
- [ ] Security audit (OWASP top 10, no critical vulnerabilities)

### Business

- [ ] Pricing strategy finalized (Premium/Pro tiers, EUR rates)
- [ ] Go-to-market plan ready (launch date, comms channels)
- [ ] Support channels configured (email, Discord, docs)
- [ ] Incident response plan documented (SEV-1/2/3 escalation)
- [ ] Marketing assets ready (OG images, social posts, launch email)
- [ ] Analytics tracking configured (GA4, Mixpanel, or similar)
- [ ] Customer success onboarding flow ready (docs, FAQ, video tutorials)

### Legal & Compliance

- [ ] GDPR compliance validated (privacy policy, cookie consent, delete flow)
- [ ] Terms of Service reviewed + accepted by legal counsel
- [ ] Data retention policy documented (analytics, logs, backups)
- [ ] Stripe terms accepted (billing, refunds, disputes)
- [ ] Mailgun GDPR compliance confirmed (email processing, storage)
- [ ] Incident disclosure process documented (data breach, downtime)

---

## 🚦 Decision Gates

### Gate 1: Post-S0 (Infrastructure Ready)

**Criteria:**
- ✅ Staging environment operational
- ✅ CI/CD pipeline functional
- ✅ Verify suite runs in CI

**Decision:** Proceed to SP1 (Foundation)

**Owner:** DevOps + Engineering Lead

---

### Gate 2: Post-SP1 (Brand Foundation Complete)

**Criteria:**
- ✅ Figma tokens exported → CSS vars
- ✅ Wave-hero renders correctly (visual QA pass)
- ✅ OG assets generated (10 variants)
- ✅ Typography refactor complete (`.numeric` class enforced)

**Decision:** Proceed to SP2 (Data) + SP3 (Billing) in parallel

**Owner:** Design Lead + FE Lead

---

### Gate 3: Post-SP3 (Compliance Ready)

**Criteria:**
- ✅ Stripe checkout functional (email required, EUR label, trial badge)
- ✅ Legal pages live + CookieBanner functional
- ✅ Entitlements API server-authoritative
- ✅ GDPR delete flow tested (Stripe cancel + DB cleanup + audit log)

**Decision:** Proceed to SP4 (Observability)

**Owner:** Billing Lead + Legal + FE Lead

---

### Gate 4: Pre-Launch (Observability Ready)

**Criteria:**
- ✅ Sentry active (front+back, source maps, test errors logged)
- ✅ Uptime monitor configured (5min checks, alerts tested)
- ✅ Staging merge gate functional (4 checks enforced)
- ✅ Status page accessible (`/status`)

**Decision:** GO-LIVE approval

**Owner:** DevOps + Engineering Lead + Product Owner

---

## 📞 Key Contacts

| Role | Name | Responsibility | Contact |
|------|------|----------------|---------|
| **Product Owner** | TBD | Roadmap priorities, sprint scope | product@liquilab.io |
| **Engineering Lead** | TBD | Technical decisions, architecture | engineering@liquilab.io |
| **Design Lead** | TBD | Figma tokens, DS specs, OG assets | design@liquilab.io |
| **DevOps Lead** | TBD | Staging/prod infra, CI/CD, monitoring | devops@liquilab.io |
| **Legal Counsel** | External | Privacy policy, ToS, GDPR compliance | legal@[firm].com |
| **Marketing Lead** | TBD | OG assets, launch comms, GTM | marketing@liquilab.io |

---

## 📚 Supporting Documents

1. **PROJECT_STATE.md** — Technical SSoT (architecture, DB schema, env vars, API specs)
2. **ROADMAP_DOMAIN_SPECS.md** — Detailed domain specs (FE routes, API endpoints, MVs, billing)
3. **TASK_INTAKE_SPRINTS.md** — 62 copy/paste TASK INTAKE blokken (voor ticket creation)
4. **GUARDRAILS (in ROADMAP_DOMAIN_SPECS.md)** — Non-negotiable rules (RangeBand™ SSoT, Flare-only, Compliance, Brand)

---

## ✅ Approval Sign-Off

**Reviewed By:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | _____________ | ________ | _____________ |
| Engineering Lead | _____________ | ________ | _____________ |
| Design Lead | _____________ | ________ | _____________ |
| DevOps Lead | _____________ | ________ | _____________ |
| Legal Counsel | _____________ | ________ | _____________ |

**Approval Status:** ⏳ Pending Review

---

**Generated:** 2025-11-16  
**Version:** 1.0  
**Next Review:** Post-SP1 (Week 4)

