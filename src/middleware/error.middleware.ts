import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.message,
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    statusCode: 500,
    error: 'حدث خطأ في الخادم',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
