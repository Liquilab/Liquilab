import type { NextApiRequest, NextApiResponse } from 'next';
import pricing from '@/config/pricing';

type PricingConfig = typeof pricing;

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<PricingConfig | { error: string }>
) {
  if (_req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return res.status(200).json(pricing);
}
