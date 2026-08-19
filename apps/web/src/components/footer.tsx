'use client';

import React from 'react';
import Link from 'next/link';
import { CroveLogo } from './crove-logo';
import { ThemeToggle } from './theme/theme-toggle';
import { ShieldCheck, Heart } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.crove.com';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <CroveLogo size={36} />
            </Link>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Crove là nền tảng quản lý, lên lịch và tự động phân phối bài viết đa kênh
              mạnh mẽ hàng đầu thế giới với sự hỗ trợ của AI cho 28+ mạng xã hội.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hệ thống hoạt động 99.99% Uptime
              </span>
            </div>
          </div>

          {/* Col 3: Sản phẩm */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Sản Phẩm
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Tính năng nổi bật
                </Link>
              </li>
              <li>
                <Link href="#channels" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  28+ Mạng xã hội
                </Link>
              </li>
              <li>
                <Link href="#preview" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Trải nghiệm tương tác
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Bảng giá & Gói cước
                </Link>
              </li>
              <li>
                <Link href="#comparison" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  So sánh với đối thủ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hỗ trợ & Kênh */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Nền Tảng Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <a href="#channels" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  TikTok & YouTube Shorts
                </a>
              </li>
              <li>
                <a href="#channels" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Facebook & Instagram Reels
                </a>
              </li>
              <li>
                <a href="#channels" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  LinkedIn & X (Twitter)
                </a>
              </li>
              <li>
                <a href="#channels" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Discord & Telegram Channels
                </a>
              </li>
              <li>
                <a href="#channels" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Reddit & Webhooks API
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Pháp lý & Tài khoản */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Tài Khoản & Pháp Lý
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <a href={`${APP_URL}/auth/login`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Đăng nhập Dashboard
                </a>
              </li>
              <li>
                <a href={`${APP_URL}/auth/login`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Tạo tài khoản mới
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <div className="pt-2">
                  <ThemeToggle />
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-14 pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            &copy; 2026 Crove Platform. All rights reserved. Powered by Postiz Architecture.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision & passion for creators worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
