# Figma_MAKE_DS_SUMMARY — Build Specification

**Document Purpose**: Complete specification for building the LiquiLab Design System Summary frame in Figma.  
**Last Updated**: 2025-11-23  
**Source of Truth**: `/guidelines/Guidelines.md` + `PROJECT_STATE.md` (changelog ≥ 2025-11-23)

---

## Frame Setup

**Frame Name**: `Figma_MAKE_DS_SUMMARY`  
**Layout**: 3-column layout (Foundation | Components | Templates) + footer  
**Background**: Navy canvas `#0B1530`  
**Padding**: 80px all sides  
**Column Gap**: 60px  
**Max Width**: ~1920px (standard desktop)

---

## COLUMN 1: FOUNDATIONS (LEFT)

### Frame Title
**Text**: "Foundations"  
**Style**: h1 (Manrope, 48px, white/95)  
**Margin-bottom**: 48px

---

### 1.1 Colors & Semantics

**Heading**: "Colors & Semantics" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Content Block**:

```
Palette:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● Primary: Electric Blue #3B82F6
● Accent: Signal Aqua #1BE8D2
● Background: Navy #0B1530
● Surface: #0F1A36/95

Semantic Color Usage:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Green (#10B981): Positive APR, positive PnL, "in range", good efficiency
✓ Amber (#F59E0B): Warnings (near range, borderline efficiency)
✓ Red (#EF4444): Negative APR, negative PnL, "out of range", extreme/unhealthy

⚠️ CRITICAL RULE:
Semantic colors are ONLY for APR, PnL, RangeBand/Range Efficiency status.
NOT for icons or decorative elements.
```

**Visual Elements**:
- Show 5 color swatches (circles, 40px diameter) with hex codes below
- Box out the critical rule in Electric Blue border with amber warning icon

**Spacing**: 40px margin-bottom

---

### 1.2 Typography & Numbers

**Heading**: "Typography & Numbers" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Content Block**:

```
Headings:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● Font: Manrope
● h1: 48px, white/95
● h2: 32px, white/95
● h3: 24px, white/95

Body Text Opacities:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● Primary (95%): Main headings, key values
● Secondary (70%): Body copy, descriptions
● Tertiary (58%): Labels, hints, timestamps

Numeric Style:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All numbers use tabular-nums (.numeric class)
✓ $ amounts: 16px (default body size)
✓ Token amounts: 12px (text-xs) below main $ value
```

**Visual Example**:
```
$124,580          ← 16px, white/95, numeric
370 XRP · 1.254 USDT0  ← 12px, white/58, numeric
```

**Spacing**: 40px margin-bottom

---

### 1.3 Icon Containers & Bullets (Global Rules)

**Heading**: "Icon Containers & Bullets" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Content Block**:

```
Icon Containers:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: bg-[#3B82F6]/20 (Electric Blue /20) — ALWAYS
Border-radius: rounded-lg (8px)
Alignment: flex items-center justify-center
Sizes: w-10 h-10 (small), w-12 h-12 (medium), w-14 h-14 (large)

Icon Color:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● Default neutral: Slate Grey #CBD5E1
● Semantic colors (green/amber/red) ONLY for evaluative metrics
● NEVER for event list icons

Bullets (Opsommingen):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● Always small Signal Aqua dots: w-1.5 h-1.5 rounded-full bg-[#1BE8D2]
● NOT CheckCircle2 icons for lists
```

**Visual Examples**:
- Show 3 icon containers side-by-side:
  1. Electric Blue /20 bg + slate grey icon (neutral)
  2. Electric Blue /20 bg + green icon (semantic success)
  3. Electric Blue /20 bg + red icon (semantic error)
- Show 1 bullet list with 3 items using aqua dots

**Spacing**: 40px margin-bottom

---

### 1.4 Event List Icons (Pool Activity, Transaction History)

**Heading**: "Event List Icons" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Content Block**:

```
Pattern Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Event icons are NEUTRAL: slate grey #CBD5E1 in Electric Blue /20 containers.

⚠️ NO semantic green/red/amber for event icons
   Text already describes the event type.
```

**Event Row Example** (visual mockup):
```
┌─────────────────────────────────────────────────────────────┐
│ [ICON]  Liquidity Added                        +$52,000     │
│         125,000 WFLR + 98,039 FXRP                          │
│         25 days ago                                         │
└─────────────────────────────────────────────────────────────┘
```
Where `[ICON]` = 40px square, Electric Blue /20 bg, slate grey Plus icon

