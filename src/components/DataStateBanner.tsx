import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DataState = 'ok' | 'warming' | 'empty';

interface DataStateBannerProps {
  state: DataState;
  className?: string;
  children?: React.ReactNode;
  context?: 'universe' | 'pool' | 'position';
}

export default function DataStateBanner({ state, className, children, context = 'universe' }: DataStateBannerProps) {
  if (state === 'ok') {
    return null;
  }

  const contextLabel = context === 'universe' ? 'Universe' : context === 'pool' ? 'Pool' : 'Position';

  if (state === 'warming') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100',
          className,
        )}
      >
        <Loader2 className="size-4 animate-spin text-yellow-400" />
        <div className="flex-1">
          <p className="font-medium">{contextLabel} data warming up</p>
          <p className="text-xs text-yellow-200/80">
            Some metrics are based on partial history. Full 7-day data will be available once the backfill completes.
          </p>
        </div>
        {children}
      </div>
    );
  }

  // state === 'empty'
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-white/10 bg-[#0B1530] px-4 py-3 text-sm text-white/70',
        className,
      )}
    >
      <AlertCircle className="size-4 text-white/50" />
      <div className="flex-1">
        <p className="font-medium text-white/90">Not enough history yet</p>
        <p className="text-xs text-white/60">
          Not enough history yet to show {contextLabel.toLowerCase()} analytics{context === 'position' ? ' for this position' : context === 'pool' ? ' for this pool' : ''}. Data will appear as events are indexed.
        </p>
      </div>
      {children}
    </div>
  );
}

