'use client';

import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.crove.com';

export function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-brand-500/30 bg-gradient-to-br from-brand-900/90 via-zinc-950 to-purple-950/80 p-8 sm:p-14 lg:p-20 text-center shadow-2xl shadow-brand-500/20">
          {/* Ambient Lighting inside banner */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand-500/30 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-400/40 bg-brand-500/20 text-xs font-semibold text-brand-200 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Sẵn sàng bứt phá tăng trưởng mạng xã hội?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Bắt Đầu Quản Lý & Tự Động Hoá <br className="hidden sm:inline" />
              <span className="text-gradient-purple">28+ Kênh Mạng Xã Hội</span> Ngay Hôm Nay
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
              Gia nhập cùng hơn 10,000+ nhà sáng tạo và doanh nghiệp đang tiết kiệm 20+ giờ mỗi tuần nhờ Crove.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`${APP_URL}/auth/login`}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-base shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group"
              >
                <span>Bắt đầu dùng thử miễn phí</span>
                <ArrowRight className="w-4 h-4 text-brand-600 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href="#pricing"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md transition-all duration-200"
              >
                Xem các gói cước
              </a>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Không cần thẻ ngân hàng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Kích hoạt trong 60 giây</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
