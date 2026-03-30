import { Router } from 'express';
import { ParentController } from './parent.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { linkChildSchema } from './parent.schema';
import { Role } from '@prisma/client';

const router = Router();
const controller = new ParentController();

// All parent routes require PARENT authentication
router.use(authMiddleware);
router.use(requireRole(Role.PARENT));

// Link child to parent account
router.post('/link', validate(linkChildSchema), controller.linkChild);

// Get all linked children
router.get('/children', controller.getChildren);

// Get child's progress
router.get('/children/:id/progress', controller.getChildProgress);

export default router;
