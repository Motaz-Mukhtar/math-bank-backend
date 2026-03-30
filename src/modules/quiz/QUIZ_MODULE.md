# Topic Quiz Module Documentation

Complete topic-based quiz system with fixed 10-question sessions, level-based points, and completion tracking.

## 📁 Module Structure

```
quiz/
├── quiz.controller.ts      # 5 endpoints (start, next, answer, complete, history)
├── quiz.service.ts         # Business logic with session management
├── quiz.repository.ts      # Prisma queries with transactions
├── quiz.routes.ts          # STUDENT-only protected routes
└── quiz.schema.ts          # Zod validation schemas
```

## 🎯 Features

- ✅ Fixed 10-question sessions
- ✅ Level-based point system (EASY=5, MEDIUM=10, HARD=15)
- ✅ Random question selection per session
- ✅ Session completion tracking
- ✅ Quiz history for students
- ✅ Atomic point awards (transaction)
- ✅ STUDENT-only access
- ✅ Answer validation

## 📡 API Endpoints

Base URL: `/api/v1/quiz`

All endpoints require STUDENT authentication.

### 1. Start Quiz Session

**POST** `/sessions`

Create a new quiz session with 10 random questions from selected category and level.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "category": "ADDITION",
  "level": "EASY"
}
```

**Valid Categories:**
- `ADDITION` (الجمع)
- `SUBTRACTION` (الطرح)
- `MULTIPLICATION` (الضرب)
- `DIVISION` (القسمة)
- `COMPARISON` (المقارنة)
- `GEOMETRY` (الأشكال الهندسية)

**Valid Levels:**
- `EASY` (سهل) - 5 points per correct answer
- `MEDIUM` (متوسط) - 10 points per correct answer
- `HARD` (صعب) - 15 points per correct answer

**Response:** `201 Created`
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "sessionId": "uuid",
    "category": "ADDITION",
    "level": "EASY",
    "totalQuestions": 10,
    "currentQuestion": 1,
    "question": {
      "id": "question-uuid",
      "text": "ما ناتج ٥ + ٣؟",
      "options": ["٦", "٧", "٨", "٩"],
      "category": "ADDITION",
      "level": "EASY",
      "points": 5
    }
  },
  "message": "تم بدء جلسة الاختبار بنجاح"
}
```

**Note:** The `answer` field is NOT included in the response.

---

### 2. Get Next Question

**GET** `/sessions/:id/next`

Get the next unanswered question in the session.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "currentQuestion": 2,
    "totalQuestions": 10,
    "question": {
      "id": "question-uuid",
      "text": "ما ناتج ١٠ + ٥؟",
      "options": ["١٢", "١٣", "١٥", "١٦"],
      "category": "ADDITION",
      "level": "EASY",
      "points": 5
    }
  },
  "message": "تم الحصول على السؤال التالي بنجاح"
}
```

---

### 3. Submit Answer

**POST** `/sessions/:id/answer`

Submit answer for a quiz question.

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
    "pointsEarned": 5,
    "newTotal": 155,
    "sessionScore": 15,
    "correctAnswer": "٨",
    "isSessionComplete": false,
    "questionsAnswered": 3,
    "totalQuestions": 10
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
    "newTotal": 155,
    "sessionScore": 15,
    "correctAnswer": "٨",
    "isSessionComplete": false,
    "questionsAnswered": 3,
    "totalQuestions": 10
  },
  "message": "إجابة خاطئة"
}
```

**Business Rules:**
- Awards points based on level (EASY=5, MEDIUM=10, HARD=15)
- Awards 0 points if incorrect
- Updates user's total points atomically
- Updates session totalScore
- Cannot answer same question twice in session
- Returns correct answer for feedback
- Indicates if session is complete (all 10 questions answered)

---

### 4. Complete Session

**POST** `/sessions/:id/complete`

Mark session as complete and get summary.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "sessionId": "uuid",
    "category": "ADDITION",
    "level": "EASY",
    "totalScore": 35,
    "correctCount": 7,
    "incorrectCount": 3,
    "totalQuestions": 10,
    "completedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم إكمال الاختبار بنجاح"
}
```

**Business Rules:**
- All 10 questions must be answered before completion
- Session marked as complete (isComplete = true)
- completedAt timestamp recorded
- Returns summary with score and counts

---

### 5. Get Quiz History

**GET** `/sessions/history`

Get user's completed quiz sessions (last 10).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
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
  ],
  "message": "تم الحصول على سجل الاختبارات بنجاح"
}
```

---

## 🎯 Business Logic

