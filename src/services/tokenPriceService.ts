/**
 * Token Price Service
 * 
 * Fetches real-time USD prices for Flare Network tokens.
 * 
 * Pricing SSoT:
 * - 'fixed': Stablecoins → hardcoded $1.00
 * - 'coingecko': Tokens with verified CoinGecko ID → API call
 * - 'unpriced': No reliable source → returns null, marks pool as UNPRICED
 * 
 * IMPORTANT: Pool-ratio heuristics are REMOVED. If a token has no
 * configured pricing source, it is treated as UNPRICED.
 * 
 * @module services/tokenPriceService
 */

import NodeCache from 'node-cache';
import { 
  TOKEN_PRICING_CONFIG, 
  getTokenPricingConfig, 
  type TokenPricingConfig 
} from '../../config/token-pricing.config';

// Cache prices for 5 minutes (300 seconds)
const priceCache = new NodeCache({ stdTTL: 300 });

// Track warnings to avoid log spam (warn once per token per run)
const warnedTokens = new Set<string>();

/**
 * Normalize symbol: uppercase A-Z0-9 only
 * Handles special characters: ₮→T, ₀→0, .→(removed)
 */
export function canonicalSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/₮/g, 'T')
    .replace(/₀/g, '0')
    .replace(/\./g, '')
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Fetch price from CoinGecko API
 */
