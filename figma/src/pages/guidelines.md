# Liquilab - Component & Architecture Guidelines

## Project Overview
**Liquilab** is een premium DeFi liquidity analytics app voor Flare (Ēnosys & SparkDEX) met een moderne fintech/B2B SaaS uitstraling. Het design is rustgevend en vertrouwenwekkend, gericht op een breed publiek met een professionele maar toegankelijke navy achtergrond (#0B1530).

---

## 🎨 Design System

### Kleuren

#### Primary & Semantic
- **Electric Blue**: `#3B82F6` - Interactive elementen, links, buttons, active states
- **Signal Aqua**: `#1BE8D2` - Bullets, opsommingen, badges, checkmarks, accent elementen
- **Success**: `#10B981` - Positieve APR, in-range status, positieve PnL, range efficiency
- **Warning**: `#F59E0B` - Near-range warnings, gematigde alerts
- **Error**: `#EF4444` - Negatieve APR, out-of-range status, negatieve PnL

**BELANGRIJK**: Gebruik semantic kleuren ALLEEN voor:
- APR waarden (positief/negatief)
- RangeBand status indicators (in/out of range)
- Range boundary visualisaties
- PnL waarden (positief/negatief)
- Performance metrics (Range Efficiency)

#### Blauw Varianten

**Chart Event Kleuren:**
- **Slate Gray**: `#CBD5E1` - Voor "Liquidity Added" events
- **Electric Blue**: `#3B82F6` - Voor "Fees Claimed" events
- **Navy Blue**: `#1E3A8A` - Voor "Liquidity Removed" events

**Overlay & Backgrounds:**
- **Primary /20**: `#3B82F6` @ 20% opacity - Icon backgrounds, overlays
- **Primary /50**: `#3B82F6` @ 50% opacity - Hover borders
- **Primary Solid**: `#3B82F6` @ 100% - Active states, buttons, focus borders

#### Wit Varianten

**Text Opacity:**
- **white/95**: `rgba(255, 255, 255, 0.95)` - Primary text (hoofdtekst, headings)
- **white/70**: `rgba(255, 255, 255, 0.70)` - Secondary text (subtekst, descriptions)
- **white/[0.58]**: `rgba(255, 255, 255, 0.58)` - Tertiary/labels (labels, hints, timestamps)

**Surfaces & Borders:**
- **#0F1A36/95**: `rgba(15, 20, 36, 0.95)` - Card surface
- **white/10**: `rgba(255, 255, 255, 0.10)` - Card borders (grijs-wit voor alle cards)
- **white/5**: `rgba(255, 255, 255, 0.05)` - Table borders (subtiele scheiding tussen rijen)

#### Background
- **Navy canvas**: `#0B1530` - Main app background

#### Color Usage Rules
- **Electric Blue (`#3B82F6`)**: Interactive elementen, links, buttons, active states, hover borders
- **Signal Aqua (`#1BE8D2`)**: Bullets, opsommingen, badges, checkmarks, accent elementen
- **Success (`#10B981`)**: ALLEEN voor positieve APR, in-range status, positieve PnL, range efficiency
- **Warning (`#F59E0B`)**: ALLEEN voor near-range warnings en gematigde alerts
- **Error (`#EF4444`)**: ALLEEN voor negatieve APR, out-of-range status, negatieve PnL
- **Grijs-wit borders**: Alle cards (`white/10`), tables (`white/5`), hover → Primary/50

**KPI Cards**: Minimalistische vormgeving voor rustig beeld
- **GEEN iconen** in card headers - alleen clean typografie
- Card titel: `text-xs text-white/[0.58]` (12px, tertiary opacity)
- Grote waarde: `text-white/95 numeric` met inline fontSize (meestal 32px)
- Badges (optioneel): Onder de grote waarde voor context
- Subtekst: `text-xs text-white/[0.58]` voor extra details
- **Uitzondering**: Icon containers zijn WEL toegestaan in promotie cards en speciale feature highlights

**Voorbeeld Clean KPI Card**:
```tsx
{/* Minimal KPI Card - GEEN icoon */}
<div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
  <div className="text-white/[0.58] text-xs mb-2">Total Portfolio Value</div>
  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
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

**Sectie Titels**: Clean typografie zonder iconen
- **GEEN iconen** naast h2/h3 titels in content secties
- Gebruik alleen semantic HTML: `<h2 className="text-white/95">Section Title</h2>`
- Badges (zoals "Pro") mogen WEL naast titels staan
- **Uitzondering**: Promotie cards en feature highlights mogen icon containers gebruiken

**Tab Titels**: Minimalistisch zonder iconen
- **GEEN iconen** in tab labels (bijv. "My Positions", "Performance & Analytics")
- Alleen tekst + optioneel badge
- Focus op clean typografie en duidelijke active states

**Chart Legend Bullets**: Grijswit → Electric Blue → Navy gradient met witte border
- Liquidity Added: `bg-[#CBD5E1] border border-white/40` (slate gray)
- Fees Claimed: `bg-[#3B82F6] border border-white/40` (electric blue)
- Liquidity Removed: `bg-[#1E3A8A] border border-white/40` (navy blue)

**Chart Reference Lines**:
- Current Price: Success Green `#10B981` (solid line)
  - Label: "Current Price $X,XX" (op 1 lijn, onder de groene lijn, in grijs-wit `rgba(255, 255, 255, 0.70)`)
- Min/Max Price: Error Red `#EF4444` (dashed lines)
- Labels: "Min Price: $X.XX", "Max Price: $X.XX"

### Typografie
- **Headings**: Manrope (sans-serif, modern)
- **Body**: Manrope (clean, readable)
- **Numbers**: Tabular numerals voor stabiele uitlijning (gebruik `numeric` class)

### Icon Containers & Bullets ⭐ CONSISTENCY RULE

**Icon Containers** (vierkant met afgeronde hoeken):
- **ALTIJD** Electric Blue achtergrond: `bg-[#3B82F6]/20`
- Alleen de icoon kleur zelf mag variëren (groen/rood/aqua/etc. voor semantische betekenis)
- Formaat: `w-10 h-10` (klein), `w-12 h-12` (medium), `w-14 h-14` (groot)
- Styling: `rounded-lg flex items-center justify-center`
- **BELANGRIJK**: Nooit `bg-[#10B981]/20`, `bg-[#1BE8D2]/20`, `bg-[#F59E0B]/20`, of `bg-[#EF4444]/20` - ALTIJD `bg-[#3B82F6]/20`

**Voorbeeld Icon Containers**:
```tsx
{/* Electric Blue container met groene success icon */}
<div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
  <CheckCircle2 className="size-6 text-[#10B981]" />
</div>

{/* Electric Blue container met rode error icon */}
<div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
  <XCircle className="size-6 text-[#EF4444]" />
</div>

{/* Electric Blue container met aqua accent icon */}
<div className="w-14 h-14 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
  <ExternalLink className="size-7 text-[#1BE8D2]" />
</div>
```

**Bullets voor Opsommingen**:
- **ALTIJD** Signal Aqua ronde bullets: `w-1.5 h-1.5 rounded-full bg-[#1BE8D2]`
- Positioning: `flex-shrink-0 mt-1.5` (voor alignment met eerste regel tekst)
- Gebruik GEEN CheckCircle2 iconen voor gewone opsommingen
- CheckCircle2/XCircle ALLEEN voor grote UI elementen zoals card headers

**Voorbeeld Bullets**:
```tsx
{/* Correcte Signal Aqua bullet */}
<div className="flex items-start gap-2">
  <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
  <span className="text-white/70">List item text</span>
</div>

{/* FOUT: CheckCircle2 als bullet - NIET DOEN */}
<div className="flex items-start gap-2">
  <CheckCircle2 className="size-5 text-[#1BE8D2]" /> {/* FOUT */}
  <span className="text-white/70">List item text</span>
</div>
```

**Wanneer CheckCircle2/XCircle WEL gebruiken**:
- Card/section headers (met icon container)
- Grote status indicators
- Before/After vergelijkingen
- Hero sections

### Promotie Cards 🎁 UPSELL PATTERN

**Gebruik** voor Pro/Premium feature teasers, upgrade prompts, en promotional content.

**Visuele Kenmerken**:
- **Gradient background**: `bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20`
- **Border**: `border border-[#3B82F6]/30` (Electric Blue met transparantie)
- **Afronding**: `rounded-xl` (grotere radius dan normale cards)
- **Padding**: `p-8` (ruimer dan standaard cards voor "premium" gevoel)

**Layout Anatomy**:
```tsx
<div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8">
  <div className="flex items-start gap-4">
    {/* Icon Container - Electric Blue */}
    <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
      <Lock className="h-6 w-6 text-[#3B82F6]" />
    </div>
    
    {/* Content */}
    <div className="flex-1">
      {/* Header met badge */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-white/95">Unlock Pro Analytics</h3>
        <Badge className="bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30">Pro</Badge>
      </div>
      
      {/* Description */}
      <p className="text-white/70 mb-4">
        Get deeper insights with advanced APR tracking, peer comparisons, and predictive range analytics.
      </p>
      
      {/* CTA */}
      <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2">
        Upgrade to Pro
        <ArrowRight className="size-4" />
      </Button>
    </div>
  </div>
</div>
```

**Typography in Promotie Cards**:
- **Heading**: Semantic `<h3>` met `text-white/95` (geen font-weight classes)
- **Description**: `text-white/70` voor contrast
- **Button**: Default button typography (geen custom classes)

**Badge Styling**:
- Signal Aqua variant: `bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30`
- Voor Pro/Premium badges
- Small text, compact padding

**Icon Keuzes**:
- Lock (gesloten feature)
- Zap (power/performance upgrade)
- TrendingUp (analytics/growth features)
- Sparkles (premium features)

**Voorbeelden in app**:
- WalletOverview.tsx: "Unlock Pro Analytics" teaser
- AccountPage.tsx: "Upgrade to Pro" section
- PoolDetailPage.tsx: "PRO Analytics" button

**BELANGRIJK**:
- Gebruik dit patroon ALLEEN voor upsell/promo content
- Gradient maakt het visueel onderscheiden van normale cards
- Ruime padding geeft "premium" gevoel
- Electric Blue → Signal Aqua gradient volgt brand DNA

---

## 📁 Component Overzicht

### Core Components (`/components/`)

#### **Navigation.tsx**
- Main navigation bar
- Props: `walletConnected: boolean`, `planType: string`
- Features: Logo, menu items (Overview, My Portfolio, RangeBand™, Pricing, FAQ), wallet status, plan badge
- **Account Dropdown** (rechtsboven, alleen zichtbaar when walletConnected):
  - Hover/click menu met opties: Your plan, Billing, Contact support, Log out
  - DropdownMenu component van ShadCN
  - Icons: User, CreditCard, HelpCircle, LogOut
  - Dark theme styling (bg-[#0F1A36]/98, border-white/10)
- Styling: Navy met Electric Blue accenten, sticky top navigation

#### **PoolCard.tsx**
- Card view van een liquidity pool (voor grid layout)
- Props: `currentPrice`, `minPrice`, `maxPrice`, `strategyPercent`, `token1`, `token2`, `poolId`, `fee`, `dex`
- Features: Token pair icon, TVL, incentives, unclaimed fees, APR, RangeBand visualisatie
- **Time period indicators**: "24H" (niet "24u"), geselecteerde periode in wit, overige in text-white/40
- **Typography & Sizing**:
  - **$ bedragen**: 16px (default body size) - bijv. "$24,580", "$458"
  - **Token breakdowns**: 12px (`text-xs`) - bijv. "370 XRP", "1.254 USDT0"
  - Alle token breakdowns gebruiken `text-xs` direct op `<p>` tags, NIET via wrapper divs
  - Dit garandeert consistente fontgrootte met alle andere breakdowns (bijv. "127 rFLR" in Incentives)
- **Key Data Fields**: `tvlUsd`, `unclaimedFeesUsd`, `incentivesUsd`, `apr24hPct`, `token1`, `token2`, `poolId`, `fee`, `dex`, `currentPrice`, `minPrice`, `maxPrice`, `strategyPercent`, `bandColor` (status), `positionRatio`
- Styling: Grijs-wit border (`border-white/10`), hover naar Electric Blue (`hover:border-[#3B82F6]/50`), afgeronde hoeken

#### **PoolTable.tsx**
- Table rows voor pool list view
- Components: `PoolTableHeader`, `PoolTableRow`
- Features: Sorteerbare kolommen, hover states, inline RangeBand
- **Typography & Sizing**:
  - **$ bedragen**: 16px (default body size) - bijv. "$24,580", "$458"
  - **Token breakdowns**: 12px (`text-xs`) - bijv. "370 XRP", "1.254 USDT", "127 rFLR"
  - Token aantallen gebruiken **ALTIJD** `text-xs` (12px)
  - Dit is kleiner dan de $ bedragen (default 16px) en garandeert visuele hiërarchie
  - Geldt voor TVL, Unclaimed Fees, en Incentives kolommen
- **Key Data Fields**: `tvlUsd`, `unclaimedFeesUsd`, `incentivesUsd`, `apr24hPct`, `token1`, `token2`, `poolId`, `fee`, `dex`, `currentPrice`, `minPrice`, `maxPrice`, `strategyPercent`, `bandColor` (status), `positionRatio`
- **Styling**: 
  - Grijs-wit border (`border-white/5`) zonder afgeronde hoeken
  - KPI rij en RangeBand rij in één container - seamless zonder scheiding
  - Hover effect werkt op beide rijen samen (gedeelde hover state)

#### **Rangeband.tsx** ⭐ UNIFIED DESIGN SYSTEM
- **Kerncomponent**: Visualiseert price range van LP positie - het unieke selling point van Liquilab!
- **Props**: `minPrice`, `maxPrice`, `currentPrice`, `status?`, `strategyLabel`, `pairLabel`, `variant`, `className?`
- **THREE LAYOUT VARIANTS** (identieke visuele DNA, verschillende schalen):

**Element Order (ALL VARIANTS)**:
1. Strategy label (e.g., "Balanced (25.0%)")
2. Horizontal band with glowing status dot
3. Min/max price labels (positioned UNDER band ends)
4. Current price (large, centered)
5. Pair label (e.g., "WFLR/FXRP")
6. Caption: "Powered by RangeBand™"

**Variant 1: List** (`variant="list"`)
- **Voor**: Table rows, "My Positions" - occupies ~60% of row width, centered in RangeBand column
- **Layout**: Compact, vertical stack
  - Strategy label (top left)
  - Band (centered, 30/65/100% width based on strategy)
  - Min/max under band ends (10px text)
  - Current price centered (16px)
  - Pair label centered (12px)
  - Caption (bottom right, 10px)
- **Dot**: 14px
- **Max width**: 600px, auto-centered
- **Gebruik**: PoolTable rows, My Positions tables

**Variant 2: Card** (`variant="card"`)
- **Voor**: Pool cards, mobile cards, grid views
- **Layout**: Vertical with breathing room
  - Strategy label (centered, 14px)
  - Band (centered with min-width 160px)
  - Min/max under band ends (11px text)
  - "CURRENT PRICE" label
  - Current price (24px, centered)
  - Pair label (14px)
  - Caption (centered, 10px)
- **Dot**: 21px
- **Width**: Full card width
- **Gebruik**: PoolCard, mobile views, marketing cards

**Variant 3: Hero** (`variant="hero"`)
- **Voor**: Marketing pages, hero sections, large demos
- **Layout**: Wide, prominent
  - Strategy label (centered, 16px)
  - Thicker band (3px line)
  - Min/max under band ends (12px text)
  - "CURRENT PRICE" label
  - Current price (32px, centered)
  - Pair label (16px)
  - Caption (centered, 12px)
- **Dot**: 28px
- **Width**: Full section width
- **Gebruik**: RangeBand Explainer demo, Pool Detail hero, homepage

**Shared Design (alle variants)**:
- **Band widths**: 30% (Aggressive <12%), 65% (Balanced 12-35%), 100% (Conservative >35%)
- **Status colors**: 
  - In Range: #10B981 (green) - glow + heartbeat animation
  - Near Band: #F59E0B (amber) - glow + slow heartbeat
  - Out of Range: #EF4444 (red) - no glow, no animation
- **Dot positioning**: Smart calculation based on current price within min/max range
- **Typography**: All prices use tabular numerals (.numeric class)
- **Background**: Transparent - works on cards, tables, hero sections with wave imagery
- **Auto-detect status**: Automatically calculates status from prices if not provided
- **Consistency**: All variants feel like the SAME component, just resized

**Design System Page**: `/rangeband-ds` - Showcases all three variants with status states and context examples

#### **TokenIcon.tsx**
- Token icons en token pair visualisatie
- Components: `TokenIcon`, `TokenPairIcon`
- Props: `symbol`, `size` (small/medium/large)
- Features: Fallback naar eerste letter, overlapping pair icons
- Styling: Circular, gradient backgrounds per token

#### **WaveBackground.tsx**
- Animated water wave hero background
- Used on: HomePage, key landing sections
- Features: Beslaat onderste 40-50% van fold, subtle animation
- Styling: Gradient met Electric Blue/Signal Aqua

#### **CookieBanner.tsx**
- Cookie consent banner
- Features: localStorage persistence, dismiss functionaliteit
- Styling: Fixed bottom, navy met blur effect

#### **ScreenshotButton.tsx**
- Floating screenshot capture button
- Features: html2canvas integration, auto-download PNG
- Styling: Fixed bottom right, rounded button met hover effects
- Usage: App.tsx (global)

#### **OverviewButton.tsx**
- Floating navigation button naar Component Overview
- Features: Navigeert naar `/overview`, hidden op overview page zelf
- Styling: Fixed bottom left, rounded button matching ScreenshotButton
- Usage: App.tsx (global)

#### **Icons.tsx**
- Centralized icon exports from lucide-react
- Export: Named exports van veelgebruikte iconen
- Usage: `import { IconName } from './components/Icons'`

#### **RangeBandIcon.tsx** ⭐
- **Official RangeBand™ brand icon**
- Props: `size` (default: 24), `className`
- Features: Gebruikt het officiële RangeBand™ icoon (Figma asset)
- **BELANGRIJK**: Gebruik altijd dit icoon voor alle RangeBand™ referenties in de UI
- Usage: Navigation, ComponentOverview, AccountPage (RangeBand Alerts), PricingPage (Alerts add-on)
- Styling: Transparant PNG, werkt op alle backgrounds
- Import: `import { RangeBandIcon } from './components/RangeBandIcon'`

---

### UI Components (`/components/ui/`)
ShadCN components - zie de originele instructies voor details.

Belangrijkste in gebruik:
- **Button**: Primary actions, verschillende variants
- **Badge**: Status indicators, plan labels
- **Tabs**: View switching (list/grid, timeframes)
- **Select**: Filters (DEX, strategy)
- **Input**: Search, form fields
- **Alert/AlertDialog**: Confirmaties, warnings
- **Accordion**: FAQ section
- **Sonner (toast)**: Notifications

---

## 📄 Pages Overview (`/pages/`)

### **HomePage.tsx**
- Hero met WaveBackground
- Value propositions (3 kolommen)
- Feature highlights
- CTA naar Pricing
- Gebruikt: WaveBackground, badges, icons

### **PoolsOverview.tsx** 🎛️ CONTROL ROOM
- **Header**: "Liquidity Pools" titel met beschrijving
- **KPI Cards** (4 metrics): Total TVL, Active Pools, 24H Volume, Avg APR
  - Card styling: bg-[#0F1A36]/95, border-white/10, rounded-xl
  - Icons in Electric Blue circles (bg-[#3B82F6]/20)
  - Trend badges waar relevant (success/error kleuren)
- **Filter Card** - Prominente separate card met titel "Filter pools"
  - **Sort Control**: Rechts bovenaan, "Sort by:" dropdown
    - Options: TVL (default), 24H fees, 7D APR, Newest
  - **Search Field**: Large input met Search icon, placeholder "Search by token, pair, or pool ID…"
  - **Filter Chips**: Pill-style met Electric Blue filled selected state
    - DEX filters: All DEXs, Ēnosys, SparkDEX
    - Strategy filters: All strategies, Aggressive, Balanced, Conservative
    - "More filters" button voor advanced filters
  - Inactive chips: bg-[#0B1530], border-white/10, hover effects
  - Active chips: bg-[#3B82F6], text-white, no border
- **List/Grid Toggle** - Prominent, rechts uitgelijnd
  - Container: bg-[#0F1A36]/95, border-white/10, rounded-lg, padding 1.5, shadow-lg
  - Two pill buttons met icons (List/Grid) + labels
  - Active state: bg-[#3B82F6], text-white, shadow-md, font-medium
  - Inactive state: text-white/70, hover:text-white/95, hover:bg-white/5
  - Larger padding (px-6 py-3) voor prominentie
- **Pools List View**: PoolTable component met seamless rows
- **Pools Grid View**: PoolCard components in 3-column grid
- **Empty State**: "No pools match your filters" met "Clear filters" CTA
- **Filter Logic**: Prepared state management (search, dex, strategy, sort)
- Gebruikt: Badge, Select, Input, Button, PoolTable, PoolCard, icons

### **PoolDetailPage.tsx**
- Pool header met token pair, stats
- **PRO Analytics button** (Premium users only) - links naar PRO view
- **EYECATCHER**: Price chart met RangeBand range lines overlay
- Earnings overview (4 KPI cards)
- RangeBand Status visualisatie
- **My Positions table** (wallet-specific positions in pool)
  - **Rijkere Position kolom**: Token pair icons, provider info (ENOSYS | ID#), range prijzen, mint datum
  - **RangeBand kolom**: min-w-[320px], geen scaling, full component met labels
  - Gelaagde text hierarchy met tabular numerals
- Pool activity timeline
- Features: Recharts voor charts, interactive tooltips, data states (loading/empty/error)
- Gebruikt: Rangeband, TokenPairIcon, LineChart, badges

### **PoolDetailProPage.tsx** 🌟 PRO
- **PRO variant** van Pool Detail met geavanceerde analytics
- Pool header met PRO badge + **Standard View button** - links terug naar basic view
- **Global time-range toggle** (24h/7D/30D/90D) - drives ALL analytics
- Price & Range Analysis:
  - Chart met range overlay
  - Period metrics: avg price, volatility, time in/out of range
- **PRO KPI strip**: 6 cards (fees, incentives, total earned, realized APR, realized PnL, range efficiency)
- **RangeBand Status** in hero variant:
  - Large centered RangeBand component
  - Strategy details with width %
  - Status badge (In Range/Near Band/Out of Range)
  - Key stats: days in range, efficiency %, out-of-range events
- **Risk & Range Insights** (PRO-only):
  - Risk profile (Aggressive/Balanced/Conservative)
  - Sensitivity badges (downside/upside %)
  - Contextual insights and recommendations
- **My Positions table** (identiek aan Standard View):
  - **Rijkere Position kolom**: Token pair icons, provider info (ENOSYS | ID#), range prijzen, mint datum
  - **RangeBand kolom**: min-w-[320px], geen Actions kolom, full component weergave
  - Gelaagde text hierarchy met tabular numerals
- **Pool Activity** (wallet-filtered)
- **Data states**: loading, empty (with CTA), error, degraded (stale data banner)
- Route: `/pool/:id/pro`
- Gebruikt: Rangeband, TimeRangeToggle, Recharts, PRO badges

### **PoolUniversePage.tsx** 🌌 POOL UNIVERSE (PRO)
- **PRO deep analytics** voor één token pair (e.g. WFLR/USDT0)
- Shows how entire pool behaves across all LPs, DEXes en fee tiers
- Back button naar Pool Detail Pro
- **Hero Section** - State of the Pool:
  - Token pair header met "Universe View" titel
  - "Pro · Pool Universe Analytics" badge
  - Global time-range toggle (24h/7D/30D/90D) - drives ALL analytics
  - 6 KPI tiles: Total TVL, Volume, Fees, Pool APR, Active Positions, Active Wallets
- **DEX & Fee-tier breakdown** (2 cards side-by-side):
  - DEX breakdown: Bar chart + table (TVL, Volume, Fees, APR per DEX)
  - Fee-tier breakdown: Chart + table per tier (0.05%, 0.3%, 1%)
  - Interpretive hints about sweet spots
- **LP Population & Concentration**:
  - Wallet-size distribution (Retail/Mid/Whale donut chart)
  - Top 1 / Top 10 wallet share metrics
  - Position count over time + churn analysis
  - Average position tenure
- **RangeBand™ Landscape**:
  - Strategy distribution (Aggressive/Balanced/Conservative pie chart)
  - Current range status (In/Near/Out pie chart)
  - Crowded price zones heatmap
  - Liquidity concentration insights
- **Fee & APR Distribution**:
  - Realized APR histogram
  - Median APR, 25-75% range, fairness index
  - Missed fees estimation
  - % TVL with near-zero fees
- **Claim Behaviour & Cash-flow**:
  - Claim latency per wallet size bucket
  - Avg unclaimed fees % of TVL
  - Claim timing vs market events insights
- **Wallet Flows & Notable Moves**:
  - Net inflow/outflow chart
  - Top wallet TVL changes (masked IDs, Whale tags)
  - Allocation shifts (% reducing vs increasing exposure)
- **Market Regime & Volatility**:
  - Current regime (Low/Normal/High volatility)
  - Days in each regime
  - Volatility timeline with color-coded bars
- **"What This Means for You" Summary**:
  - 6 decision points linking universe data to user's position
  - Bullets for DEX/tier, range crowding, efficiency, flows, claim behaviour, regime alignment
  - CTAs: "View Your Position Analytics", "Back to Pools"
- Route: `/pool/:id/universe`
- Gebruikt: Recharts (BarChart, LineChart, PieChart), TokenPairIcon, TimeRangeToggle, PRO badges

### **WalletOverview.tsx**
- Wallet address display
- Portfolio stats (4 cards)
- Active positions table (PoolTable)
- Transaction history
- Gebruikt: Copy-to-clipboard, PoolTable, badges

### **RangeBandExplainer.tsx** 🎓 MARKETING & EDUCATION
- **Hero Section**:
  - Headline: "Introducing RangeBand™"
  - Subtitle: "Visual range monitoring that shows when your liquidity is in range, near the edge, or out of range"
  - Large hero RangeBand demo (Balanced strategy example)
  - Status indicators: In Range (green), Near Band (amber), Out of Range (red)
  - **CTAs**: "Try RangeBand™ on your pools" (primary), "Start 14-day trial" (secondary)
- **Sticky CTA Bar** (appears after scrolling past hero):
  - Fixed top position, bg-[#0F1A36]/98 met backdrop-blur
  - Text: "Ready to monitor your liquidity with RangeBand™?"
  - Buttons: "Start 14-day trial" (primary), "View pricing" (secondary)
  - Smooth slide-in animation
- **Strategy Cards** (3 columns):
  - Aggressive: Narrow range (< 12%), highest fees, daily monitoring, stable pairs
  - Balanced: Moderate range (12-35%), good balance, weekly checks, most pairs (Recommended badge)
  - Conservative: Wide range (> 35%), consistent fees, minimal monitoring, volatile pairs
  - Each uses RangeBand / Card variant
  - Tradeoff bullets: Range width, Fee capture, Monitoring needs, Best for
  - Signal Aqua bullets (#1BE8D2) met bold labels
- **How RangeBand™ Works** (4 steps):
  1. Set Your Range (min/max price boundaries)
  2. Monitor Price vs Range in Real-Time (continuous tracking)
  3. Receive Smart Alerts (Near Band / Out of Range notifications)
  4. Take Action (rebalance, add/remove liquidity)
  - Numbered boxes in Electric Blue, clear descriptions
- **Before & After Story Block**:
  - Two-column comparison card
  - Before: 40% time out of range, missed notifications, late decisions, ~$2,340 lost fees
  - After: 12% time out of range (88% efficiency), real-time monitoring, instant alerts, ~$8,240 earned
  - Visual badges: Poor (red) vs Excellent (green)
  - Demo data disclaimer
- **Final CTA Section**:
  - Gradient background card (Electric Blue → Signal Aqua)
  - "Ready to try RangeBand™?" headline
  - Primary: "View pools with RangeBand™"
  - Secondary: "View pricing"
  - Social proof: "Join 500+ liquidity providers..."
- Route: `/rangeband`
- Gebruikt: Rangeband component (hero + card variants), WaveBackground, Button, Badge, icons

### **PricingPage.tsx** 💰 REFINED & CLEAR
- **Hero Section** (3 pricing cards):
  - **Premium**: $14.95/month voor 5 pools, +$9.95 per 5 extra pools
  - **Pro**: $24.95/month voor 5 pools, +$14.95 per 5 extra pools (RangeBand™ alerts included)
  - **Enterprise**: Custom pricing, "Contact sales"
  - **Currency messaging**: Consistent micro-copy onder elke prijs: "Charged in EUR, shown in USD for reference"
  - **CTAs**: "Start 14-day trial" (Premium & Pro), "Contact sales" (Enterprise)
  - Most Popular badge op Premium card
- **Key Differences Strip** (boven Compare Plans table):
  - Gradient background card (Electric Blue → Signal Aqua subtle)
  - 3-column layout met icons (Gauge, TrendingUp, Building2)
  - Compacte bullets:
    - Premium: "5 pools, full analytics, RangeBand™ monitoring. Alerts available as add-on."
    - Pro: "Everything in Premium plus Pro analytics, RangeBand™ Alerts included, export-ready data."
    - Enterprise: "Custom limits, API access, bespoke reporting, SLA-backed support."
  - Easily scannable, reduces comparison table overload
- **Compare Plans Table** (Nansen-style):
  - 7 secties: Core access, Data & Analytics, RangeBand™ & Risk, Alerts & Reports, API access, Billing, Support
  - **14-day free trial badges**: Toegevoegd aan eerste 3 key rows (Wallet dashboard, Real-time data, RangeBand status) voor Premium en Pro columns
  - Trial badge: Success green (#10B981) met checkmark
  - **Pro-only features expliciet gelabeld**: "Full metrics (Pro)", "UI + export-ready (Pro)"
  - **Ruimere verticale whitespace**: mt-4 tussen section headers voor betere leesbaarheid
  - Sticky column headers, tooltips, Post-MVP badges
  - Checkmarks in Signal Aqua (#1BE8D2)
- **RangeBand™ Alerts Add-on Card**:
  - +$2.49/month per 5 pools (Premium only; included in Pro)
  - **Benefit sentence**: "Get instant notifications when your positions move near or out of range. Stay proactive with real-time alerts for better liquidity management."
  - Consistent EUR messaging: "Charged in EUR, shown in USD for reference"
  - Signal Aqua icon background + accent button
- **Footer Support Links**:
  - "View FAQ →" en "Check system status →"
  - Links naar /faq en /status
  - Centered layout met separator bullet
  - Supports hesitant buyers, completes buying journey
- Route: `/pricing`
- Gebruikt: Badge, Tooltip, Button, WaveBackground, gradient backgrounds, icons (Gauge, TrendingUp, Building2, Zap, ArrowRight)

### **AccountPage.tsx** 🎛️ SUBSCRIPTION CONTROL CENTER
- **Visual Hierarchy**: Clear separation tussen primary subscription zones en lighter utility sections
  - **PRIMARY ZONES** (subscription & billing):
    - Larger cards met gradient backgrounds
    - 2px Electric Blue border (#3B82F6/30)
    - Stronger headings with icons
    - Shadow-lg voor depth
  - **LIGHTER ZONES** (profile, notifications):
    - Slimmer cards (p-6 vs p-8)
    - Subtle borders (border-white/5)
    - Reduced opacity (bg-[#0F1A36]/80)
    - Smaller h3 headings (18px)
  - **DANGER ZONE**:
    - Red gradient background (from-red-500/5 to-red-500/10)
    - 2px red border (border-red-500/40)
    - AlertTriangle icon in red circle
    - Warning text over permanence

- **Subscription Section** (PRIMARY):
  - Icon header: TrendingUp icon + "Subscription & Billing"
  - **Current Plan Card**:
    - Plan name prominent (20px Quicksand)
    - **Subtitle per plan**: "Perfect for active LPs" / "For professional traders & teams" / "For teams, desks..."
    - Active badge (Success Green #10B981)
    - Next billing date + pricing (USD + EUR)
    - Plan features summary in grid
  - **"Upgrade to Pro" button**: Always Electric Blue primary style when visible (Premium users)

- **Pool Usage Card** (ENHANCED PRIMARY):
  - Icon header: Package icon + usage metrics
  - Large percentage indicator (24px)
  - Thick progress bar (h-3) met color coding:
    - Electric Blue (#3B82F6) when under 80%
    - Warning Amber (#F59E0B) when 80%+
  - **Two Upsell Routes Side-by-Side** (always visible, niet enkel bij warning):
    - **"Add 5 pools"**: Secondary button (neutral bg-[#0B1530], white borders, Package icon)
      - Subtitle: "+$X.XX/month per bundle"
    - **"Upgrade to Pro"**: PRIMARY Electric Blue button (#3B82F6, TrendingUp icon)
      - Badge: "Better value"
      - Subtitle: "Pro analytics, alerts included, export-ready data"
  - Near-limit warning: Compact alert met AlertTriangle icon (alleen messaging, geen buttons)
  - Remove bundle option: Ghost button onder upsell routes

- **RangeBand™ Alerts Add-on Card**:
  - Icon: Zap in Signal Aqua circle
  - **Benefit sentence**: "Never miss when your positions move near or out of range."
  - **IF INACTIVE** (Premium only):
    - Primary Signal Aqua button: "Add for $X.XX/month"
  - **IF ACTIVE**:
    - Success badge "Active"
    - Summary: "Monitoring alerts for X pools • $X.XX/month"
  - **Pro users**: Green info card "RangeBand™ Alerts Included" met Zap icon

- **Profile Section** (LIGHTER):
  - Connected wallet (read-only, verified badge)
  - Email address input + description
  - Timezone selector
  - "Save Changes" button

- **Notification Preferences** (LIGHTER):
  - Three toggle controls met **detailed descriptions**:
    - **Email Notifications**: "Receive account updates, billing notifications, and important system alerts"
    - **RangeBand™ Alerts**: "Get instant email alerts when your positions move near or out of range" + plan status
    - **Weekly Reports**: "Receive weekly summaries of pool performance, fees earned, and portfolio insights"
  - "Save Preferences" button

- **Developer Tools Section**:
  - Electric Blue border accent
  - Quick links: Screenshot Generator, Icon Showcase, RangeBand DS, Component Overview
  - Dev-focused styling

- **Danger Zone**:
  - Red-tinted gradient background
  - AlertTriangle icon in red circle
  - "Delete Account" label + warning text
  - Clear permanence warning: "⚠️ This action cannot be undone..."
  - AlertDialog confirmation flow

- Route: `/account`
- Gebruikt: Input, Select, Switch, AlertDialog, Button, Badge, Separator, Progress bar, icons (TrendingUp, Package, Zap, AlertTriangle)

### **FAQPage.tsx**
- FAQ accordion
- Contact section
- Gebruikt: Accordion (ShadCN)

### **LegalPage.tsx**
- Dynamic routing: `/legal/:page`
- Pages: terms, privacy, cookies, disclaimer
- Breadcrumb navigation
- Gebruikt: Link, dynamic content rendering

### **IconShowcase.tsx**
- Development tool: overzicht alle iconen
- Searchable icon grid
- Copy-to-clipboard functionaliteit
- Usage examples
- Stats (totaal iconen, default size, kleur systeem)

### **ScreenshotGeneratorPage.tsx** 🎨 DEV TOOL
- **Automated screenshot generation** voor alle pagina's
- **Uizard export workflow**: Genereert screenshots → downloads → upload naar Uizard
- Features:
  - Auto-navigatie door alle 14 pagina's (Core, Detail, Account, Info, Dev Tools)
  - Progress tracking met percentage
  - Individual & batch download
  - Success/error status per page
  - Direct link naar Uizard upload
- Technical:
  - Uses html2canvas voor screenshot capture
  - 2-second render delay per page
  - Hides floating UI elements during capture
  - Outputs PNG files met gestructureerde naming (Liquilab-01-HomePage.png)
- Gebruikt: html2canvas, Progress component, routing automation
- Access: Via `/screenshot-generator` of AccountPage Developer Tools section

### **RangeBandDS.tsx** 🎨 DESIGN SYSTEM
- **Design System showcase** voor de unified RangeBand™ component
- **Component Sheet**: Beide variants (List & Card) side-by-side met labels
- Features:
  - Variant overview met use cases
  - Status states showcase (In Range, Near Band, Out of Range)
  - Strategy width examples (Aggressive/Balanced/Conservative)
  - Usage contexts per variant
  - Complete design specifications (colors, typography, spacing)
- **Educational**: Laat developers precies zien hoe RangeBand werkt
- Used by: Developers, designers, product team
- Access: Via `/rangeband-ds` of AccountPage Developer Tools section

### **ComponentOverviewPage.tsx** 🗺️ OVERVIEW
- **Central navigation hub** voor alle Liquilab onderdelen
- Quick stats: totaal pagina's, componenten, UI components, categorieën
- **Pages Navigation**: Georganiseerd per categorie (Core, Info, Account & Tools)
  - Met beschrijvingen, badges (PRO/DEV), en route paths
  - Hover effects en klikbare cards naar elke pagina
- **Components Overview**: Herbruikbare componenten gegroepeerd per categorie
  - File paths, descriptions, en usage context
- **ShadCN UI Components**: Lijst van alle UI primitives in `/components/ui/`
- **Design System Resources**: Links naar globals.css en Guidelines.md
- **Global floating button** (OverviewButton): Links onderaan rechts, in dezelfde stijl als ScreenshotButton
- Access: Via `/overview`, floating button, of AccountPage Developer Tools section

---

## 🔐 Admin Dashboard (`/admin/`)

**BELANGRIJK**: De Admin sectie is VOLLEDIG gescheiden van de publieke Liquilab interface. Niet zichtbaar in navigation, footer, of andere publieke delen.

### **AdminLayout.tsx** (Component)
- Dedicated admin layout met eigen header, navigation, footer
- **Admin Header**:
  - Liquilab Admin logo + "Internal Dashboard" subtitle
  - "Admin Only" badge (red)
  - "Back to Public Site" link
- **Admin Navigation**: Horizontal tab-style navigation
  - Dashboard, System Status, Users, Analytics, Alerts, Settings
  - Active state: Electric Blue bottom border + background
  - Clean, professional admin aesthetic
- **Admin Footer**: Simple footer met last update timestamp
- Gebruikt: Badge, Link, icons (Activity, Users, BarChart3, Settings, Database, Bell)

### **AdminDashboard.tsx** (`/admin`)
- **Main admin landing page** - System overview
- **Key Metrics** (4 cards): Total Users, Premium Subscriptions, Monthly Revenue, System Uptime
  - Electric Blue icon backgrounds
  - Trend badges (success green)
  - Numeric displays met growth indicators
- **System Health Section**:
  - All services operational overview
  - Service cards: API Services, Database, FTSO Data Feed, Email Service
  - Status badges (Operational/Degraded/Outage)
  - Response time metrics
- **Recent Activity Feed**:
  - Latest 4 events: new subscriptions, alerts sent, data syncs, backups
  - Timestamp per event
  - Activity cards met beschrijvingen
- **Quick Actions**:
  - Run Manual Sync, Send Test Alert, View Error Logs
  - Hover effects op action cards
- Access: Direct via `/admin` URL (niet gelinkt in publieke site)

### **AdminStatusPage.tsx** (`/admin/status`)
- **Detailed system status monitoring** - Internal version
- **Overall Status Card**: Current system health badge
  - Operational/Degraded/Outage overall status
  - Status calculation based on all services
- **Services Section**: Detailed service monitoring
  - Database, Analytics MVs, Billing, Mail Service, Indexer
  - Per service: Status badge, uptime %, last check timestamp
  - Hover states on rows
- **Recent Incidents**:
  - Timeline van scheduled maintenance, investigating issues, resolved incidents
  - Status badges per incident (scheduled/investigating/resolved)
  - Colored dots: green (resolved), blue (scheduled), orange (investigating)
  - Date timestamps
- **Admin Footer Note**: Refresh rate info
- **Styling**: Consistent met Admin design system (navy, Electric Blue accents)
- Access: Via `/admin/status` (admin navigation)

---

## 🎯 Key Features & Patterns

### Routing Structure (HashRouter)
```
/ → HomePage
/pools → PoolsOverview
/pool/:id → PoolDetailPage
/pool/:id/pro → PoolDetailProPage (PRO analytics)
/pool/:id/universe → PoolUniversePage (PRO pool-wide analytics)
/koen → WalletOverview (demo wallet)
/rangeband → RangeBandExplainer
/pricing → PricingPage
/account → AccountPage
/faq → FAQPage
/legal/:page → LegalPage (terms, privacy, cookies, disclaimer)
/icons → IconShowcase (dev tool)
/screenshot-generator → ScreenshotGeneratorPage (dev tool)
/rangeband-ds → RangeBandDS (design system showcase)
/overview → ComponentOverviewPage (navigation hub)

# Admin Routes (Internal Only - NOT visible in public navigation)
/admin → AdminDashboard
/admin/status → AdminStatusPage
```

### Data Patterns
**Mock data** gebruikt voor:
- Pool listings
- Price history (charts)
- Transaction history
- Wallet balances

**Key metrics**:
- TVL (Total Value Locked)
- APR (Annual Percentage Rate)
- Unclaimed fees
- Incentives
- RangeBand status (in/out of range)

### Responsive Design
- Mobile-first approach
- Grid breakpoints: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Navigation collapses op mobile
- Tables worden scrollable
- Cards stack verticaal

### Animations & Interactions
- Hover effects: `hover:border-white/10`, `hover:scale-105`
- Transitions: `transition-all duration-300`
- WaveBackground: subtle animated gradient
- Smooth scrolling
- Copy-to-clipboard feedback (toast)
- **Links**: Clean styling zonder borders, hover state altijd Electric Blue
  - Standard links: `text-white/70 hover:text-[#3B82F6]`
  - Inline links: `text-[#3B82F6] hover:underline`
  - **Geen borders** op externe links zoals "View on Explorer"
  - **BELANGRIJK**: Signal Aqua (#1BE8D2) ALLEEN voor bullets/opsommingen, NIET voor links

---

## 🔧 Technical Stack

### Dependencies
- **React** + **TypeScript**
- **React Router** (HashRouter voor client-side routing)
- **Tailwind CSS v4** (via globals.css, geen config file)
- **Recharts** (voor charts)
- **Lucide React** (icons)
- **ShadCN UI** (component library)
- **Sonner** (toast notifications)

### File Structure Conventions
- Pages in `/pages/`
- Reusable components in `/components/`
- UI primitives in `/components/ui/`
- Global styles in `/styles/globals.css`
- Guidelines in `/guidelines/`

### Naming Conventions
- Components: PascalCase (e.g., `PoolCard.tsx`)
- Pages: PascalCase met "Page" suffix (e.g., `HomePage.tsx`)

---

## 🎨 Styling Guidelines

### Card Opacity
**Alle cards**: `bg-[#0F1A36]/95`
- PoolCard
- Stats cards
- Form sections
- Modals

### Typography Scale
**BELANGRIJK**: Gebruik GEEN Tailwind font-size/weight classes tenzij expliciet gevraagd!
- Defaults komen uit `/styles/globals.css`
- Headers: al gedefinieerd in globals
- Body: al gedefinieerd in globals
- Numbers: gebruik `numeric` class voor tabular-nums

### Spacing System
- Sections: `mb-12` of `mb-16`
- Cards: `gap-6` in grids
- Internal padding: `p-6` of `p-8`
- Page padding: `px-6 py-12`

### Border System
**Alle borders in grijs-wit** voor consistente, rustige uitstraling:
- **Card borders**: `border-white/10` - Grijs-wit voor alle cards (sections, KPI cards)
- **Table borders**: `border-white/5` - Subtiele scheiding tussen rijen
- **Hover states**: `hover:border-[#3B82F6]/50` - Electric Blue hover effect
- **Accent borders**: `border-[#3B82F6]` - Voor active states en highlighted elements
- **Tables**: Geen afgeronde hoeken, rechte borders

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Supabase integration voor real-time data
- [ ] Wallet connection (WalletConnect)
- [ ] Live price feeds
- [ ] User authentication
- [ ] Saved pool favorites
- [ ] Email notifications
- [ ] Export data (CSV/JSON)
- [ ] Advanced filtering
- [ ] More DEX integrations

### Performance Optimizations
- [ ] Code splitting per route
- [ ] Image lazy loading
- [ ] Virtualized lists voor grote datasets
- [ ] Memoization van expensive components

---

## 📝 Notes

### Design Philosophy
- **Friendly & approachable**
- **Vertrouwen uitstralend**
- **Niet te financieel** (rustgevende kleuren)
- **Breed publiek**
- **Professional maar toegankelijk**
- **Modern fintech/B2B SaaS aesthetic**

### RangeBand™ as USP
De **RangeBand component** is het belangrijkste differentiërende element:
- Visualiseert complex LP position data op intuïtieve manier
- Toont in één oogopslag of positie in range is
- Strategy percentage geeft risk/reward indicatie
- Consistent gebruikt door hele app
- Educatieve pagina (/rangeband) legt het uit

---

## 🔗 Quick Links

### Key Files
- **App.tsx**: Main app, routing
- **/components/Rangeband.tsx**: USP component
- **/components/Navigation.tsx**: Main navigation
- **/pages/HomePage.tsx**: Landing page
- **/styles/globals.css**: Typography & design tokens

### Documentation
- **Attributions.md**: Dependencies & credits
- **Guidelines.md**: Dit document

---

**Last updated**: Zie file modification date
**Maintained by**: Liquilab team