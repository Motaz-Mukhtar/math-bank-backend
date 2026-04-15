import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Auth Module - Integration Tests', () => {
  const testEmail = `test-${Date.now()}@mathbank.test`;
  const testPassword = 'Test@123456';
  let verifyCode: string;
  let userId: string;

  describe('POST /api/v1/auth/register', () => {
    it('should register a new student user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test Student',
          email: testEmail,
          password: testPassword,
          role: 'STUDENT',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', testEmail);
      expect(response.body.data).toHaveProperty('role', 'STUDENT');
      expect(response.body.data).toHaveProperty('isVerified', false);
      expect(response.body.data).not.toHaveProperty('passwordHash');

      userId = response.body.data.id;

      // Get verify code from database for testing
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { verifyCode: true },
      });
      verifyCode = user?.verifyCode || '';
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test Student 2',
          email: testEmail,
          password: testPassword,
          role: 'STUDENT',
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test Student',
          email: 'invalid-email',
          password: testPassword,
          role: 'STUDENT',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test Student',
          email: `test2-${Date.now()}@mathbank.test`,
          password: '123',
          role: 'STUDENT',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('should verify email with correct code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({
          email: testEmail,
          code: verifyCode,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('isVerified', true);
    });

    it('should reject incorrect verification code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({
          email: testEmail,
          code: '000000',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject already verified email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({
          email: testEmail,
          code: verifyCode,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user).toHaveProperty('email', testEmail);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@mathbank.test',
          password: testPassword,
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/auth/resend-verification', () => {
    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({
          email: 'nonexistent@mathbank.test',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return success for existing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({
          email: testEmail,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'nonexistent@mathbank.test',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      const token = loginResponse.body.data.accessToken;

      // Then logout
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit on auth endpoints', async () => {
      // Make 6 requests (limit is 5 per minute)
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@test.com',
            password: 'password',
          })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      expect(rateLimited).toBe(true);
    });
  });
});
