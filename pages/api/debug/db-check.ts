/**
 * Debug endpoint to check database connection and data
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get database URL (masked)
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

    // Check tables exist
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;

    // Count records in key tables
    const positionEventCount = await prisma.positionEvent.count();
    const positionTransferCount = await prisma.positionTransfer.count();
    const poolEventCount = await prisma.poolEvent.count();
    const checkpointCount = await prisma.syncCheckpoint.count();

    // Get all checkpoints
    const checkpoints = await prisma.syncCheckpoint.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    // Get sample PositionEvent if any
    const samplePositionEvent = await prisma.positionEvent.findFirst({
      orderBy: { blockNumber: 'desc' },
    });

    // Check if nfpmAddress column exists
    const nfpmAddressExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'PositionEvent' AND column_name = 'nfpmAddress'
      ) as exists
    `;

    return res.status(200).json({
      databaseUrl: maskedUrl,
      tables: tables.map(t => t.tablename),
      counts: {
        positionEvents: positionEventCount,
        positionTransfers: positionTransferCount,
        poolEvents: poolEventCount,
        checkpoints: checkpointCount,
      },
      checkpoints: checkpoints.map(cp => ({
        stream: cp.stream,
        key: cp.key,
        lastBlock: cp.lastBlock,
        eventsCount: cp.eventsCount,
        updatedAt: cp.updatedAt,
      })),
      samplePositionEvent: samplePositionEvent ? {
        id: samplePositionEvent.id,
        tokenId: samplePositionEvent.tokenId,
        blockNumber: samplePositionEvent.blockNumber,
        nfpmAddress: samplePositionEvent.nfpmAddress,
      } : null,
      nfpmAddressColumnExists: nfpmAddressExists[0]?.exists ?? false,
    });
  } catch (error) {
    console.error('[db-check] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}

