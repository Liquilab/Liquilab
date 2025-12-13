'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCcw } from 'lucide-react';

import { DataSourceDisclaimer } from '@/components/DataSourceDisclaimer';
import { cn } from '@/lib/utils';
import { iconCandidates } from '@/lib/icons/symbolMap';
import { TOKEN_ASSETS } from '@/lib/assets';
import { fetchPool, type AnalyticsPoolResponse } from '@/lib/api/analytics';

export interface PoolUniversePageProps {
  poolAddress: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatUsd(value: number | null | undefined, compact = false): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value === 0) return '$0';
  if (compact) {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${value.toFixed(2)}%`;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-US');
}

// ============================================================================
// TOKEN PAIR ICON
// ============================================================================

function TokenPairIcon({ token0Symbol, token1Symbol, size = 32 }: { token0Symbol: string | null; token1Symbol: string | null; size?: number }) {
  const [token0Index, setToken0Index] = useState(0);
  const [token1Index, setToken1Index] = useState(0);

  if (!token0Symbol || !token1Symbol) return null;

  const token0Candidates = iconCandidates(token0Symbol);
  const token1Candidates = iconCandidates(token1Symbol);

  return (
    <div className="flex items-center -space-x-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src={token0Candidates[token0Index] || TOKEN_ASSETS.default}
          alt={token0Symbol}
          width={size}
          height={size}
          className="rounded-full border-2 border-[#0B1530] object-contain bg-[#0B1530]"
          onError={() => setToken0Index(i => Math.min(i + 1, token0Candidates.length - 1))}
          unoptimized
        />
      </div>
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src={token1Candidates[token1Index] || TOKEN_ASSETS.default}
          alt={token1Symbol}
          width={size}
          height={size}
          className="rounded-full border-2 border-[#0B1530] object-contain bg-[#0B1530]"
          onError={() => setToken1Index(i => Math.min(i + 1, token1Candidates.length - 1))}
          unoptimized
        />
      </div>
    </div>
  );
}

// ============================================================================
// SECTION CARD (consistent with wallet cards)
// ============================================================================

function SectionCard({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-[#0F1A36]/95 border border-white/10 overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-white/[0.03]">
          <h3 className="text-white/95 font-medium">{title}</h3>
          {subtitle && <p className="text-xs text-white/[0.58] mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// DEX BREAKDOWN TABLE (wallet-style)
// ============================================================================

type PoolSegment = {
  dex?: string | null;
  feeTierBps?: number | null;
  tvlUsd?: number | null;
  fees7dUsd?: number | null;
  positionsCount?: number | null;
};

function DexBreakdownSection({ segments }: { segments: PoolSegment[] }) {
  const dexData = useMemo(() => {
    const grouped: Record<string, { tvl: number; fees7d: number; positions: number; feeTier: string }> = {};
    for (const seg of segments) {
      const dex = String(seg.dex || 'Other').toLowerCase().includes('sparkdex') ? 'SparkDEX' : 
                  String(seg.dex || 'Other').toLowerCase().includes('enosys') ? 'Enosys' : 'Other';
      const bps = seg.feeTierBps ?? 0;
      const tierLabel = bps > 0 ? `${(bps / 100).toFixed(2)}%` : 'Dynamic';
      const key = `${dex}-${tierLabel}`;
      if (!grouped[key]) grouped[key] = { tvl: 0, fees7d: 0, positions: 0, feeTier: tierLabel };
      grouped[key].tvl += seg.tvlUsd ?? 0;
      grouped[key].fees7d += seg.fees7dUsd ?? 0;
      grouped[key].positions += seg.positionsCount ?? 0;
    }
    return Object.entries(grouped).map(([key, data]) => ({ 
      dex: key.split('-')[0], 
      ...data 
    })).sort((a, b) => b.tvl - a.tvl);
  }, [segments]);

  if (dexData.length === 0) {
    return (
      <SectionCard title="Liquidity Venues">
        <div className="py-8 text-center text-white/[0.58] text-sm">
          Data warming up...
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Liquidity Venues" subtitle="Active pools by DEX and fee tier">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-0 py-3 text-xs font-medium uppercase tracking-wide text-white/[0.58] border-b border-white/[0.03]">
        <div>Pool</div>
        <div className="text-right">TVL</div>
        <div className="text-right">Fees (7D)</div>
        <div className="text-right">APR</div>
        <div className="text-right">Positions</div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-white/[0.03]">
        {dexData.map((row, idx) => {
          const apr = row.tvl > 0 ? (row.fees7d * 52 / row.tvl) * 100 : 0;
          return (
            <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 py-4 items-center">
              <div className="flex items-center gap-3">
                <span className="text-white/95 font-medium">{row.dex}</span>
                <span className="text-xs text-white/[0.58] bg-white/5 px-2 py-0.5 rounded">{row.feeTier}</span>
              </div>
              <div className="text-right text-white/95 tabular-nums">{formatUsd(row.tvl, true)}</div>
              <div className="text-right text-white/70 tabular-nums">{formatUsd(row.fees7d, true)}</div>
              <div className={cn("text-right tabular-nums", apr > 0 ? "text-[#10B981]" : "text-white/70")}>
                {formatPct(apr)}
              </div>
              <div className="text-right text-white/70 tabular-nums">{formatNumber(row.positions)}</div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ============================================================================
// LP POPULATION SECTION
// ============================================================================

function LpPopulationSection({ positionsCount, walletsCount }: { positionsCount: number | null; walletsCount: number | null }) {
  const avgPositionsPerWallet = positionsCount && walletsCount && walletsCount > 0 
    ? (positionsCount / walletsCount).toFixed(1) 
    : '—';

  return (
    <SectionCard title="LP Population">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Active Positions</div>
          <div className="text-2xl font-bold tabular-nums text-white/95">{formatNumber(positionsCount)}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Unique Wallets</div>
          <div className="text-2xl font-bold tabular-nums text-white/95">{formatNumber(walletsCount)}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Avg Positions/Wallet</div>
          <div className="text-2xl font-bold tabular-nums text-white/95">{avgPositionsPerWallet}</div>
        </div>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// YIELD SECTION
// ============================================================================

function YieldSection({ tvlUsd, fees7dUsd, fees24hUsd, timeRange }: { 
  tvlUsd: number | null; 
  fees7dUsd: number | null; 
  fees24hUsd: number | null;
  timeRange: '24h' | '7d' | '30d';
}) {
  const is24h = timeRange === '24h';
  const feesWindow = is24h ? fees24hUsd : fees7dUsd;
  const annualizationFactor = is24h ? 365 : 52;
  const apr = tvlUsd && tvlUsd > 0 && feesWindow ? (feesWindow * annualizationFactor / tvlUsd) * 100 : null;
  const feePerK = tvlUsd && tvlUsd > 0 && fees7dUsd ? (fees7dUsd / tvlUsd * 1000) : null;

  return (
    <SectionCard title="Yield Metrics">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Fees ({is24h ? '24H' : '7D'})</div>
          <div className="text-2xl font-bold tabular-nums text-white/95">{formatUsd(feesWindow, true)}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Fee per $1K TVL</div>
          <div className="text-2xl font-bold tabular-nums text-white/95">{feePerK ? `$${feePerK.toFixed(2)}` : '—'}</div>
          <div className="text-xs text-white/[0.58] mt-1">7 days period</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Est. APR</div>
          <div className={cn("text-2xl font-bold tabular-nums", apr && apr > 0 ? "text-[#10B981]" : "text-white/95")}>
            {formatPct(apr)}
          </div>
          <div className="text-xs text-white/[0.58] mt-1">Based on {is24h ? '24h' : '7d'} fees</div>
        </div>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PoolUniversePage({ poolAddress }: PoolUniversePageProps) {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<AnalyticsPoolResponse | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [ts, setTs] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPool(poolAddress);
      setResponse(data);
      setTs(data.ts ?? Date.now());
    } catch {
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolAddress]);

  // Extract data from response - handle both old and new API shapes
  const pool = response?.pool;
  const universe = (pool as Record<string, unknown>)?.universe as Record<string, unknown> | null;
  const head = (pool as Record<string, unknown>)?.head as Record<string, unknown> | null;
  const segments: PoolSegment[] = (universe?.segments as PoolSegment[]) ?? [];

  const pair = universe?.pair as Record<string, unknown> | null;
  const summary = universe?.summary as Record<string, unknown> | null;
  
  const token0Symbol = (pair?.token0Symbol as string) ?? null;
  const token1Symbol = (pair?.token1Symbol as string) ?? null;
  const pairLabel = token0Symbol && token1Symbol ? `${token0Symbol} / ${token1Symbol}` : 'Pool';

  // Metrics - handle both universe and head data sources
  const tvlUsd = (summary?.tvlUsd as number) ?? (head?.tvl as number) ?? null;
  const fees7dUsd = (summary?.fees7dUsd as number) ?? (head?.fees7d as number) ?? null;
  const fees24hUsd = (summary?.fees24hUsd as number) ?? (head?.fees24h as number) ?? null;
  const positionsCount = (summary?.positionsCount as number) ?? (head?.positionsCount as number) ?? null;
  const walletsCount = (summary?.walletsCount as number) ?? null;

  const lastUpdatedText = ts
    ? new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
      {/* Header - matching wallet style */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-brand text-3xl font-semibold text-white/95">Pool Universe</h1>
        <div className="flex items-center gap-3">
          <Link href="/wallet" className="text-sm text-white/50 hover:text-white transition-colors mr-4">
            ← Back to Portfolio
          </Link>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs - matching wallet style */}
      <div className="border-b border-white/10 mb-8">
        <div className="flex gap-0">
          <button
            className="relative px-6 py-4 text-white/95"
          >
            <div className="flex items-center gap-3">
              <TokenPairIcon token0Symbol={token0Symbol} token1Symbol={token1Symbol} size={28} />
              <span>{pairLabel}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3B82F6] to-[#1BE8D2] rounded-t-full" />
          </button>
          <div className="ml-auto flex items-center gap-4 pb-4">
            {lastUpdatedText && (
              <span className="text-xs text-white/[0.58]">Updated {lastUpdatedText}</span>
            )}
            {/* Time Range Toggle - matching wallet style */}
            <div className="inline-flex items-center bg-[#0F1A36]/95 border border-white/10 rounded-lg p-1.5 gap-1">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2 rounded-md transition-all text-sm',
                    timeRange === range
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'text-white/70 hover:text-white/95 hover:bg-white/5'
                  )}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* Skeleton KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-6">
                <div className="h-3 w-20 bg-white/10 rounded mb-3 animate-pulse" />
                <div className="h-8 w-28 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* Skeleton Table */}
          <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-6">
            <div className="h-4 w-40 bg-white/10 rounded mb-6 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Row - matching wallet card style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-6">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Total TVL</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">{formatUsd(tvlUsd, true)}</div>
              <div className="text-xs text-white/[0.58] mt-1">Across all pools</div>
            </div>
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-6">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Fees ({timeRange === '24h' ? '24H' : '7D'})</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">{formatUsd(timeRange === '24h' ? fees24hUsd : fees7dUsd, true)}</div>
            </div>
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-6">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Total Positions</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">{formatNumber(positionsCount)}</div>
            </div>
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-6">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-2">Active Wallets</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">{formatNumber(walletsCount)}</div>
            </div>
          </div>

          {/* Liquidity Venues Table */}
          <DexBreakdownSection segments={segments} />

          {/* Two Column Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <LpPopulationSection positionsCount={positionsCount} walletsCount={walletsCount} />
            <YieldSection 
              tvlUsd={tvlUsd} 
              fees7dUsd={fees7dUsd} 
              fees24hUsd={fees24hUsd}
              timeRange={timeRange}
            />
          </div>

          {/* Data Source */}
          <DataSourceDisclaimer className="pt-4" />
        </div>
      )}
    </div>
  );
}
