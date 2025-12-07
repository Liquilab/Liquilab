# Position Pro - Data States Test Guide 🎯

**File**: `/pages/PositionProPage.tsx`  
**Route**: `/position/:id/pro`  
**Purpose**: Single LP position detail view with Pro analytics

---

## 🧪 Testing All Three Data States

### Location to Change State
**Line ~109** in `PositionProPage.tsx`:

```typescript
const positionDataState: DataState = 'ok'; // ⭐ CHANGE THIS VALUE
```

---

## ✅ STATE 1: OK (Full Data)

### Setup
```typescript
const positionDataState: DataState = 'ok';
```

### Expected UI Behavior
- ✅ **NO** data state banner visible
- ✅ FTSO disclaimer shown at top
- ✅ All analytics sections render with full data:
  - Position Header with quick stats
  - RangeBand Status & Performance
  - Fee Earnings Breakdown
  - Impermanent Loss Tracking
  - Position Events History
  - Peer Comparison (Pro)
  - Insights & Recommendations
- ✅ All charts display real data
- ✅ All metrics have numeric values

### Screenshot Checklist
- [ ] Full page scroll capture showing all sections
- [ ] FTSO disclaimer visible at top
- [ ] RangeBand component with In Range badge
- [ ] Fee earnings chart with bars + cumulative line
- [ ] IL comparison chart with HODL vs LP areas
- [ ] Position events timeline with icons
- [ ] Peer comparison cards with checkmarks
- [ ] Insights section with recommendations

### Key Visual Elements
- **Header**: Token pair icons, Position #18745, badges (Pro, In Range)
- **Quick Stats**: 5-column grid with position value, fees, APR, days active, efficiency
- **Time Toggle**: 7D / 30D / 90D selector (top right)
- **RangeBand**: Card variant with status dot, min/max prices
- **Charts**: Professional Recharts with navy/blue theme

---

## ⚠️ STATE 2: WARMING (Partial Data)

### Setup
```typescript
const positionDataState: DataState = 'warming';
```

### Expected UI Behavior
- ⚠️ **WARMING BANNER** visible below breadcrumb
  - Yellow/amber border (`border-[#F59E0B]/30`)
  - Spinner icon (animated)
  - Text: "Position data warming up — some analytics are based on partial history while we build the full 7-day dataset."
  - "Partial Data" badge
- ✅ FTSO disclaimer still shown
- ✅ Most sections render with data
- ⚠️ **Peer Comparison section replaced** with `WarmingPlaceholder`:
  - Title: "Peer Comparison Analytics"
  - Description: "Building comparison dataset across similar positions in this pool"
  - Skeleton loaders (animated pulse)
  - Warning: "Building 7-day history — available soon"

### Screenshot Checklist
- [ ] Warming banner at top (yellow theme)
- [ ] FTSO disclaimer below banner
- [ ] All sections render EXCEPT Peer Comparison
- [ ] WarmingPlaceholder component for Peer Comparison
- [ ] Skeleton loader animation visible
- [ ] "Building 7-day history" message

### Key Visual Elements
- **Banner**: Yellow gradient with Loader2 spinner icon
- **Placeholder**: Greyed-out card with pulse animation
- **Badge**: "Partial Data" in amber colors
- **Rest of page**: Identical to OK state

---

## ❌ STATE 3: EMPTY (No Data)

### Setup
```typescript
const positionDataState: DataState = 'empty';
```

### Expected UI Behavior
- ❌ **EARLY RETURN** - Only shows empty state component
- ❌ No position analytics sections rendered
- ✅ Shows `DataStateBanner` with state='empty':
  - Large centered icon (AlertCircle in Electric Blue circle)
  - Heading: "Not Enough History Yet"
  - Message: "We don't have enough history yet to show detailed analytics for this position. Check back soon as we build the dataset."
  - Clean, centered layout

### Screenshot Checklist
- [ ] Breadcrumb ("Back to My Portfolio")
- [ ] Large empty state card (centered)
- [ ] AlertCircle icon in blue circle (64px)
- [ ] Clear heading and message
- [ ] NO other content visible below

