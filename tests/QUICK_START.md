# Integration Tests - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd math-bank-backend
npm install --save-dev supertest @types/supertest
```

### Step 2: Setup Test Environment

Create a `.env.test` file (or use existing `.env`):

```env
DATABASE_URL="mysql://user:password@localhost:3306/math_bank_test"
JWT_SECRET="your-test-jwt-secret"
JWT_REFRESH_SECRET="your-test-refresh-secret"
NODE_ENV="test"
```

### Step 3: Create Test Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS math_bank_test;"

# Run migrations
npx prisma migrate deploy
```

### Step 4: Seed Test Users

You need to create test users manually or use this SQL:

```sql
-- Insert test users (passwords are hashed for: Admin@123456, Student@123456, Parent@123456)
INSERT INTO User (id, fullName, email, passwordHash, role, isVerified, verifyCode, createdAt, updatedAt) VALUES
('admin-test-uuid', 'Test Admin', 'admin@mathbank.test', '$2b$10$hashed_password_here', 'ADMIN', 1, '000000', NOW(), NOW()),
('student-test-uuid', 'Test Student', 'student@mathbank.test', '$2b$10$hashed_password_here', 'STUDENT', 1, '000000', NOW(), NOW()),
('parent-test-uuid', 'Test Parent', 'parent@mathbank.test', '$2b$10$hashed_password_here', 'PARENT', 1, '000000', NOW(), NOW());
```

**OR** Register users via API and verify them manually in the database.

### Step 5: Run Tests

```bash
# Run all tests
npm test

# Run specific module
npm test -- tests/integration/quiz.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

## 📋 Test Modules

| Module | Test File | Status |
|--------|-----------|--------|
| Health | `health.test.ts` | ✅ Ready |
| Auth | `auth.test.ts` | ✅ Ready |
| Leaderboard | `leaderboard.test.ts` | ✅ Ready |
| Quiz | `quiz.test.ts` | ✅ Ready |
| Wheel | `wheel.test.ts` | ✅ Ready |
| Video | `video.test.ts` | ✅ Ready |
| Admin | `admin.test.ts` | ✅ Ready |
| Parent | `parent.test.ts` | ✅ Ready |
| User | `user.test.ts` | ✅ Ready |

## 🔍 What Gets Tested

### Authentication & Authorization
- ✅ User registration and login
- ✅ Email verification
- ✅ Password reset
- ✅ Role-based access control
- ✅ Token validation

### CRUD Operations
- ✅ Create, Read, Update, Delete
- ✅ Pagination and filtering
- ✅ Search functionality
- ✅ Data validation

### Business Logic
- ✅ Quiz sessions and scoring
- ✅ Wheel game mechanics
- ✅ Leaderboard rankings
- ✅ Parent-child linking
- ✅ Points calculation

### Error Handling
- ✅ 400 Bad Request
- ✅ 401 Unauthorized
- ✅ 403 Forbidden
- ✅ 404 Not Found
- ✅ 409 Conflict
- ✅ 429 Rate Limited

## 📖 API Documentation

Each module has detailed API documentation in `tests/integration/`:

- `API_HEALTH.md` - Health check endpoints
- `API_AUTH.md` - Authentication endpoints
- `API_LEADERBOARD.md` - Leaderboard endpoints
- `API_QUIZ.md` - Quiz endpoints
- `API_WHEEL.md` - Wheel endpoints
- `API_VIDEO.md` - Video endpoints
- `API_ADMIN.md` - Admin endpoints
- `API_PARENT.md` - Parent endpoints
- `API_USER.md` - User endpoints

## 🐛 Troubleshooting

### "User not found" Error

**Problem**: Test users don't exist in database

**Solution**:
```bash
# Option 1: Register via API
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Admin",
    "email": "admin@mathbank.test",
    "password": "Admin@123456",
    "role": "ADMIN"
  }'

# Then verify the user in database
UPDATE User SET isVerified = 1 WHERE email = 'admin@mathbank.test';

# Repeat for student and parent
```

### Database Connection Error

**Problem**: Can't connect to test database

**Solution**:
1. Check MySQL is running: `mysql -u root -p`
2. Verify DATABASE_URL in .env.test
3. Create database: `CREATE DATABASE math_bank_test;`
4. Run migrations: `npx prisma migrate deploy`

### Rate Limiting Failures

**Problem**: Tests fail due to rate limiting

**Solution**:
1. Disable rate limiting in test environment
2. Add delays between requests
3. Use different test data

### Cache Issues

**Problem**: Cached data causing test failures

**Solution**:
```typescript
// Clear cache before tests
beforeAll(async () => {
  cacheService.flush();
});
```

## 📊 Expected Results

When all tests pass, you should see:

```
✓ tests/integration/health.test.ts (7 tests)
✓ tests/integration/auth.test.ts (15 tests)
✓ tests/integration/leaderboard.test.ts (10 tests)
✓ tests/integration/quiz.test.ts (10 tests)
✓ tests/integration/wheel.test.ts (8 tests)
✓ tests/integration/video.test.ts (12 tests)
✓ tests/integration/admin.test.ts (15 tests)
✓ tests/integration/parent.test.ts (8 tests)
✓ tests/integration/user.test.ts (10 tests)

Test Files  9 passed (9)
Tests  95 passed (95)
Duration  5.23s
```

## 🎯 Next Steps

1. **Run tests locally** to ensure everything works
2. **Review API documentation** for endpoint details
3. **Integrate into CI/CD** pipeline
4. **Monitor test results** in production deployments

## 💡 Tips

- Run tests before pushing code
- Keep test data separate from production
- Use descriptive test names
- Test both success and failure cases
- Update tests when adding new features
- Review API docs when integrating frontend

## 📚 Additional Resources

- Full documentation: `tests/integration/README.md`
- Complete summary: `tests/INTEGRATION_TESTS_COMPLETE.md`
- Test helpers: `tests/helpers/auth.helper.ts`
- Setup file: `tests/setup.ts`

---

**Need Help?** Check the full README or API documentation files for detailed information.
