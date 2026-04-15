# Leaderboard Module API Documentation

## Overview
Leaderboard endpoints for viewing rankings, user statistics, and badges.

## Base URL
`/api/v1/leaderboard`

## Authentication
All endpoints require authentication (Bearer token).

---

## Endpoints

### 1. Get Top Leaderboard

**GET** `/api/v1/leaderboard`

Get top N students on the leaderboard.

**Authentication:** Required

**Query Parameters**:
- `limit` (optional): Number of entries to return (default: 8, max: 100)

**Request**:
```bash
GET /api/v1/leaderboard?limit=10
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم جلب المتصدرين بنجاح",
  "data": {
    "entries": [
      {
        "rank": 1,
        "userId": "uuid",
        "fullName": "Ahmed Ali",
        "academicNumber": "STU123456",
        "points": 1500
      },
      {
        "rank": 2,
        "userId": "uuid",
        "fullName": "Sara Mohammed",
        "academicNumber": "STU123457",
        "points": 1350
      }
    ]
  }
}
```

**Cache**: 60 seconds

---

### 2. Get Full Leaderboard (Paginated)

**GET** `/api/v1/leaderboard/full`

Get paginated leaderboard with all students.

**Authentication:** Required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Entries per page (default: 20, max: 100)
- `period` (optional): `all` or `weekly` (default: `all`)

**Request**:
```bash
GET /api/v1/leaderboard/full?page=1&limit=20&period=all
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم جلب اللوحة بنجاح",
  "data": {
    "entries": [
      {
        "rank": 1,
        "userId": "uuid",
        "fullName": "Ahmed Ali",
        "academicNumber": "STU123456",
        "points": 1500
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Cache**: 30 seconds (all), 60 seconds (weekly)

---

### 3. Get Current User Stats

**GET** `/api/v1/leaderboard/me`

Get current user's rank, points, and detailed statistics.

**Authentication:** Required

**Request**:
```bash
GET /api/v1/leaderboard/me
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم جلب إحصائياتك بنجاح",
  "data": {
    "rank": 15,
    "points": 850,
    "weeklyRank": 8,
    "weeklyTotal": 120,
    "categoryBreakdown": [
      {
        "category": "ALGEBRA",
        "points": 350
      },
      {
        "category": "GEOMETRY",
        "points": 250
      },
      {
        "category": "ARITHMETIC",
        "points": 250
      }
    ],
    "pointsHistory": [
      {
        "date": "2026-04-08",
        "total": 20
      },
      {
        "date": "2026-04-09",
        "total": 35
      },
      {
        "date": "2026-04-10",
        "total": 15
      },
      {
        "date": "2026-04-11",
        "total": 25
      },
      {
        "date": "2026-04-12",
        "total": 10
      },
      {
        "date": "2026-04-13",
        "total": 15
      },
      {
        "date": "2026-04-14",
        "total": 0
      }
    ]
  }
}
```

**Fields**:
- `rank`: Global rank (all-time)
- `points`: Total points (all-time)
- `weeklyRank`: Rank for current week
- `weeklyTotal`: Points earned this week
- `categoryBreakdown`: Points per quiz category
- `pointsHistory`: Daily points for last 7 days (Saturday to today)

---

### 4. Get User Badges

**GET** `/api/v1/leaderboard/badges`

Get user's earned and available badges.

**Authentication:** Required

**Request**:
```bash
GET /api/v1/leaderboard/badges
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم جلب الشارات بنجاح",
  "data": {
    "badges": [
      {
        "id": "first_steps",
        "name": "الخطوات الأولى",
        "description": "أكمل أول جلسة اختبار",
        "icon": "🎯",
        "earned": true,
        "earnedAt": "2026-04-10T15:30:00.000Z"
      },
      {
        "id": "quick_learner",
        "name": "متعلم سريع",
        "description": "اكسب 50 نقطة في يوم واحد",
        "icon": "⚡",
        "earned": true,
        "earnedAt": "2026-04-11T18:45:00.000Z"
      },
      {
        "id": "week_warrior",
        "name": "محارب الأسبوع",
        "description": "كن الأول في اللوحة الأسبوعية",
        "icon": "👑",
        "earned": false,
        "earnedAt": null
      },
      {
        "id": "perfect_score",
        "name": "النتيجة المثالية",
        "description": "احصل على 10/10 في اختبار",
        "icon": "💯",
        "earned": false,
        "earnedAt": null
      }
    ]
  }
}
```

**Badge Types**:
- `first_steps`: Complete first quiz session
- `quick_learner`: Earn 50+ points in 24 hours
- `week_warrior`: #1 on weekly leaderboard
- `perfect_score`: Get 10/10 in a quiz
- `streak_master`: Active 7 days in a row
- `category_master`: #1 in any category
- `point_collector`: Reach 1000 total points

---

## Testing

### cURL Examples

```bash
# Get top 10
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/leaderboard?limit=10

# Get full leaderboard (page 1)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/leaderboard/full?page=1&limit=20

# Get weekly leaderboard
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/leaderboard/full?period=weekly

# Get my stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/leaderboard/me

# Get my badges
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/leaderboard/badges
```

---

## Caching Strategy

| Endpoint | Cache TTL | Invalidation |
|----------|-----------|--------------|
| Top leaderboard | 60s | On points update |
| Full leaderboard (all) | 30s | On points update |
| Full leaderboard (weekly) | 60s | On points update |
| User stats | No cache | Real-time |
| Badges | No cache | Real-time |

**Cache Invalidation**: Automatically invalidated when any user earns points through quiz or wheel.

---

## Weekly Leaderboard Logic

**Week Definition**: Saturday 00:00:00 to Friday 23:59:59

**Calculation**:
1. Get all quiz and wheel sessions created since last Saturday
2. Sum points earned in those sessions per user
3. Rank users by weekly total
4. Reset every Saturday at midnight

**Example**:
- Today: Tuesday, April 14, 2026
- Week start: Saturday, April 11, 2026 00:00:00
- Week end: Friday, April 17, 2026 23:59:59
- Points counted: All points earned from April 11 onwards

---

## Points Breakdown

### By Category
Points are tracked separately for each quiz category:
- `ALGEBRA`: Algebra questions
- `GEOMETRY`: Geometry questions
- `ARITHMETIC`: Arithmetic questions
- `FRACTIONS`: Fractions questions
- `MEASUREMENT`: Measurement questions

### By Source
Points can be earned from:
- **Quiz**: 5-15 points per correct answer (based on difficulty)
- **Wheel**: 10 points per correct answer (fixed)

---

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Not a student (only students have ranks) |
| 404 | Not Found - User not found |
| 500 | Internal Server Error |

---

## Performance

**Expected Response Times**:
- Top leaderboard: < 100ms (first request), < 10ms (cached)
- Full leaderboard: < 150ms (first request), < 10ms (cached)
- User stats: < 200ms (complex aggregation)
- Badges: < 100ms

**Optimization**:
- Database indexes on `Points.total` and `User.role`
- Backend caching with node-cache
- Frontend caching with React Query
- Efficient SQL queries with proper JOINs

---

## Notes

1. Only verified students appear on leaderboard
2. Ranks are calculated in real-time based on total points
3. Ties are broken by user ID (alphabetically)
4. Academic numbers are optional and may be null
5. Weekly leaderboard resets every Saturday at midnight
6. Points history shows last 7 days (Saturday to today)
7. Category breakdown only includes categories with points > 0
