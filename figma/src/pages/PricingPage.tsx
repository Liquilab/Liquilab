import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Check, Minus, Info, Gauge, TrendingUp, Building2, ArrowRight } from "lucide-react";
import { WaveBackground } from "../components/WaveBackground";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import { RangeBandIcon } from "../components/RangeBandIcon";
import { SparklesIcon } from "../components/Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

// Comparison Table Component
function ComparisonTable() {
  const FeatureRow = ({ 
    feature, 
    premium, 
    pro, 
    enterprise,
    tooltip 
  }: { 
    feature: string; 
    premium: React.ReactNode; 
    pro: React.ReactNode; 
    enterprise: React.ReactNode;
    tooltip?: string;
  }) => (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-6 px-8 py-4 border-b border-white/[0.03] last:border-0">
      <div className="flex items-center gap-2 font-['Manrope',sans-serif] text-white/95">
        {feature}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-white/40 hover:text-white/70 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-[#0F1A36]/95 border-white/10">
                <p className="font-['Manrope',sans-serif] text-white/95">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center justify-center font-['Manrope',sans-serif] text-white/70 text-sm text-center">
        {premium}
      </div>
      <div className="flex items-center justify-center font-['Manrope',sans-serif] text-white/70 text-sm text-center">
        {pro}
      </div>
      <div className="flex items-center justify-center font-['Manrope',sans-serif] text-white/70 text-sm text-center">
        {enterprise}
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-8 py-6 bg-[#0B1530]/50 mt-4 first:mt-0">
      <h3 className="font-['Manrope',sans-serif] text-white/95">{title}</h3>
    </div>
  );

  const TrialBadge = () => (
    <div className="flex flex-col items-center gap-1">
      <CheckIcon />
      <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30 font-['Manrope',sans-serif] text-xs">
        14-day trial
      </Badge>
    </div>
  );

  const CheckIcon = () => <Check className="w-5 h-5 text-[#1BE8D2]" />;
  const DashIcon = () => <Minus className="w-5 h-5 text-white/20" />;

  return (
    <div className="mb-20">
      {/* Table Header */}
      <div className="text-center mb-12">
        <h2 className="font-['Manrope',sans-serif] text-white/95 mb-4">Compare plans</h2>
        <p className="font-['Manrope',sans-serif] text-white/[0.58] max-w-3xl mx-auto">
          Detailed feature comparison across all Liquilab plans. Choose the right level of analytics, 
          RangeBand™ insights, and support for your liquidity management needs.
        </p>
      </div>

      {/* Key Differences Strip */}
      <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#1BE8D2]/5 border border-[#3B82F6]/20 rounded-xl p-8 mb-12">
        <h3 className="font-['Manrope',sans-serif] text-white/95 mb-6 text-center">Key differences at a glance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Premium */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Gauge className="size-5 text-[#3B82F6]" />
            </div>
            <div>
              <h4 className="font-['Manrope',sans-serif] font-medium text-white/95 mb-1">Premium</h4>
              <p className="font-['Manrope',sans-serif] text-white/70" style={{ fontSize: '14px' }}>
                Wallet cockpit, My Positions tabel met claim signals, RangeBand™ status monitoring, activity tracking. Alerts available as add-on.
              </p>
            </div>
          </div>
          
          {/* Pro */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="size-5 text-[#1BE8D2]" />
            </div>
            <div>
              <h4 className="text-white/95 mb-1">Pro</h4>
              <p className="text-white/70">
                Everything in Premium plus 6-tile Pro Analytics, Risk & Range Insights, Portfolio Analytics (concentration, fee capture, peer benchmarking), extra position metrics. RangeBand™ Alerts included.
              </p>
            </div>
          </div>
          
          {/* Enterprise */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="size-5 text-[#F59E0B]" />
            </div>
            <div>
              <h4 className="text-white/95 mb-1">Enterprise</h4>
              <p className="text-white/70">
                Custom limits, API access, bespoke reporting, SLA-backed support.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg overflow-hidden">
        {/* Column Headers */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-6 px-8 py-6 border-b border-white/10 sticky top-0 bg-[#0F1A36]/95 z-10">
          <div className="font-['Manrope',sans-serif] text-white/40">Features</div>
          <div className="font-['Manrope',sans-serif] text-white/95 text-center">Premium</div>
          <div className="font-['Manrope',sans-serif] text-white/95 text-center">Pro</div>
          <div className="font-['Manrope',sans-serif] text-white/95 text-center">Enterprise</div>
        </div>

        {/* Section 1: Core Liquilab access */}
        <SectionHeader title="Core Liquilab access" />
        <FeatureRow
          feature="Wallet dashboard & Pools overview"
          premium={<TrialBadge />}
          pro={<TrialBadge />}
          enterprise={<CheckIcon />}
          tooltip="Access to your wallet's positions and pool analytics"
        />
        <FeatureRow
          feature="List & Grid views (PoolRow & PoolCard)"
          premium={<CheckIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
        />
        <FeatureRow
          feature="Pool detail pages (/pool/[id])"
          premium="Full details"
          pro="Full + peer analytics"
          enterprise="Custom access"
          tooltip="Detailed pool analytics including price charts, fee history, and position data"
        />

        {/* Section 2: Data & Analytics */}
        <SectionHeader title="Data & Analytics" />
        <FeatureRow
          feature="Real-time TVL, fees, incentives per pool"
          premium={<TrialBadge />}
          pro={<TrialBadge />}
          enterprise={<CheckIcon />}
        />
        <FeatureRow
          feature="Historical price & range charts (24H / 7D / 30D / 90D)"
          premium="Own positions"
          pro="Own + pool-level"
          enterprise={<CheckIcon />}
          tooltip="Time-series analysis of price movements and range performance"
        />
        <FeatureRow
          feature="Network summary (/summary) – pools, TVL, fees"
          premium={<CheckIcon />}
          pro="Extra metrics"
          enterprise="Custom KPIs"
        />
        <FeatureRow
          feature="Pool analytics (fees, volume, positions count)"
          premium="UI only"
          pro="UI + export-ready (Pro)"
          enterprise="Full (Enterprise)"
        />
        <FeatureRow
          feature="Wallet cockpit with header stats (Unclaimed Fees, Incentives)"
          premium={<CheckIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
          tooltip="Dashboard view of your wallet's key metrics at a glance"
        />
        <FeatureRow
          feature="My Positions table with claim signals (Optimal/Soon/None)"
          premium={<CheckIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
          tooltip="Smart indicators showing when it's optimal to claim fees from your positions"
        />
        <FeatureRow
          feature="Token breakdown under USD amounts"
          premium={<CheckIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
          tooltip="See exact token quantities (e.g., 125 WFLR · 48 FXRP) below dollar values"
        />
        <FeatureRow
          feature="Pro Analytics strip (6 time-driven metrics)"
          premium={<DashIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
          tooltip="Total Fees, Incentives, Earned, Realized APR, PnL, Range Efficiency – all time-period aware"
        />
        <FeatureRow
          feature="Pro Positions columns (Time in Range %, Fee Capture %, Peer Percentile)"
          premium={<DashIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
          tooltip="Advanced metrics showing position efficiency and peer comparison rankings"
        />
        <FeatureRow
          feature="Portfolio Analytics (concentration, fee capture, peer benchmarking)"
          premium={<DashIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
          tooltip="Portfolio-level insights: asset allocation, efficiency tracking, missed fees, LP behavior profiling"
        />

        {/* Section 3: RangeBand™ & Risk */}
        <SectionHeader title="RangeBand™ & Risk" />
        <FeatureRow
          feature="RangeBand™ status per position (in/near/out of range)"
          premium={<TrialBadge />}
          pro={<TrialBadge />}
          enterprise={<CheckIcon />}
          tooltip="Live monitoring of whether your position is actively earning fees"
        />
        <FeatureRow
          feature="RangeBand™ strategy insights (Aggressive/Balanced/Conservative)"
          premium="Basic labels"
          pro="Full metrics (Pro)"
          enterprise="Full + custom"
          tooltip="Detailed breakdown of strategy performance: days in range, efficiency %, out-of-range events"
        />
        <FeatureRow
          feature="Risk indicators (extreme APR warning, stale data badges)"
          premium={<CheckIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
        />
        <FeatureRow
          feature="Risk & Range Insights card (risk profile, sensitivity analysis)"
          premium={<DashIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
          tooltip="Pro-only: Detailed risk assessment with downside/upside sensitivity and contextual recommendations"
        />
        <FeatureRow
          feature="Days in Range / Out of range tracking (displayed in chart area)"
          premium={<CheckIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
          tooltip="See how many days your position was in range vs out of range, shown directly in price chart legend"
        />

        {/* Section 4: Alerts & Reports */}
        <SectionHeader title="Alerts & Reports" />
        <FeatureRow
          feature="RangeBand™ alerts (out_of_range, near_band, claim_ready)"
          premium="+$2.49/5 pools"
          pro="Included"
          enterprise="Included + custom"
          tooltip="Real-time notifications when positions move out of range or fees are ready to claim"
        />
        <FeatureRow
          feature="Weekly reports (CSV/PDF export – portfolio & pool performance)"
          premium="Summary email"
          pro={
            <div className="flex flex-col items-center gap-1">
              <span>Full exports</span>
              <Badge variant="outline" className="bg-white/5 border-white/20 text-white/40 text-xs">
                Post-MVP
              </Badge>
            </div>
          }
          enterprise="Bespoke reporting"
          tooltip="Automated performance reports delivered to your inbox"
        />
        <FeatureRow
          feature="Email preferences (alerts, reports, marketing)"
          premium={<CheckIcon />}
          pro={<CheckIcon />}
          enterprise="Org-wide controls"
        />

        {/* Section 5: Data access & API */}
        <SectionHeader title="Data access & API" />
        <FeatureRow
          feature="Web UI analytics (all dashboards)"
          premium={<CheckIcon />}
          pro={<CheckIcon />}
          enterprise={<CheckIcon />}
        />
        <FeatureRow
          feature="Analytics API (read-only endpoints for pools, positions, RangeBand™)"
          premium="Limited trial"
          pro={
            <div className="flex flex-col items-center gap-1">
              <span>Full access</span>
              <Badge variant="outline" className="bg-white/5 border-white/20 text-white/40 text-xs">
                Post-MVP
              </Badge>
            </div>
          }
          enterprise="Custom API plan"
          tooltip="Programmatic access to your analytics data for custom integrations"
        />
        <FeatureRow
          feature="Reports export API (/api/reports/export)"
          premium={<DashIcon />}
          pro={
            <div className="flex flex-col items-center gap-1">
              <span>Pro-only</span>
              <Badge variant="outline" className="bg-white/5 border-white/20 text-white/40 text-xs">
                Post-MVP
              </Badge>
            </div>
          }
          enterprise="Custom exports"
        />

        {/* Section 6: Billing & usage */}
        <SectionHeader title="Billing & usage" />
        <FeatureRow
          feature="Included pools"
          premium="5 pools + bundles"
          pro="5 pools + bundles"
          enterprise="Custom limits"
        />
        <FeatureRow
          feature="Additional pool bundles"
          premium="+$9.95 per 5 pools"
          pro="+$14.95 per 5 pools"
          enterprise="Custom pricing"
          tooltip="Expand your monitoring capacity by adding bundles of 5 pools"
        />
        <FeatureRow
          feature="Trial period"
          premium="14-day free trial"
          pro="14-day free trial"
          enterprise="Custom terms"
        />
        <FeatureRow
          feature="RangeBand™ Alerts pricing"
          premium="+$2.49/month per 5 pools"
          pro="Included"
          enterprise="Included"
        />

        {/* Section 7: Support */}
        <SectionHeader title="Support" />
        <FeatureRow
          feature="Email support"
          premium="Standard email"
          pro="Priority email"
          enterprise="Priority + dedicated"
        />
        <FeatureRow
          feature="Status & incident visibility (/status)"
          premium="Public status"
          pro="Extended details"
          enterprise="Private reporting"
          tooltip="Access to system status and incident updates"
        />
      </div>
    </div>
  );
}

export function PricingPage() {
  const plans = [
    {
      name: "Premium",
      price: "$14.95",
      eurPrice: "€14.50",
      period: "per month",
      description: "Perfect for active liquidity providers",
      pools: "5 pools + bundles",
      features: [
        "5 pools included",
        "+$9.95 per 5 pools",
        "Wallet cockpit with stats",
        "My Positions with claim signals",
        "RangeBand™ status monitoring",
        "Token breakdown details",
        "Email support",
      ],
      cta: "Start 14-day trial",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$24.95",
      eurPrice: "€24.20",
      period: "per month",
      description: "For professional traders and portfolio managers",
      pools: "5 pools + bundles",
      features: [
        "5 pools included",
        "+$14.95 per 5 pools",
        "6-tile Pro Analytics strip",
        "Risk & Range Insights",
        "Portfolio Analytics (concentration, fees)",
        "Peer benchmarking & rankings",
        "RangeBand™ alerts included",
        "Priority support",
      ],
      cta: "Start 14-day trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      eurPrice: null,
      period: "contact us",
      description: "For teams, desks, and custom integrations",
      pools: "Custom limits",
      features: [
        "Unlimited pools",
        "Custom API access",
        "Bespoke reporting",
        "Dedicated support",
        "White-label options",
        "SLA guarantee",
      ],
      cta: "Contact sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen relative">
      <WaveBackground />
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-heading text-white mb-6">
            Choose your plan
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Start with a 14-day free trial. All plans include non-custodial analytics and RangeBand™ monitoring.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 ${
                plan.highlighted
                  ? "bg-[#0F1A36]/95 border-[#3B82F6]"
                  : "bg-[#0F1A36]/95 border-white/5"
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white">
                  Most value
                </Badge>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-heading text-white mb-3 flex items-center gap-2">
                  {plan.name}
                  {plan.name === "Pro" && <SparklesIcon size={20} className="text-white" />}
                </h3>
                <p className="text-white/50">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl text-white numeric">{plan.price}</span>
                  <span className="text-white/40">/ {plan.period}</span>
                </div>
                {plan.eurPrice && (
                  <p className="font-['Manrope',sans-serif] text-white/40 mt-2" style={{ fontSize: '11px' }}>
                    Charged in EUR, shown in USD for reference
                  </p>
                )}
                {!plan.eurPrice && plan.name === "Enterprise" && (
                  <p className="font-['Manrope',sans-serif] text-white/40 mt-2" style={{ fontSize: '11px' }}>
                    Flexible billing terms available
                  </p>
                )}
              </div>

              <div className="mb-8 p-4 bg-[#0B1530]/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-['Manrope',sans-serif] text-white/40">Pool capacity</span>
                  <span className="font-['Manrope',sans-serif] text-white/95">{plan.pools}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="size-5 text-[#1BE8D2] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <ComparisonTable />

        {/* Add-ons */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mt-20">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <RangeBandIcon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-['Manrope',sans-serif] text-white/95 mb-2">
                RangeBand™ Alerts Add-on
              </h3>
              <p className="font-['Manrope',sans-serif] text-white/70 mb-4">
                Get instant notifications when your positions move near or out of range. 
                Stay proactive with real-time alerts for better liquidity management. 
                Available as add-on for Premium plans (included in Pro).
              </p>
              <div>
                <div className="flex items-center gap-4 mb-1">
                  <span className="font-['Manrope',sans-serif] text-white/95 numeric" style={{ fontSize: '24px' }}>
                    $2.49/month
                  </span>
                  <span className="font-['Manrope',sans-serif] text-white/40">per 5 pools</span>
                  <Button size="sm" variant="outline" className="border-[#1BE8D2] text-[#1BE8D2] hover:bg-[#1BE8D2]/10">
                    Add to plan
                  </Button>
                </div>
                <p className="font-['Manrope',sans-serif] text-white/40" style={{ fontSize: '11px' }}>
                  Charged in EUR, shown in USD for reference
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Links */}
        <div className="mt-16 mb-16">
          <div className="flex items-center justify-center gap-3">
            <Link to="/faq">
              <Button variant="link" className="text-white/70 hover:text-[#3B82F6] font-['Manrope',sans-serif] flex items-center gap-2">
                View FAQ
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}