### Key Visual Elements
- **Icon Circle**: 64px, `bg-[#3B82F6]/20`, Electric Blue icon
- **Card**: `bg-[#0F1A36]/95`, `border-white/10`, rounded-xl, p-12
- **Typography**: 
  - h3: `text-white/95`
  - p: `text-white/70`, max-w-md, centered
- **Clean**: Minimalist, no clutter

---

## 🎨 Design Consistency Checklist

### All States Share:
- ✅ Same breadcrumb component
- ✅ Same navy background (`#0B1530`)
- ✅ Same Electric Blue primary color (`#3B82F6`)
- ✅ Same border styling (`border-white/10` for cards)
- ✅ Same typography system (no font-size/weight classes)
- ✅ Same spacing system (mb-6, mb-8, p-8)
- ✅ Same Recharts theme (navy tooltips, white/58 text)

### FTSO Disclaimer:
- ✅ Shows in OK state
- ✅ Shows in WARMING state
- ❌ NOT shown in EMPTY state (early return)

### Data State Banner:
- ❌ NOT shown in OK state
- ✅ Shown in WARMING state (yellow)
- ✅ Shown in EMPTY state (blue, centered)

---

## 📸 Screenshot Workflow

### For Each State:
1. **Change state variable** in line ~109
2. **Navigate to** `/#/position/18745/pro`
3. **Wait 2 seconds** for animations to settle
4. **Full page scroll capture**:
   - Start at top (breadcrumb visible)
   - Scroll to bottom (insights section)
   - Capture entire viewport
5. **Save as**:
   - `Liquilab-PositionPro-OK.png`
   - `Liquilab-PositionPro-Warming.png`
   - `Liquilab-PositionPro-Empty.png`

### Screenshot Dimensions:
- **Width**: 1400px (max-width of content)
- **Height**: Full scroll (varies by state)
- **Format**: PNG
- **Quality**: 100%

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `/components/DataStateBanner.tsx` | Banner + placeholder components |
| `/components/DataSourceDisclaimer.tsx` | FTSO oracle disclaimer |
| `/pages/PoolDetailProPage.tsx` | Pool-level Pro analytics (similar pattern) |
| `/pages/PoolUniversePage.tsx` | Universe-level analytics (similar pattern) |

---

## 🚀 Demo Data Notes

### Position Metadata:
- **Token Pair**: WFLR / FXRP
- **Position ID**: #18745
- **DEX**: ENOSYS
- **Fee Tier**: 0.3%
- **Range**: $0.98 - $1.93
- **Current Price**: $1.275
- **Strategy**: Balanced (65.3% width)
- **Mint Date**: 2024-11-15 (15 days active)

### Key Metrics:
- **Position Value**: $73,000
- **Total Fees Earned**: $5,420
- **Unclaimed Fees**: $2,130
- **Realized APR (30D)**: 20.1%
- **Range Efficiency**: 86%
- **Impermanent Loss**: -1.8%
- **Net P&L**: +$3,540

### Peer Comparison:
- All 5 metrics show user outperforming peers
- Top 15-35% percentile across all metrics
- Green checkmarks for all better-than-median stats

---

## ✨ Pro Features Highlighted

1. **RangeBand Visualization** - Card variant with live status
2. **Fee Earnings Timeline** - Dual-axis chart (daily + cumulative)
3. **Impermanent Loss Tracking** - HODL vs LP comparison
4. **Position Events History** - Full mint/claim/burn timeline
5. **Peer Comparison** - Benchmark against similar positions
6. **Health Insights** - AI-generated recommendations

---

## 🎯 Success Criteria

### Before Screenshots:
- [ ] All three states tested manually in browser
- [ ] No console errors
- [ ] All links functional (breadcrumb, CTAs)
- [ ] Time range toggle works (7D/30D/90D)
- [ ] Charts render without errors
- [ ] Animations smooth (spinner, pulse)

### Screenshot Quality:
- [ ] Full resolution (1400px content width)
- [ ] All text readable
- [ ] Colors accurate (navy bg, blue accents)
- [ ] No UI glitches or overlaps
- [ ] Animations captured (if relevant)

### Documentation:
- [ ] State variable location documented
- [ ] Expected behavior per state documented
- [ ] Visual differences clearly described
- [ ] Screenshot naming convention followed

---

**Last Updated**: 2024-11-30  
**Tested By**: [Your Name]  
**Ready for IP Documentation**: ✅
