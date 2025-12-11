'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { Copy, RefreshCcw } from 'lucide-react';

import WalletButton from '@/components/WalletButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/components/ui/utils';
import { getWalletPortfolioAnalytics, type WalletPortfolioAnalytics } from '@/lib/api/analytics';
import type { PositionRow } from '@/lib/positions/types';
import { formatUsd } from '@/utils/format';

const numberFormatter = new Intl.NumberFormat('en-US');

const DEX_LABELS: Record<string, string> = {
  'sparkdex-v3': 'SparkDEX',
  'enosys-v3': 'Enosys',
};

const RANGE_STATUS: Record<NonNullable<PositionRow['status']> | 'fallback', { label: string; className: string }> = {
  in: {
    label: 'In range',
    className: 'border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#86efac]',
  },
  near: {
    label: 'Near band',
    className: 'border border-[#f97316]/40 bg-[#f97316]/10 text-[#fdba74]',
  },
  out: {
    label: 'Out of range',
    className: 'border border-[#f43f5e]/40 bg-[#f43f5e]/10 text-[#fda4af]',
  },
  unknown: {
    label: 'Status unavailable',
    className: 'border border-white/20 text-white/70',
  },
  fallback: {
    label: 'Status unavailable',
    className: 'border border-white/20 text-white/70',
  },
};

function shortenAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getDexLabel(value?: string | null) {
  if (!value) return 'Unknown DEX';
  return DEX_LABELS[value.toLowerCase()] ?? value;
}

function formatCount(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return numberFormatter.format(value);
}

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return formatUsd(value ?? 0);
}

function extractFees(position: PositionRow) {
  const maybe7d = (position as PositionRow & { fees7dUsd?: number | null }).fees7dUsd;
  if (typeof maybe7d === 'number' && Number.isFinite(maybe7d)) {
    return { label: 'Fees (7D)', value: maybe7d } as const;
  }

  const lifetime =
    (typeof position.rewardsUsd === 'number' ? position.rewardsUsd : null) ??
    (typeof position.claim?.usd === 'number' ? position.claim?.usd ?? null : null) ??
    (typeof position.unclaimedFeesUsd === 'number' ? position.unclaimedFeesUsd : null);

  return { label: 'Lifetime fees', value: lifetime } as const;
}

function resolvePoolKey(position: PositionRow, index: number) {
  return position.tokenId ?? position.marketId ?? `${position.poolAddress ?? 'pool'}-${index}`;
}

