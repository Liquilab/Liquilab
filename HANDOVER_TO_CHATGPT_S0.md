# HANDOVER TO CHATGPT — Sprint 0 (S0) Project Management

> **From:** Cursor AI (Roadmap Planning Phase)  
> **To:** ChatGPT (Sprint 0 Execution & Project Management)  
> **Date:** 2025-11-16  
> **Status:** 🔒 Sprint Roadmap APPROVED — Ready for S0 Kickoff

---

## 🎯 YOUR MISSION (ChatGPT)

Je bent nu **Project Manager** voor LiquiLab MVP. Je **eerste sprint is S0 (Foundation & Infrastructure Setup)**. Deze sprint is **CRITICAL** — alles wat na S0 komt (SP1-SP4) is geblokkeerd totdat S0 compleet is.

**Your role:**
- ✅ Track S0 progress (4 tasks: OPS01, OPS02, FE06, FE07)
- ✅ Unblock Koen when stuck (troubleshoot, clarify specs, suggest solutions)
- ✅ Validate S0 deliverables (run verifiers, check DoD completion)
- ✅ Coordinate with other AI's (if parallel work needed)
- ✅ Report S0 completion status (ready for SP1 kickoff)

**Timeline:** S0 = 1 week (5 workdays)  
**Deadline:** End of Week 1 (alle 4 tasks DONE)  
**Next Sprint:** SP1 (Foundation & Design System, 3 weeks) starts after S0 complete

---

## 📚 ESSENTIAL READING (Read These First)

### 1. PROJECT_STATE.md
**Location:** `/Users/koen/Projects/Liquilab/PROJECT_STATE.md`  
**Read:** Sections 1-7 + Appendix D (Delta 2025-11-16)  
**Focus on:**
- Section 5: Environment Variables (STAGING setup)
- Section 7.6: Security Baseline (CORS, rate limiting, headers)
- Appendix D.3: Environments & Operations (Staging requirements)
- Appendix D.13: Staging Environment & Merge Gating (4 checks)

### 2. TASK_INTAKE_SPRINTS.md
**Location:** `/Users/koen/Projects/Liquilab/TASK_INTAKE_SPRINTS.md`  
**Read:** Lines 10-110 (Sprint 0 section)  
**Focus on:**
- S0-OPS01: Staging Environment Setup (BLOCKER)
- S0-OPS02: Verify Suite CI Integration
- S0-FE06: verify:brand Implementation
- S0-FE07: verify:typography Implementation

### 3. ROADMAP_COMPLETE_SUMMARY.md
**Location:** `/Users/koen/Projects/Liquilab/ROADMAP_COMPLETE_SUMMARY.md`  
**Read:** Full document (completion summary + Week 1 action plan)  
**Focus on:**
- Week 1 Success Criteria (by end of Week 1)
- S0-OPS01 requirements (Railway + DB + Sentry + Uptime)
- Guardrails (4 non-negotiable rules)

---

## 🚀 SPRINT 0 OVERVIEW

### Sprint Goal
**Setup complete staging infrastructure + CI/CD quality gates** zodat alle SP1+ PRs kunnen worden getest & validated before merge.

### Success Criteria (S0 Complete)
- ✅ Staging environment operational (Railway + DB + Sentry + Uptime)
- ✅ CI/CD pipeline runs verify suite on PR
- ✅ verify:brand check implemented & passing
- ✅ verify:typography check implemented & passing
- ✅ All 4 merge gate checks functional (Deploy Green, Sentry Active, Uptime Active, Verify Suite Pass)

### Blockers if S0 Fails
- ❌ SP1 cannot start (no staging to test FE changes)
- ❌ No quality gates (brand/typography violations slip through)
- ❌ No observability (errors go unnoticed)
- ❌ No uptime monitoring (downtime undetected)

**Bottom line:** S0 is **CRITICAL PATH**. Everything depends on it. 🔥

---

## 📋 SPRINT 0 TASKS (4 Tasks, 40 Hours Total)

### Task 1: S0-OPS01 — Staging Environment Setup ⭐ BLOCKER

**Owner:** Koen (DevOps)  
**Model:** CODEX  
**Estimated Time:** 24 hours (3 days)  
**Status:** 🔴 NOT STARTED

**Goal:** Setup complete staging environment op Railway met dedicated DB, Stripe TEST, Sentry, Uptime monitoring.

