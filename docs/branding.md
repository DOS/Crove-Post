# Runtime Branding Engine (White-label qua Biến Môi Trường)

## 1. Giới Thiệu

**Runtime Branding Engine** cho phép bạn thay đổi toàn bộ nhận diện thương hiệu của ứng dụng (Tên, Logo, Icon, Màu sắc chủ đạo, Tiêu đề SEO, Mẫu Email, Swagger API docs, Mastra MCP Server, Sentry telemetry, Chrome Extension) hoàn toàn ở **Runtime** thông qua các biến môi trường `BRAND_*`.

### 💡 Lợi Ích Cốt Lõi:
1. **Chỉ dùng 1 Docker Container Image duy nhất**: Không cần recompile mã nguồn hay build lại Docker Image khi đổi thương hiệu.
2. **Zero Merge Conflict với Upstream**: Sử dụng cơ chế runtime wrap thay vì chỉnh sửa cứng file tĩnh hoặc 15 file `translation.json` của hệ thống.
3. **Bảo mật & Tự Động Sanitize**: Tự động chặn các URL nguy hiểm (`javascript:`, `data:`, `//`), ngăn chặn XSS và kiểm tra định dạng màu HEX.
4. **Tuân thủ AGPL-3.0**: Tự động giữ nguyên liên kết mã nguồn gốc upstream (`BRAND_SOURCE_URL`) để đảm bảo tính pháp lý mã nguồn mở.

---

## 2. Danh Sách Biến Môi Trường `BRAND_*`

Bạn có thể cấu hình các biến này trong file `.env` hoặc trong `docker-compose.yaml`:

| Biến Môi Trường | Giá Trị Mặc Định | Mô Tả & Vị Trí Áp Dụng |
| :--- | :--- | :--- |
| `BRAND_NAME` | `Postiz` | Tên thương hiệu hiển thị trên thanh điều hướng, tiêu đề trang, email, và văn bản giao diện. |
| `BRAND_SHORT_NAME` | *(Theo `BRAND_NAME`)* | Tên rút gọn dùng cho sidebar thu nhỏ hoặc icon monogram. |
| `BRAND_DESCRIPTION` | `The open-source social media management platform` | Đoạn mô tả hiển thị trên thẻ Meta SEO và Extension manifest. |
| `BRAND_COMPANY_NAME`| *(Theo `BRAND_NAME`)* | Tên công ty / pháp nhân sở hữu dịch vụ. |
| `BRAND_LOGO_URL` | *(None / Fallback SVG)* | URL hình ảnh logo chính (Light mode / Default). |
| `BRAND_LOGO_DARK_URL`| *(Theo `BRAND_LOGO_URL`)* | URL hình ảnh logo trên nền tối (Dark mode). |
| `BRAND_ICON_URL` | *(None / Fallback Monogram)* | URL biểu tượng vuông (dùng cho icon app, favicon, avatar bot). |
| `BRAND_FAVICON_URL` | `/favicon.ico` | Đường dẫn favicon trên tab trình duyệt. |
| `BRAND_EMAIL_LOGO_URL`| *(Theo `BRAND_LOGO_URL`)* | URL logo hiển thị ở đầu các email thông báo. |
| `BRAND_PRIMARY_COLOR` | `#612BD3` | Mã màu HEX chủ đạo (dùng cho nút bấm, monogram, highlight). |
| `BRAND_WEBSITE_URL` | *(Tự fallback `MAIN_URL` -> `FRONTEND_URL`)* | Đường dẫn trang landing page / website chính thức (không bắt buộc nếu đã có `MAIN_URL` hoặc `FRONTEND_URL`). |
| `BRAND_SUPPORT_URL` | `https://discord.gg/postiz` | Đường dẫn hỗ trợ khách hàng / Discord / Trung tâm trợ giúp. |
| `BRAND_DOCS_URL` | `https://docs.postiz.com` | Đường dẫn trang tài liệu hướng dẫn người dùng. |
| `BRAND_SOURCE_URL` | `https://github.com/gitroomhq/postiz-app` | **Bắt buộc AGPL-3.0**: Link trỏ về kho mã nguồn. |
| `BRAND_TERMS_URL` | `/terms` | Đường dẫn trang Điều khoản dịch vụ. |
| `BRAND_PRIVACY_URL` | `/privacy` | Đường dẫn trang Chính sách bảo mật. |
| `BRAND_SUPPORT_EMAIL` | *(Tự fallback `support@<BRAND_DEFAULT_EMAIL_DOMAIN>`)* | Email hỗ trợ hiển thị cho người dùng. |
| `BRAND_DEFAULT_EMAIL_DOMAIN` | `postiz.com` | Tên miền gửi email mặc định (`notifications@...`). |
| `BRAND_EXTENSION_STORE_URL` | *(Trống)* | Link cài đặt Chrome Extension trên Chrome Web Store. |
| `BRAND_TUTORIAL_URL` | *(Trống)* | Link video YouTube hoặc bài viết hướng dẫn sử dụng. |

