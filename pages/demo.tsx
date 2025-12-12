import type { GetServerSideProps } from 'next';

const DemoRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/',
    permanent: false,
  },
});

<<<<<<< HEAD
export default function DemoPage() {
  return (
    <>
      <Head>
        <title>Network metrics · LiquiLab</title>
        <meta
          name="description"
          content="Track Flare network TVL and pool counts across Enosys and SparkDEX in one calm overview."
        />
      </Head>
      <div className="relative min-h-screen overflow-hidden text-white">
        <div className="page-bg" aria-hidden="true" />
        <Header showTabs={false} currentPage="home" />

        <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-20 sm:px-8 md:gap-12 md:py-24">
          <NetworkMetrics />
        </main>
      </div>
    </>
  );
}
=======
export default DemoRedirect;
>>>>>>> a54508f7 (chore: stabilize pricing and wallet parity)