### Session Flow
```
1. Student starts session → category + level selected
2. Backend fetches 10 random questions
3. Backend returns sessionId + first question (without answer)
4. Student submits answer
   - Backend checks correctness
   - Awards points based on level (5/10/15)
   - Updates total points and session score atomically
   - Returns isSessionComplete flag
5. Student gets next question (or completes if all answered)
6. Repeat steps 4-5 until all 10 questions answered
7. Student completes session → summary returned
```

### Question Selection Algorithm
```typescript
1. Get all questions for category + level
2. Shuffle questions randomly
3. Take first 10 questions
4. If less than 10 available → throw error
5. Store questions for this session
6. Return questions one by one (without answer field)
```

### Point Award System
```typescript
// Level-based points
POINTS_BY_LEVEL = {
  EASY: 5,
  MEDIUM: 10,
  HARD: 15
}

// Atomic transaction:
1. Create QuizSessionItem record
2. Increment session.totalScore by pointsEarned
3. Increment user's Points.total by pointsEarned
4. Return new totals
```


## 🔐 Security & Validation

### Authentication
- All endpoints require valid JWT token
- Only STUDENT role allowed (requireRole middleware)

### Validation
- Start: category and level must be valid enums
- Submit: questionId must be valid UUID
- Submit: userAnswer must not be empty

### Business Validation
- Session must exist
- Session must not be complete
- Question must exist
- Question cannot be answered twice in same session
- Must have at least 10 questions available for category+level
- All 10 questions must be answered before completion

## 📊 Database Operations

### Create Session
```sql
INSERT INTO QuizSession (id, userId, category, level, totalScore, isComplete)
VALUES (uuid, userId, category, level, 0, false)
```

### Get Random Questions
```sql
SELECT * FROM Question
WHERE category = ? AND level = ?
ORDER BY RAND()
LIMIT 10
```

### Get Answered Questions
```sql
SELECT questionId FROM QuizSessionItem
WHERE sessionId = ?
```

### Save Answer (Transaction)
```sql
BEGIN TRANSACTION

-- Create session item
INSERT INTO QuizSessionItem (
  sessionId, questionId, userAnswer, isCorrect, pointsEarned
) VALUES (?, ?, ?, ?, ?)

-- Update session score
UPDATE QuizSession
SET totalScore = totalScore + pointsEarned
WHERE id = ?

-- Update user points
UPDATE Points
SET total = total + pointsEarned
WHERE userId = (SELECT userId FROM QuizSession WHERE id = ?)

COMMIT
```

### Complete Session
```sql
UPDATE QuizSession
SET isComplete = true, completedAt = NOW()
WHERE id = ?
```

### Get User History
```sql
SELECT * FROM QuizSession
WHERE userId = ? AND isComplete = true
ORDER BY completedAt DESC
LIMIT 10
```

## 🧪 Testing

### Complete Flow Test

