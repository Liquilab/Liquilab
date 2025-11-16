# ✅ ROADMAP COMPLETE — LiquiLab Sprint Plan (2025-11-16)

> **Status:** 🔒 **APPROVED & LOCKED** — Ready for Sprint Kickoff  
> **Decision:** Option B (Balanced MVP, 18 weeks)  
> **Finalized:** 2025-11-16  
> **Commits:** 11 (PROJECT_STATE.md, ROADMAP_DOMAIN_SPECS.md + 4 new strategic docs)

---

## 🎯 Mission Complete

Alle strategische roadmap documenten zijn **voltooid, goedgekeurd, en gecommit**. LiquiLab MVP scope is gedefinieerd, gevalideerd, en klaar voor sprint planning & ticket creation.

---

## 📚 Deliverables Overview

### 1. PROJECT_STATE.md ✅
**Status:** Updated met Delta 2025-11-16 + Scope Decisions changelog  
**Changes:**
- Delta 2025-11-16: API endpoints, DB schema, Design System, Security, Observability
- Scope Decisions Finalized: Option B (18 weeks) approved
- Sprint IDs toegevoegd (SP0-SP6)
- GECOVERED markers op bestaande secties
- Design tokens (Quicksand/Inter, tabular-nums)
- Staging environment + merge gate requirements
- Non-negotiable guardrails (RangeBand™ SSoT, Flare-only, Compliance, Brand)

### 2. ROADMAP_DOMAIN_SPECS.md ✅
**Status:** Updated met Delta 2025-11-16 + Route-specific Brand/UI/Marketing DoD's  
**Changes:**
- Frontend routes: Hero composition, OG assets, RangeBand™ legend, Extreme APR warnings, Token icon fallback
- Chart styling (compact/large variants, tabular-nums, Signal Aqua primary)
- EUR label + FX cache, Trial countdown badge
- Legal pages template + WCAG AA compliance
- CookieBanner (A11y, keyboard nav, focus trap)
- Account page forms (react-hook-form, Zod validation, GDPR delete flow)
- New DS components (ErrorBoundary, Toast, Modal, Form.*, Accordion, CookieBanner, DataState)
- New API endpoints (entitlements, wallet positions, RangeBand preview, user settings, GDPR delete, alerts)
- New MVs (wallet portfolio, position overview, day stats, events)
- Billing & Compliance tasks (email required, EUR label, trial badge, Sentry, Uptime, Legal pages)
- DevOps & Security (CORS, rate limiting, cookie consent, GDPR, gating)
- Guardrails section (RangeBand™ SSoT, Flare-only, Compliance, Brand)

### 3. SCOPE_VALIDATION_REPORT.md ✅ NEW
**Status:** Comprehensive scope analysis + 5 decision points  
**Contents:**
- ✅ 44 Must-Have items validated (correctly categorized)
- ⚠️ 8 items flagged for review (SP5 polish + 3 borderline)
- ✅ 6 Nice-to-Have items confirmed (post-MVP)
- 5 Decision Points analyzed (SP5 polish, FAQ, Status panel, EUR label, GDPR delete)
- 3 MVP boundary options (Strict 16w, Balanced 18w, Aggressive 14w)
- Risk register (legal content delay, Figma export, MV performance, Stripe TEST limits, Sentry setup)
- Scope boundary analysis (in scope, out of scope, borderline items)

### 4. SCOPE_DECISIONS_FINALIZED.md ✅ NEW
**Status:** Locked decisions + approval sign-off  
**Contents:**
- 5 Decisions documented with rationale + impact
- Final MVP scope (S0-SP4, 18 weeks)
- Updated timeline + cost estimates
- Success criteria (Week 18 deliverables)
- Approval sign-off table
- Immediate next steps (Week 1)

### 5. SPRINT_ROADMAP_EXECUTIVE_SUMMARY.md ✅ NEW
**Status:** High-level overview for stakeholders  
**Contents:**
- Mission + Sprint timeline (18 weeks)
- Go-live criteria (Must-Have vs Nice-to-Have)
- 4 Non-negotiable guardrails (detailed enforcement)
- Staging merge gate (4-check quality control)
- Resource allocation (team roles, parallel work opportunities)
- Risk register (high/medium risks + mitigation)
- Cost implications (infrastructure + dev time)
- Success metrics (Week 1, Month 1, Month 3 KPIs)
- Pre-launch checklist (technical, business, legal)
- 4 Decision gates (post-S0, post-SP1, post-SP3, pre-launch)

