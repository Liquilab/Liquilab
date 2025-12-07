# 🎨 Design System SSoT - Handover Document

**Project**: Liquilab - DeFi Liquidity Analytics App  
**Datum**: 23 November 2024  
**Status**: Single Source of Truth (SSoT) geconsolideerd in `/guidelines/Guidelines.md`  
**Doel**: Strikte naleving van Design System standaarden voor consistente UX

---

## 📋 Executive Summary

Dit document beschrijft de definitieve Design System standaarden voor Liquilab. Alle wijzigingen zijn verwerkt in **`/guidelines/Guidelines.md`** - de enige en officiële Single Source of Truth (SSoT) voor het project.

**Kernwijzigingen**:
- ✅ Minimalistische UI: Geen iconen in titels en card headers
- ✅ Tab structuur voor Portfolio pagina's (Premium & Pro)
- ✅ Typography standaarden voor bedragen (16px vs 12px)
- ✅ Complete kleurenpalet gedocumenteerd met usage rules
- ✅ Surface en wit varianten met exacte rgba waarden

---

## 1️⃣ Minimalistische UI - GEEN ICONEN IN TITELS

### ❌ VERBODEN: Iconen in Content Titels

**Regel**: Alle `<h2>` en `<h3>` titels in content secties zijn **ALTIJD zonder iconen**.

**Geldt voor**:
- ✅ Premium pagina's: WalletOverview.tsx, PoolDetailPage.tsx
- ✅ Pro pagina's: WalletOverviewPro.tsx, PoolDetailProPage.tsx, PoolUniversePage.tsx
- ✅ Alle sectie headers (Performance & Analytics, My Positions, etc.)
- ✅ KPI card headers
- ✅ Tab labels

**Correcte implementatie**:
```tsx
{/* ✅ CORRECT - Clean typografie zonder icoon */}
<h2 className="text-white/95">Performance & Analytics</h2>

{/* ✅ CORRECT - Titel met badge is toegestaan */}
<div className="flex items-center gap-2">
  <h2 className="text-white/95">Portfolio</h2>
  <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">Pro</Badge>
</div>
```

**Foutieve implementatie**:
```tsx
{/* ❌ FOUT - Icoon naast titel */}
<div className="flex items-center gap-2">
  <TrendingUp className="size-5 text-[#3B82F6]" />
  <h2 className="text-white/95">Performance & Analytics</h2>
</div>

{/* ❌ FOUT - Icon container bij sectie titel */}
<div className="flex items-center gap-3">
  <div className="h-12 w-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
    <BarChart3 className="size-6 text-[#3B82F6]" />
  </div>
  <h2 className="text-white/95">Analytics</h2>
</div>
```

### ✅ UITZONDERINGEN: Waar iconen WEL mogen

**Icon containers zijn toegestaan in**:
1. **Promotie cards** (upsell/premium features)
2. **Feature highlights** (homepage hero sections)
3. **Account page subsecties** (Subscription & Billing, Pool Usage, etc.)
4. **Status indicators** (grote CheckCircle2/XCircle in card headers)

**Voorbeeld toegestane icon container**:
```tsx
{/* ✅ CORRECT - Promotie card met icon container */}
<div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8">
  <div className="flex items-start gap-4">
    <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
      <Lock className="h-6 w-6 text-[#3B82F6]" />
    </div>
    <div className="flex-1">
      <h3 className="text-white/95">Unlock Pro Analytics</h3>
      {/* ... rest van content ... */}
    </div>
  </div>
</div>
```

---

## 2️⃣ Tab Structuur - Portfolio Pagina's (Premium & Pro)

### Nieuwe Indeling: My Positions vs Performance & Analytics

**Geldt voor**:
- `WalletOverview.tsx` (Premium versie)
- `WalletOverviewPro.tsx` (Pro versie)

**Tab 1: My Positions**
- **Inhoud**: ALLEEN de PoolTable component
- **Features**: List/Grid toggle, empty state wanneer geen posities
- **GEEN**: KPI cards, charts, analytics

