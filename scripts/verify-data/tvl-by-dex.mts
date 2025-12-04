#!/usr/bin/env tsx

/**
 * TVL by DEX Diagnostic Verifier
 * 
 * Breaks down TVL per DEX (SparkDEX v3 vs Enosys v3) and shows top pools.
 * Used to reconcile LiquiLab TVL with SparkDEX/Enosys UI and DeFiLlama.
 * 
 * Uses existing SSoT: mv_pool_liquidity, Pool, tokenPriceService, pricingUniverse.
 * 
 * SparkDEX v3.1 Analytics reference: ~$62.4M TVL
 * W3 Cross-DEX reference: $58.9M TVL (combined)
 * 
 * Usage: npm run verify:data:tvl-by-dex
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first, then .env as fallback
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { isInPricingUniverse } from '../../config/token-pricing.config';
import { getTokenPriceUsd } from '../../src/services/tokenPriceService';

const prisma = new PrismaClient();

// W3 Cross-DEX reference
const W3_TVL_USD = 58_900_000;

// SparkDEX Analytics reference (as reported on their UI)
const SPARKDEX_ANALYTICS_TVL_USD = 62_400_000;

interface PoolLiquidityRow {
  pool_address: string;
  dex: string;
  token0_address: string;
  token1_address: string;
  token0_symbol: string | null;
  token1_symbol: string | null;
  token0_decimals: number | null;
  token1_decimals: number | null;
  amount0_raw: string;
  amount1_raw: string;
  positions_count: bigint;
  last_event_ts: number;
}

interface PoolTvlInfo {
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  dex: string;
  tvlUsd: number;
  isPriced: boolean;
  unpricedReason?: string;
}

interface DexStats {
  dex: string;
  tvlUsd: number;
  pricedPoolsCount: number;
  unpricedPoolsCount: number;
  pools: PoolTvlInfo[];
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPct(value: number, reference: number): string {
  if (reference === 0) return 'N/A';
  const pct = (value / reference) * 100;
  return `${pct.toFixed(1)}%`;
}

async function computeTvlByDex(): Promise<Map<string, DexStats>> {
  const dexStats = new Map<string, DexStats>();

  // Check if mv_pool_liquidity exists
  const mvExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_pool_liquidity'
    ) as exists
  `;

  if (!mvExists[0]?.exists) {
    console.log('⚠️  mv_pool_liquidity does not exist. Run npm run db:mvs:create && npm run db:mvs:refresh:7d');
    return dexStats;
  }

  // Query all pools from mv_pool_liquidity
  const liquidityRows = await prisma.$queryRaw<PoolLiquidityRow[]>`
    SELECT 
      pool_address,
      dex,
      token0_address,
      token1_address,
      token0_symbol,
      token1_symbol,
      token0_decimals,
      token1_decimals,
      amount0_raw::text,
      amount1_raw::text,
      positions_count,
      last_event_ts
    FROM "mv_pool_liquidity"
    ORDER BY dex, pool_address
  `;

  console.log(`[TVL-BY-DEX] Found ${liquidityRows.length} pools in mv_pool_liquidity\n`);

  for (const row of liquidityRows) {
    const dex = row.dex || 'unknown';
    
    // Initialize DEX stats if not present
    if (!dexStats.has(dex)) {
      dexStats.set(dex, {
        dex,
        tvlUsd: 0,
        pricedPoolsCount: 0,
        unpricedPoolsCount: 0,
        pools: [],
      });
    }

    const stats = dexStats.get(dex)!;
    const symbol0 = row.token0_symbol || '';
    const symbol1 = row.token1_symbol || '';
    const decimals0 = row.token0_decimals ?? 18;
    const decimals1 = row.token1_decimals ?? 18;

    let isPriced = false;
    let tvlUsd = 0;
    let unpricedReason: string | undefined;

    // Check if symbols are present
    if (!symbol0 || !symbol1) {
      unpricedReason = 'missing symbol';
    } else {
      // Check if both tokens are in pricing universe
      const inUniverse0 = isInPricingUniverse(symbol0);
      const inUniverse1 = isInPricingUniverse(symbol1);

      if (!inUniverse0 && !inUniverse1) {
        unpricedReason = `${symbol0} + ${symbol1} not in universe`;
      } else if (!inUniverse0) {
        unpricedReason = `${symbol0} not in universe`;
      } else if (!inUniverse1) {
        unpricedReason = `${symbol1} not in universe`;
      } else {
        // Both tokens in universe - try to get prices
        const price0 = await getTokenPriceUsd(symbol0, row.token0_address);
        const price1 = await getTokenPriceUsd(symbol1, row.token1_address);

        if (price0 === null && price1 === null) {
          unpricedReason = `no price for ${symbol0} + ${symbol1}`;
        } else if (price0 === null) {
          unpricedReason = `no price for ${symbol0}`;
        } else if (price1 === null) {
          unpricedReason = `no price for ${symbol1}`;
        } else {
          // Both have prices - compute TVL
          isPriced = true;

          const amount0Raw = BigInt(row.amount0_raw || '0');
          const amount1Raw = BigInt(row.amount1_raw || '0');

          const amount0 = Number(amount0Raw) / Math.pow(10, decimals0);
          const amount1 = Number(amount1Raw) / Math.pow(10, decimals1);

          tvlUsd = amount0 * price0 + amount1 * price1;
        }
      }
    }

    // Update DEX stats
    if (isPriced) {
      stats.pricedPoolsCount++;
      stats.tvlUsd += tvlUsd;
    } else {
      stats.unpricedPoolsCount++;
    }

    // Add to pools list
    stats.pools.push({
      poolAddress: row.pool_address,
      token0Symbol: symbol0 || '?',
      token1Symbol: symbol1 || '?',
      dex,
      tvlUsd,
      isPriced,
      unpricedReason,
    });
  }

  // Sort pools by TVL descending within each DEX
  for (const stats of dexStats.values()) {
    stats.pools.sort((a, b) => b.tvlUsd - a.tvlUsd);
  }

  return dexStats;
}

async function main() {
  console.log('\n=== TVL by DEX (pricingUniverse only) ===\n');

  const dexStats = await computeTvlByDex();

  if (dexStats.size === 0) {
    console.log('No data available. Ensure mv_pool_liquidity is populated.');
    return;
  }

  let globalTvl = 0;
  let globalPricedPools = 0;
  let globalUnpricedPools = 0;

  // Process SparkDEX first (larger), then Enosys
  const orderedDexes = ['sparkdex-v3', 'enosys-v3', 'unknown'];

  for (const dexName of orderedDexes) {
    const stats = dexStats.get(dexName);
    if (!stats) continue;

    globalTvl += stats.tvlUsd;
    globalPricedPools += stats.pricedPoolsCount;
    globalUnpricedPools += stats.unpricedPoolsCount;

    const displayName = dexName === 'sparkdex-v3' ? 'SparkDEX v3' :
                       dexName === 'enosys-v3' ? 'Enosys v3' : 
                       'Unknown DEX';

    console.log(`${displayName}:`);
    console.log(`  TVL (priced):     ${formatUsd(stats.tvlUsd)}`);
    console.log(`  Priced pools:     ${stats.pricedPoolsCount}`);
    console.log(`  Unpriced pools:   ${stats.unpricedPoolsCount}`);

    // Show comparison for SparkDEX
    if (dexName === 'sparkdex-v3') {
      console.log(`  SparkDEX UI ref:  ${formatUsd(SPARKDEX_ANALYTICS_TVL_USD)}`);
      console.log(`  Coverage:         ${formatPct(stats.tvlUsd, SPARKDEX_ANALYTICS_TVL_USD)}`);
    }

    // Top pools for SparkDEX (20) and Enosys (10)
    const topN = dexName === 'sparkdex-v3' ? 20 : 10;
    const topPools = stats.pools.slice(0, topN);

    console.log(`\n  Top ${topPools.length} pools by TVL:`);
    console.log('  ─'.repeat(40));
    
    for (let i = 0; i < topPools.length; i++) {
      const pool = topPools[i];
      const pricedFlag = pool.isPriced ? 'PRICED' : `UNPRICED (${pool.unpricedReason})`;
      const tvlStr = pool.isPriced ? formatUsd(pool.tvlUsd) : '-';
      const poolShort = pool.poolAddress.slice(0, 10) + '...';
      console.log(`  ${String(i + 1).padStart(2)}. ${pool.token0Symbol}/${pool.token1Symbol}`.padEnd(25) + 
                  `${poolShort}  TVL=${tvlStr.padEnd(10)} ${pricedFlag}`);
    }

    // Show some unpriced pools for debugging
    const unpricedPools = stats.pools.filter(p => !p.isPriced).slice(0, 5);
    if (unpricedPools.length > 0 && stats.unpricedPoolsCount > 0) {
      console.log(`\n  Sample unpriced pools (${stats.unpricedPoolsCount} total):`);
      for (const pool of unpricedPools) {
        console.log(`    - ${pool.token0Symbol}/${pool.token1Symbol}: ${pool.unpricedReason}`);
      }
    }

    console.log('\n');
  }

  // Global summary
  console.log('═'.repeat(60));
  console.log('Global TVL Summary (priced pools only):\n');
  console.log(`  LiquiLab total:   ${formatUsd(globalTvl)}`);
  console.log(`  W3 reference:     ${formatUsd(W3_TVL_USD)}`);
  console.log(`  Coverage vs W3:   ${formatPct(globalTvl, W3_TVL_USD)}`);
  console.log();
  console.log(`  Total pools:      ${globalPricedPools + globalUnpricedPools}`);
  console.log(`    Priced:         ${globalPricedPools}`);
  console.log(`    Unpriced:       ${globalUnpricedPools}`);
  console.log('═'.repeat(60));

  // Interpretation
  console.log('\n=== Interpretation ===\n');
  
  const sparkStats = dexStats.get('sparkdex-v3');
  if (sparkStats) {
    const diff = SPARKDEX_ANALYTICS_TVL_USD - sparkStats.tvlUsd;
    if (diff > 1_000_000) {
      console.log(`⚠️  SparkDEX TVL gap: ${formatUsd(diff)} vs their analytics UI.`);
      console.log('   Possible causes:');
      console.log('   - Unpriced pools (tokens not in pricingUniverse)');
      console.log('   - Price differences (FTSO/CG vs SparkDEX oracle)');
      console.log('   - Missing pool data (mv_pool_liquidity not up-to-date)');
    } else if (diff < -1_000_000) {
      console.log(`✅ SparkDEX TVL is ${formatUsd(-diff)} HIGHER than their analytics UI.`);
      console.log('   Our pricing may be more aggressive or data more complete.');
    } else {
      console.log(`✅ SparkDEX TVL is within ~$1M of their analytics UI.`);
    }
  }

  console.log();
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

