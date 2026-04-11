import { Request, Response } from 'express';
import { HealthService } from './health.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class HealthController {
  private service: HealthService;

  constructor() {
    this.service = new HealthService();
  }

  /**
   * GET /api/v1/health
   * Basic health check
   */
  getHealth = asyncHandler(async (_req: Request, res: Response) => {
    const health = await this.service.checkHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.status === 'healthy',
      statusCode,
      data: health,
    });
  });

  /**
   * GET /api/v1/health/detailed
   * Detailed health check with all components
   */
  getDetailedHealth = asyncHandler(async (_req: Request, res: Response) => {
    const health = await this.service.checkDetailedHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.status === 'healthy',
      statusCode,
      data: health,
    });
  });
}
