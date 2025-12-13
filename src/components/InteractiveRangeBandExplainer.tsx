'use client';

import React from 'react';
import { RangeBand } from '@/components/pools/PoolRangeIndicator';

export function InteractiveRangeBandExplainer() {
  return (
    <div className="py-4">
      <RangeBand 
        min={2.00}
        max={2.33}
        current={2.03}
        status="in"
        token0Symbol="FXRP"
        token1Symbol="USDT0"
        explainer={true}
      />
    </div>
  );
}

export default InteractiveRangeBandExplainer;
