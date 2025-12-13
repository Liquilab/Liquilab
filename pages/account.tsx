import Head from "next/head";
import Navigation from "@/components/Navigation";

export default function AccountPage() {
  return (
    <>
      <Head><title>Account — LiquiLab</title></Head>
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-2 opacity-80">
          Subscription and preferences will live here.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 p-6">
          <p className="opacity-80">Account UI coming next.</p>
        </div>
      </main>
    </>
  );
}
