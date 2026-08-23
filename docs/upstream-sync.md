# Tự Động Đồng Bộ Upstream & Branding Guard CI

## 1. Mục Đích & Chiến Lược

Dự án Crove duy trì tính tương thích 100% với phiên bản gốc **Postiz** (`gitroomhq/postiz-app`). Để đảm bảo nhận được các tính năng mới, bản vá bảo mật và các provider mạng xã hội mới nhất từ upstream mà không làm hỏng các tuỳ biến thương hiệu và SSO của Crove, hệ thống triển khai chiến lược tự động hoá 2 tầng:

1. **Branding Guard CI**: Bộ kiểm thử hợp đồng tự động xác thực tính toàn vẹn của logic branding, bảo mật URL/màu sắc và giấy phép AGPL.
2. **Upstream Sync Workflow**: GitHub Actions tự động kéo code mới từ upstream, kiểm tra xung đột và mở Pull Request tự động.

---

## 2. Branding Guard Script (`scripts/branding-guard.ts`)

File kịch bản `scripts/branding-guard.ts` thực thi các kiểm tra nghiêm ngặt:

- ✅ **Default Fallback**: Đảm bảo khi không cấu hình ENV, hệ thống giữ nguyên 100% giá trị mặc định của Postiz.
- ✅ **Custom Branding Parser**: Kiểm tra khả năng phân tích và nạp đầy đủ các tham số `BRAND_*`.
- ✅ **Security URL Sanitization**: Chặn đứng các vector tấn công XSS qua `javascript:`, `data:`, protocol-relative `//` và URL chứa embedded credentials.
- ✅ **Color Validation**: Chỉ chấp nhận mã màu hợp lệ định dạng HEX (`#RGB`, `#RRGGBB`, `#RRGGBBAA`).
- ✅ **i18n String Interpolation**: Đảm bảo từ khoá thương hiệu được thay thế chính xác theo ranh giới từ.
- ✅ **AGPL-3.0 Compliance**: Bắt buộc trường `sourceUrl` luôn trỏ về kho mã nguồn mở gốc.

### Chạy Branding Guard cục bộ:

```powershell
pnpm exec tsx scripts/branding-guard.ts
```

---

## 3. GitHub Actions Workflows

### 3.1. Branding Guard CI (`.github/workflows/branding-guard.yml`)
- Kích hoạt khi có `push` hoặc `pull_request` vào nhánh `main` hoặc `master`.
- Đảm bảo không có bất kỳ commit nào phá vỡ các quy tắc branding và bảo mật.

### 3.2. Upstream Sync Workflow (`.github/workflows/sync-upstream.yml`)
- Chạy tự động theo lịch Cron (03:00 UTC mỗi ngày) hoặc trigger thủ công (`workflow_dispatch`).
- Thao tác thực hiện:
  1. `git fetch upstream main --tags` từ `https://github.com/gitroomhq/postiz-app.git`.
  2. Tạo nhánh tự động dạng `upstream-sync-YYYYMMDD`.
  3. Merge các commit mới nhất.
  4. Chạy `scripts/branding-guard.ts` để kiểm tra an toàn.
  5. Tự động mở Pull Request trên GitHub repo để đội ngũ review và merge.

### 3.3. Build Containers Workflow (`.github/workflows/build-containers.yml`)
- Tích hợp bước **Verify Branding Guard** trước khi bắt đầu build image multi-arch (`linux/amd64` và `linux/arm64`).
- Đẩy Docker Image thành phẩm lên GitHub Container Registry (`ghcr.io`).
