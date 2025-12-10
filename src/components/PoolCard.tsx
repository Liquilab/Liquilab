import { Link } from 'react-router-dom';
import { TokenPairIcon } from './TokenIcon';
import { Rangeband } from './Rangeband';

// Helper function to determine strategy name from percentage
function getStrategyName(percentStr: string): string {
  const percent = parseFloat(percentStr.replace('%', ''));
  if (percent < 12) return 'Aggressive';
  if (percent <= 35) return 'Balanced';
  return 'Conservative';
}

export function PoolCard({ 
  currentPrice = 1.27500,
  minPrice = 0.980000,
  maxPrice = 1.93000,
  strategyPercent = "20.0%",
  token1 = "FXRP",
  token2 = "USDT0",
  poolId = "#22003",
  fee = "0,3 %",
  dex = "ENOSYS"
}: { 
  currentPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  strategyPercent?: string;
  token1?: string;
  token2?: string;
  poolId?: string;
  fee?: string;
  dex?: string;
}) {
  // Extract numeric pool ID from poolId string (e.g., "#22003" -> "22003")
  const numericPoolId = poolId.replace('#', '');
  
  return (
    <Link to={`/pool/${numericPoolId}`} className="block">
      <div className="bg-[#0F1A36]/95 rounded-xl border border-white/10 hover:border-[#3B82F6]/50 transition-all cursor-pointer overflow-hidden">
      {/* Pool header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <TokenPairIcon token1={token1} token2={token2} />
          <div className="flex flex-col gap-1">
            <p className="text-white text-sm">
              {token1} / {token2}
            </p>
            <p className="text-white/40 text-xs">
              {dex}  •  {poolId}  •  {fee}
            </p>
          </div>
        </div>

        {/* Pool details - 2 column grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {/* Column 1: TVL */}
        <div className="flex flex-col gap-1">
          <p className="text-white/50 text-xs">
            TVL
          </p>
          <p className="text-white">
            $ 289,1K
          </p>
          <p className="text-white/40 text-xs">
            370 XRP
          </p>
          <p className="text-white/40 text-xs">
            1.254 USDT0
          </p>
        </div>

        {/* Column 2: Incentives */}
        <div className="flex flex-col gap-1">
          <p className="text-white/50 text-xs">
            Incentives
          </p>
          <p className="text-white">
            $ 25,43
          </p>
          <p className="text-white/40 text-xs">
            127 rFLR
          </p>
        </div>

        {/* Column 1: Unclaimed fees */}
        <div className="flex flex-col gap-1">
          <p className="text-white/50 text-xs">
            Unclaimed fees
          </p>
          <p className="text-white">
            $ 845,76
          </p>
          <p className="text-white/40 text-xs">
            370 XRP
          </p>
          <p className="text-white/40 text-xs">
            1.254 USDT0
          </p>
        </div>

        {/* Column 2: APR */}
        <div className="flex flex-col gap-1">
          <p className="text-white/50 text-xs">
            APR
          </p>
          <p className="text-emerald-600">
            23,85%
          </p>
          <p className="text-xs whitespace-nowrap">
            <span className="text-white">24H</span>
            <span className="text-white/40">  7D  30D  90D</span>
          </p>
        </div>
        </div>

        {/* Rangeband section - always shown */}
        <div className="pt-6 pb-2">
          <Rangeband 
            variant="card"
            currentPrice={currentPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            strategyLabel={`${getStrategyName(strategyPercent)} (${strategyPercent})`}
            pairLabel={`${token1}/${token2}`}
          />
        </div>
      </div>
      </div>
    </Link>
  );
}