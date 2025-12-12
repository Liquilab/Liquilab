export type TokenPriceHint = {
  symbol?: string;
  stableUsd?: number;
  coinGeckoId?: string;
  defiLlamaId?: string;
  notes?: string;
};

/**
 * Centralised hints for tokens that frequently miss USD pricing.
 * Values here must be backed by existing project config or previously
 * validated datasource understanding (e.g. CoinGecko IDs documented in
 * `config/token-pricing.config.ts`).
 */
export const TOKEN_PRICE_HINTS: Record<string, TokenPriceHint> = {
  // Stable override — USDT₀
  '0xe7cd86e13ac4309349f30b3435a9d337750fc82d': {
    symbol: 'USDT0',
    stableUsd: 1,
    notes: 'Flare-native USD₮0 stablecoin (strict band enforced in pricing mode)',
  },

  // WFLR
  '0x1d80c49bbbc1c091134665cbb8a3ad4901c5f783': {
    symbol: 'WFLR',
    coinGeckoId: 'flare-networks',
    notes: 'Wrapped FLR – CoinGecko id validated',
  },

  // FXRP (wrapped XRP on Flare)
  '0xad552a648c74d49e10027ab8a618a3ad4901c5be': {
    symbol: 'FXRP',
    coinGeckoId: 'ripple',
    notes: 'FXRP registry entry already references CoinGecko ripple id',
  },

  // sFLR (Sceptre staked FLR)
  '0x12e605bc104e93b45e1ad99f9e555f659051c2bb': {
    symbol: 'sFLR',
    coinGeckoId: 'flare-networks',
    notes: 'FTSO-backed staked FLR; pegged to FLR price',
  },

  // stXRP (staked XRP variant)
  '0x4c18ff3c89632c3dd62e796c0afa5c07c4c1b2b3': {
    symbol: 'stXRP',
    coinGeckoId: 'ripple',
    notes: 'Shares XRP oracle pricing; documented in token registry',
  },

  // Enosys Quant (same CoinGecko ID as canonical EQNT entry)
  '0x60fdc7b744e886e96aa0def5f69ee440db9d8c77': {
    symbol: 'eQNT',
    coinGeckoId: 'quant-network',
    notes: 'Alias seen in wallet pools; shares CoinGecko ID with EQNT in config',
  },

  // APS (Apsis incentive token)
  '0xff56eb5b1a7faa972291117e5e9565da29bc808d': {
    symbol: 'APS',
    coinGeckoId: 'apsis',
    notes: 'Matches APS config entry',
  },

  // SPRK (SparkDEX governance)
  '0x657097cc15fdec9e383db8628b57ea4a763f2ba0': {
    symbol: 'SPRK',
    coinGeckoId: 'sparkdex',
    notes: 'SparkDEX token entry defined in pricing config',
  },

  // CDP Dollar (no verified USD oracle yet; keep null)
  '0x6cd3a5ba46fa254d4d2e3c2b37350ae337e94a0f': {
    symbol: 'CDP',
    notes: 'Requires dedicated source; intentionally excluded from allowlist',
  },
};

export const COINGECKO_ALLOWLIST_IDS: Record<string, string> = Object.fromEntries(
  Object.entries(TOKEN_PRICE_HINTS)
    .filter(([, hint]) => typeof hint.coinGeckoId === 'string')
    .map(([address, hint]) => [address.toLowerCase(), hint.coinGeckoId as string])
);

export const STABLE_PRICE_OVERRIDES: Record<string, number> = Object.fromEntries(
  Object.entries(TOKEN_PRICE_HINTS)
    .filter(([, hint]) => typeof hint.stableUsd === 'number')
    .map(([address, hint]) => [address.toLowerCase(), hint.stableUsd as number])
);

