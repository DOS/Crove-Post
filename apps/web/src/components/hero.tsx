'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '../i18n/i18n-context';
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
  Plus,
  Video,
  Send,
  Sliders,
  Check,
} from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://post.crove.com';

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[850px] h-[400px] md:h-[550px] bg-gradient-to-tr from-brand-600/20 via-brand-500/12 to-fuchsia-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-12 right-12 w-64 h-64 bg-brand-500/10 blur-[90px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 dark:opacity-40 -z-10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_75%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-5">
          {/* Top announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-white/80 dark:bg-brand-950/40 backdrop-blur-md shadow-sm shadow-brand-500/10 text-xs font-semibold text-brand-700 dark:text-brand-300 animate-fade-in">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span>{t.hero.announcement}</span>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {t.hero.announcementHighlight}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
            {t.hero.titleStart}
            <span className="text-gradient-purple block sm:inline">
              {t.hero.titleGradient}
            </span>
            {t.hero.titleEnd}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <a
              href={`${APP_URL}/auth/login`}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-brand-200" />
              <span>{t.hero.startFree}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>

            <Link
              href="#preview"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 hover:text-brand-600 dark:hover:text-white hover:border-brand-300 dark:hover:border-brand-500/40 font-semibold text-sm backdrop-blur-md hover:bg-white dark:hover:bg-zinc-900 shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current text-brand-500" />
              <span>{t.hero.watchDemo}</span>
            </Link>
          </div>

          {/* Trust bullet points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.hero.trustCardFree}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.hero.trustInstant}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.hero.trustApi}</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Mockup Preview (Linear/Raycast Style) */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
          {/* Glowing backdrop border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-35 dark:opacity-50 animate-glow-pulse" />

          {/* Main Dashboard Window */}
          <div className="relative rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-[#0c0c16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Window Top bar */}
            <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  {t.hero.mockupUrl}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.hero.mockupSynced}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  <Sparkles className="w-3 h-3 text-brand-500" />
                  {t.hero.mockupAiBadge}
                </span>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
              {/* Left Channels & Nav Sidebar */}
              <div className="hidden md:flex md:col-span-3 border-r border-zinc-200/80 dark:border-zinc-800/80 p-3.5 flex-col justify-between bg-zinc-50/40 dark:bg-zinc-900/30 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                    <span>Channels</span>
                    <span className="text-[10px] bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-1.5 py-0.2 rounded font-mono">
                      28
                    </span>
                  </div>

                  <div className="space-y-1">
                    {[
                      { name: 'TikTok', count: '142K', color: 'bg-zinc-900 text-white dark:bg-zinc-800', dot: 'bg-emerald-400' },
                      { name: 'YouTube Shorts', count: '89K', color: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-emerald-400' },
                      { name: 'Facebook Page', count: '45K', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-emerald-400' },
                      { name: 'LinkedIn Pro', count: '28K', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', dot: 'bg-emerald-400' },
                      { name: 'X (Twitter)', count: '63K', color: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300', dot: 'bg-emerald-400' },
                      { name: 'Instagram Reels', count: '94K', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', dot: 'bg-emerald-400' },
                      { name: 'Threads & Discord', count: '12K', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', dot: 'bg-emerald-400' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
                  <div className="p-2.5 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-700 dark:text-brand-300">
                      <Sparkles className="w-3 h-3 text-brand-500" />
                      AI Copilot Active
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      Auto-generating 9:16 captions & tags
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Posts Queue / Calendar Area */}
              <div className="md:col-span-6 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Action row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl text-xs font-semibold">
                      <button className="px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm">
                        {t.hero.mockupCalendarTab}
                      </button>
                      <button className="px-3 py-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        {t.hero.mockupPipelineTab}
                      </button>
                      <button className="px-3 py-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        {t.hero.mockupAnalyticsTab}
                      </button>
                    </div>

                    <button className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1 transition-all">
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.hero.mockupNewPost}</span>
                    </button>
                  </div>

                  {/* Scheduled cards */}
                  <div className="space-y-2.5">
                    {/* Post Item 1 */}
                    <div className="p-3 rounded-xl border border-brand-200/80 dark:border-brand-500/30 bg-brand-50/30 dark:bg-brand-950/20 space-y-2 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-white text-[9px] font-bold">
                            TikTok
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                            Shorts
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-pink-600 text-white text-[9px] font-bold">
                            Reels
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                          <Clock className="w-3 h-3" />
                          {t.hero.mockupPost1Status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {t.hero.mockupPost1Title}
                      </p>
                    </div>

                    {/* Post Item 2 */}
                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold">
                            LinkedIn
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-700 text-white text-[9px] font-bold">
                            Facebook
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          {t.hero.mockupPost2Status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                        {t.hero.mockupPost2Title}
                      </p>
                    </div>

                    {/* Post Item 3 */}
                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white text-[9px] font-bold">
                            X Thread
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white text-[9px] font-bold">
                            Reddit
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {t.hero.mockupPost3Status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                        {t.hero.mockupPost3Title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-between text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  <span>Temporal Orchestrator Punctuality:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    100.0% On Time
                  </span>
                </div>
              </div>

              {/* Right AI Preview & Analytics Drawer */}
              <div className="hidden md:flex md:col-span-3 border-l border-zinc-200/80 dark:border-zinc-800/80 p-3.5 flex-col justify-between bg-zinc-50/40 dark:bg-zinc-900/30 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                    <span>AI Video Optimizer</span>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                      9:16 Ready
                    </span>
                  </div>

                  {/* Simulated video frame */}
                  <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 aspect-[9/12] overflow-hidden flex flex-col justify-between p-3 text-white">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-brand-600 text-[9px] font-bold">
                        AI Hook 3s
                      </span>
                      <span className="text-[9px] text-zinc-400">00:45</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-white leading-tight">
                        "Stop wasting 2h/day posting manually..."
                      </p>
                      <p className="text-[9px] text-zinc-300">
                        #crove #socialmedia #growth #ai
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-center pt-2">
                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    Growth: +248% Impressions
                  </span>
                  <p className="text-[10px] text-zinc-400">
                    Cross-posted to 28 channels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
