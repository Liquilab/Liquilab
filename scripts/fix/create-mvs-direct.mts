#!/usr/bin/env tsx

/**
 * Directly create Materialized Views using Prisma
 * This script creates MVs one by one with better error handling
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const MV_DEFINITIONS = [
  {
    name: 'mv_pool_latest_state',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_latest_state" AS
SELECT "pool" AS pool,
       MAX("blockNumber") AS "blockNumber"
FROM "PoolEvent"
GROUP BY "pool"
WITH NO DATA;`,
  },
  {
    name: 'mv_pool_fees_24h',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_fees_24h" AS
WITH latest_blocks AS (
  SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
)
SELECT p."pool",
       SUM(COALESCE(p."amount0", '0')) AS "amount0",
       SUM(COALESCE(p."amount1", '0')) AS "amount1"
FROM "PoolEvent" p
CROSS JOIN latest_blocks lb
WHERE p."blockNumber" >= lb.max_block - 7200
GROUP BY p."pool"
WITH NO DATA;`,
  },
  {
    name: 'mv_position_range_status',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_position_range_status" AS
SELECT DISTINCT ON (pe."tokenId")
       pe."tokenId",
       pe."pool",
       pe."tickLower",
       pe."tickUpper",
       (SELECT "tick" FROM "mv_pool_latest_state" WHERE "pool" = pe."pool" LIMIT 1) as current_tick,
       CASE
         WHEN pe."tickLower" IS NOT NULL 
           AND pe."tickUpper" IS NOT NULL 
           AND EXISTS (SELECT 1 FROM "mv_pool_latest_state" WHERE "pool" = pe."pool" AND "tick" IS NOT NULL)
           AND (SELECT "tick" FROM "mv_pool_latest_state" WHERE "pool" = pe."pool" LIMIT 1) >= pe."tickLower" 
           AND (SELECT "tick" FROM "mv_pool_latest_state" WHERE "pool" = pe."pool" LIMIT 1) < pe."tickUpper"
         THEN 'IN_RANGE'
         WHEN pe."tickLower" IS NOT NULL 
           AND pe."tickUpper" IS NOT NULL 
           AND EXISTS (SELECT 1 FROM "mv_pool_latest_state" WHERE "pool" = pe."pool" AND "tick" IS NOT NULL)
         THEN 'OUT_OF_RANGE'
         ELSE NULL
       END AS range_status
FROM "PositionEvent" pe
WHERE pe."tickLower" IS NOT NULL 
  AND pe."tickUpper" IS NOT NULL
ORDER BY pe."tokenId", pe."blockNumber" DESC, pe."logIndex" DESC
WITH NO DATA;`,
  },
  {
    name: 'mv_pool_position_stats',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_position_stats" AS
SELECT pe."pool",
       COUNT(DISTINCT pe."tokenId") AS position_count,
       AVG(COALESCE(pe."tickUpper", 0) - COALESCE(pe."tickLower", 0)) AS avg_range,
       MAX(pe."blockNumber") AS last_block
FROM "PositionEvent" pe
GROUP BY pe."pool"
WITH NO DATA;`,
  },
  {
    name: 'mv_position_latest_event',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_position_latest_event" AS
SELECT DISTINCT ON (pe."tokenId")
       pe."tokenId",
       pe."pool",
       pe."eventType",
       pe."blockNumber",
       pe."timestamp"
FROM "PositionEvent" pe
ORDER BY pe."tokenId", pe."blockNumber" DESC
WITH NO DATA;`,
  },
  {
    name: 'mv_pool_volume_7d',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_volume_7d" AS
WITH latest_blocks AS (
  SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
)
SELECT p."pool",
       COUNT(*) FILTER (WHERE p."eventName" = 'Swap') AS swap_count,
       SUM(CAST(COALESCE(p."amount0", '0') AS NUMERIC)) AS volume0,
       SUM(CAST(COALESCE(p."amount1", '0') AS NUMERIC)) AS volume1
FROM "PoolEvent" p
CROSS JOIN latest_blocks lb
WHERE p."blockNumber" >= lb.max_block - 50400
  AND p."eventName" = 'Swap'
GROUP BY p."pool"
WITH NO DATA;`,
    index: `CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_volume_7d_pool_idx ON "mv_pool_volume_7d" ("pool");`,
  },
  {
    name: 'mv_pool_fees_7d',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_fees_7d" AS
WITH latest_blocks AS (
  SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
)
SELECT p."pool",
       SUM(CAST(COALESCE(p."amount0", '0') AS NUMERIC)) AS fees0,
       SUM(CAST(COALESCE(p."amount1", '0') AS NUMERIC)) AS fees1
FROM "PoolEvent" p
CROSS JOIN latest_blocks lb
WHERE p."blockNumber" >= lb.max_block - 50400
  AND p."eventName" = 'Collect'
GROUP BY p."pool"
WITH NO DATA;`,
    index: `CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_fees_7d_pool_idx ON "mv_pool_fees_7d" ("pool");`,
  },
  {
    name: 'mv_positions_active_7d',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_positions_active_7d" AS
WITH latest_blocks AS (
  SELECT MAX("blockNumber") AS max_block FROM "PositionEvent"
)
SELECT pe."tokenId",
       pe."pool",
       COUNT(DISTINCT pe."eventType") AS event_types_count,
       MAX(pe."blockNumber") AS last_block,
       MAX(pe."timestamp") AS last_timestamp
FROM "PositionEvent" pe
CROSS JOIN latest_blocks lb
WHERE pe."blockNumber" >= lb.max_block - 50400
GROUP BY pe."tokenId", pe."pool"
WITH NO DATA;`,
    indexes: [
      `CREATE UNIQUE INDEX IF NOT EXISTS mv_positions_active_7d_tokenid_idx ON "mv_positions_active_7d" ("tokenId");`,
      `CREATE INDEX IF NOT EXISTS mv_positions_active_7d_pool_idx ON "mv_positions_active_7d" ("pool");`,
    ],
  },
  {
    name: 'mv_wallet_lp_7d',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_wallet_lp_7d" AS
WITH latest_blocks AS (
  SELECT MAX("blockNumber") AS max_block FROM "PositionEvent"
)
SELECT pe."owner" AS wallet,
       COUNT(DISTINCT pe."tokenId") AS positions_count,
       COUNT(DISTINCT pe."pool") AS pools_count,
       SUM(CAST(COALESCE(pe."amount0", '0') AS NUMERIC)) AS total_amount0,
       SUM(CAST(COALESCE(pe."amount1", '0') AS NUMERIC)) AS total_amount1
FROM "PositionEvent" pe
CROSS JOIN latest_blocks lb
WHERE pe."blockNumber" >= lb.max_block - 50400
  AND pe."owner" IS NOT NULL
GROUP BY pe."owner"
WITH NO DATA;`,
    index: `CREATE UNIQUE INDEX IF NOT EXISTS mv_wallet_lp_7d_wallet_idx ON "mv_wallet_lp_7d" ("wallet");`,
  },
  {
    name: 'mv_pool_changes_7d',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_changes_7d" AS
WITH latest_blocks AS (
  SELECT MAX("blockNumber") AS max_block FROM "PoolEvent"
),
pool_first_seen AS (
  SELECT "pool", MIN("blockNumber") AS first_block
  FROM "PoolEvent"
  GROUP BY "pool"
)
SELECT p."pool",
       pfs.first_block,
       CASE WHEN pfs.first_block >= lb.max_block - 50400 THEN 'NEW' ELSE 'EXISTING' END AS change_type,
       COUNT(*) FILTER (WHERE p."eventName" = 'Mint') AS mints_7d,
       COUNT(*) FILTER (WHERE p."eventName" = 'Burn') AS burns_7d
FROM "PoolEvent" p
CROSS JOIN latest_blocks lb
LEFT JOIN pool_first_seen pfs ON pfs."pool" = p."pool"
WHERE p."blockNumber" >= lb.max_block - 50400
GROUP BY p."pool", pfs.first_block, lb.max_block
WITH NO DATA;`,
    index: `CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_changes_7d_pool_idx ON "mv_pool_changes_7d" ("pool");`,
  },
];

async function createMV(mv: typeof MV_DEFINITIONS[0]) {
  try {
    // Check if MV exists
    const exists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = ${mv.name}
      ) as exists
    `;
    
    if (exists[0]?.exists) {
      console.log(`⏭️  ${mv.name} already exists`);
      return { success: true };
    }

    // Create MV
    console.log(`🔨 Creating ${mv.name}...`);
    await prisma.$executeRawUnsafe(mv.sql);
    console.log(`✅ Created ${mv.name}`);

    // Create indexes if defined
    if (mv.index) {
      try {
        await prisma.$executeRawUnsafe(mv.index);
        console.log(`✅ Created index for ${mv.name}`);
      } catch (idxError) {
        const errorMsg = idxError instanceof Error ? idxError.message : String(idxError);
        if (!errorMsg.includes('already exists')) {
          console.warn(`⚠️  Index creation failed for ${mv.name}: ${errorMsg}`);
        }
      }
    }

    if (mv.indexes) {
      for (const idxSql of mv.indexes) {
        try {
          await prisma.$executeRawUnsafe(idxSql);
          console.log(`✅ Created index for ${mv.name}`);
        } catch (idxError) {
          const errorMsg = idxError instanceof Error ? idxError.message : String(idxError);
          if (!errorMsg.includes('already exists')) {
            console.warn(`⚠️  Index creation failed for ${mv.name}: ${errorMsg}`);
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to create ${mv.name}: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

async function main() {
  console.log('🔨 Creating Materialized Views directly...\n');

  const results = [];
  for (const mv of MV_DEFINITIONS) {
    const result = await createMV(mv);
    results.push({ name: mv.name, ...result });
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
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

