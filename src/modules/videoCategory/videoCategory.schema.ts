import { z } from 'zod';

export const createVideoCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'اسم الفصل يجب أن يكون حرفين على الأقل')
    .max(200, 'اسم الفصل طويل جداً'),
  description: z.string().max(1000, 'الوصف طويل جداً').optional(),
  sortOrder: z.number().int().min(0, 'ترتيب العرض يجب أن يكون رقماً موجباً').optional(),
});

export const updateVideoCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'اسم الفصل يجب أن يكون حرفين على الأقل')
    .max(200, 'اسم الفصل طويل جداً')
    .optional(),
  description: z.string().max(1000, 'الوصف طويل جداً').optional(),
  sortOrder: z.number().int().min(0, 'ترتيب العرض يجب أن يكون رقماً موجباً').optional(),
});

export type CreateVideoCategoryDto = z.infer<typeof createVideoCategorySchema>;
export type UpdateVideoCategoryDto = z.infer<typeof updateVideoCategorySchema>;
