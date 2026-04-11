import { prisma } from '../../config/database';
import { env } from '../../config/env';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
}

interface DatabaseHealth {
  connected: boolean;
  responseTime: number;
  error?: string;
}

interface DetailedHealthStatus extends HealthStatus {
  database: DatabaseHealth;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  version: string;
}

export class HealthService {
  /**
   * Basic health check
   */
  async checkHealth(): Promise<HealthStatus> {
    const dbHealth = await this.checkDatabase();
    
    return {
      status: dbHealth.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    };
  }

  /**
   * Detailed health check with all components
   */
  async checkDetailedHealth(): Promise<DetailedHealthStatus> {
    const dbHealth = await this.checkDatabase();
    const memoryUsage = process.memoryUsage();
    
    // Determine overall status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (!dbHealth.connected) {
      status = 'unhealthy';
    } else if (dbHealth.responseTime > 1000) {
      status = 'degraded';
    }
    
    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      database: dbHealth,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      },
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  /**
   * Check database connection and response time
   */
  private async checkDatabase(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    
    try {
      // Simple query to check database connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      return {
        connected: true,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        connected: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }
}
