# 📐 Crove Post - UI/UX Rework Master Plan & Benchmark Blueprint

> **Status:** Draft / Architectural Standard  
> **Target:** Frontend Engineering (`apps/frontend`), Design System (`DESIGN.md`)  
> **Benchmark Sources:** Publer, Typefully, Buffer, Linear, Raycast  
> **Core Architecture:** Zero-Conflict / Layer-Isolated (Preserve 100% Upstream Workflow & Provider Engines)

---

## 1. 🎨 Brand Color & Visual Identity Analysis ("Crove")

### 1.1 Color Psychology & Brand Fit

| Option | Primary Accent | Vibe & Psychology | Industry Benchmark | Fit with Crove Ecosystem |
| :--- | :--- | :--- | :--- | :--- |
| **Option A: Emerald Tech Green (Xanh Ngọc Lục Bảo)** | `#10B981`<br>`#059669` | **Growth, Harvest, High-ROI, Freshness, Audience Expansion.**<br>Gợi liên tưởng trực tiếp đến *Grove* (vườn cây trĩu quả), *Crops* (thu hoạch thành quả kinh doanh). | Supabase, Warp.dev, Spotify, OpenAI | ⭐⭐⭐⭐⭐<br>Tách biệt hoàn toàn với màu Đỏ của DOS, tạo cảm giác tăng trưởng doanh thu mạnh mẽ. |
| **Option B: Royal Electric Purple (Tím Hoàng Gia)** | `#7C3AED`<br>`#6366F1` | **Intelligence, Premium SaaS, AI-Driven, Creator Authority.**<br>Mang tính nghệ thuật, nền tảng Business OS quyền lực và thông minh. | Raycast, Linear, Loom, Vercel AI | ⭐⭐⭐⭐<br>Sang trọng, hiện đại, nhưng dễ trùng lặp với màu tím mặc định của Postiz cũ nếu không tinh chỉnh. |

### 1.2 Khuyến Nghị Phối Màu (Hybrid Synergy)
- **Primary Brand Accent (Crove Core):** **Emerald Green (`#10B981` / `#059669`)** — Đại diện cho kênh phân phối, tăng trưởng Traffic, Leads & Khách hàng.
- **Secondary AI / Copilot Accent:** **Electric Purple / Violet (`#7C3AED`)** — Đại diện cho trợ lý AI Copilot, Magic Prompt & Tự động hóa thông minh.
- **Canvas Base:** **Obsidian Dark (`#08080f`)** & **Elevated Cards (`#0f0f1c` / `#121224`)** với viền mỏng `border-zinc-800/70`.

---

## 2. 🔍 Benchmark Nghiên Cứu UI/UX Từ Các Nền Tảng Hàng Đầu

### 2.1 Publer (Master of Multi-Brand Workspaces & Calendar UX)
* **Điểm sáng cần học hỏi:**
  - **Workspace & Brand Switcher:** Phân tách rõ ràng giữa các Client/Brand, cho phép switch workspace chỉ bằng 1 click với Avatar thương hiệu sắc nét.
  - **Interactive Calendar:** Phân màu trực quan theo từng trạng thái bài đăng (`Draft` = Xám, `Scheduled` = Xanh/Tím, `Failed` = Đỏ, `Published` = Xanh lá), kéo thả đổi giờ xuất bản mượt mà.
  - **Bulk Scheduling & Recycling:** Lên lịch hàng loạt và tái sử dụng bài đăng evergreen hiệu quả.

### 2.2 Typefully (Master of Post Composer & Distraction-Free Writing)
* **Điểm sáng cần học hỏi:**
  - **Split-View Post Composer:** Cột trái là trình soạn thảo siêu sạch (Distraction-free), cột phải là **Live Pixel-Perfect Mobile/Desktop Preview** mô phỏng 100% giao diện mạng xã hội thật.
  - **Thread & Multi-Channel Switcher:** Chuyển đổi tab xem trước giữa X, LinkedIn, Facebook, Instagram trong chớp mắt.
  - **Smart Character Meter:** Bộ đếm ký tự thanh thoát, cảnh báo trực quan khi vượt giới hạn của từng nền tảng.

### 2.3 Buffer & Metricool (Simplicity & Queue Slots)
* **Điểm sáng cần học hỏi:**
  - **Posting Schedule Queues:** Cài đặt trước các "Khung giờ vàng" (Posting Slots), khi soạn bài chỉ cần bấm *"Add to Queue"* là tự động vào khung giờ tối ưu tiếp theo.
  - **Clean Analytics Overview:** Các thẻ KPI tóm tắt (Reach, Engagement, Clicks) kèm biểu đồ sparkline thanh lịch.

