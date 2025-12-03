#!/usr/bin/env tsx

/**
 * Create Materialized Views from SQL files
 * 
 * Reads SQL files from db/views/ and creates the MVs in the database.
 * Safe to run multiple times (uses IF NOT EXISTS).
 * 
 * Usage: npm run db:mvs:create
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Order matters for dependencies (base views first)
const MV_ORDER = [
  // Core MVs (no dependencies)
  'mv_pool_latest_state.sql',
  'mv_pool_fees_24h.sql',
  'mv_pool_position_stats.sql',
  'mv_position_latest_event.sql',
  'mv_pool_volume_7d.sql',
  'mv_pool_fees_7d.sql',
  'mv_positions_active_7d.sql',
  'mv_wallet_lp_7d.sql',
  'mv_pool_changes_7d.sql',
  // Dependent MVs (after base views)
  'mv_position_range_status.sql', // depends on mv_pool_latest_state
  // Lifetime/analytics MVs
  'mv_position_lifetime_v1.sql',
];

async function createMV(sqlFile: string, viewsDir: string): Promise<{ name: string; success: boolean; error?: string }> {
  const mvName = sqlFile.replace('.sql', '');
  const filePath = join(viewsDir, sqlFile);

  try {
    const sql = readFileSync(filePath, 'utf-8');
    
    // Remove comments and split by semicolon
    const cleanedSql = sql
      .split('\n')
      .map(line => {
        const commentIndex = line.indexOf('--');
        return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
      })
      .join('\n');
    
    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement + ';');
        } catch (stmtError) {
          const errorMsg = stmtError instanceof Error ? stmtError.message : String(stmtError);
          // Ignore "already exists" errors
          if (!errorMsg.includes('already exists') && !errorMsg.includes('duplicate')) {
            throw stmtError;
          }
        }
      }
    }

    console.log(`✅ Created ${mvName}`);
    return { name: mvName, success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to create ${mvName}: ${errorMsg}`);
    return { name: mvName, success: false, error: errorMsg };
  }
}

async function main() {
  console.log('🔨 Creating Materialized Views...\n');

  const viewsDir = join(process.cwd(), 'db/views');
  const existingFiles = readdirSync(viewsDir).filter(f => f.endsWith('.sql'));

  // Process in order, only files that exist
  const filesToProcess = MV_ORDER.filter(f => existingFiles.includes(f));
  
  // Add any files not in the order (new files)
  const unorderedFiles = existingFiles.filter(f => !MV_ORDER.includes(f));
  filesToProcess.push(...unorderedFiles);

  const results: Array<{ name: string; success: boolean; error?: string }> = [];

  for (const sqlFile of filesToProcess) {
    const result = await createMV(sqlFile, viewsDir);
    results.push(result);
  }

  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`   ✅ Created: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed MVs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }

  console.log('\n✅ All Materialized Views created successfully!');
  console.log('   Next step: Run REFRESH MATERIALIZED VIEW to populate data');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

