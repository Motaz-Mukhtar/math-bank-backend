# Admin Module Documentation

Complete admin dashboard with analytics, user management, and data export capabilities.

## 📁 Module Structure

```
admin/
├── admin.controller.ts      # 9 endpoints (stats, users, export)
├── admin.service.ts         # Business logic with validation
├── admin.repository.ts      # Prisma queries for analytics
├── admin.routes.ts          # ADMIN-only protected routes
└── admin.schema.ts          # Zod validation schemas
```

## 🎯 Features

- ✅ Dashboard statistics (accounts, registrations, points)
- ✅ Parent-child link analytics
- ✅ Registration chart (30-day trend)
- ✅ Top students leaderboard
- ✅ Points distribution histogram
- ✅ User management (list, update, delete)
- ✅ Paginated user list with filters
- ✅ User export for CSV generation
- ✅ ADMIN-only access

## 📡 API Endpoints

Base URL: `/api/v1/admin`

All endpoints require ADMIN authentication.

### Dashboard Analytics

#### 1. Get Dashboard Stats

**GET** `/dashboard/stats`

Get overall platform statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalAccounts": 150,
    "totalStudents": 120,
    "totalParents": 25,
    "linkedStudents": 80,
    "registeredThisWeek": 12,
    "highestPoints": 500,
    "avgPoints": 145
  },
  "message": "تم الحصول على إحصائيات لوحة التحكم بنجاح"
}
```

**Metrics:**
- `totalAccounts` - Total users (all roles)
- `totalStudents` - Total STUDENT users
- `totalParents` - Total PARENT users
- `linkedStudents` - Students with at least one parent link
- `registeredThisWeek` - New users in last 7 days
- `highestPoints` - Highest point total among all students
- `avgPoints` - Average points across all students

---

#### 2. Get Link Stats

**GET** `/dashboard/link-stats`

Get parent-child linking statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalLinks": 95,
    "linkedParents": 22,
    "linkedStudents": 80,
    "linkingRate": 67
  },
  "message": "تم الحصول على إحصائيات الروابط بنجاح"
}
```

**Metrics:**
- `totalLinks` - Total ParentChild records
- `linkedParents` - Parents with at least one child link
- `linkedStudents` - Students with at least one parent link
- `linkingRate` - Percentage of students with parent links

---

#### 3. Get Registration Chart

**GET** `/dashboard/registration-chart?days=30`

Get daily registration data for chart visualization.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `days` (optional) - Number of days to include (1-365, default: 30)

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "date": "2024-01-01",
      "students": 5,
      "parents": 2
    },
    {
      "date": "2024-01-02",
      "students": 3,
      "parents": 1
    }
  ],
  "message": "تم الحصول على بيانات الرسم البياني بنجاح"
}
```

**Use Case:** Line chart showing student vs parent registrations over time

---

#### 4. Get Top Students

**GET** `/dashboard/top-students?limit=10`

Get top students by points.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional) - Number of students to return (1-100, default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-1",
      "fullName": "أحمد محمد",
      "academicNumber": "std-1234567890",
      "total": 500
    },
    {
      "id": "uuid-2",
      "fullName": "فاطمة علي",
      "academicNumber": "std-0987654321",
      "total": 450
    }
  ],
  "message": "تم الحصول على أفضل الطلاب بنجاح"
}
```

**Use Case:** Leaderboard widget on admin dashboard

---

#### 5. Get Points Distribution

**GET** `/dashboard/points-distribution`

Get points distribution for histogram.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    { "range": "0-50", "count": 25 },
    { "range": "51-100", "count": 40 },
    { "range": "101-200", "count": 35 },
    { "range": "201-500", "count": 15 },
    { "range": "501+", "count": 5 }
  ],
  "message": "تم الحصول على توزيع النقاط بنجاح"
}
```

**Use Case:** Histogram showing how students are distributed across point ranges

---

### User Management

#### 6. Get Users (Paginated)

**GET** `/users?page=1&limit=10&role=STUDENT&search=ahmed`

Get paginated list of users with optional filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (1-100, default: 10)
- `role` (optional) - Filter by role (STUDENT, PARENT, ADMIN)
- `search` (optional) - Search in fullName, email, academicNumber

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "users": [
      {
        "id": "uuid",
        "fullName": "أحمد محمد",
        "email": "student@example.com",
        "role": "STUDENT",
        "academicNumber": "std-1234567890",
        "points": 150,
        "isVerified": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12
  },
  "message": "تم الحصول على قائمة المستخدمين بنجاح"
}
```

