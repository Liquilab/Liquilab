#!/usr/bin/env tsx

/**
 * Check indexer status - checkpoints, recent events, and current chain head
 */

import { PrismaClient } from '@prisma/client';
import { createPublicClient, http } from 'viem';
import { flare } from 'viem/chains';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking indexer status...\n');

  // Get current chain head
  const rpcUrl = process.env.FLARE_RPC_URL || 'https://flare-api.flare.network/ext/C/rpc';
  const client = createPublicClient({
    chain: flare,
    transport: http(rpcUrl),
  });

  const currentBlock = await client.getBlockNumber();
  console.log(`📊 Current chain head: ${currentBlock}\n`);

  // Get all checkpoints
  console.log('📍 Checkpoints:');
  const checkpoints = await prisma.syncCheckpoint.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  if (checkpoints.length === 0) {
    console.log('   No checkpoints found!\n');
  } else {
    for (const cp of checkpoints) {
      const lag = Number(currentBlock) - cp.lastBlock;
      console.log(`   ${cp.stream}: block ${cp.lastBlock} (${lag} blocks behind)`);
    }
    console.log('');
  }

  // Get recent PositionEvents
  console.log('📊 Recent PositionEvents:');
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

  if (recentPositionEvents.length === 0) {
    console.log('   No PositionEvents found!\n');
  } else {
    for (const event of recentPositionEvents) {
      const date = new Date(event.timestamp * 1000).toISOString();
      console.log(`   Block ${event.blockNumber}: ${event.eventType} tokenId=${event.tokenId} (${date})`);
    }
    console.log('');
  }

  // Get recent PositionTransfers
  console.log('📊 Recent PositionTransfers:');
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

  if (recentTransfers.length === 0) {
    console.log('   No PositionTransfers found!\n');
  } else {
    for (const transfer of recentTransfers) {
      const date = new Date(transfer.timestamp * 1000).toISOString();
      console.log(`   Block ${transfer.blockNumber}: Transfer tokenId=${transfer.tokenId} (${date})`);
    }
    console.log('');
  }

  // Get counts
  console.log('📈 Total counts:');
  const positionEventCount = await prisma.positionEvent.count();
  const positionTransferCount = await prisma.positionTransfer.count();
  const poolEventCount = await prisma.poolEvent.count();
  
  console.log(`   PositionEvents: ${positionEventCount}`);
  console.log(`   PositionTransfers: ${positionTransferCount}`);
  console.log(`   PoolEvents: ${poolEventCount}`);

  // Check max blocks
  console.log('\n📊 Max block numbers in data:');
  const maxPositionEventBlock = await prisma.positionEvent.aggregate({
    _max: { blockNumber: true },
  });
  const maxTransferBlock = await prisma.positionTransfer.aggregate({
    _max: { blockNumber: true },
  });
  const maxPoolEventBlock = await prisma.poolEvent.aggregate({
    _max: { blockNumber: true },
  });

  console.log(`   PositionEvent max block: ${maxPositionEventBlock._max.blockNumber || 'N/A'}`);
  console.log(`   PositionTransfer max block: ${maxTransferBlock._max.blockNumber || 'N/A'}`);
  console.log(`   PoolEvent max block: ${maxPoolEventBlock._max.blockNumber || 'N/A'}`);

  // Calculate gaps
  console.log('\n📉 Gaps from chain head:');
  if (maxPositionEventBlock._max.blockNumber) {
    const gap = Number(currentBlock) - maxPositionEventBlock._max.blockNumber;
    const hoursAgo = (gap * 1.8) / 3600; // ~1.8s per block on Flare
    console.log(`   PositionEvent: ${gap} blocks behind (~${hoursAgo.toFixed(1)} hours)`);
  }
  if (maxTransferBlock._max.blockNumber) {
    const gap = Number(currentBlock) - maxTransferBlock._max.blockNumber;
    const hoursAgo = (gap * 1.8) / 3600;
    console.log(`   PositionTransfer: ${gap} blocks behind (~${hoursAgo.toFixed(1)} hours)`);
  }
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

