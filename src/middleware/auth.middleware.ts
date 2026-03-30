import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';
import { ApiError } from '../utils/ApiError';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'لم يتم توفير رمز المصادقة');
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    throw new ApiError(401, 'رمز المصادقة غير صالح أو منتهي الصلاحية');
  }

  req.user = {
    userId: payload.userId,
    role: payload.role,
  };

  next();
};
