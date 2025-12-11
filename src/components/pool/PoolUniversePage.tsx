'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { DataSourceDisclaimer } from '@/components/DataSourceDisclaimer';
import DataStateBanner from '@/components/DataStateBanner';
import PoolIntelSection from '@/components/pool/PoolIntelSection';
import PoolUniverseDexSection from '@/components/pool/universe/PoolUniverseDexSection';
import PoolUniverseFeesAprSection from '@/components/pool/universe/PoolUniverseFeesAprSection';
import PoolUniverseHead, { type TimeRange, type PoolUniverseHeadMetrics } from '@/components/pool/universe/PoolUniverseHead';
import PoolUniverseLpPopulationSection from '@/components/pool/universe/PoolUniverseLpPopulationSection';
import PoolUniverseContextSection from '@/components/pool/universe/PoolUniverseContextSection';
import PoolUniverseWalletFlowsSection from '@/components/pool/universe/PoolUniverseWalletFlowsSection';
import WarmingPlaceholder from '@/components/WarmingPlaceholder';
import {
  fetchPool,
  type AnalyticsPoolHead,
  type AnalyticsPoolResponse,
  type AnalyticsPoolUniverse,
} from '@/lib/api/analytics';

export interface PoolUniversePageProps {
  poolAddress: string;
}

type PoolUniverseState = {
  loading: boolean;
  degrade: boolean;
  response: AnalyticsPoolResponse | null;
  ts: number | string | null;
  error?: string;
};

const INITIAL_STATE: PoolUniverseState = {
  loading: true,
  degrade: false,
  response: null,
  ts: null,
};

function formatPoolAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function PoolUniversePage({ poolAddress }: PoolUniversePageProps) {
  const [state, setState] = useState<PoolUniverseState>(INITIAL_STATE);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  useEffect(() => {
    let mounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    (async () => {
      try {
        const response = await fetchPool(poolAddress);
        
        if (!mounted) return;
        setState({ loading: false, degrade: response.degrade, response, ts: response.ts ?? Date.now() });
      } catch (err) {
        if (!mounted) return;
        setState({ loading: false, degrade: true, response: null, ts: Date.now(), error: 'Failed to load pool data.' });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [poolAddress]);

  const { loading, degrade, response, error, ts } = state;
  const universe: AnalyticsPoolUniverse | null = response?.pool?.universe ?? null;
  const head: AnalyticsPoolHead | null = response?.pool?.head ?? null;

  const headMetrics: PoolUniverseHeadMetrics | null = useMemo(() => {
    const summary = universe?.summary;
    const tvlUsd = summary?.tvlUsd ?? head?.tvl ?? null;
    const fees24hUsd = summary?.fees24hUsd ?? head?.fees24h ?? null;
    const fees7dUsd = summary?.fees7dUsd ?? head?.fees7d ?? null;
    const incentives24hUsd = summary?.incentives24hUsd ?? head?.incentives24h ?? null;
    const incentives7dUsd = summary?.incentives7dUsd ?? head?.incentives7d ?? null;
    const positionsCount = summary?.positionsCount ?? head?.positionsCount ?? null;
    const walletsCount = summary?.walletsCount ?? null;

    return {
      tvlUsd,
      fees24hUsd,
      fees7dUsd,
      incentives24hUsd,
      incentives7dUsd,
      positionsCount,
      walletsCount,
    };
  }, [head, universe?.summary]);

  const sortedSegments = useMemo(() => {
    const segments = universe?.segments ?? [];
    if (!segments.length) return [] as AnalyticsPoolUniverse['segments'];
    return [...segments].sort((a, b) => {
      const tvlA = typeof a.tvlUsd === 'number' && Number.isFinite(a.tvlUsd) ? a.tvlUsd : 0;
      const tvlB = typeof b.tvlUsd === 'number' && Number.isFinite(b.tvlUsd) ? b.tvlUsd : 0;
      if (tvlA !== tvlB) return tvlB - tvlA;
      return (a.dex || '').toString().localeCompare((b.dex || '').toString());
    });
  }, [universe?.segments]);

  if (loading && !response) {
    return (
      <div className="relative text-white">
        <WarmingPlaceholder />
      </div>
    );
  }

  if (error) {
    // Note: DataStateBanner does not accept error prop, but we show error state here.
    return (
      <div className="relative text-white">
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="relative text-white">
        <DataStateBanner state="empty" />
      </div>
    );
  }

  if (process.env.NODE_ENV !== 'production' && response && (!head || !universe)) {
    console.warn('[PoolUniversePage] Missing head or universe data', { head, universe, response });
  }

  const summary = universe?.summary ?? null;

  const hasData =
    (headMetrics && ((headMetrics.tvlUsd ?? 0) > 0 || (headMetrics.positionsCount ?? 0) > 0)) ||
    (summary && (summary.tvlUsd > 0 || summary.positionsCount > 0)) ||
    (head && (head.tvl > 0 || head.positionsCount > 0));
  const isEmpty = !degrade && !hasData;
  const dataState: 'ok' | 'warming' | 'empty' = loading || degrade ? 'warming' : isEmpty ? 'empty' : 'ok';

  const lastUpdatedText = ts
    ? new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  const tvl = headMetrics?.tvlUsd ?? summary?.tvlUsd ?? head?.tvl ?? 0;
  const fees7d = headMetrics?.fees7dUsd ?? summary?.fees7dUsd ?? head?.fees7d ?? 0;
  const poolsCount = universe?.segments?.length ?? 0;

  const token0Symbol = universe?.pair.token0Symbol ?? null;
  const token1Symbol = universe?.pair.token1Symbol ?? null;
  const pairLabel = token0Symbol && token1Symbol ? `${token0Symbol} / ${token1Symbol}` : formatPoolAddress(poolAddress);

  return (
    <div className="relative space-y-8 font-sans text-white">
      <div className="flex items-center justify-between">
         <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-[#3B82F6]">
            <ArrowLeft className="size-4" />
            Back to Dashboard
         </Link>
      </div>

      <DataStateBanner state={dataState} />

      {/* 1. Universe head */}
      <PoolUniverseHead
        token0Symbol={token0Symbol}
        token1Symbol={token1Symbol}
        metrics={headMetrics}
        poolsCount={poolsCount}
        timeRange={timeRange}
        onRangeChange={setTimeRange}
        lastUpdatedText={lastUpdatedText}
        degrade={degrade}
        loading={loading}
      />

      {/* 2. Liquidity Venues (DEX & Fee Tiers) */}
      <PoolUniverseDexSection segments={sortedSegments} timeRange={timeRange} />

      {/* 3. LP Population */}
      <PoolUniverseLpPopulationSection 
        positionsCount={headMetrics?.positionsCount ?? null}
        walletsCount={headMetrics?.walletsCount ?? null}
        segments={sortedSegments}
        degrade={degrade}
        loading={loading}
      />

      {/* 4. RangeBand™ Yield & Efficiency */}
      <PoolUniverseFeesAprSection 
        tvlUsd={headMetrics?.tvlUsd ?? null}
        fees24hUsd={headMetrics?.fees24hUsd ?? null}
        fees7dUsd={headMetrics?.fees7dUsd ?? null}
        incentives24hUsd={headMetrics?.incentives24hUsd ?? null}
        incentives7dUsd={headMetrics?.incentives7dUsd ?? null}
        timeRange={timeRange}
        degrade={degrade}
        loading={loading}
      />

      {/* 5. Wallet Flows & Notable Moves */}
      <PoolUniverseWalletFlowsSection 
        poolAddress={poolAddress}
        degrade={degrade}
        loading={loading}
      />

      {/* 6. Pool Intel — Web Signals */}
      <section className="rounded-xl border border-white/10 bg-[#0B1530]/90 p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white/95">Pool Intel — Web Signals</h3>
            <p className="text-xs text-white/50">Web signals, news, and community cues for this pair</p>
          </div>
        </div>
        <div className="mt-4">
          <PoolIntelSection pool={null} pair={pairLabel} />
        </div>
      </section>

      {/* 7. Context Card */}
      <PoolUniverseContextSection 
        universe={universe}
        segments={sortedSegments}
        degrade={degrade}
        loading={loading}
      />

      <DataSourceDisclaimer className="mt-8 border-t border-white/5 pt-6" />
    </div>
  );
}
