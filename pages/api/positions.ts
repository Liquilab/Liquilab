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
import { getPrices } from '@/lib/pricing/prices';
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

  const wallet = typeof req.query.wallet === 'string' ? req.query.wallet.toLowerCase() : '';
  if (!ADDRESS_REGEX.test(wallet)) {
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
  try {
    const positions = await buildPositions(wallet, resolution.role, flags);
    const payload: PositionsResponse = {
      success: true,
      data: {
        positions,
        meta: {
          address: wallet,
          elapsedMs: Date.now() - started,
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

async function buildPositions(wallet: string, role: 'VISITOR' | 'PREMIUM' | 'PRO', flags: { premium: boolean; analytics: boolean }): Promise<PositionRow[]> {
  if (!nfpmConfigs.length) return [];

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

  if (!rawPositions.length) return [];

  const priceAddresses = Array.from(
    rawPositions.reduce((set, pos) => {
      set.add(pos.token0.toLowerCase());
      set.add(pos.token1.toLowerCase());
      return set;
    }, new Set<string>())
  );

  const priceMap = await getPrices(priceAddresses);
  console.log(`[api/positions] Mapping raw positions: count=${rawPositions.length}`);
  const positions = await Promise.all(
    rawPositions.map(async (raw) =>
      mapRawPosition(raw, role, flags, priceMap, perDexCounters[raw.dex]!)
    )
  );
  const mapped = positions.filter(Boolean) as PositionRow[];
  console.log(`[api/positions] Mapped positions: count=${mapped.length} (raw=${rawPositions.length})`);
  Object.entries(perDexCounters).forEach(([dex, counters]) => {
    console.log(
      `[api/positions] ${dex} mapped=${counters.mapped} partial=${counters.partial} failed=${counters.failed} fees_ok=${counters.feesOk} fees_failed=${counters.feesFailed} incentives_ok=${counters.incentivesOk} incentives_null=${counters.incentivesNull} incentives_failed=${counters.incentivesFailed} range_ok=${counters.rangeOk} range_unavailable=${counters.rangeUnavailable} range_fixed=${counters.rangeFixed}`
    );
  });
  return mapped;
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

async function mapRawPosition(
  raw: RawPosition,
  role: 'VISITOR' | 'PREMIUM' | 'PRO',
  flags: { premium: boolean; analytics: boolean },
  priceMap: Record<string, number>,
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
  }
): Promise<PositionRow | null> {
  try {
    const [token0Meta, token1Meta] = await Promise.all([
      getTokenMetadata(raw.token0),
      getTokenMetadata(raw.token1),
    ]);

    const incentives = await getPoolIncentives(raw.poolAddress);
    const price0 = priceMap[raw.token0.toLowerCase()];
    const price1 = priceMap[raw.token1.toLowerCase()];
    const claim = buildClaim(raw, token0Meta, token1Meta, price0, price1);
    const warnings: string[] = [];

    // Range calculations (best-effort)
    let rangeMin: number | undefined;
    let rangeMax: number | undefined;
    let currentPrice: number | undefined;
    try {
      const range = computePriceRange(raw.tickLower, raw.tickUpper, token0Meta.decimals, token1Meta.decimals);
      rangeMin = range.lowerPrice ?? undefined;
      rangeMax = range.upperPrice ?? undefined;
      if (raw.tick !== null && raw.tick !== undefined) {
        currentPrice = tickToPrice(raw.tick, token0Meta.decimals, token1Meta.decimals);
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
    } catch (err) {
      console.warn(`[api/positions] Range computation failed for tokenId=${raw.tokenId}:`, err);
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
      status: determineStatus(raw.tick, raw.tickLower, raw.tickUpper),
      claim: claim,
      entitlements: {
        role,
        flags,
      },
      rangeMin,
      rangeMax,
      currentPrice,
      tvlUsd: undefined,
      unclaimedFeesUsd: undefined,
      enrichmentStatus: 'partial',
      warnings,
    };

    // TVL calculations (best-effort)
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
        const tvlUsd =
          (price0 && Number.isFinite(price0) ? price0 * amount0 : 0) +
          (price1 && Number.isFinite(price1) ? price1 * amount1 : 0);
        row.amountsUsd = {
          total: Number.isFinite(tvlUsd) ? tvlUsd : null,
          token0: Number.isFinite(price0) ? price0 * amount0 : null,
          token1: Number.isFinite(price1) ? price1 * amount1 : null,
        };
        row.tvlUsd = Number.isFinite(tvlUsd) ? tvlUsd : undefined;
        if (!Number.isFinite(price0)) warnings.push('price_missing_token0');
        if (!Number.isFinite(price1)) warnings.push('price_missing_token1');
      }
    } catch (err) {
      console.warn(`[api/positions] TVL computation failed for tokenId=${raw.tokenId}:`, err);
    }

    // Fees (unclaimed) calculations
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
        const usd0 = price0 && Number.isFinite(price0) ? fee0 * price0 : null;
        const usd1 = price1 && Number.isFinite(price1) ? fee1 * price1 : null;
        const totalFees = (usd0 ?? 0) + (usd1 ?? 0);
        const hasUsd = usd0 !== null && usd0 !== undefined || usd1 !== null && usd1 !== undefined;
        row.unclaimedFeesUsd =
          hasUsd && Number.isFinite(totalFees) ? totalFees : undefined;
        if (row.unclaimedFeesUsd === undefined) {
          warnings.push('fees_unpriced');
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
      row.rangeMin = undefined;
      row.rangeMax = undefined;
      row.currentPrice = undefined;
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
      warnings.push('Range data unavailable');
      counters.rangeUnavailable += 1;
    } else {
      row.enrichmentStatus = 'ok';
      counters.rangeOk += 1;
    }

    if (row.unclaimedFeesUsd !== undefined && row.unclaimedFeesUsd !== null && Number.isFinite(row.unclaimedFeesUsd)) {
      // already captured in feesOk counter above
    }

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

function determineStatus(tick: number | null | undefined, tickLower: number, tickUpper: number): 'in' | 'near' | 'out' | 'unknown' {
  if (tick === null || tick === undefined) return 'unknown';
  if (tickLower <= tick && tick <= tickUpper) return 'in';
  const width = Math.max(1, Math.abs(tickUpper - tickLower));
  const tolerance = Math.ceil(width * 0.05);
  if (tick >= tickLower - tolerance && tick <= tickUpper + tolerance) return 'near';
  return 'out';
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
  const positions = await buildPositions(normalizedAddress, role, flags);
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
