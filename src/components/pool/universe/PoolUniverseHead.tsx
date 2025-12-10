import React from 'react';
import { Clock, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PoolUniverseKpiGrid from './PoolUniverseKpiGrid';

export type TimeRange = '24h' | '7d' | '30d' | '90d';

export type PoolUniverseHeadMetrics = {
  tvlUsd: number | null;
  fees24hUsd: number | null;
  fees7dUsd: number | null;
  incentives24hUsd: number | null;
  incentives7dUsd: number | null;
  positionsCount: number | null;
  walletsCount: number | null;
} | null;

type Props = {
  token0Symbol: string | null;
  token1Symbol: string | null;
  metrics: PoolUniverseHeadMetrics;
  poolsCount: number;
  timeRange: TimeRange;
  onRangeChange: (value: TimeRange) => void;
  lastUpdatedText: string | null;
  degrade?: boolean;
  loading?: boolean;
};

type Tile = {
  label: string;
  subLabel?: string;
  value: React.ReactNode;
  changePct?: number | null;
  tooltip: string;
  highlight?: boolean;
};

function formatUsd(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value === 0) return '$0';
  if (value < 1 && value > 0) return '<$0.01';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function formatCompactUsd(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value === 0) return '$0';
  if (value < 1000) return formatUsd(value, 2);
  
  // Basic compact implementation since we can't rely on Intl.NumberFormat compact everywhere safely or consistent with the request
  if (value >= 1e9) return `$${(value / 1e9).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  if (value >= 1e6) return `$${(value / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
  if (value >= 1e3) return `$${(value / 1e3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}K`;
  
  return formatUsd(value, 0);
}

function formatPct(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)}%`;
}

function MetricTile({ label, subLabel, value, changePct, tooltip, highlight }: Tile) {
  const pctText =
    typeof changePct === 'number' && Number.isFinite(changePct)
      ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`
      : null;
  const pctClass =
    typeof changePct === 'number' && Number.isFinite(changePct)
      ? changePct >= 0
        ? 'text-emerald-400'
        : 'text-red-400'
      : 'text-white/40';

  return (
    <div className={`rounded-xl border p-5 transition-all duration-300 ${
      highlight 
        ? 'border-[#3B82F6]/40 bg-[#0B1530]/80 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]' 
        : 'border-white/5 bg-[#0B1530]/60 hover:border-white/10'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-white/50">
            <span>{label}</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-white/30 transition hover:text-white/60 focus:outline-none focus:ring-0"
                    aria-label={`${label} info`}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-xs border-white/10 bg-[#0F1A36] text-white/90 shadow-xl">
                  <p className="text-xs leading-relaxed">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {subLabel && <span className="text-[10px] font-medium text-white/30">{subLabel}</span>}
        </div>
        {pctText ? <span className={`text-xs font-semibold ${pctClass}`}>{pctText}</span> : null}
      </div>
      <div className={`mt-3 text-2xl font-bold tracking-tight tnum md:text-3xl ${highlight ? 'text-white' : 'text-white/90'}`}>
        {value}
      </div>
    </div>
  );
}

function computeApr({
  tvlUsd,
  feesWindowUsd,
  incentivesWindowUsd,
  annualizationFactor,
}: {
  tvlUsd: number | null | undefined;
  feesWindowUsd: number | null | undefined;
  incentivesWindowUsd: number | null | undefined;
  annualizationFactor: number;
}): { baseApr: number | null; totalApr: number | null } {
  if (!tvlUsd || tvlUsd <= 0) {
    return { baseApr: null, totalApr: null };
  }
  const base = (feesWindowUsd ?? 0) * annualizationFactor;
  const rewards = (incentivesWindowUsd ?? 0) * annualizationFactor;
  const baseApr = base / tvlUsd * 100;
  const totalApr = (base + rewards) / tvlUsd * 100;
  const clamp = (v: number | null) => (v !== null ? Math.min(v, 9999) : null);
  return { baseApr: clamp(baseApr), totalApr: clamp(totalApr) };
}

function TimeRangeToggle({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (next: TimeRange) => void;
}) {
  const options: TimeRange[] = ['24h', '7d', '30d', '90d'];
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold text-white/70">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full px-3 py-1 transition ${
              active ? 'bg-[#3B82F6] text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'hover:bg-white/10'
            }`}
            aria-pressed={active}
          >
            {opt.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export default function PoolUniverseHead({
  token0Symbol,
  token1Symbol,
  metrics,
  poolsCount,
  timeRange,
  onRangeChange,
  lastUpdatedText,
  degrade = false,
  loading = false,
}: Props) {
  const tvl = metrics?.tvlUsd ?? null;
  const fees24h = metrics?.fees24hUsd ?? null;
  const fees7d = metrics?.fees7dUsd ?? null;
  const incentives24h = metrics?.incentives24hUsd ?? null;
  const incentives7d = metrics?.incentives7dUsd ?? null;
  const positions = metrics?.positionsCount ?? null;
  const wallets = metrics?.walletsCount ?? null;
  const hasWalletsMetric = typeof wallets === 'number';

  const is24h = timeRange === '24h';
  const feesWindow = is24h ? fees24h ?? fees7d ?? 0 : fees7d ?? fees24h ?? 0;
  const incentivesWindow = is24h ? incentives24h ?? incentives7d ?? 0 : incentives7d ?? incentives24h ?? 0;

  const annualizationFactor = is24h ? 365 : 52; // 30d/90d use 7d proxy
  const { totalApr } = computeApr({
    tvlUsd: tvl,
    feesWindowUsd: feesWindow ?? 0,
    incentivesWindowUsd: incentivesWindow ?? 0,
    annualizationFactor,
  });

  const title =
    token0Symbol && token1Symbol
      ? `${token0Symbol} / ${token1Symbol}`
      : 'Pool Universe';

  const tvlDisplay =
    tvl === null || tvl === undefined
      ? '—'
      : tvl <= 0
        ? 'No liquidity yet'
        : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help decoration-white/20 decoration-dotted underline-offset-4 hover:underline">
                {formatCompactUsd(tvl)}
              </TooltipTrigger>
              <TooltipContent className="border-white/10 bg-[#0F1A36] font-mono text-xs">
                {formatUsd(tvl, 2)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );

  const incentivesLabel =
    incentivesWindow && incentivesWindow > 0
      ? (
        <div className="flex items-center gap-2">
          <span>{formatUsd(incentivesWindow, 2)}</span>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Active
          </Badge>
        </div>
      )
      : (
        <span className="text-white/40">{tvl && tvl > 0 ? 'No active incentives' : 'No incentives data yet'}</span>
      );

  const aprLabel = totalApr !== null ? formatPct(totalApr, 1) : '—';

  const tiles: Tile[] = [
    {
      label: 'Total TVL',
      value: tvlDisplay,
      tooltip: 'Current Total Value Locked (USD) across all liquidity pools for this pair (Enosys + SparkDEX). Source: on-chain reserves.',
    },
    {
      label: `Fees (${is24h ? '24H' : '7D'})`,
      value: formatUsd(feesWindow ?? null, 2),
      tooltip: is24h
        ? 'Swap fees accrued by LPs in the last 24 hours across all pools.'
        : 'Swap fees accrued by LPs in the last 7 days. 30d/90d views reuse 7d as proxy.',
    },
    {
      label: `Incentives (${is24h ? '24H' : '7D'})`,
      value: incentivesLabel,
      highlight: (incentivesWindow ?? 0) > 0,
      tooltip: is24h
        ? 'External rewards distributed to LPs in the last 24 hours (if any).'
        : 'External rewards distributed to LPs over the last 7 days. 30d/90d views reuse 7d as proxy.',
    },
    {
      label: 'Positions',
      subLabel: 'Active LP NFTs',
      value: typeof positions === 'number' ? positions.toLocaleString('en-US') : '—',
      tooltip: 'Number of active LP NFT positions across all pools in this pair.',
    },
    {
      label: 'Wallets',
      subLabel: 'Active LP wallets',
      value: hasWalletsMetric ? wallets!.toLocaleString('en-US') : '—',
      tooltip: 'Distinct wallet addresses with at least one active LP position in this pair.',
    },
    {
      label: 'Estimated APR',
      value: aprLabel,
      highlight: (totalApr ?? 0) > 0,
      tooltip: is24h
        ? 'Annualized from 24h fees/incentives relative to TVL (365×).'
        : 'Annualized from 7d fees/incentives relative to TVL (52×). 30d/90d reuse 7d as proxy.',
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1530]/40 p-6 backdrop-blur-sm md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-brand text-3xl font-bold text-white md:text-4xl">{title}</h1>
            <Badge className="border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20">
              Universe
            </Badge>
          </div>
          <p className="text-base text-white/60">
            Aggregated analytics across {poolsCount} liquidity pools on Flare (Enosys + SparkDEX).
          </p>
          
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-white/60">
            {lastUpdatedText ? (
              <span className="inline-flex items-center gap-2 text-white/50">
                <Clock className="size-3.5" />
                <span>Updated {lastUpdatedText}</span>
              </span>
            ) : null}
            {degrade ? (
              <Badge variant="outline" className="border-amber-400/40 bg-amber-400/10 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                Degraded data
              </Badge>
            ) : null}
            <TimeRangeToggle value={timeRange} onChange={onRangeChange} />
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <PoolUniverseKpiGrid>
        {tiles.map((tile, i) => (
          <MetricTile 
            key={i} 
            label={tile.label} 
            subLabel={tile.subLabel}
            value={tile.value} 
            changePct={tile.changePct} 
            tooltip={tile.tooltip}
            highlight={tile.highlight}
          />
        ))}
      </PoolUniverseKpiGrid>
    </div>
  );
}
