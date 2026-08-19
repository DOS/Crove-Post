'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Nguyễn Hải Nam',
    role: 'Founder & Tech Lead @ SaaSify',
    avatar: 'HN',
    content:
      'Crove đã thay đổi hoàn toàn quy trình phân phối nội dung của chúng tôi. Trước đây phải mất 2 tiếng mỗi ngày để đăng bài lên LinkedIn, X và Facebook, giờ chỉ cần 1 click là xong!',
    rating: 5,
    channels: '12 Kênh',
  },
  {
    name: 'Trần Thảo Linh',
    role: 'Head of Growth @ Digital Agency VN',
    avatar: 'TL',
    content:
      'Tính năng đăng video trực tiếp lên TikTok và Shorts của Crove cực kỳ mượt mà. Khách hàng của agency tôi rất ấn tượng với báo cáo Analytics trực quan và chi tiết.',
    rating: 5,
    channels: '24 Kênh',
  },
  {
    name: 'Lê Hoàng Long',
    role: 'Content Creator & YouTuber (150K Subs)',
    avatar: 'HL',
    content:
      'AI Copilot của Crove viết caption cho từng nền tảng cực kỳ tự nhiên, không bị văn phong AI khô cứng. Nhờ đó tương tác trên Threads và TikTok của mình tăng hơn gấp đôi.',
    rating: 5,
    channels: '8 Kênh',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40 border-y border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Được tin dùng bởi 10,000+ Creators</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Khách Hàng Nói Gì Về <span className="text-gradient-purple">Crove</span>?
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Đánh giá thực tế từ các nhà sáng tạo nội dung, chuyên viên marketing và chủ doanh nghiệp.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl shadow-lg hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating stars */}
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                  "{item.content}"
                </p>
              </div>

              {/* Author Row */}
              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-zinc-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.role}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {item.channels}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
