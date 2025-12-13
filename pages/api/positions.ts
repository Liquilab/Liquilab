import type { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, fallback, getAddress, http } from 'viem';
import type { Prisma } from '@prisma/client';

import { resolveRole, roleFlags } from '@/lib/entitlements/resolveRole';
import type {
  PositionRow,
  PositionsResponse,
  PositionClaimToken,
  PositionSummaryEntitlements,
} from '@/lib/positions/types';
import { flare } from '@/lib/chainFlare';
import { prisma } from '@/server/db';
import {
  getPrices,
  getPricesWithSource,
  getStablecoinUsdValue,
  type PricingSource,
} from '@/lib/pricing/prices';
import {
  getPoolAddress,
  getPoolState,
  computePriceRange,
  tickToPrice,
  calcAmountsForPosition,
  bigIntToDecimal,
  calculateAccruedFees,
} from '@/utils/poolHelpers';
import type { ResolvedRole, RoleResolution } from '@/lib/entitlements/resolveRole';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/i;
const CACHE_TTL_MS = 120_000;
const CACHE_CONTROL = 'public, max-age=60, s-maxage=60, stale-while-revalidate=120';

const ERC20_ABI = [
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
] as const;

const POSITION_ABI = [
  {
    name: 'positions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
  },
] as const;

const publicClient = createPublicClient({
  chain: flare,
  transport: fallback([
    http(process.env.FLARE_RPC_URL ?? flare.rpcUrls.default.http[0], { batch: true }),
    http('https://flare-api.flare.network/ext/C/rpc', { batch: true }),
  ]),
});

const nfpmConfigs = [
  process.env.ENOSYS_NFPM && process.env.ENOSYS_V3_FACTORY
    ? {
        dex: 'enosys-v3' as const,
        nfpm: getAddress(process.env.ENOSYS_NFPM as `0x${string}`),
        factory: getAddress(process.env.ENOSYS_V3_FACTORY as `0x${string}`),
      }
    : null,
  process.env.SPARKDEX_NFPM && process.env.SPARKDEX_V3_FACTORY
    ? {
        dex: 'sparkdex-v3' as const,
        nfpm: getAddress(process.env.SPARKDEX_NFPM as `0x${string}`),
        factory: getAddress(process.env.SPARKDEX_V3_FACTORY as `0x${string}`),
      }
    : null,
].filter((cfg): cfg is { dex: 'enosys-v3' | 'sparkdex-v3'; nfpm: `0x${string}`; factory: `0x${string}` } => Boolean(cfg));

const cache = new Map<string, { expires: number; payload: PositionsResponse }>();
const tokenMetaCache = new Map<string, { symbol: string; decimals: number }>();
const incentivesCache = new Map<string, IncentiveInfo | null>();

type RoleFlags = ReturnType<typeof roleFlags>;
type PositionsDataPayload = NonNullable<PositionsResponse['data']>;
type CanonicalSummary = NonNullable<PositionsDataPayload['summary']>;
type ValuationMode = 'stable_pair_spot_truth' | 'registry_fallback' | 'external_price' | 'unpriced_null';
const REGISTRY_VALUATION_SOURCES: PricingSource[] = ['registry', 'stablecoin', 'stable_override'];
const EXTERNAL_VALUATION_SOURCES: PricingSource[] = [
  'coingecko',
  'coingecko_id',
  'defillama',
  'defillama_id',
  'ankr',
  'pool_implied',
];

const TARGET_POSITION = {
  dex: 'enosys-v3' as const,
  tokenId: 28134n,
  referenceTvlUsd: 495.57,
  referenceFeesUsd: 0.26369,
};

export type CanonicalPositionInput = {
  address: string;
  role?: ResolvedRole;
  network?: string;
};

export type CanonicalPositionResult = PositionsDataPayload;

interface RawPosition {
  tokenId: bigint;
  dex: 'enosys-v3' | 'sparkdex-v3';
  nfpm: `0x${string}`;
  poolAddress: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  tick?: number | null;
  sqrtPriceX96?: bigint;
}

interface IncentiveInfo {
  usdPerDay: number | null;
  tokens: PositionRow['incentivesTokens'];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rawWalletParam = typeof req.query.wallet === 'string' && req.query.wallet.length
    ? req.query.wallet
    : typeof req.query.address === 'string'
      ? req.query.address
      : '';

  let wallet: `0x${string}`;
  try {
    wallet = normalizeWalletAddress(rawWalletParam);
  } catch (error) {
    res.status(400).json({ error: 'Invalid wallet' });
    return;
  }

