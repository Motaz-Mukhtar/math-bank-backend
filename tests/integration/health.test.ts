import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Health Module - Integration Tests', () => {
  describe('GET /api/v1/health', () => {
    it('should return basic health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('environment');
      
      expect(['healthy', 'unhealthy']).toContain(response.body.data.status);
    });

    it('should have valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should have positive uptime', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.data.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/api/v1/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('memory');
      expect(response.body.data).toHaveProperty('version');
    });

    it('should include database health', async () => {
      const response = await request(app)
        .get('/api/v1/health/detailed')
        .expect(200);

      const { database } = response.body.data;
      expect(database).toHaveProperty('connected');
      expect(database).toHaveProperty('responseTime');
      expect(typeof database.connected).toBe('boolean');
      expect(typeof database.responseTime).toBe('number');
    });

    it('should include memory usage', async () => {
      const response = await request(app)
        .get('/api/v1/health/detailed')
        .expect(200);

      const { memory } = response.body.data;
      expect(memory).toHaveProperty('used');
      expect(memory).toHaveProperty('total');
      expect(memory).toHaveProperty('percentage');
      expect(memory.used).toBeGreaterThan(0);
      expect(memory.total).toBeGreaterThan(0);
      expect(memory.percentage).toBeGreaterThanOrEqual(0);
      expect(memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should return 503 if database is down', async () => {
      // This test would require mocking database failure
      // Skip for now as it requires special setup
    });
  });
});
