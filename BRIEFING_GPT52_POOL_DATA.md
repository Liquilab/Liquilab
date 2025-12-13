# Briefing: Pool Universe Data Implementation

**Doel:** GPT 5.2 moet een prompt schrijven om alle cards op `/pool` met echte data te vullen.

---

## 1. Huidige Situatie

### Route
- **URL:** `/pool/[poolAddress]`
- **Component:** `src/components/pool/PoolUniversePage.tsx`
- **API Endpoint:** `/api/analytics/pool/[id].ts`

### Huidige API Response
De huidige API (`pages/api/analytics/pool/[id].ts`) retourneert beperkte data:

```typescript
{
  ok: boolean;
  degrade: boolean;
  ts: number;  // Timestamp uit database (last_updated)
  pool: {
    state: string;
    tvl: number;
    fees24h: number;
    fees7d: number;
    positionsCount: number;
  }
}
```

### Wat de UI verwacht
De `PoolUniversePage` component verwacht een rijkere datastructuur:

```typescript
{
  ok: boolean;
  degrade: boolean;
  ts: number;
  pool: {
    head: {
      tvl: number;
      fees24h: number;
      fees7d: number;
      positionsCount: number;
    };
    universe: {
      pair: {
        token0Symbol: string;
        token1Symbol: string;
      };
      summary: {
        tvlUsd: number;
        fees24hUsd: number;
        fees7dUsd: number;
        positionsCount: number;
        walletsCount: number;
      };
      segments: Array<{
        dex: string;           // 'sparkdex-v3' | 'enosys-v3'
        feeTierBps: number;    // 100 = 0.01%, 500 = 0.05%, 3000 = 0.30%
        tvlUsd: number;
        fees7dUsd: number;
        positionsCount: number;
      }>;
    };
  }
}
```

---

## 2. Secties die Data Nodig Hebben

### 2.1 KPI Row (6 tiles)
| Tile | Data Nodig | Bron |
|------|------------|------|
| Total TVL | `summary.tvlUsd` | Aggregatie van alle pools |
| Fees (7D) | `summary.fees7dUsd` | Aggregatie fees |
| Fee per $K TVL | Berekend: `fees7d / tvl * 1000` | Derived |
| Total APR Est. | Berekend: `(fees7d * 52 / tvl) * 100` | Derived |
| Total Positions | `summary.positionsCount` | COUNT positions |
| Active Wallets | `summary.walletsCount` | COUNT DISTINCT owner |

### 2.2 DEX Breakdown
Per DEX (Enosys, SparkDEX):
- `tvlUsd` - Som TVL per DEX
- `fees7dUsd` - Som fees per DEX
- `positionsCount` - Aantal positions per DEX

### 2.3 Fee Tier Breakdown
Per fee tier (0.01%, 0.05%, 0.30%, 1.00%):
- `tvlUsd` - Som TVL per tier
- `fees7dUsd` - Som fees per tier
- `positionsCount` - Aantal positions per tier

### 2.4 LP Population
| Metric | Data Nodig |
|--------|------------|
| Active Positions | `positionsCount` |
| Unique Wallets | `walletsCount` |
| Avg Positions/Wallet | Berekend |
| Wallet Distribution | Whale/Dolphin/Shrimp percentages (nieuw) |

### 2.5 Position Churn (30D)
- Dagelijkse position counts over 30 dagen
- Requires: historische data of materialized view

### 2.6 RangeBand Landscape
| Metric | Data Nodig |
|--------|------------|
| Range Type Distribution | % Aggressive/Balanced/Conservative |
| Current Range Status | % In-Range / Near-Range / Out-of-Range |
| Crowded Price Zones | Liquidity density per price bucket |

### 2.7 Fee & APR Distribution
- APR histogram data (buckets: 0-2%, 2-10%, 10-25%, 25%+)
- Average ROI
- Fees per capital ratio

### 2.8 Claim Behaviour
- Claim frequency per wallet size category
- Claim timing patterns

### 2.9 Wallet Flows
- Net TVL inflow/outflow over 30D
- Top wallet changes (addresses + amounts)

### 2.10 Market Regime
- Current regime (Normal/Volatile/Trending)
- 7D trend direction
- Annualized volatility
- ATR (Average True Range)
- Volatility timeline (daily values)

---

## 3. Database Schema (Relevant Tables)

### Bestaande Materialized Views
```sql
-- Pool state
mv_pool_latest_state (pool, state, tvl_usd)

-- Fees
mv_pool_fees_24h (pool, fees_usd_24h)
mv_pool_fees_7d (pool, fees_usd_7d)

-- Positions
mv_position_latest_event (pool, tokenId, owner, tickLower, tickUpper, liquidity, updatedAt)
```

### Bestaande Tables
```sql
-- Pools
Pool (address, token0, token1, feeTier, dex, ...)

-- Positions
Position (tokenId, pool, owner, tickLower, tickUpper, liquidity, ...)

-- Swaps (voor fees)
Swap (pool, amount0, amount1, timestamp, ...)
```

---

## 4. Implementatie Strategie

### Optie A: Uitbreiden API Endpoint
Pas `/api/analytics/pool/[id].ts` aan om alle benodigde data te retourneren.

