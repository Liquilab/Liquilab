#!/usr/bin/env tsx

/**
 * Verify checkpoint status for indexer
 * Shows all checkpoints and helps diagnose why follower might start at wrong block
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking indexer checkpoints...\n');

  // Get all NPM checkpoints
  const checkpoints = await prisma.syncCheckpoint.findMany({
    where: { source: 'NPM' },
    orderBy: { lastBlock: 'desc' },
  });

  if (checkpoints.length === 0) {
    console.log('❌ No NPM checkpoints found in database');
    console.log('   The follower will start from factory start blocks or fallback.');
    return;
  }

  console.log(`✅ Found ${checkpoints.length} NPM checkpoint(s):\n`);

  for (const cp of checkpoints) {
    console.log(`📍 ${cp.key}:`);
    console.log(`   - Block: ${cp.lastBlock.toLocaleString()}`);
    console.log(`   - Events: ${cp.eventsCount.toLocaleString()}`);
    if (cp.lastTimestamp) {
      const date = new Date(cp.lastTimestamp * 1000);
      console.log(`   - Timestamp: ${date.toISOString()}`);
    }
    console.log(`   - Updated: ${cp.updatedAt.toISOString()}`);
    console.log('');
  }

  // Check for 'global' checkpoint specifically
  const globalCheckpoint = checkpoints.find((cp) => cp.key === 'global');
  if (globalCheckpoint) {
    console.log(`✅ Global checkpoint found: block ${globalCheckpoint.lastBlock.toLocaleString()}`);
    console.log(`   Follower should start from block ${(globalCheckpoint.lastBlock + 1).toLocaleString()}\n`);
  } else {
    console.log(`⚠️  No 'global' checkpoint found!`);
    console.log(`   Follower will use factory start blocks instead.\n`);
  }

  // Check max block in PositionEvent/PositionTransfer
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

  if (maxDataBlock > 0) {
    console.log(`📊 Max block in database:`);
    console.log(`   - PositionTransfer: ${maxTransferBlock?.blockNumber.toLocaleString() ?? 'N/A'}`);
    console.log(`   - PositionEvent: ${maxEventBlock?.blockNumber.toLocaleString() ?? 'N/A'}`);
    console.log(`   - Overall max: ${maxDataBlock.toLocaleString()}\n`);

    if (globalCheckpoint && globalCheckpoint.lastBlock < maxDataBlock) {
      console.log(`⚠️  WARNING: Global checkpoint (${globalCheckpoint.lastBlock.toLocaleString()}) is BEHIND max data block (${maxDataBlock.toLocaleString()})!`);
      console.log(`   This suggests checkpoint wasn't saved correctly during backfill.\n`);
    }
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

