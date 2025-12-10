import Link from 'next/link';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { AnalyticsPoolUniverseSegment, DexName } from '@/lib/api/analytics';

type Row = AnalyticsPoolUniverseSegment & {
  feeTierBps?: number | null;
};

const dexDisplay = (dex: DexName | string) => {
  if (typeof dex !== 'string') return 'Other';
  const lower = dex.toLowerCase();
  if (lower.includes('enosys')) return 'Ēnosys';
  if (lower.includes('spark')) return 'SparkDEX';
  return dex.toUpperCase();
};

const dexExternalUrl = (dex: DexName | string, poolAddress: string) => {
  const lower = typeof dex === 'string' ? dex.toLowerCase() : dex;
  if (lower.includes('spark')) return `https://sparkdex.ai/pools/${poolAddress}`;
  if (lower.includes('enosys')) return `https://v3.dex.enosys.global/#/pool/${poolAddress}`;
  return null;
};

const feeLabel = (bps: number | null | undefined) => {
  if (bps === null || bps === undefined) return '—';
  return `${(bps / 100).toFixed(2)}%`;
};

type PoolUniverseDexTableProps = {
  segments?: AnalyticsPoolUniverseSegment[];
};

export default function PoolUniverseDexTable({ segments }: PoolUniverseDexTableProps) {
  const rows = [...(segments ?? [])].sort((a, b) => {
    const tvlA = Number.isFinite(a.tvlUsd) ? (a.tvlUsd as number) : 0;
    const tvlB = Number.isFinite(b.tvlUsd) ? (b.tvlUsd as number) : 0;
    if (tvlA !== tvlB) return tvlB - tvlA;
    return dexDisplay(a.dex).localeCompare(dexDisplay(b.dex));
  });

  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1530]/80 shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#3B82F6]/20 text-[#3B82F6]">
            <ExternalLink className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white/95">DEX &amp; Fee Tiers for this Pair</h3>
            <p className="text-xs text-white/50">Sorted by TVL (USD) high → low</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-white/90">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.08em] text-white/50">
            <tr>
              <th className="px-4 py-3 text-left">DEX</th>
              <th className="px-4 py-3 text-left">Fee tier</th>
              <th className="px-4 py-3 text-right">TVL (USD)</th>
              <th className="px-4 py-3 text-right">Fees 7d (USD)</th>
              <th className="px-4 py-3 text-right">Positions</th>
              <th className="px-4 py-3 text-right">Links</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-center text-white/60" colSpan={6}>
                  No pools available for this pair yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const external = dexExternalUrl(row.dex, row.poolAddress);
                return (
                  <tr key={row.poolAddress} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">{dexDisplay(row.dex)}</td>
                    <td className="px-4 py-3">{feeLabel(row.feeTierBps ?? null)}</td>
                    <td className="px-4 py-3 text-right tnum">${(row.tvlUsd ?? 0).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-right tnum">${(row.fees7dUsd ?? 0).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-right tnum">{(row.positionsCount ?? 0).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/pool/${row.poolAddress}`} legacyBehavior>
                          <Button variant="ghost" className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-xs h-8 px-3">
                            <LinkIcon className="mr-2 size-4" />
                            View pool
                          </Button>
                        </Link>
                        {external ? (
                          <a
                            href={external}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
                          >
                            DEX ↗
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
