export const BASE_PLAN_PRICE_EUR = 14.95;
export const EXTRA_BUNDLE5_PRICE_EUR = 9.95;
export const BASE_PLAN_POOLS = 5;

const BASE_PLAN_EUR = BASE_PLAN_PRICE_EUR;
const EXTRA_BUNDLE5_EUR = EXTRA_BUNDLE5_PRICE_EUR;
const NOTIF_PER_5_EUR = 2.5;
export const BUNDLE_SIZE = 5;
const STEP = BUNDLE_SIZE;
const INCLUDED_POOLS = BASE_PLAN_POOLS;

export function formatEUR(amount: number): string {
  if (!Number.isFinite(amount)) return '€0.00';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calcPoolsCost(paidPools: number): number {
  const normalizedPools = Math.max(INCLUDED_POOLS, Math.ceil(paidPools / STEP) * STEP);
  const extraBundles = Math.max(0, (normalizedPools - INCLUDED_POOLS) / STEP);
  const total = BASE_PLAN_EUR + extraBundles * EXTRA_BUNDLE5_EUR;
  return Number(total.toFixed(2));
}

export function calcNotifCost(paidPools: number, enabled: boolean): number {
  if (!enabled || paidPools === 0) return 0;
  const sets = Math.ceil(paidPools / STEP);
  return Number((sets * NOTIF_PER_5_EUR).toFixed(2));
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



