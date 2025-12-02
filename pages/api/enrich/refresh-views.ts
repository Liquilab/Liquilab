/**
 * Refresh Materialized Views API
 * 
 * Refreshes materialized views for range status and position stats.
 * Should be called periodically (every 5-10 minutes) or after bulk indexer updates.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Inline SQL definitions for Materialized Views
function getMVSQL(mvName: string): { create: string; indexes?: string[] } | null {
  const mvSqlMap: Record<string, { create: string; indexes?: string[] }> = {
    'mv_pool_latest_state': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_latest_state" AS
SELECT "pool" AS pool,
       MAX("blockNumber") AS "blockNumber"
FROM "PoolEvent"
GROUP BY "pool"
WITH NO DATA`,
    },
    'mv_pool_fees_24h': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_fees_24h" AS
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
WITH NO DATA`,
    },
    'mv_position_range_status': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_position_range_status" AS
SELECT DISTINCT ON (pe."tokenId")
       pe."tokenId",
       pe."pool",
       pe."tickLower",
       pe."tickUpper",
       (SELECT "tick" FROM "mv_pool_latest_state" WHERE "pool" = pe."pool" LIMIT 1) as current_tick,
       CASE
         WHEN pe."tickLower" IS NOT NULL 
           AND pe."tickUpper" IS NOT NULL 
           AND EXISTS (SELECT 1 FROM "mv_pool_latest_state" WHERE "pool" = pe."pool")
           AND (SELECT "tick" FROM "mv_pool_latest_state" WHERE "pool" = pe."pool" LIMIT 1) >= pe."tickLower" 
           AND (SELECT "tick" FROM "mv_pool_latest_state" WHERE "pool" = pe."pool" LIMIT 1) < pe."tickUpper"
         THEN 'IN_RANGE'
         WHEN pe."tickLower" IS NOT NULL 
           AND pe."tickUpper" IS NOT NULL 
           AND EXISTS (SELECT 1 FROM "mv_pool_latest_state" WHERE "pool" = pe."pool")
         THEN 'OUT_OF_RANGE'
         ELSE NULL
       END AS range_status
FROM "PositionEvent" pe
WHERE pe."tickLower" IS NOT NULL 
  AND pe."tickUpper" IS NOT NULL
ORDER BY pe."tokenId", pe."blockNumber" DESC, pe."logIndex" DESC
WITH NO DATA`,
    },
    'mv_pool_position_stats': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_position_stats" AS
SELECT pe."pool",
       COUNT(DISTINCT pe."tokenId") AS position_count,
       AVG(COALESCE(pe."tickUpper", 0) - COALESCE(pe."tickLower", 0)) AS avg_range,
       MAX(pe."blockNumber") AS last_block
FROM "PositionEvent" pe
GROUP BY pe."pool"
WITH NO DATA`,
    },
    'mv_position_latest_event': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_position_latest_event" AS
SELECT DISTINCT ON (pe."tokenId")
       pe."tokenId",
       pe."pool",
       pe."eventType",
       pe."blockNumber",
       pe."timestamp"
FROM "PositionEvent" pe
ORDER BY pe."tokenId", pe."blockNumber" DESC
WITH NO DATA`,
    },
    'mv_pool_volume_7d': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_volume_7d" AS
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
WITH NO DATA`,
      indexes: [`CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_volume_7d_pool_idx ON "mv_pool_volume_7d" ("pool")`],
    },
    'mv_pool_fees_7d': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_fees_7d" AS
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
WITH NO DATA`,
      indexes: [`CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_fees_7d_pool_idx ON "mv_pool_fees_7d" ("pool")`],
    },
    'mv_positions_active_7d': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_positions_active_7d" AS
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
WITH NO DATA`,
      indexes: [
        `CREATE UNIQUE INDEX IF NOT EXISTS mv_positions_active_7d_tokenid_idx ON "mv_positions_active_7d" ("tokenId")`,
        `CREATE INDEX IF NOT EXISTS mv_positions_active_7d_pool_idx ON "mv_positions_active_7d" ("pool")`,
      ],
    },
    'mv_wallet_lp_7d': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_wallet_lp_7d" AS
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
WITH NO DATA`,
      indexes: [`CREATE UNIQUE INDEX IF NOT EXISTS mv_wallet_lp_7d_wallet_idx ON "mv_wallet_lp_7d" ("wallet")`],
    },
    'mv_pool_changes_7d': {
      create: `CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_pool_changes_7d" AS
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
WITH NO DATA`,
      indexes: [`CREATE UNIQUE INDEX IF NOT EXISTS mv_pool_changes_7d_pool_idx ON "mv_pool_changes_7d" ("pool")`],
    },
  };

  return mvSqlMap[mvName] || null;
}

/**
 * POST /api/enrich/refresh-views
 * Refresh all materialized views
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const startTime = Date.now();
  const results: Record<string, { success: boolean; duration: number; error?: string }> = {};

  try {
    // Refresh in safe order (dependencies first)
    const refreshOrder = [
      { name: 'poolLatestState', mv: 'mv_pool_latest_state' },
      { name: 'poolFees24h', mv: 'mv_pool_fees_24h' },
      { name: 'rangeStatus', mv: 'mv_position_range_status' },
      { name: 'positionStats', mv: 'mv_pool_position_stats' },
      { name: 'latestEvent', mv: 'mv_position_latest_event' },
      { name: 'poolVolume7d', mv: 'mv_pool_volume_7d' },
      { name: 'poolFees7d', mv: 'mv_pool_fees_7d' },
      { name: 'positionsActive7d', mv: 'mv_positions_active_7d' },
      { name: 'walletLp7d', mv: 'mv_wallet_lp_7d' },
      { name: 'poolChanges7d', mv: 'mv_pool_changes_7d' },
      // Note: mv_position_lifetime_v1 is not defined yet, skipping
      // { name: 'positionLifetime', mv: 'mv_position_lifetime_v1' },
    ];

    for (const { name, mv } of refreshOrder) {
      try {
        const start = Date.now();
        
        // First check if MV exists, if not create it
        let mvExists = false;
        try {
          const mvCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
            SELECT EXISTS (
              SELECT 1 FROM pg_matviews WHERE matviewname = ${mv}
            ) as exists
          `;
          mvExists = mvCheck[0]?.exists ?? false;
        } catch (checkError) {
          // If check fails, assume MV doesn't exist and try to create
          console.log(`[refresh-views] MV existence check failed for ${mv}, attempting creation`);
        }
        
        if (!mvExists) {
          // MV doesn't exist, create it using inline SQL definitions
          try {
            const mvSql = getMVSQL(mv);
            if (!mvSql) {
              throw new Error(`No SQL definition found for ${mv}`);
            }

            // Create the MV
            await prisma.$executeRawUnsafe(mvSql.create);
            console.log(`[refresh-views] Created ${mv}`);

            // Create indexes if defined
            if (mvSql.indexes) {
              for (const idxSql of mvSql.indexes) {
                try {
                  await prisma.$executeRawUnsafe(idxSql);
                } catch (idxError) {
                  const errorMsg = idxError instanceof Error ? idxError.message : String(idxError);
                  if (!errorMsg.includes('already exists') && !errorMsg.includes('duplicate')) {
                    console.warn(`[refresh-views] Index creation warning for ${mv}: ${errorMsg}`);
                  }
                }
              }
            }
          } catch (createError) {
            const errorMsg = createError instanceof Error ? createError.message : String(createError);
            // If MV already exists (race condition), that's OK
            if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
              console.log(`[refresh-views] ${mv} already exists, continuing...`);
            } else {
              results[name] = {
                success: false,
                duration: 0,
                error: `MV does not exist and creation failed: ${errorMsg}`,
              };
              continue;
            }
          }
        }
        
        // Now refresh the MV
        // First try CONCURRENTLY, if that fails (not populated), try without CONCURRENTLY
        try {
          await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY "${mv}"`);
        } catch (concurrentError) {
          const errorMsg = concurrentError instanceof Error ? concurrentError.message : String(concurrentError);
          // If CONCURRENTLY fails because MV is not populated, try without CONCURRENTLY
          if (errorMsg.includes('not populated') || errorMsg.includes('CONCURRENTLY')) {
            console.log(`[refresh-views] ${mv} not populated, refreshing without CONCURRENTLY...`);
            await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW "${mv}"`);
          } else {
            throw concurrentError;
          }
        }
        
        results[name] = {
          success: true,
          duration: Date.now() - start,
        };
      } catch (error) {
        results[name] = {
          success: false,
          duration: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    const totalDuration = Date.now() - startTime;
    const allSuccess = Object.values(results).every((r) => r.success);

    return res.status(allSuccess ? 200 : 207).json({
      success: allSuccess,
      duration: totalDuration,
      results,
    });
  } catch (error) {
    console.error('[refresh-views] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}

