import type { NextApiRequest, NextApiResponse } from 'next';

import type { AnalyticsPoolHead, AnalyticsPoolUniverse } from '@/lib/api/analytics';
import { getPoolHeadMetrics, getPoolUniverseHead } from '@/lib/analytics/db';

function makeEmptyHead(): AnalyticsPoolHead {
  return {
    state: 'empty',
    tvl: 0,
    fees24h: 0,
    fees7d: 0,
    incentives24h: 0,
    incentives7d: 0,
    positionsCount: 0,
  };
}

function makeEmptyUniverse(): AnalyticsPoolUniverse {
  return {
    pair: {
      token0Symbol: '',
      token1Symbol: '',
    },
    summary: {
      tvlUsd: 0,
      fees24hUsd: 0,
      fees7dUsd: 0,
      incentives24hUsd: 0,
      incentives7dUsd: 0,
      positionsCount: 0,
      walletsCount: 0,
    },
    segments: [],
    dexBreakdown: [],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id;
  const poolAddress = Array.isArray(id) ? id[0]?.toLowerCase() : id?.toLowerCase();

  if (!poolAddress) {
    return res.status(400).json({ ok: false, degrade: false, error: 'Missing pool id' });
  }

  const ts = new Date().toISOString();

  const [headResult, universeResult] = await Promise.all([
    getPoolHeadMetrics(poolAddress),
    getPoolUniverseHead(poolAddress),
  ]);

  const degrade = Boolean(headResult.degrade || universeResult.degrade);
  const headMetrics = headResult.metrics;
  const head: AnalyticsPoolHead = headMetrics
    ? {
        state: degrade ? 'warming' : 'ok',
        tvl: headMetrics.tvlUsd ?? 0,
        fees24h: headMetrics.fees24hUsd ?? 0,
        fees7d: headMetrics.fees7dUsd ?? 0,
        incentives24h: headMetrics.incentives24hUsd ?? 0,
        incentives7d: headMetrics.incentives7dUsd ?? 0,
        positionsCount: headMetrics.positionsCount ?? 0,
      }
    : makeEmptyHead();

  const universeRaw: AnalyticsPoolUniverse = (universeResult.universe as AnalyticsPoolUniverse | null) ?? makeEmptyUniverse();
  const { pair, summary, segments } = universeRaw;
  const safeUniverse: AnalyticsPoolUniverse = {
    pair,
    summary: {
      tvlUsd: summary.tvlUsd ?? 0,
      fees24hUsd: summary.fees24hUsd ?? 0,
      fees7dUsd: summary.fees7dUsd ?? 0,
      incentives24hUsd: summary.incentives24hUsd ?? 0,
      incentives7dUsd: summary.incentives7dUsd ?? 0,
      positionsCount: summary.positionsCount ?? 0,
      walletsCount: summary.walletsCount ?? 0,
    },
    segments,
  };

  const payload = {
    ok: Boolean(headResult.ok && universeResult.ok),
    degrade,
    ts,
    pool: {
      head,
      universe: safeUniverse,
    },
  };

  return res.status(200).json(payload);
}
