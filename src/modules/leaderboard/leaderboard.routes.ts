import { Router } from 'express';
import { LeaderboardController } from './leaderboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new LeaderboardController();

// All leaderboard routes require authentication
router.get('/', authMiddleware, controller.getLeaderboard);

export default router;
