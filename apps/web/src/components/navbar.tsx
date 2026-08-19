'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CroveLogo } from './crove-logo';
import { ThemeToggle } from './theme/theme-toggle';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.crove.com';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm shadow-zinc-950/5'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center focus:outline-none">
          <CroveLogo size={36} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            href="#features"
            className="px-3.5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors"
          >
            Tính năng
          </Link>
          <Link
            href="#channels"
            className="px-3.5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-1.5"
          >
            28+ Kênh
            <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full font-semibold border border-brand-500/20">
              Hot
            </span>
          </Link>
          <Link
            href="#preview"
            className="px-3.5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors"
          >
            Trải nghiệm
          </Link>
          <Link
            href="#how-it-works"
            className="px-3.5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors"
          >
            Cách hoạt động
          </Link>
          <Link
            href="#pricing"
            className="px-3.5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors"
          >
            Bảng giá
          </Link>
          <Link
            href="#faq"
            className="px-3.5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* Right CTA & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          <a
            href={`${APP_URL}/auth/login`}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            Đăng nhập
          </a>

          <a
            href={`${APP_URL}/auth/login`}
            className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Bắt đầu miễn phí
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-1">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-base font-medium text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Tính năng
            </Link>
            <Link
              href="#channels"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-base font-medium text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between"
            >
              28+ Nền tảng
              <span className="text-xs bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded-full font-semibold">
                Đầy đủ
              </span>
            </Link>
            <Link
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-base font-medium text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Trải nghiệm Demo
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-base font-medium text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cách hoạt động
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-base font-medium text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Bảng giá
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-base font-medium text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              FAQ
            </Link>
          </nav>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2.5">
            <a
              href={`${APP_URL}/auth/login`}
              className="w-full py-2.5 text-center font-medium text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900"
            >
              Đăng nhập
            </a>
            <a
              href={`${APP_URL}/auth/login`}
              className="w-full py-2.5 text-center font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl shadow-md shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Bắt đầu miễn phí ngay
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
