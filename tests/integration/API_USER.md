# User API Documentation

## Base URL
`/api/v1/users`

## Authentication
All endpoints require authentication. Users can only access and modify their own profile.

---

## Endpoints

### 1. Get Current User Profile
**GET** `/me`

Get the authenticated user's profile information.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "fullName": "Ahmed Ali",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "role": "STUDENT",
    "isVerified": true,
    "totalPoints": 500,
    "academicNumber": "STU12345",
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-14T12:00:00.000Z"
  }
}
```

**Response Fields:**
- `id`: Unique user identifier (UUID)
- `fullName`: User's full name
- `email`: User's email address
- `phone`: User's phone number (optional)
- `role`: User role (STUDENT, PARENT, ADMIN)
- `isVerified`: Email verification status
- `totalPoints`: Total points earned (for students)
- `academicNumber`: Student academic number (students only)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Note:** Sensitive fields like `passwordHash`, `verifyCode`, `resetToken` are never exposed.

---

### 2. Update User Profile
**PUT** `/me`

Update the authenticated user's profile information.

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+966501234567"
}
```

**Allowed Fields:**
- `fullName` (optional): User's full name (1-100 characters)
- `email` (optional): New email address (must be unique, valid format)
- `phone` (optional): Phone number (valid international format)

**Validation Rules:**
- `fullName`: 1-100 characters
- `email`: Valid email format, must be unique
- `phone`: Valid international phone format (e.g., +966501234567)
- At least one field must be provided

**Forbidden Fields:**
Users cannot update these fields via this endpoint:
- `role` - Role changes require admin action
- `totalPoints` - Points are earned through activities
- `isVerified` - Verification is handled separately
- `academicNumber` - Set during registration
- `passwordHash` - Use password change endpoint

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "fullName": "Updated Name",
    "email": "newemail@example.com",
    "phone": "+966501234567",
    "role": "STUDENT",
    "isVerified": true,
    "totalPoints": 500,
    "updatedAt": "2026-04-14T13:00:00.000Z"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Invalid email format"
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Invalid phone number format"
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "error": "At least one field must be provided for update"
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Cannot update role through this endpoint"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "error": "Authentication required"
}
```

```json
{
  "success": false,
  "statusCode": 401,
  "error": "Invalid or expired token"
}
```

### 409 Conflict
```json
{
  "success": false,
  "statusCode": 409,
  "error": "Email already exists"
}
```

---

## Use Cases

### Viewing Profile
1. User logs in and receives access token
2. User calls `/me` endpoint with token
3. System returns complete profile information
4. User can view their current information

### Updating Profile
1. User modifies their information in the UI
2. User submits update request to `/me` endpoint
3. System validates the new information
4. System updates the profile and returns updated data
5. UI reflects the changes immediately

### Email Change Flow
1. User updates email via `/me` endpoint
2. System may require email re-verification (implementation dependent)
3. User receives verification email at new address
4. User verifies new email to complete change

---

## Security Considerations

### Data Privacy
- Users can only access their own profile
- Sensitive fields are never exposed in responses
- Password changes require separate secure endpoint

### Validation
- Email uniqueness is enforced
- Phone numbers must be in valid international format
- Full name length is limited to prevent abuse

### Rate Limiting
- Profile updates may be rate-limited to prevent abuse
- Recommended: 10 updates per hour per user

---

## Role-Specific Fields

### Student Fields
- `academicNumber`: Unique student identifier
- `totalPoints`: Points earned from quizzes and games
- `parentId`: ID of linked parent (if any)

### Parent Fields
- `phone`: Required for parent accounts
- No `academicNumber` or `totalPoints`

### Admin Fields
- Full access to all user data via admin endpoints
- Cannot modify own role through this endpoint

---

## Phone Number Format

Accepted formats:
- International format: `+966501234567`
- With spaces: `+966 50 123 4567`
- With dashes: `+966-50-123-4567`

Examples:
- Saudi Arabia: `+966501234567`
- UAE: `+971501234567`
- Egypt: `+201234567890`

---

## Best Practices

### Frontend Implementation
```javascript
// Get current user profile
const getProfile = async () => {
  const response = await fetch('/api/v1/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Update profile
const updateProfile = async (updates) => {
  const response = await fetch('/api/v1/users/me', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};
```

### Error Handling
- Always validate input on frontend before submission
- Handle 409 conflicts gracefully (email already exists)
- Show clear error messages to users
- Implement retry logic for network failures
