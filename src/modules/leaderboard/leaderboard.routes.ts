import { Router } from 'express';
import { LeaderboardController } from './leaderboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new LeaderboardController();

// GET /api/v1/leaderboard/top?limit=8  — main page, any authenticated user
router.get('/top', authMiddleware, controller.getTop);

// GET /api/v1/leaderboard/me/stats  — dedicated page personal card, student only
router.get('/me/stats', authMiddleware, requireRole(Role.STUDENT), controller.getMyStats);

// GET /api/v1/leaderboard/users/:userId/categories  — row expansion, any auth user
router.get('/users/:userId/categories', authMiddleware, controller.getUserCategories);

// GET /api/v1/leaderboard?page&limit&period  — dedicated page full list
router.get('/', authMiddleware, controller.getLeaderboard);

export default router;
