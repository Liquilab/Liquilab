# AUDIT_UNUSED_ROUTES — 2025-12-12

Strict read-only assessment of the Pages Router footprint (excluding `pages/api`). No functional changes were made.

## Route Inventory & Evidence

| Route | File | Dynamic params | Evidence of usage |
| --- | --- | --- | --- |
| `/` | `pages/index.tsx` | — | Linked throughout the shell (e.g. `src/components/brand/Logo.tsx:45`, `src/components/wallet/WalletProPage.tsx:297` “Back to Standard View”). |
| `/account` | `pages/account.tsx` | — | Navigation dropdown links (`src/components/Navigation.tsx:41-46, 111-128, 182-188`). |
| `/admin/ankr` | `pages/admin/ankr.tsx` | — | Linked from `/admin/db` breadcrumb (`pages/admin/db.tsx:179`) and documented as active admin view in `PROJECT_STATE.md:19`. |
| `/admin/db` | `pages/admin/db.tsx` | — | Active admin tooling per `PROJECT_STATE.md:19`; fetches `/api/admin/db` when loaded (`pages/admin/db.tsx:51,67`). |
| `/admin/payments` | `pages/admin/payments.tsx` | — | Mentioned in `docs/ACCESS_POLICY.md:25` and fetches `/api/admin/payments` + `/api/admin/payments/approve` within the page. |
| `/admin/settings` | `pages/admin/settings.tsx` | — | Pricing calculator and scripts hit `/api/admin/settings` (`pages/admin/settings.tsx:30,49`, `src/components/billing/PricingCalculator.tsx:200`). |
| `/brand` | `pages/brand.tsx` | — | **No references found** via `rg -n "\"/brand\"" src/` (0 matches). |
| `/checkout` | `pages/checkout.tsx` | — | Linked from pricing CTA flows (e.g. `src/components/marketing/PricingPanel.tsx:88,105`, `src/features/billing/BillingDashboard.tsx:79,96`). |
| `/connect` | `pages/connect.tsx` | — | CTA links in marketing components (`src/components/marketing/PricingPanel.tsx:79`, `src/features/billing/BillingDashboard.tsx:70`). |
| `/dashboard` | `pages/dashboard.tsx` | — | Linked from Pool Universe context card (`src/components/pool/universe/PoolUniverseContextSection.tsx:195`). |
| `/dashboard/blazeswap` | `pages/dashboard/blazeswap.tsx` | — | Linked from global header when BlazeSwap flag is set (`src/components/Header.tsx:64`). |
| `/demo` | `pages/demo.tsx` | — | **No references found** (`rg -n "\"/demo\"" src/` → 0). |
| `/faq` | `pages/faq.tsx` | — | Part of primary nav (`src/components/Navigation.tsx:42-46`). |
| `/fastforward/pay` | `pages/fastforward/pay.tsx` | — | Linked from waitlist hero CTA (`src/components/waitlist/WaitlistHero.tsx:24`). |
| `/fastforward/success` | `pages/fastforward/success.tsx` | — | **No references found** (`rg -n "fastforward/success" .` → 0). |
| `/koen` | `pages/koen.tsx` | — | Only referenced in design exports (`figma*/`); `rg -n "\"/koen\"" src/` returns 0. |
| `/login` | `pages/login.tsx` | — | **No usage references** (`rg -n "\"/login\"" src/` → 0). |
| `/partners` | `pages/partners.tsx` | — | Footer link (`src/components/Footer.tsx:31`). |
| `/placeholder` | `pages/placeholder.tsx` | — | Enforced by middleware gate (`middleware.ts:33-57`) and documented in `PROJECT_STATE.md:19`. |
| `/pool/[poolAddress]` | `pages/pool/[poolAddress]/index.tsx` | `[poolAddress]` | `WalletProPage` deep-links via `getPoolUniverseLink` (`src/components/wallet/WalletProPage.tsx:195-203, 465,623`). |
| `/portfolio` | `pages/portfolio.tsx` | — | Primary nav entry (`src/components/Navigation.tsx:42-46`). |
| `/pricing-lab` | `pages/pricing-lab.tsx` | — | **No references found** (`rg -n "\"/pricing-lab\"" src/` → 0). |
| `/pricing` | `pages/pricing.tsx` | — | Linked from nav & CTAs (`src/components/Navigation.tsx:42-46,86-90`, `src/components/waitlist/WaitlistHero.tsx:18`). |
| `/rangeband` | `pages/rangeband.tsx` | — | Primary nav entry (`src/components/Navigation.tsx:42-46`). |
| `/sales` | `pages/sales/index.tsx` | — | **No references found** (`rg -n "\"/sales\"" src/` → 0). |
| `/sales/offer` | `pages/sales/offer.tsx` | — | Routed from connect/onboarding flows (`src/components/onboarding/ConnectWalletModal.tsx:153`, `src/components/pricing/PremiumCard.tsx:158`). |
| `/summary` | `pages/summary.tsx` | — | **No references found** (`rg -n "\"/summary\"" src/` → 0). |
| `/waitlist` | `pages/waitlist.tsx` | — | Linked from waitlist hero (`src/components/waitlist/WaitlistHero.tsx:18`). |
| `/wallet` | `pages/wallet/index.tsx` | — | Entry point for Portfolio Pro (linked from `/wallet-pro` and gating logic). |
| `/wallet-pro` | `pages/wallet-pro.tsx` | — | Pro landing linking into `/wallet` gating; referenced via marketing CTAs and subscription gating. |

