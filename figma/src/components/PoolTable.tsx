import { Link } from 'react-router-dom';
import { TokenPairIcon } from './TokenIcon';
import { Rangeband } from './Rangeband';

// Helper function to determine strategy name from percentage
function getStrategyName(percentStr: string | number): string {
  // Convert to string if it's a number
  const strValue = typeof percentStr === 'string' ? percentStr : String(percentStr);
  const percent = parseFloat(strValue.replace('%', ''));
  if (percent < 12) return 'Aggressive';
  if (percent <= 35) return 'Balanced';
  return 'Conservative';
}

export function PoolTableHeader() {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-white/[0.03]">
      <div className="font-['Manrope',sans-serif] font-light text-white/40 text-sm">
        Pool specifications
      </div>
      <div className="font-['Manrope',sans-serif] font-light text-white/40 text-sm">
        TVL
      </div>
      <div className="font-['Manrope',sans-serif] font-light text-white/40 text-sm">
        Unclaimed fees
      </div>
      <div className="font-['Manrope',sans-serif] font-light text-white/40 text-sm">
        Incentives
      </div>
      <div className="font-['Manrope',sans-serif] font-light text-white/40 text-sm">
        APR
      </div>
    </div>
  );
}

export function PoolTableRow({ 
  token1 = "FXRP",
  token2 = "USDT0",
  poolId = "#22003",
  fee = "0,3 %",
  dex = "ENOSYS",
  currentPrice = 1.27500,
  minPrice = 0.980000,
  maxPrice = 1.93000,
  strategyPercent = "20.0%",
  showUniverseLink = false
}: { 
  token1?: string;
  token2?: string;
  poolId?: string;
  fee?: string;
  dex?: string;
  currentPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  strategyPercent?: string;
  showUniverseLink?: boolean;
} = {}) {
  // Extract numeric pool ID from poolId string (e.g., "#22003" -> "22003")
  const numericPoolId = poolId.replace('#', '');
  
  return (
    <div className="bg-[#0F1A36]/95 border-b border-white/[0.03] last:border-0 overflow-hidden">
      <Link to={`/pool/${numericPoolId}`} className="block hover:bg-white/[0.02] transition-colors">
        {/* KPI Row */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 pt-5 pb-5">
          {/* Pool specifications column */}
          <div className="flex items-center gap-3">
            <TokenPairIcon token1={token1} token2={token2} />
            <div className="flex flex-col gap-1">
              <p className="text-white">
                {token1} / {token2}
              </p>
              <p className="text-white/40 text-sm">
                {dex}  •  {poolId}  •  {fee}
              </p>
            </div>
          </div>

          {/* TVL column */}
          <div className="flex flex-col gap-1">
            <p className="text-white numeric">
              $ 289,1K
            </p>
            <div className="text-white/40">
              <p className="mb-0 text-xs numeric">370 {token1}</p>
              <p className="text-xs numeric">1.254 {token2}</p>
            </div>
          </div>

          {/* Unclaimed fees column */}
          <div className="flex flex-col gap-1">
            <p className="text-white numeric">
              $ 845,76
            </p>
            <div className="text-white/40">
              <p className="mb-0 text-xs numeric">370 {token1}</p>
              <p className="text-xs numeric">1.254 {token2}</p>
            </div>
          </div>

          {/* Incentives column */}
          <div className="flex flex-col gap-1">
            <p className="text-white numeric">
              $ 25,43
            </p>
            <p className="text-xs text-white/40 numeric">
              127 rFLR
            </p>
          </div>

          {/* APR column */}
          <div className="flex flex-col gap-1">
            <p className="text-emerald-600 numeric">
              23,85%
            </p>
            <p className="text-sm whitespace-nowrap">
              <span className="text-white">24H</span>
              <span className="text-white/40">  7D  30D  90D</span>
            </p>
          </div>
        </div>

        {/* Rangeband Row - aligned with grid, spans full width */}
        <div className="px-6 pb-7">
          <Rangeband 
            variant="list"
            currentPrice={currentPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            strategyLabel={`${getStrategyName(strategyPercent)} (${strategyPercent})`}
            pairLabel={`${token1}/${token2}`}
          />
        </div>
      </Link>
      
      {/* Universe Link (Pro only) */}
      {showUniverseLink && (
        <div className="px-6 pb-5 pt-2 border-t border-white/5">
          <Link 
            to={`/pool/${numericPoolId}/universe`}
            className="inline-flex items-center gap-2 text-[#1BE8D2] hover:underline text-sm"
          >
            View Pool Universe →
          </Link>
        </div>
      )}
    </div>
  );
}

// Remove the old PoolTableRowWithRangeband component - no longer needed
export const PoolTableRowWithRangeband = PoolTableRow;