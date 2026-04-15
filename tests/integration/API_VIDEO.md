# Video API Documentation

## Base URL
`/api/v1/videos`

## Authentication
- All endpoints require authentication
- Admin-only endpoints require `ADMIN` role
- Public endpoints accessible by all authenticated users

---

## Endpoints

### 1. Get All Videos
**GET** `/`

Get paginated list of videos with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `categoryId` (optional): Filter by category ID
- `search` (optional): Search in title and description

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "videos": [
      {
        "id": "video-uuid",
        "title": "Introduction to Arithmetic",
        "description": "Learn basic arithmetic operations",
        "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        "order": 1,
        "categoryId": "category-uuid",
        "category": {
          "id": "category-uuid",
          "name": "Arithmetic"
        },
        "createdAt": "2026-04-14T12:00:00.000Z",
        "updatedAt": "2026-04-14T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Video by ID
**GET** `/:id`

Get detailed information about a specific video.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "video-uuid",
    "title": "Introduction to Arithmetic",
    "description": "Learn basic arithmetic operations",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "order": 1,
    "categoryId": "category-uuid",
    "category": {
      "id": "category-uuid",
      "name": "Arithmetic",
      "description": "Basic arithmetic operations"
    },
    "createdAt": "2026-04-14T12:00:00.000Z",
    "updatedAt": "2026-04-14T12:00:00.000Z"
  }
}
```

---

### 3. Create Video (Admin Only)
**POST** `/`

Create a new video.

**Request Body:**
```json
{
  "title": "Introduction to Geometry",
  "description": "Learn about shapes and angles",
  "youtubeUrl": "https://www.youtube.com/watch?v=example",
  "categoryId": "category-uuid",
  "order": 1
}
```

**Validation Rules:**
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `youtubeUrl`: Required, valid YouTube URL
- `categoryId`: Optional, valid UUID
- `order`: Required, positive integer

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "video-uuid",
    "title": "Introduction to Geometry",
    "description": "Learn about shapes and angles",
    "youtubeUrl": "https://www.youtube.com/watch?v=example",
    "thumbnailUrl": "https://img.youtube.com/vi/example/maxresdefault.jpg",
    "order": 1,
    "categoryId": "category-uuid",
    "createdAt": "2026-04-14T12:00:00.000Z",
    "updatedAt": "2026-04-14T12:00:00.000Z"
  }
}
```

---

### 4. Update Video (Admin Only)
**PUT** `/:id`

Update an existing video.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "youtubeUrl": "https://www.youtube.com/watch?v=new-url",
  "categoryId": "new-category-uuid",
  "order": 2
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "video-uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "youtubeUrl": "https://www.youtube.com/watch?v=new-url",
    "thumbnailUrl": "https://img.youtube.com/vi/new-url/maxresdefault.jpg",
    "order": 2,
    "categoryId": "new-category-uuid",
    "updatedAt": "2026-04-14T13:00:00.000Z"
  }
}
```

---

### 5. Move Video (Admin Only)
**PATCH** `/:id/move`

Change the order/position of a video.

**Request Body:**
```json
{
  "newOrder": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "video-uuid",
    "order": 5,
    "updatedAt": "2026-04-14T13:00:00.000Z"
  }
}
```

---

### 6. Delete Video (Admin Only)
**DELETE** `/:id`

Delete a video permanently.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Video deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Invalid YouTube URL format"
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
  "error": "Video not found"
}
```

---

## YouTube URL Formats

Supported YouTube URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

The system automatically extracts the video ID and generates thumbnail URLs.

---

## Caching

Video data is cached for 5 minutes to improve performance:
- List endpoints: 5 minutes
- Individual video: 5 minutes
- Cache is automatically invalidated on create/update/delete operations
