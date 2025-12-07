# RangeBand™ — Unified Design System Specification

**Document Purpose:** Complete specification for the RangeBand™ component — Liquilab's unique selling point for visual range monitoring.

**Last Updated:** 2025-11-25  
**Component File:** `/components/Rangeband.tsx`  
**Demo Page:** `/rangeband-ds` — Showcases all three variants with status states

---

## 🎯 Core Concept

**RangeBand™** visualizes the price range of a liquidity provider (LP) position, showing at a glance whether the position is:
- **In Range** (actively earning fees) — Green
- **Near Band** (approaching range edge) — Amber
- **Out of Range** (not earning fees) — Red

This is the **primary differentiator** of Liquilab — transforming complex concentrated liquidity data into an intuitive visual.

---

## 📊 Strategy Definitions

RangeBand width is determined by the **strategy percentage** (range width relative to current price):

### Aggressive Strategy
- **Range Width:** < 12%
- **Characteristics:**
  - Highest fee capture potential
  - Requires daily monitoring
  - Best for stable pairs (e.g., stablecoin pairs)
  - Higher risk of going out of range

### Balanced Strategy ⭐ Recommended
- **Range Width:** 12-35%
- **Characteristics:**
  - Good balance between fees and stability
  - Weekly monitoring recommended
  - Suitable for most token pairs
  - Moderate risk profile

### Conservative Strategy
- **Range Width:** > 35%
- **Characteristics:**
  - Consistent, predictable fee income
  - Minimal monitoring needed
  - Best for volatile pairs
  - Lower risk of going out of range

---

## 🎨 Three Layout Variants

RangeBand™ has **three visual variants** that share identical design DNA but scale differently for different contexts.

### Variant 1: List (`variant="list"`)

**Purpose:** Compact layout for table rows and list views

**Usage:**
- PoolTable rows
- "My Positions" tables
- Pool Detail position tables

**Visual Characteristics:**
- **Occupies:** ~60% of row width, centered in RangeBand column
- **Dot Size:** 14px
- **Current Price Font:** 16px
- **Max Width:** 600px, auto-centered

### Variant 2: Card (`variant="card"`)

**Purpose:** Standard layout for pool cards, mobile views, grid layouts

**Usage:**
- PoolCard component
- Mobile card views
- Marketing cards

**Visual Characteristics:**
- **Width:** Full card width
- **Dot Size:** 21px
- **Current Price Font:** 24px
- **Band Min-Width:** 160px

### Variant 3: Hero (`variant="hero"`)

**Purpose:** Large, prominent layout for marketing pages, hero sections, demos

**Usage:**
- RangeBand Explainer page demo
- Pool Detail Pro hero section
- Homepage marketing sections

**Visual Characteristics:**
- **Width:** Full section width
- **Dot Size:** 28px
- **Current Price Font:** 32px
- **Band Line:** 3px thick

---

## 🎯 Shared Design Elements

### Band Width Logic

- **Aggressive (< 12%):** 30% of container width
- **Balanced (12-35%):** 65% of container width
- **Conservative (> 35%):** 100% of container width

### Status Colors & States

#### In Range (Green)
- **Color:** `#10B981`
- **Dot Glow:** Active
- **Animation:** Heartbeat (2s infinite)

#### Near Band (Amber)
- **Color:** `#F59E0B`
- **Dot Glow:** Active
- **Animation:** Slow heartbeat (3s infinite)

#### Out of Range (Red)
- **Color:** `#EF4444`
- **Dot Glow:** None
- **Animation:** None (static)

---

## 📐 Range Efficiency

**Range Efficiency** shows what percentage of time the position was in range (actively earning fees).

### Calculation

```typescript
const rangeEfficiency = (daysInRange / totalDays) * 100;
```

**Display Format (Strategy C):**
- Label: "Range Efficiency (30D)"
- Value: "87%"
- Subcopy: "87% of time in range"

**Color Coding:**
- **≥ 80%:** Green (Excellent)
- **60-79%:** Amber (Fair)
- **< 60%:** Red (Poor)

---

## 🔧 Component Props

```typescript
interface RangebandProps {
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  status?: 'inRange' | 'nearBand' | 'outOfRange';
  strategyLabel: string;
  pairLabel: string;
  variant: 'list' | 'card' | 'hero';
  className?: string;
}
```

---

## 🌐 Universe Comparisons (Pro-Only)

In **Pool Pro** screens, RangeBand™ Status sections include universe comparison snippets:

```
Universe time in range (30D): 72% of time
Universe median band width: 40.0%
Your band width: 65.0% (wider than universe median)
Your efficiency: above universe median
```

**Neutral Language Rules:**
- Use "wider/narrower than universe median" (not "better/worse")
- Use "above/below universe median" (not "performing well/poorly")
- Present data factually; let user draw conclusions

---

**Last Updated:** 2025-11-25  
**Maintained by:** Liquilab Design Team
