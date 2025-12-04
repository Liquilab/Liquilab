/**
 * Token Pricing SSoT Configuration
 *
 * Canonical pricing configuration for all V3 tokens on Flare (Enosys + SparkDEX).
 * Used by tokenPriceService to determine pricing source and TVL eligibility.
 *
 * Sources:
 * - 'ftso': Flare FTSO via ANKR (primary for Flare-native tokens)
 * - 'coingecko': CoinGecko API (fallback or primary for cross-chain assets)
 * - 'fixed': Hardcoded USD value (stablecoins)
 * - 'unpriced': No reliable source; excluded from TVL
 *
 * Flags:
 * - pricingUniverse: true = included in TVL calculations
 * - coingeckoFallback: true = use CoinGecko when FTSO fails
 *
 * @module config/token-pricing.config
 */

// ============================================================
// Types
// ============================================================

export type PricingSource = 'ftso' | 'coingecko' | 'fixed' | 'unpriced';

export interface TokenPricingConfig {
  symbol: string;
  canonicalSymbol: string;
  address?: string;
  source: PricingSource;
  ftsoSymbol?: string;
  coingeckoId?: string;
  coingeckoFallback?: boolean;
  fixedUsdValue?: number;
  pricingUniverse: boolean;
  notes?: string;
}

// ============================================================
// Token Configurations (grouped logically)
// ============================================================

