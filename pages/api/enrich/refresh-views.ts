/**
 * Refresh Materialized Views API
 * 
 * Refreshes materialized views for range status and position stats.
 * Should be called periodically (every 5-10 minutes) or after bulk indexer updates.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      { name: 'positionLifetime', mv: 'mv_position_lifetime_v1' },
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
          // MV doesn't exist, try to create it from SQL file
          try {
            const fs = await import('fs');
            const path = await import('path');
            const sqlFile = path.join(process.cwd(), 'db/views', `${mv}.sql`);
            
            if (fs.existsSync(sqlFile)) {
              const sql = fs.readFileSync(sqlFile, 'utf-8');
              
              // Remove comments and split by semicolon, but handle multi-line statements
              const cleanedSql = sql
                .split('\n')
                .map(line => {
                  const commentIndex = line.indexOf('--');
                  return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
                })
                .join('\n');
              
              // Split by semicolon, but keep statements that span multiple lines
              const statements = cleanedSql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);
              
              // Execute each statement separately
              for (const statement of statements) {
                if (statement.trim()) {
                  try {
                    // Add semicolon if not present
                    const sqlStatement = statement.trim().endsWith(';') ? statement.trim() : statement.trim() + ';';
                    await prisma.$executeRawUnsafe(sqlStatement);
                  } catch (stmtError) {
                    // If it's a "already exists" error, that's OK - continue
                    const errorMsg = stmtError instanceof Error ? stmtError.message : String(stmtError);
                    if (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || errorMsg.includes('relation') && errorMsg.includes('already exists')) {
                      console.log(`[refresh-views] ${mv} or its index already exists, continuing...`);
                      continue;
                    }
                    // For other errors, log but don't fail completely - might be index creation failing
                    console.error(`[refresh-views] Error executing statement for ${mv}:`, errorMsg);
                    // Only throw if it's the CREATE MATERIALIZED VIEW statement (first statement)
                    if (statement.trim().toUpperCase().startsWith('CREATE MATERIALIZED VIEW')) {
                      throw stmtError;
                    }
                  }
                }
              }
              console.log(`[refresh-views] Created ${mv}`);
            } else {
              throw new Error(`SQL file not found: ${sqlFile}`);
            }
          } catch (createError) {
            results[name] = {
              success: false,
              duration: 0,
              error: `MV does not exist and creation failed: ${createError instanceof Error ? createError.message : String(createError)}`,
            };
            continue;
          }
        }
        
        // Now refresh the MV
        await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY "${mv}"`);
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

