'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GlobalCtaButton } from '@/components/GlobalCtaButton';

export function WalletUpgradePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="font-brand text-4xl font-semibold text-white mb-4">
          Upgrade to access Wallet Pro
        </h1>
        <p className="font-ui text-lg text-white/70 mb-8">
          Connect your wallet and upgrade to Premium or Pro to unlock advanced portfolio analytics, 
          performance insights, and peer benchmarking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GlobalCtaButton className="px-8 py-3" />
          <Link href="/pricing" legacyBehavior passHref>
            <Button
              as="a"
              variant="ghost"
              className="px-8 py-3 border border-white/20 text-white hover:bg-white/10"
            >
              View pricing plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

