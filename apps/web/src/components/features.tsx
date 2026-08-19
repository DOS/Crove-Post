'use client';

import React from 'react';
import {
  Sparkles,
  Calendar,
  Layers,
  BarChart3,
  Users2,
  Image as ImageIcon,
  Bot,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  SplitSquareVertical,
} from 'lucide-react';

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background ambient radial lights */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Tính năng đột phá</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Mọi Công Cụ Bạn Cần Để{' '}
            <span className="text-gradient-purple">Thống Lĩnh Mạng Xã Hội</span>
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Được xây dựng cho các Content Creators, Digital Agencies, Growth Hackers
            và Doanh nghiệp muốn mở rộng quy mô hiện diện trực tuyến nhanh gấp 10 lần.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Card 1 - AI Repurposer (Span 2 cols on md) */}
          <div className="md:col-span-2 p-7 sm:p-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-brand-400 dark:hover:border-brand-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-500/15 via-transparent to-transparent rounded-full pointer-events-none" />

            <div className="space-y-4 max-w-lg z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Bot className="w-6 h-6" />
              </div>

              <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                AI Copilot & Repurposing
              </div>

              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Biến 1 Bài Viết Thành 10 Định Dạng Tối Ưu Cho Từng MXH
              </h3>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Nhập 1 đường link blog, video YouTube hoặc ý tưởng thô. AI Copilot của Crove
                tự động viết caption hài hước cho TikTok, tóm tắt chuyên sâu cho LinkedIn, tạo Twitter Thread cuốn hút và hashtag trending cho Instagram.
              </p>
            </div>

            {/* Visual Simulated snippet */}
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 z-10">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1">
                <div className="font-semibold text-brand-600 dark:text-brand-400">🔥 TikTok Script</div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] line-clamp-2">
                  "Hook 3s giữ chân người xem + CTA link bio..."
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1">
                <div className="font-semibold text-blue-600 dark:text-blue-400">💼 LinkedIn B2B</div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] line-clamp-2">
                  "Bullet points chia sẻ kinh nghiệm + số liệu cụ thể..."
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1">
                <div className="font-semibold text-zinc-900 dark:text-zinc-200">🧵 X Threads</div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] line-clamp-2">
                  "Tự động chia thành chuỗi 5 tweets liền mạch..."
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 - Visual Drag & Drop Calendar */}
          <div className="p-7 sm:p-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-brand-400 dark:hover:border-brand-500/50 transition-all duration-300">
            <div className="space-y-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Calendar className="w-6 h-6" />
              </div>

              <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                Lịch Biểu Trực Quan
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Lịch Kéo Thả Trực Quan Theo Tuần & Tháng
              </h3>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Xem toàn cảnh kế hoạch nội dung tuần tới. Chỉ cần kéo thả bài viết để đổi giờ đăng hoặc phân loại theo chiến dịch màu sắc.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                Gợi ý khung giờ vàng (AI Best Time)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">20:30</span>
            </div>
          </div>

          {/* Card 3 - Unified Analytics */}
          <div className="p-7 sm:p-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-brand-400 dark:hover:border-brand-500/50 transition-all duration-300">
            <div className="space-y-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
                <BarChart3 className="w-6 h-6" />
              </div>

              <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                Thống Kê Thống Nhất
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Analytics Đo Lường Hiệu Suất Toàn Diện
              </h3>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Theo dõi tăng trưởng người theo dõi, lượt xem video, tương tác và tỷ lệ chuyển đổi của tất cả các kênh trên cùng 1 bảng điều khiển.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs font-semibold">
              <span className="text-zinc-500 dark:text-zinc-400">Tăng trưởng tháng</span>
              <span className="text-emerald-500 font-bold">+184.5% 📈</span>
            </div>
          </div>

          {/* Card 4 - Multi-User Workspace */}
          <div className="p-7 sm:p-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-brand-400 dark:hover:border-brand-500/50 transition-all duration-300">
            <div className="space-y-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Users2 className="w-6 h-6" />
              </div>

              <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                Team & Phân Quyền
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Không Gian Làm Việc & Phê Duyệt Bài Viết
              </h3>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Mời thành viên team, copywriter hoặc khách hàng vào workspace. Phân quyền Admin, Editor, Reviewer để kiểm duyệt trước khi đăng bài.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Bảo mật dữ liệu & phân quyền chi tiết</span>
            </div>
          </div>

          {/* Card 5 - Media Asset Hub & AI Image (Span 1 or 2) */}
          <div className="p-7 sm:p-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-brand-400 dark:hover:border-brand-500/50 transition-all duration-300">
            <div className="space-y-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
                <ImageIcon className="w-6 h-6" />
              </div>

              <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50">
                Media Hub & Tự Động Crop
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Kho Media Lưu Trữ & Tối Ưu Tỉ Lệ Khung Hình
              </h3>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Upload video, ảnh 1 lần và Crove tự động resize chuẩn tỉ lệ 9:16 (Reels/TikTok), 1:1 (Instagram), 16:9 (YouTube/Facebook) không bị vỡ hình.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Tích hợp tạo ảnh AI & kho ảnh bản quyền</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
