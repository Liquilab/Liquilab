import { Link } from "react-router-dom";
import { PoolTableHeader, PoolTableRow } from "../components/PoolTable";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "../components/ui/tooltip";
import { ActivityCalendar } from "../components/ActivityCalendar";
import { useState } from "react";
import {
  Droplets,
  ArrowRight,
  List,
  LayoutGrid,
  Target,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts@2.15.0";

interface WalletOverviewProProps {
  hasPositions?: boolean;
}

export function WalletOverviewPro({ hasPositions = true }: WalletOverviewProProps) {
  const walletAddress = "0x7a8f9b2c1e4d6a3f8e9c2b1a7d4e6f3a8b9c2d1e";
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"health" | "tvl" | "apr" | "fees">("health");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "lifetime">("30d");
  const [activeTab, setActiveTab] = useState<"positions" | "analytics">("positions");

  // Mock data for Pro analytics
  const strategyDistribution = [
    { name: 'Aggressive', value: 25, liquidity: 31145, fill: '#EF4444' },
    { name: 'Balanced', value: 50, liquidity: 62290, fill: '#3B82F6' },
    { name: 'Conservative', value: 25, liquidity: 31145, fill: '#10B981' },
  ];

  const peerComparisonData = [
    { metric: 'Portfolio Size', you: '$124,580', peers: '$95,000', rank: 'Top 25%' },
    { metric: 'Active Positions', you: '8', peers: '5.2', rank: 'Top 30%' },
    { metric: 'Avg APR (30D)', you: '22.4%', peers: '18.6%', rank: 'Top 20%' },
    { metric: 'Time in Range (30D)', you: '87%', peers: '68%', rank: 'Top 15%' },
  ];

  // Mock rFLR analytics data (from /api/analytics/portfolio/[wallet])
  const rflrData = {
    last30dAmount: 1247.89,  // rFLR claimed in last 30 days
    ytdAmount: 4832.15,      // rFLR claimed year-to-date
    lastClaimDate: "2024-11-20",
    daily: [
      { date: "2024-11-01", amount: 45.23, claims: 1 },
      { date: "2024-11-05", amount: 89.67, claims: 2 },
      { date: "2024-11-12", amount: 123.45, claims: 1 },
      { date: "2024-11-20", amount: 67.89, claims: 1 },
    ]
  };
  
  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-white/95 mb-4">
                Portfolio Pro
              </h1>
            </div>
            
            {/* Link back to Standard View */}
            {hasPositions && (
              <div className="flex items-center gap-3">
                <Link to="/portfolio" className="text-white/70 hover:text-[#3B82F6] text-sm transition-colors">
                  ← Back to Standard View
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

            <h3 className="text-white/95 mb-3" style={{ fontSize: '24px' }}>
              You have no liquidity positions yet
            </h3>
            
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Start providing liquidity to pools and unlock powerful analytics
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/pools">
                <Button size="lg" className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2">
                  Explore pools
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Content with tabs (when user has positions)
          <div>
            {/* Tab Navigation */}
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
                    <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30 text-xs ml-1">
                      Pro
                    </Badge>
                  </div>
                  
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
                  showUniverseLink={true}
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
                  showUniverseLink={true}
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
                  showUniverseLink={true}
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
                  showUniverseLink={true}
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
                  showUniverseLink={true}
                />
              </div>
              </div>
            )}

            {/* TAB 2: PERFORMANCE & ANALYTICS (PRO) */}
            {activeTab === "analytics" && (
              <div>
              {/* ZONE A: HEADER + KPI BELT */}
              
              {/* Tab Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-white/95">
                        Portfolio Performance & Analytics
                      </h2>
                      <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30 text-xs">
                        Pro
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white/70 text-sm">
                        Premium view · Aggregated performance across all your LP positions.
                      </p>
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

              {/* KPI BELT - ROW 1: VALUE & EARNINGS (Same as Premium) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

                {/* Card 3: Rewards & Incentives + rFLR (INTEGRATED) */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Rewards & Incentives (lifetime)</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    $5,892
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">Last 7 days: $245</div>
                    <div className="numeric">Last 30 days: $1,034</div>
                    <div className="text-white/95 text-[10px] pt-1 border-t border-white/5">Incentives</div>
                    {/* rFLR claimed metrics integrated */}
                    <div className="pt-1 border-t border-white/5 space-y-0.5">
                      <div className="numeric text-[11px]">
                        rFLR claimed (30D): {rflrData.last30dAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} rFLR
                      </div>
                      <div className="numeric text-[11px]">
                        rFLR claimed (YTD): {rflrData.ytdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} rFLR
                      </div>
                    </div>
                    {/* PRO-ONLY enrichment */}
                    <div className="pt-1 border-t border-white/5">
                      <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-[10px]">
                        Top 25% vs peers
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Card 4: Unclaimed Fees & Rewards (MOVED TO ROW 1) */}
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
                    {/* PRO-ONLY enrichment */}
                    <div className="numeric text-[11px] pt-1 border-t border-white/5">
                      Peer median: 1.8% of TVL
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI BELT - ROW 2: EFFICIENCY, YIELD & CLAIM HEALTH (Same as Premium with Pro enrichments) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {/* Card 4: Average APR (30D) with PRO enrichment */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Average APR (30D, annualized)</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    22.4%
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">Best pool: 38.2%</div>
                    <div className="numeric">Worst pool: 12.1%</div>
                    {/* PRO-ONLY enrichment */}
                    <div className="pt-1 border-t border-white/5">
                      <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-[10px]">
                        Top 20% vs peers
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Card 5: Net Yield (30D) with PRO enrichment */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Net Yield vs HODL (30D)</div>
                  <div className="text-[#10B981] numeric mb-2" style={{ fontSize: '32px' }}>
                    +18.7%
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">Lifetime: +24.3%</div>
                    <div className="text-[10px] pt-1 border-t border-white/5">Fees + rewards – est. IL</div>
                    {/* PRO-ONLY enrichment */}
                    <div className="numeric text-[11px] pt-1 border-t border-white/5">
                      Peer avg: +14.2%
                    </div>
                  </div>
                </div>

                {/* Card 6: Range Efficiency (30D) with PRO enrichment */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Range Efficiency (30D)</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    87%
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div className="numeric">In range: <span className="text-[#10B981]">87%</span> of time</div>
                    <div className="numeric">Out of range: <span className="text-[#EF4444]">13%</span> of time</div>
                    {/* PRO-ONLY enrichment */}
                    <div className="numeric pt-1 border-t border-white/5">
                      Peer avg: 68%
                    </div>
                  </div>
                </div>

                {/* Card 7: Active Positions & DEX Spread with PRO enrichment */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                  <div className="text-white/[0.58] text-xs mb-2">Active Positions & DEX Spread</div>
                  <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                    8
                  </div>
                  <div className="text-xs text-white/[0.58] space-y-0.5">
                    <div>Across 2 DEXes</div>
                    <div className="numeric pt-1 border-t border-white/5">
                      Ēnosys: 62% of your TVL · SparkDEX: 38% of your TVL
                    </div>
                    {/* PRO-ONLY enrichment */}
                    <div className="text-[11px] pt-1 border-t border-white/5">
                      <div className="numeric">Ēnosys: $78k · $1,640 fees (30D)</div>
                      <div className="numeric">SparkDEX: $46k · $818 fees (30D)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ZONE B: ACTIVITY CALENDAR + PRO INSIGHT CARD */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* LEFT: Activity Calendar */}
                <div className="lg:col-span-8">
                  <ActivityCalendar isPro={true} />
                  
                  {/* rFLR Claim Activity (NEW - shows rFLR daily claims) */}
                  {rflrData.daily.length > 0 && (
                    <div className="mt-6 bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                      <h3 className="text-white/95 mb-4">
                        rFLR claim activity
                      </h3>
                      <p className="text-white/[0.58] text-xs mb-6">
                        Visual representation of rFLR claims over the last 30 days. Token units only, no USD values or APR.
                      </p>
                      
                      {/* Horizontal activity strip */}
                      <div className="flex items-end gap-1.5 h-24 mb-4">
                        {rflrData.daily.map((day, idx) => {
                          const maxAmount = Math.max(...rflrData.daily.map(d => d.amount));
                          const heightPercent = (day.amount / maxAmount) * 100;
                          
                          return (
                            <TooltipProvider key={idx}>
                              <ShadTooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex-1 flex flex-col justify-end">
                                    <div 
                                      className="bg-[#3B82F6] rounded-t transition-all hover:bg-[#3B82F6]/80 cursor-pointer"
                                      style={{ height: `${heightPercent}%`, minHeight: day.amount > 0 ? '4px' : '0px' }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#0F1A36]/98 border-white/20">
                                  <div className="text-xs">
                                    <div className="text-white/95 mb-1">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                    <div className="text-white/70 numeric">rFLR claimed: {day.amount.toFixed(2)}</div>
                                    <div className="text-white/[0.58] numeric">Claims: {day.claims}</div>
                                  </div>
                                </TooltipContent>
                              </ShadTooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                      
                      {/* Legend */}
                      <div className="flex items-center gap-4 text-xs text-white/[0.58]">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-[#3B82F6]" />
                          <span>rFLR amount (token units)</span>
                        </div>
                        <div className="text-white/40">·</div>
                        <span>Hover for details</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: Peer & Universe Summary (Pro insight card) */}
                <div className="lg:col-span-4">
                  <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8 h-full flex flex-col justify-between">
                    {/* Icon container */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-[#3B82F6]" />
                      </div>
                      <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                        Pro
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-white/95 mb-3">
                        Peer & Universe Summary
                      </h3>
                      
                      <p className="text-white/70 text-sm mb-6">
                        Snapshot of your portfolio compared to similar LPs on Flare (peer group: $75k–$250k portfolio size).
                      </p>
                      
                      {/* Numeric comparison rows */}
                      <div className="space-y-4 mb-6">
                        {/* Average APR */}
                        <div className="bg-[#0B1530]/40 border border-white/5 rounded-lg p-4">
                          <div className="text-white/[0.58] text-xs mb-2">Average APR (30D, annualized)</div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="text-white/[0.58] mb-1">You</div>
                              <div className="text-white/95 numeric">22.4%</div>
                            </div>
                            <div>
                              <div className="text-white/[0.58] mb-1">Peers median</div>
                              <div className="text-white/70 numeric">18.6%</div>
                            </div>
                            <div>
                              <div className="text-white/[0.58] mb-1">Percentile</div>
                              <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-[10px]">
                                Top 20%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Time in Range */}
                        <div className="bg-[#0B1530]/40 border border-white/5 rounded-lg p-4">
                          <div className="text-white/[0.58] text-xs mb-2">Time in range (30D)</div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="text-white/[0.58] mb-1">You</div>
                              <div className="text-white/95 numeric">87%</div>
                            </div>
                            <div>
                              <div className="text-white/[0.58] mb-1">Peers median</div>
                              <div className="text-white/70 numeric">68%</div>
                            </div>
                            <div>
                              <div className="text-white/[0.58] mb-1">Percentile</div>
                              <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-[10px]">
                                Top 15%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Unclaimed % of TVL */}
                        <div className="bg-[#0B1530]/40 border border-white/5 rounded-lg p-4">
                          <div className="text-white/[0.58] text-xs mb-2">Unclaimed % of portfolio TVL</div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="text-white/[0.58] mb-1">You</div>
                              <div className="text-white/95 numeric">2.8%</div>
                            </div>
                            <div>
                              <div className="text-white/[0.58] mb-1">Peers median</div>
                              <div className="text-white/70 numeric">1.8%</div>
                            </div>
                            <div>
                              <div className="text-white/[0.58] mb-1">Status</div>
                              <div className="text-white/70 text-[10px]">Above median</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ZONE C: VALUE & EARNINGS (Same as Premium) */}
              
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

              {/* MODULE: Earnings Breakdown – Fees vs Rewards (Same as Premium) */}
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

              {/* ZONE D: EFFICIENCY, BEHAVIOUR & RISK (Same as Premium with Pro enrichments) */}
              
              {/* MODULE: Net Yield vs HODL + Range Efficiency */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* LEFT: Net Yield vs HODL with PRO enrichment */}
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
                    {/* PRO-ONLY enrichment */}
                    <div className="pt-2 border-t border-white/5">
                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="text-white/[0.58]">Peer net yield (30D)</span>
                        <span className="text-white/95 numeric">+14.2%</span>
                      </div>
                      <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-[10px] mt-2">
                        Top 20% vs peers
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* RIGHT: Range Efficiency with PRO enrichment */}
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
                  
                  {/* PRO-ONLY enrichment */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="text-white/[0.58]">Peer time in range (30D)</span>
                      <span className="text-white/95 numeric">68%</span>
                    </div>
                    <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-xs">
                      Above peers
                    </Badge>
                  </div>
                </div>
              </div>

              {/* MODULE: Unclaimed Fees & Rewards Health (Same as Premium with PRO enrichment) */}
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
                  Health thresholds: {'<'}1% of TVL OK · 1–3% High · {'>'}3% Extreme
                </div>
              </div>

              {/* MODULE: Active Positions & DEX Exposure + Activity & Claim Behaviour */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* LEFT: Active Positions & DEX Exposure (already has PRO enrichment in KPI card) */}
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
                
                {/* RIGHT: Activity & Claim Behaviour with PRO enrichment */}
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
                      <div className="text-[10px] text-white/[0.58] mb-3">
                        Healthy: 7–14 day cadence
                      </div>
                      {/* PRO-ONLY: Claim Efficiency Insight */}
                      <div className="pt-3 border-t border-white/5">
                        <div className="text-white/95 text-xs mb-2">Claim Efficiency Insight</div>
                        <p className="text-white/[0.58] text-[11px]">
                          You claim more frequently than peers (peer avg: 18d). Your unclaimed balance is 2.8% vs peer median of 1.8%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE: Concentration & Largest Pools (Same as Premium) */}
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

              {/* PRO ANALYTICS SECTION */}
              <div className="mb-4">
                <h2 className="text-white/95 mb-2">
                  Pro Analytics
                </h2>
                <p className="text-white/[0.58] text-sm mb-8">
                  Peer and universe comparisons available only on Pro.
                </p>
              </div>

              {/* CARD 1: Peer Comparison */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
                <h3 className="text-white/95 mb-3">
                  Peer Comparison
                </h3>
                <p className="text-white/[0.58] text-sm mb-6">
                  Compare your portfolio performance against similar sized LPs on Flare (peer group: $75k–$250k portfolio size).
                </p>
                
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-white/10 mb-4">
                  <div className="col-span-4 text-white/[0.58] text-xs">Metric</div>
                  <div className="col-span-3 text-right text-white/[0.58] text-xs">You</div>
                  <div className="col-span-3 text-right text-white/[0.58] text-xs">Peers median</div>
                  <div className="col-span-2 text-right text-white/[0.58] text-xs">Percentile</div>
                </div>
                
                <div className="space-y-4">
                  {peerComparisonData.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-white/5 last:border-0">
                      <div className="col-span-4 text-white/70 text-sm">{item.metric}</div>
                      <div className="col-span-3 text-right">
                        <div className="text-white/95 numeric" style={{ fontSize: '18px' }}>{item.you}</div>
                      </div>
                      <div className="col-span-3 text-right">
                        <div className="text-white/70 numeric" style={{ fontSize: '18px' }}>{item.peers}</div>
                      </div>
                      <div className="col-span-2 text-right">
                        <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 text-xs">
                          {item.rank}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 2: Strategy Distribution */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
                <h3 className="text-white/95 mb-3">
                  Strategy Distribution
                </h3>
                <p className="text-white/[0.58] text-sm mb-6">
                  Shows how your liquidity is distributed across risk strategies.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pie chart */}
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={strategyDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {strategyDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 26, 54, 0.98)', 
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Table with Universe comparison */}
                  <div className="space-y-3">
                    {strategyDistribution.map((strategy, idx) => {
                      // Mock universe distribution data
                      const universeDistribution: { [key: string]: number } = {
                        'Aggressive': 40,
                        'Balanced': 45,
                        'Conservative': 15
                      };
                      
                      return (
                        <div key={idx} className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: strategy.fill }} />
                              <span className="text-white/95">{strategy.name}</span>
                            </div>
                            <span className="text-white/95 numeric">{strategy.value}%</span>
                          </div>
                          <div className="text-white/[0.58] text-xs numeric mb-1">
                            Your TVL: ${strategy.liquidity.toLocaleString()}
                          </div>
                          <div className="text-white/[0.58] text-[11px] pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <span>You: {strategy.value}% of your TVL</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Universe: {universeDistribution[strategy.name]}% of pool TVL</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}