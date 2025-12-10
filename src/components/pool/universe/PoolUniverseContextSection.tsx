export default function PoolUniverseContextSection() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1530]/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white/95">How This Pool Context Affects Your Position</h3>
          <p className="text-xs text-white/50">Guidance placeholders; wire real insights later.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-white/80">
          <div className="text-sm font-semibold text-white/90">Range &amp; Crowding</div>
          <p className="mt-2 text-xs text-white/60">
            Check crowded price zones and widen your range if near saturation; launchpad data will show this.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-white/80">
          <div className="text-sm font-semibold text-white/90">Fee Efficiency</div>
          <p className="mt-2 text-xs text-white/60">
            7D fees vs TVL inform APR; compare to peers in the DEX table before adjusting liquidity.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-white/80">
          <div className="text-sm font-semibold text-white/90">Flows &amp; Regime</div>
          <p className="mt-2 text-xs text-white/60">
            Watch wallet flows and regime shifts for timing entries/exits; analytics wiring will follow.
          </p>
        </div>
      </div>
    </div>
  );
}
