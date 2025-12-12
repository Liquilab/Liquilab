import { ankrTokenPrice } from '@/lib/providers/ankr';
import { TOKEN_REGISTRY } from '@/services/tokenRegistry';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const STABLE_ADDRESSES = new Map<string, number>([
  ['0xe7cd86e13ac4309349f30b3435a9d337750fc82d'.toLowerCase(), 1], // USDTe / USDT0
  ['0xfbda5f676cb37624f28265a144a48b0d6e87d3b6'.toLowerCase(), 1], // USDC.e
  ['0x96b41289d90444b8add57e6f265db5ae8651df29'.toLowerCase(), 1], // eUSDT (Enosys)
]);

const DEFILLAMA_ENDPOINT = 'https://coins.llama.fi/prices/current';
const COINGECKO_API_URL = process.env.COINGECKO_API_KEY
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';

const priceCache = new Map<string, { price: number; expires: number }>();
const CACHE_TTL_MS = 2 * 60 * 1000;

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

function getRegistryHardPrice(address: string): number | undefined {
  const entry = TOKEN_REGISTRY[address.toLowerCase() as `0x${string}`];
  if (!entry || !Array.isArray(entry.price)) return undefined;
  for (const source of entry.price) {
    if (source.kind === 'hard' && typeof source.usd === 'number' && Number.isFinite(source.usd)) {
      return source.usd;
    }
  }
  return undefined;
}

async function fetchCoinGeckoPrices(addresses: string[]): Promise<Record<string, number>> {
  if (addresses.length === 0) return {};

  // CoinGecko on-chain token_price endpoint for Flare
  const addressesParam = addresses.map((addr) => addr.toLowerCase()).join(',');
  const url = `${COINGECKO_API_URL}/onchain/simple/networks/flare/token_price/${encodeURIComponent(addressesParam)}`;

  const headers: Record<string, string> = {};
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-pro-api-key'] = process.env.COINGECKO_API_KEY;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { signal: controller.signal, headers });
    clearTimeout(timeout);

    if (!response.ok) return {};
    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== 'object') return {};

    const out: Record<string, number> = {};
    for (const address of addresses) {
      const lower = address.toLowerCase();
      const entry = (payload as Record<string, any>)[lower];
      const price = typeof entry === 'number' ? entry : entry?.usd ?? entry?.price;
      if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
        out[address] = price;
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function fetchDefiLlamaPrices(addresses: string[]): Promise<Record<string, number>> {
  if (addresses.length === 0) return {};

  const query = addresses.map((addr) => `flare:${addr}`).join(',');
  const url = `${DEFILLAMA_ENDPOINT}?coins=${encodeURIComponent(query)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return {};
    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== 'object' || !payload.coins) return {};

    const out: Record<string, number> = {};
    for (const address of addresses) {
      const entry = (payload as any).coins[`flare:${address}`];
      const price = entry?.price;
      if (typeof price === 'number' && Number.isFinite(price)) {
        out[address] = price;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export async function getPrices(addresses: string[]): Promise<Record<string, number>> {
  const normalised = normaliseAddresses(addresses);
  if (normalised.length === 0) return {};

  const prices: Record<string, number> = {};
  const now = Date.now();

  console.log(`[PRICING] getPrices called with ${normalised.length} addresses`);

  // Cache lookup
  for (const address of normalised) {
    const cached = priceCache.get(address);
    if (cached && cached.expires > now) {
      prices[address] = cached.price;
      console.log(`[PRICING] cache hit ${address} price=${cached.price}`);
    }
  }

  // Registry hard prices
  for (const address of normalised) {
    if (prices[address] !== undefined) continue;
    const registryPrice = getRegistryHardPrice(address);
    if (registryPrice !== undefined) {
      prices[address] = registryPrice;
      console.log(`[PRICING] registry hard price for ${address}: $${registryPrice}`);
    }
  }

  // Stablecoins first
  normalised.forEach((address) => {
    if (prices[address] !== undefined) return;
    if (STABLE_ADDRESSES.has(address)) {
      prices[address] = STABLE_ADDRESSES.get(address)!;
    }
  });

  // CoinGecko primary
  const cgTargets = normalised.filter((address) => prices[address] === undefined);
  if (cgTargets.length > 0) {
    console.log(`[PRICING] CoinGecko targets=${cgTargets.length}`);
    const cgPrices = await fetchCoinGeckoPrices(cgTargets);
    for (const [addr, price] of Object.entries(cgPrices)) {
      prices[addr.toLowerCase()] = price;
    }
  }

  // Ankr fallback
  const ankrTargets = normalised.filter((address) => prices[address] === undefined);
  for (const address of ankrTargets) {
    const price = await ankrTokenPrice(address);
    if (typeof price === 'number' && Number.isFinite(price)) {
      prices[address] = price;
    }
  }

  // DefiLlama final fallback
  const llamaTargets = normalised.filter((address) => prices[address] === undefined);
  if (llamaTargets.length > 0) {
    console.log(`[PRICING] DefiLlama targets=${llamaTargets.length}`);
    const llamaPrices = await fetchDefiLlamaPrices(llamaTargets);
    for (const [addr, price] of Object.entries(llamaPrices)) {
      prices[addr.toLowerCase()] = price;
    }
  }

  // Cache set
  const expires = Date.now() + CACHE_TTL_MS;
  for (const [addr, price] of Object.entries(prices)) {
    priceCache.set(addr.toLowerCase(), { price, expires });
  }

  const missing = normalised.filter((address) => prices[address] === undefined);
  if (missing.length > 0) {
    console.warn(`[PRICING] Missing prices for ${missing.length} tokens`, missing);
  }

  return prices;
}
