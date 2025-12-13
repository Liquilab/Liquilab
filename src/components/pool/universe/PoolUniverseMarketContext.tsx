import React from 'react';

export default function PoolUniverseMarketContext() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">Market Context</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0B1530]/60 p-6 shadow-xl">
           <h3 className="text-sm font-semibold text-white/80">Price & Volatility</h3>
           <div className="mt-4 space-y-3">
              <div className="h-2 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-8 w-1/2 rounded bg-white/5" />
              <p className="text-xs text-white/40 mt-2">
                  Real-time volatility analysis and price correlation metrics.
              </p>
           </div>
        </div>
         <div className="rounded-2xl border border-white/10 bg-[#0B1530]/60 p-6 shadow-xl">
           <h3 className="text-sm font-semibold text-white/80">Relative TVL vs Universe</h3>
            <div className="mt-4 space-y-3">
              <div className="h-2 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-8 w-1/2 rounded bg-white/5" />
              <p className="text-xs text-white/40 mt-2">
                  Benchmarking this pair against the broader Flare DeFi ecosystem.
              </p>
           </div>
        </div>
      </div>
    </section>
  );
}

