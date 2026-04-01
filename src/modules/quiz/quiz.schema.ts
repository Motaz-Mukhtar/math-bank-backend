import { z } from 'zod';
import { QuizCategory, QuizLevel, QuestionType } from '@prisma/client';

// ─── Base Question Schema ────────────────────────────────────────────────────

const baseQuestionSchema = z.object({
  text: z.string().min(1, 'نص السؤال مطلوب'),
  category: z.nativeEnum(QuizCategory, {
    errorMap: () => ({ message: 'فئة السؤال غير صالحة' }),
  }),
  level: z.nativeEnum(QuizLevel, {
    errorMap: () => ({ message: 'مستوى السؤال غير صالح' }),
  }),
  points: z.number().int().positive('النقاط يجب أن تكون رقم موجب'),
});

// ─── MCQ Question Schema ─────────────────────────────────────────────────────

const mcqQuestionSchemaBase = baseQuestionSchema.extend({
  questionType: z.literal(QuestionType.MCQ),
  options: z.array(z.string().min(1, 'الخيار لا يمكن أن يكون فارغاً'))
    .length(4, 'يجب أن يكون هناك 4 خيارات بالضبط'),
  answer: z.string().min(1, 'الإجابة مطلوبة'),
});

export const mcqQuestionSchema = mcqQuestionSchemaBase.refine(
  (data) => data.options.includes(data.answer),
  { message: 'الإجابة يجب أن تكون من ضمن الخيارات', path: ['answer'] }
);

// ─── Fill Blank Question Schema ──────────────────────────────────────────────

export const fillBlankQuestionSchema = baseQuestionSchema.extend({
  questionType: z.literal(QuestionType.FILL_BLANK),
  options: z.object({
    before: z.string(),
    after: z.string().optional(),
    pad: z.enum(['numeric', 'fraction'], {
      errorMap: () => ({ message: 'نوع الإدخال يجب أن يكون numeric أو fraction' }),
    }),
  }),
  answer: z.string().min(1, 'الإجابة مطلوبة'),
});

// ─── Sort Order Question Schema ──────────────────────────────────────────────

const sortOrderQuestionSchemaBase = baseQuestionSchema.extend({
  questionType: z.literal(QuestionType.SORT_ORDER),
  options: z.object({
    items: z.array(z.string().min(1, 'العنصر لا يمكن أن يكون فارغاً'))
      .min(3, 'يجب أن يكون هناك 3 عناصر على الأقل')
      .max(5, 'يجب أن يكون هناك 5 عناصر كحد أقصى'),
    instruction: z.string().min(1, 'التعليمات مطلوبة'),
    slots: z.number().int().positive('عدد الخانات يجب أن يكون رقم موجب'),
  }),
  answer: z.string().min(1, 'الإجابة مطلوبة'),
});

export const sortOrderQuestionSchema = sortOrderQuestionSchemaBase.refine(
  (data) => {
    const answerItems = data.answer.split(',').map(item => item.trim());
    const allItemsExist = answerItems.every(item => data.options.items.includes(item));
    return allItemsExist && answerItems.length === data.options.items.length;
  },
  { message: 'الإجابة يجب أن تحتوي على جميع العناصر', path: ['answer'] }
);

// ─── Matching Question Schema ────────────────────────────────────────────────

export const matchingQuestionSchema = baseQuestionSchema.extend({
  questionType: z.literal(QuestionType.MATCHING),
  options: z.object({
    pairs: z.array(z.object({
      left: z.string().min(1, 'العنصر الأيسر لا يمكن أن يكون فارغاً'),
      right: z.string().min(1, 'العنصر الأيمن لا يمكن أن يكون فارغاً'),
    })).length(4, 'يجب أن يكون هناك 4 أزواج بالضبط'),
  }),
  answer: z.string().min(1, 'الإجابة مطلوبة'),
});

// ─── Visual MCQ Question Schema ──────────────────────────────────────────────

const svgTypeEnum = z.enum([
  'FRACTION_CIRCLE',
  'FRACTION_RECT',
  'FRACTION_GROUP',
  'SHAPE_2D',
  'SHAPE_3D',
  'DOT_ARRAY',
  'SYMMETRY',
  'GRID_AREA',
  'BAR_CHART',
  'CLOCK_FACE',
], {
  errorMap: () => ({ message: 'نوع الشكل غير صالح' }),
});

export const visualMcqQuestionSchema = baseQuestionSchema.extend({
  questionType: z.literal(QuestionType.VISUAL_MCQ),
  options: z.object({
    svgType: svgTypeEnum,
    choices: z.array(z.object({
      params: z.record(z.unknown()),
      label: z.string(),
    })).length(4, 'يجب أن يكون هناك 4 خيارات بالضبط'),
  }),
  answer: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: 'الإجابة يجب أن تكون 0 أو 1 أو 2 أو 3' }),
  }),
});

// ─── Clock Read Question Schema ──────────────────────────────────────────────

export const clockReadQuestionSchema = baseQuestionSchema.extend({
  questionType: z.literal(QuestionType.CLOCK_READ),
  options: z.object({
    clockTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت يجب أن تكون HH:MM'),
    choices: z.array(z.string().min(1, 'الخيار لا يمكن أن يكون فارغاً'))
      .length(4, 'يجب أن يكون هناك 4 خيارات بالضبط'),
    displayMode: z.enum(['analog_to_digital', 'digital_to_analog', 'elapsed_time'], {
      errorMap: () => ({ message: 'وضع العرض غير صالح' }),
    }),
  }),
  answer: z.string().min(1, 'الإجابة مطلوبة'),
});

// ─── Discriminated Union Schema ──────────────────────────────────────────────

export const questionSchema = z.discriminatedUnion('questionType', [
  mcqQuestionSchemaBase,
  fillBlankQuestionSchema,
  sortOrderQuestionSchemaBase,
  matchingQuestionSchema,
  visualMcqQuestionSchema,
  clockReadQuestionSchema,
]);

// ─── Session Schemas ─────────────────────────────────────────────────────────

export const startSessionSchema = z.object({
  category: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.nativeEnum(QuizCategory, {
      errorMap: () => ({ message: 'فئة السؤال غير صالحة' }),
    }),
  ),
  level: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.nativeEnum(QuizLevel, {
      errorMap: () => ({ message: 'مستوى السؤال غير صالح' }),
    }),
  ),
});

export const submitAnswerSchema = z.object({
  // questionId: z.string().uuid('معرف السؤال غير صالح '),
  userAnswer: z.string().min(1, 'الإجابة مطلوبة'),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type StartSessionDto = z.infer<typeof startSessionSchema>;
export type SubmitAnswerDto = z.infer<typeof submitAnswerSchema>;
export type QuestionDto = z.infer<typeof questionSchema>;
export type MCQQuestionDto = z.infer<typeof mcqQuestionSchema>;
export type FillBlankQuestionDto = z.infer<typeof fillBlankQuestionSchema>;
export type SortOrderQuestionDto = z.infer<typeof sortOrderQuestionSchema>;
export type MatchingQuestionDto = z.infer<typeof matchingQuestionSchema>;
export type VisualMCQQuestionDto = z.infer<typeof visualMcqQuestionSchema>;
export type ClockReadQuestionDto = z.infer<typeof clockReadQuestionSchema>;