**Tab 2: Performance & Analytics**
- **Inhoud**: ALLE analytics content
  - KPI cards (6 cards voor Pro, minder voor Premium)
  - Portfolio Performance Over Time (chart)
  - Peer Comparison (Pro only)
  - Strategy & DEX Distribution
  - Claim Behavior Analysis (Pro only)

**Implementatie voorbeeld**:
```tsx
{/* Tab Navigation */}
<div className="border-b border-white/10 mb-8">
  <div className="flex gap-1">
    <button
      onClick={() => setActiveTab("positions")}
      className={`px-6 py-3 border-b-2 transition-colors ${
        activeTab === "positions"
          ? "border-[#3B82F6] text-white/95"
          : "border-transparent text-white/70 hover:text-white/95"
      }`}
    >
      My Positions
    </button>
    <button
      onClick={() => setActiveTab("analytics")}
      className={`px-6 py-3 border-b-2 transition-colors ${
        activeTab === "analytics"
          ? "border-[#3B82F6] text-white/95"
          : "border-transparent text-white/70 hover:text-white/95"
      }`}
    >
      Performance & Analytics
    </button>
  </div>
</div>

{/* TAB 1: My Positions */}
{activeTab === "positions" && (
  <div>
    {/* List/Grid Toggle */}
    {/* PoolTable of PoolCard grid */}
  </div>
)}

{/* TAB 2: Performance & Analytics */}
{activeTab === "analytics" && (
  <div>
    {/* KPI Cards */}
    {/* Charts */}
    {/* Analytics sections */}
  </div>
)}
```

**BELANGRIJK**:
- ❌ **GEEN** Activity Calendar meer op de Pro pagina
- ✅ Tab labels ZONDER iconen (clean typografie)
- ✅ Default active tab: "My Positions"

---

## 3️⃣ Typography - Bedragen in PoolTable & PoolCard

### Strikte Fontsize Regels

**$ Bedragen**: Altijd **16px** (default body size)
**Token Bedragen**: Altijd **12px** (`text-xs`)

Deze regel geldt voor **ALLE** geldelijke waarden in:
- PoolTable rows
- PoolCard components
- TVL kolom
- Unclaimed Fees kolom
- Incentives kolom

### Implementatie Voorbeelden

**PoolTable - TVL Kolom**:
```tsx
<div>
  {/* $ bedrag: 16px (default) */}
  <div className="text-white/95 numeric mb-1">$24,580</div>
  
  {/* Token breakdown: 12px (text-xs) */}
  <p className="text-xs text-white/[0.58] numeric">370 XRP</p>
  <p className="text-xs text-white/[0.58] numeric">1.254 USDT</p>
</div>
```

**PoolCard - Unclaimed Fees**:
```tsx
<div>
  <div className="text-white/[0.58] text-xs mb-1">Unclaimed Fees</div>
  
  {/* $ bedrag: 16px (default) */}
  <div className="text-white/95 numeric mb-1">$458</div>
  
  {/* Token breakdown: 12px (text-xs) */}
  <p className="text-xs text-white/[0.58] numeric">12.4 XRP</p>
  <p className="text-xs text-white/[0.58] numeric">0.031 USDT</p>
</div>
```

**Visuele Hiërarchie**:
- 16px ($ bedrag) = **Primaire informatie** - trekt de aandacht
- 12px (tokens) = **Secundaire details** - ondersteunende context

**BELANGRIJK**:
- ✅ Gebruik **ALTIJD** `numeric` class voor alle bedragen (tabular numerals)
- ✅ Token breakdowns gebruiken `text-xs` **direct op `<p>` tags**, NIET via wrapper divs
- ❌ **GEEN** Tailwind font-size classes zoals `text-base`, `text-sm` - gebruik semantic HTML

---

## 4️⃣ Kleurenpalet - Complete Specificatie

### Primary & Semantic Colors

| Kleur | Hex Code | Gebruik |
|-------|----------|---------|
| **Electric Blue** | `#3B82F6` | Interactive elementen, links, buttons, active states, hover borders |
| **Signal Aqua** | `#1BE8D2` | Bullets, opsommingen, badges, checkmarks, accent elementen |
| **Success** | `#10B981` | **ALLEEN**: Positieve APR, in-range status, positieve PnL, range efficiency |
| **Warning** | `#F59E0B` | **ALLEEN**: Near-range warnings, gematigde alerts |
| **Error** | `#EF4444` | **ALLEEN**: Negatieve APR, out-of-range status, negatieve PnL |

