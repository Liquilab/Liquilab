'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { WaveBackground } from '@/components/WaveBackground';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { GlobalCtaButton } from '@/components/GlobalCtaButton';
import { Check, Minus, Info, Gauge, ArrowRight, Sparkles } from 'lucide-react';
import { pricingConfig } from '@/lib/billing/pricing';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SparklesIcon = Sparkles;

// Safe accessors for pricing config
const getPremium = () => pricingConfig?.premium ?? { priceMonthlyUsd: 14.95, includedPools: 5, extraBundlePriceUsd: 9.95, extraBundlePools: 5 };
const getPro = () => pricingConfig?.pro ?? { priceMonthlyUsd: 24.95, includedPools: 5, extraBundlePriceUsd: 14.95, extraBundlePools: 5 };
const getAlerts = () => pricingConfig?.rangebandAlerts ?? { priceMonthlyUsdPerBundle: 2.49, bundlePools: 5 };

// Comparison Table Component
function ComparisonTable() {
  const premiumPlan = getPremium();
  const proPlan = getPro();
  const rangebandAlerts = getAlerts();

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
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 sm:gap-6 px-4 sm:px-8 py-4 border-b border-white/[0.03] last:border-0 items-center">
      <div className="flex items-center gap-2 font-ui text-white/95 text-sm sm:text-base">
        {feature}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-white/40 hover:text-white/70 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-[#0F1A36]/95 border-white/10 text-white">
                <p className="font-ui text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center justify-center font-ui text-white/70 text-sm text-center">
        {premium}
      </div>
      <div className="flex items-center justify-center font-ui text-white/70 text-sm text-center">
        {pro}
      </div>
      <div className="flex items-center justify-center font-ui text-white/70 text-sm text-center">
        {enterprise}
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 sm:px-8 py-4 sm:py-6 bg-[#0B1530]/50 mt-4 first:mt-0">
      <h3 className="font-ui text-white/95 font-semibold">{title}</h3>
    </div>
  );

  const CheckIcon = () => <Check className="w-5 h-5 text-[#1BE8D2]" />;
  const DashIcon = () => <Minus className="w-5 h-5 text-white/20" />;

  return (
    <div className="mb-20">
      {/* Table Header */}
      <div className="text-center mb-12">
        <h2 className="font-brand text-white/95 mb-4 text-3xl">Compare plans</h2>
        <p className="font-ui text-white/[0.58] max-w-3xl mx-auto">
          Detailed feature comparison across all Liquilab plans. Choose the right level of analytics, 
          RangeBand™ insights, and support for your liquidity management needs.
        </p>
      </div>

      <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg overflow-hidden overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Column Headers */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-6 px-8 py-6 border-b border-white/10 sticky top-0 bg-[#0F1A36]/95 z-10">
            <div className="font-ui text-white/40">Features</div>
            <div className="font-ui text-white/95 text-center font-semibold">Premium</div>
            <div className="font-ui text-white/95 text-center font-semibold">Pro</div>
            <div className="font-ui text-white/95 text-center font-semibold">Enterprise</div>
          </div>

          {/* Section 1: Core Liquilab access */}
          <SectionHeader title="Core Liquilab access" />
          <FeatureRow
            feature="Wallet dashboard & Pools overview"
            premium={<CheckIcon />}
            pro={<CheckIcon />}
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
            premium={<CheckIcon />}
            pro={<CheckIcon />}
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
            feature="Wallet cockpit with header stats"
            premium={<CheckIcon />}
            pro={<CheckIcon />}
            enterprise={<CheckIcon />}
            tooltip="Dashboard view of your wallet's key metrics at a glance"
          />
          <FeatureRow
            feature="My Positions table with claim signals"
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
            feature="Pro Positions columns"
            premium={<DashIcon />}
            pro={<CheckIcon />}
            enterprise={<CheckIcon />}
            tooltip="Advanced metrics showing position efficiency and peer comparison rankings"
          />
          <FeatureRow
            feature="Portfolio Analytics"
            premium={<DashIcon />}
            pro={<CheckIcon />}
            enterprise={<CheckIcon />}
            tooltip="Portfolio-level insights: asset allocation, efficiency tracking, missed fees, LP behavior profiling"
          />

          {/* Section 3: RangeBand™ & Risk */}
          <SectionHeader title="RangeBand™ & Risk" />
          <FeatureRow
            feature="RangeBand™ status per position"
            premium={<CheckIcon />}
            pro={<CheckIcon />}
            enterprise={<CheckIcon />}
            tooltip="Live monitoring of whether your position is actively earning fees"
          />
          <FeatureRow
            feature="RangeBand™ strategy insights"
            premium="Basic labels"
            pro="Full metrics (Pro)"
            enterprise="Full + custom"
            tooltip="Detailed breakdown of strategy performance: days in range, efficiency %, out-of-range events"
          />
          <FeatureRow
            feature="Risk indicators"
            premium={<CheckIcon />}
            pro={<CheckIcon />}
            enterprise={<CheckIcon />}
          />
          <FeatureRow
            feature="Risk & Range Insights card"
            premium={<DashIcon />}
            pro={<CheckIcon />}
            enterprise={<CheckIcon />}
            tooltip="Pro-only: Detailed risk assessment with downside/upside sensitivity and contextual recommendations"
          />
          <FeatureRow
            feature="Days tracking in chart"
            premium={<CheckIcon />}
            pro={<CheckIcon />}
            enterprise={<CheckIcon />}
            tooltip="See how many days your position was in range vs out of range, shown directly in price chart legend"
          />

          {/* Section 4: Alerts & Reports */}
          <SectionHeader title="Alerts & Reports" />
          <FeatureRow
            feature="RangeBand™ alerts"
            premium={`+$${rangebandAlerts.priceMonthlyUsdPerBundle}/5 pools`}
            pro="Included"
            enterprise="Included + custom"
            tooltip="Real-time notifications when positions move out of range or fees are ready to claim"
          />
          <FeatureRow
            feature="Weekly reports"
            premium="Summary email"
            pro={
              <div className="flex flex-col items-center gap-1">
                <span>Full exports</span>
                <Badge variant="outline" className="bg-white/5 border-white/20 text-white/40 text-[10px] sm:text-xs">
                  Post-MVP
                </Badge>
              </div>
            }
            enterprise="Bespoke reporting"
            tooltip="Automated performance reports delivered to your inbox"
          />

          {/* Section 6: Billing & usage */}
          <SectionHeader title="Billing & usage" />
          <FeatureRow
            feature="Included pools"
            premium={`${premiumPlan.includedPools} pools + bundles`}
            pro={`${proPlan.includedPools} pools + bundles`}
            enterprise="Custom limits"
          />
          <FeatureRow
            feature="Additional pool bundles"
            premium={`+$${premiumPlan.extraBundlePriceUsd} per ${premiumPlan.extraBundlePools} pools`}
            pro={`+$${proPlan.extraBundlePriceUsd} per ${proPlan.extraBundlePools} pools`}
            enterprise="Custom pricing"
            tooltip="Expand your monitoring capacity by adding bundles of 5 pools"
          />
          <FeatureRow
            feature="RangeBand™ Alerts pricing"
            premium={`+$${rangebandAlerts.priceMonthlyUsdPerBundle}/month per ${rangebandAlerts.bundlePools} pools`}
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
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const premiumPlan = getPremium();
  const proPlan = getPro();
  const rangebandAlerts = getAlerts();

  const plans = [
    {
      name: "Premium",
      price: `$${premiumPlan.priceMonthlyUsd}`,
      eurPrice: "€14.50",
      period: "per month",
      description: "Perfect for active liquidity providers",
      pools: `${premiumPlan.includedPools} pools + bundles`,
      features: [
        `${premiumPlan.includedPools} pools included`,
        `+$${premiumPlan.extraBundlePriceUsd} per ${premiumPlan.extraBundlePools} pools`,
        "Wallet cockpit with stats",
        "My Positions with claim signals",
        "RangeBand™ status monitoring",
        "Token breakdown details",
        "Email support",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: `$${proPlan.priceMonthlyUsd}`,
      eurPrice: "€24.20",
      period: "per month",
      description: "For professional traders and portfolio managers",
      pools: `${proPlan.includedPools} pools + bundles`,
      features: [
        `${proPlan.includedPools} pools included`,
        `+$${proPlan.extraBundlePriceUsd} per ${proPlan.extraBundlePools} pools`,
        "6-tile Pro Analytics strip",
        "Risk & Range Insights",
        "Portfolio Analytics (concentration, fees)",
        "Peer benchmarking & rankings",
        "RangeBand™ alerts included",
        "Priority support",
      ],
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
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen relative text-white bg-[#0B1530]">
      <Head>
        <title>Pricing · Liquilab</title>
        <meta name="description" content="Choose your plan. Start with a 14-day free trial." />
      </Head>
      <WaveBackground />
      <Navigation />
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-brand text-white mb-6">
            Choose your plan
          </h1>
          <p className="text-xl font-ui text-white/60 max-w-2xl mx-auto">
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
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white hover:bg-[#3B82F6] border-0">
                  Most value
                </Badge>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-brand text-white mb-3 flex items-center gap-2">
                  {plan.name}
                  {plan.name === "Pro" && <SparklesIcon size={20} className="text-white" />}
                </h3>
                <p className="text-white/50 font-ui">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl text-white font-mono numeric">{plan.price}</span>
                  <span className="text-white/40 font-ui">/ {plan.period}</span>
                </div>
                {plan.eurPrice && (
                  <p className="font-ui text-white/40 mt-2 text-[11px]">
                    Charged in EUR, shown in USD for reference
                  </p>
                )}
                {!plan.eurPrice && plan.name === "Enterprise" && (
                  <p className="font-ui text-white/40 mt-2 text-[11px]">
                    Flexible billing terms available
                  </p>
                )}
              </div>

              <div className="mb-8 p-4 bg-[#0B1530]/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-ui text-white/40">Pool capacity</span>
                  <span className="font-ui text-white/95">{plan.pools}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="size-5 text-[#1BE8D2] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60 font-ui text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === "Enterprise" ? (
                <Button
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-ui"
                  as="a"
                  href="mailto:sales@liquilab.io"
                >
                  Contact sales
                </Button>
              ) : (
                <GlobalCtaButton className="mt-4 w-full" />
              )}
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <ComparisonTable />

        {/* Add-ons */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 sm:p-8 mt-20">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Gauge className="size-6 text-[#3B82F6]" />
            </div>
            <div className="flex-1">
              <h3 className="font-brand text-white/95 mb-2 text-lg">
                RangeBand™ Alerts Add-on
              </h3>
              <p className="font-ui text-white/70 mb-4 text-sm sm:text-base">
                Get instant notifications when your positions move near or out of range. 
                Stay proactive with real-time alerts for better liquidity management. 
                Available as add-on for Premium plans (included in Pro).
              </p>
              <div>
                <div className="flex flex-wrap items-center gap-4 mb-1">
                  <span className="font-ui text-white/95 text-2xl font-mono numeric">
                    ${rangebandAlerts.priceMonthlyUsdPerBundle}
                  </span>
                  <span className="font-ui text-white/40">per 5 pools</span>
                  <Button variant="ghost" className="h-8 px-3 text-xs border-[#1BE8D2] text-[#1BE8D2] hover:bg-[#1BE8D2]/10 font-ui">
                    Add to plan
                  </Button>
                </div>
                <p className="font-ui text-white/40 text-[11px]">
                  Charged in EUR, shown in USD for reference
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Links */}
        <div className="mt-16 mb-16">
          <div className="flex items-center justify-center gap-3">
            <Link href="/faq" legacyBehavior passHref>
              <Button as="a" href="/faq" variant="ghost" className="text-white/70 hover:text-[#3B82F6] font-ui flex items-center gap-2">
                View FAQ
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
