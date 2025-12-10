import React from 'react';
import Link from 'next/link';

import Logo from '@/components/brand/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#0A0F1C] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-shrink-0">
            <Logo withLink={false} />
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3" aria-label="Footer navigation">
            <Link
              href="/pricing"
              className="font-ui text-sm font-medium text-[#9FA8B6] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6EA8FF] focus:ring-offset-2 focus:ring-offset-[#0A0F1C]"
            >
              Pricing
            </Link>
            <Link
              href="/rangeband"
              className="font-ui text-sm font-medium text-[#9FA8B6] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6EA8FF] focus:ring-offset-2 focus:ring-offset-[#0A0F1C]"
            >
              RangeBand™
            </Link>
            <Link
              href="/partners"
              className="font-ui text-sm font-medium text-[#9FA8B6] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6EA8FF] focus:ring-offset-2 focus:ring-offset-[#0A0F1C]"
            >
              Partners
            </Link>
            <Link
              href="/contact"
              className="font-ui text-sm font-medium text-[#9FA8B6] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6EA8FF] focus:ring-offset-2 focus:ring-offset-[#0A0F1C]"
            >
              Contact
            </Link>
            <span className="hidden text-[#9FA8B6]/30 sm:inline">|</span>
            <a
              href="https://t.me/liquilab"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Liquilab on Telegram"
              className="font-ui text-sm font-medium text-[#9FA8B6] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6EA8FF] focus:ring-offset-2 focus:ring-offset-[#0A0F1C]"
            >
              Telegram
            </a>
            <a
              href="https://x.com/liquilab"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Liquilab on X (Twitter)"
              className="font-ui text-sm font-medium text-[#9FA8B6] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6EA8FF] focus:ring-offset-2 focus:ring-offset-[#0A0F1C]"
            >
              X
            </a>
          </nav>
        </div>

        <div className="mt-6 border-t border-white/5 pt-6">
          <p className="font-ui text-xs text-[#9FA8B6]/60">© {currentYear} Liquilab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
