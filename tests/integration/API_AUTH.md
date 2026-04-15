# Auth Module API Documentation

## Overview
Authentication and authorization endpoints for user registration, login, email verification, and password management.

## Base URL
`/api/v1/auth`

## Rate Limiting
All auth endpoints are rate-limited to **5 requests per minute per IP**.

---

## Endpoints

### 1. Register User

**POST** `/api/v1/auth/register`

Register a new user account.

**Authentication:** None

**Request Body**:
```json
{
  "fullName": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "SecurePass@123",
  "role": "STUDENT",
  "phone": "+966501234567"
}
```

**Request Body (Parent with Child)**:
```json
{
  "fullName": "Parent Name",
  "email": "parent@example.com",
  "password": "SecurePass@123",
  "role": "PARENT",
  "phone": "+966501234567",
  "childAcademicNumber": "STU123456"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني",
  "data": {
    "id": "uuid",
    "fullName": "Ahmed Ali",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "role": "STUDENT",
    "points": 0,
    "academicNumber": "STU123456",
    "isVerified": false,
    "createdAt": "2026-04-14T10:00:00.000Z"
  }
}
```

**Validation Rules**:
- `fullName`: Required, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, min 8 characters, must contain uppercase, lowercase, and number
- `role`: Required, one of: `STUDENT`, `PARENT`, `ADMIN`
- `phone`: Optional, valid phone format
- `childAcademicNumber`: Required if role is `PARENT`

---

### 2. Verify Email

**POST** `/api/v1/auth/verify-email`

Verify user email with the code sent during registration.

**Authentication:** None

**Request Body**:
```json
{
  "email": "ahmed@example.com",
  "code": "123456"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم تفعيل الحساب بنجاح",
  "data": {
    "id": "uuid",
    "fullName": "Ahmed Ali",
    "email": "ahmed@example.com",
    "role": "STUDENT",
    "isVerified": true,
    "createdAt": "2026-04-14T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Invalid or expired code
- `404`: User not found

---

### 3. Resend Verification Email

**POST** `/api/v1/auth/resend-verification`

Resend verification email with a new code.

**Authentication:** None

**Request Body**:
```json
{
  "email": "ahmed@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم إرسال رمز التحقق بنجاح",
  "data": null
}
```

**Note**: Returns success even if email doesn't exist (security feature to prevent user enumeration).

---

### 4. Login

**POST** `/api/v1/auth/login`

Login with email and password.

**Authentication:** None

**Request Body**:
```json
{
  "email": "ahmed@example.com",
  "password": "SecurePass@123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Ahmed Ali",
      "email": "ahmed@example.com",
      "role": "STUDENT",
      "points": 150,
      "academicNumber": "STU123456",
      "isVerified": true,
      "createdAt": "2026-04-14T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Headers**:
```
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses**:
- `401`: Invalid credentials
- `403`: Email not verified

---

### 5. Refresh Token

**POST** `/api/v1/auth/refresh`

Refresh access token using refresh token from cookie.

**Authentication:** Refresh token (cookie)

**Request Body**: None

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم تحديث الرمز بنجاح",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `401`: Invalid or expired refresh token

---

### 6. Forgot Password

**POST** `/api/v1/auth/forgot-password`

Request password reset code.

**Authentication:** None

**Request Body**:
```json
{
  "email": "ahmed@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رمز إعادة التعيين",
  "data": null
}
```

**Note**: Returns success even if email doesn't exist (security feature).

---

### 7. Reset Password

**POST** `/api/v1/auth/reset-password`

Reset password using the code sent to email.

**Authentication:** None

**Request Body**:
```json
{
  "email": "ahmed@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass@123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم تغيير كلمة المرور بنجاح",
  "data": null
}
```

**Error Responses**:
- `400`: Invalid or expired code
- `404`: User not found

---

### 8. Logout

**POST** `/api/v1/auth/logout`

Logout and clear refresh token cookie.

**Authentication:** Required (Bearer token)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم تسجيل الخروج بنجاح",
  "data": null
}
```

**Response Headers**:
```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

---

## Testing

### cURL Examples

```bash
# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test@123456",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'

# Logout
curl -X POST http://localhost:4000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Features

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Tokens**: 
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry (HttpOnly cookie)
3. **Rate Limiting**: 5 requests per minute per IP
4. **User Enumeration Prevention**: Generic responses for forgot password and resend verification
5. **Email Verification**: Required before login
6. **Verification Code**: 6-digit code, 15 minutes expiry
7. **Reset Code**: 6-digit code, 15 minutes expiry

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid credentials |
| 403 | Forbidden - Email not verified |
| 404 | Not Found - User not found |
| 409 | Conflict - Email already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
