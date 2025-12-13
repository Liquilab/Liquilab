import React from 'react';
import Link from 'next/link';
import type { AnalyticsPoolUniverse, AnalyticsPoolUniverseSegment } from '@/lib/api/analytics';

type Props = {
  universe: AnalyticsPoolUniverse | null;
  segments: AnalyticsPoolUniverseSegment[];
  degrade?: boolean;
  loading?: boolean;
};

function deriveContextualInsights(
  universe: AnalyticsPoolUniverse | null,
  segments: AnalyticsPoolUniverseSegment[]
): {
  marketStructure: string[];
  yieldDrivers: string[];
  participantBehavior: string[];
} {
  const insights = {
    marketStructure: [] as string[],
    yieldDrivers: [] as string[],
    participantBehavior: [] as string[],
  };

  if (!universe || !segments.length) {
    return insights;
  }

  const summary = universe?.summary;
  if (!summary) {
    return insights;
  }
  const totalTvl = summary.tvlUsd ?? 0;
  const dexCount = new Set(segments.map(s => String(s.dex || ''))).size;
  const feeTiers = new Set(segments.map(s => s.feeTierBps).filter(Boolean)).size;

  // Market Structure & Venues
  if (dexCount === 1) {
    const dominantDex = segments[0].dex;
    insights.marketStructure.push(`Liquidity concentrated on ${dominantDex === 'ENOSYS' ? 'Enosys' : dominantDex === 'SPARKDEX' ? 'SparkDEX' : 'single DEX'}.`);
  } else if (dexCount > 1) {
    insights.marketStructure.push(`Liquidity distributed across ${dexCount} DEXes (Enosys + SparkDEX).`);
  }

  const largestPoolTvl = segments.length > 0 
    ? Math.max(...segments.map(s => s.tvlUsd ?? 0))
    : 0;
  const consolidationPct = totalTvl > 0 && largestPoolTvl > 0 ? (largestPoolTvl / totalTvl) * 100 : 0;
  if (consolidationPct > 80) {
    insights.marketStructure.push(`High consolidation: ${consolidationPct.toFixed(0)}% of TVL in largest pool.`);
  }

  if (feeTiers > 1) {
    insights.marketStructure.push(`Fee-tier diversity: ${feeTiers} different tiers active.`);
  }

  // Yield Drivers & Efficiency
  const totalFees7d = summary.fees7dUsd ?? 0;
  const totalIncentives7d = summary.incentives7dUsd ?? 0;
  const totalRewards = totalFees7d + totalIncentives7d;
  const incentiveRatio = totalRewards > 0 ? (totalIncentives7d / totalRewards) * 100 : 0;

  if (totalFees7d > 0 && totalTvl > 0) {
    const apr7d = (totalFees7d * 52) / totalTvl * 100;
    insights.yieldDrivers.push(`7d fee-based APR: ${apr7d.toFixed(1)}% (annualized from 7d fees).`);
  }

  if (incentiveRatio > 50) {
    insights.yieldDrivers.push(`Incentives dominate yield: ${incentiveRatio.toFixed(0)}% of total rewards from external programs.`);
  } else if (totalIncentives7d > 0) {
    insights.yieldDrivers.push(`Incentives supplement fees: ${incentiveRatio.toFixed(0)}% of rewards from external programs.`);
  }

  // Participant Behavior & Flows
  const positionsCount = summary.positionsCount ?? 0;
  const walletsCount = summary.walletsCount ?? 0;
  if (positionsCount > 0 && walletsCount > 0) {
    const avgPositionsPerWallet = positionsCount / walletsCount;
    if (avgPositionsPerWallet > 2) {
      insights.participantBehavior.push(`Active LPs average ${avgPositionsPerWallet.toFixed(1)} positions per wallet.`);
    }
  }

  if (segments.length > 1) {
    insights.participantBehavior.push(`Liquidity spread across ${segments.length} pools; consider fee-tier selection.`);
  }

  return insights;
}

export default function PoolUniverseContextSection({
  universe,
  segments,
  degrade = false,
  loading = false,
}: Props) {
  const insights = React.useMemo(
    () => deriveContextualInsights(universe, segments),
    [universe, segments]
  );

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl bg-[#0B1530]/90 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-64 bg-white/10 rounded" />
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white/10 rounded" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (degrade || !universe) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl bg-[#0B1530]/90 p-6">
          <h3 className="text-base font-semibold text-white/95 mb-4">Contextual Briefing</h3>
          <p className="text-sm text-white/50">Metric syncing...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-[#0B1530]/90 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white/95">Contextual Briefing</h3>
            <p className="mt-1 text-xs text-white/50">Smart insights derived from on-chain analytics</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div className="text-sm font-semibold text-white/90 mb-2">Market Structure & Venues</div>
            {insights.marketStructure.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-white/70">
                {insights.marketStructure.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-[#3B82F6]">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white/50">No notable market structure patterns detected.</p>
            )}
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div className="text-sm font-semibold text-white/90 mb-2">Yield Drivers & Efficiency</div>
            {insights.yieldDrivers.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-white/70">
                {insights.yieldDrivers.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-[#1BE8D2]">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white/50">Yield metrics pending sufficient data.</p>
            )}
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div className="text-sm font-semibold text-white/90 mb-2">Participant Behavior & Flows</div>
            {insights.participantBehavior.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-white/70">
                {insights.participantBehavior.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-white/50">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white/50">Participant behavior analysis pending.</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/[0.02] pt-4">
          <Link 
            href="/" 
            className="text-sm font-medium text-white/70 transition-colors hover:text-[#3B82F6]"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/dashboard" 
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
          >
            Manage My Position
          </Link>
        </div>
      </div>
    </section>
  );
}
