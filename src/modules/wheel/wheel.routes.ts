import { Router } from 'express';
import { WheelController } from './wheel.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { spinSchema, submitAnswerSchema } from './wheel.schema';
import { Role } from '@prisma/client';

const router = Router();
const controller = new WheelController();

// All wheel routes require STUDENT authentication
router.use(authMiddleware);
router.use(requireRole(Role.STUDENT));

// Start new wheel session
router.post('/sessions', controller.startSession);

// Spin wheel and get question
router.post('/sessions/:id/spin', validate(spinSchema), controller.spin);

// Submit answer
router.post('/sessions/:id/answer', validate(submitAnswerSchema), controller.submitAnswer);

export default router;
