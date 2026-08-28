# Kiến Trúc & Triển Khai Môi Trường Beta (Crove Staging)

Tài liệu này mô tả chi tiết kiến trúc phân chia 2 môi trường **Production** và **Beta (Staging)** của nền tảng Crove, bao gồm định tuyến tên miền, cấu hình Docker Compose, SSO Bridge và Cloudflare Tunnel.

---

## 1. Sơ Đồ Định Tuyến 2 Môi Trường (Production vs Beta)

| Thành Phần | Môi Trường PRODUCTION | Môi Trường BETA (Staging) | Ghi Chú |
| :--- | :--- | :--- | :--- |
| **Landing Page** (`apps/web`) | `https://crove.com`<br>`https://www.crove.com` | `https://beta.crove.com` | Next.js 16 App Router, đa ngôn ngữ VI/EN, Dark/Light theme |
| **App Dashboard** (`apps/frontend` + `backend`) | `https://post.crove.com` | `https://beta-post.crove.com` | Core App Postiz, quản lý 28+ mạng xã hội |
| **SSO Worker** (`apps/crove-sso`) | `https://sso.crove.com` | `https://beta-sso.crove.com` | Cloudflare Worker OAuth 2.1 PKCE Bridge kết nối Supabase |
| **Supabase Client ID** | `18790ccb-4d71-48cd-ad24-aee5f3ced3da` | `7ef5e5f1-68e6-42a7-901e-1f39e9471d24` | Ứng dụng OAuth riêng biệt trên Supabase / DOS ID |
| **Docker Compose Stack** | `scripts/docker-compose.prod.yaml` | `scripts/docker-compose.beta.yaml` | Độc lập về Database & Redis, chia sẻ Temporal cluster |
| **Environment File** | `scripts/crove-server.env` | `scripts/crove-server.beta.env` | Chứa các biến cấu hình riêng biệt |

---

## 2. Cấu Trúc Docker Compose Môi Trường Beta

Stack Beta chạy độc lập trên máy chủ GCP (`crove-server`), sử dụng mạng Docker `crove-post-beta-network` riêng biệt để đảm bảo không xung đột dữ liệu với Production:

```yaml
services:
  # 1. Crove Post Core App (Beta)
  crove-post-beta:
    image: ghcr.io/dos/crove-post:beta
    container_name: crove-post-beta
    restart: always
    env_file:
      - crove-server.beta.env
    volumes:
      - crove-post-beta-config:/config/
      - crove-post-beta-uploads:/uploads/
    ports:
      - '127.0.0.1:5001:5000'
    networks:
      - crove-post-beta-network
      - postiz-network
      - temporal-network

  # 2. Crove Landing Page (Beta)
  crove-web-beta:
    image: ghcr.io/dos/crove-web:beta
    container_name: crove-web-beta
    restart: always
    ports:
      - '127.0.0.1:3001:3000'
    networks:
      - crove-post-beta-network

  # 3. PostgreSQL Database (Beta)
  crove-postgres-beta:
    image: postgres:17-alpine
    container_name: crove-postgres-beta
    volumes:
      - crove-postgres-beta-volume:/var/lib/postgresql/data
    networks:
      - crove-post-beta-network

  # 4. Redis Cache (Beta)
  crove-redis-beta:
    image: redis:7.2
    container_name: crove-redis-beta
    volumes:
      - crove-redis-beta-data:/data
    networks:
      - crove-post-beta-network
```

---

## 3. Cấu Hình Định Tuyến Cloudflare Tunnel

File `scripts/tunnel-config.yml` định tuyến lưu lượng truy cập từ Cloudflare Edge trực tiếp tới các container qua mạng riêng ảo:

```yaml
tunnel: 41d183ca-1507-4092-a2e5-a5bd988282ee
credentials-file: /etc/cloudflared/credentials.json

ingress:
  # Production Routes
  - hostname: post.crove.com
    service: http://crove-post:5000
  - hostname: app.crove.com
    service: http://crove-post:5000
  - hostname: crove.com
    service: http://crove-web:3000
  - hostname: www.crove.com
    service: http://crove-web:3000

  # Beta Routes
  - hostname: beta-post.crove.com
    service: http://crove-post-beta:5000
  - hostname: beta-app.crove.com
    service: http://crove-post-beta:5000
  - hostname: beta.crove.com
    service: http://crove-web-beta:3000

  - service: http_status:404
```

---

## 4. Lệnh Triển Khai Nhanh

### Deploy Môi Trường Beta
```powershell
# Chạy script tự động hóa
.\scripts\deploy-beta.ps1

# Hoặc khởi chạy container trên máy chủ GCP
docker compose -f scripts/docker-compose.beta.yaml up -d
```

### Deploy Môi Trường Production
```powershell
# Chạy script tự động hóa
.\scripts\deploy-prod.ps1

# Hoặc khởi chạy container trên máy chủ GCP
docker compose -f scripts/docker-compose.prod.yaml up -d
```
