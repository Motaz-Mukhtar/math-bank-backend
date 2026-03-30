# Leaderboard Module Documentation

Complete leaderboard system showing top students ranked by points.

## 📁 Module Structure

```
leaderboard/
├── leaderboard.controller.ts    # Single endpoint controller
├── leaderboard.repository.ts    # Prisma queries for rankings
├── leaderboard.routes.ts        # Route definition
└── LEADERBOARD_MODULE.md        # This file
```

## 🏆 Features

- ✅ Top 10 students ranked by points
- ✅ Current user rank (if STUDENT)
- ✅ Only verified students included
- ✅ Efficient ranking calculation
- ✅ Requires authentication

## 📡 API Endpoint

Base URL: `/api/v1/leaderboard`

### Get Leaderboard

**GET** `/`

Get top 10 students and current user's rank.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "topStudents": [
      {
        "rank": 1,
        "userId": "uuid-1",
        "fullName": "عبدالله محمد",
        "academicNumber": "std-1234567890",
        "points": 385
      },
      {
        "rank": 2,
        "userId": "uuid-2",
        "fullName": "نورة السالم",
        "academicNumber": "std-2345678901",
        "points": 340
      },
      {
        "rank": 3,
        "userId": "uuid-3",
        "fullName": "فهد العتيبي",
        "academicNumber": "std-3456789012",
        "points": 312
      }
      // ... up to 10 students
    ],
    "currentUser": {
      "rank": 15,
      "points": 180
    }
  },
  "message": "تم جلب لوحة المتصدرين بنجاح"
}
```

**Current User Cases:**
- If authenticated user is a STUDENT: returns their rank and points
- If authenticated user is PARENT or ADMIN: returns `null`
- If user is not verified: returns `null`

## 🔍 Business Logic

### Top Students Query
```typescript
// Get top 10 verified STUDENT users ordered by points DESC
SELECT 
  user.id,
  user.fullName,
  user.academicNumber,
  points.total
FROM user
LEFT JOIN points ON user.id = points.userId
WHERE 
  user.role = 'STUDENT' 
  AND user.isVerified = true
ORDER BY points.total DESC
LIMIT 10
```

### User Rank Calculation
```typescript
// Count how many students have more points than current user
const higherRankedCount = COUNT(
  WHERE role = 'STUDENT' 
  AND isVerified = true 
  AND points.total > currentUserPoints
)

rank = higherRankedCount + 1
```

## 🧪 Testing

### Test with cURL

```bash
# Login first to get token
TOKEN=$(curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# Get leaderboard
curl -X GET http://localhost:4000/api/v1/leaderboard \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response Structure

**For STUDENT user:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "topStudents": [...],
    "currentUser": {
      "rank": 5,
      "points": 265
    }
  }
}
```

**For PARENT/ADMIN user:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "topStudents": [...],
    "currentUser": null
  }
}
```

## 📊 Database Queries

### Repository Methods

#### `getTopStudents(limit: number)`
- Fetches top N students ordered by points
- Only includes verified STUDENT users
- Returns: `LeaderboardEntry[]`
- Default limit: 10

#### `getUserRank(userId: string)`
- Calculates rank for specific user
- Returns null if user is not a STUDENT
- Returns null if user is not verified
- Returns: `CurrentUserRank | null`

## 🎨 Frontend Components

### Component Structure
```
components/leaderboard/
├── Podium.tsx              # Top 3 students with podium layout
├── LeaderboardList.tsx     # Ranked list (4th-10th)
└── CurrentUserRow.tsx      # Highlighted current user row
```

### Podium Layout
```
     [2nd]    [1st]    [3rd]
      🥈       🥇       🥉
    (pink)  (orange)  (teal)
    ┌───┐   ┌───┐   ┌───┐
    │   │   │   │   │   │
    │   │   │   │   │   │
    └───┘   │   │   └───┘
            │   │
            └───┘
```

### Usage in Pages

```tsx
import LeaderboardSection from '@/components/LeaderboardSection';

// In HomePage
<LeaderboardSection />

// Or as scroll target from /leaderboard route
<Route path="/leaderboard" element={<Navigate to="/#leaderboard" />} />
```

## 🔐 Security

- ✅ Requires authentication (authMiddleware)
- ✅ Only shows verified students
- ✅ Efficient queries (indexed by points)
- ✅ No sensitive data exposed

## ⚡ Performance

### Optimizations
1. **Indexed Query**: Points.total is indexed for fast sorting
2. **Limited Results**: Only fetches top 10 (configurable)
3. **Single Query**: Top students fetched in one query
4. **Efficient Rank Calculation**: Uses COUNT instead of full table scan

### Query Performance
- Top 10 query: O(n log n) where n = total students
- Rank calculation: O(n) where n = students with higher points
- Both queries use indexes for optimal performance

## 📝 Notes

- Leaderboard updates in real-time (no caching)
- Rank is calculated dynamically on each request
- Ties in points result in same rank
- Academic numbers displayed as-is (can be formatted in frontend)
- Only verified students appear in rankings
- Parents and admins can view but don't have ranks

## 🔄 Integration Points

### With Points Module
- Reads from Points table
- Points.total determines ranking
- Updates to points automatically affect leaderboard

### With Auth Module
- Requires valid JWT token
- Uses req.user.userId for current user rank
- Respects user role (STUDENT only)

### With Frontend
- Hook: `useLeaderboard()`
- Service: `leaderboard.api.ts`
- Components: Podium, LeaderboardList, CurrentUserRow

---

**Status**: ✅ Complete and production-ready
