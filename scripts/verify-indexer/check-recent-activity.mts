#!/usr/bin/env tsx

/**
 * Verify that indexer is actively writing new events to the database
 * Checks recent activity and compares with checkpoints
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking indexer recent activity...\n');

  // Get current checkpoints
  const [globalCheckpoint, enosysFactory, sparkdexFactory] = await Promise.all([
    prisma.syncCheckpoint.findUnique({
      where: { id: 'NPM:global' },
    }),
    prisma.syncCheckpoint.findUnique({
      where: { id: 'FACTORY:enosys' },
    }),
    prisma.syncCheckpoint.findUnique({
      where: { id: 'FACTORY:sparkdex' },
    }),
  ]);

  console.log('📊 Current Checkpoints:\n');
  if (globalCheckpoint) {
    console.log(`   NPM:global: block ${globalCheckpoint.lastBlock.toLocaleString()}`);
    console.log(`   - Events: ${globalCheckpoint.eventsCount.toLocaleString()}`);
    console.log(`   - Updated: ${globalCheckpoint.updatedAt.toISOString()}`);
  }
  if (enosysFactory) {
    console.log(`   FACTORY:enosys: block ${enosysFactory.lastBlock.toLocaleString()}`);
    console.log(`   - Updated: ${enosysFactory.updatedAt.toISOString()}`);
  }
  if (sparkdexFactory) {
    console.log(`   FACTORY:sparkdex: block ${sparkdexFactory.lastBlock.toLocaleString()}`);
    console.log(`   - Updated: ${sparkdexFactory.updatedAt.toISOString()}`);
  }
  console.log('');

  // Check recent events (last hour)
  const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
  const [recentTransfers, recentEvents, recentPoolEvents] = await Promise.all([
    prisma.positionTransfer.count({
      where: {
        timestamp: { gte: oneHourAgo },
      },
    }),
    prisma.positionEvent.count({
      where: {
        timestamp: { gte: oneHourAgo },
      },
    }),
    prisma.poolEvent.count({
      where: {
        timestamp: { gte: oneHourAgo },
      },
    }),
  ]);

  console.log('⏰ Recent Activity (last hour):\n');
  console.log(`   PositionTransfer: ${recentTransfers.toLocaleString()} events`);
  console.log(`   PositionEvent: ${recentEvents.toLocaleString()} events`);
  console.log(`   PoolEvent: ${recentPoolEvents.toLocaleString()} events`);
  console.log('');

  // Check latest events in database
  const [latestTransfer, latestEvent, latestPoolEvent] = await Promise.all([
    prisma.positionTransfer.findFirst({
      orderBy: { blockNumber: 'desc' },
      select: {
        blockNumber: true,
        timestamp: true,
        txHash: true,
        tokenId: true,
        nfpmAddress: true,
      },
    }),
    prisma.positionEvent.findFirst({
      orderBy: { blockNumber: 'desc' },
      select: {
        blockNumber: true,
        timestamp: true,
        txHash: true,
        tokenId: true,
        eventType: true,
      },
    }),
    prisma.poolEvent.findFirst({
      orderBy: { blockNumber: 'desc' },
      select: {
        blockNumber: true,
        timestamp: true,
        txHash: true,
        eventName: true,
        pool: true,
      },
    }),
  ]);

  console.log('📦 Latest Events in Database:\n');
  if (latestTransfer) {
    const date = new Date(latestTransfer.timestamp * 1000);
    const dex = latestTransfer.nfpmAddress?.toLowerCase() === '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657' ? 'Enosys' :
                latestTransfer.nfpmAddress?.toLowerCase() === '0xee5ff5bc5f852764b5584d92a4d592a53dc527da' ? 'SparkDEX' : 'Unknown';
    console.log(`   PositionTransfer:`);
    console.log(`      - Block: ${latestTransfer.blockNumber.toLocaleString()}`);
    console.log(`      - TokenId: ${latestTransfer.tokenId}`);
    console.log(`      - DEX: ${dex}`);
    console.log(`      - Time: ${date.toISOString()}`);
    console.log(`      - Tx: ${latestTransfer.txHash.slice(0, 10)}...`);
  }
  if (latestEvent) {
    const date = new Date(latestEvent.timestamp * 1000);
    console.log(`   PositionEvent:`);
    console.log(`      - Block: ${latestEvent.blockNumber.toLocaleString()}`);
    console.log(`      - Event: ${latestEvent.eventType}`);
    console.log(`      - TokenId: ${latestEvent.tokenId}`);
    console.log(`      - Time: ${date.toISOString()}`);
  }
  if (latestPoolEvent) {
    const date = new Date(latestPoolEvent.timestamp * 1000);
    console.log(`   PoolEvent:`);
    console.log(`      - Block: ${latestPoolEvent.blockNumber.toLocaleString()}`);
    console.log(`      - Event: ${latestPoolEvent.eventName}`);
    console.log(`      - Pool: ${latestPoolEvent.pool?.slice(0, 10)}...`);
    console.log(`      - Time: ${date.toISOString()}`);
  }
  console.log('');

  // Check checkpoint vs database consistency
  const maxDbBlock = Math.max(
    latestTransfer?.blockNumber ?? 0,
    latestEvent?.blockNumber ?? 0,
    latestPoolEvent?.blockNumber ?? 0
  );

  if (globalCheckpoint && maxDbBlock > 0) {
    const checkpointBlock = globalCheckpoint.lastBlock;
    const diff = checkpointBlock - maxDbBlock;
    
    console.log('🔍 Checkpoint vs Database Consistency:\n');
    console.log(`   Checkpoint block: ${checkpointBlock.toLocaleString()}`);
    console.log(`   Max DB block: ${maxDbBlock.toLocaleString()}`);
    console.log(`   Difference: ${diff.toLocaleString()} blocks`);
    
    if (diff > 1000) {
      console.log(`   ⚠️  WARNING: Checkpoint is ${diff.toLocaleString()} blocks ahead of database!`);
      console.log(`      This might indicate events are not being written correctly.`);
    } else if (diff < -100) {
      console.log(`   ⚠️  WARNING: Database has events ${Math.abs(diff).toLocaleString()} blocks ahead of checkpoint!`);
      console.log(`      Checkpoint might not be updating correctly.`);
    } else {
      console.log(`   ✅ Checkpoint and database are in sync (within 100 blocks).`);
    }
    console.log('');
  }

  // Check if indexer is actively updating
  const checkpointAge = globalCheckpoint 
    ? Date.now() - globalCheckpoint.updatedAt.getTime()
    : Infinity;
  const checkpointAgeMinutes = Math.floor(checkpointAge / 60000);

  console.log('⏱️  Indexer Activity Status:\n');
  if (checkpointAge < 300000) { // Less than 5 minutes
    console.log(`   ✅ Checkpoint updated ${checkpointAgeMinutes} minute(s) ago - Indexer is ACTIVE`);
  } else if (checkpointAge < 3600000) { // Less than 1 hour
    console.log(`   ⚠️  Checkpoint updated ${checkpointAgeMinutes} minute(s) ago - Indexer might be slow`);
  } else {
    console.log(`   ❌ Checkpoint updated ${Math.floor(checkpointAgeMinutes / 60)} hour(s) ago - Indexer might be STOPPED`);
  }

  if (recentTransfers === 0 && recentEvents === 0 && recentPoolEvents === 0) {
    console.log(`   ⚠️  No events written in the last hour - Check if indexer is running`);
  } else {
    console.log(`   ✅ Events are being written (${recentTransfers + recentEvents + recentPoolEvents} in last hour)`);
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

