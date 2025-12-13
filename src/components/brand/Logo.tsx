import Link from 'next/link';
import type { ReactElement } from 'react';

type LogoProps = {
  withLink?: boolean;
  className?: string;
};

function DropletIcon(): ReactElement {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="liq-droplet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5BC6FF" />
          <stop offset="100%" stopColor="#2A6BFF" />
        </linearGradient>
      </defs>
      <path
        d="M9 1.2C8.6 1.8 3 8.4 3 12.4C3 15.8 5.7 18.5 9 18.5C12.3 18.5 15 15.8 15 12.4C15 8.4 9.4 1.8 9 1.2Z"
        fill="url(#liq-droplet)"
      />
    </svg>
  );
}

function LogoInner(): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <DropletIcon />
      <span className="text-sm font-semibold tracking-tight text-white">Liquilab</span>
    </div>
  );
}

export default function Logo({ withLink = true, className }: LogoProps): ReactElement {
  if (!withLink) {
    return (
      <div className={className}>
        <LogoInner />
      </div>
    );
  }

  return (
    <Link href="/" className={className} aria-label="Liquilab">
      <LogoInner />
    </Link>
  );
}
