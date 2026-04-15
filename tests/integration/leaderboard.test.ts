import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getStudentToken, authHeader } from '../helpers/auth.helper';

describe('Leaderboard Module - Integration Tests', () => {
  let studentToken: string;

  beforeAll(async () => {
    try {
      studentToken = await getStudentToken();
    } catch (error) {
      console.warn('⚠️  Student user not found. Some tests may fail.');
    }
  });

  describe('GET /api/v1/leaderboard', () => {
    it('should get top leaderboard entries', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('entries');
      expect(Array.isArray(response.body.data.entries)).toBe(true);
      
      if (response.body.data.entries.length > 0) {
        const entry = response.body.data.entries[0];
        expect(entry).toHaveProperty('rank');
        expect(entry).toHaveProperty('userId');
        expect(entry).toHaveProperty('fullName');
        expect(entry).toHaveProperty('points');
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard?limit=5')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body.data.entries.length).toBeLessThanOrEqual(5);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/leaderboard/full', () => {
    it('should get paginated leaderboard', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/full?page=1&limit=10')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('entries');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 10);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
    });

    it('should support weekly period', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/full?period=weekly')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('entries');
    });

    it('should handle page navigation', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/full?page=2&limit=5')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body.data.pagination.page).toBe(2);
    });
  });

  describe('GET /api/v1/leaderboard/me', () => {
    it('should get current user rank and stats', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/me')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('rank');
      expect(response.body.data).toHaveProperty('points');
      expect(response.body.data).toHaveProperty('weeklyRank');
      expect(response.body.data).toHaveProperty('weeklyTotal');
      expect(response.body.data).toHaveProperty('categoryBreakdown');
      expect(response.body.data).toHaveProperty('pointsHistory');
      expect(Array.isArray(response.body.data.categoryBreakdown)).toBe(true);
      expect(Array.isArray(response.body.data.pointsHistory)).toBe(true);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/leaderboard/badges', () => {
    it('should get user badges', async () => {
      const response = await request(app)
        .get('/api/v1/leaderboard/badges')
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('badges');
      expect(Array.isArray(response.body.data.badges)).toBe(true);
      
      if (response.body.data.badges.length > 0) {
        const badge = response.body.data.badges[0];
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
        expect(badge).toHaveProperty('icon');
        expect(badge).toHaveProperty('earned');
      }
    });
  });

  describe('Caching', () => {
    it('should cache leaderboard responses', async () => {
      // First request
      const start1 = Date.now();
      await request(app)
        .get('/api/v1/leaderboard')
        .set(authHeader(studentToken))
        .expect(200);
      const time1 = Date.now() - start1;

      // Second request (should be cached)
      const start2 = Date.now();
      await request(app)
        .get('/api/v1/leaderboard')
        .set(authHeader(studentToken))
        .expect(200);
      const time2 = Date.now() - start2;

      // Cached request should be faster
      expect(time2).toBeLessThan(time1);
    });
  });
});
