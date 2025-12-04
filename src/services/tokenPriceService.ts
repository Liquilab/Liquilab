/**
 * Token Price Service
 *
 * Fetches real-time USD prices for Flare Network tokens.
 *
 * Pricing Hierarchy (SSoT: config/token-pricing.config.ts):
 * 1. FTSO (via ANKR): Primary for Flare-native tokens (FLR, WFLR, SFLR, FXRP, stXRP)
 * 2. CoinGecko: Fallback for FTSO tokens (if configured), primary for cross-chain assets
 * 3. FIXED: Stablecoins → hardcoded $1.00
 * 4. UNPRICED: No reliable source → returns null
 *
 * Rate-Limit Guards:
 * - CoinGecko: After first 429, skip all CG calls for this run
 * - ANKR: After first 401/403, skip all ANKR calls for this run
 *
 * @module services/tokenPriceService
 */

import NodeCache from 'node-cache';
import {
  TOKEN_PRICING_CONFIG,
  getTokenPricingConfig,
  type TokenPricingConfig,
  type PricingSource,
} from '../../config/token-pricing.config';

// ============================================================
// Types
// ============================================================

export type { PricingSource };

export interface PriceResult {
  price: number | null;
  source: PricingSource | 'coingecko-fallback';
  isReliable: boolean;
}

// ============================================================
// Cache & State
// ============================================================

const priceCache = new NodeCache({ stdTTL: 300 }); // 5 minute TTL
const warnedTokens = new Set<string>();

// Rate-limit guards (per-run)
let coinGeckoRateLimited = false;
let ankrDisabled = false;

// Logging guards (single log per run)
let loggedAnkrStatus = false;
let loggedCgApiKeyStatus = false;
let loggedCgRateLimit = false;

// ============================================================
// ANKR Configuration
// ============================================================

const FLARE_BLOCKCHAIN_ID = 'flare';

const FTSO_SYMBOL_TO_ADDRESS: Record<string, string | undefined> = {
  FLR: undefined, // Native token
  WFLR: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d',
  SFLR: '0x12e605bc104e93B45e1aD99F9e555f659051c2BB',
  XRP: '0xAd552A648C74D49E10027AB8a618A3ad4901c5bE',
  FXRP: '0xAd552A648C74D49E10027AB8a618A3ad4901c5bE',
  STXRP: '0x4c18ff3c89632c3dd62e796c0afa5c07c4c1b2b3',
};

function deriveAnkrEndpoint(): string | null {
  if (process.env.ANKR_ADVANCED_API_URL) {
    return process.env.ANKR_ADVANCED_API_URL;
  }

  const flareRpc = (process.env.FLARE_RPC_URL || process.env.FLARE_RPC_URLS)?.trim();
  if (!flareRpc) return null;

  // Match: https://rpc.ankr.com/flare/{hex_api_key}
  const match = flareRpc.match(/^https?:\/\/rpc\.ankr\.com\/flare\/([a-f0-9]+)\/?$/i);
  if (match?.[1]) {
    return `https://rpc.ankr.com/multichain/${match[1]}`;
  }

  return null;
}

const ANKR_ENDPOINT = deriveAnkrEndpoint();

// ============================================================
// Symbol Normalization
// ============================================================

export function canonicalSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/₮/g, 'T')
    .replace(/₀/g, '0')
    .replace(/\./g, '')
    .replace(/[^A-Z0-9]/g, '');
}

// ============================================================
// FTSO Price Fetching (via ANKR)
// ============================================================