---

#### 7. Update User

**PUT** `/users/:id`

Update user information.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "fullName": "أحمد محمد الجديد",
  "points": 200
}
```

**Notes:**
- `fullName` can be updated for all roles
- `points` can only be updated for STUDENT role
- Both fields are optional

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "fullName": "أحمد محمد الجديد",
    "email": "student@example.com",
    "role": "STUDENT",
    "academicNumber": "std-1234567890",
    "points": 200,
    "isVerified": true
  },
  "message": "تم تحديث المستخدم بنجاح"
}
```

---

#### 8. Delete User

**DELETE** `/users/:id`

Delete user (hard delete with cascade).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "تم حذف المستخدم بنجاح"
  },
  "message": "تم حذف المستخدم بنجاح"
}
```

**Cascade Behavior:**
- Deletes user's Points record
- Deletes user's QuizSession records
- Deletes user's WheelSession records
- Deletes user's ParentChild links (both as parent and child)
- All handled automatically by Prisma cascade

---

#### 9. Export Users

**GET** `/users/export?type=students`

Export users for CSV generation.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (required) - Export type: `students`, `parents`, or `all`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "fullName": "أحمد محمد",
      "email": "student@example.com",
      "role": "STUDENT",
      "academicNumber": "std-1234567890",
      "points": 150,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "تم تصدير المستخدمين بنجاح"
}
```

**Use Case:** Frontend converts this to CSV file for download

---

## 🎯 Business Logic

### Dashboard Stats Calculation
```
1. Count total users (all roles)
2. Count students (role = STUDENT)
3. Count parents (role = PARENT)
4. Count linked students (students with childLinks)
5. Count registrations in last 7 days
6. Get highest points from Points table
7. Calculate average points across all students
```

### Link Stats Calculation
```
1. Count total ParentChild records
2. Count parents with at least one link
3. Count students with at least one link
4. Calculate linking rate: (linkedStudents / totalStudents) * 100
```

### Registration Chart
```
1. Get all users registered in past N days
2. Group by date and role
3. Initialize all dates with 0 counts
4. Count students and parents per date
5. Return sorted array by date
```

### Points Distribution
```
1. Get all Points records
2. Define ranges: 0-50, 51-100, 101-200, 201-500, 501+
3. Count points in each range
4. Return array of { range, count }
```


## 🔐 Security & Validation

### Authentication
- All endpoints require valid JWT token
- Only ADMIN role allowed (requireRole middleware)

### Validation
- Update: fullName must not be empty if provided
- Update: points must be non-negative integer if provided
- Pagination: page must be >= 1
- Pagination: limit must be 1-100
- Chart: days must be 1-365
- Top students: limit must be 1-100

### Business Validation
- Points can only be updated for STUDENT role
- User must exist before update/delete
- Export type must be valid enum value

### Access Control
- Only admins can access all endpoints
- Students and parents get 403 Forbidden
- No user can access other admin's data (all admins see all data)

## 📊 Database Operations

### Get Dashboard Stats
```sql
-- Total accounts
SELECT COUNT(*) FROM User

-- Total students
SELECT COUNT(*) FROM User WHERE role = 'STUDENT'

-- Total parents
SELECT COUNT(*) FROM User WHERE role = 'PARENT'

-- Linked students
SELECT COUNT(*) FROM User 
WHERE role = 'STUDENT' 
AND EXISTS (SELECT 1 FROM ParentChild WHERE childId = User.id)

-- Registered this week
SELECT COUNT(*) FROM User 
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)

-- Highest points
SELECT MAX(total) FROM Points

-- Average points
SELECT AVG(total) FROM Points
```

