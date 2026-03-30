import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateUserSchema } from './admin.schema';
import { Role } from '@prisma/client';

const router = Router();
const controller = new AdminController();

// All admin routes require ADMIN authentication
router.use(authMiddleware);
router.use(requireRole(Role.ADMIN));

// Dashboard statistics
router.get('/dashboard/stats', controller.getDashboardStats);
router.get('/dashboard/link-stats', controller.getLinkStats);
router.get('/dashboard/registration-chart', controller.getRegistrationChart);
router.get('/dashboard/top-students', controller.getTopStudents);
router.get('/dashboard/points-distribution', controller.getPointsDistribution);

// User management
router.get('/users', controller.getUsers);
router.get('/users/export', controller.exportUsers);
router.put('/users/:id', validate(updateUserSchema), controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

export default router;
