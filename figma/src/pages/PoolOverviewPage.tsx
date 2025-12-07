import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { TokenPairIcon } from '../components/TokenIcon';
import { Rangeband } from '../components/Rangeband';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3,
  Clock,
  AlertTriangle,
  Activity,
  ExternalLink,
  Zap,
  Target,
  Shield,
  Plus,
  Minus,
  Link2
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  ReferenceLine
} from 'recharts';

type TimeRange = '24h' | '7D' | '30D' | '90D';

export function PoolOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const [isLoading] = useState(false);
  const [hasError] = useState(false);

  // Mock pool data
  const poolData = {
    token1: 'WFLR',
    token2: 'FXRP',
    dex: 'ENOSYS',
    poolId: `#${id}`,
    fee: '0.3%',
    chain: 'Flare',
    hasRangeBand: true,
    hasIncentives: true,
    isHighTVL: true
  };

  // Mock global KPIs
  const globalKPIs = {
    totalTVL: { value: 2847123, change: 12.4 },
    volume24h: { value: 184932, change: -3.2 },
    fees24h: { value: 554.80, change: 8.1 },
    avgAPR: { min: 18.5, max: 42.3, change: 5.7 },
    activeLPs: { value: 127, change: 4 }
  };

  // Mock price chart data
  const priceData = [
    { time: '00:00', price: 1.245, minRange: 0.98, maxRange: 1.93 },
    { time: '04:00', price: 1.268, minRange: 0.98, maxRange: 1.93 },
    { time: '08:00', price: 1.251, minRange: 0.98, maxRange: 1.93 },
    { time: '12:00', price: 1.289, minRange: 0.98, maxRange: 1.93 },
    { time: '16:00', price: 1.275, minRange: 0.98, maxRange: 1.93 },
    { time: '20:00', price: 1.262, minRange: 0.98, maxRange: 1.93 },
    { time: '24:00', price: 1.280, minRange: 0.98, maxRange: 1.93 }
  ];

  // Mock liquidity & volume data
  const liquidityData = [
    { day: 'Mon', tvl: 2650000, volume: 145000 },
    { day: 'Tue', tvl: 2720000, volume: 168000 },
    { day: 'Wed', tvl: 2680000, volume: 152000 },
    { day: 'Thu', tvl: 2790000, volume: 189000 },
    { day: 'Fri', tvl: 2840000, volume: 195000 },
    { day: 'Sat', tvl: 2825000, volume: 172000 },
    { day: 'Sun', tvl: 2847000, volume: 184000 }
  ];

  // Mock fee generation data
  const feeData = [
    { day: 'Mon', fees: 435 },
    { day: 'Tue', fees: 504 },
    { day: 'Wed', fees: 456 },
    { day: 'Thu', fees: 567 },
    { day: 'Fri', fees: 585 },
    { day: 'Sat', fees: 516 },
    { day: 'Sun', fees: 554 }
  ];

  // Mock RangeBand distribution
  const rangeBandDistribution = [
    { strategy: 'Aggressive', count: 45, percentage: 35.4 },
    { strategy: 'Balanced', count: 58, percentage: 45.7 },
    { strategy: 'Conservative', count: 24, percentage: 18.9 }
  ];

  const rangeBandStats = {
    inRange: 78.5,
    abovePrice: 12.6,
    belowPrice: 8.9,
    avgBandWidth: 24.3
  };

  // Mock LP concentration data
  const topLPs = [
    { rank: 1, wallet: '0x1234...5678', tvlShare: 12.4, feesShare: 14.2, inRange: true },
    { rank: 2, wallet: '0xabcd...ef01', tvlShare: 9.8, feesShare: 10.1, inRange: true },
    { rank: 3, wallet: '0x9876...5432', tvlShare: 7.2, feesShare: 6.8, inRange: false },
    { rank: 4, wallet: '0xdef0...1234', tvlShare: 6.5, feesShare: 7.3, inRange: true },
    { rank: 5, wallet: '0x4567...89ab', tvlShare: 5.1, feesShare: 4.9, inRange: true }
  ];

  const concentrationData = [
    { segment: 'Top 5 LPs', percentage: 41.0 },
    { segment: 'Next 20 LPs', percentage: 35.2 },
    { segment: 'Remaining LPs', percentage: 23.8 }
  ];

  // Mock pool activity
  const poolActivity = [
    { 
      type: 'Liquidity Added', 
      amount: '$45,230', 
      details: '22,500 WFLR + 35,000 FXRP',
      time: '2 hours ago',
      icon: Plus
    },
    { 
      type: 'Fees Claimed', 
      amount: '$2,340', 
      details: '1,142 WFLR + 890 FXRP',
      time: '4 hours ago',
      icon: DollarSign
    },
    { 
      type: 'Incentive Claimed', 
      amount: '$840', 
      details: 'FLR rewards',
      time: '6 hours ago',
      icon: Link2
    },
    { 
      type: 'Liquidity Removed', 
      amount: '$12,100', 
      details: '6,050 WFLR + 9,400 FXRP',
      time: '8 hours ago',
      icon: Minus
    },
    { 
      type: 'Liquidity Added', 
      amount: '$8,750', 
      details: '4,200 WFLR + 6,800 FXRP',
      time: '10 hours ago',
      icon: Plus
    }
  ];

  // Mock incentive data
  const incentiveData = {
    token: 'rFLR',
    amount: 15000,
    remaining: '12 days',
    aprUplift: 8.5
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#0B1530]">
        <Navigation walletConnected={true} planType="Premium" />
        <div className="px-6 py-12 max-w-7xl mx-auto">
          <Alert className="border-[#EF4444]/50 bg-[#EF4444]/10">
            <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            <AlertDescription className="text-white/95">
              Failed to load pool data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1530]">
      <Navigation walletConnected={true} planType="Premium" />
      
      <div className="px-6 py-12 max-w-7xl mx-auto">
        {/* Back link */}
        <Link 
          to="/pools" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-[#3B82F6] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-['Inter',sans-serif]">Back to My Portfolio</span>
        </Link>

        {/* Pool Header Card */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <TokenPairIcon token1={poolData.token1} token2={poolData.token2} size="large" />
              <div>
                <h1 className="font-['Quicksand',sans-serif] text-white/95 mb-2">
                  {poolData.token1} / {poolData.token2}
                </h1>
                <p className="font-['Inter',sans-serif] text-white/[0.58]">
                  {poolData.dex} • {poolData.poolId} • {poolData.fee} • {poolData.chain}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {poolData.hasRangeBand && (
                <Badge variant="outline" className="bg-[#3B82F6]/20 border-[#3B82F6]/50 text-[#3B82F6]">
                  RangeBand™ supported
                </Badge>
              )}
              {poolData.hasIncentives && (
                <Badge variant="outline" className="bg-[#1BE8D2]/20 border-[#1BE8D2]/50 text-[#1BE8D2]">
                  Incentivized
                </Badge>
              )}
              {poolData.isHighTVL && (
                <Badge variant="outline" className="bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]">
                  High TVL
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Time Range Toggle */}
        <div className="flex justify-end mb-8">
          <div className="inline-flex bg-[#0F1A36]/95 border border-white/10 rounded-lg p-1 gap-1">
            {[
              { value: '24h' as TimeRange, label: '24H' },
              { value: '7D' as TimeRange, label: '7D' },
              { value: '30D' as TimeRange, label: '30D' },
              { value: '90D' as TimeRange, label: '90D' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-md font-['Inter',sans-serif] transition-all ${
                  timeRange === option.value
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Total TVL */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <p className="font-['Inter',sans-serif] text-white/[0.58]">Total TVL</p>
            </div>
            <p className="font-['Inter',sans-serif] text-white/95 numeric mb-1" style={{ fontSize: '24px' }}>
              {formatCurrency(globalKPIs.totalTVL.value)}
            </p>
            <p className={`font-['Inter',sans-serif] numeric ${
              globalKPIs.totalTVL.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {formatChange(globalKPIs.totalTVL.change)}
            </p>
          </div>

          {/* 24H Volume */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <p className="font-['Inter',sans-serif] text-white/[0.58]">24H Volume</p>
            </div>
            <p className="font-['Inter',sans-serif] text-white/95 numeric mb-1" style={{ fontSize: '24px' }}>
              {formatCurrency(globalKPIs.volume24h.value)}
            </p>
            <p className={`font-['Inter',sans-serif] numeric ${
              globalKPIs.volume24h.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {formatChange(globalKPIs.volume24h.change)}
            </p>
          </div>

          {/* 24H Fees */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <p className="font-['Inter',sans-serif] text-white/[0.58]">24H Fees</p>
            </div>
            <p className="font-['Inter',sans-serif] text-white/95 numeric mb-1" style={{ fontSize: '24px' }}>
              {formatCurrency(globalKPIs.fees24h.value)}
            </p>
            <p className={`font-['Inter',sans-serif] numeric ${
              globalKPIs.fees24h.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {formatChange(globalKPIs.fees24h.change)}
            </p>
          </div>

          {/* Average APR */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
              </div>
              <p className="font-['Inter',sans-serif] text-white/[0.58]">Avg APR Range</p>
            </div>
            <p className="font-['Inter',sans-serif] text-white/95 numeric mb-1" style={{ fontSize: '24px' }}>
              {globalKPIs.avgAPR.min}% - {globalKPIs.avgAPR.max}%
            </p>
            <p className={`font-['Inter',sans-serif] numeric ${
              globalKPIs.avgAPR.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {formatChange(globalKPIs.avgAPR.change)}
            </p>
          </div>

          {/* Active LPs */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <p className="font-['Inter',sans-serif] text-white/[0.58]">Active LPs</p>
            </div>
            <p className="font-['Inter',sans-serif] text-white/95 numeric mb-1" style={{ fontSize: '24px' }}>
              {globalKPIs.activeLPs.value}
            </p>
            <p className={`font-['Inter',sans-serif] numeric ${
              globalKPIs.activeLPs.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {formatChange(globalKPIs.activeLPs.change)}
            </p>
          </div>
        </div>

        {/* Price vs Range Chart */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6">Price vs Range Analysis</h2>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full bg-white/5" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontFamily: 'Inter', fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontFamily: 'Inter', fontSize: '12px' }}
                  domain={[0.8, 2.0]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontFamily: 'Inter'
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.95)' }}
                />
                <Legend 
                  wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }}
                />
                <ReferenceLine 
                  y={0.98} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5" 
                  label={{ value: 'Min Range', fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                />
                <ReferenceLine 
                  y={1.93} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5"
                  label={{ value: 'Max Range', fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Current Price"
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Liquidity & Volume Chart */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6">TVL & Volume</h2>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full bg-white/5" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={liquidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontFamily: 'Inter', fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontFamily: 'Inter', fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontFamily: 'Inter', fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontFamily: 'Inter'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend 
                  wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="tvl" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="TVL"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="volume" 
                  fill="#1BE8D2" 
                  fillOpacity={0.6}
                  name="Volume"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fee Generation Chart */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6 mb-12">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6">Fee Generation</h2>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full bg-white/5" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontFamily: 'Inter', fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontFamily: 'Inter', fontSize: '12px' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontFamily: 'Inter'
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar 
                  dataKey="fees" 
                  fill="#10B981" 
                  fillOpacity={0.8}
                  name="Fees Generated"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* RangeBand Distribution */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-8">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6">RangeBand™ Distribution</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strategy Distribution Chart */}
            <div>
              <h3 className="font-['Inter',sans-serif] text-white/70 mb-4">LP Positions by Strategy</h3>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full bg-white/5" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={rangeBandDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="strategy" 
                      stroke="rgba(255,255,255,0.4)"
                      style={{ fontFamily: 'Inter', fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)"
                      style={{ fontFamily: 'Inter', fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontFamily: 'Inter'
                      }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" fillOpacity={0.8} name="LP Count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribution Stats */}
            <div>
              <h3 className="font-['Inter',sans-serif] text-white/70 mb-4">Range Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-['Inter',sans-serif] text-white/[0.58]">In Range</span>
                  <span className="font-['Inter',sans-serif] text-[#10B981] numeric">{rangeBandStats.inRange}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Inter',sans-serif] text-white/[0.58]">Above Price</span>
                  <span className="font-['Inter',sans-serif] text-white/70 numeric">{rangeBandStats.abovePrice}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Inter',sans-serif] text-white/[0.58]">Below Price</span>
                  <span className="font-['Inter',sans-serif] text-white/70 numeric">{rangeBandStats.belowPrice}%</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-['Inter',sans-serif] text-white/[0.58]">Avg Band Width</span>
                  <span className="font-['Inter',sans-serif] text-white/95 numeric">{rangeBandStats.avgBandWidth}%</span>
                </div>
              </div>

              {/* Sample RangeBands */}
              <div className="mt-6 space-y-4">
                <h4 className="font-['Inter',sans-serif] text-white/[0.58]">Sample LP Positions</h4>
                <Rangeband 
                  currentPrice={1.275}
                  minPrice={1.15}
                  maxPrice={1.42}
                  strategyPercent="8.5%"
                  token1={poolData.token1}
                  token2={poolData.token2}
                  compact
                />
                <Rangeband 
                  currentPrice={1.275}
                  minPrice={0.98}
                  maxPrice={1.54}
                  strategyPercent="25.0%"
                  token1={poolData.token1}
                  token2={poolData.token2}
                  compact
                />
              </div>
            </div>
          </div>
        </div>

        {/* LP Concentration & Segmentation */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-8">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6">Liquidity Distribution</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top LPs Table */}
            <div>
              <h3 className="font-['Inter',sans-serif] text-white/70 mb-4">Top LP Positions</h3>
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[60px_1fr_80px_80px_80px] gap-4 pb-2 border-b border-white/[0.03]">
                  <span className="font-['Inter',sans-serif] text-white/40">Rank</span>
                  <span className="font-['Inter',sans-serif] text-white/40">Wallet</span>
                  <span className="font-['Inter',sans-serif] text-white/40 text-right">TVL %</span>
                  <span className="font-['Inter',sans-serif] text-white/40 text-right">Fees %</span>
                  <span className="font-['Inter',sans-serif] text-white/40 text-right">Status</span>
                </div>
                
                {/* Rows */}
                {topLPs.map((lp) => (
                  <div 
                    key={lp.rank}
                    className="grid grid-cols-[60px_1fr_80px_80px_80px] gap-4 py-3 border-b border-white/[0.03] last:border-0"
                  >
                    <span className="font-['Inter',sans-serif] text-white/70 numeric">#{lp.rank}</span>
                    <span className="font-['Inter',sans-serif] text-white/70 font-mono">{lp.wallet}</span>
                    <span className="font-['Inter',sans-serif] text-white/95 numeric text-right">{lp.tvlShare}%</span>
                    <span className="font-['Inter',sans-serif] text-white/95 numeric text-right">{lp.feesShare}%</span>
                    <div className="flex justify-end">
                      {lp.inRange ? (
                        <Badge variant="outline" className="bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]">
                          In Range
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-[#EF4444]/20 border-[#EF4444]/50 text-[#EF4444]">
                          Out
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concentration Chart */}
            <div>
              <h3 className="font-['Inter',sans-serif] text-white/70 mb-4">Concentration</h3>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full bg-white/5" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={concentrationData}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      type="number"
                      stroke="rgba(255,255,255,0.4)"
                      style={{ fontFamily: 'Inter', fontSize: '12px' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="segment"
                      stroke="rgba(255,255,255,0.4)"
                      style={{ fontFamily: 'Inter', fontSize: '12px' }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontFamily: 'Inter'
                      }}
                      formatter={(value: number) => `${value}%`}
                    />
                    <Bar dataKey="percentage" fill="#3B82F6" fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Incentives & Risk - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Incentives Program */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-[#1BE8D2]" />
              <h2 className="font-['Quicksand',sans-serif] text-white/95">Incentives Program</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-['Inter',sans-serif] text-white/[0.58]">Reward Token</span>
                <span className="font-['Inter',sans-serif] text-white/95 numeric">{incentiveData.token}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-['Inter',sans-serif] text-white/[0.58]">Pool Allocation</span>
                <span className="font-['Inter',sans-serif] text-white/95 numeric">
                  {incentiveData.amount.toLocaleString()} {incentiveData.token}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-['Inter',sans-serif] text-white/[0.58]">Time Remaining</span>
                <span className="font-['Inter',sans-serif] text-white/95">{incentiveData.remaining}</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between items-center">
                <span className="font-['Inter',sans-serif] text-white/[0.58]">APR Uplift</span>
                <span className="font-['Inter',sans-serif] text-[#10B981] numeric">
                  +{incentiveData.aprUplift}%
                </span>
              </div>
              
              {/* Timeline bar */}
              <div className="mt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1BE8D2] rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="font-['Inter',sans-serif] text-white/40 mt-2">65% of program duration remaining</p>
              </div>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="font-['Quicksand',sans-serif] text-white/95">Risk Indicators</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-['Inter',sans-serif] text-white/[0.58]">Price Volatility</span>
                <Badge variant="outline" className="bg-[#F59E0B]/20 border-[#F59E0B]/50 text-[#F59E0B]">
                  Medium
                </Badge>
              </div>
              <p className="font-['Inter',sans-serif] text-white/40">
                7-day price volatility: 8.5% (typical for this pair)
              </p>

              <div className="h-px bg-white/10 my-4" />

              <div className="flex justify-between items-center">
                <span className="font-['Inter',sans-serif] text-white/[0.58]">Fee Volatility</span>
                <Badge variant="outline" className="bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]">
                  Low
                </Badge>
              </div>
              <p className="font-['Inter',sans-serif] text-white/40">
                Stable fee generation with low variance
              </p>

              <div className="h-px bg-white/10 my-4" />

              <div className="flex justify-between items-center">
                <span className="font-['Inter',sans-serif] text-white/[0.58]">Out-of-Range Risk</span>
                <Badge variant="outline" className="bg-[#F59E0B]/20 border-[#F59E0B]/50 text-[#F59E0B]">
                  Moderate
                </Badge>
              </div>
              <p className="font-['Inter',sans-serif] text-white/40">
                15% of time outside typical LP bands (7D average)
              </p>
            </div>
          </div>
        </div>

        {/* Pool Activity Feed */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="size-5 text-white/[0.58]" />
              <h2 className="font-heading text-white/95">Pool Activity</h2>
            </div>
          </div>

          <div className="space-y-2">
            {poolActivity.map((event, i) => {
              const Icon = event.icon;
              return (
                <div key={i} className="flex items-start gap-3 py-3 px-4 rounded hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0">
                  <div className="w-8 h-8 bg-white/[0.03] rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="size-4 text-white/[0.58]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-0.5">
                      <h3 className="text-sm text-white/70">{event.type}</h3>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm text-white/95 numeric">{event.amount}</div>
                      </div>
                    </div>
                    <p className="text-xs text-white/[0.58] mb-1">{event.details}</p>
                    <div className="flex items-center gap-1.5 text-xs text-white/[0.58]">
                      <Clock className="size-3" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <a 
            href="https://flare-explorer.flare.network" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-6 p-3 text-white/70 hover:text-[#3B82F6] transition-colors"
          >
            View on Flare Explorer
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}