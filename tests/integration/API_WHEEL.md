# Wheel API Documentation

## Base URL
`/api/v1/wheel`

## Authentication
All endpoints require authentication with `STUDENT` role.

---

## Endpoints

### 1. Start Wheel Session
**POST** `/sessions`

Start a new wheel game session.

**Request Body:** None

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "session-uuid",
    "userId": "user-uuid",
    "totalSpins": 0,
    "totalPoints": 0,
    "isActive": true,
    "createdAt": "2026-04-14T12:00:00.000Z"
  }
}
```

---

### 2. Spin Wheel
**POST** `/sessions/:id/spin`

Spin the wheel to get a random question based on category and level.

**Request Body:**
```json
{
  "category": "ARITHMETIC",
  "level": "EASY"
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

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "question": {
      "id": "question-uuid",
      "type": "MCQ",
      "questionText": "What is 5 + 3?",
      "category": "ARITHMETIC",
      "level": "EASY",
      "params": {
        "options": ["6", "7", "8", "9"]
      }
    },
    "spinResult": {
      "category": "ARITHMETIC",
      "level": "EASY",
      "potentialPoints": 10,
      "multiplier": 1
    }
  }
}
```

---

### 3. Submit Answer
**POST** `/sessions/:id/answer`

Submit an answer for the current wheel question.

**Request Body:**
```json
{
  "questionId": "question-uuid",
  "answer": "8"
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
    "correctAnswer": "8",
    "explanation": "5 + 3 equals 8",
    "totalPoints": 10,
    "totalSpins": 1
  }
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
  "error": "Wheel session not found"
}
```

---

## Game Mechanics

### Wheel Spin
- Each spin randomly selects a category and difficulty level
- The wheel determines the potential points based on difficulty
- Players must answer the question correctly to earn points

### Points System
Points are awarded based on:
- **Question Type**: Different types have different base points
- **Difficulty Level**: 
  - EASY: 1x multiplier
  - MEDIUM: 1.5x multiplier
  - HARD: 2x multiplier
- **Wheel Multiplier**: Random bonus multiplier (1x-3x)

**Base Points by Type:**
- MCQ: 10 points
- FILL_BLANK: 15 points
- MATCHING: 20 points
- SORT_ORDER: 20 points
- VISUAL_MCQ: 10 points
- CLOCK_READ: 15 points

### Session Management
- Sessions remain active until explicitly ended
- Players can spin multiple times in one session
- Total points accumulate across all spins
- Session history is tracked for leaderboard