_Framework scaffolding_: `_app.tsx` and `_document.tsx` bootstrap providers/layout; not standalone routes.

## Unused / Unknown Candidates

High-confidence UNUSED (no in-repo references beyond the page file itself):
- `/brand` (`rg "\"/brand\""` across `src/` returned 0).
- `/demo` (`rg "\"/demo\""` across repo returned 0).
- `/fastforward/success` (`rg "fastforward/success"` returned 0).
- `/koen` (only mentioned in design exports, not shipped code).
- `/login` (no `href`/`router.push` references).
- `/pricing-lab` (no references).
- `/sales` base route (no references; only `/sales/offer` linked).
- `/summary` (no references).

Status: mark as **UNKNOWN** in production until telemetry/backlinks confirm; candidate for cleanup after validating no external entry points.

## Risk Flags (DO_NOT_TOUCH)

- `/wallet` (`pages/wallet/index.tsx`) and `/wallet-pro.tsx`: tied directly to PHASE 3 parity work and `/api/positions`.
- `/pool/[poolAddress]`: drives Pool Universe + valuation evidence; deleting impacts parity and analytics.
- `/pricing`, `/portfolio`, `/rangeband`: primary nav + revenue funnel.
- `/api/positions` + supporting pricing logic (indirect dependency for `/sales/offer`, `/wallet`, `/pool`): explicitly excluded from cleanup per SP3 instructions.

## Suggested Next Micro-Removals (planning only)

1. **Instrument `/demo` traffic** (temporary middleware log) before removing the page.
2. **Confirm marketing no longer links to `/brand`**; if unused, archive the route and expose assets via `/media`.
3. **Consolidate `/fastforward/success` workflow** by redirecting to `/fastforward/pay?success=1` and removing the standalone page after QA.
4. **Deprecate `/pricing-lab`** by merging any remaining experiments into `/pricing`, then delete the route.
5. **Audit `/summary` + `/sales` base landing**; if external links do not exist, remove or redirect to `/portfolio` or `/sales/offer`.

These steps should only proceed after confirming external bookmarks/ads do not rely on the routes.

## How to Use This Report

- Use the inventory table as the canonical checklist before deleting or relocating routes.
- For each “UNKNOWN” route, replicate the provided `rg` searches (patterns included) to verify no new references were added.
- Treat DO_NOT_TOUCH routes as out-of-scope until PHASE 3 parity work is fully signed off.



