import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TokenPairIcon } from "../components/TokenIcon";
import { Rangeband } from "../components/Rangeband";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { DataStateBanner, WarmingPlaceholder, type DataState } from "../components/DataStateBanner";
import { DataSourceDisclaimer } from "../components/DataSourceDisclaimer";
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
  Percent,
  Calendar,
  Plus,
  Minus,
  Award
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from "recharts@2.15.0";

// Mock data generators
const generateRangePerformanceData = (period: string) => {
  const dataPoints = period === '7D' ? 7 : period === '30D' ? 30 : 90;
  return Array.from({ length: dataPoints }, (_, i) => ({
    day: `D${i + 1}`,
    price: 1.275 + Math.sin(i * 0.3) * 0.25 + (Math.random() - 0.5) * 0.1,
    minRange: 0.98,
    maxRange: 1.93,
    inRange: Math.random() > 0.15,
    efficiency: 75 + Math.random() * 20,
  }));
};

const generateFeeEarningsData = (period: string) => {
  const dataPoints = period === '7D' ? 7 : period === '30D' ? 30 : 90;
  return Array.from({ length: dataPoints }, (_, i) => ({
    day: `D${i + 1}`,
    fees: Math.floor(Math.random() * 150) + 50,
    cumulative: (i + 1) * 180 + Math.floor(Math.random() * 100),
  }));
};

const generateImpermanentLossData = (period: string) => {
  const dataPoints = period === '7D' ? 7 : period === '30D' ? 30 : 90;
  return Array.from({ length: dataPoints }, (_, i) => ({
    day: `D${i + 1}`,
    il: -2.5 + Math.sin(i * 0.4) * 1.8,
    hodl: (i + 1) * 0.3,
    lp: (i + 1) * 0.5 - 2,
  }));
};

const positionEventsData = [
  {
    type: 'Liquidity Added',
    date: '2024-11-15',
    amount: '$45,000',
    token0: '18,500 WFLR',
    token1: '23,612 FXRP',
    txHash: '0x1a2b3c...',
  },
  {
    type: 'Fees Claimed',
    date: '2024-11-20',
    amount: '$1,240',
    token0: '512 WFLR',
    token1: '654 FXRP',
    txHash: '0x4d5e6f...',
  },
  {
    type: 'Liquidity Added',
    date: '2024-11-22',
    amount: '$12,000',
    token0: '4,950 WFLR',
    token1: '6,327 FXRP',
    txHash: '0x7g8h9i...',
  },
  {
    type: 'Fees Claimed',
    date: '2024-11-27',
    amount: '$890',
    token0: '367 WFLR',
    token1: '469 FXRP',
    txHash: '0xj1k2l3...',
  },
];

const peerComparisonData = [
  { metric: 'TVL Size', you: '$73,000', peersMedian: '$52,000', percentile: 'Top 25%', better: true },
  { metric: 'Realized APR (30D)', you: '20.1%', peersMedian: '16.4%', percentile: 'Top 20%', better: true },
  { metric: 'Time in Range (30D)', you: '86%', peersMedian: '72%', percentile: 'Top 30%', better: true },
  { metric: 'Claim Latency (avg)', you: '4.2 days', peersMedian: '8.5 days', percentile: 'Top 15%', better: true },
  { metric: 'Impermanent Loss (30D)', you: '-1.8%', peersMedian: '-3.2%', percentile: 'Top 35%', better: true },
];