  const resolution = resolveRole(req);
  const flags = roleFlags(resolution.role);
  const cacheKey = `${wallet}:${flags.premium ? 1 : 0}:${flags.analytics ? 1 : 0}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    res.setHeader('Cache-Control', CACHE_CONTROL);
    res.status(200).json(cached.payload);
    return;
  }

  const started = Date.now();
  const debugMode = typeof req.query.debug === 'string' && req.query.debug === '1';
  try {
    const { positions, aggregateCounters } = await buildPositions(wallet, resolution.role, flags, req as NextApiRequest);
    const payload: PositionsResponse = {
      success: true,
      data: {
        positions,
        meta: {
          address: wallet,
          elapsedMs: Date.now() - started,
          ...(debugMode && {
            debug: {
              missingPriceTokenCount: aggregateCounters.missingPriceTokenCount,
              positionsWithNullTvlUsdCount: aggregateCounters.positionsWithNullTvlUsdCount,
              positionsWithNullFeesUsdCount: aggregateCounters.positionsWithNullFeesUsdCount,
              poolImpliedPriceUsedCount: aggregateCounters.poolImpliedPriceUsedCount,
              valuationModeCounts: aggregateCounters.valuationModeCounts,
            },
          }),
        },
      },
    };

    cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, payload });
    res.setHeader('Cache-Control', CACHE_CONTROL);
    res.status(200).json(payload);
  } catch (error) {
    console.error('[api/positions] failed', error);
    res.status(200).json({
      success: true,
      data: {
        positions: [],
        meta: {
          address: wallet,
          elapsedMs: Date.now() - started,
        },
      },
    });
  }
}

async function buildPositions(
  wallet: string,
  role: 'VISITOR' | 'PREMIUM' | 'PRO',
  flags: { premium: boolean; analytics: boolean },
  req?: NextApiRequest
): Promise<{
  positions: PositionRow[];
  aggregateCounters: {
    missingPriceTokenCount: number;
    positionsWithNullTvlUsdCount: number;
    positionsWithNullFeesUsdCount: number;
    poolImpliedPriceUsedCount: number;
    valuationModeCounts: Record<ValuationMode, number>;
  };
}> {
  if (!nfpmConfigs.length)
    return {
      positions: [],
      aggregateCounters: {
        missingPriceTokenCount: 0,
        positionsWithNullTvlUsdCount: 0,
        positionsWithNullFeesUsdCount: 0,
        poolImpliedPriceUsedCount: 0,
        valuationModeCounts: {
          stable_pair_spot_truth: 0,
          registry_fallback: 0,
          external_price: 0,
          unpriced_null: 0,
        },
      },
    };

  const rawPositions: RawPosition[] = [];
  const perDexRawCount: Record<string, number> = {};
  const perDexCounters: Record<
    string,
    {
      mapped: number;
      partial: number;
      failed: number;
      feesOk: number;
      feesFailed: number;
      incentivesOk: number;
      incentivesNull: number;
      incentivesFailed: number;
      rangeOk: number;
      rangeUnavailable: number;
      rangeFixed: number;
    }
  > = {};

  for (const config of nfpmConfigs) {
    const tokenIds = await getTokenIdsForNfpm(config.nfpm, wallet);
    perDexRawCount[config.dex] = tokenIds.length;
    perDexCounters[config.dex] = {
      mapped: 0,
      partial: 0,
      failed: 0,
      feesOk: 0,
      feesFailed: 0,
      incentivesOk: 0,
      incentivesNull: 0,
      incentivesFailed: 0,
      rangeOk: 0,
      rangeUnavailable: 0,
      rangeFixed: 0,
    };
    console.log(`[api/positions] ${config.dex} tokenIds=${tokenIds.length}`);
    for (const tokenId of tokenIds) {
      const raw = await readPositionForConfig(config, tokenId);
      if (raw) rawPositions.push(raw);
    }
  }

  if (!rawPositions.length)
    return {
      positions: [],
      aggregateCounters: {
        missingPriceTokenCount: 0,
        positionsWithNullTvlUsdCount: 0,
        positionsWithNullFeesUsdCount: 0,
        poolImpliedPriceUsedCount: 0,
        valuationModeCounts: {
          stable_pair_spot_truth: 0,
          registry_fallback: 0,
          external_price: 0,
          unpriced_null: 0,
        },
      },
    };

  const priceAddresses = Array.from(
    rawPositions.reduce((set, pos) => {
      set.add(pos.token0.toLowerCase());
      set.add(pos.token1.toLowerCase());
      return set;
    }, new Set<string>())
  );

  const priceMapWithSource = await getPricesWithSource(priceAddresses);
  const priceMap: Record<string, number> = {};
  for (const [addr, res] of Object.entries(priceMapWithSource)) {
    if (res.price !== undefined) {
      priceMap[addr] = res.price;
    }
  }

  const debugMode = req ? (typeof req.query.debug === 'string' && req.query.debug === '1') : false;
  const aggregateCounters = {
    missingPriceTokenCount: 0,
    positionsWithNullTvlUsdCount: 0,
    positionsWithNullFeesUsdCount: 0,
    poolImpliedPriceUsedCount: 0,
    valuationModeCounts: {
      stable_pair_spot_truth: 0,
      registry_fallback: 0,
      external_price: 0,
      unpriced_null: 0,
    } as Record<ValuationMode, number>,
  };

  console.log(`[api/positions] Mapping raw positions: count=${rawPositions.length}`);
  const positions = await Promise.all(
    rawPositions.map(async (raw) =>
      mapRawPosition(
        raw,
        role,
        flags,
        priceMap,
        priceMapWithSource,
        perDexCounters[raw.dex]!,
        aggregateCounters,
        debugMode
      )
    )
  );
  const mapped = positions.filter(Boolean) as PositionRow[];
  console.log(`[api/positions] Mapped positions: count=${mapped.length} (raw=${rawPositions.length})`);
  Object.entries(perDexCounters).forEach(([dex, counters]) => {
    console.log(
      `[api/positions] ${dex} mapped=${counters.mapped} partial=${counters.partial} failed=${counters.failed} fees_ok=${counters.feesOk} fees_failed=${counters.feesFailed} incentives_ok=${counters.incentivesOk} incentives_null=${counters.incentivesNull} incentives_failed=${counters.incentivesFailed} range_ok=${counters.rangeOk} range_unavailable=${counters.rangeUnavailable} range_fixed=${counters.rangeFixed}`
    );
  });
  console.log(
    `[api/positions] Aggregate: missing_price_tokens=${aggregateCounters.missingPriceTokenCount} null_tvl=${aggregateCounters.positionsWithNullTvlUsdCount} null_fees=${aggregateCounters.positionsWithNullFeesUsdCount} pool_implied=${aggregateCounters.poolImpliedPriceUsedCount}`
  );
  const valuationLog = Object.entries(aggregateCounters.valuationModeCounts)
    .map(([mode, count]) => `${mode}:${count}`)
    .join(' ');
  console.log(`[api/positions] Valuation modes: ${valuationLog}`);
  return { positions: mapped, aggregateCounters };
}

async function getTokenIdsForNfpm(nfpm: `0x${string}`, owner: string): Promise<bigint[]> {
  const ERC721_ENUMERABLE_ABI = [
    { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
    { type: 'function', name: 'tokenOfOwnerByIndex', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }], outputs: [{ name: 'tokenId', type: 'uint256' }] },
  ] as const;

  try {
    const ownerAddress = getAddress(owner);
    const balance = await publicClient.readContract({
      address: nfpm,
      abi: ERC721_ENUMERABLE_ABI,
      functionName: 'balanceOf',
      args: [ownerAddress],
    }) as bigint;

    const tokenIds: bigint[] = [];
    for (let i = 0n; i < balance; i += 1n) {
      const tokenId = await publicClient.readContract({
        address: nfpm,
        abi: ERC721_ENUMERABLE_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [ownerAddress, i],
      }) as bigint;
      tokenIds.push(tokenId);
    }
    return tokenIds;
  } catch (error) {
    console.warn(`[api/positions] Failed to get tokenIds for NFPM ${nfpm}:`, error);
    return [];
  }
}

async function readPositionForConfig(config: { dex: 'enosys-v3' | 'sparkdex-v3'; nfpm: `0x${string}`; factory: `0x${string}` }, tokenId: bigint): Promise<RawPosition | null> {
  const result = await readPosition(config.nfpm, tokenId);
  if (!result) return null;
  const token0 = getAddress(result.token0);
  const token1 = getAddress(result.token1);
  const [sorted0, sorted1] = sortAddresses(token0, token1);

  let poolAddress: `0x${string}`;
  let poolState: { sqrtPriceX96: bigint; tick: number } | null = null;
  try {
    poolAddress = await getPoolAddress(config.factory, sorted0, sorted1, result.fee);
    poolState = await getPoolState(poolAddress);
  } catch {
    return null;
  }

  const tick = poolState?.tick ?? null;

  return {
    tokenId,
    dex: config.dex,
    nfpm: config.nfpm,
    poolAddress,
    token0,
    token1,
    fee: result.fee,
    tickLower: result.tickLower,
    tickUpper: result.tickUpper,
    liquidity: result.liquidity,
    feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
    tokensOwed0: result.tokensOwed0,
    tokensOwed1: result.tokensOwed1,
    tick,
    sqrtPriceX96: poolState?.sqrtPriceX96,
  };
}

async function readPosition(nfpm: `0x${string}`, tokenId: bigint) {
  try {
    const result = await publicClient.readContract({
      address: nfpm,
      abi: POSITION_ABI,
      functionName: 'positions',
      args: [tokenId],
    });

    const [
      ,
      ,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
    ] = result as [
      bigint,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      number,
      number,
      number,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
    ];

    if (liquidity === BigInt(0)) return null;

    return {
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
    };
  } catch {
    return null;
  }
}

function inferPoolPrice(
  tokenAddress: string,
  pairedTokenAddress: string,
  pairedTokenPrice: number | undefined,
  pairedTokenSource: PricingSource,
  sqrtPriceX96: bigint | undefined,
  tokenDecimals: number,
  pairedTokenDecimals: number
): { price: number; source: PricingSource } | null {
  if (
    !sqrtPriceX96 ||
    pairedTokenPrice === undefined ||
    pairedTokenSource === 'missing' ||
    pairedTokenSource === 'pool_implied'
  ) {
    return null;
  }

  // Only infer if paired token has confident price (not pool_implied to avoid cascading)
  if (
    pairedTokenSource !== 'registry' &&
    pairedTokenSource !== 'coingecko' &&
    pairedTokenSource !== 'stablecoin' &&
    pairedTokenSource !== 'defillama'
  ) {
    return null;
  }

  try {
    const poolPrice = sqrtRatioToPrice(sqrtPriceX96, tokenDecimals, pairedTokenDecimals);
    // poolPrice is token0/token1, so if we have token1 price, token0 price = poolPrice * token1Price
    // If we have token0 price, token1 price = token0Price / poolPrice
    let inferredPrice: number;
    if (tokenAddress.toLowerCase() === pairedTokenAddress.toLowerCase()) {
      return null;
    }
    // Assume token0 is the one we're inferring, token1 is the paired one
    // poolPrice = token0Amount / token1Amount, so token0Price = poolPrice * token1Price
    inferredPrice = poolPrice * pairedTokenPrice;
    if (Number.isFinite(inferredPrice) && inferredPrice > 0) {
      return { price: inferredPrice, source: 'pool_implied' };
    }
  } catch {
    return null;
  }
  return null;
}

function sqrtRatioToPrice(sqrtPriceX96: bigint, token0Decimals: number, token1Decimals: number): number {
  const Q96 = BigInt(1) << BigInt(96);
  const ratio = Number(sqrtPriceX96) / Number(Q96);
  const price = ratio * ratio;
  const decimalAdjustment = Math.pow(10, token0Decimals - token1Decimals);
  return price * decimalAdjustment;
}

async function mapRawPosition(
  raw: RawPosition,
  role: 'VISITOR' | 'PREMIUM' | 'PRO',
  flags: { premium: boolean; analytics: boolean },
  priceMap: Record<string, number>,
  priceMapWithSource: Record<string, { price: number | undefined; source: PricingSource }>,
  counters: {
    mapped: number;
    partial: number;
    failed: number;
    feesOk: number;
    feesFailed: number;
    incentivesOk: number;
    incentivesNull: number;
    incentivesFailed: number;
    rangeOk: number;
    rangeUnavailable: number;
    rangeFixed: number;
  },
  aggregateCounters: {
    missingPriceTokenCount: number;
    positionsWithNullTvlUsdCount: number;
    positionsWithNullFeesUsdCount: number;
    poolImpliedPriceUsedCount: number;
    valuationModeCounts: Record<ValuationMode, number>;
  },
  debugMode: boolean
): Promise<PositionRow | null> {
  try {
    const [token0Meta, token1Meta] = await Promise.all([
      getTokenMetadata(raw.token0),
      getTokenMetadata(raw.token1),
    ]);

    const incentives = await getPoolIncentives(raw.poolAddress);
    let price0Result =
      priceMapWithSource[raw.token0.toLowerCase()] ?? { price: undefined, source: 'missing' as PricingSource };
    let price1Result =
      priceMapWithSource[raw.token1.toLowerCase()] ?? { price: undefined, source: 'missing' as PricingSource };

    // Pool-implied fallback
    if (price0Result.price === undefined && price1Result.price !== undefined && raw.sqrtPriceX96) {
      const inferred = inferPoolPrice(
        raw.token0,
        raw.token1,
        price1Result.price,
        price1Result.source,
        raw.sqrtPriceX96,
        token0Meta.decimals,
        token1Meta.decimals
      );
      if (inferred) {
        price0Result = inferred;
        aggregateCounters.poolImpliedPriceUsedCount += 1;
      }
    }
    if (price1Result.price === undefined && price0Result.price !== undefined && raw.sqrtPriceX96) {
      const inferred = inferPoolPrice(
        raw.token1,
        raw.token0,
        price0Result.price,
        price0Result.source,
        raw.sqrtPriceX96,
        token1Meta.decimals,
        token0Meta.decimals
      );
      if (inferred) {
        price1Result = inferred;
        aggregateCounters.poolImpliedPriceUsedCount += 1;
      }
    }

    const warnings: string[] = [];
    const valuationWarnings: string[] = [];
    let valuationMode: ValuationMode = 'unpriced_null';
    let effectivePrice0 = price0Result.price;
    let effectivePrice1 = price1Result.price;
    let effectivePrice0Source: PricingSource | 'stable_pair_spot_truth' | undefined =
      price0Result.price !== undefined ? price0Result.source : undefined;
    let effectivePrice1Source: PricingSource | 'stable_pair_spot_truth' | undefined =
      price1Result.price !== undefined ? price1Result.source : undefined;
    let stableSide: 'token0' | 'token1' | undefined;
    let derivedPrice01: number | undefined;
    let derivedPrice10: number | undefined;

    const stableTruth = deriveStablePairSpotTruth(raw, token0Meta, token1Meta);
    if (stableTruth.applied) {
      valuationMode = 'stable_pair_spot_truth';
      valuationWarnings.push('stable_pair_spot_truth_used');
      stableSide = stableTruth.stableToken;
      derivedPrice01 = stableTruth.price01;
      derivedPrice10 = stableTruth.price10;
      if (stableTruth.price0Usd !== undefined) {
        effectivePrice0 = stableTruth.price0Usd;
        effectivePrice0Source = 'stable_pair_spot_truth';
      }
      if (stableTruth.price1Usd !== undefined) {
        effectivePrice1 = stableTruth.price1Usd;
        effectivePrice1Source = 'stable_pair_spot_truth';
      }
    } else if (stableTruth.stableCandidate && stableTruth.reason) {
      valuationWarnings.push(stableTruth.reason);
    }

    if (effectivePrice0 === undefined) aggregateCounters.missingPriceTokenCount += 1;
    if (effectivePrice1 === undefined) aggregateCounters.missingPriceTokenCount += 1;

    const priceSourcesUsed = [
      effectivePrice0 !== undefined ? effectivePrice0Source ?? price0Result.source : undefined,
      effectivePrice1 !== undefined ? effectivePrice1Source ?? price1Result.source : undefined,
    ].filter((source): source is PricingSource | 'stable_pair_spot_truth' => Boolean(source));

    if (valuationMode !== 'stable_pair_spot_truth') {
      const filteredSources = priceSourcesUsed.filter((src) => src !== 'stable_pair_spot_truth') as PricingSource[];
      if (filteredSources.length === 0) {
        valuationMode = 'unpriced_null';
        valuationWarnings.push('valuation_missing_price');
      } else if (filteredSources.every((src) => REGISTRY_VALUATION_SOURCES.includes(src))) {
        valuationMode = 'registry_fallback';
      } else if (filteredSources.some((src) => EXTERNAL_VALUATION_SOURCES.includes(src))) {
        valuationMode = 'external_price';
      } else {
        valuationMode = 'unpriced_null';
      }
    }

    aggregateCounters.valuationModeCounts[valuationMode] += 1;
    if (valuationMode === 'unpriced_null') {
      warnings.push('valuation_unpriced_null');
      valuationWarnings.push('valuation_unpriced_null');
    }

    const valuationSources = {
      token0: effectivePrice0 !== undefined ? effectivePrice0Source ?? price0Result.source : 'missing',
      token1: effectivePrice1 !== undefined ? effectivePrice1Source ?? price1Result.source : 'missing',
    };

    const claim = buildClaim(raw, token0Meta, token1Meta, effectivePrice0, effectivePrice1);

    // Range calculations (best-effort, token1 per token0)
    let rangeMin: number | undefined;
    let rangeMax: number | undefined;
    let currentPrice: number | undefined;
    let rangeFailureReason: string | null = null;
    try {
      const dec0 = token0Meta.decimals;
      const dec1 = token1Meta.decimals;
      if (typeof dec0 === 'number' && typeof dec1 === 'number') {
        rangeMin = tickToPrice(raw.tickLower, dec0, dec1);
        rangeMax = tickToPrice(raw.tickUpper, dec0, dec1);

        if (raw.tick !== null && raw.tick !== undefined) {
          currentPrice = tickToPrice(raw.tick, dec0, dec1);
        } else if (raw.sqrtPriceX96) {
          const priceFromSqrt = sqrtRatioToPrice(raw.sqrtPriceX96, dec0, dec1);
          if (Number.isFinite(priceFromSqrt)) {
            currentPrice = priceFromSqrt;
          }
        }

        // Fallback to derivedPrice01 (from stable pair truth) if currentPrice is not available
        if ((currentPrice === undefined || !Number.isFinite(currentPrice)) && derivedPrice01 !== undefined) {
          currentPrice = derivedPrice01;
        }

        if (
          typeof rangeMin === 'number' &&
          typeof rangeMax === 'number' &&
          Number.isFinite(rangeMin) &&
          Number.isFinite(rangeMax) &&
          rangeMin > rangeMax
        ) {
          const tmp = rangeMin;
          rangeMin = rangeMax;
          rangeMax = tmp;
          warnings.push('rangeband_fixed_inversion');
          counters.rangeFixed += 1;
        }

        if (
          typeof rangeMin !== 'number' ||
          typeof rangeMax !== 'number' ||
          !Number.isFinite(rangeMin) ||
          !Number.isFinite(rangeMax)
        ) {
          rangeFailureReason = 'nonfinite_bounds';
        } else if (rangeMin === rangeMax) {
          rangeFailureReason = 'zero_width_range';
        }

        if (currentPrice === undefined || !Number.isFinite(currentPrice)) {
          rangeFailureReason = rangeFailureReason ?? 'missing_current_price';
        }
      } else {
        rangeFailureReason = 'missing_decimals';
        warnings.push('range_data_unavailable:missing_decimals');
      }
    } catch (err) {
      console.warn(`[api/positions] Range computation failed for tokenId=${raw.tokenId}:`, err);
      rangeFailureReason = 'range_calc_error';
      warnings.push('range_data_unavailable:range_calc_error');
    }

    const row: PositionRow = {
      tokenId: raw.tokenId.toString(),
      nfpm: raw.nfpm,
      dex: raw.dex,
      positionKey: `${raw.dex}:${raw.nfpm.toLowerCase()}:${raw.tokenId.toString()}`,
      poolAddress: raw.poolAddress,
      pair: {
        symbol0: token0Meta.symbol,
        symbol1: token1Meta.symbol,
        feeBps: raw.fee,
      },
      liquidity: raw.liquidity.toString(),
      amountsUsd: { total: null, token0: null, token1: null },
      fees24hUsd: null,
      incentivesUsdPerDay: incentives?.usdPerDay ?? null,
      incentivesTokens: incentives?.tokens ?? [],
      status: 'unknown',
      claim: claim,
      entitlements: {
        role,
        flags,
      },
      rangeMin,
      rangeMax,
      currentPrice,
      minPrice: rangeMin ?? null,
      maxPrice: rangeMax ?? null,
      currentPrice: currentPrice ?? null,
      tvlUsd: undefined,
      unclaimedFeesUsd: undefined,
      enrichmentStatus: 'partial',
      warnings,
      valuationMode,
      valuationWarnings: valuationWarnings.length ? valuationWarnings : undefined,
      effectivePrice0Usd: effectivePrice0 ?? null,
      effectivePrice1Usd: effectivePrice1 ?? null,
      token0: {
        symbol: token0Meta.symbol,
        address: raw.token0,
      },
      token1: {
        symbol: token1Meta.symbol,
        address: raw.token1,
      },
      pricingSource0: valuationSources.token0 ?? undefined,
      pricingSource1: valuationSources.token1 ?? undefined,
      amount0: undefined,
      amount1: undefined,
      fee0: undefined,
      fee1: undefined,
    };

    if (debugMode) {
      row.stableSide = stableSide;
      row.price01 = derivedPrice01 ?? null;
      row.price10 = derivedPrice10 ?? null;
      (row as any).debug = {
        ...(row as any).debug ?? {},
        valuationMode,
        valuationWarnings,
        stableSide,
        price01: derivedPrice01 ?? null,
        price10: derivedPrice10 ?? null,
        effectivePrice0Usd: effectivePrice0 ?? null,
        effectivePrice1Usd: effectivePrice1 ?? null,
        pricingSource0: valuationSources.token0,
        pricingSource1: valuationSources.token1,
      };
    }

    let tvlUsdMode: 'full' | 'partial' | 'null' = 'null';
    let feesUsdMode: 'full' | 'partial' | 'null' = 'null';

    // TVL calculations (strict USD conversion rules)
    try {
      if (raw.sqrtPriceX96 && raw.tick !== null && raw.tick !== undefined) {
        const { amount0Wei, amount1Wei } = calcAmountsForPosition(
          raw.liquidity,
          raw.sqrtPriceX96,
          raw.tickLower,
          raw.tickUpper,
          token0Meta.decimals,
          token1Meta.decimals
        );
        const amount0 = bigIntToDecimal(amount0Wei, token0Meta.decimals);
        const amount1 = bigIntToDecimal(amount1Wei, token1Meta.decimals);
        
        row.amount0 = amount0;
        row.amount1 = amount1;

        const hasPrice0 = effectivePrice0 !== undefined && Number.isFinite(effectivePrice0);
        const hasPrice1 = effectivePrice1 !== undefined && Number.isFinite(effectivePrice1);

        let tvlUsd: number | undefined = undefined;
        tvlUsdMode = 'null';

        if (hasPrice0 && hasPrice1) {
          tvlUsd = effectivePrice0! * amount0 + effectivePrice1! * amount1;
          tvlUsdMode = 'full';
        } else if (hasPrice0 || hasPrice1) {
          const partialUsd = hasPrice0 ? effectivePrice0! * amount0 : effectivePrice1! * amount1;
          warnings.push('partial_usd_missing_token_price');
          tvlUsdMode = 'partial';
          // Do not set tvlUsd to partial - return null instead
          tvlUsd = undefined;
        } else {
          warnings.push('price_missing_both_tokens');
          tvlUsdMode = 'null';
        }

        row.amountsUsd = {
          total: tvlUsd !== undefined && Number.isFinite(tvlUsd) ? tvlUsd : null,
          token0: hasPrice0 ? effectivePrice0! * amount0 : null,
          token1: hasPrice1 ? effectivePrice1! * amount1 : null,
        };
        row.tvlUsd = tvlUsd !== undefined && Number.isFinite(tvlUsd) ? tvlUsd : undefined;

        if (row.tvlUsd === undefined) {
          aggregateCounters.positionsWithNullTvlUsdCount += 1;
        }

        if (debugMode) {
          (row as any).debug = {
            ...((row as any).debug ?? {}),
            tvlUsdMode,
            amount0,
            amount1,
          };
        }
      }
    } catch (err) {
      console.warn(`[api/positions] TVL computation failed for tokenId=${raw.tokenId}:`, err);
      warnings.push('tvl_calc_failed');
    }

    // Fees (unclaimed) calculations (strict USD conversion rules)
    try {
      if (
        raw.tick !== null &&
        raw.tick !== undefined &&
        raw.feeGrowthInside0LastX128 !== undefined &&
        raw.feeGrowthInside1LastX128 !== undefined
      ) {
        const { fee0Wei, fee1Wei } = await calculateAccruedFees({
          poolAddress: raw.poolAddress,
          liquidity: raw.liquidity,
          tickLower: raw.tickLower,
          tickUpper: raw.tickUpper,
          currentTick: raw.tick,
          feeGrowthInside0LastX128: raw.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: raw.feeGrowthInside1LastX128,
          tokensOwed0: raw.tokensOwed0,
          tokensOwed1: raw.tokensOwed1,
        });
        const fee0 = bigIntToDecimal(fee0Wei, token0Meta.decimals);
        const fee1 = bigIntToDecimal(fee1Wei, token1Meta.decimals);
        
        row.fee0 = fee0;
        row.fee1 = fee1;

        const hasPrice0 = effectivePrice0 !== undefined && Number.isFinite(effectivePrice0);
        const hasPrice1 = effectivePrice1 !== undefined && Number.isFinite(effectivePrice1);

        let feesUsd: number | undefined = undefined;
        feesUsdMode = 'null';

        if (hasPrice0 && hasPrice1) {
          feesUsd = fee0 * effectivePrice0! + fee1 * effectivePrice1!;
          feesUsdMode = 'full';
        } else if (hasPrice0 || hasPrice1) {
          warnings.push('partial_usd_missing_token_price');
          feesUsdMode = 'partial';
          // Do not set feesUsd to partial - return null instead
          feesUsd = undefined;
        } else {
          warnings.push('fees_unpriced');
          feesUsdMode = 'null';
        }

        row.unclaimedFeesUsd = feesUsd !== undefined && Number.isFinite(feesUsd) ? feesUsd : undefined;

        if (row.unclaimedFeesUsd === undefined) {
          aggregateCounters.positionsWithNullFeesUsdCount += 1;
        }

        if (debugMode) {
          (row as any).debug = {
            ...((row as any).debug ?? {}),
            feesUsdMode,
            fee0,
            fee1,
          };
        }

        counters.feesOk += 1;
      } else {
        warnings.push('fees_data_unavailable');
        counters.feesFailed += 1;
      }
    } catch (err) {
      console.warn(`[api/positions] Fees computation failed for tokenId=${raw.tokenId}:`, err);
      warnings.push('fees_calc_failed');
      counters.feesFailed += 1;
    }

    if (debugMode) {
      console.log(
        `[api/positions][debug] ${row.positionKey ?? raw.tokenId} ${row.dex} ${raw.tokenId} ${token0Meta.symbol}/${token1Meta.symbol} ${valuationMode} ${tvlUsdMode} ${feesUsdMode}`
      );
      if (raw.dex === TARGET_POSITION.dex && raw.tokenId === TARGET_POSITION.tokenId) {
        const tvlDeltaPct =
          row.tvlUsd !== undefined
            ? ((row.tvlUsd - TARGET_POSITION.referenceTvlUsd) / TARGET_POSITION.referenceTvlUsd) * 100
            : null;
        const feesDeltaPct =
          row.unclaimedFeesUsd !== undefined
            ? ((row.unclaimedFeesUsd - TARGET_POSITION.referenceFeesUsd) / TARGET_POSITION.referenceFeesUsd) * 100
            : null;
        (row as any).debug = {
          ...((row as any).debug ?? {}),
          targetPosition: {
            referenceTvlUsd: TARGET_POSITION.referenceTvlUsd,
            referenceFeesUsd: TARGET_POSITION.referenceFeesUsd,
            tvlDeltaPct,
            feesDeltaPct,
            stablePair: {
              stableSide: stableSide ?? null,
              price01: derivedPrice01 ?? null,
              price10: derivedPrice10 ?? null,
              effectivePrice0Usd: effectivePrice0 ?? null,
              effectivePrice1Usd: effectivePrice1 ?? null,
            },
          },
        };
        console.log(
          `[api/positions][debug][28134] stableSide=${stableSide ?? 'n/a'} price01=${
            derivedPrice01 ?? 'n/a'
          } price10=${derivedPrice10 ?? 'n/a'} effPrice0=${effectivePrice0 ?? 'n/a'} effPrice1=${
            effectivePrice1 ?? 'n/a'
          } tvlUsd=${row.tvlUsd ?? 'null'} tvlΔ%=${
            tvlDeltaPct !== null && tvlDeltaPct !== undefined ? tvlDeltaPct.toFixed(2) : 'n/a'
          } feesUsd=${row.unclaimedFeesUsd ?? 'null'} feesΔ%=${
            feesDeltaPct !== null && feesDeltaPct !== undefined ? feesDeltaPct.toFixed(2) : 'n/a'
          }`
        );
      }
    }

    // Determine status based on price range (after rangeMin/Max/currentPrice are set)
    if (
      typeof row.rangeMin === 'number' &&
      typeof row.rangeMax === 'number' &&
      typeof row.currentPrice === 'number' &&
      Number.isFinite(row.rangeMin) &&
      Number.isFinite(row.rangeMax) &&
      Number.isFinite(row.currentPrice) &&
      row.rangeMin < row.rangeMax
    ) {
      row.status = determineStatus(raw.tick, raw.tickLower, raw.tickUpper, row.rangeMin, row.rangeMax, row.currentPrice);
    } else {
      row.status = determineStatus(raw.tick, raw.tickLower, raw.tickUpper);
    }

    // Incentives tracking
    if (incentives) {
      counters.incentivesOk += 1;
      if (incentives.usdPerDay === null) {
        warnings.push('incentives_unpriced');
      }
    } else {
      counters.incentivesNull += 1;
      warnings.push('incentives_unavailable_for_dex');
    }

    if (!flags.premium) {
      row.fees24hUsd = null;
      row.incentivesUsdPerDay = null;
      row.incentivesTokens = [];
      row.claim = null;
      // Preserve range fields for RangeBand visibility even for non-premium in dev/local
    }

    if (
      typeof row.rangeMin !== 'number' ||
      typeof row.rangeMax !== 'number' ||
      !Number.isFinite(row.rangeMin) ||
      !Number.isFinite(row.rangeMax) ||
      row.rangeMin >= row.rangeMax ||
      typeof row.currentPrice !== 'number' ||
      !Number.isFinite(row.currentPrice)
    ) {
      row.enrichmentStatus = 'partial';
      row.status = determineStatus(raw.tick, raw.tickLower, raw.tickUpper, row.rangeMin, row.rangeMax, row.currentPrice);
      warnings.push(`range_data_unavailable:${rangeFailureReason ?? 'unknown'}`);
      counters.rangeUnavailable += 1;
    } else {
      row.status = determineStatus(raw.tick, raw.tickLower, raw.tickUpper, row.rangeMin, row.rangeMax, row.currentPrice);
      row.enrichmentStatus = 'ok';
      counters.rangeOk += 1;
    }

    if (row.unclaimedFeesUsd !== undefined && row.unclaimedFeesUsd !== null && Number.isFinite(row.unclaimedFeesUsd)) {
      // already captured in feesOk counter above
    }

    // Keep public aliases for range fields (token1 per token0) even after final checks
    row.minPrice = typeof row.rangeMin === 'number' && Number.isFinite(row.rangeMin) ? row.rangeMin : null;
    row.maxPrice = typeof row.rangeMax === 'number' && Number.isFinite(row.rangeMax) ? row.rangeMax : null;
    row.currentPrice = typeof row.currentPrice === 'number' && Number.isFinite(row.currentPrice) ? row.currentPrice : null;

    if (row.enrichmentStatus === 'ok') {
      counters.mapped += 1;
    } else {
      counters.partial += 1;
    }
    return row;
  } catch (error) {
    console.warn(`[api/positions] failed to map position tokenId=${raw.tokenId}:`, error);
    counters.failed += 1;
    return {
      tokenId: raw.tokenId.toString(),
      nfpm: raw.nfpm,
      dex: raw.dex,
      positionKey: `${raw.dex}:${raw.nfpm.toLowerCase()}:${raw.tokenId.toString()}`,
      poolAddress: raw.poolAddress,
      pair: {
        symbol0: 'TKN0',
        symbol1: 'TKN1',
        feeBps: raw.fee,
      },
      liquidity: raw.liquidity.toString(),
      amountsUsd: { total: null, token0: null, token1: null },
      fees24hUsd: null,
      incentivesUsdPerDay: null,
      incentivesTokens: [],
      status: 'unknown',
      claim: null,
      entitlements: {
        role,
        flags,
      },
      rangeMin: undefined,
      rangeMax: undefined,
      currentPrice: undefined,
      tvlUsd: undefined,
      unclaimedFeesUsd: undefined,
      enrichmentStatus: 'failed',
      warnings: ['Mapping failed; returned minimal position'],
    };
  }
}

type StablePairTruth =
  | {
      applied: true;
      stableCandidate: true;
      stableToken: 'token0' | 'token1';
      price01: number;
      price10: number;
      price0Usd?: number;
      price1Usd?: number;
    }
  | {
      applied: false;
      stableCandidate: boolean;
      reason?: string;
      price01?: number;
      price10?: number;
    };

function deriveStablePairSpotTruth(
  raw: RawPosition,
  token0Meta: { symbol: string; decimals: number },
  token1Meta: { symbol: string; decimals: number }
): StablePairTruth {
  let stable0Usd = getStablecoinUsdValue(raw.token0);
  let stable1Usd = getStablecoinUsdValue(raw.token1);

  if (!stable0Usd && isSparkStableSymbol(token0Meta.symbol)) stable0Usd = 1;
  if (!stable1Usd && isSparkStableSymbol(token1Meta.symbol)) stable1Usd = 1;
  if (!stable0Usd && !stable1Usd) {
    return { applied: false, stableCandidate: false };
  }
  if (!raw.sqrtPriceX96) {
    return { applied: false, stableCandidate: true, reason: 'stable_pair_missing_slot0' };
  }

  const decimals0 = token0Meta.decimals;
  const decimals1 = token1Meta.decimals;
  if (typeof decimals0 !== 'number' || typeof decimals1 !== 'number') {
    return { applied: false, stableCandidate: true, reason: 'stable_pair_missing_decimals' };
  }

  const price01 = sqrtRatioToPrice(raw.sqrtPriceX96, decimals0, decimals1);
  if (!Number.isFinite(price01) || price01 <= 0) {
    return { applied: false, stableCandidate: true, reason: 'stable_pair_invalid_price' };
  }
  const price10 = 1 / price01;

  if (stable1Usd) {
    const price0Usd = price01 * stable1Usd;
    return {
      applied: true,
      stableCandidate: true,
      stableToken: 'token1',
      price01,
      price10,
      price0Usd,
      price1Usd: stable1Usd,
    };
  }
  if (stable0Usd) {
    const price1Usd = price10 * stable0Usd;
    return {
      applied: true,
      stableCandidate: true,
      stableToken: 'token0',
      price01,
      price10,
      price0Usd: stable0Usd,
      price1Usd,
    };
  }

  return { applied: false, stableCandidate: false };
}

function isSparkStableSymbol(symbol?: string): boolean {
  if (!symbol || typeof symbol !== 'string') return false;
  const normalised = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return normalised === 'USDT0' || normalised === 'USD0' || normalised === 'USDTE';
}

async function getTokenMetadata(address: `0x${string}`): Promise<{ symbol: string; decimals: number }> {
  const key = address.toLowerCase();
  const cached = tokenMetaCache.get(key);
  if (cached) return cached;

  try {
    const [symbol, decimals] = await Promise.all([
      publicClient
        .readContract({ address, abi: ERC20_ABI, functionName: 'symbol' })
        .catch(() => 'TKN'),
      publicClient
        .readContract({ address, abi: ERC20_ABI, functionName: 'decimals' })
        .catch(() => 18),
    ]);

    const meta = {
      symbol: typeof symbol === 'string' && symbol.length ? symbol : 'TKN',
      decimals: typeof decimals === 'number' ? decimals : Number(decimals),
    };
    tokenMetaCache.set(key, meta);
    return meta;
  } catch {
    const fallback = { symbol: 'TKN', decimals: 18 };
    tokenMetaCache.set(key, fallback);
    return fallback;
  }
}

async function getPoolIncentives(poolAddress: `0x${string}`): Promise<IncentiveInfo | null> {
  const key = poolAddress.toLowerCase();
  if (incentivesCache.has(key)) {
    return incentivesCache.get(key) ?? null;
  }

  try {
    const record = await prisma.poolIncentiveSnapshot.findUnique({
      where: { poolAddress: key },
    });

    if (!record) {
      incentivesCache.set(key, null);
      return null;
    }

    const tokens = Array.isArray(record.tokens)
      ? (record.tokens as Prisma.JsonArray).map((entry) => {
          const token = entry as Record<string, unknown>;
          const symbol = typeof token.symbol === 'string' ? token.symbol : '';
          const amountPerDay = typeof token.amountPerDay === 'string' || typeof token.amountPerDay === 'number'
            ? String(token.amountPerDay)
            : '0';
          return {
            symbol,
            amountPerDay,
            tokenAddress: typeof token.tokenAddress === 'string' ? token.tokenAddress : undefined,
            decimals: typeof token.decimals === 'number' ? token.decimals : undefined,
          };
        })
      : [];

    const usdPerDay = record.usdPerDay === null ? null : Number(record.usdPerDay);
    const info: IncentiveInfo = {
      usdPerDay: Number.isFinite(usdPerDay ?? NaN) ? usdPerDay : null,
      tokens: tokens.filter((token) => token.symbol.length > 0),
    };

    incentivesCache.set(key, info);
    return info;
  } catch (error) {
    console.warn('[api/positions] incentives lookup failed', error);
    incentivesCache.set(key, null);
    return null;
  }
}

function determineStatus(tick: number | null | undefined, tickLower: number, tickUpper: number, minPrice?: number, maxPrice?: number, currentPrice?: number): 'in' | 'near' | 'out' | 'unknown' {
  if (tick === null || tick === undefined) return 'unknown';
  
  // Use price-based calculation if available (more accurate for 3% threshold)
  if (typeof minPrice === 'number' && typeof maxPrice === 'number' && typeof currentPrice === 'number' && 
      Number.isFinite(minPrice) && Number.isFinite(maxPrice) && Number.isFinite(currentPrice) &&
      minPrice < maxPrice) {
    // First check: is price outside the range?
    if (currentPrice < minPrice || currentPrice > maxPrice) {
      return 'out';
    }
    
    // Price is within range, now check if it's within 3% of boundaries
    const width = maxPrice - minPrice;
    const threshold3Pct = width * 0.03;
    const nearLower = minPrice + threshold3Pct;
    const nearUpper = maxPrice - threshold3Pct;
    
    // If price is within 3% of either boundary, it's "near"
    if (currentPrice <= nearLower || currentPrice >= nearUpper) {
      return 'near';
    }
    
    // Price is comfortably within range (not near boundaries)
    return 'in';
  }
  
  // Fallback to tick-based calculation
  // First check: is tick outside the range?
  if (tick < tickLower || tick > tickUpper) {
    const width = Math.max(1, Math.abs(tickUpper - tickLower));
    const tolerance = Math.ceil(width * 0.03); // 3% tolerance
    // Check if within 3% tolerance outside range
    if (tick >= tickLower - tolerance && tick <= tickUpper + tolerance) {
      return 'near';
    }
    return 'out';
  }
  
  // Tick is within range, check if near boundaries
  const width = Math.max(1, Math.abs(tickUpper - tickLower));
  const tolerance = Math.ceil(width * 0.03);
  const nearLower = tickLower + tolerance;
  const nearUpper = tickUpper - tolerance;
  
  if (tick <= nearLower || tick >= nearUpper) {
    return 'near';
  }
  
  return 'in';
}

function buildClaim(
  raw: RawPosition,
  token0: { symbol: string; decimals: number },
  token1: { symbol: string; decimals: number },
  price0?: number,
  price1?: number
): PositionRow['claim'] {
  if (raw.tokensOwed0 === BigInt(0) && raw.tokensOwed1 === BigInt(0)) {
    return { usd: 0, tokens: [] };
  }

  const owed0 = formatTokenAmount(raw.tokensOwed0, token0.decimals);
  const owed1 = formatTokenAmount(raw.tokensOwed1, token1.decimals);
  const tokens: PositionClaimToken[] = [];

  if (raw.tokensOwed0 > BigInt(0)) {
    tokens.push({ symbol: token0.symbol, amount: owed0 });
  }
  if (raw.tokensOwed1 > BigInt(0)) {
    tokens.push({ symbol: token1.symbol, amount: owed1 });
  }

  const usd0 = price0 && Number.isFinite(price0) ? Number(owed0) * price0 : 0;
  const usd1 = price1 && Number.isFinite(price1) ? Number(owed1) * price1 : 0;
  const total = usd0 + usd1;

  return {
    usd: Number.isFinite(total) ? total : null,
    tokens: tokens.length ? tokens : undefined,
  };
}

function formatTokenAmount(amount: bigint, decimals: number): string {
  if (amount === BigInt(0)) return '0';
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) return whole.toString();
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole.toString()}.${fractionStr}`;
}

