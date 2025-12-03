/**
 * Indexer Status API
 * 
 * Returns current indexer status: checkpoints, recent events, gaps from chain head
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { flare } from 'viem/chains';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current chain head
    const rpcUrl = process.env.FLARE_RPC_URL || 'https://flare-api.flare.network/ext/C/rpc';
    const client = createPublicClient({
      chain: flare,
      transport: http(rpcUrl),
    });

    const currentBlock = Number(await client.getBlockNumber());

    // Get all checkpoints
    const checkpoints = await prisma.syncCheckpoint.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    // Get counts
    const positionEventCount = await prisma.positionEvent.count();
    const positionTransferCount = await prisma.positionTransfer.count();
    const poolEventCount = await prisma.poolEvent.count();

    // Get max blocks
    const maxPositionEventBlock = await prisma.positionEvent.aggregate({
      _max: { blockNumber: true },
    });
    const maxTransferBlock = await prisma.positionTransfer.aggregate({
      _max: { blockNumber: true },
    });
    const maxPoolEventBlock = await prisma.poolEvent.aggregate({
      _max: { blockNumber: true },
    });

    // Get recent events
    const recentPositionEvents = await prisma.positionEvent.findMany({
      orderBy: { blockNumber: 'desc' },
      take: 5,
      select: {
        blockNumber: true,
        eventType: true,
        tokenId: true,
        timestamp: true,
        nfpmAddress: true,
      },
    });

    const recentTransfers = await prisma.positionTransfer.findMany({
      orderBy: { blockNumber: 'desc' },
      take: 5,
      select: {
        blockNumber: true,
        tokenId: true,
        from: true,
        to: true,
        timestamp: true,
      },
    });

    // Calculate gaps
    const gaps = {
      positionEvent: maxPositionEventBlock._max.blockNumber 
        ? currentBlock - maxPositionEventBlock._max.blockNumber 
        : null,
      positionTransfer: maxTransferBlock._max.blockNumber 
        ? currentBlock - maxTransferBlock._max.blockNumber 
        : null,
      poolEvent: maxPoolEventBlock._max.blockNumber 
        ? currentBlock - maxPoolEventBlock._max.blockNumber 
        : null,
    };

    return res.status(200).json({
      currentBlock,
      checkpoints: checkpoints.map(cp => ({
        stream: cp.stream,
        lastBlock: cp.lastBlock,
        lag: currentBlock - cp.lastBlock,
        updatedAt: cp.updatedAt,
      })),
      counts: {
        positionEvents: positionEventCount,
        positionTransfers: positionTransferCount,
        poolEvents: poolEventCount,
      },
      maxBlocks: {
        positionEvent: maxPositionEventBlock._max.blockNumber,
        positionTransfer: maxTransferBlock._max.blockNumber,
        poolEvent: maxPoolEventBlock._max.blockNumber,
      },
      gaps,
      recentPositionEvents,
      recentTransfers,
    });
  } catch (error) {
    console.error('[indexer-status] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}