**Icon Mapping Table**:

| Event Type          | Lucide Icon    | Color       |
|---------------------|----------------|-------------|
| Liquidity Added     | Plus           | #CBD5E1     |
| Fees Claimed        | DollarSign     | #CBD5E1     |
| Liquidity Removed   | Minus          | #CBD5E1     |
| Out of Range        | AlertTriangle  | #CBD5E1     |
| Incentive Claimed   | Gift           | #CBD5E1     |

**Spacing**: 60px margin-bottom (end of column 1)

---

## COLUMN 2: COMPONENTS & PATTERNS (MIDDLE)

### Frame Title
**Text**: "Components & Patterns"  
**Style**: h1 (Manrope, 48px, white/95)  
**Margin-bottom**: 48px

---

### 2.1 KPI Cards

**Heading**: "KPI Cards" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Visual Component** (annotated card mockup):

```
┌──────────────────────────────────────┐
│ Total Portfolio Value  ← 12px, white/58 (label)
│                                      │
│ $124,580              ← 32px, white/95, numeric (hero value)
│                                      │
│ ✓ +12.8%              ← badge (optional)
│                                      │
│ P&L 30D: +8.2% / $9,455  ← 12px, white/58 (subtext)
│                                      │
└──────────────────────────────────────┘
```

**Annotations**:
- Card bg: `#0F1A36/95`
- Border: `white/10`
- Border-radius: `rounded-xl` (12px)
- Padding: `p-6` (24px)

**Explicit Rule** (in red box):
```
❌ NO ICONS in KPI card headers
✓ Minimal typography-first cards
```

**Spacing**: 40px margin-bottom

---

### 2.2 Incentives & Rewards — USD + Token0/Token1 Pattern

**Heading**: "Incentives Pattern (MANDATORY)" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Visual Pattern Block**:

```
┌──────────────────────────────────────────────────────────┐
│ Lifetime incentives: $3,240.12  ← 16px, white/95, numeric
│                                                          │
│ Token0 (WFLR): 1,234.56 · Token1 (USDT0): 987.65        │
│ ↑ 12px, white/58, numeric                               │
└──────────────────────────────────────────────────────────┘
```

**Mandatory Usage**:
- ✓ Rewards & Incentives KPI card
- ✓ Unclaimed Fees & Rewards card
- ✓ Any incentives widget in Value & Earnings sections

**Component Note**:
```
This is a DS-level pattern.
Implemented as dedicated IncentivesDisplay component variant.
```

**Spacing**: 40px margin-bottom

---

### 2.3 Icon Containers (Promo / Insight Cards)

**Heading**: "Icon Containers in Promo Cards" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Visual Example** (promo card mockup):

```
┌────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════╗ │
│ ║ Gradient: Electric Blue /20 → Signal Aqua /20        ║ │
│ ║                                                       ║ │
│ ║ [ICON]  Unlock Pro Analytics  [Pro badge]            ║ │
│ ║                                                       ║ │
│ ║ Get deeper insights with advanced APR tracking,      ║ │
│ ║ peer comparisons, and predictive range analytics.    ║ │
│ ║                                                       ║ │
│ ║ [Upgrade to Pro →]  ← Electric Blue button           ║ │
│ ╚═══════════════════════════════════════════════════════╝ │
└────────────────────────────────────────────────────────────┘
```

Where `[ICON]` = 48px square, Electric Blue /20 bg, Lock icon (Electric Blue)

**Clarification**:
```
✓ Icon containers ARE ALLOWED in promo/insight cards
❌ Still NO ICONS in section titles (h2/h3)
   Icons stay inside card body only
```

**Spacing**: 40px margin-bottom

---

### 2.4 RangeBand™ Component

**Heading**: "RangeBand™ Component" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Visual Diagram**:

