#!/usr/bin/env tsx

/**
 * Resolve Unknown Pool Events
 * 
 * This script fixes PositionEvents that have pool = 'unknown' by:
 * 1. Calling NFPM.positions(tokenId) to get token0, token1, fee
 * 2. Looking up the pool address in the Pool table
 * 3. Updating the PositionEvent with the correct pool address
 * 
 * Prerequisites: Run fix:backfill-pools first to ensure all pools are in the database.
 * 
 * Usage: npm run fix:resolve-unknown-pools
 */

// Load environment variables BEFORE any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { PrismaClient } from '@prisma/client';
import { createPublicClient, http, getAddress } from 'viem';
import { flare } from 'viem/chains';

const prisma = new PrismaClient();

// NFPM addresses
const NFPM_ADDRESSES = {
  enosys: '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657',
  sparkdex: '0xee5ff5bc5f852764b5584d92a4d592a53dc527da',
};

// Factory addresses (to match NFPM to factory)
const NFPM_TO_FACTORY: Record<string, string> = {
  '0xd9770b1c7a6ccd33c75b5bcb1c0078f46be46657': '0x17aa157ac8c54034381b840cb8f6bf7fc355f0de', // Enosys
  '0xee5ff5bc5f852764b5584d92a4d592a53dc527da': '0x8a2578d23d4c532cc9a98fad91c0523f5efde652', // SparkDEX
};

// NFPM ABI for positions() call
const NFPM_ABI = [
  {
    name: 'positions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
  },
] as const;

// Get RPC URL
function getRpcUrl(): string {
  const rpcUrl = process.env.FLARE_RPC_URL || process.env.FLARE_RPC_URLS?.split(',')[0];
  if (!rpcUrl) {
    throw new Error('FLARE_RPC_URL or FLARE_RPC_URLS must be set');
  }
  return rpcUrl;
}

// Create viem client
const client = createPublicClient({
  chain: flare,
  transport: http(getRpcUrl()),
});

// Cache for position data to avoid duplicate RPC calls
const positionCache = new Map<string, { token0: string; token1: string; fee: number } | null>();

// Get position data from NFPM
async function getPositionData(
  nfpmAddress: string,
  tokenId: string
): Promise<{ token0: string; token1: string; fee: number } | null> {
  const cacheKey = `${nfpmAddress}:${tokenId}`;
  
  if (positionCache.has(cacheKey)) {
    return positionCache.get(cacheKey) || null;
  }
  
  try {
    const result = await client.readContract({
      address: nfpmAddress as `0x${string}`,
      abi: NFPM_ABI,
      functionName: 'positions',
      args: [BigInt(tokenId)],
    });
    
    const data = {
      token0: getAddress(result[2]).toLowerCase(),
      token1: getAddress(result[3]).toLowerCase(),
      fee: Number(result[4]),
    };
    
    positionCache.set(cacheKey, data);
    return data;
  } catch (error) {
    // Position might have been burned
    positionCache.set(cacheKey, null);
    return null;
  }
}

// Build pool lookup table
async function buildPoolLookup(): Promise<Map<string, string>> {
  const pools = await prisma.pool.findMany({
    select: {
      address: true,
      token0: true,
      token1: true,
      fee: true,
      factory: true,
    },
  });
  
  const lookup = new Map<string, string>();
  
  for (const pool of pools) {
    // Create lookup key: factory:token0:token1:fee (sorted tokens)
    const [t0, t1] = [pool.token0.toLowerCase(), pool.token1.toLowerCase()].sort();
    const key = `${pool.factory?.toLowerCase()}:${t0}:${t1}:${pool.fee}`;
    lookup.set(key, pool.address.toLowerCase());
  }
  
  return lookup;
}

// Find pool address from position data
function findPoolAddress(
  poolLookup: Map<string, string>,
  nfpmAddress: string,
  token0: string,
  token1: string,
  fee: number
): string | null {
  const factory = NFPM_TO_FACTORY[nfpmAddress.toLowerCase()];
  if (!factory) return null;
  
  // Sort tokens for consistent lookup
  const [t0, t1] = [token0.toLowerCase(), token1.toLowerCase()].sort();
  const key = `${factory}:${t0}:${t1}:${fee}`;
  
  return poolLookup.get(key) || null;
}

