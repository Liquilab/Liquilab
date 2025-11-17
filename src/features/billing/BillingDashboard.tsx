'use client';

import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import {
  ANNUAL_MULTIPLIER,
  FREE_POOLS,
} from '@/data/subscriptionPlans';
import { calcPoolsCost, formatUSD } from '@/lib/billing/pricing';

interface BillingDashboardProps {
  walletId?: number;
  detectedPools?: number | null;
}

const clampCapacity = (value: number | null | undefined): number => {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return FREE_POOLS;
  }
  return Math.max(FREE_POOLS, Math.floor(value));
};

export function BillingDashboard({ walletId, detectedPools = null }: BillingDashboardProps) {
  const totalCapacity = clampCapacity(detectedPools);
  const paidPools = Math.max(0, totalCapacity - FREE_POOLS);
  const monthlyAmount = calcPoolsCost(paidPools, 'premium');
  const annualAmount = Number((monthlyAmount * ANNUAL_MULTIPLIER).toFixed(2));

  const checkoutParams = new URLSearchParams({
    desiredCapacity: String(totalCapacity),
  }).toString();

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-[rgba(10,15,26,0.82)] p-6 backdrop-blur-xl">
      <header className="space-y-2">
        <h2 className="font-brand text-2xl font-semibold text-white">
          Subscription preview
        </h2>
        <p className="font-ui text-sm text-white/70">
          Bundle-based pricing: $14.95/month for 5 pools included. Add bundles of 5 pools for $9.95/month each. Annual billing: pay 10 months.
        </p>
        {walletId ? (
          <p className="font-ui text-xs uppercase tracking-[0.2em] text-white/40">
            Wallet ID: {walletId}
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80 backdrop-blur">
        <span>
          Capacity:{' '}
          <span className="tnum text-white">{totalCapacity}</span> pools
        </span>
        <span>
          Free:{' '}
          <span className="tnum text-white">{FREE_POOLS}</span> · Paid:{' '}
          <span className="tnum text-white">{paidPools}</span>
        </span>
        <span className="text-xs text-white/50">
          Monthly: {formatUSD(monthlyAmount)} · Annual:{' '}
          {formatUSD(annualAmount)}
        </span>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button
          as="a"
          href="/connect"
          aria-label="Connect your wallet to start with the free pool"
        >
          Start free
        </Button>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <Button
            as="a"
            href={`/checkout?${checkoutParams}`}
            variant="ghost"
            disabled={paidPools === 0}
            className="tnum"
            aria-label={
              paidPools === 0
                ? 'No paid pools detected yet'
                : `Activate ${paidPools} paid pool${
                    paidPools === 1 ? '' : 's'
                  } for ${formatUSD(monthlyAmount)}/month`
            }
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
    </section>
  );
}

