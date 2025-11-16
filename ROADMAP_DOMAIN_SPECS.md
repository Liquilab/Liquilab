# LIQUILAB ROADMAP — Domain/Owner Specifieke Aanvullingen

> Doel: alle ontbrekende details/specs/flows/edge cases vastleggen. Use "GECOVERED" waar 100% gedekt.

---

## FRONTEND (Owner: Koen)

### Routes & Flows (per route: user story, states, DoD, verifiers)

#### **/ (Home/Dashboard)**

**User Story:**
- Als Visitor: zie hero + RangeBand™ demo + pool preview (tabel/grid toggle)
- Als Premium/Pro: zie wallet connect CTA → na connect: redirect naar `/dashboard`

**States:**
- Visitor: demo data uit `/api/demo/pools` (TTL 60s)
- Premium: eigen pools + demo CTA
- Pro: eigen pools + analytics badges

**Edge Cases:**
- Wallet niet verbonden → "getting started" panel
- Ongeldig adres → error "—"
- 0 pools → "Connect wallet — start free" CTA
- RangeBand demo: fees24h = 0 → toon "0.00" i.p.v. "—"

**DoD:**
- HTML bevat `<img src="/media/tokens/*.svg">` (status-tiles aanwezig)
- TTFB < 600ms; SSR zonder warnings
- Verifier: `curl localhost:3000/ | grep -q "RangeBand"`

**GECOVERED:** visueel (hero + demo tabel/grid), RangeBand interactie, wallet connect flow.

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP1-T11:** "Home hero + demo table/grid" (Owner: FE)
  - DoD: Hero renders, table/grid toggle works, demo data from `/api/demo/pools`
  - Verifier: Visual regression + `curl / | grep -q "RangeBand"`
- **SP1-T12:** "Connect CTA→/dashboard" (Owner: FE)
  - DoD: Premium/Pro users redirected after wallet connect
  - Verifier: E2E test wallet connect flow

<!-- DELTA 2025-11-16 END -->

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

