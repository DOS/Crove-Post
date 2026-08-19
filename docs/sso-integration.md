# Kiến Trúc Single Sign-On (SSO) & OAuth 2.1 PKCE Bridge

## 1. Tổng Quan

Hệ thống cho phép người dùng **Crove** đăng nhập thông qua tài khoản **DOS ID** (sử dụng Supabase OAuth 2.1) mà **không làm thay đổi hoặc can thiệp trực tiếp vào mã nguồn OAuth mặc định của Postiz**.

---

## 2. Thách Thức Kỹ Thuật

1. **Chuẩn OAuth 2.1 PKCE**: Supabase DOS ID yêu cầu luồng Authorization Code kết hợp với mã xác thực **PKCE** (`code_challenge` / `code_verifier`).
2. **Postiz Generic OAuth**: Postiz ở bản gốc chỉ hỗ trợ luồng Generic OAuth 2.0 cơ bản (chưa gửi các tham số PKCE).
3. **Tính Độc Lập**: Cần đảm bảo hình ảnh Docker của Postiz không bị sửa đổi cứng để giữ trọn vẹn khả năng nâng cấp upstream.

---

## 3. Giải Pháp: Cloudflare Worker SSO Bridge (`apps/crove-sso`)

Triển khai một Cloudflare Worker đóng vai trò cầu nối trung gian (Bridge) tại `https://sso.crove.com`, sử dụng Cloudflare **Durable Objects** (`OAUTH_STATE`) để lưu trữ trạng thái giao dịch và mã xác thực an toàn.

```
[ Trình Duyệt / Người Dùng ]
      │
      │ (1) Bấm Đăng nhập DOS ID
      ▼
[ Postiz App ]  ──(2) /authorize (Generic OAuth)──►  [ Crove SSO Bridge (Cloudflare Worker) ]
                                                               │
                                                               │ (3) Thêm PKCE S256 Challenge
                                                               ▼
                                                     [ Supabase DOS ID Provider ]
                                                               │
                                                               │ (4) Callback kèm Auth Code
                                                               ▼
[ Postiz App ]  ◄──(6) Trao đổi Token & UserInfo──  [ Crove SSO Bridge (Durable Object Store) ]
      │
      ▼
[ Đăng Nhập Thành Công ]
```

---

## 4. Đặc Tả Các Endpoint

### `GET /authorize`
- Tiếp nhận yêu cầu từ Postiz với `response_type=code`, `client_id`, `redirect_uri` và `state`.
- Sinh ngẫu nhiên `upstream_state` và mã bảo mật PKCE (`verifier` + `challenge`).
- Lưu trữ giao dịch vào Durable Object với thời gian sống (TTL) 10 phút.
- Chuyển hướng trình duyệt sang Supabase kèm theo `code_challenge` và `code_challenge_method=S256`.

### `GET /callback`
- Nhận mã phản hồi từ Supabase.
- Kiểm tra tính hợp lệ và tiêu thụ giao dịch (atomic consume) từ Durable Object store.
- Gửi yêu cầu đổi mã sang Access Token từ Supabase bằng `code_verifier` bảo mật.
- Tạo mã bridge code ngắn hạn (TTL 60 giây) và chuyển hướng người dùng về Postiz `redirect_uri`.

### `POST /token`
- Postiz gọi API đổi bridge code lấy Access Token.
- Xác thực Client Secret bằng thuật toán so sánh chuỗi hằng số thời gian (Constant-time comparison).
- Trả về thông tin Token đã nhận từ Supabase.

### `GET /userinfo`
- Chuyển tiếp yêu cầu lấy hồ sơ người dùng (`id`, `email`, `name`, `avatar`) từ Supabase về Postiz.

---

## 5. Triển Khai & Kiểm Thử

Mã nguồn nằm trong thư mục `apps/crove-sso/`:

```powershell
# Chạy unit tests cho SSO Worker
cd apps/crove-sso
pnpm test
```
