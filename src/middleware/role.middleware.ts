import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'غير مصرح');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'ليس لديك صلاحية للوصول إلى هذا المورد');
    }

    next();
  };
};