**Acceptatie (DoD):**
- [ ] Railway staging project `liquilab-staging` created + deployed
- [ ] Dedicated Postgres DB provisioned + seeded with demo data
- [ ] Stripe TEST keys configured + test payment succeeds (card 4242 4242 4242 4242)
- [ ] Mailgun degrade mode active (`MAILGUN_MODE=degrade`, no emails sent)
- [ ] Sentry staging project created + test error logged via `/api/sentry-test`
- [ ] Uptime monitor (UptimeRobot/Pingdom) configured + checks `/api/health` every 5min
- [ ] CI workflow deploys to staging on PR open
- [ ] GitHub branch protection: requires "Staging Deploy" status check

**Verifier:**
```bash
# 1. Staging deploy green
curl https://staging.liquilab.io/api/health
# Expected: {"status":"ok"}

# 2. Sentry active
curl https://staging.liquilab.io/api/sentry-test
# Expected: 500 + Sentry event ID in response

# 3. Uptime monitor configured
# Manual check: UptimeRobot/Pingdom dashboard shows staging.liquilab.io monitored

# 4. CI deploys on PR
# Open test PR → GitHub Actions shows "Staging Deploy" check → pass/fail
```

**Scope/Files:**
- Railway dashboard (staging project config)
- `.github/workflows/staging-deploy.yml` (CI workflow)
- `sentry.client.config.ts`, `sentry.server.config.ts`
- UptimeRobot/Pingdom dashboard config
- `.env.staging` (staging env vars)

**Environment:** STAGING (setup)

**Notities/Risico's:**
- 🔥 **BLOCKER** voor alle SP1 PRs
- Railway staging project moet EERST aangemaakt worden
- Sentry staging project moet separate zijn van prod (separate DSN)
- Stripe TEST mode (geen echte betalingen)
- Test deploy via PR open/sync trigger

**Dependencies:**
- **Blocks:** S0-OPS02, S0-FE06, S0-FE07 (need staging to validate)
- **Blocks:** All SP1-SP4 tasks (no staging = no testing)

**Your Action (ChatGPT):**
- [ ] Track Koen's progress daily (ask: "S0-OPS01 status update?")
- [ ] Unblock if stuck (troubleshoot Railway errors, Sentry config, etc.)
- [ ] Validate completion (run all 4 verifiers, confirm DoD checklist)
- [ ] Report completion (notify when S0-OPS01 DONE → unblocks rest of S0)

---

### Task 2: S0-OPS02 — Verify Suite CI Integration

**Owner:** Koen (DevOps)  
**Model:** CODEX  
**Estimated Time:** 8 hours (1 day)  
**Status:** 🔴 NOT STARTED  
**Depends on:** S0-OPS01 (needs staging to test CI)

**Goal:** Integrate `npm run verify` in CI workflow met fail-hard thresholds.

**Acceptatie (DoD):**
- [ ] CI workflow runs `npm run verify` on staging deploy
- [ ] Fail-hard checks (block deploy): verify:env, verify:pricing, verify:icons, verify:brand
- [ ] Soft-fail checks (log warnings): verify:a11y (local), verify:billing (degrade OK)
- [ ] CI logs show "✓ All verifications passed" bij success
- [ ] Failed check → PR merge blocked via GitHub status check

**Verifier:**
```bash
# Push to PR → CI runs verify suite → status visible in GitHub PR
# Manual: Open test PR → GitHub Actions tab → "Verify Suite" step → logs show all checks
```

**Scope/Files:**
- `.github/workflows/ci.yml` (add verify suite step)
- `package.json` (verify scripts already exist)

**Environment:** LOCAL → STAGING → PROD

**Notities/Risico's:**
- verify:brand en verify:typography zijn nieuwe checks (S0-FE06/FE07), moeten eerst geïmplementeerd worden
- Depends on S0-OPS01 (staging moet live zijn)

**Dependencies:**
- **Blocked by:** S0-OPS01 (needs staging)
- **Blocked by:** S0-FE06, S0-FE07 (needs new verify checks implemented)

**Your Action (ChatGPT):**
- [ ] Wait for S0-OPS01 completion
- [ ] Track progress after S0-FE06/FE07 done
- [ ] Validate CI logs (check "✓ All verifications passed")
- [ ] Test fail scenario (intentional error → PR blocked)

---

### Task 3: S0-FE06 — verify:brand Implementation

