import type { NextApiRequest, NextApiResponse } from 'next';

import { TOKEN_ASSETS } from '@/lib/assets';
import { getTokenIconMeta, getIconRequestCount } from '@/services/tokenIconService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const symbolParam = req.query.symbol;
  const symbol =
    typeof symbolParam === 'string'
      ? symbolParam
      : Array.isArray(symbolParam)
        ? symbolParam[0] ?? ''
        : '';

  if (symbol === '__metrics') {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.status(200).json({
      env,
      iconRequestCount: getIconRequestCount(),
      note: 'Process-level CoinGecko icon request counter since last restart; staging diagnostics only.',
    });
    return;
  }

  const addressParam = req.query.address;
  const address = typeof addressParam === 'string' ? addressParam : undefined;

  try {
    const meta = await getTokenIconMeta({ symbol, address });
    const target = meta.url ?? TOKEN_ASSETS.default;

    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
    res.redirect(302, target);
  } catch {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.redirect(302, TOKEN_ASSETS.default);
  }
}
