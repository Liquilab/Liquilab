import { COINGECKO_ALLOWLIST_IDS, STABLE_PRICE_OVERRIDES } from './hints';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const PRICING_MODE = 'coingecko_allowlist';

export function getStablecoinUsdValue(address: string): number | undefined {
  if (typeof address !== 'string') return undefined;
  return STABLE_PRICE_OVERRIDES[address.toLowerCase()];
}

export function isStablecoinAddress(address: string): boolean {
  return getStablecoinUsdValue(address) !== undefined;
}

const COINGECKO_API_URL = process.env.COINGECKO_API_KEY
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';

const priceCache = new Map<
  string,
  { price: number; expires: number; source?: PricingSource; warnings?: string[] }
>();
const CACHE_TTL_MS = 2 * 60 * 1000;

export type PricingSource =
  | 'coingecko_id'
  | 'stable_override'
  | 'unpriced_allowlist'
  | 'missing';

export interface PriceResult {
  price: number | undefined;
  source: PricingSource;
  warnings?: string[];
}

function normaliseAddresses(addresses: string[]): string[] {
  const seen = new Set<string>();
  const normalised: string[] = [];

  addresses.forEach((address) => {
    if (typeof address !== 'string') return;
    const lower = address.toLowerCase();
    if (!ADDRESS_REGEX.test(lower)) return;
    if (seen.has(lower)) return;
    seen.add(lower);
    normalised.push(lower);
  });

  return normalised;
}

async function fetchCoinGeckoIdPrices(ids: string[]): Promise<Record<string, number>> {
  if (ids.length === 0) return {};

  const unique = Array.from(new Set(ids));
  const headers: Record<string, string> = {};
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-pro-api-key'] = process.env.COINGECKO_API_KEY;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${encodeURIComponent(unique.join(','))}&vs_currencies=usd`,
      { signal: controller.signal, headers }
    );
    clearTimeout(timeout);

    if (!response.ok) return {};
    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== 'object') return {};

    const out: Record<string, number> = {};
    const priceMap = payload as Record<string, { usd?: number }>;
    for (const id of unique) {
      const price = priceMap[id]?.usd;
      if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
        out[id] = price;
      }
    }
    return out;
  } catch {
    return {};
  }
}


export async function getPrices(addresses: string[]): Promise<Record<string, number>> {
  const result = await getPricesWithSource(addresses);
  const prices: Record<string, number> = {};
  for (const [addr, res] of Object.entries(result)) {
    if (res.price !== undefined) {
      prices[addr] = res.price;
    }
  }
  return prices;
}

export async function getPricesWithSource(addresses: string[]): Promise<Record<string, PriceResult>> {
  const normalised = normaliseAddresses(addresses);
  if (normalised.length === 0) return {};

  const results: Record<string, PriceResult> = {};
  const now = Date.now();

  let stableHits = 0;
  let coingeckoHits = 0;
  let unpricedCount = 0;
  let sanityRejectCount = 0;

  const cacheKeyFor = (address: string) => `${PRICING_MODE}:${address}`;

  for (const address of normalised) {
    const cached = priceCache.get(cacheKeyFor(address));
    if (cached && cached.expires > now) {
      results[address] = {
        price: cached.price,
        source: cached.source ?? 'missing',
        warnings: cached.warnings,
      };
    }
  }

  // Stable override (USDT0 only)
  for (const address of normalised) {
    if (results[address]) continue;
    const stable = STABLE_PRICE_OVERRIDES[address];
    if (stable === undefined) continue;
    const { price, warnings } = enforceStableBand(stable);
    if (price !== undefined) {
      stableHits += 1;
      results[address] = { price, source: 'stable_override', warnings };
    } else {
      sanityRejectCount += 1;
      results[address] = { price: undefined, source: 'unpriced_allowlist', warnings };
    }
  }

  // CoinGecko allowlist fetch
  const cgTargets = normalised.filter(
    (address) => !results[address] && COINGECKO_ALLOWLIST_IDS[address]
  );
  if (cgTargets.length > 0) {
    const ids = Array.from(
      new Set(cgTargets.map((address) => COINGECKO_ALLOWLIST_IDS[address]))
    );
    const cgPrices = await fetchCoinGeckoIdPrices(ids);
    for (const address of cgTargets) {
      const id = COINGECKO_ALLOWLIST_IDS[address];
      const price = id ? cgPrices[id] : undefined;
      if (price === undefined) continue;
      const validated = validateMarketPrice(price);
      if (validated !== undefined) {
        coingeckoHits += 1;
        results[address] = { price: validated, source: 'coingecko_id' };
      } else {
        sanityRejectCount += 1;
        results[address] = {
          price: undefined,
          source: 'unpriced_allowlist',
          warnings: ['sanity_reject'],
        };
      }
    }
  }

  // Mark any remaining addresses as unpriced_allowlist
  for (const address of normalised) {
    if (results[address]) continue;
    unpricedCount += 1;
    const warning = COINGECKO_ALLOWLIST_IDS[address]
      ? 'coingecko_missing'
      : 'not_allowlisted';
    results[address] = {
      price: undefined,
      source: 'unpriced_allowlist',
      warnings: [warning],
    };
  }

  // Cache priced results
  const expires = Date.now() + CACHE_TTL_MS;
  for (const [address, res] of Object.entries(results)) {
    if (res.price !== undefined) {
      priceCache.set(cacheKeyFor(address), {
        price: res.price,
        expires,
        source: res.source,
        warnings: res.warnings,
      });
    }
  }

  console.log(
    `[PRICING] mode=${PRICING_MODE} requested=${normalised.length} stable_hits=${stableHits} coingecko_hits=${coingeckoHits} unpriced=${unpricedCount} sanity_rejects=${sanityRejectCount}`
  );
  if (unpricedCount > 0) {
    const missing = normalised.filter((address) => results[address]?.price === undefined);
    console.warn('[PRICING] unpriced allowlist tokens', missing);
  }

  return results;
}

function enforceStableBand(value: number, target = 1): { price?: number; warnings?: string[] } {
  if (!Number.isFinite(value)) {
    return { warnings: ['stable_band_reject'] };
  }
  const lower = target * 0.97;
  const upper = target * 1.03;
  if (value < lower || value > upper) {
    return { warnings: ['stable_band_reject'] };
  }
  return { price: value };
}

function validateMarketPrice(value: number): number | undefined {
  if (!Number.isFinite(value)) return undefined;
  if (value <= 0 || value > 1_000_000_000) return undefined;
  return value;
}
