import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getStudentToken, authHeader } from '../helpers/auth.helper';
import { QuizCategory, QuizLevel } from '@prisma/client';

describe('Quiz Module - Integration Tests', () => {
  let studentToken: string;
  let sessionId: string;

  beforeAll(async () => {
    studentToken = await getStudentToken();
  });

  describe('POST /api/v1/quiz/sessions', () => {
    it('should start a new quiz session', async () => {
      const response = await request(app)
        .post('/api/v1/quiz/sessions')
        .set(authHeader(studentToken))
        .send({
          category: QuizCategory.ARITHMETIC,
          level: QuizLevel.EASY,
          questionCount: 5,
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('category', QuizCategory.ARITHMETIC);
      expect(response.body.data).toHaveProperty('level', QuizLevel.EASY);
      expect(response.body.data).toHaveProperty('totalQuestions', 5);
      expect(response.body.data).toHaveProperty('currentQuestionIndex', 0);

      sessionId = response.body.data.id;
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .post('/api/v1/quiz/sessions')
        .set(authHeader(studentToken))
        .send({
          category: 'INVALID_CATEGORY',
          level: QuizLevel.EASY,
          questionCount: 5,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid question count', async () => {
      const response = await request(app)
        .post('/api/v1/quiz/sessions')
        .set(authHeader(studentToken))
        .send({
          category: QuizCategory.ARITHMETIC,
          level: QuizLevel.EASY,
          questionCount: 0,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/v1/quiz/sessions')
        .send({
          category: QuizCategory.ARITHMETIC,
          level: QuizLevel.EASY,
          questionCount: 5,
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/quiz/sessions/:id/next', () => {
    it('should get next question in session', async () => {
      const response = await request(app)
        .get(`/api/v1/quiz/sessions/${sessionId}/next`)
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('question');
      expect(response.body.data.question).toHaveProperty('id');
      expect(response.body.data.question).toHaveProperty('type');
      expect(response.body.data.question).toHaveProperty('questionText');
      expect(response.body.data).toHaveProperty('currentIndex');
      expect(response.body.data).toHaveProperty('totalQuestions');
    });

    it('should reject invalid session id', async () => {
      const response = await request(app)
        .get('/api/v1/quiz/sessions/invalid-id/next')
        .set(authHeader(studentToken))
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/quiz/sessions/:id/answer', () => {
    let questionId: string;

    beforeAll(async () => {
      // Get the current question
      const response = await request(app)
        .get(`/api/v1/quiz/sessions/${sessionId}/next`)
        .set(authHeader(studentToken));
      
      questionId = response.body.data.question.id;
    });

    it('should submit answer to question', async () => {
      const response = await request(app)
        .post(`/api/v1/quiz/sessions/${sessionId}/answer`)
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
    });

    it('should reject missing answer', async () => {
      const response = await request(app)
        .post(`/api/v1/quiz/sessions/${sessionId}/answer`)
        .set(authHeader(studentToken))
        .send({
          questionId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid session id', async () => {
      const response = await request(app)
        .post('/api/v1/quiz/sessions/invalid-id/answer')
        .set(authHeader(studentToken))
        .send({
          questionId,
          answer: 'A',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/quiz/sessions/:id/complete', () => {
    it('should complete quiz session', async () => {
      const response = await request(app)
        .post(`/api/v1/quiz/sessions/${sessionId}/complete`)
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('totalQuestions');
      expect(response.body.data).toHaveProperty('correctAnswers');
      expect(response.body.data).toHaveProperty('totalPoints');
      expect(response.body.data).toHaveProperty('completedAt');
    });

    it('should reject completing already completed session', async () => {
      const response = await request(app)
        .post(`/api/v1/quiz/sessions/${sessionId}/complete`)
        .set(authHeader(studentToken))
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/quiz/sessions/history', () => {
    it('should get user quiz history', async () => {
      const response = await request(app)
        .get('/api/v1/quiz/sessions/history')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      if (response.body.data.length > 0) {
        const session = response.body.data[0];
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('category');
        expect(session).toHaveProperty('level');
        expect(session).toHaveProperty('totalQuestions');
        expect(session).toHaveProperty('correctAnswers');
      }
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/quiz/sessions/history')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
