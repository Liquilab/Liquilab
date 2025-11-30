import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface WarmingPlaceholderProps {
  className?: string;
  title?: string;
  showSpinner?: boolean;
}

export function WarmingPlaceholder({
  className,
  title = 'Building 7-day history',
  showSpinner = true,
}: WarmingPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-white/5 bg-[#0B1530]/60 px-6 py-8 text-center',
        className,
      )}
    >
      {showSpinner && (
        <Loader2 className="mb-3 size-5 animate-spin text-yellow-400/60" />
      )}
      <p className="text-sm font-medium text-white/60">{title}</p>
      <p className="mt-1 text-xs text-white/40">
        This section will populate once 7-day metrics are available
      </p>
      <div className="mt-4 flex w-full flex-col gap-2">
        <Skeleton className="h-4 w-full bg-white/5" />
        <Skeleton className="h-4 w-3/4 bg-white/5" />
        <Skeleton className="h-4 w-1/2 bg-white/5" />
      </div>
    </div>
  );
}

