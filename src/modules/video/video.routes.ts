import { Router } from 'express';
import { VideoController } from './video.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createVideoSchema,
  updateVideoSchema,
  moveVideoSchema,
} from './video.schema';
import { Role } from '@prisma/client';

const router = Router();
const controller = new VideoController();

// Public routes (require authentication)
router.get('/', authMiddleware, controller.getAll);
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