**Owner:** Koen (Frontend)  
**Model:** CODEX  
**Estimated Time:** 4 hours (0.5 day)  
**Status:** 🔴 NOT STARTED  
**Depends on:** Nothing (can start immediately)

**Goal:** Implement `npm run verify:brand` check (fonts, colors, numerics validation).

**Acceptatie (DoD):**
- [ ] Script `scripts/verify-brand/check-brand.mjs` validates:
  - Typography tokens present (`--font-header`, `--font-body`, `--num-style-tabular`) in tokens.css
  - Warns if inline font-family found (should use CSS vars)
  - Checks numeric values use `.numeric` class for tabular-nums
  - Verifies brand colors (`--brand-primary`, `--brand-accent`, `--bg-canvas`) present
- [ ] Exit 0 if compliant, warnings logged
- [ ] Integrated in `package.json`: `"verify:brand": "node scripts/verify-brand/check-brand.mjs"`

**Verifier:**
```bash
npm run verify:brand  # Exit 0 if compliant, warnings logged
```

**Scope/Files:**
- `scripts/verify-brand/check-brand.mjs` (new script)
- `package.json` (add verify:brand script)

**Environment:** LOCAL → STAGING (CI hard-fail)

**Notities/Risico's:**
- Must complete before S0-OPS02 (CI integration needs this check)
- Part of STAGING merge gate (blocks SP1 PRs if fails)

**Dependencies:**
- **Blocks:** S0-OPS02 (CI needs this check)

**Your Action (ChatGPT):**
- [ ] Track implementation progress
- [ ] Validate script works locally (run npm run verify:brand)
- [ ] Check integration in package.json
- [ ] Confirm warnings/errors are clear

---

### Task 4: S0-FE07 — verify:typography Implementation

**Owner:** Koen (Frontend)  
**Model:** CODEX  
**Estimated Time:** 4 hours (0.5 day)  
**Status:** 🔴 NOT STARTED  
**Depends on:** Nothing (can start immediately)

**Goal:** Implement `npm run verify:typography` check (tabular-nums enforcement).

**Acceptatie (DoD):**
- [ ] Script `scripts/verify-typography/check-numerics.mjs` scans components for numeric displays (TVL, APR, fees, prices)
- [ ] Validates `.numeric` class presence on numeric values
- [ ] Soft-fail local (warnings only), hard-fail CI if >10 violations
- [ ] Integrated in `package.json`: `"verify:typography": "node scripts/verify-typography/check-numerics.mjs"`

**Verifier:**
```bash
npm run verify:typography  # Logs violations, exit 0 locally
CI=true npm run verify:typography  # Hard-fail in CI if >10 violations
```

**Scope/Files:**
- `scripts/verify-typography/check-numerics.mjs` (new script)
- `package.json` (add verify:typography script)

**Environment:** LOCAL (soft-fail) → STAGING (hard-fail CI)

**Notities/Risico's:**
- Must complete before S0-OPS02 (CI integration needs this check)
- Part of STAGING merge gate (blocks SP1 PRs if >10 violations)

**Dependencies:**
- **Blocks:** S0-OPS02 (CI needs this check)

**Your Action (ChatGPT):**
- [ ] Track implementation progress
- [ ] Validate script works locally (run npm run verify:typography)
- [ ] Check integration in package.json
- [ ] Test CI mode (CI=true should hard-fail if violations)

---

## 📊 SPRINT 0 KANBAN BOARD (Track Progress)

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ TODO            │ IN PROGRESS     │ BLOCKED         │ DONE            │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ S0-OPS01 ⭐     │                 │                 │                 │
│ S0-FE06         │                 │ S0-OPS02        │                 │
│ S0-FE07         │                 │ (blocked by     │                 │
│                 │                 │  OPS01, FE06,   │                 │
│                 │                 │  FE07)          │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Daily Standup Questions:**
1. **What did Koen complete yesterday?** (move cards)
2. **What is Koen working on today?** (update IN PROGRESS)
3. **Any blockers?** (troubleshoot, unblock)
4. **Is S0 on track for Week 1 completion?** (timeline check)

---

## ✅ S0 COMPLETION CRITERIA (Definition of Done)

**Sprint 0 is DONE when:**

- ✅ **S0-OPS01:** Staging live + DB + Sentry + Uptime + CI deploy
  - Verifier: `curl https://staging.liquilab.io/api/health` → 200 OK
  - Verifier: `curl https://staging.liquilab.io/api/sentry-test` → 500 + event ID
  - Verifier: UptimeRobot dashboard shows staging monitored
  - Verifier: Test PR triggers "Staging Deploy" GitHub check

