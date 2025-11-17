import pricing from '@/config/pricing.json';

export type PricingVisitor = {
  label: string;
  priceMonthlyUsd: number;
  includedPools: number;
};

export type PricingPlan = {
  label: string;
  priceMonthlyUsd: number;
  includedPools: number;
  extraBundlePriceUsd: number;
  extraBundlePools: number;
  trialDays: number;
};

export type PricingAlerts = {
  label: string;
  priceMonthlyUsdPerBundle: number;
  bundlePools: number;
};

export type PricingConfig = {
  visitor: PricingVisitor;
  premium: PricingPlan;
  pro: PricingPlan;
  rangebandAlerts: PricingAlerts;
};

export const pricingConfig = pricing as PricingConfig;

export function getPricingConfig(): PricingConfig {
  return pricingConfig;
}

export function getPlanDefinition(plan: 'visitor' | 'premium' | 'pro'): PricingVisitor | PricingPlan {
  return pricingConfig[plan];
}

export function formatUSD(amount: number): string {
  if (!Number.isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calcPoolsCost(paidPools: number, plan: 'premium' | 'pro' = 'premium'): number {
  if (paidPools <= 0) return 0;
  const planDef = pricingConfig[plan];
  const baseCost = planDef.priceMonthlyUsd;
  if (paidPools <= planDef.includedPools) return Number(baseCost.toFixed(2));
  const extraPools = paidPools - planDef.includedPools;
  const bundles = Math.ceil(extraPools / planDef.extraBundlePools);
  const extraCost = bundles * planDef.extraBundlePriceUsd;
  return Number((baseCost + extraCost).toFixed(2));
}

export function calcAlertsCost(paidPools: number, enabled: boolean): number {
  if (!enabled || paidPools <= 0) return 0;
  const alerts = pricingConfig.rangebandAlerts;
  const bundles = Math.ceil(paidPools / alerts.bundlePools);
  return Number((bundles * alerts.priceMonthlyUsdPerBundle).toFixed(2));
}

export function calcTotalCost(
  paidPools: number,
  alertsEnabled: boolean,
  plan: 'premium' | 'pro' = 'premium',
): number {
  const pools = calcPoolsCost(paidPools, plan);
  const alerts = calcAlertsCost(paidPools, alertsEnabled);
  return Number((pools + alerts).toFixed(2));
}
