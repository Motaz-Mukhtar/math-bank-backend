# Wheel Quiz Module Documentation

Complete spinning wheel quiz system with session management and point awards.

## 📁 Module Structure

```
wheel/
├── wheel.controller.ts      # 3 endpoints (start, spin, answer)
├── wheel.service.ts         # Business logic with random selection
├── wheel.repository.ts      # Prisma queries with transactions
├── wheel.routes.ts          # STUDENT-only protected routes
└── wheel.schema.ts          # Zod validation schemas
```

## 🎡 Features

- ✅ Session-based quiz system
- ✅ Random question selection per category
- ✅ No repeat questions within session
- ✅ Fixed 10 points per correct answer
- ✅ Atomic point awards (transaction)
- ✅ STUDENT-only access
- ✅ Answer validation

## 📡 API Endpoints

Base URL: `/api/v1/wheel`

All endpoints require STUDENT authentication.

### 1. Start Wheel Session

**POST** `/sessions`

Create a new wheel quiz session.

**Headers:** `Authorization: Bearer <token>`

**Response:** `201 Created`
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "sessionId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم بدء جلسة العجلة بنجاح"
}
```

---

### 2. Spin Wheel

**POST** `/sessions/:id/spin`

Spin the wheel and get a random question from the selected category.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "category": "ADDITION"
}
```

**Valid Categories:**
- `ADDITION` (الجمع)
- `SUBTRACTION` (الطرح)
- `MULTIPLICATION` (الضرب)
- `DIVISION` (القسمة)
- `COMPARISON` (المقارنة)
- `GEOMETRY` (الأشكال الهندسية)

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "question-uuid",
    "text": "ما ناتج ٥ + ٣؟",
    "options": ["٦", "٧", "٨", "٩"],
    "category": "ADDITION",
    "level": "EASY",
    "points": 10
  },
  "message": "تم الحصول على السؤال بنجاح"
}
```

**Note:** The `answer` field is NOT included in the response.

**Business Rules:**
- Excludes questions already asked in this session
- Returns random question from available pool
- If no questions available: returns 404

---

### 3. Submit Answer

**POST** `/sessions/:id/answer`

Submit answer for a wheel question.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "questionId": "question-uuid",
  "userAnswer": "٨"
}
```

**Response (Correct):** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "isCorrect": true,
    "pointsEarned": 10,
    "newTotal": 150,
    "correctAnswer": "٨"
  },
  "message": "إجابة صحيحة! 🎉"
}
```

**Response (Incorrect):** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "isCorrect": false,
    "pointsEarned": 0,
    "newTotal": 140,
    "correctAnswer": "٨"
  },
  "message": "إجابة خاطئة"
}
```

**Business Rules:**
- Awards 10 points if correct
- Awards 0 points if incorrect
- Updates user's total points atomically
- Cannot answer same question twice in session
- Returns correct answer for feedback

---

## 🎯 Business Logic

### Session Flow
```
1. Student starts session → sessionId created
2. Student spins wheel → category selected
3. Backend picks random question from category
   - Excludes already-asked questions
   - Returns question WITHOUT answer
4. Student submits answer
   - Backend checks correctness
   - Awards points if correct (10 points)
   - Updates total points atomically
5. Repeat steps 2-4 for more questions
```

### Question Selection Algorithm
```typescript
1. Get all questions for category
2. Get list of already-asked question IDs in this session
3. Filter out already-asked questions
4. If no questions available → throw 404
5. Pick random question from available pool
6. Return question (without answer field)
```

### Point Award System
```typescript
// Fixed points for wheel quiz
WHEEL_POINTS_PER_CORRECT = 10

// Atomic transaction:
1. Create WheelSessionItem record
2. Increment user's Points.total by pointsEarned
3. Return new total
```

## 🔐 Security & Validation

### Authentication
- All endpoints require valid JWT token
- Only STUDENT role allowed (requireRole middleware)

### Validation
- Spin: category must be valid QuizCategory enum
- Submit: questionId must be valid UUID
- Submit: userAnswer must not be empty

### Business Validation
- Session must exist
- Question must exist
- Question cannot be answered twice in same session
- Category must have available questions

## 📊 Database Operations

### Create Session
```sql
INSERT INTO WheelSession (id, userId, createdAt)
VALUES (uuid, userId, now())
```

### Get Asked Questions
```sql
SELECT questionId FROM WheelSessionItem
WHERE sessionId = ?
```

### Get Available Questions
```sql
SELECT * FROM Question
WHERE category = ?
  AND id NOT IN (asked_question_ids)
```

