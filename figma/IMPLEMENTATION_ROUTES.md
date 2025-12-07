# Liquilab — Figma Frames ⇄ React Components Implementation Routes

**Document Purpose:** Mapping between Figma design frames and React component implementations.

**Last Updated:** 2025-11-25  
**Primary Reference:** `/PROJECT_STATE.md` (current implementation state)

---

## 🗺️ Route Mapping

### Portfolio Screens

#### Portfolio – Performance & Analytics (Premium)

**Figma Frame:** `Portfolio – Performance & Analytics (Premium)`

**React Component:**
- `/pages/WalletOverview.tsx`

**Route:** `/wallet-premium` (or `/portfolio`)

**Key Sections:**
- Hero KPI Belt (2 rows, 8 cards)
- Net Yield vs HODL + Range Efficiency
- Unclaimed Fees & Rewards Health
- Active Positions & DEX Exposure
- Concentration & Largest Pools

**Strategy C Features:**
- Explicit time windows (30D, annualized, lifetime)
- Clear denominators (% of your portfolio TVL, % of time)
- Health thresholds visible
- **NO** peer/universe comparisons (Premium-only)

---

#### Portfolio – Performance & Analytics (Pro)

**Figma Frame:** `Portfolio – Performance & Analytics (Pro)`

**React Component:**
- `/pages/WalletOverviewPro.tsx`

**Route:** `/wallet-pro` (or `/portfolio-pro`)

**Additional Pro Sections:**
- Peer & Universe Summary (promotion card)
- Pro Analytics → Peer Comparison (table)
- Pro Analytics → Strategy Distribution (chart)

**Strategy C Pro Features:**
- All Premium clarity features
- **+ Neutral peer/universe comparisons**
- "You | Peers median | Percentile" table structure
- No advice language — descriptive only

---

### Pool Screens

#### Pool Overview

**React Component:**
- `/pages/PoolsOverview.tsx`

**Route:** `/pools`

**Key Sections:**
- KPI Cards (4 metrics)
- Filter Card (search, DEX/strategy filters)
- List/Grid Toggle
- Pools List/Grid View

---

#### Pool Detail (Standard)

**React Component:**
- `/pages/PoolDetailPage.tsx`

**Route:** `/pool/:id`

**Key Sections:**
- Pool header
- Price chart with RangeBand overlay
- Earnings overview (4 KPI cards)
- RangeBand Status
- My Positions table
- Pool activity timeline

---

#### Pool Pro — PoolDetail Pro

**Figma Frame:** `Pool Pro — PoolDetail Pro`

**React Component:**
- `/pages/PoolDetailProPage.tsx`

**Route:** `/pool/:id/pro`

**Key Sections:**
- Global time-range toggle (24h/7D/30D/90D)
- PRO KPI strip (6 cards)
- RangeBand™ Status (Hero variant) with universe snippet
- My Positions with Pro context
- Peer Comparison table
- Pool Universe Snapshot
- Pool Activity

---

#### Pool Universe — Pool Universe View

**Figma Frame:** `Pool Universe — Pool Universe View`

**React Component:**
- `/pages/PoolUniversePage.tsx`

**Route:** `/pool/:id/universe`

**Key Sections:**
- Hero Section (6 KPI tiles)
- DEX & Fee-tier breakdown
- LP Population & Concentration
- RangeBand™ Landscape
- Fee & APR Distribution
- Claim Behaviour & Cash-flow
- Wallet Flows & Notable Moves
- Market Regime & Volatility
- "How This Pool Context Affects Your Position"

**Strategy C Universe Features:**
- All time windows explicit
- All percentages have denominators (% of pool TVL, % of LPs, % of time)
- Universe comparisons neutral (Top X%, above/below median)
- "How This Pool Context" uses descriptive language

---

### Marketing & Info Pages

#### RangeBand Explainer

**React Component:**
- `/pages/RangeBandExplainer.tsx`

**Route:** `/rangeband`

**Key Sections:**
- Hero with RangeBand demo (Hero variant)
- Strategy Cards (Aggressive/Balanced/Conservative)
- How RangeBand™ Works (4 steps)
- Before & After comparison
- Final CTA section

---

#### Pricing Page

**React Component:**
- `/pages/PricingPage.tsx`

**Route:** `/pricing`

**Key Sections:**
- Hero (3 pricing cards)
- Key Differences Strip
- Compare Plans Table
- RangeBand™ Alerts Add-on Card

---

#### Account Page

**React Component:**
- `/pages/AccountPage.tsx`

**Route:** `/account`

**Key Sections:**
- Subscription Section
- Pool Usage Card
- RangeBand™ Alerts Add-on
- Profile Section
- Notification Preferences
- Developer Tools
- Danger Zone

---

## 🧩 Shared Components

**Location:** `/components/`

| Component | File | Used In |
|-----------|------|---------|
| **Navigation** | `Navigation.tsx` | All pages |
| **PoolCard** | `PoolCard.tsx` | PoolsOverview (grid) |
| **PoolTable** | `PoolTable.tsx` | PoolsOverview (list), WalletOverview |
| **Rangeband** | `Rangeband.tsx` | PoolCard, PoolTable, PoolDetail, RangeBand pages |
| **TokenIcon** | `TokenIcon.tsx` | All pool/portfolio screens |
| **RangeBandIcon** | `RangeBandIcon.tsx` | Navigation, AccountPage, PricingPage |

---

**Last Updated:** 2025-11-25  
**Maintained by:** Liquilab Design Team
