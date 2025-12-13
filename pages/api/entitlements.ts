import type { NextApiRequest, NextApiResponse } from 'next';

import { priceBreakdown } from '@/lib/billing/pricing';
import { getEntitlements } from '@/lib/entitlements';
import { resolveRole, roleFlags } from '@/lib/entitlements/resolveRole';

function parseBoolean(value: string | string[] | undefined, fallback = false): boolean {
  if (Array.isArray(value)) return parseBoolean(value[0], fallback);
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(lowered)) return true;
    if (['0', 'false', 'no', 'off'].includes(lowered)) return false;
  }
  return fallback;
}

function parseSlots(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return 5;
  return Math.max(5, Math.ceil(parsed / 5) * 5);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wallet = typeof req.query.wallet === 'string' ? req.query.wallet.toLowerCase().trim() : null;
  const devOverrideWallets = new Set(['0x57d294d815968f0efa722f1e8094da65402cd951']);
  const isDev = process.env.NODE_ENV !== 'production';

  const slots = parseSlots(req.query.slots);
  const alertsSelected = parseBoolean(req.query.alertsSelected, false);
  const host = typeof req.headers.host === 'string' ? req.headers.host.toLowerCase() : '';
  const isLocalHost = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  const resolution =
    isDev && isLocalHost && wallet && devOverrideWallets.has(wallet)
      ? { role: 'PRO' as const, source: 'dev-override' }
      : resolveRole(req);
  const flags = roleFlags(resolution.role);

  const breakdown = priceBreakdown({ slots, alertsSelected });
  const entitlements = getEntitlements(resolution.role, slots, alertsSelected, slots);

  const response = {
    role: resolution.role,
    source: resolution.source,
    flags,
    entitlements: {
      role: entitlements.role,
      flags,
      caps: { maxPools: entitlements.maxPools },
      fields: {
        apr: flags.premium ? entitlements.fields.apr : false,
        incentives: flags.premium ? entitlements.fields.incentives : false,
        rangeBand: flags.premium ? entitlements.fields.rangeBand : false,
      },
      ...(typeof entitlements.remainingSlots === 'number'
        ? { remainingSlots: entitlements.remainingSlots }
        : {}),
    },
    pricingPreview: breakdown,
  };

  return res.status(200).json(response);
}
