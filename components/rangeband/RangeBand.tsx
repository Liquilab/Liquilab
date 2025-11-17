import React from 'react';

export type RangeBandProps = {
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  strategyCode: string;
  spreadPct: number;
  bandColor: 'green' | 'orange' | 'red' | 'unknown';
  positionRatio: number;
  variant?: 'compact' | 'large';
};

const BAND_META: Record<RangeBandProps['bandColor'], { label: string; className: string }> = {
  green: { label: 'In range', className: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60' },
  orange: { label: 'Near band', className: 'bg-amber-500/20 text-amber-200 border-amber-400/60' },
  red: { label: 'Out of range', className: 'bg-rose-500/20 text-rose-200 border-rose-400/60' },
  unknown: { label: 'Unknown', className: 'bg-gray-500/20 text-gray-200 border-gray-400/40' },
};

export function RangeBand({
  currentPrice,
  minPrice,
  maxPrice,
  strategyCode,
  spreadPct,
  bandColor,
  positionRatio,
  variant = 'compact',
}: RangeBandProps) {
  const meta = BAND_META[bandColor] ?? BAND_META.unknown;
  const width = Math.min(100, Math.max(0, Math.round(positionRatio * 100)));
  const isLarge = variant === 'large';

  return (
    <div className={`flex w-full flex-col gap-2 rounded-xl border ${meta.className} p-3`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-white/70">RangeBand™</span>
          <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white">{meta.label}</span>
        </div>
        <span className="text-xs text-white/70">{strategyCode}</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-white/50"
          style={{ width: `${width}%` }}
          aria-label="Position in band"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
        <div>
          <div className="text-[10px] uppercase text-white/60">Min</div>
          <div className="tabular-nums text-white">{minPrice}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-white/60">Current</div>
          <div className="tabular-nums text-white">{currentPrice}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-white/60">Max</div>
          <div className="tabular-nums text-white">{maxPrice}</div>
        </div>
      </div>
      {isLarge && (
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>Spread</span>
          <span className="tabular-nums text-white">{spreadPct}%</span>
        </div>
      )}
    </div>
  );
}