### Save Answer (Transaction)
```sql
BEGIN TRANSACTION

-- Create session item
INSERT INTO WheelSessionItem (
  sessionId, questionId, category,
  userAnswer, isCorrect, pointsEarned
) VALUES (?, ?, ?, ?, ?, ?)

-- Update points
UPDATE Points
SET total = total + pointsEarned
WHERE userId = (SELECT userId FROM WheelSession WHERE id = ?)

COMMIT
```

## 🧪 Testing

### Complete Flow Test

```bash
# 1. Login as student
TOKEN=$(curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# 2. Start wheel session
SESSION=$(curl -X POST http://localhost:4000/api/v1/wheel/sessions \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data.sessionId')

# 3. Spin wheel (get question)
QUESTION=$(curl -X POST http://localhost:4000/api/v1/wheel/sessions/$SESSION/spin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"ADDITION"}')

echo $QUESTION | jq

# 4. Submit answer
curl -X POST http://localhost:4000/api/v1/wheel/sessions/$SESSION/answer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "QUESTION_ID_FROM_STEP_3",
    "userAnswer": "٨"
  }'

# 5. Spin again for another question
curl -X POST http://localhost:4000/api/v1/wheel/sessions/$SESSION/spin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"SUBTRACTION"}'
```

## ⚠️ Error Responses

### 404 Session Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "error": "الجلسة غير موجودة"
}
```

### 404 No Questions Available
```json
{
  "success": false,
  "statusCode": 404,
  "error": "لا توجد أسئلة متاحة في هذه الفئة"
}
```

### 404 Question Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "error": "السؤال غير موجود"
}
```

### 400 Question Already Answered
```json
{
  "success": false,
  "statusCode": 400,
  "error": "تم الإجابة على هذا السؤال بالفعل"
}
```

### 403 Not a Student
```json
{
  "success": false,
  "statusCode": 403,
  "error": "ليس لديك صلاحية للوصول إلى هذا المورد"
}
```

## 🎨 Frontend Integration

### Hook Example
```typescript
const useWheelSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [points, setPoints] = useState(0);

  const startSession = async () => {
    const response = await api.post('/wheel/sessions');
    setSessionId(response.data.data.sessionId);
  };

  const spin = async (category: QuizCategory) => {
    const response = await api.post(`/wheel/sessions/${sessionId}/spin`, {
      category,
    });
    setQuestion(response.data.data);
  };

  const submitAnswer = async (questionId: string, userAnswer: string) => {
    const response = await api.post(`/wheel/sessions/${sessionId}/answer`, {
      questionId,
      userAnswer,
    });
    setPoints(response.data.data.newTotal);
    return response.data.data;
  };

  return { startSession, spin, submitAnswer, question, points };
};
```

### Component Flow
```tsx
1. SpinningWheel component
   - Animates wheel rotation
   - Calls spin() with selected category
   - Displays returned question

2. WheelQuestionCard component
   - Shows question text
   - Shows 4 option buttons
   - Calls submitAnswer() on click
   - Shows green/red feedback
   - Updates points display
```

## 📝 Key Differences from Quiz Module

| Feature | Wheel Quiz | Topic Quiz |
|---------|-----------|------------|
| Points | Fixed 10 per correct | 5/10/15 based on level |
| Question Selection | Random from category | Pre-selected set |
| Difficulty | Mixed levels | Single level per session |
| Session Length | Unlimited | Fixed (e.g., 10 questions) |
| Completion | No formal end | Has completion endpoint |

## 🔄 Integration Points

### With Points Module
- Reads/updates Points table
- Atomic transaction ensures consistency
- Points update reflected immediately

### With Question Module
- Reads from Question table
- Filters by category
- Excludes already-asked questions

### With Frontend
- Session management via hooks
- Real-time points updates
- Spinning wheel animation
- Question display and answer submission

## 📊 Database Schema Used

```prisma
model WheelSession {
  id        String   @id @default(uuid())
  userId    String
  createdAt DateTime @default(now())
  user      User     @relation(...)
  items     WheelSessionItem[]
}

model WheelSessionItem {
  id           String       @id @default(uuid())
  sessionId    String
  questionId   String
  category     QuizCategory
  userAnswer   String
  isCorrect    Boolean
  pointsEarned Int
  session      WheelSession @relation(...)
  question     Question     @relation(...)
}
```

## 💡 Implementation Notes

### Why Fixed 10 Points?
- Simplifies wheel quiz mechanics
- Different from topic quiz (which has levels)
- Consistent reward system
- Easy for students to understand

### Why Session-Based?
- Prevents question repetition
- Tracks student progress
- Enables analytics
- Supports future features (session history, etc.)

### Why Atomic Transaction?
- Ensures data consistency
- Points and session item created together
- Prevents partial updates
- Handles concurrent requests safely

---

**Status**: ✅ Complete and production-ready
