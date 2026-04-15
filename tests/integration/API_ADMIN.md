# Admin API Documentation

## Base URL
`/api/v1/admin`

## Authentication
All endpoints require authentication with `ADMIN` role.

---

## Dashboard Endpoints

### 1. Get Dashboard Statistics
**GET** `/dashboard/stats`

Get overall platform statistics.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalUsers": 1250,
    "totalStudents": 1000,
    "totalParents": 200,
    "totalAdmins": 5,
    "totalQuestions": 500,
    "totalVideos": 150,
    "totalQuizSessions": 5000,
    "totalWheelSessions": 2000,
    "verifiedUsers": 1100,
    "unverifiedUsers": 150
  }
}
```

---

### 2. Get Link Statistics
**GET** `/dashboard/link-stats`

Get parent-child linking statistics.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalParents": 200,
    "parentsWithChildren": 150,
    "totalLinkedChildren": 300,
    "averageChildrenPerParent": 2.0,
    "parentsWithoutChildren": 50
  }
}
```

---

### 3. Get Registration Chart
**GET** `/dashboard/registration-chart`

Get user registration data over time.

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30)

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "date": "2026-04-14",
      "count": 25,
      "students": 20,
      "parents": 5
    },
    {
      "date": "2026-04-13",
      "count": 18,
      "students": 15,
      "parents": 3
    }
  ]
}
```

---

### 4. Get Top Students
**GET** `/dashboard/top-students`

Get top students by points.

**Query Parameters:**
- `limit` (optional): Number of students to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "user-uuid",
      "fullName": "Ahmed Ali",
      "email": "ahmed@example.com",
      "totalPoints": 5000,
      "quizSessions": 50,
      "wheelSessions": 30
    }
  ]
}
```

---

### 5. Get Points Distribution
**GET** `/dashboard/points-distribution`

Get distribution of points across users.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "range": "0-100",
      "count": 200
    },
    {
      "range": "101-500",
      "count": 400
    },
    {
      "range": "501-1000",
      "count": 250
    },
    {
      "range": "1000+",
      "count": 150
    }
  ]
}
```

---

## User Management Endpoints

### 6. Get Users
**GET** `/users`

Get paginated list of users with filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (STUDENT, PARENT, ADMIN)
- `search` (optional): Search in name and email
- `isVerified` (optional): Filter by verification status (true/false)

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "fullName": "Ahmed Ali",
        "email": "ahmed@example.com",
        "role": "STUDENT",
        "isVerified": true,
        "totalPoints": 500,
        "createdAt": "2026-04-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1250,
      "totalPages": 125
    }
  }
}
```

---

### 7. Export Users
**GET** `/users/export`

Export all users data (no pagination).

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "user-uuid",
      "fullName": "Ahmed Ali",
      "email": "ahmed@example.com",
      "role": "STUDENT",
      "isVerified": true,
      "totalPoints": 500,
      "phone": "+966501234567",
      "createdAt": "2026-04-01T12:00:00.000Z"
    }
  ]
}
```

---

### 8. Get Parent's Children
**GET** `/users/:parentId/children`

Get all children linked to a parent account.

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
      "linkedAt": "2026-04-01T12:00:00.000Z"
    }
  ]
}
```

---

### 9. Update User
**PUT** `/users/:id`

Update user information.

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+966501234567",
  "isVerified": true,
  "role": "STUDENT"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

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
    "isVerified": true,
    "role": "STUDENT",
    "updatedAt": "2026-04-14T13:00:00.000Z"
  }
}
```

---

### 10. Delete User
**DELETE** `/users/:id`

Delete a user permanently.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User deleted successfully"
}
```

---

## Question Management Endpoints

### 11. Create Question
**POST** `/questions`

Create a new question.

**Request Body:**
```json
{
  "type": "MCQ",
  "category": "ARITHMETIC",
  "level": "EASY",
  "questionText": "What is 2 + 2?",
  "correctAnswer": "C",
  "params": {
    "options": ["2", "3", "4", "5"]
  },
  "explanation": "2 + 2 equals 4"
}
```

**Question Types:**
- `MCQ` - Multiple Choice Question
- `FILL_BLANK` - Fill in the blank
- `MATCHING` - Match items
- `SORT_ORDER` - Sort items in order
- `VISUAL_MCQ` - Visual multiple choice
- `CLOCK_READ` - Read clock time

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "question-uuid",
    "type": "MCQ",
    "category": "ARITHMETIC",
    "level": "EASY",
    "questionText": "What is 2 + 2?",
    "correctAnswer": "C",
    "params": {
      "options": ["2", "3", "4", "5"]
    },
    "explanation": "2 + 2 equals 4",
    "createdAt": "2026-04-14T12:00:00.000Z"
  }
}
```

---

### 12. Get Questions
**GET** `/questions`

Get paginated list of questions with filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by question type
- `category` (optional): Filter by category
- `level` (optional): Filter by difficulty level
- `search` (optional): Search in question text

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "questions": [
      {
        "id": "question-uuid",
        "type": "MCQ",
        "category": "ARITHMETIC",
        "level": "EASY",
        "questionText": "What is 2 + 2?",
        "createdAt": "2026-04-14T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 500,
      "totalPages": 50
    }
  }
}
```

---

### 13. Get Question by ID
**GET** `/questions/:id`

Get detailed information about a specific question.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "question-uuid",
    "type": "MCQ",
    "category": "ARITHMETIC",
    "level": "EASY",
    "questionText": "What is 2 + 2?",
    "correctAnswer": "C",
    "params": {
      "options": ["2", "3", "4", "5"]
    },
    "explanation": "2 + 2 equals 4",
    "createdAt": "2026-04-14T12:00:00.000Z",
    "updatedAt": "2026-04-14T12:00:00.000Z"
  }
}
```

---

### 14. Update Question
**PUT** `/questions/:id`

Update an existing question.

**Request Body:**
```json
{
  "questionText": "Updated: What is 2 + 2?",
  "explanation": "Updated explanation",
  "level": "MEDIUM"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "question-uuid",
    "questionText": "Updated: What is 2 + 2?",
    "explanation": "Updated explanation",
    "level": "MEDIUM",
    "updatedAt": "2026-04-14T13:00:00.000Z"
  }
}
```

---

### 15. Delete Question
**DELETE** `/questions/:id`

Delete a question permanently.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Question deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Invalid input data"
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
  "error": "Admin role required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "error": "Resource not found"
}
```

---

## Caching

Admin statistics are cached for 2 minutes to improve performance:
- Dashboard stats: 2 minutes
- Link stats: 2 minutes
- Cache is automatically invalidated on data changes
