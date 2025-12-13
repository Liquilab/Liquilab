import Head from "next/head";
import Navigation from "@/components/Navigation";

export default function PricingPage() {
  return (
    <>
      <Head><title>Pricing — LiquiLab</title></Head>
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Pricing</h1>
        <p className="mt-2 opacity-80">
          Choose Premium or Pro to unlock portfolio analytics and RangeBand™ insights.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 p-6">
          <p className="opacity-80">Pricing UI will be finalized here next.</p>
          <p className="mt-3">
            <a className="underline" href="/connect">Connect wallet</a> or{" "}
            <a className="underline" href="/wallet">view wallet</a>.
          </p>
        </div>
      </main>
    </>
  );
}
