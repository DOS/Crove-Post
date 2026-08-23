# Kiến Trúc Hệ Thống Crove OS (Hybrid Sync & Unified SSO)

Tài liệu này quy định kiến trúc kỹ thuật chuẩn về **Đồng bộ Định danh & Tổ chức (Hybrid Identity & Organization Sync)**, **Ủy quyền tạo Tổ chức (API-First Delegation)** và **Cơ chế Đăng nhập Đơn Generic OAuth 2.0 PKCE Bridge** giữa trung tâm định danh **DOS.Me ID** và các ứng dụng thành viên trong hệ sinh thái **Crove** (Crove Post, Crove CRM, Crove Sign, Crove Cal, Crove Desk).

---

## 1. 🌟 Tổng Quan Hệ Sinh Thái Crove OS

Hệ sinh thái Crove bao gồm các ứng dụng mã nguồn mở độc lập được tích hợp qua lớp định danh và điều phối dữ liệu tập trung:

```
                                  ┌───────────────────────────────┐
                                  │      DOS.Me ID & Platform     │
                                  │  (Supabase Auth + api.dos.me) │
                                  └───────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
       ┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
       │    Crove Post     │            │     Crove CRM     │            │    Crove Sign     │
       │ (Postiz - NestJS) │            │ (Twenty - TypeORM)│            │(Documenso - Next) │
       │   Schema: post    │            │   Schema: core    │            │   Schema: sign    │
       └───────────────────┘            └───────────────────┘            └───────────────────┘
                 │                                │                                │
                 └────────────────────────────────┼────────────────────────────────┘
                                                  ▼
                                        ┌───────────────────┐
                                        │     Crove Cal     │
                                        │  (Cal.com - TRPC) │
                                        │   Schema: cal     │
                                        └───────────────────┘
```

---

## 2. 🔄 Chuẩn Đồng Bộ Identity & Organization (Hybrid Sync Standard)

### 2.1. Vấn Đề Cốt Lõi
- Mỗi sản phẩm thành viên (Postiz, Twenty CRM, Documenso, Cal.com) sở hữu database/schema riêng biệt để phục vụ tính độc lập và khả năng nâng cấp upstream.
- **Nếu chỉ dùng Webhook push từ DOS.Me**: Khi User tạo Org mới trên DOS.Me nhưng chưa từng đăng nhập vào app con, app con chưa có `User ID` local nên không thể map quan hệ Foreign Key.
- **Nếu chỉ dùng JIT lúc Login**: Khi User đã login rồi nhưng sau đó được thêm vào Org mới trên DOS.Me thì app con sẽ bị lệch dữ liệu nếu User không đăng xuất/đăng nhập lại.

👉 **Giải pháp tiêu chuẩn**: **Kiến trúc Hybrid Sync 2 pha (JIT + Webhook)**.

---

### 2.2. Chi Tiết 2 Pha Đồng Bộ

#### 🔹 Pha 1: JIT (Just-In-Time) Sync khi Login OIDC (Khởi tạo lần đầu)
Mỗi khi User đăng nhập qua nút **DOS ID**:
1. **User & Profile Sync**: App con đọc `id_token` / `userinfo` từ DOS.Me:
   - `sub`: Unique ID của DOS.Me / Supabase Auth
   - `email`: Email chính
   - `name`: Tên hiển thị đầy đủ
   - `picture`: Avatar URL
   $\rightarrow$ App con tự động tạo mới / cập nhật `User` local và lưu avatar/tên.
2. **Organization Provisioning**:
   - Nếu User chưa thuộc Org nào trong app con: App con đọc claim `organizations: [{ id, name, role }]` trong UserInfo để tự động provision Workspace/Org tương ứng và gán quyền (`SUPERADMIN` / `ADMIN` / `USER`).

#### 🔹 Pha 2: Event-Driven Sync qua Webhook (Cập nhật thời gian thực)
Khi có sự thay đổi từ trang quản trị DOS.Me (đổi tên Org, thêm thành viên, xóa thành viên, nâng cấp plan):
- **DOS.Me Event Router** gửi Webhook POST kèm chữ ký HMAC (`X-DOS-Signature: sha256=...`) đến endpoint nội bộ của các app con:
  - `https://post.crove.com/api/webhooks/dos-org-sync`
  - `https://crm.crove.com/api/webhooks/dos-org-sync`
  - `https://sign.crove.com/api/webhooks/dos-org-sync`
  - `https://cal.crove.com/api/webhooks/dos-org-sync`
  - `https://desk.crove.com/api/webhooks/dos-org-sync`

