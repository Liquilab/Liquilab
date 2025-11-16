# AI CONTEXT HANDOVER — LiquiLab Sprint Roadmap (2025-11-16)

> **Purpose:** Handover template voor AI assistenten die meewerken aan LiquiLab sprint tasks  
> **Generated:** 2025-11-16  
> **Status:** Copy/paste ready voor ChatGPT/Claude/other AI sessions

---

## 📋 QUICK CONTEXT (30-second brief)

**Project:** LiquiLab — Flare V3 DEX position aggregator + analytics dashboard  
**Tech Stack:** Next.js 15 (Pages Router), TypeScript, Prisma, PostgreSQL, Tailwind, Wagmi/Viem  
**Current Status:** Sprint roadmap finalized, ready for implementation (Week 1)  
**MVP Timeline:** 18 weeks (Option B: Balanced MVP) **APPROVED ✅**  
**Your Role:** [SPECIFY: FE/API/DATA/OPS/DESIGN task implementation]

---

## 🎯 PROJECT MISSION

Launch **LiquiLab V1** (Flare-only MVP) binnen 18 weeks met:
- Complete brand system (Figma tokens, wave-hero, OG assets, Quicksand/Inter typography)
- Data analytics (4 materialized views, RangeBand™ SSoT, wallet analytics)
- Billing compliance (Stripe, EUR label, trial badge, GDPR delete)
- Observability (Sentry, Uptime, internal status panel, CookieBanner)
- Professional UX polish (ErrorBoundary, Toast, Modal, Forms, DataState)

**Go-Live Target:** Week 18 (mid-Q2 2025)

---

## 📚 ESSENTIAL READING (Start Here)

**Before you begin ANY task, read these 3 files:**

### 1. PROJECT_STATE.md (Single Source of Truth)
**Location:** `/Users/koen/Projects/Liquilab/PROJECT_STATE.md`  
**What:** Technical SSoT — architecture, DB schema, env vars, API specs, Delta 2025-11-16  
**Read:** Sections 1-7 + Appendix D (Delta 2025-11-16)  
**Key Info:**
- Database schema (core tables + new MVs/tables in Section 3.1-3.2)
- API endpoint specs (Section 7.1 — entitlements, wallet positions, RangeBand preview, user settings, GDPR delete)
- Design System components (Appendix D.1 — RangeBand™ props, 7 new DS components)
- Brand System (Appendix D.7 — fonts, colors, numerics, icons, A11y)
- Guardrails (Appendix D — RangeBand™ SSoT, Flare-only, Compliance, Brand)

### 2. TASK_INTAKE_SPRINTS.md (Your Work Queue)
**Location:** `/Users/koen/Projects/Liquilab/TASK_INTAKE_SPRINTS.md`  
**What:** 62 copy/paste TASK INTAKE blokken (54 MVP + 8 Post-MVP)  
**Read:** Your assigned sprint section (S0/SP1/SP2/SP3/SP4)  
**Key Info:**
- Each task has: Sprint/ID, Owner, Model, DoD, Verifiers, Scope/Files, Env, Notities
- Tasks ordered: FE → API → DATA → OPS → BILLING → MAIL
- Dependencies clearly marked (e.g., SP1-T40 depends on SP1-T37)

### 3. ROADMAP_DOMAIN_SPECS.md (Detailed Specs)
**Location:** `/Users/koen/Projects/Liquilab/ROADMAP_DOMAIN_SPECS.md`  
**What:** Domain-specific specs — Frontend routes, API endpoints, MVs, billing, security, gating  
**Read:** Relevant domain section (Frontend/Backend/Data/Billing/DevOps)  
**Key Info:**
- Frontend: Per-route user stories, states, DoD, verifiers, Figma references
- API: Exact endpoint specs with TypeScript contracts
- Data: MV schemas, refresh strategies, indices
- Security: CORS, rate limiting, GDPR, cookie consent

---

## 🛡️ NON-NEGOTIABLE GUARDRAILS (MUST FOLLOW)

