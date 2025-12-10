import React from 'react';

export default function PoolUniverseWalletFlowsSection() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">Wallet Flows</h2>
      </div>
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1530]/40 p-8">
         <div className="flex items-center justify-center gap-3 text-white/40">
            <span className="font-semibold">Coming Soon</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-sm">Top LP Wallets & Net Flows</span>
         </div>
      </div>
    </section>
  );
}