**⚠️ KRITIEKE REGEL - Semantic Colors**:
Semantic kleuren (Success/Warning/Error) mogen **UITSLUITEND** gebruikt worden voor:
- APR waarden (positief/negatief)
- RangeBand status indicators (in/out of range)
- Range boundary visualisaties
- PnL waarden (positief/negatief)
- Performance metrics (Range Efficiency)

**Gebruik NOOIT groen/rood/amber voor decoratieve doeleinden!**

---

### Blauw Varianten

#### Chart Event Kleuren (grijswit → electric blue → navy gradient)

| Kleur | Hex Code | Gebruik | Styling |
|-------|----------|---------|---------|
| **Slate Gray** | `#CBD5E1` | "Liquidity Added" events | `bg-[#CBD5E1] border border-white/40` |
| **Electric Blue** | `#3B82F6` | "Fees Claimed" events | `bg-[#3B82F6] border border-white/40` |
| **Navy Blue** | `#1E3A8A` | "Liquidity Removed" events | `bg-[#1E3A8A] border border-white/40` |

**Voorbeeld - Chart Legend**:
```tsx
<div className="flex items-center gap-2">
  <div className="h-3 w-3 rounded-sm bg-[#CBD5E1] border border-white/40" />
  <span className="text-white/70 text-sm">Liquidity Added</span>
</div>
```

#### Overlay & Backgrounds

| Variant | Opacity | Gebruik |
|---------|---------|---------|
| **Primary /20** | `#3B82F6` @ 20% | Icon backgrounds, overlays |
| **Primary /50** | `#3B82F6` @ 50% | Hover borders |
| **Primary Solid** | `#3B82F6` @ 100% | Active states, buttons, focus borders |

**Implementatie**:
```tsx
{/* Icon container - altijd /20 */}
<div className="h-12 w-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
  <TrendingUp className="size-6 text-[#3B82F6]" />
</div>

{/* Hover border - /50 */}
<div className="border border-white/10 hover:border-[#3B82F6]/50 transition-colors">
  {/* Card content */}
</div>

{/* Active state - solid */}
<button className="bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90">
  Click me
</button>
```

---

### Wit Varianten

#### Text Opacity

| Variant | RGBA | Tailwind Class | Gebruik |
|---------|------|----------------|---------|
| **Primary text** | `rgba(255, 255, 255, 0.95)` | `text-white/95` | Hoofdtekst, headings |
| **Secondary text** | `rgba(255, 255, 255, 0.70)` | `text-white/70` | Subtekst, descriptions |
| **Tertiary text** | `rgba(255, 255, 255, 0.58)` | `text-white/[0.58]` | Labels, hints, timestamps |

**Voorbeeld**:
```tsx
<div>
  <h2 className="text-white/95">Total Portfolio Value</h2>
  <p className="text-white/70">Your liquidity positions across all pools</p>
  <span className="text-white/[0.58] text-xs">Last updated: 2 min ago</span>
</div>
```

#### Surfaces & Borders

| Variant | RGBA | Tailwind Class | Gebruik |
|---------|------|----------------|---------|
| **Card surface** | `rgba(15, 20, 36, 0.95)` | `bg-[#0F1A36]/95` | Card backgrounds |
| **Card borders** | `rgba(255, 255, 255, 0.10)` | `border-white/10` | Grijs-wit voor alle cards |
| **Table borders** | `rgba(255, 255, 255, 0.05)` | `border-white/5` | Subtiele scheiding tussen rijen |

**Voorbeeld - Standard Card**:
```tsx
<div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 hover:border-[#3B82F6]/50 transition-colors">
  {/* Card content */}
</div>
```

**Voorbeeld - Table Row**:
```tsx
<div className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
  {/* Table row content */}
</div>
```

#### Background

| Variant | Hex Code | Gebruik |
|---------|----------|---------|
| **Navy canvas** | `#0B1530` | Main app background (body) |

---

### Icon Container Consistency Rule ⭐

