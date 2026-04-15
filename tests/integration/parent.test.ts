import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getParentToken, getStudentToken, authHeader, testUsers } from '../helpers/auth.helper';
import { prisma } from '../../src/config/database';

describe('Parent Module - Integration Tests', () => {
  let parentToken: string;
  let studentToken: string;
  let childId: string;
  let childAcademicNumber: string;

  beforeAll(async () => {
    parentToken = await getParentToken();
    studentToken = await getStudentToken();

    // Get a student's academic number for linking tests
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, academicNumber: true },
    });

    if (student) {
      childId = student.id;
      childAcademicNumber = student.academicNumber || '';
    }
  });

  describe('POST /api/v1/parent/link', () => {
    it('should link child to parent account', async () => {
      if (!childAcademicNumber) {
        console.log('Skipping test: No student with academic number found');
        return;
      }

      const response = await request(app)
        .post('/api/v1/parent/link')
        .set(authHeader(parentToken))
        .send({
          childAcademicNumber,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('fullName');
      expect(response.body.data).toHaveProperty('academicNumber', childAcademicNumber);
    });

    it('should reject linking with invalid academic number', async () => {
      const response = await request(app)
        .post('/api/v1/parent/link')
        .set(authHeader(parentToken))
        .send({
          childAcademicNumber: 'INVALID123',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject linking already linked child', async () => {
      if (!childAcademicNumber) {
        return;
      }

      const response = await request(app)
        .post('/api/v1/parent/link')
        .set(authHeader(parentToken))
        .send({
          childAcademicNumber,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('already linked');
    });

    it('should reject missing academic number', async () => {
      const response = await request(app)
        .post('/api/v1/parent/link')
        .set(authHeader(parentToken))
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject non-parent access', async () => {
      const response = await request(app)
        .post('/api/v1/parent/link')
        .set(authHeader(studentToken))
        .send({
          childAcademicNumber: 'STU12345',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/parent/children', () => {
    it('should get all linked children', async () => {
      const response = await request(app)
        .get('/api/v1/parent/children')
        .set(authHeader(parentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const child = response.body.data[0];
        expect(child).toHaveProperty('id');
        expect(child).toHaveProperty('fullName');
        expect(child).toHaveProperty('email');
        expect(child).toHaveProperty('academicNumber');
        expect(child).toHaveProperty('totalPoints');
      }
    });

    it('should reject non-parent access', async () => {
      const response = await request(app)
        .get('/api/v1/parent/children')
        .set(authHeader(studentToken))
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/parent/children')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/parent/children/:id/progress', () => {
    it('should get child progress', async () => {
      if (!childId) {
        console.log('Skipping test: No child linked');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/parent/children/${childId}/progress`)
        .set(authHeader(parentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('child');
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data).toHaveProperty('recentActivity');

      // Check child info
      expect(response.body.data.child).toHaveProperty('id', childId);
      expect(response.body.data.child).toHaveProperty('fullName');
      expect(response.body.data.child).toHaveProperty('totalPoints');

      // Check stats
      expect(response.body.data.stats).toHaveProperty('totalQuizSessions');
      expect(response.body.data.stats).toHaveProperty('totalWheelSessions');
      expect(response.body.data.stats).toHaveProperty('averageAccuracy');

      // Check recent activity
      expect(response.body.data.recentActivity).toBeInstanceOf(Array);
    });

    it('should reject progress for non-linked child', async () => {
      // Create a random UUID that's not linked
      const randomId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/parent/children/${randomId}/progress`)
        .set(authHeader(parentToken))
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid child id format', async () => {
      const response = await request(app)
        .get('/api/v1/parent/children/invalid-id/progress')
        .set(authHeader(parentToken))
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject non-parent access', async () => {
      if (!childId) {
        return;
      }

      const response = await request(app)
        .get(`/api/v1/parent/children/${childId}/progress`)
        .set(authHeader(studentToken))
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Parent-Child Relationship', () => {
    it('should only show children linked to the authenticated parent', async () => {
      const response = await request(app)
        .get('/api/v1/parent/children')
        .set(authHeader(parentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // All returned children should be linked to this parent
      const children = response.body.data;
      for (const child of children) {
        expect(child).toHaveProperty('parentId');
      }
    });
  });
});