function sortAddresses(a: `0x${string}`, b: `0x${string}`): [`0x${string}`, `0x${string}`] {
  return a.toLowerCase() < b.toLowerCase() ? [a, b] : [b, a];
}

function normalizeWalletAddress(address: string): `0x${string}` {
  const normalized = address.toLowerCase();
  if (!ADDRESS_REGEX.test(normalized)) {
    throw new Error('Invalid address');
  }
  return normalized as `0x${string}`;
}

function coerceUsd(value: number | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return 0;
}

function buildPositionsSummary(positions: PositionRow[], role: ResolvedRole, flags: RoleFlags): CanonicalSummary {
  let tvlUsd = 0;
  let fees24hUsd = 0;
  let incentivesUsd = 0;
  let rewardsUsd = 0;
  let active = 0;
  let inactive = 0;
  let ended = 0;

  for (const position of positions) {
    tvlUsd += coerceUsd(position.tvlUsd);
    fees24hUsd += coerceUsd(position.fees24hUsd);
    const incentivesValue =
      position.incentivesUsd ??
      position.incentivesUsdPerDay ??
      (position.dailyIncentivesUsd ?? 0);
    incentivesUsd += coerceUsd(incentivesValue);
    rewardsUsd += coerceUsd(position.rewardsUsd);

    if (position.category === 'Active') active += 1;
    else if (position.category === 'Inactive') inactive += 1;
    else if (position.category === 'Ended') ended += 1;
  }

  const entitlements: PositionSummaryEntitlements = {
    role,
    source: 'session',
    flags,
  };

  return {
    tvlUsd,
    fees24hUsd,
    incentivesUsd,
    rewardsUsd,
    count: positions.length,
    active: active || undefined,
    inactive: inactive || undefined,
    ended: ended || undefined,
    entitlements,
  };
}

export async function fetchCanonicalPositionData(input: CanonicalPositionInput): Promise<CanonicalPositionResult> {
  const normalizedAddress = normalizeWalletAddress(input.address);
  const role = input.role ?? 'VISITOR';
  const flags = roleFlags(role);
  const { positions } = await buildPositions(normalizedAddress, role, flags);
  const summary = buildPositionsSummary(positions, role, flags);

  return {
    positions,
    summary,
    meta: {
      address: normalizedAddress,
      elapsedMs: 0,
    },
  };
}

export function buildRoleAwareData(
  data: PositionsDataPayload,
  role?: RoleResolution | ResolvedRole,
): PositionsDataPayload {
  const resolvedRole = typeof role === 'string' ? role : role?.role ?? 'VISITOR';
  if (resolvedRole === 'VISITOR' && data.positions.length > 25) {
    return {
      ...data,
      positions: data.positions.slice(0, 25),
      meta: data.meta,
    };
  }

  return data;
}