- ✅ **S0-OPS02:** Verify suite integrated in CI
  - Verifier: Open test PR → CI runs verify suite → logs show "✓ All verifications passed"

- ✅ **S0-FE06:** verify:brand implemented
  - Verifier: `npm run verify:brand` → exit 0 (or warnings only)

- ✅ **S0-FE07:** verify:typography implemented
  - Verifier: `npm run verify:typography` → exit 0 (or warnings only)

**All 4 tasks DONE = S0 COMPLETE → SP1 can start** 🚀

---

## 🚨 CRITICAL BLOCKERS (Watch For These)

### Blocker 1: Railway Staging Setup Fails
**Symptoms:** Deploy fails, DB connection errors, 502 errors  
**Solutions:**
- Check Railway logs (railway logs --service web)
- Verify env vars correct (DATABASE_URL, STRIPE_SECRET_KEY, etc.)
- Check Postgres capacity (10GB minimum)
- Test DB connection: `psql $DATABASE_URL -c "SELECT 1;"`

### Blocker 2: Sentry Not Logging Errors
**Symptoms:** `/api/sentry-test` returns 500 but no event in Sentry dashboard  
**Solutions:**
- Check `SENTRY_DSN` correct in `.env.staging`
- Verify Sentry project exists (staging-specific project)
- Check source maps uploaded (`@sentry/webpack-plugin` config)
- Test locally first: `SENTRY_DSN=xxx npm run dev` → trigger error

### Blocker 3: Uptime Monitor Not Working
**Symptoms:** Monitor shows "down" even though staging is up  
**Solutions:**
- Check `/api/health` endpoint exists & returns 200
- Verify URL correct (`https://staging.liquilab.io/api/health`, no typo)
- Check monitor frequency (5min minimum, not 1min)
- Test manually: `curl -I https://staging.liquilab.io/api/health`

### Blocker 4: CI Deploy Fails on PR Open
**Symptoms:** GitHub Actions workflow fails, PR blocked  
**Solutions:**
- Check `.github/workflows/staging-deploy.yml` syntax
- Verify Railway token valid (`RAILWAY_TOKEN` secret)
- Check branch trigger (`on: pull_request: branches: [main]`)
- Test locally: `act pull_request` (GitHub Actions local runner)

**Your Action:** If any blocker occurs, help Koen troubleshoot using above solutions. Escalate if still blocked after 2 hours.

---

## 🎯 WEEK 1 MILESTONES (Daily Checkpoints)

### Day 1 (Monday) — S0 Kickoff
- [ ] ChatGPT reads all handover docs (PROJECT_STATE, TASK_INTAKE, ROADMAP_COMPLETE)
- [ ] Koen starts S0-OPS01 (Railway staging project creation)
- [ ] Daily standup: "Railway project created? DB provisioned?"

### Day 2 (Tuesday) — Staging Progress
- [ ] S0-OPS01: Railway + DB operational
- [ ] Koen starts Sentry staging project setup
- [ ] Daily standup: "Sentry test error logged? Uptime monitor configured?"

### Day 3 (Wednesday) — Verify Checks
- [ ] S0-OPS01: Sentry + Uptime operational ✅
- [ ] Koen starts S0-FE06 (verify:brand script)
- [ ] Koen starts S0-FE07 (verify:typography script)
- [ ] Daily standup: "Verify scripts working locally?"

### Day 4 (Thursday) — CI Integration
- [ ] S0-FE06 ✅, S0-FE07 ✅ (both verify checks implemented)
- [ ] Koen starts S0-OPS02 (CI workflow integration)
- [ ] Daily standup: "CI runs verify suite? Test PR opens correctly?"

### Day 5 (Friday) — S0 Validation & Completion
- [ ] S0-OPS02 ✅ (CI integrated)
- [ ] Run all verifiers (S0 completion checklist)
- [ ] ChatGPT validates S0 DONE (all 4 tasks complete)
- [ ] **S0 COMPLETE** → Report to Koen: "Ready for SP1 kickoff!" 🎉

---

## 📞 ESCALATION (If S0 Fails)

**If S0 not complete by end of Week 1:**

