import React from 'react';

export default function PoolUniverseFeesAprSection() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">Fees & APR Trend</h2>
        <div className="flex gap-2">
            <span className="text-xs font-medium text-white/40">7D</span>
            <span className="text-xs font-medium text-white/40">30D</span>
        </div>
      </div>
       <div className="rounded-2xl border border-white/10 bg-[#0B1530]/60 p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
           <div className="rounded-full bg-white/5 p-4">
            <svg className="size-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="max-w-md space-y-2">
             <h3 className="text-base font-medium text-white">Historical Performance</h3>
            <p className="text-sm text-white/50">
              Historical fee accrual and APR trend lines will be available here once sufficient history has been indexed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
