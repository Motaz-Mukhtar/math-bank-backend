import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

interface AccessTokenPayload {
  userId: string;
  role: Role;
}

interface RefreshTokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string, role: Role): string => {
  return jwt.sign({ userId, role } as AccessTokenPayload, env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId } as RefreshTokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
};
