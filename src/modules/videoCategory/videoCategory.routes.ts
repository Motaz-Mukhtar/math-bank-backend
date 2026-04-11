import { Router } from 'express';
import { VideoCategoryController } from './videoCategory.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createVideoCategorySchema,
  updateVideoCategorySchema,
} from './videoCategory.schema';
import { Role } from '@prisma/client';

const router = Router();
const controller = new VideoCategoryController();

// Public routes (require authentication)
router.get('/', authMiddleware, controller.getAll);
router.get('/videos', authMiddleware, controller.getVideosWithCategories);
router.get('/list/all', authMiddleware, controller.getAllNoPagination);
router.get('/:id', authMiddleware, controller.getById);

// Admin-only routes
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(createVideoCategorySchema),
  controller.create
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(updateVideoCategorySchema),
  controller.update
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(Role.ADMIN),
  controller.delete
);

export default router;
