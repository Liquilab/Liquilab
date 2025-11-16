# SCOPE DECISIONS FINALIZED — LiquiLab MVP (2025-11-16)

> **Decision:** OPTION B — BALANCED MVP (18 weeks) **APPROVED** ✅  
> **Finalized:** 2025-11-16  
> **Status:** 🔒 LOCKED — Ready for sprint kickoff

---

## ✅ FINALIZED DECISIONS

### Decision 1: SP5 Polish Components — ✅ KEEP ALL (18 weeks)

**Decision:** **KEEP ALL** SP5 polish components in MVP

**In Scope:**
- ✅ SP1-T30: ErrorBoundary (Sentry integration + fallback UI)
- ✅ SP1-T31: Toast (success/error notifications)
- ✅ SP1-T32: Modal (GDPR delete confirmation + reusable wrapper)
- ✅ SP1-T33: Form Components (Account page forms + validation)
- ✅ SP1-T36: DataState (loading/empty/degrade/error states)

**Rationale:** Professional polish worth 2-week delay. Toast/DataState provide consistent UX patterns across app. ErrorBoundary required for Sentry. Modal required for GDPR delete. Forms required for Account page.

**Impact:** +2 weeks (16w → 18w), +68h dev time

**Owner:** Product Owner + Engineering Lead  
**Approved:** 2025-11-16

---

### Decision 2: FAQ Page (SP1-T13) — ✅ MOVE TO POST-MVP

**Decision:** **MOVE TO POST-MVP** — Use external help center (Notion/Intercom)

**Rationale:** FAQ content can live externally until post-launch. In-app FAQ adds 16h dev time (2 days) without critical value for MVP launch. External help center faster to iterate content.

**Alternative:** Link footer "Help" → external help center URL

**Impact:** -16h dev time (2 days saved)

**Owner:** Product Owner + Marketing  
**Approved:** 2025-11-16

---

### Decision 3: Internal Status Panel (SP4-T43) — ✅ KEEP IN SP4

**Decision:** **KEEP IN SP4** — Internal `/status` page for ops visibility

**Rationale:** Low effort (8h, 1 day), high value for ops/support. Helps troubleshoot post-launch issues. Component health dashboard critical for incident response.

**Scope:** Internal only (no public status page). Shows DB/Analytics/Billing/Mail/Indexer health + SEV indicators + incident log.

**Impact:** +8h dev time (1 day), worth investment for ops readiness

**Owner:** DevOps Lead + Engineering Lead  
**Approved:** 2025-11-16

---

### Decision 4: EUR Pricing Label (SP3-B02) — ✅ KEEP IN SP3

**Decision:** **KEEP IN SP3** — EUR label + 24h FX cache for EU market transparency

**Rationale:** EU market significant, transparency builds trust. Small effort (8h, 1 day), high competitive value. "Charged in EUR (≈ €XX.XX)" label below USD pricing.

**Scope:** 24h FX cache (ECB API), fallback to last cached rate, stale indicator if >24h old.

**Impact:** +8h dev time (1 day), worth investment for EU penetration

**Owner:** Product Owner + Billing Lead  
**Approved:** 2025-11-16

---

### Decision 5: GDPR Delete Flow (SP3-T54 + SP3-T26) — ✅ FULL IMPLEMENTATION

**Decision:** **FULL IMPLEMENTATION REQUIRED** — Automated GDPR delete (Art. 17 Right to be Forgotten)

**Rationale:** **LEGAL REQUIREMENT** — GDPR Art. 17 requires automated self-service deletion. Manual email process not compliant.

**Scope:**
- Modal confirmation ("Type DELETE to confirm")
- POST /api/user/delete → Stripe cancel + DB cleanup + audit log
- Pseudonimize analytics (wallet→hash)
- Confirmation email (Mailgun)

**Impact:** Already planned in SP3 (SP3-T54 + SP3-T26), no scope change

**Owner:** Legal Counsel + Product Owner  
**Approved:** 2025-11-16

---

## 📊 FINALIZED MVP SCOPE

### ✅ In Scope (Must-Have)