export const TOKEN_PRICING_CONFIG: Record<string, TokenPricingConfig> = {
  // ────────────────────────────────────────────────────────────
  // FLARE NATIVE (FTSO-first with CoinGecko fallback)
  // ────────────────────────────────────────────────────────────

  FLR: {
    symbol: 'FLR',
    canonicalSymbol: 'FLR',
    source: 'ftso',
    ftsoSymbol: 'FLR',
    coingeckoId: 'flare-networks',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Native Flare token',
  },

  WFLR: {
    symbol: 'WFLR',
    canonicalSymbol: 'WFLR',
    address: '0x1d80c49bbbcd1c0911346656b529df9e5c2f783d',
    source: 'ftso',
    ftsoSymbol: 'FLR',
    coingeckoId: 'flare-networks',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Wrapped FLR',
  },

  SFLR: {
    symbol: 'sFLR',
    canonicalSymbol: 'SFLR',
    address: '0x12e605bc104e93b45e1ad99f9e555f659051c2bb',
    source: 'ftso',
    ftsoSymbol: 'FLR',
    coingeckoId: 'flare-networks',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Staked FLR (Sceptre)',
  },

  RFLR: {
    symbol: 'rFLR',
    canonicalSymbol: 'RFLR',
    address: '0xffa188493c15dfaf2c206c97d8633377847b6a52',
    source: 'ftso',
    ftsoSymbol: 'FLR',
    coingeckoId: 'flare-networks',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Reward FLR',
  },

  CYSFLR: {
    symbol: 'cysFLR',
    canonicalSymbol: 'CYSFLR',
    source: 'ftso',
    ftsoSymbol: 'FLR',
    coingeckoId: 'flare-networks',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Cyclo staked FLR',
  },

  CYFLR: {
    symbol: 'cyFLR',
    canonicalSymbol: 'CYFLR',
    source: 'ftso',
    ftsoSymbol: 'FLR',
    coingeckoId: 'flare-networks',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Cyclo FLR',
  },

  // ────────────────────────────────────────────────────────────
  // XRP VARIANTS (FTSO-first with CoinGecko fallback)
  // ────────────────────────────────────────────────────────────

  FXRP: {
    symbol: 'FXRP',
    canonicalSymbol: 'FXRP',
    address: '0xad552a648c74d49e10027ab8a618a3ad4901c5be',
    source: 'ftso',
    ftsoSymbol: 'XRP',
    coingeckoId: 'ripple',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Wrapped XRP on Flare',
  },

  STXRP: {
    symbol: 'stXRP',
    canonicalSymbol: 'STXRP',
    address: '0x4c18ff3c89632c3dd62e796c0afa5c07c4c1b2b3',
    source: 'ftso',
    ftsoSymbol: 'XRP',
    coingeckoId: 'ripple',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Staked XRP on Flare',
  },

  EFXRP: {
    symbol: 'eFXRP',
    canonicalSymbol: 'EFXRP',
    source: 'ftso',
    ftsoSymbol: 'XRP',
    coingeckoId: 'ripple',
    coingeckoFallback: true,
    pricingUniverse: true,
    notes: 'Enosys FXRP',
  },

  // ────────────────────────────────────────────────────────────
  // STABLECOINS (FIXED @ $1.00)
  // ────────────────────────────────────────────────────────────

  USDT: {
    symbol: 'USDT',
    canonicalSymbol: 'USDT',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'Tether USD',
  },

  USDT0: {
    symbol: 'USD₮0',
    canonicalSymbol: 'USDT0',
    address: '0xe7cd86e13ac4309349f30b3435a9d337750fc82d',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'Flare-native USDT',
  },

  USD0: {
    symbol: 'USD0',
    canonicalSymbol: 'USD0',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'Alias for USDT0',
  },

  EUSDT: {
    symbol: 'eUSDT',
    canonicalSymbol: 'EUSDT',
    address: '0x96b41289d90444b8add57e6f265db5ae8651df29',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'Enosys USDT',
  },

  USDC: {
    symbol: 'USDC',
    canonicalSymbol: 'USDC',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'USD Coin',
  },

  USDCE: {
    symbol: 'USDC.e',
    canonicalSymbol: 'USDCE',
    address: '0xfbda5f676cb37624f28265a144a48b0d6e87d3b6',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'Bridged USDC',
  },

  DAI: {
    symbol: 'DAI',
    canonicalSymbol: 'DAI',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'MakerDAO DAI',
  },

  USDX: {
    symbol: 'USDX',
    canonicalSymbol: 'USDX',
    address: '0x4b64e7793c1912af8dd38f04095699ddc48d5857',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'USDX stablecoin',
  },

  CUSDX: {
    symbol: 'cUSDX',
    canonicalSymbol: 'CUSDX',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'Wrapped USDX',
  },

  USDS: {
    symbol: 'USDS',
    canonicalSymbol: 'USDS',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'USD stablecoin variant',
  },

  USDD: {
    symbol: 'USDD',
    canonicalSymbol: 'USDD',
    source: 'fixed',
    fixedUsdValue: 1.0,
    pricingUniverse: true,
    notes: 'USD stablecoin variant',
  },

  // ────────────────────────────────────────────────────────────
  // CROSS-CHAIN ASSETS (CoinGecko primary)
  // ────────────────────────────────────────────────────────────

  ETH: {
    symbol: 'ETH',
    canonicalSymbol: 'ETH',
    source: 'coingecko',
    coingeckoId: 'ethereum',
    pricingUniverse: true,
    notes: 'Ethereum',
  },

  WETH: {
    symbol: 'WETH',
    canonicalSymbol: 'WETH',
    address: '0x70ad7172ef0b131a1428d0c1f66457eb041f2176',
    source: 'coingecko',
    coingeckoId: 'ethereum',
    pricingUniverse: true,
    notes: 'Wrapped ETH',
  },

  EETH: {
    symbol: 'eETH',
    canonicalSymbol: 'EETH',
    address: '0xdbca67eafe5fc5cdb83ec5ef1e0e7e0d7e40a06c',
    source: 'coingecko',
    coingeckoId: 'ethereum',
    pricingUniverse: true,
    notes: 'Enosys ETH',
  },

  FLRETH: {
    symbol: 'flrETH',
    canonicalSymbol: 'FLRETH',
    address: '0xa8697b82a5e9f108296c6299859e82472340aea7',
    source: 'coingecko',
    coingeckoId: 'flare-staked-ether',
    pricingUniverse: true,
    notes: 'Sceptre liquid staked ETH (~$3,084)',
  },

  CYWETH: {
    symbol: 'cyWETH',
    canonicalSymbol: 'CYWETH',
    address: '0xd8bf1d2720e9ffd01a2f9a2efc3e101a05b852b4',
    source: 'coingecko',
    coingeckoId: 'cyclo-cyweth',
    pricingUniverse: true,
    notes: 'Cyclo yield token (~$0.47, NOT 1:1 with ETH)',
  },

  BTC: {
    symbol: 'BTC',
    canonicalSymbol: 'BTC',
    source: 'coingecko',
    coingeckoId: 'bitcoin',
    pricingUniverse: true,
    notes: 'Bitcoin',
  },

  WBTC: {
    symbol: 'WBTC',
    canonicalSymbol: 'WBTC',
    source: 'coingecko',
    coingeckoId: 'bitcoin',
    pricingUniverse: true,
    notes: 'Wrapped BTC',
  },

  QNT: {
    symbol: 'QNT',
    canonicalSymbol: 'QNT',
    source: 'coingecko',
    coingeckoId: 'quant-network',
    pricingUniverse: true,
    notes: 'Quant Network',
  },

  EQNT: {
    symbol: 'eQNT',
    canonicalSymbol: 'EQNT',
    address: '0xd39b46f18bbd1fa864cde38f7ce3bd18c225b067',
    source: 'coingecko',
    coingeckoId: 'quant-network',
    pricingUniverse: true,
    notes: 'Enosys QNT',
  },

  // ────────────────────────────────────────────────────────────
  // DEFI / PROTOCOL TOKENS (CoinGecko)
  // ────────────────────────────────────────────────────────────

  SPRK: {
    symbol: 'SPRK',
    canonicalSymbol: 'SPRK',
    address: '0x657097cc15fdec9e383db8628b57ea4a763f2ba0',
    source: 'coingecko',
    coingeckoId: 'sparkdex',
    pricingUniverse: true,
    notes: 'SparkDEX token',
  },

  SPX: {
    symbol: 'SPX',
    canonicalSymbol: 'SPX',
    source: 'coingecko',
    coingeckoId: 'sparkdex',
    pricingUniverse: true,
    notes: 'SparkDEX alias',
  },

  HLN: {
    symbol: 'HLN',
    canonicalSymbol: 'HLN',
    address: '0xa20e10b9d3e5e0a4f5a2aabdd76a6a8fdc71a2cb',
    source: 'coingecko',
    coingeckoId: 'enosys',
    pricingUniverse: true,
    notes: 'Enosys governance token',
  },

  APS: {
    symbol: 'APS',
    canonicalSymbol: 'APS',
    address: '0xff56eb5b1a7faa972291117e5e9565da29bc808d',
    source: 'coingecko',
    coingeckoId: 'apsis',
    pricingUniverse: true,
    notes: 'Apsis incentive token',
  },

  JOULE: {
    symbol: 'JOULE',
    canonicalSymbol: 'JOULE',
    address: '0xe6505f92583103af7ed9974dec451a7af4e3a3be',
    source: 'coingecko',
    coingeckoId: 'joule-2',
    pricingUniverse: true,
    notes: 'Kinetic protocol token',
  },

  BUGO: {
    symbol: 'BUGO',
    canonicalSymbol: 'BUGO',
    address: '0x6c1490729ce19e809cf9f7e3e223c0490833de02',
    source: 'coingecko',
    coingeckoId: 'bugo',
    pricingUniverse: true,
    notes: 'BUGO meme token',
  },

  // ────────────────────────────────────────────────────────────
  // UNPRICED (no reliable source, excluded from TVL)
  // ────────────────────────────────────────────────────────────

  XVN: {
    symbol: 'XVN',
    canonicalSymbol: 'XVN',
    source: 'unpriced',
    pricingUniverse: false,
    notes: 'No verified CoinGecko ID',
  },

  FOTON: {
    symbol: 'FOTON',
    canonicalSymbol: 'FOTON',
    source: 'unpriced',
    pricingUniverse: false,
    notes: 'No verified CoinGecko ID',
  },
};

