# Authentication Module Documentation

Complete authentication system with email verification, password reset, and JWT-based authentication.

## 📁 Module Structure

```
auth/
├── auth.controller.ts    # Thin controllers with asyncHandler
├── auth.service.ts       # Business logic layer
├── auth.repository.ts    # Database queries (Prisma)
├── auth.routes.ts        # Route definitions with rate limiting
├── auth.schema.ts        # Zod validation schemas
└── AUTH_MODULE.md        # This file
```

## 🔐 Features

- ✅ User registration (STUDENT/PARENT roles)
- ✅ Email verification with 6-digit code (15min TTL)
- ✅ Login with JWT (access + refresh tokens)
- ✅ Password reset with 6-digit code (15min TTL)
- ✅ Token refresh mechanism
- ✅ Logout (clears refresh token cookie)
- ✅ Rate limiting (5 requests/minute)
- ✅ Academic number auto-generation for students
- ✅ Atomic Points record creation for students
- ✅ Arabic error messages

## 📡 API Endpoints

Base URL: `/api/v1/auth`

### 1. Register

**POST** `/register`

Create a new user account. Sends verification email.

**Request Body:**
```json
{
  "fullName": "محمد أحمد",
  "email": "student@example.com",
  "phone": "0501234567",
  "password": "SecurePass123",
  "role": "STUDENT"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "uuid",
    "fullName": "محمد أحمد",
    "email": "student@example.com",
    "phone": "0501234567",
    "role": "STUDENT",
    "academicNumber": "std-1234567890",
    "isVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني"
}
```

**Business Logic:**
- Checks email uniqueness
- Hashes password (bcrypt, salt rounds: 12)
- Generates 6-digit verification code
- For STUDENT: generates unique academic number (std-xxxxxxxxxx)
- Creates User + Points record atomically (transaction)
- Sends verification email (fire and forget)

---

### 2. Verify Email

**POST** `/verify-email`

Verify email address with code sent during registration.

**Request Body:**
```json
{
  "email": "student@example.com",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "fullName": "محمد أحمد",
    "email": "student@example.com",
    "role": "STUDENT",
    "academicNumber": "std-1234567890",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم تفعيل الحساب بنجاح"
}
```

**Validation:**
- Code must match exactly
- Code must not be expired (15min TTL)
- Account must not already be verified

---

### 3. Login

**POST** `/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "محمد أحمد",
      "email": "student@example.com",
      "role": "STUDENT",
      "academicNumber": "std-1234567890",
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

**Cookies Set:**
- `refreshToken`: httpOnly, secure (production), sameSite=strict, 7 days

**Validation:**
- Email must exist
- Password must match
- Account must be verified

---

### 4. Refresh Token

**POST** `/refresh`

Get new access token using refresh token from cookie.

**Request:** No body required (reads from cookie)

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "تم تحديث الرمز بنجاح"
}
```

**Validation:**
- Refresh token must be present in cookie
- Refresh token must be valid and not expired
- User must exist and be verified

---

### 5. Forgot Password

**POST** `/forgot-password`

Request password reset code via email.

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رمز إعادة التعيين"
}
```

**Note:** Always returns success (doesn't reveal if email exists)

---

### 6. Reset Password

**POST** `/reset-password`

Reset password using code from email.

**Request Body:**
```json
{
  "email": "student@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

**Validation:**
- Code must match exactly
- Code must not be expired (15min TTL)
- New password must meet requirements (min 8 chars)

---

### 7. Logout

**POST** `/logout`

Clear refresh token cookie.

**Headers:** `Authorization: Bearer <accessToken>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

## 🔒 Security Features

1. **Rate Limiting**: 5 requests per minute per IP on all auth routes
2. **Password Hashing**: bcrypt with 12 salt rounds
3. **JWT Tokens**:
   - Access token: 1 hour expiry
   - Refresh token: 7 days expiry, httpOnly cookie
4. **Code Expiry**: Verification and reset codes expire after 15 minutes
5. **Email Privacy**: Forgot password doesn't reveal if email exists
6. **Atomic Operations**: User + Points creation in transaction

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "محمد أحمد",
    "email": "test@example.com",
    "password": "SecurePass123",
    "role": "STUDENT"
  }'
```

### Verify Email
```bash
curl -X POST http://localhost:4000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:4000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

## 📊 Database Operations

### User Creation Flow (STUDENT)
```
1. Check email uniqueness
2. Hash password
3. Generate academic number (std-xxxxxxxxxx)
4. BEGIN TRANSACTION
   - Create User record
   - Create Points record (total: 0)
5. COMMIT TRANSACTION
6. Send verification email
```

### User Creation Flow (PARENT)
```
1. Check email uniqueness
2. Hash password
3. BEGIN TRANSACTION
   - Create User record (no Points)
5. COMMIT TRANSACTION
6. Send verification email
```

## ⚠️ Error Responses

All errors follow this format:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "رسالة الخطأ بالعربية"
}
```

### Common Error Codes
- `400`: Bad request (invalid code, expired code, etc.)
- `401`: Unauthorized (invalid credentials, expired token)
- `403`: Forbidden (account not verified)
- `404`: Not found (user doesn't exist)
- `409`: Conflict (email already exists)
- `422`: Validation error (invalid input format)
- `429`: Too many requests (rate limit exceeded)

## 🔄 Token Flow

```
1. User logs in
   ↓
2. Server generates:
   - Access token (1h) → sent in response body
   - Refresh token (7d) → sent in httpOnly cookie
   ↓
3. Client stores access token (localStorage/memory)
   ↓
4. Client includes access token in Authorization header
   ↓
5. When access token expires:
   - Client calls /refresh with cookie
   - Server validates refresh token
   - Server returns new access token
   ↓
6. Repeat step 4-5 until refresh token expires
   ↓
7. When refresh token expires → user must login again
```

## 📝 Notes

- All email addresses are stored in lowercase
- All string inputs are trimmed
- Verification codes are 6 digits (100000-999999)
- Academic numbers are unique and auto-generated
- Points records are created automatically for students
- Email sending is fire-and-forget (doesn't block response)
- Repository returns full User (including passwordHash) for internal use
- Service layer converts to SafeUser (excludes sensitive fields) before returning

---

**Status**: ✅ Complete and production-ready
