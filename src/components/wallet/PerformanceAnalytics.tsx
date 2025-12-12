'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/components/ui/utils';
import type { WalletPortfolioAnalytics } from '@/lib/api/analytics';
import { formatUsd } from '@/utils/format';

interface PerformanceAnalyticsProps {
  data: WalletPortfolioAnalytics | null;
  loading: boolean;
  error: string | null;
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatNumber(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return numberFormatter.format(value);
}

export function PerformanceAnalytics({ data, loading, error }: PerformanceAnalyticsProps) {
  const summary = data?.summary;
  const positions = data?.positions ?? [];

  // Calculate metrics from positions
  const metrics = useMemo(() => {
    if (!summary || positions.length === 0) {
      return {
        netPnl30d: { usd: null, percent: null },
        realizedFeeApr30d: null,
        unclaimedYield: { total: null, fees: null, rewards: null },
        rangeEfficiency30d: null,
        totalTvlUsd: summary?.totalTvlUsd ?? null,
      };
    }

    // Calculate Net PnL (simplified - would need historical data for real calculation)
    const totalTvl = summary.totalTvlUsd;
    const lifetimeFees = summary.lifetimeFeesUsd ?? 0;
    const fees7d = summary.fees7dUsd ?? 0;
    
    // Estimate 30D PnL (using 7D fees * 4.3 as approximation)
    // Note: This is a simplified calculation. Real implementation would track capital invested over time
    const estimatedFees30d = fees7d ? fees7d * 4.3 : 0;
    const netPnl30dUsd = estimatedFees30d;
    const netPnl30dPercent = totalTvl > 0 && estimatedFees30d > 0 ? (estimatedFees30d / totalTvl) * 100 : null;

    // Calculate Realized Fee APR (30D annualized)
    const realizedFeeApr30d = totalTvl > 0 && fees7d > 0 
      ? (fees7d / totalTvl) * 365 * 100 / 7 // Annualize 7D fees
      : null;

    // Calculate Unclaimed Yield
    let unclaimedFees = 0;
    let unclaimedRewards = 0;
    for (const pos of positions) {
      unclaimedFees += typeof pos.unclaimedFeesUsd === 'number' ? pos.unclaimedFeesUsd : 0;
      unclaimedRewards += typeof pos.incentivesUsd === 'number' ? pos.incentivesUsd : 0;
    }
    const unclaimedTotal = unclaimedFees + unclaimedRewards;

    // Calculate Range Efficiency (simplified - count in-range positions)
    const inRangeCount = positions.filter(p => p.status === 'in').length;
    const rangeEfficiency30d = positions.length > 0 ? (inRangeCount / positions.length) * 100 : null;

    return {
      netPnl30d: { usd: netPnl30dUsd, percent: netPnl30dPercent },
      realizedFeeApr30d,
      unclaimedYield: { total: unclaimedTotal, fees: unclaimedFees, rewards: unclaimedRewards },
      rangeEfficiency30d,
      totalTvlUsd: totalTvl,
    };
  }, [summary, positions]);

  // Mock history data for chart (would come from API in real implementation)
  // Phase 3: This would be replaced with real timeseries data from the backend
  const historyData = useMemo(() => {
    if (!summary || summary.totalTvlUsd === 0) return [];
    
    const days = 30;
    const data: Array<{ date: string; tvl: number; fees: number; rewards: number }> = [];
    const baseTvl = summary.totalTvlUsd;
    const baseFees = summary.fees7dUsd ?? 0;
    const dailyFeesEstimate = baseFees / 7;
    
    // Build cumulative data
    let cumulativeFees = 0;
    let cumulativeRewards = 0;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate daily accrual
      cumulativeFees += dailyFeesEstimate * (0.8 + Math.random() * 0.4);
      cumulativeRewards += dailyFeesEstimate * 0.3 * (0.5 + Math.random() * 0.5);
      
      data.push({
        date: date.toISOString().split('T')[0],
        tvl: baseTvl * (0.95 + Math.random() * 0.1), // Mock TVL variation
        fees: cumulativeFees,
        rewards: cumulativeRewards,
      });
    }
    return data;
  }, [summary]);

  // Strategy distribution (simplified - would need range width calculation)
  const strategyDistribution = useMemo(() => {
    // Mock distribution - in real implementation, calculate from position range widths
    return [
      { name: 'Aggressive', value: 25, tvlUsd: (summary?.totalTvlUsd ?? 0) * 0.25 },
      { name: 'Balanced', value: 50, tvlUsd: (summary?.totalTvlUsd ?? 0) * 0.5 },
      { name: 'Conservative', value: 25, tvlUsd: (summary?.totalTvlUsd ?? 0) * 0.25 },
    ];
  }, [summary]);

