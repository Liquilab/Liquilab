'use client';

import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import {
  ANNUAL_MULTIPLIER,
  FREE_POOLS,
} from '@/data/subscriptionPlans';

import { pricingConfig, calcPoolsCost, formatUSD } from '@/lib/billing/pricing';

interface PricingPanelProps {
  highlight?: never;
  detectedPools?: number | null;
}

const COPY = {
  title: `Bundle-based pricing: $${pricingConfig.premium.priceMonthlyUsd}/month for 5 pools`,
  body: `Start with ${pricingConfig.premium.includedPools} pools included. Add bundles of ${pricingConfig.premium.extraBundlePools} pools for $${pricingConfig.premium.extraBundlePriceUsd}/month each. Prefer annual? Pay 10 months.`,
  startFreeCta: 'Start free',
} as const;

// Use formatUSD from billing/pricing for consistency

const clampCapacity = (value: number | null | undefined): number => {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return FREE_POOLS;
  }
  return Math.max(FREE_POOLS, Math.floor(value));
};

export function PricingPanel({ detectedPools = null }: PricingPanelProps) {
  const totalCapacity = clampCapacity(detectedPools);
  const paidPools = Math.max(0, totalCapacity - FREE_POOLS);
  const monthlyAmount = calcPoolsCost(paidPools, 'premium');
  const annualAmount = Number((monthlyAmount * ANNUAL_MULTIPLIER).toFixed(2));

  const checkoutParams = new URLSearchParams({
    desiredCapacity: String(totalCapacity),
  }).toString();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-[rgba(10,15,26,0.82)] p-8 backdrop-blur-xl md:p-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(110,168,255,0.07),transparent_60%)]" />
      <div className="relative z-10 flex flex-col gap-8">
        <header className="space-y-3">
          <h2 className="font-brand text-3xl font-semibold leading-tight text-white md:text-4xl">
            {COPY.title}
          </h2>
          <p className="font-ui text-sm leading-relaxed text-white/70 md:text-base">
            {COPY.body}
          </p>
        </header>

        {detectedPools != null ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70 backdrop-blur">
            <span className="font-semibold text-white/80">
              Detected:{' '}
              <span className="tnum text-white">{totalCapacity}</span> · Free:{' '}
              <span className="tnum text-white">{FREE_POOLS}</span> · Paid:{' '}
              <span className="tnum text-white">{paidPools}</span>
            </span>
            <span className="text-xs text-white/50">
              Monthly: {formatUSD(monthlyAmount)} · Annual:{' '}
              {formatUSD(annualAmount)}
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70 backdrop-blur">
            Connect your wallet to see how many pools we can follow for you.
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            as="a"
            href="/connect"
            aria-label="Start with your free pool on LiquiLab"
          >
            {COPY.startFreeCta}
          </Button>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Button
              as="a"
              href={`/checkout?${checkoutParams}`}
              variant="ghost"
              disabled={paidPools === 0}
              aria-label={
                paidPools === 0
                  ? 'No paid pools detected yet'
                  : `Activate ${paidPools} paid pool${
                      paidPools === 1 ? '' : 's'
                    } for ${formatUSD(monthlyAmount)}/month`
              }
              className="tnum"
            >
              Activate {paidPools}{' '}
              {paidPools === 1 ? 'pool' : 'pools'} for {formatUSD(monthlyAmount)}
              /month
            </Button>
            <Link
              href={`/checkout?${checkoutParams}&billingCycle=year`}
              className="tnum text-xs font-semibold text-white/60 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              aria-label={`Pay annually for ${paidPools} paid pool${
                paidPools === 1 ? '' : 's'
              } at ${formatUSD(annualAmount)}/year`}
            >
              Pay annually ({formatUSD(annualAmount)}/year)
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