**ALTIJD Electric Blue achtergrond** - ongeacht de icoon kleur!

```tsx
{/* ✅ CORRECT - Electric Blue container met groene success icon */}
<div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
  <CheckCircle2 className="size-6 text-[#10B981]" />
</div>

{/* ✅ CORRECT - Electric Blue container met rode error icon */}
<div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
  <XCircle className="size-6 text-[#EF4444]" />
</div>

{/* ❌ FOUT - Groene container */}
<div className="w-12 h-12 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
  <CheckCircle2 className="size-6 text-[#10B981]" />
</div>
```

**Regel**: 
- Container achtergrond = **ALTIJD** `bg-[#3B82F6]/20`
- Icoon kleur = **MAG** variëren voor semantische betekenis (groen/rood/aqua)

---

### Bullets voor Opsommingen

**ALTIJD Signal Aqua ronde dots** - GEEN CheckCircle2 iconen!

```tsx
{/* ✅ CORRECT - Signal Aqua bullet */}
<div className="flex items-start gap-2">
  <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
  <span className="text-white/70">List item text</span>
</div>

{/* ❌ FOUT - CheckCircle2 als bullet */}
<div className="flex items-start gap-2">
  <CheckCircle2 className="size-5 text-[#1BE8D2]" />
  <span className="text-white/70">List item text</span>
</div>
```

---

## 5️⃣ KPI Cards - Minimalistische Vormgeving

### Design Principes

**Kenmerken**:
- ❌ **GEEN iconen** in card headers
- ✅ Clean typografie als focus
- ✅ Card titel: `text-xs text-white/[0.58]` (12px, tertiary opacity)
- ✅ Grote waarde: `text-white/95 numeric` met inline fontSize (meestal 32px)
- ✅ Badges (optioneel): Onder de grote waarde voor context
- ✅ Subtekst: `text-xs text-white/[0.58]` voor extra details

