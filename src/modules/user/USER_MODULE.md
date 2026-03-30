# User Module

## Overview
The User module provides endpoints for users to view and update their own profile information.

## Architecture
- **Routes** (`user.routes.ts`): Defines HTTP endpoints
- **Controller** (`user.controller.ts`): Handles HTTP requests/responses
- **Service** (`user.service.ts`): Contains business logic
- **Repository** (`user.repository.ts`): Database operations
- **Schema** (`user.schema.ts`): Request validation schemas

## Endpoints

### GET /api/v1/users/me
Get current authenticated user's profile.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "STUDENT",
    "fullName": "أحمد محمد",
    "phone": "+966501234567",
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "profile": {
      "id": "uuid",
      "points": 150,
      "rank": 5
    }
  },
  "message": "تم جلب بيانات المستخدم بنجاح"
}
```

**Notes**:
- Password hash is never returned
- Profile data is included for STUDENT role users
- Parent role users will have `profile: null`

### PUT /api/v1/users/me
Update current user's profile information.

**Authentication**: Required

**Request Body**:
```json
{
  "fullName": "أحمد محمد علي",
  "phone": "+966501234567"
}
```

**Validation Rules**:
- `fullName` (optional): 1-100 characters
- `phone` (optional): Must match pattern `^\+?[0-9]{10,15}$`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "STUDENT",
    "fullName": "أحمد محمد علي",
    "phone": "+966501234567",
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "profile": {
      "id": "uuid",
      "points": 150,
      "rank": 5
    }
  },
  "message": "تم تحديث الملف الشخصي بنجاح"
}
```

**Error Responses**:
- `400`: Validation error (invalid phone format, name too long, etc.)
- `401`: Not authenticated
- `404`: User not found

## Business Logic

### Get Current User
1. Extract user ID from JWT token
2. Fetch user data from database (excluding password hash)
3. Include profile data if user is a STUDENT
4. Return user data

### Update Profile
1. Extract user ID from JWT token
2. Validate request data (fullName, phone)
3. Check if user exists
4. Update user record in database
5. Return updated user data

## Security
- All endpoints require authentication
- Users can only view/update their own profile
- Password hash is never exposed in responses
- Phone number format is validated

## Database Schema
Uses the `User` model from Prisma schema:
- `id`: UUID (primary key)
- `email`: String (unique)
- `passwordHash`: String (never returned in API)
- `role`: Enum (STUDENT, PARENT, ADMIN)
- `fullName`: String
- `phone`: String (optional)
- `isEmailVerified`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Testing

### Manual Testing with cURL

**Get Current User**:
```bash
curl -X GET http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Profile**:
```bash
curl -X PUT http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد علي",
    "phone": "+966501234567"
  }'
```

## Integration Notes

### Frontend Integration
The frontend already has the auth service that calls `/users/me` through `getCurrentUser()` in `auth.api.ts`. This endpoint is now fully implemented and ready to use.

### AuthContext
The `AuthContext` in the frontend uses this endpoint to fetch user data after login and token refresh.

## Error Handling
All errors follow the standard ApiError format:
```json
{
  "success": false,
  "message": "رسالة الخطأ بالعربية",
  "statusCode": 400
}
```

## Future Enhancements
- Add avatar upload functionality
- Add email change with verification
- Add password change endpoint
- Add account deletion endpoint
- Add user preferences/settings
