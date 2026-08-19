'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Crove có an toàn cho tài khoản mạng xã hội của tôi không? Có bị khoá nick không?',
    a: 'Crove sử dụng 100% Official API chính thức được cấp phép từ Meta (Facebook, Instagram, Threads), TikTok Developer Partner, Google (YouTube), X Developer, LinkedIn và Reddit. Chúng tôi không sử dụng bot ngầm hay crawler trái phép, vì vậy tài khoản của bạn được bảo đảm an toàn tuyệt đối và không bị bóp tương tác.',
  },
  {
    q: 'Crove hỗ trợ những định dạng nội dung nào?',
    a: 'Crove hỗ trợ đầy đủ mọi định dạng: Video ngắn 9:16 (TikTok, YouTube Shorts, Reels), Video dài 16:9, Bài viết có hình ảnh đơn/carousel, Twitter Threads, Bài viết blog định dạng Markdown (Medium, Hashnode, Dev.to), và thông báo cộng đồng (Discord, Telegram, Slack).',
  },
  {
    q: 'AI Copilot hoạt động như thế nào?',
    a: 'AI của Crove được tích hợp mô hình ngôn ngữ lớn tiên tiến nhất để phân tích nội dung gốc của bạn. Nó hiểu thuật toán và văn hóa người dùng trên từng nền tảng, tự động biến 1 đoạn văn bản thành caption ngắn gọn có hook cho TikTok, bài viết chuyên nghiệp cho LinkedIn hoặc chuỗi Twitter Thread hấp dẫn.',
  },
  {
    q: 'Tôi có thể dùng thử miễn phí trước khi trả phí không?',
    a: 'Có! Gói Starter cho phép bạn sử dụng miễn phí vĩnh viễn với tối đa 3 kênh mạng xã hội. Đối với các gói Pro Creator và Agency, bạn được trải nghiệm 14 ngày miễn phí với đầy đủ mọi tính năng cao cấp mà không cần nhập thẻ tín dụng.',
  },
  {
    q: 'Tôi có thể mời thành viên team hoặc khách hàng vào cùng làm việc không?',
    a: 'Hoàn toàn được. Gói Agency & Team cung cấp không gian làm việc Workspace đa người dùng, cho phép bạn phân quyền Admin, Editor, Reviewer để phân chia công việc và kiểm duyệt nội dung trước khi xuất bản.',
  },
  {
    q: 'Tôi có thể huỷ gói đăng ký bất kỳ lúc nào không?',
    a: 'Bạn có thể nâng cấp, hạ gói hoặc huỷ gia hạn bất kỳ lúc nào trực tiếp trong phần Cài đặt thanh toán. Không có ràng buộc hợp đồng và không có chi phí ẩn.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
            <span>Giải đáp thắc mắc</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Câu Hỏi <span className="text-gradient-purple">Thường Gặp</span>
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Mọi thông tin bạn cần biết về nền tảng và dịch vụ của Crove.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-14 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-200 overflow-hidden"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
