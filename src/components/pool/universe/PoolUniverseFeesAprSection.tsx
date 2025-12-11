import React from 'react';
import type { TimeRange } from './PoolUniverseHead';

type Props = {
  tvlUsd: number | null;
  fees24hUsd: number | null;
  fees7dUsd: number | null;
  incentives24hUsd: number | null;
  incentives7dUsd: number | null;
  timeRange: TimeRange;
  degrade?: boolean;
  loading?: boolean;
};

function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (value === 0) return '$0';
  if (value < 0.01) return '<$0.01';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
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

export default function PoolUniverseFeesAprSection({
  tvlUsd,
  fees24hUsd,
  fees7dUsd,
  incentives24hUsd,
  incentives7dUsd,
  timeRange,
  degrade = false,
  loading = false,
}: Props) {
  const is24h = timeRange === '24h';
  const feesWindow = is24h ? fees24hUsd ?? fees7dUsd ?? 0 : fees7dUsd ?? fees24hUsd ?? 0;
  const incentivesWindow = is24h ? incentives24hUsd ?? incentives7dUsd ?? 0 : incentives7dUsd ?? incentives24hUsd ?? 0;
  const annualizationFactor = is24h ? 365 : 52; // 30d/90d use 7d proxy

  const { baseApr, totalApr } = computeApr({
    tvlUsd,
    feesWindowUsd: feesWindow ?? 0,
    incentivesWindowUsd: incentivesWindow ?? 0,
    annualizationFactor,
  });

  const baseAprValue = baseApr ?? 0;
  const totalAprValue = totalApr ?? 0;
  const feesShare = totalAprValue > 0 && baseAprValue > 0
    ? (baseAprValue / totalAprValue) * 100
    : totalAprValue > 0 ? 0 : 100;
  const incentivesShare = Math.max(0, 100 - feesShare);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white/90">Yield Efficiency</h2>
        </div>
        <div className="rounded-2xl bg-[#0B1530]/90 p-8 shadow-xl">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 bg-white/10 rounded" />
            <div className="h-4 w-48 bg-white/10 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (degrade) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white/90">Yield Efficiency</h2>
        </div>
        <div className="rounded-2xl bg-[#0B1530]/90 p-8 shadow-xl">
          <p className="text-sm text-white/50">Metric syncing...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">Yield Efficiency</h2>
      </div>
      <div className="flex flex-1 flex-col justify-center rounded-2xl bg-[#0B1530]/90 p-6 shadow-xl">
        {incentivesWindow && incentivesWindow > 0 ? (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-white/50 mb-1">Fee Efficiency</div>
              <div className="text-3xl font-bold tabular-nums text-white/90">
                {formatPct(totalApr)}
              </div>
              <div className="mt-1 text-xs text-white/50">
                Fees + Incentives
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase tracking-wide text-white/50">Yield Composition</div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#3B82F6] transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, feesShare))}%` }}
                />
                {incentivesShare > 0 && (
                  <div 
                    className="absolute right-0 top-0 h-full bg-[#1BE8D2] transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, incentivesShare))}%` }}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  <span className="text-white/70">Fees: {formatPct(baseApr)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#1BE8D2]" />
                  <span className="text-white/70">Incentives: {formatPct(totalApr !== null && baseApr !== null ? totalApr - baseApr : null)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-white/50 mb-1">Fee Efficiency</div>
            <div className="text-3xl font-bold tabular-nums text-white/90">
              {formatPct(totalApr)}
            </div>
            <div className="mt-2 text-xs text-white/50">
              Yield Source: 100% Organic Fees
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
