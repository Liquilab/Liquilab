import { Database } from "lucide-react";

interface DataSourceDisclaimerProps {
  className?: string;
}

export function DataSourceDisclaimer({ className = '' }: DataSourceDisclaimerProps) {
  return (
    <div className={`bg-[#0B1530]/40 border border-white/5 rounded-lg p-4 flex items-start gap-3 ${className}`}>
      <Database className="size-4 text-[#1BE8D2] flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-white/[0.58] text-xs mb-1">Data Sources</div>
        <p className="text-white/70 text-sm">
          Prices powered by time-series oracle data on Flare; off-chain fallbacks only where no oracle feed exists.
        </p>
      </div>
    </div>
  );
}
