# Parent API Documentation

## Base URL
`/api/v1/parent`

## Authentication
All endpoints require authentication with `PARENT` role.

---

## Endpoints

### 1. Link Child to Parent Account
**POST** `/link`

Link a child (student) account to the parent account using the child's academic number.

**Request Body:**
```json
{
  "childAcademicNumber": "STU12345"
}
```

**Validation Rules:**
- `childAcademicNumber`: Required, must be a valid student academic number
- Student must exist and not be already linked to this parent
- Student must have STUDENT role

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "fullName": "Sara Ahmed",
    "email": "sara@example.com",
    "academicNumber": "STU12345",
    "totalPoints": 300,
    "linkedAt": "2026-04-14T12:00:00.000Z"
  }
}
```

---

### 2. Get All Linked Children
**GET** `/children`

Get list of all children linked to the parent account.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "user-uuid",
      "fullName": "Sara Ahmed",
      "email": "sara@example.com",
      "academicNumber": "STU12345",
      "totalPoints": 300,
      "isVerified": true,
      "linkedAt": "2026-04-14T12:00:00.000Z",
      "createdAt": "2026-04-01T12:00:00.000Z"
    },
    {
      "id": "user-uuid-2",
      "fullName": "Ahmed Ali",
      "email": "ahmed@example.com",
      "academicNumber": "STU12346",
      "totalPoints": 450,
      "isVerified": true,
      "linkedAt": "2026-04-14T12:00:00.000Z",
      "createdAt": "2026-04-01T12:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Child Progress
**GET** `/children/:id/progress`

Get detailed progress information for a specific linked child.

**URL Parameters:**
- `id`: Child's user ID (UUID)

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "child": {
      "id": "user-uuid",
      "fullName": "Sara Ahmed",
      "email": "sara@example.com",
      "academicNumber": "STU12345",
      "totalPoints": 300,
      "createdAt": "2026-04-01T12:00:00.000Z"
    },
    "stats": {
      "totalQuizSessions": 25,
      "completedQuizSessions": 20,
      "totalWheelSessions": 15,
      "totalPointsEarned": 300,
      "averageAccuracy": 85.5,
      "strongCategories": [
        {
          "category": "ARITHMETIC",
          "accuracy": 92.0,
          "sessionsCount": 10
        }
      ],
      "weakCategories": [
        {
          "category": "GEOMETRY",
          "accuracy": 65.0,
          "sessionsCount": 5
        }
      ]
    },
    "recentActivity": [
      {
        "id": "session-uuid",
        "type": "QUIZ",
        "category": "ARITHMETIC",
        "level": "EASY",
        "pointsEarned": 40,
        "accuracy": 80,
        "completedAt": "2026-04-14T10:00:00.000Z"
      },
      {
        "id": "session-uuid-2",
        "type": "WHEEL",
        "category": "GEOMETRY",
        "level": "MEDIUM",
        "pointsEarned": 30,
        "accuracy": 75,
        "completedAt": "2026-04-13T15:00:00.000Z"
      }
    ],
    "progressOverTime": [
      {
        "date": "2026-04-14",
        "points": 40,
        "sessions": 2
      },
      {
        "date": "2026-04-13",
        "points": 30,
        "sessions": 1
      }
    ]
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
  "error": "Child is already linked to this parent"
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Invalid child ID format"
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

### 403 Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "error": "Parent role required"
}
```

```json
{
  "success": false,
  "statusCode": 403,
  "error": "You can only view progress of your linked children"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "error": "Student not found with this academic number"
}
```

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Child not found or not linked to your account"
}
```

---

## Use Cases

### Linking a Child
1. Parent registers and verifies their account
2. Parent obtains child's academic number from school
3. Parent uses `/link` endpoint with academic number
4. System validates and creates parent-child relationship
5. Parent can now monitor child's progress

### Monitoring Progress
1. Parent views all linked children via `/children`
2. Parent selects a specific child
3. Parent views detailed progress via `/children/:id/progress`
4. System shows:
   - Overall statistics
   - Strong and weak subject areas
   - Recent activity
   - Progress trends over time

### Privacy & Security
- Parents can only view children linked to their account
- Children's sensitive information is protected
- Academic numbers are required for linking (prevents unauthorized access)
- Each parent-child link is tracked with timestamp

---

## Academic Number Format

Academic numbers are unique identifiers assigned to students:
- Format: Alphanumeric string (e.g., "STU12345")
- Case-insensitive matching
- Must be provided during student registration
- Used for parent-child linking

---

## Progress Metrics

### Accuracy Calculation
```
Accuracy = (Correct Answers / Total Questions) × 100
```

### Strong/Weak Categories
- **Strong**: Categories with accuracy ≥ 80%
- **Weak**: Categories with accuracy < 70%
- Minimum 3 sessions required for category classification

### Progress Trends
- Daily aggregation of points and sessions
- Last 30 days by default
- Helps identify learning patterns and consistency