### 1. RangeBand™ SSoT
**Rule:** Frontend calculates **NOTHING**. `bandColor` and `positionRatio` come **exclusively** from data layer (MV → API → FE props).

**Enforcement:**
```typescript
// ✅ CORRECT (FE presentational only)
<RangeBand 
  bandColor={position.bandColor}        // from API
  positionRatio={position.positionRatio} // from API
  currentPrice={position.currentPrice}
  minPrice={position.range_min}
  maxPrice={position.range_max}
/>

// ❌ WRONG (FE calculating status)
const bandColor = calculateBandColor(currentPrice, range_min, range_max); // NO!
```

**Verifier:** `grep -r "calculateBandColor" components/` → **0 matches** (blocks PR merge if found)

---

### 2. Flare-Only Runtime
**Rule:** Web/runtime blijft Flare-only. No ANKR endpoints. Token prices via unified API. Token icons local-first, SSR-visible.

**Enforcement:**
```typescript
// ✅ CORRECT
const prices = await fetch('/api/prices/current'); // CoinGecko backend

// ❌ WRONG
const prices = await fetch('https://rpc.ankr.com/...'); // NO ANKR!
```

**Verifier:** `grep -r "ankr" pages/api/` → **0 matches**

---

### 3. Compliance (Pre-Launch Blocker)
**Rule:** Legal pages + CookieBanner + server-authoritative entitlements + Sentry + Uptime **REQUIRED** before production launch.

**Checklist:**
- [ ] `/legal/privacy` returns 200 (not 404)
- [ ] `/legal/terms` returns 200
- [ ] `/legal/cookies` returns 200
- [ ] `CookieBanner` appears on first visit (`localStorage.ll_cookies_accepted` check)
- [ ] `/api/entitlements` server-authoritative (client cannot override plan)
- [ ] Sentry active (test error logs to dashboard)
- [ ] Uptime monitor checks `/api/health` every 5min

---

