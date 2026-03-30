import { z } from 'zod';

export const createVideoSchema = z.object({
  title: z
    .string()
    .min(2, 'عنوان الفيديو يجب أن يكون حرفين على الأقل')
    .max(200, 'عنوان الفيديو طويل جداً'),
  description: z.string().max(2000, 'الوصف طويل جداً').optional(),
  url: z.string().url('رابط الفيديو غير صالح'),
  categoryId: z.string().uuid('معرف الفصل غير صالح'),
  sortOrder: z.number().int().min(0, 'ترتيب العرض يجب أن يكون رقماً موجباً').optional(),
});

export const updateVideoSchema = z.object({
  title: z
    .string()
    .min(2, 'عنوان الفيديو يجب أن يكون حرفين على الأقل')
    .max(200, 'عنوان الفيديو طويل جداً')
    .optional(),
  description: z.string().max(2000, 'الوصف طويل جداً').optional(),
  url: z.string().url('رابط الفيديو غير صالح').optional(),
  categoryId: z.string().uuid('معرف الفصل غير صالح').optional(),
  sortOrder: z.number().int().min(0, 'ترتيب العرض يجب أن يكون رقماً موجباً').optional(),
});

export const moveVideoSchema = z.object({
  categoryId: z.string().uuid('معرف الفصل غير صالح'),
});

export type CreateVideoDto = z.infer<typeof createVideoSchema>;
export type UpdateVideoDto = z.infer<typeof updateVideoSchema>;
export type MoveVideoDto = z.infer<typeof moveVideoSchema>;
