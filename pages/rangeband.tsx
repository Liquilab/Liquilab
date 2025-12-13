// Canonical RangeBand page — DO NOT replace with legacy layouts; update RangeBandPage.tsx and shared components instead.
import Head from 'next/head';
import RangeBandPage from '@/components/rangeband/RangeBandPage';

export default function RangeBandRoute() {
  return (
    <>
      <Head>
        <title>RangeBand™ · Liquilab</title>
        <meta
          name="description"
          content="See your pool's health at a glance. Live price, range boundaries, and status — all in one elegant line."
        />
      </Head>
      <RangeBandPage />
    </>
  );
}