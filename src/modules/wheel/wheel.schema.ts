import { z } from 'zod';
import { QuizCategory } from '@prisma/client';

export const spinSchema = z.object({
  category: z.nativeEnum(QuizCategory, {
    errorMap: () => ({ message: 'فئة السؤال غير صالحة' }),
  }),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid('معرف السؤال غير صالح'),
  userAnswer: z.string().min(1, 'الإجابة مطلوبة'),
});

export type SpinDto = z.infer<typeof spinSchema>;
export type SubmitAnswerDto = z.infer<typeof submitAnswerSchema>;
