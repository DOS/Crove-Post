'use client';

import React from 'react';
import { KeyRound, Wand2, Send, CheckCircle2, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: KeyRound,
    title: 'Kết Nối Kênh Trong 1-Click',
    description:
      'Đăng nhập tài khoản TikTok, Facebook, LinkedIn, X, YouTube và các nền tảng khác qua giao thức OAuth bảo mật chính thức. Không cần lưu mật khẩu.',
    highlight: 'Hỗ trợ 28+ Mạng Xã Hội',
    gradient: 'from-brand-600 to-indigo-600',
  },
  {
    step: '02',
    icon: Wand2,
    title: 'Sáng Tạo Hoặc Tối Ưu Với AI',
    description:
      'Viết bài một lần, Crove AI Copilot sẽ tự động biến tấu nội dung, gợi ý hashtag, điều chỉnh độ dài bài viết và tối ưu ảnh/video cho từng nền tảng.',
    highlight: 'Tự động Tối Ưu SEO & Thuật Toán',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    step: '03',
    icon: Send,
    title: 'Lên Lịch & Tự Động Phân Phối',
    description:
      'Chọn ngày giờ hoặc để Crove đề xuất khung giờ vàng (Best Time to Post). Hệ thống Temporal Workflow phân tán đảm bảo bài đăng chính xác 100%.',
    highlight: '99.99% Đúng Giờ & Ổn Định',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Quy trình siêu đơn giản</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Cách Hoạt Động Chỉ Với{' '}
            <span className="text-gradient-purple">3 Bước Nhanh Chóng</span>
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Bắt đầu trong vòng 3 phút mà không cần kiến thức kỹ thuật phức tạp.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Top step badge & icon */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold font-mono text-zinc-300 dark:text-zinc-700 group-hover:text-brand-500 transition-colors">
                      {step.step}
                    </span>
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Highlight */}
                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {step.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
