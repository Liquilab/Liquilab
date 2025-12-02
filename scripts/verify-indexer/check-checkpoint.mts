#!/usr/bin/env tsx

/**
 * Verify checkpoint status for indexer
 * Shows all checkpoints and helps diagnose why follower might start at wrong block
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking indexer checkpoints...\n');

  // Get all NPM and FACTORY checkpoints
  const [npmCheckpoints, factoryCheckpoints] = await Promise.all([
    prisma.syncCheckpoint.findMany({
      where: { source: 'NPM' },
      orderBy: { lastBlock: 'desc' },
    }),
    prisma.syncCheckpoint.findMany({
      where: { source: 'FACTORY' },
      orderBy: { lastBlock: 'desc' },
    }),
  ]);

  console.log(`📦 NPM Checkpoints (${npmCheckpoints.length}):\n`);
  if (npmCheckpoints.length === 0) {
    console.log('   ❌ No NPM checkpoints found');
  } else {
    for (const cp of npmCheckpoints) {
      console.log(`   📍 ${cp.key}:`);
      console.log(`      - Block: ${cp.lastBlock.toLocaleString()}`);
      console.log(`      - Events: ${cp.eventsCount.toLocaleString()}`);
      if (cp.lastTimestamp) {
        const date = new Date(cp.lastTimestamp * 1000);
        console.log(`      - Timestamp: ${date.toISOString()}`);
      }
      console.log(`      - Updated: ${cp.updatedAt.toISOString()}`);
      console.log('');
    }
  }

  console.log(`🏭 FACTORY Checkpoints (${factoryCheckpoints.length}):\n`);
  if (factoryCheckpoints.length === 0) {
    console.log('   ❌ No FACTORY checkpoints found');
    console.log('   ⚠️  Factory indexing will fall back to factory start blocks (48.5M)\n');
  } else {
    for (const cp of factoryCheckpoints) {
      console.log(`   📍 ${cp.key}:`);
      console.log(`      - Block: ${cp.lastBlock.toLocaleString()}`);
      console.log(`      - Events: ${cp.eventsCount.toLocaleString()}`);
      if (cp.lastTimestamp) {
        const date = new Date(cp.lastTimestamp * 1000);
        console.log(`      - Timestamp: ${date.toISOString()}`);
      }
      console.log(`      - Updated: ${cp.updatedAt.toISOString()}`);
      console.log('');
    }
  }

  // Check for 'global' checkpoint specifically
  const globalCheckpoint = npmCheckpoints.find((cp) => cp.key === 'global');
  if (globalCheckpoint) {
    console.log(`✅ NPM:global checkpoint found: block ${globalCheckpoint.lastBlock.toLocaleString()}`);
    console.log(`   NFPM indexing will start from block ${(globalCheckpoint.lastBlock + 1).toLocaleString()}\n`);
  } else {
    console.log(`⚠️  No NPM:global checkpoint found!`);
    console.log(`   NFPM indexing will use factory start blocks instead.\n`);
  }

  // Check for factory checkpoints
  const enosysFactoryCheckpoint = factoryCheckpoints.find((cp) => cp.key === 'enosys');
  const sparkdexFactoryCheckpoint = factoryCheckpoints.find((cp) => cp.key === 'sparkdex');
  
  if (!enosysFactoryCheckpoint || !sparkdexFactoryCheckpoint) {
    console.log(`⚠️  Missing FACTORY checkpoints:`);
    if (!enosysFactoryCheckpoint) console.log(`   - FACTORY:enosys missing`);
    if (!sparkdexFactoryCheckpoint) console.log(`   - FACTORY:sparkdex missing`);
    console.log(`   Factory indexing will fall back to factory start blocks (48.5M)\n`);
  } else {
    console.log(`✅ FACTORY checkpoints found:`);
    console.log(`   - FACTORY:enosys: block ${enosysFactoryCheckpoint.lastBlock.toLocaleString()}`);
    console.log(`   - FACTORY:sparkdex: block ${sparkdexFactoryCheckpoint.lastBlock.toLocaleString()}\n`);
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