1. **Identify blocker:**
   - Which task stuck? (OPS01/OPS02/FE06/FE07)
   - What error? (logs, symptoms, failed verifiers)
   - How long blocked? (hours/days)

2. **Attempt solutions:**
   - Check troubleshooting section (Blocker 1-4)
   - Search PROJECT_STATE.md for relevant info
   - Try alternative approaches (e.g., different uptime monitor)

3. **Escalate to Koen:**
   - Document blocker clearly (what/why/impact)
   - List attempted solutions (what didn't work)
   - Suggest timeline adjustment if needed (e.g., S0 extends to Week 2)

**Bottom line:** S0 MUST complete before SP1. If S0 slips, entire 18-week timeline shifts. 🚨

---

## 🛡️ NON-NEGOTIABLE GUARDRAILS (Enforce These)

### 1. RangeBand™ SSoT
**Not relevant for S0** (infrastructure only, no RangeBand code yet)

### 2. Flare-Only Runtime
**Relevant for S0:**
- Staging environment uses **Flare RPC only** (no ANKR)
- Env var: `FLARE_RPC_URL=https://flare-api.flare.network/ext/C/rpc`
- Verify: No ANKR URLs in staging env vars

### 3. Compliance (Pre-Launch Blocker)
**Relevant for S0:**
- Sentry staging project **MUST** be active (observability requirement)
- Uptime monitor **MUST** be configured (downtime detection)
- Legal pages/CookieBanner not needed yet (SP3/SP4)

### 4. Brand Consistency
**Relevant for S0:**
- verify:brand check **MUST** validate CSS vars (no hardcoded colors)
- verify:typography check **MUST** enforce tabular-nums

**Your Action:** During S0, enforce guardrails 2-4. Reject any code that violates these rules.

---

## 📚 ADDITIONAL CONTEXT (Nice to Have)

### Project Background
LiquiLab is a **Flare V3 DEX position aggregator** that consolidates liquidity positions across Ēnosys + SparkDEX into a unified analytics dashboard. Think "DeFi portfolio tracker" maar dan specifiek voor Flare V3 LPs.

### Tech Stack
- **Frontend:** Next.js 15 (Pages Router), TypeScript, Tailwind CSS, React Query
- **Wallet:** Wagmi + Viem (Web3 integration)
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** PostgreSQL (Railway hosted)
- **Payments:** Stripe (TEST mode in staging)
- **Email:** Mailgun (degrade mode in staging = no actual emails)
- **Monitoring:** Sentry (errors) + UptimeRobot/Pingdom (uptime)
- **Deployment:** Railway (staging + prod)

### Current State
- ✅ Indexer operational (ingests NFPM events, pool events)
- ✅ Database schema complete (core tables + analytics tables)
- ✅ Frontend basic structure (Home, Dashboard, Pricing, Pool Detail)
- ✅ Sprint roadmap finalized (18 weeks, Option B approved)
- 🔴 **Staging environment NOT YET SETUP** ← S0 goal
- 🔴 **CI/CD quality gates NOT YET ACTIVE** ← S0 goal

### Why S0 Matters
Without S0 complete:
- ❌ No way to test SP1 FE changes (no staging)
- ❌ Brand/typography violations slip through (no verify checks)
- ❌ Errors go unnoticed (no Sentry)
- ❌ Downtime undetected (no uptime monitoring)
- ❌ SP1 blocked (cannot merge PRs without staging gate)

**S0 is the foundation. Everything builds on it.** 🏗️

---

## 🎉 YOUR MISSION STARTS NOW!

**ChatGPT, you are now Project Manager for Sprint 0.**

**Your responsibilities:**
1. ✅ Track S0 progress daily (4 tasks)
2. ✅ Unblock Koen when stuck (troubleshoot, suggest solutions)
3. ✅ Validate S0 deliverables (run verifiers, check DoD)
4. ✅ Report S0 completion (notify when ready for SP1)

**Success = S0 complete by end of Week 1**  
**Failure = Entire 18-week timeline slips**

**No pressure! 😅 But seriously, S0 is critical. Let's make it happen!** 🚀

---

**First Action:** Ask Koen: **"Ready to start S0-OPS01? Laten we de Railway staging project aanmaken!"**

---

**Generated:** 2025-11-16  
**Status:** 🔒 Ready for ChatGPT takeover  
**Next:** S0 Kickoff → Day 1 (Railway staging project creation)

**Good luck, ChatGPT! You got this! 💪**

