import Head from 'next/head';

import Footer from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import { WaveBackground } from '@/components/WaveBackground';
import { WalletProPage } from '@/components/wallet/WalletProPage';

export default function WalletProRoute() {
  return (
    <WaveBackground>
      <Head>
        <title>Wallet Pro · Liquilab</title>
      </Head>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <WalletProPage />
        <Footer />
      </div>
    </WaveBackground>
  );
}
