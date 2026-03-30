# Video & Video Category Modules Documentation

Complete video management system with categories (chapters) and videos.

## 📁 Module Structure

```
videoCategory/
├── videoCategory.controller.ts
├── videoCategory.service.ts
├── videoCategory.repository.ts
├── videoCategory.routes.ts
└── videoCategory.schema.ts

video/
├── video.controller.ts
├── video.service.ts
├── video.repository.ts
├── video.routes.ts
└── video.schema.ts
```

## 🎯 Key Concepts

### Video Categories (الفصول)
- Admin-managed chapters/sections
- Example: "الفصل الأول: الجمع والطرح للمبتدئين"
- Completely separate from QuizCategory enum
- Have sortOrder for display ordering
- Cannot be deleted if they contain videos

### Videos
- Belong to a VideoCategory
- Have their own sortOrder within category
- Can be moved between categories
- YouTube embed URLs or direct links

## 📡 API Endpoints

### Video Categories

Base URL: `/api/v1/video-categories`

#### 1. Get All Categories

**GET** `/`

Get all categories with nested videos, ordered by sortOrder.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "الفصل الأول: الجمع للمبتدئين",
      "description": "تعلم أساسيات الجمع",
      "sortOrder": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "videos": [
        {
          "id": "uuid",
          "title": "مقدمة في الجمع",
          "description": "فيديو تعريفي",
          "url": "https://youtube.com/watch?v=...",
          "sortOrder": 0,
          "categoryId": "uuid",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ],
  "message": "تم جلب الفصول بنجاح"
}
```

#### 2. Get Single Category

**GET** `/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (same structure as single category above)

#### 3. Create Category

**POST** `/` (Admin only)

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "الفصل الثاني: الطرح",
  "description": "تعلم عمليات الطرح",
  "sortOrder": 1
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "uuid",
    "name": "الفصل الثاني: الطرح",
    "description": "تعلم عمليات الطرح",
    "sortOrder": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم إنشاء الفصل بنجاح"
}
```

#### 4. Update Category

**PUT** `/:id` (Admin only)

**Request Body:** (all fields optional)
```json
{
  "name": "الفصل الثاني: الطرح المتقدم",
  "description": "تعلم عمليات الطرح المتقدمة",
  "sortOrder": 2
}
```

**Response:** `200 OK`

#### 5. Delete Category

**DELETE** `/:id` (Admin only)

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "تم حذف الفصل بنجاح"
}
```

**Error if category has videos:** `409 Conflict`
```json
{
  "success": false,
  "statusCode": 409,
  "error": "لا يمكن حذف الفصل — يحتوي على فيديوهات"
}
```

---

### Videos

Base URL: `/api/v1/videos`

#### 1. Get All Videos

**GET** `/`

Get all videos with optional category filter.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `categoryId` (optional): Filter by category UUID

**Examples:**
- `/api/v1/videos` - All videos
- `/api/v1/videos?categoryId=uuid` - Videos in specific category

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "title": "مقدمة في الجمع",
      "description": "فيديو تعريفي",
      "url": "https://youtube.com/watch?v=...",
      "sortOrder": 0,
      "categoryId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "الفصل الأول: الجمع للمبتدئين"
      }
    }
  ],
  "message": "تم جلب الفيديوهات بنجاح"
}
```

#### 2. Get Single Video

**GET** `/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (same structure as single video above)

#### 3. Create Video

**POST** `/` (Admin only)

**Request Body:**
```json
{
  "title": "الجمع البسيط",
  "description": "تعلم الجمع البسيط للأرقام الصغيرة",
  "url": "https://youtube.com/watch?v=abc123",
  "categoryId": "uuid",
  "sortOrder": 0
}
```

**Response:** `201 Created`

#### 4. Update Video

**PUT** `/:id` (Admin only)

**Request Body:** (all fields optional)
```json
{
  "title": "الجمع البسيط - محدث",
  "description": "وصف محدث",
  "url": "https://youtube.com/watch?v=xyz789",
  "categoryId": "uuid",
  "sortOrder": 1
}
```

**Response:** `200 OK`