// Main function
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           RESOLVE UNKNOWN POOL EVENTS');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Build pool lookup table
  console.log('\n📊 Building pool lookup table...');
  const poolLookup = await buildPoolLookup();
  console.log(`   Found ${poolLookup.size} pools`);
  
  // Get all unknown pool events
  console.log('\n🔍 Finding PositionEvents with unknown pool...');
  const unknownEvents = await prisma.positionEvent.findMany({
    where: {
      pool: 'unknown',
    },
    select: {
      id: true,
      tokenId: true,
      nfpmAddress: true,
      eventType: true,
    },
  });
  
  console.log(`   Found ${unknownEvents.length} events with unknown pool`);
  
  if (unknownEvents.length === 0) {
    console.log('\n✅ No unknown pool events to resolve!');
    return;
  }
  
  // Group by tokenId to reduce RPC calls
  const eventsByToken = new Map<string, typeof unknownEvents>();
  for (const event of unknownEvents) {
    const key = `${event.nfpmAddress}:${event.tokenId}`;
    if (!eventsByToken.has(key)) {
      eventsByToken.set(key, []);
    }
    eventsByToken.get(key)!.push(event);
  }
  
  console.log(`   Unique tokenIds: ${eventsByToken.size}`);
  
  // Process each unique tokenId
  console.log('\n📝 Resolving pool addresses...');
  let resolved = 0;
  let notFound = 0;
  let burned = 0;
  let errors = 0;
  
  const updateBatch: { id: string; pool: string }[] = [];
  let processed = 0;
  
  for (const [key, events] of eventsByToken) {
    processed++;
    const [nfpmAddress, tokenId] = key.split(':');
    
    try {
      // Get position data from NFPM
      const positionData = await getPositionData(nfpmAddress, tokenId);
      
      if (!positionData) {
        burned += events.length;
        continue;
      }
      
      // Find pool address
      const poolAddress = findPoolAddress(
        poolLookup,
        nfpmAddress,
        positionData.token0,
        positionData.token1,
        positionData.fee
      );
      
      if (poolAddress) {
        // Add to update batch
        for (const event of events) {
          updateBatch.push({ id: event.id, pool: poolAddress });
        }
        resolved += events.length;
      } else {
        notFound += events.length;
      }
      
      // Progress
      if (processed % 100 === 0) {
        process.stdout.write(`  Progress: ${processed}/${eventsByToken.size} tokens, ${resolved} resolved\r`);
      }
      
      // Batch update every 500 events
      if (updateBatch.length >= 500) {
        await prisma.$transaction(
          updateBatch.map(({ id, pool }) =>
            prisma.positionEvent.update({
              where: { id },
              data: { pool },
            })
          )
        );
        updateBatch.length = 0;
      }
    } catch (error) {
      errors += events.length;
    }
  }
  
  // Final batch update
  if (updateBatch.length > 0) {
    await prisma.$transaction(
      updateBatch.map(({ id, pool }) =>
        prisma.positionEvent.update({
          where: { id },
          data: { pool },
        })
      )
    );
  }
  
  console.log(`\n\n═══════════════════════════════════════════════════════════════`);
  console.log(`✅ Resolved: ${resolved} events`);
  console.log(`⚠️  Pool not found: ${notFound} events`);
  console.log(`🔥 Burned positions: ${burned} events`);
  console.log(`❌ Errors: ${errors} events`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  
  // Check remaining unknown
  const remainingUnknown = await prisma.positionEvent.count({
    where: { pool: 'unknown' },
  });
  console.log(`\n📊 Remaining unknown pool events: ${remainingUnknown}`);
  
  if (notFound > 0) {
    console.log('\n💡 Tip: Some pools may not be in the database yet.');
    console.log('   Run `npm run fix:backfill-pools` first, then re-run this script.');
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

