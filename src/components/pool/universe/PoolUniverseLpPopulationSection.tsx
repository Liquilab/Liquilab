import React from 'react';

export default function PoolUniverseLpPopulationSection() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white/90">LP Population & Concentration</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#0B1530]/60 p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-full bg-white/5 p-4">
            <svg className="size-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-base font-medium text-white">LP Distribution Analysis</h3>
            <p className="text-sm text-white/50">
              Detailed breakdown of retail vs. whale concentration and active position distribution is coming in the next update.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