**Voordelen:** Eén API call, eenvoudig te implementeren
**Nadelen:** Kan zwaar worden, lange query tijd

### Optie B: Meerdere API Endpoints
Maak aparte endpoints per sectie:
- `/api/analytics/pool/[id]/summary`
- `/api/analytics/pool/[id]/segments`
- `/api/analytics/pool/[id]/population`
- `/api/analytics/pool/[id]/rangeband`
- etc.

**Voordelen:** Lazy loading, betere performance
**Nadelen:** Meer complexity, meerdere calls

### Optie C: Nieuwe Materialized Views
Maak dedicated views voor de Universe page:
```sql
mv_pool_universe_summary
mv_pool_universe_segments
mv_pool_universe_population
mv_pool_universe_rangeband
```

**Voordelen:** Snelle queries, pre-computed data
**Nadelen:** Meer database onderhoud, refresh scheduling

---

## 5. Prioriteit Data (MVP)

### Must Have (Phase 1)
1. ✅ KPI Row data (TVL, Fees, Positions, Wallets)
2. ✅ DEX Breakdown (segments per DEX)
3. ✅ Fee Tier Breakdown (segments per tier)
4. Token pair info (symbols)

### Should Have (Phase 2)
5. LP Population (wallet distribution)
6. RangeBand status (in/near/out percentages)
7. Position Churn (30D history)

### Nice to Have (Phase 3)
8. Fee & APR Distribution histogram
9. Claim Behaviour patterns
10. Wallet Flows
11. Market Regime indicators

---

## 6. Huidige Code Referenties

### API Endpoint
```typescript
// pages/api/analytics/pool/[id].ts
const POOL_SQL = `
WITH base AS (
  SELECT pool, state, tvl_usd
  FROM mv_pool_latest_state
  WHERE pool = $1
),
fees24h AS (...),
fees7d AS (...),
positions AS (
  SELECT pool, COUNT(DISTINCT tokenId)::bigint AS positions_count, MAX("updatedAt") AS last_updated
  FROM mv_position_latest_event
  WHERE pool = $1
  GROUP BY pool
)
SELECT ...
`;
```

### Frontend Component
```typescript
// src/components/pool/PoolUniversePage.tsx
// Verwacht deze data structuur:
const pool = response?.pool;
const universe = pool?.universe;
const head = pool?.head;
const segments = universe?.segments ?? [];
const summary = universe?.summary;
const pair = universe?.pair;
```

### Data Fetcher
```typescript
// src/lib/api/analytics.ts
export async function fetchPool(poolAddress: string): Promise<AnalyticsPoolResponse> {
  const res = await fetch(`/api/analytics/pool/${poolAddress}`);
  return res.json();
}
```

---

## 7. Verwachte Output van GPT 5.2

GPT 5.2 moet een prompt genereren die:

1. **SQL queries** schrijft voor alle benodigde data
2. **API endpoint** uitbreidt met de nieuwe queries
3. **Type definitions** aanpast voor de response
4. **Graceful degradation** behoudt (null/undefined handling)
5. **Performance** optimaliseert (indexes, materialized views)

### Voorbeeld Prompt Structuur
```
[CONTEXT]
- Database schema
- Huidige API code
- Frontend verwachtingen

[TASK]
Schrijf SQL queries en TypeScript code om:
1. Pool universe summary data op te halen
2. Segments per DEX en fee tier te groeperen
3. Wallet distribution te berekenen
4. RangeBand status te bepalen

[CONSTRAINTS]
- Gebruik bestaande materialized views waar mogelijk
- Fallback naar null voor ontbrekende data
- Timestamp uit database, niet Date.now()

[OUTPUT FORMAT]
- SQL queries met uitleg
- TypeScript types
- API handler code
```

---

## 8. Test Data

### Bekende Pool Adressen
```
WFLR/USDT0 (Enosys 0.30%): 0x...
FXRP/USDT0 (Enosys 0.30%): 0x...
```

### Verwachte Response Voorbeeld
```json
{
  "ok": true,
  "degrade": false,
  "ts": 1702500000000,
  "pool": {
    "head": {
      "tvl": 2400000,
      "fees24h": 1200,
      "fees7d": 8400,
      "positionsCount": 336
    },
    "universe": {
      "pair": {
        "token0Symbol": "WFLR",
        "token1Symbol": "USDT0"
      },
      "summary": {
        "tvlUsd": 2400000,
        "fees24hUsd": 1200,
        "fees7dUsd": 8400,
        "positionsCount": 336,
        "walletsCount": 320
      },
      "segments": [
        {
          "dex": "enosys-v3",
          "feeTierBps": 3000,
          "tvlUsd": 1800000,
          "fees7dUsd": 6300,
          "positionsCount": 250
        },
        {
          "dex": "sparkdex-v3",
          "feeTierBps": 3000,
          "tvlUsd": 600000,
          "fees7dUsd": 2100,
          "positionsCount": 86
        }
      ]
    }
  }
}
```

---

**Einde Briefing**

*Gemaakt: 2024-12-13*
*Voor: GPT 5.2 Pool Data Implementation*

