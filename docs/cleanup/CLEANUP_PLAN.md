# CLEANUP_PLAN — UNUSED ROUTES (2025-12-12)

## 1. Summary
- **Context:** SP2 parity work is still active (per `PROJECT_STATE.md` / `RUN_LOG.md`) and UI/data surfaces like `/wallet`, `/pool`, `/pricing`, `/connect`, `/checkout`, `/portfolio`, `/rangeband`, and all pricing/positions APIs remain DO_NOT_TOUCH.
- **Golden rule:** Redirect first, delete later. Any candidate route must be routed safely to an existing destination (or quarantined behind a stub) before code removal. External backlinks or old bookmarks take priority over code tidy-ups.
- **Scope of this plan:** read-only guidance for handling suspected unused routes identified in `docs/cleanup/AUDIT_UNUSED_ROUTES.md`. No changes applied yet.

## 2. Route Actions Table

| Route | File | Evidence snapshot | Risk | Recommended action | Redirect target & rationale |
| --- | --- | --- | --- | --- | --- |
| `/brand` | `pages/brand.tsx` | No in-repo references; marketing assets now live under `/media`. | LOW | REDIRECT → `/` | Home already showcases branding; redirect preserves any lingering bookmarks. |
| `/demo` | `pages/demo.tsx` | No links in source; demo APIs still exist but UI not exposed publicly. | MED | QUARANTINE → create redirect stub to `/rangeband` | `/rangeband` holds explainer content; quarantine buys time to verify no private demos rely on the page. |
| `/fastforward/success` | `pages/fastforward/success.tsx` | No references; `WaitlistHero` links only to `/fastforward/pay`. | MED | REDIRECT → `/fastforward/pay?status=success` | Keeps UX consistent while consolidating the flow into one page. |
| `/koen` | `pages/koen.tsx` | Only mentioned in design exports (figma); no runtime links. | LOW | REDIRECT → `/portfolio` | `/portfolio` is the modern portfolio overview. |
| `/login` | `pages/login.tsx` | No references; auth handled via wallet connect + placeholder gate. | MED | QUARANTINE → stub redirect to `/placeholder` | Placeholder already handles the gate/password flow; redirect avoids breaking old docs. |
| `/pricing-lab` | `pages/pricing-lab.tsx` | No references; experimental copy superseded by `/pricing`. | LOW | REDIRECT → `/pricing` | Pricing page contains the canonical calculator + CTA. |
| `/sales` (index) | `pages/sales/index.tsx` | No direct links; `/sales/offer` is the active funnel step. | MED | REDIRECT → `/sales/offer` | Preserves "sales" entrypoint while ensuring latest funnel UI is shown. |
| `/summary` | `pages/summary.tsx` | No references; analytics dashboards moved to `/dashboard` & `/portfolio`. | LOW | DELETE-LATER (phase out) | After telemetry confirms zero hits (post redirect logs), remove file entirely. Interim step: add redirect to `/portfolio`. |

> DO_NOT_TOUCH: `/wallet`, `/pool`, `/checkout`, `/connect`, `/pricing`, `/portfolio`, `/rangeband`, `/wallet-pro`, `/sales/offer`, `/dashboard`, `/dashboard/blazeswap`, `/placeholder`, and all `/api/positions`/pricing endpoints.

## 3. Verification Checklist (per PR)
1. `npm run verify`
2. `npm run build`
3. Manual smoke:
   - Open the route being redirected (e.g., `/brand`) and confirm 200 + destination URL.
4. Confirm no diffs under DO_NOT_TOUCH areas (git status check focusing on those paths).
5. Capture server logs to ensure no unexpected middleware loops.

## 4. PR Sequencing (1 route/PR, ≤2 files where possible)
1. **PR#1 – `/brand` redirect**: add Next.js redirect from `/brand` to `/`, adjust tests if any.
2. **PR#2 – `/pricing-lab` redirect**: route to `/pricing`; confirm no env flags gating it.
3. **PR#3 – `/koen` redirect**: send to `/portfolio`.
4. **PR#4 – `/fastforward/success` consolidation**: redirect to `/fastforward/pay?status=success`.
5. **PR#5 – `/sales` base redirect**: route to `/sales/offer`; leave `/sales/offer` untouched.

Follow-up PRs (after telemetry):
- `/demo` → quarantine stub then eventual delete.
- `/login` → confirm placeholder gate is sufficient before removal.
- `/summary` → redirect to `/portfolio`, then delete once analytics show zero hits.

Each PR should include a short note referencing this plan and verifying the checklist outcomes.


