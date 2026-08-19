'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle2,
  Play,
  Share2,
  Clock,
  Zap,
} from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.crove.com';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] md:w-[900px] h-[450px] md:h-[600px] bg-gradient-to-tr from-brand-600/25 via-brand-500/15 to-fuchsia-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-brand-400/10 dark:bg-brand-600/15 blur-[90px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/10 dark:bg-purple-900/20 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-40 -z-10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top announcement pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-white/70 dark:bg-brand-950/40 backdrop-blur-md shadow-sm shadow-brand-500/10 text-xs sm:text-sm font-medium text-brand-700 dark:text-brand-300 animate-fade-in">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span>Crove 2.0 • Trợ lý AI Tự Động Phân Phối Đa Kênh</span>
            <span className="text-zinc-400 dark:text-zinc-500">|</span>
            <span className="hidden sm:inline font-semibold text-brand-600 dark:text-brand-400">
              Tiết kiệm 80% thời gian
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
            Lên lịch & Tự động Đăng bài{' '}
            <span className="text-gradient-purple block sm:inline">
              Đa Kênh 28+ Nền Tảng
            </span>{' '}
            với Sức Mạnh AI
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Chỉ với 1 cú click, biến 1 ý tưởng thành các định dạng tối ưu chuẩn SEO
            cho TikTok, Facebook, YouTube Shorts, LinkedIn, X, Instagram và phân
            phối chính xác vào khung giờ vàng.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <a
              href={`${APP_URL}/auth/login`}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-base shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group"
            >
              <Sparkles className="w-5 h-5 text-brand-200" />
              <span>Bắt đầu dùng thử miễn phí</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <Link
              href="#preview"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 hover:text-brand-600 dark:hover:text-white hover:border-brand-300 dark:hover:border-brand-500/50 font-semibold text-base backdrop-blur-md hover:bg-white/90 dark:hover:bg-zinc-900/90 shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-brand-500" />
              <span>Xem Demo Trực Tiếp</span>
            </Link>
          </div>

          {/* Trust bullet points */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Không cần thẻ tín dụng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Kết nối 28+ MXH chỉ trong 2 phút</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Cam kết bảo mật 100% qua Official API</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="mt-14 sm:mt-18 relative max-w-5xl mx-auto">
          {/* Glowing backdrop border */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-40 dark:opacity-60 animate-glow-pulse" />

          {/* Main Dashboard Window */}
          <div className="relative rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Window Top bar */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  app.crove.com/launches
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced: 28 Channels
                </span>
              </div>
            </div>

            {/* Simulated Workspace View */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Header metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Đã lên lịch
                    </div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">
                      42 Bài viết
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Tự động hoá
                    </div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">
                      98.6%
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Kênh kết nối
                    </div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">
                      12 Kênh active
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Lượt tiếp cận
                    </div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">
                      +348.2k
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-platform post preview card */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Chiến dịch: "Ra mắt tính năng AI Copilot v2.0"
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>Đăng vào 20:00 tối nay (Giờ vàng tương tác)</span>
                  </div>
                </div>

                {/* Simulated platforms row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* TikTok Card */}
                  <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-zinc-900 dark:text-white">
                        <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                        TikTok Video
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
                        9:16 Short
                      </span>
                    </div>
                    <div className="h-16 rounded-md bg-zinc-200 dark:bg-zinc-800/80 flex items-center justify-center text-xs text-zinc-500">
                      🎬 Video teaser 30s
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      🚀 Cách tự động hoá đăng bài 28 kênh cùng lúc chỉ trong 10 giây...
                    </p>
                  </div>

                  {/* LinkedIn Card */}
                  <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        LinkedIn
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                        B2B Post
                      </span>
                    </div>
                    <div className="p-2 rounded-md bg-zinc-200/70 dark:bg-zinc-800/80 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                      💼 Case study & Infographic
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      Tối ưu hoá quy trình Social Media Marketing cho Agency với hệ thống Automation...
                    </p>
                  </div>

                  {/* Facebook & Instagram Card */}
                  <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        Facebook & Reels
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                        Carousel
                      </span>
                    </div>
                    <div className="h-16 rounded-md bg-zinc-200 dark:bg-zinc-800/80 flex items-center justify-center text-xs text-zinc-500">
                      🖼️ 5 Slide hình ảnh HD
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      Check ngay bộ công cụ tăng trưởng tương tác đa nền tảng tốt nhất 2026!
                    </p>
                  </div>

                  {/* X / Twitter Thread */}
                  <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-zinc-900 dark:text-white">
                        <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                        X (Twitter)
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                        Thread 1/5
                      </span>
                    </div>
                    <div className="p-2 rounded-md bg-zinc-200/70 dark:bg-zinc-800/80 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                      🧵 Auto-split Thread
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      1/5: Làm sao để 1 người quản lý được 15 fanpage và kênh TikTok cùng lúc? 🧵👇
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
