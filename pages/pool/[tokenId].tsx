'use client';

import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PoolUniversePage from '@/components/pool/PoolUniversePage';

interface PoolPageProps {
  poolAddress: string;
}

function formatTitleAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function PoolUniverseRoute({ poolAddress }: PoolPageProps) {
  const titleAddress = formatTitleAddress(poolAddress);

  return (
    <>
      <Head>
        <title>{titleAddress ? `Pool · ${titleAddress}` : 'Pool Analytics'} · LiquiLab</title>
        <meta
          name="description"
          content="Detailed analytics for V3 liquidity pool on Flare — TVL, fees, positions, and market intelligence."
        />
      </Head>

      <div className="min-h-screen bg-[#010615] font-ui text-white">
        {/* Page background with wave */}
        <div className="page-bg" aria-hidden="true" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <Header currentPage="pools" showTabs={false} showWalletActions={false} />

          <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 pb-20 pt-8 md:px-6 lg:px-8">
            <PoolUniversePage poolAddress={poolAddress} />
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const param = typeof context.params?.tokenId === 'string' ? context.params.tokenId : '';

  // Normalize pool address to lowercase
  const poolAddress = param.toLowerCase();

  return {
    props: {
      poolAddress,
    },
  };
};