---

## 3. 🏛️ Mô Hình Tạo Tổ Chức: API-First Delegation (Cách 3)

Để đảm bảo **Trải nghiệm người dùng mượt mà (ở lại app)** và **Toàn vẹn dữ liệu (Single Source of Truth)**, các app con không ghi trực tiếp vào `public.organizations`, mà thực hiện **Ủy quyền tạo qua API Hub (`api.dos.me`)**:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌──────────────────────┐
│   User bấm tạo  │──────▶│ App con (Post,  │──────▶│   api.dos.me    │──────▶│ Database (Supabase)  │
│ Org trong App   │       │ Sign, CRM, Cal) │       │(NestJS Org Svc) │       │ schema: public       │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └──────────────────────┘
                                                             │
                                          ┌──────────────────┴──────────────────┐
                                          │ Webhook Dispatcher (HMAC-SHA256)    │
                                          ├─────────────────────────────────────┤
                                          │ ▶ Crove Post (`/api/webhooks/...`)  │
                                          │ ▶ Crove CRM                         │
                                          │ ▶ Crove Sign                        │
                                          │ ▶ Crove Cal                         │
                                          │ ▶ Crove Desk                        │
                                          └─────────────────────────────────────┘
```

### 3.1. Quy Trình Thực Thi
1. **Frontend / Server Action App Con**: Gửi request tạo Org:
   - **Endpoint**: `POST https://api.dos.me/organizations`
   - **Header**: `Authorization: Bearer <user_access_token>`
   - **Body**:
     ```json
     {
       "name": "Acme Corp",
       "slug": "acme-corp"
     }
     ```
2. **Phía `api.dos.me`**:
   - Kiểm tra **Quota / Subscription Entitlement** của User (gói Free/Pro/Enterprise có được tạo thêm Org không).
   - Tạo bản ghi trong `public.organizations` và set User làm `OWNER` trong `public.org_members`.
   - `WebhookDispatcherService` tự động dispatch sự kiện `org.created` tới toàn bộ các webhook URL đã đăng ký.
   - Trả về `{ success: true, organization: { id, name, slug } }`.
3. **App con nhận phản hồi**: Cập nhật `active_org` và hiển thị Workspace mới ngay lập tức cho User mà không cần reload/redirect trang.

---

## 4. 🔑 Chuẩn Hóa Generic OAuth 2.0 PKCE Bridge (DOS ID SSO)

### 4.1. Vấn Đề với Cloudflare Workers Rời Rạc
Trước đây, hệ thống sử dụng Cloudflare Worker (`sso.crove.com` và `beta-sso.crove.com`) làm proxy PKCE trung gian giữa Postiz (chỉ hỗ trợ Generic OAuth 2.0 `client_secret_post`) và Supabase Auth (bắt buộc OAuth 2.1 PKCE `code_challenge`).
- **Nhược điểm**: Phân mảnh cấu hình môi trường, phải duy trì secrets ở 2 nơi (Cloudflare + GCP Secret Manager), phát sinh lỗi DNS CNAME/SSL.

### 4.2. Kiến Trúc Cầu Nối Tập Trung trên `api.dos.me`

Gom toàn bộ logic PKCE Bridge về trực tiếp `api.dos.me` / `id.dos.me`:

```
┌─────────────────┐           ┌──────────────────────────────────────┐           ┌────────────────────────┐
│   Crove Post    │           │             api.dos.me               │           │     Supabase Auth      │
│  (Postiz Core)  │           │         (Generic PKCE Bridge)        │           │     (OAuth 2.1 Server) │
└─────────────────┘           └──────────────────────────────────────┘           └────────────────────────┘
         │                                       │                                            │
         │ 1. GET /oauth/authorize               │                                            │
         │    (OAuth 2.0 cơ bản)                 │                                            │
         │──────────────────────────────────────▶│ 2. Tự sinh code_verifier & S256 challenge  │
         │                                       │    Lưu verifier vào OAuthFlowState         │
         │                                       │ 3. Redirect sang Supabase Auth kèm PKCE    │
         │                                       │───────────────────────────────────────────▶│
         │                                       │                                            │
         │                                       │ 4. Supabase trả authorization code         │
         │                                       │◀───────────────────────────────────────────│
         │ 5. Trả code về lại Crove Post         │                                            │
         │◀──────────────────────────────────────│                                            │
         │                                       │                                            │
         │ 6. POST /oauth/token                  │                                            │
         │    (client_secret_post từ Postiz)     │                                            │
         │──────────────────────────────────────▶│ 7. Lấy lại code_verifier từ State         │
         │                                       │    Gửi code + verifier sang Supabase       │
         │                                       │───────────────────────────────────────────▶│
         │                                       │ 8. Nhận access_token / id_token            │
         │ 9. Trả token chuẩn OAuth 2.0          │◀───────────────────────────────────────────│
         │◀──────────────────────────────────────│                                            │
```

