'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCcw, TrendingUp, Info, ExternalLink } from 'lucide-react';

import { DataSourceDisclaimer } from '@/components/DataSourceDisclaimer';
import { cn } from '@/lib/utils';
import { iconCandidates } from '@/lib/icons/symbolMap';
import { TOKEN_ASSETS } from '@/lib/assets';
import { fetchPool, type AnalyticsPoolResponse } from '@/lib/api/analytics';

export interface PoolUniversePageProps {
  poolAddress: string;
}

// ============================================================================
// TYPES
// ============================================================================

type PoolSegment = {
  dex?: string | null;
  feeTierBps?: number | null;
  tvlUsd?: number | null;
  fees7dUsd?: number | null;
  positionsCount?: number | null;
};

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
// SECTION CARD (wallet-style)
// ============================================================================

function SectionCard({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl bg-[#0F1A36]/95 border border-white/10 p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-base font-medium text-white/95">{title}</h2>
        {subtitle && <p className="text-xs text-white/[0.58] mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ============================================================================
// DEX BREAKDOWN
// ============================================================================

function DexBreakdownSection({ segments }: { segments: PoolSegment[] }) {
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
        <div className="h-32 flex items-center justify-center text-white/[0.58] text-sm">
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
            <div className="h-5 bg-white/5 rounded overflow-hidden">
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

function FeeTierBreakdownSection({ segments }: { segments: PoolSegment[] }) {
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
  const colors = ['#3B82F6', '#1BE8D2', '#8B5CF6', '#F59E0B', '#EF4444'];

  if (tierData.length === 0) {
    return (
      <SectionCard title="Fee Tier Breakdown">
        <div className="h-32 flex items-center justify-center text-white/[0.58] text-sm">
          Data warming up...
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Fee Tier Breakdown">
      <div className="space-y-3">
        {tierData.map((tier, i) => (
          <div key={tier.tier} className="flex items-center gap-4">
            <div className="w-16 text-sm text-white/70 font-medium">{tier.tier}</div>
            <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
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
  const distribution = [
    { label: 'Whale', pct: 39, color: '#3B82F6' },
    { label: 'Dolphin', pct: 37, color: '#1BE8D2' },
    { label: 'Shrimp', pct: 24, color: '#8B5CF6' },
  ];

  return (
    <SectionCard title="LP Population & Concentration" subtitle="Wallet-Size Distribution">
      <div className="flex gap-8">
        <div className="relative w-32 h-32">
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
        <div className="flex flex-col justify-center space-y-2">
          {distribution.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-sm text-white/70">{seg.label}</span>
              <span className="text-sm font-medium text-white/95 ml-2 tabular-nums">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-white/[0.58] uppercase tracking-wide">Avg Positions/Wallet</div>
          <div className="text-xl font-bold text-white/95 mt-1 tabular-nums">
            {positionsCount && walletsCount && walletsCount > 0 ? (positionsCount / walletsCount).toFixed(1) : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/[0.58] uppercase tracking-wide">Avg LP Duration</div>
          <div className="text-xl font-bold text-white/95 mt-1 tabular-nums">48.8%</div>
          <div className="text-xs text-white/[0.58]">of positions held &gt; 30d</div>
        </div>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// POSITION COUNT & CHURN
// ============================================================================

function PositionChurnSection() {
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
      <div className="h-24 flex items-end gap-1">
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
                <div className="flex-1 h-3 bg-white/5 rounded overflow-hidden">
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
        <div className="mt-4">
          <div className="text-xs text-white/[0.58] mb-2">Crowded Price Zones</div>
          <div className="h-16 bg-white/5 rounded flex items-end justify-around p-2">
            {[30, 65, 100, 85, 45, 25, 15].map((h, i) => (
              <div key={i} className="w-4 bg-[#3B82F6]/60 rounded-t" style={{ height: `${h}%` }} />
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
          <div className="relative w-28 h-28">
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
                      strokeWidth="10"
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={-offset}
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold text-white/95 tabular-nums">72%</div>
              <div className="text-xs text-white/[0.58]">In-Range</div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-2">
            {rangeStatus.map((seg) => (
              <div key={seg.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
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
        <div className="h-24 flex items-end gap-0.5">
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
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/[0.58]">
              <span>Average ROI</span>
              <Info className="w-3 h-3" />
            </div>
            <div className="text-2xl font-bold text-white/95 mt-1 tabular-nums">
              {formatUsd(tvlUsd && fees7dUsd ? fees7dUsd * 52 : null, true)}
            </div>
            <div className="text-xs text-white/[0.58]">TYL weighted</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-white/[0.58]">
              <span>Fees Per Capital</span>
              <Info className="w-3 h-3" />
            </div>
            <div className="text-2xl font-bold text-[#10B981] mt-1 tabular-nums">
              {formatPct(feePerCapital)}
            </div>
            <div className="text-xs text-white/[0.58]">Per week&apos;s share</div>
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
      <SectionCard title="Claim Behaviour & Cash-flow" subtitle="Claim Activity by Wallet Size">
        <div className="space-y-3">
          {[
            { label: 'Retail', claims: '18 days', highlight: false, pct: '4.2%' },
            { label: 'Mid', claims: '12 days', highlight: true, pct: '2.5%' },
            { label: 'Whale', claims: '8 days', highlight: false, pct: '1.5%' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-14">{row.label}</span>
                <span className={`text-sm font-medium ${row.highlight ? 'text-[#3B82F6]' : 'text-white/95'}`}>
                  Avg {row.claims}
                </span>
              </div>
              <span className="text-xs text-white/[0.58] bg-white/5 px-2 py-0.5 rounded tabular-nums">{row.pct}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Claim Timing Insights">
        <div className="space-y-2 text-sm text-white/70">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] mt-1.5 shrink-0" />
            <span>Claims spike after high-yield days</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] mt-1.5 shrink-0" />
            <span>8-10% claim within 48h of price movements</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] mt-1.5 shrink-0" />
            <span>Weekend activity 24% lower than weekdays</span>
          </div>
        </div>
        <div className="mt-3 p-3 bg-[#3B82F6]/10 rounded-lg border border-[#3B82F6]/20">
          <div className="flex items-center gap-2 text-xs text-[#3B82F6] font-medium">
            <TrendingUp className="w-3 h-3" />
            Fee Insight
          </div>
          <p className="text-xs text-white/70 mt-1">
            Consider claim timing around system events for optimal gas efficiency.
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
      <SectionCard title="Wallet Flows" subtitle="Net TVL Flow (30D)">
        <div className="h-24 flex items-center">
          <div className="w-full h-16 bg-white/5 rounded relative overflow-hidden">
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
            <div key={i} className="flex items-center justify-between py-1 border-b border-white/[0.03] last:border-0">
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
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Regime', value: 'Normal', color: 'text-white/95' },
          { label: 'Trend (7D)', value: '↗', color: 'text-[#10B981]' },
          { label: 'Ann. Vol.', value: '12', color: 'text-white/95' },
          { label: 'ATR (7D)', value: '9', color: 'text-white/95' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-xs text-white/[0.58] uppercase tracking-wide">{item.label}</div>
            <div className={`text-lg font-bold ${item.color} mt-1 tabular-nums`}>{item.value}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-xs text-white/[0.58] mb-2">Volatility Timeline</div>
        <div className="h-12 bg-white/5 rounded flex items-end gap-0.5 p-2">
          {[20, 35, 25, 45, 30, 55, 40, 30, 25, 35, 28, 22].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${h > 40 ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]/60'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 p-3 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20">
        <p className="text-xs text-white/70">
          <span className="text-[#10B981] font-medium">Low volatility</span> — Conservative ranges recommended. Lighter ranges stay in range longer.
        </p>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// CONTEXT SECTION
// ============================================================================

function ContextSection({ token0Symbol: _token0Symbol, token1Symbol: _token1Symbol }: { token0Symbol: string | null; token1Symbol: string | null }) {
  return (
    <SectionCard title="How This Pool Affects Your Position" className="bg-[#0F1A36]/95">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {[
            { title: 'OG = Yield', desc: 'Organic fees and stable incentives in Flare DeFi.' },
            { title: 'Range & Diversity', desc: 'Flexible time to stay at wider bands with 0.3x fee ratio.' },
            { title: 'Efficiency Risk', desc: 'Position density growing; higher competition for fees.' },
          ].map((item) => (
            <div key={item.title}>
              <h4 className="text-sm font-medium text-white/95 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]" />
                {item.title}
              </h4>
              <p className="text-xs text-white/70 pl-3.5 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[
            { title: 'Concentration & Tiers', desc: 'Popular tiers attract more activity.' },
            { title: 'Liquidity Distribution', desc: 'Compare your liquidity vs median responsiveness.' },
            { title: 'Range Alignment', desc: 'Current prices median-aligned; consider regime shifts.' },
          ].map((item) => (
            <div key={item.title}>
              <h4 className="text-sm font-medium text-white/95 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2]" />
                {item.title}
              </h4>
              <p className="text-xs text-white/70 pl-3.5 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white/95 text-sm font-medium py-2.5 rounded-lg transition">
          Open Pool Analytics
        </button>
        <Link href="/wallet" className="px-4 py-2.5 border border-white/10 text-white/70 hover:text-white/95 text-sm font-medium rounded-lg transition flex items-center gap-2">
          Back to Portfolio
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
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

  // Extract data from response
  const pool = response?.pool;
  const head = pool?.head ?? null;
  const universe = pool?.universe ?? null;
  const segments: PoolSegment[] = universe?.segments ?? [];

  const pair = universe?.pair ?? null;
  const summary = universe?.summary ?? null;
  
  const token0Symbol = pair?.token0Symbol ?? null;
  const token1Symbol = pair?.token1Symbol ?? null;
  const pairLabel = token0Symbol && token1Symbol ? `${token0Symbol} / ${token1Symbol}` : 'Pool';

  // Metrics
  const tvlUsd = summary?.tvlUsd ?? head?.tvlUsd ?? null;
  const fees7dUsd = summary?.fees7dUsd ?? head?.fees7dUsd ?? null;
  const fees24hUsd = summary?.fees24hUsd ?? head?.fees24hUsd ?? null;
  const positionsCount = summary?.positionsCount ?? head?.positionsCount ?? null;
  const walletsCount = summary?.walletsCount ?? null;

  const lastUpdatedText = ts
    ? new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
      {/* Header - wallet style */}
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

      {/* Tabs - wallet style */}
      <div className="border-b border-white/10 mb-8">
        <div className="flex gap-0">
          <button className="relative px-6 py-4 text-white/95">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-6">
                <div className="h-3 w-20 bg-white/10 rounded mb-3 animate-pulse" />
                <div className="h-7 w-28 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-6 h-48 animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Row - 6 tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-1">Total TVL</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">{formatUsd(tvlUsd, true)}</div>
              <div className="text-xs text-white/[0.58] mt-1">Across all pools</div>
            </div>
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-1">Fees ({timeRange === '24h' ? '24H' : '7D'})</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">{formatUsd(timeRange === '24h' ? fees24hUsd : fees7dUsd, true)}</div>
            </div>
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-1">Fee per $K TVL</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">
                {tvlUsd && tvlUsd > 0 && fees7dUsd ? `$${(fees7dUsd / tvlUsd * 1000).toFixed(2)}` : '—'}
              </div>
              <div className="text-xs text-white/[0.58] mt-1">7 days period</div>
            </div>
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-1">Total APR Est.</div>
              <div className={cn("text-2xl font-bold tabular-nums", tvlUsd && fees7dUsd ? "text-[#10B981]" : "text-white/95")}>
                {tvlUsd && tvlUsd > 0 && fees7dUsd ? formatPct((fees7dUsd * 52 / tvlUsd) * 100) : '—'}
              </div>
            </div>
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-1">Total Positions</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">{formatNumber(positionsCount)}</div>
            </div>
            <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-white/[0.58] mb-1">Active Wallets</div>
              <div className="text-2xl font-bold tabular-nums text-white/95">{formatNumber(walletsCount)}</div>
            </div>
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
          <DataSourceDisclaimer className="pt-4" />
        </div>
      )}
    </div>
  );
}
