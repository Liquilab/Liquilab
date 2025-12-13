/**
 * Analytics Types
 * 
 * Type definitions for analytics API responses and internal data structures.
 */

export type DexKey = 'ENOSYS' | 'SPARKDEX' | 'OTHER';

export type AnalyticsTimePeriod = '7d' | '24h' | '30d';

export interface PercentageShare {
  value: number;
  context: string;
}

export interface PoolUniverseAnalyticsResponse {
  ok: boolean;
  degrade?: boolean;
  ts: number;
  pool: {
    address: string;
    dex: DexKey;
    token0Symbol: string | null;
    token1Symbol: string | null;
    feeTierBps: number | null;
  };
  tvl: {
    totalUsd: number | null;
    token0: number | null;
    token1: number | null;
  };
  metrics7d: {
    volumeUsd: number | null;
    feesUsd: number | null;
    swapsCount: number | null;
    collectsCount: number | null;
    mintsCount: number | null;
    burnsCount: number | null;
    timePeriod: AnalyticsTimePeriod;
  };
  lpPopulation: {
    totalPositions: number;
    uniqueWallets: number;
    segments: {
      retail: { count: number; tvlShare: PercentageShare | null };
      mid: { count: number; tvlShare: PercentageShare | null };
      whale: { count: number; tvlShare: PercentageShare | null };
    };
  };
  rangeEfficiency: {
    inRangePct: number | null;
    nearRangePct: number | null;
    outOfRangePct: number | null;
    timePeriod: AnalyticsTimePeriod;
  };
  volatility: {
    regime: 'Low' | 'Normal' | 'High' | null;
    timePeriod: AnalyticsTimePeriod;
  };
  claimBehavior: {
    avgClaimIntervalDays: number | null;
    medianClaimIntervalDays: number | null;
    avgUnclaimedFeesUsd: number | null;
    timePeriod: AnalyticsTimePeriod;
  };
}

export interface UniverseOverview {
  snapshotAt: string;
  timePeriod7d: AnalyticsTimePeriod;
  tvl: {
    totalUsd: number | null;
    byDex: Record<DexKey, number | null>;
  };
  volume7d: {
    totalUsd: number | null;
    byDex: Record<DexKey, number | null>;
  };
  fees7d: {
    totalUsd: number | null;
    byDex: Record<DexKey, number | null>;
  };
  pools: {
    total: number;
    withSwaps7d: number;
  };
  lpWallets: {
    snapshot: number;
    active7d: number;
  };
  positions: {
    total: number;
  };
  narrative: {
    headline: string;
    bullets: string[];
  };
}

export interface UniverseRangeEfficiency {
  snapshotAt: Date;
  windowDays: number;
  poolsConsidered: number;
  avgRangeEfficiencyRatio: number;
  poolsMajorityInRange: number;
  poolsMajorityOutOfRange: number;
}

export interface UniverseWeeklySnapshot {
  weekStart: Date;
  weekEnd: Date;
  tvlUsd: number | null;
  volume7dUsd: number | null;
  fees7dUsd: number | null;
  poolsCount: number;
  positionsCount: number;
  lpWalletsCount: number;
}

export interface UniverseWeeklyDelta {
  weekStart: Date;
  tvlDeltaUsd: number | null;
  tvlDeltaPct: number | null;
  volume7dDeltaUsd: number | null;
  volume7dDeltaPct: number | null;
  fees7dDeltaUsd: number | null;
  fees7dDeltaPct: number | null;
  poolsDelta: number | null;
  positionsDelta: number | null;
  lpWalletsDelta: number | null;
}

export interface PoolWeeklySnapshot {
  poolAddress: string;
  weekStart: Date;
  weekEnd: Date;
  tvlUsd: number | null;
  volume7dUsd: number | null;
  fees7dUsd: number | null;
  positionsCount: number;
}

export interface PoolWeeklyDelta {
  poolAddress: string;
  volume7dUsdCurrent: number | null;
  volume7dUsdPrevious: number | null;
  volume7dDeltaUsd: number | null;
  volume7dDeltaPct: number | null;
  volume30dUsdCurrent: number | null;
  volume30dUsdPrevious: number | null;
  volume30dDeltaUsd: number | null;
  volume30dDeltaPct: number | null;
}

