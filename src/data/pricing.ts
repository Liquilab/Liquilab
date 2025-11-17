// Single source of truth for LiquiLab pricing
// Uses bundle-based pricing from config/pricing.json

import { pricingConfig, calcPoolsCost, calcAlertsCost } from '@/lib/billing/pricing';

export const BUNDLE_SIZE = pricingConfig.premium.extraBundlePools as const; // 5

// DEPRECATED: Use calcPoolsCost from @/lib/billing/pricing instead
// This is kept for backward compatibility only
export const PRICE_PER_POOL_USD = pricingConfig.premium.priceMonthlyUsd / pricingConfig.premium.includedPools; // ~2.99, but use bundle pricing instead

export type BillingCycle = 'month' | 'year';

function normalizePaidCapacity(paidCapacity: number): number {
  if (!Number.isFinite(paidCapacity) || paidCapacity < 0) {
    return 0;
  }
  return Math.floor(paidCapacity);
}

export function freeBonus(paidCapacityInput: number): number {
  const paidCapacity = normalizePaidCapacity(paidCapacityInput);
  if (paidCapacity <= 0) {
    // First pool is always free
    return 1;
  }

  if (paidCapacity <= BUNDLE_SIZE) {
    // 5-pack receives a single bonus slot (covers the free starter pool)
    return 1;
  }

  // Additional free capacity is granted on each multiple of 10 paid pools
  return Math.floor(paidCapacity / 10);
}

export function includedCapacity(paidCapacityInput: number): number {
  const paidCapacity = normalizePaidCapacity(paidCapacityInput);
  const bonus = freeBonus(paidCapacity);
  const capacity = paidCapacity + bonus;
  return capacity > 0 ? capacity : 0;
}

export function bundlesForActivePools(activePoolsInput: number): number {
  const activePools = Math.max(0, Math.floor(activePoolsInput));
  let paid = 0;

  while (includedCapacity(paid) < activePools) {
    paid += BUNDLE_SIZE;
    if (paid > 5000) {
      // Prevent runaway loops in unexpected scenarios
      break;
    }
  }

  return paid / BUNDLE_SIZE;
}

export function monthlyAmountUsdForPaidCapacity(paidCapacityInput: number, plan: 'premium' | 'pro' = 'premium'): number {
  const paidCapacity = normalizePaidCapacity(paidCapacityInput);
  // Use bundle-based pricing calculation
  return calcPoolsCost(paidCapacity, plan);
}

export function yearlyAmountUsdForPaidCapacity(paidCapacityInput: number): number {
  // Yearly billing = pay 10 months
  const monthly = monthlyAmountUsdForPaidCapacity(paidCapacityInput);
  return Number((monthly * 10).toFixed(2));
}

export function quote(activePoolsInput: number, billing: BillingCycle = 'month') {
  const activePools = Math.max(0, Math.floor(activePoolsInput));
  const bundles = bundlesForActivePools(activePools);
  const paidPools = bundles * BUNDLE_SIZE;
  const bonus = freeBonus(paidPools);
  const totalCapacity = includedCapacity(paidPools);

  const monthlyAmount = monthlyAmountUsdForPaidCapacity(paidPools);
  const amountUsd = billing === 'year' ? yearlyAmountUsdForPaidCapacity(paidPools) : monthlyAmount;

  // Calculate using bundle-based pricing
  const monthlyAmountBundle = calcPoolsCost(paidPools, 'premium');
  const amountUsdBundle = billing === 'year' ? monthlyAmountBundle * ANNUAL_MULTIPLIER : monthlyAmountBundle;

  return {
    ok: true,
    pricing: {
      billingCycle: billing,
      pricePerPoolUsd: PRICE_PER_POOL_USD, // DEPRECATED - kept for compatibility
      bundles,
      paidPools,
      freeBonus: bonus,
      totalCapacity,
      amountUsd: amountUsdBundle, // Use bundle-based pricing
      monthlyEquivalentUsd: monthlyAmountBundle, // Use bundle-based pricing
    },
    suggestion: {
      activePools,
      recommendedBundles: bundles,
      recommendedPaidPools: paidPools,
      recommendedCapacity: totalCapacity,
    },
  };
}
