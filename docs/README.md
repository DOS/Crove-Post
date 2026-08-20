# Tài Liệu Kỹ Thuật Dự Án Crove / Postiz

Chào mừng đến với hệ thống tài liệu kỹ thuật chính thức của **Crove** (nền tảng quản lý và lên lịch mạng xã hội đa kênh mã nguồn mở dựa trên Postiz).

---

## 📚 Mục Lục Tài Liệu

| Tài Liệu | Nội Dung Chính |
| :--- | :--- |
| **[1. Runtime Branding Engine (White-labeling)](./branding.md)** | Hướng dẫn cấu hình toàn bộ thương hiệu (Logo, Tên, Màu sắc, Email, Swagger, MCP) qua biến môi trường `BRAND_*` mà không cần rebuild container. |
| **[2. Tự Động Đồng Bộ Upstream & CI Guard](./upstream-sync.md)** | Quy trình đồng bộ tự động với `gitroomhq/postiz-app` qua GitHub Actions và cơ chế kiểm thử Branding Guard CI. |
| **[3. Kiến Trúc SSO & OAuth 2.1 PKCE Bridge](./sso-integration.md)** | Thiết kế hệ thống đăng nhập đơn DOS ID / Supabase OAuth 2.1 sử dụng Cloudflare Workers & Durable Objects. |
| **[4. First-Party Provisioning API](./first-party-provisioning.md)** | Đặc tả API cấp phát tài khoản tự động (`/v1/provision`) phục vụ tích hợp hệ sinh thái. |
| **[5. Phân Chia Môi Trường Beta & Staging](./beta-environment.md)** | Cấu hình độc lập 2 môi trường Production (`crove.com`, `app.crove.com`) và Beta (`beta.crove.com`, `beta-app.crove.com`). |
| **[6. Hệ Thống Tự Động Hóa CI/CD](./cicd.md)** | Hướng dẫn toàn bộ pipeline GitHub Actions, phân nhánh dev/main và tự động build/deploy container. |

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án là một **Monorepo (PNPM Workspaces)** với các thành phần chính:

```
├── apps/
│   ├── backend/        # NestJS API Server (DTO -> Controller -> Service -> Repository)
│   ├── orchestrator/   # Temporal Worker (Workflows & Activities cho lịch đăng bài)
│   ├── frontend/       # Next.js 16 (App Router) + React 19 + Tailwind CSS 3
│   ├── extension/      # Chrome Extension Manifest V3 (Cookie capture & social bridge)
│   └── crove-sso/      # Cloudflare Worker SSO Bridge (OAuth 2.1 PKCE)
├── libraries/
│   ├── helpers/        # Tiện ích chung, Brand Config Engine, Fetch utilities
│   ├── nestjs-libraries/# 34+ Social Providers, Email, Database Prisma, Mastra MCP
│   └── react-shared-libraries/ # UI Components, i18n Translations, Sentry
├── docs/               # Tài liệu kỹ thuật chi tiết
├── scripts/            # Script kiểm thử và CI guards (branding-guard.ts)
└── .github/workflows/  # CI/CD Workflows (Build, Sync Upstream, Branding Guard)
```

---

## 🚀 Hướng Dẫn Bắt Đầu Nhanh

### Chạy Local Development với PNPM

```powershell
# 1. Cài đặt dependencies
pnpm install

# 2. Sinh Prisma Client
pnpm exec prisma generate --schema=libraries/nestjs-libraries/src/database/prisma/schema.prisma

# 3. Khởi động môi trường dev
pnpm dev
```

### Chạy với Docker Compose

```powershell
docker compose -f docker-compose.yaml up -d
```
