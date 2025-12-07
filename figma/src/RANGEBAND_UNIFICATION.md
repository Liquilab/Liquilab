# 🎯 RangeBand™ Design System Unification

**Status**: ✅ Complete
**Date**: November 2024

---

## Overview

De RangeBand™ component is volledig geünificeerd naar **ONE component met THREE layout variants**. Alle inconsistente implementaties door de app zijn vervangen door deze single source of truth. Alle variants delen dezelfde visuele DNA—alleen de schaal en layout veranderen per context.

---

## Component Structure

### **File**: `/components/Rangeband.tsx`

### **Props Interface**
```typescript
interface RangebandProps {
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  status?: "inRange" | "nearBand" | "outOfRange";  // Auto-calculated if omitted
  strategyLabel?: string;  // e.g., "Balanced (25.0%)"
  pairLabel: string;       // e.g., "WFLR/FXRP"
  variant?: "list" | "card" | "hero";  // Default: "card"
  className?: string;
}
```

### **Element Order (ALL VARIANTS)**
Consistent across all three variants:
1. Strategy label (e.g., "Balanced (25.0%)")
2. Horizontal band with glowing status dot
3. Min/max price labels (positioned UNDER left/right band ends)
4. Current price (large, centered below band)
5. Pair label (e.g., "WFLR/FXRP")
6. Caption: "Powered by RangeBand™"

---

## Three Variants

### 1️⃣ **List Variant** (`variant="list"`)

**Use Cases**:
- ✅ Pool overview table rows (`/pools` list view)
- ✅ Pool detail "My Positions" table (`/pool/:id` & `/pool/:id/pro`)
- ✅ Wallet overview active positions (`/koen`)
- ✅ Any dense table/row data view

**Layout**:
```
┌────────────────────────────────────────┐
│ Strategy: Balanced (25.0%)             │
│                                        │
│        ━━━━━━━●━━━━━━                 │
│      [Min]          [Max]              │
│                                        │
│         1.27500                        │
│        WFLR/FXRP                       │
│                                        │
│              Powered by RangeBand™  ↗  │
└────────────────────────────────────────┘
```

**Characteristics**:
- **Compact vertical stack** (not horizontal!)
- Occupies ~60% of row width, **centered in RangeBand column**
- Strategy label top left (12px)
- Band centered in container
- Min/max UNDER band ends (10px text)
- Current price centered below (16px)
- Pair label centered (12px)
- Small dot (14px)
- Caption bottom right (10px)
- **Max width: 600px**, auto-centered

**Example Usage**:
```tsx
<Rangeband 
  variant="list"
  currentPrice={1.275000}
  minPrice={0.980000}
  maxPrice={1.930000}
  strategyLabel="Balanced (25.0%)"
  pairLabel="WFLR/FXRP"
/>
```

---

### 2️⃣ **Card Variant** (`variant="card"`)

**Use Cases**:
- ✅ Pool cards in grid view (`/pools` grid view)
- ✅ Mobile pool cards
- ✅ RangeBand explainer strategy cards
- ✅ RangeBand explainer strategy cards (`/rangeband`)
- ✅ Marketing blocks and hero sections
- ✅ Mobile pool cards

**Layout**:
```
┌────────────────────────────────────┐
│      Balanced (25.0%)              │
│                                    │
│  [Min] ━━━━━━━━●━━━━━━━ [Max]     │
│                                    │
│        CURRENT PRICE               │
│         1.27500                    │
│        WFLR/FXRP                   │
│                                    │
│   Powered by RangeBand™            │
└────────────────────────────────────┘
```

**Characteristics**:
- Vertical layout with breathing room
- Strategy label centered (14px)
- Band centered with min-width 160px
- Min/max UNDER band ends (11px text)
- "CURRENT PRICE" label above price
- Large current price (24px, centered)
- Pair label below price (14px)
- Medium dot (21px)
- Caption centered bottom (10px)

**Example Usage**:
```tsx
<Rangeband 
  variant="card"
  currentPrice={1.275000}
  minPrice={0.980000}
  maxPrice={1.930000}
  strategyLabel="Balanced (25.0%)"
  pairLabel="WFLR/FXRP"
/>
```

---

### 3️⃣ **Hero Variant** (`variant="hero"`)

**Use Cases**:
- ✅ RangeBand explainer main demo (`/rangeband`)
- ✅ Pool detail hero sections (`/pool/:id` & `/pool/:id/pro`)
- ✅ Homepage hero/demo sections
- ✅ Large marketing showcases