**Sprint 0 (S0) — Infrastructure (1 week)**
- S0-OPS01: Staging Environment Setup
- S0-OPS02: Verify Suite CI Integration
- S0-FE06: verify:brand Implementation
- S0-FE07: verify:typography Implementation
- S0-OPS03: CI Workflow Staging Deploy

**Sprint 1 (SP1) — Foundation & Design (3 weeks)**
- SP1-T37: Figma Foundations & Tokens Export
- SP1-T38: DS Components Visual Specification
- SP1-T40: Wave-Hero Implementation
- SP1-T39: OG & Social Previews
- SP1-T40 (FE-05): Typography & Numerals Refactor
- SP1-T30: ErrorBoundary ✅
- SP1-T31: Toast ✅
- SP1-T32: Modal ✅
- SP1-T33: Form Components ✅
- SP1-T36: DataState ✅

**Sprint 2 (SP2) — Data & Analytics (2-3 weeks)**
- SP2-D01-D04: 4 Materialized Views
- SP2-T50-T51: Analytics APIs
- SP2-T13-T16: FE Integration (analytics, charts, RangeBand preview)

**Sprint 3 (SP3) — Billing & Compliance (3 weeks)**
- SP3-T52-T54: Entitlements + Settings + Delete APIs
- SP3-B01-B03: Billing (email required, EUR label ✅, trial badge)
- SP3-T21-T26: Pricing page + Account page
- SP3-T42 (SP4-L01): Legal Pages
- SP3-G01-G02: Gating Hook + Route Matrix

**Sprint 4 (SP4) — Observability (2 weeks)**
- SP4-B04-B05: Sentry + Uptime
- SP4-T41 (SP4-L01): CookieBanner
- SP4-T43: Internal Status Panel ✅

**Sprint 5 (SP5) — Polish (2 weeks)**
- (All SP1 DS components already in SP1) ✅

**Sprint 6 (SP6) — Advanced (2 weeks)**
- ❌ Deferred to Post-MVP

**Total Duration:** **18 weeks** (S0: 1w, SP1: 3w, SP2: 2-3w, SP3: 3w, SP4: 2w, SP5: 2w, buffer: 3-4w)

---

### ❌ Out of Scope (Post-MVP)

- FAQ page (external help center) ✅
- Reports export (CSV/PDF)
- Leaderboard (peer comparison)
- Onboarding wizard (5-step tour)
- Alerts CRUD + delivery (SP6-T55, SP6-T32)
- Advanced IL analytics

---

## 📅 UPDATED TIMELINE

| Sprint | Duration | Key Deliverables | Weeks |
|--------|----------|------------------|-------|
| **S0** | 1 week | Staging + CI/CD + verify suite | Week 1 |
| **SP1** | 3 weeks | Tokens + DS + Hero + OG + ErrorBoundary/Toast/Modal/Forms/DataState | Week 2-4 |
| **SP2** | 2-3 weeks | MVs + Analytics APIs + Charts | Week 5-7 |
| **SP3** | 3 weeks | Billing + Legal + Account + EUR label | Week 8-10 |
| **SP4** | 2 weeks | Sentry + Uptime + CookieBanner + Status Panel | Week 11-12 |
| **SP5** | 2 weeks | (Polish work absorbed in SP1) | Week 13-14 |
| **SP6** | - | Deferred to Post-MVP | - |
| **Buffer** | 3-4 weeks | Testing, bug fixes, QA | Week 15-18 |

**Total:** **18 weeks** (4.5 months calendar time)

**Critical Path:** S0 → SP1 (T37→T38→T40→T39→T30/31/32/33/36) → SP2 → SP3 → SP4

---

## 💰 UPDATED COST ESTIMATES

### Development Time

| Sprint | FE Hours | API Hours | DATA Hours | OPS Hours | Total |
|--------|----------|-----------|------------|-----------|-------|
| S0 | 16 | - | - | 24 | 40h (5 days) |
| SP1 | 188 | - | - | 16 | 204h (25.5 days) ← +68h polish |
| SP2 | 60 | 40 | 60 | 8 | 168h (21 days) |
| SP3 | 88 | 60 | - | 24 | 172h (21.5 days) ← +8h EUR |
| SP4 | 40 | - | - | 48 | 88h (11 days) ← +8h status |
| SP5 | - | - | - | - | 0h (absorbed in SP1) |
| SP6 | - | - | - | - | 0h (deferred) |
| **Total** | **392h** | **100h** | **60h** | **120h** | **672h (84 days)** |

