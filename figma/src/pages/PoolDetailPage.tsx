import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TokenPairIcon } from "../components/TokenIcon";
import { Rangeband } from "../components/Rangeband";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  ArrowLeft, 
  ExternalLink, 
  ArrowRight,
  TrendingUp,
  Plus,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts@2.15.0";

// Helper function to determine strategy name from percentage
function getStrategyName(percentStr: string): string {
  const percent = parseFloat(percentStr.replace('%', ''));
  if (percent < 12) return 'Aggressive';
  if (percent <= 35) return 'Balanced';
  return 'Conservative';
}

// Mock price data generator
const generatePriceData = (period: string) => {
  const now = Date.now();
  const dataPoints: any[] = [];
  
  let intervals: number;
  let msPerInterval: number;
  
  switch(period) {
    case '24H':
      intervals = 24;
      msPerInterval = 60 * 60 * 1000;
      break;
    case '7D':
      intervals = 28;
      msPerInterval = 6 * 60 * 60 * 1000;
      break;
    case '30D':
      intervals = 30;
      msPerInterval = 24 * 60 * 60 * 1000;
      break;
    case '90D':
      intervals = 30;
      msPerInterval = 3 * 24 * 60 * 60 * 1000;
      break;
    default:
      intervals = 24;
      msPerInterval = 60 * 60 * 1000;
  }
  
  let basePrice = 1.275;
  
  for (let i = intervals; i >= 0; i--) {
    const timestamp = now - (i * msPerInterval);
    const variation = Math.sin(i * 0.3) * 0.35 + (Math.random() - 0.5) * 0.15;
    const price = basePrice + variation;
    
    dataPoints.push({
      timestamp,
      price: Number(price.toFixed(6)),
      date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  
  return dataPoints;
};

export function PoolDetailPage() {
  const { id } = useParams();
  const [timePeriod, setTimePeriod] = useState('7D');
  
  const priceData = generatePriceData(timePeriod);
  const currentPrice = priceData[priceData.length - 1]?.price || 1.275;
  const minRange = 0.98;
  const maxRange = 1.93;
  
  const midPrice = (minRange + maxRange) / 2;
  const rangeWidthPercent = ((maxRange - minRange) / midPrice) * 100;
  const strategyPercent = `${rangeWidthPercent.toFixed(1)}%`;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-8">
        {/* A. HERO / POOL HEADER */}
        
        {/* Breadcrumb */}
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-white/70 hover:text-[#3B82F6] mb-6 transition-colors">
          <ArrowLeft className="size-4" />
          Back to My Portfolio
        </Link>

        {/* Pool Header Bar */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <TokenPairIcon token1="WFLR" token2="FXRP" size="large" />
              <div>
                <h1 className="text-white/95 mb-1">
                  WFLR / FXRP
                </h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/[0.58]">Pool #18745</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/[0.58]">0.3% fee</span>
                  <Badge variant="outline" className="text-[#1BE8D2] border-[#1BE8D2]/30 text-xs">
                    ENOSYS
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Upgrade to Pro button */}
            <Link to={`/pool/${id}/pro`}>
              <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2">
                Upgrade to Pro
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* B. PRICE CHART & RANGE ANALYSIS */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-white/95 mb-2">
                Price Chart & Range Analysis
              </h2>
              <p className="text-white/[0.58] text-sm">
                WFLR price with your range boundaries · Current: ${currentPrice.toFixed(6)}
              </p>
            </div>
            
            {/* Time Range Toggle */}
            <div className="inline-flex items-center bg-[#0B1530]/60 border border-white/10 rounded-lg p-1 gap-1">
              {['24H', '7D', '30D', '90D'].map(period => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
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

          {/* Chart */}
          <div className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontSize: '12px' }}
                  domain={[0.8, 2.2]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 26, 54, 0.98)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'rgba(255, 255, 255, 0.95)' }}
                />
                
                {/* Range boundaries */}
                <ReferenceLine 
                  y={minRange} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5" 
                  label={{ value: `Min: $${minRange}`, position: 'insideBottomLeft', fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                />
                <ReferenceLine 
                  y={maxRange} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5" 
                  label={{ value: `Max: $${maxRange}`, position: 'insideTopLeft', fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                />
                
                {/* Price line */}
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#3B82F6]" />
              <span className="text-xs text-white/[0.58]">WFLR Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#EF4444]" style={{ borderTop: '2px dashed #EF4444', height: '0' }} />
              <span className="text-xs text-white/[0.58]">Range Boundaries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#CBD5E1] border border-white/40" />
              <span className="text-xs text-white/[0.58]">Liquidity Added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white/40" />
              <span className="text-xs text-white/[0.58]">Fees Claimed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1E3A8A] border border-white/40" />
              <span className="text-xs text-white/[0.58]">Liquidity Removed</span>
            </div>
          </div>
        </div>

        {/* C. KPI ROW (4 CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Unclaimed Fees */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="text-white/[0.58] text-xs mb-2">Unclaimed Fees</div>
            <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
              $1,744
            </div>
            <div className="text-xs text-white/[0.58]">
              Ready to claim
            </div>
          </div>

          {/* Card 2: Unclaimed Incentives */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="text-white/[0.58] text-xs mb-2">Unclaimed Incentives</div>
            <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
              $484
            </div>
            <div className="numeric text-xs text-white/[0.58] pt-2 border-t border-white/5">
              WFLR: 234.56 · FXRP: 123.45
            </div>
          </div>

          {/* Card 3: Total Earned (lifetime) */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="text-white/[0.58] text-xs mb-2">Total Earned (lifetime)</div>
            <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
              $8,940
            </div>
            <div className="text-xs text-white/[0.58]">
              Since start (28 days)
            </div>
          </div>

          {/* Card 4: Lifetime APR (realised) */}
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
            <div className="text-white/[0.58] text-xs mb-2">Lifetime APR (realised)</div>
            <div className="text-[#10B981] numeric mb-2" style={{ fontSize: '32px' }}>
              19.8%
            </div>
            <div className="text-xs text-white/[0.58]">
              Annualized return
            </div>
          </div>
        </div>

        {/* D. RANGEBAND™ STATUS */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-white/95 mb-6">
            RangeBand™ Status
          </h2>

          {/* RangeBand Component */}
          <div className="mb-8">
            <Rangeband
              minPrice={minRange}
              maxPrice={maxRange}
              currentPrice={currentPrice}
              strategyLabel={`${getStrategyName(strategyPercent)} (${strategyPercent})`}
              pairLabel="WFLR/FXRP"
              variant="hero"
            />
          </div>

          {/* 4 Mini-Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
              <div className="text-white/[0.58] text-xs mb-1">Days in Range</div>
              <div className="text-white/95 numeric" style={{ fontSize: '28px' }}>
                24/28
              </div>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
              <div className="text-white/[0.58] text-xs mb-1">Range Efficiency</div>
              <div className="text-[#10B981] numeric" style={{ fontSize: '28px' }}>
                86%
              </div>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
              <div className="text-white/[0.58] text-xs mb-1">Times Out of Range</div>
              <div className="text-white/95 numeric" style={{ fontSize: '28px' }}>
                4
              </div>
            </div>

            <div className="bg-[#0B1530]/60 border border-white/5 rounded-lg p-5">
              <div className="text-white/[0.58] text-xs mb-1">Band Width</div>
              <div className="text-white/95 numeric mb-1" style={{ fontSize: '28px' }}>
                {strategyPercent}
              </div>
              <Badge variant="outline" className="text-[#3B82F6] border-[#3B82F6]/30 text-xs">
                {getStrategyName(strategyPercent)}
              </Badge>
            </div>
          </div>
        </div>

        {/* E. MY POSITIONS TABLE */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-white/95 mb-6">
            My WFLR-FXRP positions
          </h2>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-white/[0.58] pb-3">Position</th>
                  <th className="text-left text-xs text-white/[0.58] pb-3">Liquidity</th>
                  <th className="text-right text-xs text-white/[0.58] pb-3">TVL</th>
                  <th className="text-right text-xs text-white/[0.58] pb-3">Unclaimed Fees</th>
                  <th className="text-right text-xs text-white/[0.58] pb-3">Incentives</th>
                  <th className="text-right text-xs text-white/[0.58] pb-3">7D APR</th>
                  <th className="text-left text-xs text-white/[0.58] pb-3 pl-4">Range & Health</th>
                  <th className="text-right text-xs text-white/[0.58] pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Position 1 */}
                <tr className="border-b border-white/5">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <TokenPairIcon token1="WFLR" token2="FXRP" size="small" />
                      <div>
                        <div className="text-white/95 text-sm mb-0.5">Position #1</div>
                        <div className="text-white/[0.58] text-xs">
                          ENOSYS | #18745
                        </div>
                        <div className="text-white/40 text-[10px] mt-0.5">
                          $0.98 – $1.93
                        </div>
                        <div className="text-white/40 text-[10px]">
                          Minted Nov 3, 2025
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-white/95">125,000 WFLR</div>
                    <div className="text-white/[0.58] text-xs">98,039 FXRP</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-white/95">$52,000</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-white/95">$1,257</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-white/95 mb-1">$342</div>
                    <div className="numeric text-xs text-white/[0.58]">
                      WFLR: 156.78
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-[#10B981] numeric">21.3%</div>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span className="text-white/95 text-sm">Optimal</span>
                    </div>
                    <div className="text-white/[0.58] text-xs">
                      6/7 days in range
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" className="border-white/20 text-white/95 hover:bg-white/5 text-xs">
                        Manage
                      </Button>
                      <Button size="sm" className="bg-[#10B981] hover:bg-[#10B981]/90 text-xs">
                        Claim
                      </Button>
                    </div>
                  </td>
                </tr>

                {/* Position 2 */}
                <tr className="border-b border-white/5">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <TokenPairIcon token1="WFLR" token2="FXRP" size="small" />
                      <div>
                        <div className="text-white/95 text-sm mb-0.5">Position #2</div>
                        <div className="text-white/[0.58] text-xs">
                          ENOSYS | #19203
                        </div>
                        <div className="text-white/40 text-[10px] mt-0.5">
                          $1.10 – $1.50
                        </div>
                        <div className="text-white/40 text-[10px]">
                          Minted Nov 10, 2025
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-white/95">50,000 WFLR</div>
                    <div className="text-white/[0.58] text-xs">39,216 FXRP</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-white/95">$21,000</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-white/95">$487</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-white/95 mb-1">$142</div>
                    <div className="numeric text-xs text-white/[0.58]">
                      WFLR: 64.32
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-[#10B981] numeric">18.7%</div>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                      <span className="text-white/95 text-sm">Soon</span>
                    </div>
                    <div className="text-white/[0.58] text-xs">
                      7/7 days in range
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" className="border-white/20 text-white/95 hover:bg-white/5 text-xs">
                        Manage
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-white/95 hover:bg-white/5 text-xs">
                        Claim
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* F. PRO ANALYTICS TEASER (PREMIUM ONLY) */}
        <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-[#3B82F6]" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white/95">Pro Analytics</h3>
                <Badge className="bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30">Pro</Badge>
              </div>
              
              <p className="text-white/70 mb-4">
                Advanced risk insights, volatility analysis & peer comparisons.
              </p>
              
              <Link to={`/pool/${id}/pro`}>
                <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2">
                  View Pro
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* G. POOL ACTIVITY */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white/95">
              Pool Activity
            </h2>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="your-positions" className="rounded" defaultChecked />
              <label htmlFor="your-positions" className="text-sm text-white/70">
                Your positions only
              </label>
            </div>
          </div>

          {/* Event List */}
          <div className="space-y-4">
            {/* Event 1 */}
            <div className="flex items-center justify-between py-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="size-5 text-[#CBD5E1]" />
                </div>
                <div>
                  <div className="text-white/95 text-sm mb-1">Liquidity Added</div>
                  <div className="text-white/[0.58] text-xs">
                    125,000 WFLR + 98,039 FXRP
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    25 days ago
                  </div>
                </div>
              </div>
              <div className="text-white/95 numeric">
                +$52,000
              </div>
            </div>

            {/* Event 2 */}
            <div className="flex items-center justify-between py-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="size-5 text-[#CBD5E1]" />
                </div>
                <div>
                  <div className="text-white/95 text-sm mb-1">Fees Claimed</div>
                  <div className="text-white/[0.58] text-xs">
                    Position #1
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    3 days ago
                  </div>
                </div>
              </div>
              <div className="text-[#10B981] numeric">
                +$1,257
              </div>
            </div>

            {/* Event 3 */}
            <div className="flex items-center justify-between py-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="size-5 text-[#CBD5E1]" />
                </div>
                <div>
                  <div className="text-white/95 text-sm mb-1">Out of Range</div>
                  <div className="text-white/[0.58] text-xs">
                    Position #1 · Price fell below $0.98
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    8 days ago
                  </div>
                </div>
              </div>
              <div className="text-white/[0.58] text-xs">
                Alert
              </div>
            </div>
          </div>

          {/* View Full History Link */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <a 
              href="https://flare-explorer.flare.network" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#3B82F6] hover:underline text-sm"
            >
              View full history on Flare Explorer
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}