#!/usr/bin/env tsx

/**
 * Backfill Missing Pools
 * 
 * This script:
 * 1. Fetches ALL PoolCreated events from both factory contracts
 * 2. Adds any missing pools to the Pool table
 * 3. Enriches them with token metadata (symbol, decimals)
 * 
 * Usage: npm run fix:backfill-pools
 */

// Load environment variables BEFORE any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { PrismaClient } from '@prisma/client';
import { createPublicClient, http, parseAbiItem, getAddress } from 'viem';
import { flare } from 'viem/chains';

const prisma = new PrismaClient();

// Factory addresses
const FACTORIES = {
  enosys: '0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de',
  sparkdex: '0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652',
};

// Factory start blocks (when they were deployed)
const FACTORY_START_BLOCKS = {
  enosys: 25_000_000n,   // Approximate
  sparkdex: 30_000_000n, // Approximate
};

// PoolCreated event signature
const POOL_CREATED_EVENT = parseAbiItem(
  'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'
);

// ERC20 ABI for token metadata
const ERC20_ABI = [
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
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

interface PoolData {
  address: string;
  token0: string;
  token1: string;
  fee: number;
  factory: string;
  factoryName: string;
  blockNumber: number;
  txHash: string;
}

interface TokenMetadata {
  symbol: string;
  decimals: number;
}

// Fetch token metadata
async function getTokenMetadata(tokenAddress: string): Promise<TokenMetadata> {
  try {
    const [symbol, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);
    return { symbol: symbol as string, decimals: Number(decimals) };
  } catch (error) {
    console.warn(`⚠️  Failed to get metadata for ${tokenAddress}:`, error);
    return { symbol: 'UNKNOWN', decimals: 18 };
  }
}

// Fetch all PoolCreated events from a factory
async function fetchPoolsFromFactory(
  factoryName: string,
  factoryAddress: string,
  fromBlock: bigint
): Promise<PoolData[]> {
  console.log(`\n📡 Fetching pools from ${factoryName} factory (${factoryAddress})...`);
  
  const currentBlock = await client.getBlockNumber();
  const pools: PoolData[] = [];
  
  // Fetch in chunks to avoid RPC limits
  const CHUNK_SIZE = 10_000n;
  let from = fromBlock;
  
  while (from < currentBlock) {
    const to = from + CHUNK_SIZE > currentBlock ? currentBlock : from + CHUNK_SIZE;
    
    try {
      const logs = await client.getLogs({
        address: factoryAddress as `0x${string}`,
        event: POOL_CREATED_EVENT,
        fromBlock: from,
        toBlock: to,
      });
      
      for (const log of logs) {
        if (log.args.pool && log.args.token0 && log.args.token1 && log.args.fee !== undefined) {
          pools.push({
            address: getAddress(log.args.pool).toLowerCase(),
            token0: getAddress(log.args.token0).toLowerCase(),
            token1: getAddress(log.args.token1).toLowerCase(),
            fee: Number(log.args.fee),
            factory: factoryAddress.toLowerCase(),
            factoryName,
            blockNumber: Number(log.blockNumber || 0),
            txHash: log.transactionHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
          });
        }
      }
      
      if (logs.length > 0) {
        process.stdout.write(`  ${factoryName}: ${pools.length} pools found (block ${from}→${to})\r`);
      }
    } catch (error) {
      console.warn(`⚠️  Error fetching logs ${from}→${to}:`, error);
    }
    
    from = to + 1n;
  }
  
  console.log(`  ✅ ${factoryName}: ${pools.length} total pools found`);
  return pools;
}

// Main function
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        BACKFILL MISSING POOLS FROM FACTORY CONTRACTS');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Get existing pools
  const existingPools = await prisma.pool.findMany({
    select: { address: true },
  });
  const existingAddresses = new Set(existingPools.map(p => p.address.toLowerCase()));
  console.log(`\n📊 Existing pools in database: ${existingAddresses.size}`);
  
  // Fetch pools from both factories
  const allPools: PoolData[] = [];
  
  for (const [name, address] of Object.entries(FACTORIES)) {
    const startBlock = FACTORY_START_BLOCKS[name as keyof typeof FACTORY_START_BLOCKS];
    const pools = await fetchPoolsFromFactory(name, address, startBlock);
    allPools.push(...pools);
  }
  
  // Filter out existing pools
  const newPools = allPools.filter(p => !existingAddresses.has(p.address));
  console.log(`\n🆕 New pools to add: ${newPools.length}`);
  
  if (newPools.length === 0) {
    console.log('\n✅ No new pools to add. Database is up to date.');
    return;
  }
  
  // Check for stXRP pools specifically
  const STXRP_ADDRESS = '0xffed33d28ca65e52e927849f456d8e820b324508';
  const stxrpPools = newPools.filter(
    p => p.token0 === STXRP_ADDRESS || p.token1 === STXRP_ADDRESS
  );
  if (stxrpPools.length > 0) {
    console.log(`\n🎯 Found ${stxrpPools.length} stXRP pools!`);
  }
  
  // Add new pools with metadata
  console.log('\n📝 Adding new pools with token metadata...');
  let added = 0;
  let errors = 0;
  
  for (const pool of newPools) {
    try {
      // Get token metadata
      const [token0Meta, token1Meta] = await Promise.all([
        getTokenMetadata(pool.token0),
        getTokenMetadata(pool.token1),
      ]);
      
      await prisma.pool.create({
        data: {
          address: pool.address,
          token0: pool.token0,
          token1: pool.token1,
          fee: pool.fee,
          factory: pool.factory,
          token0Symbol: token0Meta.symbol,
          token1Symbol: token1Meta.symbol,
          token0Decimals: token0Meta.decimals,
          token1Decimals: token1Meta.decimals,
          blockNumber: pool.blockNumber,
          txHash: pool.txHash,
        },
      });
      
      added++;
      process.stdout.write(`  Added: ${added}/${newPools.length} (${token0Meta.symbol}/${token1Meta.symbol})\r`);
    } catch (error) {
      errors++;
      const err = error as Error;
      if (!err.message?.includes('Unique constraint')) {
        console.warn(`\n⚠️  Error adding pool ${pool.address}:`, err.message);
      }
    }
  }
  
  console.log(`\n\n═══════════════════════════════════════════════════════════════`);
  console.log(`✅ Added: ${added} pools`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  
  // Verify stXRP pools
  const stxrpCheck = await prisma.pool.findMany({
    where: {
      OR: [
        { token0: { contains: 'ffed33d28ca65e52e927849f456d8e820b324508', mode: 'insensitive' } },
        { token1: { contains: 'ffed33d28ca65e52e927849f456d8e820b324508', mode: 'insensitive' } },
      ],
    },
  });
  
  if (stxrpCheck.length > 0) {
    console.log(`\n🎯 stXRP pools now in database: ${stxrpCheck.length}`);
    stxrpCheck.forEach(p => {
      console.log(`   - ${p.address}: ${p.token0Symbol}/${p.token1Symbol}`);
    });
  } else {
    console.log('\n⚠️  No stXRP pools found. They may not exist on-chain yet.');
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

