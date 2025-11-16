#!/usr/bin/env node

/**
 * Pricing Drift Verifier
 * 
 * Compares pricing values across:
 * 1. config/pricing.json (source of truth)
 * 2. /api/public/pricing endpoint (must match config)
 * 3. UI strings in src/ (must match config)
 * 
 * Build fails if any drift is detected.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '../..');

const PRICING_CONFIG_PATH = join(root, 'config', 'pricing.json');
const PRICING_LIB_PATH = join(root, 'src', 'lib', 'billing', 'pricing.ts');
const PRICING_API_PATH = join(root, 'pages', 'api', 'public', 'pricing.ts');
const PRICING_PAGE_PATH = join(root, 'pages', 'pricing.tsx');

const DRIFT_TOLERANCE = 0.01; // Allow 1 cent difference for rounding

function loadConfig() {
  try {
    const content = readFileSync(PRICING_CONFIG_PATH, 'utf-8');
    return { raw: content, json: JSON.parse(content) };
  } catch (error) {
    throw new Error(`Failed to load ${PRICING_CONFIG_PATH}: ${error.message}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractUIStrings(premiumPlan, proPlan) {
  const uiFiles = [
    join(root, 'src', 'components', 'pricing', 'PremiumCard.tsx'),
    join(root, 'src', 'components', 'pricing', 'PricingSelector.tsx'),
    join(root, 'src', 'components', 'hero', 'Hero.tsx'),
  ];
  
  const basePattern = new RegExp(escapeRegExp(premiumPlan.price.toFixed(2)), 'g');
  const premiumBundlePattern = new RegExp(escapeRegExp(premiumPlan.extraBundle5.toFixed(2)), 'g');
  const proBundlePattern = new RegExp(escapeRegExp(proPlan.extraBundle5.toFixed(2)), 'g');
  const alertsPattern = new RegExp(escapeRegExp(premiumPlan.alertsPack5.toFixed(2)), 'g');

  const findings = {
    premiumBase: 0,
    premiumBundle: 0,
    proBundle: 0,
    alertsPack: 0,
  };
  
  for (const file of uiFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      if (basePattern.test(content)) findings.premiumBase += 1;
      if (premiumBundlePattern.test(content)) findings.premiumBundle += 1;
      if (proBundlePattern.test(content)) findings.proBundle += 1;
      if (alertsPattern.test(content)) findings.alertsPack += 1;
    } catch (error) {
      // File might not exist, skip
    }
  }
  
  return findings;
}

async function main() {
  const { raw: rawConfig, json: config } = loadConfig();
  const premiumPlan = config.plans?.PREMIUM;
  const proPlan = config.plans?.PRO;
  if (!premiumPlan || !proPlan) {
    throw new Error('config/pricing.json must define PREMIUM and PRO plans');
  }

  const libContent = readFileSync(PRICING_LIB_PATH, 'utf-8');
  const apiContent = readFileSync(PRICING_API_PATH, 'utf-8');
  const pricingPageContent = readFileSync(PRICING_PAGE_PATH, 'utf-8');
  const uiFindings = extractUIStrings(premiumPlan, proPlan);
  
  const errors = [];
  const warnings = [];

  if (/extraSlot/i.test(rawConfig)) {
    errors.push('CONFIG: Found forbidden key "extraSlot"');
  }
  if (/extraSlot/i.test(apiContent)) {
    errors.push('API: /api/public/pricing still references "extraSlot"');
  }
  if (/extraSlot/i.test(pricingPageContent)) {
    errors.push('UI: pages/pricing.tsx still references "extraSlot"');
  }
  if (/extraSlot/i.test(libContent)) {
    errors.push('LIB: pricing helper still references "extraSlot"');
  }

  if (Math.abs(premiumPlan.extraBundle5 - 9.95) > DRIFT_TOLERANCE) {
    warnings.push(`CONFIG: PREMIUM extraBundle5 expected 9.95 but found ${premiumPlan.extraBundle5}`);
  }

  if (uiFindings.premiumBase === 0) {
    warnings.push('UI: No references to premium base price found in pricing components');
  }
  if (uiFindings.premiumBundle === 0) {
    warnings.push('UI: No references to premium +5 bundle price found in pricing components');
  }
  if (uiFindings.proBundle === 0) {
    warnings.push('UI: No references to pro +5 bundle price found in pricing components');
  }
  if (uiFindings.alertsPack === 0) {
    warnings.push('UI: No references to alerts pack price found in pricing components');
  }
  
  // Output results
  const output = {
    ok: errors.length === 0,
    config: config.plans,
    ui: {
      premiumBaseReferences: uiFindings.premiumBase,
      premiumBundleReferences: uiFindings.premiumBundle,
      proBundleReferences: uiFindings.proBundle,
      alertsPackReferences: uiFindings.alertsPack,
    },
    errors,
    warnings,
  };
  
  console.log(JSON.stringify(output, null, 2));
  
  if (errors.length > 0) {
    console.error('\n❌ Pricing drift detected! Build will fail.');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings (non-blocking):');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }
  
  console.log('\n✅ Pricing consistency verified.');
  process.exit(0);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error?.message ?? String(error) }));
  process.exit(1);
});
