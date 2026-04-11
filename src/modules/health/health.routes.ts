import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();
const controller = new HealthController();

// Public health check endpoints (no authentication required)
router.get('/', controller.getHealth);
router.get('/detailed', controller.getDetailedHealth);

export default router;
