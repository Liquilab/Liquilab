import { AlertCircle, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";

export type DataState = 'ok' | 'warming' | 'empty';

interface DataStateBannerProps {
  state: DataState;
  message?: string;
  className?: string;
}

export function DataStateBanner({ state, message, className = '' }: DataStateBannerProps) {
  if (state === 'ok') return null;

  if (state === 'warming') {
    return (
      <div className={`bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg p-4 flex items-start gap-3 ${className}`}>
        <Loader2 className="size-5 text-[#F59E0B] flex-shrink-0 animate-spin" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/95 font-medium">Warming Up</span>
            <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30 text-xs">
              Partial Data
            </Badge>
          </div>
          <p className="text-white/70 text-sm">
            {message || "Universe data warming up — some metrics are based on partial history."}
          </p>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className={`bg-[#0F1A36]/95 border border-white/10 rounded-xl p-12 text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="size-8 text-[#3B82F6]" />
        </div>
        <h3 className="text-white/95 mb-2">Not Enough History Yet</h3>
        <p className="text-white/70 max-w-md mx-auto">
          {message || "We don't have enough history yet to show Universe analytics for this pool. Check back soon as we build the dataset."}
        </p>
      </div>
    );
  }

  return null;
}

interface WarmingPlaceholderProps {
  title: string;
  description?: string;
  className?: string;
}

export function WarmingPlaceholder({ title, description, className = '' }: WarmingPlaceholderProps) {
  return (
    <div className={`bg-[#0B1530]/60 border border-[#F59E0B]/20 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <Loader2 className="size-5 text-[#F59E0B] flex-shrink-0 animate-spin mt-0.5" />
        <div>
          <h4 className="text-white/70 mb-1">{title}</h4>
          {description && (
            <p className="text-white/40 text-sm">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded animate-pulse" style={{ width: '80%' }} />
        <div className="h-3 bg-white/5 rounded animate-pulse" style={{ width: '60%' }} />
        <div className="h-3 bg-white/5 rounded animate-pulse" style={{ width: '90%' }} />
      </div>
      <p className="text-xs text-[#F59E0B] mt-4 flex items-center gap-1.5">
        <AlertTriangle className="size-3.5" />
        Building 7-day history — available soon
      </p>
    </div>
  );
}