**Layout**:
```
┌──────────────────────────────────────────┐
│         Balanced (25.0%)                 │
│                                          │
│          ━━━━━━━━●━━━━━━━              │
│       [Min]              [Max]           │
│                                          │
│           CURRENT PRICE                  │
│            1.27500                       │
│           WFLR/FXRP                      │
│                                          │
│      Powered by RangeBand™               │
└──────────────────────────────────────────┘
```

**Characteristics**:
- Large, prominent display
- Strategy label centered (16px)
- Thicker band line (3px vs 2px)
- Min/max UNDER band ends (12px text)
- "CURRENT PRICE" label
- Extra-large current price (32px)
- Pair label (16px)
- Large dot (28px)
- Caption centered (12px)
- Full section width (100%)

**Example Usage**:
```tsx
<Rangeband 
  variant="hero"
  currentPrice={1.275000}
  minPrice={0.980000}
  maxPrice={1.930000}
  strategyLabel="Balanced (25.0%)"
  pairLabel="WFLR/FXRP"
/>
```

---

## Shared Design System

### **Band Widths** (auto-calculated from strategyLabel)
| Strategy | Percentage Range | Band Width | Visual |
|----------|-----------------|------------|--------|
| Aggressive | < 12% | 30% | Tight range, higher risk/reward |
| Balanced | 12% - 35% | 65% | Moderate range |
| Conservative | > 35% | 100% | Wide range, lower risk |

### **Status Colors** (semantic)
| Status | Color | Hex | Glow | Animation |
|--------|-------|-----|------|-----------|
| In Range | Success Green | `#10B981` | ✅ Yes | Heartbeat (normal) |
| Near Band | Warning Amber | `#F59E0B` | ✅ Yes | Heartbeat (slow) |
| Out of Range | Error Red | `#EF4444` | ❌ No | None |

### **Auto-Detection Logic**
```typescript
// Status is auto-calculated if not provided:
- Out of Range: currentPrice < minPrice || currentPrice > maxPrice
- Near Band: within 5% of price range from either edge
- In Range: everything else
```

### **Typography**
- All prices: `numeric` class (tabular numerals)
- Font: Inter
- Sizes:
  - List variant current price: 16px
  - Card variant current price: 24px
  - Min/max prices: 12px (both variants)
  - Strategy label: 12-14px
  - Pair label: 12-14px

### **Colors**
- Band line: `rgba(255, 255, 255, 0.7)` (white/70)
- Min/max text: `rgba(255, 255, 255, 0.58)` (white/58)
- Current price: `rgba(255, 255, 255, 0.95)` (white/95)
- Pair label: `rgba(255, 255, 255, 0.70)` (white/70)
- "Powered by": `rgba(255, 255, 255, 0.40)` (white/40)

---

## Implementation Checklist

### ✅ Component Created
- [x] `/components/Rangeband.tsx` - Unified component with two variants
- [x] Props interface updated
- [x] Auto-status detection implemented
- [x] Band width calculation from strategy %
- [x] Dot positioning logic
- [x] Animations (heartbeat, glow)

### ✅ Pages Updated
- [x] **PoolsOverview.tsx** - Grid view uses `variant="card"`
- [x] **PoolsOverview.tsx** - List view uses `variant="list"` 
- [x] **PoolDetailPage.tsx** - Hero section uses `variant="card"`
- [x] **PoolDetailPage.tsx** - My Positions table uses `variant="list"`
- [x] **PoolDetailProPage.tsx** - Hero section uses `variant="card"`
- [x] **PoolDetailProPage.tsx** - My Positions table uses `variant="list"`
- [x] **RangeBandExplainer.tsx** - All strategy cards use `variant="card"`

### ✅ Components Updated
- [x] **PoolCard.tsx** - Uses `variant="card"`
- [x] **PoolTable.tsx** - Uses `variant="list"`

### ✅ Documentation
- [x] **RangeBandDS.tsx** - Design system showcase page created
- [x] **Guidelines.md** - Updated with new unified component docs
- [x] **AccountPage.tsx** - Developer Tools link added
- [x] **App.tsx** - Route added for `/rangeband-ds`

---

## Design System Page

**Route**: `/rangeband-ds`

**Features**:
- ✅ Variant overview (List vs Card)
- ✅ Status states showcase (all 3 states for each variant)
- ✅ Strategy widths demonstration (Aggressive/Balanced/Conservative)
- ✅ Usage contexts per variant
- ✅ Complete design specifications (colors, typography, spacing)
- ✅ Side-by-side comparison

