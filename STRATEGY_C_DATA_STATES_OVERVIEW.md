# Strategy C Data States Overview

## Purpose

This document provides a master overview of the Strategy C data-state UX implementation for Universe, Pool Pro, and Position Pro pages. It covers component structure, page-by-page breakdown, testing procedures, and routing information.

## Components

### DataStateBanner (`src/components/DataStateBanner.tsx`)

Reusable banner component that displays data state information.

**Props:**
- `state: DataState` — One of `'ok' | 'warming' | 'empty'`
- `context?: 'universe' | 'pool' | 'position'` — Context for customizing banner text (default: `'universe'`)
- `className?: string` — Optional CSS classes
- `children?: React.ReactNode` — Optional additional content

**Behavior:**
- `ok`: Renders `null` (no banner shown)
- `warming`: Displays yellow banner with spinner and text: "{Context} data warming up — some metrics are based on partial history. Full 7-day data will be available once the backfill completes."
- `empty`: Displays centered notice: "Not enough history yet to show {context} analytics..."

**Usage:**
```tsx
<DataStateBanner state={dataState} context="universe" />
```

### DataSourceDisclaimer (`src/components/DataSourceDisclaimer.tsx`)

Small, reusable component that displays FTSO-first pricing disclaimer.

**Props:**
- `className?: string` — Optional CSS classes

**Text:**
"Prices powered by time-series oracle data on Flare; off-chain fallbacks only where no oracle feed exists."

**Usage:**
```tsx
<DataSourceDisclaimer className="mt-4" />
```

### WarmingPlaceholder (`src/components/WarmingPlaceholder.tsx`)

Placeholder component for sections that depend on 7d-MVs or incomplete data.

**Props:**
- `className?: string` — Optional CSS classes
- `title?: string` — Custom title text (default: "Building 7-day history")
- `showSpinner?: boolean` — Whether to show spinner (default: `true`)

**Visuals:**
- Yellow/neutral background with skeleton loaders
- Spinner icon (optional)
- Title text
- Subtitle: "This section will populate once 7-day metrics are available"
- Three skeleton bars of varying widths

**Usage:**
```tsx
<WarmingPlaceholder title="Building LP population data" />
```

## Pages

### Universe Page (`pages/pool/[poolAddress]/universe.tsx`)

**Route:** `/pool/[poolAddress]/universe`

**Data Source:** `/api/analytics/pool/[poolAddress]` (returns `PoolUniverseAnalyticsResponse`)

**Data State Derivation:**
- Located in `deriveDataState()` function (lines ~17-33)
- Maps backend response: `ok: false` → `'empty'` or `'warming'` (based on `degrade` flag)
- `degrade: true` → `'warming'`
- Checks if critical 7d metrics are missing → `'empty'`
- Otherwise → `'ok'`

**Sections with Time-Period Labels:**
- Volume (7D)
- Fees Generated (7D)
- Swaps (7D)
- Range Efficiency (7D)
- Volatility Regime (7D)
- Claim Behavior (7D)

**Sections Using WarmingPlaceholder:**
- LP Population & Concentration (when `dataState === 'warming' || 'empty'`)
- Range Efficiency (when `dataState === 'warming' || 'empty'`)
- Volatility Regime (when `dataState === 'warming' || 'empty' || regime === null`)
- Claim Behavior (when `dataState === 'warming' || 'empty'`)

**DataStateBanner Location:** After header, before KPI tiles (line ~93)

**DataSourceDisclaimer Location:** At bottom of page (line ~239)

### Pool Pro Page (`pages/pool/[tokenId].tsx`)

**Route:** `/pool/[tokenId]`

**Data Source:** `/api/analytics/pool/[id]` (returns `AnalyticsPoolResponse`)

**Data State Derivation:**
- Located inline (line ~89)
- `degrade: true` → `'warming'`
- `!data` → `'empty'`
- Otherwise → `'ok'`

**Sections with Time-Period Labels:**
- Fees Generated (24H)
- Fees Generated (7D)

**DataStateBanner Location:** After header, before metric cards (line ~147)

**DataSourceDisclaimer Location:** At bottom of page (line ~179)

### Position Pro Page (`pages/position/[tokenId]/pro.tsx`)

**Route:** `/position/[tokenId]/pro`

**Data Source:** `/api/analytics/position/[tokenId]` (returns `PositionProAnalyticsResponse` — currently placeholder)

**Data State Derivation:**
- Located in `deriveDataState()` function (lines ~60-80)
- Checks `data.status` field: `'empty'` → `'empty'`, `'degraded'` → `'warming'`
- Checks if critical metrics are missing → `'empty'`
- Checks if 7d/30d metrics are incomplete → `'warming'`
- Otherwise → `'ok'`

**Testing Toggle:**
- Line ~48: `const positionDataState: DataState = 'ok';`
- Change to `'warming'` or `'empty'` to test different states

