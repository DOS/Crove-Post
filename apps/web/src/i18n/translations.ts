export type Language = 'vi' | 'en';

export interface Translations {
  nav: {
    features: string;
    channels: string;
    channelsBadge: string;
    preview: string;
    howItWorks: string;
    comparison: string;
    pricing: string;
    faq: string;
    login: string;
    getStarted: string;
  };
  hero: {
    announcement: string;
    announcementHighlight: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    startFree: string;
    watchDemo: string;
    trustCardFree: string;
    trustApi: string;
    trustInstant: string;
    mockupUrl: string;
    mockupSynced: string;
    mockupNewPost: string;
    mockupCalendarTab: string;
    mockupPipelineTab: string;
    mockupAnalyticsTab: string;
    mockupPost1Title: string;
    mockupPost1Status: string;
    mockupPost2Title: string;
    mockupPost2Status: string;
    mockupPost3Title: string;
    mockupPost3Status: string;
    mockupAiBadge: string;
  };
  channels: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    tabAll: string;
    tabVideo: string;
    tabSocial: string;
    tabProfessional: string;
    tabCommunity: string;
    tabWeb3: string;
    directBadge: string;
  };
  features: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    card1Badge: string;
    card1Title: string;
    card1Desc: string;
    card1Tag1: string;
    card1Tag2: string;
    card1Tag3: string;
    card2Badge: string;
    card2Title: string;
    card2Desc: string;
    card2BestTime: string;
    card3Badge: string;
    card3Title: string;
    card3Desc: string;
    card4Badge: string;
    card4Title: string;
    card4Desc: string;
    card5Badge: string;
    card5Title: string;
    card5Desc: string;
  };
  preview: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    templatesLabel: string;
    tmpl1Title: string;
    tmpl1Content: string;
    tmpl2Title: string;
    tmpl2Content: string;
    tmpl3Title: string;
    tmpl3Content: string;
    aiPolishBtn: string;
    aiPolishing: string;
    copyBtn: string;
    copiedBtn: string;
    placeholder: string;
    scheduleNow: string;
    directPublishBadge: string;
    previewOf: string;
    characters: string;
  };
  howItWorks: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    step1Num: string;
    step1Title: string;
    step1Desc: string;
    step1Highlight: string;
    step2Num: string;
    step2Title: string;
    step2Desc: string;
    step2Highlight: string;
    step3Num: string;
    step3Title: string;
    step3Desc: string;
    step3Highlight: string;
  };
  comparison: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    featureHeader: string;
    croveCol: string;
    row1Feature: string;
    row1Crove: string;
    row1Buffer: string;
    row1Hootsuite: string;
    row1Later: string;
    row2Feature: string;
    row2Later: string;
    row3Feature: string;
    row3Crove: string;
    row3Buffer: string;
    row3Hootsuite: string;
    row3Later: string;
    row4Feature: string;
    row5Feature: string;
    row6Feature: string;
    row7Feature: string;
    row8Feature: string;
    row8Crove: string;
    row8Buffer: string;
    row8Hootsuite: string;
    row8Later: string;
  };
  pricing: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    monthly: string;
    yearly: string;
    saveBadge: string;
    starterName: string;
    starterDesc: string;
    starterPrice: string;
    starterPeriod: string;
    starterBadge: string;
    starterCta: string;
    proName: string;
    proDesc: string;
    proPriceMonthly: string;
    proPriceYearly: string;
    proPeriodMonthly: string;
    proPeriodYearly: string;
    proBadge: string;
    proCta: string;
    agencyName: string;
    agencyDesc: string;
    agencyPriceMonthly: string;
    agencyPriceYearly: string;
    agencyPeriodMonthly: string;
    agencyPeriodYearly: string;
    agencyBadge: string;
    agencyCta: string;
  };
  testimonials: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    t1Name: string;
    t1Role: string;
    t1Content: string;
    t1Channels: string;
    t2Name: string;
    t2Role: string;
    t2Content: string;
    t2Channels: string;
    t3Name: string;
    t3Role: string;
    t3Content: string;
    t3Channels: string;
  };
  faq: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
    q6: string;
    a6: string;
  };
  cta: {
    pill: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    startBtn: string;
    viewPricing: string;
    trustCard: string;
    trustTime: string;
  };
  footer: {
    desc: string;
    uptime: string;
    productTitle: string;
    featLink: string;
    channelsLink: string;
    previewLink: string;
    pricingLink: string;
    compareLink: string;
    platformsTitle: string;
    accountTitle: string;
    loginLink: string;
    registerLink: string;
    privacyLink: string;
    termsLink: string;
    rights: string;
    builtWith: string;
  };
}

