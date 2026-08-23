# First-Party Provisioning API

## 1. Mục Đích

Cung cấp API cấp phát tài khoản tự động (`/v1/provision`) cho phép hệ sinh thái dịch vụ của Crove tự động tạo tài khoản người dùng, thiết lập tổ chức mặc định và cấu hình gói thuê bao mà không cần thao tác thủ công trên giao diện.

---

## 2. Đặc Tả Kỹ Thuật

- **Giao thức**: HTTPS REST API
- **Xác thực**: Bearer Token thông qua khóa bí mật nội bộ (`PROVISIONING_SECRET_KEY`).
- **Idempotency**: Hỗ trợ gọi nhiều lần cho cùng một người dùng (idempotent create-or-update).

### Endpoint: `POST /v1/provision`

#### Headers:
```http
Authorization: Bearer <PROVISIONING_SECRET_KEY>
Content-Type: application/json
```

#### Request Body:
```json
{
  "userId": "usr_948194812",
  "email": "user@domain.com",
  "name": "Nguyen Van A",
  "orgName": "My Team",
  "plan": "PRO",
  "metadata": {
    "source": "crove-hub"
  }
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "usr_948194812",
    "email": "user@domain.com",
    "name": "Nguyen Van A"
  },
  "organization": {
    "id": "org_1928374",
    "name": "My Team"
  }
}
```

---

## 3. Quy Tắc Nghiệp Vụ
1. Nếu người dùng chưa tồn tại trong cơ sở dữ liệu: Tạo User mới và Organization tương ứng.
2. Nếu người dùng đã tồn tại: Cập nhật thông tin Profile và kích hoạt quyền truy cập tương ứng với gói thuê bao.
3. Không làm lộ thông tin mật khẩu hoặc khóa nội bộ trong kết quả trả về.