async function fetchCoinGeckoPrice(coingeckoId: string): Promise<number | null> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const baseUrl = apiKey 
      ? 'https://pro-api.coingecko.com/api/v3'
      : 'https://api.coingecko.com/api/v3';
    
    const url = `${baseUrl}/simple/price?ids=${coingeckoId}&vs_currencies=usd`;
    const headers: Record<string, string> = apiKey 
      ? { 'x-cg-pro-api-key': apiKey } 
      : {};
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`[PRICE] CoinGecko rate limit (429) for ${coingeckoId}`);
      } else {
        console.error(`[PRICE] CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      return null;
    }
    
    const data = await response.json();
    const price = data[coingeckoId]?.usd;
    
    if (typeof price !== 'number') {
      console.warn(`[PRICE] Invalid price data from CoinGecko for ${coingeckoId}`);
      return null;
    }
    
    return price;
  } catch (error) {
    console.error(`[PRICE] Error fetching CoinGecko price for ${coingeckoId}:`, error);
    return null;
  }
}

/**
 * Get USD price for a token based on its SSoT configuration
 * 
 * @param symbol - Token symbol (e.g., "WFLR", "USDT0", "FXRP")
 * @param address - Optional contract address (for future use)
 * @returns USD price or null if UNPRICED/unavailable
 */
export async function getTokenPriceUsd(
  symbol: string,
  address?: string
): Promise<number | null> {
  const canonical = canonicalSymbol(symbol);
  
  // Check cache first
  const cacheKey = `price:${canonical}`;
  const cached = priceCache.get<number>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  // Get pricing config from SSoT
  const config = getTokenPricingConfig(symbol);
  
  if (!config) {
    // Unknown token - warn once and return null
    if (!warnedTokens.has(canonical)) {
      console.warn(`[PRICE] Unknown token ${canonical}: no pricing config; treating as UNPRICED`);
      warnedTokens.add(canonical);
    }
    return null;
  }
  
  let price: number | null = null;
  
  switch (config.source) {
    case 'fixed':
      price = config.fixedUsdValue ?? null;
      if (price !== null) {
        console.log(`[PRICE] ${canonical}: $${price.toFixed(4)} (fixed)`);
      }
      break;
      
    case 'coingecko':
      if (!config.coingeckoId) {
        console.warn(`[PRICE] ${canonical} configured as 'coingecko' but missing coingeckoId`);
        break;
      }
      price = await fetchCoinGeckoPrice(config.coingeckoId);
      if (price !== null) {
        console.log(`[PRICE] ${canonical}: $${price.toFixed(4)} (CoinGecko: ${config.coingeckoId})`);
      }
      break;
      
    case 'ftso':
      // TODO: Implement FTSO pricing when FTSO integration is ready
      if (!warnedTokens.has(`ftso:${canonical}`)) {
        console.warn(`[PRICE] ${canonical}: FTSO pricing not yet implemented`);
        warnedTokens.add(`ftso:${canonical}`);
      }
      break;
      
    case 'unpriced':
      // Explicitly UNPRICED - warn once
      if (!warnedTokens.has(canonical)) {
        console.warn(`[PRICE] ${canonical}: configured as UNPRICED (no reliable USD source)`);
        warnedTokens.add(canonical);
      }
      break;
  }
  
  // Cache the result (including null for UNPRICED to avoid repeated lookups)
  if (price !== null) {
    priceCache.set(cacheKey, price);
  } else {
    // Cache null as a sentinel for 60 seconds to avoid spam
    priceCache.set(`unpriced:${canonical}`, true, 60);
  }
  
  return price;
}

/**
 * Fetch USD prices for multiple tokens in a single batch call
 * More efficient than calling getTokenPriceUsd() multiple times
 * 
 * @param symbols - Array of token symbols
 * @returns Record of canonical symbol → USD price (excludes UNPRICED tokens)
 */
export async function getTokenPricesBatch(symbols: string[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  const uncachedCoinGeckoIds: Map<string, string> = new Map(); // canonical → coingeckoId
  
  for (const symbol of symbols) {
    const canonical = canonicalSymbol(symbol);
    const cacheKey = `price:${canonical}`;
    
    // Check cache first
    const cached = priceCache.get<number>(cacheKey);
    if (cached !== undefined) {
      result[canonical] = cached;
      continue;
    }
    
    // Get pricing config
    const config = getTokenPricingConfig(symbol);
    if (!config) continue;
    
    switch (config.source) {
      case 'fixed':
        if (config.fixedUsdValue !== undefined) {
          result[canonical] = config.fixedUsdValue;
          priceCache.set(cacheKey, config.fixedUsdValue);
        }
        break;
        
      case 'coingecko':
        if (config.coingeckoId) {
          uncachedCoinGeckoIds.set(canonical, config.coingeckoId);
        }
        break;
        
      // 'ftso' and 'unpriced' are skipped
    }
  }
  
  // Batch fetch from CoinGecko
  if (uncachedCoinGeckoIds.size > 0) {
    try {
      const apiKey = process.env.COINGECKO_API_KEY;
      const baseUrl = apiKey 
        ? 'https://pro-api.coingecko.com/api/v3'
        : 'https://api.coingecko.com/api/v3';
      
      const coingeckoIds = Array.from(new Set(uncachedCoinGeckoIds.values()));
      const idsParam = coingeckoIds.join(',');
      const url = `${baseUrl}/simple/price?ids=${idsParam}&vs_currencies=usd`;
      const headers: Record<string, string> = apiKey 
        ? { 'x-cg-pro-api-key': apiKey } 
        : {};
      
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        
        for (const [canonical, coingeckoId] of uncachedCoinGeckoIds.entries()) {
          const price = data[coingeckoId]?.usd;
          if (typeof price === 'number') {
            result[canonical] = price;
            priceCache.set(`price:${canonical}`, price);
          }
        }
        
        console.log(`[PRICE] Batch fetched ${Object.keys(result).length} prices from CoinGecko`);
      } else if (response.status === 429) {
        console.warn('[PRICE] CoinGecko rate limit (429) on batch request');
      }
    } catch (error) {
      console.error('[PRICE] Error fetching batch prices:', error);
    }
  }
  
  return result;
}

export type PriceSource = 'coingecko' | 'fixed' | 'unpriced';

export interface PriceResult {
  price: number | null;
  source: PriceSource;
  isReliable: boolean;
}

/**
 * Get token price with explicit source information
 * 
 * IMPORTANT: No pool-ratio fallback. Returns UNPRICED if no reliable source.
 * 
 * @param symbol - Token symbol
 * @param _poolPriceRatio - DEPRECATED: ignored (kept for API compatibility)
 * @param address - Optional contract address
 * @returns Price result with source and reliability flag
 */
export async function getTokenPriceWithFallback(
  symbol: string,
  _poolPriceRatio: number = 1.0, // Deprecated parameter, ignored
  address?: string
): Promise<{ price: number; source: 'coingecko' | 'stablecoin' | 'pool_ratio' | 'unknown' }> {
  const canonical = canonicalSymbol(symbol);
  const config = getTokenPricingConfig(symbol);
  
  // Try to get price from SSoT
  const price = await getTokenPriceUsd(symbol, address);
  
  if (price !== null) {
    // Determine source for compatibility with existing callers
    const source = config?.source === 'fixed' ? 'stablecoin' : 'coingecko';
    return { price, source };
  }
  
  // No reliable price - return as UNKNOWN (pools will be marked as unpriced)
  // Do NOT fall back to pool_ratio
  if (!warnedTokens.has(`fallback:${canonical}`)) {
    console.warn(`[PRICE] ${canonical}: no reliable price; marking as UNPRICED (pool_ratio fallback disabled)`);
    warnedTokens.add(`fallback:${canonical}`);
  }
  
  // Return price=0 with source='unknown' so UniverseOverview knows to mark pool as unpriced
  return { price: 0, source: 'unknown' };
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
  priceCache.flushAll();
  warnedTokens.clear();
  console.log('[PRICE] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { keys: number; hits: number; misses: number } {
  const stats = priceCache.getStats();
  return {
    keys: priceCache.keys().length,
    hits: stats.hits,
    misses: stats.misses
  };
}

/**
 * Get pricing configuration for debugging
 */
export function getPricingConfig(symbol: string): TokenPricingConfig | null {
  return getTokenPricingConfig(symbol);
}

/**
 * List all configured tokens and their pricing sources
 */
export function listPricingConfig(): Array<{ symbol: string; source: string; coingeckoId?: string }> {
  return Object.values(TOKEN_PRICING_CONFIG).map(config => ({
    symbol: config.canonicalSymbol,
    source: config.source,
    coingeckoId: config.coingeckoId,
  }));
}
