import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import { Navigation } from '@/components/Navigation';
import { WaveBackground } from '@/components/WaveBackground';
import PoolUniversePage from '@/components/pool/PoolUniversePage';
import { getFallbackPoolAddressForSlug, parsePairSlug } from '@/lib/pools/pairSlug';

const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i;

type Props = {
  poolAddress: string;
};

export default function PoolUniverseRoute({ poolAddress }: Props) {
  return (
    <div className="min-h-screen bg-[#0B1530] text-white">
      <Head>
        <title>Pool Universe · Liquilab</title>
        <meta
          name="description"
          content="Pool Universe analytics across all DEX pools for a given token pair on Flare."
        />
      </Head>
      <WaveBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navigation />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <PoolUniversePage poolAddress={poolAddress} />
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const rawParam = ctx.params?.poolAddress;
  if (!rawParam) {
    return { notFound: true };
  }

  const value = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const trimmed = value.trim();

  // If it's already a valid address, use it directly
  if (ADDRESS_REGEX.test(trimmed)) {
    return {
      props: {
        poolAddress: trimmed.toLowerCase(),
      },
    };
  }

  // Try to parse as a pair slug (e.g., "fxrp-usdt0")
  const parsed = parsePairSlug(trimmed);
  if (!parsed) {
    return { notFound: true };
  }

  // Use fallback mapping for known pair slugs
  const fallbackAddress = getFallbackPoolAddressForSlug(trimmed);
  if (fallbackAddress) {
    return {
      props: {
        poolAddress: fallbackAddress.toLowerCase(),
      },
    };
  }

  // No fallback available for this pair slug
  console.warn(
    '[POOL_UNIVERSE] Unable to resolve poolAddress for pair slug %s (%s/%s); returning 404',
    trimmed,
    parsed.symbolA,
    parsed.symbolB,
  );
  return { notFound: true };
};
