import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getAdminToken, getStudentToken, authHeader } from '../helpers/auth.helper';

describe('Video Module - Integration Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let videoId: string;
  let categoryId: string;

  beforeAll(async () => {
    adminToken = await getAdminToken();
    studentToken = await getStudentToken();
  });

  describe('POST /api/v1/videos (Admin Only)', () => {
    it('should create a new video as admin', async () => {
      const response = await request(app)
        .post('/api/v1/videos')
        .set(authHeader(adminToken))
        .send({
          title: 'Test Video',
          description: 'Test video description',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          categoryId: null,
          order: 1,
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', 'Test Video');
      expect(response.body.data).toHaveProperty('youtubeUrl');
      expect(response.body.data).toHaveProperty('order', 1);

      videoId = response.body.data.id;
    });

    it('should reject video creation by student', async () => {
      const response = await request(app)
        .post('/api/v1/videos')
        .set(authHeader(studentToken))
        .send({
          title: 'Test Video 2',
          description: 'Test description',
          youtubeUrl: 'https://www.youtube.com/watch?v=test',
          order: 1,
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid YouTube URL', async () => {
      const response = await request(app)
        .post('/api/v1/videos')
        .set(authHeader(adminToken))
        .send({
          title: 'Test Video',
          description: 'Test description',
          youtubeUrl: 'not-a-valid-url',
          order: 1,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/videos')
        .set(authHeader(adminToken))
        .send({
          title: 'Test Video',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/videos', () => {
    it('should get all videos with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/videos')
        .set(authHeader(studentToken))
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('videos');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.videos).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 10);
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should filter videos by category', async () => {
      const response = await request(app)
        .get('/api/v1/videos')
        .set(authHeader(studentToken))
        .query({ categoryId: 'some-category-id', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('videos');
    });

    it('should search videos by title', async () => {
      const response = await request(app)
        .get('/api/v1/videos')
        .set(authHeader(studentToken))
        .query({ search: 'Test', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('videos');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/videos')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/videos/:id', () => {
    it('should get video by id', async () => {
      const response = await request(app)
        .get(`/api/v1/videos/${videoId}`)
        .set(authHeader(studentToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', videoId);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('youtubeUrl');
    });

    it('should reject invalid video id', async () => {
      const response = await request(app)
        .get('/api/v1/videos/invalid-id')
        .set(authHeader(studentToken))
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/v1/videos/:id (Admin Only)', () => {
    it('should update video as admin', async () => {
      const response = await request(app)
        .put(`/api/v1/videos/${videoId}`)
        .set(authHeader(adminToken))
        .send({
          title: 'Updated Test Video',
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('title', 'Updated Test Video');
      expect(response.body.data).toHaveProperty('description', 'Updated description');
    });

    it('should reject update by student', async () => {
      const response = await request(app)
        .put(`/api/v1/videos/${videoId}`)
        .set(authHeader(studentToken))
        .send({
          title: 'Hacked Video',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/v1/videos/:id/move (Admin Only)', () => {
    it('should move video to different position', async () => {
      const response = await request(app)
        .patch(`/api/v1/videos/${videoId}/move`)
        .set(authHeader(adminToken))
        .send({
          newOrder: 5,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('order', 5);
    });

    it('should reject move by student', async () => {
      const response = await request(app)
        .patch(`/api/v1/videos/${videoId}/move`)
        .set(authHeader(studentToken))
        .send({
          newOrder: 10,
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/v1/videos/:id (Admin Only)', () => {
    it('should reject delete by student', async () => {
      const response = await request(app)
        .delete(`/api/v1/videos/${videoId}`)
        .set(authHeader(studentToken))
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should delete video as admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/videos/${videoId}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject deleting non-existent video', async () => {
      const response = await request(app)
        .delete(`/api/v1/videos/${videoId}`)
        .set(authHeader(adminToken))
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
