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

export type AnalyticsPoolResponse = import('@/lib/analytics/types').AnalyticsPoolResponse;

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
  try {
    return await fetchJson<AnalyticsPoolResponse>(`/api/analytics/pool/${encodeURIComponent(address)}`);
  } catch {
    return {
      ok: false,
      degrade: true,
      ts: Date.now(),
      pool: {
        head: null,
        universe: null,
      },
    };
  }
}

export type PoolUniverseAnalyticsResponse = import('@/lib/analytics/types').PoolUniverseAnalyticsResponse;

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

export type WalletPortfolioAnalytics = import('@/lib/positions/types').PositionsResponse['data'] & {
  summary: {
    address: string;
    positionsCount: number;
    poolsCount: number;
    activePositions: number;
    totalTvlUsd: number;
    fees7dUsd: number | null;
    lifetimeFeesUsd: number | null;
  };
};

export async function getWalletPortfolioAnalytics(
  walletAddress: string,
  opts: { signal?: AbortSignal } = {},
): Promise<WalletPortfolioAnalytics> {
  const params = new URLSearchParams({ wallet: walletAddress });
  const url = `/api/analytics/wallet/portfolio?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    signal: opts.signal,
  });
  if (!response.ok) {
    // Graceful fallback to avoid runtime crash when endpoint is unavailable in dev
    return {
      summary: {
        address: walletAddress.toLowerCase(),
        positionsCount: 0,
        poolsCount: 0,
        activePositions: 0,
        totalTvlUsd: 0,
        fees7dUsd: null,
        lifetimeFeesUsd: null,
      },
      positions: [],
      meta: undefined,
    };
  }
  return (await response.json()) as WalletPortfolioAnalytics;
}
