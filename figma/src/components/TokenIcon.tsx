import { useState } from 'react';

// Mapping van token symbols naar CoinMarketCap IDs
const TOKEN_ID_MAP: Record<string, string> = {
  'XRP': '52',
  'USDT': '825',
  'USDT0': '825', // Fallback to USDT
  'BTC': '1',
  'ETH': '1027',
  'USDC': '3408',
  'BNB': '1839',
  'SOL': '5426',
  'ADA': '2010',
  'DOGE': '74',
  'DOT': '6636',
  'MATIC': '3890',
  'DAI': '4943',
  'AVAX': '5805',
  'LINK': '1975',
  'UNI': '7083',
  'ATOM': '3794',
  'XLM': '512',
  'USD': '3408', // Sologenic USD - using USDC as placeholder
  'SOLO': '9119', // Sologenic
  'WFLR': '7950', // Wrapped Flare
  'FLR': '7950', // Flare
};

interface TokenIconProps {
  symbol: string;
  className?: string;
}

export function TokenIcon({ symbol, className = "size-[31px]" }: TokenIconProps) {
  const [imageError, setImageError] = useState(false);
  const upperSymbol = symbol.toUpperCase();
  
  // Custom SVG for FXRP - red circle with white XRP X
  if (upperSymbol === 'FXRP') {
    return (
      <div className={className}>
        <svg className="block size-full" viewBox="0 0 31 31" fill="none">
          <circle cx="15.5" cy="15.5" r="15.5" fill="#D21E1E" />
          <g transform="translate(8, 8) scale(0.48)">
            <path d="M24.88 0L17.33 7.54L9.79 0H0L12.04 12.03L0 24.07H9.79L17.33 16.53L24.88 24.07H34.67L22.62 12.03L34.67 0H24.88Z" fill="white"/>
          </g>
        </svg>
      </div>
    );
  }
  
  // Get token ID from mapping, fallback to generic placeholder
  const tokenId = TOKEN_ID_MAP[upperSymbol];
  
  // CoinMarketCap CDN URL
  const imageUrl = tokenId 
    ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${tokenId}.png`
    : null;

  // If no token ID or image failed to load, show colored circle fallback
  if (!imageUrl || imageError) {
    // Generate color based on symbol
    const colors = ['#DC2626', '#059669', '#3B82F6', '#D97706', '#7C3AED', '#DB2777'];
    const colorIndex = symbol.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    return (
      <div className={className}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
          <circle cx="15.5" cy="15.5" fill={color} r="15.5" />
        </svg>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={imageUrl}
        alt={symbol}
        className="size-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

interface TokenPairIconProps {
  token1: string;
  token2: string;
  className?: string;
  size?: "default" | "large";
}

export function TokenPairIcon({ token1, token2, className, size = "default" }: TokenPairIconProps) {
  const sizeClasses = size === "large" 
    ? "w-[80px] h-[50px]" 
    : "w-[50px] h-[31px]";
  
  const iconSize = size === "large" ? "size-[50px]" : "size-[31px]";
  const iconOffset = size === "large" ? "left-[30px]" : "left-[19px]";
  
  return (
    <div className={`relative ${className || sizeClasses} shrink-0`}>
      <div className={`absolute left-0 ${iconSize} top-0`}>
        <TokenIcon symbol={token1} className={iconSize} />
      </div>
      <div className={`absolute ${iconOffset} ${iconSize} top-0`}>
        <TokenIcon symbol={token2} className={iconSize} />
      </div>
    </div>
  );
}