### 2.4 Hootsuite (Bài Học Cần Tránh)
* **Nhược điểm cần tránh:**
  - Quá tải thông tin (Information Overload), bố cục nhiều cột dày đặc gây rối mắt và làm chậm hiệu năng.
  - Crove Post phải giữ triết lý **Linear/Raycast-Dense**: Gọn gàng, tốc độ phản hồi dưới 100ms, phím tắt tiện lợi.

---

## 3. 🏗️ Kiến Trúc Rework 4 Module Trọng Tâm (Zero-Conflict)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CROVE POST REWORK ARCHITECTURE                             │
├─────────────────────┬──────────────────────┬───────────────────┬────────────────┤
│      MODULE 1       │       MODULE 2       │     MODULE 3      │    MODULE 4    │
│  Shell & Navigation │ Post Composer Split  │ Visual Calendar   │ Smart Analytics│
├─────────────────────┼──────────────────────┼───────────────────┼────────────────┤
│ • Popover Workspace │ • Distraction-free   │ • Drag & Drop     │ • KPI Cards    │
│ • Collapsible Bar   │ • Live Mobile Prev   │ • Status Badges   │ • Sparklines   │
│ • Raycast-style Nav │ • Platform Overrides │ • Slot Auto-Fill  │ • Heatmaps     │
└─────────────────────┴──────────────────────┴───────────────────┴────────────────┘
```

### Module 1: App Shell & Workspace Switcher
- **Mục tiêu:** Thay thế dropdown cũ bằng Popover hiện đại.
- **Thiết kế:**
  - Component `CroveWorkspaceSelector`: Hiển thị Logo/Initials của Org, Role badge (`Super-Admin` / `Admin` / `Member`), Active checkmark.
  - Tích hợp tìm kiếm nhanh khi user có nhiều Org.
  - Chuyển đổi Workspace mượt mà qua SWR mutate (không reload trang).
  - Thu gọn Super-Admin Toolbar thành Floating Drawer / Toggle Button góc trên bên phải.

### Module 2: Post Composer Studio (Typefully Style)
- **Mục tiêu:** Tách Post Composer thành Split-View 2 cột độc lập.
- **Thiết kế:**
  - **Cột Trái (Editor Panel - 55%):** Channel selector, Rich Editor, Media Uploader từ R2, First Comment, AI Copilot Prompt, Time picker.
  - **Cột Phải (Live Platform Preview - 45%):** Tab chuyển đổi X, LinkedIn, Facebook, Instagram, TikTok, Threads với frame mô phỏng điện thoại/máy tính sắc nét.

### Module 3: Visual Interactive Calendar (Publer Style)
- **Mục tiêu:** Trải nghiệm quản lý lịch xuất bản trực quan, kéo thả linh hoạt.
- **Thiết kế:**
  - Kéo - thả (Drag-and-Drop) bài viết giữa các ngày và khung giờ.
  - Filter Bar ở đầu Calendar để lọc nhanh bài theo từng mạng xã hội hoặc theo trạng thái (`Draft`, `Scheduled`, `Published`).

### Module 4: Analytics & Insights Dashboard
- **Mục tiêu:** Thống kê hiệu quả bài đăng và kênh tăng trưởng mạnh nhất.
- **Thiết kế:**
  - Thẻ KPI tổng quan: Tổng Impressions, Engagement Rate, Top Channels.
  - Heatmap khung giờ có tương tác cao nhất trong tuần.

---

## 4. 🛡️ Quy Tắc Đảm Bảo "Zero-Conflict" Khi Merge Upstream

1. **Không sửa đổi core workflow và activity files:** Giữ nguyên các files trong `apps/orchestrator` và `libraries/nestjs-libraries/src/integrations/`.
2. **Theme thông qua CSS Variables:** Toàn bộ palette màu mới được định nghĩa trong `colors.scss` và `tailwind.config.cjs`, không hardcode mã màu lạ vào JSX của upstream.
3. **Component Isolation:** Các tính năng riêng của Crove (như DOS ID Workspace Switcher, AI Gateway settings) được đóng gói thành các sub-components riêng biệt, chỉ import vào tầng layout wrapper ngoài cùng.
