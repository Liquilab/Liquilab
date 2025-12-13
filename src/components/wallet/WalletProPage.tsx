'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RefreshCcw, ExternalLink, ChevronDown, List, LayoutGrid } from 'lucide-react';

import WalletButton from '@/components/WalletButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getWalletPortfolioAnalytics, type WalletPortfolioAnalytics } from '@/lib/api/analytics';
import type { PositionRow } from '@/lib/positions/types';
import { formatUsd } from '@/utils/format';
import { RangeBandPositionBar } from './RangeBandPositionBar';
import { GOLDEN_WALLETS } from '@/config/goldenWallets';
import { TokenIcon } from '@/lib/icons/tokenIcon';

const numberFormatter = new Intl.NumberFormat('en-US');

const DEX_LABELS: Record<string, string> = {
  'sparkdex-v3': 'SparkDEX',
  'enosys-v3': 'Enosys',
};

const IS_DEV = process.env.NODE_ENV !== 'production';

type SortBy = 'health' | 'tvl' | 'apr' | 'fees';

function getDexLabel(value?: string | null) {
  if (!value) return 'Unknown DEX';
  return DEX_LABELS[value.toLowerCase()] ?? value;
}

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return formatUsd(value ?? 0);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(2)}%`;
}

function getApiTvlUsd(position: PositionRow): number | null {
  return typeof position.tvlUsd === 'number' && Number.isFinite(position.tvlUsd) ? position.tvlUsd : null;
}

function getDerivedTvlUsd(position: PositionRow): number | null {
  const total = position.amountsUsd?.total;
  return typeof total === 'number' && Number.isFinite(total) ? total : null;
}

function getApiUnclaimedFeesUsd(position: PositionRow): number | null {
  return typeof position.unclaimedFeesUsd === 'number' && Number.isFinite(position.unclaimedFeesUsd)
    ? position.unclaimedFeesUsd
    : null;
}

function getDerivedUnclaimedFeesUsd(position: PositionRow): number | null {
  const claimUsd = position.claim?.usd;
  return typeof claimUsd === 'number' && Number.isFinite(claimUsd) ? claimUsd : null;
}

function warnUsdMismatch(label: string, apiValue: number | null, derivedValue: number | null, positionKey?: string) {
  if (!IS_DEV) return;
  if (
    typeof apiValue === 'number' &&
    apiValue > 0 &&
    typeof derivedValue === 'number' &&
    derivedValue > 0
  ) {
    const ratio = apiValue > derivedValue ? apiValue / derivedValue : derivedValue / apiValue;
    if (ratio >= 5) {
      console.warn(
        `[WalletProPage] ${label} mismatch (${positionKey ?? 'unknown'}): api=${apiValue.toFixed(
          2
        )} derived=${derivedValue.toFixed(2)} ratio=${ratio.toFixed(2)}`
      );
    }
  }
}

function safePrecision(input: number | null | undefined, fallback: number = 6): number {
  let p = Number(input);
  if (!Number.isFinite(p)) {
    p = fallback;
  }
  p = Math.trunc(p);
  return Math.max(1, Math.min(100, p));
}

function formatTokenAmount(value: number | null | undefined, decimals: number = 4): string {
  if (value === null || value === undefined) {
    return '—';
  }
  const numValue = Number(value);
  if (!Number.isFinite(numValue)) {
    return '—';
  }
  if (numValue === 0) {
    return '0';
  }
  if (numValue >= 1) {
    const safeDecimals = safePrecision(decimals, 4);
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: safeDecimals,
    });
  }
  const safePrec = safePrecision(decimals, 6);
  return numValue.toPrecision(safePrec);
}

function getStrategyLabel(rangeMin: number | null, rangeMax: number | null, currentPrice: number | null): string {
  if (
    typeof rangeMin !== 'number' ||
    typeof rangeMax !== 'number' ||
    typeof currentPrice !== 'number' ||
    !Number.isFinite(rangeMin) ||
    !Number.isFinite(rangeMax) ||
    !Number.isFinite(currentPrice) ||
    rangeMin >= rangeMax
  ) {
    return 'Custom Strategy';
  }
  const range = rangeMax - rangeMin;
  const spreadPct = (range / currentPrice) * 100;
  if (spreadPct < 12) return `Aggressive (${spreadPct.toFixed(1)}%)`;
  if (spreadPct <= 35) return `Balanced (${spreadPct.toFixed(1)}%)`;
  return `Conservative (${spreadPct.toFixed(1)}%)`;
}

function resolvePoolKey(position: PositionRow, index: number) {
  return position.positionKey ?? position.tokenId ?? position.marketId ?? `${position.poolAddress ?? 'pool'}-${index}`;
}

function computeRealizedAPR(fees7dUsd: number | null, totalTvlUsd: number): number | null {
  if (
    typeof fees7dUsd !== 'number' ||
    !Number.isFinite(fees7dUsd) ||
    fees7dUsd <= 0 ||
    typeof totalTvlUsd !== 'number' ||
    !Number.isFinite(totalTvlUsd) ||
    totalTvlUsd <= 0
  ) {
    return null;
  }
  return (fees7dUsd / totalTvlUsd) * 52 * 100;
}

function computePositionAPR(position: PositionRow): number | null {
  // APR = (Uncollected Fees + Annualized Incentives) / TVL
  const uncollectedFees =
    typeof position.unclaimedFeesUsd === 'number' && Number.isFinite(position.unclaimedFeesUsd)
      ? position.unclaimedFeesUsd
      : typeof position.claim?.usd === 'number' && Number.isFinite(position.claim.usd)
        ? position.claim.usd
        : 0;
  
  // Incentives are per day, so annualize: incentivesPerDay * 365
  const incentivesPerDay =
    typeof position.incentivesUsdPerDay === 'number' && Number.isFinite(position.incentivesUsdPerDay)
      ? position.incentivesUsdPerDay
      : typeof position.incentivesUsd === 'number' && Number.isFinite(position.incentivesUsd)
        ? position.incentivesUsd / 365 // If it's total incentives, assume it's annual and convert to daily
        : 0;
  
  const annualizedIncentives = (incentivesPerDay || 0) * 365;
  
  const tvl = getApiTvlUsd(position);

  if (
    typeof tvl !== 'number' ||
    !Number.isFinite(tvl) ||
    tvl <= 0
  ) {
    return null;
  }

  const totalYield = (uncollectedFees || 0) + annualizedIncentives;
  if (totalYield <= 0) {
    return null;
  }

  // APR as percentage: (yield / tvl) * 100
  return (totalYield / tvl) * 100;
}

function sortPositions(positions: PositionRow[], sortBy: SortBy): PositionRow[] {
  const sorted = [...positions];
  switch (sortBy) {
    case 'health':
      sorted.sort((a, b) => {
        const statusOrder = { in: 0, near: 1, out: 2, unknown: 3 };
        return (statusOrder[a.status ?? 'unknown'] ?? 3) - (statusOrder[b.status ?? 'unknown'] ?? 3);
      });
      break;
    case 'tvl':
      sorted.sort((a, b) => {
        const tvlA = getApiTvlUsd(a) ?? 0;
        const tvlB = getApiTvlUsd(b) ?? 0;
        return tvlB - tvlA;
      });
      break;
    case 'apr':
      sorted.sort((a, b) => {
        const aprA = computePositionAPR(a) ?? 0;
        const aprB = computePositionAPR(b) ?? 0;
        return aprB - aprA;
      });
      break;
    case 'fees':
      sorted.sort((a, b) => {
        const feesA = getApiUnclaimedFeesUsd(a) ?? 0;
        const feesB = getApiUnclaimedFeesUsd(b) ?? 0;
        return feesB - feesA;
      });
      break;
  }
  return sorted;
}

function getPoolUniverseLink(position: PositionRow): string {
  if (position.poolAddress) {
    return `/pool/${position.poolAddress}`;
  }
  const pair = position.pair;
  if (pair?.symbol0 && pair?.symbol1) {
    const slug = `${pair.symbol0.toLowerCase()}-${pair.symbol1.toLowerCase()}`;
    return `/pool/${slug}`;
  }
  return '/pool';
}

export function WalletProPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<WalletPortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'positions' | 'analytics'>('positions');
  const [sortBy, setSortBy] = useState<SortBy>('tvl');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const queryWallet =
    router.isReady && typeof router.query.wallet === 'string'
      ? router.query.wallet
      : undefined;
  const effectiveAddress = queryWallet ?? address ?? '';
  const viewingOverride = Boolean(queryWallet);
  const viewingGoldenWallet = useMemo(() => {
    if (!queryWallet) return null;
    return GOLDEN_WALLETS.find((gw: { address: string; label: string }) => gw.address.toLowerCase() === queryWallet.toLowerCase()) ?? null;
  }, [queryWallet]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!effectiveAddress) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isCurrent = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/positions?address=${encodeURIComponent(effectiveAddress)}&debug=0`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        const payload = json?.data ?? json;
        const positions = Array.isArray(payload?.positions) ? payload.positions : [];
        const summary = payload?.summary;
        if (process.env.NODE_ENV !== 'production') {
          console.log('[WalletProPage] positions fetch', {
            url: res.url,
            status: res.status,
            keys: Object.keys(json ?? {}),
            hasData: Boolean(json?.data),
            positionsLength: positions.length,
          });
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch positions (${res.status})`);
        }
        return { positions, summary } as WalletPortfolioAnalytics;
      })
      .then((result) => {
        if (!isCurrent) return;
        console.log(`[WalletProPage] Positions loaded:`, {
          positionsCount: result.positions.length,
          summary: result.summary,
        });
        setData(result);
      })
      .catch((err) => {
        if (!isCurrent || err.name === 'AbortError') return;
        console.error(`[WalletProPage] Error loading positions:`, err);
        setError(err.message ?? 'Failed to load wallet positions');
        setData(null);
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [effectiveAddress, reloadKey]);

  const handleReload = useCallback(() => {
    if (!effectiveAddress) return;
    setReloadKey((key) => key + 1);
  }, [effectiveAddress]);

  const positions = data?.positions ?? [];
  const sortedPositions = useMemo(() => sortPositions(positions, sortBy), [positions, sortBy]);
  const hasPositions = positions.length > 0;

  useEffect(() => {
    console.log(`[WalletProPage] Render positions: count=${positions.length}`);
  }, [positions]);

  if (!mounted) {
    return null;
  }

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-white/95 mb-4 text-3xl font-brand">Portfolio Pro</h1>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors mr-4">
             ← Back to Standard View
           </Link>
           {effectiveAddress && (
              <button
                type="button"
                onClick={handleReload}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
                Refresh
              </button>
            )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 mb-8">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('positions')}
            className={cn(
              'relative px-6 py-4 transition-all duration-300',
              activeTab === 'positions' ? 'text-white/95' : 'text-white/[0.58] hover:text-white/95'
            )}
          >
            <span>My Positions</span>
            {activeTab === 'positions' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3B82F6] to-[#1BE8D2] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              'relative px-6 py-4 transition-all duration-300',
              activeTab === 'analytics' ? 'text-white/95' : 'text-white/[0.58] hover:text-white/95'
            )}
          >
            <div className="flex items-center gap-2">
              <span>Performance & Analytics</span>
              <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30 text-xs ml-1">
                Pro
              </Badge>
            </div>
            {activeTab === 'analytics' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3B82F6] to-[#1BE8D2] rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {!effectiveAddress ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-[#0F1A36]/50 p-12 text-center">
          <h2 className="mb-2 text-xl font-medium text-white">Connect wallet to view portfolio</h2>
          <p className="text-white/50 mb-6">Connect your wallet to see your positions and analytics.</p>
          <WalletButton className="mx-auto" />
        </div>
      ) : !hasPositions && !loading ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-[#0F1A36]/50 p-12 text-center">
          <h2 className="mb-2 text-xl font-medium text-white">No Active Positions</h2>
          <p className="text-white/50 mb-6">Initialize your portfolio by exploring the Pool Universe.</p>
          <Button 
            variant="ghost" 
            className="border border-[#3B82F6]/50 text-[#60A5FA] hover:bg-[#3B82F6]/10"
            onClick={() => router.push('/pool')}
          >
            Explore Pool Universe
            <ExternalLink className="ml-2 size-4" />
          </Button>
        </div>
      ) : (
        <>
          {activeTab === 'positions' && (
            <div>
              {/* Sort Control */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-white/70 text-sm">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="appearance-none w-[200px] bg-[#0F1A36]/95 border border-white/10 rounded-lg py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    >
                      <option value="health">Health Status</option>
                      <option value="tvl">TVL (High → Low)</option>
                      <option value="apr">APR (High → Low)</option>
                      <option value="fees">Unclaimed Fees</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
                  </div>
                </div>

                {/* List/Grid Toggle */}
                <div className="inline-flex items-center bg-[#0F1A36]/95 border border-white/10 rounded-lg p-1.5 gap-1 shadow-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'flex items-center gap-2.5 px-6 py-3 rounded-md transition-all',
                      viewMode === 'list'
                        ? 'bg-[#3B82F6] text-white shadow-md'
                        : 'text-white/70 hover:text-white/95 hover:bg-white/5'
                    )}
                  >
                    <List className="size-5" />
                    <span>List</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'flex items-center gap-2.5 px-6 py-3 rounded-md transition-all',
                      viewMode === 'grid'
                        ? 'bg-[#3B82F6] text-white shadow-md'
                        : 'text-white/70 hover:text-white/95 hover:bg-white/5'
                    )}
                  >
                    <LayoutGrid className="size-5" />
                    <span>Grid</span>
                  </button>
                </div>
              </div>

              {/* Positions View */}
              {viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading && positions.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-[#0F1A36]/95 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-6">
                          <Skeleton className="h-6 w-3/4 bg-white/5 mb-4" />
                          <Skeleton className="h-4 w-1/2 bg-white/5 mb-6" />
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <Skeleton className="h-16 bg-white/5" />
                            <Skeleton className="h-16 bg-white/5" />
                            <Skeleton className="h-16 bg-white/5" />
                            <Skeleton className="h-16 bg-white/5" />
                          </div>
                          <Skeleton className="h-32 bg-white/5" />
                        </div>
                      </div>
                    ))
                  ) : (
                    sortedPositions.map((position, idx) => {
                      const poolLabel = `${position.pair?.symbol0 ?? position.token0?.symbol ?? 'Token0'} / ${position.pair?.symbol1 ?? position.token1?.symbol ?? 'Token1'}`;
                      const feePct = (position.pair?.feeBps ?? position.poolFeeBps ?? 0) / 1000000;
                      const feeDisplay = feePct > 0 ? `${(feePct * 100).toFixed(2)}%` : '—';
                      const tvl = getApiTvlUsd(position);
                      const derivedTvl = getDerivedTvlUsd(position);
                      warnUsdMismatch('TVL', tvl, derivedTvl, position.positionKey ?? String(position.tokenId));
                      const unclaimedFees = getApiUnclaimedFeesUsd(position);
                      const derivedFees = getDerivedUnclaimedFeesUsd(position);
                      warnUsdMismatch(
                        'Unclaimed fees',
                        unclaimedFees,
                        derivedFees,
                        position.positionKey ?? String(position.tokenId)
                      );
                      const incentives =
                        typeof position.incentivesUsd === 'number' && Number.isFinite(position.incentivesUsd)
                          ? position.incentivesUsd
                          : null;
                      const positionAPR = computePositionAPR(position);
                    const minPrice = (position as any).minPrice ?? position.rangeMin ?? null;
                    const maxPrice = (position as any).maxPrice ?? position.rangeMax ?? null;
                    const currentPrice = (position as any).currentPrice ?? null;
                      const universeLink = getPoolUniverseLink(position);

                      return (
                        <div key={resolvePoolKey(position, idx)} className="bg-[#0F1A36]/95 rounded-xl border border-white/10 hover:border-[#3B82F6]/50 transition-all cursor-pointer overflow-hidden">
                          {/* Pool header */}
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex -space-x-2">
                                <TokenIcon
                                  symbol={position.pair?.symbol0 ?? position.token0?.symbol}
                                  address={position.token0?.address}
                                  size={32}
                                  className="ring-2 ring-[#0B1221]"
                                />
                                <TokenIcon
                                  symbol={position.pair?.symbol1 ?? position.token1?.symbol}
                                  address={position.token1?.address}
                                  size={32}
                                  className="ring-2 ring-[#0B1221]"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="text-white text-sm">
                                  {poolLabel}
                                </p>
                                <p className="text-white/40 text-xs">
                                  {getDexLabel(position.dex)} • #{position.tokenId} • {feeDisplay}
                                </p>
                              </div>
                            </div>

                            {/* Pool details - 2 column grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
                              {/* Column 1: TVL */}
                              <div className="flex flex-col gap-1">
                                <p className="text-white/50 text-xs">TVL</p>
                                <p className="text-white tabular-nums">{formatCurrency(tvl)}</p>
                                {(position as any).amount0 != null && (position as any).amount1 != null && (
                                  <>
                                    <p className="text-white/40 text-xs tabular-nums">
                                      {formatTokenAmount((position as any).amount0, 4)} {position.pair?.symbol0}
                                    </p>
                                    <p className="text-white/40 text-xs tabular-nums">
                                      {formatTokenAmount((position as any).amount1, 4)} {position.pair?.symbol1}
                                    </p>
                                  </>
                                )}
                              </div>

                              {/* Column 2: Incentives */}
                              <div className="flex flex-col gap-1">
                                <p className="text-white/50 text-xs">Incentives</p>
                                <p className="text-white tabular-nums">{formatCurrency(incentives)}</p>
                                {position.incentivesTokens && position.incentivesTokens.length > 0 && (
                                  <p className="text-white/40 text-xs tabular-nums">
                                    {formatTokenAmount(Number(position.incentivesTokens[0].amountPerDay) * 7, 0)} {position.incentivesTokens[0].symbol}
                                  </p>
                                )}
                              </div>

                              {/* Column 1: Unclaimed fees */}
                              <div className="flex flex-col gap-1">
                                <p className="text-white/50 text-xs">Unclaimed fees</p>
                                <p className="text-white tabular-nums">{formatCurrency(unclaimedFees)}</p>
                                {(position as any).fee0 != null && (position as any).fee1 != null && (
                                  <>
                                    <p className="text-white/40 text-xs tabular-nums">
                                      {formatTokenAmount((position as any).fee0, 4)} {position.pair?.symbol0}
                                    </p>
                                    <p className="text-white/40 text-xs tabular-nums">
                                      {formatTokenAmount((position as any).fee1, 4)} {position.pair?.symbol1}
                                    </p>
                                  </>
                                )}
                              </div>

                              {/* Column 2: APR */}
                              <div className="flex flex-col gap-1">
                                <p className="text-white/50 text-xs">APR</p>
                                <p className="text-[#10B981] tabular-nums">{formatPercent(positionAPR)}</p>
                              </div>
                            </div>

                            {/* Rangeband section */}
                            <div className="pt-6 pb-2">
                              <RangeBandPositionBar
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                currentPrice={currentPrice}
                                status={position.status}
                                pairLabel={poolLabel}
                                strategyLabel={getStrategyLabel(minPrice, maxPrice, currentPrice)}
                              />
                            </div>
                          </div>

                          {/* Universe Link */}
                          <div className="px-6 pb-5 pt-2 border-t border-white/5">
                            <Link href={universeLink} className="inline-flex items-center gap-2 text-[#1BE8D2] hover:underline text-sm">
                              View Pool Universe →
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* List View */
              <div className="bg-[#0F1A36]/95 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-white/[0.03]">
                  <div className="font-light text-white/40 text-sm">Pool specifications</div>
                  <div className="font-light text-white/40 text-sm">TVL</div>
                  <div className="font-light text-white/40 text-sm">Unclaimed fees</div>
                  <div className="font-light text-white/40 text-sm">Incentives</div>
                  <div className="font-light text-white/40 text-sm">APR</div>
                </div>

                {/* Table Rows */}
                {loading && positions.length === 0 ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-[#0F1A36]/95 border-b border-white/[0.03] last:border-0 overflow-hidden">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-5">
                        <Skeleton className="h-6 w-3/4 bg-white/5" />
                        <Skeleton className="h-6 w-1/2 bg-white/5" />
                        <Skeleton className="h-6 w-1/2 bg-white/5" />
                        <Skeleton className="h-6 w-1/2 bg-white/5" />
                        <Skeleton className="h-6 w-1/2 bg-white/5" />
                      </div>
                    </div>
                  ))
                ) : (
                  sortedPositions.map((position, idx) => {
                     const poolLabel = `${position.pair?.symbol0 ?? position.token0?.symbol ?? 'Token0'} / ${position.pair?.symbol1 ?? position.token1?.symbol ?? 'Token1'}`;
                     const feePct = (position.pair?.feeBps ?? position.poolFeeBps ?? 0) / 1000000;
                     const feeDisplay = feePct > 0 ? `${(feePct * 100).toFixed(2)}%` : '—';
                     const tvl = getApiTvlUsd(position);
                     const unclaimedFees = getApiUnclaimedFeesUsd(position);
                     const incentives =
                       typeof position.incentivesUsd === 'number' && Number.isFinite(position.incentivesUsd)
                         ? position.incentivesUsd
                         : null;
                     const positionAPR = computePositionAPR(position);
                     const minPrice = position.rangeMin ?? null;
                     const maxPrice = position.rangeMax ?? null;
                     const currentPrice = position.currentPrice ?? null;
                     const universeLink = getPoolUniverseLink(position);

                    return (
                      <div key={resolvePoolKey(position, idx)} className="bg-[#0F1A36]/95 border-b border-white/[0.03] last:border-0 overflow-hidden">
                        {/* KPI Row */}
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 pt-5 pb-5">
                          {/* Pool specifications */}
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              <TokenIcon
                                symbol={position.pair?.symbol0 ?? position.token0?.symbol}
                                address={position.token0?.address}
                                size={32}
                                className="ring-2 ring-[#0B1221]"
                              />
                              <TokenIcon
                                symbol={position.pair?.symbol1 ?? position.token1?.symbol}
                                address={position.token1?.address}
                                size={32}
                                className="ring-2 ring-[#0B1221]"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-white">{poolLabel}</p>
                              <p className="text-white/40 text-sm">
                                {getDexLabel(position.dex)} • #{position.tokenId} • {feeDisplay}
                              </p>
                            </div>
                          </div>

                          {/* TVL */}
                          <div className="flex flex-col gap-1">
                            <p className="text-white tabular-nums">{formatCurrency(tvl)}</p>
                            {(position as any).amount0 != null && (position as any).amount1 != null && (
                              <div className="text-white/40 text-xs tabular-nums">
                                <p className="mb-0">{formatTokenAmount((position as any).amount0, 4)} {position.pair?.symbol0}</p>
                                <p>{formatTokenAmount((position as any).amount1, 4)} {position.pair?.symbol1}</p>
                              </div>
                            )}
                          </div>

                          {/* Unclaimed fees */}
                          <div className="flex flex-col gap-1">
                            <p className="text-white tabular-nums">{formatCurrency(unclaimedFees)}</p>
                            {(position as any).fee0 != null && (position as any).fee1 != null && (
                              <div className="text-white/40 text-xs tabular-nums">
                                <p className="mb-0">{formatTokenAmount((position as any).fee0, 4)} {position.pair?.symbol0}</p>
                                <p>{formatTokenAmount((position as any).fee1, 4)} {position.pair?.symbol1}</p>
                              </div>
                            )}
                          </div>

                          {/* Incentives */}
                          <div className="flex flex-col gap-1">
                            <p className="text-white tabular-nums">{formatCurrency(incentives)}</p>
                            {position.incentivesTokens && position.incentivesTokens.length > 0 && (
                              <div className="text-white/40 text-xs tabular-nums">
                                {position.incentivesTokens.slice(0, 1).map((token, i) => {
                                  const amount7d = Number(token.amountPerDay) * 7;
                                  return (
                                    <p key={i} className={i === 0 ? 'mb-0' : ''}>
                                      {formatTokenAmount(amount7d, 0)} {token.symbol}
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* APR */}
                          <div className="flex flex-col gap-1">
                            <p className="text-[#10B981] tabular-nums">{formatPercent(positionAPR)}</p>
                          </div>
                        </div>

                        {/* RangeBand Row */}
                        <div className="px-6 pb-7">
                          <RangeBandPositionBar
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            currentPrice={currentPrice}
                            status={position.status}
                            pairLabel={poolLabel}
                            strategyLabel={getStrategyLabel(minPrice, maxPrice, currentPrice)}
                          />
                        </div>

                        {/* Universe Link */}
                        <div className="px-6 pb-5 pt-2 border-t border-white/5">
                          <Link href={universeLink} className="inline-flex items-center gap-2 text-[#1BE8D2] hover:underline text-sm">
                            View Pool Universe →
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="mb-8">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-white/95">Portfolio Performance & Analytics</h2>
                      <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30 text-xs">
                        Pro
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white/70 text-sm">
                        Premium view · Aggregated performance across all your LP positions.
                      </p>
                      <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-xs">
                        Data status: Live
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0F1A36]/95 p-12 text-center">
                <h3 className="mb-2 text-lg font-medium text-white">Performance Analytics</h3>
                <p className="text-white/50">Detailed performance charts coming soon.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Golden Wallets / Context Sidebar would go here if layout allowed side-by-side */}
    </main>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
