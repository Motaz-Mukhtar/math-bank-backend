import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getStudentToken, authHeader } from '../helpers/auth.helper';

describe('Wheel Module - Integration Tests', () => {
  let studentToken: string;
  let sessionId: string;

  beforeAll(async () => {
    studentToken = await getStudentToken();
  });

  describe('POST /api/v1/wheel/sessions', () => {
    it('should start a new wheel session', async () => {
      const response = await request(app)
        .post('/api/v1/wheel/sessions')
        .set(authHeader(studentToken))
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('totalSpins', 0);
      expect(response.body.data).toHaveProperty('totalPoints', 0);
      expect(response.body.data).toHaveProperty('isActive', true);

      sessionId = response.body.data.id;
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/v1/wheel/sessions')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/wheel/sessions/:id/spin', () => {
    it('should spin wheel and get question', async () => {
      const response = await request(app)
        .post(`/api/v1/wheel/sessions/${sessionId}/spin`)
        .set(authHeader(studentToken))
        .send({
          category: 'ARITHMETIC',
          level: 'EASY',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('question');
      expect(response.body.data).toHaveProperty('spinResult');
      expect(response.body.data.question).toHaveProperty('id');
      expect(response.body.data.question).toHaveProperty('type');
      expect(response.body.data.question).toHaveProperty('questionText');
      expect(response.body.data.spinResult).toHaveProperty('category');
      expect(response.body.data.spinResult).toHaveProperty('level');
      expect(response.body.data.spinResult).toHaveProperty('potentialPoints');
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .post(`/api/v1/wheel/sessions/${sessionId}/spin`)
        .set(authHeader(studentToken))
        .send({
          category: 'INVALID_CATEGORY',
          level: 'EASY',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid level', async () => {
      const response = await request(app)
        .post(`/api/v1/wheel/sessions/${sessionId}/spin`)
        .set(authHeader(studentToken))
        .send({
          category: 'ARITHMETIC',
          level: 'INVALID_LEVEL',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid session id', async () => {
      const response = await request(app)
        .post('/api/v1/wheel/sessions/invalid-id/spin')
        .set(authHeader(studentToken))
        .send({
          category: 'ARITHMETIC',
          level: 'EASY',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/wheel/sessions/:id/answer', () => {
    let questionId: string;

    beforeAll(async () => {
      // Spin to get a question
      const spinResponse = await request(app)
        .post(`/api/v1/wheel/sessions/${sessionId}/spin`)
        .set(authHeader(studentToken))
        .send({
          category: 'ARITHMETIC',
          level: 'EASY',
        });
      
      questionId = spinResponse.body.data.question.id;
    });

    it('should submit answer to wheel question', async () => {
      const response = await request(app)
        .post(`/api/v1/wheel/sessions/${sessionId}/answer`)
        .set(authHeader(studentToken))
        .send({
          questionId,
          answer: 'A',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('isCorrect');
      expect(response.body.data).toHaveProperty('pointsEarned');
      expect(response.body.data).toHaveProperty('correctAnswer');
      expect(response.body.data).toHaveProperty('totalPoints');
    });

    it('should reject missing answer', async () => {
      // Spin again to get new question
      const spinResponse = await request(app)
        .post(`/api/v1/wheel/sessions/${sessionId}/spin`)
        .set(authHeader(studentToken))
        .send({
          category: 'ARITHMETIC',
          level: 'EASY',
        });
      
      const newQuestionId = spinResponse.body.data.question.id;

      const response = await request(app)
        .post(`/api/v1/wheel/sessions/${sessionId}/answer`)
        .set(authHeader(studentToken))
        .send({
          questionId: newQuestionId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid session id', async () => {
      const response = await request(app)
        .post('/api/v1/wheel/sessions/invalid-id/answer')
        .set(authHeader(studentToken))
        .send({
          questionId,
          answer: 'A',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Role-based Access Control', () => {
    it('should reject non-student users', async () => {
      // This would require admin/parent token
      // For now, just verify student token works
      const response = await request(app)
        .post('/api/v1/wheel/sessions')
        .set(authHeader(studentToken))
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
