# Integration Tests - Math Bank Backend

## Overview

Comprehensive integration tests for all API modules to ensure endpoint readiness before deployment to production or preview environments.

## Test Structure

```
tests/
├── setup.ts                      # Test environment setup
├── helpers/
│   └── auth.helper.ts           # Authentication helpers
└── integration/
    ├── README.md                # This file
    ├── health.test.ts           # Health module tests
    ├── auth.test.ts             # Auth module tests
    ├── leaderboard.test.ts      # Leaderboard module tests
    ├── quiz.test.ts             # Quiz module tests
    ├── wheel.test.ts            # Wheel module tests
    ├── video.test.ts            # Video module tests
    ├── admin.test.ts            # Admin module tests
    ├── parent.test.ts           # Parent module tests
    ├── user.test.ts             # User module tests
    ├── API_HEALTH.md            # Health API documentation
    ├── API_AUTH.md              # Auth API documentation
    ├── API_LEADERBOARD.md       # Leaderboard API documentation
    ├── API_QUIZ.md              # Quiz API documentation
    ├── API_WHEEL.md             # Wheel API documentation
    ├── API_VIDEO.md             # Video API documentation
    ├── API_ADMIN.md             # Admin API documentation
    ├── API_PARENT.md            # Parent API documentation
    └── API_USER.md              # User API documentation
```

## Prerequisites

### 1. Install Dependencies

```bash
cd math-bank-backend
npm install --save-dev supertest @types/supertest
```

### 2. Setup Test Database

Create a test database or use a separate environment:

```bash
# Copy .env to .env.test
cp .env .env.test

# Update DATABASE_URL in .env.test to point to test database
# DATABASE_URL="mysql://user:password@localhost:3306/math_bank_test"
```

### 3. Create Test Users

Before running tests, create test users in your database:

```sql
-- Run these SQL commands or use the seed script
-- Admin user: admin@mathbank.test / Admin@123456
-- Student user: student@mathbank.test / Student@123456
-- Parent user: parent@mathbank.test / Parent@123456
```

Or use the provided seed script:

```bash
npm run seed:test
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Module

```bash
# Health module
npm test -- tests/integration/health.test.ts

# Auth module
npm test -- tests/integration/auth.test.ts

# Leaderboard module
npm test -- tests/integration/leaderboard.test.ts
```

### Run in Watch Mode

```bash
npm run test:watch
```

### Run with UI

```bash
npm run test:ui
```

### Run Only Integration Tests

```bash
npm test -- tests/integration
```

## Test Coverage

### Modules Tested

- [x] Health - Server and database health checks
- [x] Auth - Registration, login, verification, password reset
- [x] Leaderboard - Rankings, user stats, badges
- [x] Quiz - Quiz sessions, questions, answers
- [x] Wheel - Wheel spins, questions, answers
- [x] Video - Video management, categories
- [x] Admin - User management, content management, analytics
- [x] Parent - Child management, progress tracking
- [x] User - Profile management, points

### Test Types

1. **Happy Path Tests**: Valid requests with expected responses
2. **Validation Tests**: Invalid inputs and error handling
3. **Authentication Tests**: Protected routes and authorization
4. **Rate Limiting Tests**: Rate limit enforcement
5. **Caching Tests**: Cache behavior verification
6. **Error Handling Tests**: Error responses and status codes

## Test Helpers

### Authentication Helper

```typescript
import { getAdminToken, getStudentToken, authHeader } from '../helpers/auth.helper';

// Get tokens
const adminToken = await getAdminToken();
const studentToken = await getStudentToken();

// Use in requests
const response = await request(app)
  .get('/api/v1/protected-route')
  .set(authHeader(studentToken));
```

### Test Users

```typescript
import { testUsers } from '../helpers/auth.helper';

// Available test users
testUsers.admin    // Admin user credentials
testUsers.student  // Student user credentials
testUsers.parent   // Parent user credentials
```

## Writing New Tests

### Template

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getStudentToken, authHeader } from '../helpers/auth.helper';

describe('Module Name - Integration Tests', () => {
  let studentToken: string;

  beforeAll(async () => {
    studentToken = await getStudentToken();
  });

  describe('GET /api/v1/endpoint', () => {
    it('should return expected data', async () => {
      const response = await request(app)
        .get('/api/v1/endpoint')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/endpoint')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
```

### Best Practices

1. **Use descriptive test names**: Clearly state what is being tested
2. **Test both success and failure cases**: Happy path and error scenarios
3. **Clean up test data**: Remove or reset data after tests
4. **Use beforeAll/afterAll**: Setup and teardown for test suites
5. **Mock external services**: Don't send real emails or make external API calls
6. **Test authentication**: Verify protected routes require auth
7. **Test authorization**: Verify role-based access control
8. **Test validation**: Verify input validation works
9. **Test edge cases**: Empty arrays, null values, boundary conditions
10. **Keep tests independent**: Each test should work in isolation

## API Documentation

Each module has a corresponding API documentation file:

- `API_HEALTH.md` - Health check endpoints
- `API_AUTH.md` - Authentication endpoints
- `API_LEADERBOARD.md` - Leaderboard endpoints
- `API_QUIZ.md` - Quiz endpoints
- `API_WHEEL.md` - Wheel endpoints
- `API_VIDEO.md` - Video endpoints
- `API_ADMIN.md` - Admin endpoints
- `API_PARENT.md` - Parent endpoints
- `API_USER.md` - User endpoints

These files contain:
- Endpoint descriptions
- Request/response examples
- Authentication requirements
- Validation rules
- Error codes
- cURL examples

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: math_bank_test
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: mysql://root:password@localhost:3306/math_bank_test
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: mysql://root:password@localhost:3306/math_bank_test
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret
```

## Troubleshooting

### Tests Failing with "User not found"

Create test users in your database:

```bash
npm run seed:test
```

Or manually create users with the credentials in `tests/helpers/auth.helper.ts`.

### Database Connection Errors

1. Check DATABASE_URL in .env
2. Ensure MySQL is running
3. Verify database exists
4. Run migrations: `npx prisma migrate deploy`

### Rate Limiting Issues

If tests fail due to rate limiting:

1. Increase rate limit in test environment
2. Add delays between requests
3. Use different IPs or disable rate limiting for tests

### Cache Issues

If cache is causing test failures:

1. Clear cache before tests: `cacheService.flush()`
2. Use unique test data
3. Disable cache in test environment

## Performance Benchmarks

Expected response times:

| Endpoint | Expected Time | Cached Time |
|----------|---------------|-------------|
| Health | < 50ms | N/A |
| Auth Login | < 200ms | N/A |
| Leaderboard | < 100ms | < 10ms |
| Quiz Start | < 150ms | N/A |
| Video List | < 100ms | < 10ms |

## Contributing

When adding new endpoints:

1. Write integration tests
2. Create/update API documentation
3. Add to this README
4. Ensure all tests pass
5. Update CI/CD if needed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
