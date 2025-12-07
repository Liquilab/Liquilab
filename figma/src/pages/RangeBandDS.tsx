import { Link } from "react-router-dom";
import { Rangeband } from "../components/Rangeband";
import { TokenPairIcon } from "../components/TokenIcon";
import { ArrowLeft } from "lucide-react";

export function RangeBandDS() {
  return (
    <div className="min-h-screen bg-[#0B1530] py-12 px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-[#3B82F6] mb-8 transition-colors">
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="font-['Quicksand',sans-serif] text-white/95 mb-3" style={{ fontSize: '40px' }}>
            RangeBand™ Design System
          </h1>
          <p className="font-['Inter',sans-serif] text-white/70 max-w-3xl" style={{ fontSize: '18px' }}>
            ONE unified component with THREE layout variants. All share the same visual DNA, status colors, and element ordering—just resized for different contexts.
          </p>
        </div>

        {/* Three Variants Overview */}
        <div className="mb-16">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6" style={{ fontSize: '32px' }}>
            Component Variants
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Variant 1: List */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-2" style={{ fontSize: '20px' }}>
                  List
                </h3>
                <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">
                  Compact, for table rows. Occupies ~60% of row width, centered in RangeBand column.
                </p>
              </div>
              <div className="bg-[#0B1530] border border-white/5 rounded p-4">
                <Rangeband
                  variant="list"
                  minPrice={0.980000}
                  maxPrice={1.930000}
                  currentPrice={1.275000}
                  strategyLabel="Balanced (25.0%)"
                  pairLabel="WFLR/FXRP"
                  status="inRange"
                />
              </div>
            </div>

            {/* Variant 2: Card */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-2" style={{ fontSize: '20px' }}>
                  Card
                </h3>
                <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">
                  Vertical layout for pool cards, mobile views, and marketing blocks.
                </p>
              </div>
              <div className="bg-[#0B1530] border border-white/5 rounded p-6">
                <Rangeband
                  variant="card"
                  minPrice={0.980000}
                  maxPrice={1.930000}
                  currentPrice={1.275000}
                  strategyLabel="Balanced (25.0%)"
                  pairLabel="WFLR/FXRP"
                  status="inRange"
                />
              </div>
            </div>

            {/* Variant 3: Hero */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-2" style={{ fontSize: '20px' }}>
                  Hero
                </h3>
                <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">
                  Large marketing demo. Full width with slightly larger elements.
                </p>
              </div>
              <div className="bg-[#0B1530] border border-white/5 rounded p-8">
                <Rangeband
                  variant="hero"
                  minPrice={0.980000}
                  maxPrice={1.930000}
                  currentPrice={1.275000}
                  strategyLabel="Balanced (25.0%)"
                  pairLabel="WFLR/FXRP"
                  status="inRange"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status States */}
        <div className="mb-16">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6" style={{ fontSize: '32px' }}>
            Three Range States
          </h2>
          <p className="font-['Inter',sans-serif] text-white/70 mb-8">
            RangeBand™ automatically detects and visualizes three range states based on current price position.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* In Range */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                  <div className="size-4 rounded-full bg-[#10B981]"></div>
                </div>
                <div>
                  <h3 className="font-['Quicksand',sans-serif] text-white/95" style={{ fontSize: '18px' }}>
                    In Range
                  </h3>
                </div>
              </div>
              
              <div className="bg-[#0B1530] border border-white/5 rounded p-6 mb-6">
                <Rangeband
                  variant="card"
                  minPrice={0.980000}
                  maxPrice={1.930000}
                  currentPrice={1.350000}
                  strategyLabel="In Range"
                  pairLabel="WFLR/FXRP"
                  status="inRange"
                />
              </div>

              <ul className="font-['Inter',sans-serif] text-white/70 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Status:</span> Position is earning fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Visual:</span> Green dot with glow + heartbeat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Action:</span> Monitor periodically</span>
                </li>
              </ul>
            </div>

            {/* Near Band */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                  <div className="size-4 rounded-full bg-[#F59E0B]"></div>
                </div>
                <div>
                  <h3 className="font-['Quicksand',sans-serif] text-white/95" style={{ fontSize: '18px' }}>
                    Near Band
                  </h3>
                </div>
              </div>
              
              <div className="bg-[#0B1530] border border-white/5 rounded p-6 mb-6">
                <Rangeband
                  variant="card"
                  minPrice={0.980000}
                  maxPrice={1.930000}
                  currentPrice={1.010000}
                  strategyLabel="Near Band"
                  pairLabel="WFLR/FXRP"
                  status="nearBand"
                />
              </div>

              <ul className="font-['Inter',sans-serif] text-white/70 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Status:</span> Price approaching range edge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Visual:</span> Amber dot with glow + slow pulse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Action:</span> Consider rebalancing soon</span>
                </li>
              </ul>
            </div>

            {/* Out of Range */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                  <div className="size-4 rounded-full bg-[#EF4444]"></div>
                </div>
                <div>
                  <h3 className="font-['Quicksand',sans-serif] text-white/95" style={{ fontSize: '18px' }}>
                    Out of Range
                  </h3>
                </div>
              </div>
              
              <div className="bg-[#0B1530] border border-white/5 rounded p-6 mb-6">
                <Rangeband
                  variant="card"
                  minPrice={0.980000}
                  maxPrice={1.930000}
                  currentPrice={0.850000}
                  strategyLabel="Out of Range"
                  pairLabel="WFLR/FXRP"
                  status="outOfRange"
                />
              </div>

              <ul className="font-['Inter',sans-serif] text-white/70 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Status:</span> No fees being earned</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Visual:</span> Red dot, no glow or animation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1 font-bold">•</span>
                  <span><span className="font-bold text-white/95">Action:</span> Rebalance or exit position</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Strategy Widths */}
        <div className="mb-16">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6" style={{ fontSize: '32px' }}>
            Strategy Band Widths
          </h2>
          <p className="font-['Inter',sans-serif] text-white/70 mb-8">
            Band width automatically adjusts based on strategy percentage. Same ratios across all variants.
          </p>

          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 space-y-8">
            {/* Aggressive */}
            <div>
              <div className="mb-4">
                <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-1" style={{ fontSize: '18px' }}>
                  Aggressive (&lt; 12%)
                </h3>
                <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">
                  30% band width – tight range, higher risk/reward
                </p>
              </div>
              <div className="bg-[#0B1530] border border-white/5 rounded p-6">
                <Rangeband
                  variant="card"
                  minPrice={1.200000}
                  maxPrice={1.350000}
                  currentPrice={1.275000}
                  strategyLabel="Aggressive (8.5%)"
                  pairLabel="WFLR/FXRP"
                />
              </div>
            </div>

            {/* Balanced */}
            <div>
              <div className="mb-4">
                <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-1" style={{ fontSize: '18px' }}>
                  Balanced (12–35%)
                </h3>
                <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">
                  65% band width – moderate range
                </p>
              </div>
              <div className="bg-[#0B1530] border border-white/5 rounded p-6">
                <Rangeband
                  variant="card"
                  minPrice={0.980000}
                  maxPrice={1.930000}
                  currentPrice={1.275000}
                  strategyLabel="Balanced (25.0%)"
                  pairLabel="WFLR/FXRP"
                />
              </div>
            </div>

            {/* Conservative */}
            <div>
              <div className="mb-4">
                <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-1" style={{ fontSize: '18px' }}>
                  Conservative (&gt; 35%)
                </h3>
                <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">
                  100% band width – wide range, lower risk
                </p>
              </div>
              <div className="bg-[#0B1530] border border-white/5 rounded p-6">
                <Rangeband
                  variant="card"
                  minPrice={0.750000}
                  maxPrice={2.150000}
                  currentPrice={1.275000}
                  strategyLabel="Conservative (45.0%)"
                  pairLabel="WFLR/FXRP"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Component in Context */}
        <div className="mb-16">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6" style={{ fontSize: '32px' }}>
            Component in Context
          </h2>
          <p className="font-['Inter',sans-serif] text-white/70 mb-8">
            See how RangeBand™ integrates into real UI patterns.
          </p>

          <div className="grid grid-cols-1 gap-8">
            {/* Pool Table Row Context */}
            <div>
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-4" style={{ fontSize: '20px' }}>
                Pool Table Row (List Variant)
              </h3>
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-4 px-6 py-4 border-b border-white/5">
                  <div className="font-['Inter',sans-serif] text-white/40 text-sm">Pool</div>
                  <div className="font-['Inter',sans-serif] text-white/40 text-sm text-right">TVL</div>
                  <div className="font-['Inter',sans-serif] text-white/40 text-sm text-right">Fees</div>
                  <div className="font-['Inter',sans-serif] text-white/40 text-sm text-right">APR</div>
                  <div className="font-['Inter',sans-serif] text-white/40 text-sm text-center">RangeBand</div>
                </div>
                {/* Table Row */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-4 px-6 py-6 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <TokenPairIcon token1="WFLR" token2="FXRP" size="small" />
                    <div>
                      <p className="font-['Inter',sans-serif] text-white/95 text-sm">WFLR / FXRP</p>
                      <p className="font-['Inter',sans-serif] text-white/40 text-xs">ENOSYS • #22003</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-['Inter',sans-serif] text-white/95 numeric">$289K</p>
                  </div>
                  <div className="text-right">
                    <p className="font-['Inter',sans-serif] text-[#3B82F6] numeric">$845</p>
                  </div>
                  <div className="text-right">
                    <p className="font-['Inter',sans-serif] text-[#10B981] numeric">23.8%</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Rangeband
                      variant="list"
                      minPrice={0.980000}
                      maxPrice={1.930000}
                      currentPrice={1.275000}
                      strategyLabel="Balanced (25.0%)"
                      pairLabel="WFLR/FXRP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pool Card Context */}
            <div>
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-4" style={{ fontSize: '20px' }}>
                Pool Card (Card Variant)
              </h3>
              <div className="max-w-md">
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <TokenPairIcon token1="WFLR" token2="FXRP" />
                    <div>
                      <p className="font-['Inter',sans-serif] text-white/95">WFLR / FXRP</p>
                      <p className="font-['Inter',sans-serif] text-white/40 text-xs">ENOSYS • #22003 • 0.3%</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="font-['Inter',sans-serif] text-white/50 text-xs mb-1">TVL</p>
                      <p className="font-['Inter',sans-serif] text-white/95 numeric">$289.1K</p>
                    </div>
                    <div>
                      <p className="font-['Inter',sans-serif] text-white/50 text-xs mb-1">APR</p>
                      <p className="font-['Inter',sans-serif] text-[#10B981] numeric">23.85%</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <Rangeband
                      variant="card"
                      minPrice={0.980000}
                      maxPrice={1.930000}
                      currentPrice={1.275000}
                      strategyLabel="Balanced (25.0%)"
                      pairLabel="WFLR/FXRP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Section Context */}
            <div>
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-4" style={{ fontSize: '20px' }}>
                Hero Marketing Section (Hero Variant)
              </h3>
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-12">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-3" style={{ fontSize: '32px' }}>
                      RangeBand™ Demo
                    </h2>
                    <p className="font-['Inter',sans-serif] text-white/70" style={{ fontSize: '16px' }}>
                      See your position status at a glance
                    </p>
                  </div>
                  
                  <Rangeband
                    variant="hero"
                    minPrice={0.980000}
                    maxPrice={1.930000}
                    currentPrice={1.275000}
                    strategyLabel="Balanced (25.0%)"
                    pairLabel="WFLR/FXRP"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design Specifications */}
        <div className="mb-16">
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6" style={{ fontSize: '32px' }}>
            Design Specifications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Element Order */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-4" style={{ fontSize: '18px' }}>
                Element Order (All Variants)
              </h3>
              <ol className="space-y-2 font-['Inter',sans-serif] text-white/70 text-sm list-decimal list-inside">
                <li>Strategy label (e.g., "Balanced (25.0%)")</li>
                <li>Horizontal band with glowing status dot</li>
                <li>Min and max price labels (under band ends)</li>
                <li>Current price (large, centered)</li>
                <li>Pair label (e.g., "WFLR/FXRP")</li>
                <li>Caption: "Powered by RangeBand™"</li>
              </ol>
            </div>

            {/* Status Colors */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-4" style={{ fontSize: '18px' }}>
                Status Colors (Semantic)
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-[#10B981] flex-shrink-0"></div>
                  <div>
                    <p className="font-['Inter',sans-serif] text-white/95 text-sm">In Range</p>
                    <p className="font-['Inter',sans-serif] text-white/[0.58] text-xs">#10B981 • Glow + heartbeat</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-[#F59E0B] flex-shrink-0"></div>
                  <div>
                    <p className="font-['Inter',sans-serif] text-white/95 text-sm">Near Band</p>
                    <p className="font-['Inter',sans-serif] text-white/[0.58] text-xs">#F59E0B • Glow + slow heartbeat</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-[#EF4444] flex-shrink-0"></div>
                  <div>
                    <p className="font-['Inter',sans-serif] text-white/95 text-sm">Out of Range</p>
                    <p className="font-['Inter',sans-serif] text-white/[0.58] text-xs">#EF4444 • No glow, no animation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Variant Sizes */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-4" style={{ fontSize: '18px' }}>
                Dot & Typography Sizes
              </h3>
              <div className="space-y-3 font-['Inter',sans-serif] text-white/70 text-sm">
                <div>
                  <p className="text-white/95 mb-1">List Variant</p>
                  <p className="text-xs text-white/[0.58]">Dot: 14px • Current price: 16px • Min/max: 10px</p>
                </div>
                <div>
                  <p className="text-white/95 mb-1">Card Variant</p>
                  <p className="text-xs text-white/[0.58]">Dot: 21px • Current price: 24px • Min/max: 11px</p>
                </div>
                <div>
                  <p className="text-white/95 mb-1">Hero Variant</p>
                  <p className="text-xs text-white/[0.58]">Dot: 28px • Current price: 32px • Min/max: 12px</p>
                </div>
              </div>
            </div>

            {/* Band Widths */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-4" style={{ fontSize: '18px' }}>
                Band Width Calculation
              </h3>
              <div className="space-y-2 font-['Inter',sans-serif] text-white/70 text-sm">
                <div className="flex justify-between">
                  <span>Aggressive (&lt; 12%)</span>
                  <span className="text-white/95">30% width</span>
                </div>
                <div className="flex justify-between">
                  <span>Balanced (12-35%)</span>
                  <span className="text-white/95">65% width</span>
                </div>
                <div className="flex justify-between">
                  <span>Conservative (&gt; 35%)</span>
                  <span className="text-white/95">100% width</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div>
          <h2 className="font-['Quicksand',sans-serif] text-white/95 mb-6" style={{ fontSize: '32px' }}>
            Usage Guidelines
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-3" style={{ fontSize: '18px' }}>
                List Variant
              </h3>
              <ul className="font-['Inter',sans-serif] text-white/70 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Pool overview table (last column)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>"My Positions" table</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Max width: 600px, auto-centered</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Occupies ~60% of row width</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-3" style={{ fontSize: '18px' }}>
                Card Variant
              </h3>
              <ul className="font-['Inter',sans-serif] text-white/70 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Pool cards (grid view)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Mobile pool views</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>RangeBand explainer cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Fills card width with padding</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-3" style={{ fontSize: '18px' }}>
                Hero Variant
              </h3>
              <ul className="font-['Inter',sans-serif] text-white/70 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>RangeBand marketing page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Homepage demo section</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Pool detail hero sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1BE8D2] mt-1">•</span>
                  <span>Full width, larger elements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}