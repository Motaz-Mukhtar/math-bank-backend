# Parent Module Documentation

Complete parent account system for linking and monitoring student children's progress.

## 📁 Module Structure

```
parent/
├── parent.controller.ts      # 3 endpoints (link, children, progress)
├── parent.service.ts         # Business logic with validation
├── parent.repository.ts      # Prisma queries for parent-child links
├── parent.routes.ts          # PARENT-only protected routes
└── parent.schema.ts          # Zod validation schemas
```

## 🎯 Features

- ✅ Link children by email
- ✅ View all linked children
- ✅ View child's progress and quiz history
- ✅ Role validation (STUDENT only)
- ✅ Duplicate link prevention
- ✅ Access control (parent owns child link)
- ✅ Leaderboard rank for each child
- ✅ PARENT-only access

## 📡 API Endpoints

Base URL: `/api/v1/parent`

All endpoints require PARENT authentication.

### 1. Link Child

**POST** `/link`

Link a student to parent account by email.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "childEmail": "student@example.com"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "childId": "uuid",
    "fullName": "أحمد محمد",
    "email": "student@example.com",
    "academicNumber": "std-1234567890",
    "message": "تم ربط الطالب بنجاح"
  },
  "message": "تم ربط الطالب بنجاح"
}
```

**Business Rules:**
- Child must exist in system
- Child must have STUDENT role
- Cannot link same child twice
- Email must be valid format

---

### 2. Get Children

**GET** `/children`

Get all children linked to parent account.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "childId": "uuid-1",
      "fullName": "أحمد محمد",
      "email": "student1@example.com",
      "academicNumber": "std-1234567890",
      "points": 150,
      "rank": 5,
      "linkedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "childId": "uuid-2",
      "fullName": "فاطمة علي",
      "email": "student2@example.com",
      "academicNumber": "std-0987654321",
      "points": 200,
      "rank": 3,
      "linkedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "message": "تم الحصول على قائمة الأطفال بنجاح"
}
```

**Data Included:**
- Child basic info (name, email, academic number)
- Total points
- Current leaderboard rank
- Link creation date

---

### 3. Get Child Progress

**GET** `/children/:id/progress`

Get detailed progress for a specific child.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id` - Child user ID (UUID)

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "child": {
      "id": "uuid",
      "fullName": "أحمد محمد",
      "email": "student@example.com",
      "academicNumber": "std-1234567890",
      "points": 150,
      "rank": 5
    },
    "quizHistory": [
      {
        "sessionId": "uuid-1",
        "category": "ADDITION",
        "level": "EASY",
        "totalScore": 35,
        "correctCount": 7,
        "incorrectCount": 3,
        "totalQuestions": 10,
        "completedAt": "2024-01-01T12:00:00.000Z"
      },
      {
        "sessionId": "uuid-2",
        "category": "MULTIPLICATION",
        "level": "MEDIUM",
        "totalScore": 80,
        "correctCount": 8,
        "incorrectCount": 2,
        "totalQuestions": 10,
        "completedAt": "2024-01-01T10:00:00.000Z"
      }
    ]
  },
  "message": "تم الحصول على تقدم الطالب بنجاح"
}
```

**Business Rules:**
- Parent must have link to this child
- Returns last 10 completed quiz sessions
- Includes child's current rank and points
- Access denied if no link exists

---

## 🎯 Business Logic

### Link Child Flow
```
1. Parent provides child's email
2. Backend finds user by email
3. Validates user is STUDENT role
4. Checks no duplicate link exists
5. Creates ParentChild record
6. Returns child info
```

### Get Children Flow
```
1. Get all ParentChild links for parent
2. For each child:
   - Get points total
   - Calculate leaderboard rank
3. Return array of children with stats
```

### Get Child Progress Flow
```
1. Verify parent-child link exists
2. Get child details (name, email, points, rank)
3. Get last 10 completed quiz sessions
4. Format quiz history with scores
5. Return combined data
```

### Rank Calculation
```typescript
1. Get all STUDENT users ordered by points DESC
2. Find child's position in list
3. Return position + 1 as rank
4. Return null if child not found
```

## 🔐 Security & Validation

### Authentication
- All endpoints require valid JWT token
- Only PARENT role allowed (requireRole middleware)

### Validation
- Link: childEmail must be valid email format
- Progress: childId must be valid UUID (route param)

### Business Validation
- Child must exist in system
- Child must have STUDENT role (not PARENT or ADMIN)
- Cannot link same child twice
- Parent must own child link to view progress

### Access Control
- Parents can only view their own linked children
- Cannot view other parents' children
- 403 error if trying to access unlinked child

## 📊 Database Operations

### Find User by Email
```sql
SELECT * FROM User
WHERE email = ?
INCLUDE points
```

### Check Link Exists
```sql
SELECT * FROM ParentChild
WHERE parentId = ? AND childId = ?
```

### Create Link
```sql
INSERT INTO ParentChild (id, parentId, childId, createdAt)
VALUES (uuid, parentId, childId, now())
```

### Get Links by Parent
```sql
SELECT * FROM ParentChild
WHERE parentId = ?
INCLUDE child (INCLUDE points)
ORDER BY createdAt DESC
```

