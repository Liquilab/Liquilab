import { Link } from "react-router-dom";
import { PoolTableHeader, PoolTableRow } from "../components/PoolTable";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ActivityCalendar } from "../components/ActivityCalendar";
import { Rangeband } from "../components/Rangeband";
import { useState } from "react";
import {
  Wallet,
  Activity,
  DollarSign,
  TrendingUp,
  Copy,
  ExternalLink,
  Droplets,
  ArrowRight,
  List,
  LayoutGrid,
  Lock,
  Target,
  Plus,
  Minus,
  Clock,
  CircleDot,
  AlertCircle,
  CheckCircle2,
  Globe,
  Settings,
  PieChart,
  TrendingDown,
  Percent,
  AlertTriangle,
  Briefcase,
  BarChart3
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

interface WalletOverviewProps {
  hasPositions?: boolean;
  isPro?: boolean;
}

export function WalletOverview({ hasPositions = true, isPro = false }: WalletOverviewProps) {
  const walletAddress = "0x7a8f9b2c1e4d6a3f8e9c2b1a7d4e6f3a8b9c2d1e";
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"health" | "tvl" | "apr" | "fees">("health");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "lifetime">("30d");
  const [activeTab, setActiveTab] = useState<"positions" | "analytics">("positions");

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  // Mock pool data with health status
  const poolPositions = [
    {
      token1: "WFLR",
      token2: "USDT",
      poolId: "#18745",
      fee: "0,5 %",
      dex: "SPARKDEX",
      tvl: 12500,
      apr: 22.4,
      unclaimedFees: 458,
      currentPrice: 2.05000,
      minPrice: 0.980000,
      maxPrice: 1.93000,
      strategyPercent: "50.0%",
      status: "outOfRange" as const
    },
    {
      token1: "WFLR",
      token2: "FXRP",
      poolId: "#22003",
      fee: "0,3 %",
      dex: "ENOSYS",
      tvl: 8200,
      apr: 18.2,
      unclaimedFees: 234,
      currentPrice: 1.27500,
      minPrice: 0.980000,
      maxPrice: 1.93000,
      strategyPercent: "5.0%",
      status: "inRange" as const
    },
    {
      token1: "XRP",
      token2: "USDT",
      poolId: "#19234",
      fee: "0,3 %",
      dex: "SPARKDEX",
      tvl: 5100,
      apr: 15.8,
      unclaimedFees: 128,
      currentPrice: 2.70000,
      minPrice: 2.10000,
      maxPrice: 2.80000,
      strategyPercent: "15.0%",
      status: "nearBand" as const
    },
    {
      token1: "ETH",
      token2: "XRP",
      poolId: "#20156",
      fee: "1,0 %",
      dex: "ENOSYS",
      tvl: 15300,
      apr: 28.5,
      unclaimedFees: 892,
      currentPrice: 0.995000,
      minPrice: 0.980000,
      maxPrice: 1.93000,
      strategyPercent: "20.0%",
      status: "inRange" as const
    },
    {
      token1: "BTC",
      token2: "XRP",
      poolId: "#21890",
      fee: "1,0 %",
      dex: "SPARKDEX",
      tvl: 22400,
      apr: 32.1,
      unclaimedFees: 1245,
      currentPrice: 1.05000,
      minPrice: 0.950000,
      maxPrice: 1.20000,
      strategyPercent: "12.5%",
      status: "inRange" as const
    }
  ];

  // Sort pools based on selected criteria
  const sortedPools = [...poolPositions].sort((a, b) => {
    if (sortBy === "health") {
      const healthOrder = { outOfRange: 0, nearBand: 1, inRange: 2 };
      return healthOrder[a.status] - healthOrder[b.status];
    }
    if (sortBy === "tvl") return b.tvl - a.tvl;
    if (sortBy === "apr") return b.apr - a.apr;
    if (sortBy === "fees") return b.unclaimedFees - a.unclaimedFees;
    return 0;
  });

  const getHealthBadge = (status: "inRange" | "nearBand" | "outOfRange") => {
    if (status === "inRange") {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-[#10B981] text-sm">In Range</span>
        </div>
      );
    }
    if (status === "nearBand") {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
          <span className="text-[#F59E0B] text-sm">Near Band</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
        <span className="text-[#EF4444] text-sm">Out of Range</span>
      </div>
    );
  };

  const kpiCards = [
    {
      icon: Wallet,
      label: "Total Position Value",
      value: hasPositions ? "$124,580" : "$0",
      subtitle: hasPositions ? "+$24,580 all time" : "No positions yet",
      badge: hasPositions ? { text: "+24.5%", variant: "success" as const } : null,
      isPro: false
    },
    {
      icon: Activity,
      label: "Active Positions",
      value: hasPositions ? "8" : "0",
      subtitle: hasPositions ? "Across 2 DEXs" : "Start adding liquidity",
      badge: null,
      isPro: false
    },
    {
      icon: DollarSign,
      label: "Unclaimed Fees",
      value: hasPositions ? "$2,458" : "$0",
      subtitle: hasPositions ? "Ready to claim" : "Earn fees on LPs",
      badge: null,
      isPro: false
    },
    {
      icon: TrendingUp,
      label: "Avg APR",
      value: hasPositions ? "22.4%" : "—",
      subtitle: hasPositions ? "Last 30 days" : "Track performance",
      badge: null,
      isPro: true
    }
  ];

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-white/95 mb-4">
                Portfolio Premium
              </h1>
            </div>
            
            {/* Upgrade to Pro Button */}
            {hasPositions && !isPro && (
              <div className="flex items-center gap-3">
                {/* Test Link to Pro Page */}
                <Link to="/portfolio-pro" className="text-white/70 hover:text-[#3B82F6] text-sm transition-colors">
                  View Pro Page →
                </Link>
                
                <Link to="/pricing">
                  <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2 transition-all">
                    <TrendingUp className="size-4" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {!hasPositions ? (
          // Empty State (no tabs)
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                <Droplets className="h-12 w-12 text-[#3B82F6]/60" />
              </div>
            </div>

            <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-3" style={{ fontSize: '24px' }}>
              You have no liquidity positions yet
            </h3>
            
            <p className="font-['Inter',sans-serif] text-white/70 mb-8 max-w-md mx-auto">
              Start providing liquidity to pools and unlock powerful analytics
            </p>

            <div className="flex flex-col items-center gap-2 mb-8 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-left w-full">
                <div className="h-1.5 w-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0" />
                <span className="font-['Inter',sans-serif] text-white/70">
                  Track TVL, APR & fees in one dashboard
                </span>
              </div>
              <div className="flex items-center gap-2 text-left w-full">
                <div className="h-1.5 w-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0" />
                <span className="font-['Inter',sans-serif] text-white/70">
                  Monitor position health with RangeBand™ alerts
                </span>
              </div>
              <div className="flex items-center gap-2 text-left w-full">
                <div className="h-1.5 w-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0" />
                <span className="font-['Inter',sans-serif] text-white/70">
                  Optimize concentrated liquidity strategy
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Link to="/pools">
                <Button size="lg" className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 font-['Inter',sans-serif] gap-2">
                  Explore pools
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link to="/rangeband">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-white/95 hover:bg-white/5 hover:border-white/30 font-['Inter',sans-serif] gap-2"
                >
                  <Target className="size-5" />
                  Learn how RangeBand™ works
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Content with tabs (when user has positions)
          <div>
            {/* Tab Navigation - Classic Style */}
            <div className="border-b border-white/10 mb-8">
              <div className="flex gap-0">
                <button
                  onClick={() => setActiveTab("positions")}
                  className={`
                    relative px-6 py-4 transition-all duration-300
                    ${activeTab === "positions" 
                      ? "text-white/95" 
                      : "text-white/[0.58] hover:text-white/95"
                    }
                  `}
                >
                  <span>My Positions</span>
                  
                  {/* Active indicator - Electric Blue bottom border */}
                  {activeTab === "positions" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3B82F6] to-[#1BE8D2] rounded-t-full" />
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`
                    relative px-6 py-4 transition-all duration-300
                    ${activeTab === "analytics" 
                      ? "text-white/95" 
                      : "text-white/[0.58] hover:text-white/95"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>Performance & Analytics</span>
                    {isPro && (
                      <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30 text-xs ml-1">
                        Pro
                      </Badge>
                    )}
                  </div>
                  
                  {/* Active indicator - Electric Blue bottom border */}
                  {activeTab === "analytics" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3B82F6] to-[#1BE8D2] rounded-t-full" />
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: MY POSITIONS */}
            {activeTab === "positions" && (
              <div>
              {/* Sort Control */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-white/70 text-sm">Sort by:</span>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[200px] bg-[#0F1A36]/95 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1A36]/98 border-white/20">
                      <SelectItem value="health">Health Status</SelectItem>
                      <SelectItem value="tvl">TVL (High → Low)</SelectItem>
                      <SelectItem value="apr">APR (High → Low)</SelectItem>
                      <SelectItem value="fees">Unclaimed Fees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* List/Grid Toggle */}
                <div className="inline-flex items-center bg-[#0F1A36]/95 border border-white/10 rounded-lg p-1.5 gap-1 shadow-lg">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-md transition-all ${
                      viewMode === "list" 
                        ? "bg-[#3B82F6] text-white shadow-md" 
                        : "text-white/70 hover:text-white/95 hover:bg-white/5"
                    }`}
                  >
                    <List className="size-5" />
                    <span>List</span>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-md transition-all ${
                      viewMode === "grid" 
                        ? "bg-[#3B82F6] text-white shadow-md" 
                        : "text-white/70 hover:text-white/95 hover:bg-white/5"
                    }`}
                  >
                    <LayoutGrid className="size-5" />
                    <span>Grid</span>
                  </button>
                </div>
              </div>

              {/* Positions Table */}
              <div className="bg-[#0F1A36]/95 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <PoolTableHeader />
                <PoolTableRow 
                  token1="WFLR" 
                  token2="USDT" 
                  poolId="#18745" 
                  fee="0,5 %" 
                  dex="SPARKDEX"
                  currentPrice={2.05000}
                  minPrice={0.980000}
                  maxPrice={1.93000}
                  strategyPercent="50.0%"
                />
                <PoolTableRow 
                  token1="WFLR" 
                  token2="FXRP" 
                  poolId="#22003" 
                  fee="0,3 %" 
                  dex="ENOSYS"
                  currentPrice={1.27500}
                  minPrice={0.980000}
                  maxPrice={1.93000}
                  strategyPercent="5.0%"
                />
                <PoolTableRow 
                  token1="XRP" 
                  token2="USDT" 
                  poolId="#19234" 
                  fee="0,3 %" 
                  dex="SPARKDEX"
                  currentPrice={2.70000}
                  minPrice={2.10000}
                  maxPrice={2.80000}
                  strategyPercent="15.0%"
                />
                <PoolTableRow 
                  token1="ETH" 
                  token2="XRP" 
                  poolId="#20156" 
                  fee="1,0 %" 
                  dex="ENOSYS"
                  currentPrice={0.995000}
                  minPrice={0.980000}
                  maxPrice={1.93000}
                  strategyPercent="20.0%"
                />
                <PoolTableRow 
                  token1="BTC" 
                  token2="XRP" 
                  poolId="#21890" 
                  fee="1,0 %" 
                  dex="SPARKDEX"
                  currentPrice={1.05000}
                  minPrice={0.950000}
                  maxPrice={1.20000}
                  strategyPercent="12.5%"
                />
              </div>
              </div>
            )}

            {/* TAB 2: PERFORMANCE & ANALYTICS */}
            {activeTab === "analytics" && (
              <div>
              {/* ZONE A: HEADER + KPI BELT */}
              
              {/* Tab Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h2 className="text-white/95 mb-2">
                      Portfolio Performance & Analytics
                    </h2>
                    <div className="flex items-center gap-3">
                      <p className="text-white/70 text-sm">
                        Premium view · Aggregated performance across all your LP positions.
                      </p>
                      <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30 text-xs">
                        Premium
                      </Badge>
                      <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-xs">
                        Data status: Live
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Right side controls */}
                  <div className="flex items-center gap-3">
                    {/* Time Range Toggle */}
                    <div className="inline-flex items-center bg-[#0F1A36]/95 border border-white/10 rounded-lg p-1 gap-1">
                      <button
                        onClick={() => setTimeRange("7d")}
                        className={`px-3 py-1.5 rounded text-sm transition-all ${
                          timeRange === "7d" 
                            ? "bg-[#3B82F6] text-white" 
                            : "text-white/70 hover:text-white/95"
                        }`}
                      >
                        7D
                      </button>
                      <button
                        onClick={() => setTimeRange("30d")}
                        className={`px-3 py-1.5 rounded text-sm transition-all ${
                          timeRange === "30d" 
                            ? "bg-[#3B82F6] text-white" 
                            : "text-white/70 hover:text-white/95"
                        }`}
                      >
                        30D
                      </button>
                      <button
                        onClick={() => setTimeRange("lifetime")}
                        className={`px-3 py-1.5 rounded text-sm transition-all ${
                          timeRange === "lifetime" 
                            ? "bg-[#3B82F6] text-white" 
                            : "text-white/70 hover:text-white/95"
                        }`}
                      >
                        Lifetime
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI BELT - ROW 1: VALUE & EARNINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Card 1: Total Portfolio Value */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Total Portfolio Value</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    $124,580
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">P&L 7D: <span className="text-[#10B981]">+2.4%</span> / <span className="text-white/95">$2,940</span></div>
                    <div className="numeric">P&L 30D: <span className="text-[#10B981]">+8.2%</span> / <span className="text-white/95">$9,455</span></div>
                  </div>
                </div>

                {/* Card 2: Fees Earned */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Fees Earned (lifetime)</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    $18,245
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">Last 7 days: $892</div>
                    <div className="numeric">Last 30 days: $3,124</div>
                  </div>
                </div>

                {/* Card 3: Rewards & Incentives */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Rewards & Incentives (lifetime)</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    $5,892
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">Last 7 days: $245</div>
                    <div className="numeric">Last 30 days: $1,034</div>
                    <div className="text-white/95 text-[10px] pt-1 border-t border-white/5">Incentives</div>
                  </div>
                </div>
              </div>

              {/* KPI BELT - ROW 2: EFFICIENCY, YIELD & CLAIM HEALTH */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {/* Card 4: Average APR (30D) */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Average APR (30D, annualized)</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    22.4%
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">Best pool: 38.2%</div>
                    <div className="numeric">Worst pool: 12.1%</div>
                  </div>
                </div>

                {/* Card 5: Net Yield (30D) */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Net Yield vs HODL (30D)</div>
                  <div className="text-[#10B981] numeric mb-2" style={{ fontSize: '32px' }}>
                    +18.7%
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">Lifetime: +24.3%</div>
                    <div className="text-[10px] pt-1 border-t border-white/5">Fees + rewards – est. IL</div>
                  </div>
                </div>

                {/* Card 6: Range Efficiency (30D) */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Range Efficiency (30D)</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    87%
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">In range: <span className="text-[#10B981]">87%</span> of time</div>
                    <div className="numeric">Out of range: <span className="text-[#EF4444]">13%</span> of time</div>
                  </div>
                </div>

                {/* Card 7: Unclaimed Fees & Rewards */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Unclaimed Fees & Rewards</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    $3,458
                  </div>
                  <Badge variant="outline" className="text-[#F59E0B] border-[#F59E0B]/30 text-xs mb-2">
                    High
                  </Badge>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">2.8% of your portfolio TVL</div>
                    <div className="text-[10px] pt-1 border-t border-white/5">Thresholds: &lt;1% OK · 1–3% High · &gt;3% Extreme</div>
                  </div>
                </div>

                {/* Card 8: Active Positions & DEX Spread */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Active Positions & DEX Spread</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    8
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div>Across 2 DEXes</div>
                    <div className="numeric pt-1 border-t border-white/5">
                      Ēnosys: 62% · SparkDEX: 38%
                    </div>
                  </div>
                </div>
              </div>

              {/* ZONE B: ACTIVITY CALENDAR + PRO PROMO PANEL */}
              <div className={`grid grid-cols-1 ${!isPro ? 'lg:grid-cols-12' : ''} gap-6 mb-8`}>
                {/* LEFT: Activity Calendar */}
                <div className={!isPro ? 'lg:col-span-8' : ''}>
                  <ActivityCalendar isPro={isPro} />
                </div>

                {/* RIGHT: Pro Promo Panel (only for non-Pro users) */}
                {!isPro && (
                  <div className="lg:col-span-4">
                    <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8 h-full flex flex-col justify-between">
                      {/* Icon + Badge */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                          <Lock className="h-6 w-6 text-[#3B82F6]" />
                        </div>
                        <Badge className="bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30">
                          Pro
                        </Badge>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-white/95 mb-3">
                          Unlock Pro Analytics
                        </h3>
                        
                        <p className="text-white/70 text-sm mb-6">
                          Get deeper insights with advanced APR tracking, peer comparisons, and predictive range analytics.
                        </p>
                      </div>
                      
                      {/* CTA */}
                      <Link to="/pricing">
                        <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2 w-full">
                          Upgrade to Pro
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* ZONE C: VALUE & EARNINGS */}
              
              {/* MODULE: Portfolio Value & P&L */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
                <h2 className="text-white/95 mb-6">
                  Portfolio Value & P&L
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* LEFT: Chart placeholder */}
                  <div className="lg:col-span-8">
                    <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 h-[320px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-white/[0.58] text-sm mb-2">Portfolio TVL Chart</div>
                        <div className="text-white/40 text-xs">Line chart: TVL over time</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* RIGHT: Stats */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                      <div className="text-white/[0.58] text-xs mb-1">Current TVL</div>
                      <div className="text-white/95 numeric" style={{ fontSize: '28px' }}>
                        $124,580
                      </div>
                    </div>
                    
                    <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                      <div className="text-white/[0.58] text-xs mb-1">Net P&L 7D</div>
                      <div className="text-[#10B981] numeric mb-0.5" style={{ fontSize: '24px' }}>
                        +2.4%
                      </div>
                      <div className="text-white/95 numeric text-sm">$2,940</div>
                    </div>
                    
                    <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                      <div className="text-white/[0.58] text-xs mb-1">Net P&L 30D</div>
                      <div className="text-[#10B981] numeric mb-0.5" style={{ fontSize: '24px' }}>
                        +8.2%
                      </div>
                      <div className="text-white/95 numeric text-sm">$9,455</div>
                    </div>
                    
                    <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                      <div className="text-white/[0.58] text-xs mb-1">Lifetime Net P&L</div>
                      <div className="text-[#10B981] numeric mb-0.5" style={{ fontSize: '24px' }}>
                        +24.3%
                      </div>
                      <div className="text-white/95 numeric text-sm">$30,120</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE: Earnings Breakdown – Fees vs Rewards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* LEFT: Trading Fees */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
                  <h3 className="text-white/95 mb-6">
                    Trading Fees
                  </h3>
                  
                  {/* Bar chart placeholder */}
                  <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 h-[220px] flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="text-white/[0.58] text-sm mb-2">Fees Bar Chart</div>
                      <div className="text-white/40 text-xs">7D / 30D / Lifetime</div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-white/[0.58] text-xs">Lifetime fees</span>
                      <span className="text-white/95 numeric" style={{ fontSize: '20px' }}>$18,245</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-3 border-t border-white/5">
                      <span className="text-white/[0.58] text-xs">% of total earnings</span>
                      <span className="text-white/95 numeric" style={{ fontSize: '18px' }}>76%</span>
                    </div>
                  </div>
                </div>
                
                {/* RIGHT: Rewards & Incentives */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
                  <h3 className="text-white/95 mb-6">
                    Rewards & Incentives
                  </h3>
                  
                  {/* Bar chart placeholder */}
                  <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 h-[220px] flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="text-white/[0.58] text-sm mb-2">Rewards Bar Chart</div>
                      <div className="text-white/40 text-xs">7D / 30D (stacked by token)</div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-white/[0.58] text-xs">Lifetime incentives</span>
                      <span className="text-white/95 numeric" style={{ fontSize: '20px' }}>$5,892</span>
                    </div>
                    <div className="pt-3 border-t border-white/5 space-y-1">
                      <div className="text-xs text-white/[0.58] numeric">
                        Last 7 days: $245 · Last 30 days: $1,034
                      </div>
                      <div className="text-white/95 text-[10px]">
                        Incentives
                      </div>
                      <div className="numeric text-[11px] text-white/[0.58] pt-1 border-t border-white/5">
                        WFLR: 1,234.56 · USDT0: 987.65
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ZONE D: EFFICIENCY, BEHAVIOUR & RISK */}
              
              {/* MODULE: Net Yield vs HODL + Range Efficiency */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* LEFT: Net Yield vs HODL */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
                  <h3 className="text-white/95 mb-2">
                    Net Yield vs HODL
                  </h3>
                  <p className="text-white/[0.58] text-xs mb-6">
                    Net yield = fees + rewards – estimated impermanent loss.
                  </p>
                  
                  {/* Horizontal bar/dumbbell visual placeholder */}
                  <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 h-[140px] flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="text-white/[0.58] text-sm mb-2">Yield Comparison Chart</div>
                      <div className="text-white/40 text-xs">Bar showing net yield vs HODL baseline</div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-white/[0.58] text-xs">30D net yield</span>
                      <span className="text-[#10B981] numeric" style={{ fontSize: '18px' }}>+18.7%</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-white/[0.58] text-xs">Lifetime net yield</span>
                      <span className="text-[#10B981] numeric" style={{ fontSize: '18px' }}>+24.3%</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                      <span className="text-white/[0.58] text-xs">Estimated IL (30D)</span>
                      <span className="text-[#EF4444] numeric" style={{ fontSize: '16px' }}>–2.1%</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-white/[0.58] text-xs">Estimated IL (lifetime)</span>
                      <span className="text-[#EF4444] numeric" style={{ fontSize: '16px' }}>–3.8%</span>
                    </div>
                  </div>
                </div>
                
                {/* RIGHT: Range Efficiency */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
                  <h3 className="text-white/95 mb-2">
                    Range Efficiency
                  </h3>
                  <p className="text-white/[0.58] text-xs mb-6">
                    Percentage of time your liquidity was in range (actively earning fees).
                  </p>
                  
                  {/* Stacked bars visual */}
                  <div className="space-y-5 mb-6">
                    {/* Last 7 days */}
                    <div>
                      <div className="text-white/70 text-xs mb-2">Last 7 days</div>
                      <div className="flex h-8 rounded-lg overflow-hidden mb-2">
                        <div className="bg-[#10B981] flex items-center justify-center text-white text-xs" style={{ width: '92%' }}>
                          92%
                        </div>
                        <div className="bg-[#EF4444] flex items-center justify-center text-white text-xs" style={{ width: '8%' }}>
                          8%
                        </div>
                      </div>
                      <div className="text-xs text-white/[0.58] numeric">
                        In range: <span className="text-[#10B981]">92%</span> of time · Out: <span className="text-[#EF4444]">8%</span> of time
                      </div>
                    </div>
                    
                    {/* Last 30 days */}
                    <div>
                      <div className="text-white/70 text-xs mb-2">Last 30 days</div>
                      <div className="flex h-8 rounded-lg overflow-hidden mb-2">
                        <div className="bg-[#10B981] flex items-center justify-center text-white text-xs" style={{ width: '87%' }}>
                          87%
                        </div>
                        <div className="bg-[#EF4444] flex items-center justify-center text-white text-xs" style={{ width: '13%' }}>
                          13%
                        </div>
                      </div>
                      <div className="text-xs text-white/[0.58] numeric">
                        In range: <span className="text-[#10B981]">87%</span> of time · Out: <span className="text-[#EF4444]">13%</span> of time
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5">
                    <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-xs">
                      Healthy Efficiency
                    </Badge>
                  </div>
                </div>
              </div>

              {/* MODULE: Unclaimed Fees & Rewards Health */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
                <h3 className="text-white/95 mb-6">
                  Unclaimed Fees & Rewards Health
                </h3>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-white/95 numeric mb-2" style={{ fontSize: '28px' }}>
                      $3,458
                    </div>
                    <div className="text-white/[0.58] text-xs mb-2 numeric">
                      2.8% of your portfolio TVL
                    </div>
                    <div className="numeric text-[11px] text-white/[0.58] pt-2 border-t border-white/5">
                      WFLR: 456.78 · USDT0: 234.56
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-[#F59E0B] border-[#F59E0B]/30">
                    High
                  </Badge>
                </div>
                
                <div className="text-xs text-white/[0.58] pt-4 border-t border-white/5">
                  Health thresholds: &lt;1% of TVL OK · 1–3% High · &gt;3% Extreme
                </div>
              </div>

              {/* MODULE: Active Positions & DEX Exposure + Activity & Claim Behaviour */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* LEFT: Active Positions & DEX Exposure */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
                  <h3 className="text-white/95 mb-6">
                    Active Positions & DEX Exposure
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-white/[0.58] text-xs mb-1">Active positions</div>
                      <div className="text-white/95 numeric" style={{ fontSize: '32px' }}>8</div>
                    </div>
                    <div>
                      <div className="text-white/[0.58] text-xs mb-1">DEXes</div>
                      <div className="text-white/95 numeric" style={{ fontSize: '32px' }}>2</div>
                    </div>
                  </div>
                  
                  {/* Donut chart placeholder */}
                  <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 h-[180px] flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="text-white/[0.58] text-sm mb-2">DEX Distribution</div>
                      <div className="text-white/40 text-xs">Donut chart</div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
                        <span className="text-white/70">Ēnosys</span>
                      </div>
                      <span className="text-white/95 numeric">62% of your TVL</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-[#1BE8D2]" />
                        <span className="text-white/70">SparkDEX</span>
                      </div>
                      <span className="text-white/95 numeric">38% of your TVL</span>
                    </div>
                  </div>
                </div>
                
                {/* RIGHT: Activity & Claim Behaviour */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
                  <h3 className="text-white/95 mb-6">
                    Activity & Claim Behaviour (last 30 days)
                  </h3>
                  
                  {/* Activity chart placeholder */}
                  <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 h-[120px] flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="text-white/[0.58] text-sm mb-2">Activity Timeline</div>
                      <div className="text-white/40 text-xs">LP actions per day (last 30 days)</div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-white/[0.58] text-xs">Fee claims (last 30 days)</span>
                      <span className="text-white/95 numeric" style={{ fontSize: '20px' }}>3</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-white/[0.58] text-xs">Avg days between claims</span>
                      <span className="text-white/95 numeric" style={{ fontSize: '20px' }}>10</span>
                    </div>
                    <div className="pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/[0.58] text-xs">Claim cadence</span>
                        <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-xs">
                          Healthy
                        </Badge>
                      </div>
                      <div className="text-[10px] text-white/[0.58]">
                        Healthy: 7–14 day cadence
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE: Concentration & Largest Pools */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
                <h3 className="text-white/95 mb-6">
                  Concentration & Largest Pools
                </h3>
                <p className="text-white/[0.58] text-xs mb-6">
                  Each pool's share of your total portfolio TVL.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* LEFT: Top 5 pools chart */}
                  <div className="lg:col-span-7">
                    <div className="space-y-4">
                      {/* Pool 1 */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white/70">WFLR/USDT 0.5%</span>
                          <span className="text-white/95 numeric">35% of your portfolio</span>
                        </div>
                        <div className="h-8 bg-[#0B1530]/60 rounded-lg overflow-hidden">
                          <div className="h-full bg-[#3B82F6] rounded-lg" style={{ width: '35%' }} />
                        </div>
                      </div>
                      
                      {/* Pool 2 */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white/70">BTC/XRP 1.0%</span>
                          <span className="text-white/95 numeric">28% of your portfolio</span>
                        </div>
                        <div className="h-8 bg-[#0B1530]/60 rounded-lg overflow-hidden">
                          <div className="h-full bg-[#3B82F6] rounded-lg" style={{ width: '28%' }} />
                        </div>
                      </div>
                      
                      {/* Pool 3 */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white/70">ETH/XRP 1.0%</span>
                          <span className="text-white/95 numeric">18% of your portfolio</span>
                        </div>
                        <div className="h-8 bg-[#0B1530]/60 rounded-lg overflow-hidden">
                          <div className="h-full bg-[#3B82F6] rounded-lg" style={{ width: '18%' }} />
                        </div>
                      </div>
                      
                      {/* Pool 4 */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white/70">WFLR/FXRP 0.3%</span>
                          <span className="text-white/95 numeric">12% of your portfolio</span>
                        </div>
                        <div className="h-8 bg-[#0B1530]/60 rounded-lg overflow-hidden">
                          <div className="h-full bg-[#3B82F6] rounded-lg" style={{ width: '12%' }} />
                        </div>
                      </div>
                      
                      {/* Pool 5 */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white/70">XRP/USDT 0.3%</span>
                          <span className="text-white/95 numeric">7% of your portfolio</span>
                        </div>
                        <div className="h-8 bg-[#0B1530]/60 rounded-lg overflow-hidden">
                          <div className="h-full bg-[#3B82F6] rounded-lg" style={{ width: '7%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* RIGHT: Summary */}
                  <div className="lg:col-span-5">
                    <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-6 h-full flex flex-col justify-center space-y-4">
                      <div>
                        <div className="text-white/[0.58] text-xs mb-2">Top 1 pool</div>
                        <div className="text-white/95 numeric mb-1" style={{ fontSize: '28px' }}>35%</div>
                        <div className="text-white/[0.58] text-xs">of your portfolio TVL</div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/5">
                        <div className="text-white/[0.58] text-xs mb-2">Top 3 pools</div>
                        <div className="text-white/95 numeric mb-1" style={{ fontSize: '28px' }}>81%</div>
                        <div className="text-white/[0.58] text-xs">of your portfolio TVL</div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/5">
                        <Badge variant="outline" className="text-[#F59E0B] border-[#F59E0B]/30 text-xs">
                          High concentration risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRO-only sections */}
              {isPro && (
                <>
                  {/* ZONE C (PRO): Universe Insights + Peer Comparison */}
                  
                  {/* Universe Insights - Enhanced */}
                  <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8 mb-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-6 w-6 text-[#3B82F6]" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white/95">Universe Insights</h3>
                          <Badge className="bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30">Pro</Badge>
                        </div>
                        
                        <p className="text-white/70 mb-6">
                          Compare your positions to the broader pool landscape. See how entire pools behave across all LPs, DEXes, and fee tiers.
                        </p>
                        
                        {/* Universe KPIs - 4 cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          {/* Total Pool Universe TVL */}
                          <div className="bg-[#0B1530]/60 border border-white/10 rounded-lg p-4">
                            <div className="text-white/[0.58] text-xs mb-1">Universe TVL</div>
                            <div className="text-white/95 numeric" style={{ fontSize: '20px' }}>
                              $42.8M
                            </div>
                            <div className="text-white/[0.58] text-[10px] mt-1">
                              Across your pools
                            </div>
                          </div>
                          
                          {/* Your Share */}
                          <div className="bg-[#0B1530]/60 border border-white/10 rounded-lg p-4">
                            <div className="text-white/[0.58] text-xs mb-1">Your Share</div>
                            <div className="text-white/95 numeric" style={{ fontSize: '20px' }}>
                              0.29%
                            </div>
                            <div className="text-white/[0.58] text-[10px] mt-1">
                              Of total universe TVL
                            </div>
                          </div>
                          
                          {/* Active LPs */}
                          <div className="bg-[#0B1530]/60 border border-white/10 rounded-lg p-4">
                            <div className="text-white/[0.58] text-xs mb-1">Active LPs</div>
                            <div className="text-white/95 numeric" style={{ fontSize: '20px' }}>
                              1,247
                            </div>
                            <div className="text-white/[0.58] text-[10px] mt-1">
                              In your pools
                            </div>
                          </div>
                          
                          {/* Avg Universe APR */}
                          <div className="bg-[#0B1530]/60 border border-white/10 rounded-lg p-4">
                            <div className="text-white/[0.58] text-xs mb-1">Universe Avg APR</div>
                            <div className="text-white/95 numeric" style={{ fontSize: '20px' }}>
                              19.2%
                            </div>
                            <div className="text-white/[0.58] text-[10px] mt-1">
                              You: 22.4% (+3.2%)
                            </div>
                          </div>
                        </div>
                        
                        <Link to="/pool/18745/universe">
                          <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2">
                            Explore Universe View
                            <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Peer Comparison - Enhanced */}
                  <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-white/95">Peer Comparison</h2>
                      <Badge className="bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30">Pro</Badge>
                    </div>
                    
                    {/* Peer KPIs - Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-white/[0.58] text-sm">Your Rank</div>
                          <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-xs">
                            Top Tier
                          </Badge>
                        </div>
                        <div className="text-white/95 numeric mb-1" style={{ fontSize: '28px' }}>
                          Top 12%
                        </div>
                        <div className="text-white/[0.58] text-xs mb-2">By efficiency</div>
                        <div className="text-white/[0.58] text-[10px] pt-2 border-t border-white/5">
                          Better than 1,097 of 1,247 LPs
                        </div>
                      </div>
                      
                      <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-white/[0.58] text-sm">Avg Position Tenure</div>
                        </div>
                        <div className="text-white/95 numeric mb-1" style={{ fontSize: '28px' }}>
                          42 days
                        </div>
                        <div className="text-white/[0.58] text-xs mb-2">Peer avg: 28 days</div>
                        <div className="text-white/[0.58] text-[10px] pt-2 border-t border-white/5">
                          +50% longer than average
                        </div>
                      </div>
                      
                      <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-white/[0.58] text-sm">APR vs Peers</div>
                          <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-xs">
                            Above Avg
                          </Badge>
                        </div>
                        <div className="text-[#10B981] numeric mb-1" style={{ fontSize: '28px' }}>
                          +8.2%
                        </div>
                        <div className="text-white/[0.58] text-xs mb-2">Above peer group</div>
                        <div className="text-white/[0.58] text-[10px] pt-2 border-t border-white/5">
                          You: 22.4% · Peers: 14.2%
                        </div>
                      </div>
                    </div>
                    
                    {/* Peer KPIs - Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                        <div className="text-white/[0.58] text-sm mb-3">Range Efficiency vs Peers</div>
                        <div className="text-white/95 numeric mb-1" style={{ fontSize: '28px' }}>
                          87%
                        </div>
                        <div className="text-white/[0.58] text-xs mb-2">Peer avg: 72%</div>
                        <div className="text-white/[0.58] text-[10px] pt-2 border-t border-white/5">
                          +15% more efficient
                        </div>
                      </div>
                      
                      <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                        <div className="text-white/[0.58] text-sm mb-3">Claim Frequency</div>
                        <div className="text-white/95 numeric mb-1" style={{ fontSize: '28px' }}>
                          Every 12d
                        </div>
                        <div className="text-white/[0.58] text-xs mb-2">Peer avg: Every 18d</div>
                        <div className="text-white/[0.58] text-[10px] pt-2 border-t border-white/5">
                          More active than peers
                        </div>
                      </div>
                      
                      <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
                        <div className="text-white/[0.58] text-sm mb-3">Strategy Distribution</div>
                        <div className="text-white/95 numeric mb-1" style={{ fontSize: '28px' }}>
                          62% Balanced
                        </div>
                        <div className="text-white/[0.58] text-xs mb-2">Peer avg: 48%</div>
                        <div className="text-white/[0.58] text-[10px] pt-2 border-t border-white/5">
                          25% Aggressive · 13% Conservative
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}