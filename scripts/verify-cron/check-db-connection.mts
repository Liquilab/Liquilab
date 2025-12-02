#!/usr/bin/env tsx

/**
 * Check database connection for MV refresh endpoint
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database connection...\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('\n📝 Fix:');
    console.log('  1. Go to Railway Dashboard → Liquilab-staging service');
    console.log('  2. Variables → + Reference');
    console.log('  3. Select "Postgres" service');
    console.log('  4. This will link DATABASE_URL automatically\n');
    process.exit(1);
  }

  // Mask password in URL for display
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`📊 DATABASE_URL: ${maskedUrl}\n`);

  // Check if it's an internal Railway URL
  if (dbUrl.includes('.railway.internal')) {
    console.log('⚠️  WARNING: Using internal Railway URL (.railway.internal)');
    console.log('   This may not work reliably. Consider using public proxy URL (.rlwy.net or .railway.app)\n');
  }

  try {
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Test a simple query
    console.log('📊 Testing query...');
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "PositionTransfer"`;
    console.log(`✅ Query successful! PositionTransfer count: ${(result as any)[0]?.count || 'N/A'}\n`);

    // Check if MVs exist
    console.log('🔍 Checking Materialized Views...');
    const mvs = await prisma.$queryRaw<Array<{ matviewname: string }>>`
      SELECT matviewname 
      FROM pg_matviews 
      WHERE schemaname = 'public' 
        AND matviewname LIKE 'mv_%'
      ORDER BY matviewname
    `;

    if (mvs.length > 0) {
      console.log(`✅ Found ${mvs.length} materialized views:\n`);
      for (const mv of mvs) {
        console.log(`   - ${mv.matviewname}`);
      }
    } else {
      console.log('⚠️  No materialized views found');
      console.log('   Run migrations or create MVs first\n');
    }
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      console.log('\n📝 Fix:');
      console.log('  1. Check DATABASE_URL in Railway → Liquilab-staging → Variables');
      console.log('  2. Ensure it uses the public Railway proxy URL (.rlwy.net or .railway.app)');
      console.log('  3. Re-link Postgres service if needed: Variables → + Reference → Postgres');
      console.log('  4. Restart the service after updating DATABASE_URL\n');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

