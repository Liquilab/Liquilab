# SCOPE VALIDATION REPORT — LiquiLab MVP (2025-11-16)

> **Purpose:** Validate alle must-haves, nice-to-haves, en MVP boundaries vóór sprint kickoff  
> **Reviewed:** 2025-11-16  
> **Status:** ⚠️ REQUIRES DECISION — 8 items flagged for review

---

## 🎯 Executive Summary

**Total Scope Analyzed:**
- ✅ **44 Must-Have items** (go-live blockers)
- ⚠️ **8 items flagged** for review (scope/priority ambiguity)
- ✅ **6 Nice-to-Have items** (correctly categorized post-MVP)

**Recommendation:** **APPROVE** with **8 clarifications** required (see Decision Points below).

---

## ✅ VALIDATED Must-Haves (Go-Live Blockers)

These items are **correctly categorized** as MVP-critical. No changes recommended.

### Sprint 0 (Infrastructure) — ✅ VALID

| ID | Item | Justification |
|----|------|---------------|
| S0-OPS01 | Staging Environment Setup | **BLOCKER:** Required for SP1+ merge gate (4-check validation) |
| S0-OPS02 | Verify Suite CI Integration | **BLOCKER:** Enforces guardrails (brand, typography, RangeBand™ SSoT) |

**Decision:** ✅ **KEEP** — Both are foundational infrastructure, non-negotiable for quality control.

---

### Sprint 1 (Foundation & Design) — ✅ VALID

| ID | Item | Justification |
|----|------|---------------|
| SP1-T37 | Figma Foundations & Tokens Export | **BLOCKER:** All subsequent design/UI work depends on tokens (--font-header, --brand-primary, --num-style-tabular) |
| SP1-T38 | DS Components Visual Specification | **BLOCKER:** Visual specs for ErrorBoundary, Toast, Modal, Form.*, Accordion, CookieBanner, DataState needed for FE implementation |
| SP1-T40 | Wave-Hero Implementation | **BRAND CRITICAL:** Hero is primary brand touchpoint, crisp rendering across devices is non-negotiable |
| SP1-T39 | OG & Social Previews | **MARKETING CRITICAL:** Social previews (Slack/Discord/Twitter) essential for organic discovery |
| SP1-T40 (Typography) | Typography & Numerals Refactor | **UX CRITICAL:** Tabular numerals prevent layout jitter in tables/dashboards (professional polish) |
| S0-FE06 | verify:brand Implementation | **QUALITY GATE:** Enforces brand system consistency in CI (part of merge gate) |
| S0-FE07 | verify:typography Implementation | **QUALITY GATE:** Enforces tabular-nums on KPI/pricing/tables |

**Decision:** ✅ **KEEP** — All items are foundational for brand identity and UX consistency.

---

### Sprint 2 (Data & Analytics) — ✅ VALID