async function fetchFtsoPrice(config: TokenPricingConfig): Promise<number | null> {
  if (!config.ftsoSymbol) return null;

  // Check if ANKR is available
  if (!ANKR_ENDPOINT || ankrDisabled) {
    if (!loggedAnkrStatus) {
      const reason = !ANKR_ENDPOINT ? 'ANKR endpoint not configured' : 'ANKR disabled (auth error)';
      console.log(`[PRICE] ${reason}; using CoinGecko for FTSO tokens`);
      loggedAnkrStatus = true;
    }
    return null;
  }

  const tokenAddress = config.address || FTSO_SYMBOL_TO_ADDRESS[config.ftsoSymbol];

  try {
    const response = await fetch(ANKR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'ankr_getTokenPrice',
        params: { blockchain: FLARE_BLOCKCHAIN_ID, contractAddress: tokenAddress },
        id: 1,
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        ankrDisabled = true;
        console.warn(`[PRICE] ANKR auth error (${response.status}); disabling ANKR`);
      } else if (!warnedTokens.has(`ankr:${config.canonicalSymbol}`)) {
        console.warn(`[PRICE] ANKR error for ${config.canonicalSymbol}: ${response.status}`);
        warnedTokens.add(`ankr:${config.canonicalSymbol}`);
      }
      return null;
    }

    const data = (await response.json()) as {
      result?: { usdPrice: string };
      error?: { message: string };
    };

    if (data.error || !data.result?.usdPrice) {
      return null;
    }

    const price = parseFloat(data.result.usdPrice);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

// ============================================================
// CoinGecko Price Fetching
// ============================================================

async function fetchCoinGeckoPrice(coingeckoId: string): Promise<number | null> {
  if (coinGeckoRateLimited) {
    if (!loggedCgRateLimit) {
      console.warn('[PRICE] CoinGecko rate-limited; skipping CG calls for this run');
      loggedCgRateLimit = true;
    }
    return null;
  }

  const apiKey = process.env.COINGECKO_API_KEY;

  if (!loggedCgApiKeyStatus) {
    console.log(apiKey ? '[PRICE] CoinGecko Pro API enabled' : '[PRICE] CoinGecko free tier (rate limits apply)');
    loggedCgApiKeyStatus = true;
  }

  try {
    const baseUrl = apiKey ? 'https://pro-api.coingecko.com/api/v3' : 'https://api.coingecko.com/api/v3';
    const headers: Record<string, string> = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

    const response = await fetch(`${baseUrl}/simple/price?ids=${coingeckoId}&vs_currencies=usd`, { headers });

    if (!response.ok) {
      if (response.status === 429) {
        coinGeckoRateLimited = true;
        console.warn('[PRICE] CoinGecko rate limit (429); disabling CG for this run');
      }
      return null;
    }

    const data = await response.json();
    const price = data[coingeckoId]?.usd;
    return typeof price === 'number' ? price : null;
  } catch {
    return null;
  }
}

// ============================================================
// Main Pricing Functions
// ============================================================

/**
 * Get USD price for a token based on SSoT configuration
 *
 * @param symbol - Token symbol (e.g., "WFLR", "USDT0", "FXRP")
 * @param address - Optional contract address
 * @returns USD price or null if UNPRICED/unavailable
 */
export async function getTokenPriceUsd(symbol: string, address?: string): Promise<number | null> {
  const canonical = canonicalSymbol(symbol);
  const cacheKey = `price:${canonical}`;

  // Check cache
  const cached = priceCache.get<number>(cacheKey);
  if (cached !== undefined) return cached;

  // Get SSoT config
  const config = getTokenPricingConfig(symbol);
  if (!config) {
    if (!warnedTokens.has(canonical)) {
      console.warn(`[PRICE] ${canonical}: unknown token; treating as UNPRICED`);
      warnedTokens.add(canonical);
    }
    return null;
  }

  let price: number | null = null;
  let source = 'unknown';

  switch (config.source) {
    case 'ftso':
      price = await fetchFtsoPrice(config);
      if (price !== null) {
        source = 'ftso';
      } else if (config.coingeckoFallback && config.coingeckoId) {
        price = await fetchCoinGeckoPrice(config.coingeckoId);
        if (price !== null) source = 'coingecko-fallback';
      }
      break;

    case 'coingecko':
      if (config.coingeckoId) {
        price = await fetchCoinGeckoPrice(config.coingeckoId);
        if (price !== null) source = 'coingecko';
      }
      break;

    case 'fixed':
      price = config.fixedUsdValue ?? null;
      if (price !== null) source = 'fixed';
      break;

    case 'unpriced':
      if (!warnedTokens.has(canonical)) {
        console.warn(`[PRICE] ${canonical}: configured as UNPRICED`);
        warnedTokens.add(canonical);
      }
      break;
  }

  if (price !== null) {
    console.log(`[PRICE] ${canonical}: $${price.toFixed(4)} (${source})`);
    priceCache.set(cacheKey, price);
  }

  return price;
}

/**
 * Batch fetch USD prices for multiple tokens
 *
 * More efficient than individual calls: batches CoinGecko requests.
 *
 * @param symbols - Array of token symbols
 * @returns Record of canonical symbol → USD price
 */
export async function getTokenPricesBatch(symbols: string[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  const ftsoQueue: TokenPricingConfig[] = [];
  const cgQueue = new Map<string, string>(); // canonical → coingeckoId

  for (const symbol of symbols) {
    const canonical = canonicalSymbol(symbol);
    const cacheKey = `price:${canonical}`;

    // Check cache
    const cached = priceCache.get<number>(cacheKey);
    if (cached !== undefined) {
      result[canonical] = cached;
      continue;
    }

    const config = getTokenPricingConfig(symbol);
    if (!config) continue;

    switch (config.source) {
      case 'fixed':
        if (config.fixedUsdValue !== undefined) {
          result[canonical] = config.fixedUsdValue;
          priceCache.set(cacheKey, config.fixedUsdValue);
        }
        break;

      case 'ftso':
        ftsoQueue.push(config);
        break;

      case 'coingecko':
        if (config.coingeckoId) {
          cgQueue.set(canonical, config.coingeckoId);
        }
        break;
    }
  }

  // Fetch FTSO prices (no batch support)
  for (const config of ftsoQueue) {
    const price = await fetchFtsoPrice(config);
    if (price !== null) {
      result[config.canonicalSymbol] = price;
      priceCache.set(`price:${config.canonicalSymbol}`, price);
    } else if (config.coingeckoFallback && config.coingeckoId) {
      cgQueue.set(config.canonicalSymbol, config.coingeckoId);
    }
  }

  // Batch fetch from CoinGecko
  if (cgQueue.size > 0 && !coinGeckoRateLimited) {
    try {
      const apiKey = process.env.COINGECKO_API_KEY;
      const baseUrl = apiKey ? 'https://pro-api.coingecko.com/api/v3' : 'https://api.coingecko.com/api/v3';
      const headers: Record<string, string> = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

      const ids = [...new Set(cgQueue.values())].join(',');
      const response = await fetch(`${baseUrl}/simple/price?ids=${ids}&vs_currencies=usd`, { headers });

      if (response.ok) {
        const data = await response.json();
        for (const [canonical, coingeckoId] of cgQueue) {
          const price = data[coingeckoId]?.usd;
          if (typeof price === 'number') {
            result[canonical] = price;
            priceCache.set(`price:${canonical}`, price);
          }
        }
        console.log(`[PRICE] Batch: ${cgQueue.size} tokens from CoinGecko`);
      } else if (response.status === 429) {
        coinGeckoRateLimited = true;
        console.warn('[PRICE] CoinGecko rate limit (429) on batch');
      }
    } catch {
      // Batch failed silently
    }
  }

  return result;
}

/**
 * Legacy compatibility wrapper
 *
 * @deprecated Use getTokenPriceUsd() directly
 */
export async function getTokenPriceWithFallback(
  symbol: string,
  _poolPriceRatio = 1.0,
  address?: string,
): Promise<{ price: number; source: 'coingecko' | 'stablecoin' | 'pool_ratio' | 'unknown' }> {
  const config = getTokenPricingConfig(symbol);
  const price = await getTokenPriceUsd(symbol, address);

  if (price !== null) {
    const legacySource = config?.source === 'fixed' ? 'stablecoin' : 'coingecko';
    return { price, source: legacySource };
  }

  return { price: 0, source: 'unknown' };
}

// ============================================================
// Cache Management
// ============================================================

export function clearPriceCache(): void {
  priceCache.flushAll();
  warnedTokens.clear();
  coinGeckoRateLimited = false;
  ankrDisabled = false;
  loggedAnkrStatus = false;
  loggedCgApiKeyStatus = false;
  loggedCgRateLimit = false;
  console.log('[PRICE] Cache cleared, guards reset');
}

export function getCacheStats(): {
  keys: number;
  hits: number;
  misses: number;
  cgRateLimited: boolean;
  ankrDisabled: boolean;
} {
  const stats = priceCache.getStats();
  return {
    keys: priceCache.keys().length,
    hits: stats.hits,
    misses: stats.misses,
    cgRateLimited: coinGeckoRateLimited,
    ankrDisabled,
  };
}

export function isCoinGeckoRateLimited(): boolean {
  return coinGeckoRateLimited;
}

export function resetCoinGeckoRateLimit(): void {
  coinGeckoRateLimited = false;
  loggedCgRateLimit = false;
  console.log('[PRICE] CoinGecko rate-limit reset');
}

export function getPricingConfig(symbol: string): TokenPricingConfig | null {
  return getTokenPricingConfig(symbol);
}

export function listPricingConfig(): Array<{
  symbol: string;
  source: string;
  ftsoSymbol?: string;
  coingeckoId?: string;
}> {
  return Object.values(TOKEN_PRICING_CONFIG).map((c) => ({
    symbol: c.canonicalSymbol,
    source: c.source,
    ftsoSymbol: c.ftsoSymbol,
    coingeckoId: c.coingeckoId,
  }));
}
