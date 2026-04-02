import { z } from 'zod';
import { Role, QuizCategory, QuizLevel, QuestionType } from '@prisma/client';
import { questionSchema } from '../quiz/quiz.schema';

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

// ─── Question Management Schemas ─────────────────────────────────────────────

export const createQuestionSchema = questionSchema;

// ZodDiscriminatedUnion doesn't support .partial(), so we define the update
// schema as a plain object where every field is optional.
export const updateQuestionSchema = z.object({
  text: z.string().min(3).optional(),
  questionType: z.nativeEnum(QuestionType).optional(),
  options: z.unknown().optional(),
  answer: z.string().optional(),
  category: z.nativeEnum(QuizCategory).optional(),
  level: z.nativeEnum(QuizLevel).optional(),
  points: z.number().int().min(1).optional(),
});

export const getQuestionsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  questionType: z.nativeEnum(QuestionType).optional(),
  category: z.nativeEnum(QuizCategory).optional(),
  level: z.nativeEnum(QuizLevel).optional(),
});

export const getQuestionParamSchema = z.object({
  id: z.string().uuid('معرف السؤال غير صالح'),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type GetRegistrationChartQuery = z.infer<typeof getRegistrationChartSchema>;
export type ExportUsersQuery = z.infer<typeof exportUsersSchema>;
export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
export type GetQuestionsQuery = z.infer<typeof getQuestionsQuerySchema>;
export type GetQuestionParam = z.infer<typeof getQuestionParamSchema>;