| ID | Item | Justification |
|----|------|---------------|
| SP2-D01 | mv_wallet_portfolio_latest | **DATA SSoT:** Fast wallet overview without JOIN hell |
| SP2-D02 | mv_position_overview_latest | **RANGEBAND™ SSoT:** Server-side status calculation (guardrail #1) |
| SP2-D03 | mv_position_day_stats | **ANALYTICS:** Historical data for 7d/30d charts (core feature) |
| SP2-D04 | mv_position_events_recent | **ANALYTICS:** Recent events feed (7d window) |
| SP2-T50 | Analytics Wallet Positions Endpoint | **API SSoT:** Delivers RangeBand™ status from MV (guardrail #1) |
| SP2-T51 | RangeBand Preview Endpoint | **INTERACTIVE FEATURE:** Calculator preview (marketing differentiator) |
| SP2-T13 | Integrate Analytics Summary | **DASHBOARD:** Summary page consumes API |
| SP2-T14 | Integrate MV Position Overview | **DASHBOARD:** Pool detail page pulls RangeBand™ from MV |
| SP2-T15 | Day Stats Chart 7d/30d | **ANALYTICS:** Charts for historical performance |
| SP2-T16 | RangeBand Preview UI Integration | **INTERACTIVE FEATURE:** Live calculator UI |

**Decision:** ✅ **KEEP** — All items are core analytics features, RangeBand™ SSoT is guardrail-enforced.

---

### Sprint 3 (Billing & Compliance) — ✅ VALID

| ID | Item | Justification |
|----|------|---------------|
| SP3-T52 | Entitlements Endpoint | **COMPLIANCE GUARDRAIL #3:** Server-authoritative plan gating (no client override) |
| SP3-T53 | User Settings CRUD | **GDPR COMPLIANCE:** Email + notification preferences (legal requirement) |
| SP3-T54 | User Delete (GDPR) | **GDPR COMPLIANCE:** Right to be forgotten (legal requirement) |
| SP3-B01 | Email Verplicht in Checkout | **BILLING COMPLIANCE:** Stripe receipts + GDPR contact |
| SP3-B02 | EUR Label + 24h FX Cache | **EU MARKET:** Transparency for EU users (competitive advantage) |
| SP3-B03 | Trial Countdown Badge | **CONVERSION OPTIMIZATION:** Urgency driver (D-n format) |
| SP3-T21/22/23 | Pricing Page Email/EUR/Trial | **BILLING:** Checkout flow with validation |
| SP3-T24 | Account Page | **USER MANAGEMENT:** Settings/subscription/preferences hub |
| SP3-T25 | Account Settings API Integration | **USER MANAGEMENT:** Save email/notifications |
| SP3-T26 | Account Delete Flow | **GDPR COMPLIANCE:** Delete confirmation modal |
| SP3-T42 (SP4-L01) | Legal Pages | **COMPLIANCE GUARDRAIL #3:** Privacy/Terms/Cookies (pre-launch blocker) |

**Decision:** ✅ **KEEP** — All items are compliance-critical (GDPR, Stripe, legal).

---

### Sprint 4 (Observability) — ✅ VALID

| ID | Item | Justification |
|----|------|---------------|
| SP4-B04 | Sentry Front/Back Integration | **COMPLIANCE GUARDRAIL #3:** Error tracking + source maps (staging gate) |
| SP4-B05 | Uptime Monitor Setup | **COMPLIANCE GUARDRAIL #3:** /api/health checks (staging gate) |
| S0-OPS03 | CI Workflow Staging Deploy | **QUALITY GATE:** Auto-deploy to staging on PR (merge gate enforcement) |
| SP4-T41 (SP4-L01) | CookieBanner Component | **COMPLIANCE GUARDRAIL #3:** GDPR cookie consent (pre-launch blocker) |
| SP3-G01/G02 | Gating Hook + Route Matrix | **COMPLIANCE GUARDRAIL #3:** Client+server gating enforcement |

**Decision:** ✅ **KEEP** — All items are observability/compliance guardrails, non-negotiable for launch.

---

### Sprint 5 (Polish) — ⚠️ REVIEW REQUIRED

| ID | Item | Current Category | Recommended Action |
|----|------|------------------|-------------------|
| SP1-T30 | ErrorBoundary | Must-Have | ⚠️ **FLAG:** Is this launch-critical? |
| SP1-T31 | Toast | Must-Have | ⚠️ **FLAG:** Can launch without toast? (inline errors OK?) |
| SP1-T32 | Modal | Must-Have | ⚠️ **FLAG:** Depends on Modal usage (Account delete needs it) |
| SP1-T33 | Form Components | Must-Have | ⚠️ **FLAG:** Account forms need this (SP3-T25/T26) |
| SP1-T36 | DataState | Must-Have | ⚠️ **FLAG:** Can launch with basic loading spinners? |

**Questions to Answer:**

1. **ErrorBoundary (SP1-T30):** Is Sentry-integrated ErrorBoundary required for MVP, or can we launch with basic Next.js error handling?
   - **If YES:** Keep in SP1 (blocks Sentry integration SP4-B04)
   - **If NO:** Move to Post-MVP (use default Next.js error page)

2. **Toast (SP1-T31):** Are toast notifications required for MVP, or can we use inline validation errors + simple alerts?
   - **If YES:** Keep in SP5 (blocks form success/error states)
   - **If NO:** Move to Post-MVP (inline errors sufficient)

3. **Modal (SP1-T32):** Modal is used in Account Delete flow (SP3-T26). Can we launch without GDPR delete?
   - **If YES (delete required):** Keep in SP1 (blocks SP3-T26)
   - **If NO (delete post-MVP):** Move both to Post-MVP

4. **Form Components (SP1-T33):** Forms are used in Account page (SP3-T24/T25). Can we launch without Account page?
   - **If YES (account required):** Keep in SP1 (blocks SP3-T24)
   - **If NO (account post-MVP):** Move to Post-MVP, use native HTML forms for checkout

5. **DataState (SP1-T36):** Can we launch with basic loading/error states (spinner + error message), or is the full DataState pattern (skeleton, degrade banner, retry button) required?
   - **If BASIC OK:** Move to SP5+ (implement simple patterns in SP2, refactor later)
   - **If FULL REQUIRED:** Keep in SP1 (blocks all data-heavy pages)

**Recommendation:** **DECIDE BY END OF WEEK** — These 5 items add ~68h (8.5 days) to critical path. If any can be simplified/deferred, timeline shrinks from 18 weeks → 16 weeks.

---

### Sprint 6 (Advanced) — ✅ VALID Nice-to-Have

| ID | Item | Justification |
|----|------|---------------|
| SP6-T55 | Alerts CRUD | **POST-MVP:** Alert delivery not critical for launch |
| SP6-T32 | Alerts Toggles UI | **POST-MVP:** Depends on SP6-T55 |

**Decision:** ✅ **KEEP as Nice-to-Have** — Correctly categorized as post-launch feature.

---

### Post-MVP — ✅ VALID Nice-to-Have

| ID | Item | Justification |
|----|------|---------------|
| FE-24 | Reports Export | **POST-MVP:** CSV/PDF export is convenience feature, not blocker |
| FE-25 | Leaderboard | **POST-MVP:** Peer comparison is engagement feature, not core |
| FE-26 | Onboarding Wizard | **POST-MVP:** Optional tour improves UX but not required for launch |

**Decision:** ✅ **KEEP as Nice-to-Have** — Correctly categorized as post-launch enhancements.

---

## 🚨 SCOPE CREEP RISKS

### Risk 1: FAQ Page (SP1-T13) — ⚠️ MEDIUM RISK

**Current Status:** Listed as SP1-T13 in ROADMAP_DOMAIN_SPECS.md, but **NOT in TASK_INTAKE_SPRINTS.md** (orphaned task).

**Question:** Is FAQ page required for MVP launch?
- **If YES:** Add SP4-T13 (FAQ Accordion) to TASK_INTAKE (16h, uses SP1-T38 Accordion component)
- **If NO:** Move to Post-MVP (FAQ content can live in external docs/help center)

**Recommendation:** **ADD TO POST-MVP** — FAQ is helpful but not launch-critical. Use external help center (Notion/Intercom) until Post-MVP.

---

### Risk 2: Internal Status Panel (SP4-T43) — ⚠️ LOW RISK

**Current Status:** Must-Have in SP4

**Question:** Is internal `/status` page required for public launch, or only needed for ops team?
- **If PUBLIC LAUNCH REQUIRED:** Keep in SP4 (ops visibility)
- **If INTERNAL ONLY:** Move to Post-MVP (use Railway logs + Sentry for initial ops)

**Recommendation:** **KEEP IN SP4** — Low effort (1-2 days), high value for ops/support. Helps troubleshoot issues post-launch.

---

### Risk 3: EUR Pricing Label (SP3-B02) — ⚠️ MEDIUM RISK

**Current Status:** Must-Have in SP3

**Question:** Is EUR label **required** for launch, or **nice-to-have** for EU market penetration?
- **If REQUIRED (target EU market):** Keep in SP3
- **If NICE-TO-HAVE:** Move to SP4+ (launch USD-only, add EUR label in iteration)

**Recommendation:** **KEEP IN SP3** — EU market is significant, transparency builds trust. Small effort (8h), high competitive value.

---

## 📊 SCOPE BOUNDARY ANALYSIS

### MVP Definition (Current)

**In Scope (Must-Have):**
- ✅ Brand foundation (Figma tokens, wave-hero, OG assets, typography)
- ✅ Data layer (4 MVs, RangeBand™ SSoT, wallet analytics)
- ✅ Billing (Stripe checkout, email required, EUR label, trial badge)
- ✅ Compliance (Legal pages, CookieBanner, GDPR delete, entitlements)
- ✅ Observability (Sentry, Uptime, status page, verify suite)
- ⚠️ UX Polish (ErrorBoundary, Toast, Modal, Forms, DataState) — **REVIEW REQUIRED**

**Out of Scope (Nice-to-Have):**
- ✅ Reports export (CSV/PDF)
- ✅ Leaderboard (peer comparison)
- ✅ Onboarding wizard (5-step tour)
- ✅ Alerts (CRUD + delivery)
- ✅ Advanced IL analytics

**Borderline (Needs Decision):**
- ⚠️ FAQ page (SP1-T13) — **Move to Post-MVP?**
- ⚠️ ErrorBoundary/Toast/Modal/Forms/DataState (SP5) — **Simplify or keep?**

---

### Recommended MVP Boundary Adjustments

**Option A: STRICT MVP (16 weeks, minimal polish)**

Move to Post-MVP:
- SP1-T31 (Toast) → Use inline errors + simple `alert()`
- SP1-T36 (DataState) → Use basic spinner + error message (no skeleton, no degrade banner)
- SP1-T13 (FAQ) → External help center

Keep in MVP:
- SP1-T30 (ErrorBoundary) → Required for Sentry integration
- SP1-T32 (Modal) → Required for GDPR delete flow
- SP1-T33 (Forms) → Required for Account page (GDPR compliance)

**Time Saved:** ~32h (4 days) → **16-week timeline**

---

**Option B: BALANCED MVP (18 weeks, professional polish)**

Keep all SP5 items (ErrorBoundary, Toast, Modal, Forms, DataState) in MVP.

Move to Post-MVP:
- SP1-T13 (FAQ) → External help center

**Time Saved:** ~16h (2 days) → **18-week timeline**

**Recommendation:** ✅ **OPTION B (Balanced)** — Toast/DataState add significant UX polish, worth 1-week delay for professional launch experience.

---

**Option C: AGGRESSIVE MVP (14 weeks, bare minimum)**

Move to Post-MVP:
- SP1-T31 (Toast)
- SP1-T36 (DataState)
- SP1-T13 (FAQ)
- SP3-T24/T25/T26 (Account page) → **RISK:** Violates GDPR delete requirement
- SP3-B02 (EUR label) → Launch USD-only

**Time Saved:** ~80h (10 days) → **14-week timeline**

**Recommendation:** ❌ **DO NOT CHOOSE** — Violates GDPR compliance (no delete flow), creates legal risk.

---

## 🎯 DECISION POINTS (Action Required This Week)

### Decision 1: SP5 Polish Components (ErrorBoundary, Toast, Modal, Forms, DataState)

**Options:**
- **A) KEEP ALL** (18 weeks, professional polish) ← **RECOMMENDED**
- **B) SIMPLIFY** (16 weeks, basic error handling + inline forms)
- **C) DEFER ALL** (14 weeks, bare minimum) ← **NOT RECOMMENDED (GDPR risk)**

