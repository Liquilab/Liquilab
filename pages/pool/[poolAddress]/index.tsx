import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import Footer from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import { WaveBackground } from '@/components/WaveBackground';
import PoolUniversePage from '@/components/pool/PoolUniversePage';
import { ADDRESS_REGEX, getCanonicalPoolAddressForSymbolPair } from '@/lib/analytics/db';
import { getFallbackPoolAddressForSlug, parsePairSlug } from '@/lib/pools/pairSlug';

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
        <Footer />
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

  if (ADDRESS_REGEX.test(trimmed)) {
    return {
      props: {
        poolAddress: trimmed.toLowerCase(),
      },
    };
  }

  const parsed = parsePairSlug(trimmed);
  if (!parsed) {
    return { notFound: true };
  }

  let canonicalPoolAddress: string | null = null;

  try {
    canonicalPoolAddress = await getCanonicalPoolAddressForSymbolPair(parsed.symbolA, parsed.symbolB);
  } catch (error) {
    console.error(
      '[POOL_UNIVERSE] Error resolving canonical pool for slug %s (%s/%s): %o',
      trimmed,
      parsed.symbolA,
      parsed.symbolB,
      error,
    );
  }

  if (!canonicalPoolAddress) {
    const fallbackAddress = getFallbackPoolAddressForSlug(trimmed);
    if (fallbackAddress) {
      console.log('[POOL_UNIVERSE] Pair slug fallback used for slug %s -> %s', trimmed, fallbackAddress);
      canonicalPoolAddress = fallbackAddress;
    }
  }

  if (!canonicalPoolAddress) {
    console.warn(
      '[POOL_UNIVERSE] Unable to resolve poolAddress for pair slug %s (%s/%s); returning 404',
      trimmed,
      parsed.symbolA,
      parsed.symbolB,
    );
    return { notFound: true };
  }

  return {
    props: {
      poolAddress: canonicalPoolAddress.toLowerCase(),
    },
  };
};
