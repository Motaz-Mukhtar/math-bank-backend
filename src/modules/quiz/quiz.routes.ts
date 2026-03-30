import { Router } from 'express';
import { QuizController } from './quiz.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { startSessionSchema, submitAnswerSchema } from './quiz.schema';
import { Role } from '@prisma/client';

const router = Router();
const controller = new QuizController();

// All quiz routes require STUDENT authentication
router.use(authMiddleware);
router.use(requireRole(Role.STUDENT));

// Start new quiz session
router.post('/sessions', validate(startSessionSchema), controller.startSession);

// Get next question
router.get('/sessions/:id/next', controller.getNextQuestion);

// Submit answer
router.post('/sessions/:id/answer', validate(submitAnswerSchema), controller.submitAnswer);

// Complete session
router.post('/sessions/:id/complete', controller.completeSession);

// Get user history
router.get('/sessions/history', controller.getHistory);

export default router;
