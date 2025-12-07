# Liquilab — Project State

## Changelog

### 2025-11-25 — Strategy C Frontend Updates

#### Portfolio Premium + Pro — Numeric Clarity & Peer Comparisons

**Frontend labels synchronized with Figma Strategy C specs:**

- **Portfolio Premium** (`/pages/WalletOverview.tsx`):
  - Updated KPI labels with explicit time windows:
    - "Average APR (30D, annualized)"
    - "Net Yield vs HODL (30D)" + subcopy "Fees + rewards – est. IL"
    - "Range Efficiency (30D)" + "87% of time" + "Actively earning fees"
    - "Unclaimed Fees & Rewards" + "2.8% of your portfolio TVL"
  - Health thresholds added: "Thresholds: <1% OK · 1–3% High · >3% Extreme"
  - Denominators clarified throughout:
    - DEX Exposure: "% of your TVL"
    - Concentration: "% of your portfolio" / "% of your portfolio TVL"
    - Activity & Claim Behaviour: "last 30 days" + "Healthy: 7–14 day cadence"
  - Numeric formatting: 1 decimal for %, compact $ notation, integer counts

- **Portfolio Pro** (`/pages/WalletOverviewPro.tsx`):
  - Mirrored all baseline Premium clarity updates
  - Pro-only sections updated with neutral peer/universe comparisons:
    - **Peer & Universe Summary** card:
      - "Average APR (30D, annualized)" | You | Peers median | Percentile
      - "Time in range (30D)" | You | Peers median | Percentile  
      - "Unclaimed % of portfolio TVL" | You | Peers median | Status
      - Peer group context: "$75k–$250k portfolio size"
    - **Pro Analytics → Peer Comparison** table:
      - Headers: "Metric | You | Peers median | Percentile"
      - Replaced "Peer average" with "Peers median"
    - **Pro Analytics → Strategy Distribution**:
      - "You: X% of your TVL"
      - "Universe: X% of pool TVL"
  - All comparisons use neutral language (no advice/imperatives)

**Key Principles:**
- Premium screens show only own-portfolio metrics with baseline numeric clarity
- Pro screens add neutral peer/universe comparisons without advice language
- Time windows explicit (30D, annualized, lifetime, snapshot)
- Denominators clear (% of your portfolio TVL, % of time, % of your TVL)
- Health thresholds visible and neutral

#### Pool Pro + Pool Universe — Numeric Clarity & Universe Comparisons

**Frontend labels synchronized with Figma Strategy C specs:**

- **Pool Pro** (`/pages/PoolDetailProPage.tsx`):
  - Updated KPI labels with explicit time windows and denominators:
    - "APR (30D, annualized)"
    - "Range Efficiency (30D)" + "86% of time in range"
    - "Time in Range (30D)" in peer comparisons
  - **RangeBand Status** Pro-only universe snippet:
    - "Universe time in range (30D): 72% of time"
    - "Universe median band width: 40.0%"
    - "Your band width: 65.0% (wider than universe median)"
    - "Your efficiency: above universe median"
  - **Peer Comparison (Pool)** table with neutral language:
    - Headers: "Metric | You | Peers median | Percentile"
    - All metrics show clear denominators (% of time, days, annualized)
  - **Pool Universe Snapshot** card:
    - "Top 3 LPs hold 58% of pool TVL"
    - "15 wallets holding 52% of pool TVL"
    - "APR Distribution (30D)" + "Across all LPs in pool"
  - Numeric formatting: 1 decimal for %, compact $ notation, integer counts

- **Pool Universe** (`/pages/PoolUniversePage.tsx`):
  - Updated hero tiles with explicit time windows:
    - "Total Pool TVL" + "Network rank: Top 8%"
    - "Volume ({timePeriod})" + "Showing last {timePeriod}"
    - "Fees Generated ({timePeriod})" + "Showing last {timePeriod}"
    - "Realized APR ({timePeriod}, annualized)" + "Network median APR: 18.6%"
    - "Active Positions (snapshot)" + "ERC721 position tokens"
    - "Active LP Wallets (snapshot)" + "Unique wallet addresses"
  - Updated all denominators for clarity:
    - LP population: "Top 1/10 Wallet Share: X% of TVL & fees"
    - RangeBand landscape: "Aggressive/Balanced/Conservative: X% of pool TVL"
    - Range status: "X% of liquidity currently out of range"
    - Crowded zones: Price bands as "% of pool TVL"
    - Fee/APR: "Realized APR Distribution ({timePeriod})", "X% of TVL earning <1% APR"
    - Claim behaviour: "Avg Claim Latency: X days", buckets as "% of LP wallets"
    - Wallet flows: "Net TVL Flows ({timePeriod})", "Net Change ({timePeriod})"
    - Market regime: "Low/Normal/High Vol Days of {timePeriod}"
  - **"How This Pool Context Affects Your Position"** card:
    - 6 descriptive observation points using reflective language (check/see/note/compare/confirm)
    - No advice/imperative language (no "should/must/consider/avoid")
  - Numeric formatting: 1 decimal for %, compact $ notation (M/k), integer counts

**Key Principles:**
- Premium PoolDetail shows own metrics only; Pool Pro & Pool Universe add neutral universe/peer comparisons
- All time windows explicit (30D/90D/24h/snapshot/lifetime)
- All percentages have clear denominators (% of pool TVL, % of LPs, % of positions, % of time, % of TVL & fees)
- Universe-level comparisons expressed in neutral numeric form (Top X%, above/below median)
- "How This Pool Context" uses descriptive language anchored in metrics

---

## Next Steps

- Update API response schemas to support explicit time windows and denominators
- Ensure backend analytics calculations provide all necessary denominator context
- Consider adding explicit `timePeriod` fields to response types for FE/BE/DS alignment