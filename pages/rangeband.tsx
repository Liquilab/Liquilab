import Head from "next/head";
import Navigation from "@/components/Navigation";

export default function RangeBandPage() {
  return (
    <>
      <Head><title>RangeBand™ — LiquiLab</title></Head>
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">RangeBand™</h1>
        <p className="mt-2 opacity-80">
          RangeBand™ shows how your position range compares to the current pool price.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 p-6">
          <p className="opacity-80">RangeBand explainer content will be expanded here.</p>
          <p className="mt-3">
            Go to <a className="underline" href="/wallet">Wallet</a> to see RangeBand per position.
          </p>
        </div>
      </main>
    </>
  );
}
