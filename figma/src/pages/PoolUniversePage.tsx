import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TokenPairIcon } from "../components/TokenIcon";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { DataStateBanner, WarmingPlaceholder, type DataState } from "../components/DataStateBanner";
import { DataSourceDisclaimer } from "../components/DataSourceDisclaimer";
import {
  ArrowLeft,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  Layers,
  Target,
  PieChart,
  BarChart3,
  AlertCircle,
  TrendingDown,
  Zap,
  Clock,
  Percent,
  Award,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart
} from "recharts@2.15.0";

// TimeRangeToggle component
function TimeRangeToggle({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const options = [
    { value: '24h', label: '24H' },
    { value: '7D', label: '7D' },
    { value: '30D', label: '30D' },
    { value: '90D', label: '90D' }
  ];

  return (
    <div className="flex items-center gap-2 bg-[#0F1A36]/95 border border-white/10 rounded-lg p-1.5">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-md text-sm transition-all ${
            value === option.value
              ? 'bg-[#3B82F6] text-white'
              : 'text-white/70 hover:text-white/95 hover:bg-white/5'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Mock data generators
const generateDEXData = () => [
  { name: 'Ēnosys', tvl: 1842000, volume: 482000, fees: 14460, apr: 18.2, positions: 247 },
  { name: 'SparkDEX', tvl: 582000, volume: 124000, fees: 3720, apr: 14.8, positions: 89 },
];

const generateFeeTierData = () => [
  { tier: '0.05%', tvl: 324000, volume: 98000, fees: 490, apr: 3.5, positions: 42, dex: 'Ēnosys' },
  { tier: '0.3%', tvl: 1518000, volume: 384000, fees: 11520, apr: 17.6, positions: 205, dex: 'Ēnosys' },
  { tier: '1%', tvl: 582000, volume: 124000, fees: 12400, apr: 49.4, positions: 89, dex: 'SparkDEX' },
];

const generateWalletSizeData = () => [
  { name: 'Retail (<$10k)', value: 18, tvlShare: 12, feeShare: 8 },
  { name: 'Mid ($10k-$100k)', value: 45, tvlShare: 38, feeShare: 42 },
  { name: 'Whale (>$100k)', value: 37, tvlShare: 50, feeShare: 50 },
];

const generatePositionCountData = (period: string) => {
  const dataPoints = period === '7D' ? 7 : period === '30D' ? 30 : 90;
  return Array.from({ length: dataPoints }, (_, i) => ({
    day: `D${i + 1}`,
    active: 320 + Math.floor(Math.sin(i * 0.3) * 30),
    new: Math.floor(Math.random() * 15) + 5,
    closed: Math.floor(Math.random() * 12) + 3,
  }));
};

const generateStrategyDistribution = () => [
  { name: 'Aggressive (<12%)', share: 18, liquidity: 436000 },
  { name: 'Balanced (12-35%)', share: 52, liquidity: 1260000 },
  { name: 'Conservative (>35%)', share: 30, liquidity: 728000 },
];

const generateRangeStatusData = () => [
  { name: 'In Range', share: 68, liquidity: 1648000, color: '#10B981' },
  { name: 'Near Band', share: 18, liquidity: 436000, color: '#F59E0B' },
  { name: 'Out of Range', share: 14, liquidity: 340000, color: '#EF4444' },
];

const generateAPRDistribution = () => {
  const bins = [];
  for (let i = 0; i <= 50; i += 5) {
    bins.push({
      range: `${i}-${i + 5}%`,
      count: Math.floor(Math.random() * 60) + (i >= 10 && i <= 25 ? 40 : 10),
    });
  }
  return bins;
};

const generateClaimLatencyData = () => [
  { bucket: 'Retail', avgDays: 18, unclaimedPct: 4.2, count: 58 },
  { bucket: 'Mid', avgDays: 12, unclaimedPct: 2.8, count: 144 },
  { bucket: 'Whale', avgDays: 8, unclaimedPct: 1.5, count: 118 },
];

const generateFlowsData = (period: string) => {
  const dataPoints = period === '7D' ? 7 : period === '30D' ? 30 : 90;
  return Array.from({ length: dataPoints }, (_, i) => ({
    day: `D${i + 1}`,
    inflow: Math.floor(Math.random() * 50000) + 20000,
    outflow: Math.floor(Math.random() * 40000) + 15000,
    net: Math.floor(Math.random() * 20000) - 10000,
  }));
};

const generateTopWalletMoves = () => [
  { wallet: '0x12...89', change: 124000, type: 'Whale', direction: 'in' },
  { wallet: '0xAB...3F', change: -82000, type: 'Whale', direction: 'out' },
  { wallet: '0x45...D2', change: 67000, type: 'Mid', direction: 'in' },
  { wallet: '0x89...C1', change: 54000, type: 'Mid', direction: 'in' },
  { wallet: '0xF1...7E', change: -48000, type: 'Whale', direction: 'out' },
];

const generateVolatilityRegimes = (period: string) => {
  const dataPoints = period === '7D' ? 7 : period === '30D' ? 30 : 90;
  return Array.from({ length: dataPoints }, (_, i) => ({
    day: `D${i + 1}`,
    regime: i < dataPoints * 0.3 ? 'Low' : i < dataPoints * 0.7 ? 'Normal' : 'High',
    volatility: i < dataPoints * 0.3 ? 12 : i < dataPoints * 0.7 ? 28 : 45,
    volume: Math.floor(Math.random() * 100000) + 50000,
  }));
};

export function PoolUniversePage() {
  const { id } = useParams();
  const [timePeriod, setTimePeriod] = useState('30D');

  // Data state simulation (ok | warming | empty)
  // In real app: fetch from API/context
  const universeDataState: DataState = 'warming'; // Change to 'ok' or 'empty' to test states

  // Mock data
  const dexData = generateDEXData();
  const feeTierData = generateFeeTierData();
  const walletSizeData = generateWalletSizeData();
  const positionCountData = generatePositionCountData(timePeriod);
  const strategyDistribution = generateStrategyDistribution();
  const rangeStatusData = generateRangeStatusData();
  const aprDistribution = generateAPRDistribution();
  const claimLatencyData = generateClaimLatencyData();
  const flowsData = generateFlowsData(timePeriod);
  const topWalletMoves = generateTopWalletMoves();
  const volatilityRegimes = generateVolatilityRegimes(timePeriod);

  // Calculate derived metrics
  const totalTVL = dexData.reduce((sum, d) => sum + d.tvl, 0);
  const totalVolume = dexData.reduce((sum, d) => sum + d.volume, 0);
  const totalFees = dexData.reduce((sum, d) => sum + d.fees, 0);
  const avgAPR = (totalFees / totalTVL) * 100 * (365 / (timePeriod === '24h' ? 1 : parseInt(timePeriod)));
  const activePositions = dexData.reduce((sum, d) => sum + d.positions, 0);
  const activeWallets = 320;

  const top1WalletShare = 8.2;
  const top10WalletShare = 43.5;
  const avgPositionTenure = 18;

  const medianAPR = 17.2;
  const fairnessIndex = 0.68;
  const missedFees = 24800;
  const zeroFeeTVLPct = 14;

  const netFlowChange = flowsData.reduce((sum, d) => sum + d.net, 0);
  const reducedExposurePct = 32;
  const increasedExposurePct = 44;

  const currentRegime = 'Normal';
  const lowVolDays = volatilityRegimes.filter(d => d.regime === 'Low').length;
  const normalVolDays = volatilityRegimes.filter(d => d.regime === 'Normal').length;
  const highVolDays = volatilityRegimes.filter(d => d.regime === 'High').length;

  const COLORS = {
    primary: '#3B82F6',
    accent: '#1BE8D2',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-8">
        {/* Back Button */}
        <Link 
          to={`/pool/${id}/pro`} 
          className="inline-flex items-center gap-2 text-white/70 hover:text-[#3B82F6] mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Pool Detail
        </Link>

        {/* Data State Banner (if warming/empty) */}
        {universeDataState !== 'ok' && (
          <DataStateBanner 
            state={universeDataState}
            className="mb-6"
          />
        )}

        {/* FTSO Data Source Disclaimer */}
        <DataSourceDisclaimer className="mb-6" />

        {/* 1) TOKEN PAIR OVERVIEW - STATE OF THE POOL */}
        <div className="bg-[#0F1A36]/95 border-2 border-[#3B82F6]/30 rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <TokenPairIcon token1="WFLR" token2="USDT0" size="large" />
                <h1 className="text-white/95">
                  WFLR / USDT0 Pool — Universe View
                </h1>
              </div>
              <p className="text-white/[0.58] mb-3">
                Analytics across all LPs and DEXes for this token pair
              </p>
              <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                Pro · Pool Universe Analytics
              </Badge>
            </div>
            <TimeRangeToggle value={timePeriod} onChange={setTimePeriod} />
          </div>

          {/* KPI Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-xs text-white/[0.58] mb-2">Total Pool TVL</div>
              <div className="text-metric text-white/95 numeric mb-1">
                ${(totalTVL / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-[#10B981]">+12.5% vs prev {timePeriod}</p>
              <p className="text-xs text-white/40 mt-1">Network rank: Top 8%</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-xs text-white/[0.58] mb-2">Volume ({timePeriod})</div>
              <div className="text-metric text-white/95 numeric mb-1">
                ${(totalVolume / 1000).toFixed(0)}k
              </div>
              <p className="text-xs text-white/40">Showing last {timePeriod === '24h' ? '24 hours' : timePeriod}</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-xs text-white/[0.58] mb-2">Fees Generated ({timePeriod})</div>
              <div className="text-metric text-white/95 numeric mb-1">
                ${totalFees.toLocaleString()}
              </div>
              <p className="text-xs text-white/40">Showing last {timePeriod === '24h' ? '24 hours' : timePeriod}</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-xs text-white/[0.58] mb-2">Realized APR ({timePeriod}, annualized)</div>
              <div className="text-metric text-[#10B981] numeric mb-1">
                {avgAPR.toFixed(1)}%
              </div>
              <p className="text-xs text-white/40">Across all LPs in pool</p>
              <p className="text-xs text-white/40 mt-1">Network median APR: 18.6%</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-xs text-white/[0.58] mb-2">Active Positions (snapshot)</div>
              <div className="text-metric text-white/95 numeric mb-1">
                {activePositions}
              </div>
              <p className="text-xs text-white/40">ERC721 position tokens</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-xs text-white/[0.58] mb-2">Active LP Wallets (snapshot)</div>
              <div className="text-metric text-white/95 numeric mb-1">
                {activeWallets}
              </div>
              <p className="text-xs text-white/40">Unique wallet addresses</p>
            </div>
          </div>

          <p className="text-xs text-white/40 text-center">
            Universe metrics show pool size, activity, and performance across all LPs and DEXes for this token pair
          </p>
        </div>

        {/* 2) DEX & FEE-TIER BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 2a) DEX Breakdown */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8">
            <h2 className="text-white/95 mb-6">DEX Breakdown</h2>

            <div className="h-[200px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dexData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.95)' }}
                  />
                  <Bar dataKey="tvl" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {dexData.map((dex) => (
                <div key={dex.name} className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/95">{dex.name}</span>
                    <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                      {dex.positions} positions
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-white/40 text-xs mb-1">TVL</div>
                      <div className="text-white/95 numeric">${(dex.tvl / 1000000).toFixed(2)}M</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">Volume</div>
                      <div className="text-white/95 numeric">${(dex.volume / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">Fees</div>
                      <div className="text-white/95 numeric">${dex.fees.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">APR</div>
                      <div className="text-[#10B981] numeric">{dex.apr.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/40 mt-4">
              High volume + moderate TVL → strong fee opportunities; high TVL + low volume → yield dilution
            </p>
          </div>

          {/* 2b) Fee-tier Breakdown */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8">
            <h2 className="text-white/95 mb-6">Fee Tier Breakdown</h2>

            <div className="h-[200px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeTierData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="tier" 
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="tvl" fill="#1BE8D2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {feeTierData.map((tier) => (
                <div key={tier.tier} className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white/95">{tier.tier}</span>
                      <span className="text-xs text-white/40">· {tier.dex}</span>
                    </div>
                    <Badge className="bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30">
                      {tier.positions} positions
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-white/40 text-xs mb-1">TVL</div>
                      <div className="text-white/95 numeric">${(tier.tvl / 1000000).toFixed(2)}M</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">Volume</div>
                      <div className="text-white/95 numeric">${(tier.volume / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">Fees</div>
                      <div className="text-white/95 numeric">${tier.fees.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">APR</div>
                      <div className="text-[#10B981] numeric">{tier.apr.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/40 mt-4">
              Sweet spot analysis: Which DEX/tier combinations offer best risk-adjusted returns
            </p>
          </div>
        </div>

        {/* 3) LP POPULATION & CONCENTRATION */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="size-5 text-[#3B82F6]" />
            <h2 className="text-white/95">
              LP Population & Concentration
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* Wallet Size Distribution */}
            <div>
              <h3 className="text-white/95 mb-4">Wallet-size Distribution</h3>
              <div className="h-[280px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={walletSizeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry) => `${entry.name.split(' ')[0]} ${entry.value}%`}
                    >
                      {walletSizeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'rgba(59, 130, 246, 0.8)' : index === 1 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.3)'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                  <div className="text-sm text-white/40 mb-1">Top 1 Wallet Share</div>
                  <div className="text-white/95 numeric">{top1WalletShare}%</div>
                  <div className="text-xs text-white/40 mt-1">of TVL & fees</div>
                </div>
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                  <div className="text-sm text-white/40 mb-1">Top 10 Wallets Share</div>
                  <div className="text-white/95 numeric">{top10WalletShare}%</div>
                  <div className="text-xs text-white/40 mt-1">of TVL & fees</div>
                </div>
              </div>

              <p className="text-xs text-white/40 mt-4">
                High top-10 share → whale-driven pool, higher concentration risk
              </p>
            </div>

            {/* Position Count & Churn */}
            <div>
              <h3 className="text-white/95 mb-4">Position Count & Churn</h3>
              <div className="h-[200px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={positionCountData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="active" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/40 mb-1">New</div>
                  <div className="text-white/95 numeric">
                    {positionCountData.reduce((sum, d) => sum + d.new, 0)}
                  </div>
                </div>
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/40 mb-1">Closed</div>
                  <div className="text-white/95 numeric">
                    {positionCountData.reduce((sum, d) => sum + d.closed, 0)}
                  </div>
                </div>
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/40 mb-1">Avg Tenure</div>
                  <div className="text-white/95 numeric">{avgPositionTenure}d</div>
                </div>
              </div>

              <p className="text-xs text-white/40 mt-4">
                High churn and short tenure suggest tactical traders and more frequent shifts
              </p>
            </div>
          </div>
        </div>

        {/* 4) RANGEBAND LANDSCAPE */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="size-5 text-[#3B82F6]" />
            <h2 className="text-white/95">
              RangeBand™ Landscape
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strategy Distribution */}
            <div>
              <h3 className="text-white/95 mb-4">Range-type Distribution</h3>
              <div className="h-[240px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={strategyDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="share"
                      label={(entry) => `${entry.name.split(' ')[0]} ${entry.share}%`}
                    >
                      {strategyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'rgba(59, 130, 246, 0.4)' : index === 1 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(27, 232, 210, 0.6)'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-white/40">
                Most liquidity is Balanced strategy, suggesting moderate risk appetite
              </p>
            </div>

            {/* Range Status */}
            <div>
              <h3 className="text-white/95 mb-4">Current Range Status</h3>
              <div className="h-[240px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={rangeStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="share"
                      label={(entry) => `${entry.share}%`}
                    >
                      {rangeStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-white/40">
                {rangeStatusData.find(d => d.name === 'Out of Range')?.share}% of liquidity currently out of range
              </p>
            </div>
          </div>

          {/* Crowded Ranges Heatmap */}
          <div className="mt-8">
            <h3 className="text-white/95 mb-4">Crowded Price Zones</h3>
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-8 rounded-lg relative overflow-hidden" style={{
                  background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.9), rgba(59, 130, 246, 0.5), rgba(59, 130, 246, 0.2))'
                }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-[#10B981]" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="numeric">$0.80</span>
                <span className="text-white/70">Most crowded: <span className="numeric text-white/95">±1%</span> around current price</span>
                <span className="numeric">$1.80</span>
              </div>
              <p className="text-xs text-white/40 mt-4">
                Crowded zones mean more LPs sharing the same fees; quieter zones may offer better fee share at higher risk
              </p>
            </div>
          </div>
        </div>

        {/* 5) FEES, APR & FAIRNESS */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="size-5 text-[#3B82F6]" />
            <h2 className="text-white/95">
              Fee & APR Distribution
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* APR Distribution Histogram */}
            <div className="lg:col-span-2">
              <h3 className="text-white/95 mb-4">Realized APR Distribution ({timePeriod})</h3>
              <div className="h-[240px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aprDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="range" 
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/40 mb-1">Median APR</div>
                  <div className="text-[#10B981] numeric">{medianAPR}%</div>
                </div>
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/40 mb-1">25-75% Range</div>
                  <div className="text-white/95 numeric">12-24%</div>
                </div>
                <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/40 mb-1">Fairness</div>
                  <div className="text-white/95 numeric">{fairnessIndex}</div>
                  <div className="text-xs text-[#10B981]">Fair</div>
                </div>
              </div>
            </div>

            {/* Missed Fees & Inefficiency */}
            <div>
              <h3 className="text-white/95 mb-4">Inefficiency Metrics</h3>
              
              <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="size-5 text-[#3B82F6]" />
                  <div className="text-sm text-white/40">Missed Fees</div>
                </div>
                <div className="text-metric text-white/95 numeric mb-1">
                  ${missedFees.toLocaleString()}
                </div>
                <div className="text-xs text-white/40">{timePeriod} period</div>
              </div>

              <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="size-5 text-[#3B82F6]" />
                  <div className="text-sm text-white/40">Near-Zero Fees</div>
                </div>
                <div className="text-metric text-white/95 numeric mb-1">
                  {zeroFeeTVLPct}%
                </div>
                <div className="text-xs text-white/40">of TVL earning &lt;1% APR</div>
              </div>

              <p className="text-xs text-white/40 mt-4">
                Shows how costly being out-of-range or badly placed is in this pool
              </p>
            </div>
          </div>
        </div>

        {/* 6) CLAIM BEHAVIOUR */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="size-5 text-[#3B82F6]" />
            <h2 className="text-white/95">
              Claim Behaviour & Cash-flow Patterns
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Claim Latency */}
            <div>
              <h3 className="text-white/95 mb-4">Claim Latency by Wallet Size</h3>
              
              <div className="space-y-3 mb-4">
                {claimLatencyData.map((bucket) => (
                  <div key={bucket.bucket} className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white/95">{bucket.bucket}</span>
                        <Badge variant="outline" className="text-white/40 border-white/20 text-xs">
                          {bucket.count} LPs
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-white/40 mb-1">Avg Claim Latency</div>
                        <div className="text-lg font-bold text-white/95 numeric">{bucket.avgDays} days</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/40 mb-1">Avg Unclaimed %</div>
                        <div className="text-lg font-bold text-[#F59E0B] numeric">{bucket.unclaimedPct}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-white/40">
                Helps you see if your habit of letting fees accumulate differs from most LPs
              </p>
            </div>

            {/* Claim Timing Insights */}
            <div>
              <h3 className="text-lg font-medium text-white/95 mb-4">Claim Timing Insights</h3>
              
              <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="size-5 text-[#1BE8D2]" />
                  <div className="text-sm text-white/95 font-medium">Claim Patterns</div>
                </div>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-1.5 flex-shrink-0" />
                    <span>Claims spike after high-volume days (3x normal rate)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-1.5 flex-shrink-0" />
                    <span>62% of claims occur within 24h of major price movements</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-1.5 flex-shrink-0" />
                    <span>Whales claim 2.3x more frequently than retail LPs</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#1BE8D2]/5 border border-[#3B82F6]/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="size-5 text-[#1BE8D2]" />
                  <div className="text-sm text-white/95 font-medium">Key Insight</div>
                </div>
                <p className="text-sm text-white/70">
                  Claims tend to spike after volatility events. Consider setting alerts to claim during optimal windows when gas is lower.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 7) WALLET FLOWS & NOTABLE MOVES */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="size-5 text-[#3B82F6]" />
            <h2 className="text-white/95">
              Wallet Flows & Notable Moves
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pool Flows Chart */}
            <div className="lg:col-span-2">
              <h3 className="text-white/95 mb-6">Net TVL Flows ({timePeriod})</h3>
              <div className="h-[240px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={flowsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 26, 54, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="inflow" fill="rgba(59, 130, 246, 0.6)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outflow" fill="rgba(255, 255, 255, 0.2)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Net Change ({timePeriod})</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white/95 numeric">
                      {netFlowChange >= 0 ? '+' : ''}{(netFlowChange / 1000).toFixed(0)}k
                    </span>
                    {netFlowChange >= 0 ? (
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Wallet Moves */}
            <div>
              <h3 className="text-white/95 mb-6">Top Wallet Changes</h3>
              
              <div className="space-y-3 mb-6">
                {topWalletMoves.map((move, idx) => (
                  <div key={idx} className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/70 numeric font-mono">{move.wallet}</span>
                      <Badge variant="outline" className="text-white/58 border-white/20 text-xs">
                        {move.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        {move.direction === 'in' ? 'Added' : 'Removed'}
                      </span>
                      <span className="text-sm font-bold text-white/95 numeric">
                        {move.direction === 'in' ? '+' : '-'}${(Math.abs(move.change) / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                <div className="text-xs text-white/40 mb-3">Allocation Shifts</div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Reduced exposure</span>
                    <span className="text-white/95 numeric">{reducedExposurePct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Increased exposure</span>
                    <span className="text-white/95 numeric">{increasedExposurePct}%</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/40 mt-4">
                Shows whether the crowd is rotating in or out of this pair
              </p>
            </div>
          </div>
        </div>

        {/* 8) VOLATILITY, REGIMES & MARKET MOOD */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="size-5 text-[#3B82F6]" />
            <h2 className="text-white/95">
              Market Regime & Volatility
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-sm text-white/40 mb-2">Current Regime</div>
              <div className="text-white/95 mb-1">{currentRegime}</div>
              <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                Volatility
              </Badge>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-sm text-white/40 mb-2">Low Vol Days</div>
              <div className="text-white/95 numeric mb-1">{lowVolDays}</div>
              <div className="text-xs text-white/40">of {timePeriod}</div>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-sm text-white/40 mb-2">Normal Vol Days</div>
              <div className="text-white/95 numeric mb-1">{normalVolDays}</div>
              <div className="text-xs text-white/40">of {timePeriod}</div>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="text-sm text-white/40 mb-2">High Vol Days</div>
              <div className="text-white/95 numeric mb-1">{highVolDays}</div>
              <div className="text-xs text-white/40">of {timePeriod}</div>
            </div>
          </div>

          {/* Volatility Regime Timeline */}
          <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-white/95 mb-2">Volatility Timeline</h3>
              <p className="text-white/70">
                Track how market volatility changes over time. Green bars indicate stable conditions ideal for wider ranges, blue shows normal volatility, and amber signals high volatility periods where tighter ranges may be needed.
              </p>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volatilityRegimes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 12 }}
                    label={{ 
                      value: 'Volatility %', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: 'rgba(255,255,255,0.58)', fontSize: 12 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F1A36',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                    }}
                    labelStyle={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}
                    itemStyle={{
                      color: 'rgba(255, 255, 255, 0.70)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      padding: '4px 0'
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      const regime = props.payload.regime;
                      const regimeColor = regime === 'Low' ? '#10B981' : regime === 'Normal' ? '#3B82F6' : '#F59E0B';
                      return [
                        <span key="value" style={{ color: regimeColor, fontWeight: '600' }}>
                          {value}%
                        </span>,
                        <span key="label" style={{ color: 'rgba(255, 255, 255, 0.58)' }}>
                          {regime} Volatility
                        </span>
                      ];
                    }}
                    labelFormatter={(label) => `Day ${label.replace('D', '')}`}
                  />
                  <Bar dataKey="volatility" radius={[4, 4, 0, 0]}>
                    {volatilityRegimes.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.regime === 'Low' ? '#10B981' :
                          entry.regime === 'Normal' ? '#3B82F6' :
                          '#F59E0B'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-start gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg p-4">
              <AlertCircle className="size-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
              <div className="text-white/70">
                <span className="text-white/95 font-medium">Strategy alignment:</span> Low volatility (green) favors Conservative ranges. Normal (blue) suits Balanced strategies. High volatility (amber) requires Aggressive monitoring or tighter ranges to stay in range.
              </div>
            </div>
          </div>
        </div>

        {/* 9) WHAT THIS MEANS FOR YOU */}
        <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#1BE8D2]/5 border-2 border-[#3B82F6]/30 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="size-5 text-[#1BE8D2]" />
            <h2 className="text-white/95">
              How This Pool Context Affects Your Position
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <div className="text-white/95 mb-1">DEX & Fee Tier</div>
                  <p className="text-sm text-white/70">
                    Check if your DEX/tier combination is in the high-APR cluster or if switching could improve returns
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <div className="text-white/95 mb-1">Range & Crowding</div>
                  <p className="text-sm text-white/70">
                    See if your band sits in a heavily crowded zone (lower fee share) or quieter area (higher risk, better capture)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <div className="text-white/95 mb-1">Efficiency vs Pool</div>
                  <p className="text-sm text-white/70">
                    Compare your APR and fee capture percentage against the pool-wide distribution to gauge performance
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <div className="text-white/95 mb-1">Concentration & Flows</div>
                  <p className="text-sm text-white/70">
                    Note whether whales are exiting or entering; high concentration means larger wallets control fee distribution
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <div className="text-white/95 mb-1">Claim Behaviour</div>
                  <p className="text-sm text-white/70">
                    See if your unclaimed fee percentage is far above or below the pool norm for your wallet size
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <div className="text-white/95 mb-1">Regime Alignment</div>
                  <p className="text-sm text-white/70">
                    Confirm if your strategy (Aggressive/Balanced/Conservative) matches the current volatility regime
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to={`/pool/${id}/pro`}>
              <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                View Your Position Analytics
              </Button>
            </Link>
            <Link to="/pools">
              <Button variant="outline" className="border-white/20 text-white/95 hover:bg-white/5">
                Back to My Portfolio
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}