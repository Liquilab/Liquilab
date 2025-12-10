/**
 * Pair Slug Helpers
 *
 * Provides utilities for parsing and formatting human-friendly pair slug URLs
 * like "stxrp-fxrp" for Pool Universe routing.
 *
 * @module lib/pools/pairSlug
 */

export type ParsedPairSlug = {
  symbolA: string;
  symbolB: string;
};

const PAIR_SLUG_FALLBACK: Record<string, string> = {
  // STXRP/FXRP Universe canonicalises to the Enosys pool; SparkDEX is aggregated via analytics
  'stxrp-fxrp': '0xa4ce7dafc6fb5aceedd0070620b72ab8f09b0770',
  'wflr-usdt0': '0x3c2a7b76795e58829faaa034486d417dd0155162',
  'fxrp-usdt0': '0x686f53f0950ef193c887527ec027e6a574a4dbe1',
};

export function getFallbackPoolAddressForSlug(slug: string | string[] | undefined): string | null {
  if (!slug) return null;
  const raw = Array.isArray(slug) ? slug[0] : slug;
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  const address = PAIR_SLUG_FALLBACK[key];
  return address ?? null;
}

/**
 * Parse a pair slug (e.g., "stxrp-fxrp") into normalised uppercase symbols.
 *
 * - Case-insensitive and whitespace-tolerant.
 * - Returns symbols in alphabetical order for consistent matching.
 * - Returns null if the slug is invalid (not exactly 2 non-empty parts).
 *
 * @param slug - The raw slug from URL (string or array)
 * @returns Parsed pair with symbolA <= symbolB, or null if invalid
 *
 * @example
 * parsePairSlug("stxrp-fxrp")  // { symbolA: "FXRP", symbolB: "STXRP" }
 * parsePairSlug("FXRP-stXRP")  // { symbolA: "FXRP", symbolB: "STXRP" }
 * parsePairSlug("invalid")     // null
 */
const NORMALIZE_SYMBOL_MAP: Record<string, string> = {
  usdt0: 'USD₮0',
  'usd₮0': 'USD₮0',
};

function normalizeSymbol(raw: string): string {
  const key = raw.trim().toLowerCase();
  const mapped = NORMALIZE_SYMBOL_MAP[key];
  if (mapped) return mapped;
  return raw.toUpperCase();
}

export function parsePairSlug(slug: string | string[] | undefined): ParsedPairSlug | null {
  if (!slug) return null;

  const raw = Array.isArray(slug) ? slug[0] : slug;
  const parts = raw
    .trim()
    .toLowerCase()
    .split('-')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length !== 2) return null;

  const [a, b] = parts.map((p) => normalizeSymbol(p));

  // Return in alphabetical order for consistent matching
  return a <= b ? { symbolA: a, symbolB: b } : { symbolA: b, symbolB: a };
}

/**
 * Create a canonical pair slug from two token symbols.
 *
 * - Uses the order provided (typically token0/token1 from Pool).
 * - Lowercased for URL friendliness.
 *
 * @param token0Symbol - First token symbol
 * @param token1Symbol - Second token symbol
 * @returns Slug like "stxrp-fxrp"
 *
 * @example
 * makePairSlug("stXRP", "FXRP")  // "stxrp-fxrp"
 */
export function makePairSlug(token0Symbol: string, token1Symbol: string): string {
  return `${token0Symbol.toLowerCase()}-${token1Symbol.toLowerCase()}`;
}

/**
 * Check if a string looks like a pair slug (contains a hyphen, no 0x prefix).
 *
 * @param value - The value to check
 * @returns true if it looks like a pair slug
 */
export function isPairSlugFormat(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  // Must contain a hyphen, must not be a hex address
  return trimmed.includes('-') && !trimmed.startsWith('0x');
}