**No change in total dev time** (polish moved from SP5 to SP1, net zero)

**Calendar Time:** 18 weeks (4.5 months) with parallel work + buffer

---

## 🚀 IMMEDIATE NEXT STEPS

### Week 1 (This Week) — CRITICAL

**Day 1-2:**
1. ✅ Update TASK_INTAKE_SPRINTS.md (remove FAQ, confirm all SP1 polish items)
2. ✅ Update SPRINT_ROADMAP_EXECUTIVE_SUMMARY.md (18w timeline, updated costs)
3. ✅ Update PROJECT_STATE.md changelog (scope decisions logged)
4. 🔥 **START S0-OPS01** (Staging environment setup) — **BLOCKER**
5. 🔥 **START Legal Drafting** (external lawyer, Privacy/Terms/Cookies) — **HIGH RISK**

**Day 3-5:**
6. Test Figma → Style Dictionary export (validate SP1-T37 feasibility)
7. Setup Sentry staging project (validate SP4-B04 feasibility)
8. Setup UptimeRobot/Pingdom account (validate SP4-B05 feasibility)
9. Review Railway pricing (confirm staging + prod costs)
10. Finalize Stripe TEST mode setup (validate SP3-B01 feasibility)

---

### Week 2 — SP1 Prep

1. **Figma Design System setup** (start SP1-T37 Foundations)
2. **Wave-hero asset creation** (Retina-safe SVG/PNG)
3. **OG images brief** (Firefly/designer kickoff for 10 variants)
4. **Legal content review** (first draft from lawyer)
5. **S0 completion verification** (all 4 merge gate checks pass)

---

## 📋 APPROVAL SIGN-OFF

**Scope Decisions Approved:**

| Decision | Approved By | Date | Status |
|----------|-------------|------|--------|
| **MVP Boundary (Option B)** | Product Owner | 2025-11-16 | ✅ LOCKED |
| **SP5 Polish (Keep All)** | Engineering Lead | 2025-11-16 | ✅ LOCKED |
| **FAQ (Post-MVP)** | Product Owner + Marketing | 2025-11-16 | ✅ LOCKED |
| **Status Panel (Keep SP4)** | DevOps Lead | 2025-11-16 | ✅ LOCKED |
| **EUR Label (Keep SP3)** | Billing Lead | 2025-11-16 | ✅ LOCKED |
| **GDPR Delete (Full Impl)** | Legal Counsel | 2025-11-16 | ✅ LOCKED |

**Timeline:** 18 weeks (4.5 months)  
**Go-Live Target:** Week 18 (mid-Q2 2025 if starting now)

---

## 🎯 SUCCESS CRITERIA

**Week 18 Deliverables (Go-Live):**

✅ **Brand Foundation:**
- Figma tokens exported → CSS vars
- Wave-hero renders crisp (all breakpoints)
- 10 OG variants deployed
- Typography refactored (tabular-nums enforced)

✅ **Data & Analytics:**
- 4 MVs operational (<60s refresh)
- RangeBand™ status server-side (FE presentational)
- Wallet analytics API live
- 7d/30d charts rendering

✅ **Billing & Compliance:**
- Stripe checkout (email required, EUR label, trial badge)
- Legal pages live (Privacy/Terms/Cookies)
- CookieBanner functional (localStorage consent)
- GDPR delete flow tested (Stripe cancel + DB cleanup)
- Entitlements API server-authoritative

✅ **Observability:**
- Sentry active (front+back, source maps)
- Uptime monitor (5min checks, alerts)
- Status panel accessible (/status)
- Verify suite passes (all checks green)

✅ **UX Polish:**
- ErrorBoundary catches errors → Sentry
- Toast notifications (success/error)
- Modal (GDPR delete confirmation)
- Form components (Account page)
- DataState (loading/empty/degrade/error)

---

**Status:** 🔒 **LOCKED & APPROVED**  
**Next Action:** Update TASK_INTAKE_SPRINTS.md + EXECUTIVE_SUMMARY.md → Kick off S0-OPS01

