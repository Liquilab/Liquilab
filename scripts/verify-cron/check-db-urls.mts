#!/usr/bin/env tsx

/**
 * Check which DATABASE_URL is being used and verify connection
 */

console.log('🔍 Checking DATABASE_URL configuration...\n');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL is NOT set in this service!\n');
  console.log('📝 Fix in Railway Dashboard:');
  console.log('  1. Go to Liquilab-staging service');
  console.log('  2. Variables tab');
  console.log('  3. Check if DATABASE_URL exists');
  console.log('  4. If not, click "+ Reference" → Select "Postgres" service\n');
  process.exit(1);
}

// Mask password for display
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
console.log(`📊 Current DATABASE_URL: ${maskedUrl}\n`);

// Check URL type
const isInternal = dbUrl.includes('.railway.internal');
const isPublic = dbUrl.includes('.rlwy.net') || dbUrl.includes('.railway.app');

if (isInternal) {
  console.log('⚠️  PROBLEM: Using INTERNAL Railway URL (.railway.internal)');
  console.log('   This URL only works within Railway internal network');
  console.log('   The MV refresh endpoint needs PUBLIC URL\n');
  console.log('📝 Fix:');
  console.log('  1. Go to Railway Dashboard → Liquilab-staging service');
  console.log('  2. Variables tab');
  console.log('  3. Find DATABASE_URL');
  console.log('  4. Replace with PUBLIC URL from Postgres service:');
  console.log('     - Go to Postgres service → Variables');
  console.log('     - Copy DATABASE_URL (should contain .rlwy.net or .railway.app)');
  console.log('     - Paste in Liquilab-staging service\n');
} else if (isPublic) {
  console.log('✅ Using PUBLIC Railway URL (.rlwy.net or .railway.app)');
  console.log('   This should work for MV refresh endpoint\n');
  
  // Test connection
  console.log('🔌 Testing database connection...');
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.log('\n📝 Possible fixes:');
    console.log('  1. Check if DATABASE_URL credentials are correct');
    console.log('  2. Verify Postgres service is running');
    console.log('  3. Check if password/hostname changed\n');
  }
} else {
  console.log('⚠️  Unknown URL format');
  console.log('   Expected Railway URL (.rlwy.net, .railway.app, or .railway.internal)\n');
}

console.log('📋 Summary:');
console.log(`   URL Type: ${isInternal ? 'INTERNAL (needs fix)' : isPublic ? 'PUBLIC (OK)' : 'UNKNOWN'}`);
console.log(`   Service: Liquilab-staging`);
console.log(`   Required: PUBLIC URL for MV refresh endpoint\n`);

