#!/usr/bin/env tsx

/**
 * Test MV refresh endpoint to verify cron job is working
 */

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.RAILWAY_PUBLIC_DOMAIN || 'https://liquilab-staging-staging.up.railway.app';

async function main() {
  console.log('🔍 Testing MV refresh endpoint...\n');
  console.log(`URL: ${APP_URL}/api/enrich/refresh-views`);
  console.log(`CRON_SECRET: ${CRON_SECRET ? '✅ Set' : '❌ Missing'}\n`);

  if (!CRON_SECRET) {
    console.error('❌ CRON_SECRET environment variable is not set!');
    console.log('\nSet it in Railway:');
    console.log('  1. Go to Railway Dashboard → Liquilab-staging service');
    console.log('  2. Variables → + New Variable');
    console.log('  3. Name: CRON_SECRET');
    console.log('  4. Value: (generate with: openssl rand -hex 32)');
    process.exit(1);
  }

  try {
    const response = await fetch(`${APP_URL}/api/enrich/refresh-views`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ MV refresh endpoint is working!\n');
      console.log('Response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('\n✅ All materialized views refreshed successfully');
      } else {
        console.log('\n⚠️  Some views failed to refresh:');
        for (const [name, result] of Object.entries(data.results || {})) {
          const r = result as { success: boolean; error?: string };
          if (!r.success) {
            console.log(`   - ${name}: ${r.error}`);
          }
        }
      }
    } else {
      console.error(`❌ Endpoint returned error: ${response.status}`);
      console.error('Response:', data);
      
      if (response.status === 401) {
        console.log('\n⚠️  Authentication failed. Check:');
        console.log('  1. CRON_SECRET is set in both Cron Job service AND Liquilab-staging service');
        console.log('  2. Both services have the same CRON_SECRET value');
      }
    }
  } catch (error) {
    console.error('❌ Error calling endpoint:', error);
    if (error instanceof Error && error.message.includes('fetch')) {
      console.log('\n⚠️  Network error. Check:');
      console.log('  1. APP_URL is correct');
      console.log('  2. Railway service is running');
      console.log('  3. Public domain is accessible');
    }
  }
}

main();

