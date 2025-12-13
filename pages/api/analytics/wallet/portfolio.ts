import type { NextApiRequest, NextApiResponse } from 'next';

type PortfolioSummary = {
  address: string;
  positionsCount: number;
  poolsCount: number;
  activePositions: number;
  totalTvlUsd: number;
  fees7dUsd: number | null;
  lifetimeFeesUsd: number | null;
};

type PortfolioResponse = {
  ok: boolean;
  degrade: boolean;
  ts: number;
  summary: PortfolioSummary;
  positions: unknown[];
  meta?: unknown;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<PortfolioResponse>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const wallet =
    typeof req.query.wallet === 'string'
      ? req.query.wallet.toLowerCase().trim()
      : '0x0000000000000000000000000000000000000000';

  const summary: PortfolioSummary = {
    address: wallet,
    positionsCount: 0,
    poolsCount: 0,
    activePositions: 0,
    totalTvlUsd: 0,
    fees7dUsd: null,
    lifetimeFeesUsd: null,
  };

  return res.status(200).json({
    ok: true,
    degrade: false,
    ts: Date.now(),
    summary,
    positions: [],
  });
}