#### 5. Delete Video

**DELETE** `/:id` (Admin only)

Deletes video and reorders remaining videos in the same category.

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "تم حذف الفيديو بنجاح"
}
```

#### 6. Move Video to Different Category

**PATCH** `/:id/move` (Admin only)

**Request Body:**
```json
{
  "categoryId": "new-category-uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "title": "الجمع البسيط",
    "categoryId": "new-category-uuid",
    ...
  },
  "message": "تم نقل الفيديو بنجاح"
}
```

---

## 🔐 Security & Permissions

### Authentication Required
All endpoints require valid JWT token.

### Role-Based Access
- **GET endpoints**: All authenticated users (STUDENT, PARENT, ADMIN)
- **POST/PUT/DELETE/PATCH**: ADMIN only

## 🔄 Business Logic

### Category Deletion Rules
1. Check if category exists
2. Count videos in category
3. If count > 0: throw 409 error
4. If count = 0: delete category
5. Reorder remaining categories (decrement sortOrder)

### Video Deletion Rules
1. Check if video exists
2. Delete video
3. Reorder remaining videos in same category

### Video Move Rules
1. Check if video exists
2. Check if new category exists
3. Update video's categoryId

### Sort Order Management
- Categories ordered by sortOrder (ascending)
- Videos within category ordered by sortOrder (ascending)
- After deletion, sortOrder is re-normalized

## 📊 Database Queries

### Get All Categories with Videos
```sql
SELECT * FROM VideoCategory
ORDER BY sortOrder ASC
INCLUDE videos (ORDER BY sortOrder ASC)
```

### Get Video Count in Category
```sql
SELECT COUNT(*) FROM Video
WHERE categoryId = ?
```

### Reorder After Category Deletion
```sql
UPDATE VideoCategory
SET sortOrder = sortOrder - 1
WHERE sortOrder > deletedSortOrder
```

### Reorder After Video Deletion
```sql
UPDATE Video
SET sortOrder = sortOrder - 1
WHERE categoryId = ? AND sortOrder > deletedSortOrder
```

## 🧪 Testing

### Test Category CRUD

```bash
# Login as admin
TOKEN=$(curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# Create category
curl -X POST http://localhost:4000/api/v1/video-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "الفصل الأول: الجمع",
    "description": "تعلم الجمع",
    "sortOrder": 0
  }'

# Get all categories
curl http://localhost:4000/api/v1/video-categories \
  -H "Authorization: Bearer $TOKEN"

# Try to delete category with videos (should fail with 409)
curl -X DELETE http://localhost:4000/api/v1/video-categories/CATEGORY_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Test Video CRUD

```bash
# Create video
curl -X POST http://localhost:4000/api/v1/videos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مقدمة في الجمع",
    "description": "فيديو تعريفي",
    "url": "https://youtube.com/watch?v=abc123",
    "categoryId": "CATEGORY_UUID",
    "sortOrder": 0
  }'

# Get videos by category
curl "http://localhost:4000/api/v1/videos?categoryId=CATEGORY_UUID" \
  -H "Authorization: Bearer $TOKEN"

# Move video to different category
curl -X PATCH http://localhost:4000/api/v1/videos/VIDEO_ID/move \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categoryId": "NEW_CATEGORY_UUID"}'
```

## ⚠️ Error Responses

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "error": "الفصل غير موجود"
}
```

### 409 Conflict (Category has videos)
```json
{
  "success": false,
  "statusCode": 409,
  "error": "لا يمكن حذف الفصل — يحتوي على فيديوهات"
}
```

### 403 Forbidden (Not admin)
```json
{
  "success": false,
  "statusCode": 403,
  "error": "ليس لديك صلاحية للوصول إلى هذا المورد"
}
```

## 📝 Notes

- Video categories are admin-managed chapters
- Separate from QuizCategory enum (different context)
- sortOrder allows custom ordering in UI
- Videos can be moved between categories
- Deletion triggers automatic reordering
- YouTube URLs should be embed format
- All text fields support Arabic

---

**Status**: ✅ Complete and production-ready
