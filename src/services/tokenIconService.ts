import NodeCache from 'node-cache';
import { canonicalSymbol } from '@/lib/icons/symbolMap';
import { TOKEN_PRICING_CONFIG, type TokenPricingConfig } from '../../config/token-pricing.config';

export type TokenIconRequest = {
  symbol?: string | null;
  address?: string | null;
};

export type TokenIconMeta = {
  url: string | null;
  source: 'coingecko' | 'default';
};

const ICON_CACHE = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 24 hours
let iconRequestCount = 0;
let coinGeckoRateLimited = false;

const CONFIG_BY_SYMBOL = new Map<string, TokenPricingConfig>();
const CONFIG_BY_ADDRESS = new Map<string, TokenPricingConfig>();

for (const config of Object.values(TOKEN_PRICING_CONFIG)) {
  CONFIG_BY_SYMBOL.set(config.canonicalSymbol, config);
  if (config.address) {
    CONFIG_BY_ADDRESS.set(config.address.toLowerCase(), config);
  }
}

function resolveTokenConfig(symbol?: string | null, address?: string | null): TokenPricingConfig | null {
  if (symbol) {
    const canonical = canonicalSymbol(symbol);
    if (canonical) {
      const config = CONFIG_BY_SYMBOL.get(canonical);
      if (config) return config;
    }
  }

  if (address) {
    const trimmed = address.trim().toLowerCase();
    const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
    const config = CONFIG_BY_ADDRESS.get(normalized);
    if (config) return config;
  }

  return null;
}

function normalizeCoinGeckoUrl(url: string | null | undefined): string | null {
  if (typeof url !== 'string' || url.length === 0) return null;
  return url.startsWith('http') ? url : `https:${url}`;
}

function logCoinGeckoIconRequest({
  coingeckoId,
  url,
  status,
  rateLimitHeaders,
}: {
  coingeckoId: string;
  url: string;
  status: number;
  rateLimitHeaders: Record<string, string | null>;
}) {
  iconRequestCount += 1;
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    return;
  }

  const limit = rateLimitHeaders['x-ratelimit-limit'] ?? rateLimitHeaders['x-cgpro-rate-limit-limit'] ?? null;
  const remaining =
    rateLimitHeaders['x-ratelimit-remaining'] ?? rateLimitHeaders['x-cgpro-rate-limit-remaining'] ?? null;
  const reset = rateLimitHeaders['x-ratelimit-reset'] ?? rateLimitHeaders['x-cgpro-rate-limit-reset'] ?? null;

  console.log(
    '[COINGECKO_ICON] id=%s count=%d status=%d limit=%s remaining=%s reset=%s url=%s',
    coingeckoId,
    iconRequestCount,
    status,
    limit,
    remaining,
    reset,
    url,
  );
}

export function getIconRequestCount(): number {
  return iconRequestCount;
}

async function fetchCoinGeckoIcon(coingeckoId: string): Promise<string | null> {
  if (coinGeckoRateLimited) return null;

  const apiKey = process.env.COINGECKO_API_KEY;
  const baseUrl = apiKey ? 'https://pro-api.coingecko.com/api/v3' : 'https://api.coingecko.com/api/v3';
  const headers: Record<string, string> = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};
  const endpoint = `${baseUrl}/coins/${encodeURIComponent(
    coingeckoId,
  )}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;

  try {
    const response = await fetch(endpoint, { headers });
    const headerSnapshot: Record<string, string | null> = {
      'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
      'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
      'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
      'x-cgpro-rate-limit-limit': response.headers.get('x-cgpro-rate-limit-limit'),
      'x-cgpro-rate-limit-remaining': response.headers.get('x-cgpro-rate-limit-remaining'),
      'x-cgpro-rate-limit-reset': response.headers.get('x-cgpro-rate-limit-reset'),
    };

    if (response.status === 429) {
      coinGeckoRateLimited = true;
      console.warn('[tokenIconService] CoinGecko rate-limited; using default icons for remainder of this run');
      logCoinGeckoIconRequest({ coingeckoId, url: endpoint, status: response.status, rateLimitHeaders: headerSnapshot });
      return null;
    }

    if (!response.ok) {
      console.warn(`[tokenIconService] CoinGecko error for ${coingeckoId}: ${response.status}`);
      logCoinGeckoIconRequest({ coingeckoId, url: endpoint, status: response.status, rateLimitHeaders: headerSnapshot });
      return null;
    }

    const data = await response.json();
    const url =
      normalizeCoinGeckoUrl(data?.image?.small) ??
      normalizeCoinGeckoUrl(data?.image?.thumb) ??
      normalizeCoinGeckoUrl(data?.image?.large);

    logCoinGeckoIconRequest({ coingeckoId, url: endpoint, status: response.status, rateLimitHeaders: headerSnapshot });
    return url;
  } catch (error) {
    console.warn(`[tokenIconService] Failed to fetch CoinGecko icon for ${coingeckoId}`, error);
    return null;
  }
}

export async function getTokenIconMeta(request: TokenIconRequest): Promise<TokenIconMeta> {
  const config = resolveTokenConfig(request.symbol, request.address);
  if (config?.coingeckoId) {
    const cached = ICON_CACHE.get<string | null>(config.coingeckoId);
    if (cached !== undefined) {
      return cached
        ? { url: cached, source: 'coingecko' }
        : { url: null, source: 'default' };
    }

    const url = await fetchCoinGeckoIcon(config.coingeckoId);
    ICON_CACHE.set(config.coingeckoId, url ?? null);

    if (url) {
      return { url, source: 'coingecko' };
    }
  }

  return { url: null, source: 'default' };
}

export async function getTokenIconUrl(symbol?: string | null, address?: string | null): Promise<string | null> {
  const meta = await getTokenIconMeta({ symbol, address });
  return meta.url;
}

export function clearTokenIconCache(): void {
  ICON_CACHE.flushAll();
  coinGeckoRateLimited = false;
  iconRequestCount = 0;
}
