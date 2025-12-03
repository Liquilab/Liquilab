/**
 * Verify lifetime positions coverage vs W3 Cross-DEX reference
 * 
 * GET /api/verify/lifetime-vs-w3
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// W3 Cross-DEX reference constants (Enosys + SparkDEX v3 on Flare)
const W3_POSITIONS = 74_857;
const W3_WALLETS = 8_594;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if MV exists and has data
    const mvExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_position_lifetime_v1'
      ) as exists
    `;

    if (!mvExists[0]?.exists) {
      return res.status(200).json({
        error: 'MV mv_position_lifetime_v1 does not exist',
        hint: 'Run POST /api/enrich/refresh-views to create it',
      });
    }

    // Query stats from MV
    const totalPositions = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT token_id) as count FROM "mv_position_lifetime_v1"
    `;

    const totalWallets = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT last_known_owner) as count 
      FROM "mv_position_lifetime_v1"
      WHERE last_known_owner IS NOT NULL
    `;

    const byDex = await prisma.$queryRaw<Array<{ dex: string; positions: bigint; wallets: bigint }>>`
      SELECT 
        dex,
        COUNT(DISTINCT token_id) as positions,
        COUNT(DISTINCT last_known_owner) as wallets
      FROM "mv_position_lifetime_v1"
      WHERE last_known_owner IS NOT NULL
      GROUP BY dex
      ORDER BY dex
    `;

    const positions = Number(totalPositions[0]?.count || 0);
    const wallets = Number(totalWallets[0]?.count || 0);

    const positionCoverage = W3_POSITIONS > 0 ? (positions / W3_POSITIONS) * 100 : 0;
    const walletCoverage = W3_WALLETS > 0 ? (wallets / W3_WALLETS) * 100 : 0;

    return res.status(200).json({
      liquilab: {
        positions,
        wallets,
      },
      w3Reference: {
        positions: W3_POSITIONS,
        wallets: W3_WALLETS,
      },
      coverage: {
        positions: `${positionCoverage.toFixed(2)}%`,
        wallets: `${walletCoverage.toFixed(2)}%`,
      },
      byDex: byDex.map(row => ({
        dex: row.dex,
        positions: Number(row.positions),
        wallets: Number(row.wallets),
      })),
      assessment: positionCoverage >= 95 && walletCoverage >= 95
        ? 'excellent'
        : positionCoverage >= 80 && walletCoverage >= 80
        ? 'good'
        : positionCoverage >= 50 && walletCoverage >= 50
        ? 'partial'
        : 'low',
    });
  } catch (error) {
    console.error('[lifetime-vs-w3] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}

