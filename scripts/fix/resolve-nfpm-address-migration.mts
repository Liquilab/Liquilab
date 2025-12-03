#!/usr/bin/env tsx

/**
 * Resolve migration drift for nfpmAddress field
 * Marks the migration as applied if the field already exists in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking if nfpmAddress field exists in PositionEvent table...\n');

  try {
    // Try to query the nfpmAddress field
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'PositionEvent' 
        AND column_name = 'nfpmAddress'
    `;

    if (result.length > 0) {
      console.log('✅ nfpmAddress field already exists in PositionEvent table');
      console.log('✅ Migration can be marked as applied\n');
      console.log('📝 To resolve drift, run on Railway:');
      console.log('   npx prisma migrate resolve --applied 20251202_add_nfpm_address_to_position_event\n');
    } else {
      console.log('⚠️  nfpmAddress field does NOT exist in PositionEvent table');
      console.log('📝 Run migration on Railway:');
      console.log('   npx prisma migrate deploy\n');
    }

    // Check if index exists
    const indexResult = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'PositionEvent' 
        AND indexname LIKE '%nfpmAddress%'
    `;

    if (indexResult.length > 0) {
      console.log(`✅ Index found: ${indexResult[0].indexname}`);
    } else {
      console.log('⚠️  No index found on nfpmAddress');
    }
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

