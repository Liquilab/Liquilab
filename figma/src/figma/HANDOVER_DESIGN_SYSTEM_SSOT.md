# Liquilab — Design System Single Source of Truth (SSoT) Handover

**Document Purpose:** High-level overview of the Liquilab Design System for handover to development teams, AI tools (Codex), and designers.

**Last Updated:** 2025-11-25  
**Primary DS Reference:** `/guidelines/Guidelines.md`  
**Strategy C Documentation:** This document + `FIGMA_MAKE_DS_SUMMARY_SPEC.md` + `RANGEBAND_UNIFICATION.md`

---

## 📋 Design System Philosophy

Liquilab is a **premium DeFi liquidity analytics app** for Flare (Ēnosys & SparkDEX) with a modern fintech/B2B SaaS aesthetic. The design is:

- **Rustgevend & vertrouwenwekkend** (calming & trustworthy)
- **Professional maar toegankelijk** (professional but accessible)
- **Gericht op breed publiek** (targeted at broad audience)
- **Modern, clean, minimalist** (no unnecessary decorations)

### Core Design Principles

1. **Minimalism First**
   - Clean typography, no icons in headers/titles/tabs unless absolutely necessary
   - Let data speak for itself
   - White space for breathing room

2. **Numeric Clarity (Strategy C)**
   - Explicit time windows on all metrics (30D, 90D, 24h, snapshot, lifetime)
   - Clear denominators for all percentages (% of portfolio TVL, % of pool TVL, % of time, etc.)
   - Health thresholds visible and neutral

3. **"No Advice" Framing**
   - Descriptive language only: check, see, note, compare, confirm
   - No imperatives: avoid "should", "must", "consider", "fix this"
   - Present data neutrally; let users draw conclusions

4. **Premium vs Pro Differentiation**
   - **Premium screens:** Show only own metrics with baseline numeric clarity
   - **Pro screens:** Add neutral peer/universe comparisons without advice language
   - Universe comparisons use neutral numeric forms (Top X%, above/below median)

---

## 🎨 Visual Language

### Color Palette

**Primary & Interactive:**
- **Electric Blue** `#3B82F6` — Interactive elements, links, buttons, active states, hover borders
- **Signal Aqua** `#1BE8D2` — Bullets, badges, checkmarks, accent elements
- **Navy Canvas** `#0B1530` — Main app background
- **Surface** `#0F1A36/95` — Card backgrounds

**Semantic (Data-Driven):**
- **Success Green** `#10B981` — Positive APR, in-range status, positive PnL, good efficiency
- **Warning Amber** `#F59E0B` — Near-range warnings, borderline efficiency
- **Error Red** `#EF4444` — Negative APR, out-of-range status, negative PnL, extreme/unhealthy

**⚠️ CRITICAL RULE:**  
Semantic colors (Green/Amber/Red) are **ONLY** for APR, PnL, RangeBand status, and Range Efficiency metrics.  
**NOT** for decorative icons, backgrounds, or non-data UI elements.

### Typography

**Font Family:** Manrope (sans-serif, modern, clean)

**Text Opacities:**
- **white/95** `rgba(255, 255, 255, 0.95)` — Primary text (headings, key values)
- **white/70** `rgba(255, 255, 255, 0.70)` — Secondary text (body copy, descriptions)
- **white/[0.58]** `rgba(255, 255, 255, 0.58)` — Tertiary text (labels, hints, timestamps)

**Numbers:**
- All numbers use **tabular numerals** (`.numeric` class in code)
- $ amounts: 16px (default body size)
- Token amounts: 12px (`text-xs`) displayed below main $ value
- Percentages: 1 decimal place for consistency

---

## 📊 Strategy C — Numeric Clarity Rules

Strategy C is our **numeric clarity framework** that ensures all data is presented with explicit context and clear denominators.

### Rule 1: Explicit Time Windows

**Before:** "Average APR"  
**After:** "Average APR (30D, annualized)"

**Before:** "Range Efficiency"  
**After:** "Range Efficiency (30D)"

**Time Window Options:**
- `30D` / `90D` / `24h` — Time-based windows
- `snapshot` — Point-in-time data
- `lifetime` / `since start` — Historical aggregate

### Rule 2: Clear Denominators for Percentages

**Portfolio Context:**
- "2.8% of your portfolio TVL" (unclaimed fees)
- "35% of your portfolio" (concentration)
- "87% of time" (range efficiency)
- "62% of your TVL" (DEX exposure)

