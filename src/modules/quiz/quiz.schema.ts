import { z } from 'zod';
import { QuizCategory, QuizLevel } from '@prisma/client';

export const startSessionSchema = z.object({
  category: z.nativeEnum(QuizCategory, {
    errorMap: () => ({ message: 'فئة السؤال غير صالحة' }),
  }),
  level: z.nativeEnum(QuizLevel, {
    errorMap: () => ({ message: 'مستوى السؤال غير صالح' }),
  }),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid('معرف السؤال غير صالح'),
  userAnswer: z.string().min(1, 'الإجابة مطلوبة'),
});

export type StartSessionDto = z.infer<typeof startSessionSchema>;
export type SubmitAnswerDto = z.infer<typeof submitAnswerSchema>;
