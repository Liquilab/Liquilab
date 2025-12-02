#!/usr/bin/env tsx

/**
 * Update the global checkpoint to the max block in PositionEvent/PositionTransfer
 * Use this if checkpoint wasn't saved correctly during backfill
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Updating checkpoint to max block in database...\n');

  // Find max block in PositionEvent and PositionTransfer
  const [maxTransferBlock, maxEventBlock] = await Promise.all([
    prisma.positionTransfer.findFirst({
      orderBy: { blockNumber: 'desc' },
      select: { blockNumber: true },
    }),
    prisma.positionEvent.findFirst({
      orderBy: { blockNumber: 'desc' },
      select: { blockNumber: true },
    }),
  ]);

  const maxDataBlock = Math.max(
    maxTransferBlock?.blockNumber ?? 0,
    maxEventBlock?.blockNumber ?? 0
  );

  if (maxDataBlock === 0) {
    console.log('❌ No data found in database. Cannot update checkpoint.');
    return;
  }

  console.log(`📊 Max block in database: ${maxDataBlock.toLocaleString()}\n`);

  // Get current checkpoint
  const currentCheckpoint = await prisma.syncCheckpoint.findUnique({
    where: { id: 'NPM:global' },
  });

  if (currentCheckpoint) {
    console.log(`📍 Current NPM:global checkpoint: block ${currentCheckpoint.lastBlock.toLocaleString()}`);
    if (currentCheckpoint.lastBlock < maxDataBlock) {
      console.log(`   Updating to block ${maxDataBlock.toLocaleString()}...\n`);
    } else {
      console.log(`   NPM checkpoint is up to date.\n`);
    }
  } else {
    console.log(`📍 No NPM:global checkpoint found. Creating new checkpoint at block ${maxDataBlock.toLocaleString()}...\n`);
  }

  // Count events up to max block
  const [transferCount, eventCount] = await Promise.all([
    prisma.positionTransfer.count({
      where: { blockNumber: { lte: maxDataBlock } },
    }),
    prisma.positionEvent.count({
      where: { blockNumber: { lte: maxDataBlock } },
    }),
  ]);

  // Get timestamp from max block (if available)
  const maxBlockData = await prisma.positionEvent.findFirst({
    where: { blockNumber: maxDataBlock },
    select: { timestamp: true },
    orderBy: { logIndex: 'desc' },
  });

  const timestamp = maxBlockData?.timestamp ?? undefined;

  // Update NPM:global checkpoint (only if needed)
  if (!currentCheckpoint || currentCheckpoint.lastBlock < maxDataBlock) {
    await prisma.syncCheckpoint.upsert({
      where: { id: 'NPM:global' },
      create: {
        id: 'NPM:global',
        source: 'NPM',
        key: 'global',
        lastBlock: maxDataBlock,
        lastTimestamp: timestamp,
        eventsCount: transferCount + eventCount,
      },
      update: {
        lastBlock: maxDataBlock,
        lastTimestamp: timestamp,
        eventsCount: transferCount + eventCount,
      },
    });
    console.log(`✅ NPM:global checkpoint updated!`);
  }
  console.log(`   - Block: ${maxDataBlock.toLocaleString()}`);
  console.log(`   - Events: ${(transferCount + eventCount).toLocaleString()}`);
  console.log(`   - NFPM indexing will start from block ${(maxDataBlock + 1).toLocaleString()}\n`);

  // Always check and create/update FACTORY checkpoints
  // These are used by indexFactories() when --factory=all is used
  console.log('🏭 Checking FACTORY checkpoints...\n');
  
  for (const factory of ['enosys', 'sparkdex'] as const) {
    const factoryCheckpoint = await prisma.syncCheckpoint.findUnique({
      where: { id: `FACTORY:${factory}` },
    });
    
    if (factoryCheckpoint) {
      if (factoryCheckpoint.lastBlock < maxDataBlock) {
        console.log(`   📍 FACTORY:${factory} exists but is behind (${factoryCheckpoint.lastBlock.toLocaleString()} < ${maxDataBlock.toLocaleString()})`);
        console.log(`      Updating...`);
      } else {
        console.log(`   ✅ FACTORY:${factory} is up to date (block ${factoryCheckpoint.lastBlock.toLocaleString()})`);
      }
    } else {
      console.log(`   📍 FACTORY:${factory} missing, creating...`);
    }
    
    await prisma.syncCheckpoint.upsert({
      where: { id: `FACTORY:${factory}` },
      create: {
        id: `FACTORY:${factory}`,
        source: 'FACTORY',
        key: factory,
        lastBlock: maxDataBlock,
        lastTimestamp: timestamp,
        eventsCount: 0, // Factory events are counted separately
      },
      update: {
        lastBlock: maxDataBlock,
        lastTimestamp: timestamp,
      },
    });
    console.log(`      ✅ FACTORY:${factory} checkpoint set to block ${maxDataBlock.toLocaleString()}\n`);
  }
  
  console.log(`✅ All checkpoints updated!`);
  console.log(`   - NFPM indexing will start from block ${(maxDataBlock + 1).toLocaleString()}`);
  console.log(`   - Factory indexing will start from block ${(maxDataBlock + 1).toLocaleString()}`);
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