**Who Decides:** Product Owner + Engineering Lead  
**Deadline:** End of Week 1 (before S0-OPS01 kickoff)

---

### Decision 2: FAQ Page (SP1-T13)

**Options:**
- **A) ADD TO SP4** (16h effort, in-app FAQ with Accordion)
- **B) MOVE TO POST-MVP** (external help center) ← **RECOMMENDED**

**Who Decides:** Product Owner + Marketing  
**Deadline:** End of Week 1

---

### Decision 3: Internal Status Panel (SP4-T43)

**Options:**
- **A) KEEP IN SP4** (8h effort, ops visibility) ← **RECOMMENDED**
- **B) MOVE TO POST-MVP** (use Railway logs + Sentry)

**Who Decides:** DevOps Lead + Engineering Lead  
**Deadline:** End of Week 2 (post-S0)

---

### Decision 4: EUR Pricing Label (SP3-B02)

**Options:**
- **A) KEEP IN SP3** (8h effort, EU market transparency) ← **RECOMMENDED**
- **B) MOVE TO SP4+** (launch USD-only, iterate later)

**Who Decides:** Product Owner + Billing Lead  
**Deadline:** End of Week 2

---

### Decision 5: GDPR Delete Flow Scope (SP3-T54 + SP3-T26)

**Options:**
- **A) FULL IMPLEMENTATION** (Stripe cancel + DB cleanup + audit log + confirmation modal) ← **REQUIRED BY LAW**
- **B) MANUAL PROCESS** (email request → manual admin deletion) ← **NOT RECOMMENDED (GDPR Art. 17 requires automation)**

