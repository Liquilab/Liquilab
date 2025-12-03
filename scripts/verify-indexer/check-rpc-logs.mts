#!/usr/bin/env tsx

/**
 * Check if RPC can find logs in recent blocks
 * Helps diagnose why indexer might not be finding logs
 */

import { createPublicClient, http } from 'viem';
import { flare } from 'viem/chains';
import { loadIndexerConfigFromEnv } from '../../indexer.config';

const config = loadIndexerConfigFromEnv();

const client = createPublicClient({
  chain: flare,
  transport: http(config.rpc.url, {
    timeout: 30000,
  }),
});

async function main() {
  console.log('🔍 Checking RPC for recent logs...\n');
  console.log(`RPC URL: ${config.rpc.url.replace(/\/\/.*@/, '//***@')}\n`);

  // Get latest block
  const latestBlock = await client.getBlockNumber();
  console.log(`📦 Latest block: ${Number(latestBlock).toLocaleString()}\n`);

  // Check last 25 blocks (Flare RPC limit is 30)
  const fromBlock = Number(latestBlock) - 25;
  const toBlock = Number(latestBlock) - 2; // Confirmation buffer

  console.log(`🔎 Scanning blocks ${fromBlock.toLocaleString()} → ${toBlock.toLocaleString()} (${toBlock - fromBlock + 1} blocks) for NFPM events...\n`);

  const npmAddresses = Array.isArray(config.contracts.npm) 
    ? config.contracts.npm 
    : [config.contracts.npm];

  for (const npmAddress of npmAddresses) {
    console.log(`📍 Checking NFPM: ${npmAddress}`);
    
    try {
      // Check Transfer events (ERC721)
      const transferLogs = await client.getLogs({
        address: npmAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', indexed: true, name: 'from' },
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: true, name: 'tokenId' },
          ],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      console.log(`   Transfer events: ${transferLogs.length}`);

      // Check IncreaseLiquidity events
      const increaseLogs = await client.getLogs({
        address: npmAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'IncreaseLiquidity',
          inputs: [
            { type: 'uint256', indexed: true, name: 'tokenId' },
            { type: 'uint128', indexed: false, name: 'liquidity' },
            { type: 'uint256', indexed: false, name: 'amount0' },
            { type: 'uint256', indexed: false, name: 'amount1' },
          ],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      console.log(`   IncreaseLiquidity events: ${increaseLogs.length}`);

      // Check DecreaseLiquidity events
      const decreaseLogs = await client.getLogs({
        address: npmAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'DecreaseLiquidity',
          inputs: [
            { type: 'uint256', indexed: true, name: 'tokenId' },
            { type: 'uint128', indexed: false, name: 'liquidity' },
            { type: 'uint256', indexed: false, name: 'amount0' },
            { type: 'uint256', indexed: false, name: 'amount1' },
          ],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      console.log(`   DecreaseLiquidity events: ${decreaseLogs.length}`);

      // Check Collect events
      const collectLogs = await client.getLogs({
        address: npmAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'Collect',
          inputs: [
            { type: 'uint256', indexed: true, name: 'tokenId' },
            { type: 'address', indexed: false, name: 'recipient' },
            { type: 'uint256', indexed: false, name: 'amount0' },
            { type: 'uint256', indexed: false, name: 'amount1' },
          ],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      console.log(`   Collect events: ${collectLogs.length}`);

      const total = transferLogs.length + increaseLogs.length + decreaseLogs.length + collectLogs.length;
      console.log(`   Total NFPM events: ${total}\n`);

      if (total > 0) {
        console.log(`   ✅ Found events! Latest block with events:`);
        const allLogs = [...transferLogs, ...increaseLogs, ...decreaseLogs, ...collectLogs];
        const latestEventBlock = Math.max(...allLogs.map(log => Number(log.blockNumber)));
        console.log(`      Block: ${latestEventBlock.toLocaleString()}\n`);
      } else {
        console.log(`   ⚠️  No events found in last 100 blocks\n`);
      }
    } catch (error) {
      console.error(`   ❌ Error scanning ${npmAddress}:`, error);
      console.log('');
    }
  }

  // Check factory events
  console.log('🏭 Checking Factory events...\n');
  for (const [factoryName, factoryAddress] of Object.entries(config.contracts.factories || {})) {
    console.log(`📍 Checking Factory: ${factoryName} (${factoryAddress})`);
    
    try {
      const poolCreatedLogs = await client.getLogs({
        address: factoryAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'PoolCreated',
          inputs: [
            { type: 'address', indexed: true, name: 'token0' },
            { type: 'address', indexed: true, name: 'token1' },
            { type: 'uint24', indexed: false, name: 'fee' },
            { type: 'int24', indexed: false, name: 'tickSpacing' },
            { type: 'address', indexed: false, name: 'pool' },
          ],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      console.log(`   PoolCreated events: ${poolCreatedLogs.length}\n`);
    } catch (error) {
      console.error(`   ❌ Error scanning factory:`, error);
      console.log('');
    }
  }

  console.log('✅ RPC check complete');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