> **Lưu ý**: Đối với Frontend Next.js client, bạn có thể truyền các biến tương ứng có tiền tố `NEXT_PUBLIC_BRAND_*` nếu muốn ghi đè phía client.

---

## 3. Ví Dụ Cấu Hình Docker Compose

### Cấu hình cho thương hiệu Crove

```yaml
version: '3.8'

services:
  postiz:
    image: ghcr.io/gitroomhq/postiz-app:latest
    environment:
      # --- Cấu hình Brand Crove ---
      BRAND_NAME: "Crove"
      BRAND_SHORT_NAME: "Crove"
      BRAND_DESCRIPTION: "All-in-one AI Social Media Scheduler"
      BRAND_COMPANY_NAME: "Crove Inc"
      BRAND_PRIMARY_COLOR: "#7C3AED"
      BRAND_LOGO_URL: "https://crove.com/logo-light.png"
      BRAND_LOGO_DARK_URL: "https://crove.com/logo-dark.png"
      BRAND_ICON_URL: "https://crove.com/icon.png"
      BRAND_FAVICON_URL: "https://crove.com/favicon.ico"
      BRAND_EMAIL_LOGO_URL: "https://crove.com/email-logo.png"
      BRAND_WEBSITE_URL: "https://crove.com"
      BRAND_SUPPORT_URL: "https://support.crove.com"
      BRAND_SUPPORT_EMAIL: "support@crove.com"
      BRAND_DEFAULT_EMAIL_DOMAIN: "crove.com"
      
      # --- Các biến Postiz tiêu chuẩn ---
      MAIN_URL: "https://crove.com"
      FRONTEND_URL: "https://crove.com"
      NEXT_PUBLIC_BACKEND_URL: "https://crove.com/api"
      DATABASE_URL: "postgresql://..."
      REDIS_URL: "redis://..."
      JWT_SECRET: "your-secret-key"
```

---

## 4. Chi Tiết Hoạt Động Các Thành Phần

### 4.1. Logo & Icon Thông Minh (`Logo`, `LogoTextComponent`)
- Nếu có URL hợp lệ: Tự động hiển thị thẻ `<img>` với xử lý lỗi ảnh mượt mà (`onError`).
- Nếu đặt tên thương hiệu riêng nhưng không truyền ảnh: Tự động tạo **Monogram Badge** với chữ cái đầu viết hoa, nền màu `BRAND_PRIMARY_COLOR` và font chữ sắc nét.
- Nếu để mặc định `Postiz`: Hiển thị trọn vẹn bộ SVG nguyên bản của Postiz.

### 4.2. Runtime i18n Brand Injection (`useT`, `getT`)
- Hệ thống hook `useT()` (Client) và `getT()` (Server) tự động bọc chuỗi dịch ngôn ngữ và thay thế tên thương hiệu bằng `applyBrandToString`.
- Toàn bộ 15 ngôn ngữ (Tiếng Việt, Anh, Pháp, Đức, Nhật, Hàn, Trung, v.v.) tự động cập nhật tên thương hiệu mới mà không cần chỉnh sửa bất kỳ dòng nào trong các file JSON gốc.

### 4.3. Email Template Động (`EmailService`)
- Tự động thay đổi tên người gửi: `EMAIL_FROM_NAME` -> `BRAND_NAME`.
- Tự động gán địa chỉ người gửi: `notifications@BRAND_DEFAULT_EMAIL_DOMAIN`.
- Header email tự động chèn logo thương hiệu `BRAND_EMAIL_LOGO_URL` nếu được cấu hình.

### 4.4. Swagger API Docs & MCP Server
- Swagger Docs (`/docs`) hiển thị: `${BRAND_NAME} API Documentation`.
- Mastra Model Context Protocol Server đăng ký với tên: `${BRAND_NAME} MCP`.

### 4.5. Giám Sát & Telemetry Sentry
- Mọi exception và transaction gửi về Sentry đều được đính kèm context tag `brand: BRAND_NAME` để dễ dàng lọc và phân loại theo từng tenant / deployment.
