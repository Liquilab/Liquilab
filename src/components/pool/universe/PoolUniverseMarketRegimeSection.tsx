export default function PoolUniverseMarketRegimeSection() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1530]/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white/95">Market Regime &amp; Volatility</h3>
          <p className="text-xs text-white/50">Volatility timeline + regime summary (placeholder).</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10 text-white/50">
          Volatility timeline placeholder
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-white/10 p-4 text-white/70">
          <div className="text-sm font-semibold text-white/85">Strategy note (stub)</div>
          <div className="text-xs">• Current regime: TBD</div>
          <div className="text-xs">• Suggested posture: TBD</div>
          <div className="text-xs">• Watchlist: TBD</div>
        </div>
      </div>
    </div>
  );
}
