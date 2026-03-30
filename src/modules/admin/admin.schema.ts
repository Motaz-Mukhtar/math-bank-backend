import { z } from 'zod';
import { Role } from '@prisma/client';

export const updateUserSchema = z.object({
  fullName: z.string().min(1, 'الاسم الكامل مطلوب').optional(),
  points: z.number().int().min(0, 'النقاط يجب أن تكون رقم موجب').optional(),
});

export const getUsersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  role: z.nativeEnum(Role).optional(),
  search: z.string().optional(),
});

export const getRegistrationChartSchema = z.object({
  days: z.string().optional().default('30'),
});

export const exportUsersSchema = z.object({
  type: z.enum(['students', 'parents', 'all']),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type GetRegistrationChartQuery = z.infer<typeof getRegistrationChartSchema>;
export type ExportUsersQuery = z.infer<typeof exportUsersSchema>;
