import React from 'react';

export default function PoolUniverseRangebandSection() {
  return (
    <section className="space-y-4">
       <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">RangeBand™ & Liquidity</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
           <div className="rounded-2xl border border-white/10 bg-[#0B1530]/60 p-6 shadow-xl h-full">
              <h3 className="text-sm font-semibold text-white/90">About RangeBand™</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                RangeBand™ analyzes the effectiveness of liquidity positioning across all active pools. It identifies how much capital is actively earning fees versus sitting idle (out-of-range).
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-electric-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[#3B82F6]">Live Analysis</span>
              </div>
           </div>
        </div>
        <div className="md:col-span-2">
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0B1530]/60 p-8 shadow-xl text-center">
            <p className="text-sm font-medium text-white/40">Liquidity Density Chart Placeholder</p>
             <p className="mt-1 text-xs text-white/30">Real-time depth visualization coming soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
