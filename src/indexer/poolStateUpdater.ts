/**
 * PoolState Updater
 * 
 * Keeps PoolState table in sync with on-chain pool reserves.
 * Called after pool events are indexed to refresh reserves.
 */

import { PrismaClient } from '@prisma/client';
import { publicClient } from '../lib/onchain/client';
import { readTokenBalance } from '../lib/onchain/readers';
import { indexerConfig } from '../../indexer.config';
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
 * Update PoolState for a single pool from on-chain reserves
 */
export async function updatePoolState(poolAddress: string): Promise<boolean> {
  try {
    const pool = await prisma.pool.findUnique({
      where: { address: poolAddress.toLowerCase() },
    });

    if (!pool) {
      console.warn(`[POOLSTATE] Pool not found: ${poolAddress}`);
      return false;
    }

    const poolAddr = pool.address.toLowerCase() as Address;
    const token0Addr = pool.token0.toLowerCase() as Address;
    const token1Addr = pool.token1.toLowerCase() as Address;
    const dex = factoryToDex(pool.factory);

    const [reserve0, reserve1, blockNumber] = await Promise.all([
      readTokenBalance(token0Addr, poolAddr),
      readTokenBalance(token1Addr, poolAddr),
      publicClient.getBlockNumber(),
    ]);

    if (reserve0 === null || reserve1 === null) {
      console.warn(`[POOLSTATE] Failed to read reserves for ${poolAddress}`);
      return false;
    }

    await prisma.poolState.upsert({
      where: { poolAddress: poolAddr },
      update: {
        dex,
        token0Address: token0Addr,
        token1Address: token1Addr,
        reserve0Raw: reserve0.toString(),
        reserve1Raw: reserve1.toString(),
        lastBlockNumber: blockNumber,
        updatedAt: new Date(),
      },
      create: {
        poolAddress: poolAddr,
        dex,
        token0Address: token0Addr,
        token1Address: token1Addr,
        reserve0Raw: reserve0.toString(),
        reserve1Raw: reserve1.toString(),
        lastBlockNumber: blockNumber,
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error(`[POOLSTATE] Error updating pool state for ${poolAddress}:`, error);
    return false;
  }
}

/**
 * Update PoolState for multiple pools (batch)
 * Only updates pools that had events in the processed range
 */
export async function updatePoolStatesForPools(
  poolAddresses: string[],
  options: { batchSize?: number; delayMs?: number } = {}
): Promise<{ updated: number; failed: number }> {
  const { batchSize = 10, delayMs = 100 } = options;
  const uniquePools = Array.from(new Set(poolAddresses.map((p) => p.toLowerCase())));
  
  let updated = 0;
  let failed = 0;

  // Process in batches to avoid RPC rate limits
  for (let i = 0; i < uniquePools.length; i += batchSize) {
    const batch = uniquePools.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((poolAddress) => updatePoolState(poolAddress))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        updated++;
      } else {
        failed++;
      }
    }

    // Small delay between batches
    if (i + batchSize < uniquePools.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { updated, failed };
}

