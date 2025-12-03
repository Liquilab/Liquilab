/**
 * Drop a single Materialized View API
 * 
 * Usage: POST /api/enrich/drop-single-mv?mv=mv_pool_fees_24h
 * Protected by CRON_SECRET.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  const mvName = req.query.mv as string;
  
  if (!mvName || !mvName.startsWith('mv_')) {
    return res.status(400).json({ error: 'Invalid MV name. Must start with mv_' });
  }

  try {
    await prisma.$executeRawUnsafe(`DROP MATERIALIZED VIEW IF EXISTS "${mvName}" CASCADE`);
    console.log(`[drop-single-mv] Dropped ${mvName}`);
    
    return res.status(200).json({
      success: true,
      message: `Dropped ${mvName}. Now call /api/enrich/refresh-views to recreate with index.`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[drop-single-mv] Failed to drop ${mvName}: ${errorMsg}`);
    return res.status(500).json({
      success: false,
      error: errorMsg,
    });
  } finally {
    await prisma.$disconnect();
  }
}

