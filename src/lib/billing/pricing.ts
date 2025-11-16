import pricingConfig from '@/config/pricing';

export type PriceInput = {
  slots: number;
  alertsSelected: boolean;
};

type PlanKey = keyof typeof pricingConfig.plans;

function resolvePlan(key: PlanKey = 'PREMIUM') {
  const plan = pricingConfig.plans[key];
  if (!plan) {
    throw new Error(`Missing pricing config for plan ${key}`);
  }
  return plan;
}

const premiumPlan = resolvePlan('PREMIUM');

export const BASE5_USD = premiumPlan.price;
export const EXTRA_BUNDLE5_USD = premiumPlan.extraBundle5;
export const ALERTS_PACK5_USD = premiumPlan.alertsPack5;
export const UI_PACK_COPY = premiumPlan.uiPackCopy;

export type PriceBreakdownResult = {
  base5: number;
  extras: number;
  alerts: number;
  alertsPacks: number;
  total: number;
};

export function priceBreakdown({ slots, alertsSelected }: PriceInput): PriceBreakdownResult {
  const normalizedSlots = Math.max(5, Math.ceil(slots / 5) * 5);
  const base5 = +BASE5_USD.toFixed(2);
  const extraBundles = Math.max(0, Math.ceil((normalizedSlots - 5) / 5));
  const extras = +(extraBundles * EXTRA_BUNDLE5_USD).toFixed(2);
  const alertsPacks = alertsSelected ? Math.ceil(normalizedSlots / 5) : 0;
  const alerts = +(alertsPacks * ALERTS_PACK5_USD).toFixed(2);
  const total = +(base5 + extras + alerts).toFixed(2);

  return { base5, extras, alerts, alertsPacks, total };
}

