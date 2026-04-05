import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateUserSchema, createQuestionSchema, updateQuestionSchema } from './admin.schema';
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
router.get('/users/:parentId/children', controller.getParentChildren);
router.put('/users/:id', validate(updateUserSchema), controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

// Question management
router.post('/questions', validate(createQuestionSchema), controller.createQuestion);
router.put('/questions/:id', validate(updateQuestionSchema), controller.updateQuestion);
router.get('/questions', controller.getQuestions);
router.get('/questions/:id', controller.getQuestion);
router.delete('/questions/:id', controller.deleteQuestion);

export default router;