**Sections with Time-Period Labels:**
- Fees Earned (Lifetime)
- Incentives Earned (Lifetime)
- Lifetime APR (Annualized)
- Range Efficiency (30D)
- Peer Comparison (30D)

**Sections Using WarmingPlaceholder:**
- RangeBand Status (when `dataState === 'empty'`)
- Peer Comparison (when `dataState === 'warming' || 'empty' || metrics.length === 0`)

**DataStateBanner Location:** After header, before disclaimer (line ~108)

**DataSourceDisclaimer Location:** After banner, before position header stats (line ~110)

## Data State Mapping

### Backend → UI Mapping

| Backend Status | UI DataState | Condition |
|----------------|--------------|-----------|
| `ok: true, degrade: false` | `'ok'` | All data present |
| `ok: true, degrade: true` | `'warming'` | Partial data |
| `ok: false, degrade: true` | `'warming'` | Database unavailable |
| `ok: false, degrade: false` | `'empty'` | No data found |
| Critical metrics missing | `'empty'` | TVL/volume/fees all null |
| 7d/30d metrics incomplete | `'warming'` | Some sections unavailable |

## Routes & Navigation

### Universe Page
- **Path:** `/pool/[poolAddress]/universe`
- **Example:** `/pool/0x3c2a7b76795e58829faaa034486d417dd0155162/universe`
- **Link from Pool Pro:** Add "View Universe" button linking to this route

### Pool Pro Page
- **Path:** `/pool/[tokenId]`
- **Example:** `/pool/0x3c2a7b76795e58829faaa034486d417dd0155162`
- **Link from Universe:** Add "Back to Pool Detail" link

### Position Pro Page
- **Path:** `/position/[tokenId]/pro`
- **Example:** `/position/12345/pro`
- **Link from Portfolio:** Add "View Position Pro" link from position rows

## Testing Guide

### Manual State Toggling

For development and testing, each page supports manual state toggling:

**Universe Page:**
- Data state is derived from API response (no manual toggle needed)
- To test different states, modify the API response or use a mock

**Pool Pro Page:**
- Data state is derived from API response (no manual toggle needed)
- To test different states, modify the API response or use a mock

**Position Pro Page:**
- Line ~48: `const positionDataState: DataState = 'ok';`
- Change to `'warming'` or `'empty'` to see different UI states
- This is a temporary testing constant; will be replaced with API-derived state once backend is wired

### Expected UI Behavior

**`ok` State:**
- No banner displayed
- All sections show real data
- No placeholders visible

**`warming` State:**
- Yellow banner with spinner at top
- Sections dependent on 7d-MVs show `WarmingPlaceholder`
- Core metrics (TVL, position count) may still display if available
- Time-period labels remain visible

**`empty` State:**
- Empty-state banner displayed
- Sections show `WarmingPlaceholder` or empty states
- Core metrics show `—` or `0`
- Time-period labels remain visible

## Next Steps

### Backend Wiring (SP2-D11 / SP2-T71)

1. **Position Pro Endpoint:**
   - Wire `/api/analytics/position/[tokenId]` to real MVs
   - Return `PositionProAnalyticsResponse` with actual data
   - Ensure `status` field accurately reflects data completeness

2. **Dynamic State Derivation:**
   - Replace manual `positionDataState` constant in Position Pro page
   - Derive state from API response similar to Universe/Pool Pro pages

3. **7d-MVs Refresh:**
   - Once SP2-D11 completes, verify that `'warming'` states transition to `'ok'`
   - Ensure all sections populate with real data

### Frontend Enhancements

1. **Navigation Links:**
   - Add "View Universe" button in Pool Pro page
   - Add "Back to Pool Detail" link in Universe page
   - Add "View Position Pro" links in Portfolio/Positions tables

2. **Additional Sections:**
   - Fee earnings breakdown chart (Position Pro)
   - Impermanent loss tracking (Position Pro)
   - Position events history (Position Pro)
   - Insights & recommendations (Position Pro)

## File Structure

```
src/components/
  ├── DataStateBanner.tsx          # Data state banner component
  ├── DataSourceDisclaimer.tsx     # FTSO disclaimer component
  └── WarmingPlaceholder.tsx       # Warming state placeholder

pages/
  ├── pool/
  │   ├── [poolAddress]/
  │   │   └── universe.tsx         # Universe page
  │   └── [tokenId].tsx            # Pool Pro page
  └── position/
      └── [tokenId]/
          └── pro.tsx              # Position Pro page

src/lib/
  ├── analytics/
  │   ├── types.ts                 # Analytics types (includes PositionProAnalyticsResponse)
  │   └── db.ts                    # Analytics DB helpers
  └── api/
      └── analytics.ts             # API client functions
```

## Related Documentation

- `PROJECT_STATE.md` — Changelog entries for SP2-T70/T71
- `POSITION_PRO_DATA_STATES_TEST_GUIDE.md` — Detailed testing guide for Position Pro
- `docs/SSoT_DATA_ENRICHMENT.md` — Data enrichment SSoT
- `docs/STYLEGUIDE.md` — Design system guidelines