export const translations: Record<Language, Translations> = {
  vi: {
    nav: {
      features: 'Tính năng',
      channels: '28+ Kênh',
      channelsBadge: 'Hot',
      preview: 'Trải nghiệm',
      howItWorks: 'Cách hoạt động',
      comparison: 'So sánh',
      pricing: 'Bảng giá',
      faq: 'FAQ',
      login: 'Đăng nhập',
      getStarted: 'Bắt đầu miễn phí',
    },
    hero: {
      announcement: 'Crove 2.0 • Trợ lý AI Phân Phối Đa Kênh',
      announcementHighlight: 'Tiết kiệm 80% thời gian',
      titleStart: 'Lên lịch & Tự động Đăng bài ',
      titleGradient: 'Đa Kênh 28+ Nền Tảng',
      titleEnd: ' với Sức Mạnh AI',
      subtitle:
        'Chỉ với 1 click, biến 1 ý tưởng thành các định dạng chuẩn SEO cho TikTok, Facebook, YouTube Shorts, LinkedIn, X, Instagram và xuất bản vào khung giờ vàng.',
      startFree: 'Bắt đầu dùng thử miễn phí',
      watchDemo: 'Xem Demo Trực Tiếp',
      trustCardFree: 'Không cần thẻ tín dụng',
      trustApi: '100% Official API bảo mật',
      trustInstant: 'Kết nối 28+ MXH chỉ trong 2 phút',
      mockupUrl: 'post.crove.com/launches',
      mockupSynced: 'Đã đồng bộ 28 kênh',
      mockupNewPost: 'Tạo bài mới',
      mockupCalendarTab: 'Lịch Đăng Bài',
      mockupPipelineTab: 'Hàng Đợi (Queue)',
      mockupAnalyticsTab: 'Hiệu Quả',
      mockupPost1Title: '🚀 Ra mắt tính năng AI Auto-Repurpose 2.0 cho TikTok & Shorts',
      mockupPost1Status: 'Đã lên lịch 20:30',
      mockupPost2Title: '💼 5 Chiến lược tăng trưởng B2B trên LinkedIn năm 2026',
      mockupPost2Status: 'Đã đăng • 1.4K lượt xem',
      mockupPost3Title: '🧵 Twitter/X Thread: Tại sao các Solo-Creator đang chuyển sang Crove?',
      mockupPost3Status: 'Bản nháp AI',
      mockupAiBadge: 'AI Best Time: 20:30',
    },
    channels: {
      pill: 'Hệ sinh thái kết nối rộng lớn nhất',
      titleStart: 'Phân Phối ',
      titleGradient: '28+ Mạng Xã Hội',
      titleEnd: ' Trong 1 Nền Tảng Duy Nhất',
      subtitle:
        'Từ video ngắn TikTok/Shorts/Reels, bài viết B2B LinkedIn, diễn đàn Reddit, Twitter Threads cho đến thông báo Discord/Telegram và Webhooks API.',
      tabAll: 'Tất cả (28+ Nền tảng)',
      tabVideo: 'Video & Short-form',
      tabSocial: 'Social & Microblog',
      tabProfessional: 'B2B & Blog Dài',
      tabCommunity: 'Cộng đồng & Chat',
      tabWeb3: 'Web3 & Webhook API',
      directBadge: 'Direct API',
    },
    features: {
      pill: 'Tính năng cốt lõi',
      titleStart: 'Mọi Công Cụ Bạn Cần Để ',
      titleGradient: 'Thống Lĩnh Mạng Xã Hội',
      titleEnd: '',
      subtitle:
        'Được tối ưu cho Content Creators, Digital Agencies, Growth Marketers và Doanh nghiệp muốn mở rộng quy mô hiện diện trực tuyến.',
      card1Badge: 'AI Copilot & Auto-Repurpose',
      card1Title: 'Biến 1 Ý Tưởng Thành 10 Định Dạng Chuẩn Từng Nền Tảng',
      card1Desc:
        'Nhập blog link hoặc ghi chú thô. AI tự động sinh kịch bản TikTok 9:16 có hook 3s, bài viết phân tích B2B LinkedIn, chuỗi Twitter Thread cuốn hút và hashtag trending.',
      card1Tag1: '🔥 TikTok Hook 3s + Caption ngắn',
      card1Tag2: '💼 LinkedIn B2B + Bullet points',
      card1Tag3: '🧵 Twitter/X Thread 5 tweets',
      card2Badge: 'Lịch Biểu Trực Quan',
      card2Title: 'Lịch Kéo Thả Kèm Gợi Ý Giờ Vàng (AI Best Time)',
      card2Desc:
        'Quản lý toàn bộ chiến dịch theo tuần/tháng. Kéo thả để dời lịch, phân loại nhãn màu sắc và tự động gợi ý thời điểm khán giả online đông nhất.',
      card2BestTime: 'Giờ tương tác cao nhất hôm nay: 20:30',
      card3Badge: 'Video Automation',
      card3Title: 'Đăng Trực Tiếp TikTok, Reels & YouTube Shorts',
      card3Desc:
        'Hỗ trợ tải video 4K sắc nét, đặt thumbnail tuỳ chỉnh, gắn thẻ người dùng và chọn nhạc xu hướng mà không cần duyệt tay qua điện thoại.',
      card4Badge: 'Cross-channel Analytics',
      card4Title: 'Báo Cáo Tăng Trưởng & Phân Tích Đa Chiều',
      card4Desc:
        'Theo dõi lượt xem, tương tác, tốc độ tăng trưởng người theo dõi trên tất cả các kênh trong 1 dashboard duy nhất. Xuất file báo cáo PDF chuyên nghiệp.',
      card5Badge: 'Agency & Workspaces',
      card5Title: 'Không Gian Nhóm & Phê Duyệt Bài Trước Khi Đăng',
      card5Desc:
        'Phân quyền Admin, Editor, Client Reviewer. Khách hàng có thể để lại comment chỉnh sửa và bấm duyệt bài trực tiếp trước khi xuất bản.',
    },
    preview: {
      pill: 'Studio tương tác trực tiếp',
      titleStart: 'Trải Nghiệm Soạn Bài & ',
      titleGradient: 'Xem Trước Đa Nền Tảng',
      titleEnd: '',
      subtitle:
        'Nhập nội dung bất kỳ hoặc chọn mẫu gợi ý. Quan sát Crove tự động tinh chỉnh giao diện chuẩn xác cho từng mạng xã hội theo thời gian thực.',
      templatesLabel: 'Mẫu gợi ý:',
      tmpl1Title: '🚀 Ra Mắt Sản Phẩm',
      tmpl1Content:
        'Hôm nay chúng tôi chính thức ra mắt Crove 2.0 — nền tảng tự động lên lịch và đăng bài lên 28+ mạng xã hội với sự hỗ trợ của AI. Tiết kiệm 80% thời gian làm content của bạn ngay hôm nay!',
      tmpl2Title: '💡 Bí Quyết Viral',
      tmpl2Content:
        '3 bí quyết để 1 nội dung viral trên cả TikTok, LinkedIn và Threads:\n1. Hook 3 giây đầu tiên thật đắt\n2. Tối ưu caption theo hành vi từng nền tảng\n3. Đăng đúng khung giờ vàng tương tác cao nhất',
      tmpl3Title: '🔥 Khuyến Mãi 48H',
      tmpl3Content:
        'Chỉ trong 48 giờ tới: Tặng 3 tháng dùng thử không giới hạn tài khoản Pro Creator cho 100 khách hàng đầu tiên. Nhanh tay đăng ký trải nghiệm ngay hôm nay!',
      aiPolishBtn: 'Tối ưu bằng AI ✨',
      aiPolishing: 'Đang tối ưu...',
      copyBtn: 'Sao chép',
      copiedBtn: 'Đã sao chép!',
      placeholder: 'Nhập nội dung bài viết hoặc kịch bản của bạn tại đây...',
      scheduleNow: 'Lên lịch bài này ngay',
      directPublishBadge: 'Tự động phân phối qua Official API',
      previewOf: 'Xem trước giao diện',
      characters: 'ký tự',
    },
    howItWorks: {
      pill: 'Quy trình tinh gọn',
      titleStart: 'Cách Hoạt Động Chỉ Với ',
      titleGradient: '3 Bước Đơn Giản',
      titleEnd: '',
      subtitle: 'Bắt đầu chỉ trong vòng 3 phút mà không cần cấu hình phức tạp.',
      step1Num: '01',
      step1Title: 'Kết Nối 28+ Kênh Trong 1-Click',
      step1Desc:
        'Đăng nhập tài khoản TikTok, Facebook, LinkedIn, X, YouTube qua giao thức OAuth chính thức bảo mật cao. Tuyệt đối không lưu mật khẩu.',
      step1Highlight: '100% Official API & Bảo mật',
      step2Num: '02',
      step2Title: 'Sáng Tạo & Tối Ưu Với AI Copilot',
      step2Desc:
        'Viết bài 1 lần, AI tự động tạo caption riêng biệt, hashtag chuẩn SEO, điều chỉnh kích thước ảnh/video cho từng nền tảng.',
      step2Highlight: 'Tự động chuẩn hoá định dạng',
      step3Num: '03',
      step3Title: 'Lên Lịch & Tự Động Phân Phối',
      step3Desc:
        'Chọn ngày giờ hoặc chọn khung giờ vàng gợi ý. Hệ thống Temporal Workflow bền vững đảm bảo bài viết đăng đúng 100% không bao giờ trễ.',
      step3Highlight: 'Độ tin cậy 99.99% Uptime',
    },
    comparison: {
      pill: 'So sánh khách quan',
      titleStart: 'Tại Sao Chọn ',
      titleGradient: 'Crove',
      titleEnd: ' Thay Vì Công Cụ Khác?',
      subtitle:
        'Khám phá lý do tại sao hàng ngàn Content Creators và Agency lựa chọn Crove để tiết kiệm đến 70% ngân sách phần mềm hàng tháng.',
      featureHeader: 'Tính Năng & Năng Lực',
      croveCol: 'Crove (Postiz)',
      row1Feature: 'Số lượng mạng xã hội hỗ trợ',
      row1Crove: '28+ Kênh (TikTok, YT, FB, X, LinkedIn, Discord, Reddit...)',
      row1Buffer: '8 Kênh cơ bản',
      row1Hootsuite: '7 Kênh cơ bản',
      row1Later: '6 Kênh cơ bản',
      row2Feature: 'Đăng trực tiếp TikTok, Shorts & Reels',
      row2Later: 'Cần app xác nhận',
      row3Feature: 'AI Content Copilot & Auto-Repurpose',
      row3Crove: 'Tích hợp sẵn & Tối ưu theo từng MXH',
      row3Buffer: 'Cơ bản',
      row3Hootsuite: 'Tính phí thêm ($$$)',
      row3Later: 'Rất hạn chế',
      row4Feature: 'Tự động tạo Twitter/X Threads & Reddit Flair',
      row5Feature: 'Lịch kéo thả (Drag & Drop) thông minh',
      row6Feature: 'Hỗ trợ Web3 Social & Custom Webhooks / REST API',
      row7Feature: 'Linh hoạt Self-Host hoặc Cloud SaaS',
      row8Feature: 'Chi phí hàng tháng cho Creator & Team',
      row8Crove: 'Tiết kiệm đến 70% chi phí',
      row8Buffer: 'Đắt dần theo từng kênh',
      row8Hootsuite: 'Rất đắt ($99+/tháng)',
      row8Later: 'Giới hạn số bài đăng',
    },
    pricing: {
      pill: 'Bảng giá minh bạch',
      titleStart: 'Đầu Tư Nhỏ, ',
      titleGradient: 'Tăng Trưởng Đột Phá',
      titleEnd: '',
      subtitle:
        'Lựa chọn gói cước phù hợp với quy mô. Nâng cấp hoặc huỷ bất kỳ lúc nào với 1 cú click.',
      monthly: 'Thanh toán theo tháng',
      yearly: 'Thanh toán theo năm',
      saveBadge: 'Tiết kiệm 20%',
      starterName: 'Starter',
      starterDesc: 'Dành cho cá nhân mới bắt đầu xây dựng kênh mạng xã hội.',
      starterPrice: '0đ',
      starterPeriod: '/tháng trọn đời',
      starterBadge: 'Miễn phí',
      starterCta: 'Bắt đầu Miễn Phí',
      proName: 'Pro Creator',
      proDesc: 'Gói phổ biến nhất cho Content Creators, Marketers & Shop Online.',
      proPriceMonthly: '290.000đ',
      proPriceYearly: '230.000đ',
      proPeriodMonthly: '/tháng (theo tháng)',
      proPeriodYearly: '/tháng (thanh toán năm)',
      proBadge: 'Phổ Biến Nhất ★',
      proCta: 'Dùng thử 14 ngày miễn phí',
      agencyName: 'Agency & Team',
      agencyDesc: 'Dành cho Digital Marketing Agencies và Doanh nghiệp mở rộng.',
      agencyPriceMonthly: '890.000đ',
      agencyPriceYearly: '710.000đ',
      agencyPeriodMonthly: '/tháng (theo tháng)',
      agencyPeriodYearly: '/tháng (thanh toán năm)',
      agencyBadge: 'Doanh Nghiệp',
      agencyCta: 'Liên hệ tư vấn Agency',
    },
    testimonials: {
      pill: 'Được tin dùng bởi 10,000+ Creators',
      titleStart: 'Khách Hàng Nói Gì Về ',
      titleGradient: 'Crove',
      titleEnd: '?',
      subtitle:
        'Đánh giá thực tế từ các nhà sáng tạo nội dung, chuyên viên marketing và quản lý agency.',
      t1Name: 'Nguyễn Hải Nam',
      t1Role: 'Founder & Tech Lead @ SaaSify',
      t1Content:
        'Crove đã thay đổi hoàn toàn quy trình phân phối nội dung của chúng tôi. Trước đây phải mất 2 tiếng mỗi ngày để đăng bài lên LinkedIn, X và Facebook, giờ chỉ cần 1 click là xong!',
      t1Channels: '12 Kênh',
      t2Name: 'Trần Thảo Linh',
      t2Role: 'Head of Growth @ Digital Agency VN',
      t2Content:
        'Tính năng đăng video trực tiếp lên TikTok và Shorts của Crove cực kỳ mượt mà. Khách hàng của agency tôi rất ấn tượng với báo cáo Analytics trực quan và chi tiết.',
      t2Channels: '24 Kênh',
      t3Name: 'Lê Hoàng Long',
      t3Role: 'Content Creator & YouTuber (150K Subs)',
      t3Content:
        'AI Copilot của Crove viết caption cho từng nền tảng cực kỳ tự nhiên, không bị văn phong AI khô cứng. Nhờ đó tương tác trên Threads và TikTok của mình tăng hơn gấp đôi.',
      t3Channels: '8 Kênh',
    },
    faq: {
      pill: 'Giải đáp thắc mắc',
      titleStart: 'Câu Hỏi ',
      titleGradient: 'Thường Gặp',
      titleEnd: '',
      subtitle: 'Mọi thông tin bạn cần biết về nền tảng và dịch vụ của Crove.',
      q1: 'Crove có an toàn cho tài khoản mạng xã hội của tôi không? Có bị khoá nick không?',
      a1: 'Crove sử dụng 100% Official API chính thức được cấp phép từ Meta (Facebook, Instagram, Threads), TikTok Developer Partner, Google (YouTube), X Developer, LinkedIn và Reddit. Chúng tôi không sử dụng bot ngầm hay crawler trái phép, vì vậy tài khoản của bạn được bảo đảm an toàn tuyệt đối và không bị bóp tương tác.',
      q2: 'Crove hỗ trợ những định dạng nội dung nào?',
      a2: 'Crove hỗ trợ đầy đủ mọi định dạng: Video ngắn 9:16 (TikTok, YouTube Shorts, Reels), Video dài 16:9, Bài viết có hình ảnh đơn/carousel, Twitter Threads, Bài viết blog định dạng Markdown (Medium, Hashnode, Dev.to), và thông báo cộng đồng (Discord, Telegram, Slack).',
      q3: 'AI Copilot hoạt động như thế nào?',
      a3: 'AI của Crove được tích hợp mô hình ngôn ngữ lớn tiên tiến nhất để phân tích nội dung gốc của bạn. Nó hiểu thuật toán và văn hóa người dùng trên từng nền tảng, tự động biến 1 đoạn văn bản thành caption ngắn gọn có hook cho TikTok, bài viết chuyên nghiệp cho LinkedIn hoặc chuỗi Twitter Thread hấp dẫn.',
      q4: 'Tôi có thể dùng thử miễn phí trước khi trả phí không?',
      a4: 'Có! Gói Starter cho phép bạn sử dụng miễn phí vĩnh viễn với tối đa 3 kênh mạng xã hội. Đối với các gói Pro Creator và Agency, bạn được trải nghiệm 14 ngày miễn phí với đầy đủ mọi tính năng cao cấp mà không cần nhập thẻ tín dụng.',
      q5: 'Tôi có thể mời thành viên team hoặc khách hàng vào cùng làm việc không?',
      a5: 'Hoàn toàn được. Gói Agency & Team cung cấp không gian làm việc Workspace đa người dùng, cho phép bạn phân quyền Admin, Editor, Reviewer để phân chia công việc và kiểm duyệt nội dung trước khi xuất bản.',
      q6: 'Tôi có thể huỷ gói đăng ký bất kỳ lúc nào không?',
      a6: 'Bạn có thể nâng cấp, hạ gói hoặc huỷ gia hạn bất kỳ lúc nào trực tiếp trong phần Cài đặt thanh toán. Không có ràng buộc hợp đồng và không có chi phí ẩn.',
    },
    cta: {
      pill: 'Sẵn sàng bứt phá mạng xã hội?',
      titleStart: 'Tự Động Hoá & Phân Phối ',
      titleGradient: '28+ Kênh Mạng Xã Hội',
      titleEnd: ' Ngay Hôm Nay',
      subtitle:
        'Gia nhập cùng hơn 10,000+ nhà sáng tạo và doanh nghiệp đang tiết kiệm 20+ giờ mỗi tuần nhờ Crove.',
      startBtn: 'Bắt đầu dùng thử miễn phí',
      viewPricing: 'Xem bảng giá chi tiết',
      trustCard: 'Không cần thẻ tín dụng',
      trustTime: 'Kích hoạt trong 60 giây',
    },
    footer: {
      desc: 'Crove là nền tảng quản lý, lên lịch và tự động phân phối bài viết đa kênh thế hệ mới với AI cho 28+ mạng xã hội.',
      uptime: 'Hệ thống hoạt động 99.99% Uptime',
      productTitle: 'Sản Phẩm',
      featLink: 'Tính năng nổi bật',
      channelsLink: '28+ Mạng xã hội',
      previewLink: 'Trải nghiệm trực quan',
      pricingLink: 'Bảng giá & Gói cước',
      compareLink: 'So sánh đối thủ',
      platformsTitle: 'Nền Tảng Hỗ Trợ',
      accountTitle: 'Tài Khoản & Pháp Lý',
      loginLink: 'Đăng nhập Dashboard',
      registerLink: 'Tạo tài khoản mới',
      privacyLink: 'Chính sách bảo mật',
      termsLink: 'Điều khoản dịch vụ',
      rights: 'Bảo lưu mọi quyền.',
      builtWith: 'Được phát triển với công nghệ mã nguồn mở & AI',
    },
  },
  en: {
    nav: {
      features: 'Features',
      channels: '28+ Channels',
      channelsBadge: 'Hot',
      preview: 'Live Preview',
      howItWorks: 'How it works',
      comparison: 'Compare',
      pricing: 'Pricing',
      faq: 'FAQ',
      login: 'Sign In',
      getStarted: 'Get Started Free',
    },
    hero: {
      announcement: 'Crove 2.0 • AI-Powered Multi-Channel Publisher',
      announcementHighlight: 'Save 80% of your time',
      titleStart: 'Schedule & Automate Across ',
      titleGradient: '28+ Social Channels',
      titleEnd: ' with AI Superpowers',
      subtitle:
        'With 1 click, transform any idea into platform-native, algorithm-optimized content for TikTok, Facebook, YouTube Shorts, LinkedIn, X, Instagram and publish at peak times.',
      startFree: 'Start Free Trial',
      watchDemo: 'Explore Live Demo',
      trustCardFree: 'No credit card required',
      trustApi: '100% Official Secure APIs',
      trustInstant: 'Connect 28+ socials in 2 mins',
      mockupUrl: 'post.crove.com/launches',
      mockupSynced: '28 Channels Synced',
      mockupNewPost: 'New Post',
      mockupCalendarTab: 'Calendar',
      mockupPipelineTab: 'Queue',
      mockupAnalyticsTab: 'Analytics',
      mockupPost1Title: '🚀 Launching AI Auto-Repurpose 2.0 for TikTok & Shorts',
      mockupPost1Status: 'Scheduled 20:30',
      mockupPost2Title: '💼 5 B2B Growth Strategies on LinkedIn for 2026',
      mockupPost2Status: 'Published • 1.4K views',
      mockupPost3Title: '🧵 Twitter/X Thread: Why Solo Creators are switching to Crove?',
      mockupPost3Status: 'AI Draft',
      mockupAiBadge: 'AI Best Time: 20:30',
    },
    channels: {
      pill: 'The most comprehensive social ecosystem',
      titleStart: 'Publish Across ',
      titleGradient: '28+ Platforms',
      titleEnd: ' in One Single Place',
      subtitle:
        'From short-form video on TikTok/Shorts/Reels to B2B articles on LinkedIn, Reddit subreddits, X threads, Discord/Telegram and Custom Webhooks.',
      tabAll: 'All (28+ Platforms)',
      tabVideo: 'Video & Short-form',
      tabSocial: 'Social & Microblog',
      tabProfessional: 'B2B & Long-form',
      tabCommunity: 'Community & Chat',
      tabWeb3: 'Web3 & Webhooks API',
      directBadge: 'Direct API',
    },
    features: {
      pill: 'Core Capabilities',
      titleStart: 'Everything You Need To ',
      titleGradient: 'Dominate Social Media',
      titleEnd: '',
      subtitle:
        'Built for Content Creators, Digital Agencies, Growth Marketers, and Brands who want to scale their online presence 10x faster.',
      card1Badge: 'AI Copilot & Auto-Repurpose',
      card1Title: 'Turn 1 Idea Into 10 Native Platform Formats',
      card1Desc:
        'Input a blog URL or raw notes. Crove AI writes a 9:16 TikTok script with a 3s hook, an in-depth LinkedIn analysis, an engaging Twitter thread, and trending hashtags.',
      card1Tag1: '🔥 TikTok 3s Hook + Short Caption',
      card1Tag2: '💼 LinkedIn B2B + Bullet points',
      card1Tag3: '🧵 Twitter/X Thread (5 tweets)',
      card2Badge: 'Visual Scheduling',
      card2Title: 'Drag-and-Drop Calendar with AI Best-Time Prediction',
      card2Desc:
        'View your multi-channel calendar by week or month. Drag and drop to reschedule, color-code campaigns, and automatically post when your audience is most active.',
      card2BestTime: 'Peak engagement today: 20:30',
      card3Badge: 'Video Automation',
      card3Title: 'Direct Video Publishing to TikTok, Reels & Shorts',
      card3Desc:
        'Upload crisp 4K videos, set custom thumbnails, tag accounts, and select trending audio directly without mobile app approval notifications.',
      card4Badge: 'Cross-channel Analytics',
      card4Title: 'Unified Growth Metrics & Comprehensive Reporting',
      card4Desc:
        'Track views, engagement rate, click-throughs, and follower growth across all your channels in a single dashboard. Export sleek PDF client reports.',
      card5Badge: 'Agency & Workspaces',
      card5Title: 'Team Workspaces & Client Approval Workflows',
      card5Desc:
        'Manage permissions for Admins, Editors, and Client Reviewers. Clients can leave inline feedback and approve posts before they go live.',
    },
    preview: {
      pill: 'Interactive Studio',
      titleStart: 'Compose & Live Preview Across ',
      titleGradient: 'Every Social Platform',
      titleEnd: '',
      subtitle:
        'Type your draft or choose a preset below. Watch Crove adapt and format your content for each social network in real time.',
      templatesLabel: 'Presets:',
      tmpl1Title: '🚀 Product Launch',
      tmpl1Content:
        'Today we are officially launching Crove 2.0 — the AI-powered platform to schedule and automate posts across 28+ social media networks. Save 80% of your content workflow time today!',
      tmpl2Title: '💡 Viral Growth Tips',
      tmpl2Content:
        '3 secrets to make 1 piece of content viral on TikTok, LinkedIn, and Threads:\n1. Nail the 3-second hook\n2. Tailor captions to platform psychology\n3. Schedule at peak audience engagement hours',
      tmpl3Title: '🔥 48H Special Deal',
      tmpl3Content:
        'For the next 48 hours only: Get 3 months of Pro Creator tier completely free for the first 100 creators. Claim your spot now!',
      aiPolishBtn: 'Polish with AI ✨',
      aiPolishing: 'Optimizing...',
      copyBtn: 'Copy text',
      copiedBtn: 'Copied!',
      placeholder: 'Type your message or script here...',
      scheduleNow: 'Schedule this post now',
      directPublishBadge: 'Directly distributed via Official APIs',
      previewOf: 'Live Preview',
      characters: 'chars',
    },
    howItWorks: {
      pill: 'Effortless Workflow',
      titleStart: 'How It Works in ',
      titleGradient: '3 Simple Steps',
      titleEnd: '',
      subtitle: 'Get up and running in less than 3 minutes with zero technical complexity.',
      step1Num: '01',
      step1Title: 'Connect 28+ Socials in 1-Click',
      step1Desc:
        'Authenticate your TikTok, Facebook, LinkedIn, X, and YouTube accounts via official secure OAuth. Passwords are never stored.',
      step1Highlight: '100% Official APIs & Encrypted',
      step2Num: '02',
      step2Title: 'Create & Optimize with AI Copilot',
      step2Desc:
        'Draft once, and our AI automatically crafts platform-specific captions, tags, and media aspect ratios for maximum viral reach.',
      step2Highlight: 'Automatic format normalization',
      step3Num: '03',
      step3Title: 'Schedule & Automate Hands-Free',
      step3Desc:
        'Select a date/time or let Crove pick the AI Best Time. Powered by durable Temporal workflows for 100% punctual delivery.',
      step3Highlight: '99.99% Guaranteed Delivery',
    },
    comparison: {
      pill: 'Objective Comparison',
      titleStart: 'Why Choose ',
      titleGradient: 'Crove',
      titleEnd: ' Over Traditional Tools?',
      subtitle:
        'See why thousands of creators and agencies are switching to Crove to save up to 70% on monthly software costs.',
      featureHeader: 'Features & Capabilities',
      croveCol: 'Crove (Postiz)',
      row1Feature: 'Social networks supported',
      row1Crove: '28+ Channels (TikTok, YT, FB, X, LinkedIn, Discord, Reddit...)',
      row1Buffer: '8 Basic channels',
      row1Hootsuite: '7 Basic channels',
      row1Later: '6 Basic channels',
      row2Feature: 'Direct video posting (TikTok, Shorts, Reels)',
      row2Later: 'Mobile app push required',
      row3Feature: 'AI Content Copilot & Auto-Repurpose',
      row3Crove: 'Built-in & Tailored per platform',
      row3Buffer: 'Basic only',
      row3Hootsuite: 'Expensive add-on ($$$)',
      row3Later: 'Very limited',
      row4Feature: 'Automated Twitter/X Threads & Reddit Flairs',
      row5Feature: 'Intuitive Drag-and-Drop Content Calendar',
      row6Feature: 'Web3 Social & Custom Webhooks / REST API',
      row7Feature: 'Self-Hosted or Managed Cloud SaaS flexibility',
      row8Feature: 'Monthly cost for Creators & Agencies',
      row8Crove: 'Save up to 70% monthly',
      row8Buffer: 'Costs scale per channel',
      row8Hootsuite: 'Very expensive ($99+/mo)',
      row8Later: 'Strict post limits',
    },
    pricing: {
      pill: 'Transparent Pricing',
      titleStart: 'Small Investment, ',
      titleGradient: 'Massive Growth',
      titleEnd: '',
      subtitle:
        'Choose the plan that fits your growth stage. Upgrade, downgrade, or cancel anytime with one click.',
      monthly: 'Billed monthly',
      yearly: 'Billed yearly',
      saveBadge: 'Save 20%',
      starterName: 'Starter',
      starterDesc: 'Perfect for individuals starting to build their social presence.',
      starterPrice: '$0',
      starterPeriod: '/month forever',
      starterBadge: 'Free Forever',
      starterCta: 'Get Started Free',
      proName: 'Pro Creator',
      proDesc: 'Our most popular plan for Creators, Marketers, and growing brands.',
      proPriceMonthly: '$12',
      proPriceYearly: '$9',
      proPeriodMonthly: '/month (billed monthly)',
      proPeriodYearly: '/month (billed yearly)',
      proBadge: 'Most Popular ★',
      proCta: 'Start 14-Day Free Trial',
      agencyName: 'Agency & Team',
      agencyDesc: 'For Digital Marketing Agencies and multi-brand enterprises.',
      agencyPriceMonthly: '$39',
      agencyPriceYearly: '$29',
      agencyPeriodMonthly: '/month (billed monthly)',
      agencyPeriodYearly: '/month (billed yearly)',
      agencyBadge: 'Enterprise',
      agencyCta: 'Contact Agency Team',
    },
    testimonials: {
      pill: 'Trusted by 10,000+ Creators',
      titleStart: 'What Creators Say About ',
      titleGradient: 'Crove',
      titleEnd: '?',
      subtitle:
        'Real reviews from content creators, growth marketers, and agency owners.',
      t1Name: 'Alex Rivera',
      t1Role: 'Founder & Tech Lead @ SaaSify',
      t1Content:
        'Crove completely changed our content distribution game. We used to spend 2 hours every day manually posting to LinkedIn, X, and Facebook. Now it is literally 1 click!',
      t1Channels: '12 Channels',
      t2Name: 'Sarah Jenkins',
      t2Role: 'Head of Growth @ ModernMedia Agency',
      t2Content:
        'The direct video scheduling to TikTok and Shorts is blazing fast and reliable. Our clients love the intuitive cross-channel analytics reports.',
      t2Channels: '24 Channels',
      t3Name: 'Michael Chen',
      t3Role: 'Content Creator & YouTuber (150K Subs)',
      t3Content:
        'Crove AI Copilot writes natural, engaging captions tailored to each platform culture. My engagement on Threads and TikTok has more than doubled.',
      t3Channels: '8 Channels',
    },
    faq: {
      pill: 'Got Questions?',
      titleStart: 'Frequently Asked ',
      titleGradient: 'Questions',
      titleEnd: '',
      subtitle: 'Everything you need to know about the Crove platform and service.',
      q1: 'Is Crove safe for my social media accounts? Will my accounts get banned?',
      a1: 'Crove uses 100% official partner APIs from Meta (Facebook, Instagram, Threads), TikTok Developer Partner, Google (YouTube), X Developer, LinkedIn, and Reddit. We do not use unauthorized scraping bots or shady browser automation, ensuring zero risk of shadowbans or account restrictions.',
      q2: 'What content formats does Crove support?',
      a2: 'Crove supports all major content types: Short-form 9:16 video (TikTok, YouTube Shorts, Instagram Reels), 16:9 long videos, single image & carousel posts, multi-tweet X threads, markdown blog posts (Medium, Hashnode, Dev.to), and community announcements (Discord, Telegram, Slack).',
      q3: 'How does the AI Copilot work?',
      a3: 'Crove AI utilizes state-of-the-art LLMs trained on social media viral mechanics. It understands platform-specific algorithms and tone of voice, turning 1 idea into a punchy TikTok caption with a 3s hook, a structured LinkedIn post, or a captivating Twitter thread.',
      q4: 'Can I try Crove for free before paying?',
      a4: 'Yes! The Starter plan is 100% free forever for up to 3 channels. For Pro Creator and Agency plans, you get a 14-day free trial with full access to all premium features—no credit card required.',
      q5: 'Can I invite team members or clients to collaborate?',
      a5: 'Yes. The Agency & Team plan provides multi-user workspaces with customizable permissions for Admins, Editors, and Client Reviewers with an integrated approval queue.',
      q6: 'Can I cancel my subscription anytime?',
      a6: 'You can upgrade, downgrade, or cancel anytime with one click in your billing settings. No lock-in contracts and no hidden fees.',
    },
    cta: {
      pill: 'Ready to scale your social reach?',
      titleStart: 'Automate & Publish Across ',
      titleGradient: '28+ Channels',
      titleEnd: ' Today',
      subtitle:
        'Join 10,000+ creators and marketing teams saving 20+ hours every single week with Crove.',
      startBtn: 'Start Free Trial',
      viewPricing: 'Explore All Plans',
      trustCard: 'No credit card required',
      trustTime: 'Instant 60-second setup',
    },
    footer: {
      desc: 'Crove is the next-generation social media management and AI automation platform for 28+ channels.',
      uptime: '99.99% System Uptime',
      productTitle: 'Product',
      featLink: 'Features',
      channelsLink: '28+ Channels',
      previewLink: 'Live Preview',
      pricingLink: 'Pricing Plans',
      compareLink: 'Comparison',
      platformsTitle: 'Supported Platforms',
      accountTitle: 'Account & Legal',
      loginLink: 'Dashboard Login',
      registerLink: 'Create Account',
      privacyLink: 'Privacy Policy',
      termsLink: 'Terms of Service',
      rights: 'All rights reserved.',
      builtWith: 'Built with open-source tech & AI',
    },
  },
};
