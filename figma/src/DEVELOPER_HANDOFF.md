# Liquilab - Developer Handoff Guide

**Project**: Liquilab - Premium DeFi Liquidity Analytics App  
**Platform**: Flare Network (Ēnosys & SparkDEX)  
**Status**: ✅ Design System Consistency Pass Complete  
**Ready for**: Next.js Implementation

---

## 📋 Quick Start

### Project Overview
Liquilab is a premium DeFi liquidity analytics application that helps liquidity providers monitor concentrated liquidity positions using the proprietary **RangeBand™** visual system. The app provides real-time insights into position health, fee earnings, and range status across Flare Network DEXes.

### Tech Stack (Current Prototype)
- **Frontend**: React + TypeScript
- **Routing**: React Router (HashRouter)
- **Styling**: Tailwind CSS v4 (via globals.css)
- **UI Components**: ShadCN UI (45 primitives)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Quicksand (headings), Inter (body)

### Tech Stack (Target Implementation)
- **Framework**: Next.js 14+ (App Router)
- **Authentication**: Wallet Connect (non-custodial)
- **Backend**: Supabase (auth, real-time data, analytics)
- **API**: RESTful endpoints + WebSocket for live prices
- **Deployment**: Vercel / Custom infra

---

## 🎨 Design System Summary

### Brand Colors
```css
/* Primary & Accent */
--electric-blue: #3B82F6   /* Interactive elements, links, buttons, active states */
--signal-aqua: #1BE8D2     /* Bullets, checkmarks, accent badges (NOT links) */
--navy: #0B1530            /* Canvas background */

/* Semantic (APR & RangeBand ONLY) */
--success: #10B981         /* Positive APR, in-range, positive PnL */
--warning: #F59E0B         /* Near-range warnings */
--error: #EF4444           /* Negative APR, out-of-range, negative PnL */
```