```bash
# 1. Login as student
TOKEN=$(curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# 2. Start quiz session
SESSION=$(curl -X POST http://localhost:4000/api/v1/quiz/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"ADDITION","level":"EASY"}' \
  | jq -r '.data.sessionId')

QUESTION_ID=$(curl -X POST http://localhost:4000/api/v1/quiz/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"ADDITION","level":"EASY"}' \
  | jq -r '.data.question.id')

# 3. Submit answer for first question
curl -X POST http://localhost:4000/api/v1/quiz/sessions/$SESSION/answer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$QUESTION_ID\",
    \"userAnswer\": \"٨\"
  }"

# 4. Get next question
NEXT=$(curl -X GET http://localhost:4000/api/v1/quiz/sessions/$SESSION/next \
  -H "Authorization: Bearer $TOKEN")

echo $NEXT | jq

# 5. Repeat steps 3-4 for remaining 9 questions...

# 6. Complete session
curl -X POST http://localhost:4000/api/v1/quiz/sessions/$SESSION/complete \
  -H "Authorization: Bearer $TOKEN"

# 7. Get quiz history
curl -X GET http://localhost:4000/api/v1/quiz/sessions/history \
  -H "Authorization: Bearer $TOKEN"
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

### 400 Session Already Complete
```json
{
  "success": false,
  "statusCode": 400,
  "error": "الجلسة مكتملة بالفعل"
}
```

### 404 No Questions Available
```json
{
  "success": false,
  "statusCode": 404,
  "error": "لا توجد أسئلة متاحة لهذه الفئة والمستوى"
}
```

### 400 Insufficient Questions
```json
{
  "success": false,
  "statusCode": 400,
  "error": "عدد الأسئلة المتاحة (5) أقل من المطلوب (10)"
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

### 404 No More Questions
```json
{
  "success": false,
  "statusCode": 404,
  "error": "لا توجد أسئلة متبقية في هذه الجلسة"
}
```

### 400 Incomplete Session
```json
{
  "success": false,
  "statusCode": 400,
  "error": "يجب الإجابة على جميع الأسئلة (7/10)"
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
const useQuizSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const startSession = async (category: QuizCategory, level: QuizLevel) => {
    const response = await api.post('/quiz/sessions', {
      category,
      level,
    });
    setSessionId(response.data.data.sessionId);
    setCurrentQuestion(response.data.data.question);
    setQuestionsAnswered(1);
    return response.data.data;
  };

  const getNextQuestion = async () => {
    const response = await api.get(`/quiz/sessions/${sessionId}/next`);
    setCurrentQuestion(response.data.data.question);
    setQuestionsAnswered(response.data.data.currentQuestion);
    return response.data.data;
  };

  const submitAnswer = async (questionId: string, userAnswer: string) => {
    const response = await api.post(`/quiz/sessions/${sessionId}/answer`, {
      questionId,
      userAnswer,
    });
    setSessionScore(response.data.data.sessionScore);
    setQuestionsAnswered(response.data.data.questionsAnswered);
    return response.data.data;
  };

  const completeSession = async () => {
    const response = await api.post(`/quiz/sessions/${sessionId}/complete`);
    return response.data.data;
  };

  const getHistory = async () => {
    const response = await api.get('/quiz/sessions/history');
    return response.data.data;
  };

  return {
    startSession,
    getNextQuestion,
    submitAnswer,
    completeSession,
    getHistory,
    currentQuestion,
    sessionScore,
    questionsAnswered,
  };
};
```

### Component Flow
```tsx
1. QuizSetup component
   - Select category and level
   - Calls startSession()
   - Navigates to quiz

2. QuizQuestion component
   - Shows question text and options
   - Shows progress (3/10)
   - Shows current session score
   - Calls submitAnswer() on option click
   - Shows green/red feedback
   - Auto-advances to next question or completion

3. QuizComplete component
   - Shows final summary
   - Displays totalScore, correctCount, incorrectCount
   - Option to start new quiz
   - Option to view history

4. QuizHistory component
   - Lists past completed sessions
   - Shows category, level, score, date
   - Filterable by category/level
```

## 📝 Key Differences from Wheel Quiz

| Feature | Topic Quiz | Wheel Quiz |
|---------|-----------|------------|
| **Points** | 5/10/15 based on level | Fixed 10 per correct |
| **Selection** | Pre-selected 10 questions | Random per spin |
| **Session Length** | Fixed 10 questions | Unlimited |
| **Completion** | Has completion endpoint | No formal end |
| **History** | Tracked with completion date | Not tracked |
| **Level** | Single level per session | Mixed levels |
| **Progress** | Shows X/10 progress | No progress tracking |

## 🔄 Integration Points

### With Points Module
- Reads/updates Points table
- Atomic transaction ensures consistency
- Points update reflected immediately

### With Question Module
- Reads from Question table
- Filters by category AND level
- Requires minimum 10 questions

### With Frontend
- Session management via hooks
- Progress tracking (X/10)
- Real-time score updates
- Completion summary
- History display

## 📊 Database Schema Used

```prisma
model QuizSession {
  id          String       @id @default(uuid())
  userId      String
  category    QuizCategory
  level       QuizLevel
  totalScore  Int          @default(0)
  isComplete  Boolean      @default(false)
  createdAt   DateTime     @default(now())
  completedAt DateTime?
  user        User         @relation(...)
  items       QuizSessionItem[]
}

model QuizSessionItem {
  id           String      @id @default(uuid())
  sessionId    String
  questionId   String
  userAnswer   String
  isCorrect    Boolean
  pointsEarned Int
  session      QuizSession @relation(...)
  question     Question    @relation(...)
}
```

## 💡 Implementation Notes

### Why Fixed 10 Questions?
- Consistent quiz experience
- Predictable time commitment
- Easy progress tracking
- Standard assessment format

### Why Level-Based Points?
- Rewards difficulty appropriately
- Encourages progression
- Fair point distribution
- Motivates students to try harder levels

### Why Session Completion?
- Tracks finished quizzes
- Enables history and analytics
- Prevents incomplete sessions
- Provides closure and summary

### Why Atomic Transaction?
- Ensures data consistency
- Points, session score, and items updated together
- Prevents partial updates
- Handles concurrent requests safely

---

**Status**: ✅ Complete and production-ready
