# Hệ Thống Tự Động Hóa CI/CD (GitHub Actions & Deployment)

Hệ thống CI/CD của Crove tự động hóa toàn diện từ kiểm thử mã nguồn, kiểm tra bản quyền & runtime branding, build đa kiến trúc Docker containers và triển khai lên Cloudflare Workers cùng máy chủ GCP.

---

## 1. Danh Sách Workflows GitHub Actions

| Workflow | File | Trigger | Chức Năng |
| :--- | :--- | :--- | :--- |
| **Deploy SSO Bridge** | `.github/workflows/deploy-sso.yml` | Push vào `apps/crove-sso/**` hoặc dispatch | Chạy Vitest (31 tests) + deploy Cloudflare Worker lên `sso.crove.com` (main) hoặc `beta-sso.crove.com` (dev). |
| **Build & Deploy Containers** | `.github/workflows/build-deploy-crove.yml` | Push vào `main` hoặc `dev` | Chạy Branding Guard -> Build & Push GHCR images (`postiz-app` & `crove-web`) với tags tương ứng (`latest` / `beta`). |
| **Branding Guard CI** | `.github/workflows/branding-guard.yml` | Push / PR vào `main` hoặc `master` | Xác thực tính hợp lệ của Runtime Branding Engine và giấy phép AGPL-3.0. |
| **Upstream Sync** | `.github/workflows/sync-upstream.yml` | Định kỳ hàng ngày (04:00 UTC) hoặc dispatch | Tự động đồng bộ commit mới từ upstream `gitroomhq/postiz-app`, chạy guard và tạo Pull Request. |

---

## 2. Quy Trình Phân Nhánh & Triển Khai (Branching Strategy)

```
[ Nhánh DEV (Staging) ]
   │
   ├──> 1. Push code lên nhánh `dev`
   ├──> 2. CI/CD chạy Branding Guard & Tests
   ├──> 3. Build & Push Image: ghcr.io/.../postiz-app:beta & crove-web:beta
   ├──> 4. Deploy SSO: beta-sso.crove.com
   └──> 5. Cập nhật môi trường: beta.crove.com & beta-app.crove.com
   
[ Nhánh MAIN (Production) ]
   │
   ├──> 1. Merge PR từ `dev` vào `main`
   ├──> 2. CI/CD chạy Branding Guard & Tests
   ├──> 3. Build & Push Image: ghcr.io/.../postiz-app:latest & crove-web:latest
   ├──> 4. Deploy SSO: sso.crove.com
   └──> 5. Cập nhật môi trường: crove.com & app.crove.com
```

---

## 3. Các Biến Bí Mật Cần Cấu Hình Trên GitHub Repo (Secrets)

| Secret | Mô Tả | Bắt Buộc |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | Token quyền Deploy Workers & DNS trên Cloudflare | Có |
| `CLOUDFLARE_ACCOUNT_ID` | ID tài khoản Cloudflare (`3368ff98a4c956164b7bbdc8fb950163`) | Tùy chọn |
| `GITHUB_TOKEN` | Tự động sinh bởi GitHub Actions để push images lên GHCR | Tự động |
| `GCP_SSH_KEY` | SSH Private Key để kết nối máy chủ GCP `crove-server` | Tùy chọn (cho auto deploy) |
| `GCP_HOST` | Địa chỉ IP hoặc hostname máy chủ GCP | Tùy chọn (cho auto deploy) |

---

## 4. Scripts Tự Động Hóa Triển Khai Local & Server

| Script | Đường Dẫn | Mục Đích |
| :--- | :--- | :--- |
| **Deploy Beta** | `scripts/deploy-beta.ps1` | Chạy test, deploy SSO Beta và xuất hướng dẫn container |
| **Deploy Prod** | `scripts/deploy-prod.ps1` | Chạy test, deploy SSO Prod và xuất hướng dẫn container |
| **Deploy SSO** | `scripts/deploy-sso.ps1` | Deploy SSO độc lập với tham số `-Environment beta` hoặc `prod` |
| **Branding Guard** | `scripts/branding-guard.ts` | Bộ kiểm thử toàn diện cho Runtime Branding Engine |
