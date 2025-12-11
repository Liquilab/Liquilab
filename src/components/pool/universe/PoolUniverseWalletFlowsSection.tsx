import React from 'react';

type Props = {
  poolAddress: string;
  degrade?: boolean;
  loading?: boolean;
};

export default function PoolUniverseWalletFlowsSection({ 
  poolAddress,
  degrade = false,
  loading = false 
}: Props) {
  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white/90">Wallet Flows & Notable Moves</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1530]/90 p-8 shadow-xl">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-32 bg-white/10 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (degrade) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white/90">Wallet Flows & Notable Moves</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1530]/90 p-8 shadow-xl">
          <p className="text-sm text-white/50">Wallet flows data temporarily unavailable.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">Wallet Flows & Notable Moves</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#0B1530]/90 p-8 shadow-xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-white/50 mb-3">Net TVL Flows (30D)</div>
            <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-white/10 bg-white/5">
              <p className="text-sm text-white/40">Flow chart coming soon</p>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-white/50 mb-3">Top Wallet Changes</div>
            <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-white/10 bg-white/5">
              <p className="text-sm text-white/40">Notable moves coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
