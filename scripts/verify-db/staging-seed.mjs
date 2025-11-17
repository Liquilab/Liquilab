#!/usr/bin/env node

import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[verify-db] ERROR: DATABASE_URL not set');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

const MIN_COUNTS = {
  'PoolEvent': 100,
  'PositionEvent': 50,
  'PositionTransfer': 50,
  'analytics_market_metrics_daily': 10,
};

// Optional tables - failure won't cause script to exit with error
const OPTIONAL_TABLES = ['analytics_market_metrics_daily'];

async function verifyStagingSeed() {
  try {
    await client.connect();
    console.log('[verify-db] Connected to database');

    const checks = [];
    for (const [table, minCount] of Object.entries(MIN_COUNTS)) {
      try {
        // Use quoted identifiers for PascalCase table names
        const quotedTable = table.match(/^[A-Z]/) ? `"${table}"` : table;
        const result = await client.query(`SELECT COUNT(*) as count FROM ${quotedTable}`);
        const count = parseInt(result.rows[0].count, 10);
        const passed = count >= minCount;
        checks.push({ table, count, minCount, passed });
        console.log(
          `[verify-db] ${table}: ${count} rows (min: ${minCount}) ${passed ? '✅' : '❌'}`,
        );
      } catch (err) {
        console.error(`[verify-db] Failed to check ${table}:`, err.message);
        checks.push({ table, count: 0, minCount, passed: false, error: err.message });
      }
    }

    const requiredChecks = checks.filter((c) => !OPTIONAL_TABLES.includes(c.table));
    const optionalChecks = checks.filter((c) => OPTIONAL_TABLES.includes(c.table));
    const allRequiredPassed = requiredChecks.every((c) => c.passed);
    
    if (!allRequiredPassed) {
      console.error('[verify-db] ❌ Staging seed validation failed');
      console.error('[verify-db] Failed required checks:', requiredChecks.filter((c) => !c.passed));
      if (optionalChecks.some((c) => !c.passed)) {
        console.warn('[verify-db] ⚠️  Optional checks failed (non-blocking):', optionalChecks.filter((c) => !c.passed).map((c) => `${c.table} (${c.count} rows)`));
      }
      process.exit(1);
    }
    
    if (optionalChecks.some((c) => !c.passed)) {
      console.warn('[verify-db] ⚠️  Optional checks failed (non-blocking):', optionalChecks.filter((c) => !c.passed).map((c) => `${c.table} (${c.count} rows)`));
    }

    console.log('[verify-db] ✅ All staging seed checks passed');
  } catch (error) {
    console.error('[verify-db] ERROR:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyStagingSeed().catch((error) => {
  console.error('[verify-db] Fatal error:', error);
  process.exit(1);
});