export function PositionProPage() {
  const { id } = useParams();
  const [timePeriod, setTimePeriod] = useState('30D');
  
  // Data state simulation - EXPLICITLY TEST ALL THREE STATES
  // Change this value to test different states: 'ok' | 'warming' | 'empty'
  const positionDataState: DataState = 'ok'; // ⭐ CHANGE TO TEST STATES
  
  const rangePerformanceData = generateRangePerformanceData(timePeriod);
  const feeEarningsData = generateFeeEarningsData(timePeriod);
  const impermanentLossData = generateImpermanentLossData(timePeriod);

  // Position metadata
  const positionMeta = {
    tokenId: '#18745',
    dex: 'ENOSYS',
    feeTier: '0.3%',
    token0: 'WFLR',
    token1: 'FXRP',
    minPrice: 0.98,
    maxPrice: 1.93,
    currentPrice: 1.275,
    strategyPercent: '65.3%',
    mintDate: '2024-11-15',
    daysActive: 15,
  };

  // Calculated metrics
  const totalValueLocked = 73000;
  const totalFeesEarned = 5420;
  const unclaimedFees = 2130;
  const realizedAPR = 20.1;
  const rangeEfficiency = 86;
  const daysInRange = 13;
  const daysOutOfRange = 2;
  const impermanentLoss = -1.8;
  const netPnL = 3540;

  // CONDITIONAL RENDERING: Show empty state if data state is 'empty'
  if (positionDataState === 'empty') {
    return (
      <div className="min-h-screen relative">
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-8">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-white/70 hover:text-[#3B82F6] mb-6 transition-colors">
            <ArrowLeft className="size-4" />
            Back to My Portfolio
          </Link>

          <DataStateBanner
            state="empty"
            message="We don't have enough history yet to show detailed analytics for this position. Check back soon as we build the dataset."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-white/70 hover:text-[#3B82F6] mb-6 transition-colors">
          <ArrowLeft className="size-4" />
          Back to My Portfolio
        </Link>

        {/* Data State Banner (if warming) */}
        {positionDataState === 'warming' && (
          <DataStateBanner
            state="warming"
            message="Position data warming up — some analytics are based on partial history while we build the full 7-day dataset."
            className="mb-6"
          />
        )}

        {/* FTSO Data Source Disclaimer */}
        <DataSourceDisclaimer className="mb-6" />

        {/* A. POSITION HEADER */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <TokenPairIcon token1={positionMeta.token0} token2={positionMeta.token1} size="large" />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-white/95">
                    {positionMeta.token0} / {positionMeta.token1}
                  </h1>
                  <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                    Pro
                  </Badge>
                  <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                    In Range
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/[0.58]">Position {positionMeta.tokenId}</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/[0.58]">{positionMeta.feeTier} fee</span>
                  <Badge variant="outline" className="text-[#1BE8D2] border-[#1BE8D2]/30 text-xs">
                    {positionMeta.dex}
                  </Badge>
                  <span className="text-white/40">·</span>
                  <span className="text-white/[0.58] flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Opened {positionMeta.mintDate}
                  </span>
                </div>
              </div>
            </div>

            {/* View on Explorer */}
            <Button variant="outline" className="border-white/20 text-white/95 hover:bg-white/5 gap-2">
              <ExternalLink className="size-4" />
              View on Explorer
            </Button>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
              <div className="text-xs text-white/[0.58] mb-1">Position Value</div>
              <div className="text-white/95 numeric" style={{ fontSize: '18px' }}>
                ${totalValueLocked.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
              <div className="text-xs text-white/[0.58] mb-1">Total Fees Earned</div>
              <div className="text-[#10B981] numeric" style={{ fontSize: '18px' }}>
                ${totalFeesEarned.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
              <div className="text-xs text-white/[0.58] mb-1">Realized APR (30D)</div>
              <div className="text-[#10B981] numeric" style={{ fontSize: '18px' }}>
                {realizedAPR}%
              </div>
            </div>
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
              <div className="text-xs text-white/[0.58] mb-1">Days Active</div>
              <div className="text-white/95 numeric" style={{ fontSize: '18px' }}>
                {positionMeta.daysActive}
              </div>
            </div>
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
              <div className="text-xs text-white/[0.58] mb-1">Range Efficiency (30D)</div>
              <div className="text-[#10B981] numeric" style={{ fontSize: '18px' }}>
                {rangeEfficiency}%
              </div>
            </div>
          </div>
        </div>

        {/* Time Range Toggle (Global) */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white/95">Position Analytics</h2>
          <div className="inline-flex items-center bg-[#0B1530]/60 border border-white/10 rounded-lg p-1 gap-1">
            {['7D', '30D', '90D'].map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded text-sm transition-all ${
                  timePeriod === period
                    ? "bg-[#3B82F6] text-white"
                    : "text-white/70 hover:text-white/95"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* B. RANGEBAND STATUS & PERFORMANCE */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-white/95 mb-6">RangeBand™ Status & Performance</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* RangeBand Visualization */}
            <div>
              <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 mb-4">
                <Rangeband
                  minPrice={positionMeta.minPrice}
                  maxPrice={positionMeta.maxPrice}
                  currentPrice={positionMeta.currentPrice}
                  strategyLabel={`Balanced (${positionMeta.strategyPercent})`}
                  pairLabel={`${positionMeta.token0}/${positionMeta.token1}`}
                  variant="card"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                  <div className="text-xs text-white/[0.58] mb-1">Days In Range (30D)</div>
                  <div className="text-[#10B981] numeric" style={{ fontSize: '20px' }}>
                    {daysInRange}
                  </div>
                  <div className="text-xs text-white/40 mt-1">{rangeEfficiency}% efficiency</div>
                </div>
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                  <div className="text-xs text-white/[0.58] mb-1">Days Out of Range (30D)</div>
                  <div className="text-[#EF4444] numeric" style={{ fontSize: '20px' }}>
                    {daysOutOfRange}
                  </div>
                  <div className="text-xs text-white/40 mt-1">{100 - rangeEfficiency}% idle time</div>
                </div>
              </div>
            </div>

            {/* Range Performance Chart */}
            <div>
              <h3 className="text-white/95 mb-4">Price vs Range ({timePeriod})</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rangePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                      domain={[0.8, 2.0]}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 26, 54, 0.95)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <ReferenceLine y={positionMeta.minPrice} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Min', fill: '#EF4444', fontSize: 11 }} />
                    <ReferenceLine y={positionMeta.maxPrice} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Max', fill: '#EF4444', fontSize: 11 }} />
                    <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-white/40 mt-3">
                Price movements relative to your range boundaries. Red dashed lines mark min/max.
              </p>
            </div>
          </div>
        </div>

        {/* C. FEE EARNINGS BREAKDOWN */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-white/95 mb-6">Fee Earnings Breakdown ({timePeriod})</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="size-5 text-[#10B981]" />
                </div>
                <div className="text-xs text-white/[0.58]">Total Fees Earned</div>
              </div>
              <div className="text-white/95 numeric mb-1" style={{ fontSize: '24px' }}>
                ${totalFeesEarned.toLocaleString()}
              </div>
              <p className="text-xs text-white/40">Lifetime earnings</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <Clock className="size-5 text-[#F59E0B]" />
                </div>
                <div className="text-xs text-white/[0.58]">Unclaimed Fees</div>
              </div>
              <div className="text-[#F59E0B] numeric mb-1" style={{ fontSize: '24px' }}>
                ${unclaimedFees.toLocaleString()}
              </div>
              <p className="text-xs text-white/40">Ready to claim</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <Percent className="size-5 text-[#10B981]" />
                </div>
                <div className="text-xs text-white/[0.58]">Realized APR (30D)</div>
              </div>
              <div className="text-[#10B981] numeric mb-1" style={{ fontSize: '24px' }}>
                {realizedAPR}%
              </div>
              <p className="text-xs text-white/40">Annualized return</p>
            </div>
          </div>

          {/* Fee Earnings Chart */}
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={feeEarningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                  label={{ value: 'Daily Fees ($)', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.58)', fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                  label={{ value: 'Cumulative ($)', angle: 90, position: 'insideRight', style: { fill: 'rgba(255,255,255,0.58)', fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 26, 54, 0.95)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar yAxisId="left" dataKey="fees" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* D. IMPERMANENT LOSS TRACKING */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-white/95 mb-6">Impermanent Loss & Net P&L ({timePeriod})</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="size-5 text-[#EF4444]" />
                </div>
                <div className="text-xs text-white/[0.58]">Impermanent Loss (30D)</div>
              </div>
              <div className="text-[#EF4444] numeric mb-1" style={{ fontSize: '24px' }}>
                {impermanentLoss}%
              </div>
              <p className="text-xs text-white/40">vs HODL strategy</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="size-5 text-[#10B981]" />
                </div>
                <div className="text-xs text-white/[0.58]">Net P&L (30D)</div>
              </div>
              <div className="text-[#10B981] numeric mb-1" style={{ fontSize: '24px' }}>
                +${netPnL.toLocaleString()}
              </div>
              <p className="text-xs text-white/40">Fees - IL</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <Award className="size-5 text-[#1BE8D2]" />
                </div>
                <div className="text-xs text-white/[0.58]">LP vs HODL (30D)</div>
              </div>
              <div className="text-[#10B981] numeric mb-1" style={{ fontSize: '24px' }}>
                +4.2%
              </div>
              <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30 mt-2">
                LP Outperforming
              </Badge>
            </div>
          </div>

          {/* IL Comparison Chart */}
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={impermanentLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                  tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 26, 54, 0.95)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="hodl" stackId="1" stroke="#F59E0B" fill="rgba(245, 158, 11, 0.2)" />
                <Area type="monotone" dataKey="lp" stackId="2" stroke="#10B981" fill="rgba(16, 185, 129, 0.2)" />
                <Line type="monotone" dataKey="il" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-white/40 mt-3">
            Comparison of LP position returns (green) vs HODL strategy (amber). Dashed red line shows impermanent loss.
          </p>
        </div>

        {/* E. POSITION EVENTS HISTORY */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-white/95 mb-6">Position Events History</h2>

          <div className="space-y-3">
            {positionEventsData.map((event, idx) => (
              <div key={idx} className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center`}>
                      {event.type === 'Liquidity Added' ? (
                        <Plus className="size-5 text-[#10B981]" />
                      ) : event.type === 'Fees Claimed' ? (
                        <DollarSign className="size-5 text-[#3B82F6]" />
                      ) : (
                        <Minus className="size-5 text-[#EF4444]" />
                      )}
                    </div>
                    <div>
                      <div className="text-white/95 mb-1">{event.type}</div>
                      <div className="text-xs text-white/[0.58]">{event.date}</div>
                    </div>
                  </div>
                  <Badge
                    className={
                      event.type === 'Liquidity Added'
                        ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
                        : event.type === 'Fees Claimed'
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30'
                        : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
                    }
                  >
                    {event.amount}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-white/40 mb-1">Token 0</div>
                    <div className="text-white/95">{event.token0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Token 1</div>
                    <div className="text-white/95">{event.token1}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Transaction</div>
                    <a
                      href="#"
                      className="text-[#3B82F6] hover:underline text-xs flex items-center gap-1"
                    >
                      {event.txHash}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* F. PEER COMPARISON (PRO) */}
        {positionDataState === 'warming' ? (
          <WarmingPlaceholder
            title="Peer Comparison Analytics"
            description="Building comparison dataset across similar positions in this pool"
            className="mb-8"
          />
        ) : (
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-white/95 mb-6">Peer Comparison (Pro)</h2>
            <p className="text-white/70 mb-6">
              Compare your position against other LPs with similar range strategies in the same pool
            </p>

            <div className="space-y-3">
              {peerComparisonData.map((comparison, idx) => (
                <div key={idx} className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-white/95">{comparison.metric}</div>
                      {comparison.better && (
                        <CheckCircle2 className="size-4 text-[#10B981]" />
                      )}
                    </div>
                    <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                      {comparison.percentile}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs text-white/40 mb-1">Your Position</div>
                      <div className="text-white/95 numeric" style={{ fontSize: '18px' }}>
                        {comparison.you}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">Peers Median</div>
                      <div className="text-white/70 numeric" style={{ fontSize: '18px' }}>
                        {comparison.peersMedian}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/40 mt-4">
              Peer group: Balanced strategy positions (12-35% width) in WFLR/FXRP pool with similar TVL size
            </p>
          </div>
        )}

        {/* G. INSIGHTS & RECOMMENDATIONS */}
        <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#1BE8D2]/5 border-2 border-[#3B82F6]/30 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="size-5 text-[#1BE8D2]" />
            <h2 className="text-white/95">
              Position Health & Recommendations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white/95 mb-1">Strong Range Efficiency</div>
                  <p className="text-sm text-white/70">
                    Your 86% in-range time is excellent for a Balanced strategy. You're capturing fees consistently.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white/95 mb-1">Above-Median APR</div>
                  <p className="text-sm text-white/70">
                    Your 20.1% realized APR exceeds pool median (16.4%). Range placement is working well.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white/95 mb-1">Consider Claiming Fees</div>
                  <p className="text-sm text-white/70">
                    You have $2,130 unclaimed. Whales in this pool claim every 8 days on average. Consider claiming to reduce smart contract risk.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white/95 mb-1">Low Impermanent Loss</div>
                  <p className="text-sm text-white/70">
                    Your -1.8% IL is better than pool median (-3.2%). Stable price range helps minimize IL.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white/95 mb-1">Outperforming HODL</div>
                  <p className="text-sm text-white/70">
                    Net P&L shows +4.2% advantage over simple holding. LP strategy is paying off.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white/95 mb-1">Monitor Volatility Regime</div>
                  <p className="text-sm text-white/70">
                    Current Normal regime suits your Balanced strategy. If volatility spikes, consider tightening range.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Link to={`/pool/${id}/pro`}>
              <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                View Pool Analytics
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="outline" className="border-white/20 text-white/95 hover:bg-white/5">
                Back to Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