### 6. TASK_INTAKE_SPRINTS.md ✅ NEW
**Status:** 62 copy/paste TASK INTAKE blokken  
**Contents:**
- S0 (Infrastructure): 4 tasks (Staging, CI/CD, verify:brand, verify:typography)
- SP1 (Foundation + Polish): 12 tasks (Tokens, DS, Hero, OG, Typography + 5 polish components)
- SP2 (Data & Analytics): 11 tasks (4 MVs + 2 API + 5 FE integration)
- SP3 (Billing & Compliance): 13 tasks (3 API + 3 Billing + 4 FE + 3 OPS)
- SP4 (Observability): 8 tasks (Sentry, Uptime, CookieBanner, Status, FAQ deferred, CI)
- SP5: Absorbed in SP1 ✅
- SP6: Deferred to Post-MVP ✅
- Post-MVP: 8 tasks (FAQ, Alerts CRUD/UI, Reports, Leaderboard, Onboarding, Advanced IL)

---

## 🔒 Scope Decision: Option B (Balanced MVP, 18 weeks)

### ✅ Approved Decisions

| # | Decision | Outcome | Impact |
|---|----------|---------|--------|
| 1 | SP5 Polish Components | **KEEP ALL in MVP** (moved to SP1) | +68h, +2 weeks |
| 2 | FAQ Page (SP1-T13) | **MOVE TO POST-MVP** | -16h, -2 days |
| 3 | Internal Status Panel (SP4-T43) | **KEEP IN SP4** | +8h, +1 day |
| 4 | EUR Pricing Label (SP3-B02) | **KEEP IN SP3** | +8h, +1 day |
| 5 | GDPR Delete Flow (SP3-T54/T26) | **FULL IMPLEMENTATION** | No change |

**Net Impact:** +68h dev time, +2 weeks timeline (16w → 18w)

### 📊 Final MVP Scope (18 weeks)

```
Timeline:
├── S0 (1 week)       Infrastructure + CI/CD + verify suite
├── SP1 (3 weeks)     Tokens + DS + Hero + OG + Typography + 5 polish
├── SP2 (2-3 weeks)   4 MVs + Analytics APIs + Charts
├── SP3 (3 weeks)     Billing + Legal + Account + EUR label
├── SP4 (2 weeks)     Sentry + Uptime + Status + CookieBanner
├── Buffer (3-4w)     Testing, QA, bug fixes
└── GO-LIVE ✨        Week 18 (mid-Q2 2025 estimated)
```

**Critical Path:** S0 → SP1 (incl. polish) → SP2 → SP3 → SP4

---

## 🛡️ Non-Negotiable Guardrails

### 1. RangeBand™ SSoT
- **Regel:** FE berekent GEEN status. `bandColor` en `positionRatio` komen **uitsluitend** uit data-laag.
- **Enforcement:** SP2-D02 (MV), SP2-T50 (API), SP2-T14 (FE presentational)
- **Verifier:** `grep -r "calculateBandColor" components/` → 0 matches

### 2. Flare-Only Runtime
- **Regel:** Web/runtime blijft Flare-only. Prijzen via unified API. Token-icons local-first, SSR-zichtbaar.
- **Enforcement:** No ANKR endpoints, prices via `/api/prices/current`, icons `/public/media/tokens/*.svg`
- **Verifier:** `grep -r "ankr" pages/api/` → 0 matches

### 3. Compliance (Pre-Launch Blocker)
- **Regel:** Legal pages + CookieBanner + Entitlements + Sentry + Uptime **VERPLICHT** voor launch.
- **Enforcement:** SP3 (Legal, GDPR delete), SP4 (Sentry, Uptime, CookieBanner)
- **Verifier:** `curl -I /legal/privacy` → 200 OK; `curl /api/entitlements` → plan from DB; `curl /api/sentry-test` → 500 + event ID

