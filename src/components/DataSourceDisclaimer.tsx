import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataSourceDisclaimerProps {
  className?: string;
}

export function DataSourceDisclaimer({ className }: DataSourceDisclaimerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-white/50',
        className,
      )}
    >
      <Info className="size-3.5 mt-0.5 flex-shrink-0 text-white/40" />
      <p>
        Prices powered by time-series oracle data on Flare; off-chain fallbacks only where no oracle feed exists.
      </p>
    </div>
  );
}