### 4.3. Lợi Ích Cốt Lõi
1. **Loại bỏ 100% Cloudflare Workers `sso.crove.com`**: Đơn giản hóa kiến trúc hạ tầng và giảm thiểu điểm nghẽn mạng.
2. **Hỗ trợ đồng nhất mọi Open Source**: Postiz, Twenty CRM, Documenso, Cal.com đều cắm chung một định dạng endpoint chuẩn OAuth 2.0:
   - `POSTIZ_OAUTH_AUTH_URL=https://api.dos.me/oauth/authorize` (hoặc `https://beta-api.dos.me/oauth/authorize`)
   - `POSTIZ_OAUTH_TOKEN_URL=https://api.dos.me/oauth/token`
   - `POSTIZ_OAUTH_USERINFO_URL=https://api.dos.me/oauth/userinfo`
3. **Quản lý Secrets duy nhất**: Toàn bộ `client_secret` được lưu trong **GCP Secret Manager** (Project: `dos-me`).

---

## 5. 📦 Đặc Tả Webhook Payload (`/api/webhooks/dos-org-sync`)

### 5.1. Headers Bắt Buộc
```http
POST /api/webhooks/dos-org-sync HTTP/1.1
Host: post.crove.com
Content-Type: application/json
X-DOS-Signature: sha256=a1b2c3d4e5f6... (HMAC SHA-256 tính từ secret chung)
```

### 5.2. Định Dạng JSON Payload
```json
{
  "event": "org.member_added",
  "timestamp": "2026-08-23T08:00:00Z",
  "data": {
    "org_id": "org_dos_123456",
    "org_name": "Tingee Corporation",
    "user_id": "usr_dos_789012",
    "user_email": "member@crove.com",
    "user_name": "Nguyen Van A",
    "role": "ADMIN"
  }
}
```

### 5.3. Danh Sách Sự Kiện (`event`)
| Event | Mô Tả | Hành Động Phía Crove Post |
| :--- | :--- | :--- |
| `org.created` | Tạo tổ chức mới | Tạo `Organization` + gán `SUPERADMIN` cho owner |
| `org.updated` | Đổi tên tổ chức | Cập nhật trường `name` trong `Organization` |
| `org.deleted` | Xóa tổ chức | Đánh dấu `deletedAt` trên `Organization` |
| `org.member_added` | Thêm thành viên vào tổ chức | Tạo bản ghi `UserOrganization` với role tương ứng |
| `org.member_removed` | Xóa thành viên khỏi tổ chức | Xóa bản ghi trong `UserOrganization` |

---

## 6. 📊 Bảng Ánh Xạ Schema Giữa DOS.Me và Các Ứng Dụng Thành Viên

| Thực thể DOS.Me (`public`) | Crove Post (`post`) | Crove CRM (`core`) | Crove Sign (`sign`) | Crove Cal (`cal`) |
| :--- | :--- | :--- | :--- | :--- |
| `profiles.user_id` | `User.providerId` | `user.id` / `sub` | `User.id` | `users.id` |
| `profiles.email` | `User.email` | `user.email` | `User.email` | `users.email` |
| `profiles.name` | `User.name` | `user.name` | `User.name` | `users.name` |
| `organizations.id` | `Organization.id` | `workspace.id` | `Organisation.id` | `Team.id` |
| `organizations.name` | `Organization.name` | `workspace.name` | `Organisation.name` | `Team.name` |
| `org_members.role` | `UserOrganization.role` | `workspaceMember.role` | `OrganisationMember.role` | `Membership.role` |
