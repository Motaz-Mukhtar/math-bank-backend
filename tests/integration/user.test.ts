import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getStudentToken, getParentToken, authHeader } from '../helpers/auth.helper';

describe('User Module - Integration Tests', () => {
  let studentToken: string;
  let parentToken: string;

  beforeAll(async () => {
    studentToken = await getStudentToken();
    parentToken = await getParentToken();
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user profile as student', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('fullName');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role', 'STUDENT');
      expect(response.body.data).toHaveProperty('isVerified');
      expect(response.body.data).toHaveProperty('totalPoints');
      expect(response.body.data).not.toHaveProperty('passwordHash');
      expect(response.body.data).not.toHaveProperty('verifyCode');
    });

    it('should get current user profile as parent', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set(authHeader(parentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('role', 'PARENT');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/v1/users/me', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          fullName: 'Updated Student Name',
          phone: '+966501234567',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('fullName', 'Updated Student Name');
      expect(response.body.data).toHaveProperty('phone', '+966501234567');
    });

    it('should update only provided fields', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          fullName: 'Another Update',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('fullName', 'Another Update');
      // Phone should remain from previous update
      expect(response.body.data).toHaveProperty('phone');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid phone format', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          phone: '123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject duplicate email', async () => {
      // Try to update to an email that already exists
      const response = await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          email: 'parent@mathbank.test', // Parent's email
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('already exists');
    });

    it('should not allow updating role', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          role: 'ADMIN',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not allow updating totalPoints', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          totalPoints: 99999,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .send({
          fullName: 'Hacker Name',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject empty update', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Profile Data Integrity', () => {
    it('should maintain data consistency after multiple updates', async () => {
      // First update
      await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          fullName: 'Consistency Test',
        })
        .expect(200);

      // Second update
      await request(app)
        .put('/api/v1/users/me')
        .set(authHeader(studentToken))
        .send({
          phone: '+966509876543',
        })
        .expect(200);

      // Verify both updates persisted
      const response = await request(app)
        .get('/api/v1/users/me')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body.data).toHaveProperty('fullName', 'Consistency Test');
      expect(response.body.data).toHaveProperty('phone', '+966509876543');
    });

    it('should not expose sensitive fields', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set(authHeader(studentToken))
        .expect(200);

      // Sensitive fields should not be exposed
      expect(response.body.data).not.toHaveProperty('passwordHash');
      expect(response.body.data).not.toHaveProperty('verifyCode');
      expect(response.body.data).not.toHaveProperty('resetToken');
      expect(response.body.data).not.toHaveProperty('resetTokenExpiry');
    });
  });

  describe('Role-specific Fields', () => {
    it('should include academicNumber for students', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body.data).toHaveProperty('role', 'STUDENT');
      // Academic number may or may not be set
      expect(response.body.data).toHaveProperty('academicNumber');
    });

    it('should not include academicNumber for parents', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set(authHeader(parentToken))
        .expect(200);

      expect(response.body.data).toHaveProperty('role', 'PARENT');
      // Parents don't have academic numbers
      expect(response.body.data.academicNumber).toBeNull();
    });
  });
});
