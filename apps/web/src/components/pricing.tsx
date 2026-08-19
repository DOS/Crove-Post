'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Zap, ArrowRight } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.crove.com';

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  const PLANS = [
    {
      name: 'Starter',
      description: 'Hoàn hảo để trải nghiệm và bắt đầu xây dựng kênh cá nhân.',
      priceMonthly: '0',
      priceYearly: '0',
      period: '/tháng trọn đời',
      badge: 'Miễn phí',
      features: [
        'Kết nối tối đa 3 kênh mạng xã hội',
        'Lên lịch 30 bài viết / tháng',
        'Lịch kéo thả cơ bản',
        'AI gợi ý caption cơ bản',
        'Lưu trữ media 500MB',
        'Cộng đồng hỗ trợ',
      ],
      ctaText: 'Bắt đầu Miễn Phí',
      highlighted: false,
    },
    {
      name: 'Pro Creator',
      description: 'Gói phổ biến nhất cho Content Creators, Marketers & Shop Online.',
      priceMonthly: '290.000đ',
      priceYearly: '230.000đ',
      period: '/tháng (thanh toán năm)',
      badge: 'Khuyên Dùng ★',
      features: [
        'Kết nối 15 kênh mạng xã hội',
        'Không giới hạn số lượng bài đăng',
        'Đăng trực tiếp TikTok, Shorts & Reels',
        'AI Content Copilot không giới hạn',
        'Tự động tạo Twitter Threads & Reddit',
        'Gợi ý khung giờ vàng (Best Time AI)',
        'Analytics & Báo cáo tăng trưởng',
        'Lưu trữ media 50GB',
        'Hỗ trợ ưu tiên 24/7',
      ],
      ctaText: 'Dùng thử 14 ngày miễn phí',
      highlighted: true,
    },
    {
      name: 'Agency & Team',
      description: 'Dành cho Digital Marketing Agencies và Doanh nghiệp nhiều chi nhánh.',
      priceMonthly: '890.000đ',
      priceYearly: '710.000đ',
      period: '/tháng (thanh toán năm)',
      badge: 'Doanh Nghiệp',
      features: [
        'Không giới hạn kênh mạng xã hội',
        'Không giới hạn số bài đăng & chiến dịch',
        'Không gian làm việc nhóm (10 Thành viên)',
        'Quy trình phê duyệt bài viết trước khi đăng',
        'Báo cáo Analytics xuất file PDF chuyên nghiệp',
        'Tích hợp Webhooks & REST API riêng',
        'Lưu trữ media 500GB',
        'Hỗ trợ 1-on-1 từ chuyên gia',
      ],
      ctaText: 'Liên hệ tư vấn Agency',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brand-500/10 dark:bg-brand-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            <span>Bảng giá minh bạch & linh hoạt</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Đầu Tư Nhỏ,{' '}
            <span className="text-gradient-purple">Hiệu Quả Đột Phá</span>
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Chọn gói phù hợp với quy mô của bạn. Nâng cấp hoặc huỷ bất kỳ lúc nào chỉ với 1 click.
          </p>

          {/* Billing Switcher */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${
                !isYearly ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-500'
              }`}
            >
              Thanh toán tháng
            </span>

            <button
              onClick={() => setIsYearly(!isYearly)}
              aria-label="Toggle Billing Interval"
              className="w-14 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 p-1 relative transition-colors focus:outline-none"
            >
              <div
                className={`w-6 h-6 rounded-full bg-brand-600 shadow-md transition-transform duration-200 ${
                  isYearly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-medium ${
                  isYearly ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-500'
                }`}
              >
                Thanh toán năm
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                Tiết kiệm 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-3xl backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ${
                plan.highlighted
                  ? 'border-2 border-brand-500 bg-white dark:bg-zinc-900/90 shadow-2xl shadow-brand-500/20 lg:-translate-y-2'
                  : 'border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 shadow-lg'
              }`}
            >
              {/* Highlight badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-brand-500/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {!plan.highlighted && plan.badge && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                      {isYearly ? plan.priceYearly : plan.priceMonthly}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Gói bao gồm:
                  </div>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <a
                  href={`${APP_URL}/auth/login`}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white shadow-lg shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98]'
                      : 'border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
