import React from 'react';

interface RangeBandPositionBarProps {
  minPrice: number | null;
  maxPrice: number | null;
  currentPrice: number | null;
  status: 'in' | 'near' | 'out' | 'unknown';
  pairLabel?: string;
  strategyLabel?: string;
}

export function RangeBandPositionBar({
  minPrice,
  maxPrice,
  currentPrice,
  status,
  pairLabel = 'Position',
  strategyLabel,
}: RangeBandPositionBarProps) {
  // If data is missing, show degraded state
  if (
    typeof minPrice !== 'number' ||
    typeof maxPrice !== 'number' ||
    typeof currentPrice !== 'number' ||
    !Number.isFinite(minPrice) ||
    !Number.isFinite(maxPrice) ||
    !Number.isFinite(currentPrice)
  ) {
    return (
      <div className="w-full max-w-[600px] mx-auto">
        <div className="mb-3">
          <p className="text-white/70 text-xs leading-tight">Range unavailable</p>
        </div>
        <div className="h-[2px] w-full bg-white/10 rounded-full mb-3" />
        <div className="text-center mb-2">
          <p className="text-white/40 text-[10px] leading-tight">Powered by RangeBand™</p>
        </div>
      </div>
    );
  }

  // Extract strategy percentage from label
  const strategyPercentMatch = strategyLabel?.match(/\((\d+\.?\d*)/);
  const strategyPercent = strategyPercentMatch ? parseFloat(strategyPercentMatch[1]) : 25;
  
  let lineWidth: number;
  if (strategyPercent < 12) {
    lineWidth = 30;
  } else if (strategyPercent <= 35) {
    lineWidth = 65;
  } else {
    lineWidth = 100;
  }

  // Calculate dot position
  const priceRange = maxPrice - minPrice;
  const pricePosition = ((currentPrice - minPrice) / priceRange) * 100;
  const isOutOfRange = currentPrice < minPrice || currentPrice > maxPrice;
  
  const lineOffset = (100 - lineWidth) / 2;
  let dotPositionInContainer: number;
  
  if (isOutOfRange) {
    dotPositionInContainer = currentPrice < minPrice 
      ? lineOffset
      : lineOffset + lineWidth;
  } else {
    const usableLineWidth = lineWidth - 6;
    dotPositionInContainer = lineOffset + 3 + (pricePosition * usableLineWidth / 100);
  }

  // Status colors based on range position
  // in range: green
  // >3% min price and >3% max price: orange (near)
  // < min price or > max price: red (out)
  const statusConfig = {
    in: { color: '#10B981', glow: true }, // Green for in range
    near: { color: '#F59E0B', glow: true }, // Orange for within 3% of range bounds
    out: { color: '#EF4444', glow: false }, // Red for outside range
    unknown: { color: '#6B7280', glow: false },
  };
  
  const config = statusConfig[status] ?? statusConfig.unknown;

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* Strategy label */}
      <div className="mb-3">
        <p className="text-white/70 text-xs leading-tight">{strategyLabel ?? 'Custom Strategy'}</p>
      </div>

      {/* Horizontal band */}
      <div className="mb-3">
        <div className="relative w-full" style={{ height: '20px' }}>
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
            style={{ width: `${lineWidth}%` }}
          >
            <div className="h-[2px] w-full bg-white/70 rounded-full"></div>
            
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${((dotPositionInContainer - lineOffset) / lineWidth) * 100}%` }}
            >
              <svg className="block size-[14px]" fill="none" viewBox="0 0 14 14">
                {config.glow && <circle cx="7" cy="7" fill={config.color} opacity="0.3" r="7" />}
                <circle cx="7" cy="7" fill={config.color} r="5.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Price labels - min/max under band ends */}
      <div className="mb-3 relative" style={{ height: '16px' }}>
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-full"
          style={{ width: `${lineWidth}%` }}
        >
          <div className="flex justify-between items-start">
            <p className="text-white/[0.58] text-[10px] tabular-nums leading-tight">
              {minPrice.toFixed(6)}
            </p>
            <p className="text-white/[0.58] text-[10px] tabular-nums leading-tight">
              {maxPrice.toFixed(5)}
            </p>
          </div>
        </div>
      </div>

      {/* Current price - centered below */}
      <div className="text-center mb-2">
        <p className="text-white/95 text-base tabular-nums leading-tight">
          {currentPrice.toFixed(5)}
        </p>
      </div>

      {/* Pair label */}
      <div className="text-center mb-2">
        <p className="text-white/[0.58] text-xs leading-tight">
          {pairLabel}
        </p>
      </div>

      {/* Caption */}
      <div className="text-right">
        <p className="text-white/40 text-[10px] leading-tight">
          Powered by RangeBand™
        </p>
      </div>
    </div>
  );
}




