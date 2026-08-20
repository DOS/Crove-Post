'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CroveLogo } from './crove-logo';
import { ThemeToggle } from './theme/theme-toggle';
import { LanguageToggle } from './language-toggle';
import { useI18n } from '../i18n/i18n-context';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://post.crove.com';

export function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-3 px-3 sm:px-6 lg:px-8">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between ${
          scrolled
            ? 'bg-white/85 dark:bg-[#0c0c16]/85 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-lg shadow-brand-950/5 dark:shadow-brand-950/20'
            : 'bg-white/50 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/40'
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center focus:outline-none">
          <CroveLogo size={34} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            href="#features"
            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors"
          >
            {t.nav.features}
          </Link>
          <Link
            href="#channels"
            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors flex items-center gap-1.5"
          >
            {t.nav.channels}
            <span className="text-[9px] bg-brand-500/15 text-brand-600 dark:text-brand-400 px-1.5 py-0.2 rounded-full font-bold border border-brand-500/25">
              {t.nav.channelsBadge}
            </span>
          </Link>
          <Link
            href="#preview"
            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors"
          >
            {t.nav.preview}
          </Link>
          <Link
            href="#how-it-works"
            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors"
          >
            {t.nav.howItWorks}
          </Link>
          <Link
            href="#comparison"
            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors"
          >
            {t.nav.comparison}
          </Link>
          <Link
            href="#pricing"
            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors"
          >
            {t.nav.pricing}
          </Link>
          <Link
            href="#faq"
            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors"
          >
            {t.nav.faq}
          </Link>
        </nav>

        {/* Right CTA & Switchers */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Language Switcher */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          <a
            href={`${APP_URL}/auth/login`}
            className="px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-brand-600 dark:hover:text-white transition-colors"
          >
            {t.nav.login}
          </a>

          <a
            href={`${APP_URL}/auth/login`}
            className="relative group px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {t.nav.getStarted}
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-7xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-fade-in">
          <nav className="flex flex-col space-y-1">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-600 rounded-lg"
            >
              {t.nav.features}
            </Link>
            <Link
              href="#channels"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-600 rounded-lg flex items-center justify-between"
            >
              <span>{t.nav.channels}</span>
              <span className="text-[10px] bg-brand-500/10 text-brand-600 px-1.5 py-0.5 rounded-full font-bold">
                {t.nav.channelsBadge}
              </span>
            </Link>
            <Link
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-600 rounded-lg"
            >
              {t.nav.preview}
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-600 rounded-lg"
            >
              {t.nav.howItWorks}
            </Link>
            <Link
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-600 rounded-lg"
            >
              {t.nav.comparison}
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-600 rounded-lg"
            >
              {t.nav.pricing}
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-600 rounded-lg"
            >
              {t.nav.faq}
            </Link>
          </nav>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-2">
            <a
              href={`${APP_URL}/auth/login`}
              className="w-full text-center py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl"
            >
              {t.nav.login}
            </a>
            <a
              href={`${APP_URL}/auth/login`}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5"
            >
              <span>{t.nav.getStarted}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
