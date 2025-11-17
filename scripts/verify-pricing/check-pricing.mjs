#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const pricingPath = path.join(ROOT, 'config', 'pricing.json');
const expected = {
  premium: { priceMonthlyUsd: 14.95, includedPools: 5, extraBundlePriceUsd: 9.95, extraBundlePools: 5, trialDays: 14 },
  pro: { priceMonthlyUsd: 24.95, includedPools: 5, extraBundlePriceUsd: 14.95, extraBundlePools: 5, trialDays: 14 },
  rangebandAlerts: { priceMonthlyUsdPerBundle: 2.49, bundlePools: 5 },
};

function fail(msg) {
  console.error(`[verify:pricing] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(pricingPath)) fail('config/pricing.json missing');

const raw = fs.readFileSync(pricingPath, 'utf8');
let config;
try {
  config = JSON.parse(raw);
} catch {
  fail('config/pricing.json is not valid JSON');
}

const checkPlan = (planName, expectedPlan) => {
  const plan = config[planName];
  if (!plan) fail(`plan ${planName} missing`);
  for (const [key, val] of Object.entries(expectedPlan)) {
    if (plan[key] !== val) fail(`plan ${planName}.${key} expected ${val} but found ${plan[key]}`);
  }
};

checkPlan('premium', expected.premium);
checkPlan('pro', expected.pro);
for (const [key, val] of Object.entries(expected.rangebandAlerts)) {
  if (config.rangebandAlerts?.[key] !== val) fail(`rangebandAlerts.${key} expected ${val} but found ${config.rangebandAlerts?.[key]}`);
}

// Block ALL legacy pricing references - new bundle-based pricing only ($14.95/$24.95 for 5 pools + bundles)
// No exceptions - legacy "$1.99 per pool/month" must not appear anywhere
const bannedLiterals = ['$1.99', '€1.99', '1.99 per pool', '1.99/month', '1.99 per month'];
const whitelistDirs = new Set(['.git', 'node_modules', '.next', 'Finance', '_archive', 'docs', 'public', 'Documentatie', 'backups', 'brandguide', '1x']);
const whitelistExts = new Set(['.pdf', '.docx', '.csv', '.json.bak', '.ndjson', '.bak']);

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (whitelistDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const basename = entry.name.toLowerCase();
      if (whitelistExts.has(ext) || basename.endsWith('.bak')) continue;
      try {
        const content = fs.readFileSync(full, 'utf8');
        for (const lit of bannedLiterals) {
          if (content.includes(lit)) fail(`found legacy price literal "${lit}" in ${path.relative(ROOT, full)}`);
        }
      } catch {
        // Skip binary files that can't be read as UTF-8
        continue;
      }
    }
  }
}

scan(ROOT);
console.log('[verify:pricing] OK');