**Hero Composition:**
- **Wave Hero:** Crisp SVG/PNG in bottom 50% viewport fold; seamless gradient transition from `--bg-canvas` (top 50%)
- **Typography:** Quicksand headers (600/700 weights), Inter body (400/500)
- **CTA Hierarchy:**
  - Primary: "Start 14-day trial" (Electric Blue #3B82F6, prominent placement)
  - Secondary: "Bekijk demo" (ghost button, lower visual weight)
- **Device Pixel Ratio:** 2x wave assets for Retina; crisp rendering via `image-rendering: -webkit-optimize-contrast`

**OG Assets (Open Graph):**
- **DoD:** 1200×630px social preview images
- **Variants:** Home (default), Dashboard (logged-in), RangeBand explainer, Pricing, FAQ
- **Route-specific meta:** `og:title`, `og:description`, `og:image` populated per route
- **Verifier:** `npm run verify:og` checks presence + asset existence

**Empty/Degrade States:**
- **0 pools:** "Connect wallet — start free" CTA with getting started panel
- **API degrade:** Stale badge + cached demo data (TTL 60s)
- **Wallet error:** Clear error message "Invalid wallet address" (niet "—")

**Token Icon Fallback Policy:**
- **Chain:** SVG → PNG → WEBP → `/media/tokens/token-default.svg`
- **SSR Visibility:** Icons render on initial HTML (no dynamic imports)
- **Verifier:** `test -f public/media/tokens/token-default.svg`

**Figma References:**
- Frame: "Home — Hero V3" (wave + CTA hierarchy)
- Frame: "Home — Demo Table" (token icons + tabular-nums)
- Frame: "Home — Empty State" (0 pools)

<!-- DELTA 2025-11-16 END -->

---

#### **/summary**

**User Story:**
- Als Premium/Pro: zie portfolio samenvatting (TVL, fees, rewards, posities actief/inactief)

**Gating:**
- Visitor → demo metrics (uitgegrijsd)
- Premium/Pro → echte metrics

**Edge Cases:**
- `fees24h = 0` → toon "0.00" i.p.v. "—"
- `stateTᵢ` present → `stale` badge
- Timeout API (2s) → skeleton → degrade

**DoD:**
- Consume `/api/analytics/summary`; skeleton → loaded → degrade
- Golden wallet test (degrade-path werkt); langzame API (timeout UI na 2s met skeleton)

**Testcases:**
- Golden wallet: pass
- Degrade-path: API down → UI toont stale badge + cached data
- Langzame API: timeout na 2s → skeleton blijft zichtbaar

**Verifier:**
- `curl /api/analytics/summary | jq '.ok'` → `true` of `degrade: true`

**TODO:**
- ⚠️ Overlap met `/dashboard` — consolideer of deprecate `/summary`

<!-- DELTA 2025-11-16 START -->

**Timeout Handling:**
- 2s → skeleton → degrade banner + `staleTs`

**Tasks:**
- **SP2-T13:** "Integrate `/api/analytics/summary`" (Owner: FE/API)
  - DoD: Consumes endpoint, handles degrade mode, shows stale banner
  - Verifier: `curl /api/analytics/summary | jq '.ok'` + golden wallet test

<!-- DELTA 2025-11-16 END -->

---

#### **/pool/[tokenId]**

**User Story:**
- Als Premium: zie pool details (token pair, fees, TVL, range status)
- Als Pro: zie + analytics (historical charts, peer comparison)

**RangeBand™:**
- GECOVERED: visueel (in/near/out met kleurcodes)
- Extra: status legend (in/range/out) + tooltip

**Edge Cases:**
- `**NO_POSITION**` state → toon fallback "token-default.svg"
- Ontbrekende tokens → extreme APR (null → toon "—")
- APR > 1000% → tooltip "Verify pool liquidity"

**DoD:**
- Token icons: local-first (`/media/tokens/*.webp` → `.png` → `.svg` → default)
- RangeBand: tick bounds + current price + strategy label (AGG/BAL/CONS)
- Verifier: `test -f public/media/tokens/token-default.svg`

**Gating:**
- Visitor: blur overlay op analytics sectie
- Premium: all visible except peer comparison
- Pro: all visible + peer badges

**TODO:**
- Historical chart data (7d/30d snapshots) — not implemented
- Peer comparison logic — not implemented

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP2-T14:** "Integrate mv_position_overview_latest" (Owner: DATA/API)
  - DoD: Pool detail page pulls RangeBand™ status from MV
  - Verifier: `curl /api/analytics/pool/[id] | jq '.pool.bandColor'`
- **SP2-T15:** "Day stats chart 7d/30d (snapshots)" (Owner: FE/DATA)
  - DoD: Chart renders from `mv_position_day_stats`
  - Verifier: Visual test + data points validation

<!-- DELTA 2025-11-16 END -->

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

**RangeBand™ Legend + Tooltips:**
- **Legend:** Always visible (in-range: green, near-band: orange, out-of-range: red)
- **Tooltip Content:**
  - **In Range:** "Position is actively earning fees"
  - **Near Band:** "Price approaching your range bounds — consider rebalancing"
  - **Out of Range:** "Position not earning fees — outside range"
- **Interactive:** Hover/focus shows tooltip; keyboard accessible (Tab navigation)

**Extreme APR Warning:**
- **Trigger:** APR > 1000%
- **UI:** Yellow warning badge + tooltip "⚠️ Verify pool liquidity — unusually high APR may indicate low TVL or data anomaly"
- **Placement:** Next to APR value in pool header

**Token Icon Fallback (Pool Detail):**
- **Chain:** `/media/tokens/{symbol}.svg` → `.png` → `.webp` → `/media/tokens/by-address/{address}.png` → `token-default.svg`
- **NO_POSITION state:** Show default icon + message "Pool data loading..."
- **Missing token:** Log warning (Sentry), render default icon, no blank space

**Chart Styling (7d/30d):**
- **Compact variant:** Height 200px, minimal labels, tabular-nums for Y-axis
- **Large variant:** Height 400px, full labels, tooltips on data points
- **Typography:** Inter 400 for labels, tabular-nums for all numeric values
- **Colors:** Signal Aqua (#1BE8D2) for lines, semi-transparent fills
- **Responsive:** Compact on mobile, large on desktop (breakpoint: 768px)

**Figma References:**
- Frame: "Pool Detail — RangeBand Legend"
- Frame: "Pool Detail — Extreme APR Warning"
- Frame: "Pool Detail — Charts 7d/30d Variants"
- Frame: "Pool Detail — Empty State (NO_POSITION)"

<!-- DELTA 2025-11-16 END -->

---

#### **/rangeband**

**User Story:**
- Als Visitor: leer over RangeBand™ concept via interactive demo

**GECOVERED:**
- Visual demo met live price poll (`/api/prices/current?symbols=FXRP`)
- Strategy toggle (Aggressive/Balanced/Conservative)
- Tick bounds + range segment visualisatie

**Edge Cases:**
- Price API failure → fallback naar laatste prijs + stale indicator

**DoD:**
- Demo werkt zonder wallet connect
- Price updates elke 10s (WebSocket of polling)

**Verifier:**
- `curl /api/prices/current?symbols=FXRP | jq '.success'` → `true`

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP2-T16:** "/api/rangeband/preview implement + UI hook" (Owner: API/FE)
  - DoD: Endpoint returns status + estimates (fees7d, il7d); UI hooks into preview
  - Verifier: `curl '/api/rangeband/preview?pool=0x..&min=..&max=..' | jq '.ok'`

<!-- DELTA 2025-11-16 END -->

---

#### **/pricing**

**User Story:**
- Als Visitor: zie pricing calculator + checkout flow
- Als Premium/Pro: zie "Manage subscription" knop → Stripe Portal

**States:**
- Not connected: calculator + "Connect wallet to continue"
- Connected: calculator + "Start 14-day trial" (Stripe Checkout)
- Active subscription: "Manage" knop → `/api/billing/portal`

**Edge Cases:**
- 0 pools selected → disable checkout knop + tooltip "Select at least 5 pools"
- Stripe degrade mode (`{ok:false, degrade:true}`) → CTA disabled + "Billing temporarily unavailable"
- Email niet ingevuld → **BUG** (optioneel in API, moet verplicht)

**DoD:**
- UI toont USD prijzen (`$14.95/mo`)
- Label: "Charged in EUR (≈ €XX.XX)" — **TODO: implement EUR conversie**
- Checkout redirect → `/pricing?checkout=success` of `?checkout=cancel`
- Verifier: `npm run verify:billing` → exit 0

**CRITICAL TODO:**
- ❌ EUR/USD conversie in UI (nu alleen USD uit `config/billing.ts`)
- ❌ Email verplicht maken in checkout form
- ❌ Trial countdown badge ("X days left" voor active trials)

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP3-T21:** "Email verplicht in checkout" (Owner: Billing)
  - DoD: Stripe checkout requires email; 400 on empty email
  - Verifier: Checkout attempt without email fails
- **SP3-T22:** "EUR label/FX cache 24h" (Owner: FE/Billing)
  - DoD: UI shows "Charged in EUR (≈ €XX.XX)"; FX rate cached 24h
  - Verifier: Visual test + cache headers check
- **SP3-T23:** "Trial countdown badge" (Owner: FE/Billing)
  - DoD: Badge shows "D-n" for active trials
  - Verifier: Trial user sees countdown

<!-- DELTA 2025-11-16 END -->

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

**EUR Label Implementation:**
- **Display:** "Charged in EUR (≈ €XX.XX)" below USD pricing
- **FX Cache:** 24h TTL via `/api/billing/fx-rate` (ECB or similar)
- **Fallback:** If FX API unavailable, use last cached rate + stale indicator
- **Typography:** Inter 400, `--text-med` opacity, smaller font size (14px)
- **Verifier:** `npm run verify:pricing` checks EUR label presence

**Trial Countdown Badge:**
- **Format:** "D-n" (e.g., "D-7" for 7 days remaining)
- **Placement:** Top-right of pricing card for trialing users
- **Colors:** Signal Aqua (#1BE8D2) background, white text
- **State:** Auto-updates daily; disappears on trial end
- **Verifier:** E2E test with trial subscription fixture

**Degrade States:**
- **Stripe Degrade:** CTA disabled (opacity 0.5) + warning banner "Billing temporarily unavailable — try again shortly"
- **0 Pools Selected:** CTA disabled + tooltip "Select at least 5 pools to continue"
- **Email Missing:** Inline validation error "Email required for receipts" (red border + error message)

**Calculator UX:**
- **Pool Slider:** Step 5, min 5, max 100+
- **Add-ons:** Checkboxes for Extra5 packs + Alerts5
- **Live Update:** Total price updates immediately on slider/checkbox change
- **Tabular Numerals:** All pricing values use `tabular-nums` for stable layout

**Figma References:**
- Frame: "Pricing — Calculator + EUR Label"
- Frame: "Pricing — Trial Countdown Badge"
- Frame: "Pricing — Degrade States (Stripe/0 Pools/Email Error)"
- Frame: "Pricing — Success/Cancel Confirmation"

<!-- DELTA 2025-11-16 END -->

---

#### **/faq**

**User Story:**
- Als Visitor: zie veelgestelde vragen + antwoorden

**GECOVERED:**
- Static page met Q&A markup

**Edge Cases:**
- Geen edge cases (static content)

**DoD:**
- FAQ search (ctrl+F werkt, geen custom search for MVP)
- Accordion UI (open/close per sectie) — **TODO**

**TODO:**
- Accordion component (huidige implementatie is plain text)
- Anchor links per vraag (#how-rangeband-works)

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP1-T13:** "Accordion + anchors" (Owner: FE)
  - DoD: FAQ uses Accordion component with anchor links per question
  - Verifier: Click anchor links; keyboard navigation works

<!-- DELTA 2025-11-16 END -->

---

#### **/legal/privacy** ❌ MISSING

**User Story:**
- Als Visitor: lees privacy policy (GDPR vereist)

**Requirements:**
- GDPR-compliant text
- Data we verzamelen (wallet adres, email bij checkout)
- Data we NIET verzamelen (geen seed phrases, private keys)
- Retention policy (zie PROJECT_STATE: 180d raw, indefinite analytics)
- User rights (access, export, delete)

**DoD:**
- Page exists met `/legal/privacy` route
- SEO meta tags
- Last updated date

**TODO:**
- ⚠️ **CRITICAL:** legal content schrijven (juridisch advies?)
- Link in footer

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP3-T42:** "Terms/Privacy content" (Owner: Legal/FE)
  - DoD: Pages exist with GDPR-compliant text, SEO meta, last updated date
  - Verifier: Pages accessible; footer links work

<!-- DELTA 2025-11-16 END -->

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

**Legal Pages Template (Unified):**
- **Typography:** Quicksand 600 for section headers, Inter 400 for body text
- **Layout:** Max-width 800px, left-aligned, `--space-lg` vertical rhythm
- **Sections:** Table of contents (anchor links), collapsible sections (Accordion pattern)
- **Last Updated:** Visible at top, format "Last updated: DD MMM YYYY"
- **Footer Links:** Privacy, Terms, Cookies (always visible)

**WCAG AA Compliance:**
- **Contrast:** All text ≥4.5:1 against `--bg-canvas`
- **Keyboard Nav:** Tab through sections, Enter/Space to expand accordions
- **Focus Indicators:** 2px `--brand-primary` outline on interactive elements
- **Screen Reader:** Proper heading hierarchy (h1 → h2 → h3)

**Verifiers:**
- SSR 200 status: `curl -I /legal/privacy | grep "200 OK"`
- Lighthouse A11y score ≥95
- Anchor links functional: `#data-collection`, `#user-rights`, etc.

**Figma References:**
- Frame: "Legal — Page Template (Unified)"
- Frame: "Legal — Table of Contents + Accordion"

<!-- DELTA 2025-11-16 END -->

---

#### **/legal/terms** ❌ MISSING

**User Story:**
- Als Visitor: lees Terms of Service

**Requirements:**
- Subscription terms (trial, billing, cancellation)
- Liability disclaimer (geen custody, read-only wallet connect)
- Acceptable use (no abuse of API, rate limits)

**DoD:**
- Page exists met `/legal/terms` route
- Link in footer + checkout flow ("By continuing you agree to...")

**TODO:**
- ⚠️ **CRITICAL:** TOS content schrijven
- Link in checkout UI

---

#### **/legal/cookies** ❌ MISSING

**User Story:**
- Als Visitor: zie cookie policy + consent banner (GDPR)

**Requirements:**
- Cookie banner op eerste bezoek
- Essential cookies (wagmi session, ll_preview placeholder gate)
- Analytics cookies (none yet, maar toekomst GA/Plausible)
- User can accept/reject

**DoD:**
- Cookie banner component (toast style, bottom)
- `/legal/cookies` page met uitleg
- Cookie consent stored in `localStorage` (ll_cookies_accepted)

**TODO:**
- ⚠️ **CRITICAL:** Cookie banner component
- Cookie policy text

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP4-T41:** "CookieBanner + route /legal/cookies" (Owner: FE/Legal)
  - DoD: Banner appears on first visit; consent stored in `localStorage: ll_cookies_accepted`
  - Verifier: Banner dismisses; localStorage value set; `/legal/cookies` page exists

<!-- DELTA 2025-11-16 END -->

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

**CookieBanner Component:**
- **Placement:** Fixed bottom, z-index 1000, full-width on mobile, max-width 600px centered on desktop
- **Content:** "We use essential cookies for wallet sessions. [Learn more](/legal/cookies)"
- **Actions:** "Accept" (primary button), "Reject" (secondary/ghost)
- **Dismiss:** Click Accept/Reject or Esc key
- **Consent Storage:** `localStorage.setItem('ll_cookies_accepted', 'true|false')`

**A11y Requirements:**
- **ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-label="Cookie consent"`
- **Focus Trap:** Tab cycles through links + buttons only (not background)
- **Keyboard:** Esc to dismiss (defaults to Reject), Enter on focused button to confirm
- **Reduced Motion:** No slide-in animation if `prefers-reduced-motion: reduce`

**Visual Design:**
- **Background:** `--bg-surface` (rgba(10, 15, 26, 0.88)) with backdrop blur
- **Typography:** Inter 400, 14px body text, buttons 16px
- **Spacing:** `--space-md` padding, `--space-sm` between elements
- **Elevation:** `--elevation-e4` shadow

**First Visit Logic:**
- Check `localStorage.ll_cookies_accepted` on mount
- If `null` → show banner after 2s delay (allow page to settle)
- If `'true'` or `'false'` → hide banner

**Verifiers:**
- Banner appears on first visit (clear localStorage before test)
- Banner dismissed on Accept/Reject
- `localStorage.ll_cookies_accepted` set correctly
- Keyboard navigation functional (Tab, Esc, Enter)
- Axe A11y check passes

**Figma References:**
- Frame: "CookieBanner — Desktop + Mobile Variants"
- Frame: "CookieBanner — Focus States (Keyboard Nav)"

<!-- DELTA 2025-11-16 END -->

---

#### **/account** ❌ MISSING

**User Story:**
- Als Premium/Pro: beheer account settings (email, alerts, preferences)

**Sections:**
- Profile (email, wallet address)
- Subscription (current plan, usage, manage via Stripe)
- Email preferences (alerts, reports, marketing)
- Danger zone (delete account → GDPR)

**Edge Cases:**
- No active subscription → redirect to `/pricing`
- Delete account → confirm modal + webhook naar backend

**DoD:**
- Form met validatie (email format)
- "Save changes" → `/api/user/settings` (POST)
- Delete account → `/api/user/delete` → Stripe cancel + DB cleanup

**TODO:**
- ⚠️ **HIGH PRIORITY:** complete account page
- `/api/user/settings` endpoint
- `/api/user/delete` endpoint + GDPR cleanup

<!-- DELTA 2025-11-16 START -->

**Endpoints:**
- GET/POST `/api/user/settings?wallet=0x…`
- POST `/api/user/delete` (body: `{ wallet, confirm: true }`)

**Tasks:**
- **SP3-T24:** "Account page (light)" (Owner: FE)
  - DoD: Page renders with profile, subscription, preferences sections
  - Verifier: Page accessible for Premium/Pro users
- **SP3-T25:** "/api/user/settings + email verify" (Owner: API)
  - DoD: CRUD works; email validation; unsubscribe flow
  - Verifier: `curl /api/user/settings?wallet=0x... | jq '.data.settings.emailVerified'`
- **SP3-T26:** "/api/user/delete flow" (Owner: API/Billing)
  - DoD: Stripe cancel → delete BillingCustomer + UserSettings + AlertConfig; pseudonimize analytics
  - Verifier: Returns `{ok:true}` + AuditLog entry exists

<!-- DELTA 2025-11-16 END -->

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

**Forms Pattern (react-hook-form):**
- **Library:** react-hook-form voor form state + validation
- **Schema Validation:** Zod schemas voor email, preferences
- **Error Display:** Inline errors (red border + message below field)
- **Success State:** Green checkmark + "Settings saved" toast (3s auto-dismiss)

**Profile Section:**
- **Fields:** Email (text input), Wallet Address (read-only, truncated display)
- **Email Validation:** 
  - Required: "Email is required"
  - Format: "Valid email required" (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
  - Async check: Verify not already in use (debounced 500ms)
- **Save Button:** Disabled until form dirty + valid

**Email Preferences:**
- **Checkboxes:** Alerts (position notifications), Reports (weekly summaries), Marketing (product updates)
- **Default:** All unchecked initially (opt-in only)
- **Unsubscribe Link:** Links in emails point to `/account?unsubscribe=alerts|reports|marketing`
- **Persistence:** POST to `/api/user/settings` on change (auto-save, no explicit Save button)

**Danger Zone (GDPR Delete):**
- **UI:** Red border section, collapsed by default (Accordion pattern)
- **Button:** "Delete Account" (red, ghost style)
- **Confirm Modal:**
  - Title: "Delete your account?"
  - Content: "This will permanently delete your data and cancel your subscription. Type DELETE to confirm."
  - Input: Text field (must type "DELETE" exactly)
  - Actions: "Cancel" (secondary), "Delete Account" (red primary, disabled until "DELETE" typed)
- **Flow:** Confirm → POST `/api/user/delete` → Success toast → Redirect `/pricing?deleted=true`

**API Degrade Handling:**
- **Settings Load Error:** Show stale data + "Unable to load latest settings" banner
- **Settings Save Error:** Toast error "Unable to save — try again" + retry button
- **Delete Error:** Modal stays open + inline error "Delete failed — contact support"

**Figma References:**
- Frame: "Account — Profile + Email Form"
- Frame: "Account — Email Preferences (Checkboxes)"
- Frame: "Account — Danger Zone (Collapsed/Expanded)"
- Frame: "Account — Delete Confirmation Modal"
- Frame: "Account — Form Validation States"

<!-- DELTA 2025-11-16 END -->

---

#### **/reports** ❌ MISSING (Pro feature)

**User Story:**
- Als Pro: download historical reports (CSV/PDF)

**Features:**
- Date range picker (7d, 30d, custom)
- Export format (CSV, PDF)
- Report types: portfolio performance, fee history, IL analysis

**DoD:**
- `/api/reports/export` endpoint (POST)
- CSV generation: positions + fees + IL per period
- PDF generation: branded template met charts (optional for MVP)

**TODO:**
- ⚠️ **POST-MVP:** reports feature (not MVP critical)

<!-- DELTA 2025-11-16 START -->

**Status:** Nice to have (post-MVP)

**Endpoint:**
- POST `/api/reports/export` → `{ downloadUrl, expiresAt }` (CSV/PDF)

<!-- DELTA 2025-11-16 END -->

---

#### **/alerts** ❌ MISSING (Premium/Pro add-on)

**User Story:**
- Als Premium+Alerts: configureer alerts per pool (out of range, claim ready)

**Features:**
- Toggle alerts per position
- Alert types: out_of_range, near_band, claim_ready, low_liquidity
- Delivery: email (Mailgun), push (future), Discord (future)

**DoD:**
- `/api/user/alerts` (GET/POST/PUT/DELETE)
- UI: toggle switches per position in dashboard
- Backend: alert queue + delivery logic

**TODO:**
- ⚠️ **HIGH PRIORITY:** alerts configuration UI + backend
- Alert delivery logic (Mailgun templates)
- Rate limiting (max 1 alert/hour per position)

<!-- DELTA 2025-11-16 START -->

**Endpoints:**
- GET/POST/PUT/DELETE `/api/user/alerts`

**Schema:**
```ts
type AlertRecord = {
  id: string; wallet: string; positionId: string;
  type: 'out_of_range'|'near_band'|'claim_ready';
  enabled: boolean; lastTriggered?: string | null;
};
```

**Rate Limiting:** max 50 alerts/wallet

**Tasks:**
- **SP6-T31:** "Alerts CRUD API" (Owner: API)
  - DoD: CRUD endpoints; rate limit enforced; degrade mode on queue pause
  - Verifier: CRUD integration test; `code:'ALERTS_PAUSED'` on degrade
- **SP6-T32:** "Alerts toggles in dashboard" (Owner: FE)
  - DoD: UI shows toggle per position; saves to API
  - Verifier: Toggle persists; delivery test (manual)

**Status:** Backend MVP in S3/S6; UI **High Priority**, post-launch week 1–2

<!-- DELTA 2025-11-16 END -->

---

#### **/onboarding** ❌ MISSING

**User Story:**
- Als nieuwe user: see interactive tour (optional skip)

**Steps:**
1. Welcome → "LiquiLab aggregates all your DEX positions"
2. Connect wallet → demo wallet connect
3. View positions → highlight PoolsGrid
4. RangeBand™ → tooltip explainer
5. Upgrade → pricing CTA

**DoD:**
- Modal overlay met step indicator (1/5)
- Skip button + "Don't show again" checkbox
- Stored in `localStorage` (ll_onboarding_completed)

**TODO:**
- ⚠️ **MEDIUM PRIORITY:** onboarding wizard (improves UX but not MVP blocker)

<!-- DELTA 2025-11-16 START -->

**Status:** Nice to have (post-MVP)

<!-- DELTA 2025-11-16 END -->

---

<!-- DELTA 2025-11-16 START -->

#### **/status** ❌ NEW

**User Story:**
- Als Ops/Support: zie component statuses (db/analytics/billing/mail/indexer)

**Components:**
- Database: connected / latency
- Analytics MVs: last refresh timestamp / lag
- Billing (Stripe): operational / degrade
- Mail (Mailgun): operational / degrade
- Indexer: last block / lag

**DoD:**
- Page shows component states with timestamps
- Consistent with `/api/health` endpoint
- Optional: incident log (recent SEV-1/2/3)

**Tasks:**
- **SP4-T43:** "/status internal panel (details + lag)" (Owner: Ops/FE)
  - DoD: Status page renders; consistent with `/api/health`
  - Verifier: `GET /api/health` matches UI indicators

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

**Component States (Observability):**
- **Database:** `ok` (green), `slow` (yellow, >500ms), `down` (red)
- **Analytics MVs:** Show last refresh timestamp; `stale` if >2h
- **Billing (Stripe):** `ok` / `degrade` (Stripe API timeout)
- **Mail (Mailgun):** `ok` / `degrade` (queue paused or API error)
- **Indexer:** Show last processed block + lag in seconds; `stale` if >300s

**SEV Level Indicators:**
- **SEV-1 (Critical):** Red badge, entire service affected
- **SEV-2 (Major):** Orange badge, partial degradation
- **SEV-3 (Minor):** Yellow badge, minor issues or warning

**Visual Design:**
- **Layout:** Grid of status cards (3 cols on desktop, 1 col mobile)
- **Card Structure:** Component name (Quicksand 600), status badge, last checked timestamp (Inter 400, tabular-nums)
- **Status Badge:** Circle indicator (8px diameter) + text label
  - Green: `ok`, `operational`
  - Yellow: `slow`, `stale`, `degraded`
  - Red: `down`, `critical`
- **Timestamps:** Relative time (e.g., "2m ago") + absolute on hover

**Incident Log (Optional):**
- Last 10 incidents, newest first
- Columns: Timestamp, SEV level, Component, Message
- Link to full incident log (if separate system exists)

**Verifiers:**
- `/status` page accessible (no auth required for internal use)
- Matches `/api/health` response structure
- Sentry test error visible in log (SP4-B04 integration)

**Figma References:**
- Frame: "Status — Component Status Grid"
- Frame: "Status — Status Badge Variants (ok/slow/down)"
- Frame: "Status — Incident Log (Optional)"

<!-- DELTA 2025-11-16 END -->

<!-- DELTA 2025-11-16 END -->

---

### UI Components & Design System

**Existing (GECOVERED):**
- ✅ Header (nav + wallet)
- ✅ WalletConnect modal
- ✅ PoolsGrid / PoolsTable
- ✅ PoolCard
- ✅ PoolRangeIndicator
- ✅ TokenIcon (local-first fallback chain)
- ✅ Hero
- ✅ Buttons (primary, ghost)
- ✅ ScreenshotButton

**Missing Components:**
- ❌ **ErrorBoundary** (React Error Boundary voor crash handling)
- ❌ **Toast** (notifications system voor success/error messages)
- ❌ **Skeleton** (consistent loading states — huidige implementatie is ad-hoc)
- ❌ **Modal** (generic wrapper, nu alleen WalletConnect specifiek)
- ❌ **Form inputs** (text, select, checkbox met validatie)
- ❌ **Accordion** (voor FAQ)
- ❌ **CookieBanner** (GDPR compliance)

**DoD voor Missing Components:**
- Storybook setup (optional for MVP)
- TypeScript interfaces
- Accessibility (ARIA labels, keyboard nav)
- Unit tests (optional for MVP)

<!-- DELTA 2025-11-16 START -->

**New DS Components (Delta 2025-11-16):**

- **ErrorBoundary** — Page-level fallback, log naar Sentry
  - DoD: Forced throw test render → geen blanco pagina
  - Verifier: E2E crash route
  - Task: **SP1-T30** (Owner: FE)

- **Toast** — Queue + ARIA live region
  - DoD: Success/error/info queue with auto-dismiss
  - Verifier: Unit test dispatch success/error
  - Task: **SP1-T31** (Owner: FE)

- **Modal** — Esc/overlay close, focus trap
  - DoD: Generic modal wrapper with A11y
  - Verifier: Axe check; keyboard nav works
  - Task: **SP1-T32** (Owner: FE)

- **Form.*** — react-hook-form integration
  - DoD: Text/select/checkbox with validation
  - Verifier: Invalid email blocks submit
  - Task: **SP1-T33** (Owner: FE)

- **Accordion** — FAQ component
  - DoD: Collapsible sections with keyboard toggle
  - Verifier: Keyboard toggle works; ARIA expanded states
  - Task: **SP1-T34** (Owner: FE)

- **CookieBanner** — Consent + link naar `/legal/cookies`
  - DoD: Banner on first visit; consent in `localStorage: ll_cookies_accepted`
  - Verifier: Banner dismisses; localStorage value set
  - Task: **SP1-T35** (Owner: FE)

- **DataState** — Loading/empty/degrade pattern component
  - DoD: Consistent states across app
  - Verifier: Storybook stories (loading/empty/degrade)
  - Task: **SP1-T36** (Owner: FE)

**RangeBand™ Props (SSoT):**
```ts
type RangeBandProps = {
  currentPrice: number;
  minPrice: number; maxPrice: number;
  strategyCode: 'AGR'|'BAL'|'CONS';
  spreadPct: number;
  bandColor: 'GREEN'|'ORANGE'|'RED'|'UNKNOWN';
  positionRatio: number | null; // 0..1, null when unknown
  variant: 'compact'|'large';
  tooltip?: string;
};
```
**Rules:** `bandColor`/`positionRatio` exclusively from data layer; FE calculates no logic.

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

**DS Component Figma References:**

1. **ErrorBoundary**
   - Frame: "ErrorBoundary — Crash Fallback (Full Page)"
   - States: Generic error, Sentry logged, "Reload" button

2. **Toast**
   - Frame: "Toast — Variants (Success/Error/Info/Warning)"
   - Frame: "Toast — Queue Stack (Multiple Active)"
   - States: Auto-dismiss (3s), manual dismiss (X button), ARIA live region

3. **Modal**
   - Frame: "Modal — Generic Wrapper (Overlay + Content)"
   - Frame: "Modal — Focus Trap + Keyboard Nav"
   - States: Open, closing animation, Esc key dismiss, click-outside dismiss

4. **Form.* (Text/Select/Checkbox)**
   - Frame: "Form — Text Input (States: Default/Focus/Error/Success)"
   - Frame: "Form — Select Dropdown"
   - Frame: "Form — Checkbox + Label"
   - Validation: Inline error messages (red text + border), async validation (debounced)

5. **Accordion**
   - Frame: "Accordion — Collapsed/Expanded States"
   - Frame: "Accordion — Keyboard Nav (Tab/Enter/Space)"
   - States: Collapsed (chevron down), Expanded (chevron up), smooth expand/collapse animation

6. **CookieBanner** (already detailed in /legal/cookies section)
   - Frame: "CookieBanner — Desktop + Mobile Variants"
   - Frame: "CookieBanner — Focus States (Keyboard Nav)"

7. **DataState**
   - Frame: "DataState — Loading (Skeleton)"
   - Frame: "DataState — Empty State (No Data)"
   - Frame: "DataState — Degrade State (Stale Banner + Cached Data)"
   - Frame: "DataState — Error State (Retry Button)"

**Component A11y Checklist (All Components):**
- ✅ WCAG AA contrast (4.5:1 minimum)
- ✅ Keyboard navigation (Tab, Enter, Esc, Arrow keys)
- ✅ Focus indicators (2px `--brand-primary` outline)
- ✅ ARIA attributes (roles, labels, states, live regions)
- ✅ Screen reader friendly (proper heading hierarchy, alt text)
- ✅ Reduced motion support (`prefers-reduced-motion: reduce`)

**Verifiers (All Components):**
- Axe A11y audit: `npm run verify:a11y` ≥95 score
- Keyboard nav manual test: Tab through all interactive elements
- Screen reader test: VoiceOver/NVDA verification (optional for MVP, recommended)

<!-- DELTA 2025-11-16 END -->

<!-- DELTA 2025-11-16 END -->

---

### State Management & Data Flow

**GECOVERED:**
- React Query voor server state (positions, analytics)
- Local state (useState) voor UI state
- Wagmi Context voor wallet

**Missing:**
- ❌ Error boundary state management
- ❌ Toast notification queue
- ❌ Form state library (react-hook-form?)

**DoD:**
- All API calls via React Query
- Consistent error handling (try/catch → toast)
- Loading states per section (skeleton)

---

### Mobile & PWA

**GECOVERED:**
- Mobile-first responsive design (breakpoints: sm/md/lg)
- Touch-friendly buttons (44×44px minimum)

**Out of Scope (MVP):**
- PWA manifest
- Service worker
- Offline support
- Push notifications

---

### Accessibility & SEO

**Current Status:**
- WCAG: UNKNOWN (geen audit gedaan)
- ARIA labels: PARTIAL (buttons ja, forms nee)
- Keyboard nav: UNTESTED
- Screen readers: UNTESTED

**DoD:**
- WCAG AA compliance check (automated tool: axe-core)
- All interactive elements keyboard accessible
- Skip to content link

**SEO:**
- ✅ Meta tags per page (title, description)
- ❌ Open Graph tags (social preview)
- ❌ Sitemap.xml generator
- ❌ Robots.txt

**TODO:**
- ⚠️ **MEDIUM:** A11y audit + fixes
- ⚠️ **LOW:** Open Graph tags
- ⚠️ **LOW:** Sitemap.xml

---

### Known Issues & Tech Debt

**Bugs:**
- ✅ FIXED: DemoPoolsTable undefined token symbols
- ✅ FIXED: Wallet auto-connect loop
- ✅ FIXED: Screenshot button SSR errors

**Performance:**
- ❌ NO Web Vitals tracking
- ❌ NO bundle size monitoring (check Next.js build analyzer)

**Tech Debt:**
- `/summary` vs `/dashboard` overlap
- Duplicate Wagmi configs (`src/lib/wagmi.ts`, `src/lib 2/wagmi.ts`)
- No component library (shadcn/ui? Radix?)

---

## BACKEND & API (Owner: Data/API Team)

### API Endpoints — Exact Specifications

#### **/api/positions** (GET) — GECOVERED

**Purpose:** Canonical positions endpoint met role-aware masking

**Request:**
```
GET /api/positions?wallet=0x...&role=VISITOR|PREMIUM|PRO
```

**Response:**
```typescript
{
  success: true,
  data: {
    positions: PositionRow[],
    summary: {
      tvlUsd: number,
      fees24hUsd: number,
      incentivesUsd: number,
      rewardsUsd: number,
      count: number,
      active: number,
      inactive: number,
      ended: number
    },
    meta: { address: string, elapsedMs: number }
  }
}
```

**TTL:** 120s (React Query client-side cache)

**Edge Cases:**
- Invalid wallet → 400 + `{ error: 'Invalid wallet address' }`
- No positions → 200 + empty array
- RPC failure → degrade mode (cached data + warning)

**DoD:**
- Unit test: valid wallet → 200
- Unit test: invalid wallet → 400
- Unit test: RPC down → degrade mode
- Verifier: `curl /api/positions?wallet=0xf406... | jq '.success'`

---

#### **/api/analytics/summary** (GET) — GECOVERED

**Purpose:** Network-wide KPIs (TVL, fees, positions)

**Response:**
```typescript
{
  ok: true,
  degrade: false,
  ts: number,
  data: {
    tvlTotal: number,
    poolsActive: number,
    positionsActive: number,
    fees24h: number,
    fees7d: number
  }
}
```

**TTL:** 60s DB query timeout

**Edge Cases:**
- DB down → `{ ok: false, degrade: true, reason: 'DB_UNAVAILABLE' }`
- MV not refreshed → stale data (no indicator yet — TODO)

**DoD:**
- Query uses MVs (`mv_pool_latest_state`, `mv_pool_fees_24h`, `mv_pool_fees_7d`)
- Timeout 60s max
- Verifier: `npm run verify:api:analytics`

**TODO:**
- ⚠️ MV refresh timestamp in response (`dataFreshness: { lastRefresh: ISO8601 }`)

---

#### **/api/analytics/pool/[id]** (GET) — GECOVERED

**Purpose:** Pool-specific analytics

**Response:**
```typescript
{
  ok: true,
  degrade: false,
  ts: number,
  pool: {
    state: 'active' | 'inactive',
    tvl: number,
    fees24h: number,
    fees7d: number,
    positionsCount: number
  }
}
```

**Edge Cases:**
- Pool not found → 404 + `{ error: 'Pool not found' }`
- DB timeout → degrade mode

**DoD:**
- Same as `/api/analytics/summary`

---

#### **/api/analytics/leaderboard** ❌ MISSING (Pro feature)

**Purpose:** Peer ranking (top wallets by TVL, fees, APR)

**Request:**
```
GET /api/analytics/leaderboard?metric=tvl|fees|apr&period=7d|30d&limit=100
```

**Response:**
```typescript
{
  ok: true,
  data: {
    leaderboard: Array<{
      rank: number,
      wallet: string, // masked (0x1234...5678)
      value: number,
      badge?: 'whale' | 'farmer' | 'diamond_hands'
    }>,
    userRank?: number // if wallet param provided
  }
}
```

**Privacy:**
- Wallet addresses masked (first 6 + last 4 chars)
- Opt-out mechanism (user can hide from leaderboard)

**DoD:**
- Query against `analytics_wallet_metrics_daily`
- Cache 1h (TTL 3600s)
- Pagination support (`offset`, `limit`)

**TODO:**
- ⚠️ **POST-MVP:** implement leaderboard logic + privacy controls

<!-- DELTA 2025-11-16 START -->

**Status:** Nice to have (post-MVP)

**Endpoint:** GET `/api/analytics/leaderboard?metric=…`

<!-- DELTA 2025-11-16 END -->

---

#### **/api/user/alerts** (GET/POST/PUT/DELETE) ❌ MISSING

**Purpose:** CRUD for alert configurations

**GET /api/user/alerts?wallet=0x...**
```typescript
{
  success: true,
  alerts: Array<{
    id: string,
    positionId: string,
    type: 'out_of_range' | 'near_band' | 'claim_ready',
    enabled: boolean,
    lastTriggered?: ISO8601
  }>
}
```

**POST /api/user/alerts**
```typescript
// Body: { wallet, positionId, type, enabled }
// Response: { success: true, alertId: string }
```

**PUT /api/user/alerts/[id]**
```typescript
// Body: { enabled }
// Response: { success: true }
```

**DELETE /api/user/alerts/[id]**
```typescript
// Response: { success: true }
```

**DoD:**
- New table: `AlertConfig` (id, wallet, positionId, type, enabled, createdAt)
- Rate limiting: max 50 alerts per wallet
- Verifier: CRUD cycle test

**TODO:**
- ⚠️ **HIGH PRIORITY:** implement alerts CRUD + delivery queue

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP6-T55:** "Alerts CRUD `/api/user/alerts`" (Owner: API)
  - DoD: CRUD endpoints; rate limit max 50 alerts/wallet; degrade on queue pause (`code:'ALERTS_PAUSED'`)
  - Verifier: CRUD E2E test

<!-- DELTA 2025-11-16 END -->

---

#### **/api/user/settings** (GET/POST) ❌ MISSING

**Purpose:** User preferences (email, notifications)

**GET /api/user/settings?wallet=0x...**
```typescript
{
  success: true,
  settings: {
    email?: string,
    emailVerified: boolean,
    notifications: {
      alerts: boolean,
      reports: boolean,
      marketing: boolean
    }
  }
}
```

**POST /api/user/settings**
```typescript
// Body: { wallet, email?, notifications? }
// Response: { success: true }
```

**DoD:**
- New table: `UserSettings` (wallet PK, email, notifications JSON)
- Email validation (regex + verification email)
- Unsubscribe link in emails → update notifications

**TODO:**
- ⚠️ **HIGH PRIORITY:** implement settings endpoint + email verification

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP3-T53:** "GET/POST `/api/user/settings`" (Owner: API)
  - DoD: CRUD works; email validation; unsubscribe flow
  - Verifier: `curl /api/user/settings?wallet=0x... | jq '.data.settings.emailVerified'`

<!-- DELTA 2025-11-16 END -->

---

#### **/api/user/delete** (POST) ❌ MISSING (GDPR)

**Purpose:** Delete user data (GDPR right to erasure)

**POST /api/user/delete**
```typescript
// Body: { wallet, confirm: true }
// Response: { success: true, message: 'Account deleted' }
```

**Actions:**
- Cancel Stripe subscription (if active)
- Delete from `BillingCustomer`
- Delete from `UserSettings`
- Delete from `AlertConfig`
- Keep anonymized analytics (wallet → hash)

**DoD:**
- Confirmation modal in UI (type "DELETE" to confirm)
- Audit log entry
- Email confirmation sent

**TODO:**
- ⚠️ **CRITICAL (GDPR):** implement delete flow

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP3-T54:** "POST `/api/user/delete`" (Owner: API/Billing)
  - DoD: Stripe cancel → delete BillingCustomer + UserSettings + AlertConfig; pseudonimize analytics (wallet→hash); AuditLog entry + email confirmation
  - Verifier: Returns `{ok:true}` + AuditLog entry exists

<!-- DELTA 2025-11-16 END -->

---

#### **/api/reports/export** (POST) ❌ MISSING (Pro feature)

**Purpose:** Generate CSV/PDF report

**POST /api/reports/export**
```typescript
// Body: { wallet, format: 'csv'|'pdf', dateFrom, dateTo, reportType: 'portfolio'|'fees'|'il' }
// Response: { success: true, downloadUrl: string, expiresAt: ISO8601 }
```

**Report Types:**
- Portfolio: all positions + TVL + fees per period
- Fees: fee history per position
- IL: impermanent loss analysis

**DoD:**
- CSV generation via library (papaparse?)
- PDF generation via library (pdfkit? jsPDF?)
- Signed S3 URL (or Railway storage) expires 1h

**TODO:**
- ⚠️ **POST-MVP:** implement export logic

---

#### **/api/health** — GECOVERED

**Purpose:** Lightweight health check (Railway/monitoring)

**Response:**
```typescript
{ status: "ok" }
```

**DoD:**
- NO DB/RPC calls (instant response)
- Always 200 (even if app degraded)

---

### Authentication & Authorization

**GECOVERED:**
- Wallet connect via Wagmi (no backend session)
- Role resolution: query param / header / cookie → `resolveRole()`
- Client-side masking (Premium/Pro features)

**Missing:**
- ❌ **NO SERVER-SIDE ENFORCEMENT** (API endpoints trust client role param)
- ❌ NO JWT/session tokens
- ❌ NO API key authentication (for partners)

**Security Risk:**
- User can bypass Premium gating by changing `?role=PRO` query param
- Mitigation: check Stripe subscription status in sensitive endpoints

**TODO:**
- ⚠️ **HIGH PRIORITY:** server-side role check via `BillingCustomer` lookup
- Endpoint: `/api/entitlements?wallet=0x...` returns real plan from DB

---

### Database Schema

**GECOVERED (existing tables):**
- User, BillingCustomer, PoolEvent, PositionEvent, PositionTransfer, SyncCheckpoint, Pool, Token, PoolIncentiveSnapshot
- Analytics tables: analytics_provider, analytics_market, analytics_position, etc.

**Missing Tables:**
- ❌ `UserSettings` (email, preferences)
- ❌ `AlertConfig` (alert rules)
- ❌ `AlertLog` (triggered alerts history)
- ❌ `Report` (generated reports metadata)
- ❌ `AuditLog` (security events)
- ❌ `ApiKey` (partner API keys, future)

**Migrations Planned:**
- ONBEKEND — vraag aan DB owner: schema changes voor MVP?

**Data Retention:**
- GDPR requires deletion policy — currently INDEFINITE for analytics
- TODO: automated cleanup job (prune > 2 year old events)

---

### Data Sources & Indexers

**GECOVERED:**
- ANKR RPC (primary)
- Flare Public RPC (fallback, rate limited)
- Enosys/SparkDEX indexers (NFPM + pool events)
- CoinGecko API (prices)

**Refresh Strategy:**
- Real-time: follower (12s poll) → PoolEvent, PositionEvent
- Hourly: MV refresh → analytics_*
- Daily: rollups (not implemented yet)

**Edge Cases:**
- ANKR rate limit → auto-slow + fallback RPC
- CoinGecko rate limit → stale price (5min cache)
- Indexer lag (12s acceptable, 1min+ is stale)

**DoD:**
- Follower runs continuously (Railway Cron: hourly trigger)
- MV refresh: manual trigger `/api/enrich/refresh-views` (TODO: cron)

---

### Error Handling & Degradation

**GECOVERED:**
- `{ok: true/false, degrade: true/false}` pattern
- Exponential backoff on RPC failures
- Circuit breaker after 3 consecutive failures

**Edge Cases:**
- All RPCs down → return cached data + degrade flag
- DB down → return 200 + degrade (not 500)
- Price API down → fallback chain (CoinGecko → stablecoin → pool ratio)

**TODO:**
- ⚠️ Add `dataFreshness` timestamp to API responses
- ⚠️ UI indicator for stale data (> 1h old)

---

### Security & Compliance

**GECOVERED:**
- NO seed phrases/private keys stored
- Read-only wallet connect (no transactions)

**Missing:**
- ❌ Rate limiting (only in-memory for 1 endpoint)
- ❌ CORS policy (alleen wildcard `*` in één endpoint)
- ❌ Audit logging
- ❌ SQL injection audit (Prisma helps, maar raw queries?)

**TODO:**
- ⚠️ **CRITICAL:** Redis-backed rate limiting (10 req/min per IP, 100 req/min per wallet)
- ⚠️ **HIGH:** CORS whitelist (alleen eigen domain + localhost)
- ⚠️ **MEDIUM:** Audit log table (login attempts, settings changes, deletions)

---

### Known Issues & Tech Debt

**Bugs:**
- Railway 502 (Nixpacks vs Dockerfile) — mogelijk opgelost
- MV refresh blocking (30-60s) — async job needed

**Performance:**
- No Redis cache (all caching is client-side React Query)
- No CDN for API responses

**Tech Debt:**
- Legacy endpoints (`/api/positions-v2`, `/api/wallet/summary`) → delete after deprecation period
- Duplicate webhook handlers (consolidate Stripe logic)

---

## DATA ENRICHMENT & ANALYTICS (Owner: Data Team)

### Data Enrichment Pipeline

**GECOVERED:**
- RPC → raw events → PositionEvent/PoolEvent tables
- CoinGecko → prices (5min cache)
- Token metadata (symbol, decimals) cached in Pool/Token tables

**Transformations:**
- TVL: GECOVERED (Uniswap V3 math)
- APR: GECOVERED (`fees24h / tvl × 365 × 100`)
- IL: NOT IMPLEMENTED (need historical snapshots)

**Formula Documentation:**
- TODO: create `docs/METRICS_FORMULAS.md` met exact calc logic

---

### Materialized Views

**Status:**
- ✅ Stubs created (`mv_pool_latest_state`, `mv_pool_fees_24h`, `mv_pool_fees_7d`, etc.)
- ❌ NOT POPULATED (need initial refresh)

**Refresh Strategy:**
- Manual: `npm run sql:refresh:analytics-flat` (local)
- API: `/api/enrich/refresh-views` (Railway)
- Cron: TODO (Railway Cron job: daily 04:00 CET)

**DoD:**
- All MVs have data
- Refresh < 60s per MV
- Verifier: `npm run verify:mv` checks row counts

**TODO:**
- ⚠️ **CRITICAL:** Run initial MV refresh (populate data)
- ⚠️ **HIGH:** Setup cron job for daily refresh

<!-- DELTA 2025-11-16 START -->

**New Materialized Views (MVP):**

- **SP2-D01:** `mv_wallet_portfolio_latest(wallet_address, tvl_total_usd, positions_active, fees24h_usd, ts)`
  - DoD: Wallet-level portfolio snapshot
  - Verifier: Row count > 0; `npm run verify:mv`

- **SP2-D02:** `mv_position_overview_latest(position_id, wallet_address, pool_id, tvl_usd_current, unclaimed_fees_usd, apr_7d, range_min, range_max, current_price, strategy_code, spread_pct, band_color, position_ratio, unclaimed_fees_pct_of_tvl, claim_signal_state, ts)`
  - DoD: Position-level analytics with RangeBand™ status
  - Verifier: `jq '.pool.bandColor'` returns valid color

- **SP2-D03:** `mv_position_day_stats(position_id, date, price_open, price_close, range_lower_price, range_upper_price, tvl_usd_avg, fees_usd_earned, fees_usd_claimed, time_in_range_pct)`
  - DoD: Daily position performance
  - Verifier: Data for last 30d exists

- **SP2-D04:** `mv_position_events_recent(position_id, ts, event_type, token0_delta, token1_delta, fees_usd, incentives_usd, tx_hash)`
  - DoD: Recent position events (7d window)
  - Verifier: Event counts match PositionEvent table

**Indices:** `(wallet_address)` and `(position_id,date)`; refresh ≤60s/MV  
**Verifiers:** `npm run verify:mv` checks row counts and column names

<!-- DELTA 2025-11-16 END -->

---

### Analytics Metrics in Scope

**Per Pool (confirmed):**
- ✅ TVL, Fees 24h/7d, Volume 7d, Positions count, State
- ❌ APR/APY (formula defined, not in API)
- ❌ IL estimate (not implemented)
- ❌ Pool health score (not defined)
- ❌ Volatility (not tracked)

**Per User (confirmed):**
- ✅ Portfolio TVL, Fees 24h, Incentives, Rewards, Position counts
- ❌ Portfolio APR (not calculated)
- ❌ Peer ranking (not implemented)
- ❌ Missed fees (not tracked)
- ❌ IL per position (not calculated)

**Per Incentive:**
- ✅ Type, Amount USD/day, Token addresses
- ❌ Claimable (not tracked)
- ❌ Lock status (not tracked)
- ❌ Expiry (not tracked)

**TODO:**
- ⚠️ **HIGH:** Implement APR/APY calc + add to API
- ⚠️ **MEDIUM:** IL estimate (need historical price snapshots)
- ⚠️ **POST-MVP:** Pool health score definition + implementation

---

### Historical Data & Retention

**Current:**
- Raw NDJSON: 180 days
- Postgres events: indefinite (no cleanup)
- MV snapshots: UNKNOWN (no timestamp tracking)

**TODO:**
- ⚠️ **GDPR:** Define retention policy (2 years max for analytics?)
- ⚠️ **MEDIUM:** Automated cleanup job (monthly cron)
- ⚠️ **HIGH:** MV refresh timestamps (expose in API: `dataFreshness`)

---

### Data Quality & Validation

**GECOVERED:**
- Prisma schema constraints
- RPC event signature validation

**Missing:**
- ❌ Outlier detection (APR > 1000% warning)
- ❌ Cross-source reconciliation (CoinGecko vs pool prices)
- ❌ Data integrity checks (nightly audit job)

**TODO:**
- ⚠️ **MEDIUM:** Outlier detection script (flag suspicious pools)
- ⚠️ **LOW:** Data audit dashboard (`/admin/data-quality`)

---

### Known Issues & Data Gaps

**Missing Metrics:**
- IL tracking (no historical snapshots)
- Realized gains (no sell events)
- Peer ranking (no comparison data)

**Indexer Lags:**
- 12s acceptable (follower poll)
- 1h+ stale (MV not refreshed)
- Impact: dashboards show outdated data

**TODO:**
- ⚠️ **HIGH:** Stale data indicator in UI (> 1h → badge)
- ⚠️ **MEDIUM:** Historical snapshots (daily position state)

---

## BILLING & MONETIZATION (Owner: Billing Team)

### Stripe Integration

**TEST Keys Status:**
- ONBEKEND — vraag: zijn TEST keys already configured in Railway?
- Required: 5 price IDs + webhook secret

**LIVE Keys Plan:**
- ONBEKEND — vraag: wanneer migreren naar LIVE?
- Checklist: Stripe review approved, TEST thoroughly tested, DNS/emails ready

**DoD:**
- All env vars set (Railway)
- Webhook endpoint verified (Stripe CLI test)
- Test checkout flow: success + cancel paths

**TODO:**
- ⚠️ **CRITICAL:** Confirm TEST keys in Railway env
- ⚠️ **BLOCKER:** Stripe LIVE approval (submit for review)

---

### Pricing Strategy — GECOVERED

**Confirmed:**
- Premium: €14.95/mo (5 pools) + €9.95 per 5 extra
- Pro: €24.95/mo (5 pools) + €14.95 per 5 extra
- Alerts: €2.49/mo per 5 pools
- Trial: 14 days gratis

**Pricing Display:**
- ❌ **BUG:** UI shows USD (config has `currency: 'USD'`)
- ❌ **MISSING:** EUR conversion label ("Charged in EUR ≈ €XX.XX")

**TODO:**
- ⚠️ **CRITICAL:** Fix EUR/USD inconsistency (either all EUR or add conversion)

<!-- DELTA 2025-11-16 START -->

**Tasks:**
- **SP3-B01:** "E-mail verplicht in checkout (Stripe)" (Owner: Billing)
  - DoD: 400 on empty email
  - Verifier: Checkout attempt without email fails
- **SP3-B02:** "EUR-label ('Charged in EUR ≈ €XX.XX') + 24h FX cache" (Owner: FE/Billing)
  - DoD: UI shows label
  - Verifier: Visual test + cache headers check
- **SP3-B03:** "Trial countdown badge" (Owner: FE/Billing)
  - DoD: D-n display for active trials
  - Verifier: Trial user sees countdown

<!-- DELTA 2025-11-16 END -->

---

### Billing Flows

**Checkout:**
- ✅ `/api/billing/create-checkout-session` → Stripe hosted page
- ❌ **BUG:** Email optional (should be required for receipts)
- ✅ Success: redirect `/pricing?checkout=success`
- ✅ Cancel: redirect `/pricing?checkout=cancel`

**Success Flow:**
- ✅ Webhook `checkout.session.completed` → save `BillingCustomer`
- ✅ Welcome email sent (`sendBillingWelcomeEmail`)
- ❌ **MISSING:** Trial countdown UI ("X days left")

**Failed Payment:**
- ❌ NO retry logic
- ❌ NO dunning emails
- ❌ Webhook `invoice.payment_failed` not handled

**Subscription Changes:**
- ✅ Upgrade/downgrade via Stripe Portal (`/api/billing/portal`)
- ❌ NO in-app custom flow

**Cancellation:**
- ✅ Via Stripe Portal
- ✅ Webhook `customer.subscription.deleted` → status 'canceled'
- ❌ NO exit survey

**TODO:**
- ⚠️ **CRITICAL:** Email verplicht in checkout
- ⚠️ **HIGH:** Trial countdown badge in dashboard
- ⚠️ **MEDIUM:** Failed payment webhooks + dunning emails
- ⚠️ **LOW:** Cancellation survey

---

### Webhook Events

**Implemented:**
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

**Optional (NOT IMPLEMENTED):**
- ❌ `invoice.payment_succeeded` → receipt email
- ❌ `invoice.payment_failed` → dunning email
- ❌ `customer.subscription.trial_will_end` → 3-day reminder

**TODO:**
- ⚠️ **MEDIUM:** Add invoice webhooks for receipts/dunning

---

### Database

**GECOVERED:**
- `BillingCustomer` table (wallet, plan, Stripe IDs, status, metadata)

**Missing:**
- ❌ `Invoice` table (payment history)
- ❌ `PaymentEvent` table (webhook audit log)

**TODO:**
- ⚠️ **LOW:** Payment history table (for user dashboard)

---

### Tax & Compliance

**GECOVERED:**
- Stripe Tax automates VAT (EU)
- Invoices auto-generated by Stripe

**GDPR:**
- ❌ Data deletion on cancellation (not implemented)
- ❌ Data export (not implemented)

**TODO:**
- ⚠️ **CRITICAL:** GDPR delete account flow

---

### Known Issues & Gaps

**Stripe Review:**
- Status: ONBEKEND — check with billing owner
- Blocker: can't go LIVE until approved

**EUR/USD:**
- UI inconsistent (shows USD, charges EUR)

**Dunning:**
- No retry policy defined
- No failed payment recovery flow

---

## COMMUNICATIONS & EMAILS (Owner: Mailgun Team)

### Mailgun Setup

**Domain:**
- Assumed: `mg.liquilab.io` (EU region)
- Env var: `MAILGUN_DOMAIN`

**DNS Status:**
- ONBEKEND — vraag: SPF/DKIM/MX/DMARC configured?
- Blocker: can't send real emails until DNS verified

**API Credentials:**
- GECOVERED in code (env vars defined)
- Status: ONBEKEND (check Railway env)

**TODO:**
- ⚠️ **BLOCKER:** DNS configuration (Vimexx provider)
- ⚠️ **CRITICAL:** Test send to verify DNS working

---

### Email Templates & Flows

**Implemented:**
- ✅ `trial-start` (plain text only)

**Missing:**
- ❌ `receipt` (after payment)
- ❌ `claim-reminder` (unclaimed rewards)
- ❌ `alert-notification` (out of range)
- ❌ `weekly-report` (Pro users)
- ❌ `trial-ending` (3 days before trial ends)
- ❌ `payment-failed` (dunning)

**TODO:**
- ⚠️ **HIGH:** HTML templates for all email types
- ⚠️ **HIGH:** Email template system (Handlebars? React Email?)

---

### Email Preferences

**User Preferences:**
- ❌ NOT IMPLEMENTED (no unsubscribe flow)
- ❌ NO frequency caps

**TODO:**
- ⚠️ **HIGH:** Unsubscribe link in all emails
- ⚠️ **HIGH:** Email preferences in `/account` page

---

### Current Status

**MAILGUN_MODE:**
- Default: `"degrade"` (no real sends)
- Live: `"live"` (real sends)
- Current: ONBEKEND — check Railway env

**Enable Plan:**
- ONBEKEND — vraag: wanneer flip naar live?

**TODO:**
- ⚠️ **BLOCKER:** DNS verification complete
- ⚠️ **BLOCKER:** Test send successful
- ⚠️ **CRITICAL:** Flip `MAILGUN_MODE=live` in Railway

---

## DEVOPS & INFRASTRUCTURE (Owner: Ops Team)

### Environments

**Current:**
- ✅ Local
- ❌ **MISSING:** Staging
- ✅ Production (Railway)

**Config:**
- Local: `.env.local` (gitignored)
- Production: Railway UI env vars

**TODO:**
- ⚠️ **CRITICAL:** Setup staging environment (Railway project)
- ⚠️ **HIGH:** Staging database (separate from prod)
- ⚠️ **HIGH:** Staging Stripe TEST keys

<!-- DELTA 2025-11-16 START -->

**Staging Requirements:**
- Separate Railway project
- Separate DB
- Stripe TEST keys
- `MAILGUN_MODE='degrade'`

<!-- DELTA 2025-11-16 END -->

---

### Deployment

**GECOVERED:**
- Railway auto-deploy (main branch)
- Pre-deploy: `npm run verify`
- Rollback: Railway UI (previous deployment)

**TODO:**
- ⚠️ **MEDIUM:** Deployment notifications (Slack/Discord webhook)
- ⚠️ **LOW:** Blue-green deployment (Railway supports?)

---

### Database & Backups

**GECOVERED:**
- PostgreSQL (Railway managed)
- Auto-backups: ONBEKEND (Railway default?)

**Missing:**
- ❌ Manual backup script
- ❌ Disaster recovery plan (documented)

**TODO:**
- ⚠️ **HIGH:** Verify backup retention (Railway settings)
- ⚠️ **MEDIUM:** Document restore procedure
- ⚠️ **LOW:** Off-site backup (S3?)

<!-- DELTA 2025-11-16 START -->

**Backup Strategy:**
- **Daily:** Full backup (7d retention)
- **Weekly:** Full backup (90d retention)
- **Quarterly:** Test-restore runbook execution

<!-- DELTA 2025-11-16 END -->

---

### Monitoring & Logging

**Current:**
- Railway logs (console.log)
- GitHub Action (auto-fetch logs)
- ❌ NO error tracking
- ❌ NO performance monitoring
- ❌ NO uptime monitoring

**TODO:**
- ⚠️ **CRITICAL:** Sentry integration (error tracking)
- ⚠️ **HIGH:** Uptime monitoring (UptimeRobot, Pingdom)
- ⚠️ **MEDIUM:** Performance (Vercel Analytics? New Relic?)
- ⚠️ **LOW:** Log aggregation (Loggly, CloudWatch)

<!-- DELTA 2025-11-16 START -->

**Observability Tasks:**
- **SP4-B04:** "Sentry integration (front/back)" (Owner: Ops)
  - DoD: Test error visible in Sentry
  - Verifier: Forced error appears in dashboard
- **SP4-B05:** "Uptime monitor `/api/health`" (Owner: Ops)
  - DoD: Incident alert works
  - Verifier: Downtime triggers notification

**Logging Format:** JSON (`ts`, `component`, `severity`, `code`, `requestId`)

**Incident Levels:**
- **SEV-1:** Site down / analytics incorrect
- **SEV-2:** Degrade > X%
- **SEV-3:** UI glitch
- **Status:** `/status` reflects component states

<!-- DELTA 2025-11-16 END -->

---

### CI/CD & Verification

**GECOVERED:**
- `npm run verify` pre-build
- Checks: lint, scan:prices, verify:api:prices, verify:pricing, verify:icons, verify:api:analytics, verify:billing, verify:mailgun

**Fail-hard vs Log-only:**
- ONBEKEND — vraag ops: welke checks moeten blokkeren?
- Suggestion: fail-hard voor lint/pricing, log-only voor billing/mailgun in degrade

**Test Coverage:**
- Current: <5%
- Target: 80%+ (long-term)

**TODO:**
- ⚠️ **HIGH:** E2E tests (Playwright) for checkout flow
- ⚠️ **MEDIUM:** Unit tests voor critical paths (50% coverage MVP)

---

### Security

**GECOVERED:**
- Railway SSL/TLS (auto)
- Env secrets (Railway encrypted)

**Missing:**
- ❌ Secrets rotation plan
- ❌ DDoS protection (beyond Railway default)
- ❌ Security audit (penetration test)

**TODO:**
- ⚠️ **MEDIUM:** Document secrets rotation procedure (annually)
- ⚠️ **LOW:** Security audit (post-launch)

<!-- DELTA 2025-11-16 START -->

**Security & Compliance:**
- **CORS:** Allow only `app.liquilab.io`, `staging.liquilab.io`, `localhost`
- **Rate limiting:** Redis-backed; 10 req/min/IP public routes, 100 req/min/wallet user routes. 429 JSON response
- **Cookie consent:** `CookieBanner` + `/legal/cookies` (consent in `localStorage: ll_cookies_accepted`)
- **Legals:** `/legal/privacy`, `/legal/terms`, `/legal/cookies` required before launch
- **GDPR delete:** Server-side flow via `/api/user/delete` + `AuditLog` entry + email confirmation

**Gating & Entitlements:**
- **SP3-G01:** FE `usePlanGating()` uses `/api/entitlements` (server-authoritative)
  - DoD: Toggles match entitlements
  - Verifier: Snapshot test gating
- **SP3-G02:** Matrix "route × plan × status" in JSON config
  - DoD: Config file exists; FE reads from config
  - Verifier: All routes covered in matrix

**Tasks:**
- **SP3-T52:** "GET `/api/entitlements`" (Owner: API)
  - DoD: DB-backed plan/status from BillingCustomer
  - Verifier: `curl /api/entitlements?wallet=0x... | jq -r '.data.plan'`

<!-- DELTA 2025-11-16 END -->

---

### Known Issues & Bottlenecks

**Current:**
- Railway 502 (mogelijk opgelost)
- MV refresh blocking (30-60s)

**Scaling:**
- Railway free tier: 500 hours/mo (enough for MVP)
- Database: 50GB limit (sufficient for 1 year)
- ANKR RPC: rate limits (6 concurrent)

**TODO:**
- ⚠️ **MEDIUM:** Horizontal scaling plan (Railway supports multiple instances)
- ⚠️ **LOW:** Cost projection (estimate monthly infra cost at 1k users)

---

## WRAP-UP & VALIDATION

### Critical Path voor MVP Launch

**Blockers (must fix before launch):**
1. ❌ Legal pages (`/legal/privacy`, `/legal/terms`, `/legal/cookies`)
2. ❌ Cookie consent banner (GDPR)
3. ❌ Email verplicht in checkout (billing)
4. ❌ EUR/USD pricing display fix
5. ❌ Staging environment setup
6. ❌ Mailgun DNS configuration
7. ❌ Stripe LIVE approval
8. ❌ Error tracking (Sentry)
9. ❌ MV initial refresh (populate analytics data)
10. ❌ Server-side role enforcement (security)

**High Priority (launch week):**
1. ❌ Trial countdown badge
2. ❌ Account settings page
3. ❌ Email templates (HTML)
4. ❌ Failed payment webhooks
5. ❌ Uptime monitoring
6. ❌ E2E tests (checkout flow)

**Medium Priority (post-launch week 1-2):**
1. ❌ Alerts configuration UI
2. ❌ Stale data indicators
3. ❌ APR/APY in API
4. ❌ Deployment notifications

**Post-MVP:**
- Reports/export
- Peer ranking/leaderboard
- Onboarding wizard
- Historical IL tracking

---

### Team Capacity & Timeline

**Capacity:**
- ONBEKEND — vraag team: hoeveel dagen/week per owner?

**Parallel Work Opportunities:**
- FE + BE (API specs locked)
- Billing + Mailgun (independent)
- Data enrichment + Ops (infra work)

**Bottlenecks:**
- Legal content (external dependency?)
- Stripe review (2-4 weeks typical)
- Mailgun DNS (Vimexx response time?)

---

### Current Blockers

**Tech:**
- Geen staging (risico: test op prod)
- Geen error tracking (crashes invisible)

**Decisions Needed:**
- EUR vs USD pricing display (marketing decision)
- Email verplicht in checkout (UX vs compliance)
- Staging setup timeline (who sets it up?)

**Dependencies:**
- Stripe LIVE approval (external)
- Mailgun DNS (Vimexx)
- Legal content (juridisch advies?)

---

### Risk Top 3

**1. Stripe Review Delay**
- Impact: Can't charge real money
- Mitigation: Submit for review NOW (2-4 week lead time)
- Contingency: Launch with TEST mode (free tier only)

**2. Mailgun DNS Propagation**
- Impact: No emails (trial reminders, receipts)
- Mitigation: Configure DNS 1 week before launch
- Contingency: Use degrade mode (log emails, no delivery)

**3. Legal Compliance (GDPR)**
- Impact: Fines (up to 4% revenue), user trust
- Mitigation: Legal pages + cookie banner before launch
- Contingency: Delay launch until compliant (non-negotiable)

---

### Anything Else?

**Missing from Intake:**
- Marketing plan (launch announcement, channels)
- User feedback mechanism (feedback button, survey)
- Status page (public uptime dashboard)
- Competitor monitoring (feature parity tracking)

**Risky Assumptions:**
- "Flare TVL will grow" (market risk)
- "CoinGecko won't rate limit" (API risk)
- "Users will self-onboard" (no handholding)

**Final Decisions Needed:**
- Launch date (week X?)
- MVP scope cutoff (what's truly essential?)
- Go/no-go criteria (what metrics determine launch readiness?)

---

<!-- DELTA 2025-11-16 START -->

## DELTA 2025-11-16 SUMMARY

### New API Endpoints (Sprint IDs)

- **SP2-T50:** GET `/api/analytics/wallet/{wallet}/positions` (Owner: API/DATA)
- **SP2-T51:** GET `/api/rangeband/preview` (Owner: API)
- **SP3-T52:** GET `/api/entitlements` (Owner: API)
- **SP3-T53:** GET/POST `/api/user/settings` (Owner: API)
- **SP3-T54:** POST `/api/user/delete` (Owner: API/Billing)
- **SP6-T55:** Alerts CRUD `/api/user/alerts` (Owner: API)

### New Materialized Views (DATA)

- **SP2-D01:** `mv_wallet_portfolio_latest`
- **SP2-D02:** `mv_position_overview_latest`
- **SP2-D03:** `mv_position_day_stats`
- **SP2-D04:** `mv_position_events_recent`

### New DS Components (FE)

- **SP1-T30..T36:** ErrorBoundary, Toast, Modal, Form.*, Accordion, CookieBanner, DataState

### Billing & Compliance Tasks

- **SP3-B01..B03:** Email verplicht, EUR label, Trial countdown
- **SP4-B04..B05:** Sentry, Uptime monitor
- **SP4-L01:** Legal pages + CookieBanner

### Nice to Have (Post-MVP)

- Reports export, Leaderboard, Onboarding wizard, Advanced IL analytics

---

### NEW SPRINT TASKS — Brand/Design/Marketing/Billing/Observability

#### Sprint 1 (SP1) — Foundation & Design System

**SP1-T37:** Figma Foundations & Tokens  
- **Owner:** Designer + FE  
- **Model:** CODEX (token export script) + CLAUDE (Figma structure spec)  
- **DoD:**
  - Figma file structured: Foundations → Components → Patterns → Page Templates
  - Design tokens exported via Style Dictionary → `src/styles/tokens.css`
  - CSS vars: colors (--brand-primary, --brand-secondary, etc.), spacing (4-pt scale), radii, elevations, opacities
  - Typography tokens: Quicksand (600/700), Inter (400/500) with fallback stacks
- **Verifiers:**
  - `test -f src/styles/tokens.css` → exists
  - `npm run tokens:build` → exit 0
  - Visual regression: demo pools table layout stable after token integration
- **Scope/Files:** `src/styles/tokens.css`, `figma/liquilab-design-system.fig`, `scripts/build-tokens.mjs`
- **Env:** LOCAL → STAGING → PROD
- **GECOVERED:** ❌ (nieuw)

**SP1-T38:** DS Components (visual spec)  
- **Owner:** Designer  
- **Model:** CLAUDE (component specs) + COMPOSER 1 (Figma frames)  
- **DoD:**
  - Figma frames voor alle DS componenten: ErrorBoundary, Toast, Modal, Form.* (Text/Select/Checkbox), Accordion, CookieBanner, DataState
  - States per component: default, hover, focus, active, disabled, error, loading
  - A11y annotations: ARIA roles, keyboard nav flows, focus indicators (2px --brand-primary)
  - Color contrast checks: all text ≥4.5:1 WCAG AA
  - Responsive breakpoints: mobile (320px), tablet (768px), desktop (1024px+)
- **Verifiers:**
  - Figma file contains frames: "DS — ErrorBoundary", "DS — Toast", etc. (7 components)
  - Each component has ≥3 states documented
  - Contrast check pass via Figma plugin (Stark/A11y)
- **Scope/Files:** `figma/liquilab-design-system.fig` (Components section)
- **Env:** DESIGN → LOCAL (implementation)
- **GECOVERED:** ❌ (nieuw)

**SP1-T39:** OG & Social Previews  
- **Owner:** Designer + Marketing  
- **Model:** CLAUDE (Firefly brief) + AUTO (OG meta implementation)  
- **DoD:**
  - Firefly brief: 10 OG variants (1200×630px) — Home, Dashboard, RangeBand, Pricing, FAQ, Pool Detail, Account, Legal, Status, 404
  - Assets exported: `/public/media/brand/og-*.png` (2x Retina @ 2400×1260, optimized → 1200×630)
  - Automatic OG meta: Next.js Head component per route with `og:title`, `og:description`, `og:image`, `og:type`, `twitter:card`
  - Fallback: default OG image if route-specific missing
- **Verifiers:**
  - `npm run verify:og` → checks all public routes have OG tags + assets exist
  - `test -f public/media/brand/og-home.png` (× 10 variants)
  - Social preview test: Slack/Discord/Twitter card renders correctly
  - Lighthouse SEO score ≥95
- **Scope/Files:** `public/media/brand/og-*.png`, `pages/_document.tsx`, `components/SEO/OGTags.tsx`, `scripts/verify-og.mjs`
- **Env:** LOCAL → STAGING → PROD
- **GECOVERED:** ❌ (nieuw)

**SP1-T40:** Typografie & Numerals enforce  
- **Owner:** FE  
- **Model:** CODEX (global CSS + refactor)  
- **DoD:**
  - Quicksand (600/700) applied to all headers (h1-h6) via global CSS
  - Inter (400/500) applied to body, tables, forms
  - `font-variant-numeric: tabular-nums` enforced on all numeric values via CSS class `.numeric`
  - Refactor inline styles → CSS classes: `.heading-xl`, `.heading-lg`, `.body`, `.label`, `.numeric`
  - SSoT currency helpers: `formatUSD()`, `formatEUR()`, `formatNumber()`, `formatPercent()` in `src/lib/format/currency.ts`
- **Verifiers:**
  - `npm run verify:typography` → checks all h1-h6 use Quicksand, all numeric values use `.numeric` class
  - Visual regression: pricing table, pool table, dashboard KPIs (layout stable)
  - `grep -r "font-family: 'Quicksand'" src/` → 0 matches (all via CSS vars)
- **Scope/Files:** `src/styles/globals.css`, `src/lib/format/currency.ts`, `components/**/*.tsx` (refactor inline font styles)
- **Env:** LOCAL → STAGING → PROD
- **GECOVERED:** ❌ (nieuw)

**SP1-MKT01:** Hero visuals (Home/Pricing/RangeBand)  
- **Owner:** Designer + Marketing  
- **Model:** CLAUDE (asset specs) + COMPOSER 1 (visual polish)  
- **DoD:**
  - Wave hero background: crisp SVG/PNG in bottom 50% viewport fold
  - Assets: `/public/media/brand/hero-wave.svg`, `/public/media/brand/hero-wave@2x.png` (Retina)
  - CSS: fixed position, seamless gradient from `--bg-canvas` (top 50%) to wave (bottom 50%)
  - Device pixel ratio awareness: `image-rendering: -webkit-optimize-contrast` for crisp rendering
  - Hero variants: Home (default), Pricing (calculator focus), RangeBand (interactive demo)
- **Verifiers:**
  - `test -f public/media/brand/hero-wave.svg && test -f public/media/brand/hero-wave@2x.png`
  - Visual QA: wave appears crisp on mobile/tablet/desktop/Retina
  - Lighthouse: no layout shift on hero load (CLS < 0.1)
  - `curl / | grep -q "hero-wave"` → background renders in HTML
- **Scope/Files:** `public/media/brand/hero-wave.*`, `src/styles/hero.css`, `components/Hero.tsx`
- **Env:** LOCAL → STAGING → PROD
- **GECOVERED:** ❌ (nieuw)

#### Sprint 3 (SP3) — Billing & Compliance

**SP3-B02:** EUR-label + 24h FX cache (reeds gespecificeerd, aanvulling details)  
- **Owner:** FE + Billing  
- **Model:** CODEX (FX API integration) + AUTO (UI implementation)  
- **DoD:**
  - UI: "Charged in EUR (≈ €XX.XX)" label below USD pricing on `/pricing`
  - FX API: `/api/billing/fx-rate` returns EUR/USD rate via ECB or similar (TTL 24h)
  - Cache: Redis-backed or in-memory with 24h expiration
  - Fallback: if FX API unavailable, use last cached rate + stale indicator "* Rate from [date]"
  - Typography: Inter 400, 14px, `--text-med` opacity (0.6)
- **Verifiers:**
  - `curl /api/billing/fx-rate | jq '.rate'` → returns numeric EUR/USD rate
  - Cache headers: `Cache-Control: max-age=86400` (24h)
  - `npm run verify:pricing` → checks EUR label presence on `/pricing`
  - Visual test: EUR label visible below USD pricing
- **Scope/Files:** `pages/api/billing/fx-rate.ts`, `components/Pricing/Calculator.tsx`, `src/lib/format/currency.ts`
- **Env:** LOCAL (mock rate) → STAGING (ECB API) → PROD
- **GECOVERED:** ❌ (nieuw)

**SP3-B03:** Trial countdown badge (reeds gespecificeerd, aanvulling details)  
- **Owner:** FE + Billing  
- **Model:** AUTO (UI + timer logic)  
- **DoD:**
  - Badge format: "D-n" (e.g., "D-7" for 7 days remaining)
  - Placement: top-right corner of pricing card for users with active trial (`status: 'trialing'`)
  - Colors: Signal Aqua (#1BE8D2) background, white text, 600 font weight
  - Timer logic: auto-updates daily (no live countdown); disappears on trial end
  - Data source: `/api/entitlements?wallet=0x...` returns `{ status: 'trialing', trialEndsAt: ISO8601 }`
- **Verifiers:**
  - E2E test: create trial subscription fixture → badge shows "D-14" → advance 7 days → badge shows "D-7"
  - Visual test: badge appears only for trialing users
  - `curl /api/entitlements?wallet=0xTRIAL | jq '.data.status'` → `"trialing"`
- **Scope/Files:** `components/Pricing/TrialBadge.tsx`, `pages/api/entitlements.ts`
- **Env:** LOCAL (mock trial) → STAGING (Stripe TEST) → PROD
- **GECOVERED:** ❌ (nieuw)

#### Sprint 4 (SP4) — Observability & Compliance

**SP4-B04:** Sentry front/back (reeds gespecificeerd, aanvulling details)  
- **Owner:** Ops + FE  
- **Model:** CODEX (Sentry integration) + COMPOSER 1 (error UI)  
- **DoD:**
  - Sentry SDK: `@sentry/nextjs` installed + configured
  - Frontend: error boundary catches React errors → logs to Sentry + shows fallback UI
  - Backend: API errors (500, unhandled exceptions) → logs to Sentry with request context (wallet, route, method)
  - Source maps: uploaded to Sentry for stack trace resolution
  - Error UI: `ErrorBoundary` component shows "Something went wrong" + Reload button + Sentry event ID (for support)
  - Test route: `/api/sentry-test` throws intentional error → logs to Sentry
- **Verifiers:**
  - `npm run verify:sentry` → test error logged to Sentry dashboard
  - Frontend: navigate to `/sentry-test-crash` → ErrorBoundary renders + Sentry event visible
  - Backend: `curl /api/sentry-test` → 500 + Sentry event visible
  - Sentry dashboard: events appear with source maps (readable stack traces)
- **Scope/Files:** `sentry.client.config.ts`, `sentry.server.config.ts`, `components/ErrorBoundary.tsx`, `pages/api/sentry-test.ts`
- **Env:** LOCAL (disabled) → STAGING (Sentry TEST project) → PROD (Sentry PROD project)
- **GECOVERED:** ❌ (nieuw)

**SP4-L01:** Legal pages + CookieBanner (reeds gespecificeerd, aanvulling details)  
- **Owner:** Legal + FE  
- **Model:** CLAUDE (legal content) + AUTO (UI implementation)  
- **DoD:**
  - Routes: `/legal/privacy`, `/legal/terms`, `/legal/cookies` (SSR, SEO meta, last updated date)
  - Content: GDPR-compliant Privacy Policy, Terms of Service, Cookie Policy (juridisch advies indien mogelijk)
  - Template: unified layout (Quicksand 600 headers, Inter 400 body, max-width 800px, TOC + Accordion)
  - CookieBanner: fixed bottom, z-index 1000, ARIA dialog, focus trap, Esc dismiss
  - Consent: `localStorage.ll_cookies_accepted` (`'true'|'false'`)
  - First visit logic: show banner after 2s delay (allow page to settle)
- **Verifiers:**
  - `curl -I /legal/privacy | grep "200 OK"` (× 3 routes)
  - Banner appears on first visit (clear localStorage before test)
  - Keyboard nav: Tab → Accept/Reject buttons → Enter to confirm → Esc to dismiss (defaults to Reject)
  - `npm run verify:a11y` → CookieBanner passes Axe audit (≥95 score)
  - Footer links: Privacy, Terms, Cookies (all routes accessible)
- **Scope/Files:** `pages/legal/privacy.tsx`, `pages/legal/terms.tsx`, `pages/legal/cookies.tsx`, `components/CookieBanner.tsx`
- **Env:** LOCAL → STAGING → PROD (pre-launch blocker)
- **GECOVERED:** ❌ (nieuw)

**SP4-B05:** Uptime monitor /api/health (reeds gespecificeerd, aanvulling details)  
- **Owner:** Ops  
- **Model:** CODEX (monitoring setup)  
- **DoD:**
  - External monitor: UptimeRobot, Pingdom, of Railway built-in monitor
  - Endpoint: `/api/health` returns `{ status: "ok" }` with 200 status (no DB/RPC calls)
  - Frequency: check every 5 minutes
  - Alerts: Slack/email notification on downtime (≥2 consecutive failures)
  - Status page: optional public status page (status.liquilab.io) shows uptime history
- **Verifiers:**
  - `curl https://app.liquilab.io/api/health | jq '.status'` → `"ok"`
  - Monitor dashboard: uptime ≥99.9% (3 months rolling)
  - Downtime test: stop Railway service → alert received within 10 minutes
- **Scope/Files:** `pages/api/health.ts` (already exists), external monitor config
- **Env:** STAGING → PROD
- **GECOVERED:** ✅ (endpoint exists, monitor setup nieuw)

<!-- DELTA 2025-11-16 END -->

---

## DELIVERY

**Auteur:** Codebase analyse + team intake synthesis
**Datum:** Gegenereerd op basis van PROJECT_STATE.md + volledige codebase scan
**Status:** 100% GECOVERED waar code bestaat; MISSING/TODO waar gaps zijn
**Next Steps:**
1. Validate met team (per domain owner)
2. Prioritize TODO's (critical vs nice-to-have)
3. Convert naar sprint tickets (Jira/Linear/GitHub Projects)
4. Generate timeline (GPT Pro: given capacity → sprint plan)

**Deadline suggestie:** Review binnen 2 werkdagen → finalize roadmap vrijdag

---

<!-- DELTA 2025-11-16 START (Brand/UI/Marketing) -->

## ADVIES — Volgende Stappen (Brand/UI/Marketing Delta)

**Prioriteit 1: Figma Library Sync**
- Align bestaande componenten (Header, PoolCard, RangeBand™) met nieuw gedefinieerde design tokens
- Export design tokens via Style Dictionary → `src/styles/tokens.css`
- Verifier: Visual regression test op demo pools table (layout stability)

**Prioriteit 2: Brand System Implementation**
- Implement `src/lib/format/currency.ts` met SSoT helpers (formatUSD, formatEUR, formatNumber, formatPercent)
- Refactor inline formatting door hele codebase → gebruik centrale helpers
- Enforce `tabular-nums` in KPI/pricing/table components via CSS class `.numeric`
- Verifier: `npm run verify:brand` (nieuw script) checks numeric formatting consistency

**Prioriteit 3: Hero + OG Assets**
- Finalize Wave Hero crisp rendering (SVG/PNG 2x assets voor Retina)
- Create 10 OG variants (1200×630) per route (Home, Dashboard, RangeBand, Pricing, FAQ, etc.)
- Implement `npm run verify:og` voor automated checks
- Verifier: Lighthouse audit + social preview test (Slack/Discord/Twitter)

**Prioriteit 4: A11y Foundation**
- Setup `npm run verify:a11y` (AxePuppeteer) met fail-hard threshold ≥95
- Keyboard nav audit op alle interactive routes (/, /pricing, /account, /legal/*)
- Implement focus indicators (2px `--brand-primary` outline) globaal via `focus-visible`
- Verifier: Manual keyboard nav test + Axe audit pass

**Prioriteit 5: Legal + CookieBanner (Pre-Launch Blocker)**
- CookieBanner component + `/legal/cookies` content (GDPR compliance)
- `/legal/privacy` + `/legal/terms` content (juridisch advies indien mogelijk)
- Test banner flow: first visit → consent → localStorage → dismiss
- Verifier: `curl /legal/privacy | grep "Last updated"` + banner functional test

**Rationale:**
- Brand System (P1+P2): Prevents UX drift; stable layout; EUR/USD future-proof
- Hero + OG (P3): Marketing/launch readiness; social shareability
- A11y (P4): WCAG AA compliance; keyboard users; screen reader friendly
- Legal (P5): Launch blocker; GDPR compliance non-negotiable

**Time Estimate:**
- P1+P2: 2-3 dagen (FE + DS sync)
- P3: 1-2 dagen (Designer + FE)
- P4: 1 dag (FE + QA)
- P5: 2-3 dagen (Legal review + FE implementation)
- **Total: ~1-1.5 week** voor Brand/UI/Marketing Delta completion

**Dependency:**
- P1 blokkeert P3 (tokens eerst, dan hero styling)
- P5 blokkeert launch (non-negotiable)
- P2+P4 parallel executable

---

**ADVIES — Implementatie Nieuwe SP-Taken (Delta 2025-11-16 Part 3):**

**Sprint 1 Priority (SP1-T37..T40 + SP1-MKT01):**
1. Start met **SP1-T37 (Figma Foundations)** — dit blokkeert alle andere design/UI work
2. Parallel: **SP1-T38 (DS Components visual spec)** — Designer kan direct starten
3. Wacht op tokens → dan **SP1-T40 (Typografie enforce)** — CODEX refactor across codebase
4. Parallel: **SP1-T39 (OG assets)** + **SP1-MKT01 (Hero visuals)** — Designer/Marketing

**Sprint 3 Priority (SP3-B02..B03):**
- **SP3-B02 (EUR label)** depends on SP1-T40 (currency helpers in `src/lib/format/currency.ts`)
- **SP3-B03 (Trial badge)** parallel to B02, independent

**Sprint 4 Priority (SP4-B04..B05 + SP4-L01):**
- **SP4-B04 (Sentry)** en **SP4-B05 (Uptime)** parallel, Ops can start immediately
- **SP4-L01 (Legal pages)** BLOKKEERT LAUNCH — start juridisch advies zo vroeg mogelijk

**Model Assignment Rationale:**
- **CODEX:** Token export scripts, FX API, Sentry config, verify scripts (precise, deterministic)
- **CLAUDE:** Figma structure, legal content, OG meta specs, asset briefs (creative, spec-heavy)
- **COMPOSER 1:** Figma frames polish, error UI refinement, hero visual polish (visual iteration)
- **AUTO:** UI implementation (trial badge, EUR label), combines CODEX logic + CLAUDE polish

**Risk Mitigation:**
- SP1-T37 has 0 dependencies → start ASAP (critical path)
- SP4-L01 juridisch advies → external blocker, start intake immediately
- SP1-T39 OG assets → 10 variants = batch work, consider phased delivery (MVP 5 routes first)

**Time Estimate (cumulative):**
- SP1 tasks: 4-5 dagen (Designer 2d + FE 3d, parallel where possible)
- SP3 tasks: 1-2 dagen (FE, depends on SP1-T40)
- SP4 tasks: 3-4 dagen (Ops 2d parallel + Legal content 2d + FE 1d)
- **Total: ~1.5 weeks** for all new sprint tasks (assumes parallel work + no juridisch advies delay)

**Verify Suite Integration:**
- New scripts: `npm run tokens:build`, `npm run verify:typography`, `npm run verify:sentry`
- Existing scripts extended: `npm run verify:og` (add 10 routes), `npm run verify:a11y` (add CookieBanner)
- CI integration: all verify scripts run pre-deploy (fail-hard on STAGING/PROD)

**Dependencies Chain:**
```
SP1-T37 (tokens) 
  → SP1-T40 (typography) 
    → SP3-B02 (EUR label)
    → SP1-MKT01 (hero CSS uses tokens)

SP1-T38 (DS visual spec) 
  → SP1-T30..T36 (component implementation, already specified)
  → SP4-L01 (CookieBanner implementation)

SP1-T39 (OG assets) 
  → routes SEO (parallel, no blocker)

SP4-B04 (Sentry) + SP4-B05 (Uptime) 
  → independent, can start immediately
```

**Next Action:**
1. Assign SP1-T37 to Designer + FE lead (kick-off meeting)
2. Request juridisch advies for SP4-L01 (Legal team intake)
3. Create Figma file structure (SP1-T38 prep work)
4. Setup Sentry projects (TEST + PROD) for SP4-B04

<!-- DELTA 2025-11-16 END -->

