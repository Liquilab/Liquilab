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
    console.log(`📍 Current checkpoint: block ${currentCheckpoint.lastBlock.toLocaleString()}`);
    if (currentCheckpoint.lastBlock >= maxDataBlock) {
      console.log(`✅ Checkpoint is already up to date (or ahead). No update needed.`);
      return;
    }
    console.log(`   Updating to block ${maxDataBlock.toLocaleString()}...\n`);
  } else {
    console.log(`📍 No checkpoint found. Creating new checkpoint at block ${maxDataBlock.toLocaleString()}...\n`);
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

  // Update checkpoint
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

  console.log(`✅ NPM:global checkpoint updated successfully!`);
  console.log(`   - Block: ${maxDataBlock.toLocaleString()}`);
  console.log(`   - Events: ${(transferCount + eventCount).toLocaleString()}`);
  console.log(`\n   NFPM indexing will now start from block ${(maxDataBlock + 1).toLocaleString()}\n`);

  // Also create/update FACTORY checkpoints for enosys and sparkdex
  // These are used by indexFactories() when --factory=all is used
  console.log('🏭 Creating FACTORY checkpoints...\n');
  
  for (const factory of ['enosys', 'sparkdex'] as const) {
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
    console.log(`   ✅ FACTORY:${factory} checkpoint set to block ${maxDataBlock.toLocaleString()}`);
  }
  
  console.log(`\n✅ All checkpoints updated! Factory indexing will now start from block ${(maxDataBlock + 1).toLocaleString()}`);
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

