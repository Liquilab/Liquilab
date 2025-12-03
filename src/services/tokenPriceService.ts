/**
 * Token Price Service
 * 
 * Fetches real-time USD prices for Flare Network tokens.
 * 
 * Pricing hierarchy (FTSO-first for Flare-native tokens):
 * 1. FTSO: Primary for Flare-native tokens (FLR, WFLR, SFLR, FXRP, STXRP)
 * 2. CoinGecko: Fallback for FTSO tokens (if configured), primary for non-Flare assets
 * 3. FIXED: Stablecoins → hardcoded $1.00
 * 4. UNPRICED: No reliable source → returns null
 * 
 * IMPORTANT:
 * - Pool-ratio heuristics are REMOVED. Never used.
 * - CoinGecko rate-limit guard: After first 429, skip further CG calls for this run.
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

// CoinGecko rate-limit guard: skip CG calls after first 429 in this process
let coinGeckoRateLimited = false;
let cgRateLimitLoggedOnce = false;

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

// ============================================================
// FTSO Price Fetching (stubbed - to be implemented)
// ============================================================

/**
 * Fetch price from Flare FTSO
 * 
 * TODO: Implement actual FTSO integration when FTSO data is available.
 * For now, this is a stub that returns null and logs a warning.
 * 
 * @param config - Token pricing config with ftsoSymbol
 * @returns USD price or null if FTSO not available
 */
async function fetchFtsoPrice(config: TokenPricingConfig): Promise<number | null> {
  if (!config.ftsoSymbol) {
    return null;
  }
  
  // TODO: Implement FTSO price fetch
  // Options:
  // 1. Query FTSO contract directly via RPC
  // 2. Query indexed FTSO data from database (if ftso indexer is running)
  // 3. Use Flare API endpoint (if available)
  
  // For now, return null to indicate FTSO not yet available
  // This will trigger CoinGecko fallback if configured
  if (!warnedTokens.has(`ftso-stub:${config.canonicalSymbol}`)) {
    console.log(`[PRICE] ${config.canonicalSymbol}: FTSO not yet implemented (feed: ${config.ftsoSymbol}); trying fallback`);
    warnedTokens.add(`ftso-stub:${config.canonicalSymbol}`);
  }
  
  return null;
}

// ============================================================
// CoinGecko Price Fetching (with rate-limit guard)
// ============================================================

/**
 * Fetch price from CoinGecko API
 * 
 * Includes rate-limit guard: after first 429, skip all further CG calls.
 */
async function fetchCoinGeckoPrice(coingeckoId: string): Promise<number | null> {
  // Check rate-limit guard
  if (coinGeckoRateLimited) {
    if (!cgRateLimitLoggedOnce) {
      console.warn('[PRICE] CoinGecko rate-limited; skipping all CG calls for this run');
      cgRateLimitLoggedOnce = true;
    }
    return null;
  }
  
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
        // Rate limited - set guard and stop all CG calls
        coinGeckoRateLimited = true;
        console.warn(`[PRICE] CoinGecko rate limit (429) hit; skipping further CG calls for this run`);
        return null;
      }
      console.error(`[PRICE] CoinGecko API error: ${response.status} ${response.statusText}`);
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

// ============================================================
// Main Pricing Functions
// ============================================================

