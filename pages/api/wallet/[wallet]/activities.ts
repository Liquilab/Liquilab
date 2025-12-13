import type { NextApiRequest, NextApiResponse } from 'next';
import { getPositionEventsByWallet } from '@/lib/data/positionEvents';
import { db } from '@/store/prisma';
import { PositionEventType } from '@prisma/client';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/i;

interface DayActivity {
  date: string; // YYYY-MM-DD format
  count: number;
  events: {
    type: 'added' | 'removed' | 'claimed' | 'rebalanced' | 'rflr';
    pool: string;
    tokenId: string;
    amount?: string;
  }[];
}

interface ActivitiesResponse {
  success: boolean;
  data?: {
    activities: DayActivity[];
    totalActivities: number;
  };
  error?: string;
}

/**
 * Maps PositionEventType to ActivityCalendar event type
 */
function mapEventType(eventType: PositionEventType): 'added' | 'removed' | 'claimed' | 'rebalanced' | 'rflr' {
  switch (eventType) {
    case PositionEventType.MINT:
    case PositionEventType.INCREASE:
      return 'added';
    case PositionEventType.DECREASE:
    case PositionEventType.BURN:
      return 'removed';
    case PositionEventType.COLLECT:
      return 'claimed';
    case PositionEventType.SWAP:
      return 'rebalanced';
    default:
      return 'added';
  }
}

/**
 * Formats amount for display
 */
function formatAmount(usdValue?: number | null, amount0?: string | null, amount1?: string | null): string | undefined {
  if (usdValue && usdValue > 0) {
    return `$${usdValue.toFixed(2)}`;
  }
  // Could format token amounts here if needed
  return undefined;
}

/**
 * Gets pool label from address
 */
async function getPoolLabel(poolAddress: string): Promise<string> {
  try {
    const pool = await db.pool.findUnique({
      where: { address: poolAddress.toLowerCase() },
      select: { token0Symbol: true, token1Symbol: true },
    });
    
    if (pool?.token0Symbol && pool?.token1Symbol) {
      return `${pool.token0Symbol}/${pool.token1Symbol}`;
    }
  } catch (error) {
    console.error(`[api/wallet/activities] Error fetching pool ${poolAddress}:`, error);
  }
  
  // Fallback: return shortened address
  return `${poolAddress.substring(0, 6)}...${poolAddress.substring(38)}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActivitiesResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const walletParam = Array.isArray(req.query.wallet) ? req.query.wallet[0] : req.query.wallet;
  
  if (!walletParam || typeof walletParam !== 'string' || !ADDRESS_REGEX.test(walletParam)) {
    res.status(400).json({ success: false, error: 'Invalid wallet address' });
    return;
  }

  const walletAddress = walletParam.toLowerCase();

  try {
    // Calculate date range: last year
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const fromTimestamp = Math.floor(oneYearAgo.getTime() / 1000);
    const toTimestamp = Math.floor(today.getTime() / 1000);

    // Fetch all position events for this wallet in the last year
    // Note: We fetch without limit to get all events, then group by date
    // In production, you might want to paginate or use a more efficient query
    const events = await getPositionEventsByWallet(walletAddress, {
      fromTimestamp,
      toTimestamp,
      limit: 10000, // Large limit to get all events
    });

    // Group events by date (YYYY-MM-DD)
    const eventsByDate = new Map<string, typeof events>();
    
    for (const event of events) {
      const eventDate = new Date(event.timestamp * 1000);
      const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    }

    // Convert to DayActivity format
    const activities: DayActivity[] = [];
    
    // Fetch pool labels in batch (could be optimized further)
    const poolAddresses = new Set(events.map(e => e.pool));
    const poolLabelsMap = new Map<string, string>();
    
    await Promise.all(
      Array.from(poolAddresses).map(async (poolAddr) => {
        const label = await getPoolLabel(poolAddr);
        poolLabelsMap.set(poolAddr.toLowerCase(), label);
      })
    );

    for (const [date, dateEvents] of eventsByDate.entries()) {
      const dayEvents = dateEvents.map(event => ({
        type: mapEventType(event.eventType),
        pool: poolLabelsMap.get(event.pool.toLowerCase()) || event.pool,
        tokenId: event.tokenId.startsWith('#') ? event.tokenId : `#${event.tokenId}`,
        amount: formatAmount(event.usdValue, event.amount0, event.amount1),
      }));

      activities.push({
        date,
        count: dayEvents.length,
        events: dayEvents,
      });
    }

    // Sort by date descending (most recent first)
    activities.sort((a, b) => b.date.localeCompare(a.date));

    const totalActivities = events.length;

    res.status(200).json({
      success: true,
      data: {
        activities,
        totalActivities,
      },
    });
  } catch (error) {
    console.error('[api/wallet/activities] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch activities',
    });
  }
}
