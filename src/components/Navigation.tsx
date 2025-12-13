'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from '@/components/brand/Logo';
import WalletButton from '@/components/WalletButton';
import { useAccount } from 'wagmi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard, HelpCircle, User, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/components/ui/utils';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const navItems = [
    { path: '/wallet', label: 'Portfolio' },
    { path: '/rangeband', label: 'RangeBand™' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQ' },
  ];

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200 border-b border-white/5',
        scrolled ? 'bg-[#0B1530]/95 backdrop-blur-sm shadow-lg' : 'bg-[#0B1530]',
        className
      )}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[84px] items-center justify-between">
          {/* Logo */}
          <Logo className="flex items-center gap-2 group transition-opacity hover:opacity-90" />

          {/* Desktop Navigation - centered between Logo and Right Side Actions */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navItems.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  'text-sm font-brand transition-all relative py-2',
                  isActive(link.path)
                    ? 'text-[#3B82F6] font-semibold'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3B82F6] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {!isConnected && (
              <Link
                href="/pricing"
                className="hidden xl:inline-flex items-center justify-center rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-brand font-medium shadow-lg shadow-blue-500/20 h-10 px-6 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
              >
                Start 14-day Pro trial
              </Link>
            )}
            
            <WalletButton />

            {/* Account Dropdown (only if connected) */}
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white/70 hover:border-white hover:text-white hover:bg-white/5 h-10 px-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
                  >
                    <User className="size-4" />
                    <ChevronDown className="size-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#0F1A36]/98 border-white/10 backdrop-blur-sm text-white"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="flex items-center gap-3 cursor-pointer text-white/95 hover:text-white focus:text-white focus:bg-white/5"
                    >
                      <CreditCard className="size-4" />
                      Your plan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/faq"
                      className="flex items-center gap-3 cursor-pointer text-white/95 hover:text-white focus:text-white focus:bg-white/5"
                    >
                      <HelpCircle className="size-4" />
                      Help & Support
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[84px] left-0 right-0 bg-[#0B1530] border-b border-white/10 shadow-xl animate-in slide-in-from-top-2 p-4 flex flex-col gap-4 min-h-[50vh]">
          {navItems.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'text-base font-brand py-3 px-4 rounded-lg transition-colors',
                isActive(link.path)
                  ? 'bg-white/5 text-[#3B82F6] font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="h-px bg-white/10 my-2" />
          
          <div className="flex flex-col gap-4 px-4 pb-4">
             <WalletButton className="w-full justify-center" />
             {!isConnected && (
               <Link
                 href="/pricing"
                 className="w-full inline-flex items-center justify-center rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-brand font-medium shadow-lg shadow-blue-500/20 px-6 py-2.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
               >
                 Start 14-day Pro trial
               </Link>
             )}
             {isConnected && (
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-start gap-2 rounded-xl border border-white/10 text-white hover:bg-white/5 px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
                >
                  <User className="size-4" />
                  My Account
                </Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
