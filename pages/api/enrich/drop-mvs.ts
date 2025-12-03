/**
 * Drop Materialized Views API (one-time use)
 * 
 * Drops MVs that don't have unique indexes so they can be recreated with indexes.
 * Protected by CRON_SECRET.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MVS_TO_DROP = [
  'mv_pool_latest_state',
  'mv_pool_fees_24h',
  'mv_position_range_status',
  'mv_pool_position_stats',
  'mv_position_latest_event',
];

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

  const results: Record<string, { success: boolean; error?: string }> = {};

  try {
    for (const mv of MVS_TO_DROP) {
      try {
        await prisma.$executeRawUnsafe(`DROP MATERIALIZED VIEW IF EXISTS "${mv}" CASCADE`);
        results[mv] = { success: true };
        console.log(`[drop-mvs] Dropped ${mv}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results[mv] = { success: false, error: errorMsg };
        console.error(`[drop-mvs] Failed to drop ${mv}: ${errorMsg}`);
      }
    }

    const allSuccess = Object.values(results).every((r) => r.success);

    return res.status(allSuccess ? 200 : 207).json({
      success: allSuccess,
      message: 'MVs dropped. Now call /api/enrich/refresh-views to recreate with indexes.',
      results,
    });
  } catch (error) {
    console.error('[drop-mvs] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}