**Access**:
1. Direct URL: `/#/rangeband-ds`
2. Account page → Developer Tools → "View Design System"

---

## Migration Guide (for future development)

### ❌ Old Way (DEPRECATED)
```tsx
// DO NOT USE - inconsistent props
<Rangeband 
  currentPrice={1.27500}
  minPrice={0.980000}
  maxPrice={1.93000}
  token1="WFLR"
  token2="FXRP"
  strategyPercent="25.0%"
  compact={true}
/>
```

### ✅ New Way (CORRECT)
```tsx
// List variant (for tables)
<Rangeband 
  variant="list"
  currentPrice={1.27500}
  minPrice={0.980000}
  maxPrice={1.930000}
  strategyLabel="Balanced (25.0%)"
  pairLabel="WFLR/FXRP"
/>

// Card variant (for cards/hero)
<Rangeband 
  variant="card"
  currentPrice={1.27500}
  minPrice={0.980000}
  maxPrice={1.930000}
  strategyLabel="Balanced (25.0%)"
  pairLabel="WFLR/FXRP"
/>
```

---

## Key Principles

### 1. **One Component, Two Layouts**
- Same visual design
- Same status colors
- Same animations
- Same calculations
- Different layouts optimize for context

### 2. **Transparent Background**
- Works on navy cards
- Works on hero sections
- Works in tables
- No assumptions about container

### 3. **Semantic Colors ONLY for Status**
- Green = In Range (success)
- Amber = Near Band (warning)
- Red = Out of Range (error)
- No other UI elements use these colors

### 4. **Tabular Numerals Always**
- All prices use `.numeric` class
- Ensures alignment across rows/cards
- Professional financial appearance

### 5. **Auto-Detection Smart Defaults**
- Status calculated if not provided
- Strategy width from percentage
- Dot position from price calculation
- Developer-friendly API

---

## Testing Checklist

### Visual Regression
- [ ] List variant in pool table rows
- [ ] Card variant in pool grid cards
- [ ] Both variants on all status states
- [ ] All strategy widths (30%, 65%, 100%)
- [ ] Dot positioning at min/max/center
- [ ] Animations (heartbeat, glow)

### Responsive
- [ ] List variant in narrow tables
- [ ] Card variant on mobile
- [ ] Min-width constraints respected
- [ ] Text wrapping behavior

### Dark Mode
- [ ] All opacity levels correct
- [ ] Status colors visible
- [ ] Glow effects work
- [ ] Background transparency

---

## Benefits of Unification

### ✅ Developer Experience
- Single component to learn
- Consistent API across app
- Self-documenting props
- TypeScript autocomplete
- Clear variant names

### ✅ Design Consistency
- Same visual language everywhere
- Predictable behavior
- Easy to maintain
- Single source of truth

### ✅ Performance
- No duplicate code
- Smaller bundle size
- Easier to optimize
- Cached component logic

### ✅ User Experience
- Consistent mental model
- Recognizable across pages
- Professional appearance
- Trustworthy brand

---

## Future Enhancements

### Potential Additions
- [ ] Animation variants (subtle/pronounced)
- [ ] Size variants (small/medium/large)
- [ ] Custom color overrides for white-label
- [ ] Accessibility improvements (ARIA labels)
- [ ] Tooltip on hover (show exact percentages)
- [ ] Click interaction (expand details)

### Considerations
- Keep variants minimal (don't over-engineer)
- Maintain single source of truth
- Document any new variants thoroughly
- Test across all existing uses

---

## Support & Questions

**Design System Owner**: Liquilab Product Team
**Component Location**: `/components/Rangeband.tsx`
**Documentation**: `/pages/RangeBandDS.tsx` & `/guidelines/Guidelines.md`
**Questions**: Check design system page first, then Guidelines.md

---

**Last Updated**: November 2024
**Version**: 2.0 (Unified)
**Status**: ✅ Production Ready

---

## Quick Reference

```tsx
// Quick copy-paste templates

// Table row usage
<Rangeband 
  variant="list"
  currentPrice={position.currentPrice}
  minPrice={position.minPrice}
  maxPrice={position.maxPrice}
  strategyLabel={`Balanced (${position.strategyPercent})`}
  pairLabel={`${position.token1}/${position.token2}`}
/>

// Card/Hero usage
<Rangeband 
  variant="card"
  currentPrice={currentPrice}
  minPrice={minRange}
  maxPrice={maxRange}
  strategyLabel="Balanced (25.0%)"
  pairLabel="WFLR/FXRP"
/>
```

Happy building! 🎨✨
