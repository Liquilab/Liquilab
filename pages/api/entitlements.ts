import type { NextApiRequest, NextApiResponse } from 'next';

import pricingConfig from '@/config/pricing';
import type { Plan } from '@/lib/roles';
import { getPlanForAddress } from '@/lib/roles';

type EntitlementStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'none';

type EntitlementsEnvelope = {
  ok: boolean;
  degrade?: boolean;
  ts: number;
  wallet: string | null;
  plan: Plan;
  status: EntitlementStatus;
  maxPools: number;
  features: string[];
  indexedUpToTs: string | null;
  reason?: string;
};

const MAX_POOLS: Record<Plan, number> = {
  VISITOR: 0,
  PREMIUM: pricingConfig.plans.PREMIUM.pools,
  PRO: pricingConfig.plans.PRO.pools * 3,
};

const FEATURES: Record<Plan, string[]> = {
  VISITOR: ['rangeband'],
  PREMIUM: ['rangeband', 'reports', 'alerts'],
  PRO: ['rangeband', 'reports', 'alerts', 'priority'],
};

function hasDatabase(): boolean {
  return process.env.DB_DISABLE !== 'true' && Boolean(process.env.DATABASE_URL);
}

function parseWallet(req: NextApiRequest): string | null {
  const queryWallet = typeof req.query.wallet === 'string' ? req.query.wallet : undefined;
  const headerWallet =
    typeof req.headers['x-wallet-address'] === 'string' ? req.headers['x-wallet-address'] : undefined;
  const candidate = (queryWallet || headerWallet || '').trim();
  return candidate ? candidate.toLowerCase() : null;
}

async function resolveEntitlements(wallet: string | null): Promise<EntitlementsEnvelope> {
  const ts = Date.now();
  if (!hasDatabase()) {
    return {
      ok: false,
      degrade: true,
      ts,
      wallet,
      plan: 'VISITOR',
      status: 'none',
      maxPools: 0,
      features: FEATURES.VISITOR,
      indexedUpToTs: null,
      reason: 'DB_DISABLED',
    };
  }

  try {
    const plan = await getPlanForAddress(wallet);
    const status: EntitlementStatus = plan === 'VISITOR' ? 'none' : 'active';
    return {
      ok: true,
      ts,
      wallet,
      plan,
      status,
      maxPools: MAX_POOLS[plan],
      features: FEATURES[plan],
      indexedUpToTs: null,
    };
  } catch {
    return {
      ok: false,
      degrade: true,
      ts,
      wallet,
      plan: 'VISITOR',
      status: 'none',
      maxPools: MAX_POOLS.VISITOR,
      features: FEATURES.VISITOR,
      indexedUpToTs: null,
      reason: 'ENTITLEMENTS_ERROR',
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<EntitlementsEnvelope>) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      degrade: true,
      ts: Date.now(),
      wallet: null,
      plan: 'VISITOR',
      status: 'none',
      maxPools: MAX_POOLS.VISITOR,
      features: FEATURES.VISITOR,
      indexedUpToTs: null,
      reason: 'METHOD_NOT_ALLOWED',
    });
  }

  const wallet = parseWallet(req);
  const payload = await resolveEntitlements(wallet);
  return res.status(200).json(payload);
}
