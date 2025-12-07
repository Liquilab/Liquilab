import { useState } from "react";
import { PoolTableHeader, PoolTableRow } from "../components/PoolTable";
import { PoolCard } from "../components/PoolCard";
import { 
  LayoutGrid, 
  List, 
  Search, 
  SlidersHorizontal,
  TrendingUp,
  DollarSign,
  Wallet,
  Zap,
  X
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { ActivityCalendar } from "../components/ActivityCalendar";

export function PoolsOverview() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDex, setSelectedDex] = useState<string>("all");
  const [selectedStrategy, setSelectedStrategy] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("tvl");

  // Mock data - user's active positions only
  const poolsData = [
    { 
      token1: "WFLR", 
      token2: "USDT", 
      poolId: "#18745", 
      fee: "0,5 %", 
      dex: "SPARKDEX",
      currentPrice: 1.05000,
      minPrice: 0.950000,
      maxPrice: 1.20000,
      strategyPercent: "12.5%"
    },
    { 
      token1: "WFLR", 
      token2: "FXRP", 
      poolId: "#22003", 
      fee: "0,3 %", 
      dex: "ENOSYS",
      currentPrice: 1.27500,
      minPrice: 0.980000,
      maxPrice: 1.93000,
      strategyPercent: "5.0%"
    },
    { 
      token1: "XRP", 
      token2: "USDT", 
      poolId: "#19234", 
      fee: "0,3 %", 
      dex: "SPARKDEX",
      currentPrice: 2.45000,
      minPrice: 2.10000,
      maxPrice: 2.80000,
      strategyPercent: "15.0%"
    },
    { 
      token1: "ETH", 
      token2: "XRP", 
      poolId: "#20156", 
      fee: "1,0 %", 
      dex: "ENOSYS",
      currentPrice: 0.995000,
      minPrice: 0.980000,
      maxPrice: 1.93000,
      strategyPercent: "20.0%"
    },
    { 
      token1: "BTC", 
      token2: "XRP", 
      poolId: "#21890", 
      fee: "1,0 %", 
      dex: "SPARKDEX",
      currentPrice: 2.05000,
      minPrice: 0.980000,
      maxPrice: 1.93000,
      strategyPercent: "50.0%"
    },
    { 
      token1: "SOLO", 
      token2: "XRP", 
      poolId: "#17652", 
      fee: "0,5 %", 
      dex: "ENOSYS",
      currentPrice: 0.0085,
      minPrice: 0.0050,
      maxPrice: 0.0120,
      strategyPercent: "40.0%"
    }
  ];

  // Simulate filtering - in production would actually filter the data
  const hasResults = poolsData.length > 0;
  
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedDex("all");
    setSelectedStrategy("all");
    setSortBy("tvl");
  };

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-['Manrope',sans-serif] text-white/95 mb-3" style={{ fontSize: '40px' }}>
            My Portfolio
          </h1>
          <p className="font-['Manrope',sans-serif] text-white/70">
            Monitor and manage your active liquidity positions across Ēnosys and SparkDEX
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 font-['Manrope',sans-serif]">
                +12.5%
              </Badge>
            </div>
            <div className="font-['Manrope',sans-serif] text-white/[0.58] mb-2">
              Portfolio Value
            </div>
            <div className="font-['Manrope',sans-serif] text-white/95 numeric" style={{ fontSize: '28px' }}>
              $52,340
            </div>
          </div>
          
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-[#3B82F6]" />
              </div>
            </div>
            <div className="font-['Manrope',sans-serif] text-white/[0.58] mb-2">
              Active Positions
            </div>
            <div className="font-['Manrope',sans-serif] text-white/95 numeric" style={{ fontSize: '28px' }}>
              6
            </div>
          </div>
          
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 font-['Manrope',sans-serif]">
                +8.2%
              </Badge>
            </div>
            <div className="font-['Manrope',sans-serif] text-white/[0.58] mb-2">
              Unclaimed Fees
            </div>
            <div className="font-['Manrope',sans-serif] text-white/95 numeric" style={{ fontSize: '28px' }}>
              $2,845
            </div>
          </div>
          
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-[#10B981]" />
              </div>
            </div>
            <div className="font-['Manrope',sans-serif] text-white/[0.58] mb-2">
              Avg Portfolio APR
            </div>
            <div className="font-['Manrope',sans-serif] text-[#10B981] numeric" style={{ fontSize: '28px' }}>
              24.7%
            </div>
          </div>
        </div>

        {/* Activity Calendar */}
        <ActivityCalendar className="mb-8" />

        {/* Filter Card */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Manrope',sans-serif] text-white/95" style={{ fontSize: '20px' }}>
              Filter positions
            </h2>
            
            {/* Sort Control */}
            <div className="flex items-center gap-3">
              <span className="font-['Manrope',sans-serif] text-white/[0.58]">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-[#0B1530] border-white/10 text-white font-['Manrope',sans-serif]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tvl">Position Size</SelectItem>
                  <SelectItem value="fees">Unclaimed Fees</SelectItem>
                  <SelectItem value="apr">APR</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/40" />
            <Input
              placeholder="Search by token, pair, or pool ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-[#0B1530] border-white/10 text-white placeholder:text-white/40 font-['Manrope',sans-serif] h-12"
            />
          </div>

          {/* Filter Chips */}
          <div className="space-y-4">
            {/* DEX Filter */}
            <div>
              <div className="font-['Manrope',sans-serif] text-white/[0.58] mb-3">
                DEX
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All DEXs" },
                  { value: "enosys", label: "Ēnosys" },
                  { value: "sparkdex", label: "SparkDEX" }
                ].map((dex) => (
                  <button
                    key={dex.value}
                    onClick={() => setSelectedDex(dex.value)}
                    className={`px-4 py-2 rounded-full font-['Manrope',sans-serif] transition-all ${
                      selectedDex === dex.value
                        ? "bg-[#3B82F6] text-white"
                        : "bg-[#0B1530] text-white/70 border border-white/10 hover:border-[#3B82F6]/50 hover:text-white/95"
                    }`}
                  >
                    {dex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy Filter */}
            <div>
              <div className="font-['Manrope',sans-serif] text-white/[0.58] mb-3">
                Strategies
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All strategies" },
                  { value: "aggressive", label: "Aggressive" },
                  { value: "balanced", label: "Balanced" },
                  { value: "conservative", label: "Conservative" }
                ].map((strategy) => (
                  <button
                    key={strategy.value}
                    onClick={() => setSelectedStrategy(strategy.value)}
                    className={`px-4 py-2 rounded-full font-['Manrope',sans-serif] transition-all ${
                      selectedStrategy === strategy.value
                        ? "bg-[#3B82F6] text-white"
                        : "bg-[#0B1530] text-white/70 border border-white/10 hover:border-[#3B82F6]/50 hover:text-white/95"
                    }`}
                  >
                    {strategy.label}
                  </button>
                ))}
              </div>
            </div>

            {/* More Filters Button */}
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="gap-2 border-white/20 text-white/70 hover:bg-white/5 hover:border-[#3B82F6]/50 hover:text-white/95 font-['Manrope',sans-serif]"
              >
                <SlidersHorizontal className="size-4" />
                More filters
              </Button>
            </div>
          </div>
        </div>

        {/* List/Grid Toggle - Prominent */}
        <div className="flex items-center justify-end mb-8">
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

        {/* Empty State */}
        {!hasResults && (
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                <Search className="h-10 w-10 text-[#3B82F6]/60" />
              </div>
            </div>
            
            <h3 className="font-['Manrope',sans-serif] text-white/95 mb-3" style={{ fontSize: '24px' }}>
              No positions match your filters
            </h3>
            
            <p className="font-['Manrope',sans-serif] text-white/70 mb-8">
              Try adjusting your search criteria or clearing filters
            </p>

            <Button 
              onClick={handleClearFilters}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 font-['Manrope',sans-serif] gap-2"
            >
              <X className="size-4" />
              Clear filters
            </Button>
          </div>
        )}

        {/* My Pool Positions Title */}
        {hasResults && (
          <h2 className="font-['Manrope',sans-serif] text-xl text-white/95 mb-6">
            My Pool Positions
          </h2>
        )}

        {/* List view */}
        {hasResults && viewMode === "list" && (
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl overflow-hidden">
            <PoolTableHeader />
            {poolsData.map((pool, index) => (
              <PoolTableRow 
                key={index}
                token1={pool.token1}
                token2={pool.token2}
                poolId={pool.poolId}
                fee={pool.fee}
                dex={pool.dex}
                currentPrice={pool.currentPrice}
                minPrice={pool.minPrice}
                maxPrice={pool.maxPrice}
                strategyPercent={pool.strategyPercent}
              />
            ))}
          </div>
        )}

        {/* Grid view */}
        {hasResults && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {poolsData.map((pool, index) => (
              <PoolCard 
                key={index}
                token1={pool.token1}
                token2={pool.token2}
                poolId={pool.poolId}
                fee={pool.fee}
                dex={pool.dex}
                currentPrice={pool.currentPrice}
                minPrice={pool.minPrice}
                maxPrice={pool.maxPrice}
                strategyPercent={pool.strategyPercent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}