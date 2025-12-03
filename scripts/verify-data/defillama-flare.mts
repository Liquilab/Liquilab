#!/usr/bin/env tsx

/**
 * DeFiLlama vs LiquiLab TVL Comparison (Flare v3 DEXs)
 * 
 * Compares LiquiLab v3 TVL vs DeFiLlama protocol TVL for:
 *   - SparkDEX (v3 on Flare)
 *   - Enosys AMM V3 (on Flare)
 * 
 * W3 Reference Date: 2025-11-16
 * W3 LiquiLab TVL: $58.9M
 * 
 * DeFiLlama endpoints:
 *   - https://api.llama.fi/protocol/sparkdex
 *   - https://api.llama.fi/protocol/enosys-amm-v3
 * 
 * Usage: npm run verify:data:defillama:flare
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// W3 Reference (2025-11-16)
const W3_DATE = '2025-11-16';
const W3_LIQUILAB_TVL = 58_900_000;

// DeFiLlama protocol slugs
const DEFILLAMA_PROTOCOLS = [
  { slug: 'sparkdex', name: 'SparkDEX' },
  { slug: 'enosys-amm-v3', name: 'Enosys AMM V3' },
];

interface DefiLlamaProtocol {
  name: string;
  currentChainTvls?: Record<string, number>;
  chainTvls?: Record<string, { tvl: Array<{ date: number; totalLiquidityUSD: number }> }>;
  tvl?: number;
}

interface TvlData {
  protocol: string;
  flareTvl: number | null;
  totalTvl: number | null;
  error?: string;
}

async function fetchDefiLlamaTvl(slug: string): Promise<TvlData> {
  const url = `https://api.llama.fi/protocol/${slug}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { protocol: slug, flareTvl: null, totalTvl: null, error: `HTTP ${response.status}` };
    }

    const data: DefiLlamaProtocol = await response.json();
    
    // Get Flare-specific TVL from currentChainTvls
    let flareTvl: number | null = null;
    if (data.currentChainTvls && typeof data.currentChainTvls === 'object') {
      // Try different chain key formats
      const flareVal = data.currentChainTvls['Flare'] ?? data.currentChainTvls['flare'];
      flareTvl = typeof flareVal === 'number' ? flareVal : null;
    }

    // Get total TVL (it might be an array or number)
    let totalTvl: number | null = null;
    if (typeof data.tvl === 'number') {
      totalTvl = data.tvl;
    } else if (Array.isArray(data.tvl) && data.tvl.length > 0) {
      // If tvl is an array, get the last entry
      const lastEntry = data.tvl[data.tvl.length - 1];
      if (typeof lastEntry === 'object' && lastEntry !== null) {
        totalTvl = typeof lastEntry.totalLiquidityUSD === 'number' ? lastEntry.totalLiquidityUSD : null;
      }
    }

    return { protocol: slug, flareTvl, totalTvl };
  } catch (error) {
    return { 
      protocol: slug, 
      flareTvl: null, 
      totalTvl: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function getLiquiLabTvl(): Promise<number> {
  // TVL from mv_pool_latest_state (priced pools)
  const result = await prisma.$queryRaw<Array<{ tvl: number | null }>>`
    SELECT COALESCE(SUM(tvl_usd), 0)::float as tvl
    FROM mv_pool_latest_state
  `.catch(() => [{ tvl: 0 }]);
  
  return Number(result[0]?.tvl ?? 0);
}

function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPct(value: number | null, reference: number): string {
  if (value === null || reference === 0) return 'N/A';
  const pct = (value / reference) * 100;
  return `${pct.toFixed(1)}%`;
}

async function main() {
  console.log('\n=== DeFiLlama vs LiquiLab (Flare v3 DEXs: SparkDEX + Enosys V3) ===\n');

  // Fetch DeFiLlama data
  console.log('Fetching DeFiLlama protocol data...\n');
  const defiLlamaResults: TvlData[] = [];
  
  for (const { slug, name } of DEFILLAMA_PROTOCOLS) {
    const result = await fetchDefiLlamaTvl(slug);
    defiLlamaResults.push(result);
    
    if (result.error) {
      console.log(`  ⚠️  ${name}: Error - ${result.error}`);
    } else {
      console.log(`  ✅ ${name}: Flare TVL = ${formatUsd(result.flareTvl)}, Total = ${formatUsd(result.totalTvl)}`);
    }
  }

  // Sum up Flare TVL from all protocols
  const totalDefiLlamaFlareTvl = defiLlamaResults.reduce((sum, r) => {
    return sum + (r.flareTvl ?? 0);
  }, 0);

  // Get LiquiLab TVL
  const liquiLabTvl = await getLiquiLabTvl();

  console.log('\n' + '─'.repeat(60) + '\n');

  // W3 Reference (2025-11-16)
  console.log(`W3 (${W3_DATE})`);
  console.log(`  DeFiLlama v3 TVL (Flare):  ${formatUsd(null)} (historical not fetched)`);
  console.log(`  LiquiLab v3 TVL:           ${formatUsd(W3_LIQUILAB_TVL)}`);
  console.log(`  Coverage:                  N/A (need historical DeFiLlama data)`);
  console.log();

  // Current (W49)
  const currentDate = new Date().toISOString().split('T')[0];
  console.log(`W49 (${currentDate})`);
  console.log(`  DeFiLlama v3 TVL (Flare):  ${formatUsd(totalDefiLlamaFlareTvl || null)}`);
  console.log(`  LiquiLab v3 TVL:           ${formatUsd(liquiLabTvl)}`);
  
  if (totalDefiLlamaFlareTvl > 0) {
    const coverage = (liquiLabTvl / totalDefiLlamaFlareTvl) * 100;
    console.log(`  Coverage:                  ${coverage.toFixed(1)}%`);
  } else {
    console.log(`  Coverage:                  N/A (DeFiLlama data unavailable or zero)`);
  }
  console.log();

  // Per-protocol breakdown
  console.log('─'.repeat(60));
  console.log('\nPer-Protocol Breakdown (Current):\n');
  
  for (const result of defiLlamaResults) {
    const protocolInfo = DEFILLAMA_PROTOCOLS.find(p => p.slug === result.protocol);
    const name = protocolInfo?.name ?? result.protocol;
    
    console.log(`${name}:`);
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
    } else {
      console.log(`  Flare TVL:  ${formatUsd(result.flareTvl)}`);
      console.log(`  Total TVL:  ${formatUsd(result.totalTvl)}`);
      if (result.flareTvl !== null && result.totalTvl !== null && result.totalTvl > 0) {
        const flareShare = (result.flareTvl / result.totalTvl) * 100;
        console.log(`  Flare %:    ${flareShare.toFixed(1)}% of total`);
      }
    }
    console.log();
  }

  // Summary
  console.log('=== Summary ===\n');
  
  if (totalDefiLlamaFlareTvl > 0 && liquiLabTvl > 0) {
    const coverage = (liquiLabTvl / totalDefiLlamaFlareTvl) * 100;
    if (coverage >= 90) {
      console.log('✅ LiquiLab TVL coverage is excellent (≥90% of DeFiLlama)');
    } else if (coverage >= 70) {
      console.log('⚠️  LiquiLab TVL coverage is good (≥70% of DeFiLlama)');
    } else if (coverage >= 50) {
      console.log('⚠️  LiquiLab TVL coverage is partial (≥50% of DeFiLlama)');
    } else {
      console.log('❌ LiquiLab TVL coverage is low (<50% of DeFiLlama)');
    }
  } else if (liquiLabTvl > 0) {
    console.log('⚠️  Cannot compare: DeFiLlama Flare data unavailable');
    console.log(`   LiquiLab v3 TVL: ${formatUsd(liquiLabTvl)}`);
  } else {
    console.log('❌ No TVL data available from either source');
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

