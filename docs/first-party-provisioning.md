# First-Party Headless Provisioning & One-Time Ticket API

## 1. Overview
Enables zero-friction autonomous connections (e.g. DOSClaw AI agents, ecosystem connectors) to provision local user and workspace projections in Crove Post and receive a one-time authentication ticket without requiring interactive registration or company setup forms.

---

## 2. API Specifications

### 2.1. Headless Provisioning: `POST /v1/provision`

- **Authentication**: `Authorization: Bearer <PROVISIONING_SECRET_KEY>`
- **Idempotency**: Idempotent create-or-update based on `userId` (DOS ID) and `orgId`.

#### Request Headers:
```http
POST /v1/provision HTTP/1.1
Host: post.crove.com
Authorization: Bearer <PROVISIONING_SECRET_KEY>
Content-Type: application/json
```

#### Request Body:
```json
{
  "userId": "48fc3631-ec8c-4e78-aa98-ec89c1c3624d",
  "email": "joy@dos.ai",
  "name": "JOY",
  "orgId": "ca970340-c49d-4360-90e1-5c9fae597337",
  "orgName": "Crove Corporation",
  "role": "SUPERADMIN"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "ticket": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "loginUrl": "https://post.crove.com/auth/ticket?ticket=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_...",
    "email": "joy@dos.ai",
    "name": "JOY"
  },
  "organization": {
    "id": "ca970340-c49d-4360-90e1-5c9fae597337",
    "name": "Crove Corporation"
  }
}
```

---

### 2.2. Ticket Consumption: `POST /v1/ticket/consume`

- **Endpoint**: `POST /v1/ticket/consume`
- **Purpose**: Consumes a valid one-time ticket, establishes secure authentication cookies (`auth`, `showorg`), and redirects directly to the target URL (e.g. OAuth authorize consent screen).

#### Request Body:
```json
{
  "ticket": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirect_to": "/oauth/authorize?client_id=pca_dosclaw_prod_18790ccb&response_type=code"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "jwt": "...",
  "userId": "usr_...",
  "orgId": "ca970340-c49d-4360-90e1-5c9fae597337",
  "redirect_to": "/oauth/authorize?client_id=pca_dosclaw_prod_18790ccb&response_type=code"
}
```
