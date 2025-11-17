#!/usr/bin/env node

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_SECRET_KEY || !NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error('[verify-billing] ERROR: Stripe keys not set');
  console.error('[verify-billing] Required: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  process.exit(1);
}

const isTestKey = STRIPE_SECRET_KEY.startsWith('sk_test_');
if (!isTestKey) {
  console.error('[verify-billing] ERROR: STRIPE_SECRET_KEY does not appear to be a TEST key (should start with sk_test_)');
  console.error('[verify-billing] This script only runs against Stripe TEST keys for safety');
  process.exit(1);
}

async function verifyStripeTest() {
  try {
    let stripe;
    try {
      stripe = (await import('stripe')).default;
    } catch (err) {
      console.error('[verify-billing] ERROR: stripe package not installed');
      console.error('[verify-billing] Install with: npm install stripe');
      process.exit(1);
    }
    const client = new stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });

    console.log('[verify-billing] Testing Stripe TEST connection...');

    const account = await client.account.retrieve();
    console.log('[verify-billing] ✅ Stripe account retrieved:', {
      id: account.id,
      email: account.email,
      country: account.country,
      type: account.type,
    });

    console.log('[verify-billing] ✅ Stripe TEST keys are valid');
    console.log('[verify-billing] Publishable key:', NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...');
  } catch (error) {
    console.error('[verify-billing] ERROR:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('[verify-billing] Stripe authentication failed - check STRIPE_SECRET_KEY');
    }
    process.exit(1);
  }
}

verifyStripeTest().catch((error) => {
  console.error('[verify-billing] Fatal error:', error);
  process.exit(1);
});