// ============================================================
// Lookup Functions
// ============================================================

/**
 * Normalize symbol to canonical form
 */
function toCanonical(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/₮/g, 'T')
    .replace(/₀/g, '0')
    .replace(/\./g, '')
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Get pricing config for a token
 */
export function getTokenPricingConfig(symbol: string): TokenPricingConfig | null {
  return TOKEN_PRICING_CONFIG[toCanonical(symbol)] ?? null;
}

/**
 * Check if token is configured as UNPRICED
 */
export function isTokenUnpriced(symbol: string): boolean {
  return getTokenPricingConfig(symbol)?.source === 'unpriced';
}

/**
 * Check if token is in pricing universe (eligible for TVL)
 */
export function isInPricingUniverse(symbol: string): boolean {
  return getTokenPricingConfig(symbol)?.pricingUniverse === true;
}

/**
 * Get all tokens with a specific pricing source
 */
export function getTokensBySource(source: PricingSource): TokenPricingConfig[] {
  return Object.values(TOKEN_PRICING_CONFIG).filter((t) => t.source === source);
}

/**
 * Get all tokens in the pricing universe
 */
export function getPricingUniverseTokens(): TokenPricingConfig[] {
  return Object.values(TOKEN_PRICING_CONFIG).filter((t) => t.pricingUniverse);
}

/**
 * Check if token uses FTSO as primary source
 */
export function isFtsoToken(symbol: string): boolean {
  return getTokenPricingConfig(symbol)?.source === 'ftso';
}

/**
 * Check if token allows CoinGecko fallback
 */
export function allowsCoinGeckoFallback(symbol: string): boolean {
  const config = getTokenPricingConfig(symbol);
  return config?.coingeckoFallback === true && Boolean(config.coingeckoId);
}
