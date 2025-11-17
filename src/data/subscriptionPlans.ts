// Legacy constants - use pricingConfig from @/lib/billing/pricing instead
// These are kept for backward compatibility but should be migrated
import { pricingConfig } from '@/lib/billing/pricing';

export const FREE_POOLS = 1;
export const BUNDLE_SIZE = pricingConfig.premium.extraBundlePools; // 5
export const ALERTS_PRICE_PER_BUNDLE_USD = pricingConfig.rangebandAlerts.priceMonthlyUsdPerBundle; // 2.49
export const ANNUAL_MULTIPLIER = 10;

// DEPRECATED: Use calcPoolsCost from @/lib/billing/pricing instead
// This is kept for backward compatibility only
export const PRICE_PER_POOL_USD = pricingConfig.premium.priceMonthlyUsd / pricingConfig.premium.includedPools; // ~2.99, but use bundle pricing instead
