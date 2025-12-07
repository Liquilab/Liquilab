import { useState, useEffect } from "react";
import { WaveBackground } from "../components/WaveBackground";
import { Rangeband } from "../components/Rangeband";
import { InteractiveRangeBandExplainer } from "../components/InteractiveRangeBandExplainer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Footer } from "../components/Footer";
import { ArrowRight, Target, TrendingUp, Bell, CheckCircle2, XCircle, AlertTriangle, Eye, Zap, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export function RangeBandExplainer() {
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past hero (approx 600px)
      setShowStickyBar(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative">
      <WaveBackground />
      
      {/* Sticky CTA Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-[#0F1A36]/98 border-b border-white/10 backdrop-blur-sm transition-transform duration-300 ${
        showStickyBar ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <p className="text-white/95 font-medium">
            Ready to monitor your liquidity with RangeBand™?
          </p>
          <div className="flex items-center gap-3">
            <Link to="/pricing">
              <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
                Start 14-day trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="border-white/20 text-white/95 hover:bg-white/5">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="mb-24 text-center">
          <h1 className="font-heading text-white/95 mb-6" style={{ fontSize: '56px', lineHeight: '1.1' }}>
            Introducing RangeBand™
          </h1>
          
          <p className="font-['Inter',sans-serif] text-white/70 max-w-3xl mx-auto mb-12" style={{ fontSize: '20px', lineHeight: '1.6' }}>
            Your pools health and strategy, immediatly visible at a glance.
          </p>

          {/* Interactive Explainer */}
          <div className="max-w-3xl mx-auto mb-12 bg-[#0F1A36]/95 border border-white/10 rounded-xl p-12">
            <h2 className="mb-6 text-center text-white/95" style={{ fontSize: '28px' }}>
              Interactive Explainer
            </h2>
            
            <p className="mb-8 text-center text-white/60 text-sm">
              Hover over the strategy labels and status dots below to see how RangeBand™ visualizes your strategy.
            </p>

            <InteractiveRangeBandExplainer />
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4">
            <Link to="/pools">
              <Button size="lg" className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white gap-2 font-['Inter',sans-serif] px-8 py-6">
                Try RangeBand™ on your pools
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white/20 text-white/95 hover:bg-white/5 font-['Inter',sans-serif] px-8 py-6">
                Start 14-day trial
              </Button>
            </Link>
          </div>
        </div>

        {/* Before & After Story Block */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-white/95 mb-4" style={{ fontSize: '40px' }}>
              The RangeBand™ Difference
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Before */}
            <div className="bg-[#0F1A36]/95 border-2 border-[#EF4444]/30 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <XCircle className="size-6 text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="font-heading text-white/95" style={{ fontSize: '20px' }}>Before</h3>
                  <p className="text-sm text-white/70">RangeBand™</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/70">Time Out of Range</p>
                  <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30 font-['Inter',sans-serif]">Poor</Badge>
                </div>
                <div className="text-display text-white/95 mb-2 numeric">40%</div>
                <p className="text-sm text-white/[0.58]">of time not earning fees</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70">Missed out-of-range notifications</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70">Late rebalancing decisions</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70">Lost fee opportunities</p>
                </div>
              </div>

              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4 text-center">
                <p className="text-[#EF4444] numeric">~$2,340 in missed fees</p>
              </div>
            </div>

            {/* After */}
            <div className="bg-[#0F1A36]/95 border-2 border-[#10B981]/30 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="font-heading text-white/95" style={{ fontSize: '20px' }}>After</h3>
                  <p className="text-sm text-white/70">RangeBand™</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/70">Time Out of Range</p>
                  <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30 font-['Inter',sans-serif]">Excellent</Badge>
                </div>
                <div className="text-display text-[#10B981] mb-2 numeric">12%</div>
                <p className="text-sm text-white/[0.58]">88% in-range efficiency</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70">Real-time range monitoring</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70">Instant alerts before issues</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70">Proactive rebalancing</p>
                </div>
              </div>

              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 text-center">
                <p className="text-[#10B981] numeric">~$8,240 total fees earned</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">
              <strong className="text-white/70">Demo data:</strong> 90-day period on WFLR/FXRP pool with $50,000 liquidity
            </p>
          </div>
        </div>

        {/* Visual Health Monitoring at a Glance */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-heading text-white/95 mb-4" style={{ fontSize: '40px' }}>
              Visual Health Monitoring at a Glance
            </h2>
            <p className="font-['Inter',sans-serif] text-white/70 max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
              RangeBand™ imports your existing liquidity positions and visualizes the strategy you chose when minting on Ēnosys or SparkDEX. 
              See health status in real-time and take action when needed—all through the DEX.
            </p>
          </div>

          {/* Step 1: Import & Visualize Your Strategy */}
          <div className="mb-16 bg-[#0F1A36]/95 border-2 border-[#3B82F6]/30 rounded-xl p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <Eye className="size-8 text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="font-heading text-white/95 mb-1" style={{ fontSize: '28px' }}>
                  1. Import & Visualize Your Strategy
                </h3>
                <p className="font-['Inter',sans-serif] text-white/70">
                  Your strategy is set when you mint your position. RangeBand™ detects and visualizes it—you don't configure this in Liquilab.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Aggressive */}
              <div className="bg-[#0B1530] border border-white/10 rounded-lg p-5">
                <h4 className="font-heading text-white/95 mb-1 text-sm">Aggressive (&lt; 12%)</h4>
                <div className="mb-3">
                  <Rangeband 
                    variant="card"
                    currentPrice={1.27500}
                    minPrice={1.20000}
                    maxPrice={1.35000}
                    strategyLabel="Aggressive (10.0%)"
                    pairLabel="WFLR/FXRP"
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1"></div>
                    <span className="font-['Inter',sans-serif] text-white/70">Highest fee capture</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1"></div>
                    <span className="font-['Inter',sans-serif] text-white/70">Daily monitoring needed</span>
                  </div>
                </div>
              </div>

              {/* Balanced */}
              <div className="bg-[#0B1530] border border-white/10 rounded-lg p-5">
                <h4 className="font-heading text-white/95 mb-1 text-sm">Balanced (12-35%)</h4>
                <div className="mb-3">
                  <Rangeband 
                    variant="card"
                    currentPrice={1.27500}
                    minPrice={1.05000}
                    maxPrice={1.60000}
                    strategyLabel="Balanced (25.0%)"
                    pairLabel="WFLR/FXRP"
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1"></div>
                    <span className="font-['Inter',sans-serif] text-white/70">Good balance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1"></div>
                    <span className="font-['Inter',sans-serif] text-white/70">Weekly checks</span>
                  </div>
                </div>
              </div>

              {/* Conservative */}
              <div className="bg-[#0B1530] border border-white/10 rounded-lg p-5">
                <h4 className="font-heading text-white/95 mb-1 text-sm">Conservative (&gt; 35%)</h4>
                <div className="mb-3">
                  <Rangeband 
                    variant="card"
                    currentPrice={1.27500}
                    minPrice={0.60000}
                    maxPrice={2.50000}
                    strategyLabel="Conservative (50.0%)"
                    pairLabel="WFLR/FXRP"
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1"></div>
                    <span className="font-['Inter',sans-serif] text-white/70">Consistent fees</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1"></div>
                    <span className="font-['Inter',sans-serif] text-white/70">Minimal monitoring</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <p className="font-['Inter',sans-serif] text-white/70 text-sm">
                💡 <strong className="text-white/95">Strategy is detected, not configured.</strong> RangeBand™ reads your position's min/max price to determine strategy width.
              </p>
            </div>
          </div>

          {/* Step 2: Real-Time Health Status */}
          <div className="mb-16 bg-[#0F1A36]/95 border-2 border-[#3B82F6]/30 rounded-xl p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <Zap className="size-8 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-heading text-white/95 mb-1" style={{ fontSize: '28px' }}>
                  2. Real-Time Health Status
                </h3>
                <p className="font-['Inter',sans-serif] text-white/70">
                  RangeBand™ continuously monitors current price vs your range and shows status with color-coded indicators.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* In Range */}
              <div className="bg-[#0B1530] border-2 border-[#10B981]/40 rounded-lg p-6">
                <div className="mb-4">
                  <Rangeband 
                    variant="card"
                    currentPrice={1.27500}
                    minPrice={1.05000}
                    maxPrice={1.60000}
                    status="inRange"
                    strategyLabel="Balanced (25.0%)"
                    pairLabel="WFLR/FXRP"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse"></div>
                  <h4 className="font-heading text-[#10B981]">In Range</h4>
                </div>
                <p className="font-['Inter',sans-serif] text-white/70 text-sm">
                  Position is earning fees. Monitor regularly to stay informed.
                </p>
              </div>

              {/* Near Band */}
              <div className="bg-[#0B1530] border-2 border-[#F59E0B]/40 rounded-lg p-6">
                <div className="mb-4">
                  <Rangeband 
                    variant="card"
                    currentPrice={1.58000}
                    minPrice={1.05000}
                    maxPrice={1.60000}
                    status="nearBand"
                    strategyLabel="Balanced (25.0%)"
                    pairLabel="WFLR/FXRP"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B] animate-pulse" style={{ animationDuration: '2s' }}></div>
                  <h4 className="font-heading text-[#F59E0B]">Near Band</h4>
                </div>
                <p className="font-['Inter',sans-serif] text-white/70 text-sm">
                  Price approaching range edge. Consider rebalancing soon.
                </p>
              </div>

              {/* Out of Range */}
              <div className="bg-[#0B1530] border-2 border-[#EF4444]/40 rounded-lg p-6">
                <div className="mb-4">
                  <Rangeband 
                    variant="card"
                    currentPrice={1.75000}
                    minPrice={1.05000}
                    maxPrice={1.60000}
                    status="outOfRange"
                    strategyLabel="Balanced (25.0%)"
                    pairLabel="WFLR/FXRP"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                  <h4 className="font-heading text-[#EF4444]">Out of Range</h4>
                </div>
                <p className="font-['Inter',sans-serif] text-white/70 text-sm">
                  Not earning fees. Rebalance or adjust range on the DEX.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Quick Actions via DEX Links */}
          <div className="bg-[#0F1A36]/95 border-2 border-[#3B82F6]/30 rounded-xl p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <ExternalLink className="size-8 text-[#1BE8D2]" />
              </div>
              <div>
                <h3 className="font-heading text-white/95 mb-1" style={{ fontSize: '28px' }}>
                  3. Quick Actions via DEX Links
                </h3>
                <p className="font-['Inter',sans-serif] text-white/70">
                  Liquilab doesn't modify your positions—it monitors them. All actions happen directly on Ēnosys or SparkDEX.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Available Actions */}
              <div className="bg-[#0B1530] border border-white/10 rounded-lg p-6">
                <h4 className="font-heading text-white/95 mb-4">Available Quick Actions</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-2"></div>
                    <div>
                      <p className="font-['Inter',sans-serif] text-white/95">Claim Fees</p>
                      <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">Collect unclaimed earnings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-2"></div>
                    <div>
                      <p className="font-['Inter',sans-serif] text-white/95">Increase Liquidity</p>
                      <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">Add more funds to position</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-2"></div>
                    <div>
                      <p className="font-['Inter',sans-serif] text-white/95">Decrease Liquidity</p>
                      <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">Remove funds from position</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-2"></div>
                    <div>
                      <p className="font-['Inter',sans-serif] text-white/95">Rebalance Range</p>
                      <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">Adjust min/max boundaries</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Scenario */}
              <div className="bg-[#0B1530] border border-white/10 rounded-lg p-6">
                <h4 className="font-heading text-white/95 mb-4">Example: Out of Range</h4>
                <div className="mb-4">
                  <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30 font-['Inter',sans-serif] mb-3">
                    Out of Range
                  </Badge>
                  <p className="font-['Inter',sans-serif] text-white/70 text-sm mb-4">
                    Your WFLR/FXRP position is out of range. Current price $1.75 is above your max price $1.60. 
                    You're not earning fees until you rebalance.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button className="w-auto bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white gap-2 font-['Inter',sans-serif] px-6">
                    Rebalance on Ēnosys
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-['Inter',sans-serif] text-white/70 text-sm">
                <strong className="text-white/95">Liquilab is a monitoring dashboard.</strong> All liquidity management happens on Ēnosys or SparkDEX—we just make it easier to know when and how to act.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-br from-[#3B82F6]/10 to-[#1BE8D2]/5 border border-[#3B82F6]/20 rounded-xl p-12 text-center">
          <h2 className="font-heading text-white/95 mb-4" style={{ fontSize: '40px' }}>
            Ready to try RangeBand™?
          </h2>
          <p className="font-['Inter',sans-serif] text-white/70 mb-8 max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Start monitoring your liquidity positions with intelligent range tracking. 
            Available on Premium and Pro plans with 14-day free trial.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/pools">
              <Button size="lg" className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white gap-2 font-['Inter',sans-serif] px-8 py-6">
                View pools with RangeBand™
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white/20 text-white/95 hover:bg-white/5 font-['Inter',sans-serif] px-8 py-6">
                View pricing
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="font-['Inter',sans-serif] text-white/[0.58]">
              Join 500+ liquidity providers already using RangeBand™ • No credit card required
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}