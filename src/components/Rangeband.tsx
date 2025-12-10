type RangebandStatus = "inRange" | "nearBand" | "outOfRange";

interface RangebandProps {
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  status?: RangebandStatus;
  strategyLabel?: string;
  pairLabel: string;
  variant?: "list" | "card" | "hero";
  className?: string;
}

export function Rangeband({
  minPrice,
  maxPrice,
  currentPrice,
  status,
  strategyLabel = "Balanced (25.0%)",
  pairLabel,
  variant = "card",
  className = "",
}: RangebandProps) {
  // Auto-detect status if not provided
  const isOutOfRange = currentPrice < minPrice || currentPrice > maxPrice;
  const priceRange = maxPrice - minPrice;
  const pricePosition = ((currentPrice - minPrice) / priceRange) * 100;
  
  // Near band: within 5% of price range from either edge
  const thresholdPercent = 5;
  const isNearMin = !isOutOfRange && pricePosition <= thresholdPercent;
  const isNearMax = !isOutOfRange && pricePosition >= (100 - thresholdPercent);
  const isNearBand = isNearMin || isNearMax;
  
  const detectedStatus: RangebandStatus = isOutOfRange ? "outOfRange" : isNearBand ? "nearBand" : "inRange";
  const finalStatus = status || detectedStatus;

  // Calculate strategy width from label
  const strategyPercentMatch = strategyLabel.match(/\((\d+\.?\d*)/);
  const strategyPercent = strategyPercentMatch ? parseFloat(strategyPercentMatch[1]) : 25;
  
  let lineWidth: number;
  if (strategyPercent < 12) {
    lineWidth = 30; // Aggressive
  } else if (strategyPercent <= 35) {
    lineWidth = 65; // Balanced
  } else {
    lineWidth = 100; // Conservative
  }

  // Calculate dot position
  const lineOffset = (100 - lineWidth) / 2;
  let dotPositionInContainer: number;
  
  if (isOutOfRange) {
    // When out of range, position dot at the very edge (0% or 100% of the line)
    dotPositionInContainer = currentPrice < minPrice 
      ? lineOffset  // Left edge (0%)
      : lineOffset + lineWidth; // Right edge (100%)
  } else {
    const usableLineWidth = lineWidth - 6;
    dotPositionInContainer = lineOffset + 3 + (pricePosition * usableLineWidth / 100);
  }

  // Status colors (semantic)
  const statusConfig = {
    inRange: {
      color: "#10B981", // Success green
      glow: true,
      animation: "animate-heartbeat",
    },
    nearBand: {
      color: "#F59E0B", // Warning amber
      glow: true,
      animation: "animate-heartbeat-slow",
    },
    outOfRange: {
      color: "#EF4444", // Error red
      glow: false,
      animation: "",
    },
  };

  const config = statusConfig[finalStatus];

  // Variant: List (compact, for table rows - occupies ~60% of row width, centered in column)
  if (variant === "list") {
    return (
      <div className={`w-full max-w-[600px] mx-auto ${className}`}>
        {/* 1. Strategy label */}
        <div className="mb-3">
          <p className="text-white/70 text-xs leading-tight">
            {strategyLabel}
          </p>
        </div>

        {/* 2. Horizontal band */}
        <div className="mb-3">
          <div className="relative w-full" style={{ height: '20px' }}>
            {/* Band container - centered */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
              style={{ width: `${lineWidth}%` }}
            >
              {/* Line */}
              <div className="h-[2px] w-full bg-white/70 rounded-full"></div>
              
              {/* Dot */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${config.animation}`}
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

        {/* 3. Price labels - min/max under band ends */}
        <div className="mb-3 relative" style={{ height: '16px' }}>
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-full"
            style={{ width: `${lineWidth}%` }}
          >
            <div className="flex justify-between items-start">
              <p className="text-white/[0.58] text-[10px] numeric leading-tight">
                {minPrice.toFixed(6)}
              </p>
              <p className="text-white/[0.58] text-[10px] numeric leading-tight">
                {maxPrice.toFixed(5)}
              </p>
            </div>
          </div>
        </div>

        {/* Current price - centered below */}
        <div className="text-center mb-2">
          <p className="text-white/95 text-base numeric leading-tight">
            {currentPrice.toFixed(5)}
          </p>
        </div>

        {/* 4. Pair label */}
        <div className="text-center mb-2">
          <p className="text-white/[0.58] text-xs leading-tight">
            {pairLabel}
          </p>
        </div>

        {/* 5. Caption */}
        <div className="text-right">
          <p className="text-white/40 text-[10px] leading-tight">
            Powered by RangeBand™
          </p>
        </div>
      </div>
    );
  }

  // Variant: Hero (large marketing, full width)
  if (variant === "hero") {
    return (
      <div className={`w-full ${className}`}>
        {/* 1. Strategy label */}
        <div className="text-center mb-6">
          <p className="text-white/95 text-base leading-tight">
            {strategyLabel}
          </p>
        </div>

        {/* 2. Horizontal band */}
        <div className="mb-4">
          <div className="relative w-full" style={{ height: '32px' }}>
            {/* Band container - centered */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
              style={{ width: `${lineWidth}%` }}
            >
              {/* Line */}
              <div className="h-[3px] w-full bg-white/70 rounded-full"></div>
              
              {/* Dot */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${config.animation}`}
                style={{ left: `${((dotPositionInContainer - lineOffset) / lineWidth) * 100}%` }}
              >
                <svg className="block size-[28px]" fill="none" viewBox="0 0 28 28">
                  {config.glow && <circle cx="14" cy="14" fill={config.color} opacity="0.3" r="14" />}
                  <circle cx="14" cy="14" fill={config.color} r="11" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Price labels - min/max under band ends */}
        <div className="mb-6 relative" style={{ height: '20px' }}>
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-full"
            style={{ width: `${lineWidth}%` }}
          >
            <div className="flex justify-between items-start">
              <p className="text-white/[0.58] text-xs numeric leading-tight">
                {minPrice.toFixed(6)}
              </p>
              <p className="text-white/[0.58] text-xs numeric leading-tight">
                {maxPrice.toFixed(5)}
              </p>
            </div>
          </div>
        </div>

        {/* Current price - centered below */}
        <div className="text-center mb-3">
          <p className="text-white/[0.58] text-xs uppercase tracking-wide leading-tight mb-2">
            Current Price
          </p>
          <p className="text-white/95 text-[32px] numeric leading-tight">
            {currentPrice.toFixed(5)}
          </p>
        </div>

        {/* 4. Pair label */}
        <div className="text-center mb-4">
          <p className="text-white/70 text-base leading-tight">
            {pairLabel}
          </p>
        </div>

        {/* 5. Caption */}
        <div className="text-center">
          <p className="text-white/40 text-xs leading-tight">
            Powered by RangeBand™
          </p>
        </div>
      </div>
    );
  }

  // Variant: Card (vertical, for pool cards & mobile)
  return (
    <div className={`w-full ${className}`}>
      {/* 1. Strategy label */}
      <div className="text-center mb-4">
        <p className="text-white/95 text-sm leading-tight">
          {strategyLabel}
        </p>
      </div>

      {/* 2. Horizontal band */}
      <div className="mb-3">
        <div className="relative w-full" style={{ height: '24px' }}>
          {/* Band container - centered */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
            style={{ width: `${lineWidth}%`, minWidth: '160px' }}
          >
            {/* Line */}
            <div className="h-[2px] w-full bg-white/70 rounded-full"></div>
            
            {/* Dot */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${config.animation}`}
              style={{ left: `${((dotPositionInContainer - lineOffset) / lineWidth) * 100}%` }}
            >
              <svg className="block size-[21px]" fill="none" viewBox="0 0 21 21">
                {config.glow && <circle cx="10.5" cy="10.5" fill={config.color} opacity="0.3" r="10.5" />}
                <circle cx="10.5" cy="10.5" fill={config.color} r="8.25" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Price labels - min/max under band ends */}
      <div className="mb-4 relative" style={{ height: '18px' }}>
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-full"
          style={{ width: `${lineWidth}%`, minWidth: '160px' }}
        >
          <div className="flex justify-between items-start">
            <p className="text-white/[0.58] text-[11px] numeric leading-tight">
              {minPrice.toFixed(6)}
            </p>
            <p className="text-white/[0.58] text-[11px] numeric leading-tight">
              {maxPrice.toFixed(5)}
            </p>
          </div>
        </div>
      </div>

      {/* Current price - centered below */}
      <div className="text-center mb-3">
        <p className="text-white/[0.58] text-xs uppercase tracking-wide leading-tight mb-2">
          Current Price
        </p>
        <p className="text-white/95 text-2xl numeric leading-tight">
          {currentPrice.toFixed(5)}
        </p>
      </div>

      {/* 4. Pair label */}
      <div className="text-center mb-3">
        <p className="text-white/70 text-sm leading-tight">
          {pairLabel}
        </p>
      </div>

      {/* 5. Caption */}
      <div className="text-center">
        <p className="text-white/40 text-[10px] leading-tight">
          Powered by RangeBand™
        </p>
      </div>
    </div>
  );
}