**Critical Rule**: Semantic colors are ONLY used for APR values, RangeBand status, and PnL metrics. All other UI elements use Primary (#3B82F6) or Accent (#1BE8D2).

### Typography
- **Headings**: Quicksand (600/700) - h1/h2/h3/h4 have defaults in globals.css
- **Body**: Inter (400/500) - p/label/button have defaults in globals.css
- **Numeric**: All KPIs, prices, percentages use `.numeric` class (tabular-nums)
- **NO manual font-size/weight classes** unless specifically required - rely on element defaults

### Component Hierarchy
```
├── Global Components
│   ├── Navigation.tsx          → Top nav (all pages)
│   ├── Footer.tsx              → Footer (marketing + main pages)
│   ├── ScreenshotButton.tsx    → Floating screenshot capture (dev tool)
│   └── OverviewButton.tsx      → Floating nav to /overview (dev tool)
│
├── Core DS Components (⭐ USPs)
│   ├── Rangeband.tsx           → RangeBand™ visual (list/card/hero variants)
│   ├── PoolCard.tsx            → Pool grid card
│   ├── PoolTable.tsx           → Pool list rows (Header + Row)
│   ├── TokenIcon.tsx           → Token icons & pairs
│   └── WaveBackground.tsx      → Animated hero background
│
├── Utility Components
│   ├── Logo.tsx                → Liquilab logo
│   ├── CookieBanner.tsx        → Cookie consent
│   └── Icons.tsx               → Centralized lucide-react exports
│
└── UI Primitives (/components/ui/)
    └── 45 ShadCN components     → button, badge, input, select, etc.
```

---

## 🌟 RangeBand™ Component (The USP)

The **RangeBand™** is the core differentiator of Liquilab. It visualizes LP position price ranges at a glance.

### Three Variants
1. **List** (`variant="list"`)
   - Usage: Table rows, My Positions, compact views
   - Width: ~60% of row width, centered
   - Dot size: 14px
   
2. **Card** (`variant="card"`)
   - Usage: Pool cards, grid views, mobile
   - Width: Full card width, min-width 160px
   - Dot size: 21px
   
3. **Hero** (`variant="hero"`)
   - Usage: Marketing pages, demos, hero sections
   - Width: Full section width
   - Dot size: 28px

### Element Order (ALL variants)
1. Strategy label (e.g., "Balanced (25.0%)")
2. Horizontal band with glowing status dot
3. Min/max price labels (positioned UNDER band ends)
4. Current price (large, centered)
5. Pair label (e.g., "WFLR/FXRP")
6. Caption: "Powered by RangeBand™"

### Status States (Semantic Colors)
- **In Range**: #10B981 (green) - glow + heartbeat animation
- **Near Band**: #F59E0B (amber) - glow + slow heartbeat
- **Out of Range**: #EF4444 (red) - no glow, static

### Band Widths (Strategy-based)
- **Aggressive** (<12%): 30% width
- **Balanced** (12-35%): 65% width
- **Conservative** (>35%): 100% width

---

## 📄 Page Routes & Structure

### Marketing Pages
- `/` - HomePage (Hero, metrics, featured pools, CTAs)
- `/rangeband` - RangeBand Explainer (Marketing & education)
- `/pricing` - Pricing (3 plans + Compare table + Alerts add-on)

**CTA Pattern**: 
- Primary: "Start 14-day trial"
- Secondary: "View demo pools" or "View pricing"

### App Pages (In-Product)
- `/pools` - Pools Overview (Control room: KPIs, filters, list/grid toggle)
- `/pool/:id` - Pool Detail (Premium view)
- `/pool/:id/pro` - Pool Detail Pro (Pro analytics + time-range toggle)
- `/pool/:id/universe` - Pool Universe (Pro pool-wide analytics)
- `/koen` - Wallet Overview (Demo wallet, portfolio, positions)

**CTA Pattern**:
- Primary: "Upgrade to Pro"
- Secondary: "Add RangeBand™ Alerts"
- Tertiary: "Add liquidity", "View on Explorer"

### Info Pages
- `/faq` - FAQ (Accordion)
- `/status` - System Status (Service health, incidents)
- `/legal/:page` - Legal (terms, privacy, cookies, disclaimer)

### Account & Settings
- `/account` - Account Page (Subscription control center)

### Dev Tools
- `/overview` - Component Overview (Navigation hub)
- `/screenshot-generator` - Screenshot Generator (Uizard export)
- `/icons` - Icon Showcase (Development reference)
- `/rangeband-ds` - RangeBand DS (Component spec sheet)

---

## 🔑 Key Data Models

### Pool
```typescript
interface Pool {
  id: string;              // e.g., "#18745"
  token1: string;          // e.g., "WFLR"
  token2: string;          // e.g., "USDT"
  dex: "ENOSYS" | "SPARKDEX";
  fee: string;             // e.g., "0.5%"
  tvl: number;             // Total Value Locked (USD)
  volume24h: number;       // 24h trading volume (USD)
  fees24h: number;         // 24h fees earned (USD)
  apr7d: number;           // 7-day APR (percentage)
  incentives: number;      // Incentives (USD)
  unclaimedFees: number;   // Unclaimed fees (USD)
  activePositions: number; // Count of active LP positions
}
```

### Position (My Positions)
```typescript
interface Position {
  id: string;              // Position ID
  poolId: string;          // Parent pool ID
  provider: string;        // e.g., "ENOSYS"
  token1: string;
  token2: string;
  minPrice: number;        // Range min
  maxPrice: number;        // Range max
  currentPrice: number;    // Current market price
  status: "inRange" | "nearBand" | "outOfRange";
  strategyLabel: string;   // e.g., "Balanced (25.0%)"
  unclaimedFees: number;   // USD
  tvl: number;             // Position TVL (USD)
  mintedAt: Date;          // Position creation date
}
```

### RangeBand™ Data
```typescript
interface RangeBandData {
  minPrice: number;        // Lower bound
  maxPrice: number;        // Upper bound
  currentPrice: number;    // Current price
  strategyLabel: string;   // "Aggressive (8.5%)" / "Balanced (25.0%)" / "Conservative (60.0%)"
  pairLabel: string;       // "WFLR/FXRP"
  status?: "inRange" | "nearBand" | "outOfRange"; // Auto-detected if not provided
}
```

---

## 🔌 API Endpoints (To Implement)

### Pools
```
GET  /api/pools                             → Pool list (with filters, sort, pagination)
GET  /api/pool/:id                          → Pool detail (Premium data)
GET  /api/pool/:id/pro                      → Pool detail (Pro analytics)
GET  /api/pool/:id/universe                 → Pool Universe (Pro pool-wide data)
GET  /api/pool/:id/chart                    → Price history for charts
GET  /api/pool/:id/activity                 → Pool activity timeline
```

### Wallet
```
GET  /api/wallet/:address                   → Wallet overview
GET  /api/wallet/:address/positions         → My Positions (active LP positions)
GET  /api/wallet/:address/activity          → Transaction history
GET  /api/wallet/:address/portfolio         → Portfolio metrics
```

### User & Subscription
```
GET  /api/user/subscription                 → Current plan, pool usage, add-ons
POST /api/user/subscription/upgrade         → Upgrade to Pro
POST /api/user/subscription/addons          → Add RangeBand™ Alerts
GET  /api/user/preferences                  → Email, notifications, timezone
PUT  /api/user/preferences                  → Update preferences
```

### Realtime (WebSocket)
```
WS   /ws/prices                             → Live price updates
WS   /ws/rangeband/:positionId              → RangeBand™ status updates (alerts)
```

---

## 🎛️ State Management (Future)

### Global State
- **Wallet**: Connected address, chainId, balance
- **User**: Plan type (Visitor, Premium, Pro, Enterprise), pool usage (X/5), RangeBand™ Alerts active
- **Theme**: Dark mode (default), potential light mode toggle

### Page-Level State
- **Pools**: Filters (DEX, strategy, search), sort order, view mode (list/grid)
- **Pool Detail**: Time range (24h, 7D, 30D, 90D) - shared across Pro views
- **Account**: Form values, loading states

### Real-time Data
- Price feeds (every 5-10 seconds)
- RangeBand™ status checks (when price near bounds)
- Pool activity (new positions, claims, removals)

---

## 🎯 User Plans & Feature Gating

### Visitor (Free)
- View pools overview
- Limited pool data (no detail view)
- No wallet connection
- No RangeBand™ monitoring

### Premium ($14.95/month, 5 pools)
- Wallet dashboard
- Full pool details
- My Positions table with claim signals
- RangeBand™ status monitoring
- Activity tracking
- **Add-on**: RangeBand™ Alerts (+$2.49/month per 5 pools)

### Pro ($24.95/month, 5 pools)
- Everything in Premium
- 6-tile Pro Analytics (Pool Detail Pro)
- Risk & Range Insights
- Portfolio Analytics (concentration, fee capture, peer benchmarking)
- Pool Universe View
- **RangeBand™ Alerts included** (no extra cost)
- Export-ready data

### Enterprise (Custom pricing)
- Custom pool limits
- API access
- Bespoke reporting
- SLA-backed support
- White-label options (roadmap)

### Pro-Only Features (Lock/Blur Pattern)
- Pool Detail Pro page
- Pool Universe page
- Extra position metrics
- Export data buttons
- Advanced charts

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  - Stack all columns vertically
  - Pool grid → 1 column
  - Navigation → Mobile menu (future)
  - Tables → Horizontal scroll
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  - Pool grid → 2 columns
  - Side-by-side sections → Stack on smaller tablets
}

