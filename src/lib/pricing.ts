import { pricingConfig } from '@/lib/billing/pricing';

const STEP = 5;

export function formatEUR(amount: number): string {
  if (!Number.isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calcPoolsCost(paidPools: number): number {
  if (paidPools <= 0) return 0;
  const base = pricingConfig.premium;
  const baseCost = base.priceMonthlyUsd;
  if (paidPools <= base.includedPools) return Number(baseCost.toFixed(2));
  const extraPools = paidPools - base.includedPools;
  const bundles = Math.ceil(extraPools / base.extraBundlePools);
  const extraCost = bundles * base.extraBundlePriceUsd;
  return Number((baseCost + extraCost).toFixed(2));
}

export function calcNotifCost(paidPools: number, enabled: boolean): number {
  if (!enabled || paidPools === 0) return 0;
  const sets = Math.ceil(paidPools / STEP);
  const alerts = pricingConfig.rangebandAlerts;
  return Number((sets * alerts.priceMonthlyUsdPerBundle).toFixed(2));
}

export function calcTotal(paidPools: number, notificationsEnabled: boolean): number {
  const poolsCost = calcPoolsCost(paidPools);
  const notifCost = calcNotifCost(paidPools, notificationsEnabled);
  return Number((poolsCost + notifCost).toFixed(2));
}

export function nextTierFor(count: number): number {
  if (count <= 0) return STEP;
  return Math.ceil(count / STEP) * STEP;
}