### Get Link Stats
```sql
-- Total links
SELECT COUNT(*) FROM ParentChild

-- Linked parents
SELECT COUNT(*) FROM User 
WHERE role = 'PARENT' 
AND EXISTS (SELECT 1 FROM ParentChild WHERE parentId = User.id)

-- Linked students
SELECT COUNT(*) FROM User 
WHERE role = 'STUDENT' 
AND EXISTS (SELECT 1 FROM ParentChild WHERE childId = User.id)
```

### Get Registration Chart
```sql
SELECT 
  DATE(createdAt) as date,
  role,
  COUNT(*) as count
FROM User
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
GROUP BY DATE(createdAt), role
ORDER BY date ASC
```

### Get Top Students
```sql
SELECT u.*, p.total
FROM User u
JOIN Points p ON u.id = p.userId
WHERE u.role = 'STUDENT'
ORDER BY p.total DESC
LIMIT ?
```

### Get Points Distribution
```sql
SELECT total FROM Points
-- Then group in application layer by ranges
```

### Get Users Paginated
```sql
SELECT u.*, p.total as points
FROM User u
LEFT JOIN Points p ON u.id = p.userId
WHERE 
  (role = ? OR ? IS NULL)
  AND (
    fullName LIKE ? OR 
    email LIKE ? OR 
    academicNumber LIKE ? OR 
    ? IS NULL
  )
ORDER BY createdAt DESC
LIMIT ? OFFSET ?
```

### Update User
```sql
-- Update user
UPDATE User SET fullName = ? WHERE id = ?

-- Update points (if STUDENT)
UPDATE Points SET total = ? WHERE userId = ?
```

### Delete User
```sql
DELETE FROM User WHERE id = ?
-- Cascade deletes:
-- - Points
-- - QuizSession
-- - WheelSession
-- - ParentChild (both sides)
```

## 🧪 Testing

### Complete Flow Test

```bash
# 1. Login as admin
ADMIN_TOKEN=$(curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# 2. Get dashboard stats
curl -X GET http://localhost:4000/api/v1/admin/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Get link stats
curl -X GET http://localhost:4000/api/v1/admin/dashboard/link-stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Get registration chart (last 30 days)
curl -X GET "http://localhost:4000/api/v1/admin/dashboard/registration-chart?days=30" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 5. Get top 10 students
curl -X GET "http://localhost:4000/api/v1/admin/dashboard/top-students?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 6. Get points distribution
curl -X GET http://localhost:4000/api/v1/admin/dashboard/points-distribution \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 7. Get users (page 1, 10 per page, students only)
curl -X GET "http://localhost:4000/api/v1/admin/users?page=1&limit=10&role=STUDENT" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 8. Search users
curl -X GET "http://localhost:4000/api/v1/admin/users?search=ahmed" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 9. Update user
USER_ID="uuid-from-step-7"
curl -X PUT http://localhost:4000/api/v1/admin/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Updated Name","points":250}'

# 10. Export students
curl -X GET "http://localhost:4000/api/v1/admin/users/export?type=students" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 11. Delete user
curl -X DELETE http://localhost:4000/api/v1/admin/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## ⚠️ Error Responses

### 403 Not an Admin
```json
{
  "success": false,
  "statusCode": 403,
  "error": "ليس لديك صلاحية للوصول إلى هذا المورد"
}
```

### 404 User Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "error": "المستخدم غير موجود"
}
```

### 400 Invalid Days Range
```json
{
  "success": false,
  "statusCode": 400,
  "error": "عدد الأيام يجب أن يكون بين 1 و 365"
}
```

### 400 Invalid Limit
```json
{
  "success": false,
  "statusCode": 400,
  "error": "الحد الأقصى يجب أن يكون بين 1 و 100"
}
```

### 400 Invalid Page
```json
{
  "success": false,
  "statusCode": 400,
  "error": "رقم الصفحة يجب أن يكون أكبر من 0"
}
```

### 400 Invalid Points
```json
{
  "success": false,
  "statusCode": 400,
  "error": "النقاط يجب أن تكون رقم موجب"
}
```

## 🎨 Frontend Integration

