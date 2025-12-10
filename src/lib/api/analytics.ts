import type { PositionRow, PositionsResponse } from '@/lib/positions/types';

export type AnalyticsSummaryData = {
  tvlTotal: number;
  poolsActive: number;
  positionsActive: number;
  fees24h: number;
  fees7d: number;
};

export type AnalyticsSummaryResponse = {
  ok?: boolean;
  degrade?: boolean;
  ts: number;
  data?: AnalyticsSummaryData;
};

export type DexName = 'ENOSYS' | 'SPARKDEX' | 'OTHER';

export type AnalyticsPoolHead = {
  state: 'ok' | 'empty' | 'warming';
  tvl: number;
  fees24h: number;
  fees7d: number;
  incentives24h: number;
  incentives7d: number;
  positionsCount: number;
};

export type AnalyticsPoolUniverseSegment = {
  poolAddress: string;
  dex: DexName | string;
  feeTierBps: number | null;
  tvlUsd: number;
  fees7dUsd: number;
  positionsCount: number;
};

export type AnalyticsPoolUniverseSummary = {
  tvlUsd: number;
  fees24hUsd: number;
  fees7dUsd: number;
  incentives24hUsd: number;
  incentives7dUsd: number;
  positionsCount: number;
  walletsCount: number;
};

export type AnalyticsPoolUniverse = {
  pair: {
    token0Symbol: string;
    token1Symbol: string;
  };
  summary: AnalyticsPoolUniverseSummary;
  segments: AnalyticsPoolUniverseSegment[];
};

export type AnalyticsPoolData = {
  head: AnalyticsPoolHead;
  universe: AnalyticsPoolUniverse;
};

export type AnalyticsPoolResponse = {
  ok: boolean;
  degrade: boolean;
  ts: string;
  pool: AnalyticsPoolData;
};

export type PoolUniverseAnalyticsResponse = import('@/lib/analytics/types').PoolUniverseAnalyticsResponse;

export type WalletPortfolioSummary = {
  address: string;
  positionsCount: number;
  poolsCount: number;
  activePositions: number;
  totalTvlUsd: number;
  fees7dUsd: number | null;
  lifetimeFeesUsd: number | null;
};

export type WalletPortfolioAnalytics = {
  summary: WalletPortfolioSummary;
  positions: PositionRow[];
  meta?: NonNullable<PositionsResponse['data']>['meta'];
};