/**
 * Get USD price for a token based on its SSoT configuration
 * 
 * Priority:
 * 1. FTSO (for source='ftso' tokens)
 * 2. CoinGecko (as fallback for FTSO tokens, or primary for source='coingecko')
 * 3. FIXED (for stablecoins)
 * 4. Returns null for UNPRICED or unknown tokens
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
  let source: string = 'unknown';
  
  // Handle each pricing source type
  switch (config.source) {
    case 'ftso':
      // FTSO-first for Flare-native tokens
      price = await fetchFtsoPrice(config);
      if (price !== null) {
        source = 'ftso';
        break;
      }
      
      // Fallback to CoinGecko if configured
      if (config.coingeckoFallback && config.coingeckoId) {
        price = await fetchCoinGeckoPrice(config.coingeckoId);
        if (price !== null) {
          source = 'coingecko-fallback';
        }
      }
      break;
      
    case 'fixed':
      price = config.fixedUsdValue ?? null;
      if (price !== null) {
        source = 'fixed';
      }
      break;
      
    case 'coingecko':
      if (!config.coingeckoId) {
        if (!warnedTokens.has(`cg-missing:${canonical}`)) {
          console.warn(`[PRICE] ${canonical} configured as 'coingecko' but missing coingeckoId`);
          warnedTokens.add(`cg-missing:${canonical}`);
        }
        break;
      }
      price = await fetchCoinGeckoPrice(config.coingeckoId);
      if (price !== null) {
        source = 'coingecko';
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
  
  // Log successful price fetch
  if (price !== null) {
    console.log(`[PRICE] ${canonical}: $${price.toFixed(4)} (${source})`);
    priceCache.set(cacheKey, price);
  } else {
    // Cache null sentinel for 60 seconds to avoid repeated lookups
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
        
      case 'ftso':
        // For FTSO tokens with CG fallback, add to batch
        if (config.coingeckoFallback && config.coingeckoId) {
          uncachedCoinGeckoIds.set(canonical, config.coingeckoId);
        }
        break;
        
      case 'coingecko':
        if (config.coingeckoId) {
          uncachedCoinGeckoIds.set(canonical, config.coingeckoId);
        }
        break;
        
      // 'unpriced' is skipped
    }
  }
  
  // Batch fetch from CoinGecko (with rate-limit guard)
  if (uncachedCoinGeckoIds.size > 0 && !coinGeckoRateLimited) {
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
        coinGeckoRateLimited = true;
        console.warn('[PRICE] CoinGecko rate limit (429) hit on batch request; skipping further CG calls');
      }
    } catch (error) {
      console.error('[PRICE] Error fetching batch prices:', error);
    }
  }
  
  return result;
}

export type PriceSource = 'ftso' | 'coingecko' | 'coingecko-fallback' | 'fixed' | 'unpriced';

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
    // Map internal sources to legacy source names
    let legacySource: 'coingecko' | 'stablecoin' = 'coingecko';
    if (config?.source === 'fixed') {
      legacySource = 'stablecoin';
    }
    return { price, source: legacySource };
  }
  
  // No reliable price - return as UNKNOWN (pools will be marked as unpriced)
  // Do NOT fall back to pool_ratio
  if (!warnedTokens.has(`fallback:${canonical}`)) {
    console.warn(`[PRICE] ${canonical}: no reliable price; marking as UNPRICED`);
    warnedTokens.add(`fallback:${canonical}`);
  }
  
  // Return price=0 with source='unknown' so UniverseOverview knows to mark pool as unpriced
  return { price: 0, source: 'unknown' };
}

/**
 * Clear the price cache and reset rate-limit guard
 */
export function clearPriceCache(): void {
  priceCache.flushAll();
  warnedTokens.clear();
  coinGeckoRateLimited = false;
  cgRateLimitLoggedOnce = false;
  console.log('[PRICE] Cache cleared, rate-limit guard reset');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { keys: number; hits: number; misses: number; cgRateLimited: boolean } {
  const stats = priceCache.getStats();
  return {
    keys: priceCache.keys().length,
    hits: stats.hits,
    misses: stats.misses,
    cgRateLimited: coinGeckoRateLimited,
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
export function listPricingConfig(): Array<{ symbol: string; source: string; ftsoSymbol?: string; coingeckoId?: string }> {
  return Object.values(TOKEN_PRICING_CONFIG).map(config => ({
    symbol: config.canonicalSymbol,
    source: config.source,
    ftsoSymbol: config.ftsoSymbol,
    coingeckoId: config.coingeckoId,
  }));
}

/**
 * Check if CoinGecko is currently rate-limited
 */
export function isCoinGeckoRateLimited(): boolean {
  return coinGeckoRateLimited;
}

/**
 * Reset CoinGecko rate-limit guard (for testing or after cooldown)
 */
export function resetCoinGeckoRateLimit(): void {
  coinGeckoRateLimited = false;
  cgRateLimitLoggedOnce = false;
  console.log('[PRICE] CoinGecko rate-limit guard reset');
}