### Hook Example
```typescript
const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(false);

  const getDashboardStats = async () => {
    const res = await api.get('/admin/dashboard/stats');
    setStats(res.data.data);
    return res.data.data;
  };

  const getLinkStats = async () => {
    const res = await api.get('/admin/dashboard/link-stats');
    return res.data.data;
  };

  const getRegistrationChart = async (days: number = 30) => {
    const res = await api.get(`/admin/dashboard/registration-chart?days=${days}`);
    return res.data.data;
  };

  const getTopStudents = async (limit: number = 10) => {
    const res = await api.get(`/admin/dashboard/top-students?limit=${limit}`);
    return res.data.data;
  };

  const getPointsDistribution = async () => {
    const res = await api.get('/admin/dashboard/points-distribution');
    return res.data.data;
  };

  const getUsers = async (params: GetUsersParams) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await api.get(`/admin/users?${query}`);
    setUsers(res.data.data);
    return res.data.data;
  };

  const updateUser = async (id: string, data: UpdateUserDto) => {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data.data;
  };

  const deleteUser = async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data.data;
  };

  const exportUsers = async (type: 'students' | 'parents' | 'all') => {
    const res = await api.get(`/admin/users/export?type=${type}`);
    return res.data.data;
  };

  return {
    getDashboardStats,
    getLinkStats,
    getRegistrationChart,
    getTopStudents,
    getPointsDistribution,
    getUsers,
    updateUser,
    deleteUser,
    exportUsers,
    stats,
    users,
    loading,
  };
};
```

### Component Flow
```tsx
1. AdminDashboard component
   - Shows key metrics cards (total accounts, students, parents, etc.)
   - Registration chart (line chart)
   - Points distribution (histogram)
   - Top students widget
   - Link stats widget

2. UserManagement component
   - Paginated table of users
   - Filters: role, search
   - Actions: edit, delete
   - Export button (CSV download)

3. EditUserModal component
   - Form with fullName and points fields
   - Points field only enabled for students
   - Calls updateUser API
   - Refreshes user list on success

4. RegistrationChart component
   - Line chart with two lines (students, parents)
   - X-axis: dates
   - Y-axis: count
   - Dropdown to select days (7, 30, 90)

5. PointsHistogram component
   - Bar chart showing distribution
   - X-axis: point ranges
   - Y-axis: student count
```

## 📝 Use Cases

### Admin Dashboard Overview
```
Admin logs in and sees:
- 150 total accounts (120 students, 25 parents, 5 admins)
- 12 new registrations this week
- 80 students linked to parents (67% linking rate)
- Highest points: 500, Average: 145
- Registration trend chart showing growth
- Points distribution histogram
- Top 10 students leaderboard
```

### User Management
```
Admin needs to:
1. View all students (filter by role=STUDENT)
2. Search for specific student by name
3. Update student's points manually (correction)
4. Delete test accounts
5. Export all students to CSV for reporting
```

### Analytics Review
```
Admin reviews monthly metrics:
1. Check registration chart for past 30 days
2. Identify peak registration days
3. Review points distribution
4. Check linking rate (target: 80%)
5. Identify top performers
6. Export data for external analysis
```

## 🔄 Integration Points

### With User Module
- Reads User table for all analytics
- Updates User.fullName
- Deletes User records

### With Points Module
- Reads Points table for statistics
- Updates Points.total for students
- Calculates averages and distributions

### With ParentChild Module
- Reads ParentChild table for link stats
- Counts linked parents and students
- Calculates linking rate

### With Quiz Module
- Cascade deletes QuizSession on user delete
- No direct reads (future: quiz analytics)

### With Wheel Module
- Cascade deletes WheelSession on user delete
- No direct reads (future: wheel analytics)

## 💡 Implementation Notes

### Why Separate Dashboard Stats?
- Provides quick overview without heavy queries
- Cached on frontend for performance
- Updated periodically (not real-time)

### Why Points Distribution Ranges?
- Provides insight into student performance levels
- Helps identify if points system is balanced
- Useful for setting achievement thresholds

### Why Registration Chart?
- Tracks platform growth over time
- Identifies marketing campaign effectiveness
- Helps plan capacity and resources

### Why Hard Delete?
- Simplifies data management
- Cascade handles all related records
- No orphaned data
- Can be changed to soft delete if needed

### Why Export Endpoint?
- Enables external reporting
- Supports data backup
- Allows offline analysis
- Frontend converts to CSV

---

**Status**: ✅ Complete and production-ready