export async function getWalletPortfolioAnalytics(
  address: string,
  opts: { signal?: AbortSignal } = {},
): Promise<WalletPortfolioAnalytics> {
  const { fetchPositions, computeSummary } = await import('@/lib/positions/client');
  const payload = await fetchPositions(address, { signal: opts.signal });
  const positions = payload.data?.positions ?? [];
  const summaryServer = payload.data?.summary;

  const pools = new Set<string>();
  let activePositions = 0;
  for (const pos of positions) {
    if (pos.poolAddress) pools.add(pos.poolAddress.toLowerCase());
    if (pos.category === 'Active') activePositions += 1;
  }

  const summaryComputed = summaryServer ?? computeSummary(positions);

  return {
    summary: {
      address,
      positionsCount: positions.length,
      poolsCount: pools.size,
      activePositions,
      totalTvlUsd: summaryComputed?.tvlUsd ?? 0,
      fees7dUsd: summaryComputed?.fees7dUsd ?? null,
      lifetimeFeesUsd: summaryComputed?.rewardsUsd ?? null,
    },
    positions,
    meta: payload.data?.meta,
  };
}

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}`);
  }

  return response.json();
}

export async function fetchSummary(): Promise<AnalyticsSummaryResponse> {
  try {
    return await fetchJson<AnalyticsSummaryResponse>('/api/analytics/summary');
  } catch {
    return {
      ok: false,
      degrade: true,
      ts: Date.now(),
      data: undefined,
    };
  }
}

export async function fetchPool(address: string): Promise<AnalyticsPoolResponse> {
  return await fetchJson<AnalyticsPoolResponse>(`/api/analytics/pool/${encodeURIComponent(address)}`);
}

export async function fetchPoolUniverse(poolAddress: string): Promise<PoolUniverseAnalyticsResponse> {
  try {
    return await fetchJson<PoolUniverseAnalyticsResponse>(
      `/api/analytics/pool/${encodeURIComponent(poolAddress)}`,
    );
  } catch {
    return {
      ok: false,
      degrade: true,
      ts: Date.now(),
      pool: {
        address: poolAddress,
        dex: 'OTHER',
        token0Symbol: null,
        token1Symbol: null,
        feeTierBps: null,
      },
      tvl: { totalUsd: null, token0: null, token1: null },
      metrics7d: {
        volumeUsd: null,
        feesUsd: null,
        swapsCount: 0,
        collectsCount: 0,
        mintsCount: 0,
        burnsCount: 0,
        timePeriod: '7d',
      },
      lpPopulation: {
        totalPositions: 0,
        uniqueWallets: 0,
        segments: {
          retail: { count: 0, tvlShare: null },
          mid: { count: 0, tvlShare: null },
          whale: { count: 0, tvlShare: null },
        },
      },
      rangeEfficiency: {
        inRangePct: null,
        nearRangePct: null,
        outOfRangePct: null,
        timePeriod: '7d',
      },
      volatility: { regime: null, timePeriod: '7d' },
      claimBehavior: {
        avgClaimIntervalDays: null,
        medianClaimIntervalDays: null,
        avgUnclaimedFeesUsd: null,
        timePeriod: '7d',
      },
    };
  }
}

function normalizeWalletAddress(address: string): string {
  const trimmed = address.trim().toLowerCase();
  if (!ADDRESS_REGEX.test(trimmed)) {
    throw new Error('Invalid wallet address');
  }
  return trimmed;
}

function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function deriveCategory(position: PositionRow): 'Active' | 'Inactive' | 'Ended' {
  if (position.category === 'Active' || position.category === 'Inactive' || position.category === 'Ended') {
    return position.category;
  }

  const tvl = coerceNumber(position.tvlUsd ?? position.amountsUsd?.total);
  const rewards = coerceNumber(position.rewardsUsd);
  const unclaimedFees = coerceNumber(position.unclaimedFeesUsd);
  const incentives = coerceNumber(position.incentivesUsd ?? position.incentivesUsdPerDay);

  if (tvl > 0) return 'Active';
  if (rewards > 0 || unclaimedFees > 0 || incentives > 0) return 'Inactive';
  return 'Ended';
}

function computeWalletSummary(address: string, positions: PositionRow[]): WalletPortfolioSummary {
  let totalTvlUsd = 0;
  let lifetimeFeesUsd = 0;
  let fees7dUsd = 0;
  let hasSevenDayFees = false;
  let activePositions = 0;
  const pools = new Set<string>();

  for (const position of positions) {
    totalTvlUsd += coerceNumber(position.tvlUsd ?? position.amountsUsd?.total);
    lifetimeFeesUsd += coerceNumber(position.rewardsUsd ?? position.claim?.usd ?? position.unclaimedFeesUsd);

    const rangeCategory = deriveCategory(position);
    if (rangeCategory === 'Active') {
      activePositions += 1;
    }

    const sevenDayFees = coerceNumber(position.rewardsUsd7d ?? position.unclaimedFeesUsd7d);
    if (Number.isFinite(sevenDayFees)) {
      fees7dUsd += sevenDayFees;
      hasSevenDayFees = true;
    }

    if (position.poolAddress) {
      pools.add(position.poolAddress.toLowerCase());
    }
  }

  return {
    address,
    positionsCount: positions.length,
    poolsCount: pools.size,
    activePositions,
    totalTvlUsd,
    fees7dUsd: hasSevenDayFees ? fees7dUsd : null,
    lifetimeFeesUsd: lifetimeFeesUsd || null,
  };
}

export async function fetchWalletPortfolio(address: string): Promise<WalletPortfolioAnalytics> {
  const normalized = normalizeWalletAddress(address);
  const response = await fetchJson<PositionsResponse>(`/api/positions?address=${encodeURIComponent(normalized)}`);
  const positions = (response.data?.positions ?? []) as PositionRow[];
  const summary = computeWalletSummary(normalized, positions);
  return { summary, positions, meta: response.data?.meta };
}