**Template**:
```tsx
{/* ✅ CORRECT - Minimal KPI Card */}
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

---

## 6️⃣ Promotie Cards - Upsell Pattern 🎁

### Wanneer te gebruiken

**Alleen voor**:
- Pro/Premium feature teasers
- Upgrade prompts
- Promotional content

**Visuele Kenmerken**:
- Gradient background: `bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20`
- Border: `border border-[#3B82F6]/30`
- Afronding: `rounded-xl` (grotere radius)
- Padding: `p-8` (ruimer voor "premium" gevoel)

**Template**:
```tsx
<div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8">
  <div className="flex items-start gap-4">
    {/* Icon Container - Electric Blue */}
    <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
      <Lock className="h-6 w-6 text-[#3B82F6]" />
    </div>
    
    {/* Content */}
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-white/95">Unlock Pro Analytics</h3>
        <Badge className="bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30">Pro</Badge>
      </div>
      <p className="text-white/70 mb-4">
        Get deeper insights with advanced APR tracking, peer comparisons, and predictive range analytics.
      </p>
      <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2">
        Upgrade to Pro
        <ArrowRight className="size-4" />
      </Button>
    </div>
  </div>
</div>
```

**Belangrijkste verschil met normale cards**:
- ✅ Icon container **IS** toegestaan (upsell context)
- ✅ Gradient background maakt het visueel onderscheidend
- ✅ Ruimere padding (p-8 vs p-6)

---

## 7️⃣ Implementatie Checklist

### Voor Nieuwe Features

Gebruik deze checklist bij het bouwen van nieuwe componenten:

**Typography**:
- [ ] Geen Tailwind font-size/weight classes (tenzij expliciet gevraagd)
- [ ] $ bedragen = 16px (default body)
- [ ] Token bedragen = 12px (`text-xs`)
- [ ] Alle bedragen gebruiken `numeric` class

**Kleuren**:
- [ ] Semantic colors alleen voor APR/PnL/RangeBand status
- [ ] Icon containers altijd `bg-[#3B82F6]/20`
- [ ] Card borders: `border-white/10`
- [ ] Table borders: `border-white/5`
- [ ] Hover borders: `hover:border-[#3B82F6]/50`

**Icons**:
- [ ] Geen iconen in `<h2>` / `<h3>` titels
- [ ] Geen iconen in tab labels
- [ ] Bullets altijd Signal Aqua dots (`bg-[#1BE8D2]`)

**Cards**:
- [ ] KPI cards zonder iconen in headers
- [ ] Card surface: `bg-[#0F1A36]/95`
- [ ] Promotie cards alleen voor upsell content

**Portfolio Pagina's**:
- [ ] Tab indeling: "My Positions" + "Performance & Analytics"
- [ ] PoolTable alleen in "My Positions" tab
- [ ] Alle analytics in "Performance & Analytics" tab
- [ ] Tab labels zonder iconen

---

## 8️⃣ Single Source of Truth (SSoT)

### Officiële Documentatie Locatie

**`/guidelines/Guidelines.md`** = Enige bron van waarheid

**Wat staat erin**:
- ✅ Complete kleurenpalet met hex codes en rgba waarden
- ✅ Typography regels (sizes, weights, opacity)
- ✅ Component specificaties (PoolCard, PoolTable, RangeBand, etc.)
- ✅ Page layouts (alle pagina's gedocumenteerd)
- ✅ Icon container rules
- ✅ KPI card templates
- ✅ Promotie card patterns

**Bij twijfel**: Raadpleeg **ALTIJD** `/guidelines/Guidelines.md`

---

## 9️⃣ Veelgemaakte Fouten & Oplossingen

### Fout 1: Iconen in Titels
❌ **Fout**: `<div className="flex items-center gap-2"><TrendingUp /><h2>Analytics</h2></div>`  
✅ **Correct**: `<h2 className="text-white/95">Analytics</h2>`

### Fout 2: Verkeerde Icon Container Kleur
❌ **Fout**: `<div className="bg-[#10B981]/20">...</div>` (groene achtergrond)  
✅ **Correct**: `<div className="bg-[#3B82F6]/20">...</div>` (altijd Electric Blue)

### Fout 3: Semantic Kleuren voor Decoratie
❌ **Fout**: Success green voor algemene buttons/accenten  
✅ **Correct**: Semantic kleuren ALLEEN voor APR/PnL/RangeBand status

### Fout 4: Verkeerde Fontsizes voor Bedragen
❌ **Fout**: `<div className="text-sm">$24,580</div>` (14px via Tailwind class)  
✅ **Correct**: `<div className="text-white/95 numeric">$24,580</div>` (16px default)

### Fout 5: CheckCircle2 als Bullet
❌ **Fout**: `<CheckCircle2 className="size-5 text-[#1BE8D2]" />`  
✅ **Correct**: `<div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]"></div>`

### Fout 6: KPI Cards met Iconen
❌ **Fout**: Icon in KPI card header  
✅ **Correct**: Alleen typografie, geen icon container

### Fout 7: Verkeerde Tab Structuur
❌ **Fout**: KPI cards + PoolTable samen in één tab  
✅ **Correct**: PoolTable in "My Positions", KPI cards in "Performance & Analytics"

---

## 🔟 Contact & Vragen

**Bij vragen over**:
- Design System implementatie → Raadpleeg `/guidelines/Guidelines.md`
- Kleur gebruik → Zie sectie 4 van dit document
- Typography → Zie sectie 3 van dit document
- Component structuur → Zie Guidelines.md § Component Overzicht

**Review proces**:
1. Check implementatie tegen `/guidelines/Guidelines.md`
2. Gebruik bovenstaande checklist (sectie 7)
3. Bij twijfel: vraag review van lead developer/designer

---

## ✅ Conclusie

**De drie gouden regels**:

1. **`/guidelines/Guidelines.md` = SSoT** - Altijd leidend, altijd actueel
2. **Minimalistisch = Krachtig** - Geen onnodige iconen, focus op typografie
3. **Consistentie = Kwaliteit** - Kleuren, sizes, en structuren strikt volgens systeem

**Resultaat**: Een schaalbaar, consistent, en professioneel Design System dat zorgt voor een premium gebruikerservaring zonder visuele overload.

---

**Document versie**: 1.0  
**Laatste update**: 23 November 2024  
**Volgende review**: Bij wijzigingen aan Design System
