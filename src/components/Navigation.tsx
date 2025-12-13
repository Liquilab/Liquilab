'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from '@/components/brand/Logo';
import WalletButton from '@/components/WalletButton';
import { useAccount } from 'wagmi';
import { CreditCard, HelpCircle, User, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/components/ui/utils';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuOpen && !(e.target as Element).closest('.account-menu')) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [accountMenuOpen]);

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
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <Logo className="flex items-center gap-2 group transition-opacity hover:opacity-90" />

          {/* Desktop Navigation - centered */}
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
          <div className="hidden lg:flex items-center gap-3">
            <WalletButton />

            {/* Account Dropdown */}
            {isConnected && (
              <div className="relative account-menu">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white h-10 px-3 text-sm transition"
                >
                  <User className="size-4" />
                  <ChevronDown className={cn("size-3 transition-transform", accountMenuOpen && "rotate-180")} />
                </button>
                
                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#0F1A36] shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <CreditCard className="size-4" />
                      Account
                    </Link>
                    <Link
                      href="/faq"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <HelpCircle className="size-4" />
                      Help & Support
                    </Link>
                  </div>
                )}
              </div>
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
        <div className="lg:hidden absolute top-[72px] left-0 right-0 bg-[#0B1530] border-b border-white/10 shadow-xl p-4 flex flex-col gap-2">
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
          
          <div className="flex flex-col gap-3 px-4 pb-2">
            <WalletButton className="w-full justify-center" />
            {isConnected && (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 px-4 py-2.5 text-sm transition"
              >
                <User className="size-4" />
                Account
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