```
Strategy Axis:
Aggressive ←──────── Balanced ──────────→ Conservative
  (<12%)      (12-35%) [●]       (>35%)

Current Position: Balanced (25.0%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Min: $0.98    [●●●●●●●●●●●●●━━━━━━━━━━━]    Max: $1.93
                   Current: $1.275

WFLR/FXRP

Stats Row:
┌──────────────┬──────────────��──────────────┬──────────────┐
│ Time in      │ Range        │ Times out    │ Band width   │
│ range        │ Efficiency   │ of range     │              │
│ 24/28 days   │ 86%          │ 4            │ 25.0%        │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Reuse Context**:
- Portfolio Pro (aggregated across all positions)
- PoolDetail (per specific pool)
- Pool Universe (pool-wide context)

**Spacing**: 60px margin-bottom (end of column 2)

---

## COLUMN 3: LAYOUT TEMPLATES (RIGHT)

### Frame Title
**Text**: "Layout Templates (Strategy C)"  
**Style**: h1 (Manrope, 48px, white/95)  
**Margin-bottom**: 48px

---

### 3.1 Portfolio — Performance & Analytics (Premium + Pro)

**Heading**: "Portfolio P&A Layout" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Wireframe Layout** (simplified zones):

```
┌─────────────────────────────────────────────────────────────┐
│ ZONE A: HEADER + KPI BELT                                   │
├─────────────────────────────────────────────────────────────┤
│ [KPI 1] [KPI 2] [KPI 3] [KPI 4]  ← Row 1 (4 cards)         │
│ [KPI 5] [KPI 6] [KPI 7] [KPI 8]  ← Row 2 (4 cards)         │
├─────────────────────────────────────────────────────────────┤
│ ZONE B: ACTIVITY CALENDAR ROW                               │
├─────────────────────────────────────────────────────────────┤
│ [Activity Heatmap]  │  [Premium: Promo / Pro: Peer Summary] │
│ (70% width)         │  (30% width)                          │
├─────────────────────────────────────────────────────────────┤
│ ZONE C: VALUE & EARNINGS                                    │
├─────────────────────────────────────────────────────────────┤
│ Portfolio Value & P&L                                       │
│ [Chart + Stats]                                             │
├─────────────────────────────────────────────────────────────┤
│ Trading Fees  │  Rewards & Incentives                       │
│               │  (USD + Token0/Token1 pattern)              │
├─────────────────────────────────────────────────────────────┤
│ ZONE D: EFFICIENCY, BEHAVIOUR & RISK                        │
├─────────────────────────────────────────────────────────────┤
│ [Net Yield vs HODL] [Range Efficiency] [Unclaimed Health]  │
│ [DEX Exposure] [Activity & Claim] [Concentration]          │
├─────────────────────────────────────────────────────────────┤
│ ZONE E: PRO ANALYTICS (Pro only)                            │
├─────────────────────────────────────────────────────────────┤
│ Peer Comparison Table                                       │
│ Strategy Distribution Chart                                 │
│ (Optional: DEX Detail)                                      │
└─────────────────────────────────────────────────────────────┘
```

**Key Note** (in Electric Blue box):
```
Pro = Premium baseline + extra peer/universe lines + Pro Analytics section
Same layout hierarchy, NOT a separate Pro page
```

**Spacing**: 40px margin-bottom

---

### 3.2 Pool Detail — Premium vs Pro

**Heading**: "Pool Detail Layouts" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Side-by-Side Diagrams**:

**PREMIUM PoolDetail**:
```
┌──────────────────────────────────┐
│ HERO                             │
│ Pool header + "Upgrade to Pro →" │
├──────────────────────────────────┤
│ PRICE CHART & RANGE ANALYSIS     │
│ [Chart with range lines]         │
├──────────────────────────────────┤
│ KPI BELT (4 cards)               │
│ [Fees] [Incentives] [Earned] [APR]│
├──────────────────────────────────┤
│ RANGEBAND™ STATUS                │
│ [RangeBand component]            │
├──────────────────────────────────┤
│ MY POSITIONS TABLE               │
│ [Position rows]                  │
├──────────────────────────────────┤
│ POOL ACTIVITY                    │
│ [Event list, neutral icons]      │
├──────────────────────────────────┤
│ PRO ANALYTICS TEASER             │
│ "Upgrade to Pro for..."          │
└──────────────────────────────────┘
```

**PRO PoolDetail**:
```
┌──────────────────────────────────┐
│ HERO                             │
│ Pool header + Pro badge          │
│ "View Universe →" button         │
├──────────────────────────────────┤
│ PRICE CHART & RANGE ANALYSIS     │
│ [Chart + Pro overlays]           │
│ + Volatility/Regime/Universe     │
│ + Small Pro stats panel          │
├──────────────────────────────────┤
│ KPI BELT (4 cards)               │
│ [Same 4, + peer/universe sublines]│
├──────────────────────────────────┤
│ RANGEBAND™ STATUS                │
│ [RangeBand + universe insight]   │
├──────────────────────────────────┤
│ MY POSITIONS TABLE               │
│ [Positions + peer/universe info] │
├──────────────────────────────────┤
│ POOL ACTIVITY                    │
│ [Toggle: All LP / Yours only]    │
│ + Pro metrics                    │
├──────────────────────────────────┤
│ PRO ANALYTICS SECTION            │
│ Peer Comparison                  │
│ Pool Universe Snapshot           │
│ Risk & Volatility                │
└──────────────────────────────────┘
```

**Spacing**: 40px margin-bottom

---

### 3.3 Pool Universe View

**Heading**: "Pool Universe Layout" (h2, 32px, white/95)  
**Margin-bottom**: 24px

**Wireframe Diagram**:

```
┌─────────────────────────────────────────────────────────────┐
│ UNIVERSE HERO TILES                                         │
├─────────────────────────────────────────────────────────────┤
│ [Pool TVL] [Total Fees 30d] [Avg APR] [LP count] [In-range%]│
├─────────────────────────────────────────────────────────────┤
│ DEX BREAKDOWN          │  FEE TIER BREAKDOWN                │
│ [Bar chart + table]    │  [Chart + table]                   │
├─────────────────────────────────────────────────────────────┤
│ LP POPULATION & CONCENTRATION                               │
│ [Wallet-size donut] [Top 1/10 share] [Position churn]      │
├─────────────────────────────────────────────────────────────┤
│ RANGEBAND™ LANDSCAPE & PRICE ZONE                           │
│ [Strategy distribution] [Range status pie] [Crowded zones]  │
├─────────────────────────────────────────────────────────────┤
│ FEE & APR DISTRIBUTION                                      │
│ [APR histogram] [Median/range] [Missed fees]               │
├─────────────────────────────────────────────────────────────┤
│ CLAIM BEHAVIOUR & FLOWS                                     │
│ [Latency by wallet] [Unclaimed %] [Net flows chart]        │
├─────────────────────────────────────────────────────────────┤
│ MARKET REGIMES                                              │
│ [Regime timeline] [Volatility bars] [Regime days]          │
├─────────────────────────────────────────────────────────────┤
│ "WHAT THIS MEANS FOR YOU" INSIGHT BLOCK                     │
│ 6 decision points linking universe → your RangeBand        │
└─────────────────────────────────────────────────────────────┘
```

**Annotation** (in Signal Aqua box):
```
These layouts are CANONICAL.
New screens must be consistent with these templates:
hierarchy, zones, DS components.
```

**Spacing**: 60px margin-bottom (end of column 3)

---

## FOOTER AREA (Full Width)

### Practical Notes on Usage

**Background**: Darker navy `#0A1020` (slightly darker than canvas)  
**Padding**: 40px  
**Border-top**: 1px solid `white/10`

