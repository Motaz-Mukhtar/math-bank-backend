import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getAdminToken, getStudentToken, authHeader } from '../helpers/auth.helper';
import { QuestionType, QuizCategory, QuizLevel } from '@prisma/client';

describe('Admin Module - Integration Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let questionId: string;
  let userId: string;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    studentToken = await getStudentToken();
  });

  describe('GET /api/v1/admin/dashboard/stats', () => {
    it('should get dashboard statistics as admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalStudents');
      expect(response.body.data).toHaveProperty('totalParents');
      expect(response.body.data).toHaveProperty('totalQuestions');
      expect(response.body.data).toHaveProperty('totalVideos');
      expect(response.body.data).toHaveProperty('totalQuizSessions');
    });

    it('should reject non-admin access', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set(authHeader(studentToken))
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/admin/dashboard/link-stats', () => {
    it('should get parent-child link statistics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/link-stats')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('totalParents');
      expect(response.body.data).toHaveProperty('parentsWithChildren');
      expect(response.body.data).toHaveProperty('totalLinkedChildren');
      expect(response.body.data).toHaveProperty('averageChildrenPerParent');
    });
  });

  describe('GET /api/v1/admin/dashboard/registration-chart', () => {
    it('should get registration chart data', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/registration-chart')
        .set(authHeader(adminToken))
        .query({ days: 7 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      if (response.body.data.length > 0) {
        const dataPoint = response.body.data[0];
        expect(dataPoint).toHaveProperty('date');
        expect(dataPoint).toHaveProperty('count');
      }
    });
  });

  describe('GET /api/v1/admin/dashboard/top-students', () => {
    it('should get top students by points', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/top-students')
        .set(authHeader(adminToken))
        .query({ limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      if (response.body.data.length > 0) {
        const student = response.body.data[0];
        expect(student).toHaveProperty('id');
        expect(student).toHaveProperty('fullName');
        expect(student).toHaveProperty('totalPoints');
      }
    });
  });

  describe('GET /api/v1/admin/dashboard/points-distribution', () => {
    it('should get points distribution data', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/points-distribution')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should get paginated users list', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set(authHeader(adminToken))
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.users).toBeInstanceOf(Array);
      
      if (response.body.data.users.length > 0) {
        userId = response.body.data.users[0].id;
      }
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set(authHeader(adminToken))
        .query({ role: 'STUDENT', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('users');
    });

    it('should search users by name or email', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set(authHeader(adminToken))
        .query({ search: 'test', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('users');
    });
  });

  describe('GET /api/v1/admin/users/export', () => {
    it('should export users data', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users/export')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('PUT /api/v1/admin/users/:id', () => {
    it('should update user as admin', async () => {
      if (!userId) {
        // Skip if no user found
        return;
      }

      const response = await request(app)
        .put(`/api/v1/admin/users/${userId}`)
        .set(authHeader(adminToken))
        .send({
          fullName: 'Updated Name',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('fullName', 'Updated Name');
    });

    it('should reject update by non-admin', async () => {
      if (!userId) {
        return;
      }

      const response = await request(app)
        .put(`/api/v1/admin/users/${userId}`)
        .set(authHeader(studentToken))
        .send({
          fullName: 'Hacked Name',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/admin/questions', () => {
    it('should create a new question as admin', async () => {
      const response = await request(app)
        .post('/api/v1/admin/questions')
        .set(authHeader(adminToken))
        .send({
          type: QuestionType.MCQ,
          category: QuizCategory.ARITHMETIC,
          level: QuizLevel.EASY,
          questionText: 'What is 2 + 2?',
          correctAnswer: 'C',
          params: {
            options: ['2', '3', '4', '5'],
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('questionText', 'What is 2 + 2?');
      expect(response.body.data).toHaveProperty('type', QuestionType.MCQ);

      questionId = response.body.data.id;
    });

    it('should reject question creation by non-admin', async () => {
      const response = await request(app)
        .post('/api/v1/admin/questions')
        .set(authHeader(studentToken))
        .send({
          type: QuestionType.MCQ,
          category: QuizCategory.ARITHMETIC,
          level: QuizLevel.EASY,
          questionText: 'Test question',
          correctAnswer: 'A',
          params: { options: ['1', '2', '3', '4'] },
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/admin/questions', () => {
    it('should get paginated questions list', async () => {
      const response = await request(app)
        .get('/api/v1/admin/questions')
        .set(authHeader(adminToken))
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('questions');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter questions by category', async () => {
      const response = await request(app)
        .get('/api/v1/admin/questions')
        .set(authHeader(adminToken))
        .query({ category: QuizCategory.ARITHMETIC, page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/v1/admin/questions/:id', () => {
    it('should get question by id', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/questions/${questionId}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', questionId);
    });
  });

  describe('PUT /api/v1/admin/questions/:id', () => {
    it('should update question as admin', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/questions/${questionId}`)
        .set(authHeader(adminToken))
        .send({
          questionText: 'Updated: What is 2 + 2?',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('questionText', 'Updated: What is 2 + 2?');
    });
  });

  describe('DELETE /api/v1/admin/questions/:id', () => {
    it('should delete question as admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/questions/${questionId}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject deleting non-existent question', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/questions/${questionId}`)
        .set(authHeader(adminToken))
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