### 4. Brand Consistency
**Rule:** Primary Electric Blue (#3B82F6), Aqua accent (#1BE8D2), background #0B1530. Tabular numerals for all KPI/pricing/tables.

**Enforcement:**
```css
/* ✅ CORRECT (CSS vars) */
.button-primary {
  background: var(--brand-primary); /* #3B82F6 */
}

.kpi-value {
  font-variant-numeric: tabular-nums; /* or use .numeric class */
}

/* ❌ WRONG (hardcoded colors) */
.button-primary {
  background: #3B82F6; /* Use CSS var instead! */
}
```

**Verifiers:**
- `npm run verify:brand` → exit 0
- `npm run verify:typography` → warnings only (no hard fail locally)

---

## 🚀 YOUR TASK ASSIGNMENT

**[AI: Fill in based on context]**

**Sprint:** [S0/SP1/SP2/SP3/SP4]  
**Task ID:** [e.g., SP1-T37]  
**Task Name:** [e.g., Figma Foundations & Tokens Export]  
**Domain:** [FRONTEND/API/DATA/OPS/BILLING]  
**Model:** [CODEX/CLAUDE/COMPOSER 1/AUTO]

**DoD (Definition of Done):**
```
[Copy from TASK_INTAKE_SPRINTS.md]
```

**Verifier:**
```bash
[Copy from TASK_INTAKE_SPRINTS.md]
```

**Scope/Files:**
```
[Copy from TASK_INTAKE_SPRINTS.md]
```

**Dependencies:**
- **Blocked by:** [e.g., SP1-T37 must complete first]
- **Blocks:** [e.g., SP1-T40 depends on this task]

---

## 📖 CONTEXT: SCOPE DECISIONS (2025-11-16)

**Decision:** Option B (Balanced MVP, 18 weeks) **APPROVED ✅**

**What changed:**
1. **SP5 Polish → moved to SP1** (ErrorBoundary, Toast, Modal, Forms, DataState now in MVP)
2. **FAQ page → deferred to Post-MVP** (use external help center)
3. **EUR label + Status panel → kept in MVP** (SP3-B02, SP4-T43)
4. **GDPR delete → full implementation** (legal requirement)

**Why it matters:**
- UX polish is now MVP-critical (don't skip ErrorBoundary, Toast, Modal, Forms, DataState)
- FAQ is out of scope (don't implement in-app FAQ)
- EUR pricing label is in scope (implement in SP3)

---

## 🔧 DEVELOPMENT SETUP

**Prerequisites:**
```bash
# Node.js 20+ (tested on M4 Pro 2024)
node -v  # 20.x or 22.x

# pnpm 9.x
pnpm -v  # 9.x

# PostgreSQL (local or Railway)
psql --version  # 14.x+
```

**Environment:**
```bash
# Copy example env
cp .env.example .env.local

# Required vars (from PROJECT_STATE.md Section 5)
DATABASE_URL=          # Postgres connection string
FLARE_RPC_URL=         # Flare RPC endpoint
NEXT_PUBLIC_APP_URL=   # http://localhost:3000 (local)
STRIPE_SECRET_KEY=     # Stripe TEST key (staging)
MAILGUN_MODE=degrade   # No actual emails locally
SENTRY_DSN=            # Sentry staging project DSN
```

**Install & Run:**
```bash
# Install deps
pnpm install

# Run migrations (if needed)
pnpm prisma migrate dev

# Start dev server
pnpm dev

# Verify setup
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

---

## ✅ QUALITY GATES (Before PR)

**Run these checks before submitting PR:**

```bash
# 1. TypeScript check
pnpm tsc --noEmit

# 2. Verify suite (all checks)
pnpm run verify
# Includes: verify:env, verify:brand, verify:typography, verify:pricing, verify:billing, verify:mailgun, verify:mv

# 3. Linter
pnpm run lint

# 4. Tests (if applicable)
pnpm test

# 5. Visual check (if FE task)
# - Open http://localhost:3000
# - Test at 320px (mobile), 768px (tablet), 1024px+ (desktop)
# - Check keyboard navigation (Tab/Enter/Esc)
# - Check ARIA labels (screen reader friendly)
```

**PR Checklist:**
- [ ] All verifiers pass (from TASK_INTAKE)
- [ ] DoD complete (all checkboxes ticked)
- [ ] Guardrails respected (RangeBand™ SSoT, Flare-only, Brand, Compliance)
- [ ] No hardcoded colors (use CSS vars)
- [ ] Numeric values use `.numeric` class (tabular-nums)
- [ ] No ANKR endpoints in code
- [ ] Staging deploy green (if S0+ task)

---

## 📝 CONVENTIONS & PATTERNS

### Naming
```typescript
// API routes: kebab-case
pages/api/user/settings.ts          // ✅
pages/api/userSettings.ts            // ❌

// Components: PascalCase
components/RangeBand.tsx             // ✅
components/range-band.tsx            // ❌

// Hooks: camelCase + "use" prefix
src/hooks/usePlanGating.ts           // ✅
src/hooks/PlanGating.ts              // ❌

// Utils: camelCase
src/lib/format/currency.ts           // ✅
src/lib/format/Currency.ts           // ❌
```

### TypeScript
```typescript
// Use explicit types (no "any")
const prices: TokenPrice[] = await fetchPrices(); // ✅
const prices: any = await fetchPrices();           // ❌

// ApiEnvelope pattern (from PROJECT_STATE.md Section 7)
type ApiEnvelope<T> = {
  ok: boolean;
  degrade?: boolean;
  code?: string;
  message?: string;
  ts: number;
  staleTs?: number;
  data?: T;
};
```

### Styling
```css
/* Use CSS vars (from tokens.css) */
.button {
  background: var(--brand-primary);  /* ✅ */
  color: var(--text-high);
}

.button {
  background: #3B82F6;               /* ❌ hardcoded */
  color: white;
}

/* Tabular numerals for KPI/pricing/tables */
.kpi-value {
  font-variant-numeric: tabular-nums; /* or class="numeric" */
}
```

---

## 🆘 TROUBLESHOOTING

**Issue:** `grep -r "calculateBandColor" components/` finds matches  
**Fix:** Remove FE calculation logic. Get `bandColor`/`positionRatio` from API only.

**Issue:** `npm run verify:brand` fails  
**Fix:** Check `src/styles/tokens.css` has all required tokens (`--font-header`, `--font-body`, `--brand-primary`, etc.)

**Issue:** Staging deploy fails  
**Fix:** Check S0-OPS01 complete (Railway staging project + DB + Sentry + Uptime active)

**Issue:** Legal pages return 404  
**Fix:** Check SP3-T42 complete (`/legal/privacy`, `/legal/terms`, `/legal/cookies` routes exist)

**Issue:** Numeric values layout jitter in tables  
**Fix:** Add `class="numeric"` to all numeric values (enforces tabular-nums)

---

## 📞 ESCALATION

**If blocked or need clarification:**

1. **Check SSoT first:**
   - PROJECT_STATE.md (technical specs)
   - TASK_INTAKE_SPRINTS.md (task DoD)
   - ROADMAP_DOMAIN_SPECS.md (detailed domain specs)

2. **Check guardrails:**
   - Are you violating RangeBand™ SSoT?
   - Are you using ANKR endpoints?
   - Are you hardcoding brand colors?
   - Are you skipping compliance requirements?

3. **If still blocked:**
   - Document the blocker (what/why/impact)
   - Note attempted solutions
   - Escalate to project owner (Koen)

---

## 🎯 SUCCESS CRITERIA

**Your task is DONE when:**

- ✅ All DoD items checked off (from TASK_INTAKE)
- ✅ All verifiers pass (curl/jq/npm run verify/visual test)
- ✅ All quality gates pass (TypeScript/lint/verify suite)
- ✅ All guardrails respected (RangeBand™/Flare-only/Compliance/Brand)
- ✅ PR submitted with description + screenshots (if FE)
- ✅ Staging deploy green (if S0+ task)

**Do NOT consider task done if:**
- ❌ Any verifier fails
- ❌ Any guardrail violated
- ❌ DoD incomplete
- ❌ Hardcoded colors/fonts (use CSS vars)
- ❌ FE calculating RangeBand™ status (API only)
- ❌ ANKR endpoints used (Flare-only)

---

## 📚 ADDITIONAL RESOURCES

**Roadmap Docs (all in project root):**
- `SCOPE_DECISIONS_FINALIZED.md` — Approved scope decisions
- `SCOPE_VALIDATION_REPORT.md` — Scope analysis + risk register
- `SPRINT_ROADMAP_EXECUTIVE_SUMMARY.md` — Stakeholder overview (timeline, costs, metrics)
- `ROADMAP_COMPLETE_SUMMARY.md` — Completion summary + Week 1 action plan

**Git Branch:**
```bash
# Main roadmap docs on:
git checkout chore/npm-ssot-lockfile-202511150937

# Or if merged to main:
git checkout main
git pull origin main
```

**GitHub:**
- Repo: https://github.com/Liquilab/Liquilab
- Branch: chore/npm-ssot-lockfile-202511150937
- PRs: Create from feature branch → main (after roadmap merged)

---

## 🎉 LET'S BUILD!

**You have everything you need:**
- ✅ Technical specs (PROJECT_STATE.md)
- ✅ Task definitions (TASK_INTAKE_SPRINTS.md)
- ✅ Domain specs (ROADMAP_DOMAIN_SPECS.md)
- ✅ Guardrails (4 non-negotiable rules)
- ✅ Quality gates (verify suite)
- ✅ Success criteria (DoD + verifiers)

**Remember:**
1. **Read PROJECT_STATE.md first** (especially Appendix D)
2. **Check your task in TASK_INTAKE_SPRINTS.md** (DoD + verifiers)
3. **Respect all 4 guardrails** (RangeBand™ SSoT, Flare-only, Compliance, Brand)
4. **Run verify suite before PR** (npm run verify)
5. **Ask if blocked** (don't guess, escalate)

**Now go build something awesome! 🚀**

---

**Generated:** 2025-11-16  
**Status:** Ready for AI assistant handover  
**Next Action:** [AI: Start your assigned task from TASK_INTAKE_SPRINTS.md]