### 4. Brand Kleurkaders
- **Regel:** Primair Electric Blue (#3B82F6), Aqua accent (#1BE8D2), achtergrond #0B1530. Tabular numerals voor KPI/pricing.
- **Enforcement:** SP1-T37 (tokens), verify:brand, verify:typography
- **Verifier:** `npm run verify:brand` → exit 0; `npm run verify:typography` → warnings only

---

## 🚀 Immediate Next Steps (Week 1)

### Day 1-2 (CRITICAL 🔥)

1. **✅ S0-OPS01: Staging Environment Setup** — **BLOCKER**
   - Railway staging project (`liquilab-staging`)
   - Dedicated Postgres DB
   - Stripe TEST keys
   - Mailgun degrade mode (`MAILGUN_MODE=degrade`)
   - Sentry staging project
   - UptimeRobot configuration
   - **Verifier:** `curl https://staging.liquilab.io/api/health` → 200

2. **✅ Legal Content Drafting** — **HIGH RISK**
   - Engage external lawyer (Privacy Policy, Terms of Service, Cookie Policy)
   - **Deadline:** First draft by Week 2 (SP3 dependency)

3. **✅ Update ROADMAP Documents** — **DONE ✅**
   - ✅ PROJECT_STATE.md (changelog entry)
   - ✅ ROADMAP_DOMAIN_SPECS.md (Delta 2025-11-16)
   - ✅ SCOPE_VALIDATION_REPORT.md (created)
   - ✅ SCOPE_DECISIONS_FINALIZED.md (created)
   - ✅ SPRINT_ROADMAP_EXECUTIVE_SUMMARY.md (created)
   - ✅ TASK_INTAKE_SPRINTS.md (created)

### Day 3-5

4. **Test Figma → Style Dictionary Export** (SP1-T37 validation)
   - Install Figma Tokens plugin
   - Test token export (design tokens → JSON → CSS)
   - Validate `--font-header`, `--font-body`, `--num-style-tabular`
   - **Verifier:** `test -f src/styles/tokens.css`

5. **Setup Sentry Accounts** (SP4-B04 prep)
   - Create staging project (`liquilab-staging`)
   - Create prod project (`liquilab-prod`)
   - Generate auth tokens for CI
   - **Verifier:** Sentry dashboard accessible

6. **Setup UptimeRobot Account** (SP4-B05 prep)
   - Configure monitor for `/api/health` (5min checks)
   - Setup Slack/email alerts
   - **Verifier:** Monitor dashboard shows status

7. **Review Railway Pricing** (cost validation)
   - Confirm staging + prod costs
   - Provision DB capacity (10GB → 50GB growth plan)

8. **Finalize Stripe TEST Mode** (SP3-B01 prep)
   - Configure TEST keys in staging env
   - Test checkout flow (card 4242 4242 4242 4242)
   - Validate webhook events

---

## 📋 Week 1 Success Criteria

**By End of Week 1:**

- ✅ Staging environment operational (Railway + DB + Sentry + Uptime) — **S0-OPS01 DONE**
- ✅ Legal drafting kicked off (first draft in progress)
- ✅ Figma token export validated (SP1-T37 feasibility confirmed)
- ✅ Sentry + UptimeRobot accounts created (SP4 prep done)
- ✅ All roadmap documents finalized + committed — **DONE ✅**
- ✅ Sprint planning meeting scheduled (Week 2)
- ✅ Ticket creation started (Jira/Linear/GitHub Projects)

**Blocker Status:**
- 🔥 **S0-OPS01 (Staging)** — Must complete before any SP1 work
- 🔥 **Legal drafting** — Must start NOW (8-week lead time for lawyer review)

---

## 📊 Summary Statistics

**Total Tasks:** 62 (54 MVP + 8 Post-MVP)

**Sprint Breakdown:**
- S0: 4 tasks (Infrastructure)
- SP1: 12 tasks (Foundation + Polish, absorbed from SP5)
- SP2: 11 tasks (Data & Analytics)
- SP3: 13 tasks (Billing & Compliance)
- SP4: 8 tasks (Observability)
- SP5: Absorbed in SP1 ✅
- SP6: Deferred to Post-MVP ✅
- Post-MVP: 8 tasks (FAQ, Alerts, Reports, Leaderboard, Onboarding)

**Dev Time Estimate:**
- FE: 392h (49 days)
- API: 100h (12.5 days)
- DATA: 60h (7.5 days)
- OPS: 120h (15 days)
- **Total: 672h (84 workdays)**

**Calendar Time:** 18 weeks (4.5 months) with parallel work + buffer

**Cost Estimate (Monthly):**
- Staging: $30-50
- Production: $250-350 + transaction fees
- One-Time Setup: $500-1500 (legal + design)

**Go-Live Target:** Week 18 (mid-Q2 2025 if starting now)

---

## 🎯 Success Metrics (Post-Launch)

**Week 1 KPIs:**
- Uptime ≥99.5%
- Sentry error rate <1% pageviews
- MV refresh lag <5min avg
- API P95 latency <500ms
- Zero critical bugs (SEV-1)

**Month 1 KPIs:**
- 100+ unique wallets
- 10+ Premium subscriptions
- Avg session >3min
- Bounce rate <60%
- RangeBand™ calculator engagement >20%

**Month 3 KPIs:**
- 500+ unique wallets
- 50+ Premium + 5+ Pro subscriptions
- MRR >$500
- NPS >40

---

## 🎉 Roadmap Status: COMPLETE ✅

**All deliverables finalized, approved, and committed.**

**Status:** 🔒 **LOCKED & READY FOR SPRINT KICKOFF**

**Next Milestone:** S0-OPS01 (Staging Environment Setup) → Week 1 completion

---

**Generated:** 2025-11-16  
**Commits:** 11 (all strategic docs)  
**Status:** 🔒 APPROVED — Option B (Balanced MVP, 18 weeks)  
**Ready for:** Sprint planning → Ticket creation → S0 kickoff