export interface PoolVolume7dUsd {
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  volume7dUsd: number | null;
  volume0Normalized: number;
  volume1Normalized: number;
}

export interface PoolSevenDayTokenNativeMetrics {
  windowStart: string | null;
  windowEnd: string | null;
  volume: {
    swapsCount: number;
    volumeToken0: string;
    volumeToken1: string;
  } | null;
  fees: {
    collectsCount: number;
    feesToken0: string;
    feesToken1: string;
  } | null;
  liquidityChanges: {
    mintsCount: number;
    burnsCount: number;
    netLiquidityRaw: string;
    netAmount0: string;
    netAmount1: string;
  } | null;
}

export interface PoolSevenDayAprMetrics {
  apr7dPct: number | null;
  fees7dUsd: number | null;
  tvlUsd: number | null;
}

// ---------------------------------------------------------------------------
// Pool Universe (Phase 1) types
// ---------------------------------------------------------------------------

export interface AnalyticsPoolHead {
  tvlUsd: number;
  fees24hUsd: number;
  fees7dUsd: number;
  positionsCount: number;
}

export interface AnalyticsPoolUniversePair {
  token0Symbol: string | null;
  token1Symbol: string | null;
}

export interface AnalyticsPoolUniverseSummary {
  tvlUsd: number;
  fees24hUsd: number;
  fees7dUsd: number;
  positionsCount: number;
  walletsCount: number;
}

export interface AnalyticsPoolUniverseSegment {
  dex: string;
  feeTierBps: number;
  tvlUsd: number;
  fees7dUsd: number;
  positionsCount: number;
}

export interface AnalyticsPoolUniverse {
  pair: AnalyticsPoolUniversePair;
  summary: AnalyticsPoolUniverseSummary;
  segments: AnalyticsPoolUniverseSegment[];
}

export interface AnalyticsPoolData {
  head: AnalyticsPoolHead | null;
  universe: AnalyticsPoolUniverse | null;
}

export interface AnalyticsPoolResponse {
  ok?: boolean;
  degrade?: boolean;
  ts: number;
  pool?: AnalyticsPoolData;
}

export interface PoolFeeApr7d {
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  factory: string;
  fees7dUsd: number | null;
  apr7dPct: number | null;
}

export interface PoolAnalyticsResponse {
  ok: boolean;
  degrade?: boolean;
  ts: number;
  pool: {
    state: string;
    tvl: number;
    fees24h: number;
    fees7d: number;
    positionsCount: number;
  };
}

export interface PositionProSummary {
  tokenId: string;
  wallet: string;
  poolAddress: string;
  dex: string;
  positionValueUsd: number;
  feesRealizedUsd: number;
  incentivesRealizedUsd: number;
  lifetimeAprPct: number | undefined;
  timePeriodForApr: AnalyticsTimePeriod;
  daysInPool: number | undefined;
  isActive: boolean;
}

export interface PositionRangeBandStatus {
  strategy: 'aggressive' | 'balanced' | 'conservative';
  bandWidthPct: number;
  timePeriod: AnalyticsTimePeriod;
  timeInRangeShare: PercentageShare;
  timeOutOfRangeShare: PercentageShare;
  rangeEfficiencyPct: number | undefined;
  timesOutOfRange: number | undefined;
}

export interface PositionPoolShare {
  poolTvlShare: PercentageShare;
}

export interface PositionPeerAnalytics {
  metrics: Array<{
    metric: string;
    yourValue: string | number;
    peerAverage: string | number;
    rank: string;
  }>;
  timePeriod: AnalyticsTimePeriod;
}

export interface PositionProAnalyticsResponse {
  tokenId: string;
  status: 'ok' | 'degraded' | 'empty';
  summary: PositionProSummary;
  rangeBandStatus: PositionRangeBandStatus;
  poolShare: PositionPoolShare;
  peerAnalytics: PositionPeerAnalytics;
}