**Content**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOURCE OF TRUTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ /guidelines/Guidelines.md
✓ PROJECT_STATE.md (changelog ≥ 2025-11-23)

When in doubt: Do NOT invent new styles.
Update Guidelines first → then Figma → then code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION CHECKLIST (Strategy C Screens)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ No icons in h2/h3 titles and tab labels
□ KPI cards use DS pattern (no icons, correct text sizes)
□ Incentives & unclaimed use USD + Token0/Token1 pattern
□ Event lists use neutral slate-grey icons in Electric Blue /20 containers
□ Portfolio/Pool/Universe layouts match Strategy C templates
□ Semantic colors ONLY for APR/PnL/RangeBand metrics
□ All numbers use tabular-nums (.numeric class)
□ Typography hierarchy matches DS (95%/70%/58% opacity)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK REFERENCE: COMMON MISTAKES TO AVOID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Green/red icons in event lists → Use slate grey #CBD5E1
❌ Icons in KPI card headers → Typography-first cards only
❌ Custom icon container colors → Always Electric Blue /20 bg
❌ Signal Aqua for links → Use Electric Blue #3B82F6 for links
❌ Missing USD + Token breakdown in incentives → Mandatory pattern
❌ Inconsistent numeric formatting → Always use .numeric class
```

**Design Credits** (small text, bottom-right):
```
LiquiLab Design System Summary
Last updated: 2025-11-23
Maintained by: LiquiLab Design & Engineering
```

---

## COLOR PALETTE REFERENCE (For Designer)

Use these exact hex codes in Figma:

| Token Name           | Hex Code     | Usage                                    |
|----------------------|--------------|------------------------------------------|
| Electric Blue        | `#3B82F6`    | Primary interactive, buttons, links      |
| Signal Aqua          | `#1BE8D2`    | Accent, bullets, badges                  |
| Navy Canvas          | `#0B1530`    | Main background                          |
| Surface              | `#0F1A36`    | Card backgrounds (at 95% opacity)        |
| Success Green        | `#10B981`    | Positive APR, PnL, in-range             |
| Warning Amber        | `#F59E0B`    | Near-range warnings                      |
| Error Red            | `#EF4444`    | Negative APR, PnL, out-of-range         |
| Slate Grey           | `#CBD5E1`    | Neutral event icons                      |
| White 95%            | `rgba(255, 255, 255, 0.95)` | Primary text      |
| White 70%            | `rgba(255, 255, 255, 0.70)` | Secondary text    |
| White 58%            | `rgba(255, 255, 255, 0.58)` | Tertiary text     |
| White 10%            | `rgba(255, 255, 255, 0.10)` | Card borders      |
| White 5%             | `rgba(255, 255, 255, 0.05)` | Table borders     |

