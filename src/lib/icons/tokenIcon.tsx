import React from 'react';
import Image from 'next/image';
import type { Address } from 'viem';

import { canonicalSymbol } from './symbolMap';
import { TOKEN_ASSETS } from '@/lib/assets';

export type TokenIconProps = {
  symbol?: string;
  address?: Address | string | null;
  size?: number;
  className?: string;
  alt?: string;
};

function buildIconCandidates(symbol?: string | null, address?: string | null): string[] {
  const canonical = canonicalSymbol(symbol);
  const slug = canonical ? canonical.toLowerCase() : 'unknown';
  const params = new URLSearchParams();
  if (address) {
    params.set('address', address.toString());
  }
  const query = params.toString();
  const apiPath = `/api/token-icons/${encodeURIComponent(slug || 'unknown')}${query ? `?${query}` : ''}`;
  return [apiPath, TOKEN_ASSETS.default];
}

export function TokenIcon({
  symbol,
  address,
  size = 20,
  className = '',
  alt: altLabel,
}: TokenIconProps): JSX.Element {
  const candidates = React.useMemo(() => buildIconCandidates(symbol, address), [symbol, address]);

  const [index, setIndex] = React.useState(0);
  const currentSrc = candidates[index];
  const label = altLabel || (canonicalSymbol(symbol) || symbol || 'token').toUpperCase();

  React.useEffect(() => {
    setIndex(0);
  }, [symbol, address]);

  const handleError = React.useCallback(() => {
    setIndex((previous) => {
      if (previous + 1 >= candidates.length) {
        return previous;
      }
      return previous + 1;
    });
  }, [candidates.length]);

  return (
    <Image
      src={currentSrc}
      alt={label}
      width={size}
      height={size}
      unoptimized
      className={`rounded-full border border-[rgba(30,144,255,0.25)] bg-[#0B1530] object-contain ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
        flexShrink: 0,
        display: 'block',
      }}
      onError={handleError}
    />
  );
}

export default TokenIcon;