/* Desktop */
@media (min-width: 1024px) {
  - Pool grid → 3-4 columns
  - Full layout with sidebars
  - Max-width: 1400px (centered)
}
```

---

## 🔧 Developer Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js 14+ (App Router)
- [ ] Migrate globals.css, components, pages
- [ ] Set up Supabase (auth, database schemas)
- [ ] Implement wallet connection (WalletConnect)
- [ ] Create API routes (mock data first)

### Phase 2: Core Features (Week 3-4)
- [ ] Pools overview (list/grid, filters, sort)
- [ ] Pool detail pages (Premium + Pro)
- [ ] Wallet dashboard
- [ ] My Positions table
- [ ] RangeBand™ component (all variants)

### Phase 3: User System (Week 5-6)
- [ ] Authentication flow
- [ ] Plan selection & subscription
- [ ] Account management page
- [ ] Usage tracking (pool count)
- [ ] Pro feature gating

### Phase 4: Real-time & Advanced (Week 7-8)
- [ ] WebSocket price feeds
- [ ] RangeBand™ Alerts (email + in-app)
- [ ] Pool Universe analytics
- [ ] Export data (CSV/JSON)
- [ ] Email notifications

### Phase 5: Polish & Launch (Week 9-10)
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] SEO (meta tags, sitemap)
- [ ] Analytics integration (PostHog, etc.)
- [ ] Legal pages content
- [ ] Beta testing & feedback
- [ ] Production deployment

---

## 📊 Analytics & Tracking

### Key Metrics to Track
- **User Acquisition**: Signups, trial starts, conversions
- **Engagement**: DAU, WAU, MAU, session duration
- **Feature Usage**: Pools viewed, filters used, view mode (list vs grid)
- **RangeBand™ Performance**: Alert accuracy, time-to-action, position adjustments
- **Revenue**: MRR, ARR, churn rate, expansion revenue (add-ons)

### Events to Log
```javascript
// Pools
track('pool_viewed', { poolId, dex, token1, token2 });
track('filter_applied', { filterType, value });
track('view_mode_changed', { mode: 'list' | 'grid' });