---

## TYPOGRAPHY REFERENCE (For Designer)

Set up text styles in Figma:

| Style Name           | Font         | Size  | Weight | Opacity | Usage                    |
|----------------------|--------------|-------|--------|---------|--------------------------|
| H1                   | Manrope      | 48px  | 400    | 95%     | Page titles              |
| H2                   | Manrope      | 32px  | 400    | 95%     | Section headers          |
| H3                   | Manrope      | 24px  | 400    | 95%     | Subsection headers       |
| Body / Primary       | Manrope      | 16px  | 400    | 95%     | Main content, $ amounts  |
| Body / Secondary     | Manrope      | 16px  | 400    | 70%     | Descriptions             |
| Body / Tertiary      | Manrope      | 16px  | 400    | 58%     | Labels, hints            |
| Small / Primary      | Manrope      | 12px  | 400    | 95%     | Token amounts (numeric)  |
| Small / Tertiary     | Manrope      | 12px  | 400    | 58%     | Timestamps, sublabels    |
| Hero Value           | Manrope      | 32px  | 400    | 95%     | KPI card main values     |

**IMPORTANT**: Enable OpenType feature `tnum` (tabular numerals) for all numeric text styles.

---

## COMPONENT LIBRARY REFERENCE

The following components should exist in your Figma component library:

1. **KPI Card** (variant: default)
   - No icon version
   - Label + Hero Value + Optional Badge + Optional Subtext

2. **Incentives Display** (variant: USD + Token)
   - Line 1: USD amount (16px)
   - Line 2: Token0 + Token1 breakdown (12px)

3. **Event List Row** (variant: activity)
   - Icon container (Electric Blue /20 + slate grey icon)
   - Event title + details + timestamp

4. **Icon Container** (variants: small/medium/large)
   - Background: Electric Blue /20
   - Icon color: prop-driven (neutral/semantic)

5. **RangeBand™ Component** (variants: list/card/hero)
   - Full component as per Guidelines

6. **Promo Card**
   - Gradient bg + icon container + title + badge + body + CTA

---

## BUILD NOTES FOR DESIGNER

1. **Auto Layout**: Use Figma Auto Layout for all component frames
2. **Variants**: Create component variants for sizes (small/medium/large)
3. **Spacing Tokens**: Define 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 60px, 80px
4. **Color Styles**: Create color styles for all tokens (don't use raw hex in designs)
5. **Text Styles**: Create text styles for all typography combinations
6. **Documentation**: Add annotations as text layers (use white/40 for annotation text)
7. **Export**: Export frame as PNG at 2x for web documentation

---

## FINAL CHECKLIST FOR DESIGNER

Before marking the frame as complete:

- [ ] 3-column layout is balanced and scannable
- [ ] All hex codes match the specification exactly
- [ ] Typography hierarchy is clear (48px → 32px → 24px → 16px → 12px)
- [ ] Visual examples are simplified wireframes, not full designs
- [ ] Event list icons are all slate grey (not semantic colors)
- [ ] Icon containers all use Electric Blue /20 background
- [ ] Footer checklist is complete and readable
- [ ] Color palette reference is visible and accurate
- [ ] Frame name is exactly `Figma_MAKE_DS_SUMMARY`
- [ ] Frame is organized in logical top-to-bottom reading flow
- [ ] Annotations use consistent style (white/40, 11px italic)

---

**End of Specification Document**

This document should provide everything needed to build the `Figma_MAKE_DS_SUMMARY` frame in Figma. The designer should follow this spec exactly to ensure consistency with the codebase and Guidelines.md.
