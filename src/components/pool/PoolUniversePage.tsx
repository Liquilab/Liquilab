'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, TrendingUp, TrendingDown, Info, ExternalLink } from 'lucide-react';

import { DataSourceDisclaimer } from '@/components/DataSourceDisclaimer';
import { iconCandidates } from '@/lib/icons/symbolMap';
import { TOKEN_ASSETS } from '@/lib/assets';
import {
  fetchPool,
  type AnalyticsPoolHead,
  type AnalyticsPoolResponse,
  type AnalyticsPoolUniverse,
} from '@/lib/api/analytics';

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
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-US');
}

// ============================================================================
// TOKEN PAIR ICON
// ============================================================================

function TokenPairIcon({ token0Symbol, token1Symbol, size = 40 }: { token0Symbol: string | null; token1Symbol: string | null; size?: number }) {
  if (!token0Symbol || !token1Symbol) return null;

  const token0Candidates = iconCandidates(token0Symbol);
  const token1Candidates = iconCandidates(token1Symbol);
  const [token0Index, setToken0Index] = useState(0);
  const [token1Index, setToken1Index] = useState(0);

  return (
    <div className="flex items-center -space-x-3 shrink-0">
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
// KPI TILE
// ============================================================================

function KpiTile({ label, value, subLabel, highlight }: { label: string; value: React.ReactNode; subLabel?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-[#0F1A36]/95 border border-[#3B82F6]/20' : 'bg-[#0F1A36]/95 border border-white/10'}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-1">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${highlight ? 'text-[#10B981]' : 'text-white/95'}`}>{value}</div>
      {subLabel && <div className="text-xs text-white/[0.58] mt-1">{subLabel}</div>}
    </div>
  );
}

// ============================================================================
// TIME RANGE TOGGLE
// ============================================================================

type TimeRange = '24h' | '7d' | '30d';

function TimeRangeToggle({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  const options: TimeRange[] = ['24h', '7d', '30d'];
  return (
    <div className="inline-flex rounded-lg bg-[#0F1A36]/95 border border-white/10 p-1 text-xs font-medium">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-md px-3 py-1.5 transition-all ${
            opt === value ? 'bg-[#3B82F6] text-white' : 'text-white/70 hover:text-white/95'
          }`}
        >
          {opt.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// SECTION CARD
// ============================================================================

function SectionCard({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-[#0F1A36]/95 border border-white/10 p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white/95">{title}</h2>
        {subtitle && <p className="text-xs text-white/[0.58] mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ============================================================================
// DEX BREAKDOWN
// ============================================================================

function DexBreakdownSection({ segments }: { segments: any[] }) {
  const dexData = useMemo(() => {
    const grouped: Record<string, { tvl: number; fees7d: number; positions: number }> = {};
    for (const seg of segments) {
      const dex = String(seg.dex || 'Other').toLowerCase().includes('sparkdex') ? 'SparkDEX' : 
                  String(seg.dex || 'Other').toLowerCase().includes('enosys') ? 'Enosys' : 'Other';
      if (!grouped[dex]) grouped[dex] = { tvl: 0, fees7d: 0, positions: 0 };
      grouped[dex].tvl += seg.tvlUsd ?? 0;
      grouped[dex].fees7d += seg.fees7dUsd ?? 0;
      grouped[dex].positions += seg.positionsCount ?? 0;
    }
    return Object.entries(grouped).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.tvl - a.tvl);
  }, [segments]);

  const maxTvl = Math.max(...dexData.map(d => d.tvl), 1);

  if (dexData.length === 0) {
    return (
      <SectionCard title="DEX Breakdown">
        <div className="h-48 flex items-center justify-center text-white/[0.58] text-sm">
          Data warming up...
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="DEX Breakdown">
      <div className="space-y-4">
        {dexData.map((dex) => (
          <div key={dex.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/95 font-medium">{dex.name}</span>
              <span className="text-white/70 tabular-nums">{formatUsd(dex.tvl, true)}</span>
            </div>
            <div className="h-6 bg-white/5 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#1BE8D2] rounded"
                style={{ width: `${(dex.tvl / maxTvl) * 100}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs text-white/[0.58] mt-1">
              <span>7D Fees: {formatUsd(dex.fees7d, true)}</span>
              <span>Positions: {formatNumber(dex.positions)}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ============================================================================
// FEE TIER BREAKDOWN
// ============================================================================

function FeeTierBreakdownSection({ segments }: { segments: any[] }) {
  const tierData = useMemo(() => {
    const grouped: Record<string, { tvl: number; fees7d: number; positions: number }> = {};
    for (const seg of segments) {
      const bps = seg.feeTierBps ?? 0;
      const tierLabel = bps > 0 ? `${(bps / 100).toFixed(2)}%` : 'Dynamic';
      if (!grouped[tierLabel]) grouped[tierLabel] = { tvl: 0, fees7d: 0, positions: 0 };
      grouped[tierLabel].tvl += seg.tvlUsd ?? 0;
      grouped[tierLabel].fees7d += seg.fees7dUsd ?? 0;
      grouped[tierLabel].positions += seg.positionsCount ?? 0;
    }
    return Object.entries(grouped).map(([tier, data]) => ({ tier, ...data })).sort((a, b) => b.tvl - a.tvl);
  }, [segments]);

  const maxTvl = Math.max(...tierData.map(d => d.tvl), 1);

  if (tierData.length === 0) {
    return (
      <SectionCard title="Fee Tier Breakdown">
        <div className="h-48 flex items-center justify-center text-white/[0.58] text-sm">
          Data warming up...
        </div>
      </SectionCard>
    );
  }

  const colors = ['#3B82F6', '#1BE8D2', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <SectionCard title="Fee Tier Breakdown">
      <div className="space-y-3">
        {tierData.map((tier, i) => (
          <div key={tier.tier} className="flex items-center gap-4">
            <div className="w-16 text-sm text-white/70 font-medium">{tier.tier}</div>
            <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
              <div
                className="h-full rounded"
                style={{ 
                  width: `${(tier.tvl / maxTvl) * 100}%`,
                  backgroundColor: colors[i % colors.length]
                }}
              />
            </div>
            <div className="w-20 text-right text-sm text-white/70 tabular-nums">{formatUsd(tier.tvl, true)}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/[0.58]">
              <th className="text-left font-medium py-1">Tier</th>
              <th className="text-right font-medium py-1">TVL</th>
              <th className="text-right font-medium py-1">7D Fees</th>
              <th className="text-right font-medium py-1">Positions</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            {tierData.map((tier) => (
              <tr key={tier.tier}>
                <td className="py-1.5 text-white/95 font-medium">{tier.tier}</td>
                <td className="py-1.5 text-right tabular-nums">{formatUsd(tier.tvl, true)}</td>
                <td className="py-1.5 text-right tabular-nums">{formatUsd(tier.fees7d, true)}</td>
                <td className="py-1.5 text-right tabular-nums">{formatNumber(tier.positions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// LP POPULATION (PIE CHART)
// ============================================================================

function LpPopulationSection({ positionsCount, walletsCount }: { positionsCount: number | null; walletsCount: number | null }) {
  // Mock distribution - in real implementation this would come from API
  const distribution = [
    { label: 'Whale', pct: 39, color: '#3B82F6' },
    { label: 'Dolphin', pct: 37, color: '#1BE8D2' },
    { label: 'Shrimp', pct: 24, color: '#8B5CF6' },
  ];

  return (
    <SectionCard title="LP Population & Concentration" subtitle="Wallet-Size Distribution">
      <div className="flex gap-8">
        {/* Pie Chart */}
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {(() => {
              let cumulative = 0;
              return distribution.map((seg, i) => {
                const start = cumulative;
                cumulative += seg.pct;
                const startAngle = (start / 100) * 360;
                const endAngle = (cumulative / 100) * 360;
                const largeArc = seg.pct > 50 ? 1 : 0;
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                return (
                  <path
                    key={i}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    className="transition-opacity hover:opacity-80"
                  />
                );
              });
            })()}
          </svg>
        </div>
        {/* Legend */}
        <div className="flex flex-col justify-center space-y-3">
          {distribution.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-sm text-white/70">{seg.label}</span>
              <span className="text-sm font-medium text-white/95 ml-2">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-white/[0.58] uppercase tracking-wide">Avg Positions/Wallet</div>
          <div className="text-xl font-bold text-white/95 mt-1 tabular-nums">
            {positionsCount && walletsCount && walletsCount > 0 ? (positionsCount / walletsCount).toFixed(1) : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/[0.58] uppercase tracking-wide">Avg LP Duration</div>
          <div className="text-xl font-bold text-white/95 mt-1 tabular-nums">48.8%</div>
          <div className="text-xs text-white/[0.58]">of positions held {">"} 30d</div>
        </div>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// POSITION COUNT & CHURN
// ============================================================================

function PositionChurnSection() {
  // Mock data for the chart
  const data = [
    { day: '01', value: 280 },
    { day: '05', value: 310 },
    { day: '10', value: 290 },
    { day: '15', value: 340 },
    { day: '20', value: 320 },
    { day: '25', value: 336 },
    { day: '30', value: 330 },
  ];

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <SectionCard title="Position Count & Churn" subtitle="Active positions over 30 days">
      <div className="h-32 flex items-end gap-1">
        {data.map((d, i) => {
          const height = ((d.value - minValue) / range) * 80 + 20;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-[#3B82F6] rounded-t"
                style={{ height: `${height}%` }}
              />
              <span className="text-[10px] text-white/[0.58] mt-1">{d.day}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-white/[0.58]">30d +/-</div>
          <div className="text-sm font-semibold text-[#10B981] tabular-nums">+12.7</div>
        </div>
        <div>
          <div className="text-xs text-white/[0.58]">7d Churn</div>
          <div className="text-sm font-semibold text-white/95 tabular-nums">1.08</div>
        </div>
        <div>
          <div className="text-xs text-white/[0.58]">Peak</div>
          <div className="text-sm font-semibold text-white/95 tabular-nums">{maxValue}</div>
        </div>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// RANGEBAND LANDSCAPE
// ============================================================================

function RangebandLandscapeSection() {
  // Range status distribution mock
  const rangeStatus = [
    { label: 'In-Range', pct: 72, color: '#10B981' },
    { label: 'Near-Range', pct: 18, color: '#F59E0B' },
    { label: 'Out-of-Range', pct: 10, color: '#EF4444' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="RangeBand™ Landscape" subtitle="Range-Type Distribution">
        <div className="space-y-3">
          {['Aggressive', 'Balanced', 'Conservative'].map((type, i) => {
            const widths = [25, 45, 30];
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="w-24 text-sm text-white/70">{type}</div>
                <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                  <div
                    className="h-full bg-[#3B82F6] rounded"
                    style={{ width: `${widths[i]}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-white/70 tabular-nums">{widths[i]}%</div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <div className="text-xs text-white/[0.58] mb-3">Crowded Price Zones</div>
          <div className="h-20 bg-white/5 rounded flex items-end justify-around p-2">
            {[30, 65, 100, 85, 45, 25, 15].map((h, i) => (
              <div key={i} className="w-6 bg-[#3B82F6]/60 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-white/[0.58] mt-1">
            <span>$0.95</span>
            <span>median market effective price zone</span>
            <span>$1.05</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Current Range Status">
        <div className="flex gap-6">
          {/* Donut Chart */}
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {(() => {
                let cumulative = 0;
                return rangeStatus.map((seg, i) => {
                  const start = cumulative;
                  cumulative += seg.pct;
                  const circumference = 2 * Math.PI * 35;
                  const offset = (start / 100) * circumference;
                  const length = (seg.pct / 100) * circumference;
                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={-offset}
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white/95 tabular-nums">72%</div>
              <div className="text-xs text-white/[0.58]">In-Range</div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col justify-center space-y-2">
            {rangeStatus.map((seg) => (
              <div key={seg.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-sm text-white/70">{seg.label}</span>
                <span className="text-sm font-medium text-white/95 tabular-nums ml-auto">{seg.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================================
// FEE & APR DISTRIBUTION
// ============================================================================

function FeeAprDistributionSection({ tvlUsd, fees7dUsd }: { tvlUsd: number | null; fees7dUsd: number | null }) {
  const feePerCapital = tvlUsd && tvlUsd > 0 && fees7dUsd ? (fees7dUsd / tvlUsd * 100) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Fee & APR Distribution" subtitle="Realized APR Distribution (30D)">
        <div className="h-32 flex items-end gap-0.5">
          {[5, 15, 35, 60, 100, 80, 45, 25, 15, 8, 4, 2].map((h, i) => (
            <div key={i} className="flex-1 bg-[#3B82F6] rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-white/[0.58] mt-2">
          <span>0-2%</span>
          <span>2-10%</span>
          <span>10-25%</span>
          <span>25%+</span>
        </div>
      </SectionCard>

      <SectionCard title="Inefficiency Metrics">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/[0.58]">
              <span>Average ROI</span>
              <Info className="w-3 h-3" />
            </div>
            <div className="text-3xl font-bold text-white/95 mt-1 tabular-nums">
              {formatUsd(tvlUsd && fees7dUsd ? fees7dUsd * 52 : null, true)}
            </div>
            <div className="text-xs text-white/[0.58]">TYL weighted</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-white/[0.58]">
              <span>Fees Per Capital</span>
              <Info className="w-3 h-3" />
            </div>
            <div className="text-3xl font-bold text-[#10B981] mt-1 tabular-nums">
              {formatPct(feePerCapital)}
            </div>
            <div className="text-xs text-white/[0.58]">Per week's share</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================================
// CLAIM BEHAVIOUR
// ============================================================================

function ClaimBehaviourSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Claim Behaviour & Cash-flow Patterns" subtitle="Claim Activity by Wallet Size">
        <div className="space-y-4">
          {[
            { label: 'Retail', claims: '18 days', highlight: false, pct: '4.2%' },
            { label: 'Mid', claims: '12 days', highlight: true, pct: '2.5%' },
            { label: 'Whale', claims: '8 days', highlight: false, pct: '1.5%' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-16">{row.label}</span>
                <span className={`text-sm font-medium ${row.highlight ? 'text-[#3B82F6]' : 'text-white/95'}`}>
                  Avg {row.claims}
                </span>
              </div>
              <span className="text-xs text-white/[0.58] bg-white/5 px-2 py-1 rounded tabular-nums">{row.pct}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Claim Timing Insights">
        <div className="space-y-3 text-sm text-white/70">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] mt-1.5 shrink-0" />
            <span>Claims spike after high-yield days (fee harvest lag)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] mt-1.5 shrink-0" />
            <span>8-10% claim within 48h of large price movements</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] mt-1.5 shrink-0" />
            <span>Weekend activity is 24% lower than weekday averages</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-[#3B82F6]/10 rounded-lg border border-[#3B82F6]/20">
          <div className="flex items-center gap-2 text-xs text-[#3B82F6] font-medium">
            <TrendingUp className="w-3 h-3" />
            Fee Insight
          </div>
          <p className="text-xs text-white/70 mt-1">
            Claims timing analysis helps after system events. Consider catching early or post claim activity windows once gas cost ratio.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================================
// WALLET FLOWS
// ============================================================================

function WalletFlowsSection() {
  const topWallets = [
    { address: '0x9fa...c01', change: '+$4k', direction: 'add' },
    { address: '0x4b2...d9e', change: '+$2k', direction: 'add' },
    { address: '0x1c7...a3f', change: '+$1k', direction: 'add' },
    { address: '0xf3a...b82', change: '-$3k', direction: 'remove' },
    { address: '0x8e1...45c', change: '-$1k', direction: 'remove' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Wallet Flows & Notable Movers" subtitle="Net TVL Flow (30D)">
        <div className="h-32 flex items-center">
          <div className="w-full h-20 bg-white/5 rounded relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 right-1/2 bg-[#10B981]/20" />
            <div className="absolute inset-y-0 left-1/2 right-0 bg-[#EF4444]/20" />
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path
                d="M0,20 Q10,15 20,18 T40,12 T60,22 T80,16 T100,20"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className="text-[#10B981] tabular-nums">Net Inflow: +$14k</span>
          <span className="text-white/[0.58]">30 days</span>
        </div>
      </SectionCard>

      <SectionCard title="Top Wallet Changes">
        <div className="space-y-2">
          {topWallets.map((wallet, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/10 last:border-0">
              <span className="text-sm text-white/70 font-mono">{wallet.address}</span>
              <span className={`text-sm font-medium tabular-nums ${wallet.direction === 'add' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {wallet.change}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================================
// MARKET REGIME
// ============================================================================

function MarketRegimeSection() {
  return (
    <SectionCard title="Market Regime & Volatility">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Regime', value: 'Normal', color: 'text-white/95' },
          { label: 'Trend (7D)', value: '↗', color: 'text-[#10B981]' },
          { label: 'Annualised Vol.', value: '12', color: 'text-white/95' },
          { label: 'ATR (7 Days)', value: '9', color: 'text-white/95' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-xs text-white/[0.58] uppercase tracking-wide">{item.label}</div>
            <div className={`text-xl font-bold ${item.color} mt-1 tabular-nums`}>{item.value}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-xs text-white/[0.58] mb-2">Volatility Timeline</div>
        <div className="h-16 bg-white/5 rounded flex items-end gap-0.5 p-2">
          {[20, 35, 25, 45, 30, 55, 40, 30, 25, 35, 28, 22].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${h > 40 ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]/60'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 p-3 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20">
        <p className="text-xs text-white/70">
          <span className="text-[#10B981] font-medium">Encouragement:</span> Low volatility (current Flare is Conservative range). Normal Market (auto balanced allocations). High volatility (very) requires tighter/more hedge. Lighter ranges stay in range.
        </p>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// CONTEXT SECTION
// ============================================================================

function ContextSection({ token0Symbol, token1Symbol }: { token0Symbol: string | null; token1Symbol: string | null }) {
  const pair = token0Symbol && token1Symbol ? `${token0Symbol}/${token1Symbol}` : 'this pair';
  
  return (
    <SectionCard title="How This Pool Context Affects Your Position" className="bg-[#0F1A36]/95 border border-white/10">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-white/95 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]" />
              OG = Yield
            </h4>
            <p className="text-xs text-white/70 pl-3.5">
              Organic fees and stable incentives in Flare DeFi. No "farming" token emissions yet.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white/95 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]" />
              Range & Diversity
            </h4>
            <p className="text-xs text-white/70 pl-3.5">
              With 0.3x fee ratio, it's flexible time to stay at wider bands (with relative comfort in 1Y history) — less frequent rebalances.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white/95 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]" />
              Efficiency Risk
            </h4>
            <p className="text-xs text-white/70 pl-3.5">
              As this universe scales, position density is growing closer. Higher competition for fees distribution.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-white/95 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]" />
              Concentration & Tiers
            </h4>
            <p className="text-xs text-white/70 pl-3.5">
              Popular tiers attract more activity (e.g., primaries). But non-standard fee tier entries may enjoy unique arbitrage.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white/95 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]" />
              Liquidity Distribution
            </h4>
            <p className="text-xs text-white/70 pl-3.5">
              See if you're a slower liquidity (e.g. below median) vs ultra-responsive (e.g. faster).
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white/95 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]" />
              Range Alignment
            </h4>
            <p className="text-xs text-white/70 pl-3.5">
              Current prices highly efficient (median-aligned). Regime shift (especially volatility), move and consider your timeline/range.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <button className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white/95 text-sm font-medium py-3 rounded-xl transition">
          Open Pool Analytics View
        </button>
        <button className="px-6 py-3 border border-white/10 text-white/70 hover:text-white/95 text-sm font-medium rounded-xl transition flex items-center gap-2">
          Back to Portfolio
          <ExternalLink className="w-4 h-4" />
        </button>
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
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [ts, setTs] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchPool(poolAddress);
        if (!mounted) return;
        setResponse(data);
        setTs(data.ts ?? Date.now());
      } catch {
        if (!mounted) return;
        setResponse(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [poolAddress]);

  const universe = response?.pool?.universe ?? null;
  const head = response?.pool?.head ?? null;
    const segments = universe?.segments ?? [];
  const degrade = response?.degrade ?? false;

  const token0Symbol = universe?.pair?.token0Symbol ?? null;
  const token1Symbol = universe?.pair?.token1Symbol ?? null;
  const pairLabel = token0Symbol && token1Symbol ? `${token0Symbol} / ${token1Symbol}` : 'Pool';

  // Metrics
  const tvlUsd = universe?.summary?.tvlUsd ?? head?.tvl ?? null;
  const fees7dUsd = universe?.summary?.fees7dUsd ?? head?.fees7d ?? null;
  const fees24hUsd = universe?.summary?.fees24hUsd ?? head?.fees24h ?? null;
  const positionsCount = universe?.summary?.positionsCount ?? head?.positionsCount ?? null;
  const walletsCount = universe?.summary?.walletsCount ?? null;

  const feesPerTvl = tvlUsd && tvlUsd > 0 && fees7dUsd ? (fees7dUsd / tvlUsd * 7) * 1000 : null;
  const apr = tvlUsd && tvlUsd > 0 && fees7dUsd ? (fees7dUsd * 52 / tvlUsd) * 100 : null;

  const lastUpdatedText = ts
    ? new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1530] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-white/10 rounded" />
            <div className="h-32 bg-[#0F1A36]/95 rounded-2xl" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-64 bg-[#0F1A36]/95 rounded-2xl" />
              <div className="h-64 bg-[#0F1A36]/95 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1530] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Back Link */}
        <Link href="/wallet" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white/95 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Pair Detail
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <TokenPairIcon token0Symbol={token0Symbol} token1Symbol={token1Symbol} size={48} />
            <div>
              <h1 className="text-2xl font-bold text-white/95">{pairLabel} Pool — Universe View</h1>
              <p className="text-sm text-white/70">
                Aggregated metrics across all {pairLabel} liquidity pools on Flare
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdatedText && (
              <span className="text-xs text-white/[0.58]">Updated {lastUpdatedText}</span>
            )}
            <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiTile label="Total TVL" value={formatUsd(tvlUsd, true)} subLabel="Across all pools" />
          <KpiTile label={`Fees (${timeRange === '24h' ? '24H' : '7D'})`} value={formatUsd(timeRange === '24h' ? fees24hUsd : fees7dUsd, true)} />
          <KpiTile label="Fee Per $K TVL" value={feesPerTvl ? `$${feesPerTvl.toFixed(0)}` : '—'} subLabel="7 days period" />
          <KpiTile label="Total APR Est." value={formatPct(apr)} highlight={apr !== null && apr > 0} />
          <KpiTile label="Total Positions" value={formatNumber(positionsCount)} />
          <KpiTile label="Active Wallets" value={formatNumber(walletsCount)} />
        </div>

        {/* DEX & Fee Tier Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DexBreakdownSection segments={segments} />
          <FeeTierBreakdownSection segments={segments} />
        </div>

        {/* LP Population & Position Churn */}
        <div className="grid gap-6 lg:grid-cols-2">
          <LpPopulationSection positionsCount={positionsCount} walletsCount={walletsCount} />
          <PositionChurnSection />
        </div>

        {/* RangeBand Landscape */}
        <RangebandLandscapeSection />

        {/* Fee & APR Distribution */}
        <FeeAprDistributionSection tvlUsd={tvlUsd} fees7dUsd={fees7dUsd} />

        {/* Claim Behaviour */}
        <ClaimBehaviourSection />

        {/* Wallet Flows */}
        <WalletFlowsSection />

        {/* Market Regime */}
        <MarketRegimeSection />

        {/* Context Section */}
        <ContextSection token0Symbol={token0Symbol} token1Symbol={token1Symbol} />

        {/* Data Source */}
        <DataSourceDisclaimer className="pt-6" />
      </div>
    </div>
  );
}
