#!/usr/bin/env tsx

/**
 * PoolState Backfill
 * 
 * Initializes PoolState table with current on-chain reserves for all known v3 pools.
 * Reads token balances directly from the pool contract (most reliable SSoT).
 */

import { PrismaClient } from '@prisma/client';
import { publicClient } from '../src/lib/onchain/client';
import { readTokenBalance } from '../src/lib/onchain/readers';
import { indexerConfig } from '../indexer.config';
import { type Address } from 'viem';

const prisma = new PrismaClient();

/**
 * Map factory address to DEX name
 */
function factoryToDex(factory: string): string {
  const factoryLower = factory.toLowerCase();
  if (factoryLower === indexerConfig.contracts.factories.enosys.toLowerCase()) {
    return 'enosys-v3';
  }
  if (factoryLower === indexerConfig.contracts.factories.sparkdex.toLowerCase()) {
    return 'sparkdex-v3';
  }
  return 'other';
}

/**
 * Read current reserves from on-chain pool contract
 */
async function readReservesFromChain(
  poolAddress: Address,
  token0Address: Address,
  token1Address: Address
): Promise<{ reserve0: bigint; reserve1: bigint; blockNumber: bigint } | null> {
  try {
    const [reserve0, reserve1, blockNumber] = await Promise.all([
      readTokenBalance(token0Address, poolAddress),
      readTokenBalance(token1Address, poolAddress),
      publicClient.getBlockNumber(),
    ]);

    if (reserve0 === null || reserve1 === null) {
      console.error(`[POOLSTATE_BACKFILL] Failed to read reserves for ${poolAddress}`);
      return null;
    }

    return {
      reserve0,
      reserve1,
      blockNumber,
    };
  } catch (error) {
    console.error(`[POOLSTATE_BACKFILL] Error reading reserves for ${poolAddress}:`, error);
    return null;
  }
}

async function backfillPoolState() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         POOLSTATE BACKFILL - ON-CHAIN RESERVES                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Fetch all known v3 pools
  const pools = await prisma.pool.findMany({
    where: {
      factory: {
        in: [
          indexerConfig.contracts.factories.enosys.toLowerCase(),
          indexerConfig.contracts.factories.sparkdex.toLowerCase(),
        ],
      },
    },
  });

  console.log(`📊 Found ${pools.length} pools to backfill`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const poolAddress = pool.address.toLowerCase() as Address;
    const token0Address = pool.token0.toLowerCase() as Address;
    const token1Address = pool.token1.toLowerCase() as Address;
    const dex = factoryToDex(pool.factory);

    console.log(`[${i + 1}/${pools.length}] Processing ${poolAddress} (${dex})...`);

    const reserves = await readReservesFromChain(poolAddress, token0Address, token1Address);

    if (!reserves) {
      console.log(`  ⚠️  Skipped (failed to read reserves)`);
      skippedCount++;
      continue;
    }

    if (reserves.reserve0 === 0n && reserves.reserve1 === 0n) {
      console.log(`  ⚠️  Skipped (zero reserves)`);
      skippedCount++;
      continue;
    }

    try {
      await prisma.poolState.upsert({
        where: { poolAddress: poolAddress.toLowerCase() },
        update: {
          dex,
          token0Address: token0Address.toLowerCase(),
          token1Address: token1Address.toLowerCase(),
          reserve0Raw: reserves.reserve0.toString(),
          reserve1Raw: reserves.reserve1.toString(),
          lastBlockNumber: reserves.blockNumber,
          updatedAt: new Date(),
        },
        create: {
          poolAddress: poolAddress.toLowerCase(),
          dex,
          token0Address: token0Address.toLowerCase(),
          token1Address: token1Address.toLowerCase(),
          reserve0Raw: reserves.reserve0.toString(),
          reserve1Raw: reserves.reserve1.toString(),
          lastBlockNumber: reserves.blockNumber,
          updatedAt: new Date(),
        },
      });

      console.log(
        `  ✅ Updated: reserve0=${reserves.reserve0.toString()}, reserve1=${reserves.reserve1.toString()}, block=${reserves.blockNumber}`
      );
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error upserting PoolState:`, error);
      errorCount++;
    }

    // Small delay to avoid RPC rate limits
    if (i < pools.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    BACKFILL COMPLETE                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⚠️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('');
}

backfillPoolState()
  .catch((error) => {
    console.error('[POOLSTATE_BACKFILL] Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

