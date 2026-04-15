import { Router } from 'express';
import { VideoController } from './video.controller';
import { VideoProgressController } from './videoProgress.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createVideoSchema,
  updateVideoSchema,
  moveVideoSchema,
} from './video.schema';
import { updateProgressSchema } from './videoProgress.schema';
import { Role } from '@prisma/client';

const router = Router();
const controller = new VideoController();
const progressController = new VideoProgressController();

// Video Progress routes (must come before /:id routes)
router.get('/progress/all', authMiddleware, progressController.getAllProgress);
router.get('/progress/stats', authMiddleware, progressController.getStats);
router.get('/progress/recent', authMiddleware, progressController.getRecentlyWatched);

// Public routes (require authentication)
router.get('/', authMiddleware, controller.getAll);

// Video Progress for specific video (must come before generic /:id route)
router.get('/:id/progress', authMiddleware, progressController.getProgress);
router.post(
  '/:id/progress',
  authMiddleware,
  requireRole(Role.STUDENT),
  validate(updateProgressSchema),
  progressController.updateProgress
);

// Get single video (must come after specific routes)
router.get('/:id', authMiddleware, controller.getById);

// Admin-only routes
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(createVideoSchema),
  controller.create
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(updateVideoSchema),
  controller.update
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  controller.delete
);

router.patch(
  '/:id/move',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(moveVideoSchema),
  controller.move
);

export default router;