**Who Decides:** Legal Counsel + Product Owner  
**Deadline:** End of Week 1 (legal blocker)

---

## 📋 NEXT STEPS

### This Week (Week 1)

1. **Schedule scope validation meeting** (1h, all decision makers)
   - Review 5 decision points above
   - Choose MVP boundary (Option A/B)
   - Document decisions in PROJECT_STATE.md changelog

2. **Update TASK_INTAKE_SPRINTS.md** based on decisions
   - Move deferred items to "Post-MVP" section
   - Update timeline estimates (16 vs 18 weeks)
   - Re-number task IDs if needed

3. **Update SPRINT_ROADMAP_EXECUTIVE_SUMMARY.md**
   - Reflect new timeline + scope
   - Update cost estimates (if timeline changes)
   - Update risk register (if scope changes)

4. **Kick off S0-OPS01** (Staging setup) — **BLOCKER** for SP1
   - Railway staging project creation
   - Stripe TEST keys
   - Sentry staging project
   - UptimeRobot configuration

5. **Start legal content drafting** (external lawyer) — **HIGH RISK** in SP3
   - Privacy Policy draft
   - Terms of Service draft
   - Cookie Policy draft

---

## ✅ APPROVAL CHECKLIST

**Before proceeding to sprint kickoff:**

- [ ] **Decision 1 (SP5 Polish):** Option chosen + documented
- [ ] **Decision 2 (FAQ Page):** Scope confirmed (in-app vs external)
- [ ] **Decision 3 (Status Panel):** Scope confirmed (SP4 vs Post-MVP)
- [ ] **Decision 4 (EUR Label):** Scope confirmed (SP3 vs SP4+)
- [ ] **Decision 5 (GDPR Delete):** Legal counsel confirmation (full implementation required)
- [ ] **Timeline finalized:** 16 weeks (Strict) vs 18 weeks (Balanced)
- [ ] **TASK_INTAKE_SPRINTS.md updated:** Reflects scope decisions
- [ ] **SPRINT_ROADMAP_EXECUTIVE_SUMMARY.md updated:** Timeline + cost estimates revised
- [ ] **S0-OPS01 kickoff scheduled:** Staging environment setup (Week 1)
- [ ] **Legal drafting started:** Privacy/Terms/Cookies (external lawyer, Week 1)

---

**Generated:** 2025-11-16  
**Status:** ⚠️ REQUIRES DECISION — 5 decision points + 8 flagged items  
**Recommended Action:** Schedule 1h scope validation meeting this week → finalize MVP boundary → update docs → kick off S0