// RangeBand™
track('rangeband_alert_sent', { positionId, status, action });
track('position_adjusted', { positionId, reason });

// Subscription
track('plan_upgraded', { fromPlan, toPlan });
track('addon_purchased', { addon: 'rangeband_alerts' });
```

---

## 🔒 Security Considerations

### Non-Custodial Principles
- **Never store private keys** (wallet connection only)
- **Read-only access** to on-chain data
- **No PII collection** beyond email + wallet address
- **EU GDPR compliant** (data export, deletion)

### API Security
- **Rate limiting**: 100 req/min (Visitor), 1000 req/min (Premium/Pro)
- **Authentication**: JWT tokens (Supabase Auth)
- **Authorization**: Plan-based feature gating on API routes
- **CORS**: Strict origin validation

### Data Privacy
- **Wallet masking**: Display `0x7a8f...3d2e` (first 6 + last 4 chars)
- **No transaction signing**: App is purely analytics (no write operations)
- **Optional email**: Email field is NOT required (non-custodial)

---

## 🚀 Deployment

### Recommended Stack
- **Hosting**: Vercel (Next.js native)
- **Database**: Supabase (Postgres + Realtime)
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry (errors), PostHog (analytics)
- **Status Page**: status.liquilab.app (future)

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# API Keys
FLARE_RPC_URL=
ENOSYS_API_KEY=
SPARKDEX_API_KEY=

# Email (RangeBand Alerts)
SENDGRID_API_KEY=

# Stripe (Subscriptions)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 📚 Documentation Files

### Design & Guidelines
- `/guidelines/Guidelines.md` - Original project guidelines
- `/DS_CONSISTENCY_AUDIT.md` - Design system audit & checklist
- `/DEVELOPER_HANDOFF.md` - This file
- `/RANGEBAND_UNIFICATION.md` - RangeBand component spec
- `/UIZARD_EXPORT_GUIDE.md` - Screenshot export workflow

### Component Documentation
- `/pages/ComponentOverviewPage.tsx` - Interactive navigation hub
- `/pages/RangeBandDS.tsx` - RangeBand™ design system showcase
- `/pages/IconShowcase.tsx` - All Lucide icons used
- `/pages/ScreenshotGeneratorPage.tsx` - Automated screenshot tool

---

## 🤝 Collaboration & Support

### Design System Contact
For questions about design consistency, component usage, or visual decisions, refer to:
1. `/DS_CONSISTENCY_AUDIT.md` - Full audit checklist
2. `/guidelines/Guidelines.md` - Original design guidelines
3. Component Overview page (`/overview`) - Live documentation

### Development Workflow
1. **Feature Branch**: `feature/pool-universe`, `feature/wallet-connect`
2. **PR Review**: Design consistency check + code review
3. **Testing**: Unit tests + E2E (Playwright/Cypress)
4. **Deploy**: Staging → Preview → Production

---

## ✅ Design System Compliance Verified

This handoff package represents a **production-ready, design-system-compliant** web application. All 15 pages have been audited and standardized for:

- ✅ **Consistent typography** (no manual fontSize, globals.css defaults)
- ✅ **Consistent colors** (semantic only for APR/RangeBand)
- ✅ **Unified RangeBand™** (list/card/hero variants)
- ✅ **Standardized components** (PoolRow, PoolCard, KPI tiles)
- ✅ **Consistent CTAs** (marketing vs in-product patterns)
- ✅ **Interaction states** (focus, hover, data states)
- ✅ **Pro vs Premium gating** (badges, lock/blur)
- ✅ **Developer-ready structure** (routes, components, data models)

---

**Last Updated**: November 18, 2024  
**Status**: Ready for Next.js implementation  
**Contact**: Liquilab Development Team

🎉 **Happy Building!**
