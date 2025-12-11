import React from 'react';
import type { AnalyticsPoolUniverseSegment } from '@/lib/api/analytics';

type Props = {
  positionsCount: number | null;
  walletsCount: number | null;
  segments: AnalyticsPoolUniverseSegment[];
  degrade?: boolean;
  loading?: boolean;
};

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-US');
}

export default function PoolUniverseLpPopulationSection({ 
  positionsCount, 
  walletsCount, 
  segments,
  degrade = false,
  loading = false 
}: Props) {
  const positionsPerWallet = 
    positionsCount !== null && walletsCount !== null && walletsCount > 0
      ? (positionsCount / walletsCount).toFixed(1)
      : null;

  // DEX distribution
  const dexDistribution = React.useMemo(() => {
    const counts: Record<string, { positions: number; pools: number }> = {};
    for (const seg of segments) {
      const dex = String(seg.dex || 'OTHER');
      if (!counts[dex]) {
        counts[dex] = { positions: 0, pools: 0 };
      }
      counts[dex].positions += seg.positionsCount ?? 0;
      counts[dex].pools += 1;
    }
    return Object.entries(counts).map(([dex, data]) => ({
      dex: dex.toLowerCase().includes('sparkdex') ? 'SparkDEX' : dex.toLowerCase().includes('enosys') ? 'Enosys' : dex,
      ...data,
    }));
  }, [segments]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white/90">LP Population</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1530]/90 p-8 shadow-xl">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-8 w-24 bg-white/10 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (degrade) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white/90">LP Population</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1530]/90 p-8 shadow-xl">
          <p className="text-sm text-white/50">LP population data temporarily unavailable.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">LP Population</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#0B1530]/90 p-6 shadow-xl">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-white/50">Active Positions</div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-white/90">
              {formatNumber(positionsCount)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-white/50">Unique Wallets</div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-white/90">
              {formatNumber(walletsCount)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-white/50">Positions/Wallet</div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-white/90">
              {positionsPerWallet ?? '—'}
            </div>
          </div>
        </div>

        {dexDistribution.length > 0 && (
          <div className="mt-6 border-t border-white/5 pt-6">
            <div className="text-xs font-medium uppercase tracking-wide text-white/50 mb-3">DEX Distribution</div>
            <div className="space-y-2">
              {dexDistribution.map(({ dex, positions, pools }) => (
                <div key={dex} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">{dex}</span>
                  <div className="flex items-center gap-4 text-sm tabular-nums">
                    <span className="text-white/60">{pools} pools</span>
                    <span className="text-white/90">{positions.toLocaleString('en-US')} positions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
