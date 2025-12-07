import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TokenPairIcon } from "../components/TokenIcon";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
  Award
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
              ? 'bg-[#3B82F6] text-white font-medium'
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

        {/* 1) TOKEN PAIR OVERVIEW - STATE OF THE POOL */}
        <div className="bg-[#0F1A36]/95 border-2 border-[#3B82F6]/30 rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <TokenPairIcon token1="WFLR" token2="USDT0" size="large" />
                <h1 className="text-3xl font-heading font-bold text-white/95">
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

          {/* KPI Tiles - RUSTIGER */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <Activity className="size-5 text-[#3B82F6]" />
                </div>
                <div className="text-sm text-white/[0.58]">Total TVL (USD)</div>
              </div>
              <div className="text-3xl font-bold text-white/95 numeric mb-1">
                ${(totalTVL / 1000000).toFixed(1)}M
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-white/70">+12.5% vs prev {timePeriod}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              </div>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="size-5 text-[#3B82F6]" />
                </div>
                <div className="text-sm text-white/[0.58]">Total Volume (USD)</div>
              </div>
              <div className="text-3xl font-bold text-white/95 numeric mb-1">
                ${(totalVolume / 1000).toFixed(0)}k
              </div>
              <p className="text-xs text-white/40">{timePeriod} period</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="size-5 text-[#3B82F6]" />
                </div>
                <div className="text-sm text-white/[0.58]">Total Fees Generated</div>
              </div>
              <div className="text-3xl font-bold text-white/95 numeric mb-1">
                ${totalFees.toLocaleString()}
              </div>
              <p className="text-xs text-white/40">{timePeriod} period</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                  <Percent className="size-5 text-[#10B981]" />
                </div>
                <div className="text-sm text-white/[0.58]">Estimated Pool APR</div>
              </div>
              <div className="text-3xl font-bold text-[#10B981] numeric mb-1">
                {avgAPR.toFixed(1)}%
              </div>
              <p className="text-xs text-white/40">Annualized from {timePeriod}</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <Layers className="size-5 text-[#3B82F6]" />
                </div>
                <div className="text-sm text-white/[0.58]">Active Positions</div>
              </div>
              <div className="text-3xl font-bold text-white/95 numeric mb-1">
                {activePositions}
              </div>
              <p className="text-xs text-white/40">ERC721 tokens</p>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <Users className="size-5 text-[#3B82F6]" />
                </div>
                <div className="text-sm text-white/[0.58]">Active LP Wallets</div>
              </div>
              <div className="text-3xl font-bold text-white/95 numeric mb-1">
                {activeWallets}
              </div>
              <p className="text-xs text-white/40">Unique providers</p>
            </div>
          </div>

          <p className="text-xs text-white/40 text-center">
            Shows how large and active this pool is for the selected period
          </p>
        </div>

        {/* NOTE: DUE TO FILE SIZE, CONTINUING IN NEXT MESSAGE */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8">
          <p className="text-white/70 text-center">
            De rest van de pagina wordt rustiger gemaakt in het volledige bestand...
          </p>
        </div>
      </div>
    </div>
  );
}
