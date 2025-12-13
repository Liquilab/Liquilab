'use client';

import Head from 'next/head';
import { WalletProPage } from '@/components/wallet/WalletProPage';
import { WalletUpgradePage } from '@/components/wallet/WalletUpgradePage';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

function WalletPageContent() {
  const { subscriptionTier, isLoading } = useSubscriptionTier();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-white/70 font-ui">Loading...</div>
      </div>
    );
  }

  // PRO or ENTERPRISE → WalletProPage
  if (subscriptionTier === 'PRO' || subscriptionTier === 'ENTERPRISE') {
    return <WalletProPage />;
  }

  // PREMIUM, VISITOR, or any other → WalletUpgradePage
  return <WalletUpgradePage />;
}

export default function WalletPage() {
  return (
    <div className="bg-[#0B1221]">
      <Head>
        <title>Portfolio Pro · Liquilab</title>
      </Head>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <WalletPageContent />
      </div>
    </div>
  );
}
