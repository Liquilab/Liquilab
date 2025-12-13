import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DataSourceDisclaimerProps {
  className?: string;
}

export function DataSourceDisclaimer({ className }: DataSourceDisclaimerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs text-white/60',
        className,
      )}
    >
      <p>
        Data powered by Flare Time-Series Oracle (FTSO) by{' '}
        <span className="inline-flex items-center gap-1.5">
          <Image
            src="/media/tokens/flr.webp"
            alt="Flare"
            width={14}
            height={14}
            className="rounded-full"
            unoptimized
          />
          <span className="text-white/80">Flare</span>
        </span>
        .
      </p>
    </div>
  );
}

