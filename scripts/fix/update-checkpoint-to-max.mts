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

  // Count events
  const [transferCount, eventCount] = await Promise.all([
    prisma.positionTransfer.count(),
    prisma.positionEvent.count(),
  ]);

  // Update checkpoint
  await prisma.syncCheckpoint.upsert({
    where: { id: 'NPM:global' },
    create: {
      id: 'NPM:global',
      source: 'NPM',
      key: 'global',
      lastBlock: maxDataBlock,
      eventsCount: transferCount + eventCount,
    },
    update: {
      lastBlock: maxDataBlock,
      eventsCount: transferCount + eventCount,
    },
  });

  console.log(`✅ Checkpoint updated successfully!`);
  console.log(`   - Block: ${maxDataBlock.toLocaleString()}`);
  console.log(`   - Events: ${(transferCount + eventCount).toLocaleString()}`);
  console.log(`\n   Follower will now start from block ${(maxDataBlock + 1).toLocaleString()}`);
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

