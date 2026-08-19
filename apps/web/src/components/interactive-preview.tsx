'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Check,
  Copy,
  Clock,
  RotateCcw,
  Smile,
  Hash,
  Share2,
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    title: '🚀 Ra Mắt Sản Phẩm Mới',
    content:
      'Hôm nay chúng tôi chính thức ra mắt Crove 2.0 — nền tảng tự động lên lịch và đăng bài lên 28+ mạng xã hội với sự hỗ trợ của AI. Tiết kiệm 80% thời gian làm content của bạn ngay hôm nay!',
    tags: ['#ProductLaunch', '#AI', '#MarketingAutomation', '#SaaS', '#Growth'],
  },
  {
    title: '💡 Mẹo Tối Ưu Content Đa Kênh',
    content:
      '3 bí quyết để 1 nội dung viral trên cả TikTok, LinkedIn và Threads:\n1. Hook 3 giây đầu tiên thật đắt\n2. Tối ưu caption theo hành vi từng nền tảng\n3. Đăng đúng khung giờ vàng tương tác cao nhất',
    tags: ['#ContentTips', '#SocialMediaGrowth', '#CreatorHacks'],
  },
  {
    title: '🔥 Chương Trình Ưu Đãi Mùa Hè',
    content:
      'Chỉ trong 48 giờ tới: Tặng 3 tháng dùng thử không giới hạn tài khoản Pro Creator cho 100 khách hàng đầu tiên. Nhanh tay nhận ngay suất trải nghiệm!',
    tags: ['#FlashSale', '#SpecialOffer', '#LimitedDeal'],
  },
];

type Platform = 'tiktok' | 'linkedin' | 'facebook' | 'x';

export function InteractivePreview() {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customText, setCustomText] = useState(PRESET_TEMPLATES[0].content);
  const [activePlatform, setActivePlatform] = useState<Platform>('tiktok');
  const [selectedChannels, setSelectedChannels] = useState<Platform[]>([
    'tiktok',
    'linkedin',
    'facebook',
    'x',
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const toggleChannel = (platform: Platform) => {
    if (selectedChannels.includes(platform)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== platform));
      }
    } else {
      setSelectedChannels([...selectedChannels, platform]);
    }
  };

  const handleTemplateChange = (idx: number) => {
    setSelectedTemplateIndex(idx);
    setCustomText(PRESET_TEMPLATES[idx].content);
  };

  const handleAIRefine = () => {
    setIsAIProcessing(true);
    setTimeout(() => {
      setCustomText(
        (prev) =>
          `✨ [AI Optimized] ${prev}\n\n👉 Nhấn link bio để trải nghiệm miễn phí và xem chi tiết!`
      );
      setIsAIProcessing(false);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="preview" className="py-24 relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40 border-y border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Trải nghiệm trực quan tương tác</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Thử Soạn Bài &{' '}
            <span className="text-gradient-purple">Xem Trước Đa Nền Tảng</span>
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Nhập nội dung bất kỳ hoặc chọn mẫu bên dưới. Xem Crove tự động định dạng chuẩn xác
            trên từng giao diện mạng xã hội theo thời gian thực.
          </p>
        </div>

        {/* Interactive Workspace Box */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top selection bar */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Mẫu gợi ý:
              </span>
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateChange(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedTemplateIndex === idx
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>

            {/* AI Magic Refine Button */}
            <button
              onClick={handleAIRefine}
              disabled={isAIProcessing}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-200 animate-spin-slow" />
              <span>{isAIProcessing ? 'Đang tối ưu...' : 'AI Tối Ưu Caption'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Editor & Channel Toggles (5 cols) */}
            <div className="lg:col-span-6 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Kênh xuất bản cùng lúc ({selectedChannels.length}/4):
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => toggleChannel('tiktok')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      selectedChannels.includes('tiktok')
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-60'
                    }`}
                  >
                    <span>🎵 TikTok</span>
                    {selectedChannels.includes('tiktok') && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleChannel('linkedin')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      selectedChannels.includes('linkedin')
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-60'
                    }`}
                  >
                    <span>💼 LinkedIn</span>
                    {selectedChannels.includes('linkedin') && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleChannel('facebook')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      selectedChannels.includes('facebook')
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-60'
                    }`}
                  >
                    <span>📘 Facebook</span>
                    {selectedChannels.includes('facebook') && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => toggleChannel('x')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      selectedChannels.includes('x')
                        ? 'border-zinc-500 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-60'
                    }`}
                  >
                    <span>✖ X/Twitter</span>
                    {selectedChannels.includes('x') && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-1.5">
                    <span>Soạn thảo nội dung:</span>
                    <span>{customText.length} ký tự</span>
                  </div>
                  <textarea
                    rows={6}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Nhập nội dung bài đăng của bạn tại đây..."
                    className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Hashtags list */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Hash className="w-3.5 h-3.5 text-zinc-400" />
                  {PRESET_TEMPLATES[selectedTemplateIndex].tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sẵn sàng xuất bản</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Simulated Preview Mockup (7 cols) */}
            <div className="lg:col-span-6 p-5 sm:p-6 bg-zinc-100/60 dark:bg-zinc-950/80 flex flex-col justify-between space-y-4">
              {/* Platform Selector Tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <button
                  onClick={() => setActivePlatform('tiktok')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePlatform === 'tiktok'
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  TikTok
                </button>
                <button
                  onClick={() => setActivePlatform('linkedin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePlatform === 'linkedin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => setActivePlatform('facebook')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePlatform === 'facebook'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Facebook
                </button>
                <button
                  onClick={() => setActivePlatform('x')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePlatform === 'x'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  X (Twitter)
                </button>
              </div>

              {/* Feed Card Simulation */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-md space-y-3.5">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    C
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                        Crove Social Team
                      </span>
                      <span className="text-[10px] text-zinc-400">@croveapp</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <span>Vừa xong</span>
                      <span>•</span>
                      <span className="capitalize">{activePlatform}</span>
                    </div>
                  </div>
                </div>

                {/* Content text */}
                <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                  {customText}
                </div>

                {/* Simulated media preview box */}
                <div className="h-44 rounded-xl bg-gradient-to-br from-brand-900/40 via-purple-950/30 to-zinc-900/40 border border-brand-500/20 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-2 z-10">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-white z-10">
                    Crove Multi-Channel Automation
                  </div>
                  <div className="text-[10px] text-zinc-400 z-10">
                    Preview rendered via Crove Scheduler Engine
                  </div>
                </div>

                {/* Simulated engagement stats */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>❤️ 1,248 Likes</span>
                  <span>💬 94 Comments</span>
                  <span>🔄 382 Shares</span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 text-center">
                💡 Định dạng và media được tự động tinh chỉnh tương thích 100% với thuật toán của {activePlatform}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
