'use client';

import React from 'react';
import { Check, X, Sparkles, Scale } from 'lucide-react';

const COMPARISON_ROWS = [
  {
    feature: 'Số lượng mạng xã hội hỗ trợ',
    crove: '28+ Kênh (TikTok, YT, FB, X, LinkedIn, Discord, Reddit...)',
    buffer: '8 Kênh cơ bản',
    hootsuite: '7 Kênh cơ bản',
    later: '6 Kênh cơ bản',
  },
  {
    feature: 'Đăng trực tiếp TikTok, Shorts, Reels',
    crove: true,
    buffer: true,
    hootsuite: true,
    later: 'Một số kênh cần duyệt qua app',
  },
  {
    feature: 'AI Content Copilot & Auto-Repurpose',
    crove: 'Tích hợp sẵn & Tối ưu theo từng MXH',
    buffer: 'Cơ bản',
    hootsuite: 'Tính phí thêm (OwlyWriter)',
    later: 'Rất hạn chế',
  },
  {
    feature: 'Tự động tạo Twitter/X Threads & Reddit Flair',
    crove: true,
    buffer: false,
    hootsuite: false,
    later: false,
  },
  {
    feature: 'Lịch kéo thả (Drag & Drop) trực quan',
    crove: true,
    buffer: true,
    hootsuite: true,
    later: true,
  },
  {
    feature: 'Hỗ trợ Web3 & Custom Webhooks / REST API',
    crove: true,
    buffer: false,
    hootsuite: false,
    later: false,
  },
  {
    feature: 'Tùy chọn Self-host / Cloud linh hoạt',
    crove: true,
    buffer: false,
    hootsuite: false,
    later: false,
  },
  {
    feature: 'Chi phí cho Creator & Agency',
    crove: 'Tiết kiệm đến 70% ngân sách',
    buffer: 'Tăng theo số lượng kênh',
    hootsuite: 'Rất đắt ($99+/tháng)',
    later: 'Giới hạn số bài đăng',
  },
];

export function Comparison() {
  return (
    <section id="comparison" className="py-24 relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40 border-y border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Scale className="w-3.5 h-3.5" />
            <span>Tại sao chọn Crove?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            So Sánh <span className="text-gradient-purple">Crove</span> Với Các Công Cụ Khác
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Khám phá lý do tại sao các Content Creators và Agency chuyển sang Crove để tiết kiệm hàng triệu đồng mỗi tháng.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mt-14 overflow-x-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xl backdrop-blur-xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80">
                <th className="p-5 text-sm font-bold text-zinc-700 dark:text-zinc-300 w-1/3">
                  Tính Năng & Năng Lực
                </th>
                <th className="p-5 text-sm font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50/60 dark:bg-brand-950/40 w-1/4 border-x border-brand-200/50 dark:border-brand-800/50">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span>Crove (Postiz)</span>
                  </div>
                </th>
                <th className="p-5 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  Buffer
                </th>
                <th className="p-5 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  Hootsuite
                </th>
                <th className="p-5 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  Later
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs sm:text-sm">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-5 font-semibold text-zinc-800 dark:text-zinc-200">
                    {row.feature}
                  </td>
                  <td className="p-5 font-bold text-zinc-900 dark:text-white bg-brand-50/40 dark:bg-brand-950/20 border-x border-brand-200/40 dark:border-brand-800/30">
                    {typeof row.crove === 'boolean' ? (
                      row.crove ? (
                        <span className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                          <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                          Có sẵn
                        </span>
                      ) : (
                        <X className="w-4 h-4 text-rose-500" />
                      )
                    ) : (
                      <span className="text-brand-700 dark:text-brand-300 font-semibold">
                        {row.crove}
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-zinc-600 dark:text-zinc-400">
                    {typeof row.buffer === 'boolean' ? (
                      row.buffer ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-400" />
                      )
                    ) : (
                      row.buffer
                    )}
                  </td>
                  <td className="p-5 text-zinc-600 dark:text-zinc-400">
                    {typeof row.hootsuite === 'boolean' ? (
                      row.hootsuite ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-400" />
                      )
                    ) : (
                      row.hootsuite
                    )}
                  </td>
                  <td className="p-5 text-zinc-600 dark:text-zinc-400">
                    {typeof row.later === 'boolean' ? (
                      row.later ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-400" />
                      )
                    ) : (
                      row.later
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
