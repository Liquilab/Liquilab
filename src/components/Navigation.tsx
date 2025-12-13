import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          LiquiLab
        </Link>
        <div className="flex items-center gap-4 text-sm opacity-90">
          <Link href="/pricing" className="hover:opacity-100">Pricing</Link>
          <Link href="/rangeband" className="hover:opacity-100">RangeBand</Link>
          <Link href="/wallet" className="hover:opacity-100">Wallet</Link>
        </div>
      </div>
    </nav>
  );
}