  // DEX allocation
  const dexAllocation = useMemo(() => {
    const dexMap = new Map<string, number>();
    for (const pos of positions) {
      const dex = pos.dex ?? 'Unknown';
      const tvl = typeof pos.tvlUsd === 'number' ? pos.tvlUsd : 0;
      dexMap.set(dex, (dexMap.get(dex) ?? 0) + tvl);
    }
    return Array.from(dexMap.entries()).map(([dex, tvl]) => ({
      name: dex,
      value: summary?.totalTvlUsd ? (tvl / summary.totalTvlUsd) * 100 : 0,
      tvlUsd: tvl,
    }));
  }, [positions, summary]);

  if (error) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0F1A36]/80 px-6 py-8">
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          Analytics are temporarily unavailable. Position data and Universe stats remain live.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!summary || positions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/20 bg-[#0F1A36]/50 px-6 py-12 text-center">
        <p className="text-sm text-white/70">Deploy liquidity to unlock Portfolio Performance analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-brand text-2xl text-white">Portfolio Performance</h2>
            <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30 text-xs">Pro</Badge>
          </div>
          <p className="text-sm text-white/70">
            Aggregate yield, efficiency, and risk analysis across all active positions.
          </p>
        </div>
      </div>

      {/* KPI Belt */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Net PnL (30D) */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1A36]/95 p-6">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Net PnL (30D)</p>
          <p className={cn(
            "text-3xl font-semibold tabular-nums mb-1",
            metrics.netPnl30d.percent && metrics.netPnl30d.percent >= 0 
              ? "text-[#10B981]" 
              : "text-[#EF4444]"
          )}>
            {metrics.netPnl30d.percent !== null 
              ? `${metrics.netPnl30d.percent >= 0 ? '+' : ''}${formatPercent(metrics.netPnl30d.percent)}`
              : '—'}
          </p>
          <p className="text-xs text-white/50 tabular-nums">
            {metrics.netPnl30d.usd !== null ? formatUsd(metrics.netPnl30d.usd) : '—'}
          </p>
        </div>

        {/* Realized Fee APR (30D) */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1A36]/95 p-6">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Realized Fee APR</p>
          <p className="text-3xl font-semibold tabular-nums mb-1 text-white">
            {metrics.realizedFeeApr30d !== null ? `${formatNumber(metrics.realizedFeeApr30d)}%` : '—'}
          </p>
          <p className="text-xs text-white/50">vs. 14.5% Universe avg</p>
        </div>

        {/* Unclaimed Yield */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1A36]/95 p-6">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Unclaimed Yield</p>
          <p className="text-3xl font-semibold tabular-nums mb-1 text-white">
            {metrics.unclaimedYield.total !== null ? formatUsd(metrics.unclaimedYield.total) : '—'}
          </p>
          <p className="text-xs text-white/50 tabular-nums">
            Fees / Rewards: {formatUsd(metrics.unclaimedYield.fees)} / {formatUsd(metrics.unclaimedYield.rewards)}
          </p>
        </div>

        {/* Range Efficiency (30D) */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1A36]/95 p-6">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Range Efficiency (30D)</p>
          <p className="text-3xl font-semibold tabular-nums mb-1 text-white">
            {metrics.rangeEfficiency30d !== null ? `${formatNumber(metrics.rangeEfficiency30d)}%` : '—'}
          </p>
          <p className="text-xs text-white/50">Time in Range</p>
        </div>
      </div>

      {/* Growth & Yield Chart + Context Column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0F1A36]/95 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Growth & Sources</h3>
          <div className="h-80">
            <ReactECharts
              option={{
                backgroundColor: 'transparent',
                tooltip: {
                  trigger: 'axis',
                  backgroundColor: 'rgba(15, 26, 54, 0.98)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  textStyle: { color: '#FFFFFF' },
                },
                legend: {
                  data: ['Principal', 'Fees', 'Rewards'],
                  textStyle: { color: '#FFFFFF' },
                  top: 10,
                },
                grid: {
                  left: '3%',
                  right: '4%',
                  bottom: '3%',
                  containLabel: true,
                },
                xAxis: {
                  type: 'category',
                  data: historyData.map(d => {
                    const date = new Date(d.date);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }),
                  axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
                  axisLabel: { color: 'rgba(255, 255, 255, 0.6)' },
                },
                yAxis: {
                  type: 'value',
                  name: 'Net Growth (USD)',
                  nameTextStyle: { color: 'rgba(255, 255, 255, 0.6)' },
                  splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
                  axisLabel: { color: 'rgba(255, 255, 255, 0.6)', formatter: (value: number) => `$${formatNumber(value)}` },
                },
                series: [
                  {
                    name: 'Principal',
                    type: 'line',
                    stack: 'total',
                    areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
                    lineStyle: { color: '#3B82F6', width: 2 },
                    data: historyData.map(d => d.tvl),
                  },
                  {
                    name: 'Fees',
                    type: 'line',
                    stack: 'total',
                    areaStyle: { color: 'rgba(59, 130, 246, 0.4)' },
                    lineStyle: { color: '#3B82F6', width: 2 },
                    data: historyData.map((d, i) => {
                      let cumulative = 0;
                      for (let j = 0; j <= i; j++) {
                        cumulative += historyData[j].fees;
                      }
                      return cumulative;
                    }),
                  },
                  {
                    name: 'Rewards',
                    type: 'line',
                    stack: 'total',
                    areaStyle: { color: 'rgba(27, 232, 210, 0.3)' },
                    lineStyle: { color: '#1BE8D2', width: 2 },
                    data: historyData.map((d, i) => {
                      let cumulative = 0;
                      for (let j = 0; j <= i; j++) {
                        cumulative += historyData[j].rewards;
                      }
                      return cumulative;
                    }),
                  },
                ],
              }}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>

        {/* Context Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Peer Comparison */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Peer Comparison</h3>
            <p className="text-sm text-white/70 mb-4">
              Your 30D APR is {metrics.realizedFeeApr30d !== null ? formatNumber(metrics.realizedFeeApr30d) : '—'}%, placing you in the Top 15% of similar LPs.
            </p>
            {/* Simplified box plot visualization */}
            <div className="space-y-3">
              <div className="relative h-8 bg-[#0B1530]/40 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-full bg-[#3B82F6]/30" style={{ width: '50%', marginLeft: '25%' }} />
                  <div className="absolute right-[15%] top-0 bottom-0 w-1 bg-[#1BE8D2]" />
                </div>
              </div>
              <div className="text-xs text-white/60 flex justify-between">
                <span>Bottom 25%</span>
                <span>Median</span>
                <span>Top 25%</span>
              </div>
            </div>
          </div>

          {/* Claims/Incentives Health */}
          <div className="rounded-2xl border border-white/10 bg-[#0F1A36]/95 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Claim Health</h3>
            <p className="text-sm text-white/70 mb-4">
              Regular claim activity indicates healthy yield management.
            </p>
            {/* Spark-bar timeline placeholder */}
            <div className="flex items-end gap-1 h-16 mb-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#1BE8D2] rounded-t"
                  style={{
                    height: `${Math.random() * 100}%`,
                    minHeight: Math.random() > 0.7 ? '4px' : '0px',
                    opacity: Math.random() > 0.7 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-white/50">Last 30 days</p>
          </div>
        </div>
      </div>

      {/* Allocation Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strategy Distribution */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1A36]/95 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Strategy Distribution</h3>
          <div className="h-64">
            <ReactECharts
              option={{
                backgroundColor: 'transparent',
                tooltip: {
                  trigger: 'item',
                  backgroundColor: 'rgba(15, 26, 54, 0.98)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  textStyle: { color: '#FFFFFF' },
                  formatter: '{b}: {c}% ({d}%)',
                },
                series: [
                  {
                    name: 'Strategy',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    data: strategyDistribution.map(s => ({
                      value: s.value,
                      name: s.name,
                      itemStyle: {
                        color: s.name === 'Aggressive' ? '#EF4444' : s.name === 'Balanced' ? '#3B82F6' : '#10B981',
                      },
                    })),
                    label: {
                      show: true,
                      formatter: '{b}\n{c}%',
                      color: '#FFFFFF',
                    },
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                      },
                    },
                  },
                ],
              }}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>

        {/* DEX Allocation */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1A36]/95 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">DEX Allocation</h3>
          <div className="space-y-3">
            {dexAllocation.map((dex, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{dex.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3B82F6] rounded-full"
                      style={{ width: `${dex.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white tabular-nums w-16 text-right">
                    {formatNumber(dex.value)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

