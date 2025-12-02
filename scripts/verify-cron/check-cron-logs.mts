#!/usr/bin/env tsx

/**
 * Check Railway cron job execution logs
 * Provides instructions for checking cron job status
 */

console.log('🔍 Railway Cron Job Verification\n');
console.log('================================\n');

console.log('📋 Stappen om cron job te verifiëren:\n');

console.log('1. Ga naar Railway Dashboard:');
console.log('   https://railway.app/dashboard\n');

console.log('2. Selecteer je LiquiLab project\n');

console.log('3. Klik op de Cron Job service (bijv. "MV Refresh")\n');

console.log('4. Check de volgende tabs:\n');
console.log('   📊 Logs:');
console.log('      - Kijk naar recente executions');
console.log('      - Check of er errors zijn');
console.log('      - Verifieer dat curl commando wordt uitgevoerd\n');

console.log('   ⚙️  Settings:');
console.log('      - Schedule: `*/10 * * * *` (elke 10 minuten)');
console.log('      - Command: curl commando met Authorization header');
console.log('      - Service: Gelinkt aan Liquilab-staging\n');

console.log('   🔐 Variables:');
console.log('      - CRON_SECRET: Moet ingesteld zijn\n');

console.log('5. Check Web Service Logs:\n');
console.log('   - Ga naar Liquilab-staging service');
console.log('   - Klik op "Logs" tab');
console.log('   - Zoek naar "[refresh-views]" entries');
console.log('   - Deze zouden elke 10 minuten moeten verschijnen\n');

console.log('6. Test handmatig:\n');
console.log('   Op Railway, voer uit:');
console.log('   railway run npm run test:cron:mv-refresh\n');

console.log('   Of test direct het endpoint:');
console.log('   railway run curl -X POST "https://liquilab-staging-staging.up.railway.app/api/enrich/refresh-views" \\');
console.log('     -H "Authorization: Bearer $CRON_SECRET"\n');

console.log('✅ Expected Output:\n');
console.log('   {');
console.log('     "success": true,');
console.log('     "duration": 12345,');
console.log('     "results": {');
console.log('       "poolLatestState": { "success": true, "duration": 1234 },');
console.log('       "poolFees24h": { "success": true, "duration": 567 },');
console.log('       ...');
console.log('     }');
console.log('   }\n');

console.log('❌ Als het faalt:\n');
console.log('   - Check CRON_SECRET in beide services (Cron Job + Liquilab-staging)');
console.log('   - Check dat de web service draait');
console.log('   - Check dat DATABASE_URL is ingesteld');
console.log('   - Check Railway public domain URL is correct\n');

