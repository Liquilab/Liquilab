import React from 'react';
import type { AnalyticsPoolUniverseSegment } from '@/lib/api/analytics';
import type { TimeRange } from './PoolUniverseHead';

type Props = {
  segments: AnalyticsPoolUniverseSegment[];
  timeRange?: TimeRange;
};

function formatUsd(value: number) {
  if (value === 0) return '$0';
  if (value < 0.01) return '<$0.01';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPct(value: number) {
  return `${value.toFixed(2)}%`;
}

export default function PoolUniverseDexSection({ segments, timeRange = '7d' }: Props) {
  if (!segments || segments.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white/90">Liquidity Venues</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1530]/90 p-8 text-center text-white/50">
          No liquidity venues found for this pair.
        </div>
      </section>
    );
  }

  const totalTvl = segments.reduce((sum, s) => sum + (s.tvlUsd ?? 0), 0);
  const is24h = timeRange === '24h';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">Liquidity Venues</h2>
        <span className="text-xs font-medium text-white/50">{segments.length} Active Pools</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1530]/90 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-medium uppercase tracking-wider text-white/50">
                <th className="px-6 py-4">DEX</th>
                <th className="px-6 py-4">Fee Tier</th>
                <th className="px-6 py-4 text-right">TVL</th>
                <th className="px-6 py-4 text-right">Fees {is24h ? '24h' : '7d'}</th>
                <th className="px-6 py-4 text-right">Incentives 7d</th>
                <th className="px-6 py-4 text-right">APR</th>
                <th className="px-6 py-4 text-right">Positions</th>
                <th className="px-6 py-4 text-right">Wallets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {segments.map((seg) => {
                const share = totalTvl > 0 ? ((seg.tvlUsd ?? 0) / totalTvl) * 100 : 0;
                const feesWindow = is24h ? (seg.fees24hUsd ?? seg.fees7dUsd ?? 0) : seg.fees7dUsd ?? 0;
                const annualizationFactor = is24h ? 365 : 52;
                const apr = (seg.tvlUsd ?? 0) > 0 ? (feesWindow * annualizationFactor) / (seg.tvlUsd ?? 1) * 100 : 0;
                
                // Format DEX name
                let dexName = String(seg.dex || '');
                if (dexName.toLowerCase().includes('sparkdex')) dexName = 'SparkDEX';
                if (dexName.toLowerCase().includes('enosys')) dexName = 'Enosys';

                // Format Fee Tier
                const feeLabel = seg.feeTierBps !== null && seg.feeTierBps > 0
                  ? `${(seg.feeTierBps / 10000).toFixed(2)}%` 
                  : 'Dynamic';

                return (
                  <tr key={seg.poolAddress} className="transition-colors hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                      {dexName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-white/70">
                        {feeLabel}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums font-medium text-white/90">
                      {formatUsd(seg.tvlUsd ?? 0)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-white/90">
                      {formatUsd(feesWindow)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-white/60">
                      {formatUsd(seg.incentives7dUsd ?? 0)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-emerald-400">
                      {apr > 0 ? formatPct(apr) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-white/70">
                      {typeof seg.positionsCount === 'number' ? seg.positionsCount.toLocaleString('en-US') : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-white/60">
                      —
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

