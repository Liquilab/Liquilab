import { useState, useEffect } from "react";

type Strategy = "aggressive" | "balanced" | "conservative";
type Status = "inRange" | "nearBand" | "outOfRange";

export function InteractiveRangeBandExplainer() {
  const [hoveredStrategy, setHoveredStrategy] = useState<Strategy | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<Status | null>(null);
  const [animatedPosition, setAnimatedPosition] = useState<number>(0.5); // 0 to 1 (min to max)
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);

  // Base prices
  const minPrice = 2.20;
  const maxPrice = 2.75;
  const pairLabel = "USDT0/FXRP";

  // Organic animation when not interacting
  useEffect(() => {
    if (isUserInteracting) return;

    let animationFrame: number;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      
      // Use multiple sine waves for organic movement
      // Main slow wave
      const wave1 = Math.sin(elapsed * 0.15) * 0.45;
      // Secondary wave for variation
      const wave2 = Math.sin(elapsed * 0.23 + 1.5) * 0.25;
      // Tertiary subtle wave
      const wave3 = Math.sin(elapsed * 0.08 + 3) * 0.15;
      
      // Combine waves and normalize to 0-1 range
      const combined = wave1 + wave2 + wave3;
      const normalized = (combined + 0.85) / 1.7; // normalize to ~0-1 range
      
      // Clamp between 0 and 1
      const clamped = Math.max(0, Math.min(1, normalized));
      
      setAnimatedPosition(clamped);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isUserInteracting]);

  // Strategy configurations
  const strategyConfig: Record<Strategy, { label: string; lineWidth: number; percent: string }> = {
    aggressive: { label: "AGGR", lineWidth: 30, percent: "10.2%" },
    balanced: { label: "BAL", lineWidth: 65, percent: "22.2%" },
    conservative: { label: "CONS", lineWidth: 100, percent: "50.0%" },
  };

  // Status configurations (±3% threshold for near band)
  const statusConfig: Record<Status, { label: string; color: string; glow: boolean; animation: string }> = {
    inRange: { 
      label: "In Range", 
      color: "#10B981", 
      glow: true,
      animation: "animate-heartbeat"
    },
    nearBand: { 
      label: "Near Band", 
      color: "#F59E0B", 
      glow: true,
      animation: "animate-heartbeat-slow"
    },
    outOfRange: { 
      label: "Out of Range", 
      color: "#EF4444", 
      glow: false,
      animation: ""
    },
  };

  // Active strategy (hovered or default)
  const activeStrategy = hoveredStrategy || "balanced";
  const strategy = strategyConfig[activeStrategy];

  // Calculate current price from animated position or hovered status
  const priceRange = maxPrice - minPrice;
  let currentPrice: number;
  let currentPosition: number; // 0 to 1

  if (hoveredStatus) {
    // If user is hovering a status, use predefined positions
    switch (hoveredStatus) {
      case "inRange":
        currentPosition = 0.5; // middle
        break;
      case "nearBand":
        currentPosition = 0.95; // near max edge (~3%)
        break;
      case "outOfRange":
        currentPosition = 1.15; // beyond max
        break;
    }
  } else {
    // Use animated position
    currentPosition = animatedPosition;
  }

  currentPrice = minPrice + (currentPosition * priceRange);

  // Auto-detect status based on current price
  const isOutOfRange = currentPrice < minPrice || currentPrice > maxPrice;
  
  // Near band: within 3% of price range from either edge
  const thresholdPercent = 3;
  const pricePositionPercent = ((currentPrice - minPrice) / priceRange) * 100;
  const isNearMin = !isOutOfRange && pricePositionPercent <= thresholdPercent;
  const isNearMax = !isOutOfRange && pricePositionPercent >= (100 - thresholdPercent);
  const isNearBand = isNearMin || isNearMax;
  
  const autoDetectedStatus: Status = isOutOfRange ? "outOfRange" : isNearBand ? "nearBand" : "inRange";
  
  // Active status (hovered or auto-detected)
  const activeStatus = hoveredStatus || autoDetectedStatus;
  const status = statusConfig[activeStatus];

  // Calculate dot position
  const lineOffset = (100 - strategy.lineWidth) / 2;
  let dotPositionInContainer: number;

  if (isOutOfRange) {
    dotPositionInContainer = currentPrice < minPrice 
      ? lineOffset 
      : lineOffset + strategy.lineWidth;
  } else {
    const usableLineWidth = strategy.lineWidth - 6;
    dotPositionInContainer = lineOffset + 3 + (pricePositionPercent * usableLineWidth / 100);
  }

  const handleMouseEnter = () => {
    setIsUserInteracting(true);
  };

  const handleMouseLeave = () => {
    setIsUserInteracting(false);
  };

  return (
    <div className="w-full">
      {/* Main RangeBand Visualization */}
      <div className="mb-8">
        {/* Strategy label */}
        <div className="text-center mb-6">
          <p className="text-white/95 text-base leading-tight">
            {strategyConfig[activeStrategy].label === "AGGR" ? "Aggressive" : 
             strategyConfig[activeStrategy].label === "BAL" ? "Balanced" : 
             "Conservative"} ({strategy.percent})
          </p>
        </div>

        {/* Horizontal band */}
        <div className="mb-4">
          <div className="relative w-full" style={{ height: '32px' }}>
            {/* Band container - centered */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${strategy.lineWidth}%` }}
            >
              {/* Line */}
              <div className="h-[3px] w-full bg-white/70 rounded-full transition-all duration-300"></div>
              
              {/* Dot */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${status.animation}`}
                style={{ 
                  left: `${((dotPositionInContainer - lineOffset) / strategy.lineWidth) * 100}%`,
                  transition: isUserInteracting ? 'all 300ms ease-out' : 'none'
                }}
              >
                <svg className="block size-[28px]" fill="none" viewBox="0 0 28 28">
                  {status.glow && (
                    <circle 
                      cx="14" 
                      cy="14" 
                      fill={status.color} 
                      opacity="0.3" 
                      r="14"
                      style={{ transition: 'fill 600ms ease-out' }}
                    />
                  )}
                  <circle 
                    cx="14" 
                    cy="14" 
                    fill={status.color} 
                    r="11"
                    style={{ transition: 'fill 600ms ease-out' }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Price labels - min/max under band ends */}
        <div className="mb-6 relative" style={{ height: '20px' }}>
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-full transition-all duration-300"
            style={{ width: `${strategy.lineWidth}%` }}
          >
            <div className="flex justify-between items-start">
              <p className="text-white/[0.58] text-xs numeric leading-tight">
                {minPrice.toFixed(6)}
              </p>
              <p className="text-white/[0.58] text-xs numeric leading-tight">
                {maxPrice.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        {/* Current price - centered below */}
        <div className="text-center mb-3">
          <p className="text-white/[0.58] text-xs uppercase tracking-wide leading-tight mb-2">
            Current Price
          </p>
          <p 
            className="text-white/95 text-[32px] numeric leading-tight"
            style={{ transition: isUserInteracting ? 'all 300ms ease-out' : 'none' }}
          >
            {currentPrice.toFixed(6)}
          </p>
          <p className="text-white/70 text-base leading-tight mt-1">
            {pairLabel}
          </p>
        </div>
      </div>

      {/* Powered by caption */}
      <div className="text-center mb-8">
        <p className="text-white/40 text-xs leading-tight flex items-center justify-center gap-2">
          <span className="inline-block w-3 h-3 border border-white/40 rounded-full"></span>
          Powered by RangeBand™
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 mb-6"></div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/60 text-sm uppercase tracking-wider">Strategy</span>
          </div>
          <div className="flex items-center gap-2">
            {(["aggressive", "balanced", "conservative"] as Strategy[]).map((strat) => (
              <button
                key={strat}
                onMouseEnter={() => {
                  setHoveredStrategy(strat);
                  handleMouseEnter();
                }}
                onMouseLeave={() => {
                  setHoveredStrategy(null);
                  handleMouseLeave();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeStrategy === strat
                    ? "bg-[#3B82F6] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white/95"
                }`}
              >
                {strategyConfig[strat].label}
              </button>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-3">
            Hover to see how strategy width changes the RangeBand
          </p>
        </div>

        {/* Status */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/60 text-sm uppercase tracking-wider">Status</span>
          </div>
          <div className="flex items-center gap-3">
            {(["inRange", "nearBand", "outOfRange"] as Status[]).map((stat) => (
              <button
                key={stat}
                onMouseEnter={() => {
                  setHoveredStatus(stat);
                  handleMouseEnter();
                }}
                onMouseLeave={() => {
                  setHoveredStatus(null);
                  handleMouseLeave();
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeStatus === stat
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
                title={statusConfig[stat].label}
              >
                <svg className="block size-[12px]" fill="none" viewBox="0 0 12 12">
                  <circle 
                    cx="6" 
                    cy="6" 
                    fill={statusConfig[stat].color} 
                    r="6"
                    className={activeStatus === stat ? "animate-pulse" : ""}
                  />
                </svg>
                <span className={`text-xs transition-all duration-200 ${
                  activeStatus === stat ? "text-white/95 font-medium" : "text-white/60"
                }`}>
                  {statusConfig[stat].label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-3">
            Hover to see how status affects dot color and position
          </p>
        </div>
      </div>
    </div>
  );
}