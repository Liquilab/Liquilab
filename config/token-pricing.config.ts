/**
 * Token Pricing SSoT Configuration
 * 
 * Defines the canonical pricing source for each core v3 token on Flare.
 * Used by tokenPriceService to determine how to price each token.
 * 
 * Sources:
 * - 'fixed': Hardcoded USD value (for stablecoins)
 * - 'coingecko': Fetch from CoinGecko API
 * - 'ftso': Fetch from Flare FTSO (not yet implemented)
 * - 'unpriced': No reliable USD price source; treat as UNPRICED
 * 
 * @module config/token-pricing.config
 */

export type PricingSource = 'fixed' | 'coingecko' | 'ftso' | 'unpriced';

export interface TokenPricingConfig {
  symbol: string;
  canonicalSymbol: string; // Normalized symbol for lookups
  address?: string; // On-chain address (lowercase)
  source: PricingSource;
  coingeckoId?: string;
  ftsoSymbol?: string;
  fixedUsdValue?: number;
  notes?: string;
}

/**
 * Core v3 token pricing configuration for Flare (Enosys + SparkDEX)
 * 
 * Keyed by canonical symbol (uppercase, no special chars)
 */
export const TOKEN_PRICING_CONFIG: Record<string, TokenPricingConfig> = {
  // ============ Native/Wrapped Flare ============
  'FLR': {
    symbol: 'FLR',
    canonicalSymbol: 'FLR',
    source: 'coingecko',
    coingeckoId: 'flare-networks',
    notes: 'Native Flare token',
  },
  'WFLR': {
    symbol: 'WFLR',
    canonicalSymbol: 'WFLR',
    address: '0x1d80c49bbbcd1c0911346656b529df9e5c2f783d',
    source: 'coingecko',
    coingeckoId: 'flare-networks',
    notes: 'Wrapped FLR; same price as FLR',
  },
  'SFLR': {
    symbol: 'sFLR',
    canonicalSymbol: 'SFLR',
    address: '0x12e605bc104e93b45e1ad99f9e555f659051c2bb',
    source: 'coingecko',
    coingeckoId: 'sflr',
    notes: 'Staked FLR',
  },
  'RFLR': {
    symbol: 'rFLR',
    canonicalSymbol: 'RFLR',
    address: '0xffa188493c15dfaf2c206c97d8633377847b6a52',
    source: 'coingecko',
    coingeckoId: 'flare-networks',
    notes: 'Reward FLR; same price as FLR',
  },
  
  // ============ Stablecoins (FIXED @ $1.00) ============
  'USDT': {
    symbol: 'USDT',
    canonicalSymbol: 'USDT',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'Tether USD',
  },
  'USDT0': {
    symbol: 'USD₮0',
    canonicalSymbol: 'USDT0',
    address: '0xe7cd86e13ac4309349f30b3435a9d337750fc82d',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'Flare-native USDT-pegged stablecoin',
  },
  'USD0': {
    symbol: 'USD0',
    canonicalSymbol: 'USD0',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'Alias for USDT0',
  },
  'EUSDT': {
    symbol: 'eUSDT',
    canonicalSymbol: 'EUSDT',
    address: '0x96b41289d90444b8add57e6f265db5ae8651df29',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'Enosys USDT',
  },
  'USDC': {
    symbol: 'USDC',
    canonicalSymbol: 'USDC',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'USD Coin',
  },
  'USDCE': {
    symbol: 'USDC.e',
    canonicalSymbol: 'USDCE',
    address: '0xfbda5f676cb37624f28265a144a48b0d6e87d3b6',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'Bridged USDC',
  },
  'DAI': {
    symbol: 'DAI',
    canonicalSymbol: 'DAI',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'MakerDAO DAI',
  },
  'USDX': {
    symbol: 'USDX',
    canonicalSymbol: 'USDX',
    address: '0x4b64e7793c1912af8dd38f04095699ddc48d5857',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'USDX stablecoin',
  },
  'CUSDX': {
    symbol: 'cUSDX',
    canonicalSymbol: 'CUSDX',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'Wrapped USDX',
  },
  'USDS': {
    symbol: 'USDS',
    canonicalSymbol: 'USDS',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'USD stablecoin variant',
  },
  'USDD': {
    symbol: 'USDD',
    canonicalSymbol: 'USDD',
    source: 'fixed',
    fixedUsdValue: 1.00,
    notes: 'USD stablecoin variant',
  },
  
  // ============ Cross-chain / Wrapped Assets ============
  'FXRP': {
    symbol: 'FXRP',
    canonicalSymbol: 'FXRP',
    address: '0xad552a648c74d49e10027ab8a618a3ad4901c5be',
    source: 'coingecko',
    coingeckoId: 'ripple',
    notes: 'Wrapped XRP on Flare; tracks XRP price',
  },
  'STXRP': {
    symbol: 'stXRP',
    canonicalSymbol: 'STXRP',
    source: 'coingecko',
    coingeckoId: 'ripple',
    notes: 'Staked XRP variant; tracks XRP price',
  },
  'EFXRP': {
    symbol: 'eFXRP',
    canonicalSymbol: 'EFXRP',
    source: 'coingecko',
    coingeckoId: 'ripple',
    notes: 'Enosys FXRP; tracks XRP price',
  },
  'ETH': {
    symbol: 'ETH',
    canonicalSymbol: 'ETH',
    source: 'coingecko',
    coingeckoId: 'ethereum',
    notes: 'Ethereum',
  },
  'WETH': {
    symbol: 'WETH',
    canonicalSymbol: 'WETH',
    address: '0x70ad7172ef0b131a1428d0c1f66457eb041f2176',
    source: 'coingecko',
    coingeckoId: 'ethereum',
    notes: 'Wrapped ETH; same price as ETH',
  },
  'EETH': {
    symbol: 'eETH',
    canonicalSymbol: 'EETH',
    address: '0xdbca67eafe5fc5cdb83ec5ef1e0e7e0d7e40a06c',
    source: 'coingecko',
    coingeckoId: 'ethereum',
    notes: 'Enosys ETH; same price as ETH',
  },
  'BTC': {
    symbol: 'BTC',
    canonicalSymbol: 'BTC',
    source: 'coingecko',
    coingeckoId: 'bitcoin',
    notes: 'Bitcoin',
  },
  'WBTC': {
    symbol: 'WBTC',
    canonicalSymbol: 'WBTC',
    source: 'coingecko',
    coingeckoId: 'bitcoin',
    notes: 'Wrapped BTC; same price as BTC',
  },
  'QNT': {
    symbol: 'QNT',
    canonicalSymbol: 'QNT',
    source: 'coingecko',
    coingeckoId: 'quant-network',
    notes: 'Quant Network',
  },
  'EQNT': {
    symbol: 'eQNT',
    canonicalSymbol: 'EQNT',
    address: '0xd39b46f18bbd1fa864cde38f7ce3bd18c225b067',
    source: 'coingecko',
    coingeckoId: 'quant-network',
    notes: 'Enosys QNT; same price as QNT',
  },
  
  // ============ DEX / Protocol Tokens ============
  'SPRK': {
    symbol: 'SPRK',
    canonicalSymbol: 'SPRK',
    source: 'unpriced',
    notes: 'SparkDEX token; no reliable CoinGecko ID verified',
  },
  'SPX': {
    symbol: 'SPX',
    canonicalSymbol: 'SPX',
    source: 'unpriced',
    notes: 'SparkDEX variant; alias for SPRK',
  },
  'APS': {
    symbol: 'APS',
    canonicalSymbol: 'APS',
    address: '0xff56eb5b1a7faa972291117e5e9565da29bc808d',
    source: 'unpriced',
    notes: 'APS token; CoinGecko ID "aps-token" may not be correct',
  },
  'HLN': {
    symbol: 'HLN',
    canonicalSymbol: 'HLN',
    address: '0xa20e10b9d3e5e0a4f5a2aabdd76a6a8fdc71a2cb',
    source: 'unpriced',
    notes: 'Helion token; no verified CoinGecko ID',
  },
  'JOULE': {
    symbol: 'JOULE',
    canonicalSymbol: 'JOULE',
    source: 'unpriced',
    notes: 'Joule token; no verified CoinGecko ID',
  },
  'XVN': {
    symbol: 'XVN',
    canonicalSymbol: 'XVN',
    source: 'unpriced',
    notes: 'XVN token; no verified CoinGecko ID',
  },
  'BUGO': {
    symbol: 'BUGO',
    canonicalSymbol: 'BUGO',
    source: 'unpriced',
    notes: 'BUGO meme token; UNPRICED',
  },
  'FOTON': {
    symbol: 'FOTON',
    canonicalSymbol: 'FOTON',
    source: 'unpriced',
    notes: 'FOTON token; no verified CoinGecko ID',
  },
  
  // ============ Wrapped/Staked Variants ============
  'CYSFLR': {
    symbol: 'cysFLR',
    canonicalSymbol: 'CYSFLR',
    source: 'coingecko',
    coingeckoId: 'sflr',
    notes: 'Cyclo sFLR; same price as sFLR',
  },
  'CYFLR': {
    symbol: 'cyFLR',
    canonicalSymbol: 'CYFLR',
    source: 'coingecko',
    coingeckoId: 'flare-networks',
    notes: 'Cyclo FLR; same price as FLR',
  },
};

/**
 * Get pricing config for a token by its canonical symbol
 */
export function getTokenPricingConfig(symbol: string): TokenPricingConfig | null {
  const canonical = symbol
    .toUpperCase()
    .replace(/₮/g, 'T')
    .replace(/₀/g, '0')
    .replace(/\./g, '')
    .replace(/[^A-Z0-9]/g, '');
  
  return TOKEN_PRICING_CONFIG[canonical] || null;
}

/**
 * Check if a token is configured as UNPRICED
 */
export function isTokenUnpriced(symbol: string): boolean {
  const config = getTokenPricingConfig(symbol);
  return config?.source === 'unpriced';
}

/**
 * Get all tokens that have a specific pricing source
 */
export function getTokensBySource(source: PricingSource): TokenPricingConfig[] {
  return Object.values(TOKEN_PRICING_CONFIG).filter(t => t.source === source);
}

