import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { WaveBackground } from "../components/WaveBackground";
import { PoolCard } from "../components/PoolCard";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import { ArrowRight, TrendingUp, Activity, Bell, Users, Quote } from "lucide-react";
import emmaJohnson from 'figma:asset/996229c915255a5ede0f25796fa79811c06f6000.png';

export function HomePage() {
  const metrics = [
    {
      value: "$12.4M",
      label: "Total TVL Monitored",
      icon: TrendingUp,
      trend: "+18% this month"
    },
    {
      value: "247",
      label: "Active Pools Tracked",
      icon: Activity,
      trend: "Across Ēnosys & SparkDEX"
    },
    {
      value: "1,834",
      label: "Alerts Sent (24H)",
      icon: Bell,
      trend: "Keeping LPs in range"
    }
  ];

  const dexLogos = [
    { name: "Ēnosys", abbr: "EN" },
    { name: "SparkDEX", abbr: "SD" },
    { name: "Flare Network", abbr: "FN" },
    { name: "DeFi Fund", abbr: "DF" },
    { name: "Power User", abbr: "PU" }
  ];

  return (
    <div className="min-h-screen relative">
      <WaveBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-[1400px] mx-auto px-8 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo Hero */}
            <div className="flex justify-center mb-8">
              <Logo size="lg" showText={false} />
            </div>
            
            <h1 className="text-white/95 mb-6">
              Manage your Flare LPs with confidence
            </h1>
            
            <p className="text-white/70 mb-12 leading-relaxed">
              RangeBand™ shows exactly how healthy your pools are—easily manege them at a glance and stop leaking fees. Timely alerts, deep analytics and peer benchmarks, powered by live FTSO data—starting at $14.95.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link to="/pricing">
                <Button size="lg" className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white gap-2 px-8">
                  Start 14-day trial
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="max-w-[1400px] mx-auto px-8 pb-24">
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-2xl p-12">
            <h2 className="text-white/95 text-center mb-12">
              Why Liquilab works
            </h2>
            
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-14 w-14 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                      <metric.icon className="h-7 w-7 text-[#3B82F6]" />
                    </div>
                  </div>
                  <div className="numeric text-white/95 mb-2 text-hero-metric">
                    {metric.value}
                  </div>
                  <div className="text-white/70 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-white/[0.58]">
                    {metric.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial & Logos Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Testimonial */}
              <div className="bg-[#0B1530]/60 border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={emmaJohnson} 
                    alt="Emma Johnson"
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Quote className="h-5 w-5 text-[#1BE8D2] mb-2" />
                    <p className="text-white/95 mb-4 italic">
                      "Liquilab helps us keep concentrated LPs in range with real-time RangeBand™ alerts. Reduced out-of-range time by 67%."
                    </p>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-white/95">Emma Johnson</div>
                        <div className="text-white/[0.58]">DeFi Fund Manager</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner Logos */}
              <div>
                <div className="text-white/[0.58] text-center mb-4">
                  Trusted by teams across Flare Network
                </div>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  {dexLogos.map((logo, index) => (
                    <div 
                      key={index}
                      className="h-16 w-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                      title={logo.name}
                    >
                      <span className="text-white/70" style={{ fontFamily: 'var(--font-heading)' }}>
                        {logo.abbr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Pools Section */}
        <section className="max-w-[1400px] mx-auto px-8 pb-24">
          <div className="mb-12">
            <h2 className="text-white/95 mb-4">
              Featured Pools
            </h2>
            <p className="text-white/70">
              Explore popular liquidity pools on Flare Network with live RangeBand™ analytics <span className="text-white/[0.58]">(demo data)</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PoolCard 
              token1="WFLR" 
              token2="USDT" 
              poolId="#18745" 
              fee="0,5 %" 
              dex="SPARKDEX"
              currentPrice={1.05000}
              minPrice={0.950000}
              maxPrice={1.20000}
              strategyPercent="12.5%"
            />
            <PoolCard 
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
            <PoolCard 
              token1="XRP" 
              token2="USDT" 
              poolId="#19234" 
              fee="0,3 %" 
              dex="SPARKDEX"
              currentPrice={2.45000}
              minPrice={2.10000}
              maxPrice={2.80000}
              strategyPercent="15.0%"
            />
            <PoolCard 
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
            <PoolCard 
              token1="BTC"
              token2="XRP"
              poolId="#21890"
              fee="1,0 %"
              dex="SPARKDEX"
              currentPrice={2.05000}
              minPrice={0.980000}
              maxPrice={1.93000}
              strategyPercent="50.0%"
            />
            <PoolCard 
              token1="SOLO" 
              token2="XRP" 
              poolId="#17652" 
              fee="0,5 %" 
              dex="ENOSYS"
              currentPrice={0.0085}
              minPrice={0.0050}
              maxPrice={0.0120}
              strategyPercent="40.0%"
            />
          </div>
          
          <div className="text-center mt-12">
            <Link to="/pools">
              <Button variant="outline" size="lg" className="border-white/20 text-white/95 hover:bg-white/5 hover:border-white/30 gap-2 px-8">
                View all pools
                <ArrowRight className="size-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-[1400px] mx-auto px-8 pb-24">
          <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-2xl p-12 text-center">
            <h2 className="text-white/95 mb-4">
              Ready to optimize your liquidity positions?
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Start your 14-day free trial and experience RangeBand™ analytics for your concentrated liquidity pools.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/pricing">
                <Button size="lg" className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white gap-2 px-8">
                  Start 14-day trial
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link to="/rangeband">
                <Button size="lg" variant="outline" className="border-white/20 text-white/95 hover:bg-white/5 hover:border-white/30 px-8">
                  Learn about RangeBand™
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}