export function WalletProPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<WalletPortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const queryWallet = router.isReady && typeof router.query.wallet === 'string' ? router.query.wallet : undefined;
  const effectiveAddress = queryWallet ?? address ?? '';
  const viewingOverride = Boolean(queryWallet);

  useEffect(() => setMounted(true), []);

  useEffect(() => () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
  }, []);

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

    getWalletPortfolioAnalytics(effectiveAddress, { signal: controller.signal })
      .then((result) => {
        if (!isCurrent) return;
        setData(result);
      })
      .catch((err) => {
        if (!isCurrent || err.name === 'AbortError') return;
        setError(err.message ?? 'Failed to load wallet portfolio');
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

  const handleCopy = useCallback(() => {
    if (!effectiveAddress || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(effectiveAddress)
      .then(() => {
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => undefined);
  }, [effectiveAddress]);

  const positions = data?.positions ?? [];
  const summary = data?.summary;
  const hasPositions = positions.length > 0;

  const summaryCards = useMemo(() => {
    return [
      {
        key: 'tvl',
        label: 'Total TVL',
        value: formatCurrency(summary?.totalTvlUsd ?? null),
        subline: 'Across connected wallet',
      },
      {
        key: 'positions',
        label: 'Active positions',
        value: formatCount(summary?.activePositions ?? null),
        subline: `${formatCount(summary?.positionsCount ?? null)} total`,
      },
      {
        key: 'pools',
        label: 'Pools',
        value: formatCount(summary?.poolsCount ?? null),
        subline: 'Unique LP pools',
      },
      {
        key: 'fees',
        label: summary?.fees7dUsd !== null ? 'Fees (7D)' : 'Lifetime fees',
        value: formatCurrency((summary?.fees7dUsd ?? summary?.lifetimeFeesUsd) ?? null),
        subline: summary?.fees7dUsd !== null ? 'Trailing seven days' : 'All-time realized',
      },
    ];
  }, [summary]);

  if (!mounted) {
    return null;
  }

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-3xl border border-white/10 bg-[#0F1A36]/80 px-6 py-8 shadow-2xl shadow-black/20 sm:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Portfolio Pro</p>
            <h1 className="font-brand text-3xl text-white">Your Liquidity Portfolio</h1>
            {effectiveAddress ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span className="font-mono text-base text-white">{shortenAddress(effectiveAddress)}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 transition hover:border-white/50 hover:text-white"
                >
                  <Copy className="size-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
                {viewingOverride && (
                  <Badge variant="outline" className="border-[#3B82F6]/40 text-[#60A5FA]">
                    URL wallet preview
                  </Badge>
                )}
                {!viewingOverride && (
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    {isConnected ? 'Connected' : 'Read-only'}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-white/60">Connect a wallet or pass ?wallet=0x... to preview the Pro experience.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {effectiveAddress && (
              <button
                type="button"
                onClick={handleReload}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
              >
                <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
                Refresh
              </button>
            )}
            {!isConnected && !viewingOverride && <WalletButton className="h-11 rounded-2xl border border-[#3B82F6]/50 bg-[#3B82F6]/10 px-5 text-sm font-semibold text-white hover:bg-[#3B82F6]/20" />}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.key}
              className="rounded-2xl border border-white/10 bg-[#0B1530]/80 p-5"
            >
              <p className="text-xs uppercase tracking-wide text-white/50">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
              <p className="text-xs text-white/50">{card.subline}</p>
            </div>
          ))}
        </div>
      </section>

      {!effectiveAddress ? (
        <section className="rounded-3xl border border-dashed border-white/20 bg-[#0F1A36]/50 px-6 py-12 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="font-brand text-2xl text-white">Connect your wallet to unlock Portfolio Pro</h2>
            <p className="text-sm text-white/70">
              Wallet-level TVL, RangeBand status, and fee capture analytics appear here as soon as you connect a wallet with active LP positions.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <WalletButton className="w-full justify-center rounded-2xl bg-[#3B82F6] px-6 py-3 text-base font-semibold text-white hover:bg-[#60A5FA] sm:w-auto" />
              <p className="text-xs text-white/60">
                Tip: add <code className="font-mono">?wallet=0x57d2...5951</code> to the URL to preview the Pro wallet.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-[#0B1530]/70">
          <div className="flex flex-col gap-2 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-brand text-2xl text-white">Positions overview</h2>
              <p className="text-sm text-white/60">
                {hasPositions
                  ? `${positions.length} position${positions.length === 1 ? '' : 's'} · ${formatCount(summary?.poolsCount ?? null)} pools`
                  : 'No active liquidity detected'}
              </p>
            </div>
            {error && (
              <div className="flex flex-col items-start gap-2 text-sm text-red-300 sm:items-end">
                <span>{error}</span>
                <Button variant="ghost" className="border border-red-400 text-red-200" onClick={handleReload}>
                  Retry
                </Button>
              </div>
            )}
          </div>
          <div className="px-3 py-4 sm:px-6">
            {loading && !hasPositions ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="mt-3 h-4 w-1/3 bg-white/5" />
                  </div>
                ))}
              </div>
            ) : hasPositions ? (
              <Table className="text-sm text-white/80">
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">Pool</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">TVL (USD)</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">Fees</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">RangeBand status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position, index) => {
                    const poolLabel = `${position.pair?.symbol0 ?? position.token0?.symbol ?? 'Token0'} / ${position.pair?.symbol1 ?? position.token1?.symbol ?? 'Token1'}`;
                    const feePct = (position.pair?.feeBps ?? position.poolFeeBps ?? 0) / 10000;
                    const fees = extractFees(position);
                    const tvl = typeof position.tvlUsd === 'number' ? position.tvlUsd : position.amountsUsd?.total ?? null;
                    const range = RANGE_STATUS[position.status ?? 'fallback'];

                    return (
                      <TableRow key={resolvePoolKey(position, index)} className="border-white/5">
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-3 text-white">
                              <span className="text-base font-semibold">{poolLabel}</span>
                              <Badge variant="outline" className="border-white/15 text-xs text-white/70">
                                {getDexLabel(position.dex)}
                              </Badge>
                            </div>
                            <p className="text-xs text-white/50">
                              {feePct > 0 ? `${(feePct * 100).toFixed(2)}% fee` : 'Fee tier unknown'} · Token #{position.tokenId ?? '—'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-base font-semibold text-white">{formatCurrency(tvl)}</p>
                          <p className="text-xs text-white/50">Current position value</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-base font-semibold text-white">{formatCurrency(fees.value)}</p>
                          <p className="text-xs text-white/50">{fees.label}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('rounded-full px-3 py-1 text-xs font-semibold', range.className)}>{range.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center text-sm text-white/70">
                No active LP positions detected for this wallet.
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
export default WalletProPage;

