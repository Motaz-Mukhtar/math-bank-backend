# Quiz API Documentation

## Base URL
`/api/v1/quiz`

## Authentication
All endpoints require authentication with `STUDENT` role.

---

## Endpoints

### 1. Start Quiz Session
**POST** `/sessions`

Start a new quiz session with specified category, level, and question count.

**Request Body:**
```json
{
  "category": "ARITHMETIC",
  "level": "EASY",
  "questionCount": 5
}
```

**Valid Categories:**
- `ARITHMETIC` - Basic arithmetic operations
- `GEOMETRY` - Shapes, angles, measurements
- `ALGEBRA` - Variables, equations
- `FRACTIONS` - Fraction operations
- `DECIMALS` - Decimal operations
- `MEASUREMENT` - Units, conversions
- `TIME` - Time calculations
- `MONEY` - Currency calculations
- `STATISTICS` - Data analysis

**Valid Levels:**
- `EASY`
- `MEDIUM`
- `HARD`

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "session-uuid",
    "userId": "user-uuid",
    "category": "ARITHMETIC",
    "level": "EASY",
    "totalQuestions": 5,
    "currentQuestionIndex": 0,
    "correctAnswers": 0,
    "totalPoints": 0,
    "isCompleted": false,
    "createdAt": "2026-04-14T12:00:00.000Z"
  }
}
```

---

### 2. Get Next Question
**GET** `/sessions/:id/next`

Get the next question in the quiz session.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "question": {
      "id": "question-uuid",
      "type": "MCQ",
      "questionText": "What is 2 + 2?",
      "category": "ARITHMETIC",
      "level": "EASY",
      "params": {
        "options": ["2", "3", "4", "5"]
      }
    },
    "currentIndex": 1,
    "totalQuestions": 5
  }
}
```

**Question Types:**
- `MCQ` - Multiple Choice Question
- `FILL_BLANK` - Fill in the blank
- `MATCHING` - Match items
- `SORT_ORDER` - Sort items in order
- `VISUAL_MCQ` - Visual multiple choice
- `CLOCK_READ` - Read clock time

---

### 3. Submit Answer
**POST** `/sessions/:id/answer`

Submit an answer for the current question.

**Request Body:**
```json
{
  "questionId": "question-uuid",
  "answer": "4"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "isCorrect": true,
    "pointsEarned": 10,
    "correctAnswer": "4",
    "explanation": "2 + 2 equals 4"
  }
}
```

---

### 4. Complete Session
**POST** `/sessions/:id/complete`

Mark the quiz session as completed and get final results.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "session-uuid",
    "totalQuestions": 5,
    "correctAnswers": 4,
    "totalPoints": 40,
    "accuracy": 80,
    "completedAt": "2026-04-14T12:15:00.000Z"
  }
}
```

---

### 5. Get Quiz History
**GET** `/sessions/history`

Get the user's quiz session history.

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "session-uuid",
      "category": "ARITHMETIC",
      "level": "EASY",
      "totalQuestions": 5,
      "correctAnswers": 4,
      "totalPoints": 40,
      "isCompleted": true,
      "createdAt": "2026-04-14T12:00:00.000Z",
      "completedAt": "2026-04-14T12:15:00.000Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Invalid category or level"
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
  "error": "Student role required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "error": "Quiz session not found"
}
```

---

## Points System

Points are awarded based on:
- **Question Type**: Different types have different base points
- **Difficulty Level**: 
  - EASY: 1x multiplier
  - MEDIUM: 1.5x multiplier
  - HARD: 2x multiplier
- **Correctness**: Full points for correct, 0 for incorrect

**Base Points by Type:**
- MCQ: 10 points
- FILL_BLANK: 15 points
- MATCHING: 20 points
- SORT_ORDER: 20 points
- VISUAL_MCQ: 10 points
- CLOCK_READ: 15 points
