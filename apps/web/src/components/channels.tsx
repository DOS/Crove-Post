'use client';

import React, { useState } from 'react';
import {
  Share2,
  Video,
  MessageSquare,
  FileText,
  Users,
  Code2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Channel {
  name: string;
  category: 'video' | 'social' | 'professional' | 'community' | 'web3';
  badge?: string;
  description: string;
  color: string;
}

const CHANNELS: Channel[] = [
  // Video & Visuals
  { name: 'TikTok', category: 'video', badge: 'Direct Video', description: 'Đăng video & Shorts 9:16 tự động kèm hashtags tối ưu', color: 'from-zinc-900 to-zinc-700' },
  { name: 'YouTube Shorts', category: 'video', badge: 'Full 4K', description: 'Tải lên Shorts & Video dài với thumbnail tùy chỉnh', color: 'from-red-600 to-rose-700' },
  { name: 'Instagram', category: 'video', badge: 'Reels & Carousel', description: 'Đăng Reels, ảnh đơn, Carousel và story trực tiếp', color: 'from-pink-600 via-purple-600 to-amber-500' },
  { name: 'Facebook', category: 'video', badge: 'Pages & Groups', description: 'Hỗ trợ Fanpage doanh nghiệp, Group cộng đồng và Reels', color: 'from-blue-600 to-indigo-700' },
  { name: 'Pinterest', category: 'video', badge: 'Pins & Boards', description: 'Tự động tạo Pin, ghim vào bảng mục tiêu kèm backlink', color: 'from-red-700 to-rose-800' },
  { name: 'Dribbble', category: 'video', badge: 'Design Shots', description: 'Chia sẻ portfolio và shot thiết kế cho designers', color: 'from-pink-500 to-rose-600' },

  // Social & Microblog
  { name: 'X (Twitter)', category: 'social', badge: 'Auto Thread', description: 'Tự động chia nhỏ bài viết thành Twitter Threads mượt mà', color: 'from-zinc-900 to-black' },
  { name: 'Threads', category: 'social', badge: 'Meta Ecosystem', description: 'Đồng bộ bài viết sang Instagram Threads tức thì', color: 'from-zinc-800 to-zinc-950' },
  { name: 'Bluesky', category: 'social', badge: 'Decentralized', description: 'Phân phối tới mạng xã hội phi tập trung thế hệ mới', color: 'from-sky-500 to-blue-600' },
  { name: 'Mastodon', category: 'social', badge: 'Fediverse', description: 'Hỗ trợ kết nối custom instance trên Fediverse', color: 'from-indigo-600 to-purple-700' },
  { name: 'Farcaster', category: 'social', badge: 'Web3 Social', description: 'Đăng Cast trực tiếp lên giao thức Web3 Farcaster', color: 'from-purple-700 to-violet-900' },
  { name: 'MeWe', category: 'social', description: 'Đăng bài lên mạng xã hội bảo mật quyền riêng tư', color: 'from-amber-600 to-orange-700' },
  { name: 'VKontakte (VK)', category: 'social', description: 'Kết nối và phát triển cộng đồng người dùng Đông Âu', color: 'from-blue-700 to-blue-900' },

  // Professional & Articles
  { name: 'LinkedIn Personal', category: 'professional', badge: 'B2B Lead', description: 'Xây dựng thương hiệu cá nhân với bài viết & PDF carousel', color: 'from-blue-700 to-cyan-800' },
  { name: 'LinkedIn Company', category: 'professional', badge: 'Organization', description: 'Quản lý bài đăng doanh nghiệp nhiều chi nhánh', color: 'from-blue-800 to-indigo-900' },
  { name: 'Medium', category: 'professional', badge: 'Canonical URL', description: 'Xuất bản bài viết dài, giữ nguyên SEO canonical link', color: 'from-zinc-900 to-zinc-700' },
  { name: 'Hashnode', category: 'professional', badge: 'Dev Blogs', description: 'Tự động đồng bộ bài viết kỹ thuật lên blog cá nhân', color: 'from-blue-600 to-sky-700' },
  { name: 'Dev.to', category: 'professional', badge: 'Developer SEO', description: 'Chia sẻ kiến thức lập trình tới cộng đồng developer', color: 'from-zinc-800 to-black' },
  { name: 'WordPress', category: 'professional', badge: 'REST API', description: 'Tự động tạo bản nháp hoặc xuất bản bài viết WordPress', color: 'from-sky-700 to-blue-900' },

  // Community & Messaging
  { name: 'Reddit', category: 'community', badge: 'Subreddits', description: 'Tự động chọn Subreddit và gắn Flair chuẩn quy tắc', color: 'from-orange-600 to-red-600' },
  { name: 'Discord', category: 'community', badge: 'Webhooks & Bot', description: 'Bắn thông báo bài viết mới vào từng Channel Discord', color: 'from-indigo-600 to-violet-800' },
  { name: 'Telegram', category: 'community', badge: 'Channels & Groups', description: 'Gửi tin nhắn định dạng Markdown và hình ảnh tới channel', color: 'from-sky-500 to-blue-600' },
  { name: 'Slack', category: 'community', badge: 'Workspace', description: 'Thông báo tới các kênh làm việc nội bộ', color: 'from-emerald-600 to-teal-800' },
  { name: 'Skool', category: 'community', badge: 'Course & Community', description: 'Đăng bài thông báo tới các nhóm học viên Skool', color: 'from-amber-500 to-yellow-600' },
  { name: 'Whop', category: 'community', badge: 'Creator Hub', description: 'Kết nối sản phẩm số và cộng đồng thành viên Whop', color: 'from-orange-500 to-rose-600' },
  { name: 'Listmonk', category: 'community', badge: 'Newsletter', description: 'Tự động gửi bản tin qua email marketing self-hosted', color: 'from-purple-600 to-indigo-700' },

  // Web3 & Custom
  { name: 'Moltbook', category: 'web3', badge: 'Web3', description: 'Tích hợp mạng xã hội phi tập trung', color: 'from-brand-600 to-purple-800' },
  { name: 'Wrapcaster', category: 'web3', badge: 'Warpcast', description: 'Hỗ trợ Warpcast Frame và post', color: 'from-purple-600 to-indigo-900' },
  { name: 'Custom Webhooks', category: 'web3', badge: 'API Power', description: 'Gửi payload JSON tới bất kỳ hệ thống nào bạn muốn', color: 'from-zinc-700 to-zinc-900' },
];

const CATEGORIES = [
  { id: 'all', label: 'Tất cả (28+ Nền tảng)' },
  { id: 'video', label: 'Video & Short Form', icon: Video },
  { id: 'social', label: 'Social & Microblog', icon: Share2 },
  { id: 'professional', label: 'B2B & Blog Dài', icon: FileText },
  { id: 'community', label: 'Cộng đồng & Chat', icon: Users },
  { id: 'web3', label: 'Web3 & Webhook API', icon: Code2 },
];

export function Channels() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredChannels =
    activeTab === 'all'
      ? CHANNELS
      : CHANNELS.filter((c) => c.category === activeTab);

  return (
    <section id="channels" className="py-24 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brand-500/10 dark:bg-brand-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Share2 className="w-3.5 h-3.5" />
            <span>Hệ sinh thái phân phối mạnh mẽ nhất</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Kết Nối <span className="text-gradient-purple">28+ Mạng Xã Hội</span> Trong 1 Nơi Duy Nhất
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">
            Không còn phải đăng nhập qua lại giữa hàng chục ứng dụng. Crove tích hợp sẵn
            mọi nền tảng từ video ngắn, bài viết B2B, diễn đàn cho đến webhook tuỳ chỉnh.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-10 flex items-center justify-center flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-105'
                    : 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-brand-300 dark:hover:border-brand-500/40'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Channels Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredChannels.map((channel, idx) => (
            <div
              key={idx}
              className="group p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${channel.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                    >
                      {channel.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {channel.name}
                      </h3>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize">
                        {channel.category}
                      </span>
                    </div>
                  </div>

                  {channel.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/50">
                      {channel.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {channel.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Sẵn sàng kết nối
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  1-Click OAuth &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