### Get Child Quiz History
```sql
SELECT * FROM QuizSession
WHERE userId = ? AND isComplete = true
ORDER BY completedAt DESC
LIMIT 10
INCLUDE items
```

### Calculate Rank
```sql
SELECT * FROM User
WHERE role = 'STUDENT'
INCLUDE points
ORDER BY points.total DESC
```

## 🧪 Testing

### Complete Flow Test

```bash
# 1. Login as parent
PARENT_TOKEN=$(curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# 2. Link a child
curl -X POST http://localhost:4000/api/v1/parent/link \
  -H "Authorization: Bearer $PARENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"childEmail":"student@example.com"}'

# 3. Get all children
curl -X GET http://localhost:4000/api/v1/parent/children \
  -H "Authorization: Bearer $PARENT_TOKEN"

# 4. Get child's progress
CHILD_ID="uuid-from-step-2-or-3"
curl -X GET http://localhost:4000/api/v1/parent/children/$CHILD_ID/progress \
  -H "Authorization: Bearer $PARENT_TOKEN"
```

## ⚠️ Error Responses

### 404 Child Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "error": "الطالب غير موجود"
}
```

### 400 Not a Student
```json
{
  "success": false,
  "statusCode": 400,
  "error": "يمكن ربط الطلاب فقط"
}
```

### 400 Duplicate Link
```json
{
  "success": false,
  "statusCode": 400,
  "error": "الطالب مرتبط بالفعل بهذا الحساب"
}
```

### 403 No Access to Child
```json
{
  "success": false,
  "statusCode": 403,
  "error": "ليس لديك صلاحية لعرض بيانات هذا الطالب"
}
```

### 403 Not a Parent
```json
{
  "success": false,
  "statusCode": 403,
  "error": "ليس لديك صلاحية للوصول إلى هذا المورد"
}
```

### 400 Invalid Email
```json
{
  "success": false,
  "statusCode": 400,
  "error": "البريد الإلكتروني غير صالح"
}
```

## 🎨 Frontend Integration

### Hook Example
```typescript
const useParentDashboard = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProgress | null>(null);

  const linkChild = async (childEmail: string) => {
    const response = await api.post('/parent/link', { childEmail });
    return response.data.data;
  };

  const getChildren = async () => {
    const response = await api.get('/parent/children');
    setChildren(response.data.data);
    return response.data.data;
  };

  const getChildProgress = async (childId: string) => {
    const response = await api.get(`/parent/children/${childId}/progress`);
    setSelectedChild(response.data.data);
    return response.data.data;
  };

  return {
    linkChild,
    getChildren,
    getChildProgress,
    children,
    selectedChild,
  };
};
```

### Component Flow
```tsx
1. ParentDashboard component
   - Shows list of linked children
   - Each child card shows: name, points, rank
   - "Add Child" button opens modal
   - Click child card to view progress

2. AddChildModal component
   - Input for child's email
   - Calls linkChild() API
   - Shows success/error message
   - Refreshes children list

3. ChildProgressView component
   - Shows child details (name, points, rank)
   - Shows quiz history table
   - Columns: date, category, level, score, correct/incorrect
   - Sortable and filterable
   - Visual indicators for performance

4. ChildCard component
   - Displays child info
   - Shows points with icon
   - Shows rank badge
   - Click to view full progress
```

## 📝 Use Cases

### Parent Monitoring
- Parent links multiple children
- Views dashboard with all children's stats
- Clicks on child to see detailed progress
- Reviews quiz history to identify strengths/weaknesses

### Multi-Child Management
- Parent has 3 children
- Each child has separate account
- Parent links all 3 to their account
- Can compare performance across children

### Progress Tracking
- Parent checks child's rank (e.g., #5 out of 100)
- Reviews last 10 quiz sessions
- Identifies which topics need improvement
- Encourages child based on progress

## 🔄 Integration Points

### With User Module
- Reads User table for child lookup
- Validates role is STUDENT
- Gets child details (name, email, academic number)

### With Points Module
- Reads Points table for total points
- Displays points in children list
- Shows points in progress view

### With Quiz Module
- Reads QuizSession table for history
- Gets completed sessions only
- Includes session items for correct/incorrect counts

### With Leaderboard Module
- Calculates rank using same logic
- Shows child's position among all students
- Updates in real-time as points change

## 📊 Database Schema Used

```prisma
model ParentChild {
  id        String   @id @default(uuid())
  parentId  String
  childId   String
  createdAt DateTime @default(now())
  parent    User     @relation("ParentSide", ...)
  child     User     @relation("ChildSide", ...)
  
  @@unique([parentId, childId])
}
```

## 💡 Implementation Notes

### Why Email-Based Linking?
- Easy for parents to remember
- No need to share user IDs
- Familiar authentication method
- Validates child exists before linking

### Why STUDENT Role Validation?
- Prevents linking other parents
- Prevents linking admin accounts
- Ensures only students are monitored
- Clear separation of roles

### Why Duplicate Prevention?
- Avoids redundant links
- Keeps data clean
- Prevents confusion
- Improves query performance

### Why Access Control?
- Protects student privacy
- Prevents unauthorized access
- Ensures parents only see their children
- Complies with data protection

---

**Status**: ✅ Complete and production-ready