**Pool/Universe Context:**
- "58% of pool TVL" (concentration)
- "52% of pool TVL" (whale holdings)
- "42% of pool TVL" (crowded price zones)
- "32% of LP wallets" (claim latency buckets)

**NEVER:** Use bare percentages without denominators (e.g., "2.8%" alone).

### Rule 3: Health Thresholds Visible & Neutral

**Example (Unclaimed Fees Health):**
```
$3,458 (2.8% of your portfolio TVL)
Health thresholds: <1% OK · 1–3% High · >3% Extreme
```

**Example (Claim Cadence):**
```
Healthy: 7–14 day cadence
```

**NEVER:** Use advice language like "You should claim every 7 days."

### Rule 4: Premium vs Pro Differentiation

**Premium Screens:**
- Show **only own metrics** with baseline numeric clarity
- No peer/universe comparisons
- Examples: Portfolio Premium, PoolDetail (standard)

**Pro Screens:**
- Mirror all Premium baseline clarity
- **Add** neutral peer/universe comparisons
- Use neutral language: "Peers median", "Top X%", "above/below universe median"
- Examples: Portfolio Pro, Pool Pro, Pool Universe

---

## 🧩 Key Components

### 1. KPI Cards — Minimalist Design

**Visual Philosophy:** Clean typography, no icons in headers

**Structure:**
```tsx
<div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
  <div className="text-white/[0.58] text-xs mb-2">Total Portfolio Value</div>
  <div className="text-white/95 numeric" style={{ fontSize: '32px' }}>
    $124,580
  </div>
  <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 mb-2">
    +12.8%
  </Badge>
  <div className="text-xs text-white/[0.58]">
    P&L 30D: +8.2% / $9,455
  </div>
</div>
```

### 2. RangeBand™ — Unique Selling Point

**Core Concept:** Visual range monitoring showing when liquidity is in range, near the edge, or out of range.

**Three Variants:**
1. **List** (`variant="list"`) — Compact for table rows, My Positions
2. **Card** (`variant="card"`) — Standard for pool cards, mobile views
3. **Hero** (`variant="hero"`) — Large for marketing, explainer pages

**Strategy Definitions:**
- **Aggressive:** < 12% range width — Highest fees, daily monitoring, stable pairs
- **Balanced:** 12-35% range width — Good balance, weekly checks, most pairs (Recommended)
- **Conservative:** > 35% range width — Consistent fees, minimal monitoring, volatile pairs

**For complete RangeBand™ spec, see:** `RANGEBAND_UNIFICATION.md`

### 3. Icon Containers & Bullets

**Icon Containers:**
- **ALWAYS** Electric Blue background: `bg-[#3B82F6]/20`
- Only the icon color itself varies (green/red/aqua for semantic meaning)

**Bullets for Lists:**
- **ALWAYS** Signal Aqua: `w-1.5 h-1.5 rounded-full bg-[#1BE8D2]`
- **NEVER** use CheckCircle2 icons for regular list bullets

---

## 📁 Documentation Structure

### Primary References

1. **`/guidelines/Guidelines.md`** — Complete Design System SSoT
2. **`/figma/FIGMA_MAKE_DS_SUMMARY_SPEC.md`** — Detailed DS summary frame spec
3. **`/figma/RANGEBAND_UNIFICATION.md`** — Complete RangeBand™ spec

### Supporting Documentation

- **`/figma/DS_CONSISTENCY_AUDIT.md`** — DS audit and resolutions
- **`/figma/IMPLEMENTATION_ROUTES.md`** — Figma frames ⇄ React components
- **`/figma/FILE_LOCATIONS.md`** — File location map
- **`/PROJECT_STATE.md`** — Changelog and current state

---

## ✅ Design System Checklist

When implementing new screens or components:

- [ ] **No icons** in h2/h3 titles and tab labels
- [ ] **Explicit time windows** on all metrics
- [ ] **Clear denominators** for all percentages
- [ ] **Health thresholds** visible and neutral
- [ ] **Semantic colors** ONLY for APR/PnL/RangeBand metrics
- [ ] **All numbers** use `.numeric` class
- [ ] **No advice language** — descriptive only
- [ ] **Premium/Pro** differentiation correct

---

**Last Updated:** 2025-11-25  
**Maintained by:** Liquilab Design Team
